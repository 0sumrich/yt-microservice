const createCsvWriter = require("csv-writer").createObjectCsvWriter;

module.exports = async function writeCsv(records, fn) {
  const headers = []
  Object.keys(records[0]).forEach(key => {
    headers.push({id: key, title: key})
  })
  const csvWriter = createCsvWriter({
    path: fn,
    header: headers
  });
  await csvWriter.writeRecords(records).then(() => console.log("..done"));
};
