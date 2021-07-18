const { last, pipe, replaceAll, objMap } = require("./util");

const { Obj, Arr } = require("./AstElems");

const generateAstArray = (jsonString) => {
  const specialChars = ["{", "}", ":", "[", "]", ",", "\\"];

  // TODO: don't remove whitespace within strings
  const noWhitespace = pipe(jsonString, [
    replaceAll("\n", ""),
    // replaceAll(" ", ""),
  ]);
  const astArray = [];

	let insideQuotes = false;

  let current = [];
  for (let i = 0; i < noWhitespace.length; i++) {
    const char = noWhitespace[i];
    const prevChar = i > 0 ? noWhitespace[i-1] : null;

		if (char === '"' && prevChar !== '\\') {
			insideQuotes = !insideQuotes;
		}

    if (specialChars.includes(char) && !insideQuotes) {
      if (current.length) {
        astArray.push(current.join(""));
        current = [];
      }
      astArray.push(char);
    } else if (insideQuotes || char !== ' ') {
			current.push(char);
		}
  }

  return astArray;
};

const putSubvalue = (stack, toAdd, toAddPendingKey) => {
  if (stack.length === 0) return;

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

    const strippedElem = replaceAll('"', "")(elem);
    const parsedVal = (() => {
			if (elem === 'null') return null;
			if (Number.isNaN(Number(strippedElem))) return strippedElem;
			return Number(strippedElem);
		})();

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
