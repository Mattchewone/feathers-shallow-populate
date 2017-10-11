# feathers-shallow-populate

[![Build Status](https://travis-ci.org/Mattchewone/feathers-shallow-populate.png?branch=master)](https://travis-ci.org/Mattchewone/feathers-shallow-populate)
<!-- [![Dependency Status](https://img.shields.io/david/feathers-plus/feathers-mocha-utils.svg?style=flat-square)](https://david-dm.org/feathers-plus/feathers-mocha-utils)
[![Download Status](https://img.shields.io/npm/dm/feathers-mocha-utils.svg?style=flat-square)](https://www.npmjs.com/package/feathers-mocha-utils) -->

> Feathers Shallow Populate

## Installation

```
npm install feathers-shallow-populate --save
```

## Complete Example

Here's an example of using `feathers-shallow-populate`.

```js
const { shallowPopulate } = require('feathers-shallow-populate')

const options = {
  include: {
    service: 'tags',
    nameAs: 'tags',
    keyHere: 'tagIds',
    keyThere: '_id'
  }
}

app.service('posts').hooks({
  after: {
    all: shallowPopulate(options)
  }
});
```

## Multiple Populates
```js
const { shallowPopulate } = require('feathers-shallow-populate')

const options = {
  include: [
    {
      service: 'tags',
      nameAs: 'tags',
      keyHere: 'tagIds',
      keyThere: '_id'
    },
    {
      service: 'comments',
      nameAs: 'comments',
      keyHere: 'commentIds',
      keyThere: '_id'
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
    asArray: false
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

Copyright (c) 2017

Licensed under the [MIT license](LICENSE).
