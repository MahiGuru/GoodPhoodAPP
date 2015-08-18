// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
angular.module('GoodPhood', ['ionic', "GoodPhood.Controller", "GoodPhood.Services", "GoodPhood.directive"])
   

.run(function($ionicPlatform, $rootScope) {
  $ionicPlatform.ready(function() {
    // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
    // for form inputs)
    if(window.cordova && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
    }
    if(window.StatusBar) {
      StatusBar.styleDefault();
    }
  });
  
    $rootScope.$on('handleEmit', function(event, args) {
        $rootScope.$broadcast('handleBroadcast', args);
    }); 
  
}).config(function($stateProvider, $urlRouterProvider, $httpProvider){ 
    
    //$httpProvider.defaults.headers.post['Content-Type'] = 'application/json'; 
    //$httpProvider.defaults.headers['Access-Control-Allow-Headers'] = '*'; 
    
    $stateProvider.state('common', {
        url : "/common",
        abstract : false,
        templateUrl : "templates/masterPageCommon.html",
        controller : "AppCtrl"
    })
    .state('common.login', {
        url : "/login",
        views : {
            "commonView" : {
                templateUrl : "templates/loginPage.html",
                controller : "loginCtrl"   
             }    
        }    
    })
    .state('common.table', {
        url : "/table/:userNum",
        views : {
               "commonView" : {
                    templateUrl : "templates/tablePage.html",
                    controller : "tableCtrl"
                }         
            }
    })
    .state('gp', {
        url : "/gp",
        abstract : true,
        templateUrl : "templates/masterPage.html",
        controller : "AppCtrl"
        
    })
    
    .state('gp.menu', {
        url : "/menu/:venueId/:tableId/:userId",
        views : {
            "viewContent" : {
                templateUrl : "templates/menuPage.html",
                controller : "menuCtrl"
            }
        }
    }).state('gp.review', {
        url : "/review/:orderId",
        cache:false,
        views : {
            "viewContent" : {
                templateUrl : "templates/reviewPage.html",
                controller : "reviewCtrl"
            }
        }
    }).state('gp.invoice', {
        url : "/invoice/:orderId",
        views : {
            "viewContent" : {
                templateUrl : "templates/invoicePage.html",
                controller : "invoiceCtrl" 
            }
        }
    }).state('gp.feedback', {
        url : "/feedback/:orderId/:userId",
        views : {
            "viewContent" : {
                templateUrl : "templates/feedbackPage.html",
                controller : "feedbackCtrl" 
            }
        }
    }); 
    
    $urlRouterProvider.otherwise("/common/login");
});
