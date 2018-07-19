(function() {
  "use strict";

  function appendParam(url, param) {
    if (url.indexOf("?") === -1) {
      return url + "?" + param;
    } else {
      return url + "&" + param;
    }
  }

  WB.JsonpAdapter = class {
    constructor(dom) {
      this._dom = dom;
      this._nextShimId = 0;
    }

    get(url, callback) {
      const shimId = this._nextShimId++;
      const shimName = "_jsonpShim" + shimId;

      WB[shimName] = function(payload) {
        delete WB[shimName];
        callback(null, payload);
      };

      const script = document.createElement("script");
      script.src = appendParam(url, "callback=WB." + shimName);
      script.onerror = function() {
        delete WB[shimName];
        callback("Failed to load " + url);
      };

      this._dom.appendChild(script);
    }
  };
}());
