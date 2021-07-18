const { last, pipe, replaceAll, objMap } = require("./util");

const { Obj, Arr } = require("./AstElems");
const { nargs } = require("yargs");

const openerTypes = {
  "{": Obj,
  "[": Arr,
};
const closerTypes = {
  "}": Obj,
  "]": Arr,
};
const excludedChars = [":", ","];
const specialChars = ["{", "}", "[", "]", ",", ":", "\\"];

const Strings = {
  ESCAPE: "\\",
  DOUBLE_ESCAPE: "\\\\",
  QUOTE: '"',
  SPACE: " ",
  EMPTY: "",
  NEWLINE: "\n",
  NULL: "null",
};

/**
 * Generates an array containing all relevant tokens in the JSON
 * @param {*} jsonString original stringified JSON to parse
 * @returns array of tokens
 * 
 * Example input:
  {
    "key": "value",
    "another": null,
    "nested": {
      "something": null,
      "finally": 2
    },
    "array": [4, 5, "6, 7, 8", null, 21]
  }
  
 * Example output:
  [
    '{',           '"key"',     ':',
    '"value"',     ',',         '"another"',
    ':',           'null',      ',',
    '"nested"',    ':',         '{',
    '"something"', ':',         'null',
    ',',           '"finally"', ':',
    '2',           '}',         ',',
    '"array"',     ':',         '[',
    '4',           ',',         '5',
    ',',           '"6, 7, 8"', ',',
    'null',        ',',         '21',
    ']',           '}'
  ]
 */
const generateAstArray = (jsonString) => {
  const noNewlines = replaceAll("\n", "")(jsonString);
  const astArray = [];

  let isInsideQuotes = false;
  let currentToken = [];

  const chars = noNewlines.split(Strings.EMPTY);

  chars.forEach((char, i) => {
    const prevChar = i > 0 ? noNewlines[i - 1] : null;

    if (char === Strings.QUOTE && prevChar !== Strings.ESCAPE) {
      isInsideQuotes = !isInsideQuotes;
    }

    if (specialChars.includes(char) && !isInsideQuotes) {
      if (currentToken.length) {
        astArray.push(currentToken.join(Strings.EMPTY));
        currentToken = [];
      }
      astArray.push(char);
    } else if (isInsideQuotes || char !== Strings.SPACE) {
      currentToken.push(char);
    }
  });

  return astArray;
};

/**
 * Puts an object key or value into the relevant object or array in the AST.
 *
 * @param {*} stack stack showing current nesting level
 * @param {*} toAdd value to add if an object value
 * @param {*} toAddPendingKey value to add if an object key
 * @returns
 */
const putSubvalue = (stack, toAdd, toAddPendingKey) => {
  const lastElem = last(stack);

  if (lastElem instanceof Arr) {
    lastElem.edges.push(toAdd);
  } else if (lastElem instanceof Obj) {
    if (lastElem.pendingKey) {
      lastElem.edges[lastElem.pendingKey] = toAdd;
      lastElem.pendingKey = null;
    } else {
      lastElem.pendingKey = toAddPendingKey;
    }
  }
};

const processElem = (stack) => (elem) => {
  if (excludedChars.includes(elem)) return;

  if (Object.keys(openerTypes).includes(elem)) {
    const astElem = new openerTypes[elem]();
    stack.push(astElem);
    return last(stack);
  }

  if (Object.keys(closerTypes).includes(elem)) {
    if (last(stack) instanceof closerTypes[elem]) {
      putSubvalue(stack, stack.pop());
    }
    return;
  }

  const strippedElem = replaceAll(Strings.QUOTE, Strings.EMPTY)(elem);

  const parsedVal = (() => {
    if (elem === Strings.NULL) return null;
    if (elem.includes(Strings.ESCAPE)) {
      const unquoted = elem.substr(1, elem.length - 2);
      return replaceAll(Strings.DOUBLE_ESCAPE, Strings.EMPTY)(unquoted);
    }

    if (Number.isNaN(Number(strippedElem))) return strippedElem;
    return Number(strippedElem);
  })();

  putSubvalue(stack, parsedVal, strippedElem);
};

const generateAst = (astArray) => {
  const stack = [];

  const tree = astArray.map(processElem(stack))[0];

  return tree;
};

const parseAst = (value) => {
  if (value instanceof Obj) {
    return objMap(value.edges, parseAst);
  } else if (value instanceof Arr) {
    return value.edges.map(parseAst);
  } else {
    return value;
  }
};

const parseJson = (jsonString) =>
  pipe(jsonString, [generateAstArray, generateAst, parseAst]);

module.exports = parseJson;
