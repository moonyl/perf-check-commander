const { EventEmitter } = require("events");
const fs = require("fs");

class CategorizedWriter {
  #countedDb = new Map();
  #expectedDb = new Map();
  #measuredDb = new Map();
  #emitter = new EventEmitter();

  constructor(filesState, resultDir) {
    this.#emitter.on("finished", () => {
      const everyFinished = filesState.every((state) => state.finished == true);
      if (everyFinished) {
        const labelsWriter = fs.createWriteStream(`${resultDir}/labels.json`);
        labelsWriter.write(JSON.stringify([...this.#countedDb.keys()]));

        const countedWriter = fs.createWriteStream(`${resultDir}/counted.json`);
        countedWriter.write(JSON.stringify([...this.#countedDb.values()]));

        const expectedWriter = fs.createWriteStream(
          `${resultDir}/expected.json`
        );
        expectedWriter.write(JSON.stringify([...this.#expectedDb.values()]));

        const measuredWriter = fs.createWriteStream(
          `${resultDir}/measured.json`
        );
        measuredWriter.write(JSON.stringify([...this.#measuredDb.values()]));
      }
    });
  }

  get countedDb() {
    return this.#countedDb;
  }
  get expectedDb() {
    return this.#expectedDb;
  }
  get measuredDb() {
    return this.#measuredDb;
  }
  get emitter() {
    return this.#emitter;
  }
}

module.exports = CategorizedWriter;
