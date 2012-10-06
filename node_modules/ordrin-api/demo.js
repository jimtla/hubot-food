(function(){
  "use strict";
  var ordrin    = require("./main.js"),
      prompt    = require("prompt");


  prompt.message = "Enter";
  prompt.start();

  // some globals about the user
  var userLogin, userAddress, userCreditCard;

  var queue = [
    ["Create a User", ["firstName", "lastName", "email", "password"], createUser],
    ["Create an Address", ["addressName", "streetAddress", "city", "state", "zip", "phone", "streetAddress2"], createAddress],
    ["Get all restaurants for address at given time. Time is either ASAP or a millisecond timestamp", ["time"], getRestaurants],
    ["Get if a particular restaurant will deliver", ["restaurantId", "time"], getDeliveryCheck],
    ["Get Fee for ordering a given amount with a given tip", ["restaurantId", "amount", "tip", "time"], getDeliveryFee],
    ["Get Details about a given restaurant", ["restaurantId"], getRestaurantDetails],
    ["Getting all your user's addresses", [], getAddresses],
    ["Remove an Address", ["addressName"], removeAddress],
    ["Create the earlier address again", ["addressName"], reCreateAddress],
    ["Create a credit card", ["cardName", "nameOnCard", "expiryMonth", "expiryYear", "number", "cvc"], createCreditCard],
    ["Getting all your user's credit cards", [], getCreditCards],
    ["Get a specific Credit Card", ["cardName"], getCreditCard],
    ["Remove a specific Credit Card", ["cardName"], removeCreditCard],
    ["Create the earlier credit card again", ["cardName"], reCreateCreditCard],
    ["Order food from this user", ["restaurantId", "itemId", "quantity", "tip", "firstName", "lastName", "time"], orderFoodLoggedIn],
    ["Order food without a user", ["restaurantId", "itemId", "quantity", "tip", "firstName", 
                                   "lastName", "email", "time"], orderFoodNoUser],
    ["Order food and create a new user", ["restaurantId", "itemId", "quantity", "tip", 
                                          "firstName", "lastName", "email", "password", "time"], orderFoodAndCreateUser],
    ["Getting Order History", [], getOrderHistory],
    ["Get Order Details", ["orderId"], getOrderDetails],
    ["Change the user's password", ["newPassword"], changeUserPassword]
  ];
  var userId = makeId();

  // object to hold onto default values
  var defaultValues = {
    firstName: "John",
    lastName: "DiMaggio",
    email: "demo+" + userId + "@ordr.in",
    password: "password",
    addressName: "Main",
    streetAddress: "1 Main Street",
    city: "College Station",
    state: "TX",
    zip: 77840,
    phone: "2125551212",
    streetAddress2: "",
    time: "ASAP",
    amount: 45,
    tip: 20.45,
    cardName: "Main",
    nameOnCard: "John DiMaggio",
    expiryMonth: 11,
    expiryYear: new Date().getFullYear() + 3,
    number: 4111111111111111,
    cvc: 123,
    quantity: 30,
    newPassword: "newPassword"
  };


  prompt.get(["apiKey"], function(err, result){
    ordrin = ordrin.init({
      apiKey: result.apiKey,
      servers: "test"
    /*  restaurantUrl: "r-test.ordr.in",
      userUrl: "u-test.ordr.in",
      orderUrl: "o-test.ordr.in"*/
    });
    main();
  });

  // prints out a line of text, gets input, then calls the next function
  function main(){
    if (queue.length == 0){
      console.log("END OF DEMO");
      process.exit();
    }
    var thisCall = queue[0];
    var values  = thisCall[1];
    var properties = {};
    for (var i = 0; i < values.length; i++){
      properties[values[i]] = {
        message: values[i] + " [" + defaultValues[values[i]] + "]"
      }
    }

    console.log(thisCall[0]);

    if (thisCall[1].length != 0){
      prompt.get({properties: properties}, thisCall[2]);
    }else{
      thisCall[2]();
    }
  }

  // sets values either to default or inputed
  function setValues(values, input){
    for (var i = 0; i < values.length; i++){
      if (input[values[i]] == ""){
        input[values[i]] = defaultValues[values[i]];
      }
    }
    return input;
  }



  // creates a new user, and sets the userLogin var to an object representing that user
  function createUser(err, result){
    result = setValues(["firstName", "lastName", "email", "password"], result);

    try{
      userLogin = new ordrin.UserLogin(result.email, result.password);
      ordrin.user.createUser(userLogin, result.firstName, result.lastName, callback);
    }catch(e){
      var errorFields = "";
      for (var field in e.fields){
        errorFields += field + ", ";
      }
      console.log("Invalid info. Check the following fields:", errorFields);
      main();
    }
  }

  // creates an address object and saves it to the user's account
  function createAddress(err, result){
    result = setValues(["addressName", "streetAddress", "city", "state", "zip", "phone", "streetAddress2"], result);

    try{
      userAddress = new ordrin.Address(result.streetAddress, result.city, result.state, 
                                       result.zip, result.phone, result.streetAddress2);
      ordrin.user.setAddress(userLogin, result.addressName, userAddress, callback);
    }catch(e){
      var errorFields = "";
      for (var field in e.fields){
        errorFields += field + ", ";
      }
      console.log("Invalid info. Check the following fields:", errorFields);
      main();
    }
    
  }

  // gets all restaurants delivering at the given time
  function getRestaurants(err, result){
    result = setValues(["time"], result);

    if (result.time != "ASAP"){
      result.time = new Date(Number(result.time));
    }

    ordrin.restaurant.getDeliveryList(result.time, userAddress, function(err, data){
      if (err){
        console.error("Something went wrong", err);
        process.exit();
      }else{
        defaultValues.restaurantId = data[0].id;
        console.log("Got API data", data);

        queue = queue.slice(1);
        main();
      }
    });
  }

  function getDeliveryCheck(err, result){
    result = setValues(["restaurantId", "time"], result);

    if (result.time != "ASAP"){
      result.time = new Date(Number(result.time));
    }

    ordrin.restaurant.getDeliveryCheck(result.restaurantId, result.time, userAddress, function(err, data){
      if (err){
        console.error("Something went wrong", err);
        process.exit();
      }else{
        if (!data.delivery){
          console.log("Restaurant does not deliver during given time, trying one hour later");
          var timestamp      = new Date().getTime();
          defaultValues.time = new Date(timestamp + 3600000).getTime();
          getDeliveryCheck(null, {restaurantId: "", time: ""});
        }else{
          console.log("Got API data", defaultValues.time, data);
          queue = queue.slice(1);
          main();
        }
      }
    });
  }

  function getDeliveryFee(err, result){
    result = setValues(["restaurantId", "amount", "tip", "time"], result);

    if (result.time != "ASAP"){
      result.time = new Date(Number(result.time));
    }

    ordrin.restaurant.getFee(result.restaurantId, result.amount, result.tip, result.time, userAddress, callback);
  }

  function getRestaurantDetails(err, result){
    result = setValues(["restaurantId"], result);
    ordrin.restaurant.getDetails(result.restaurantId, function(err, data){
      if (err){
        console.error("Something went wrong", err);
        process.exit();
      }else{
        defaultValues.itemId = data.menu[0].children[0].id;
        console.log("Got API data", data);

        queue = queue.slice(1);
        main();
      }
    });
  }

  function getAddresses(err, result){
    ordrin.user.getAllAddresses(userLogin, callback);
  }

  function removeAddress(err, result){
    result = setValues(["addressName"], result);
    ordrin.user.removeAddress(userLogin, result.addressName, callback);
  }

  function reCreateAddress(err, result){
    result = setValues(["addressName"], result);
    ordrin.user.setAddress(userLogin, result.addressName, userAddress, callback);
  }

  function createCreditCard(err, result){
    result = setValues(["cardName", "nameOnCard", "expiryMonth", "expiryYear", "number", "cvc"], result);
    try{
      userCreditCard = new ordrin.CreditCard(result.nameOnCard, result.expiryMonth, result.expiryYear, 
                                           userAddress, result.number, result.cvc);
      ordrin.user.setCreditCard(userLogin, result.cardName, userCreditCard, callback);
    }catch(e){
      var errorFields = "";
      for (var field in e.fields){
        errorFields += field + ", ";
      }
      console.log("Invalid info. Check the following fields:", errorFields);
      main();
    }
  }

  function getCreditCards(err, results){
    ordrin.user.getAllCreditCards(userLogin, callback);
  }

  function getCreditCard(err, results){
    results = setValues(["cardName"], results);
    ordrin.user.getCreditCard(userLogin, results.cardName, callback);
  }

  function removeCreditCard(err, results){
    results = setValues(["cardName"], results);
    ordrin.user.removeCreditCard(userLogin, results.cardName, callback);
  }

  function reCreateCreditCard(err, results){
    results = setValues(["cardName"], results);
    ordrin.user.setCreditCard(userLogin, results.cardName, userCreditCard, callback);
  }

  function orderFoodLoggedIn(err, results){
    results = setValues(["restaurantId", "itemId", "quantity", "tip", "firstName", "lastName", "time"], results);

    if (results.time != "ASAP"){
      results.time = new Date(Number(results.time));
    }

    var item = new ordrin.TrayItem(results.itemId, results.quantity, []);
    var tray = new ordrin.Tray([item]);

    ordrin.order.placeOrder(results.restaurantId, tray, results.tip, results.time, results.firstName, results.lastName,
                            userAddress, userCreditCard, userLogin, false, callback);
    defaultValues.email = "demo+" + userId + "alt@ordr.in";
  }

  function orderFoodNoUser(err, results){
    results = setValues(["restaurantId", "itemId", "quantity", "tip", "firstName", "lastName", "email", "time"], results);

    if (results.time != "ASAP"){
      results.time = new Date(Number(results.time));
    }

    var item = new ordrin.TrayItem(results.itemId, results.quantity, []);
    var tray = new ordrin.Tray([item]);

    try{
      var userLogin = new ordrin.UserLogin(results.email, false);
      ordrin.order.placeOrder(results.restaurantId, tray, results.tip, results.time, results.firstName, results.lastName,
                              userAddress, userCreditCard, userLogin, false, callback);
    }catch(e){
      var errorFields = "";
      for (var field in e.fields){
        errorFields += field + ", ";
      }
      console.log("Invalid info. Check the following fields:", errorFields);
      main();
    }
  }

  function orderFoodAndCreateUser(err, results){
    results = setValues(["restaurantId", "itemId", "quantity", "tip", "firstName", 
                         "lastName", "email", "password", "time"], results);
    
    if (results.time != "ASAP"){
      results.time = new Date(Number(results.time));
    }

    var item = new ordrin.TrayItem(results.itemId, results.quantity, []);
    var item = new ordrin.TrayItem(results.itemId, results.quantity, []);
    var tray = new ordrin.Tray([item]);
    
    try{
      var userLogin = new ordrin.UserLogin(results.email, results.password);
      ordrin.order.placeOrder(results.restaurantId, tray, results.tip, results.time, results.firstName, results.lastName,
                              userAddress, userCreditCard, userLogin, true, callback);
    }catch(e){
      var errorFields = "";
      for (var field in e.fields){
        errorFields += field + ", ";
      }
      console.log("Invalid info. Check the following fields:", errorFields);
      main();
    }
  }

  function getOrderHistory(err, results){
    ordrin.user.getOrderHistory(userLogin, function(err, data){
      if (err){
        console.error("Something went wrong", err);
        process.exit();
      }else{
        console.log("Got Data from API");
        console.log(data);
        defaultValues.orderId = data[0].oid;
        queue = queue.slice(1);
        main();
      }
    });
  }

  function getOrderDetails(err, results){
    results = setValues(["orderId"], results);
    ordrin.user.getOrderDetails(userLogin, results.orderId, callback);
  }

  function changeUserPassword(err, results){
    results = setValues(["newPassword"], results);
    ordrin.user.setPassword(userLogin, results.newPassword, callback);
  }

  
  // callback for all api requests. Just displays the data returned by the api (or the error)`
  function callback(err, data){
    if (err){
      console.error("Something went wrong", err);
      process.exit();
    }else{
      console.log("Got data from API");
      console.log(data);
      queue = queue.slice(1); // remove that call from the queue
      main();
    }
  }
  function makeId(){
      var text = "";
      var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

      for( var i=0; i < 8; i++ )
          text += possible.charAt(Math.floor(Math.random() * possible.length));

      return text;
  }
})();
