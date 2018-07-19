(function () {
  "use strict";
  MB.HomeController = class extends MB.Controller {
    constructor(browserLocationService, stopService, navService) {
      if (!navService) {
        throw "Wrong number of arguments to HomeController ctor";
      }

      super();
      this._browserLocationService = browserLocationService;
      this._stopService = stopService;
      this._navService = navService;

      this._child = new MB.NearbyStopsController(this._browserLocationService, this._stopService);

      this._child.shouldShowStop.subscribe(stopId => {
        this._replaceChild(new MB.StopInfoController(stopId, null, this._stopService, this._navService));
      });
    }
  
    createDom() {
      const dom = this.createDomFromTemplate("#template_HomeController");
      this._child.appendTo(dom.querySelector(".child"));
      return dom;
    }
    
    _replaceChild(newChild) {
      if (this._child) {
        this._child.remove();
      }

      this._child = newChild;
      this._child.appendTo(this._root.querySelector(".child"));
    }
  };
}());
