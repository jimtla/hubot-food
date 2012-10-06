(function(){
  "use strict";
  var toolsLib   = require("../tools"),
      _          = require("underscore");

  exports.Order = function(globals){
    var tools = new toolsLib.Tools(globals);

    this.placeOrder = function(restaurantId, tray, tip, deliveryTime, firstName, lastName, address, creditCard, user, createUser, callback){
      var params = [
        restaurantId
      ], delivery_date, delivery_time;

      if (deliveryTime !== "ASAP"){
        if(deliveryTime instanceof Date){
          delivery_date = String(deliveryTime.getMonth() + 1) + "-" +  String(deliveryTime.getDate());
          delivery_time = deliveryTime.getHours() + ":" + deliveryTime.getMinutes();
        } else {
          var match = deliveryTime.match(/(\d{2}-\d{2})\+(\d{2}:\d{2})/);
          if(match){
            delivery_date = match[1];
            delivery_time = match[2];
          } else {
            delivery_date = "ASAP";
            delivery_time = "";
          }
        }
      } else {
        delivery_date = "ASAP";
        delivery_time = "";
      }

      if (!_.isString(tray)){
        tray = tray.buildTrayString();
      }

      var data = {
        tray: tray,
        tip: tip,
        delivery_date: delivery_date,
        delivery_time: delivery_time,
        first_name: firstName,
        last_name: lastName,
        type: "res"
      };

      // test for nicknames as address or creditCard
      if (_.isString(address)){
        data.nick = address;
      } else {
        data.addr  = address.addr;
        data.city  = address.city;
        data.state = address.state;
        data.zip   = address.zip;
        data.phone = address.phone;
      }

      if (_.isString(creditCard)){
        data.card_nick = creditCard;
      } else {
        data.card_name       = creditCard.name;
        data.card_number     = creditCard.number;
        data.card_cvc        = creditCard.cvc;
        data.card_expiry     = creditCard.formatExpirationDate();
        data.card_bill_addr  = creditCard.billAddress.addr;
        data.card_bill_addr2 = creditCard.billAddress.addr2;
        data.card_bill_city  = creditCard.billAddress.city;
        data.card_bill_state = creditCard.billAddress.state;
        data.card_bill_zip   = creditCard.billAddress.zip;
      }


      var uriString = tools.buildUriString("/o", params);

      if (createUser){
        data.em       = user.email;
        data.pw       = user.password;
        tools.makeApiRequest(globals.orderUrl, uriString, "POST",  data, {}, callback);
      }else if (user.password){
        tools.makeAuthenticatedApiRequest(globals.orderUrl, uriString, "POST", data, {}, user.email, user.password, callback);
      }else{
        data.em = user.email;
        tools.makeApiRequest(globals.orderUrl, uriString, "POST",  data, {}, callback);
      }
    };
    this.makeOrderRequest = function(uri, params, data, method, callback){
      var uriString = tools.buildUriString(uri, params);
      tools.makeApiRequest(globals.orderUrl, uriString, method, data, {}, callback);
    };
  };
  
}());
