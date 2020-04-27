const parse = require("csv-parse/lib/sync");
const assert = require("assert");
const fs = require("fs");

function getCsv(filename) {
  const input = fs.readFileSync(filename, { encoding: "utf8" });
  const records = parse(input, {
    columns: true,
    skip_empty_lines: true
  });
  return records;
}
module.exports = getCsv;