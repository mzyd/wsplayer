'use strict'

var rtp_group_num = 5;


self.Module = {
	onRuntimeInitialized: function () {
		if (self.decoder) {
			self.decoder.onWasmLoaded()
			self.postMessage({
				command: 'Loaded'
			})
		} else
			console.error("Decorder Load failed!");
	}
};

self.importScripts("Decoder.js");

self.onmessage = function (event) {
	switch (event.data.command) {
		case 'Init':
			let a = event.data.data.split('sprop-parameter-sets')[0];
			let b = event.data.data.split('a=control')[1]
			let c = a + "\r\na=control" +b
			// console.log(event.data.data);
			console.log(c);
			event.data.data=c;
			this.decoder.initDecoder(event.data);
			break;
		case 'InputStream':
			this.decoder.feedData(event.data);
			break;
		case 'DeInit':
			this.decoder.deinitDecoder(event.data);
			break;
		default:
			console.error('decorder command error')
	}
};

function DecoderWorker() {
	this.imageCallback = null;
	this.rtpnum = 1;
	this.videoCtx = -1;
	this.width = 0;
	this.height = 0;
	this.datalen = 0;
}

DecoderWorker.prototype.onWasmLoaded = function () {
	this.imageCallback = Module.addFunction(function (type, ptr) {
		let memoryIndex = ptr / 4
		if (type == 3) {
			let SEILength = Module.HEAPU32[memoryIndex + 0],
				YimgBufferPtr = Module.HEAPU32[memoryIndex + 1],
				UimgBufferPtr = Module.HEAPU32[memoryIndex + 2],
				VimgBufferPtr = Module.HEAPU32[memoryIndex + 3],
				SEIBufferPtr = Module.HEAPU32[memoryIndex + 4],
				//rtpTs = Module.HEAPU32[memoryIndex + 5],
				isIDR = Module.HEAPU32[memoryIndex + 6],
				YimageBuffer = Module.HEAPU8.subarray(YimgBufferPtr, YimgBufferPtr + this.width * this.height),
				UimageBuffer = Module.HEAPU8.subarray(UimgBufferPtr, UimgBufferPtr + this.width * this.height / 4),
				VimageBuffer = Module.HEAPU8.subarray(VimgBufferPtr, VimgBufferPtr + this.width * this.height / 4)
			let SEIBuffer = null
			if (SEILength > 0) {
				SEIBuffer = Module.HEAPU8.subarray(SEIBufferPtr, SEIBufferPtr + SEILength)
			}

			let ydata = new Uint8Array(YimageBuffer)
			let udata = new Uint8Array(UimageBuffer)
			let vdata = new Uint8Array(VimageBuffer)
			let seidata = new Uint8Array(SEIBuffer)

			self.postMessage({
				command: 'OutputImage',
				//rtpTs: rtpTs,
				isIDR: isIDR,
				YData: ydata.buffer,
				UData: udata.buffer,
				VData: vdata.buffer,
				SEIData: seidata.buffer
			}, [ydata.buffer, udata.buffer, vdata.buffer, seidata.buffer])
		} else {
			let length = Module.HEAPU32[memoryIndex],
				jsonBufferPtr = Module.HEAPU32[memoryIndex + 1],
				jsonBuffer = Module.HEAPU8.subarray(jsonBufferPtr, jsonBufferPtr + length),
				jsondata = new Uint8Array(jsonBuffer)
			self.postMessage({
				command: 'MetaData',
				data: jsondata,
				type: type
			});

			if (type == 1) {
				let res = new Uint8Array(jsondata)
				let strinfo = new TextDecoder('utf-8').decode(res)
				let obj;
				try {
					obj = JSON.parse(strinfo);
				} catch (e) {
					console.error(e);
				}
				let info = obj["Resolution"].split("x");
				this.width = parseInt(info[0]);
				this.height = parseInt(info[1]);
			}
		}
	}.bind(this));
};

DecoderWorker.prototype.initDecoder = function (data) {
	let pStrSDP = allocateUTF8(data.data);
	this.videoCtx = Module._video_decoder_init(pStrSDP, this.imageCallback);
	if (data.isMpeg4 == 0) {
		rtp_group_num = 5;
	} else {
		rtp_group_num = 2;
	}

	this.edata = new Uint8Array(rtp_group_num * 1.5 * 1024);
	this.memoryData = Module._malloc(rtp_group_num * 1.5 * 1024);

	if (-1 < this.videoCtx || this.videoCtx < 64) {
		self.postMessage({
			command: 'Inited'
		})
	} else {
		self.postMessage({
			command: 'Initfailed'
		})
	}
};

DecoderWorker.prototype.feedData = function (data) {
	let rtp_len = new Uint8Array(2);
	rtp_len[0] = data.data.byteLength & 0x00FF;
	rtp_len[1] = (data.data.byteLength >> 8) & 0x00FF;

	this.edata.set(rtp_len, this.datalen)
	this.edata.set(data.data, this.datalen + 2)
	this.datalen += 2;

	let edata = new Uint8Array(data.data);
	this.edata.set(edata, this.datalen)
	this.datalen += data.data.byteLength;


	if (this.rtpnum++ % rtp_group_num == 0) {
		Module.HEAPU8.set(this.edata, this.memoryData);
		self.postMessage({
			command: 'HandleRtpNum',
			countHandledRtp: this.rtpnum
		});
		Module._video_decoder_feed_data(this.videoCtx, this.memoryData, this.datalen, data.flag)
		this.datalen = 0;
	}
};

DecoderWorker.prototype.deinitDecoder = function (data) {
	Module._video_decoder_deinit(this.videoCtx)
	Module._free(this.memoryData)
	console.log('Decorder DeInit')
};

self.decoder = new DecoderWorker;