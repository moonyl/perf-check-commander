const yargs = require("yargs/yargs");
const { hideBin } = require("yargs/helpers");
const argv = yargs(hideBin(process.argv)).argv;
const createIntegratedData = require("../src/createIntegratedData");

const createFilesState = require("../../lib/createFilesState");

const { resultBase, choice } = argv;

const resultDir = `${resultBase}/${choice}`;

const filesState = createFilesState(resultDir);

createIntegratedData(filesState, resultDir);
