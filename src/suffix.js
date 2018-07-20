(function () {
  "use strict";
  MB.boot = function (obaApiKey) {
    new MB.App(document.body, obaApiKey).start();
  };
}());
