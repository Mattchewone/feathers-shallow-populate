const _has = require('lodash/has')
const _isEmpty = require('lodash/isEmpty')
const _isFunction = require('lodash/isFunction')
const _merge = require('lodash/merge')
const _uniqBy = require('lodash/uniqBy')

const requiredIncludeAttrs = [
  'service',
  'nameAs',
  'asArray',
  'params'
]

const isDynamicParams = (params) => {
  if (!params) return false
  if (Array.isArray(params)) {
    return params.some(p => isDynamicParams(p))
  } else {
    return !_isEmpty(params) || _isFunction(params)
  }
}

const shouldCatchOnError = (options, include) => {
  if (include.catchOnError !== undefined) return !!include.catchOnError
  if (options.catchOnError !== undefined) return !!options.catchOnError
  return false
}

const assertIncludes = (includes) => {
  includes.forEach(include => {
    // Create default `asArray` property
    if (!_has(include, 'asArray')) {
      include.asArray = true
    }
    // Create default `params` property
    if (!_has(include, 'params')) {
      include.params = {}
    }
    // Create default `requestPerItem` property
    if (!_has(include, 'requestPerItem')) {
      include.requestPerItem = (!_has(include, 'keyHere') && !_has(include, 'keyThere'))
    }

    const isDynamic = isDynamicParams(include.params)

    const requiredAttrs = (isDynamic)
      ? requiredIncludeAttrs
      : [...requiredIncludeAttrs, 'keyHere', 'keyThere']

    requiredAttrs.forEach(attr => {
      if (!_has(include, attr)) {
        throw new Error('shallowPopulate hook: Every `include` must contain `service`, `nameAs` and (`keyHere` and `keyThere`) or `params` properties')
      }
    })

    // if is dynamicParams and `keyHere` is defined, also `keyThere` must be defined
    if (
      isDynamic &&
      Object.keys(include).filter(key => key === 'keyHere' || key === 'keyThere').length === 1
    ) {
      throw new Error('shallowPopulate hook: Every `include` with attribute `KeyHere` or `keyThere` also needs the other attribute defined')
    }

    if (include.requestPerItem && (_has(include, 'keyHere') || _has(include, 'keyThere'))) {
      throw new Error('shallowPopulate hook: The attributes `keyHere` and `keyThere` are useless when you set `requestPerItem: true`. You should remove these properties')
    }
  })

  const uniqueNameAs = _uniqBy(includes, 'nameAs')
  if (uniqueNameAs.length !== includes.length) {
    throw new Error('shallowPopulate hook: Every `ìnclude` must have a unique `nameAs` property')
  }
}

const chainedParams = async (paramsArr, context, target, options = {}) => {
  if (!paramsArr) return undefined
  if (!Array.isArray(paramsArr)) paramsArr = [paramsArr]
  const { thisKey, skipWhenUndefined } = options

  const resultingParams = {}
  for (let i = 0, n = paramsArr.length; i < n; i++) {
    let params = paramsArr[i]
    if (_isFunction(params)) {
      params = (thisKey == null)
        ? params(resultingParams, context, target)
        : params.call(thisKey, resultingParams, context, target)
      params = await Promise.resolve(params)
    }
    if (!params && skipWhenUndefined) return undefined
    if (params !== resultingParams) _merge(resultingParams, params)
  }

  return resultingParams
}

module.exports = {
  assertIncludes,
  chainedParams,
  shouldCatchOnError
}
