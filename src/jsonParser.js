const fs = require('fs');
const util = require('util');

const inspect = (obj) => console.log(util.inspect(obj, true, null));

const exampleJson = fs.readFileSync('example3.json').toString();

class Base {
	constructor() {
		this.pointer = null;
	}
}

class Obj {
	closer = '}';

	constructor() {
		this.edges = {};
		this.pendingKey = null;
	}
}

class Arr {
	closer = ']';

	constructor() {
		this.edges = [];
	}
}

class Val {
	constructor(val) {
		this.val = val;
	}
}

const generateAstArray = (jsonString) => {
	// TODO: don't remove whitespace within strings
	const noWhitespace = jsonString.replace(new RegExp('[\n ]', 'g'), '');
	console.log(noWhitespace);
	const astArray = [];

	let current = [];
	for (let i = 0; i < noWhitespace.length; i++) {
		const char = noWhitespace[i];
		if (['{', '}', ':', '[', ']', ','].includes(char)) {
			if (current.length) {
				astArray.push(current.join(''));
				current = [];
			}
			astArray.push(char);
		} else {
			current.push(char);
		}
	}

	return astArray;
};

const generateAst = (astArray) => {
	const stack = [];

	const tree = new Base();

	for (elem of astArray) {
		if (['{', '['].includes(elem)) {
			const astElem = (() => {
				if (elem === '{') {
					return new Obj();
				} else if (elem === '[') {
					return new Arr();
				}
			})();
			if (!stack.length) {
				tree.pointer = astElem;
			}
			stack.push(astElem);
		} else if (['}', ']'].includes(elem)) {
			if (stack.length > 0 && stack[stack.length - 1].closer === elem) {
				const toAdd = stack.pop();

				// TODO: reduce repetition
				if (stack.length > 0) {
					const lastElem = stack[stack.length - 1];
					if (lastElem.closer === '}') {
						if (lastElem.pendingKey) {
							lastElem.edges[lastElem.pendingKey] = toAdd;
							lastElem.pendingKey = null;
						}
					} else if (lastElem.closer === ']') {
						lastElem.edges.push(toAdd);
					}
				}
			}
		} else {
			if ([':', ','].includes(elem)) {
				continue;
			}

			const strippedElem = elem.replace(new RegExp('"', 'g'), '');
			const parsedVal = Number.isNaN(Number(strippedElem)) ? strippedElem : Number(strippedElem);

			if (stack.length > 0) {
				const lastElem = stack[stack.length - 1];
				if (lastElem.closer === '}') {
					if (lastElem.pendingKey) {
						lastElem.edges[lastElem.pendingKey] = new Val(parsedVal);
						lastElem.pendingKey = null;
					} else {
						lastElem.pendingKey = strippedElem;
					}
				} else if (lastElem.closer === ']') {
					lastElem.edges.push(new Val(parsedVal));
				}
			}
		}
	}

	inspect(tree);
	return tree;
};

const parseAstHelper = (value) => {
  if (value instanceof Val) {
    return value.val;
  } else if (value instanceof Obj) {
    const obj = {};
    Object.keys(value.edges).forEach(key => {
      obj[key] = parseAstHelper(value.edges[key]);
    })
    return obj;
  } else if (value instanceof Arr) {
    return value.edges.map(parseAstHelper);
  }
};

const parseAst = (ast) => {
  return parseAstHelper(ast.pointer);
};

const parsed = parseAst(generateAst(generateAstArray(exampleJson)));

inspect(parsed);

fs.writeFileSync('out.json', JSON.stringify(parsed));
