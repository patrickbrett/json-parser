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

module.exports = {
  Obj,
  Arr,
};
