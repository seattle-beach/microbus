(function () {
  "use strict";

  var convertDate = function (timestamp) {
    if (timestamp) {
      return new Date(timestamp);
    } else {
      return null;
    }
  };

  var processDepartures = function (response) {
    return response.data.entry.arrivalsAndDepartures.map(function (d) {
      return {
        predictedTime: convertDate(d.predictedDepartureTime),
        scheduledTime: convertDate(d.scheduledDepartureTime),
        routeShortName: d.routeShortName,
        temp: d.temp,
        headsign: d.headsign,
      };
    });
  };

  var processStopList = function (stopList) {
    return stopList;
  };

  var transformError = function () {
    return "There was an error getting stop info.";
  };

  var round = function (n) {
    return Math.round(n * 10000) / 10000;
  };

  WB.StopService = class {
    constructor (xhrFactory) {
      this.xhrFactory = xhrFactory;
    }

    getDeparturesForStop(stopId, callback) {
      var url = "/arrivals-and-departures-for-stop/" + stopId;
      WB.makeRestGet(this.xhrFactory(), url, transformError, processDepartures, callback);
    }

    getStopsNearLocation(position, callback) {
      var center = position.getCenter();
      var latSpan = position.getNorthEast().lat() - position.getSouthWest().lat();
      var lngSpan = position.getNorthEast().lng() - position.getSouthWest().lng();
      var url = "/stops-for-location?lat=" + round(center.lat()) + "&lng=" + round(center.lng()) +
        "&latSpan=" + round(latSpan) + "&lngSpan=" + round(lngSpan);
      WB.makeRestGet(this.xhrFactory(), url, transformError, processStopList, callback);
    }
  };
}());
