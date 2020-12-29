const { spawn } = require("child_process");

// configures = [
//   { begin: 1, count: 31 },
//   { begin: 32, count: 31 },
// ];

// configures = [
//   { begin: 1, count: 30 },
//   { begin: 1, count: 30 },
// ];

configures = [
  { begin: 1, count: 30 },
  { begin: 1, count: 30 },
  { begin: 1, count: 30 },
];

const handleStderr = (data) => {
  console.log(data.toString());
};
const handleStdout = (data) => {};
const currentDate = new Date();
const resultDir = `results/${
  currentDate.getMonth() + 1
}-${currentDate.getDate()} ${currentDate.getHours()}h${currentDate.getMinutes()}m`;
const procs = configures.map((params, index) => {
  //console.log({ resultDir });
  const { begin, count } = params;
  //console.log({ begin, count });
  const proc = spawn(
    "node",
    [
      "performanceTester/bin/index",
      "--begin",
      begin,
      "--count",
      count,
      "--resultDir",
      resultDir,
      "--recName",
      index,
    ],
    {
      //const proc = spawn("node", ["--version"], {
      //cwd: process.cwd(),
    }
  );
  proc.stderr.on("data", handleStderr);

  proc.stdout.on("data", handleStdout);
  return proc;
});

//console.log(procs.length);
