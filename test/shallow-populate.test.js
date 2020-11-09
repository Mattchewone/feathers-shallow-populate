const assert = require('assert')
const { shallowPopulate: makePopulate } = require('../lib/index')
const memory = require('feathers-memory')
const sift = require('sift').default

const services = {
  posts: memory({
    store: {
      111: { id: '111', name: 'My Monkey and Me', userId: '11' },
      222: { id: '222', name: 'I forgot why I love you', userId: '11' },
      333: { id: '333', name: 'If I were a banana...', userId: '22' },
      444: { id: 444, name: 'One, two, three, one, two, three, drink', userId: '33' },
      555: { id: 555, name: 'Im gonna live like tomorrow doesnt exist', userId: 44 },
      666: { id: 666, name: 'I feel the love, feel the love', userId: 44 }
    }
  }),
  users: memory({
    store: {
      11: { id: '11', name: 'Joe Bloggs', postsId: ['111'], orgId: 'org1' },
      22: { id: '22', name: 'Jane Bloggs', postsId: '333', orgId: 'org2' },
      33: { id: '33', name: 'John Smith', postsId: ['111', '222'], orgId: 3 },
      44: { id: 44, name: 'Muhammad Li', postsId: [444, '555'], orgId: 4 }
    },
    matcher: query => {
      return items => {
        const s = Object.assign({}, query)
        items = [].concat(items || [])
        return !!sift(s, items).length
      }
    }
  }),
  taskSets: memory({
    store: {
      ts1: { id: 'ts1', name: 'Task Set 1' },
      ts2: { id: 'ts2', name: 'Task Set 2' },
      ts3: { id: 'ts3', name: 'Task Set 3' },
      4: { id: 4, name: 'Task Set 4' },
      5: { id: 5, name: 'Task Set 5' },
      ts6: { id: 'ts6', name: 'Task Set 6' }
    }
  }),
  tasks: memory({
    store: {
      task1: { id: 'task1', name: 'Task 1 - belongs with TaskSet1', taskSet: { taskSetId: 'ts1' }, userId: '11' },
      task2: { id: 'task2', name: 'Task 2 - belongs with TaskSet2', taskSet: { taskSetId: 'ts2' }, userId: '22' },
      task3: { id: 'task3', name: 'Task 3 - belongs with TaskSet2', taskSet: { taskSetId: 'ts2' }, userId: '11' },
      task4: { id: 'task4', name: 'Task 4 - belongs with TaskSet3', taskSet: { taskSetId: 'ts3' }, userId: 44 },
      task5: { id: 'task5', name: 'Task 5 - belongs with TaskSet3', taskSet: { taskSetId: 'ts3' }, userId: 44 },
      task6: { id: 'task6', name: 'Task 6 - belongs with TaskSet3', taskSet: { taskSetId: 'ts3' }, userId: '33' },
      7: { id: 7, name: 'Task 7 - belongs with TaskSet4', taskSet: { taskSetId: 4 } },
      task8: { id: 'task8', name: 'Task 8 - belongs with TaskSet5', taskSet: { taskSetId: 5 } },
      9: { id: 9, name: 'Task 9 - belongs with TaskSet6', taskSet: { taskSetId: 'ts6' } }
    }
  }),
  comments: memory({
    store: {
      11111: { id: '11111', name: 'The Best Sounds This Summer', postsId: ['222'], userId: '11' },
      22222: { id: '22222', name: 'Chillstation', postsId: ['333'], userId: '22' },
      33333: { id: '33333', name: 'Hard Hitting Bass', postsId: ['111', '222', '333'], userId: '33' },
      44444: { id: 44444, name: 'As long as skies are blue', postsId: ['111', 444, '555'], userId: 44 }
    },
    matcher: query => {
      return items => {
        const s = Object.assign({}, query)
        items = [].concat(items || [])
        return !!sift(s, items).length
      }
    }
  }),
  tags: memory({
    store: {
      1111: { id: '1111', name: 'Trombones', userId: '11' },
      2222: { id: '2222', name: 'Trumpets', userId: '11' },
      3333: { id: '3333', name: 'Drums', userId: '22' },
      4444: { id: 4444, name: 'Guitars', userId: '33' },
      5555: { id: 5555, name: 'Violins', userId: 44 }
    }
  }),
  orgs: memory({
    store: {
      org1: { id: 'org1', name: 'Southern Utah', memberCount: 21 },
      org2: { id: 'org2', name: 'Northern Utah', memberCount: 99 },
      3: { id: 3, name: 'Northern Arizona', memberCount: 42 },
      4: { id: 4, name: 'Southern Arizona', memberCount: 23 }
    }
  }),
  environments: memory({
    store: {
      env1: {
        id: 'env1',
        name: 'Bryce Canyon National Park',
        orgs: [
          { orgId: 'org1', orgName: 'Southern Utah' }
        ]
      },
      env2: {
        id: 'env2',
        name: 'Zion National Park',
        orgs: [
          { orgId: 'org1', orgName: 'Southern Utah' }
        ]
      },
      env3: {
        id: 'env3',
        name: 'Canyonlands National Park',
        orgs: [
          { orgId: 'org2', orgName: 'Northern Utah' }
        ]
      },
      4: {
        id: 4,
        name: 'Grand Canyon National Park',
        orgs: [
          { orgId: 3, orgName: 'Northern Arizona' }
        ]
      },
      5: {
        id: '5',
        name: 'Organ Pipe Cactus National Monument',
        orgs: [
          { orgId: 4, orgName: 'Southern Arizona' }
        ]
      },
      6: {
        id: 6,
        name: 'Antelope Canyon',
        orgs: [
          { orgId: 'org1', orgName: 'Southern Utah' }
        ]
      }
    }
  })
}

describe('shallowPopulate hook', () => {
  describe('general', () => {
    it('throws when used without an includes object', () => {
      assert.throws(() => {
        makePopulate()
      }, 'does not work with no includes object')
    })

    it('throws when an includes array has missing properties', () => {
      const includesOptions = [
        {
          include: {}
        },
        {
          include: {
            service: 'posts',
            nameAs: 'posts',
            keyHere: 'postsId'
          }
        },
        {
          include: {
            service: 'posts',
            nameAs: 'posts',
            keyThere: 'id'
          }
        },
        {
          include: {
            service: 'posts',
            nameAs: 'posts',
            keyThere: 'id',
            params: { test: true }
          }
        },
        {
          include: {
            service: 'posts',
            nameAs: 'posts',
            keyHere: 'id',
            params: { test: true }
          }
        },
        {
          include: {
            service: 'posts',
            nameAs: 'posts',
            keyThere: 'id',
            params: () => true
          }
        },
        {
          include: {
            service: 'posts',
            nameAs: 'posts',
            keyHere: 'id',
            params: () => true
          }
        },
        {
          include: {
            service: 'posts',
            nameAs: 'posts',
            keyHere: 'id',
            params: {}
          }
        },
        {
          include: {
            service: 'posts',
            nameAs: 'posts',
            keyThere: 'id',
            params: {}
          }
        }
      ]

      includesOptions.forEach(options => {
        assert.throws(() => {
          makePopulate(options)
        }, 'Every `include` must contain `service`, `nameAs` and (`keyHere` and `keyThere`) or properties')
      })
    })

    it('throws when an includes array has properties with same `nameAs` property', () => {
      const options = {
        include: [
          {
            service: 'posts',
            nameAs: 'posts',
            keyHere: 'postsId',
            keyThere: 'id'
          },
          {
            service: 'posts',
            nameAs: 'posts',
            keyHere: 'postsId',
            keyThere: 'id'
          }
        ]
      }

      assert.throws(() => {
        makePopulate(options)
      }, 'Every `include` should have unique `nameAs` property')
    })

    it('does nothing if we have no data', async () => {
      const options = {
        include: {
          // from: 'users',
          service: 'posts',
          nameAs: 'posts',
          keyHere: 'postsId',
          keyThere: 'id'
        }
      }

      const context = {
        method: 'create',
        type: 'after',
        params: {},
        result: {
          data: []
        }
      }

      const shallowPopulate = makePopulate(options)

      const { result } = await shallowPopulate(context)

      assert.deepStrictEqual(result.data, context.result.data, 'data should not be touched')
    })

    describe('params', () => {
      describe('params - requestPerItem: false', () => {
        it('can pass in custom params for lookup', async () => {
          const options = {
            include: {
              // from: 'users',
              service: 'posts',
              nameAs: 'posts',
              keyHere: 'postsId',
              keyThere: 'id',
              params: { fromCommentsPopulate: true }
            }
          }

          let hasCalledFind = false

          const context = {
            method: 'create',
            type: 'after',
            app: {
              service () {
                return {
                  find (params = {}) {
                    assert(params.fromCommentsPopulate === true, 'we have a custom param')
                    hasCalledFind = true
                    return []
                  }
                }
              }
            },
            params: {},
            result: {
              id: '1'
            }
          }

          const shallowPopulate = makePopulate(options)

          await shallowPopulate(context)
          assert(hasCalledFind, 'checks were made')
        })

        it('can pass in custom params for lookup and merges them deeply', async () => {
          const options = {
            include: {
              // from: 'users',
              service: 'posts',
              nameAs: 'posts',
              keyHere: 'postsId',
              keyThere: 'id',
              params: { query: { $select: ['id'] } }
            }
          }

          let hasCalledFind = false

          const context = {
            method: 'create',
            type: 'after',
            app: {
              service () {
                return {
                  find (params = {}) {
                    assert.deepStrictEqual(params.query.id.$in, [], 'we have the params from shallow-populate')
                    assert.deepStrictEqual(params.query.$select, ['id'], 'we have a merged query')
                    hasCalledFind = true
                    return []
                  }
                }
              }
            },
            params: {},
            result: {
              id: '1'
            }
          }

          const shallowPopulate = makePopulate(options)

          await shallowPopulate(context)
          assert(hasCalledFind, 'checks were made')
        })

        it('can pass in custom params-function which overrides params', async () => {
          const options = {
            include: {
              // from: 'users',
              service: 'posts',
              nameAs: 'posts',
              keyHere: 'postsId',
              keyThere: 'id',
              params: (params, context) => {
                assert.deepStrictEqual(params.query.id.$in, [], 'we have the params from shallow-populate first')
                params.query.$select = ['id']
              }
            }
          }

          let hasCalledFind = false

          const context = {
            method: 'create',
            type: 'after',
            app: {
              service () {
                return {
                  find (params = {}) {
                    assert.deepStrictEqual(params.query.id.$in, [], 'we have the params from shallow-populate')
                    assert.deepStrictEqual(params.query.$select, ['id'], 'we have a merged query')
                    hasCalledFind = true
                    return []
                  }
                }
              }
            },
            params: {},
            result: {
              id: '1'
            }
          }

          const shallowPopulate = makePopulate(options)

          await shallowPopulate(context)
          assert(hasCalledFind, 'checks were made')
        })

        it('can pass in custom params-function which returns params and merges them deeply', async () => {
          const options = {
            include: {
              // from: 'users',
              service: 'posts',
              nameAs: 'posts',
              keyHere: 'postsId',
              keyThere: 'id',
              params: () => { return { query: { $select: ['id'] } } }
            }
          }

          let hasCalledFind = false

          const context = {
            method: 'create',
            type: 'after',
            app: {
              service () {
                return {
                  find (params = {}) {
                    assert.deepStrictEqual(params.query.id.$in, [], 'we have the params from shallow-populate')
                    assert.deepStrictEqual(params.query.$select, ['id'], 'we have a merged query')
                    hasCalledFind = true
                    return []
                  }
                }
              }
            },
            params: {},
            result: {
              id: '1'
            }
          }

          const shallowPopulate = makePopulate(options)

          await shallowPopulate(context)
          assert(hasCalledFind, 'checks were made')
        })

        it('can pass in custom params-function with context', async () => {
          let paramsFunctionCalled = false

          const options = {
            include: {
              service: 'posts',
              nameAs: 'posts',
              keyHere: 'postsId',
              keyThere: 'id',
              params: (params, context) => {
                assert(context.method === 'create', 'we can pass the context to include')
                params.method = context.method
                paramsFunctionCalled = true
              }
            }
          }

          let hasCalledFind = false

          const context = {
            method: 'create',
            type: 'after',
            app: {
              service () {
                return {
                  find (params = {}) {
                    assert(params.method === 'create', 'we can manipulate the params based on the context')
                    hasCalledFind = true
                    return []
                  }
                }
              }
            },
            params: {},
            result: {
              id: '1'
            }
          }

          const shallowPopulate = makePopulate(options)

          await shallowPopulate(context)
          assert(paramsFunctionCalled, 'params function was called')
          assert(hasCalledFind, 'checks were made')
        })

        it('calls params-function once even for multiple records', async () => {
          let calledIncludeUsersParams = false
          let calledIncludeCommentsParams = false

          const options = {
            include: [
              {
                service: 'users',
                nameAs: 'users',
                keyHere: 'id',
                keyThere: 'postsId',
                params: () => {
                  assert(!calledIncludeUsersParams, 'not called before -> only called once')
                  calledIncludeUsersParams = true
                }
              },
              {
                service: 'comments',
                nameAs: 'comments',
                keyHere: 'id',
                keyThere: 'postsId',
                params: () => {
                  assert(!calledIncludeCommentsParams, 'not called before -> only called once')
                  calledIncludeCommentsParams = true
                }
              }
            ]
          }
          const context = {
            app: {
              service (path) {
                return services[path]
              }
            },
            method: 'create',
            type: 'after',
            params: {},
            result: [
              {
                id: '333',
                name: 'If I were a banana...'
              },
              {
                id: '111',
                name: 'My Monkey and Me'
              },
              {
                id: 444,
                name: 'One, two, three, one, two, three, drink'
              }
            ]
          }

          const shallowPopulate = makePopulate(options)

          await shallowPopulate(context)
          assert(calledIncludeUsersParams, 'params function for users was called')
          assert(calledIncludeCommentsParams, 'params function for comments was called')
        })

        it('wait for params function that returns a promise', async () => {
          let calledAsyncFunction = false
          const options = {
            include: {
              service: 'posts',
              nameAs: 'posts',
              params: async (params, context) => {
                await new Promise(resolve => { setTimeout(resolve, 500) })
                params.calledAsyncFunction = true
                calledAsyncFunction = true
                return params
              }
            }
          }

          let hasCalledFind = false

          const context = {
            method: 'create',
            type: 'after',
            app: {
              service () {
                return {
                  find (params = {}) {
                    assert(params.calledAsyncFunction, 'waited for async params function before find')
                    hasCalledFind = true
                    return []
                  }
                }
              }
            },
            params: {},
            result: {
              id: '1'
            }
          }

          const shallowPopulate = makePopulate(options)
          await shallowPopulate(context)
          assert(calledAsyncFunction, 'waited for async params function')
          assert(hasCalledFind, 'checks were made')
        })

        it('can pass in params as array', async () => {
          let calledLastFunction = false

          const expected = {
            paginate: false,
            query: {
              postsId: { $in: ['1'] },
              second: true,
              fourth: true
            },
            third: true,
            fifth: true,
            sixth: true
          }

          const options = {
            include: [
              {
                service: 'users',
                nameAs: 'users',
                keyHere: 'id',
                keyThere: 'postsId',
                params: [
                  {},
                  { query: { second: true } },
                  (params) => {
                    assert(params.query.second, 'walked through before')
                    params.third = true
                  },
                  (params) => {
                    assert(params.third, 'walked through before')
                    return { query: { fourth: true } }
                  },
                  async (params) => {
                    assert(params.query.fourth, 'walked through before')
                    await new Promise(resolve => setTimeout(resolve, 500))
                    params.fifth = true
                  },
                  (params, context) => {
                    assert(params.fifth, 'walked through before')
                    if (context.app) {
                      return { sixth: true }
                    }
                  },
                  (params) => {
                    assert.deepStrictEqual(params, expected, 'params object is right')
                    calledLastFunction = true
                  }
                ]
              }
            ]
          }
          const context = {
            app: {
              service (path) {
                return services[path]
              }
            },
            method: 'create',
            type: 'after',
            params: {},
            result: [
              {
                id: '1'
              }
            ]
          }

          const shallowPopulate = makePopulate(options)

          await shallowPopulate(context)
          assert(calledLastFunction, 'all params were called')
        })
      })

      describe('params - requestPerItem: true', () => {
        it('can pass in custom params for lookup without `keyHere` and `keyThere`', async () => {
          const options = {
            include: {
              // from: 'users',
              service: 'posts',
              nameAs: 'posts',
              params: { fromCommentsPopulate: true }
            }
          }

          let hasCalledFind = false

          const context = {
            method: 'create',
            type: 'after',
            app: {
              service () {
                return {
                  find (params = {}) {
                    assert(params.fromCommentsPopulate === true, 'we have a custom param')
                    hasCalledFind = true
                    return []
                  }
                }
              }
            },
            params: {},
            result: {
              id: '1'
            }
          }

          const shallowPopulate = makePopulate(options)

          await shallowPopulate(context)
          assert(hasCalledFind, 'checks were made')
        })

        it('can pass in custom params function without `keyThere` and ``keyHere`', () => {
          const expected = { paginate: false }
          const options = {
            include: {
              service: 'posts',
              nameAs: 'posts',
              params: (params, context) => {
                assert.deepStrictEqual(params, expected, 'params just have paginate attribute')
                return params
              }
            }
          }

          assert.doesNotThrow(() => {
            makePopulate(options)
          }, 'does not throw error')
        })

        it('can pass params as nonempty object without `keyThere` and ``keyHere`', () => {
          const options = {
            include: {
              service: 'posts',
              nameAs: 'posts',
              params: {
                test: true
              }
            }
          }

          assert.doesNotThrow(() => {
            makePopulate(options)
          }, 'does not throw error')
        })

        it('skip request if params returns undefined', async () => {
          const options = {
            include: {
              // from: 'users',
              service: 'posts',
              nameAs: 'posts',
              params: () => {}
            }
          }

          let hasCalledFind = false

          const context = {
            method: 'create',
            type: 'after',
            app: {
              service () {
                return {
                  find (params = {}) {
                    hasCalledFind = true
                    return []
                  }
                }
              }
            },
            params: {},
            result: {
              id: '1'
            }
          }

          const shallowPopulate = makePopulate(options)

          await shallowPopulate(context)
          assert(!hasCalledFind, 'skip request if params function returns undefined')
        })

        it('can pass in custom params-function which overrides params', async () => {
          const options = {
            include: {
              // from: 'users',
              service: 'posts',
              nameAs: 'posts',
              params: (params, context) => {
                params.query = { id: 1 }
                return params
              }
            }
          }

          let hasCalledFind = false

          const context = {
            method: 'create',
            type: 'after',
            app: {
              service () {
                return {
                  find (params = {}) {
                    assert(params.paginate === false, 'we have the params from shallow-populate')
                    assert(params.query.id === 1, 'we have a merged query')
                    hasCalledFind = true
                    return []
                  }
                }
              }
            },
            params: {},
            result: {
              id: '1'
            }
          }

          const shallowPopulate = makePopulate(options)

          await shallowPopulate(context)
          assert(hasCalledFind, 'checks were made')
        })

        it('can pass in custom params-function which returns params and merges them deeply', async () => {
          const options = {
            include: {
              // from: 'users',
              service: 'posts',
              nameAs: 'posts',
              params: () => { return { query: { $select: ['id'] } } }
            }
          }

          let hasCalledFind = false

          const context = {
            method: 'create',
            type: 'after',
            app: {
              service () {
                return {
                  find (params = {}) {
                    assert(params.paginate === false, 'we have the params from shallow-populate')
                    assert.deepStrictEqual(params.query, { $select: ['id'] }, 'we have a merged query')
                    hasCalledFind = true
                    return []
                  }
                }
              }
            },
            params: {},
            result: {
              id: '1'
            }
          }

          const shallowPopulate = makePopulate(options)

          await shallowPopulate(context)
          assert(hasCalledFind, 'checks were made')
        })

        it('can pass in custom params-function with context', async () => {
          let paramsFunctionCalled = false

          const options = {
            include: {
              service: 'posts',
              nameAs: 'posts',
              params: (params, context) => {
                assert(context.method === 'create', 'we can pass the context to include')
                params.method = context.method
                paramsFunctionCalled = true
                return params
              }
            }
          }

          let hasCalledFind = false

          const context = {
            method: 'create',
            type: 'after',
            app: {
              service () {
                return {
                  find (params = {}) {
                    assert(params.method === 'create', 'we can manipulate the params based on the context')
                    hasCalledFind = true
                    return []
                  }
                }
              }
            },
            params: {},
            result: {
              id: '1'
            }
          }

          const shallowPopulate = makePopulate(options)

          await shallowPopulate(context)
          assert(paramsFunctionCalled, 'params function was called')
          assert(hasCalledFind, 'checks were made')
        })

        it('access `this` keyword in custom params-function which matches the data item', async () => {
          let paramsFunctionCalled = false

          const item = {
            id: '11',
            name: 'Dumb Stuff',
            meta: {
              postsId: ['111', '222', '333', 444, 555, '666']
            }
          }

          const options = {
            include: {
              service: 'posts',
              nameAs: 'posts',
              params: function (params, context) {
                assert(this === item, 'item from data is passed as `this` keyword')
                assert(context.method === 'create', 'we can pass the context to include')
                params.method = context.method
                paramsFunctionCalled = true
                return params
              }
            }
          }

          let hasCalledFind = false
          const context = {
            method: 'create',
            type: 'after',
            app: {
              service () {
                return {
                  find (params = {}) {
                    assert(params.method === 'create', 'we can manipulate the params based on the context')
                    hasCalledFind = true
                    return []
                  }
                }
              }
            },
            params: {},
            result: item
          }

          const shallowPopulate = makePopulate(options)

          await shallowPopulate(context)
          assert(paramsFunctionCalled, 'params function was called')
          assert(hasCalledFind, 'checks were made')
        })

        it('calls params-function per include and item', async () => {
          const items = [
            {
              id: '333',
              name: 'If I were a banana...'
            },
            {
              id: '111',
              name: 'My Monkey and Me'
            },
            {
              id: 444,
              name: 'One, two, three, one, two, three, drink'
            }
          ]

          let calledUsersParamsNTimes = 0
          let calledCommentsParamsNTimes = 0

          const options = {
            include: [
              {
                service: 'users',
                nameAs: 'users',
                params: () => {
                  calledUsersParamsNTimes++
                  return {}
                }
              },
              {
                service: 'comments',
                nameAs: 'comments',
                params: () => {
                  calledCommentsParamsNTimes++
                  return {}
                }
              }
            ]
          }
          const context = {
            app: {
              service (path) {
                return services[path]
              }
            },
            method: 'create',
            type: 'after',
            params: {},
            result: items
          }

          const shallowPopulate = makePopulate(options)

          await shallowPopulate(context)
          assert(calledUsersParamsNTimes === items.length, 'params function for users was called n times')
          assert(calledCommentsParamsNTimes === items.length, 'params function for comments was called n times')
        })

        it('wait for params function that returns a promise', async () => {
          let calledAsyncFunction = false
          const options = {
            include: {
              service: 'posts',
              nameAs: 'posts',
              params: async (params, context) => {
                await new Promise(resolve => { setTimeout(resolve, 500) })
                params.calledAsyncFunction = true
                calledAsyncFunction = true
                return params
              }
            }
          }

          let hasCalledFind = false

          const context = {
            method: 'create',
            type: 'after',
            app: {
              service () {
                return {
                  find (params = {}) {
                    assert(params.calledAsyncFunction, 'waited for async params function before find')
                    hasCalledFind = true
                    return []
                  }
                }
              }
            },
            params: {},
            result: {
              id: '1'
            }
          }

          const shallowPopulate = makePopulate(options)
          await shallowPopulate(context)
          assert(calledAsyncFunction, 'waited for async params function')
          assert(hasCalledFind, 'checks were made')
        })

        it('can define params as array', async () => {
          let calledLastFunction = false

          const expected = {
            paginate: false,
            query: {
              second: true,
              fourth: true
            },
            third: true,
            fifth: true,
            sixth: true
          }

          const options = {
            include: [
              {
                service: 'users',
                nameAs: 'users',
                params: [
                  {},
                  { query: { second: true } },
                  (params) => {
                    assert(params.query.second, 'walked through before')
                    params.third = true
                    return params
                  },
                  (params) => {
                    assert(params.third, 'walked through before')
                    return { query: { fourth: true } }
                  },
                  async (params) => {
                    assert(params.query.fourth, 'walked through before')
                    await new Promise(resolve => setTimeout(resolve, 500))
                    params.fifth = true
                    return params
                  },
                  (params, context) => {
                    assert(params.fifth, 'walked through before')
                    if (context.app) {
                      return { sixth: true }
                    }
                  },
                  (params) => {
                    assert.deepStrictEqual(params, expected, 'params object is right')
                    calledLastFunction = true
                    return params
                  }
                ]
              }
            ]
          }
          const context = {
            app: {
              service (path) {
                return services[path]
              }
            },
            method: 'create',
            type: 'after',
            params: {},
            result: [
              {
                id: '1'
              }
            ]
          }

          const shallowPopulate = makePopulate(options)

          await shallowPopulate(context)
          assert(calledLastFunction, 'all params were called')
        })
      })
    })
  })

  describe('populating thing', () => {
    describe('Before Hook:', () => {
      it('does nothing when data is empty', async () => {
        const options = {
          include: {
            // from: 'users',
            service: 'posts',
            nameAs: 'post',
            keyHere: 'postIds',
            keyThere: 'id',
            asArray: false
          }
        }
        const context = {
          app: {
            service (path) {
              return services[path]
            }
          },
          method: 'create',
          type: 'before',
          params: {},
          data: {}
        }

        const shallowPopulate = makePopulate(options)

        const { data } = await shallowPopulate(context)

        assert.deepStrictEqual(data, context.data, 'data should not be touched')
      })

      describe('Before - Single Record:', () => {
        describe('Before/Single - Single Relationship:', () => {
          it('as object', async () => {
            const options = {
              include: {
                // from: 'users',
                service: 'posts',
                nameAs: 'post',
                keyHere: 'postIds',
                keyThere: 'id',
                asArray: false
              }
            }
            const context = {
              app: {
                service (path) {
                  return services[path]
                }
              },
              method: 'create',
              type: 'before',
              params: {},
              data: {
                id: '11',
                name: 'Dumb Stuff',
                postIds: '111'
              }
            }

            const shallowPopulate = makePopulate(options)

            const { data } = await shallowPopulate(context)

            assert(data.post, 'post should have been populated')
            assert(!Array.isArray(data.post), 'post should not be an array')
            assert(data.post.id === '111', 'post has correct id')
          })

          it('as object when array', async () => {
            const options = {
              include: {
                // from: 'users',
                service: 'posts',
                nameAs: 'post',
                keyHere: 'postIds',
                keyThere: 'id',
                asArray: false
              }
            }
            const context = {
              app: {
                service (path) {
                  return services[path]
                }
              },
              method: 'create',
              type: 'before',
              params: {},
              data: {
                id: '11',
                name: 'Dumb Stuff',
                postIds: ['111', '222', 444, '555']
              }
            }

            const shallowPopulate = makePopulate(options)

            const { data } = await shallowPopulate(context)

            assert(data.post, 'post should have been populated')
            assert(!Array.isArray(data.post), 'post should not be an array')
            assert(data.post.id === '111', 'post has correct id')
          })

          it('does nothing if no populate data on item', async () => {
            const options = {
              include: {
                // from: 'users',
                service: 'posts',
                nameAs: 'posts',
                keyHere: 'postsId',
                keyThere: 'id'
              }
            }
            const context = {
              app: {
                service (path) {
                  return services[path]
                }
              },
              method: 'create',
              type: 'before',
              params: {},
              data: {
                id: '11',
                name: 'Dumb Stuff'
              }
            }

            const shallowPopulate = makePopulate(options)

            const { data } = await shallowPopulate(context)

            assert(!data.posts, 'posts should have not been populated')
          })

          it('populates from local keys dot notation', async () => {
            const options = {
              include: {
                // from: 'users',
                service: 'posts',
                nameAs: 'meta.posts',
                keyHere: 'meta.postsId',
                keyThere: 'id'
              }
            }
            const context = {
              app: {
                service (path) {
                  return services[path]
                }
              },
              method: 'create',
              type: 'before',
              params: {},
              data: {
                id: '11',
                name: 'Dumb Stuff',
                meta: {
                  postsId: ['111', 444]
                }
              }
            }

            const shallowPopulate = makePopulate(options)

            const { data } = await shallowPopulate(context)
            assert(data.meta.posts.length, 'posts should have been populated')
          })

          it('populates from local keys', async () => {
            const options = {
              include: {
                // from: 'users',
                service: 'posts',
                nameAs: 'posts',
                keyHere: 'postsId',
                keyThere: 'id'
              }
            }
            const context = {
              app: {
                service (path) {
                  return services[path]
                }
              },
              method: 'create',
              type: 'before',
              params: {},
              data: {
                id: '11',
                name: 'Dumb Stuff',
                postsId: ['111', '222', '333', 444, 555, '666']
              }
            }

            const shallowPopulate = makePopulate(options)

            const { data } = await shallowPopulate(context)
            assert(data.posts.length, 'posts should have been populated')
          })

          it.skip('populates empty nameAs property if no relatedItems', async () => {
            const options = {
              include: {
                // from: 'users',
                service: 'posts',
                nameAs: 'posts',
                keyHere: 'postsId',
                keyThere: 'id'
              }
            }
            const context = {
              app: {
                service (path) {
                  return services[path]
                }
              },
              method: 'create',
              type: 'before',
              params: {},
              data: {
                id: '11',
                name: 'Dumb Stuff'
              }
            }

            const shallowPopulate = makePopulate(options)

            const { data } = await shallowPopulate(context)
            assert(data.posts, 'posts should have been populated')
          })

          it('populates from foreign keys', async () => {
            const options = {
              include: {
                // from: 'posts',
                service: 'users',
                nameAs: 'users',
                keyHere: 'id',
                keyThere: 'postsId'
              }
            }
            const context = {
              app: {
                service (path) {
                  return services[path]
                }
              },
              method: 'create',
              type: 'before',
              params: {},
              data: {
                id: '111',
                name: 'My Monkey and Me'
              }
            }

            const shallowPopulate = makePopulate(options)

            const { data } = await shallowPopulate(context)
            assert(data.users, 'should have users property')
          })

          describe('requestPerItem: true', () => {
            it('populates with custom params $select works', async () => {
              const options = {
                include: {
                  // from: 'posts',
                  service: 'tasks',
                  nameAs: 'tasks',
                  params: (params, context) => {
                    return { query: { $select: ['id'] } }
                  }
                }
              }
              const context = {
                app: {
                  service (path) {
                    return services[path]
                  }
                },
                method: 'create',
                type: 'before',
                params: {},
                // Data for a single track
                data: {
                  id: '111',
                  name: 'My Monkey and Me'
                }
              }

              const shallowPopulate = makePopulate(options)

              const { data } = await shallowPopulate(context)
              const expected = Object.values(services.tasks.store).map(x => { return { id: x.id } })
              assert.deepStrictEqual(data.tasks, expected, 'populated all tasks with only `id` attribute')
            })

            it('populates with custom params function', async () => {
              const options = {
                include: {
                  // from: 'posts',
                  service: 'tasks',
                  nameAs: 'tasks',
                  params: function (params, context) {
                    return { query: { userId: this.userId } }
                  }
                }
              }
              const context = {
                app: {
                  service (path) {
                    return services[path]
                  }
                },
                method: 'create',
                type: 'before',
                params: {},
                // Data for a single track
                data: {
                  id: '111',
                  name: 'My Monkey and Me',
                  userId: '11'
                }
              }

              const shallowPopulate = makePopulate(options)

              const { data } = await shallowPopulate(context)
              const expectedTasks = Object.values(services.tasks.store).filter(x => x.userId === '11')
              assert.deepStrictEqual(data.tasks, expectedTasks, 'tasks populated correctly')
            })
          })

          it.skip('handles missing _id on create', async () => {})
        })

        describe('Before/Single - Multiple Relationship:', () => {
          it('as object', async () => {
            const options = {
              include: [
                {
                  // from: 'users',
                  service: 'tags',
                  nameAs: 'tags',
                  keyHere: 'tagIds',
                  keyThere: 'id'
                },
                {
                  // from: 'users',
                  service: 'posts',
                  nameAs: 'post',
                  keyHere: 'postIds',
                  keyThere: 'id',
                  asArray: false
                }
              ]
            }
            const context = {
              app: {
                service (path) {
                  return services[path]
                }
              },
              method: 'create',
              type: 'before',
              params: {},
              data: {
                id: '11',
                name: 'Dumb Stuff',
                postIds: '111',
                tagIds: ['1111', 4444]
              }
            }

            const shallowPopulate = makePopulate(options)

            const { data } = await shallowPopulate(context)
            assert(data.post, 'post should have been populated')
            assert(!Array.isArray(data.post), 'post should not be an array')
            assert(data.post.id === '111', 'post has correct id')
            assert(Array.isArray(data.tags), 'tags is an array')
          })

          it('as object when array', async () => {
            const options = {
              include: [
                {
                  // from: 'users',
                  service: 'tags',
                  nameAs: 'tags',
                  keyHere: 'tagIds',
                  keyThere: 'id'
                },
                {
                  // from: 'users',
                  service: 'posts',
                  nameAs: 'post',
                  keyHere: 'postIds',
                  keyThere: 'id',
                  asArray: false
                }
              ]
            }
            const context = {
              app: {
                service (path) {
                  return services[path]
                }
              },
              method: 'create',
              type: 'before',
              params: {},
              data: {
                id: '11',
                name: 'Dumb Stuff',
                postIds: ['111', '222', 444],
                tagIds: ['1111', '3333', 4444]
              }
            }

            const shallowPopulate = makePopulate(options)

            const { data } = await shallowPopulate(context)
            assert(data.post, 'post should have been populated')
            assert(!Array.isArray(data.post), 'post should not be an array')
            assert(data.post.id === '111', 'post has correct id')
            assert(Array.isArray(data.tags), 'tags is an array')
          })

          it('does nothing if some populate data on item does not exist', async () => {
            const options = {
              include: [
                {
                  // from: 'users',
                  service: 'posts',
                  nameAs: 'posts',
                  keyHere: 'postsId',
                  keyThere: 'id'
                },
                {
                  // from: 'users',
                  service: 'tags',
                  nameAs: 'tags',
                  keyHere: 'tagIds',
                  keyThere: 'id'
                }
              ]
            }
            const context = {
              app: {
                service (path) {
                  return services[path]
                }
              },
              method: 'create',
              type: 'before',
              params: {},
              data: {
                id: '11',
                name: 'Dumb Stuff',
                tagIds: ['1111', '3333', 4444]
              }
            }

            const shallowPopulate = makePopulate(options)

            const { data } = await shallowPopulate(context)
            assert(!data.posts, 'posts should have not been populated')
            assert(data.tags.length === 3, 'tags have been populated')
          })

          it('populates from local keys dot notation', async () => {
            const options = {
              include: [
                {
                  // from: 'users',
                  service: 'posts',
                  nameAs: 'meta.posts',
                  keyHere: 'meta.postsId',
                  keyThere: 'id'
                },
                {
                  // from: 'users',
                  service: 'tags',
                  nameAs: 'meta.tags',
                  keyHere: 'meta.tagIds',
                  keyThere: 'id'
                }
              ]
            }
            const context = {
              app: {
                service (path) {
                  return services[path]
                }
              },
              method: 'create',
              type: 'before',
              params: {},
              data: {
                id: '11',
                name: 'Dumb Stuff',
                meta: {
                  postsId: ['111', '222', '333', 444],
                  tagIds: ['1111', '3333', 4444]
                }
              }
            }

            const shallowPopulate = makePopulate(options)

            const { data } = await shallowPopulate(context)
            assert(data.meta.posts.length, 'posts should have been populated')
            assert(data.meta.tags.length, 'posts should have been populated')
          })

          it('populates from local keys', async () => {
            const options = {
              include: [
                {
                  // from: 'users',
                  service: 'posts',
                  nameAs: 'posts',
                  keyHere: 'postsId',
                  keyThere: 'id'
                },
                {
                  // from: 'users',
                  service: 'tags',
                  nameAs: 'tags',
                  keyHere: 'tagIds',
                  keyThere: 'id'
                }
              ]
            }
            const context = {
              app: {
                service (path) {
                  return services[path]
                }
              },
              method: 'create',
              type: 'before',
              params: {},
              data: {
                id: '11',
                name: 'Dumb Stuff',
                postsId: ['111', '222', '333', 444],
                tagIds: ['1111', '3333', 4444]
              }
            }

            const shallowPopulate = makePopulate(options)

            const result = await shallowPopulate(context)
            const { data } = result
            assert(data.posts.length, 'posts should have been populated')
          })

          it('populates from foreign keys', async () => {
            const options = {
              include: [
                {
                  service: 'users',
                  nameAs: 'users',
                  keyHere: 'id',
                  keyThere: 'postsId'
                },
                {
                  service: 'comments',
                  nameAs: 'comments',
                  keyHere: 'id',
                  keyThere: 'postsId'
                }
              ]
            }
            const context = {
              app: {
                service (path) {
                  return services[path]
                }
              },
              method: 'create',
              type: 'before',
              params: {},
              data: {
                id: '333',
                name: 'If I were a banana...'
              }
            }

            const shallowPopulate = makePopulate(options)

            const { data } = await shallowPopulate(context)
            assert(data.users.length === 1, 'data should have correct users data')
            assert(data.comments.length === 2, 'data should have correct comments data')
          })

          describe('requestPerItem: true', () => {
            it('populates with custom params $select works', async () => {
              const options = {
                include: [
                  {
                  // from: 'posts',
                    service: 'tasks',
                    nameAs: 'tasks',
                    params: (params, context) => { return { query: { $select: ['id'] } } }
                  },
                  {
                  // from: 'posts',
                    service: 'comments',
                    nameAs: 'comments',
                    params: (params, context) => { return { query: { $select: ['id'] } } }
                  }
                ]
              }
              const context = {
                app: {
                  service (path) {
                    return services[path]
                  }
                },
                method: 'create',
                type: 'before',
                params: {},
                // Data for a single track
                data: {
                  id: '111',
                  name: 'My Monkey and Me'
                }
              }

              const shallowPopulate = makePopulate(options)

              const { data } = await shallowPopulate(context)
              const expectedTasks = Object.values(services.tasks.store).map(x => { return { id: x.id } })
              assert.deepStrictEqual(data.tasks, expectedTasks, 'populated all tasks with only `id` attribute')

              const expectedComments = Object.values(services.comments.store).map(x => { return { id: x.id } })
              assert.deepStrictEqual(data.comments, expectedComments, 'populated all tasks with only `id` attribute')
            })

            it('populates with custom params function', async () => {
              const options = {
                include: [
                  {
                  // from: 'posts',
                    service: 'tasks',
                    nameAs: 'tasks',
                    params: function (params, context) {
                      return { query: { userId: this.userId } }
                    }
                  },
                  {
                  // from: 'posts',
                    service: 'tags',
                    nameAs: 'tags',
                    params: function (params, context) {
                      return {
                        query: {
                          userId: this.userId,
                          $select: ['id']
                        }
                      }
                    }
                  },
                  {
                    service: 'orgs',
                    nameAs: 'org',
                    asArray: false,
                    params: async function (params, context) {
                      const user = await context.app.service('users').get(this.userId)
                      return { query: { id: user.orgId } }
                    }
                  },
                  {
                    // from: 'posts',
                    service: 'tags',
                    nameAs: 'tag',
                    asArray: false,
                    params: [
                      function (params, context) {
                        return {
                          query: {
                            userId: this.userId
                          }
                        }
                      },
                      { query: { $select: ['id'] } }
                    ]
                  }
                ]
              }
              const context = {
                app: {
                  service (path) {
                    return services[path]
                  }
                },
                method: 'create',
                type: 'before',
                params: {},
                // Data for a single track
                data: {
                  id: '111',
                  name: 'My Monkey and Me',
                  userId: '11'
                }
              }

              const shallowPopulate = makePopulate(options)

              const { data } = await shallowPopulate(context)
              const expectedTasks = Object.values(services.tasks.store).filter(x => x.userId === '11')
              const expectedTags = Object.values(services.tags.store).filter(x => x.userId === data.userId).map(x => { return { id: x.id } })
              const user = Object.values(services.users.store).filter(x => x.id === data.userId)[0]
              const expectedOrg = Object.values(services.orgs.store).filter(x => x.id === user.orgId)[0]
              const expectedTag = expectedTags[0]
              assert.deepStrictEqual(data.tasks, expectedTasks, 'tasks populated correctly')
              assert.deepStrictEqual(data.tags, expectedTags, 'tags populated correctly')
              assert.deepStrictEqual(data.org, expectedOrg, 'populated org correctly')
              assert.deepStrictEqual(data.tag, expectedTag, 'single tag populated correctly')
            })
          })

          it.skip('handles missing _id on create', async () => {})
        })
      })

      describe('Before - Multiple Record:', () => {
        describe('Before/Multiple - Single Relationship:', () => {
          it('as object', async () => {
            const options = {
              include: {
                // from: 'users',
                service: 'posts',
                nameAs: 'post',
                keyHere: 'postIds',
                keyThere: 'id',
                asArray: false
              }
            }
            const context = {
              app: {
                service (path) {
                  return services[path]
                }
              },
              method: 'create',
              type: 'before',
              params: {},
              data: [
                {
                  id: '11',
                  name: 'Dumb Stuff',
                  postIds: ['111', '222', 444]
                },
                {
                  id: '22',
                  name: 'Smart Stuff',
                  postIds: '222'
                },
                {
                  id: '33',
                  name: 'Some Stuff',
                  postIds: ['111', 444]
                }
              ]
            }

            const shallowPopulate = makePopulate(options)

            const { data } = await shallowPopulate(context)
            assert(data[0].post, 'post should have been populated')
            assert(!Array.isArray(data[0].post), 'post should not be an array')
            assert(data[0].post.id === '111', 'post has correct id')
            assert(data[1].post, 'post should have been populated')
            assert(!Array.isArray(data[1].post), 'post should not be an array')
            assert(data[1].post.id === '222', 'post has correct id')
          })

          it('as object when array', async () => {
            const options = {
              include: {
                // from: 'users',
                service: 'posts',
                nameAs: 'post',
                keyHere: 'postIds',
                keyThere: 'id',
                asArray: false
              }
            }
            const context = {
              app: {
                service (path) {
                  return services[path]
                }
              },
              method: 'create',
              type: 'before',
              params: {},
              data: [
                {
                  id: '11',
                  name: 'Dumb Stuff',
                  postIds: ['111', '222', 444]
                },
                {
                  id: '22',
                  name: 'Smart Stuff',
                  postIds: ['222', '111', 444]
                },
                {
                  id: 44,
                  name: 'Just Stuff',
                  postIds: [444, 111, '222']
                }
              ]
            }

            const shallowPopulate = makePopulate(options)

            const { data } = await shallowPopulate(context)
            assert(data[0].post, 'post should have been populated')
            assert(!Array.isArray(data[0].post), 'post should not be an array')
            assert(data[0].post.id === '111', 'post has correct id')
            assert(data[1].post, 'post should have been populated')
            assert(!Array.isArray(data[1].post), 'post should not be an array')
            assert(data[1].post.id === '222', 'post has correct id')
          })

          it('does nothing if some populate data on item does not exist', async () => {
            const options = {
              include: {
                // from: 'users',
                service: 'tags',
                nameAs: 'tags',
                keyHere: 'tagIds',
                keyThere: 'id'
              }
            }
            const context = {
              app: {
                service (path) {
                  return services[path]
                }
              },
              method: 'create',
              type: 'before',
              params: {},
              data: [
                {
                  id: '11',
                  name: 'Dumb Stuff',
                  tagIds: ['1111', '3333', 4444]
                },
                {
                  id: '22',
                  name: 'Smart Stuff'
                },
                {
                  id: 44,
                  name: 'Just Stuff',
                  tagIds: [4444]
                }
              ]
            }

            const shallowPopulate = makePopulate(options)

            const { data } = await shallowPopulate(context)
            assert(data[0].tags.length === 3, 'tags have been populated')
            assert(!data[1].tags, 'tags have not been populated')
          })

          it('populates from local keys dot notation', async () => {
            const options = {
              include: {
                service: 'posts',
                nameAs: 'meta.posts',
                keyHere: 'meta.postsId',
                keyThere: 'id'
              }
            }
            const context = {
              app: {
                service (path) {
                  return services[path]
                }
              },
              method: 'create',
              type: 'before',
              params: {},
              data: [
                {
                  id: '11',
                  name: 'Dumb Stuff',
                  meta: {
                    postsId: ['111', '333', 444]
                  }
                },
                {
                  id: '22',
                  name: 'Dumb Stuff',
                  meta: {
                    postsId: ['222', '333', '111', 555]
                  }
                },
                {
                  id: 44,
                  name: 'Integer Stuff',
                  meta: {
                    postsId: ['222', 555]
                  }
                }
              ]
            }

            const shallowPopulate = makePopulate(options)

            const { data } = await shallowPopulate(context)
            assert(data[0].meta.posts.length === 3, 'data[0] posts should have been populated')
            assert(data[1].meta.posts.length === 4, 'data[0] posts should have been populated')
          })

          it('populates from local keys', async () => {
            const options = {
              include: {
                // from: 'users',
                service: 'posts',
                nameAs: 'posts',
                keyHere: 'postsId',
                keyThere: 'id'
              }
            }
            const context = {
              app: {
                service (path) {
                  return services[path]
                }
              },
              method: 'create',
              type: 'before',
              params: {},
              data: [
                {
                  id: '11',
                  name: 'Dumb Stuff',
                  postsId: ['111', '222', 444, '555']
                },
                {
                  id: '22',
                  name: 'Smart Stuff',
                  postsId: ['333', 444, '555']
                }
              ]
            }

            const shallowPopulate = makePopulate(options)

            const { data } = await shallowPopulate(context)
            assert(data[0].posts.length === 3, 'data[0] should have correct posts data')
            assert(data[1].posts.length === 2, 'data[1] should have correct posts data')
          })

          it('populates from foreign keys', async () => {
            const options = {
              include: {
                // from: 'posts',
                service: 'users',
                nameAs: 'users',
                keyHere: 'id',
                keyThere: 'postsId'
              }
            }
            const context = {
              app: {
                service (path) {
                  return services[path]
                }
              },
              method: 'create',
              type: 'before',
              params: {},
              data: [
                {
                  id: '111',
                  name: 'My Monkey and Me'
                },
                {
                  id: '222',
                  name: 'I forgot why I love you'
                },
                {
                  id: 444,
                  name: 'One, two, three, one, two, three, drink'
                }
              ]
            }

            const shallowPopulate = makePopulate(options)

            const { data } = await shallowPopulate(context)
            data.forEach(item => {
              assert(item.users, 'should have users property')
            })
          })

          describe('requestPerItem: true', () => {
            it('populates with custom params $select works', async () => {
              const posts = [
                {
                  id: '111',
                  name: 'My Monkey and Me'
                },
                {
                  id: '222',
                  name: 'I forgot why I love you'
                },
                {
                  id: 444,
                  name: 'One, two, three, one, two, three, drink'
                }
              ]

              const options = {
                include: {
                  // from: 'posts',
                  service: 'tasks',
                  nameAs: 'tasks',
                  params: (params, context) => {
                    return { query: { $select: ['id'] } }
                  }
                }
              }
              const context = {
                app: {
                  service (path) {
                    return services[path]
                  }
                },
                method: 'create',
                type: 'before',
                params: {},
                // Data for a single track
                data: posts
              }

              const shallowPopulate = makePopulate(options)

              const { data } = await shallowPopulate(context)

              data.forEach(post => {
                const expectedTasks = Object.values(services.tasks.store).map(x => { return { id: x.id } })
                assert.deepStrictEqual(post.tasks, expectedTasks, 'populated all tasks with only `id` attribute')
              })
            })

            it('populates with custom params function', async () => {
              const posts = [
                {
                  id: '111',
                  name: 'My Monkey and Me',
                  userId: '11'
                },
                {
                  id: '222',
                  name: 'I forgot why I love you',
                  userId: '11'
                },
                {
                  id: 444,
                  name: 'One, two, three, one, two, three, drink',
                  userId: 44
                }
              ]

              const options = {
                include: {
                  // from: 'posts',
                  service: 'tasks',
                  nameAs: 'tasks',
                  params: function (params, context) {
                    return { query: { userId: this.userId } }
                  }
                }
              }
              const context = {
                app: {
                  service (path) {
                    return services[path]
                  }
                },
                method: 'create',
                type: 'before',
                params: {},
                // Data for a single track
                data: posts
              }

              const shallowPopulate = makePopulate(options)

              const { data } = await shallowPopulate(context)

              data.forEach(post => {
                const expectedTasks = Object.values(services.tasks.store).filter(x => x.userId === post.userId)
                assert.deepStrictEqual(post.tasks, expectedTasks, 'tasks populated correctly')
              })
            })
          })

          it.skip('handles missing _id on create', async () => {})
        })

        describe('Before/Multiple - Multiple Relationship:', () => {
          it('as object', async () => {
            const options = {
              include: [
                {
                  // from: 'users',
                  service: 'tags',
                  nameAs: 'tags',
                  keyHere: 'tagIds',
                  keyThere: 'id'
                },
                {
                  // from: 'users',
                  service: 'posts',
                  nameAs: 'post',
                  keyHere: 'postIds',
                  keyThere: 'id',
                  asArray: false
                }
              ]
            }
            const context = {
              app: {
                service (path) {
                  return services[path]
                }
              },
              method: 'create',
              type: 'before',
              params: {},
              data: [
                {
                  id: '11',
                  name: 'Dumb Stuff',
                  postIds: '111',
                  tagIds: ['1111', '3333', 4444]
                },
                {
                  id: '22',
                  name: 'Smart Stuff',
                  postIds: '222',
                  tagIds: ['1111']
                },
                {
                  id: 33,
                  name: 'Just Stuff',
                  postIds: 444,
                  tagIds: ['1111', 4444]
                }
              ]
            }

            const shallowPopulate = makePopulate(options)

            const { data } = await shallowPopulate(context)
            assert(data[0].post, 'post should have been populated')
            assert(!Array.isArray(data[0].post), 'post should not be an array')
            assert(data[0].post.id === '111', 'post has correct id')
            assert(data[0].tags, 'tags should have been populated')
            assert(Array.isArray(data[0].tags), 'tags should be an array')

            assert(data[1].post, 'post should have been populated')
            assert(!Array.isArray(data[1].post), 'post should not be an array')
            assert(data[1].post.id === '222', 'post has correct id')
            assert(data[1].tags, 'tags should have been populated')
            assert(Array.isArray(data[1].tags), 'tags should be an array')
          })

          it('as object when array', async () => {
            const options = {
              include: [
                {
                  // from: 'users',
                  service: 'tags',
                  nameAs: 'tags',
                  keyHere: 'tagIds',
                  keyThere: 'id'
                },
                {
                  // from: 'users',
                  service: 'posts',
                  nameAs: 'post',
                  keyHere: 'postIds',
                  keyThere: 'id',
                  asArray: false
                }
              ]
            }
            const context = {
              app: {
                service (path) {
                  return services[path]
                }
              },
              method: 'create',
              type: 'before',
              params: {},
              data: [
                {
                  id: '11',
                  name: 'Dumb Stuff',
                  postIds: ['111', '222', 444],
                  tagIds: ['1111', '3333', 4444]
                },
                {
                  id: '22',
                  name: 'Smart Stuff',
                  postIds: ['222', 444],
                  tagIds: ['1111']
                }
              ]
            }

            const shallowPopulate = makePopulate(options)

            const { data } = await shallowPopulate(context)
            assert(data[0].post, 'post should have been populated')
            assert(!Array.isArray(data[0].post), 'post should not be an array')
            assert(data[0].post.id === '111', 'post has correct id')
            assert(data[0].tags, 'tags should have been populated')
            assert(Array.isArray(data[0].tags), 'tags should be an array')

            assert(data[1].post, 'post should have been populated')
            assert(!Array.isArray(data[1].post), 'post should not be an array')
            assert(data[1].post.id === '222', 'post has correct id')
            assert(data[1].tags, 'tags should have been populated')
            assert(Array.isArray(data[1].tags), 'tags should be an array')
          })

          it('does nothing if some populate data on item does not exist', async () => {
            const options = {
              include: [
                {
                  // from: 'users',
                  service: 'tags',
                  nameAs: 'tags',
                  keyHere: 'tagIds',
                  keyThere: 'id'
                },
                {
                  // from: 'users',
                  service: 'posts',
                  nameAs: 'posts',
                  keyHere: 'postIds',
                  keyThere: 'id'
                }
              ]
            }
            const context = {
              app: {
                service (path) {
                  return services[path]
                }
              },
              method: 'create',
              type: 'before',
              params: {},
              data: [
                {
                  id: '11',
                  name: 'Dumb Stuff',
                  postIds: ['111', '222', '333', 444]
                },
                {
                  id: '22',
                  name: 'Smart Stuff',
                  postIds: ['111', '333', 555]
                }
              ]
            }

            const shallowPopulate = makePopulate(options)

            const { data } = await shallowPopulate(context)
            assert(data[0].posts.length === 4, 'posts have been populated')
            assert(!data[0].tags, 'tags have not been populated')
            assert(!data[1].tags, 'tags have not been populated')
            assert(data[1].posts.length === 3, 'posts have been populated')
          })

          it('populates from local keys', async () => {
            const options = {
              include: [
                {
                  // from: 'users',
                  service: 'posts',
                  nameAs: 'posts',
                  keyHere: 'postsId',
                  keyThere: 'id'
                },
                {
                  // from: 'users',
                  service: 'tags',
                  nameAs: 'tags',
                  keyHere: 'tagIds',
                  keyThere: 'id'
                }
              ]
            }
            const context = {
              app: {
                service (path) {
                  return services[path]
                }
              },
              method: 'create',
              type: 'before',
              params: {},
              data: [
                {
                  id: '11',
                  name: 'Dumb Stuff',
                  postsId: ['111', '222', '333'],
                  tagIds: ['1111', '3333']
                },
                {
                  id: '22',
                  name: 'Smart Stuff',
                  postsId: ['111', '333'],
                  tagIds: ['3333']
                }
              ]
            }

            const shallowPopulate = makePopulate(options)

            const { data } = await shallowPopulate(context)
            assert(data[0].posts.length === 3, 'data[0] should have correct posts data')
            assert(data[0].tags.length === 2, 'data[0] should have correct tags data')

            assert(data[1].posts.length === 2, 'data[1] should have correct posts data')
            assert(data[1].tags.length === 1, 'data[1] should have correct tags data')
          })

          it('populates from foreign keys', async () => {
            const options = {
              include: [
                {
                  service: 'users',
                  nameAs: 'users',
                  keyHere: 'id',
                  keyThere: 'postsId'
                },
                {
                  service: 'comments',
                  nameAs: 'comments',
                  keyHere: 'id',
                  keyThere: 'postsId'
                }
              ]
            }
            const context = {
              app: {
                service (path) {
                  return services[path]
                }
              },
              method: 'create',
              type: 'before',
              params: {},
              data: [
                {
                  id: '333',
                  name: 'If I were a banana...'
                },
                {
                  id: '111',
                  name: 'My Monkey and Me'
                }
              ]
            }

            const shallowPopulate = makePopulate(options)

            const { data } = await shallowPopulate(context)
            assert(data[0].users.length === 1, 'data[0] should have correct users data')
            assert(data[0].comments.length === 2, 'data[0] should have correct comments data')

            assert(data[1].users.length === 2, 'data[1] should have correct users data')
            assert(data[1].comments.length === 2, 'data[1] should have correct comments data')
          })

          describe('requestPerItem: true', () => {
            it('populates with custom params $select works', async () => {
              const posts = [
                {
                  id: '111',
                  name: 'My Monkey and Me'
                },
                {
                  id: '222',
                  name: 'I forgot why I love you'
                },
                {
                  id: 444,
                  name: 'One, two, three, one, two, three, drink'
                }
              ]

              const options = {
                include: [
                  {
                  // from: 'posts',
                    service: 'tasks',
                    nameAs: 'tasks',
                    params: (params, context) => { return { query: { $select: ['id'] } } }
                  },
                  {
                  // from: 'posts',
                    service: 'comments',
                    nameAs: 'comments',
                    params: (params, context) => { return { query: { $select: ['id'] } } }
                  }
                ]
              }
              const context = {
                app: {
                  service (path) {
                    return services[path]
                  }
                },
                method: 'create',
                type: 'before',
                params: {},
                // Data for a single track
                data: posts
              }

              const shallowPopulate = makePopulate(options)

              const { data } = await shallowPopulate(context)

              data.forEach(post => {
                const expectedTasks = Object.values(services.tasks.store).map(x => { return { id: x.id } })
                assert.deepStrictEqual(post.tasks, expectedTasks, 'populated all tasks with only `id` attribute')

                const expectedComments = Object.values(services.comments.store).map(x => { return { id: x.id } })
                assert.deepStrictEqual(post.comments, expectedComments, 'populated all tasks with only `id` attribute')
              })
            })

            it('populates with custom params function', async () => {
              const posts = [
                {
                  id: '111',
                  name: 'My Monkey and Me',
                  userId: '11'
                },
                {
                  id: '222',
                  name: 'I forgot why I love you',
                  userId: '11'
                },
                {
                  id: 444,
                  name: 'One, two, three, one, two, three, drink',
                  userId: 44
                }
              ]

              const options = {
                include: [
                  {
                  // from: 'posts',
                    service: 'tasks',
                    nameAs: 'tasks',
                    params: function (params, context) {
                      return { query: { userId: this.userId } }
                    }
                  },
                  {
                  // from: 'posts',
                    service: 'tags',
                    nameAs: 'tags',
                    params: function (params, context) {
                      return {
                        query: {
                          userId: this.userId,
                          $select: ['id']
                        }
                      }
                    }
                  },
                  {
                    service: 'orgs',
                    nameAs: 'org',
                    asArray: false,
                    params: async function (params, context) {
                      const user = await context.app.service('users').get(this.userId)
                      return { query: { id: user.orgId } }
                    }
                  },
                  {
                    // from: 'posts',
                    service: 'tags',
                    nameAs: 'tag',
                    asArray: false,
                    params: [
                      function (params, context) {
                        return {
                          query: {
                            userId: this.userId
                          }
                        }
                      },
                      { query: { $select: ['id'] } }
                    ]
                  }
                ]
              }
              const context = {
                app: {
                  service (path) {
                    return services[path]
                  }
                },
                method: 'create',
                type: 'before',
                params: {},
                // Data for a single track
                data: posts
              }

              const shallowPopulate = makePopulate(options)

              const { data } = await shallowPopulate(context)

              data.forEach(post => {
                const expectedTasks = Object.values(services.tasks.store).filter(x => x.userId === post.userId)
                const expectedTags = Object.values(services.tags.store).filter(x => x.userId === post.userId).map(x => { return { id: x.id } })
                const user = Object.values(services.users.store).filter(x => x.id === post.userId)[0]
                const expectedOrg = Object.values(services.orgs.store).filter(x => x.id === user.orgId)[0]
                const expectedTag = expectedTags[0]
                assert.deepStrictEqual(post.tasks, expectedTasks, 'tasks populated correctly')
                assert.deepStrictEqual(post.tags, expectedTags, 'tags populated correctly')
                assert.deepStrictEqual(post.org, expectedOrg, 'populated org correctly')
                assert.deepStrictEqual(post.tag, expectedTag, 'single tag populated correctly')
              })
            })
          })

          it.skip('handles missing _id on create', async () => {})
        })
      })
    })

    describe('After Hook', () => {
      it('does nothing when result is empty', async () => {
        const options = {
          include: {
            // from: 'users',
            service: 'posts',
            nameAs: 'post',
            keyHere: 'postIds',
            keyThere: 'id',
            asArray: false
          }
        }
        const context = {
          app: {
            service (path) {
              return services[path]
            }
          },
          method: 'create',
          type: 'after',
          params: {},
          result: {
            data: {}
          }
        }

        const shallowPopulate = makePopulate(options)

        const { result } = await shallowPopulate(context)
        const { data } = result
        assert.deepStrictEqual(data, context.result.data, 'data should not be touched')
      })

      describe('After - Single Record:', () => {
        describe('After/Single - Single Relationship:', () => {
          it('as object', async () => {
            const options = {
              include: {
                // from: 'users',
                service: 'posts',
                nameAs: 'post',
                keyHere: 'postIds',
                keyThere: 'id',
                asArray: false
              }
            }
            const context = {
              app: {
                service (path) {
                  return services[path]
                }
              },
              method: 'create',
              type: 'after',
              params: {},
              result: {
                data: {
                  id: '11',
                  name: 'Dumb Stuff',
                  postIds: '111'
                }
              }
            }

            const shallowPopulate = makePopulate(options)

            const { result } = await shallowPopulate(context)
            const { data } = result
            assert(data.post, 'post should have been populated')
            assert(!Array.isArray(data.post), 'post should not be an array')
            assert(data.post.id === '111', 'post has correct id')
          })

          it('as object when array', async () => {
            const options = {
              include: {
                // from: 'users',
                service: 'posts',
                nameAs: 'post',
                keyHere: 'postIds',
                keyThere: 'id',
                asArray: false
              }
            }
            const context = {
              app: {
                service (path) {
                  return services[path]
                }
              },
              method: 'create',
              type: 'after',
              params: {},
              result: {
                data: {
                  id: '11',
                  name: 'Dumb Stuff',
                  postIds: ['111', '222']
                }
              }
            }

            const shallowPopulate = makePopulate(options)

            const { result } = await shallowPopulate(context)
            assert(result.data.post, 'post should have been populated')
            assert(!Array.isArray(result.data.post), 'post should not be an array')
            assert(result.data.post.id === '111', 'post has correct id')
          })

          it('does nothing if some populate data on item does not exist', async () => {
            const options = {
              include: {
                // from: 'users',
                service: 'tags',
                nameAs: 'tags',
                keyHere: 'tagIds',
                keyThere: 'id'
              }
            }
            const context = {
              app: {
                service (path) {
                  return services[path]
                }
              },
              method: 'create',
              type: 'before',
              params: {},
              data: {
                id: '22',
                name: 'Smart Stuff'
              }
            }

            const shallowPopulate = makePopulate(options)

            const { data } = await shallowPopulate(context)
            assert(!data.tags, 'tags have not been populated')
          })

          it('populates from local keys dot notation', async () => {
            const options = {
              include: {
                // from: 'users',
                service: 'posts',
                nameAs: 'meta.posts',
                keyHere: 'meta.postsId',
                keyThere: 'id'
              }
            }
            const context = {
              app: {
                service (path) {
                  return services[path]
                }
              },
              method: 'create',
              type: 'after',
              params: {},
              result: {
                id: '11',
                name: 'Dumb Stuff',
                meta: {
                  postsId: ['111', '222', '333']
                }
              }
            }

            const shallowPopulate = makePopulate(options)

            const { result } = await shallowPopulate(context)
            assert(result.meta.posts.length === 3, 'posts should have been populated')
          })

          it('populates from local keys', async () => {
            const options = {
              include: {
                // from: 'users',
                service: 'posts',
                nameAs: 'posts',
                keyHere: 'postsId',
                keyThere: 'id'
              }
            }
            const context = {
              app: {
                service (path) {
                  return services[path]
                }
              },
              method: 'create',
              type: 'after',
              params: {},
              result: {
                id: '11',
                name: 'Dumb Stuff',
                postsId: ['111', '222', '333']
              }
            }

            const shallowPopulate = makePopulate(options)

            const { result } = await shallowPopulate(context)
            assert(result.posts.length, 'posts should have been populated')
          })

          it('populates from foreign keys', async () => {
            const options = {
              include: {
                // from: 'posts',
                service: 'users',
                nameAs: 'users',
                keyHere: 'id',
                keyThere: 'postsId'
              }
            }
            const context = {
              app: {
                service (path) {
                  return services[path]
                }
              },
              method: 'create',
              type: 'after',
              params: {},
              // Data for a single track
              result: {
                id: '111',
                name: 'My Monkey and Me'
              }
            }

            const shallowPopulate = makePopulate(options)

            const { result } = await shallowPopulate(context)
            assert(result.users, 'should have users property')
          })

          describe('requestPerItem: true', () => {
            it('populates with custom params $select works', async () => {
              const options = {
                include: {
                  // from: 'posts',
                  service: 'tasks',
                  nameAs: 'tasks',
                  params: (params, context) => {
                    return { query: { $select: ['id'] } }
                  }
                }
              }
              const context = {
                app: {
                  service (path) {
                    return services[path]
                  }
                },
                method: 'create',
                type: 'after',
                params: {},
                // Data for a single track
                result: {
                  id: '111',
                  name: 'My Monkey and Me'
                }
              }

              const shallowPopulate = makePopulate(options)

              const { result } = await shallowPopulate(context)
              const expected = Object.values(services.tasks.store).map(x => { return { id: x.id } })
              assert.deepStrictEqual(result.tasks, expected, 'populated all tasks with only `id` attribute')
            })

            it('populates with custom params function', async () => {
              const options = {
                include: {
                  // from: 'posts',
                  service: 'tasks',
                  nameAs: 'tasks',
                  params: function (params, context) {
                    return { query: { userId: this.userId } }
                  }
                }
              }
              const context = {
                app: {
                  service (path) {
                    return services[path]
                  }
                },
                method: 'create',
                type: 'after',
                params: {},
                // Data for a single track
                result: {
                  id: '111',
                  name: 'My Monkey and Me',
                  userId: '11'
                }
              }

              const shallowPopulate = makePopulate(options)

              const { result } = await shallowPopulate(context)
              const expectedTasks = Object.values(services.tasks.store).filter(x => x.userId === '11')
              assert.deepStrictEqual(result.tasks, expectedTasks, 'tasks populated correctly')
            })
          })

          it.skip('handles missing _id on create', async () => {})
        })

        describe('After/Single - Multiple Relationship:', () => {
          it('as object', async () => {
            const options = {
              include: [
                {
                  // from: 'users',
                  service: 'tags',
                  nameAs: 'tags',
                  keyHere: 'tagIds',
                  keyThere: 'id'
                },
                {
                  // from: 'users',
                  service: 'posts',
                  nameAs: 'post',
                  keyHere: 'postIds',
                  keyThere: 'id',
                  asArray: false
                }
              ]
            }
            const context = {
              app: {
                service (path) {
                  return services[path]
                }
              },
              method: 'create',
              type: 'after',
              params: {},
              result: {
                data: {
                  id: '11',
                  name: 'Dumb Stuff',
                  postIds: '111',
                  tagIds: ['1111']
                }
              }
            }

            const shallowPopulate = makePopulate(options)

            const { result } = await shallowPopulate(context)
            const { data } = result
            assert(data.post, 'post should have been populated')
            assert(!Array.isArray(data.post), 'post should not be an array')
            assert(data.post.id === '111', 'post has correct id')
            assert(Array.isArray(data.tags), 'tags is an array')
          })

          it('as object when array', async () => {
            const options = {
              include: [
                {
                  // from: 'users',
                  service: 'tags',
                  nameAs: 'tags',
                  keyHere: 'tagIds',
                  keyThere: 'id'
                },
                {
                  // from: 'users',
                  service: 'posts',
                  nameAs: 'post',
                  keyHere: 'postIds',
                  keyThere: 'id',
                  asArray: false
                }
              ]
            }
            const context = {
              app: {
                service (path) {
                  return services[path]
                }
              },
              method: 'create',
              type: 'after',
              params: {},
              result: {
                data: {
                  id: '11',
                  name: 'Dumb Stuff',
                  postIds: ['111', '222'],
                  tagIds: ['1111', '3333']
                }
              }
            }

            const shallowPopulate = makePopulate(options)

            const { result } = await shallowPopulate(context)
            assert(result.data.post, 'post should have been populated')
            assert(!Array.isArray(result.data.post), 'post should not be an array')
            assert(result.data.post.id === '111', 'post has correct id')
            assert(Array.isArray(result.data.tags), 'tags is an array')
          })

          it('does nothing if some populate data on item does not exist', async () => {
            const options = {
              include: [
                {
                  service: 'posts',
                  nameAs: 'posts',
                  keyHere: 'postsId',
                  keyThere: 'id'
                },
                {
                  service: 'tags',
                  nameAs: 'tags',
                  keyHere: 'tagIds',
                  keyThere: 'id'
                }
              ]
            }
            const context = {
              app: {
                service (path) {
                  return services[path]
                }
              },
              method: 'create',
              type: 'before',
              params: {},
              data: {
                id: '22',
                name: 'Smart Stuff',
                tagIds: ['1111', '3333']
              }
            }

            const shallowPopulate = makePopulate(options)

            const { data } = await shallowPopulate(context)
            assert(data.tags.length === 2, 'tags have been populated')
            assert(!data.posts, 'posts have not been populated')
          })

          it('populates from local keys dot notation', async () => {
            const options = {
              include: [
                {
                  service: 'posts',
                  nameAs: 'meta.posts',
                  keyHere: 'meta.postsId',
                  keyThere: 'id'
                },
                {
                  service: 'tags',
                  nameAs: 'meta.tags',
                  keyHere: 'meta.tagIds',
                  keyThere: 'id'
                }
              ]
            }
            const context = {
              app: {
                service (path) {
                  return services[path]
                }
              },
              method: 'create',
              type: 'after',
              params: {},
              result: {
                id: '11',
                name: 'Dumb Stuff',
                meta: {
                  postsId: ['111', '222', '333'],
                  tagIds: ['1111', '3333']
                }
              }
            }

            const shallowPopulate = makePopulate(options)

            const { result } = await shallowPopulate(context)
            assert(result.meta.posts.length === 3, 'posts should have been populated')
            assert(result.meta.tags.length === 2, 'tags should have been populated')
          })

          it('populates from local keys', async () => {
            const options = {
              include: [
                {
                  // from: 'users',
                  service: 'posts',
                  nameAs: 'posts',
                  keyHere: 'postsId',
                  keyThere: 'id'
                },
                {
                  // from: 'users',
                  service: 'tags',
                  nameAs: 'tags',
                  keyHere: 'tagIds',
                  keyThere: 'id'
                }
              ]
            }
            const context = {
              app: {
                service (path) {
                  return services[path]
                }
              },
              method: 'create',
              type: 'after',
              params: {},
              result: {
                id: '11',
                name: 'Dumb Stuff',
                postsId: ['111', '222', '333'],
                tagIds: ['1111', '3333']
              }
            }

            const shallowPopulate = makePopulate(options)

            const { result } = await shallowPopulate(context)
            assert(result.posts.length, 'posts should have been populated')
          })

          it('populates from foreign keys', async () => {
            const options = {
              include: [
                {
                  service: 'users',
                  nameAs: 'users',
                  keyHere: 'id',
                  keyThere: 'postsId'
                },
                {
                  service: 'comments',
                  nameAs: 'comments',
                  keyHere: 'id',
                  keyThere: 'postsId'
                }
              ]
            }
            const context = {
              app: {
                service (path) {
                  return services[path]
                }
              },
              method: 'create',
              type: 'after',
              params: {},
              result: {
                id: '333',
                name: 'If I were a banana...'
              }
            }

            const shallowPopulate = makePopulate(options)

            const { result } = await shallowPopulate(context)
            assert(result.users.length === 1, 'result should have correct users data')
            assert(result.comments.length === 2, 'result should have correct comments data')
          })

          describe('requestPerItem: true', () => {
            it('populates with custom params $select works', async () => {
              const options = {
                include: [
                  {
                  // from: 'posts',
                    service: 'tasks',
                    nameAs: 'tasks',
                    params: (params, context) => { return { query: { $select: ['id'] } } }
                  },
                  {
                  // from: 'posts',
                    service: 'comments',
                    nameAs: 'comments',
                    params: (params, context) => { return { query: { $select: ['id'] } } }
                  }
                ]
              }
              const context = {
                app: {
                  service (path) {
                    return services[path]
                  }
                },
                method: 'create',
                type: 'after',
                params: {},
                // Data for a single track
                result: {
                  id: '111',
                  name: 'My Monkey and Me'
                }
              }

              const shallowPopulate = makePopulate(options)

              const { result } = await shallowPopulate(context)
              const expectedTasks = Object.values(services.tasks.store).map(x => { return { id: x.id } })
              assert.deepStrictEqual(result.tasks, expectedTasks, 'populated all tasks with only `id` attribute')

              const expectedComments = Object.values(services.comments.store).map(x => { return { id: x.id } })
              assert.deepStrictEqual(result.comments, expectedComments, 'populated all tasks with only `id` attribute')
            })

            it('populates with custom params function', async () => {
              const options = {
                include: [
                  {
                  // from: 'posts',
                    service: 'tasks',
                    nameAs: 'tasks',
                    params: function (params, context) {
                      return { query: { userId: this.userId } }
                    }
                  },
                  {
                  // from: 'posts',
                    service: 'comments',
                    nameAs: 'comments',
                    params: function (params, context) {
                      return { query: { userId: this.userId } }
                    }
                  },
                  {
                    // from: 'posts',
                    service: 'tags',
                    nameAs: 'tags',
                    params: function (params, context) {
                      return {
                        query: {
                          userId: this.userId,
                          $select: ['id']
                        }
                      }
                    }
                  },
                  {
                    service: 'orgs',
                    nameAs: 'org',
                    asArray: false,
                    params: async function (params, context) {
                      const user = await context.app.service('users').get(this.userId)
                      return { query: { id: user.orgId } }
                    }
                  },
                  {
                    // from: 'posts',
                    service: 'tags',
                    nameAs: 'tag',
                    asArray: false,
                    params: [
                      function (params, context) {
                        return {
                          query: {
                            userId: this.userId
                          }
                        }
                      },
                      { query: { $select: ['id'] } }
                    ]
                  }
                ]
              }
              const context = {
                app: {
                  service (path) {
                    return services[path]
                  }
                },
                method: 'create',
                type: 'after',
                params: {},
                // Data for a single track
                result: {
                  id: '111',
                  name: 'My Monkey and Me',
                  userId: '11'
                }
              }

              const shallowPopulate = makePopulate(options)

              const { result } = await shallowPopulate(context)
              const expectedTasks = Object.values(services.tasks.store).filter(x => x.userId === result.userId)
              const expectedTags = Object.values(services.tags.store).filter(x => x.userId === result.userId).map(x => { return { id: x.id } })
              const user = Object.values(services.users.store).filter(x => x.id === result.userId)[0]
              const expectedOrg = Object.values(services.orgs.store).filter(x => x.id === user.orgId)[0]
              const expectedTag = expectedTags[0]
              assert.deepStrictEqual(result.tasks, expectedTasks, 'tasks populated correctly')
              assert.deepStrictEqual(result.tags, expectedTags, 'tags populated correctly')
              assert.deepStrictEqual(result.org, expectedOrg, 'populated org correctly')
              assert.deepStrictEqual(result.tag, expectedTag, 'single tag populated correctly')
            })
          })

          it.skip('handles missing _id on create', async () => {})
        })
      })

      describe('After - Multiple Record:', () => {
        describe('After/Multiple - Single Relationship:', () => {
          it('as object', async () => {
            const options = {
              include: {
                // from: 'users',
                service: 'posts',
                nameAs: 'post',
                keyHere: 'postIds',
                keyThere: 'id',
                asArray: false
              }
            }
            const context = {
              app: {
                service (path) {
                  return services[path]
                }
              },
              method: 'create',
              type: 'after',
              params: {},
              result: {
                data: [
                  {
                    id: '11',
                    name: 'Dumb Stuff',
                    postIds: ['111', '222']
                  },
                  {
                    id: '22',
                    name: 'Smart Stuff',
                    postIds: '222'
                  },
                  {
                    id: '33',
                    name: 'Some Stuff',
                    postIds: ['111']
                  }
                ]
              }
            }

            const shallowPopulate = makePopulate(options)

            const { result } = await shallowPopulate(context)

            const { data } = result

            assert(data[0].post, 'post should have been populated')
            assert(!Array.isArray(data[0].post), 'post should not be an array')
            assert(data[0].post.id === '111', 'post has correct id')
            assert(data[1].post, 'post should have been populated')
            assert(!Array.isArray(data[1].post), 'post should not be an array')
            assert(data[1].post.id === '222', 'post has correct id')
          })

          it('as object when array', async () => {
            const options = {
              include: {
                // from: 'users',
                service: 'posts',
                nameAs: 'post',
                keyHere: 'postIds',
                keyThere: 'id',
                asArray: false
              }
            }
            const context = {
              app: {
                service (path) {
                  return services[path]
                }
              },
              method: 'create',
              type: 'after',
              params: {},
              result: {
                data: [
                  {
                    id: '11',
                    name: 'Dumb Stuff',
                    postIds: ['111', '222']
                  },
                  {
                    id: '22',
                    name: 'Smart Stuff',
                    postIds: ['222', '111']
                  }
                ]
              }
            }

            const shallowPopulate = makePopulate(options)

            const { result } = await shallowPopulate(context)
            const { data } = result
            assert(data[0].post, 'post should have been populated')
            assert(!Array.isArray(data[0].post), 'post should not be an array')
            assert(data[0].post.id === '111', 'post has correct id')
            assert(data[1].post, 'post should have been populated')
            assert(!Array.isArray(data[1].post), 'post should not be an array')
            assert(data[1].post.id === '222', 'post has correct id')
          })

          it('does nothing if some populate data on item does not exist', async () => {
            const options = {
              include: {
                // from: 'users',
                service: 'tags',
                nameAs: 'tags',
                keyHere: 'tagIds',
                keyThere: 'id'
              }
            }
            const context = {
              app: {
                service (path) {
                  return services[path]
                }
              },
              method: 'create',
              type: 'before',
              params: {},
              data: [
                {
                  id: '22',
                  name: 'Smart Stuff'
                },
                {
                  id: '11',
                  name: 'Dumb Stuff'
                }
              ]
            }

            const shallowPopulate = makePopulate(options)

            const { data } = await shallowPopulate(context)
            assert(!data[0].tags, 'tags have not been populated')
            assert(!data[1].tags, 'tags have not been populated')
          })

          it('populates from local keys dot notation', async () => {
            const options = {
              include: {
                // from: 'users',
                service: 'posts',
                nameAs: 'meta.posts',
                keyHere: 'meta.postsId',
                keyThere: 'id'
              }
            }
            const context = {
              app: {
                service (path) {
                  return services[path]
                }
              },
              method: 'create',
              type: 'after',
              params: {},
              result: [
                {
                  id: '11',
                  name: 'Dumb Stuff',
                  meta: {
                    postsId: ['111', '222']
                  }
                },
                {
                  id: '22',
                  name: 'Smart Stuff',
                  meta: {
                    postsId: ['333']
                  }
                }
              ]
            }

            const shallowPopulate = makePopulate(options)

            const { result } = await shallowPopulate(context)
            assert(result[0].meta.posts.length === 2, 'result[0] should have correct posts data')
            assert(result[1].meta.posts.length === 1, 'result[1] should have correct posts data')
          })

          it('populates from local keys', async () => {
            const options = {
              include: {
                // from: 'users',
                service: 'posts',
                nameAs: 'posts',
                keyHere: 'postsId',
                keyThere: 'id'
              }
            }
            const context = {
              app: {
                service (path) {
                  return services[path]
                }
              },
              method: 'create',
              type: 'after',
              params: {},
              result: [
                {
                  id: '11',
                  name: 'Dumb Stuff',
                  postsId: ['111', '222']
                },
                {
                  id: '22',
                  name: 'Smart Stuff',
                  postsId: ['333']
                }
              ]
            }

            const shallowPopulate = makePopulate(options)

            const { result } = await shallowPopulate(context)
            assert(result[0].posts.length === 2, 'result[0] should have correct posts data')
            assert(result[1].posts.length === 1, 'result[1] should have correct posts data')
          })

          it('populates from foreign keys', async () => {
            const options = {
              include: {
                // from: 'posts',
                service: 'users',
                nameAs: 'users',
                keyHere: 'id',
                keyThere: 'postsId'
              }
            }
            const context = {
              app: {
                service (path) {
                  return services[path]
                }
              },
              method: 'create',
              type: 'after',
              params: {},
              result: [
                {
                  id: '111',
                  name: 'My Monkey and Me'
                },
                {
                  id: '222',
                  name: 'I forgot why I love you'
                }
              ]
            }

            const shallowPopulate = makePopulate(options)

            const { result } = await shallowPopulate(context)
            result.forEach(item => {
              assert(item.users, 'should have users property')
            })
          })

          describe('requestPerItem: true', () => {
            it('populates with custom params $select works', async () => {
              const posts = [
                {
                  id: '111',
                  name: 'My Monkey and Me'
                },
                {
                  id: '222',
                  name: 'I forgot why I love you'
                },
                {
                  id: 444,
                  name: 'One, two, three, one, two, three, drink'
                }
              ]

              const options = {
                include: {
                  // from: 'posts',
                  service: 'tasks',
                  nameAs: 'tasks',
                  params: (params, context) => { return { query: { $select: ['id'] } } }
                }
              }
              const context = {
                app: {
                  service (path) {
                    return services[path]
                  }
                },
                method: 'create',
                type: 'after',
                params: {},
                // Data for a single track
                result: posts
              }

              const shallowPopulate = makePopulate(options)

              const { result } = await shallowPopulate(context)

              result.forEach(post => {
                const expectedTasks = Object.values(services.tasks.store).map(x => { return { id: x.id } })
                assert.deepStrictEqual(post.tasks, expectedTasks, 'populated all tasks with only `id` attribute')
              })
            })

            it('populates with custom params function', async () => {
              const posts = [
                {
                  id: '111',
                  name: 'My Monkey and Me',
                  userId: '11'
                },
                {
                  id: '222',
                  name: 'I forgot why I love you',
                  userId: '11'
                },
                {
                  id: 444,
                  name: 'One, two, three, one, two, three, drink',
                  userId: 44
                }
              ]

              const options = {
                include: {
                  // from: 'posts',
                  service: 'tasks',
                  nameAs: 'tasks',
                  params: function (params, context) {
                    return { query: { userId: this.userId } }
                  }
                }
              }
              const context = {
                app: {
                  service (path) {
                    return services[path]
                  }
                },
                method: 'create',
                type: 'after',
                params: {},
                // Data for a single track
                result: posts
              }

              const shallowPopulate = makePopulate(options)

              const { result } = await shallowPopulate(context)

              result.forEach(post => {
                const expectedTasks = Object.values(services.tasks.store).filter(x => x.userId === post.userId)
                assert.deepStrictEqual(post.tasks, expectedTasks, 'tasks populated correctly')
              })
            })
          })

          it.skip('handles missing _id on create', async () => {})
        })

        describe('After/Multiple - Multiple Relationship:', () => {
          it('as object', async () => {
            const options = {
              include: [
                {
                  // from: 'users',
                  service: 'tags',
                  nameAs: 'tags',
                  keyHere: 'tagIds',
                  keyThere: 'id'
                },
                {
                  // from: 'users',
                  service: 'posts',
                  nameAs: 'post',
                  keyHere: 'postIds',
                  keyThere: 'id',
                  asArray: false
                }
              ]
            }
            const context = {
              app: {
                service (path) {
                  return services[path]
                }
              },
              method: 'create',
              type: 'after',
              params: {},
              result: {
                data: [
                  {
                    id: '11',
                    name: 'Dumb Stuff',
                    postIds: '111',
                    tagIds: ['1111', '3333']
                  },
                  {
                    id: '22',
                    name: 'Smart Stuff',
                    postIds: '222',
                    tagIds: ['1111']
                  }
                ]
              }
            }

            const shallowPopulate = makePopulate(options)

            const { result } = await shallowPopulate(context)
            const { data } = result
            assert(data[0].post, 'post should have been populated')
            assert(!Array.isArray(data[0].post), 'post should not be an array')
            assert(data[0].post.id === '111', 'post has correct id')
            assert(data[0].tags, 'tags should have been populated')
            assert(Array.isArray(data[0].tags), 'tags should be an array')

            assert(data[1].post, 'post should have been populated')
            assert(!Array.isArray(data[1].post), 'post should not be an array')
            assert(data[1].post.id === '222', 'post has correct id')
            assert(data[1].tags, 'tags should have been populated')
            assert(Array.isArray(data[1].tags), 'tags should be an array')
          })

          it('as object when array', async () => {
            const options = {
              include: [
                {
                  // from: 'users',
                  service: 'tags',
                  nameAs: 'tags',
                  keyHere: 'tagIds',
                  keyThere: 'id'
                },
                {
                  // from: 'users',
                  service: 'posts',
                  nameAs: 'post',
                  keyHere: 'postIds',
                  keyThere: 'id',
                  asArray: false
                }
              ]
            }
            const context = {
              app: {
                service (path) {
                  return services[path]
                }
              },
              method: 'create',
              type: 'after',
              params: {},
              result: {
                data: [
                  {
                    id: '11',
                    name: 'Dumb Stuff',
                    postIds: ['111', '222'],
                    tagIds: ['1111', '3333']
                  },
                  {
                    id: '22',
                    name: 'Smart Stuff',
                    postIds: ['222'],
                    tagIds: ['1111']
                  }
                ]
              }
            }

            const shallowPopulate = makePopulate(options)

            const { result } = await shallowPopulate(context)
            const { data } = result
            assert(data[0].post, 'post should have been populated')
            assert(!Array.isArray(data[0].post), 'post should not be an array')
            assert(data[0].post.id === '111', 'post has correct id')
            assert(data[0].tags, 'tags should have been populated')
            assert(Array.isArray(data[0].tags), 'tags should be an array')

            assert(data[1].post, 'post should have been populated')
            assert(!Array.isArray(data[1].post), 'post should not be an array')
            assert(data[1].post.id === '222', 'post has correct id')
            assert(data[1].tags, 'tags should have been populated')
            assert(Array.isArray(data[1].tags), 'tags should be an array')
          })

          it('does nothing if some populate data on item does not exist', async () => {
            const options = {
              include: [
                {
                  service: 'posts',
                  nameAs: 'posts',
                  keyHere: 'postsId',
                  keyThere: 'id'
                },
                {
                  service: 'tags',
                  nameAs: 'tags',
                  keyHere: 'tagIds',
                  keyThere: 'id'
                }
              ]
            }
            const context = {
              app: {
                service (path) {
                  return services[path]
                }
              },
              method: 'create',
              type: 'before',
              params: {},
              data: [
                {
                  id: '22',
                  name: 'Smart Stuff',
                  tagIds: ['1111', '3333']
                },
                {
                  id: '11',
                  name: 'Dumb Stuff',
                  postsId: ['111', '333']
                }
              ]
            }

            const shallowPopulate = makePopulate(options)

            const { data } = await shallowPopulate(context)
            assert(data[0].tags.length === 2, 'tags have been populated')
            assert(!data[0].posts, 'posts have not been populated')
            assert(data[1].posts.length === 2, 'posts have been populated')
            assert(!data[1].tags, 'tags have not been populated')
          })

          it('populates from local keys dot notation', async () => {
            const options = {
              include: [
                {
                  service: 'posts',
                  nameAs: 'meta.posts',
                  keyHere: 'meta.postsId',
                  keyThere: 'id'
                },
                {
                  service: 'tags',
                  nameAs: 'meta.tags',
                  keyHere: 'meta.tagIds',
                  keyThere: 'id'
                }
              ]
            }
            const context = {
              app: {
                service (path) {
                  return services[path]
                }
              },
              method: 'create',
              type: 'after',
              params: {},
              result: {
                data: [
                  {
                    id: '11',
                    name: 'Dumb Stuff',
                    meta: {
                      postsId: ['111', '222', '333'],
                      tagIds: ['1111', '3333']
                    }
                  },
                  {
                    id: '22',
                    name: 'Smart Stuff',
                    meta: {
                      postsId: ['111', '333'],
                      tagIds: ['3333']
                    }
                  }
                ]
              }
            }

            const shallowPopulate = makePopulate(options)

            const { result } = await shallowPopulate(context)
            const { data } = result
            assert(data[0].meta.posts.length === 3, 'result[0] should have correct posts data')
            assert(data[0].meta.tags.length === 2, 'result[0] should have correct tags data')

            assert(data[1].meta.posts.length === 2, 'result[1] should have correct posts data')
            assert(data[1].meta.tags.length === 1, 'result[1] should have correct tags data')
          })

          it('populates from local keys', async () => {
            const options = {
              include: [
                {
                  // from: 'users',
                  service: 'posts',
                  nameAs: 'posts',
                  keyHere: 'postsId',
                  keyThere: 'id'
                },
                {
                  // from: 'users',
                  service: 'tags',
                  nameAs: 'tags',
                  keyHere: 'tagIds',
                  keyThere: 'id'
                }
              ]
            }
            const context = {
              app: {
                service (path) {
                  return services[path]
                }
              },
              method: 'create',
              type: 'after',
              params: {},
              result: {
                data: [
                  {
                    id: '11',
                    name: 'Dumb Stuff',
                    postsId: ['111', '222', '333'],
                    tagIds: ['1111', '3333']
                  },
                  {
                    id: '22',
                    name: 'Smart Stuff',
                    postsId: ['111', '333'],
                    tagIds: ['3333']
                  }
                ]
              }
            }

            const shallowPopulate = makePopulate(options)

            const { result } = await shallowPopulate(context)
            const { data } = result
            assert(data[0].posts.length === 3, 'result[0] should have correct posts data')
            assert(data[0].tags.length === 2, 'result[0] should have correct tags data')

            assert(data[1].posts.length === 2, 'result[1] should have correct posts data')
            assert(data[1].tags.length === 1, 'result[1] should have correct tags data')
          })

          it('populates from foreign keys', async () => {
            const options = {
              include: [
                {
                  service: 'users',
                  nameAs: 'users',
                  keyHere: 'id',
                  keyThere: 'postsId'
                },
                {
                  service: 'comments',
                  nameAs: 'comments',
                  keyHere: 'id',
                  keyThere: 'postsId'
                }
              ]
            }
            const context = {
              app: {
                service (path) {
                  return services[path]
                }
              },
              method: 'create',
              type: 'after',
              params: {},
              result: [
                {
                  id: '333',
                  name: 'If I were a banana...'
                },
                {
                  id: '111',
                  name: 'My Monkey and Me'
                },
                {
                  id: 444,
                  name: 'One, two, three, one, two, three, drink'
                }
              ]
            }

            const shallowPopulate = makePopulate(options)

            const { result } = await shallowPopulate(context)
            assert(result[0].users.length === 1, 'result[0] should have correct users data')
            assert(result[0].comments.length === 2, 'result[0] should have correct comments data')

            assert(result[1].users.length === 2, 'result[1] should have correct users data')
            assert(result[1].comments.length === 2, 'result[1] should have correct comments data')
          })

          it('populates from nested foreign keys', async () => {
            const options = {
              include: [
                {
                  service: 'tasks',
                  nameAs: 'tasks',
                  keyHere: 'id',
                  keyThere: 'taskSet.taskSetId'
                }
              ]
            }
            const context = {
              app: {
                service (path) {
                  return services[path]
                }
              },
              method: 'create',
              type: 'after',
              params: {},
              result: [
                { id: 'ts1', name: 'Task Set 1' },
                { id: 'ts2', name: 'Task Set 2' },
                { id: 'ts3', name: 'Task Set 3' },
                { id: 4, name: 'Task Set 4' }
              ]
            }

            const shallowPopulate = makePopulate(options)

            const { result } = await shallowPopulate(context)
            assert(result[0].tasks.length === 1, 'result[0] should have correct users data')
            assert(result[1].tasks.length === 2, 'result[1] should have correct comments data')
            assert(result[2].tasks.length === 3, 'result[2] should have correct comments data')
            assert(result[3].tasks.length === 1, 'result[3] should have correct comments data')
          })

          it('populates from nested keyHere', async () => {
            const options = {
              include: [
                {
                  service: 'taskSets',
                  nameAs: 'taskSetData',
                  keyHere: 'taskSet.taskSetId',
                  keyThere: 'id',
                  asArray: false
                }
              ]
            }
            const context = {
              app: {
                service (path) {
                  return services[path]
                }
              },
              method: 'create',
              type: 'after',
              params: {},
              result: [
                { id: 'task1', name: 'Task 1 - belongs with TaskSet1', taskSet: { taskSetId: 'ts1' } },
                { id: 'task2', name: 'Task 2 - belongs with TaskSet2', taskSet: { taskSetId: 'ts2' } },
                { id: 'task3', name: 'Task 3 - belongs with TaskSet2', taskSet: { taskSetId: 'ts2' } },
                { id: 'task4', name: 'Task 4 - belongs with TaskSet3', taskSet: { taskSetId: 'ts3' } },
                { id: 'task5', name: 'Task 5 - belongs with TaskSet3', taskSet: { taskSetId: 'ts3' } },
                { id: 'task6', name: 'Task 6 - belongs with TaskSet3', taskSet: { taskSetId: 'ts3' } },
                { id: 7, name: 'Task 7 - belongs with TaskSet4', taskSet: { taskSetId: 4 } }
              ]
            }

            const shallowPopulate = makePopulate(options)

            const { result } = await shallowPopulate(context)
            result.forEach(r => {
              assert.strictEqual(r.taskSet.taskSetId, r.taskSetData.id, 'got correct record')
            })
          })

          it('populates from nested array', async () => {
            const options = {
              include: [
                {
                  service: 'environments',
                  nameAs: 'envs',
                  keyHere: 'id',
                  keyThere: 'orgs.orgId',
                  asArray: true
                }
              ]
            }
            const context = {
              app: {
                service (path) {
                  return services[path]
                }
              },
              method: 'create',
              type: 'after',
              params: {},
              result: [
                { id: 'org1', name: 'Southern Utah', memberCount: 21 },
                { id: 'org2', name: 'Northern Utah', memberCount: 99 },
                { id: 3, name: 'Northern Arizona', memberCount: 42 }
              ]
            }

            const shallowPopulate = makePopulate(options)

            const { result } = await shallowPopulate(context)
            result.forEach(r => {
              if (r.id === 'org1') {
                assert(r.envs.length === 3, 'org1 should have two environments')
                assert(r.envs[0].orgs[0].orgId === 'org1', 'should have at least one environment populated')
              } else if (r.id === 'org2') {
                assert(r.envs.length === 1, 'org2 should have one environment')
              }
            })
          })

          describe('requestPerItem: true', () => {
            it('populates with custom params $select works', async () => {
              const posts = [
                {
                  id: '111',
                  name: 'My Monkey and Me'
                },
                {
                  id: '222',
                  name: 'I forgot why I love you'
                },
                {
                  id: 444,
                  name: 'One, two, three, one, two, three, drink'
                }
              ]

              const options = {
                include: [
                  {
                  // from: 'posts',
                    service: 'tasks',
                    nameAs: 'tasks',
                    params: (params, context) => { return { query: { $select: ['id'] } } }
                  },
                  {
                  // from: 'posts',
                    service: 'comments',
                    nameAs: 'comments',
                    params: (params, context) => { return { query: { $select: ['id'] } } }
                  }
                ]
              }
              const context = {
                app: {
                  service (path) {
                    return services[path]
                  }
                },
                method: 'create',
                type: 'after',
                params: {},
                // Data for a single track
                result: posts
              }

              const shallowPopulate = makePopulate(options)

              const { result } = await shallowPopulate(context)

              result.forEach(post => {
                const expectedTasks = Object.values(services.tasks.store).map(x => { return { id: x.id } })
                assert.deepStrictEqual(post.tasks, expectedTasks, 'populated all tasks with only `id` attribute')

                const expectedComments = Object.values(services.comments.store).map(x => { return { id: x.id } })
                assert.deepStrictEqual(post.comments, expectedComments, 'populated all tasks with only `id` attribute')
              })
            })

            it('populates with custom params function', async () => {
              const posts = [
                {
                  id: '111',
                  name: 'My Monkey and Me',
                  userId: '11'
                },
                {
                  id: '222',
                  name: 'I forgot why I love you',
                  userId: '11'
                },
                {
                  id: 444,
                  name: 'One, two, three, one, two, three, drink',
                  userId: 44
                }
              ]

              const options = {
                include: [
                  {
                    // from: 'posts',
                    service: 'tasks',
                    nameAs: 'tasks',
                    params: function (params, context) {
                      return { query: { userId: this.userId } }
                    }
                  },
                  {
                    // from: 'posts',
                    service: 'tags',
                    nameAs: 'tags',
                    params: function (params, context) {
                      return {
                        query: {
                          userId: this.userId,
                          $select: ['id']
                        }
                      }
                    }
                  },
                  {
                    service: 'orgs',
                    nameAs: 'org',
                    asArray: false,
                    params: async function (params, context) {
                      const user = await context.app.service('users').get(this.userId)
                      return { query: { id: user.orgId } }
                    }
                  },
                  {
                    // from: 'posts',
                    service: 'tags',
                    nameAs: 'tag',
                    asArray: false,
                    params: [
                      function (params, context) {
                        return {
                          query: {
                            userId: this.userId
                          }
                        }
                      },
                      { query: { $select: ['id'] } }
                    ]
                  }
                ]
              }
              const context = {
                app: {
                  service (path) {
                    return services[path]
                  }
                },
                method: 'create',
                type: 'after',
                params: {},
                // Data for a single track
                result: posts
              }

              const shallowPopulate = makePopulate(options)

              const { result } = await shallowPopulate(context)

              result.forEach(post => {
                const expectedTasks = Object.values(services.tasks.store).filter(x => x.userId === post.userId)
                const expectedTags = Object.values(services.tags.store).filter(x => x.userId === post.userId).map(x => { return { id: x.id } })
                const user = Object.values(services.users.store).filter(x => x.id === post.userId)[0]
                const expectedOrg = Object.values(services.orgs.store).filter(x => x.id === user.orgId)[0]
                const expectedTag = expectedTags[0]
                assert.deepStrictEqual(post.tasks, expectedTasks, 'tasks populated correctly')
                assert.deepStrictEqual(post.tags, expectedTags, 'tags populated correctly')
                assert.deepStrictEqual(post.org, expectedOrg, 'populated org correctly')
                assert.deepStrictEqual(post.tag, expectedTag, 'single tag populated correctly')
              })
            })
          })

          it.skip('handles missing _id on create', async () => {})
        })
      })
    })
  })
})
