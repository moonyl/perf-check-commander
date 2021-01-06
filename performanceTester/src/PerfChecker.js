var fs = require("fs");
const URL = require("url").URL;

const adaptUrl = (url) => {
  return url[url.length - 1] === "/" ? url.slice(0, url.length - 1) : url;
};
class PerfChecker {
  delayedConnect = null;
  connectCount = 0;
  unstableCount = 0;
  streams = new Map();
  requestConnectCount = 0;
  connectCountResp = 0;

  constructor({ begin, count, tester, resultDir, recName }) {
    this.begin = begin;
    this.count = count;
    this.tester = tester;

    const filename = `${resultDir}/rec-${recName}.rec`;
    this.writer = fs.createWriteStream(filename);
    this.lastStatsGotten = new Date();
  }

  handleReport = () => {
    return this.onReport;
  };

  addConnect = (url) => {
    //console.error("request count:", this.requestConnectCount);
    //if (this.requestConnectCount !== this.connectCountResp) {
    if (this.requestConnectCount > 0) {
      console.error(
        "waiting to complete connecting job",
        this.requestConnectCount,
        this.connectCountResp
      );
      return;
    }
    this.requestConnectCount++;
    this.tester.addConnect(url);
  };

  removeConnect = (name) => {
    this.tester.removeConnect(name);
    //this.requestConnectCount--;
  };

  controlStream = (merged) => {
    const { expected, measuredFrameRate } = merged;

    if (expected - measuredFrameRate < expected * 0.03) {
      this.unstableCount = 0;
      try {
        if (
          this.streams.has(
            urlToConnect((this.connectCount % this.count) + this.begin)
          )
        ) {
          const streamEntries = this.streams.entries();
          const sorted = [...streamEntries].sort(
            (left, right) => left[1].count - right[1].count
          );
          //console.error("choose: ", sorted[0][0]);
          //this.tester.addConnect(sorted[0][0]);
          this.addConnect(sorted[0][0]);
        } else {
          // this.tester.addConnect(
          //   urlToConnect((this.connectCount % this.count) + this.begin)
          // );
          this.addConnect(
            urlToConnect((this.connectCount % this.count) + this.begin)
          );
          this.connectCount++;
        }
      } catch (err) {
        console.log(err);
        return;
      }
    } else if (expected - measuredFrameRate > expected * 0.1) {
      this.unstableCount++;

      if (this.unstableCount > 3) {
        const streamValues = this.streams.values();
        const sorted = [...streamValues].sort(
          (left, right) => right.count - left.count
        );
        //console.error("sorted: ", sorted);
        console.error("disconnect for flow control: ", sorted[0].names[0]);
        //this.tester.removeConnect(sorted[0].names[0]);
        this.removeConnect(sorted[0].names[0]);
        //this.tester.removeOne();
      }
    }
  };

  removeNotWorking = (toRemove) => {
    const { frameRatePerCh, elapsed, name } = toRemove;
    if (frameRatePerCh < 5 && elapsed > 10) {
      console.error("try disconnect: ", name);
      this.removeConnect(name);
      //this.tester.removeConnect(name);
    }
  };

  onReport = (data) => {
    const merged = seperateReport(data);
    //console.error(new Date() - this.lastStatsGotten);
    if (new Date() - this.lastStatsGotten > 10 * 1000) {
      console.error("maybe halt");
    }

    merged.forEach((reply) => {
      const { result, state } = reply;
      switch (result) {
        case "stats":
          this.controlStream(state);
          writeLog(state, this.writer);
          this.lastStatsGotten = new Date();
          break;
        case "abnormal":
          //console.error("abnormal: ", state);
          this.removeNotWorking(state);
          break;
        case "added": {
          const { name, url } = state;
          const adapted = adaptUrl(url);
          // const adapted =
          //   url[url.length - 1] === "/" ? url.slice(0, url.length - 1) : url;
          //console.error("added: ", url, adapted, name);
          if (this.streams.has(adapted)) {
            //console.error("not has case");
            const count = this.streams.get(adapted).count + 1;
            const names = [...this.streams.get(adapted).names, name];
            this.streams.set(adapted, { names, count });
          } else {
            //console.error("has case");
            const count = 1;
            const names = [name];
            this.streams.set(adapted, { names, count });
          }

          this.connectCountResp++;
          this.requestConnectCount--;
          //console.error("added: ", this.streams.get(adapted));
          break;
        }

        case "disconnected": {
          const { name, url, byUser } = state;
          const adapted = adaptUrl(url);
          if (this.streams.has(adapted)) {
            const streamState = this.streams.get(adapted);
            console.error({ adapted }, "streamState:", streamState);
            const names = streamState.names.filter((item) => name !== item);
            if (names.length === 0) {
              this.streams.delete(adapted);
            } else {
              this.streams.set(adapted, { names, count: names.length });
            }
          }
          this.connectCountResp--;
          //console.error({ byUser });
          if (byUser === false) {
            this.requestConnectCount--;
          }
          // const adapted =
          //   url[url.length - 1] === "/" ? url.slice(0, url.length - 1) : url;
          //console.error("disconnected: ", this.streams.get(adapted));
          break;
        }
      }
    });
  };

  start = () => {
    const handle = setTimeout(() => {
      this.addConnect(urlToConnect(this.begin));
      //this.tester.addConnect(urlToConnect(this.begin));

      this.connectCount++;
      clearTimeout(handle);
    }, 2000);
  };
}

function seperateReport(data) {
  const splited = data.toString().split("\n");
  //console.error(splited);
  return splited.slice(0, splited.length - 1).map((jsonStr) => {
    try {
      const parsed = JSON.parse(jsonStr.trim());
      //console.error(parsed);
      return parsed;
    } catch (err) {
      console.error("error:", data.toString());
      return {};
    }
  });
}

function urlToConnect(connectIndex) {
  return `rtsp://192.168.17.2:9554/proxyStream-${connectIndex}`;
}

function writeLog(merged, writer) {
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
