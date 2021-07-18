const { last, inspect, read, write, pipe } = require('./util');

class Base {
	constructor() {
		this.pointer = null;
	}
}

class Obj {
	constructor() {
		this.edges = {};
		this.pendingKey = null;
	}
}

class Arr {
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

	let tree;

	const closerTypes = {
		'}': Obj,
		']': Arr
	}

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
				tree = astElem;
			}
			stack.push(astElem);
		} else if (['}', ']'].includes(elem)) {
			if (stack.length > 0 && last(stack) instanceof closerTypes[elem]) {
				const toAdd = stack.pop();

				// TODO: reduce repetition
				if (stack.length > 0) {
					const lastElem = last(stack);
					if (lastElem instanceof Obj) {
						if (lastElem.pendingKey) {
							lastElem.edges[lastElem.pendingKey] = toAdd;
							lastElem.pendingKey = null;
						}
					} else if (lastElem instanceof Arr) {
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
				const lastElem = last(stack);
				if (lastElem instanceof Obj) {
					if (lastElem.pendingKey) {
						lastElem.edges[lastElem.pendingKey] = new Val(parsedVal);
						lastElem.pendingKey = null;
					} else {
						lastElem.pendingKey = strippedElem;
					}
				} else if (lastElem instanceof Arr) {
					lastElem.edges.push(new Val(parsedVal));
				}
			}
		}
	}

	inspect(tree);
	return tree;
};

const parseAst = (value) => {
  if (value instanceof Val) {
    return value.val;
  } else if (value instanceof Obj) {
    const obj = {};
    Object.keys(value.edges).forEach(key => {
      obj[key] = parseAst(value.edges[key]);
    })
    return obj;
  } else if (value instanceof Arr) {
    return value.edges.map(parseAst);
  }
};

const parseJson = jsonString => pipe(jsonString, [generateAstArray, generateAst, parseAst]);

const run = () => {
	const exampleJson = read('example.json');
	const parsed = parseJson(exampleJson);
	inspect(parsed);
	write('out.json', parsed);
}

run();
