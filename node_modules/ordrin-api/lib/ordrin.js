(function(){
  "use strict";

  var restaurantLib = require("./restaurant");
  var userLib = require("./user");
  var orderLib = require("./order");
  var toolsLib = require("./tools");
  var crypto   = require("crypto");

  // data classes
  var UserLogin, Address, CreditCard, TrayItem, Tray;

  exports.init = function(options){

    if (typeof options.servers !== "undefined"){
      var servers = String(options.servers).toUpperCase();
      if (servers === "PRODUCTION"){
        options.restaurantUrl = "r.ordr.in";
        options.orderUrl      = "o.ordr.in";
        options.userUrl       = "u.ordr.in";
      } else if (servers === "TEST"){
        options.restaurantUrl = "r-test.ordr.in";
        options.userUrl       = "u-test.ordr.in";
        options.orderUrl      = "o-test.ordr.in";
      }
    }
    var globals = options; // this object will contain all global variables. Such as api key, and server urls.

    return {
      restaurant: new restaurantLib.Restaurant(globals),
      user: new userLib.User(globals),
      order: new orderLib.Order(globals),
      tools: new toolsLib.Tools(globals),
      Address: Address,
      UserLogin: UserLogin,
      CreditCard: CreditCard,
      TrayItem: TrayItem,
      Tray: Tray
    };
  };

  UserLogin    = function(email, pass){
    this.email     = email;
    this.password  = pass;

    this.validate = function(){
      var fieldErrors = [];
      if (/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i.test(this.email) === false){
        fieldErrors.push(new FieldError("email", "Invalid Email Address"));
      }

      if (this.password.length === 0){
        fieldErrors.push(new FieldError("password", "Password can not be blank"));
      }

      if (fieldErrors.length !== 0){
        var error = new ValidationError("Validation Error", "Check field errors for more detail");
        error.addFields(fieldErrors);
        throw error;
      }
    };

    this.encodePassword = function(){
      if (this.password !== false){
        this.password = crypto.createHash("SHA256").update(this.password).digest("hex");
      }
    } 
    this.validate();
    this.encodePassword();
  }

  Address = function (addr, city, state, zip, phone, addr2){
    this.addr  = addr;
    this.city  = city;
    this.state = state;
    this.zip   = zip;
    this.phone = String(phone).replace(/[^\d]/g, ''); // remove all non-number, and stringify
    this.addr2 = addr2;


    this.validate = function(){
      var fieldErrors = [];
      // validate state
      if (/^[A-Z]{2}$/.test(this.state) == false){
        fieldErrors.push(new FieldError("state", "Invalid State format. It should be two upper case letters."));
      }
      // validate zip
      if (/^\d{5}$/.test(this.zip) == false){
        fieldErrors.push(new FieldError("zip", "Invalid Zip code. Should be 5 numbers"));
      }
      // validate phone number
      this.formatPhoneNumber();
      if (this.phone.length != 12){
        fieldErrors.push(new FieldError("phone", "Invalid Phone number. Should be 10 digits"));
      }
      if (fieldErrors.length != 0){
        var error = new ValidationError("Validation Error", "Check field errors for more details");
        error.addFields(fieldErrors);
        throw error;
      }
    }

    this.formatPhoneNumber = function(){
      this.phone = this.phone.substring(0, 3) + "-" + this.phone.substring(3, 6) + "-" + this.phone.substring(6);
    }
    this.validate();
  }

  CreditCard = function(name, expiryMonth, expiryYear, billAddress, number, cvc){
    this.name        = name;
    this.expiryMonth = formatExpirationMonth(expiryMonth);
    this.expiryYear  = expiryYear;
    this.billAddress = billAddress;
    this.number      = String(number);
    this.cvc         = cvc;

    this.validate = function(){
      var fieldErrors = [];
      // validate card number
      if (!this.numberLuhn()){
        fieldErrors.push(new FieldError("number", "Invalid Credit Card Number"));
      }
      // determine the type of card for cvc check
      this.type        = this.creditCardType();
      // validate cvc
      var cvcExpression = /^\d{3}$/;
      if (this.type == "amex"){
        cvcExpression = /^\d{4}$/;
      }
      if (cvcExpression.test(this.cvc) == false){
        fieldErrors.push(new FieldError("cvc", "Invalid cvc"));
      }

      // validate address
      if (!(this.billAddress instanceof Address)){
        fieldErrors.push(new FieldError("address", "Address must be an instance of the Address class"));
      }

      // validate expiration year
      if (/^\d{4}$/.test(this.expiryYear) == false){
        fieldErrors.push(new FieldError("expiryYear", "Expiration Year must be 4 digits"));
      }

      // validate expiration month
      if (/^\d{2}$/.test(this.expiryMonth) == false){
        fieldErrors.push(new FieldError("expiryMonth", "Expiratoin Month must be 2 digits"));
      }

      if (this.name.length == 0){
        fieldErrors.push(new FieldError("name", "Name can not be blank"));
      }

      if (fieldErrors.length != 0){
        var error = new ValidationError("Validation Error", "Check fields object for more details");
        error.addFields(fieldErrors);
        throw error;
      }

    }

    // credit card validation checksum. From http://typicalprogrammer.com/?p=4
    this.numberLuhn = function(){
      // digits 0-9 doubled with nines cast out
      var doubled = [0, 2, 4, 6, 8, 1, 3, 5, 7, 9];

      // remove non-digit characters
      this.number = this.number.replace(/[^\d]/g, '');
      var digits = this.number.split('');

      // alternate between summing the digits
      // or the result of doubling the digits and
      // casting out nines (see Luhn description)
      var alt = false;
      var total = 0;
      while (digits.length)
      {
          var d = Number(digits.pop());
          total += (alt ? doubled[d] : d);
          alt = !alt;
      }
      return total % 10 == 0;
    }

    // credit card tpype check. From http://typicalprogrammer.com/?p=4
    this.creditCardType = function(){
      // regular expressions to match common card types
      // delete or comment out cards not athis.numberepted
      // see: www.merriampark.com/anatomythis.number.htm
      var cardpatterns = {
          'visa'       : /^(4\d{12})|(4\d{15})$/,
          'mastercard' : /^5[1-5]\d{14}$/,
          'discover'   : /^6011\d{12}$/,
          'amex'       : /^3[47]\d{13}$/,
          'diners'     : /^(30[0-5]\d{11})|(3[68]\d{12})$/
      };

      // return type of credit card
      // or 'unknown' if no match

      for (var type in cardpatterns){
        if (cardpatterns[type].test(this.number))
            return type;
      }
      return 'unknown';
    }

    this.formatExpirationDate = function(){
      return this.expiryMonth + "/" + this.expiryYear;
    }

    this.validate();
  }

  TrayItem = function(itemId, quantity, options){
    this.itemId   = itemId;
    this.quantity = quantity;
    this.options  = options;

    this.buildItemString = function(){
      var string = this.itemId + "/" + this.quantity;

      for (var i = 0; i< this.options.length; i++){
        string += "," + this.options[i];
      }
      return string;
    }

  }

  Tray = function(items){
    this.items = items;

    this.buildTrayString = function(){
      var string = "";
      for (var i = 0; i < this.items.length; i++){
        string += "+" + this.items[i].buildItemString();
      }
      return string.substring(1); // remove that first plus
    };
  };

  function formatExpirationMonth(expirationMonth){
    if (String(expirationMonth).length == 1){
      expirationMonth = "0" + String(expirationMonth);
    }
    return expirationMonth;
  }

  // one validation error for a specific field. Used in ValidationError class
  var FieldError = function(field, msg){
    this.field = field;
    this.msg   = msg;
  }

  // extends the Error object, and is thrown whenever an Object fails validation. Can contain multiple field errors.
  var ValidationError = function(name, msg, errors){
    Error.apply(this, arguments);
    this.fields = {};

    // takes an array of FieldErrors and adds them to the field object
    this.addFields = function(fieldErrors){
      for (var i = 0; i < fieldErrors.length; i++){
        this.fields[fieldErrors[i].field] = fieldErrors[i].msg;
      }
    }
  }
}());
