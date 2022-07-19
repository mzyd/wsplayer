"use strict";

function Downloader() {
  this.ws = null;
}

Downloader.prototype.describe = function (wsurl, version) {
  this.ws = new WebSocket(wsurl);
  this.ws.binaryType = "arraybuffer";

  this.ws.onopen = function () {
    this.ws.send(
      '{"Version":"rtsp 1.0","Method":"DESCRIBE","CSeq": 1,"UserAgent":"webassembly' +
        version +
        '"}'
    );
    console.log("ws send DESCRIBE to mss...");
  }.bind(this);

  this.ws.onmessage = function (evt) {
    if (typeof evt.data == "string") {
      var jsonSDP = JSON.parse(evt.data);
      if (jsonSDP.StatusCode != 200) {
        self.postMessage({
          command: "DownLoadFinish",
          data: "sdp is not 200 ok",
        });
      } else {
        self.postMessage({ command: "DESCRIBE_RSP", data: jsonSDP.Body }); //向Player发送SDP数据
      }
    } else {
      self.postMessage({ command: "DownLoadData", data: evt.data }, [evt.data]); //向Player发送媒体数据
    }
  }.bind(this);

  this.ws.onclose = function () {
    self.postMessage({ command: "DownLoadFinish", data: "WebSocket Close!" }); //向Player发送媒体数据
    this.destroy();
  }.bind(this);

  this.ws.onerror = function () {
    console.info("WebSocket Error!");
    self.postMessage({ command: "DownLoadFinish", data: "WebSocket Error!" }); //向Player发送媒体数据
    this.destroy();
  }.bind(this);
};

Downloader.prototype.play = function (version) {
  this.ws.send(
    '{"Version":"rtsp 1.0","Method":"PLAY","CSeq": 1,"UserAgent":"webassembly' +
      version +
      '"}'
  );
  console.log("ws send PLAY to mss...");
};

Downloader.prototype.destroy = function () {
  console.info("ws destroy!");
  this.ws.close();
  self.close();
};

self.downloader = new Downloader();

self.onmessage = function (evt) {
  if (!self.downloader) {
    self.postMessage({
      command: "DownLoadFinish",
      data: "Downloader init failed!",
    }); //向Player发送媒体数据
    return;
  }

  switch (evt.data.command) {
    case "DESCRIBE": //发送describe
      self.downloader.describe(evt.data.data, evt.data.version);
      break;
    case "PLAY": //发送play
      self.downloader.play(evt.data.data);
      break;
    default:
      console.error("DownloadWorker command no support " + evt.data.command);
  }
};
