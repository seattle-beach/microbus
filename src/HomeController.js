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
    }
  
    createDom() {
      var dom = this.createDomFromTemplate("#template_HomeController");
  
      dom.querySelector(".nearby-stops").addEventListener("click", event => {
        event.preventDefault();
        if (!(this._child instanceof MB.NearbyStopsController)) {
          this._showNearbyStops();
        }
      });
  
      return dom;
    }
  
    _showNearbyStops() {
      var nearbyStopsController = new MB.NearbyStopsController(this._browserLocationService, this._stopService);
      this._replaceChild(nearbyStopsController);

      nearbyStopsController.shouldShowStop.subscribe(stopId => {
        this._replaceChild(new MB.StopInfoController(stopId, null, this._stopService, this._navService));
      });
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
