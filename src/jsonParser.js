const { last, pipe } = require("./util");

const { Obj, Arr } = require("./AstElems");

const generateAstArray = (jsonString) => {
  // TODO: don't remove whitespace within strings
  const noWhitespace = jsonString.replace(new RegExp("[\n ]", "g"), "");
  console.log(noWhitespace);
  const astArray = [];

  let current = [];
  for (let i = 0; i < noWhitespace.length; i++) {
    const char = noWhitespace[i];
    if (["{", "}", ":", "[", "]", ","].includes(char)) {
      if (current.length) {
        astArray.push(current.join(""));
        current = [];
      }
      astArray.push(char);
    } else {
      current.push(char);
    }
  }

  return astArray;
};

const putSubvalue = (stack, toAdd, toAddPendingKey) => {
  if (stack.length > 0) {
    const lastElem = last(stack);
    if (lastElem instanceof Obj) {
      if (lastElem.pendingKey) {
        lastElem.edges[lastElem.pendingKey] = toAdd;
        lastElem.pendingKey = null;
      } else {
        lastElem.pendingKey = toAddPendingKey;
      }
    } else if (lastElem instanceof Arr) {
      lastElem.edges.push(toAdd);
    }
  }
};

const processElem =
  (openerTypes, closerTypes, excludedTypes, stack) => (elem) => {
    if (excludedTypes.includes(elem)) return;

    if (Object.keys(openerTypes).includes(elem)) {
      const astElem = new openerTypes[elem]();
      stack.push(astElem);
      if (stack.length === 1) {
        return last(stack);
      }
      return;
    }

    if (Object.keys(closerTypes).includes(elem)) {
      if (stack.length > 0 && last(stack) instanceof closerTypes[elem]) {
        putSubvalue(stack, stack.pop());
      }
      return;
    }

    const strippedElem = elem.replace(new RegExp('"', "g"), "");
    const parsedVal = Number.isNaN(Number(strippedElem))
      ? strippedElem
      : Number(strippedElem);

    putSubvalue(stack, parsedVal, strippedElem);
  };

const generateAst = (astArray) => {
  const stack = [];

  const openerTypes = {
    "{": Obj,
    "[": Arr,
  };
  const closerTypes = {
    "}": Obj,
    "]": Arr,
  };
  const excludedTypes = [":", ","];

  const tree = astArray
    .map(processElem(openerTypes, closerTypes, excludedTypes, stack))
    .find(Boolean);

  return tree;
};

const parseAst = (value) => {
  if (value instanceof Obj) {
    const obj = {};
    Object.keys(value.edges).forEach((key) => {
      obj[key] = parseAst(value.edges[key]);
    });
    return obj;
  } else if (value instanceof Arr) {
    return value.edges.map(parseAst);
  } else {
    return value;
  }
};

const parseJson = (jsonString) =>
  pipe(jsonString, [generateAstArray, generateAst, parseAst]);

module.exports = parseJson;
