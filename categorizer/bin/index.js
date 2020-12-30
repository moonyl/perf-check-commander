const yargs = require("yargs/yargs");
const { hideBin } = require("yargs/helpers");
const argv = yargs(hideBin(process.argv)).argv;
const processFile = require("../src/processFile");
const CategorizedWriter = require("../src/categorizedWriter");
const createFilesState = require("../../lib/createFilesState");

const { resultBase, choice } = argv;
// 함수 실행
//console.log({ choice });
const resultDir = `${resultBase}/${choice}`;

const filesState = createFilesState(resultDir);
//console.log(filesState);
const categorizedWriter = new CategorizedWriter(filesState, resultDir);

filesState.forEach((state) => {
  processFile(state, categorizedWriter);
});
