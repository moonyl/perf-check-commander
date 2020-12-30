const fs = require("fs");

const labelsArray = [
  "first",
  "second",
  "third",
  "fourth",
  "fifth",
  "sixth",
  "seventh",
  "eighth",
  "nineth",
];

const createFilesState = (resultDir) => {
  const state = [];
  labelsArray.forEach((label, index) => {
    const recFile = `${resultDir}/rec-${index}.rec`;
    if (fs.existsSync(recFile)) {
      state.push({ name: recFile, label, finished: false });
    }
  });
  return state;
};

module.exports = createFilesState;
