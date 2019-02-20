/**
 * limefamily DragAuth widget.
 *
 *
 * @author bianjunping
 * @since 1.0
 */
(function ($, Base64) {
    'use strict';
    var pluginName = "dragAuth",
        defaults = {
            "baseUrl": '/edusoho/api/drag_captcha',
            "requestOtption": {
                "async": true,
                "crossDomain": true,
                "headers": {
                    "Accept": "application/vnd.edusoho.v2+json",
                    // "cache-control": "no-cache",
                    // "Postman-Token": "a8d07797-7410-4b79-98eb-f342f4087bfa"
                },
            },
            "boxStyle": {
                "width": "100%",
                "height": "250px",
            },
            "dragImgBoxStyle": {
                "width": "320px",
                "height": "144px",
            },
            "switchBoxStyle": {
                "width": "320px",
                "height": "40px",
            },
            "loadingStyle": {
                "background": "url('./images/loading-bg.png)no-repeat",
                "background-color": "#f7f9fa",
                "background-position": "50%",
                "background-size": 'cover',
                // "background": "url('../images/qm.log.jpg')no-repeat",
                // "background-size": "45%",
                // "background-position": "50% 0px"
            }
        };

    var htmllayout = function(response){
        if(!response){
            throw new Error('没有图片地址')
        }
        return  `
            <div class="drag-app show-loading">
                <div class="drag-img-box">
                    <div class="drag-img">
                        <img src="${response.url}" alt="大图"/>
                    </div>
                    <div class="drag-btn">
                        <img src="${response.jigsaw}" alt="小图"/>
                    </div>
                </div>
                <div class="drag-loading-box">
                    <div class="loading">
                        <img src="./images/loading.gif" />
                    </div>
                    <p>加载中...</p>
                </div>
                <div class="drag-switch-box">
                    <div class="switch-btn-left"></div>
                    <div class="switch-btn-bg"><p>向右滑动完成拼图</p></div>
                    <div class="switch-btn"><p></p></div>
                </div>
            </div>
        `;
    };
    var gridEvents = {

    };

    var Plugin = function (element, options) {

        this.element = element;
        this.options = $.extend({}, defaults, options);
        this._name = pluginName;
        this.loading = true;
        this.init();
    }

    Plugin.prototype.init = function(){
        $('<link rel="stylesheet" href="./drag-auth.css">').appendTo('head')[0];
        // 请求图片数据
        this.getAuthData(true, response => {
            
            // 渲染DOM结构
            $(this.element).append(htmllayout(response));
            this.loading = false;
            $('.drag-switch-box').removeClass('loading error success');
            if(response){
                this.initEv();
                $('.drag-app').removeClass('show-loading');
                $('.drag-app').addClass('show-img');
            }
        });
    }
    Plugin.prototype.getAuthData = function(init,fn){
        var setTings = {
            "url": this.options.baseUrl,
            "method": "POST",
            ...this.options.requestOtption,
        }
        var _this = this;
        this.loading = true;
		$.ajax(setTings).done(function (response) {
            if(!init){
                $('.drag-switch-box').removeClass('loading error success');
                $('.drag-switch-box .switch-btn, .drag-img-box .drag-btn, .drag-switch-box .switch-btn-left').css({
                    'left':  '0px',
                });
                $('.drag-switch-box .switch-btn-left').css({
                    'width': '0px',
                });
                
            }
			
            _this.authData = response;
            
			fn && fn(response)
		}).fail(function(err){
            fn && fn(null)
        });
    }
    Plugin.prototype.initEv = function(){
        let _this = this;
		$('.drag-switch-box .switch-btn').mousedown(function(e) {
            if(_this.loading){
                return false;
            }
            _this.loading = true;
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
                $('.drag-app').removeClass('show-img');
                $('.drag-app').addClass('show-loading');
                
				$('.drag-switch-box').addClass('loading');
				// 提交数据进行验证
				_this.postAuth(_dataStr, type => {
					
					$('.drag-switch-box').removeClass('moveing loading error success');

					if(type === 'err'){
						$('.drag-switch-box').addClass('error');
						_this.getAuthData(false, function(response){
                            _this.updateImgHtml(response);
                            $('.drag-app').removeClass('show-loading');
                            $('.drag-app').addClass('show-img');
                        });
					}else{
						$('.drag-switch-box').addClass('success');
                    }
                    if (typeof _this.options['fn'] == 'function') {
                        _this.options['fn']($(this))
                    }
				})
			});
		});
    }
    Plugin.prototype.postAuth = function(param, fn){
        var setTings = {
            "url": this.options.baseUrl+"/"+param,
            "method": "GET",
            ...this.options.requestOtption,
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
    }
    Plugin.prototype.updateImgHtml = function(rs){
        this.loading = false;
        $('.drag-img img')[0].src = rs.url;
        $('.drag-btn img')[0].src = rs.jigsaw;
    }
    $.fn[pluginName] = function (options) {
        return this.each(function () {
            var option = typeof options == 'object' && options
            if (!$.data(this, "plugin_" + pluginName)) {
                $.data(this, "plugin_" + pluginName, new Plugin(this, option));
            }
        });
    };
})(jQuery,Base64);