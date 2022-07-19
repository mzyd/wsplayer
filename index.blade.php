<!DOCTYPE html>
<html lang="en">
<head>
    <title>WS播放</title>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1">
    <link href="http://mapopen.cdn.bcebos.com/github/BMapGLLib/DrawingManager/src/DrawingManager.min.css" rel="stylesheet">
    <link rel="stylesheet" href="/home/css/base.css?v={{time()}}">
    <link rel="stylesheet" href="/home/layui/css/layui.css">
    <script src="/home/js/jquery-2.1.4.min.js"></script>
    <script src="/layer/layer.js"></script>
    <script src="/home/js/common.js?v={{time()}}"></script>
    <script type='text/javascript' src="/home/js/wsPlayer/wsPlayer.js"></script>
	<script type='text/javascript' src="/home/js/wsPlayer/SuperRender_20.js"></script>
	<script type='text/javascript' src="/home/js/wsPlayer/DrawSei.js"></script>

    <style>
        .body{background-color: #151a1e;}
        .action_bar {
            position: absolute;
            display: block;
            width: 100%;
            height: 24px;
            line-height: 24px;
            background: rgba(0, 0, 0, .4);
            bottom: 0;
            color: #fff;
            z-index: 2;
            cursor: pointer;
            text-align: right;
            margin-bottom: 0px;
        }
        .wsplayer{
            width: 100%;
            height: 100%;
        }
        .invisible-scrollbar::-webkit-scrollbar {
            display: none;
        }
    </style>
</head>
<body class="body">
<div class="wsplayer">
    <div class="close hide"><p></p></div>
    <canvas id="videoCanvas" class="canvas" width="100%" height="100%"></canvas>
    <canvas id="drawCanvas" class="canvas" width="100%" height="100%"></canvas>
    <div class="action_bar">
        <!-- <span class="btn wspause" >
            <img src="/home/img/icon_video_stop.png" alt="" class="stopVideoImg" onclick="videoStop()" >
            <img src="/home/img/icon_video_play.png" alt="" class="startVideoImg"style="display:none" onclick="videoPlay()" >
        </span> -->
        <span class="btn fullscreen" onclick="handleFullScreen()">
            <img src="/home/img/icon_fullscreen.png" alt="" class="fullVideoImg" >
            <img src="/home/img/icon_smallscreen.png" alt="" class="smallVideoImg" style="display: none;">
        </span>
    </div>
   
</div>
</body>
</html>
<script>
    var wsUrl = "";
    var deviceId = @json($cameraId);
    var url = '{{url('video/getplayurl')}}';
    videoPlay();
    function videoPlay(){
        $(".stopVideoImg").show();
        $(".startVideoImg").hide();
        console.log("videoPlay")
        $pc.ajax(url, {deviceId:deviceId}, function (res) {
            if (res.code == 1) {
                wsUrl = res.data.wsUrl;
                var player = new wsPlayer("videoCanvas", "drawCanvas", "/home/js/wsPlayer", statusCB, true, true);
                player.start(wsUrl)
            } else {
                $pc.error(res.msg)
            }
        })
    }

    function fullVideoShow(){
        var cvs = document.getElementById("videoCanvas");
        var cvs2 = document.getElementById("drawCanvas");
        $(".fullVideoImg").toggle();
        $(".smallVideoImg").toggle();
        var videoWidthMin  = $(".wsplayer").width();
        var videoHeightMin  = $(".wsplayer").height();

        if(cvs.width > videoWidthMin+5){
            cvs.width = videoWidthMin
            cvs.height = videoHeightMin
        }else{

            parent.layer.open({
                type: 1,
                title:"视频播放"
                ,area:["100%","100%"]
                ,offset: 'auto' //具体配置参考：http://www.layui.com/doc/modules/layer.html#offset
                ,id: 'layerFullScreen' //防止重复弹出
                ,zIndex: layer.zIndex //重点1
                ,content: '<canvas id="videoCanvasfull" class="canvas" width="100%" height="100%"></canvas><canvas id="drawCanvasfull" class="canvas" width="100%" height="100%"></canvas>'
               // ,btn: '关闭'
                //, content: '{{url('device/video/getlive')}}' + '?deviceId=' + cameraId 
                ,btnAlign: 'c' //按钮居中
                ,shade: 0 //不显示遮罩
                ,yes: function(){
                    layer.closeAll();
                }
            });
             var player = new wsPlayer("videoCanvasfull", "drawCanvasfull", "/home/js/wsPlayer", statusCB, true, true);
            player.start(wsUrl);

        }
        console.log(cvs.width)
    }
   
    function statusCB(code, msg) {
        var cvs = document.getElementById("videoCanvas");
        var cvs2 = document.getElementById("drawCanvas");
        var videoWidth  = $(".wsplayer").width();
        var videoHeigth  = $(".wsplayer").height();
        cvs.width = videoWidth-1;
        cvs.height = videoHeigth-1;
        cvs2.width = 0;
        cvs2.height = 0;
    }

    $(window).resize(function () {
        statusCB()
    })


    //定义一个变量进行判断，默认false 非全屏状态
    let exitFullscreen = false
    // 全屏事件
    function handleFullScreen() {
        let element = document.documentElement;
        if(this.fullscreen) {
            if(document.exitFullscreen) {
                document.exitFullscreen();
            } else if(document.webkitCancelFullScreen) {
                document.webkitCancelFullScreen();
            } else if(document.mozCancelFullScreen) {
                document.mozCancelFullScreen();
            } else if(document.msExitFullscreen) {
                document.msExitFullscreen();
            }
        } else {
            if(element.requestFullscreen) {
                element.requestFullscreen();
            } else if(element.webkitRequestFullScreen) {
                element.webkitRequestFullScreen();
            } else if(element.mozRequestFullScreen) {
                element.mozRequestFullScreen();
            } else if(element.msRequestFullscreen) {
                // IE11
                element.msRequestFullscreen();
            }
        }
    }
</script>
