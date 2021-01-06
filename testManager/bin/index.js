const { spawn } = require("child_process");

// configures = [
//   { begin: 1, count: 31 },
//   { begin: 32, count: 31 },
// ];

// configures = [
//   { begin: 1, count: 30 },
//   { begin: 1, count: 30 },
// ];

// configures = [
//   { begin: 1, count: 30 },
//   { begin: 1, count: 30 },
//   { begin: 1, count: 30 },
// ];

// configures = [
//   { begin: 1, count: 23 },
//   { begin: 24, count: 22 },
// ];

// configures = [
//   { begin: 1, count: 40 },
//   { begin: 1, count: 40 },
// ];

configures = [
  { begin: 1, count: 13 },
  { begin: 14, count: 13 },
  { begin: 27, count: 14 },
];

// configures = [
//   { begin: 1, count: 20 },
//   { begin: 21, count: 20 },
// ];

//configures = [{ begin: 1, count: 20 }];
//configures = [{ begin: 1, count: 30 }];
// configures = [{ begin: 1, count: 40 }];

const handleStderr = (data) => {
  console.log(data.toString());
};
const handleStdout = (data) => {};
const currentDate = new Date();
const resultDir = `results/${
  currentDate.getMonth() + 1
}-${currentDate.getDate()} ${currentDate.getHours()}h${currentDate.getMinutes()}m`;

configures.forEach((params, index) => {
  //console.log({ resultDir });

  setTimeout(() => {
    const { begin, count } = params;
    console.log({ begin, count });
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
  }, index * 1000);

  //return proc;
});

//console.log(procs.length);
