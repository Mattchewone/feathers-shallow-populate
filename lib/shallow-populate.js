const _get = require('lodash/get')
const _set = require('lodash/set')
const _isEqual = require('lodash/isEqual')
const _has = require('lodash/has')

const {
  assertIncludes,
  chainedParams
} = require('./utils')

const defaults = {
  include: undefined
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
 * @property {ParamsFunction} [params={}] - optional params object/function for custom queries
 * @property {boolean} [requestPerItem]
 */

/**
 *
 * @param {Include|Include[]} options
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
    let data = type === 'before' ? context.data : (context.result.data || context.result)
    data = [].concat(data || [])

    if (!data.length) {
      return context
    }

    const dataMap = data.reduce((byKeyHere, current) => {
      keysHere.forEach(key => {
        byKeyHere[key] = byKeyHere[key] || {}
        const keyHere = _get(current, key)

        if (keyHere) {
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

    const cumulatedRequests = cumulatedIncludes.map(async include => {
      const { keyHere, keyThere, service } = include

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

      params = await chainedParams([params, ...paramsFromInclude], context)

      const result = await app.service(service).find(params)

      return result
    })

    const cumulatedResponses = await Promise.all(cumulatedRequests)

    cumulatedResponses.forEach((response, index) => {
      const include = cumulatedIncludes[index]
      const relatedItems = response.data || response
      const { nameAs } = include

      data.forEach(item => {
        const keyHere = _get(item, include.keyHere)

        if (keyHere) {
          if (Array.isArray(keyHere)) {
            if (!include.asArray) {
              _set(item, nameAs, getRelatedItems(keyHere[0], relatedItems, include))
            } else {
              _set(item, nameAs, getRelatedItems(keyHere, relatedItems, include))
            }
          } else {
            _set(item, nameAs, getRelatedItems(keyHere, relatedItems, include))
          }
        }
      })
    })

    const promisesPerIncludeAndItem = []

    includesPerItem.forEach(include => {
      const promisesPerItem = data.map(async item => {
        const { service, nameAs, asArray } = include
        const paramsFromInclude = (Array.isArray(include.params))
          ? include.params
          : [include.params]

        const paramsOptions = {
          thisKey: item,
          skipWhenUndefined: true
        }
        const params = await chainedParams([{ paginate: false }, ...paramsFromInclude], context, paramsOptions)
        if (!params) { return false }
        const response = await app.service(service).find(params)
        const relatedItems = response.data || response

        if (asArray) {
          _set(item, nameAs, relatedItems)
        } else {
          const relatedItem = (relatedItems.length > 0) ? relatedItems[0] : null
          _set(item, nameAs, relatedItem)
        }

        return true
      })
      promisesPerIncludeAndItem.push(...promisesPerItem)
    })

    await Promise.all(promisesPerIncludeAndItem)

    return context
  }
}

function getRelatedItems (ids, relatedItems, include) {
  const { keyThere, asArray } = include
  ids = [].concat(ids || [])
  return relatedItems.reduce((items, currentItem) => {
    ids.forEach(id => {
      // id = typeof id === 'number' ? id.toString() : id
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
          items.push(currentItem)
        }
      } else {
        if (_isEqual(currentId, id)) {
          items = currentItem
        }
      }
    })
    return items
  }, asArray ? [] : {})
}

function mapDataWithId (byKeyHere, key, keyHere, current) {
  byKeyHere[key][keyHere] = byKeyHere[key][keyHere] || {
    key: keyHere,
    vals: []
  }
  byKeyHere[key][keyHere].vals.push(current)
  return byKeyHere
}
