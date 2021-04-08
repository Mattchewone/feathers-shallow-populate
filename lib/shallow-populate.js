const _get = require('lodash/get')
const _set = require('lodash/set')
const _isEqual = require('lodash/isEqual')
const _has = require('lodash/has')

const {
  assertIncludes,
  chainedParams,
  shouldCatchOnError
} = require('./utils')
const set = require('lodash/set')

const defaults = {
  include: undefined,
  catchOnError: false
}

/**
 * @callback ParamsFunction
 * @param {object} [params]
 * @param {object} [context]
 * @returns {(undefined|object|Promise)}
 */

/**
 * The options parameter for the shallowPopulate hook
 * @typedef {object} Include
 * @property {string} service - The related service path
 * @property {string} nameAs - The property of this item the related item gets populated to - supports dot notation
 * @property {string} [keyHere] - The name of the key on this item (if defined also needs `keyThere` property; can be skipped if `params` is defined - for more complicated relations;) - supports dot notation
 * @property {string} [keyThere] - The name of the key on this item (if defined also needs `keyThere` property; can be skipped if `params` is defined - for more complicated relations;) - supports dot notation
 * @property {boolean} [asArray=true] - if true: this[nameAs] becomes an array, if false: this[nameAs] becomes an object
 * @property {boolean} [requestPerItem] - run request per every item or grouped
 * @property {boolean} [catchOnError=false] - if true: continue populating when an error occurs
 * @property {ParamsFunction} [params={}] - optional params object/function for custom queries
 */

/**
 *
 * @param {object} options
 * @param {Include|Include[]} options.include
 * @param {boolean} [options.catchOnError=false]
 */
module.exports = function (options) {
  options = Object.assign({}, defaults, options)

  // Make an array of includes
  const includes = [].concat(options.include || [])

  if (!includes.length) {
    throw new Error('shallowPopulate hook: You must provide one or more relationships in the `include` option.')
  }

  assertIncludes(includes)

  const cumulatedIncludes = includes.filter(include => !include.requestPerItem)

  const includesByKeyHere = cumulatedIncludes.reduce((includes, include) => {
    if (_has(include, 'keyHere') && !includes[include.keyHere]) {
      includes[include.keyHere] = include
    }
    return includes
  }, {})

  const keysHere = Object.keys(includesByKeyHere)

  const includesPerItem = includes.filter(include => include.requestPerItem)

  return async function shallowPopulate (context) {
    const { app, type } = context
    let data = type === 'before'
      ? context.data
      : context.method === 'find'
        ? (context.result.data || context.result)
        : context.result

    data = [].concat(data || [])

    if (!data.length) {
      return context
    }

    const dataMap = data.reduce((byKeyHere, current) => {
      keysHere.forEach(key => {
        byKeyHere[key] = byKeyHere[key] || {}
        const keyHere = _get(current, key)

        if (keyHere !== undefined) {
          if (Array.isArray(keyHere)) {
            if (!includesByKeyHere[key].asArray) {
              mapDataWithId(byKeyHere, key, keyHere[0], current)
            } else {
              keyHere.forEach(hereKey => mapDataWithId(byKeyHere, key, hereKey, current))
            }
          } else {
            mapDataWithId(byKeyHere, key, keyHere, current)
          }
        }
      })

      return byKeyHere
    }, {})

    // const dataMap = {
    //   keyHere: {
    //     trackIds: {
    //       1: [{}]
    //     }
    //   },
    //   keyThere: {
    //     foo: [...keyHeres].map(here => {
    //       here[nameAs] = tracksResponse[index]
    //     })
    //   }
    // }

    let cumulatedResults = cumulatedIncludes.map(async (include) => {
      let result
      try {
        result = await makeCumulatedRequest(app, include, dataMap, context)
      } catch (err) {
        if (!shouldCatchOnError(options, include)) throw err
        return { include }
      }
      return result
    })

    cumulatedResults = await Promise.all(cumulatedResults)

    cumulatedResults.forEach(result => {
      if (!result) return
      const { include } = result
      if (!result.response) {
        data.forEach(item => {
          set(item, include.nameAs, (include.asArray) ? [] : {})
        })
        return
      }
      const { params, response } = result
      setItems(data, include, params, response)
    })

    const promisesPerIncludeAndItem = []

    includesPerItem.forEach(include => {
      const promisesPerItem = data.map(async item => {
        try {
          await makeRequestPerItem(item, app, include, context)
        } catch (err) {
          if (!shouldCatchOnError(options, include)) throw err
          set(item, include.nameAs, (include.asArray) ? [] : {})
        }
      })
      promisesPerIncludeAndItem.push(...promisesPerItem)
    })

    await Promise.all(promisesPerIncludeAndItem)

    return context
  }
}

async function makeCumulatedRequest (app, include, dataMap, context) {
  const { keyHere, keyThere } = include

  let params = { paginate: false }

  if (_has(include, 'keyHere') && _has(include, 'keyThere')) {
    const keyVals = dataMap[keyHere]
    let keysHere = Object.keys(keyVals) || []
    keysHere = keysHere.map(k => keyVals[k].key)
    Object.assign(params, { query: { [keyThere]: { $in: keysHere } } })
  }

  const paramsFromInclude = (Array.isArray(include.params))
    ? include.params
    : [include.params]

  const service = app.service(include.service)

  const target = {
    path: include.service,
    service
  }

  params = await chainedParams([params, ...paramsFromInclude], context, target)

  // modify params
  let query = params.query || {}

  query = Object.assign({}, query)

  // remove $skip to prevent unintended results and regard it afterwards
  if (query.$skip) { delete query.$skip }

  // remove $limit to prevent unintended results and regard it afterwards
  if (query.$limit) { delete query.$limit }

  // if $select hasn't ${keyThere} add it and delete it afterwards
  if (query.$select && !query.$select.includes(keyThere)) {
    query.$select = [...query.$select, keyThere]
  }

  const response = await service.find(Object.assign({}, params, { query }))

  return {
    include,
    params,
    response
  }
}

async function makeRequestPerItem (item, app, include, context) {
  const { nameAs, asArray } = include
  const paramsFromInclude = (Array.isArray(include.params))
    ? include.params
    : [include.params]

  const paramsOptions = {
    thisKey: item,
    skipWhenUndefined: true
  }

  const service = app.service(include.service)

  const target = {
    path: include.service,
    service
  }

  const params = await chainedParams([{ paginate: false }, ...paramsFromInclude], context, target, paramsOptions)

  if (!params) {
    (asArray)
      ? _set(item, nameAs, [])
      : _set(item, nameAs, null)
    return
  }
  const response = await service.find(params)
  const relatedItems = response.data || response

  if (asArray) {
    _set(item, nameAs, relatedItems)
  } else {
    const relatedItem = (relatedItems.length > 0) ? relatedItems[0] : null
    _set(item, nameAs, relatedItem)
  }
}

function setItems (data, include, params, response) {
  const relatedItems = response.data || response
  const { nameAs, keyThere, asArray } = include

  data.forEach(item => {
    const keyHere = _get(item, include.keyHere)

    if (keyHere !== undefined) {
      if (Array.isArray(keyHere)) {
        if (!asArray) {
          _set(item, nameAs, getRelatedItems(keyHere[0], relatedItems, include, params))
        } else {
          _set(item, nameAs, getRelatedItems(keyHere, relatedItems, include, params))
        }
      } else {
        _set(item, nameAs, getRelatedItems(keyHere, relatedItems, include, params))
      }
    }
  })

  if (params.query.$select && !params.query.$select.includes(keyThere)) {
    relatedItems.forEach(item => {
      delete item[keyThere]
    })
  }
}

function getRelatedItems (ids, relatedItems, include, params) {
  const { keyThere, asArray } = include
  const skip = _get(params, 'query.$skip', 0)
  const limit = _get(params, 'query.$limit', Math.max)
  ids = [].concat(ids || [])
  let skipped = 0
  let itemOrItems = (asArray) ? [] : {}

  let isDone = false
  for (let i = 0, n = relatedItems.length; i < n; i++) {
    if (isDone) { break }
    const currentItem = relatedItems[i]

    for (let j = 0, m = ids.length; j < m; j++) {
      const id = ids[j]
      let currentId
      // Allow populating on nested array of objects like key[0].name, key[1].name
      // If keyThere includes a dot, we're looking for a nested prop. This checks if that nested prop is an array.
      // If it's an array, we assume it to be an array of objects.
      // It splits the key only on the first dot which allows populating on nested keys inside the array of objects.
      if (keyThere.includes('.') && Array.isArray(currentItem[keyThere.slice(0, keyThere.indexOf('.'))])) {
        // The name of the array is everything leading up to the first dot.
        const arrayName = keyThere.split('.')[0]
        // The rest will be handed to getByDot as the path to the prop
        const nestedProp = keyThere.slice(keyThere.indexOf('.') + 1)
        // Map over the array to grab each nestedProp's value.
        currentId = currentItem[arrayName].map(nestedItem => {
          const keyThereVal = _get(nestedItem, nestedProp)
          return keyThereVal
        })
      } else {
        const keyThereVal = _get(currentItem, keyThere)
        currentId = keyThereVal
      }
      if (asArray) {
        if ((Array.isArray(currentId) && currentId.includes(id)) || _isEqual(currentId, id)) {
          if (skipped < skip) {
            skipped++
            continue
          }
          itemOrItems.push(currentItem)
          if (itemOrItems.length >= limit) {
            isDone = true
            break
          }
        }
      } else {
        if (_isEqual(currentId, id)) {
          if (skipped < skip) {
            skipped++
            continue
          }
          itemOrItems = currentItem
          isDone = true
          break
        }
      }
    }
  }

  return itemOrItems
}

function mapDataWithId (byKeyHere, key, keyHere, current) {
  byKeyHere[key][keyHere] = byKeyHere[key][keyHere] || {
    key: keyHere,
    vals: []
  }
  byKeyHere[key][keyHere].vals.push(current)
  return byKeyHere
}
