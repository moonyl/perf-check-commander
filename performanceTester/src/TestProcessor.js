const { spawn } = require("child_process");

class TestProcessor {
  constructor() {
    this.proc = spawn("rtspPerfUsingLive555", ["23.9"], {
      cwd: "F:/pilot/rtspPerfUsingLive555/cmake-build-release/bin",
    });
    this.proc.stderr.on("data", (data) => {
      // nothing to do
      // console.error("error:", data.toString());
    });
  }

  onReport = (handler) => {
    this.proc.stdout.on("data", handler);
  };

  addConnect = (url) => {
    this.proc.stdin.write(
      JSON.stringify({
        url,
      }) + "\n"
    );
  };

  removeOne = () => {
    this.proc.stdin.write("removeOne\n");
  };

  removeConnect = (disconnect) => {
    this.proc.stdin.write(
      JSON.stringify({
        disconnect,
      }) + "\n"
    );
  };
}

module.exports = TestProcessor;
