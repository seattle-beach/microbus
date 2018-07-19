(function () {
  "use strict";
  
  var appendCellWithText = function (row, text) {
    var cell = document.createElement("td");
    cell.textContent = text;
    row.appendChild(cell);
  };

  var formatTime = function (date) {
    if (!date) {
      return "";
    }

    var minutes = date.getMinutes();
    return date.getHours() + ":" + (minutes < 10 ? "0" + minutes : minutes);
  };

  var formatDepartureTime = function (departure) {
    if (departure.predictedTime) {
      return formatTime(departure.predictedTime);
    } else {
      return formatTime(departure.scheduledTime) + " (scheduled)";
    }
  };


  MB.StopInfoController = class extends MB.Controller {
    constructor(stopId, routeFilter, stopService, navService) {
      super();
      this._stopId = stopId;
      this._stopService = stopService;
      this._navService = navService;
      this._routeFilter = routeFilter;
    }
  
    createDom() {
      var dom = this.createDomFromTemplate("#template_StopInfoController");
      var filterLink = dom.querySelector(".filter-link");
      this._departureTable = dom.querySelector(".departures");
  
      filterLink.addEventListener("click", event => {
        event.preventDefault();
        this._showFilter();
        filterLink.classList.add("hidden");
      });
  
      return dom;
    }
  
    _showFilter() {
      this._filterController = new MB.RouteFilterController(this._routes(), this._routeFilter);
      this._filterController.appendTo(this._root.querySelector(".filter-container"));
      this._filterController.completed.subscribe(routes => {
        this._navService.navigate("?stop=" + this._stopId + "&routes=" + routes.join(","));
      });
    }
  
    _routes() {
      var routes = [];
      var i;
      for (i = 0; i < this._departures.length; i++) {
        if (routes.indexOf(this._departures[i].routeShortName) === -1) {
          routes.push(this._departures[i].routeShortName);
        }
      }
      return routes;
    }
  
    shown() {
      this._navService.pushState("#stop-" + this._stopId);
      
      this._stopService.getDeparturesForStop(this._stopId, (error, departures) => {
        var errorNode, tbody;
        var loading = this._root.querySelector(".loading");
        loading.classList.add("hidden");
  
        if (error) {
          errorNode = this._root.querySelector(".error");
          errorNode.classList.remove("hidden");
          errorNode.textContent = error;
        } else {
          tbody = this._departureTable.querySelector("tbody");
  
          this._departures = departures;
          departures.forEach(d => {
            if (this._shouldShowDeparture(d)) {
              var row = tbody.insertRow(-1);
              appendCellWithText(row, d.routeShortName + " "  + d.headsign);
              appendCellWithText(row, formatDepartureTime(d));
              appendCellWithText(row, d.temp);
            }
          });
        }
      });
    }
  
    _shouldShowDeparture(departure) {
      if (this._routeFilter === null) {
        return true;
      }
      
      return this._routeFilter.indexOf(departure.routeShortName) !== -1;
    }
  };
}());
