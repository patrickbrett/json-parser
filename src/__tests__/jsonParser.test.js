const { expect } = require('@jest/globals');
const jsonParser = require('../jsonParser');
const { read } = require('../util');

test('correctly parses single key value pair', () => {
  const jsonString = read('./data/single-kv.json');
  const parsed = jsonParser(jsonString);
  expect(parsed).toEqual(JSON.parse(jsonString));
})

test('correctly parses multiple key value pairs', () => {
  const jsonString = read('./data/multi-kv.json');
  const parsed = jsonParser(jsonString);
  expect(parsed).toEqual(JSON.parse(jsonString));
})

test('correctly parses nested key value pairs', () => {
  const jsonString = read('./data/nested-kv.json');
  const parsed = jsonParser(jsonString);
  expect(parsed).toEqual(JSON.parse(jsonString));
})

test('correctly parses key value pairs with array', () => {
  const jsonString = read('./data/kv-with-array.json');
  const parsed = jsonParser(jsonString);
  expect(parsed).toEqual(JSON.parse(jsonString));
})

test('correctly parses escaped values', () => {
  const jsonString = read('./data/escaped.json');
  const parsed = jsonParser(jsonString);
  expect(parsed).toEqual(JSON.parse(jsonString));
})

test('correctly parses complex json [1]', () => {
  const jsonString = read('./data/complex1.json');
  const parsed = jsonParser(jsonString);
  expect(parsed).toEqual(JSON.parse(jsonString));
})
