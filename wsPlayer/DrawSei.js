"use strict";

// const CN_ObjectType = ['', '行人', '自行车', '摩托车', '轿车', '三轮车', '大客车', '面包车', '卡车', '人脸']
// const EN_ObjectType = ['', 'people', 'bicycle', 'motorcycle', 'car', 'tricycle', 'bus', 'van', 'truck', 'face']
// const imgArr = ['man', 'woman', 'blue', 'red', 'nan', 'nv', 'maozi', 'maozi2', 'waitao', 'waitao2', 'changku', 'changku2', 'yanjing', 'yanjing2', 'kouzhao', 'kouzhao2', 'laganxiang', 'laganxiang2', 'beibao', 'beibao2','lianglun', 'twolun', 'twolunp', 'twolunren', 'twolunbeibao', 'twolunchangku', 'twolunkouzhao', 'twolunmaozi', 'twolunwaitao', 'twolunyanjing', 'car', 'carp', 'carpai', 'cartype', 'chexing', 'carpaitype', 'carcolor','sanlun', 'sanlunp', 'sanlunche', 'sanlunren'
// ]
const CN_ObjectType = []
const EN_ObjectType = []
const imgArr = []
const segh = 18 //性别框高
const kuangh = 27 //普通框高
const picx = 10 //图标的x坐标
const wordx = 50 //字的x坐标

function DrawSei(drawCanvasId, workerPath, showPic, showStat) {
	let manId = document.getElementById(imgArr[0]);
	if (!manId && showPic == true) {
		for (var i = 0; i < imgArr.length; i++) {
			let img = document.createElement('img');
			img.style.display = 'none';
			img.id = imgArr[i];
			img.src = workerPath + "/img/" + imgArr[i] + ".png";
			document.body.appendChild(img)
		}
	}
	for (var i = 0; i < imgArr.length; i++) {
		this[imgArr[i]] = document.getElementById(imgArr[i])
	}

	this.showPic = showPic;	
	this.drawCvs = document.getElementById(drawCanvasId)
	this.drawCvsCtx = this.drawCvs.getContext('2d')

	this.cdrawCvs = document.createElement("canvas")
	this.cdrawCvs.width = this.drawCvs.width
	this.cdrawCvs.height = this.drawCvs.height
	this.cdrawCvsCtx = this.cdrawCvs.getContext("2d")
	this.showtype = 0x1F
	this.cdrawCvsCtx.lineWidth = 2
	this.ImageWidth = 0
	this.ImageHeight = 0
}

DrawSei.prototype.setdrawtype = function (type) {
	this.showtype = type
}

DrawSei.prototype.drawRect = function (obj) {
	this.cdrawCvsCtx.strokeRect(
		obj.Rect[0] * this.drawCvs.width / this.ImageWidth,
		obj.Rect[1] * this.drawCvs.height / this.ImageHeight,
		obj.Rect[2] * this.drawCvs.width / this.ImageWidth,
		obj.Rect[3] * this.drawCvs.height / this.ImageHeight)
}

DrawSei.prototype.drawRectWords = function (obj, wtype) {
	let widthratio = this.drawCvs.width / this.ImageWidth
	let heightratio = this.drawCvs.height / this.ImageHeight
	var cdrawCvsCtx = this.cdrawCvsCtx

	cdrawCvsCtx.strokeRect(
		obj.Rect[0] * widthratio,
		obj.Rect[1] * heightratio,
		obj.Rect[2] * widthratio,
		obj.Rect[3] * heightratio)


	let fonth = Math.max(12, Math.min((obj.Rect[2] * widthratio / 8), 22));
	cdrawCvsCtx.font = fonth + 'px ' + "Arial";

	cdrawCvsCtx.beginPath();
	cdrawCvsCtx.moveTo(obj.Rect[0] * widthratio, obj.Rect[1] * heightratio)
	cdrawCvsCtx.lineTo(obj.Rect[0] * widthratio, obj.Rect[1] * heightratio - 4 - fonth / 2)
	cdrawCvsCtx.lineTo(obj.Rect[0] * widthratio + fonth, obj.Rect[1] * heightratio - 4 - fonth / 2)
	cdrawCvsCtx.stroke() // 进行绘制

	cdrawCvsCtx.fillStyle = 'rgba(63,63,63,0.7)'
	if (wtype == 2) {
		let maxwight = cdrawCvsCtx.measureText(EN_ObjectType[obj.Type]).width + 2
		cdrawCvsCtx.fillRect((obj.Rect[0]) * widthratio + fonth,
			(obj.Rect[1]) * heightratio - fonth - 4, maxwight, fonth + 2)

		cdrawCvsCtx.fillStyle = '#FFFFFF'
		cdrawCvsCtx.fillText(EN_ObjectType[obj.Type],
			(obj.Rect[0]) * widthratio + fonth + 1,
			(obj.Rect[1]) * heightratio - 6, maxwight)
	} else {
		let maxwight = cdrawCvsCtx.measureText(CN_ObjectType[obj.Type]).width + 2
		cdrawCvsCtx.fillRect((obj.Rect[0]) * widthratio + fonth,
			(obj.Rect[1]) * heightratio - fonth - 4, maxwight, fonth + 3)

		cdrawCvsCtx.fillStyle = '#FFFFFF'
		cdrawCvsCtx.fillText(CN_ObjectType[obj.Type],
			(obj.Rect[0]) * widthratio + fonth + 1,
			(obj.Rect[1]) * heightratio - 6, maxwight)
	}
}

DrawSei.prototype.drawDetailWorker = function (obj, wtype) {
	let widthratio = this.drawCvs.width / this.ImageWidth
	let heightratio = this.drawCvs.height / this.ImageHeight
	let cdrawCvsCtx = this.cdrawCvsCtx

	//性别
	let x = (obj.Rect[0] + obj.Rect[2]) * widthratio + 2;
	let y = (obj.Rect[1]) * heightratio;
	let fonth = 14;

	var sex = 0;
	if (obj.hasOwnProperty("Texts") && (obj.Texts != null)) {
		if (obj.Texts[0] == '男' || obj.Texts[0] == 'male')
			sex = 1;
		else
			sex = 2;
	} else {
		sex = 0;
	}

	if (sex != 2) {
		cdrawCvsCtx.drawImage(this.man,
			obj.Rect[0] * widthratio,
			obj.Rect[1] * heightratio,
			obj.Rect[2] * widthratio,
			obj.Rect[3] * heightratio)
		if (sex == 0)
			return;

		cdrawCvsCtx.fillStyle = 'rgba(23,128,186,0.8)'
		if (wtype == 5)
			cdrawCvsCtx.fillRect(x, y, 16, 16);
		else
			cdrawCvsCtx.fillRect(x, y, 32, 16);



		cdrawCvsCtx.fillStyle = '#FFFFFF'
		if (wtype == 5)
			cdrawCvsCtx.fillText('男', x, y + 13);
		else
			cdrawCvsCtx.fillText('male', x, y + 16);

		let n = 0

		//年龄
		if (obj.Texts.length > 1 && obj.Texts[1]) {
			cdrawCvsCtx.drawImage(this.blue, x, y + segh);
			cdrawCvsCtx.drawImage(this.nan, x + picx - 1, y + segh + 2);
			cdrawCvsCtx.fillText(obj.Texts[1], x + wordx, y + segh + fonth + 3);
			++n;
		} else {
			return;
		}

		//帽子
		if (obj.Texts.length > 2 && obj.Texts[2]) {
			cdrawCvsCtx.drawImage(this.blue, x, y + segh + n * kuangh); //27递增
			cdrawCvsCtx.drawImage(this.maozi, x + picx - 2, y + segh + n * kuangh + 2 + 4); //帽子单独下移								
			cdrawCvsCtx.fillText(obj.Texts[2], x + wordx, y + segh + n * kuangh + fonth + 3);
			++n;
		} else {
			return;
		}

		//上衣
		if (obj.Texts.length > 3 && obj.Texts[3]) {
			cdrawCvsCtx.drawImage(this.blue, x, y + segh + n * kuangh);
			cdrawCvsCtx.drawImage(this.waitao, x + picx, y + segh + n * kuangh + 2);
			cdrawCvsCtx.fillText(obj.Texts[3], x + wordx, y + segh + n * kuangh + fonth + 3);
			++n;
		} else {
			return;
		}

		//下衣
		if (obj.Texts.length > 4 && obj.Texts[4]) {
			cdrawCvsCtx.drawImage(this.blue, x, y + segh + kuangh * n);
			cdrawCvsCtx.drawImage(this.changku, x + picx, y + segh + n * kuangh + 2);
			cdrawCvsCtx.fillText(obj.Texts[4], x + wordx, y + segh + n * kuangh + fonth + 3);
			++n;
		} else {
			return;
		}

		//眼镜
		if (obj.Texts.length > 5 && obj.Texts[5]) {
			cdrawCvsCtx.drawImage(this.blue, x, y + segh + n * kuangh);
			cdrawCvsCtx.drawImage(this.yanjing, x + picx - 2, y + segh + n * kuangh + 2 + 6); //眼镜单独下移
			cdrawCvsCtx.fillText(obj.Texts[5], x + wordx, y + segh + n * kuangh + fonth + 3);
			++n;
		} else {
			return;
		}

		//口罩
		if (obj.Texts.length > 6 && obj.Texts[6]) {
			cdrawCvsCtx.drawImage(this.blue, x, y + segh + n * kuangh);
			cdrawCvsCtx.drawImage(this.kouzhao, x + picx, y + segh + n * kuangh + 2);
			cdrawCvsCtx.fillText(obj.Texts[6], x + wordx, y + segh + n * kuangh + fonth + 3);
			++n;
		} else {
			return;
		}

		//拉杆箱
		if (obj.Texts.length > 7 && obj.Texts[7]) {
			cdrawCvsCtx.drawImage(this.blue, x, y + segh + n * kuangh);
			cdrawCvsCtx.drawImage(this.laganxiang, x + picx, y + segh + n * kuangh + 2);
			cdrawCvsCtx.fillText(obj.Texts[7], x + wordx, y + segh + n * kuangh + fonth + 3);
			++n;
		} else {
			return;
		}

		//背包
		if (obj.Texts.length > 8 && obj.Texts[8]) {
			cdrawCvsCtx.drawImage(this.blue, x, y + segh + n * kuangh);
			cdrawCvsCtx.drawImage(this.beibao, x + picx, y + segh + n * kuangh + 2);
			cdrawCvsCtx.fillText(obj.Texts[8], x + wordx, y + segh + n * kuangh + fonth + 3);
		} else {
			return;
		}

	} else {
		cdrawCvsCtx.drawImage(this.woman,
			obj.Rect[0] * widthratio,
			obj.Rect[1] * heightratio,
			obj.Rect[2] * widthratio,
			obj.Rect[3] * heightratio)

		cdrawCvsCtx.fillStyle = 'rgba(255,105,186,0.8)'
		if (wtype == 5)
			cdrawCvsCtx.fillRect(x, y, 16, 16);
		else
			cdrawCvsCtx.fillRect(x, y, 45, 16);

		cdrawCvsCtx.fillStyle = '#FFFFFF'
		if (wtype == 5)
			cdrawCvsCtx.fillText('女', x, y + 13);
		else
			cdrawCvsCtx.fillText('female', x, y + 16);

		let n = 0;

		//年龄
		if (obj.Texts.length > 1 && obj.Texts[1]) {
			cdrawCvsCtx.drawImage(this.red, x, y + segh);
			cdrawCvsCtx.drawImage(this.nv, x + picx - 1, y + segh + 2);
			cdrawCvsCtx.fillText(obj.Texts[1], x + wordx, y + segh + fonth + 3);
			++n;
		} else {
			return;
		}

		//帽子
		if (obj.Texts.length > 2 && obj.Texts[2]) {
			cdrawCvsCtx.drawImage(this.red, x, y + segh + kuangh * n); //27递增
			cdrawCvsCtx.drawImage(this.maozi2, x + picx - 2, y + segh + kuangh * n + 2 + 4); //帽子单独下移								
			cdrawCvsCtx.fillText(obj.Texts[2], x + wordx, y + segh + kuangh * n + fonth + 3);
			++n;
		} else {
			return;
		}

		//上衣
		if (obj.Texts.length > 3 && obj.Texts[3]) {
			cdrawCvsCtx.drawImage(this.red, x, y + segh + kuangh * n);
			cdrawCvsCtx.drawImage(this.waitao2, x + picx, y + segh + kuangh * n + 2);
			cdrawCvsCtx.fillText(obj.Texts[3], x + wordx, y + segh + kuangh * n + fonth + 3);
			++n;
		} else {
			return;
		}

		//下衣
		if (obj.Texts.length > 4 && obj.Texts[4]) {
			cdrawCvsCtx.drawImage(this.red, x, y + segh + kuangh * n);
			cdrawCvsCtx.drawImage(this.changku2, x + picx, y + segh + kuangh * n + 2);
			cdrawCvsCtx.fillText(obj.Texts[4], x + wordx, y + segh + kuangh * n + fonth + 3);
			++n;
		} else {
			return;
		}

		//眼镜
		if (obj.Texts.length > 5 && obj.Texts[5]) {
			cdrawCvsCtx.drawImage(this.red, x, y + segh + kuangh * n);
			cdrawCvsCtx.drawImage(this.yanjing2, x + picx - 2, y + segh + kuangh * n + 2 + 6) //眼镜单独下移
			cdrawCvsCtx.fillText(obj.Texts[5], x + wordx, y + segh + kuangh * n + fonth + 3);
			++n;
		} else {
			return;
		}

		//口罩
		if (obj.Texts.length > 6 && obj.Texts[6]) {
			cdrawCvsCtx.drawImage(this.red, x, y + segh + kuangh * n);
			cdrawCvsCtx.drawImage(this.kouzhao2, x + picx, y + segh + kuangh * n + 2);
			cdrawCvsCtx.fillText(obj.Texts[6], x + wordx, y + segh + kuangh * n + fonth + 3);
			++n;
		} else {
			return;
		}

		//拉杆箱
		if (obj.Texts.length > 7 && obj.Texts[7]) {
			cdrawCvsCtx.drawImage(this.red, x, y + segh + kuangh * n);
			cdrawCvsCtx.drawImage(this.laganxiang2, x + picx, y + segh + kuangh * n + 2);
			cdrawCvsCtx.fillText(obj.Texts[7], x + wordx, y + segh + kuangh * n + fonth + 3);
			++n;
		} else {
			return;
		}

		//背包
		if (obj.Texts.length > 8 && obj.Texts[8]) {
			cdrawCvsCtx.drawImage(this.red, x, y + segh + kuangh * n);
			cdrawCvsCtx.drawImage(this.beibao2, x + picx, y + segh + kuangh * n + 2);
			cdrawCvsCtx.fillText(obj.Texts[8], x + wordx, y + segh + kuangh * n + fonth + 3);
		} else {
			return;
		}
	}
}

DrawSei.prototype.drawDetail2Wheel = function (obj, wtype) {
	let widthratio = this.drawCvs.width / this.ImageWidth
	let heightratio = this.drawCvs.height / this.ImageHeight
	var cdrawCvsCtx = this.cdrawCvsCtx

	cdrawCvsCtx.drawImage(this.lianglun,
		obj.Rect[0] * widthratio,
		obj.Rect[1] * heightratio,
		obj.Rect[2] * widthratio,
		obj.Rect[3] * heightratio)

	let fonth = 14
	let x = (obj.Rect[0] + obj.Rect[2]) * widthratio + 2;
	let y = (obj.Rect[1]) * heightratio;

	var sex = 0;
	if (obj.hasOwnProperty("Texts") && (obj.Texts != null)) {
		if (obj.Texts[0] == '男' || obj.Texts[0] == 'male')
			sex = 1;
		else
			sex = 2;
	} else {
		sex = 0;
	}

	var temp;
	if (sex != 0) {
		if (wtype == 5)
			temp = '两轮车(' + obj.Texts[0] + ')';
		else
			temp = 'bike(' + obj.Texts[0] + ')';
	} else {
		if (wtype == 5)
			temp = '两轮车';
		else
			temp = 'bike';
	}

	let tempw = cdrawCvsCtx.measureText(temp).width + 2

	cdrawCvsCtx.fillStyle = 'rgba(113,152,90)'
	cdrawCvsCtx.fillRect(x, y, tempw, 16)
	cdrawCvsCtx.fillStyle = '#FFFFFF'
	if (wtype == 5)
		cdrawCvsCtx.fillText(temp, x, y + 13);
	else
		cdrawCvsCtx.fillText(temp, x, y + 13);

	cdrawCvsCtx.drawImage(this.twolunp, x, y + segh)
	cdrawCvsCtx.drawImage(this.twolun, x + picx - 1, y + segh + 2)
	if (obj.Type == 2) {
		if (wtype == 5)
			cdrawCvsCtx.fillText('自行车', x + wordx, y + segh + fonth + 3);
		else
			cdrawCvsCtx.fillText('bicycle', x + wordx, y + segh + fonth + 3);
	} else {
		if (wtype == 5)
			cdrawCvsCtx.fillText('摩托车', x + wordx, y + segh + fonth + 3);
		else
			cdrawCvsCtx.fillText('Motorcycle', x + wordx, y + segh + fonth + 3);
	}

	if (sex == 0)
		return;

	let n = 1

	//年龄
	if (obj.Texts.length > 1 && obj.Texts[1]) {
		cdrawCvsCtx.drawImage(this.twolunp, x, y + segh + n * kuangh);
		cdrawCvsCtx.drawImage(this.twolunren, x + picx - 1, y + segh + n * kuangh + 2);
		cdrawCvsCtx.fillText(obj.Texts[1], x + wordx, y + segh + fonth + n * kuangh + 3);
		++n;
	} else {
		return;
	}

	//帽子
	if (obj.Texts.length > 2 && obj.Texts[2]) {
		cdrawCvsCtx.drawImage(this.twolunp, x, y + segh + n * kuangh); //27递增
		cdrawCvsCtx.drawImage(this.twolunmaozi, x + picx - 2, y + segh + n * kuangh + 2 + 4); //帽子单独下移								
		cdrawCvsCtx.fillText(obj.Texts[2], x + wordx, y + segh + n * kuangh + fonth + 3);
		++n;
	} else {
		return;
	}
	//上衣
	if (obj.Texts.length > 3 && obj.Texts[3]) {
		cdrawCvsCtx.drawImage(this.twolunp, x, y + segh + n * kuangh);
		cdrawCvsCtx.drawImage(this.twolunwaitao, x + picx, y + segh + n * kuangh + 2);
		cdrawCvsCtx.fillText(obj.Texts[3], x + wordx, y + segh + n * kuangh + fonth + 3);
		++n;
	} else {
		return;
	}
	//下衣
	if (obj.Texts.length > 4 && obj.Texts[4]) {
		cdrawCvsCtx.drawImage(this.twolunp, x, y + segh + kuangh * n);
		cdrawCvsCtx.drawImage(this.twolunchangku, x + picx, y + segh + n * kuangh + 2);
		cdrawCvsCtx.fillText(obj.Texts[4], x + wordx, y + segh + n * kuangh + fonth + 3);
		++n;
	} else {
		return;
	}
	//眼镜
	if (obj.Texts.length > 5 && obj.Texts[5]) {
		cdrawCvsCtx.drawImage(this.twolunp, x, y + segh + n * kuangh);
		cdrawCvsCtx.drawImage(this.twolunyanjing, x + picx - 2, y + segh + n * kuangh + 2 + 6); //眼镜单独下移
		cdrawCvsCtx.fillText(obj.Texts[5], x + wordx, y + segh + n * kuangh + fonth + 3);
		++n;
	} else {
		return;
	}
	//口罩
	if (obj.Texts.length > 6 && obj.Texts[6]) {
		cdrawCvsCtx.drawImage(this.twolunp, x, y + segh + n * kuangh);
		cdrawCvsCtx.drawImage(this.twolunkouzhao, x + picx, y + segh + n * kuangh + 2);
		cdrawCvsCtx.fillText(obj.Texts[6], x + wordx, y + segh + n * kuangh + fonth + 3);
		++n;
	} else {
		return;
	}
	//拉杆箱
	if (obj.Texts.length > 7 && obj.Texts[7]) {
		cdrawCvsCtx.drawImage(this.twolunp, x, y + segh + n * kuangh);
		cdrawCvsCtx.drawImage(this.twolunlaganxiang, x + picx, y + segh + n * kuangh + 2);
		cdrawCvsCtx.fillText(obj.Texts[7], x + wordx, y + segh + n * kuangh + fonth + 3);
		++n;
	} else {
		return;
	}
	//背包
	if (obj.Texts.length > 8 && obj.Texts[8]) {
		cdrawCvsCtx.drawImage(this.twolunp, x, y + segh + n * kuangh);
		cdrawCvsCtx.drawImage(this.twolunbeibao, x + picx, y + segh + n * kuangh + 2);
		cdrawCvsCtx.fillText(obj.Texts[8], x + wordx, y + segh + n * kuangh + fonth + 3);
	} else {
		return;
	}
}

DrawSei.prototype.drawDetail3Wheel = function (obj, wtype) {
	let widthratio = this.drawCvs.width / this.ImageWidth
	let heightratio = this.drawCvs.height / this.ImageHeight
	var cdrawCvsCtx = this.cdrawCvsCtx

	cdrawCvsCtx.drawImage(this.sanlun,
		obj.Rect[0] * widthratio,
		obj.Rect[1] * heightratio,
		obj.Rect[2] * widthratio,
		obj.Rect[3] * heightratio)

	let fonth = 14
	let x = (obj.Rect[0] + obj.Rect[2]) * widthratio + 2
	let y = (obj.Rect[1]) * heightratio


	cdrawCvsCtx.fillStyle = '#FF8C00'
	cdrawCvsCtx.fillRect(x, y, 44, 16)
	cdrawCvsCtx.fillStyle = '#FFFFFF';
	if (wtype == 5)
		cdrawCvsCtx.fillText('三轮车', x, y + 13);
	else
		cdrawCvsCtx.fillText('tricycle', x, y + 13);

	if (!obj.hasOwnProperty("Texts") || (obj.Texts == null))
		return;


	let n = 0;
	if (obj.Texts.length > 0 && obj.Texts[0]) {
		cdrawCvsCtx.drawImage(this.sanlunp, x, y + segh + n * kuangh);
		cdrawCvsCtx.drawImage(this.sanlunche, x + picx - 1, y + segh + n * kuangh + 2);
		cdrawCvsCtx.fillText(obj.Texts[0], x + wordx, y + segh + fonth + n * kuangh + 3);
		++n;
	} else {
		return;
	}


	if (obj.Texts.length > 1 && obj.Texts[1]) {
		cdrawCvsCtx.drawImage(this.sanlunp, x, y + segh + n * kuangh);
		cdrawCvsCtx.drawImage(this.sanlunren, x + picx - 1, y + segh + n * kuangh + 2);
		cdrawCvsCtx.fillText(obj.Texts[1], x + wordx, y + segh + fonth + n * kuangh + 3);
	}
}

DrawSei.prototype.drawDetailCar = function (obj, wtype) {
	let widthratio = this.drawCvs.width / this.ImageWidth
	let heightratio = this.drawCvs.height / this.ImageHeight
	var cdrawCvsCtx = this.cdrawCvsCtx

	cdrawCvsCtx.drawImage(this.car,
		obj.Rect[0] * widthratio,
		obj.Rect[1] * heightratio,
		obj.Rect[2] * widthratio,
		obj.Rect[3] * heightratio)



	let x = (obj.Rect[0] + obj.Rect[2]) * widthratio + 2
	let y = (obj.Rect[1]) * heightratio

	cdrawCvsCtx.fillStyle = '#FFB90F';
	if (wtype == 5) {
		cdrawCvsCtx.fillRect(x, y, 30, 16)
		cdrawCvsCtx.fillStyle = '#FFFFFF'
		cdrawCvsCtx.fillText('汽车', x, y + 13)
	} else {
		cdrawCvsCtx.fillRect(x, y, 22, 16)
		cdrawCvsCtx.fillStyle = '#FFFFFF'
		cdrawCvsCtx.fillText('vehicle', x, y + 13)
	}

	let carname;
	if (wtype == 5) {
		switch (obj.Type) {
			case 4:
				carname = '轿车'
				break;
			case 5:
				carname = '三轮车'
				break;
			case 6:
				carname = '大客车'
				break;
			case 7:
				carname = '面包车'
				break;
			case 8:
				carname = '卡车'
				break;
			default:
				carname = '车'
		}
	} else {
		switch (obj.Type) {
			case 4:
				carname = 'car'
				break;
			case 5:
				carname = 'tricycle'
				break;
			case 6:
				carname = 'Bus'
				break;
			case 7:
				carname = 'Van'
				break;
			case 8:
				carname = 'Truck'
				break;
			default:
				carname = 'car'
		}
	}

	let n = 0;
	let fonth = 14;
	cdrawCvsCtx.drawImage(this.carp, x, y + segh);
	cdrawCvsCtx.drawImage(this.cartype, x + picx - 1, y + segh + 2);
	cdrawCvsCtx.fillText(carname, x + wordx, y + segh + fonth + n * kuangh + 3);
	++n;

	if (!obj.hasOwnProperty("Texts") || (obj.Texts == null))
		return;

	//车型
	if (obj.Texts.length > 0 && obj.Texts[0]) {
		cdrawCvsCtx.drawImage(this.carp, x, y + segh + n * kuangh);
		cdrawCvsCtx.drawImage(this.chexing, x + picx - 1, y + segh + n * kuangh + 2);
		cdrawCvsCtx.fillText(obj.Texts[0], x + wordx, y + segh + fonth + n * kuangh + 3);
		++n;
	} else {
		return;
	}

	//车牌颜色
	if (obj.Texts.length > 1 && obj.Texts[1]) {
		cdrawCvsCtx.drawImage(this.carp, x, y + segh + n * kuangh); //27递增
		cdrawCvsCtx.drawImage(this.carpaitype, x + picx - 2, y + segh + n * kuangh + 2 + 4); //帽子单独下移								
		cdrawCvsCtx.fillText(obj.Texts[1], x + wordx, y + segh + n * kuangh + fonth + 3);
		++n;
	} else {
		return;
	}

	//车牌
	if (obj.Texts.length > 2 && obj.Texts[2]) {
		cdrawCvsCtx.drawImage(this.carp, x, y + segh + n * kuangh);
		cdrawCvsCtx.drawImage(this.carpai, x + picx, y + segh + n * kuangh + 2);
		cdrawCvsCtx.fillText(obj.Texts[2], x + wordx, y + segh + n * kuangh + fonth + 3);
		++n;
	} else {
		return;
	}

	//车身颜色
	if (obj.Texts.length > 3 && obj.Texts[3]) {
		cdrawCvsCtx.drawImage(this.carp, x, y + segh + kuangh * n);
		cdrawCvsCtx.drawImage(this.carcolor, x + picx, y + segh + n * kuangh + 2);
		cdrawCvsCtx.fillText(obj.Texts[3], x + wordx, y + segh + n * kuangh + fonth + 3);
		++n;
	}
}

DrawSei.prototype.drawRectDetail = function (obj, wtype) {
	if (this.showPic) {
		switch (obj.Type) {
			case 1:
				this.drawDetailWorker(obj, wtype);
				break;
			case 2:
			case 3:
				this.drawDetail2Wheel(obj, wtype);
				break;
			case 5:
				this.drawDetail3Wheel(obj, wtype);
				break;
			default:
				this.drawDetailCar(obj, wtype);
				break;
			case 5:

		}
	} else {
		let widthratio = this.drawCvs.width / this.ImageWidth
		let heightratio = this.drawCvs.height / this.ImageHeight
		var cdrawCvsCtx = this.cdrawCvsCtx

		cdrawCvsCtx.strokeRect(
			obj.Rect[0] * widthratio,
			obj.Rect[1] * heightratio,
			obj.Rect[2] * widthratio,
			obj.Rect[3] * heightratio)

		if (!obj.hasOwnProperty("Texts") || (obj.Texts == null))
			return;

		let fonth = Math.max(12, Math.min((obj.Rect[2] * widthratio / 8), 24));
		cdrawCvsCtx.font = fonth + 'px ' + "Arial";
		let fontu = fonth / 3
		let fontb = fonth / 8

		let maxwight = 0
		for (let j = 0; j < obj.Texts.length; j++) {
			if (cdrawCvsCtx.measureText(obj.Texts[j]).width > maxwight)
				maxwight = cdrawCvsCtx.measureText(obj.Texts[j]).width
		}

		if (maxwight < obj.Rect[2] * widthratio) { //画里面
			for (let j = 0; j < obj.Texts.length; j++) {
				cdrawCvsCtx.fillStyle = 'rgba(63,63,63,0.5)'
				cdrawCvsCtx.fillRect(obj.Rect[0] * widthratio,
					obj.Rect[1] * heightratio + j * (fonth + fontb), maxwight, fonth)


				if (!obj.Texts[j])
					obj.Texts[j] = '其它'

				cdrawCvsCtx.fillStyle = '#FFFFFF'
				cdrawCvsCtx.fillText(obj.Texts[j],
					obj.Rect[0] * widthratio,
					obj.Rect[1] * heightratio + (j + 1) * (fonth + fontb) - fontu)

			}
		} else {
			for (let j = 0; j < obj.Texts.length; j++) {
				cdrawCvsCtx.fillStyle = 'rgba(63,63,63,0.5)'
				cdrawCvsCtx.fillRect((obj.Rect[0] + obj.Rect[2]) * widthratio,
					obj.Rect[1] * heightratio + j * (fonth + fontb), maxwight, fonth)


				if (!obj.Texts[j])
					obj.Texts[j] = '其它'

				cdrawCvsCtx.fillStyle = '#FFFFFF'
				cdrawCvsCtx.fillText(obj.Texts[j],
					(obj.Rect[0] + obj.Rect[2]) * widthratio,
					(obj.Rect[1]) * heightratio + (j + 1) * (fonth + fontb) - fontu)

			}

		}
	}
}

DrawSei.prototype.draw = function (obj) {
	if (obj.hasOwnProperty("Objects") == false || !obj.Objects) {
		return
	}
	let cdrawCvsCtx = this.cdrawCvsCtx

	this.cdrawCvs.width = this.drawCvs.width;
	this.cdrawCvs.height = this.drawCvs.height;
	cdrawCvsCtx.clearRect(0, 0, this.drawCvs.width, this.drawCvs.height);

	for (let i = 0; i < obj.Objects.length; i++) {
		obj.Objects[i].Type -= 1;
		switch (obj.Objects[i].Type) {
			case 1: {
				if ((this.showtype & 0x10) == 0)
					continue;
				else {					
					cdrawCvsCtx.strokeStyle = '#0000FF' //行人	蓝色	
					break;
				}
			}
			case 4:
			case 6:
			case 7:
			case 8: {
				if ((this.showtype & 0x08) == 0)
					continue
				else {					
					cdrawCvsCtx.strokeStyle = '#00FF00' //汽车 绿色		
					break
				}
			}
			case 2:
			case 3: {
				if ((this.showtype & 0x04) == 0)
					continue;
				else {					
					cdrawCvsCtx.strokeStyle = '#FF0000' //两轮车 红色	
					break;
				}
			}
			case 5: {
				if ((this.showtype & 0x02) == 0)
					continue
				else {					
					cdrawCvsCtx.strokeStyle = '#FF8C00' //三轮车 橙色		
					break
				}
			}
			case 9: {
				if ((this.showtype & 0x01) == 0)
					continue
				else {					
					cdrawCvsCtx.strokeStyle = '#FFD700' //人脸 黄色	
					break
				}
			}
			default:
				console.error('not support type.')
				continue
		}

		this.ImageWidth = obj.ImageWidth
		this.ImageHeight = obj.ImageHeight

		switch (obj.DrawType) {
			case 1:
				this.drawRect(obj.Objects[i])
				break;
			case 2:
			case 3:
				this.drawRectWords(obj.Objects[i], obj.DrawType)
				break;
			case 4:
			case 5:
				this.drawRectDetail(obj.Objects[i], obj.DrawType)
				break;
			default:
				console.log('unsupport drawtype!')
		}
	}

	this.drawCvsCtx.clearRect(0, 0, this.drawCvs.width, this.drawCvs.height);
	this.drawCvsCtx.drawImage(this.cdrawCvs, 0, 0)
}

DrawSei.prototype.clear = function (obj) {
	this.drawCvsCtx.clearRect(0, 0, this.drawCvs.width, this.drawCvs.height)
}