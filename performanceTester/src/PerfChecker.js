class PerfChecker {
  delayedConnect = null;
  connectCount = 0;
  unstableCount = 0;

  constructor(begin, count, tester) {
    this.begin = begin;
    this.count = count;
    this.tester = tester;
  }

  handleReport = () => {
    return this.onReport;
  };

  controlStream = (merged) => {
    const { expected, measuredFrameRate } = merged;

    if (expected - measuredFrameRate < expected * 0.05) {
      this.unstableCount = 0;
      clearInterval(this.delayedConnect);
      this.delayedConnect = setInterval(() => {
        //console.log({ connect });
        //console.error((this.connectCount % this.count) + this.begin);
        this.tester.addConnect(
          urlToConnect((this.connectCount % this.count) + this.begin)
        );

        this.connectCount++;
      }, 1000);
    } else if (expected - measuredFrameRate > expected * 0.2) {
      this.unstableCount++;
      clearInterval(this.delayedConnect);
      if (this.unstableCount > 3) {
        this.tester.removeOne();
      }
    } else {
      clearInterval(this.delayedConnect);
    }
  };

  onReport = (data) => {
    const merged = seperateReport(data);

    //console.error({ merged });
    this.controlStream(merged);

    writeLog(merged);

    const { toRemove } = merged;
    removeNotWorking(this.tester, toRemove);
  };

  start = () => {
    const handle = setTimeout(() => {
      this.tester.addConnect(urlToConnect(this.begin));

      this.connectCount++;
      clearTimeout(handle);
    }, 2000);
  };
}

function seperateReport(data) {
  const splited = data.toString().split("\r\n");
  //console.log(splited);
  return splited.reduce((accumulator, line) => {
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
}

const removeNotWorking = (tester, toRemove) => {
  if (toRemove && toRemove.length > 0) {
    const filtered = toRemove.filter(
      (item) => item.frameRatePerCh === 0 && item.elapsed > 10
    );

    filtered.forEach((item) => {
      // console.log(item);
      tester.removeConnect(item.name);
    });
  }
};

function urlToConnect(connectIndex) {
  return `rtsp://192.168.17.2:9554/proxyStream-${connectIndex}`;
}

var fs = require("fs");
const filename = `rec-${new Date().valueOf()}.rec`;
const writer = fs.createWriteStream(filename);

function writeLog(merged) {
  const { counted, expected, measuredFrameRate } = merged;
  if ("counted" in merged) {
    const record = {
      time: new Date().valueOf(),
      counted,
      expected,
      measuredFrameRate,
    };
    writer.write(JSON.stringify(record) + "\n");
    if (expected - measuredFrameRate > expected * 0.1) {
      console.error(record);
    }
  }
}

module.exports = PerfChecker;
