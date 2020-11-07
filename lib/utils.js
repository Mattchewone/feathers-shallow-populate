const _isEmpty = require('lodash/isEmpty')
const _uniqBy = require('lodash/uniqBy')
const _isFunction = require('lodash/isFunction')

const requiredIncludeAttrs = [
  'service',
  'nameAs',
  'asArray',
  'params'
]

const assertIncludes = (includes) => {
  includes.forEach(include => {
    // Create default `asArray` property
    if (!Object.prototype.hasOwnProperty.call(include, 'asArray')) {
      include.asArray = true
    }
    // Create default `params` property
    if (!Object.prototype.hasOwnProperty.call(include, 'params')) {
      include.params = {}
    }

    const isDynamicParams = !_isEmpty(include.params) || _isFunction(include.params)

    const requiredAttrs = (isDynamicParams)
      ? requiredIncludeAttrs
      : [...requiredIncludeAttrs, 'keyHere', 'keyThere']

    requiredAttrs.forEach(attr => {
      if (!Object.prototype.hasOwnProperty.call(include, attr)) {
        throw new Error('shallowPopulate hook: Every `include` must contain `service`, `nameAs` and (`keyHere` and `keyThere`) or `params` properties')
      }
    })

    // if is dynamicParams and `keyHere` is defined, also `keyThere` must be defined
    if (
      isDynamicParams &&
      ((Object.prototype.hasOwnProperty.call(include, 'keyHere') &&
      !Object.prototype.hasOwnProperty.call(include, 'keyThere')) || (
        (!Object.prototype.hasOwnProperty.call(include, 'keyHere') &&
      Object.prototype.hasOwnProperty.call(include, 'keyHere')))
      )
    ) {
      throw new Error('shallowPopulate hook: Every `include` with attribute `KeyHere` or `keyThere` also needs the other attribute defined')
    }
  })

  const uniqueNameAs = _uniqBy(includes, 'nameAs')
  if (uniqueNameAs.length !== includes.length) {
    throw new Error('shallowPopulate hook: Every `ìnclude` must have a unique `nameAs` property')
  }
}

module.exports = {
  assertIncludes
}
