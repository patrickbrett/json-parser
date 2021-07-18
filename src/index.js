const { read, write, inspect } = require("./util");
const parseJson = require("./jsonParser");

const exampleJson = read("example3.json");
const parsed = parseJson(exampleJson);
inspect(parsed);
write("out.json", parsed);
