# JSON Parser

Pure JavaScript JSON parser - built to learn how ASTs (Abstract Syntax Trees) work

## About

I was watching [this video](https://www.youtube.com/watch?v=N9RUqGYuGfw) where YouTuber Tsoding builds a JSON parser from scratch in Haskell. I realised I didn't really have a clue how to do this in any language, even one I am very familiar with like JavaScript.

After a few hours sketching ideas in my notebook and playing around with abstract syntax trees, I had something I was happy with. It's not particularly optimised for speed and it hasn't been tested on every edge case in the book, but it works reasonably well and comes in at under 200 lines of code (excluding comments).

The code is designed to be as modular as possible and while mutation is used in some places, data pipelines and functional style are emphasised. The code is thoroughly commented and may be useful as a learning resource.

## Supported features

- { "key": "value pairs" }
- ["arrays"]
- { "nested": { "objects": ["and", "arrays"]}}
- { "escaped": "\"values\"" }
- { "values": "that", "are": null }

## How to use

### Using the module

This module is currently not on NPM, so you will need to clone it locally. You can then import like so:

```
const jsonParser = require('./index'); // replace with appropriate path to index of the module

const parsed = jsonParser('{ "test": "value" }');

console.log(parsed);
```

See `src/example.js` for a more elaborate example that reads a file, parses the output and writes back to another file.

### Running tests

`npm test`

## Areas for improvement

The parser currently assumes all files passed to it are valid JSON, and therefore exhibits undefined behaviour if it is passed invalid input.
