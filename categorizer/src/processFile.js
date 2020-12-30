const fs = require("fs");
const readline = require("readline");

function processFile(fileState, categorizedWriter) {
  const instream = fs.createReadStream(fileState.name);
  const reader = readline.createInterface(instream /*, process.stdout*/);
  const { label } = fileState;
  console.log(label);
  const {
    emitter: eventEmitter,
    countedDb,
    expectedDb,
    measuredDb,
  } = categorizedWriter;

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

module.exports = processFile;
