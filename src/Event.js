(function () {
  "use strict";
  MB.Event = class{
    constructor() {
      this._subscriberList = [];
    }
  
    subscribe(subscriber) {
      this._subscriberList.push(subscriber);
    }
  
    trigger() {
      var args = arguments;
      this._subscriberList.forEach(function (subscriber) {
        subscriber.apply(null, args);
      });
    }
  };
}());
