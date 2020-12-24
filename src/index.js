const { spawn } = require("child_process");

var fs = require("fs");
const filename = `rec-${new Date().valueOf()}.rec`;

const writer = fs.createWriteStream(filename);

const programName = "rtspPerfUsingLive555";
const proc = spawn(programName, ["23.9"], {
  cwd: "F:/pilot/rtspPerfUsingLive555/cmake-build-release/bin",
});
let delayedConnect = null;
let connectCount = 0;
let unstableCount = 0;
proc.stdout.on("data", (data) => {
  //console.log(data.toString());

  const splited = data.toString().split("\r\n");
  //console.log(splited);
  const merged = splited.reduce((accumulator, line) => {
    if (line === "") {
      return accumulator;
    }
    const parsed = JSON.parse(line);
    if ("counted" in parsed) {
      return { ...accumulator, ...parsed };
    }
    if ("name" in parsed) {
      const toRemove = "toRemove" in accumulator ? accumulator.toRemove : [];
      return { ...accumulator, toRemove: [...toRemove, { ...parsed }] };
    }

    console.error({ accumulator });
    return accumulator;
  }, {});
  //console.error({ merged });
  const { counted, expected, measuredFrameRate } = merged;

  if (expected - measuredFrameRate < expected * 0.05) {
    unstableCount = 0;
    clearInterval(delayedConnect);
    delayedConnect = setInterval(() => {
      //console.log({ connect });
      proc.stdin.write(
        JSON.stringify({
          url: urlToConnect(),
        }) + "\n"
      );
      connectCount++;
    }, 1000);
  } else if (expected - measuredFrameRate > expected * 0.2) {
    unstableCount++;
    clearInterval(delayedConnect);
    if (unstableCount > 5) {
      proc.stdin.write("removeOne\n");
    }
  } else {
    clearInterval(delayedConnect);
  }

  if ("counted" in merged) {
    const record = {
      time: new Date().valueOf(),
      counted,
      expected,
      measuredFrameRate,
    };
    writer.write(JSON.stringify(record) + "\n");
    console.error(record);
  }

  const { toRemove } = merged;
  if (toRemove && toRemove.length > 0) {
    const filtered = toRemove.filter(
      (item) => item.frameRatePerCh === 0 && item.elapsed > 10
    );

    filtered.forEach((item) => {
      // console.log(item);
      proc.stdin.write(
        JSON.stringify({
          disconnect: item.name,
        }) + "\n"
      );
    });
  }
});
proc.stderr.on("data", (data) => {
  //console.error("error:", data.toString());
});

const urlToConnect = () => {
  return `rtsp://192.168.17.2:9554/proxyStream-${(connectCount % 10) + 1}`;
};

setTimeout(() => {
  proc.stdin.write(JSON.stringify({ url: urlToConnect() }) + "\n");
  connectCount++;
}, 2000);
