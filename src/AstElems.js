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

module.exports = {
  Obj,
  Arr,
  Val
}
