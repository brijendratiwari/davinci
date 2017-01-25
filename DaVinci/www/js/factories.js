var factoryMod = angular.module('app.factories', [])

factoryMod.constant('URL', {
	'API': 'https://davinci.engd.com/api/',
	'SUCCESS': 'https://davinci.engd.com/auth/success',
	'FAILURE': 'https://davinci.engd.com/auth/failure',
	'FBURI': 'https://davinci.engd.com/api/letsdofblogin',
	'SIGNUPOK': 'https://davinci.engd.com/api/signupok/',
	'LOGINOK':'https://davinci.engd.com/api/loginok/'
});

factoryMod.constant('APIMethods', ["APILogin", "SignUp", "SocialLogin"]);

factoryMod.factory('StateChecker', function($rootScope, $state){
    return {
        runStateChecker: function(){
            $rootScope.$on('$ionicView.afterEnter', function(){
                if (window.FirebasePlugin) {
					window.FirebasePlugin.logEvent("page_view", {page: $state.current.name});
            	    // window.ga.trackView($state.current.name);
                }
                if (ionic.Platform.isAndroid()) {
                    var ref = $state.href($state.current.name, {}, {absolute: false});
                    var stateObj = { state: $state.current.name };
                    history.pushState(stateObj, $state.current.name, ref);
                }
            });
		}
	};
});
factoryMod.factory('apiCalls', function(){
	return {
		'APILogin': {'type':'POST','path': 'login'},
		'SignUp': {'type':'POST','path': 'registered'},
		'SocialLogin': {'type':'POST','path': 'facebook_login'},
		'Categories': {'type':'POST','path': 'categories'},
		'CategoryMenu': {'type':'POST','path': 'menu'},
		'GetProfile': {'type':'TOKENGET','path': 'user'},
		'UpdateProfile': {'type':'TOKENPOST','path': 'update_user'},
		'Greek':{'type':'GET', 'path': 'languages/greek'},
		'English':{'type':'GET', 'path': 'languages/english'},
		'ShoppingCart':{'type': 'TOKENPOST', 'path': 'shoppingcart'},
		'Orders':{'type': 'TOKENGET', 'path': 'orders'},
		'GetSingleOrders':{'type': 'TOKENPOST', 'path': 'getsingleorder'},
		'PayPalPayNow':{'type': 'TOKENPOST', 'path': 'payorder_PayPal'},
		'AddToCart':{'type':'TOKENPOST', 'path': 'addtocart'},
		'Logout':{'type':'TOKENGET', 'path': 'logout'},
		'ResetPassword':{'type':'TOKENPOST', 'path': 'reset_password'},
		'TokenUpdate':{'type':'TOKENPOST', 'path': 'update_firebasetoken'},
		'VerifyFCM':{'type':'TOKENPOST', 'path': 'verify_fcm'},
		'OpenCheck': {'type': 'GET', 'path': 'opencheck'},
		'GetOptions': {'type':'POST','path': 'itemoptions'},
		'GetLocations': {'type':'POST','path': 'getlocations'}
	};
});

factoryMod.factory('Store', function(){
	var category = {};
	category.getStorage = function() {
		var localstorage = window.localStorage.getItem('category');
		if (localstorage === null) {
			localstorage = [];
		}
		else {
			localstorage = JSON.parse(localstorage);
		}
		return localstorage;
	};

	category.setStorage = function(localstorage) {
		window.localStorage.setItem("category", JSON.stringify(localstorage));
	};

	var opencheck = {};
	opencheck.getStorage = function() {
		var localstorage = window.localStorage.getItem('opencheck');
		if (localstorage != null) {
			localstorage = JSON.parse(localstorage);
		}
		return localstorage;
	};

	opencheck.setStorage = function(localstorage) {
		window.sessionStorage.setItem("openchecktime", new String(new Date().getTime()));
		window.localStorage.setItem("opencheck", JSON.stringify(localstorage));
	};

	function checkTime() {
		var time = window.sessionStorage.getItem('openchecktime');
		if (typeof time == 'undefined' || time == null) {
			time = 0;
		}
		var timeStored = parseFloat(time);
		var now = new Date().getTime();
		var diff = (now - timeStored)/1000;
		return (diff >= 600);
	}

	var menu = {};
	menu.getStorage = function() {
		var localstorage = window.localStorage.getItem('menu');
		if (localstorage === null) {
			localstorage = [];
		}
		else {
			localstorage = JSON.parse(localstorage);
		}
		return localstorage;
	};

	menu.setStorage = function(localstorage) {
		window.localStorage.setItem("menu", JSON.stringify(localstorage));
	};

	//Other Storage

	var shopcartid = {};
	shopcartid.getStorage = function() {
		var localstorage = window.localStorage.getItem('shopcartid');
		if (localstorage === null) {
			localstorage = '0';
		}
		return localstorage;
	};

	shopcartid.setStorage = function(localstorage) {
		window.localStorage.setItem("shopcartid", localstorage);
	};

	var langStore = {};
	langStore.getStorage = function() {
		var lang = window.localStorage.getItem('langStore');
		if (lang === null) {
			lang = 'el';
		}
		return lang;
	};

	langStore.engStorage = function(lang) {
		window.sessionStorage.setItem("engStore", JSON.stringify(lang));
	};

	langStore.getEngStorage = function() {
		var lang = JSON.parse(window.sessionStorage.getItem('engStore'));
		if (lang === null) {
			lang = {};
		}
		return lang;
	};

	langStore.grkStorage = function(lang) {
		window.sessionStorage.setItem("grkStore", JSON.stringify(lang));
	};

	langStore.getGrkStorage = function() {
		var lang = JSON.parse(window.sessionStorage.getItem('grkStore'));
		if (lang === null) {
			lang = {};
		}
		return lang;
	};

	langStore.setStorage = function(lang) {
		window.localStorage.setItem("langStore", lang);
	};
	return {
		'categories': category,
		'menus': menu,
		'langStore': langStore,
		'cartStore': shopcartid,
		'opencheck': opencheck,
		'checkTime': checkTime
	};
});


factoryMod.factory('TokenService', function($rootScope){

	var tokenService = {};
	tokenService.getToken = function() {
		var localstorage = window.localStorage.getItem('userdata');

		if (localstorage === null) {
			localstorage = {};
		}
		else {
			localstorage = JSON.parse(localstorage);
		}

		var token = localstorage["token"];

		return (typeof token === "undefined")?"":token;
	};

	tokenService.saveToken = function(token) {
		var localstorage = window.localStorage.getItem('userdata');
		if (localstorage === null) {
			localstorage = {};
		}
		else {
			localstorage = JSON.parse(localstorage);
		}
		$rootScope.$broadcast('isLoggedIn');
		localstorage["token"] = token;

		window.localStorage.setItem("userdata", JSON.stringify(localstorage));
	};
	return tokenService;
});

factoryMod.factory('SessionCookie', function() {
	var sc = {};
	var isAndroid = ionic.Platform.isAndroid();
	function setCookie(cvalue, exdays) {
		window.localStorage.setItem('session_id', cvalue);
	}
	
	function getCookie() {
		var sess = window.localStorage.getItem('session_id');
		if (typeof sess == "undefined" || sess == null) {
			sess = "";
		}
		return sess;
	}

	function makeid() {
		var text = "";
		var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

		for( var i=0; i < 16; i++ )
			text += possible.charAt(Math.floor(Math.random() * possible.length));

		return text;
	}

	sc.getSession = function() {
		var sess = getCookie();
		if (sess.length == 0) {
			var isIPad = ionic.Platform.isIPad();
			var isIOS = ionic.Platform.isIOS();
			var isAndroid = ionic.Platform.isAndroid();
			if ((isIPad || isIOS || isAndroid) && typeof device != 'undefined') {
				sess = device.uuid;
			}
			else {
				sess = makeid();
			}
			setCookie(sess, 1);
		}
		return sess;
	};

	sc.removeSession = function() {
		window.localStorage.removeItem('session_id');
	};
	return sc;
})

factoryMod.factory('ApiCaller', function($http, Store, apiCalls, $ionicLoading, Message, TokenService, SessionCookie, URL) {
	var apiCaller = {};

	function getCall(path, success, failure) {
		$http.get(path).//Link
		success(function(data, status) {
			$ionicLoading.hide();
			success(data);
		}).
		error(function(data, status) {
			$ionicLoading.hide();
			if (failure) {
				failure(data);
			}
		});
	}

	function postCall(path, api_request, success, failure) {
		pcall(path, api_request, success, failure, {
			"Content-Type": "application/x-www-form-urlencoded",
			"AppLanguage": (Store.langStore.getStorage()=='el'?'greek':'english')
		});
	}

	function tokenCall(path, api_request, success, failure) {
		if (TokenService.getToken().length == 0) {
			$ionicLoading.hide();
            failure(null);
            return;
		}

		pcall(path, api_request, success, failure, {
			"Content-Type": "application/x-www-form-urlencoded",
			"Token": TokenService.getToken(),
			"AppLanguage": (Store.langStore.getStorage()=='el'?'greek':'english')
		});
	}

	function pcall (path, api_request, success, failure, headerVal){
		$http({
			method: 'POST',
    		url: path,
			data: api_request,
			headers: headerVal
		}).
		success(function(data, status) {
			$ionicLoading.hide();
			if ((!data.status || data.status === "error") && (data.message === "Session id or token required!!" || data.error === "Invalid token")) {
				Message.alert('SESSION_EXP').then(function(){
					window.localStorage.removeItem('userdata');
					setTimeout(function(){
		             	window.location.href = "";
		            }, 100);
				})
			}
			else {
				success(data);
			}
		}).
		error(function(data, status) {
			$ionicLoading.hide();
			if (failure) {
				failure(data);
			}
		});
	}

	function tokenGetCall(path, success, failure) {
		if (TokenService.getToken().length == 0) {
			$ionicLoading.hide();
            failure(null);
            return;
		}

		$http({
			method: 'GET',
    		url: path,
			headers: {
		        "Content-Type": "application/x-www-form-urlencoded",
		        "Token": TokenService.getToken(),
				"AppLanguage": (Store.langStore.getStorage()=='el'?'greek':'english')
		    }
		}).
		success(function(data, status) {
			$ionicLoading.hide();
			if ((!data.status || data.status === "error") && (data.message === "Session id or token required!!" || data.error === "Invalid token")) {
				Message.alert('Your login has expired').then(function(){
					window.localStorage.removeItem('userdata');
					setTimeout(function(){
		             	window.location.href = "";
		            }, 100);
				})	
			}
			else {
				success(data);
			}
		}).
		error(function(data, status) {
			$ionicLoading.hide();
			if (failure) {
				failure(data);
			}
		});
	}

	apiCaller.getURL = function (path){
		var isIPad = ionic.Platform.isIPad();
		var isIOS = ionic.Platform.isIOS();
		var isAndroid = ionic.Platform.isAndroid();

		var url = 'http://localhost:8100/apicall/api/';
		  if (isIPad || isIOS || isAndroid) {
		  	url = URL.API;
		  }
		return url + path;
	}

	apiCaller.callAPI = function (methodName, data, successBlock, failureBlock) {
		var methods = JSON.parse(JSON.stringify(apiCalls[methodName]));

		var isIPad = ionic.Platform.isIPad();
		var isIOS = ionic.Platform.isIOS();
		var isAndroid = ionic.Platform.isAndroid();

		var path = this.getURL(methods.path);

		var request = "";
		angular.forEach(data,function(val, key){
			if (request.length > 0) {
				request += "&";
			}
		  request += key + "=" + val;
		})
		
		if (methodName != "AddToCart" && methodName != 'ShoppingCart' && methodName != 'OpenCheck') {
			$ionicLoading.show({template:'<strong style="text-align: center;">Loading...</strong>'});
		}

		if (methodName == 'AddToCart' || methodName == 'ShoppingCart') {
			if (TokenService.getToken().length == 0) {
				methods.type = "POST";
			}
			if (isIPad || isIOS || isAndroid) {
				if ( typeof device == "undefined" ) {
					setTimeout(function() {
						apiCaller.callAPI(methodName, data, successBlock, failureBlock);
					}, 200);
					return; 
				} 
			}
			request += '&session_id=' + SessionCookie.getSession();
			if (methodName == 'AddToCart' && data.type == "add") {
				request += '&cartid=' + Store.cartStore.getStorage();
			}
		}

		// if ( methodName == 'Categories' || methodName == 'CategoryMenu' ||
		// 	methodName == 'ShoppingCart' || methodName == 'Orders' ||
		// 	methodName == 'GetSingleOrders' || methodName == 'GetLocations' ||
		// 	methodName == 'GetOptions' ) {
		// 	request += '&lang=' + (Store.langStore.getStorage()=='el'?'greek':'english');
		// }

		if (methods.type === 'TOKENPOST') {
			tokenCall(path, request, successBlock, failureBlock);
		}
		else if (methods.type === 'TOKENGET') {
			tokenGetCall(path, successBlock, failureBlock);
		}
		else if (methods.type === 'POST') {
			if (methodName == "APILogin" || methodName == "SignUp" || methodName == "SocialLogin") {
				var token = window.sessionStorage.getItem('fcm_token');
				if (token != null || token != undefined) {
					request += '&firebasetoken=' + token;
				}
				if (isIPad || isIOS || isAndroid) {
					request += '&device=' + (isAndroid?'android':'ios');
				}
				var session_id = SessionCookie.getSession();
				if (session_id.length > 0) {
					request += '&session_id=' + session_id;
				}
			}
			postCall(path, request, successBlock, failureBlock);
		}
		else {
			getCall(path, successBlock, failureBlock);
		}
	};


	return apiCaller;
})

factoryMod.factory('Message', function($ionicPopup, $rootScope, $translate){
    var texts = {};

    function changeLan() {
        $translate(["CART_REMOVE_CONF", "LOGOUT_MSG","EXIT_APP","SIGNOUT_FAIL_MSG","CANCEL_TEXT","CONFIRM_TEXT","SUCCESS_TEXT",
		"ALERT","NEW_TIP","TIP_NOTIF","TIP_NOT_SUB","HIP_ERROR","SUBS_UNAVIAL","PROFILE_SAVD","PROFILE_UNAV",
		"UNSUBS_MSG","FAC_LOG_FLD","REQ_ERROR","PASS_MATCH_ERROR", "PAY_SUCC", "PAY_FAIL", "OUT_OF_STOCK", "SESSION_EXP", "ORDER_SUBMITTED"]).then(function (translation) {
            texts = translation;
        }, function (translationId) {
            texts = translationId;
        });
    }

    changeLan();
    
    $rootScope.$on('$translateChangeSuccess', function () {
		changeLan();
	});
       
    return {
        alert: function(message) {
            var msg = texts[message];
            if (typeof msg === "undefined") {
                msg = message;
            }

            return $ionicPopup.alert({
                title: texts.ALERT,
				template: '<p style="text-align: center;">' + msg + '</p>'
            });
        },
        confirm: function(message) {
            var msg = texts[message];
            if (typeof msg === "undefined") {
                msg = message;
            }

            return $ionicPopup.confirm({
                title: texts.ALERT,
				template: '<p style="text-align: center;">' + msg + '</p>',
                cancelText: texts.CANCEL_TEXT,
				okText: texts.CONFIRM_TEXT
            });
        },
        confirmWithTitle : function(title, message) {
            var msg = texts[message];
            if (typeof msg === "undefined") {
                msg = message;
            }

            var ttl = texts[title];
            if (typeof msg === "undefined") {
                ttl = title;
            }
            return $ionicPopup.confirm({
                title: ttl,
				template: '<p style="text-align: center;">' + msg + '</p>',
                cancelText: texts.CANCEL_TEXT,
				okText: texts.CONFIRM_TEXT
            });
        }
    };
});
