# feathers-shallow-populate

[![Build Status](https://travis-ci.org/Mattchewone/feathers-shallow-populate.png?branch=master)](https://travis-ci.org/Mattchewone/feathers-shallow-populate)
<!-- [![Dependency Status](https://img.shields.io/david/feathers-plus/feathers-mocha-utils.svg?style=flat-square)](https://david-dm.org/feathers-plus/feathers-mocha-utils)
[![Download Status](https://img.shields.io/npm/dm/feathers-mocha-utils.svg?style=flat-square)](https://www.npmjs.com/package/feathers-mocha-utils) -->

> Feathers Shallow Populate

The fastest FeathersJS hook for populating relational data.

## Installation

```
npm install feathers-shallow-populate --save
```

## Complete Example

Here's an example of using `feathers-shallow-populate`.

```js
const { shallowPopulate } = require('feathers-shallow-populate')

const options = {
  include: [
    {
      service: 'tags',
      nameAs: 'tags',
      keyHere: 'tagIds',
      keyThere: '_id',
      asArray: true, // by default
      params: {} // by default
    },
    {
      service: 'tags',
      nameAs: 'tags',
      params: function(params, context) {
        return { 
          query: { 
            userId: this.userId,
            companyId: this.companyId
          } 
        }
      }
    }
  ]
}

app.service('posts').hooks({
  after: {
    all: shallowPopulate(options)
  }
});
```

## Options for the hook
- `include` (**required**) Can be one `include` object or an array of `include` objects. See table below
- `catchOnError` (_optional_) Wether the hook continues populating, if an error occurs (e.g. because of missing authentication) or throws. Also can be set per `include` individually

## Options per include

| **Option**       | **Description** |
|------------------|-----------------|
| `service`        | The service to reference<br><br>**required**<br>**Type:** `String` |
| `nameAs`         | The property to be assigned to on this entry<br><br>**required**<br>**Type:** `String` |
| `keyHere`        | The primary or secondary key for this entry<br><br>**required if `params` is not complex (most of the time)**<br>**Type:** `String` |
| `keyThere`       | The primary or secondary key for the referenced entry/entries<br><br>**required if `keyHere` is defined**<br>**Type:** `String` |
| `asArray`        | Is the referenced item a single entry or an array of entries?<br><br>**optional - default:** `true`<br>**Type:** `Boolean`
| `requestPerItem` | Decided wether your `params` object/function runs against each item individually or bundled. Most of the time you don't need this.<br><br>**optional - default:<br>- `false`** (if `keyHere` and `keyThere` are defined)<br>- **`true`** (if `keyHere` and `keyThere` are not defined)<br>**Type:** `String`
| `catchOnError`   | Wether the hook continues populating, if an error occurs (e.g. because of missing authentication) or throws. Also can be set on the prior options<br><br>**optional - default:** `false`<br>**Type:**: `Boolean` |
| `params`         | Additional params to be passed to the underlying service.<br>You can mutate the passed `params` object or return a newly created `params` object which gets merged deeply <br>Merged deeply after the params are generated internally.<br><quote>**ProTip #1:** You can use this for adding a '$select' property or passing authentication and user data from 'context' to 'params' to restrict accesss</quote><br><quote>**ProTip #2:** If you don't define `keyHere` and `keyThere` or set `requestPerItem` to `true` the function has access to the _`this` keyword_ being the individual item the request will be made for.</quote><br><quote>**ProTip #3**: You can skip a `requestPerItem` if it returns `undefined`.</quote><br><quote>**ProTip #4**: The hook whats for async functions!</quote><br><br>**optional - default:** `{}`<br>**Possible types:**<br>- `Object`: _will be merged with params - simple requests_<br>- `Function(params, context, { path, service }) => params`: _needs to return the `params` or a new one which gets merged deeply - more complex_<br>- `Function(params, context, { path, service }) => Promise<params>`<br>- `[Object | Function]` |

## Multiple Populates
```js
const { shallowPopulate } = require('feathers-shallow-populate')

const options = {
  include: [
    {
      service: 'tags',
      nameAs: 'tags',
      keyHere: 'tagIds',
      keyThere: '_id',
      asArray: true,
      params: {}
    },
    {
      service: 'comments',
      nameAs: 'comments',
      keyHere: 'commentIds',
      keyThere: '_id',
      asArray: true,
      params: {}
    }
  ]
}

app.service('posts').hooks({
  after: {
    all: shallowPopulate(options)
  }
});

// result.data
[
  {
    id: 1,
    title: 'About Timothy',
    tagIds: [1, 2]
    tags: [
      {
        id: 1,
        name: 'tag 1'
      },
      {
        id: 2,
        name: 'tag 2'
      }
    ],
    commentIds: [3, 5],
    comments: [
      {
        id: 3,
        title: 'My first comment'
      },
      {
        id: 5,
        title: 'Another comment'
      }
    ]
  }
]
```

## As Object
```js
const { shallowPopulate } = require('feathers-shallow-populate')

const options = {
  include: {
    service: 'users',
    nameAs: 'publisher',
    keyHere: 'publisherId',
    keyThere: 'id',
    asArray: false,
    params: {}
  }
}

app.service('posts').hooks({
  after: {
    all: shallowPopulate(options)
  }
});

// result.data
[
  {
    id: 1,
    title: 'About Timothy',
    publisherId: 2,
    publisher: {
      id: 2,
      name: 'Timothy'
    }
  }
]
```

This will go through all the hook.data/hook.result and will create a single query to lookup the tags, it will then populate them back onto the data.

## License

Copyright (c) 2020

Licensed under the [MIT license](LICENSE).
