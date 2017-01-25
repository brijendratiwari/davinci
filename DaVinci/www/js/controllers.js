angular.module('app.controllers', [])
  
.controller('homeCtrl', function ($state, $scope, $rootScope, $translate, TokenService, ApiCaller, Message) {

	function changeLan(){
		$translate(['SIGN_REG_MESS', 'SIGN_OUT']).then(function (translation) {
			$scope.sign_in_text = translation.SIGN_REG_MESS;
			$scope.sign_out_text = translation.SIGN_OUT;
			check();
		}, function (translationId) {
			$scope.sign_in_text = translationId.SIGN_REG_MESS;
			$scope.sign_out_text = translationId.SIGN_OUT;
			check();
		});
	}

	$scope.loggerClick = function() {
		if (TokenService.getToken().length == 0) {
			$state.go('login');
		}
		else {
			Message.confirm("LOGOUT_MSG")
			.then(function(res) {
				if(res) {
					ApiCaller.callAPI('Logout', null, function(response){
						if (response.status === "success") {
							window.localStorage.clear();
							window.location.href = "";
						}
						else {
							Message.alert('SIGNOUT_FAIL_MSG');
						}
						
					},function(error) {
						console.log(error);
					});
				}
			});

		}
	};

	$rootScope.$on('$translateChangeSuccess', function () {
		changeLan();
	});

	function check() {
		setTimeout(function(){
			var tkn = TokenService.getToken();
			if (tkn.length > 0) {
				$scope.isSignedIn = $scope.sign_out_text;
				$scope.showprofile = true;
			}
			else {
				$scope.isSignedIn = $scope.sign_in_text;
				$scope.showprofile = false;
			}
		}, 200);

		if(!$scope.$$phase) {
			$scope.$digest();
		}
	}
	changeLan();

	$scope.isLoggedIn = function(){
		return (TokenService.getToken().length == 0);
	};
})

.controller('loginCtrl', ['$scope', 'ApiCaller', 'Message', 'APIMethods', 'TokenService', 'URL', 'SessionCookie', function ($scope, ApiCaller, Message, APIMethods, TokenService, URL, SessionCookie) {

	$scope.signin = {
		username: "",
		password: ""
	};

	$scope.backFromLogin = function(){
		window.history.go(-1);
	};
	var loggerURL = ""; 
	$scope.signup = function(){
		var uri = ApiCaller.getURL("registered");

		var sess = SessionCookie.getSession();
		var app = ""
		if (sess.length > 0) {
			app += '?session_id=' + sess;
		}
		var inapp = cordova.InAppBrowser.open(uri + app, '_blank', 'location=no,toolbar=yes,clearcache=yes');
		
		inapp.addEventListener('loadstart', function(e){
			loggerURL = e.url;
			if (e.url === URL.FBURI) {
				inapp.close();
			}
			else if ((e.url).indexOf(URL.SIGNUPOK) !== -1){
				var token = (e.url).replace(URL.SIGNUPOK,"");
				if (token.length > 1) {
					token = token.replace("/","");
					TokenService.saveToken(token);
				}
				window.location.href = "";
			}
		});

		inapp.addEventListener('exit', function(e){
			if (loggerURL === URL.FBURI) {
				inapp = null;
				setTimeout(function(){
					$scope.facebookLogin();
				}, 500);
			}
			loggerURL = "";
		});
	};

	$scope.facebookLogin = function(){
		facebookConnectPlugin.login(["public_profile","email"],function(sucessdata){
			var req = {"access_token" : sucessdata.authResponse.accessToken};

			if (window.device) {
				req['deviceversion'] = window.device.version;
			}
			var sess = SessionCookie.getSession();
			if (sess.length > 0) {
				req['session_id'] = sess;
			}

			ApiCaller.callAPI(APIMethods[2], req, function(response){
				if (response.status === "success") {
					TokenService.saveToken(response.token);
					window.location.href = "";
				}
				else {
					Message.alert(response.message);
				}
			},function(error) {
				console.log(error);
			});

		},function(error) {
			console.log(JSON.stringify(error));
			Message.alert('FAC_LOG_FLD');
		});
	};

	$scope.loginClick = function() {
		var postReq = {
			email: $scope.signin.username,
			password: $scope.signin.password,
			app_login: 1
		};
		var sess = SessionCookie.getSession();
		if (sess.length > 0) {
			postReq['session_id'] = sess;
		}

		if (window.device) {
			postReq['deviceversion'] = window.device.version;
		}

		ApiCaller.callAPI(APIMethods[0], postReq, function(response){
			if (response.status === "success") {
				TokenService.saveToken(response.token);
				window.location.href = "";
			}
			else {
				Message.alert(response.message);
			}
		},function(error) {
			console.log(error);
		});
	};
}])

.controller('aboutCtrl', ['$scope', '$stateParams', function ($scope, $stateParams) {

}])
   
.controller('contactCtrl', ['$scope', 'ApiCaller', '$rootScope', function ($scope, ApiCaller, $rootScope) {
	$scope.locList = [];
	$scope.markerList = [];
	$scope.hours = [];

	$scope.$on('$ionicView.beforeEnter', function(){	
		getLoc();
	});

	$rootScope.$on('$translateChangeSuccess', function () {
		getLoc();
	});
	$scope.map = {
		center: {
			latitude: 0,
			longitude:0
		},
		zoom: 11,
		markerList: []
	};
	function getLoc() {
		ApiCaller.callAPI('GetLocations', null, function(response){
			if (response.status) {
				var idx = new Date().getDay();
				$scope.locList = [];
				$scope.map.markerList = [];
				$scope.hours = [];

				var day = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

				for (var i = 0; i < response.data.locations.length; i++) {
					var coord = {
						latitude: parseFloat(response.data.locations[i].latitude),
						longitude: parseFloat(response.data.locations[i].longitude),
					};
					if (i == 0) {
						$scope.map.center = coord;
					}
					$scope.map.markerList.push({
						coords : coord,
						id: i
					})
				}
				
				$scope.locList = response.data.locations;
				for (var i=0; i < day.length; i++) {
					var hr = {};
					hr.opening = response.data.hours[day[i]];
					hr.delivery = response.data.deliveryhours[day[i]];
					hr.day = day[i];
					$scope.hours.push(hr);
				}
			}
		},function(error) {
			console.log(error);
		});
	}
}])

.controller('pastordersCtrl', function ($state, $scope, $rootScope, ApiCaller, $ionicModal, $ionicPopover, URL) {
	$scope.orders = [];
	$scope.showNoOrderMess = false;
	$ionicPopover.fromTemplateUrl('templates/reorderType.html', {
		scope: $scope
	}).then(function(popover) {
		$scope.popover = popover;
	});

	$scope.$on('$ionicView.beforeEnter', function(){
		$scope.orders = [];
		$scope.showNoOrderMess = false;
		getOrders();
	});

	$ionicModal.fromTemplateUrl('templates/orderDetail.html', {
		scope: $scope,
		animation: 'slide-in-up'
	}).then(function(modal) {
		$scope.modal = modal;
	});

	$scope.closePop = function() {
		if (typeof $scope.modal != "undefined") {
			$scope.modal.hide();
		}
	}

	function getOrders() {
		ApiCaller.callAPI('Orders', null, function(response){
			if (response.status) {
				if (typeof response.data === "boolean") {
					$scope.showNoOrderMess = true;
				}
				else {
					$scope.orders = response.data;
				}
			}
			else {
				$scope.showNoOrderMess = true;
			}					
		},function(error) {
			console.log(error);
		});
	}

	$scope.reOrder = function($event, orderid) {

		$scope.modalorder = {};

		for(var i=0; i < $scope.orders.length; i++) {
			if (orderid == $scope.orders[i].id) {
				$scope.modalorder = $scope.orders[i];
				break;
			}
		}
		$scope.popover.show($event);
	};

	$scope.payNow = function(orderid) {

		$scope.modalorder = {};

		for(var i=0; i < $scope.orders.length; i++) {
			if (orderid == $scope.orders[i].id) {
				$scope.modalorder = $scope.orders[i];
				break;
			}
		}
		
		ApiCaller.callAPI('PayPalPayNow', {orderno: orderid}, function(response){
			if (response.status == "success") {
				var inapp = cordova.InAppBrowser.open(response.ppurl, '_blank', 'location=no,toolbar=yes,clearcache=yes');
				inapp.addEventListener('loadstop', function(e){
					if (e.url === URL.SUCCESS || e.url === URL.FAILURE) {
						var msg = 'PAY_FAIL';
						if (e.url === URL.SUCCESS) {
							SessionCookie.removeSession();
							msg = 'ORDER_SUBMITTED';
						}
						getOrders();
						Message.alert(msg)
						setTimeout(function(){
							inapp.close();
						},1500);
					}
				});
				inapp.addEventListener('exit', function(e){
					
				});
			}
			else {
			}					
		},function(error) {
			console.log(error);
		});
	};

	$scope.reordeTypeOne = function() {
		$scope.popover.hide();
		ApiCaller.callAPI('GetSingleOrders', {orderno: $scope.modalorder.id, reorder: '1'}, function(response){
			if (response.status) {
				$rootScope.$broadcast('cartUpdate');
			}
			else {
			}					
		},function(error) {
			console.log(error);
		});
	}

	$scope.reordeTypeTwo = function() {
		$scope.popover.hide();
		ApiCaller.callAPI('GetSingleOrders', {orderno: $scope.modalorder.id, reorder: '2'}, function(response){
			if (response.status) {
				$rootScope.$broadcast('cartUpdate');
			}
			else {
			}					
		},function(error) {
			console.log(error);
		});
	}

	$scope.openOrder = function(orderid) {

		$scope.modalorder = {};
		$scope.orderDet = {};
		for(var i=0; i < $scope.orders.length; i++) {
			if (orderid == $scope.orders[i].id) {
				$scope.modalorder = $scope.orders[i];
				break;
			}
		}
		ApiCaller.callAPI('GetSingleOrders', {orderno: orderid}, function(response){
			if (response.status) {
				$scope.orderDet = response.data; 
				$scope.list = response.data.products;
				$scope.modal.show();
				$rootScope.$broadcast('modalshown');	
			}
			else {
			}					
		},function(error) {
			console.log(error);
		});
	};

	$scope.$on('modalhide', function() {
		if (typeof $scope.modal != "undefined") {
			$scope.modal.hide();
		}
	});
})
   
.controller('orderOnlineCtrl', function ($scope, $rootScope, ApiCaller, Store) {
	$scope.category = [];
	$rootScope.$broadcast('getstats');

	function order(){
		ApiCaller.callAPI('Categories', null, function(response){
			if (response.status === "success") {
				$scope.category = response.data.category;
				Store.categories.setStorage(response.data.category);
			}
			else {
			}					
		},function(error) {
			console.log(error);
		});
	}

	$scope.$on('$ionicView.beforeEnter', function(){
		$scope.category = Store.categories.getStorage();
	});

	function getMenu() {
		ApiCaller.callAPI('CategoryMenu', null, function(response){
			if (response.status === "success") {
				var list = response.data.menu;
				Store.menus.setStorage(list);
			}				
		},function(error) {
			console.log(error);
		});
	}

	$rootScope.$on('$translateChangeSuccess', function () {
		order();
		getMenu();
	});
})
   
.controller('listingCtrl', function ($scope, $rootScope, $stateParams, ApiCaller, $ionicModal, Message, Store) {
	$scope.catid = $stateParams.catid;

	$scope.optionShow = true;
	$scope.menu = [];
	$scope.distmenu = [];
	$scope.selitem = {};
	$rootScope.$broadcast('getstats');

	$ionicModal.fromTemplateUrl('templates/itemdetails.html', {
		scope: $scope,
		animation: 'slide-in-up'
	}).then(function(modal) {
		$scope.modal = modal;
	});

	$scope.selectedItem = null;

	$scope.distMenuPop = function(event, itemid) {
		$scope.selectedItem = getImage(event);
		$scope.selitem = {};
		angular.forEach($scope.menu, function(item) {
			if (itemid == item.id) {
				$scope.selitem = item;
			}
		});
		$scope.modal.show();
		$rootScope.$broadcast('modalshown');	
	};

	$scope.$on('modalhide', function() {
		if (typeof $scope.modal != "undefined") {
			$scope.modal.hide();
		}
	});

	$scope.closePop = function() {
		if (typeof $scope.modal != "undefined") {
			$scope.modal.hide();
		}
	}

	$scope.addToCart = function(itmid) {
		if (typeof $scope.modal != "undefined") {
			$scope.modal.hide();
		}
		if ($scope.selitem.id == itmid) {
			addCart(1);
		}
	};

	$scope.addSingleCart = function(event, itmid) {
		$scope.selectedItem = getImage(event);
		$scope.selitem = {};
		angular.forEach($scope.menu, function(item) {
			if (itmid == item.id) {
				$scope.selitem = item;
			}
		});
		addCart(1);
	};

	$scope.$on('$destroy', function() {
		if (typeof $scope.modal != "undefined") {
			$scope.modal.remove();
		}
	});
	
	$scope.returnVal = {
		val: [],
		returner: ''
	};

	$scope.$on('cartoptionsselected', function(){
		$scope.optionShow = true;
		console.log($scope.returnVal.returner);
		ApiCaller.callAPI('AddToCart', {"prodid": $scope.selitem.id, "quantity": savequan, "type": "add", "options" : $scope.returnVal.returner}, function(response){
			if (typeof response.status == "boolean" && response.status) {
				cartAnimation($scope.selectedItem);
				$scope.selectedItem = null;
				savequan = 0;
				$scope.returnVal = {
					val: [],
					returner: ''
				};
				Store.cartStore.setStorage(response.products[response.products.length - 1].cartid);
				$scope.selitem = {};
				$rootScope.$broadcast('cartUpdate');
			}
			else {
				Message.alert(response.message);
			}				
		},function(error) {
			console.log(error);
		});
	})

	function getImage (newVal) {
		return $(angular.element(newVal.srcElement).parent().parent().parent().find('img'));
	}

	$scope.$watch('selectedItem', function(newVal, oldVal, scope) {
		console.log(newVal);
	});

	var savequan = 0;

	function addCart(quantity){
		if (!$scope.selitem.product_option) {
			ApiCaller.callAPI('AddToCart', {"prodid": $scope.selitem.id, "quantity": quantity, "type": "add"}, function(response){
				if (typeof response.status == "boolean" && response.status) {
					cartAnimation($scope.selectedItem);
					$scope.selectedItem = null;
					$scope.selitem = {};
					Store.cartStore.setStorage(response.products[response.products.length - 1].cartid);
					$rootScope.$broadcast('cartUpdate');
				}
				else {
					Message.alert(response.message);
				}					
			},function(error) {
				console.log(error);
			});
		}
		else {
			savequan = quantity;
			ApiCaller.callAPI('GetOptions', {"prodid": $scope.selitem.id}, function(response) {
				if (response.status) {
					var optionsList = []; 
					var keys = Object.keys(response.data);

					for (var j = 0; j < keys.length; j++) {
						optionsList.push(response.data[keys[j]]);
					}

					$scope.returnVal = {
						val: optionsList,
						returner: ''
					};
					$scope.optionShow = false;
				}
			})
		}
	}

	$scope.$on('$ionicView.beforeEnter', function() {
		setupMenu(Store.menus.getStorage());
	});

	function setupMenu(list) {
		var mainList = [];
		var subcatids = [];
		angular.forEach(list, function(listit) {
			if (listit.catid == $scope.catid) {
				listit.product_option = (parseInt(listit.prodoptions) > 0);
				var subcatlistit = {};
				var idx = -1;
				angular.forEach(subcatids, function(dist) {
					if (dist.distid == listit.subcatid) {
						subcatlistit = dist;
						idx = subcatids.indexOf(dist);
					}
				});

				if (typeof subcatlistit.list === "undefined") {
					subcatlistit.list = [];
				}

				subcatlistit.list.push(listit);

				if (idx == -1) {
					subcatlistit.distid = listit.subcatid;
					subcatlistit.sub_cat_name = listit.display_subcat_name;
					subcatids.push(subcatlistit);
				}
				else {
					subcatids[idx] = subcatlistit;
				}
				mainList.push(listit);
			}
		});
		$scope.distmenu = subcatids;
		$scope.menu = mainList;
	}

	$rootScope.$on('$translateChangeSuccess', function () {
		order();
		getMenu();
	});

	function order(){
		ApiCaller.callAPI('Categories', null, function(response){
			if (response.status === "success") {
				Store.categories.setStorage(response.data.category);
			}
			else {
			}					
		},function(error) {
			console.log(error);
		});
	}

	function getMenu() {
		ApiCaller.callAPI('CategoryMenu', null, function(response){
			if (response.status === "success") {
				var list = response.data.menu;
				Store.menus.setStorage(list);
				setupMenu(list);
			}				
		},function(error) {
			console.log(error);
		});
	}
})
   
.controller('menuCtrl', function ($scope, $state, $translate, $ionicSideMenuDelegate, $ionicPopover, ApiCaller, Message, Store, TokenService) {

	$scope.isSignedIn = "";
	$scope.menuitems = 0;

	function changeLan(){
		$translate(['SIGN_REG_MESS', 'SIGN_OUT']).then(function (translation) {
			$scope.sign_in_text = translation.SIGN_REG_MESS;
			$scope.sign_out_text = translation.SIGN_OUT;
			check();
		}, function (translationId) {
			$scope.sign_in_text = translationId.SIGN_REG_MESS;
			$scope.sign_out_text = translationId.SIGN_OUT;
			check();
		});
	}
	$scope.$on('isLoggedIn', function(){
		check();
	})

	function check() {
		setTimeout(function(){
			var tkn = TokenService.getToken();
			if (tkn.length > 0) {
				$scope.isSignedIn = $scope.sign_out_text;
				$scope.showprofile = true;
			}
			else {
				$scope.isSignedIn = $scope.sign_in_text;
				$scope.showprofile = false;
			}
		}, 200);

		if(!$scope.$$phase) {
			$scope.$digest();
		}
	}
	check();

	function getCart() {
		ApiCaller.callAPI("ShoppingCart", null, function(response){
			if (response.status) {
				if (response.totalquantity == null) {
					response.totalquantity = 0;
				}
				$scope.menuitems = response.totalquantity;
			}
			else {
				Message.alert(response.message);
			}
		},function(error) {
			console.log(error);
		});
	}

	getCart();

	$scope.$on('cartUpdate',function() {
		getCart();
	})

	$scope.openCart = function(){
		$state.go("menu.shoppingCart");
	}

	$scope.loggerClick = function() {
		if (TokenService.getToken().length == 0) {
			$ionicSideMenuDelegate.toggleLeft();
			$state.go('login');
		}
		else {
			Message.confirm("LOGOUT_MSG")
			.then(function(res) {
				if(res) {
					ApiCaller.callAPI('Logout', null, function(response){
						if (response.status === "success") {
							window.localStorage.clear();
							window.location.href = "";
						}
						else {
							Message.alert('SIGNOUT_FAIL_MSG');
							$ionicSideMenuDelegate.toggleLeft();
						}
					},function(error) {
						console.log(error);
					});
				}
				else {
					$ionicSideMenuDelegate.toggleLeft();
				}
			});

		}
	};

	$scope.langflagclass = "el";

	$scope.toggleLang = function(engorgr) {
		$scope.iseng = (engorgr == "en")?'button-positive':'button-stable';
		$scope.isgreek = (engorgr == "el")?'button-positive':'button-stable';
		$scope.langflagclass = engorgr;
		Store.langStore.setStorage(engorgr);
		$translate.use(engorgr);
		changeLan();
		if ($scope.popover) {
			$scope.popover.hide();
		}
	};

	$scope.toggleLang(Store.langStore.getStorage());

	$ionicPopover.fromTemplateUrl('templates/my-popover.html', {
		scope: $scope
	}).then(function(popover) {
		$scope.popover = popover;
	});

	$scope.toggleLangPopup = function($event) {
		$scope.popover.show($event);
	};

	$scope.isLoggedIn = function(){
		return (TokenService.getToken().length == 0)
	};

})
   
.controller('offersCtrl', function ($scope, $stateParams) {

})
   
.controller('settingsCtrl', ['$scope', '$stateParams', 'ApiCaller', 'Message', function ($scope, $stateParams, ApiCaller, Message) {

	$scope.profile = {};
	$scope.isProfile = true;
	
	$scope.passchange = {
		oldpass: "",
		newpass: "",
		confpass: ""
	};

	$scope.updateProfile = function() {
		var prof = $scope.profile;
		delete prof.user_id;
		ApiCaller.callAPI("UpdateProfile", prof, function(response){
			if (response.status) {
				getProfile();
			}
			Message.alert(response.message);
		},function(error) {
			console.log(error);
		});
	};

	$scope.changePassword = function () {
		ApiCaller.callAPI("ResetPassword", $scope.passchange, function(response){
			if (response.status) {
				Message.alert('PASS_SUCC');
				$scope.passchange = {
					oldpass: "",
					newpass: "",
					confpass: ""
				};
			}
			else {
				Message.alert(response.message);
			}
		},function(error) {
			console.log(error);
		});
	};

	function getProfile () {
		ApiCaller.callAPI("GetProfile", null, function(response){
			if (response.status) {
				$scope.profile = response.data;
			}
			else {
				Message.alert(response.message);
			}
		},function(error) {
			console.log(error);
		});
	}

	$scope.$on('$ionicView.beforeEnter', function(){	
		getProfile();
	});
}])
   
.controller('signupCtrl', ['$scope', '$stateParams', function ($scope, $stateParams) {

}])
   
.controller('shoppingCartCtrl', function ($scope, $state, ApiCaller, APIMethods, Message, $rootScope, TokenService, SessionCookie, Store, URL) {
	
	$scope.products = [];
	$scope.totalquantity = 0;
	$scope.totalprice = 0;
	$scope.subtotal = 0;

	var loggerURL = "";

	$rootScope.$broadcast('getstats');

	$scope.$on('viewUpdate', function(event, args){
		var response = args.response;
		if (response.status) {
			$rootScope.$broadcast('cartUpdate');
			setView(response);
			Store.cartStore.setStorage(response.products[response.products.length - 1].cartid);
		}				
	})

	function facebookLogin(){
		facebookConnectPlugin.login(["public_profile","email"],function(sucessdata){
			var req = {"access_token" : sucessdata.authResponse.accessToken};
			var sess = SessionCookie.getSession();
			if (sess.length > 0) {
				req['session_id'] = sess;
			}
			if (window.device) {
				req['deviceversion'] = window.device.version;
			}
			ApiCaller.callAPI(APIMethods[2], req, function(response){
				if (response.status === "success") {
					TokenService.saveToken(response.token);
					$scope.checkOut();
				}
				else {
					Message.alert(response.message);
				}
			},function(error) {
				console.log(error);
			});
		},function(error) {
			console.log(JSON.stringify(error));
			Message.alert('FAC_LOG_FLD');
		});
	};
	$scope.checkOut = function() {
		var uri = ApiCaller.getURL("checkout");
		var tkn = TokenService.getToken();

		var app = "";
		if (tkn.length > 0) {
			app += '?token=' + tkn;
		}
		else {
			var sess = SessionCookie.getSession();
			if (sess.length > 0) {
				if (app.length == 0) {
					app += '?';
				}
				else {
					app += '&';
				}
				app += 'session_id=' + sess;
			}

		}
		if (app.length == 0) {
			return;
		}
		else {
			uri += app;
		}

		uri += '&lang=' + (Store.langStore.getStorage()=='el'?'greek':'english');
		
		var inapp = cordova.InAppBrowser.open(uri, '_blank', 'location=no,toolbar=yes,clearcache=yes');
		
		inapp.addEventListener('loadstart', function(e){
			loggerURL = e.url;
		});

		inapp.addEventListener('loadstop', function(e){
			
			if ((e.url).indexOf(URL.SUCCESS) !== -1){
				
				var token = (e.url).replace(URL.SUCCESS,"");
				if (token.length > 0) {
					token = token.replace("/","");
					TokenService.saveToken(token);
				}
				inapp.close();
				$rootScope.$broadcast('cartUpdate');
				getCart();
				SessionCookie.removeSession();
				Message.alert('ORDER_SUBMITTED');
				setTimeout(function(){
					$state.go('menu.pastorders');
				},200);
			}
			else if ((e.url).indexOf(URL.FAILURE) !== -1){
				var token = (e.url).replace(URL.FAILURE,"");

				if (token.length > 0) {
					token = token.replace("/","");
					TokenService.saveToken(token);
				}
				inapp.close();
				Message.alert('PAY_FAIL')
			}
			else if ((e.url).indexOf(URL.LOGINOK) !== -1){
				var token = (e.url).replace(URL.LOGINOK,"");
				if (token.length > 0) {
					token = token.replace("/","");
					TokenService.saveToken(token);
				}
				inapp.close();

				setTimeout(function() {
					$scope.checkOut();
				}, 500);
			}
		});

		inapp.addEventListener('exit', function(e){
			if ( ((e.url).indexOf(URL.SUCCESS) == -1) || ((e.url).indexOf(URL.FAILURE) == -1) || (e.url).indexOf(URL.LOGINOK) == -1 ){
				inapp = null;
				setTimeout(function(){
					$state.go('menu.pastorders');
				},500);
			}
			loggerURL = "";
		});
	};

	function setView(response) {
		$scope.products = response.products;
		var subtotal = 0.0;
		angular.forEach(response.products, function(prdct) {
			subtotal += prdct.quantity * prdct.price;
		});
		$scope.subtotal = subtotal.toFixed(2);
		$scope.totalquantity = response.totalquantity;
		$scope.totalprice = response.totalprice;
	}

	function getCart() {
		ApiCaller.callAPI("ShoppingCart", null, function(response){
			if (response.status) {
				setView(response);
			}
			else {
				Message.alert(response.message);
			}
		},function(error) {
			console.log(error);
		});
	}

	$scope.$on('$ionicView.beforeEnter', function() {
		$rootScope.$broadcast('cartUpdate');
		getCart();
	});

	$rootScope.$on('$translateChangeSuccess', function () {
		$rootScope.$broadcast('cartUpdate');
		getCart();
	});

	$scope.deleteItem = function(prid, quantity, cartid) {
		Message.confirmWithTitle('CONFIRM_TEXT', 'CART_REMOVE_CONF').then(function(res) {
			if(res) {
				ApiCaller.callAPI('AddToCart', {"prodid": prid, "type": "delete", "quantity": quantity , "cartid": cartid}, function(response){
					if (typeof response.status == "boolean" && response.status) {
						$rootScope.$broadcast('cartUpdate');
						setView(response);
						Store.cartStore.setStorage(response.products[response.products.length - 1].cartid);
					}
					else {
						Message.alert(response.message);
					}					
				},function(error) {
					console.log(error);
				});
			}
		});
	};

})
   
.controller('checkOutCtrl', function ($scope, ApiCaller, TokenService) {

	$scope.showColl = true;
	function getCart() {
		ApiCaller.callAPI("ShoppingCart", null, function(response){
			if (response.status) {
				$scope.totalprice = response.totalprice;
			}
			else {
				Message.alert(response.message);
			}
		},function(error) {
			console.log(error);
		});
	}
	$scope.prof_collection = {};
	$scope.prof_del = {};

	function getProfile () {
		ApiCaller.callAPI("GetProfile", null, function(response){
			if (response.status) {
				$scope.profile = response.data;
				$scope.prof_del = JSON.parse(JSON.stringify(response.data));
				$scope.prof_collection = JSON.parse(JSON.stringify(response.data));
				var keys = Object.keys($scope.profile);
				var del = ['user_id', 'address_street', 'address_street2', 'address_town', 'address_country', 'address_postcode', 'additional_phone'];
				$scope.prof_del['street'] = $scope.prof_del['address_street'];
				$scope.prof_del['address'] = $scope.prof_del['address_street2'];
				$scope.prof_del['town'] = $scope.prof_del['address_town'];
				$scope.prof_del['country'] = $scope.prof_del['address_country'];
				$scope.prof_del['postcode'] = $scope.prof_del['address_postcode'];

				angular.forEach (keys, function(val) {
					if (del.indexOf(val) != -1) {
						delete $scope.prof_del[val];
						delete $scope.prof_collection[val];
					}
				});
			}
			else {
				Message.alert(response.message);
			}
		},function(error) {
			console.log(error);
		});
	}

	$scope.delVBuy = function() {

	};

	$scope.collBuy = function(){

	};
	$scope.$on('$ionicView.beforeEnter', function(){	
		getCart();

		if (TokenService.getToken().length > 0) {
			getProfile();
		}
	});
})
 
