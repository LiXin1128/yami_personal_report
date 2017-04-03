/**
 * Yamibuy
 */
(function(root, factory) {

	if (typeof jQuery == "undefined") {
		throw new Error("jQuery is required.");
	}

	if (typeof define === 'function' && define.amd) {
		return define('yamibuy', [ 'jquery' ], function($) {
			return factory($, root);
		});
	} else {
		return factory(root.jQuery, root);
	}

}(window, function($, window) {
	(function($) {
		$.yamibuy = {};
	}(jQuery));

	(function($, undefined) {
		var common = {};
		$.yamibuy.common = common = {
			_loadDefaults : {
				method : "GET",
				dataType : "JSON",
				crossDomain : true,
				enctype : "application/x-www-form-urlencoded"
			},
			doAjax : function(url, data, doneFn, options){
				if(typeof options === "undefined"){
					options = {};
				}
				$.ajax({
					cache : false,
					url : url,
					data : data,
					beforeSend : function() {
						if(options.showloading == true){
							common.showLoading();
						}
					},
					complete : function(){
						if(options.showloading == true){
							common.hideLoading();
						}
					},
					enctype : typeof options.enctype != "undefined" ? options.enctype : this._loadDefaults.enctype,
					dataType : typeof options.dataType != "undefined" ? options.dataType : this._loadDefaults.dataType,
					method  :	typeof options.method != "undefined" ? options.method : this._loadDefaults.method,
					crossDomain : typeof options.crossDomain != "undefined" ? options.crossDomain : this._loadDefaults.crossDomain,
				}).done(doneFn).fail(function(jqXHR, textStatus, errorThrown) {
					// common.alert('数据传输错误或服务连接异常。');
				});	
			},
			sleep : function(milliseconds) {
				  var start = new Date().getTime();
				  for (var i = 0; i < 1e7; i++) {
				    if ((new Date().getTime() - start) > milliseconds){
				      break;
				    }
				  }
			},
			isEmpty : function (str) {
				if(typeof str === "undefined"){
					return true;
				}else if (str == null){
					return true;
				}else if (str === ''){
					return true
				}else{
					return false;
				}
			},
			validateEmail : function (email) {
			    var re = /^([\w-]+(?:\.[\w-]+)*)@((?:[\w-]+\.)*\w[\w-]{0,66})\.([a-z]{2,6}(?:\.[a-z]{2})?)$/i;
			    return re.test(email);
			},
			getCookie : function(cname) {
				var name = cname + "=";
				var ca = document.cookie.split(';');
				for (var i = 0; i < ca.length; i++) {
					var c = ca[i];
					while (c.charAt(0) == ' ')
						c = c.substring(1);
					if (c.indexOf(name) == 0)
						return c.substring(name.length, c.length);
				}
				return "";
			},
			setCookie : function(cname, cvalue, exdays) {
				var d = new Date();
				d.setTime(d.getTime() + (exdays * 24 * 60 * 60 * 1000));
				var expires = "expires=" + d.toUTCString();
				document.cookie = cname + "=" + cvalue + "; " + expires;
			},
			isIpad : function(){
				return navigator.userAgent.match(/iPad/i) != null;
			},
			showLoading : function() {
				if($(".loading-mask").length){
					return;
				}
				$('<div class="loading-mask"><div class="cssload-spin-box"></div></div>').appendTo(document.body);
			},
			hideLoading : function() {
				$(".loading-mask").remove();
			},
			alert : function(message, ok_fn){
				if($('#alert-popup').length){
					$('#alert-popup').remove();
				}
				
				$('<div id="alert-popup" class="popup-mask" style="display: block;"><div class="login-popup"><div class="alert cf"><p class="alert-text">' + message + '</p><a id="OK" href="javascript:;" class="orange-btn prim-btn">确定</a><a class="fvpp-close">&#10005;</a></div></div></div>').appendTo(document.body);
				$('#alert-popup a').on('click', function(){
					$('#alert-popup').remove();
					if(typeof ok_fn == "function"){
						ok_fn();
					}
				});
				
			},
			confirm : function(message, yes_fn, no_fn){
				if(typeof yes_fn != "function"){
					common.alert('无效参数');
					return;
				}
				if($('#confirm-popup').length){
					$('#confirm-popup').remove();
				}
				
				$('<div id="confirm-popup" class="popup-mask" style="display: block;"><div class="login-popup"><div class="alert cf"><p class="alert-text">' + message + '</p><a id="YES" href="javascript:;" class="orange-btn prim-btn">确定</a><a id="NO" href="javascript:;" class="line-btn secd-btn">取消</a><a class="fvpp-close">&#10005;</a></div></div></div>').appendTo(document.body);
				$('#confirm-popup a').on('click', function(event){
					$('#confirm-popup').remove();
					if(event.target.id == "YES"){
						yes_fn();
						return;
					}
					if(event.target.id == "NO" && typeof no_fn == "function"){
						no_fn();
						return;
					}
				});
			}
		}
	}(jQuery));
	
	
	(function($, undefined) {
		var user = {};
		url = 'http://www.yamibuy.com/cn/service.php';
		$.yamibuy.user = user = {
			isSigned : function () {
				var token = window.atob(decodeURIComponent($.yamibuy.common.getCookie('YMB_TK')));
				return JSON.parse(token).isLogin;
			},
			signIn : function(email, pwd, donefn){
				
				$.yamibuy.common.doAjax(url, {act: 'login' ,email: email, pwd : pwd}, function(response){
					if(response.status == 1){
						$.yamibuy.common.alert(response.message);
					}else{
						donefn();
					}
				},{crossDomain : true, showloading : true, method : "POST", dataType : "JSONP"});
			},
			signOut : function(){
				$.yamibuy.common.showLoading();
				$.yamibuy.common.doAjax(url, {act: 'logout'}, function(response){
					if(response.status == 1){
						$.yamibuy.common.hideLoading();
						$.yamibuy.common.alert(response.message);
					}else{
						window.location.href = 'http://www.yamibuy.com/cn/';
					}
				});
			},
			displaySignIn : function (data) {
				if(user.isSigned() == false){
					$.yamibuy.common.doAjax(url, 
							{act:'viewMiniLogin'}, 
							function(response){
								$(response.html).appendTo(document.body);
								$('#login-popup #btn-login').on('click', data , user._loginHandler);
								$('#login-popup #btn-close').on('click', function(){
									$('#login-popup').remove();
								});
					});
				}else{
					user._execute(data);
				}
			},
			_loginHandler : function(event) {
				var email = $('#l-email').val();
				var pwd = $('#l-pw').val();
				
				if(!$.yamibuy.common.validateEmail(email)){
					$.yamibuy.common.alert('请输入一个有效的邮箱地址。');
					return;
				}
				
				user.signIn(email, pwd, function(){
					$('#login-popup').remove();
					user._execute(event.data);
				})	
			},
			_execute : function (data){
				if(typeof data == "undefined" || typeof data.method != "function"){
					return;
				}else if (typeof data.param != "undefined"){
					data.method(data.param);
				}else{
					data.method();
				}
			}
		};
	}(jQuery));

})
);
