const { spawn } = require("child_process");
const path = require("path");
const fs = require("fs");

class TestProcessor {
  constructor({ errDir, errName }) {
    //console.error("check: dirname", __dirname);

    const filename = `${errDir}/error-${errName}.err`;
    this.writer = fs.createWriteStream(filename);

    this.proc = spawn("rtspPerfUsingLive555", ["23.9"], {
      cwd: path.join(__dirname, "../bin"),
    });
    this.proc.stderr.on("data", (data) => {
      // nothing to do
      // console.error("error:", data.toString());
      this.writer.write(data.toString() + "\n");
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
