const assert = require('assert')
const { shallowPopulate: makePopulate } = require('../lib/index')
const memory = require('feathers-memory')
const sift = require('sift').default

const services = {
  posts: memory({
    store: {
      111: { id: '111', name: 'My Monkey and Me' },
      222: { id: '222', name: 'I forgot why I love you' },
      333: { id: '333', name: 'If I were a banana...' },
      444: { id: 444, name: 'One, two, three, one, two, three, drink' },
      555: { id: 555, name: 'Im gonna live like tomorrow doesnt exist' },
      666: { id: 666, name: 'I feel the love, feel the love' }
    }
  }),
  users: memory({
    store: {
      11: { id: '11', name: 'Joe Bloggs', postsId: ['111'] },
      22: { id: '22', name: 'Jane Bloggs', postsId: '333' },
      33: { id: '33', name: 'John Smith', postsId: ['111', '222'] },
      44: { id: 44, name: 'Muhammad Li', postsId: [444, '555'] }
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
      task1: { id: 'task1', name: 'Task 1 - belongs with TaskSet1', taskSet: { taskSetId: 'ts1' } },
      task2: { id: 'task2', name: 'Task 2 - belongs with TaskSet2', taskSet: { taskSetId: 'ts2' } },
      task3: { id: 'task3', name: 'Task 3 - belongs with TaskSet2', taskSet: { taskSetId: 'ts2' } },
      task4: { id: 'task4', name: 'Task 4 - belongs with TaskSet3', taskSet: { taskSetId: 'ts3' } },
      task5: { id: 'task5', name: 'Task 5 - belongs with TaskSet3', taskSet: { taskSetId: 'ts3' } },
      task6: { id: 'task6', name: 'Task 6 - belongs with TaskSet3', taskSet: { taskSetId: 'ts3' } },
      7: { id: 7, name: 'Task 7 - belongs with TaskSet4', taskSet: { taskSetId: 4 } },
      task8: { id: 'task8', name: 'Task 8 - belongs with TaskSet5', taskSet: { taskSetId: 5 } },
      9: { id: 9, name: 'Task 9 - belongs with TaskSet6', taskSet: { taskSetId: 'ts6' } }
    }
  }),
  comments: memory({
    store: {
      11111: { id: '11111', name: 'The Best Sounds This Summer', postsId: ['222'] },
      22222: { id: '22222', name: 'Chillstation', postsId: ['333'] },
      33333: { id: '33333', name: 'Hard Hitting Bass', postsId: ['111', '222', '333'] },
      44444: { id: 44444, name: 'As long as skies are blue', postsId: ['111', 444, '555'] }
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
      1111: { id: '1111', name: 'Trombones' },
      2222: { id: '2222', name: 'Trumpets' },
      3333: { id: '3333', name: 'Drums' },
      4444: { id: 4444, name: 'Guitars' },
      5555: { id: 5555, name: 'Violins' }
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

describe('shallowPopulate hook', function () {
  it('throws when used without an includes object', function (done) {
    const context = {
      method: 'create',
      type: 'before',
      params: {},
      data: {
        id: '11',
        name: 'Dumb Stuff',
        postsId: ['111', '222', '333', 444, 555, '666']
      }
    }

    try {
      const shallowPopulate = makePopulate()
      shallowPopulate(context)
        .then(done)
        .catch(done)
    } catch (error) {
      assert(error.message === 'shallowPopulate hook: You must provide one or more relationships in the `include` option.', 'threw correct error message')
      done()
    }
  })

  it('throws when an includes array has missing properties', function (done) {
    const options = {
      include: {
        // from: 'users',
        service: 'posts',
        nameAs: 'posts',
        keyHere: 'postsId'
      }
    }

    const context = {
      method: 'create',
      type: 'before',
      params: {},
      data: {
        id: '11',
        name: 'Dumb Stuff',
        postsId: ['111', '222', '333', 444, 555, '666']
      }
    }

    try {
      const shallowPopulate = makePopulate(options)
      shallowPopulate(context)
        .then(done)
        .catch(done)
    } catch (error) {
      assert(error.message === 'shallowPopulate hook: Every `include` must contain `service`, `nameAs`, `keyHere`, and `keyThere` properties', 'error has correct message')
      done()
    }
  })

  it('can pass in custom params for lookup', function (done) {
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

    const context = {
      method: 'create',
      type: 'after',
      app: {
        service () {
          return {
            find (params = {}) {
              assert(params.fromCommentsPopulate === true, 'we have a custom param')
              return []
            }
          }
        }
      },
      params: {},
      result: {
        id: '11',
        name: 'Dumb Stuff',
        meta: {
          postsId: ['111', '222', '333', 444, 555, '666']
        }
      }
    }

    const shallowPopulate = makePopulate(options)

    shallowPopulate(context)
      .then(response => {
        done()
      })
      .catch(done)
  })

  it('does nothing if we have no data', function (done) {
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

    shallowPopulate(context)
      .then(response => {
        const { result } = response
        assert.deepStrictEqual(result.data, context.result.data, 'data should not be touched')
        done()
      })
      .catch(done)
  })

  describe('Before Hook:', function () {
    it('does nothing when data is empty', function (done) {
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

      shallowPopulate(context)
        .then(response => {
          const { data } = response
          assert.deepStrictEqual(data, context.data, 'data should not be touched')
          done()
        })
        .catch(done)
    })

    describe('Single Record:', function () {
      describe('Single Relationship:', function () {
        it('as object', function (done) {
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

          shallowPopulate(context)
            .then(context => {
              const { data } = context
              assert(data.post, 'post should have been populated')
              assert(!Array.isArray(data.post), 'post should not be an array')
              assert(data.post.id === '111', 'post has correct id')
              done()
            })
            .catch(done)
        })

        it('as object when array', function (done) {
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

          shallowPopulate(context)
            .then(context => {
              const { data } = context
              assert(data.post, 'post should have been populated')
              assert(!Array.isArray(data.post), 'post should not be an array')
              assert(data.post.id === '111', 'post has correct id')
              done()
            })
            .catch(done)
        })

        it('does nothing if no populate data on item', function (done) {
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

          shallowPopulate(context)
            .then(context => {
              const { data } = context
              assert(!data.posts, 'posts should have not been populated')
              done()
            })
            .catch(done)
        })

        it('populates from local keys dot notation', function (done) {
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

          shallowPopulate(context)
            .then(context => {
              const { data } = context
              assert(data.meta.posts.length, 'posts should have been populated')
              done()
            })
            .catch(done)
        })

        it('populates from local keys', function (done) {
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

          shallowPopulate(context)
            .then(context => {
              const { data } = context
              assert(data.posts.length, 'posts should have been populated')
              done()
            })
            .catch(done)
        })

        it.skip('populates empty nameAs property if no relatedItems', function (done) {
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

          shallowPopulate(context)
            .then(context => {
              const { data } = context
              assert(data.posts, 'posts should have been populated')
              done()
            })
            .catch(done)
        })

        it('populates from foreign keys', function (done) {
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

          shallowPopulate(context)
            .then(context => {
              const { data } = context
              assert(data.users, 'should have users property')
              done()
            })
            .catch(done)
        })

        it.skip('handles missing _id on create', function (done) {})
      })

      describe('Multiple Relationship:', function () {
        it('as object', function (done) {
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

          shallowPopulate(context)
            .then(context => {
              const { data } = context
              assert(data.post, 'post should have been populated')
              assert(!Array.isArray(data.post), 'post should not be an array')
              assert(data.post.id === '111', 'post has correct id')
              assert(Array.isArray(data.tags), 'tags is an array')
              done()
            })
            .catch(done)
        })

        it('as object when array', function (done) {
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

          shallowPopulate(context)
            .then(context => {
              const { data } = context
              assert(data.post, 'post should have been populated')
              assert(!Array.isArray(data.post), 'post should not be an array')
              assert(data.post.id === '111', 'post has correct id')
              assert(Array.isArray(data.tags), 'tags is an array')
              done()
            })
            .catch(done)
        })

        it('does nothing if some populate data on item does not exist', function (done) {
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

          shallowPopulate(context)
            .then(context => {
              const { data } = context
              assert(!data.posts, 'posts should have not been populated')
              assert(data.tags.length === 3, 'tags have been populated')
              done()
            })
            .catch(done)
        })

        it('populates from local keys dot notation', function (done) {
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

          shallowPopulate(context)
            .then(context => {
              const { data } = context
              assert(data.meta.posts.length, 'posts should have been populated')
              assert(data.meta.tags.length, 'posts should have been populated')
              done()
            })
            .catch(done)
        })

        it('populates from local keys', function (done) {
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

          shallowPopulate(context)
            .then(context => {
              const { data } = context
              assert(data.posts.length, 'posts should have been populated')
              done()
            })
            .catch(done)
        })

        it('populates from foreign keys', function (done) {
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

          shallowPopulate(context)
            .then(context => {
              const { data } = context
              assert(data.users.length === 1, 'data should have correct users data')
              assert(data.comments.length === 2, 'data should have correct comments data')
              done()
            })
            .catch(done)
        })

        it.skip('handles missing _id on create', function (done) {})
      })
    })

    describe('Multiple Record:', function () {
      describe('Single Relationship:', function () {
        it('as object', function (done) {
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

          shallowPopulate(context)
            .then(context => {
              const { data } = context
              assert(data[0].post, 'post should have been populated')
              assert(!Array.isArray(data[0].post), 'post should not be an array')
              assert(data[0].post.id === '111', 'post has correct id')
              assert(data[1].post, 'post should have been populated')
              assert(!Array.isArray(data[1].post), 'post should not be an array')
              assert(data[1].post.id === '222', 'post has correct id')
              done()
            })
            .catch(done)
        })

        it('as object when array', function (done) {
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

          shallowPopulate(context)
            .then(context => {
              const { data } = context
              assert(data[0].post, 'post should have been populated')
              assert(!Array.isArray(data[0].post), 'post should not be an array')
              assert(data[0].post.id === '111', 'post has correct id')
              assert(data[1].post, 'post should have been populated')
              assert(!Array.isArray(data[1].post), 'post should not be an array')
              assert(data[1].post.id === '222', 'post has correct id')
              done()
            })
            .catch(done)
        })

        it('does nothing if some populate data on item does not exist', function (done) {
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

          shallowPopulate(context)
            .then(context => {
              const { data } = context
              assert(data[0].tags.length === 3, 'tags have been populated')
              assert(!data[1].tags, 'tags have not been populated')
              done()
            })
            .catch(done)
        })

        it('populates from local keys dot notation', function (done) {
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

          shallowPopulate(context)
            .then(context => {
              const { data } = context
              assert(data[0].meta.posts.length === 3, 'data[0] posts should have been populated')
              assert(data[1].meta.posts.length === 4, 'data[0] posts should have been populated')
              done()
            })
            .catch(done)
        })

        it('populates from local keys', function (done) {
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

          shallowPopulate(context)
            .then(context => {
              const { data } = context

              assert(data[0].posts.length === 3, 'data[0] should have correct posts data')
              assert(data[1].posts.length === 2, 'data[1] should have correct posts data')

              done()
            })
            .catch(done)
        })

        it('populates from foreign keys', function (done) {
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

          shallowPopulate(context)
            .then(context => {
              const { data } = context
              data.forEach(item => {
                assert(item.users, 'should have users property')
              })
              done()
            })
            .catch(done)
        })

        it.skip('handles missing _id on create', function (done) {})
      })

      describe('Multiple Relationship:', function () {
        it('as object', function (done) {
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

          shallowPopulate(context)
            .then(context => {
              const { data } = context
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
              done()
            })
            .catch(done)
        })

        it('as object when array', function (done) {
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

          shallowPopulate(context)
            .then(context => {
              const { data } = context
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
              done()
            })
            .catch(done)
        })

        it('does nothing if some populate data on item does not exist', function (done) {
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

          shallowPopulate(context)
            .then(context => {
              const { data } = context
              assert(data[0].posts.length === 4, 'posts have been populated')
              assert(!data[0].tags, 'tags have not been populated')
              assert(!data[1].tags, 'tags have not been populated')
              assert(data[1].posts.length === 3, 'posts have been populated')
              done()
            })
            .catch(done)
        })

        it('populates from local keys', function (done) {
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

          shallowPopulate(context)
            .then(context => {
              const { data } = context

              assert(data[0].posts.length === 3, 'data[0] should have correct posts data')
              assert(data[0].tags.length === 2, 'data[0] should have correct tags data')

              assert(data[1].posts.length === 2, 'data[1] should have correct posts data')
              assert(data[1].tags.length === 1, 'data[1] should have correct tags data')

              done()
            })
            .catch(done)
        })

        it('populates from foreign keys', function (done) {
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

          shallowPopulate(context)
            .then(context => {
              const { data } = context

              assert(data[0].users.length === 1, 'data[0] should have correct users data')
              assert(data[0].comments.length === 2, 'data[0] should have correct comments data')

              assert(data[1].users.length === 2, 'data[1] should have correct users data')
              assert(data[1].comments.length === 2, 'data[1] should have correct comments data')

              done()
            })
            .catch(done)
        })

        it.skip('handles missing _id on create', function (done) {})
      })
    })
  })

  describe('After Hook', function () {
    it('does nothing when result is empty', function (done) {
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

      shallowPopulate(context)
        .then(response => {
          const { result } = response
          assert.deepStrictEqual(result.data, context.result.data, 'data should not be touched')
          done()
        })
        .catch(done)
    })

    describe('Single Record:', function () {
      describe('Single Relationship:', function () {
        it('as object', function (done) {
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

          shallowPopulate(context)
            .then(context => {
              const { result } = context
              assert(result.data.post, 'post should have been populated')
              assert(!Array.isArray(result.data.post), 'post should not be an array')
              assert(result.data.post.id === '111', 'post has correct id')
              done()
            })
            .catch(done)
        })

        it('as object when array', function (done) {
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

          shallowPopulate(context)
            .then(context => {
              const { result } = context
              assert(result.data.post, 'post should have been populated')
              assert(!Array.isArray(result.data.post), 'post should not be an array')
              assert(result.data.post.id === '111', 'post has correct id')
              done()
            })
            .catch(done)
        })

        it('does nothing if some populate data on item does not exist', function (done) {
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

          shallowPopulate(context)
            .then(context => {
              const { data } = context
              assert(!data.tags, 'tags have not been populated')
              done()
            })
            .catch(done)
        })

        it('populates from local keys dot notation', function (done) {
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

          shallowPopulate(context)
            .then(context => {
              const { result } = context
              assert(result.meta.posts.length === 3, 'posts should have been populated')
              done()
            })
            .catch(done)
        })

        it('populates from local keys', function (done) {
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

          shallowPopulate(context)
            .then(context => {
              const { result } = context
              assert(result.posts.length, 'posts should have been populated')
              done()
            })
            .catch(done)
        })

        it('populates from foreign keys', function (done) {
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

          shallowPopulate(context)
            .then(context => {
              const { result } = context
              assert(result.users, 'should have users property')
              done()
            })
            .catch(done)
        })

        it.skip('handles missing _id on create', function (done) {})
      })

      describe('Multiple Relationship:', function () {
        it('as object', function (done) {
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

          shallowPopulate(context)
            .then(context => {
              const { result } = context
              assert(result.data.post, 'post should have been populated')
              assert(!Array.isArray(result.data.post), 'post should not be an array')
              assert(result.data.post.id === '111', 'post has correct id')
              assert(Array.isArray(result.data.tags), 'tags is an array')
              done()
            })
            .catch(done)
        })

        it('as object when array', function (done) {
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

          shallowPopulate(context)
            .then(context => {
              const { result } = context
              assert(result.data.post, 'post should have been populated')
              assert(!Array.isArray(result.data.post), 'post should not be an array')
              assert(result.data.post.id === '111', 'post has correct id')
              assert(Array.isArray(result.data.tags), 'tags is an array')
              done()
            })
            .catch(done)
        })

        it('does nothing if some populate data on item does not exist', function (done) {
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

          shallowPopulate(context)
            .then(context => {
              const { data } = context
              assert(data.tags.length === 2, 'tags have been populated')
              assert(!data.posts, 'posts have not been populated')
              done()
            })
            .catch(done)
        })

        it('populates from local keys dot notation', function (done) {
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

          shallowPopulate(context)
            .then(context => {
              const { result } = context
              assert(result.meta.posts.length === 3, 'posts should have been populated')
              assert(result.meta.tags.length === 2, 'tags should have been populated')
              done()
            })
            .catch(done)
        })

        it('populates from local keys', function (done) {
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

          shallowPopulate(context)
            .then(context => {
              const { result } = context
              assert(result.posts.length, 'posts should have been populated')
              done()
            })
            .catch(done)
        })

        it('populates from foreign keys', function (done) {
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

          shallowPopulate(context)
            .then(context => {
              const { result } = context

              assert(result.users.length === 1, 'result should have correct users data')
              assert(result.comments.length === 2, 'result should have correct comments data')

              done()
            })
            .catch(done)
        })

        it.skip('handles missing _id on create', function (done) {})
      })
    })

    describe('Multiple Record:', function () {
      describe('Single Relationship:', function () {
        it('as object', function (done) {
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

          shallowPopulate(context)
            .then(context => {
              const { result } = context
              assert(result.data[0].post, 'post should have been populated')
              assert(!Array.isArray(result.data[0].post), 'post should not be an array')
              assert(result.data[0].post.id === '111', 'post has correct id')
              assert(result.data[1].post, 'post should have been populated')
              assert(!Array.isArray(result.data[1].post), 'post should not be an array')
              assert(result.data[1].post.id === '222', 'post has correct id')
              done()
            })
            .catch(done)
        })

        it('as object when array', function (done) {
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

          shallowPopulate(context)
            .then(context => {
              const { result } = context
              assert(result.data[0].post, 'post should have been populated')
              assert(!Array.isArray(result.data[0].post), 'post should not be an array')
              assert(result.data[0].post.id === '111', 'post has correct id')
              assert(result.data[1].post, 'post should have been populated')
              assert(!Array.isArray(result.data[1].post), 'post should not be an array')
              assert(result.data[1].post.id === '222', 'post has correct id')
              done()
            })
            .catch(done)
        })

        it('does nothing if some populate data on item does not exist', function (done) {
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

          shallowPopulate(context)
            .then(context => {
              const { data } = context
              assert(!data[0].tags, 'tags have not been populated')
              assert(!data[1].tags, 'tags have not been populated')
              done()
            })
            .catch(done)
        })

        it('populates from local keys dot notation', function (done) {
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

          shallowPopulate(context)
            .then(context => {
              const { result } = context

              assert(result[0].meta.posts.length === 2, 'result[0] should have correct posts data')
              assert(result[1].meta.posts.length === 1, 'result[1] should have correct posts data')

              done()
            })
            .catch(done)
        })

        it('populates from local keys', function (done) {
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

          shallowPopulate(context)
            .then(context => {
              const { result } = context

              assert(result[0].posts.length === 2, 'result[0] should have correct posts data')
              assert(result[1].posts.length === 1, 'result[1] should have correct posts data')

              done()
            })
            .catch(done)
        })

        it('populates from foreign keys', function (done) {
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

          shallowPopulate(context)
            .then(context => {
              const { result } = context
              result.forEach(item => {
                assert(item.users, 'should have users property')
              })
              done()
            })
            .catch(done)
        })

        it.skip('handles missing _id on create', function (done) {})
      })

      describe('Multiple Relationship:', function () {
        it('as object', function (done) {
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

          shallowPopulate(context)
            .then(context => {
              const { result } = context
              assert(result.data[0].post, 'post should have been populated')
              assert(!Array.isArray(result.data[0].post), 'post should not be an array')
              assert(result.data[0].post.id === '111', 'post has correct id')
              assert(result.data[0].tags, 'tags should have been populated')
              assert(Array.isArray(result.data[0].tags), 'tags should be an array')

              assert(result.data[1].post, 'post should have been populated')
              assert(!Array.isArray(result.data[1].post), 'post should not be an array')
              assert(result.data[1].post.id === '222', 'post has correct id')
              assert(result.data[1].tags, 'tags should have been populated')
              assert(Array.isArray(result.data[1].tags), 'tags should be an array')
              done()
            })
            .catch(done)
        })

        it('as object when array', function (done) {
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

          shallowPopulate(context)
            .then(context => {
              const { result } = context
              assert(result.data[0].post, 'post should have been populated')
              assert(!Array.isArray(result.data[0].post), 'post should not be an array')
              assert(result.data[0].post.id === '111', 'post has correct id')
              assert(result.data[0].tags, 'tags should have been populated')
              assert(Array.isArray(result.data[0].tags), 'tags should be an array')

              assert(result.data[1].post, 'post should have been populated')
              assert(!Array.isArray(result.data[1].post), 'post should not be an array')
              assert(result.data[1].post.id === '222', 'post has correct id')
              assert(result.data[1].tags, 'tags should have been populated')
              assert(Array.isArray(result.data[1].tags), 'tags should be an array')
              done()
            })
            .catch(done)
        })

        it('does nothing if some populate data on item does not exist', function (done) {
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

          shallowPopulate(context)
            .then(context => {
              const { data } = context
              assert(data[0].tags.length === 2, 'tags have been populated')
              assert(!data[0].posts, 'posts have not been populated')
              assert(data[1].posts.length === 2, 'posts have been populated')
              assert(!data[1].tags, 'tags have not been populated')
              done()
            })
            .catch(done)
        })

        it('populates from local keys dot notation', function (done) {
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

          shallowPopulate(context)
            .then(context => {
              const { result } = context
              const { data } = result

              assert(data[0].meta.posts.length === 3, 'result[0] should have correct posts data')
              assert(data[0].meta.tags.length === 2, 'result[0] should have correct tags data')

              assert(data[1].meta.posts.length === 2, 'result[1] should have correct posts data')
              assert(data[1].meta.tags.length === 1, 'result[1] should have correct tags data')

              done()
            })
            .catch(done)
        })

        it('populates from local keys', function (done) {
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

          shallowPopulate(context)
            .then(context => {
              const { result } = context
              const { data } = result

              assert(data[0].posts.length === 3, 'result[0] should have correct posts data')
              assert(data[0].tags.length === 2, 'result[0] should have correct tags data')

              assert(data[1].posts.length === 2, 'result[1] should have correct posts data')
              assert(data[1].tags.length === 1, 'result[1] should have correct tags data')

              done()
            })
            .catch(done)
        })

        it('populates from foreign keys', function (done) {
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

          shallowPopulate(context)
            .then(context => {
              const { result } = context

              assert(result[0].users.length === 1, 'result[0] should have correct users data')
              assert(result[0].comments.length === 2, 'result[0] should have correct comments data')

              assert(result[1].users.length === 2, 'result[1] should have correct users data')
              assert(result[1].comments.length === 2, 'result[1] should have correct comments data')

              done()
            })
            .catch(done)
        })

        it('populates from nested foreign keys', function (done) {
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

          shallowPopulate(context)
            .then(context => {
              const { result } = context

              assert(result[0].tasks.length === 1, 'result[0] should have correct users data')
              assert(result[1].tasks.length === 2, 'result[1] should have correct comments data')
              assert(result[2].tasks.length === 3, 'result[2] should have correct comments data')
              assert(result[3].tasks.length === 1, 'result[3] should have correct comments data')

              done()
            })
            .catch(done)
        })

        it('populates from nested keyHere', function (done) {
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

          shallowPopulate(context)
            .then(context => {
              const { result } = context

              result.forEach(r => {
                assert.strictEqual(r.taskSet.taskSetId, r.taskSetData.id, 'got correct record')
              })

              done()
            })
            .catch(done)
        })

        it('populates from nested array', function (done) {
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

          shallowPopulate(context)
            .then(context => {
              const { result } = context

              result.forEach(r => {
                if (r.id === 'org1') {
                  assert(r.envs.length === 3, 'org1 should have two environments')
                  assert(r.envs[0].orgs[0].orgId === 'org1', 'should have at least one environment populated')
                } else if (r.id === 'org2') {
                  assert(r.envs.length === 1, 'org2 should have one environment')
                }
              })

              done()
            })
            .catch(done)
        })

        it.skip('handles missing _id on create', function (done) {})
      })
    })
  })
})
