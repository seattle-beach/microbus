(function () {
  "use strict";
  MB.RouteFilterController = class extends MB.Controller {
    constructor(routes, currentFilter) {
      super();
      this._routes = MB.sortRouteNumbers(routes);
      this._currentFilter = currentFilter;
      this.completed = new MB.Event();
    }

    createDom() {
      var dom = this.createDomFromTemplate("#template_RouteFilterController");
      this._addRoutes(dom);
      
      dom.querySelector("button").addEventListener("click", event => {
        event.preventDefault();
        this.completed.trigger(this._selectedRoutes());
      });
  
      return dom;
    }
  
    _selectedRoutes() {
      var selection = [];
      var checkboxes = this._checkboxes;
      var i;
      for (i = 0; i < checkboxes.length; i++) {
        if (checkboxes[i].checked) {
          selection.push(checkboxes[i].value);
        }
      }
  
      return selection;
    }
  
    _addRoutes(dom) {
      var i, routeDom;
      this._checkboxes = [];
  
      for (i = 0; i < this._routes.length; i++) {
        routeDom = this.createDomFromTemplate("#template_RouteFilterController_route");
        var checkbox = routeDom.querySelector("input[type=checkbox]");
        checkbox.value = this._routes[i];
        this._checkboxes.push(checkbox);
  
        if (this._currentFilter && this._currentFilter.indexOf(this._routes[i]) === -1) {
          checkbox.checked = false;
        }
  
        routeDom.querySelector("span").textContent = this._routes[i];
        dom.querySelector(".routes").appendChild(routeDom);
      }
  
      return dom;
    }
  };
}());
