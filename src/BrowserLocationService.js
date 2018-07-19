(function () {
  "use strict";
  MB.BrowserLocationService = class {
    getLocation(callback) {
      navigator.geolocation.getCurrentPosition(function (location) {
        callback(null, {lat: location.coords.latitude, lng: location.coords.longitude});
      }, function (error) {
        callback(error);
      });
    }
  };
}());
