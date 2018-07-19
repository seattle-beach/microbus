(function () {
  "use strict";

  var naiveCompare = function (a, b) {
    if (a < b) {
      return -1;
    } else if (a > b) {
      return 1;
    } else {
      return 0;
    }
  };

  var numberPrefix = function (s) {
    var m = s.match(/^[0-9]+/);
    return m ? parseInt(m[0], 10) : null;
  };

  var compareRouteNumbers = function (a, b) {
    var an = numberPrefix(a), bn = numberPrefix(b);

    if (an === bn) {
      return naiveCompare(a, b);
    } else if (an === null) {
      return 1;
    } else if (bn === null) {
      return -1;
    } else {
      return naiveCompare(an, bn);
    }
  };

  MB.sortRouteNumbers = function (list) {
    return list.sort(compareRouteNumbers);
  };
}());
