(function(){
  "use strict";
  var toolsLib = require("../tools");

  exports.Restaurant = function(globals){
    var tools    = new toolsLib.Tools(globals);


    this.getDeliveryList = function(dateTime, address, callback){
      dateTime = this.checkDateTime(dateTime);

      var params = [
        dateTime,
        address.zip,
        address.city,
        address.addr
      ];

      this.makeRestaurantRequest("/dl", params, {}, "GET", callback);
    }

    this.getDeliveryCheck = function(restaurantId, dateTime, address, callback){
      dateTime = this.checkDateTime(dateTime);

      var params = [
        restaurantId,
        dateTime,
        address.zip,
        address.city,
        address.addr
      ]

      this.makeRestaurantRequest("/dc", params, {}, "GET", callback);
    }

    this.getFee = function(restaurantId, subtotal, tip, dateTime, address, callback){
      dateTime = this.checkDateTime(dateTime);

      var params = [
        restaurantId,
        subtotal,
        tip,
        dateTime,
        address.zip,
        address.city,
        address.addr
      ]

      this.makeRestaurantRequest("/fee", params, {}, "GET", callback);
    }

    this.getDetails = function(restaurantId, callback){
      this.makeRestaurantRequest("/rd", [restaurantId], {}, "GET", callback);
    }

    /*
     * function to make all restaurant api requests
     * uri is the base uri so something like /dl, include the /
     * params are all parameters that go in the url. Note that this is different than the data
     * data is the data that goes either after the ? in a get request, or in the post body
     * method is either GET or POST (case-sensitive)
     */

    this.makeRestaurantRequest = function(uri, params, data, method, callback){
      var uriString = tools.buildUriString(uri, params);
      
      tools.makeApiRequest(globals.restaurantUrl, uriString, method, data, {}, callback);
    }

    this.checkDateTime = function(dateTime){
      if (dateTime != "ASAP"){
        // Accept strings that this function would output
        if(dateTime instanceof Date){
          var delivery_date = String(dateTime.getMonth() + 1) + "-" +  String(dateTime.getDate());
          var delivery_time = dateTime.getHours() + ":" + dateTime.getMinutes();
          dateTime = delivery_date + "+" + delivery_time;
        }
      }
      return dateTime;
    }
  }

}());
