angular.module('app.payment', [])

.factory('Payment', function(){
    
    function onPayPalMobileInit() {
        PayPalMobile.prepareToRender("PayPalEnvironmentSandbox", configuration(), function(){
            console.log('Plugin Active');
        })
    }
    
    function createPayment(amount) {
        var paymentDetails = new PayPalPaymentDetails("" + amount, "0.00", "0.00");
        var payment = new PayPalPayment("" + amount, "EUR", "Buy Da Vinci", "Purchase", paymentDetails);
        return payment;
    }

    function configuration() {
        var config = new PayPalConfiguration({merchantName: "Da Vinci", merchantPrivacyPolicyURL: "https://mytestshop.com/policy", merchantUserAgreementURL: "https://mytestshop.com/agreement"});
        return config;
    }
    
    var pay = {};
    
    pay.init = function(){
        if (PayPalMobile) {
            var clientIDs = {
                "PayPalEnvironmentProduction": "YOUR_PRODUCTION_CLIENT_ID",
                "PayPalEnvironmentSandbox": "AQoSNnQoG_t9AReBwHdVGzrvbqdcBoQ3uK_47YBir7hM3ugo-FzlWf6NHSeU64L6xP9HsZK0M3CNvi6T"
            };
            PayPalMobile.init(clientIDs, onPayPalMobileInit);
        }
    };

    pay.cardScan = function(onCardIOComplete, onUserCanceled) {
       CardIO.scan({
            "requireExpiry": true,
            "requireCVV": false,
            "requirePostalCode": false,
            "restrictPostalCodeToNumericOnly": true
        }, onCardIOComplete, onUserCanceled);
    };

    pay.buyNow = function(amount, onSuccesfulPayment, onUserCanceled) {
        PayPalMobile.renderSinglePaymentUI(createPayment(amount), onSuccesfulPayment, onUserCanceled);
    };

    return pay;
});