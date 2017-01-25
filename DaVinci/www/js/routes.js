angular.module('app.routes', [])

.config(function($stateProvider, $urlRouterProvider) {

  // Ionic uses AngularUI Router which uses the concept of states
  // Learn more here: https://github.com/angular-ui/ui-router
  // Set up the various states which the app can be in.
  // Each state's controller can be found in controllers.js
  $stateProvider
  .state('menu.home', {
    url: '/home',
    views: {
      'side-menu': {
        templateUrl: 'templates/home.html',
        controller: 'homeCtrl'
      }
    }
  })

  .state('menu.about', {
    url: '/about',
    views: {
      'side-menu': {
        templateUrl: 'templates/about.html',
        controller: 'aboutCtrl'
      }
    }
  })

  .state('menu.contact', {
    url: '/contact',
    views: {
      'side-menu': {
        templateUrl: 'templates/contact.html',
        controller: 'contactCtrl'
      }
    }
  })

  .state('menu.orderOnline', {
    url: '/order',
    views: {
      'side-menu': {
        templateUrl: 'templates/orderOnline.html',
        controller: 'orderOnlineCtrl'
      }
    }
  })

  .state('menu.listing', {
    url: '/listing/:catid',
    views: {
      'side-menu': {
        templateUrl: 'templates/listings.html',
        controller: 'listingCtrl'
      }
    }
  })

  .state('menu', {
    url: '/side-menu',
    templateUrl: 'templates/menu.html',
    controller: 'menuCtrl'
  })

  .state('menu.offers', {
    url: '/offers',
    views: {
      'side-menu': {
        templateUrl: 'templates/offers.html',
        controller: 'offersCtrl'
      }
    }
  })

  .state('login', {
    url: '/login',
    templateUrl: 'templates/login.html',
    controller: 'loginCtrl'
  })

  .state('menu.settings', {
    url: '/settings',
    views: {
      'side-menu': {
        templateUrl: 'templates/settings.html',
        controller: 'settingsCtrl'
      }
    }
  })

  .state('menu.pastorders', {
    url: '/pastorders',
    views: {
      'side-menu': {
        templateUrl: 'templates/pastOrders.html',
        controller: 'pastordersCtrl'
      }
    }
  })

  .state('menu.signup', {
    url: '/signup',
    views: {
      'side-menu': {
        templateUrl: 'templates/signup.html',
        controller: 'signupCtrl'
      }
    }
  })

  .state('menu.shoppingCart', {
    url: '/shoppingcart',
    views: {
      'side-menu': {
        templateUrl: 'templates/shoppingCart.html',
        controller: 'shoppingCartCtrl'
      }
    }
  })

  .state('menu.checkOut', {
    url: '/checkOut',
    views: {
      'side-menu': {
        templateUrl: 'templates/checkOut.html',
        controller: 'checkOutCtrl'
      }
    }
  })

$urlRouterProvider.otherwise('/side-menu/home')

  

});