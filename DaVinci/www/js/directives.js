
angular.module('app.directives', [])
.directive('ionStepper', function($rootScope, ApiCaller) {
    return {
        restrict: 'E',
        template : '<div class="stepper">'+
            '<button ng-click="minusClick()">-</button>'+
            '<span class="cnt">{{cartitem.quantity}}</span><input type="hidden" ng-model="cartitem.quantity"/>' +
            '<button ng-click="plusClick()">+</button>'+
            '</div>',
        require: 'ngModel',
        scope: {
            cartitem: '=ngModel'
        },
        link: function(scope, iElement, iAttrs, ngModelController) {
            scope.minusClick = function(){
                if (scope.cartitem.quantity > 1) {
                    scope.cartitem.quantity--;
                    onChange();
                }
            };

            function onChange() {
                ApiCaller.callAPI('AddToCart', {"prodid": scope.cartitem.product_id, "type": "edit", "quantity": scope.cartitem.quantity, cartid: scope.cartitem.cartid}, function(response){
                    $rootScope.$broadcast('viewUpdate', {'response': response});
                },function(error) {
                    console.log(error);
                });
            }

            scope.plusClick = function(){
                scope.cartitem.quantity++;
                onChange();
            };
        }
    };
})

.directive('cartButton', function() {
    return {
        restrict: 'E',
        template : '<span>{{cartcnt}}</span>' +
        '<i class="icon ion-ios-cart"></i>',
        require: 'ngModel',
        scope: {
            cartcnt: "=ngModel"
        }
    };
})

.directive('statusBar', function() {
    return {
        restrict: 'E',
        template: "<div ng-hide=\"shouldHide\" ng-class=\"parent.status.open == 'yes'?'green':'red'\"><span>{{parent.message.open}}</span></div>" +//<i ng-class=\"parent.status.open == 'yes'?'ion-checkmark-round':'ion-close-round'\"></i>
        "<div ng-hide=\"shouldHide\" ng-class=\"parent.status.takeaway == 'yes'?'green':'red'\"><span>{{parent.message.takeaway}}</span></div>" +
        "<div ng-hide=\"shouldHide\" ng-class=\"parent.status.delivery == 'yes'?'green':'red'\"><span>{{parent.message.delivery}}</span></div>",
        controller: function($scope, $rootScope, ApiCaller, $translate, Store) {
            $scope.shouldHide = true;
            $scope.$on('getstats', function() {
                changeLan();
            })

            $scope.texts = {};
            function changeLan() {
                $translate(['DELIVERIES', 'TAKEAWAY', 'WEAREOPEN', 'WEARECLOSED', 'DELIVERIESUNAVAILABLE']).then(function (translation) {
                    $scope.texts = translation;
                    call();
                }, function (translationId) {
                    $scope.texts = translation;
                    call();
                });
            }
            changeLan();
            $rootScope.$on('$translateChangeSuccess', function () {
                changeLan();
            });

            function setViews(data) {
                if (data === null || typeof data == 'undefined') {
                    window.sessionStorage.removeItem('openchecktime')
                    call();
                    return;
                }
                $scope.shouldHide = false;
                var openmessage = data.opencheck.open == 'yes'?$scope.texts.WEAREOPEN: $scope.texts.WEARECLOSED;
                var takemess = $scope.texts.TAKEAWAY;
                var delmess = (data.opencheck.delivery == 'yes')?$scope.texts.DELIVERIES + ': ' + data.opencheck.deliverystarttime + ' - ' + data.opencheck.deliveryendtime: $scope.texts.DELIVERIESUNAVAILABLE;

                $scope.parent = {
                    status: data.opencheck,
                    message: {
                        open: openmessage,
                        takeaway: takemess,
                        delivery: delmess
                    }
                };
            }
            
            function call() {
                if (Store.checkTime()) {
                    ApiCaller.callAPI("OpenCheck", null, function(response){
                        if (response.status) {
                            Store.opencheck.setStorage(response.data);
                            setViews(response.data);
                        }
                    },function(error) {
                        console.log(error);
                        $scope.parent = JSON.parse(window.sessionStorage.getItem('parentoption'));
                    });
                }
                else {
                    setViews(Store.opencheck.getStorage());
                }
            }
        }
    };
})


.directive('popOption', function(){
    return {
        restrict: 'E',
        templateUrl: 'templates/popOption.html',
        require: 'ngModel',
        scope: {
            options: '=ngModel',
            optionShow: '=ngHide'
        },
        controller: function($scope, $rootScope) {
            $scope.selected = "[]";
            $scope.saveNotPressed = true;
            $scope.$watch('optionShow', function (newValue, oldValue, scope) {
                if (!newValue) {
                    $scope.selected = "[]";
                    $scope.saveNotPressed = true;
                }
            })

            $scope.ifselectedItem = function(supid, id) {
                var selected = JSON.parse($scope.selected);
                var sel = {};
                var idxM = -1;
                for (var i = 0; i < selected.length; i++) {
                    var idObj = selected[i];
                    if (idObj.option_id == supid) {
                        sel = idObj;
                        idxM = i;
                        break;
                    }
                }

                if (idxM == -1) {
                    return '';
                }

                var arr = sel.field_ids;
                if (typeof arr === "undefined" || arr == null) {
                    sel.field_ids = [];
                }
                var idx = sel.field_ids.indexOf(parseInt(id));
                if (idx == -1) {
                    return '';
                }
                else {
                    return 'bg-red';
                }
            };

            $scope.closePop = function(){
                $scope.optionShow = true;
                $scope.selected = "[]";
                $scope.selectedVals = "";
            };


            $scope.showOptErr = function(optionid) {
                var selected = JSON.parse($scope.selected);
                for ( var i=0; i < $scope.options.val.length ; i++) {
                    var optionDet = $scope.options.val[i];
                    if (optionid == optionDet.id) {
                        for (var j = 0; j < selected.length; j++) {
                            var idObj = selected[j];
                            if (optionDet.id == idObj.option_id) {
                                if (idObj.field_ids.length <= parseInt(optionDet.select_howmany) && idObj.field_ids.length > 0) {
                                    return true;
                                }
                                else {
                                    return false;
                                }
                            }
                        }
                    }
                }
                return true && $scope.saveNotPressed;
            };

            $scope.saveSelections = function(){
                $scope.saveNotPressed = false;
                var list = [];
                var selected = JSON.parse($scope.selected);
                for ( var i=0; i < $scope.options.val.length ; i++) {
                    var optionDet = $scope.options.val[i];
                    for (var j = 0; j < selected.length; j++) {
                        var idObj = selected[j];
                        if (optionDet.id == idObj.option_id) {
                            if (idObj.field_ids.length <= parseInt(optionDet.select_howmany) && idObj.field_ids.length > 0) {
                                list.push(true);
                            }
                            else {
                                list.push(false);
                            }
                            break;
                        }
                    }
                }
                if (selected.length == list.length && selected.length == $scope.options.val.length) {
                    for (var k=0; k < list.length; k++) {
                        if (!list[k]) {
                            return;
                        }
                    }
                }
                else {
                    return;
                }
                $scope.options.returner = $scope.selected;
                console.log($scope.options.returner);
                $rootScope.$broadcast('cartoptionsselected');
            };

            $scope.selectItem = function(supid, id) {
                var selected = JSON.parse($scope.selected);
                var sel = {};
                var idxM = -1;
                for (var i = 0; i < selected.length; i++) {
                    var idObj = selected[i];
                    if (idObj.option_id == supid) {
                        sel = idObj;
                        idxM = i;
                        break;
                    }
                }

                if (Object.keys(sel).length == 0) {
                    sel = {
                        "option_id" : supid,
                        "field_ids":[parseInt(id)]
                    };
                }
                else {
                    var optionDet = {};
                    for ( var i=0; i < $scope.options.val.length ; i++) {
                        if (supid == $scope.options.val[i].id) {
                            optionDet = $scope.options.val[i];
                            break;
                        }
                    }

                    var arr = sel.field_ids;
                    if (typeof arr === "undefined" || arr == null) {
                        sel.field_ids = [];
                    }
                    var idx = sel.field_ids.indexOf(parseInt(id));
                    if (idx != -1) {
                        sel.field_ids.splice(idx, 1);
                    }
                    else if (sel.field_ids.length < parseInt(optionDet.select_howmany)) {
                        sel.field_ids.push(parseInt(id));
                    }
                    // else if (idx != -1) {
                    //     sel.field_ids.splice(idx, 1);
                    // } 
                }

                if (idxM != -1) {
                    selected[idxM] = sel;
                }
                else {
                    selected.push(sel);
                }
                $scope.selected = JSON.stringify(selected);
                console.log(id + '\n' + $scope.selected);
            }
        }
    }
})