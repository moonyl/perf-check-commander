const fs = require("fs");
const path = require("path");

const createIntegratedData = (filesState, resultDir) => {
  const relativePath = path.relative(__dirname, resultDir);
  //console.log({ relativePath });
  const dataLabels = filesState.map((state) => state.label);
  dataLabels.forEach((label) => {
    const counted = require(`${relativePath}/counted.json`);
    const countedWriter = fs.createWriteStream(
      `${resultDir}/counted-${label}.json`
    );
    let lastCounted = 0;
    const countSeparated = counted.map((item) => {
      if (item[label]) {
        lastCounted = item[label];
        return lastCounted;
      }
      return lastCounted;
    });

    countedWriter.write(JSON.stringify(countSeparated));

    const measured = require(`${relativePath}/measured.json`);
    const measuredWriter = fs.createWriteStream(
      `${resultDir}/measured-${label}.json`
    );
    let lastMeasured = 0;
    const measureSeparated = measured.map((item) => {
      if (item[label]) {
        lastMeasured = item[label];
        return lastMeasured;
      }
      return lastMeasured;
    });

    measuredWriter.write(JSON.stringify(measureSeparated));

    const expected = require(`${relativePath}/expected.json`);
    const expectedWriter = fs.createWriteStream(
      `${resultDir}/expected-${label}.json`
    );
    let lastExpected = 0;
    const expectSeparated = expected.map((item) => {
      if (item[label]) {
        lastExpected = item[label];
        return lastExpected;
      }
      return lastExpected;
    });

    expectedWriter.write(JSON.stringify(expectSeparated));
  });
};

module.exports = createIntegratedData;
