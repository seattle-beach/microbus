(function() {
  "use strict";

  function appendParam(url, param) {
    if (url.indexOf("?") === -1) {
      return url + "?" + param;
    } else {
      return url + "&" + param;
    }
  }

  MB.JsonpAdapter = class {
    constructor(dom) {
      this._dom = dom;
      this._nextShimId = 0;
    }

    get(url, callback) {
      const shimId = this._nextShimId++;
      const shimName = "_jsonpShim" + shimId;

      MB[shimName] = function(payload) {
        delete MB[shimName];
        callback(null, payload);
      };

      const script = document.createElement("script");
      script.src = appendParam(url, "callback=MB." + shimName);
      script.onerror = function() {
        delete MB[shimName];
        callback("Failed to load " + url);
      };

      this._dom.appendChild(script);
    }
  };
}());
