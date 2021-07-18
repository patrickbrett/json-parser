const { read, write, inspect } = require("./util");
const parseJson = require("./jsonParser");

const exampleJson = read("./data/escaped1.json");
const parsed = parseJson(exampleJson);
inspect(parsed);
write("out.json", parsed);
