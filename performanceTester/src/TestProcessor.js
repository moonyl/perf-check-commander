const { spawn } = require("child_process");
const path = require("path");
const fs = require("fs");

class TestProcessor {
  constructor({ errDir, errName }) {
    //console.error("check: dirname", __dirname);

    const filename = `${errDir}/error-${errName}.err`;
    this.writer = fs.createWriteStream(filename);

    const progName =
      process.platform === "win32"
        ? "rtspPerfUsingLive555"
        : "./rtspPerfUsingLive555";
    this.proc = spawn(progName, ["23.9"], {
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
      JSON.stringify({ cmd: "add", param: { url } }) + "\n"
    );
  };

  removeOne = () => {
    this.proc.stdin.write(JSON.stringify({ cmd: "removeOne" }) + "\n");
  };

  removeConnect = (disconnect) => {
    this.proc.stdin.write(
      JSON.stringify({ cmd: "disconnect", param: disconnect }) + "\n"
    );
  };
}

module.exports = TestProcessor;
