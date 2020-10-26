const assert = require('assert')
const getByDot = require('lodash/get')
const setByDot = require('lodash/set')
const isEqual = require('lodash/isEqual')
const isFunction = require('lodash/isFunction')
const merge = require('lodash/merge')
const defaults = {
  include: undefined
}

module.exports = function (options) {
  options = Object.assign({}, defaults, options)

  // Make an array of includes
  const includes = [].concat(options.include || [])

  if (!includes.length) {
    throw new Error('shallowPopulate hook: You must provide one or more relationships in the `include` option.')
  }

  const requiredIncludeAttrs = [
    'service',
    'nameAs',
    'keyHere',
    'keyThere',
    'asArray',
    'params'
  ]
  includes.forEach(include => {
    // Create default `asArray` property
    if (!Object.prototype.hasOwnProperty.call(include, 'asArray')) {
      include.asArray = true
    }
    // Create default `params` property
    if (!Object.prototype.hasOwnProperty.call(include, 'params')) {
      include.params = {}
    }
    try {
      assert.deepStrictEqual(requiredIncludeAttrs.sort(), Object.keys(include).sort())
    } catch (error) {
      throw new Error('shallowPopulate hook: Every `include` must contain `service`, `nameAs`, `keyHere`, and `keyThere` properties')
    }
  })

  const requiredKeyMappings = includes.reduce((includes, include) => {
    if (!includes[include.keyHere]) {
      includes[include.keyHere] = include
    }
    return includes
  }, {})

  return function shallowPopulate (context) {
    const { app, type } = context
    let data = type === 'before'
      ? context.data
      : context.method === 'find'
        ? (context.result.data || context.result)
        : context.result

    data = [].concat(data || [])

    if (!data.length) {
      return Promise.resolve(context)
    }

    // data1: {
    //   id: '11',
    //   name: 'Dumb Stuff',
    //   trackIds: ['111', '222', '333']
    // }

    // const byKeyHere = {
    //   trackIds: {
    //     '111': [data1, data2],
    //     '222': [data1],
    //     '333': [data1]
    //   }
    // }

    const dataMap = data.reduce((byKeyHere, current) => {
      Object.keys(requiredKeyMappings).forEach(key => {
        byKeyHere[key] = byKeyHere[key] || {}
        const keyHere = getByDot(current, key)

        if (keyHere) {
          if (Array.isArray(keyHere)) {
            if (!requiredKeyMappings[key].asArray) {
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

    const params = includes.map(i => {
      const keyVals = dataMap[i.keyHere]
      let keysHere = Object.keys(keyVals) || []
      keysHere = keysHere.map(k => keyVals[k].key)
      let params = { query: { [i.keyThere]: { $in: keysHere } }, paginate: false }

      const providedParams = (isFunction(i.params)) ? i.params(params, context) : i.params

      if (providedParams && params !== providedParams) params = merge(params, providedParams)

      return params
    })

    const requests = includes.map((include, index) => app.service(include.service).find(params[index]))

    return Promise.all(requests)
      .then(responses => {
        responses.forEach((response, index) => {
          const include = includes[index]
          const relatedItems = response.data || response

          data.forEach(item => {
            const keyHere = getByDot(item, include.keyHere)

            if (keyHere) {
              if (Array.isArray(keyHere)) {
                if (!include.asArray) {
                  setByDot(item, include.nameAs, getRelatedItems(keyHere[0], relatedItems, include))
                } else {
                  setByDot(item, include.nameAs, getRelatedItems(keyHere, relatedItems, include))
                }
              } else {
                setByDot(item, include.nameAs, getRelatedItems(keyHere, relatedItems, include))
              }
            }
          })
        })
        return Promise.resolve(context)
      })
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
          const keyThereVal = getByDot(nestedItem, nestedProp)
          return keyThereVal
        })
      } else {
        const keyThereVal = getByDot(currentItem, keyThere)
        currentId = keyThereVal
      }
      if (asArray) {
        if ((Array.isArray(currentId) && currentId.includes(id)) || isEqual(currentId, id)) {
          items.push(currentItem)
        }
      } else {
        if (isEqual(currentId, id)) {
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
