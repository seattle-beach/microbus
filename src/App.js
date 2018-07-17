(function () {
  "use strict";

  WB.App = class {
    constructor(root) {
      this._root = root;
      this.navService = new WB.NavigationService();
    }
  
    start() {
      var stopService = new WB.StopService(this._xhrFactory);
      var browserLocationService = new WB.BrowserLocationService();
      var stopMatch = this.navService.hash().match(/^#stop-(.*)$/);
      var stopWithRoutesMatch = this.navService.search()
        .match(/^\?stop=([^&]*)&routes=(.*)$/);
  
      if (stopWithRoutesMatch) {
        this._rootController = new WB.StopInfoController(stopWithRoutesMatch[1],
          stopWithRoutesMatch[2].split(","),
          stopService, 
          this.navService);
      } else if (stopMatch) {
        this._rootController = new WB.StopInfoController(stopMatch[1], 
          null,
          stopService, 
          this.navService);
      } else {
        this._rootController = new WB.HomeController(browserLocationService, stopService, this.navService);
      }
      this._rootController.appendTo(this._root);
    }
  
    _xhrFactory() {
      return new XMLHttpRequest();
    }
  };
}());
