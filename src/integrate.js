const { EventEmitter } = require("events");
const fs = require("fs");
const { sep } = require("path");
const readline = require("readline");

const recordDb = new Map();
const countedDb = new Map();
const expectedDb = new Map();
const measuredDb = new Map();

function processFile(fileState, eventEmitter) {
  const instream = fs.createReadStream(fileState.name);
  const reader = readline.createInterface(instream /*, process.stdout*/);
  const { label } = fileState;
  console.log(label);

  // 한 줄씩 읽어들인 후에 발생하는 이벤트
  reader.on("line", (line) => {
    const parsed = JSON.parse(line);
    const { time, counted, expected, measuredFrameRate } = parsed;

    // 3초 단위
    const key = Math.floor(time / 3000);
    if (countedDb.has(key)) {
      countedDb.set(key, { ...countedDb.get(key), [label]: counted });
    } else {
      countedDb.set(key, { [label]: counted });
    }

    if (expectedDb.has(key)) {
      expectedDb.set(key, { ...expectedDb.get(key), [label]: expected });
    } else {
      expectedDb.set(key, { [label]: expected });
    }

    if (measuredDb.has(key)) {
      measuredDb.set(key, {
        ...measuredDb.get(key),
        [label]: measuredFrameRate,
      });
    } else {
      measuredDb.set(key, { [label]: measuredFrameRate });
    }
  });

  reader.on("close", function (line) {
    console.log("finished, ", countedDb.size, expectedDb.size, measuredDb.size);
    fileState.finished = true;
    eventEmitter.emit("finished");
  });
}

// 함수 실행
const filesState = [
  { name: "./rec-1.rec", label: "first", finished: false },
  { name: "./rec-2.rec", label: "second", finished: false },
  { name: "./rec-3.rec", label: "third", finished: false },
];

const emitter = new EventEmitter();
emitter.on("finished", () => {
  const everyFinished = filesState.every((state) => state.finished == true);
  if (everyFinished) {
    const labelsWriter = fs.createWriteStream("labels.json");
    labelsWriter.write(JSON.stringify([...countedDb.keys()]));
    // labelsWriter.write("[");
    // [...countedDb.keys()].forEach((label) => {
    //   labelsWriter.write(label + ",");
    // });
    // labelsWriter.write("]");

    const countedWriter = fs.createWriteStream("counted.json");
    countedWriter.write(JSON.stringify([...countedDb.values()]));
    // countedWriter.write("[");
    // [...countedDb.values()].forEach((item) => {
    //   //console.log(item);
    //   countedWriter.write(item + ",");
    // });
    // countedWriter.write("]");

    const expectedWriter = fs.createWriteStream("expected.json");
    expectedWriter.write(JSON.stringify([...expectedDb.values()]));
    // expectedWriter.write("[");
    // [...expectedDb.values()].forEach((item) => {
    //   console.log(item);
    //   expectedWriter.write(item + ",");
    // });
    // expectedWriter.write("]");

    const measuredWriter = fs.createWriteStream("measured.json");
    measuredWriter.write(JSON.stringify([...measuredDb.values()]));
    // measuredWriter.write("[");
    // [...measuredDb.values()].forEach((item) => {
    //   console.log(item);
    //   measuredWriter.write(item + ",");
    // });
    // measuredWriter.write("]");
  }
});

// filesState.forEach((state) => {
//   processFile(state, emitter);
// });

const dataLabels = filesState.map((state) => state.label);
dataLabels.forEach((label) => {
  const counted = require("../counted.json");
  const countedWriter = fs.createWriteStream(`counted-${label}.json`);
  let lastCounted = 0;
  const countSeparated = counted.map((item) => {
    if (item[label]) {
      lastCounted = item[label];
      return lastCounted;
    }
    return lastCounted;
  });

  countedWriter.write(JSON.stringify(countSeparated));

  const measured = require("../measured.json");
  const measuredWriter = fs.createWriteStream(`measured-${label}.json`);
  let lastMeasured = 0;
  const measureSeparated = measured.map((item) => {
    if (item[label]) {
      lastMeasured = item[label];
      return lastMeasured;
    }
    return lastMeasured;
  });

  measuredWriter.write(JSON.stringify(measureSeparated));

  const expected = require("../expected.json");
  const expectedWriter = fs.createWriteStream(`expected-${label}.json`);
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
