(function () {
  "use strict";

  MB.App = class {
    constructor(root) {
      this._root = root;
      this.navService = new MB.NavigationService();
    }
  
    start() {
      var stopService = new MB.StopService(this._jsonpAdapter());
      var browserLocationService = new MB.BrowserLocationService();
      var stopMatch = this.navService.hash().match(/^#stop-(.*)$/);
      var stopWithRoutesMatch = this.navService.search()
        .match(/^\?stop=([^&]*)&routes=(.*)$/);
  
      if (stopWithRoutesMatch) {
        this._rootController = new MB.StopInfoController(stopWithRoutesMatch[1],
          stopWithRoutesMatch[2].split(","),
          stopService, 
          this.navService);
      } else if (stopMatch) {
        this._rootController = new MB.StopInfoController(stopMatch[1], 
          null,
          stopService, 
          this.navService);
      } else {
        this._rootController = new MB.HomeController(browserLocationService, stopService, this.navService);
      }
      this._rootController.appendTo(this._root);
    }
  
    _jsonpAdapter() {
      return new MB.JsonpAdapter(document.body);
    }
  };
}());
