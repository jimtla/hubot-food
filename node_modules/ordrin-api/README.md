# Ordr.in Node Library

## About
A node library for the ordr.in API  
See full API documantation at <a href="http://ordr.in/developers">http://ordr.in/developers</a>
Also check out a working demo of all the api calls by running demo.js

## Installation
The simplest way to install is with npm:  
<pre>
  npm install ordrin-api
</pre>


## Usage  

### Initialization
<pre>
  var ordrinApi = require("ordrin-api");

  var ordrin = ordrinApi.init({
    apiKey: "YOUR-ORDRIN-API-KEY",
    restaurantUrl: "r-test.ordr.in",
    userUrl: "u-test.ordr.in",
    orderUrl: "o-test.ordr.in"
  });
</pre>
Note that for the Urls https:// and the trailing / are all implied. DO NOT include them in the Url strings. The ordr.in API only supports https requests.

Alternatively you can set the servers field to either "test" or "production" to have the wrapper set the server url's for you. That looks like this:
<pre>
  var ordrinApi = require("ordrin-api");

  var odrin = ordrinApi.init({
    apiKey: "YOUR_ORDRIN_API_KEY",
    servers: "test"
  });
</pre>

### Callbacks
Because node is async every function call you make to the ordrin api includes a callback. This will be called when the api has finished your request. The format of this callback is always the same.  
It takes two parameters: error and data.  
If there's no error than error will be false, otherwise it will be an object.  
Data is an object containing the data returned from the ordr.in api as described in the API documentation located at <a href="http://ordr.in/developers">http://ordr.in/developers</a>.

Example function callback:  
<pre>
  var callback = function(error, data){
    if (error){
      console.error("Ordr.in API error", error.msg);
    }else{
      // program logic
    }
  }
</pre>

### Data Structures
The following classes are part of the library and are used whenever you need to pass an address, credit card, user, tray item, or tray to a library function.

<pre>
  Address = {
    addr: String,
    city: String,
    state: String,
    zip: Number,
    phone: String,
    addr2: String
  }

  CreditCard = {
    name: String,
    expiryMonth: Number,
    expiryYear: Number,
    billAddress: String, // An object of the above address class
    number: Number,
    cvc: Number
  }

  UserLogin = {
    email: String,
    password: String // this is always an unencoded password 
  }

  TrayItem = {
    itemId: Number,
    quantity: Number,
    options: Array // array of option ids
  }

  Tray = {
    items: Array // array of trayItem objects of the above class
  }
</pre>
You can create an object of one of these classes like so:
<pre>
  var user = new Ordrin.UserLogin("example@example.com", "password");
  var address = new Ordrin.Address("1 Main Street", "College Station", "RDS", 77840, 1234);
</pre>

### Validation
Each of the above Data Structers throw errors if you pass invalid values to their constructors. The errors are children 
of the javascript Error class, and include the additional property fieldErrors. This describes the 
different validation errors that occured. 
Example of BAD address initialization:
<pre>
  try{
    var address = new Ordrin.Address("1 Main Street", "College Station", "RDS", 7740, 1234);
  }catch (e){
    console.log(e.fieldErrors);
  }
</pre>
The above example will print out an object that contains the properties: state, zip, and phone since those were the invalid properties. And a short message with each one that describes what was invalid. 
You can see validation in action in the demo script.


### Restaurant API
<pre>
  ordrin.restaurant.getDeliveryList(dateTime, address, callback);
  
  ordrin.restaurant.getDeliveryCheck(restaurantId, dateTime, address, callback);

  ordrin.restaurant.getFee(restaurantId, subtotal, tip, dateTime, address, callback);

  ordrin.restaurant.getDetails(restuarantId, callback);
</pre>

### User API
<pre>
  ordrin.user.getUser(userLogin, callback);

  ordrin.user.createUser(userLogin, firstName, lastName, callback);

  ordrin.user.getAllAddresses(userLogin, callback);

  ordrin.user.getAddress(userLogin, addressName, callback);

  ordrin.user.setAddress(userLogin, addressName, address, callback);

  ordrin.user.removeAddress(userLogin, addressName, callback);

  ordrin.user.getAllCreditCards(userLogin, callback);

  ordrin.user.getCreditCard(userLogin, cardName, callback);

  ordrin.user.setCreditCard(userLogin, cardName, creditCard, callback);

  ordrin.user.removeCreditCard(userLogin, cardName, callback);

  ordrin.user.getOrderHistory(userLogin, callback);

  ordrin.user.getOrderDetails(userLogin, orderId, callback);

  ordrin.user.setPassword(userLogin, newPassword, callback);
</pre>

### Order API
The Order API includes the ability to create a new user when you place the order. If you want to do that just pass in the new user's login credentials in the user object, and set createUser to true.

If you don't want the order to be associated with a user account then pass in false as the password inside the user object, and setCreateUser to false.

<pre>
  ordrin.order.placeOrder(restaurantId, tray, tip, deliveryTime, firstName, lastName, address, creditCard, user, createUser, callback)
</pre>
