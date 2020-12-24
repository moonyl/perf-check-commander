const PerfChecker = require("../src/PerfChecker");
const TestProcessor = require("../src/TestProcessor");
const yargs = require("yargs/yargs");
const { hideBin } = require("yargs/helpers");
const argv = yargs(hideBin(process.argv)).argv;
//console.log(argv);

const { begin, count } = argv;
const testProc = new TestProcessor();
const perfChecker = new PerfChecker(begin, count, testProc);

testProc.onReport(perfChecker.handleReport());
perfChecker.start();
