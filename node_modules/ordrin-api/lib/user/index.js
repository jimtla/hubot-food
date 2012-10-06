(function(){
  "use strict";
  var toolsLib = require("../tools"),
      crypto   = require("crypto");

  exports.User = function(globals){
    var tools = new toolsLib.Tools(globals);

    this.getUser = function(user, callback){
      this.makeUserRequest("/u", [user.email], {}, "GET", user, callback);
    };

    this.getAllAddresses = function(user, callback){
      var params = [
        user.email,
        "addrs"
      ];
      this.makeUserRequest("/u", params, {}, "GET", user, callback);
    };

    this.getAddress = function(user, addressName, callback){
      var params = [
        user.email,
        "addrs",
        addressName
      ];
      this.makeUserRequest("/u", params, {}, "GET", user, callback);
    };

    this.setAddress = function(user, addressName, address, callback){
      var params = [
        user.email,
        "addrs",
        addressName
      ];
      var data = {
        addr: address.addr,
        addr2: address.addr2,
        city: address.city,
        state: address.state,
        zip: address.zip,
        phone: address.phone
      };
      this.makeUserRequest("/u", params, data, "PUT", user, callback);
    };

    this.removeAddress = function(user, addressName, callback){
      var params = [
        user.email,
        "addrs",
        addressName
      ];

      this.makeUserRequest("/u", params, {}, "DELETE", user, callback);
    }

    this.getAllCreditCards = function(user, callback){
      var params = [
        user.email,
        "ccs"
      ];

      this.makeUserRequest("/u", params, {}, "GET", user, callback);
    }

    this.getCreditCard = function(user, cardName, callback){
      var params = [
        user.email,
        "ccs",
        cardName
      ];

      this.makeUserRequest("/u", params, {}, "GET", user, callback);
    }

    this.setCreditCard = function(user, cardName, creditCard, callback){
      var params = [
        user.email,
        "ccs",
        cardName
      ]

      var data = {
        name: creditCard.name,
        number: creditCard.number,
        cvc: creditCard.cvc,
        expiry_month: creditCard.expiryMonth,
        expiry_year: creditCard.expiryYear,
        bill_addr: creditCard.billAddress.addr,
        bill_addr2: creditCard.billAddress.addr2,
        bill_city: creditCard.billAddress.city,
        bill_state: creditCard.billAddress.state,
        bill_zip: creditCard.billAddress.zip,
        phone: creditCard.billAddress.phone,
        CustomerId: user.email
      }
      
      this.makeUserRequest("/u", params, data, "PUT", user, callback);
    }

    this.removeCreditCard = function(user, cardName, callback){
      var params = [
        user.email,
        "ccs",
        cardName
      ];

      this.makeUserRequest("/u", params, {}, "DELETE", user, callback);
    }

    this.getOrderHistory = function(user, callback){
      var params = [
        user.email,
        "orders"
      ];

      this.makeUserRequest("/u", params, {}, "GET", user, callback);
    }

    this.getOrderDetails = function(user, orderId, callback){
      var params = [
        user.email,
        "order",
        orderId
      ];

      this.makeUserRequest("/u", params, {}, "GET", user, callback);
    }

    this.setPassword = function(user, newPassword, callback){
      var params = [
        user.email,
        "password"
      ];
      var data ={
        password: crypto.createHash("SHA256").update(newPassword).digest("hex")
      };

      this.makeUserRequest("/u", params, data, "PUT", user, callback);
    }

    // this one's a little weird because it's not an authenticated request, so it behaves a bit differently than the others in this file.
    this.createUser = function(user, firstName, lastName, callback){
      var params    = [user.email];
      var uriString = tools.buildUriString("/u", params);
      var data      = {
        first_name: firstName,
        last_name : lastName,
        pw        : user.password
      };

      tools.makeApiRequest(globals.userUrl, uriString, "POST", data, {}, callback);
    }

    this.makeUserRequest = function(uri, params, data, method, user, callback){
      var uriString = tools.buildUriString(uri, params);

      tools.makeAuthenticatedApiRequest(globals.userUrl, uriString, method, data, {}, user.email, user.password, callback);
    }
  };
}());
