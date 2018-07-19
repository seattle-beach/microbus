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
        headsign: d.tripHeadsign,
      };
    });
  };

  var round = function (n) {
    return Math.round(n * 10000) / 10000;
  };

  MB.StopService = class {
    constructor (jsonpAdapter) {
      this.jsonpAdapter = jsonpAdapter;
    }

    getDeparturesForStop(stopId, callback) {
      var url = `https://api.pugetsound.onebusaway.org/api/where/arrivals-and-departures-for-stop/${stopId}.json?key=TEST`;
      this.jsonpAdapter.get(url, function (error, data) {
        if (error) {
          callback("There was an error getting stop info.", null);
        } else {
          callback(null, processDepartures(data));
        }
      });
    }

    getStopsNearLocation(position, callback) {
      var center = position.getCenter();
      var latSpan = position.getNorthEast().lat() - position.getSouthWest().lat();
      var lonSpan = position.getNorthEast().lng() - position.getSouthWest().lng();
      var url = "https://api.pugetsound.onebusaway.org/api/where/stops-for-location.json?lat=" + round(center.lat()) + "&lon=" + round(center.lng()) +
        "&latSpan=" + round(latSpan) + "&lonSpan=" + round(lonSpan) + "&key=TEST";
      this.jsonpAdapter.get(url, function(error, payload) {
        if (error) {
          callback("There was an error getting stops.", null);
        } else {
          callback(null, payload.data.list);
        }
      });
    }
  };
}());
