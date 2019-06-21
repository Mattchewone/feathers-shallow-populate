const assert = require('assert')
const getByDot = require('lodash.get')
const setByDot = require('lodash.set')
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
    if (!include.hasOwnProperty('asArray')) {
      include.asArray = true
    }
    // Create default `params` property
    if (!include.hasOwnProperty('params')) {
      include.params = {}
    }
    try {
      assert.deepEqual(requiredIncludeAttrs.sort(), Object.keys(include).sort())
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
    let data = type === 'before' ? context.data : (context.result.data || context.result)
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
              mapData(byKeyHere, key, keyHere[0], current)
            } else {
              keyHere.forEach(hereKey => mapData(byKeyHere, key, hereKey, current))
            }
          } else {
            mapData(byKeyHere, key, keyHere, current)
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

    const paramSets = includes.map(i => {
      const keysHere = Object.keys(dataMap[i.keyHere]) || []

      return { query: { [i.keyThere]: { $in: keysHere } } }
    })

    const requests = includes.map((i, index) => app.service(i.service).find(Object.assign({}, paramSets[index], { paginate: false }, i.params)))

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
      id = typeof id === 'number' ? id : id.toString()
      const currentId = typeof currentItem[keyThere] === 'number' ? currentItem[keyThere] : currentItem[keyThere].toString()
      if (asArray) {
        if (currentId.includes(id)) {
          items.push(currentItem)
        }
      } else {
        if (currentId.includes(id)) {
          items = currentItem
        }
      }
    })
    return items
  }, asArray ? [] : {})
}

function mapData (byKeyHere, key, keyHere, current) {
  byKeyHere[key][keyHere] = byKeyHere[key][keyHere] || []
  byKeyHere[key][keyHere].push(current)
  return byKeyHere
}
