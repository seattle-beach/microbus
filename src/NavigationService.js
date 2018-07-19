(function () {
  "use strict";
  MB.NavigationService = class {
    hash() {
      return location.hash;
    }
  
    search() {
      return location.search;
    }
  
    pushState(hash) {
      history.pushState(null, "MB", hash);
    }
  
    navigate(url) {
      window.location = url;
    }
  };
}());
