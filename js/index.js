(function () {
    let music = $('#music')[0];
    let timer = null;

    // 1.计算中间区域高度
    function computedMain() {
        let winH = document.documentElement.clientHeight;
        let headerH = $('.header')[0].offsetHeight;
        let footerH = $('.footer')[0].offsetHeight;

        let fontSize = parseFloat(document.documentElement.style.fontSize); // 获取html字体大小
        let mainH = (winH - headerH - footerH) / fontSize - 0.5 + 'rem';
        $('.main').css('height', mainH);
    }
    computedMain();
    window.addEventListener('resize', computedMain);

    // 2.请求数据
    $.ajax({
        url: 'json/lyric.json',
        type: 'get',
        async: false,
        success: function (data) {
            bindHtml(data.lyric)
        },
    });

    // 3.数据绑定
    function bindHtml(data) {
        data = data.replace(/&#(\d+);/g, function (res, a) {
            switch (parseFloat(a)) {
                case 32:
                    return " ";
                case 40:
                    return '(';
                case 41:
                    return ')';
                case 45:
                    return '-';
                default:
                    return res;
            }
        });
        let arr = [];
        data.replace(/\[(\d+)&#58;(\d+)&#46;\d+\]([^&#]+)(?:(&#\d+))/g, function (res, min, sec, val) {
            arr.push({
                min,
                sec,
                val
            });
        })
        let str = ``;
        for (let i = 0; i < arr.length; i++) {
            let cur = arr[i];
            str += `<p data-min = '${cur.min}' data-sec = '${cur.sec}'>${cur.val}</p>`;
        };
        $('.wrap').html(str);
        // 歌词渲染完毕,下面渲染的时歌词的时长
        music.addEventListener('canplay', function () {
            $('#right').html(format(music.duration))
        })
    }

    function format(time) {
        let min = Math.floor(time / 60);
        let sec = Math.floor(time % 60);
        min = min < 10 ? '0' + min : min;
        sec = sec < 10 ? '0' + sec : sec;
        return min + ':' + sec;
    }

    // 4.给按钮绑定点击事件(用tap没有延迟)
    $('#musicBtn').tap(function () {
        if (music.paused) {
            music.play();
            $(this).addClass('select');
            timer = setInterval(computedTime, 1000)
        } else {
            music.pause();
            $(this).removeClass('select');
            clearInterval(timer);
        }
    });

    
    let flag = 0;
    let curTop = 0;
    function computedTime() {
        let curTime = music.currentTime;
        let duration = music.duration;
        if (curTime >= duration) {
            clearInterval(timer);
            $('#musicBtn').removeClass('select');
        }

        $('#left').html(format(curTime));
        $('.lineBg').css('width', curTime / duration * 100 + '%');

        // 歌词滚动
        let min = format(curTime).split(':')[0];
        let sec = format(curTime).split(':')[1];

        let allP = document.getElementsByTagName('p');

        for (let i = 0; i < allP.length; i++) {
            let curP = allP[i];
            let lyricMin = curP.getAttribute('data-min');
            let lyricSec = curP.getAttribute('data-sec');
            let lyricTime = Math.round(lyricMin * 60 + lyricSec);

            if (lyricTime === Math.round(curTime)) {
                // if(lyricMin===min && lyricSec===sec){
                $(curP).addClass('select').siblings().removeClass('select');
                flag++;
                
                if (flag > 5) {
                    curTop -= 0.84;
                    $('.wrap').css('top', curTop + 'rem');
                }
            }
        }
    }





})()