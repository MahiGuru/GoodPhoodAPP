   var appControllers = angular.module("GoodPhood.appCtrl", ['GoodPhood.Services', 'GoodPhood.directive']);
   appControllers.controller('loginCtrl', function ($scope, AccessScope, appService, $state) {
       $scope.user = {
           mobileNumber: "9441076540",
           deviceNumber: "0.5353",
           firstName: "Mahipal",
           lastName: "Guru",
           email: "mahi6535@gmail.com",
           userNumber: ''
       };

       //Temporary Code..
       if ($scope.user.deviceNumber == "") $scope.user.deviceNumber = Math.random().toFixed("4");

       //SETTING AND GETTING USER VALUE **** WATCHING ******
       $scope.$watch('user.userNumber', function (newValue, oldValue) {
           console.log(newValue);
           AccessScope.store('userNumber', newValue);
           console.log("From Access Scope = " + AccessScope.get('userNumber'));
       }, true);
       $scope.initialDivShow = true;
       $scope.secondDivShow = false;
       $scope.loginFirstBtnClick = function () {
           $scope.secondDivShow = true;
           $scope.initialDivShow = false;
       }
       $scope.loginBtnValid = function () {
           //validatemobile
           var postData = {
               mobileNo: $scope.user.mobileNumber,
               firstName: $scope.user.firstName,
               lastName: $scope.user.lastName,
               emailId: $scope.user.email,
               deviceId: $scope.user.deviceNumber
           };


           appService.post("validatemobile", postData).then(function (loginData) {
               alert("CLICK success");
               AccessScope.store("userNumber", loginData.userId);
               $scope.initialDivShow = true;
               $scope.secondDivShow = false;

               $state.go("common.table", {
                   "userNum": loginData.userId
               });



               //$scope.orderSummeryCount = summery
           }, function () {
               alert("Oops error occured..");
           });

       }

   });
   appControllers.controller('tableCtrl', function ($scope, AccessScope, $state, $stateParams) {
       $scope.tableDetails = {
           qrNumber: "",
           orderNumber: "",
           tableNumber: "",
           userNumber: $stateParams.userNum
       };
       //SETTING AND GETTING TABLE RELATED VALUES **** WATCHING ******
       $scope.$watch('tableDetails.qrNumber', function (newValue, oldValue) {
           console.log(newValue)
           console.log(newValue.charAt(0));
           if (newValue.length == 1) {
               $scope.tableDetails.qrNumber = newValue.replace(/^[0-9]/g, newValue + "#");
           }
           if (newValue.length == 3 && newValue.indexOf("#") >= -1) {
               $scope.tableDetails.orderNumber = newValue.charAt(0);
               $scope.tableDetails.tableNumber = newValue.charAt(2);
               $scope.tableDetails.userNumber = AccessScope.get('userNumber') || 1;

               AccessScope.store('tableDetails', $scope.tableDetails);
               console.log(AccessScope.get('tableDetails'));
           }
       }, true);
       $scope.tableSelectedClick = function () {
           if ($scope.tableDetails.orderNumber != "" && $scope.tableDetails.tableNumber != "" && $scope.tableDetails.userNumber != "") {
               $state.go("gp.menu", {
                   "venueId": $scope.tableDetails.orderNumber,
                   "tableId": $scope.tableDetails.tableNumber,
                   "userId": $scope.tableDetails.userNumber
               });
           } else {
               alert("Please choose Table and Order Number!! ");
           }
       }

   });




   appControllers.controller('menuCtrl', function ($scope, appService, $ionicSlideBoxDelegate, $ionicModal, $ionicPopup, $timeout, $interval, $state, $stateParams, AccessScope) {

       /* ---------------------------------- IONIC VIEW ENTER  ------------------------------- */
       $scope.$on('$ionicView.enter', function () { /* TODO :  loading view time do your logic */
           $scope.itemsReview = {};

           //REVIEW AND CONFIRM ITEMS SET TO CURRENT ITEMS
           function looptoItems(sections) {
               //alert("Loop inside");
               console.log(sections);
               $(sections).each(function (i, section) {
                   $(section.Categories).each(function (k, category) {
                       $(category.Items).each(function (key, item) {
                           angular.forEach($scope.itemsReview.reviewItems, function (value, ri) {
                               if ((item.ItemId == value.itemId)) {
                                   if (value.kotitems != undefined && value.kotitems != null) {
                                       $scope.sections[i].Categories[k].Items[key]["reviewCount"] = value.kotitems[0].quantity;
                                   }
                               }
                           });
                           angular.forEach($scope.itemsReview.confirmedItems, function (value, ci) {
                               if ((item.ItemId == value.itemId)) {
                                   if (value.kotitems != undefined && value.kotitems != null) {
                                       $scope.sections[i].Categories[k].Items[key]["confirmCount"] = value.kotitems[0].quantity;
                                   }
                               }
                           })

                       });
                   });
               });
           };

           appService.get("vieworder/" + $scope.tableDetails.orderNumber, "GET", null).then(function (viewOrderResponce) {
               //alert("view order");
               $scope.itemsReview.ordersResponce = viewOrderResponce;
               $scope.itemsReview.reviewItems = viewOrderResponce.reviewItems;
               $scope.itemsReview.confirmedItems = viewOrderResponce.confirmedItems;
           })

           $scope.$watch("itemsReview", function (newValue, oldValue) {
               $scope.$watch("sections", function (newValue, oldValue) {
                   console.log("Sectionsss");
                   alert("Sectionsss");
                   looptoItems(newValue);
               });

           }, true);
       });

       /* ---------------------------------- ///////IONIC VIEW ENTER  ------------------------------- */


       /**** 
            TEMPORARY INFO ABOUT ORDER DETAILS....
       ****/
       $scope.tableDetails = {
           qrNumber: "",
           orderNumber: "1",
           tableNumber: "1",
           userNumber: "1"
       };

       AccessScope.store('tableDetails', $scope.tableDetails);
       $scope.orderInfo = AccessScope.get('tableDetails');

       /**** 
            ////////TEMPORARY 
       ****/
       /*--------- GETTING ORDER DATA FROM STORED SERVICE ------- */
       //$scope.orderInfo = AccessScope.get('tableDetails');

       $scope.$watchCollection('$stateParams', function (newParams) {
           // alert("State Params page");
       });


       /* ---------------------------------- MENU SERVICE ------------------------------- */

       $scope.venueMenu = '';

       if ($scope.orderInfo != undefined) {
           $scope.menuPath = "create/" + $scope.orderInfo.orderNumber + "/" + $scope.orderInfo.tableNumber + "/" + $scope.orderInfo.userNumber;
       }
       
      $scope.loaderVisible = true;
       appService.get($scope.menuPath, null).then(function (resp) {
           
           $scope.venueMenu = resp.menu.Sections;
           $scope.sampleMenuData = resp;
           $scope.orderId = resp.orderId;
           /********* Collapsible ************/
           $ionicSlideBoxDelegate.update();
           $scope.loaderVisible = false;

       });

       // ~~~~~~ WATCHING MENU SERVICE AND ASSIGNING TO "SECTIONS" SCOPE
       $scope.$watch("venueMenu", function (newValue, oldValue) {
           if (!angular.equals(newValue, oldValue)) {
               $scope.sections = newValue;
           }
       });

       /* ------------------------- ///////MENU SERVICE ------------------------ */

       /* ------------------------- ORDER SUMMERY SERVICE --------------- ---------- */

       $scope.orderSummeryCount = "";
       var orderSummeryInterval = '';

       orderSummeryInterval = function () {
           appService.get("ordersummary/1/1", null).then(function (summery) {
               // alert("success");
               $scope.orderSummeryCount = summery
           });
       };
       $interval(function () {
           orderSummeryInterval();
       }, 2000);

       // ~~~~~ WATCHING ORDER SUMMERY COUNT
       $scope.$watch("orderSummeryCount", function (newValue, oldValue) {
           console.log("order");
           console.log(oldValue);
           console.log(newValue);
           console.log("ORDER = " + newValue);
           $scope.orderSummery = newValue;
       }, true);

       // ~~~~~ ORDER SUMMERY COUNT CLICK METHOD
       $scope.orderSummeryClick = function (itemCount) {
           if (itemCount >= 0) {
               $state.go("gp.review", {
                   "orderId": 1
               });
           } else {
               $state.go("common.table");
           }
       };

       /* ------------------------- /////ORDER SUMMERY SERVICE --------------- ---------- */

       /* ------------------------- CUSTOMIZE PANEL----------------------------------- */
       $scope.customizeLink = function (item) {
           $scope.modelItem = item;
           appService.get("getpreferences/" + $scope.orderInfo.orderNumber + "/" + item.ItemId + "/" + $scope.orderInfo.orderNumber, null).then(function (customiseData) {
               alert("success");
               console.log(customiseData);
               $scope.customizeData = customiseData;
           });


           console.log("customize link");
           $scope.modal.show();
       }
       $scope.savePreference = function () {
           alert("save prefernce");
           /*
           var postData = { orderId: $scope.orderInfo.orderNumber, itemId: modelItem.ItemId, userId: $scope.orderInfo.orderNumber, options: options };
           appService.post("savepreferences", postData)
           .then(function (customiseData) {
                alert("success");
                console.log(customiseData);
               $scope.customizeData = customiseData;
           });
           */
       };
       $ionicModal.fromTemplateUrl('templates/customizePage.html', {
           scope: $scope,
           animation: 'slide-in-up'
       }).then(function (modal) {
           $scope.modal = modal;
       });
       $scope.openModal = function () {
           $scope.modal.show();
       };
       $scope.closeModal = function () {
           $scope.modal.hide();
       };

       /* ------------------------- ////CUSTOMIZE PANEL----------------------------------- */

       /* -------------------------- POPUPS ---------------------------------- */

       // Triggered on a button click, or some other target
       /*
             <button class="button button-dark" ng-click="showPopup()">
              show
            </button>
       */
       $scope.filterList = [
           {
               text: "Vegeterian",
               checked: true
           },
           {
               text: "Non Vegeterian",
               checked: false
           },
           {
               text: "Eggeterian",
               checked: false
           }
           ];
       $scope.filteredItems = [];
       $scope.showPopup = function () {
           $scope.data = {}

           // An elaborate, custom popup
           var myPopup = $ionicPopup.show({
               templateUrl: 'templates/filterPage.html',
               title: 'Filter',
               subTitle: 'Choose type of items',
               scope: $scope,
               buttons: [
                   {
                       text: '<b>OK</b>',
                       type: 'button-positive',
                       onTap: function (e) {
                           angular.forEach($scope.filterList, function (value) {
                               if (value.checked == true) {
                                   $scope.filteredItems.push(value);
                               }
                           })
                       }
               },
             ]
           });
           myPopup.then(function (res) {
               console.log('Tapped!', res);
           });
           $timeout(function () {
               myPopup.close(); //close the popup after 3 seconds for some reason
           }, 13000);
       };


       /* -------------------------- /////POPUPS ---------------------------------- */

       /* ---------------------------  FILTER --------------------------------*/

       $scope.filterTypes = [
           {
               text: "Vegeterian",
               value: "Vegeterian"
           },
           {
               text: "Non Vegeterian",
               value: "NonVegeterian"
           },
           {
               text: "Eggterian",
               value: "Eggterian"
           }
          ];

       /* -------------------------- /////FILTER ---------------------------------- */


       $scope.$on('$ionicView.leave', function () {
           /* TODO :  Complete view  time do your logic */
           $interval.cancel(orderSummeryInterval);
       });

   });


   /************** 
                   REVIEW CTRL  
                            **************/
   appControllers.controller('reviewCtrl', function ($scope, appService, $stateParams, AccessScope) {


       $scope.$on('$ionicView.enter', function () {

           /**** 
                TEMPORARY 
           ****/
           $scope.tableDetails = {
               qrNumber: "",
               orderNumber: "1",
               tableNumber: "1",
               userNumber: "1"
           };

           AccessScope.store('tableDetails', $scope.tableDetails);

           $scope.orderInfo = AccessScope.get('tableDetails');

           /**** 
                /TEMPORARY 
           ****/

           /* TODO :  loading view time do your logic */
           
           $scope.loaderVisible = true; 
           appService.get("vieworder/" + $stateParams.orderId, "GET", null).then(function (viewOrderResponce) {
               alert(viewOrderResponce);
               $scope.ordersResponce = viewOrderResponce;
               $scope.loaderVisible = false;  
               AccessScope.store('discount', viewOrderResponce.discount);
                 
           })

           $scope.reviewData = "Scope from Review";
           $scope.ordersResponce = '';

           $scope.$watch("ordersResponce", function (newValue, oldValue) {
               $scope.reviewResponce = newValue;
               $scope.reviewItems = newValue.reviewItems;
               $scope.confirmedItems = newValue.confirmedItems;

           });


           $scope.placeOrder = function () {
               debugger;
               var kotIds = "";
               var kotItemIds = "";
               angular.forEach($scope.reviewItems, function (value, ri) {
                   if (($scope.reviewItems.length - 1) != ri) {
                       kotIds += value.kotitems[0].kotId + ",";
                       kotItemIds += value.kotitems[0].kotItemId + ",";
                   } else {
                       kotIds += value.kotitems[0].kotId;
                       kotItemIds += value.kotitems[0].kotItemId;
                   }
               });

               var postData = {
                   orderId: $scope.orderInfo.orderNumber,
                   userId: $scope.orderInfo.userNumber,
                   kotIds: kotIds,
                   kotItemIds: kotItemIds
               };
               appService.post("confirmorder", postData).then(function (summery) {
                   alert("Successfully place the order!");
                   /* TODO :  loading view time do your logic */
                   appService.get("vieworder/" + $scope.orderInfo.orderNumber, "GET", null).then(function (viewOrderResponce) {
                       $scope.ordersResponce = viewOrderResponce;
                   })


               }, function () {
                   alert("some thing went wrong while placing the order");
               });

           };

       });


   });

   /************** INVOICE CTRL  **************/
   appControllers.controller('invoiceCtrl', function ($scope, appService, $stateParams, AccessScope) {

       $scope.$on('$ionicView.enter', function () {

           /**** 
                TEMPORARY 
           ****/
           $scope.tableDetails = {
               qrNumber: "",
               orderNumber: "1",
               tableNumber: "1",
               userNumber: "1"
           };

           AccessScope.store('tableDetails', $scope.tableDetails);

           $scope.orderInfo = AccessScope.get('tableDetails');

           /**** 
                /TEMPORARY 
           ****/
           
           $scope.loaderVisible = true; 
           /* TODO :  loading view time do your logic */
           appService.get("getinvoice/" + $stateParams.orderId, "GET", null).then(function (invoiceResponce) {
               $scope.invoiceResponce = invoiceResponce;
               $scope.loaderVisible = false; 
           });
           $scope.totalPrice = 0;
           $scope.$watch("invoiceResponce", function (newValue, oldValue) {
               $scope.invoiceDetails = newValue;
           });
           $scope.Discount = AccessScope.get("discount") || 30;
           $scope.$watch("invoiceDetails", function (newValue, oldValue) {
               if (newValue != undefined) {
                   angular.forEach(newValue.Items, function (val) {
                       $scope.totalPrice = $scope.totalPrice + (val.itemPrice * val.itemQuantity)
                   });
                   //(((newValue.serviceTax) / 100) * invoiceBillTotal).toFixed(2)
                   $scope.serviceTax = (((newValue.serviceTax) / 100) * $scope.totalPrice);
                   $scope.vat = (((newValue.VAT) / 100) * $scope.totalPrice); 
                   $scope.totalBill = $scope.totalPrice - ($scope.serviceTax - $scope.vat).toFixed(2);
               }
           }, true);
           var now = new Date();
           var nowDate = (now.getDate()) + '/' + (now.getMonth() + 1) + '/' + now.getFullYear();
           var nowTime = now.getHours() + ':' + ((now.getMinutes() < 10) ? ("0" + now.getMinutes()) : (now.getMinutes())) + ':' + ((now.getSeconds() < 10) ? ("0" + now.getSeconds()) : (now.getSeconds()));

           $scope.invoice = {
               date: nowDate,
               time: nowTime,
               totalPrice: ""
           }


       });


   });


   /************** FEEDBACK CTRL  **************/
   appControllers.controller('feedbackCtrl', function ($scope, appService, $stateParams, AccessScope) {

       $scope.$on('$ionicView.enter', function () {

           /**** 
                TEMPORARY 
           ****/
           $scope.tableDetails = {
               qrNumber: "",
               orderNumber: "1",
               tableNumber: "1",
               userNumber: "1"
           };

           AccessScope.store('tableDetails', $scope.tableDetails);

           $scope.orderInfo = AccessScope.get('tableDetails');

           /**** 
                /TEMPORARY 
           ****/

           /* TODO :  loading view time do your logic */
           appService.get("getfeedback/" + $stateParams.orderId + "/" + $stateParams.userId, "GET", null).then(function (feedbackResponce) {
               alert(feedbackResponce);
               $scope.feedbackResponce = feedbackResponce;
           })


           $scope.$watch("feedbackResponce", function (newValue, oldValue) {
               $scope.feedbackDetails = newValue;
           });

       });


   });
