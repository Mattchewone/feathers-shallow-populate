const assert = require('assert')
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
    'keyThere'
  ]
  includes.forEach(include => {
    try {
      assert.deepEqual(requiredIncludeAttrs, Object.keys(include))
    } catch (error) {
      throw new Error('shallowPopulate hook: Every `include` must contain `service`, `nameAs`, `keyHere`, and `keyThere` properties')
    }
  })

  const requiredKeyMappings = includes.reduce((includes, include) => {
    if (!includes.includes(include.keyHere)) {
      includes.push(include.keyHere)
    }
    return includes
  }, [])

  return function shallowPopulate (context) {
    const { app, type } = context
    let data = type === 'before' ? context.data : (context.result.data || context.result)
    data = [].concat(data || [])

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
      requiredKeyMappings.forEach(key => {
        byKeyHere[key] = byKeyHere[key] || {}
        // key = trackIds
        if (Array.isArray(current[key])) {
          current[key].map(item => {
            byKeyHere[key][item] = byKeyHere[key][item] || []
            byKeyHere[key][item].push(current)
          })
        } else {
          byKeyHere[key][current[key]] = byKeyHere[key][current[key]] || []
          byKeyHere[key][current[key]].push(current)
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

    const requests = includes.map((i, index) => app.service(i.service).find(paramSets[index]))

    return Promise.all(requests)
      .then(response => {
        const relatedItems = response.data || response
        relatedItems.forEach((response, index) => {
          const include = includes[index]

          response.forEach(item => {
            // Get the dataMap for the keyHere data
            const mappedData = dataMap[include.keyHere]
            // Ids of the relationship, normalize into an array
            const includeIds = [].concat(item[include.keyThere] || [])

            includeIds
              // Check we have a valid id in the mappedData for this includeId
              .filter(includeId => mappedData[includeId])
              .forEach(includeId => {
                const items = mappedData[includeId]
                items.forEach((curItem, index) => {
                  // Push the related item into the data item
                  curItem[include.nameAs] = curItem[include.nameAs] || []
                  curItem[include.nameAs].push(item)
                })
              })
          })
        })
        return Promise.resolve(context)
      })
  }
}
