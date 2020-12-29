const PerfChecker = require("../src/PerfChecker");
const TestProcessor = require("../src/TestProcessor");
const fs = require("fs");
const yargs = require("yargs/yargs");
const { hideBin } = require("yargs/helpers");
const argv = yargs(hideBin(process.argv)).argv;
//console.error(argv);

const { begin, count, resultDir, recName } = argv;
if (!fs.existsSync(resultDir)) {
  fs.mkdirSync(resultDir);
}
//console.error("resultDir:", { resultDir });
const testProc = new TestProcessor();
const perfChecker = new PerfChecker({
  begin,
  count,
  tester: testProc,
  resultDir,
  recName,
});

testProc.onReport(perfChecker.handleReport());
perfChecker.start();

//console.error("check: ", __dirname, process.cwd());
