const fs = require("fs");
const util = require("util");
const path = require("path");

const relative = (fname) => path.join(__dirname, fname);

const last = (arr) => (arr.length > 0 ? arr[arr.length - 1] : null);

const inspect = (...objs) =>
  console.log(...objs.map((obj) => util.inspect(obj, true, null)));

const read = (fname) => fs.readFileSync(relative(fname)).toString();

const write = (fname, data) =>
  fs.writeFileSync(relative(fname), JSON.stringify(data));

const pipe = (init, funcs) => {
  let out = init;
  funcs.forEach((func) => {
    out = func(out);
  });
  return out;
};

const replaceAll = (from, to) => (str) =>
  str.replace(new RegExp(from, "g"), to);

const objMap = (obj, mapFunc) => {
  const newObj = {};
  Object.keys(obj).forEach((key) => {
    const val = obj[key];
    newObj[key] = mapFunc(val);
  });
  return newObj;
}

module.exports = { last, inspect, read, write, pipe, replaceAll, objMap };
