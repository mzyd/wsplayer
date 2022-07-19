'use strict'

function wsPlayer(videoCanvasId, drawCanvasId, workerPath, statusCB, showPic = false) {
	this.version = "v2.0.4.0"

	if (!window.WebAssembly) {
		console.error('Web Browser not support WebAssembly!')
		return null
	}

	this.workerPath = workerPath
	this.oDrawSei = new DrawSei(drawCanvasId, this.workerPath, showPic, false);
	this.oSuperRender = new SuperRender2(videoCanvasId)
	this.cachertpnum = 2000
	this.DecodeWorker = null
	this.aVideoFrameBuffer = []
	this.statusCB = statusCB
	this.tick = null;
	this.timer = null;
	this.playcycle = 0;
	this.byterecv = 0;
	this.byterecvtime = 0;
	this.framenum = 0;
	this.framebasetime = 0;
	this.countReceivedRtp = 0;
	this.countHandledRtp = 0;
	this.noreg = 0;
	this.dropImage = 0;
	this.idrnum = 0;
	this.mediainfo = new Map();
	this.mediainfo.set("StreamUrl", "");
	this.mediainfo.set("Video", "");
	this.mediainfo.set("Resolution", "");
	this.mediainfo.set("Bitrate", "");
	this.mediainfo.set("Drop Packet", "");
	this.mediainfo.set("Drop Frame", "");
	this.mediainfo.set("Drop Image", "0");
	this.mediainfo.set("Display FPS", "");
	this.mediainfo.set("Receive FPS", "");
	this.mediainfo.set("Rtp  QueLen", "");
	this.mediainfo.set("Image  Len", "");
}


wsPlayer.prototype.version = function () {
	return this.version
}

wsPlayer.prototype.setshowtype = function (type) {
	let words = type.split(",");
	let drawtype = 0;
	for (let i in words) {
		switch (words[i]) {
			case "1":
				drawtype |= 0x10; //walker
				break;
			case "2":
				drawtype |= 0x08; //car
				break;
			case "3":
				drawtype |= 0x04; //lianglunche
				break;
			case "4":
				drawtype |= 0x02; //sanlunche
				break;
			case "5":
				drawtype |= 0x01; //face
				break;
		}
	}

	this.oDrawSei.setdrawtype(drawtype)
}

wsPlayer.prototype.setplaymode = function (type) {
	if (type == 1) {
		this.cachertpnum = 2000;
	} else {
		this.cachertpnum = 10000;
	}
}


wsPlayer.prototype.start = function (wsurl) {
	this.DecodeWorker = new Worker(this.workerPath + '/DecoderWorker.js')

	this.mediainfo.set("StreamUrl", wsurl)
	this.mediainfo.set("Drop Image", 0)
	this.byterecvtime = Date.now();

	this.tick = function (timestamp) {
		this.drawImage(timestamp)
		this.timer = requestAnimationFrame(this.tick)
	}.bind(this)


	this.DecodeWorker.onmessage = function (evt) {
		switch (evt.data.command) {
			case 'HandleRtpNum':
				this.countHandledRtp = evt.data.countHandledRtp;
				break
			case 'OutputImage':
				if (evt.data.isIDR == 1)
					this.idrnum++;

				this.aVideoFrameBuffer.push(evt.data);				
				if (this.aVideoFrameBuffer.length > 25) {
					this.dropImage += this.aVideoFrameBuffer.length;
					this.aVideoFrameBuffer.splice(0, this.aVideoFrameBuffer.length);
					this.mediainfo.set("Drop Image", this.dropImage);
				}
				break
			case 'MetaData': {
				let jsondata = new Uint8Array(evt.data.data)
				let strinfo = new TextDecoder('utf-8').decode(jsondata)
				let obj;
				try {
					obj = JSON.parse(strinfo);
					for (let key in obj) {
						this.mediainfo.set(key, obj[key])
					}
				} catch (e) {
					console.error(e);
				}

				if (evt.data.type == 1) {
					let res = this.mediainfo.get("Resolution").split("x");
					this.width = parseInt(res[0]);
					this.height = parseInt(res[1]);
					this.statusCB(100, {
						videoWidth: this.width,
						videoHeight: this.height
					});
				} else {
					this.mediainfo.set("Image  Len", this.aVideoFrameBuffer.length);
					this.statusCB(200, this.mediainfo);
				}
				break;
			}
			case 'Loaded':
				this.connectWS()
				break
			case 'Inited':
				this.ws.send('{"Version":"rtsp 1.0","Method":"PLAY","CSeq": 1,"UserAgent":"webassembly ' + this.version + '"}')
				console.log("ws send PLAY to mss...")
				requestAnimationFrame(this.tick)
				break
			case 'Initfailed':
				this.statusCB(-1, 'Inited failed')
				console.error("Inited failed")
				this.stop()
				break
			default:
				this.statusCB(-1, 'DecodeWorker command no support! ' + evt.data.command)
				break
		}
	}.bind(this)

	this.connectWS = function () {
		this.ws = new WebSocket(wsurl)
		this.ws.binaryType = 'arraybuffer'

		this.ws.onopen = function () {
			this.ws.send('{"Version":"rtsp 1.0","Method":"DESCRIBE","CSeq": 1,"UserAgent":"webassembly ' + this.version + '"}')
			console.log('ws send DESCRIBE to mss...')
		}.bind(this)

		this.ws.onmessage = function (evt) {
			if (typeof (evt.data) != 'string') {
				this.countReceivedRtp++

				let rtpqueuelen = this.countReceivedRtp - this.countHandledRtp;
				this.byterecv += evt.data.byteLength;
				let now = Date.now();
				if (now - this.byterecvtime >= 1000) {
					let bitrate = this.byterecv * 125 / 16 / (now - this.byterecvtime);
					this.mediainfo.set("Bitrate", Math.round(bitrate) + " kb/s");
					this.mediainfo.set("Rtp  QueLen", rtpqueuelen);					
					this.byterecv = 0;
					this.byterecvtime = now;
				}

				if (rtpqueuelen < this.cachertpnum) {
					this.DecodeWorker.postMessage({
						command: 'InputStream',
						flag: 0,
						data: evt.data
					}, [evt.data])
				} else {					
					this.DecodeWorker.postMessage({
						command: 'InputStream',
						flag: this.idrnum > 3 ? 1:0,
						data: evt.data
					}, [evt.data]);
				}
			} else {
				let jsonSDP = JSON.parse(evt.data)
				if (jsonSDP.StatusCode != 200) {
					this.statusCB(-102, 'sdp is not 200 ok')
					this.stop()
				} else {
					if (jsonSDP["Body"].indexOf("MP4V-ES") != -1) {
						this.DecodeWorker.postMessage({
							command: 'Init',
							data: jsonSDP.Body,
							isMpeg4: 1
						})
					} else {
						this.DecodeWorker.postMessage({
							command: 'Init',
							data: jsonSDP.Body,
							isMpeg4: 0
						})
					}

				}

			}
		}.bind(this)

		this.ws.onclose = function () {
			this.statusCB(-101, 'WebSocket Close!');
			console.log('WebSocket Close!');
		}.bind(this)

		this.ws.onerror = function () {
			this.statusCB(-101, 'WebSocket Error!');
			console.error('WebSocket Error!');
		}.bind(this)
	}

	this.drawImage = function (timestamp) {
		let len = this.aVideoFrameBuffer.length;
		if (len == 0) {
			return;
		}

		if (this.idrnum < 3 || len > 3) {} else {
			if ((timestamp - this.playcycle) >= 35) {
				this.playcycle = timestamp
			} else {
				return;
			}
			this.playcycle = timestamp;
		}		

		let imageData = this.aVideoFrameBuffer.shift();
		let ydata = new Uint8Array(imageData.YData);
		let udata = new Uint8Array(imageData.UData);
		let vdata = new Uint8Array(imageData.VData);

		let elapse = timestamp - this.framebasetime;
		if (elapse < 1000) {
			this.framenum++;
		} else {
			this.mediainfo.set("Display FPS", ((this.framenum + 1) / elapse * 1000).toFixed(2));
			this.framenum = 0;
			this.framebasetime = timestamp;
		}

		SEI: if (imageData.SEIData.byteLength > 0) {
			let seidata = new Uint8Array(imageData.SEIData)
			let strSEI = new TextDecoder('utf-8').decode(seidata)
			let obj;

			try {
				obj = JSON.parse(strSEI);
			} catch (e) {
				console.error(e);
				break SEI;
			}
			this.oDrawSei.draw(obj);
			this.noreg = 0;
		} else {
			if (this.noreg++ >= 10) {
				this.oDrawSei.clear();
				this.noreg = 0;
			}
		}
		this.oSuperRender.SR_DisplayFrameData(this.width, this.height, ydata, udata, vdata)
	}.bind(this)

	console.log("wsPlayer start");
}

wsPlayer.prototype.stop = function () {
	if (this.ws) {
		this.ws.close();
		this.ws = null;
	}

	this.aVideoFrameBuffer.splice(0, this.aVideoFrameBuffer.length);

	cancelAnimationFrame(this.timer)

	if (this.DecodeWorker) {
		this.DecodeWorker.postMessage({
			command: 'DeInit'
		})
		this.DecodeWorker.terminate()
		this.DecodeWorker = null
	}
	this.idrnum = 0;
	this.timer = null;
	this.oDrawSei.clear() //清屏
	this.oSuperRender.SR_DisplayFrameData(1, 1, null)
	this.totalduration = 0
	this.lastrtpts = 0
	this.countReceivedRtp = 0
	this.countHandledRtp = 0
	this.byterecv = 0;
	this.framenum = 0;
	this.framebasetime = 0;
	this.dropImage = 0;
	this.noreg = 0;

	console.log("wsPlayer stop")
}

wsPlayer.prototype.destroy = function () {
	this.stop()
	this.oSuperRender && this.oSuperRender.SR_Destroy()
	this.oSuperRender = null
}
