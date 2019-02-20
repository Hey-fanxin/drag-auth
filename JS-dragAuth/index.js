/**
 * 滑动拼图验证
 *
 * This is the JavaScript widget.
 *
 * @author bianjunping
 * @since 1.0
 */

(function(win, $){
    'use strict';

    if(typeof $ == 'undefined'){
        throw new Error('必须依赖 jquery')
    }

    const defaultOptions = require('./defaultOption.config.js');
    const addCssFile = require('./addCssFile.js');
    const Base64 = require('./base64.min.js')


    var DragAuth = function(element,option = {}){

        this.eleBox = document.getElementById(element);
        
        this.options = Object.assign({}, defaultOptions, option);

        addCssFile('./drag-auth.css');

        this.initHtml();

        this.postImgs(rs => {
            
            this.dragEv();
        });

        return this;
    };
    DragAuth.prototype.initHtml = function(){
        this.addCss(this.eleBox,this.options.default.boxStyle);
        this.eleBox.setAttribute('class','drag-app show-img');

        var dragImgBox = document.createElement('div');
            dragImgBox.setAttribute('class', 'drag-img-box');
        
        var dragImg = document.createElement('div');
            dragImg.setAttribute('class', 'drag-img');

        var dragBtn = document.createElement('div');
            dragBtn.setAttribute('class', 'drag-btn');

        var maxImg = document.createElement('img');
        var minImg = document.createElement('img');
        this.maxImg = maxImg;
        this.minImg = minImg;

        dragImg.appendChild(maxImg);
        dragBtn.appendChild(minImg);

        dragImgBox.appendChild(dragImg);
        dragImgBox.appendChild(dragBtn);

        this.eleBox.appendChild(dragImgBox);

        var dragLoadingBox = document.createElement('div');
            dragLoadingBox.setAttribute('class', 'drag-loading-box');
            this.addCss(dragLoadingBox, this.options.default.loadingStyle);

        var loading = document.createElement('div');
            loading.setAttribute('class', 'loading');

        var loadingIcon = document.createElement('img');
            loadingIcon.src = './images/loading.gif';

        var loadingText = document.createElement('p');
            loadingText.innerText = '加载中...';

        loading.appendChild(loadingIcon);

        dragLoadingBox.appendChild(loading);
        dragLoadingBox.appendChild(loadingText);

        this.eleBox.appendChild(dragLoadingBox);

        var dragSwitchBox = document.createElement('div');
            dragSwitchBox.setAttribute('class', 'drag-switch-box');

        var switchBtnLeft = document.createElement('div');
            switchBtnLeft.setAttribute('class', 'switch-btn-left');

        var switchBtnBg = document.createElement('div');
            switchBtnBg.setAttribute('class', 'switch-btn-bg');
            var switchBtnBgText = document.createElement('p');
                switchBtnBgText.innerTextb = '向右滑动完成拼图';
            switchBtnBg.appendChild(switchBtnBgText);

        var switchBtn = document.createElement('div');
            switchBtn.setAttribute('class', 'switch-btn');

        dragSwitchBox.appendChild(switchBtnLeft);
        dragSwitchBox.appendChild(switchBtnBg);
        dragSwitchBox.appendChild(switchBtn);

        this.eleBox.appendChild(dragSwitchBox);
    };
    DragAuth.prototype.postImgs = function(fn){
        var setTings = {
            "url": this.options.default.baseUrl,
            "method": "POST",
            ...this.options.default.requestOtption,
        }
        var _this = this;
		$.ajax(setTings).done(function (response) {
			console.log(response);
			$('.drag-switch-box').removeClass('loading error success');
			$('.drag-switch-box .switch-btn, .drag-img-box .drag-btn, .drag-switch-box .switch-btn-left').css({
				'left':  '0px',
			});
			$('.drag-switch-box .switch-btn-left').css({
				'width': '0px',
            });

            _this.eleBox.setAttribute('class','drag-app show-img');
            _this.authData = response;
            _this.updateHtml(response);

			fn && fn(response)
		});
    };
    DragAuth.prototype.getAuth = function(param,fn){
        var setTings = {
            "url": this.options.default.baseUrl+"/"+param,
            "method": "POST",
            ...this.options.default.requestOtption,
        }
		  
		$.ajax(setTings)
		.done(function (response) {
			console.log(response, '成功');
			fn && fn('success');
		})
		.fail(function(err){
			console.log(err,'失败');
			fn && fn('err');
		});
    };
    DragAuth.prototype.updateHtml = function(rs){
        this.maxImg.src = rs.url;
        this.minImg.src = rs.jigsaw;
    }
    DragAuth.prototype.dragEv = function(){
        var _this = this;
        $('.drag-switch-box .switch-btn').mousedown(function(e) {
			// e.pageX
			var positionDiv = $(this).offset();
			var distenceX = e.pageX - positionDiv.left;
			$('.drag-switch-box').addClass('moveing')
			var _X = 0;
			
			$(document).mousemove(function(e) {
				var x = e.pageX - distenceX - positionDiv.left;
				var endL = $('.drag-switch-box').width() - $('.drag-switch-box .switch-btn').width();
				_X = x = x < 0 ? 0 : x > endL ? endL : x;

				$('.drag-switch-box .switch-btn, .drag-img-box .drag-btn').css({
					'left': parseInt(x) + 'px',
				});
				$('.drag-switch-box .switch-btn-left').css({
					'width': parseInt(x + 40 -1) + 'px',
				});
			});
		
			$(document).mouseup(function() {
				
				//  事件结束时 释放移动事件
				$(document).off('mousemove');
				$(document).off('mouseup');

				//  获取提交数据对象并字符串序列化后 base64 加密在进行逆序
				var _dataStr = JSON.stringify({token: _this.authData.token, captcha: _X});
				_dataStr = Base64.encode(_dataStr);
				_dataStr = _dataStr.split('').reverse().join("");

				// 隐藏图片
                this.eleBox.setAttribute('class','drag-app show-loading');
                
				$('.drag-switch-box').addClass('loading');
				// 提交数据进行验证
				_this.getAuth(_dataStr, type => {
					
					$('.drag-switch-box').removeClass('moveing loading error success');

					if(type === 'err'){
						$('.drag-switch-box').addClass('error');
						_this.init();
					}else{
						$('.drag-switch-box').addClass('success');
                    }
                    _this.authStatus && _this.authStatus(type);
				})
			});
		});
    };
    DragAuth.prototype.addCss = function(ele,styles){
        for (var i in styles) {
			ele.styles[i] = styles[i];
		};
    };
    module.exports = DragAuth;
})(window, jQuery)