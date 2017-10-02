# feathers-shallow-populate

[![Build Status](https://travis-ci.org/https://github.com/Mattchewone/feathers-shallow-populate.git.png?branch=master)](https://travis-ci.org/https://github.com/Mattchewone/feathers-shallow-populate.git)
[![Code Climate](https://codeclimate.com/github/https://github.com/Mattchewone/feathers-shallow-populate.git/badges/gpa.svg)](https://codeclimate.com/github/https://github.com/Mattchewone/feathers-shallow-populate.git)
[![Test Coverage](https://codeclimate.com/github/https://github.com/Mattchewone/feathers-shallow-populate.git/badges/coverage.svg)](https://codeclimate.com/github/https://github.com/Mattchewone/feathers-shallow-populate.git/coverage)
[![Dependency Status](https://img.shields.io/david/https://github.com/Mattchewone/feathers-shallow-populate.git.svg?style=flat-square)](https://david-dm.org/https://github.com/Mattchewone/feathers-shallow-populate.git)
[![Download Status](https://img.shields.io/npm/dm/feathers-shallow-populate.svg?style=flat-square)](https://www.npmjs.com/package/feathers-shallow-populate)

> Feathers Shallow Populate

## Installation

```
npm install feathers-shallow-populate --save
```

## Documentation

Please refer to the [feathers-shallow-populate documentation](http://docs.feathersjs.com/) for more details.

## Complete Example

Here's an example of using `feathers-shallow-populate`.

```js
const { shallowPopulate } = require('feathers-shallow-populate');

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

This will go through all the hook.data/hook.result and will create a single query to lookup the tags, it will then populate them back onto the data.

## License

Copyright (c) 2017

Licensed under the [MIT license](LICENSE).
