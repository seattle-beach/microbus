describe("StopService", function() {
  "use strict";

  beforeEach(function() {
    this.jsonpAdapter = {
      get: function(url, callback) {
        if (this.error) {
          callback(this.error);
        } else if (this.payload) {
          callback(null, this.payload);
        }
      }
    };
    spyOn(this.jsonpAdapter, "get").and.callThrough();
    this.subject = new MB.StopService(this.jsonpAdapter);
  });

  describe("getDeparturesForStop", function() {
    it("should do a JSONP call to the stopInfo API", function() {
      this.subject.getDeparturesForStop("1_75403", function() {});
      expect(this.jsonpAdapter.get).toHaveBeenCalledWith("https://api.pugetsound.onebusaway.org/api/where/arrivals-and-departures-for-stop/1_75403.json?key=TEST", jasmine.any(Function));
    });

    describe("When the AJAX call succeeds", function () {
      it("should call the callback with the departures", function () {
        this.jsonpAdapter.payload = {
          data: {
            entry: {
              arrivalsAndDepartures: [
                {
                  "predictedDepartureTime": 1453317145000,
                  "routeShortName": "31",
                  "scheduledDepartureTime": 1453317145000,
                  "temp": 36.2,
                  "tripHeadsign": "CENTRAL MAGNOLIA FREMONT"
                }
              ]
            }
          }
        };
        var callback = jasmine.createSpy("callback");
        this.subject.getDeparturesForStop("1_75403", callback);

        expect(callback).toHaveBeenCalledWith(null, [
          {
            predictedTime: new Date(1453317145000),
            routeShortName: "31",
            scheduledTime: new Date(1453317145000),
            temp: 36.2,
            headsign: "CENTRAL MAGNOLIA FREMONT"
          }
        ]);
      });
    });

    describe("When a timestamp is 0", function () {
      it("should produce null", function () {
        this.jsonpAdapter.payload = {
          data: {
            entry: {
              arrivalsAndDepartures: [
                {
                  "predictedDepartureTime": 0,
                  "routeShortName": "31",
                  "scheduledDepartureTime": 1453317145000,
                  "temp": 36.2,
                  "tripHeadsign": "CENTRAL MAGNOLIA FREMONT"
                }
              ]
            }
          }
        };
        var callback = jasmine.createSpy("callback");
        this.subject.getDeparturesForStop("1_75403", callback);
    
        expect(callback.calls.mostRecent().args[1][0].predictedTime).toBeNull();
      });
    });

    describe("When the AJAX call does not succeed", function () {
      it("should call the callback with an error message", function () {
        this.jsonpAdapter.error = "nope";
        var callback = jasmine.createSpy("callback");
        this.subject.getDeparturesForStop("1_75403", callback);
        expect(callback).toHaveBeenCalledWith(
          "There was an error getting stop info.", null);
      });
    });
  });

  describe("getStopsNearLocation", function () {
    beforeEach(function () {
      this.bounds = new google.maps.LatLngBounds({lat: 47.6010176, lng: -122.34413842707518},
        {lat: 47.5908976, lng: -122.35425842707518});
    });

    it("should make an AJAX call with the correct center and radii", function () {
      this.subject.getStopsNearLocation(this.bounds, function() {});
      expect(this.jsonpAdapter.get).toHaveBeenCalledWith(
        "https://api.pugetsound.onebusaway.org/api/where/stops-for-location.json?lat=47.596&lon=-122.3492&latSpan=-0.0101&lonSpan=-0.0101&key=TEST",
        jasmine.any(Function)
      );
    });

    describe("When the AJAX call succeeds", function () {
      it("should call the callback with the stops", function () {
        var payload = {
          data: {
            list: [
    	        {
    	          id: "1_110", 
    	          name: "1st Ave S & Yesler Way",
    	          lat: 47.601391,
    	          lon: -122.334282
    	        }
            ]
          }
        };
        this.jsonpAdapter.payload = payload;
        var callback = jasmine.createSpy("callback");
        this.subject.getStopsNearLocation(this.bounds, callback);
        expect(callback).toHaveBeenCalledWith(null, payload.data.list);
      });
    });
  });
});
