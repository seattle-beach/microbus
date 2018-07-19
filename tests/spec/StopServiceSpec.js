describe("StopService", function() {
  "use strict";

  beforeEach(function() {
    var that = this;
    var xhrFactory = function() {
      that.xhr = WB.specHelper.mockXhrFactory();
      return that.xhr;
    };
    this.subject = new WB.StopService(xhrFactory);
  });

  describe("getDeparturesForStop", function() {
    beforeEach(function() {
      this.callback = jasmine.createSpy("callback");
      this.subject.getDeparturesForStop("1_75403", this.callback);
    });

    it("should do an AJAX call to the stopInfo API", function() {
      expect(this.xhr).toBeTruthy();
      expect(this.xhr.open).toHaveBeenCalledWith("get", "/arrivals-and-departures-for-stop/1_75403");
      expect(this.xhr.send).toHaveBeenCalled();
    });

    describe("When the AJAX call succeeds", function () {
      beforeEach(function () {
        this.xhr.response = JSON.stringify({
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
        });
        
        this.xhr.readyState = 4;
        this.xhr.status = 200;
        this.xhr.onreadystatechange();
      });

      it("should call the callback with the departures", function () {
        var response = [
          {
            predictedTime: new Date(1453317145000),
            routeShortName: "31",
            scheduledTime: new Date(1453317145000),
            temp: 36.2,
            headsign: "CENTRAL MAGNOLIA FREMONT"
          }
        ];
        expect(this.callback).toHaveBeenCalledWith(null, response);
      });
    });

    describe("When a timestamp is 0", function () {
      beforeEach(function () {
        this.xhr.response = JSON.stringify({
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
        });
        
        this.xhr.readyState = 4;
        this.xhr.status = 200;
        this.xhr.onreadystatechange();
      });
    
      it("should produce null", function () {
        expect(this.callback.calls.mostRecent().args[1][0].predictedTime).toBeNull();
      });
    });

    describe("When the AJAX call does not succeed", function () {
      beforeEach( function () {
        this.xhr.readyState = 4;
        this.xhr.status = 400;
        this.xhr.onreadystatechange();
      });

      it("should call the callback with an error message", function () {
        var errorMsg = "There was an error getting stop info.";
        expect(this.callback).toHaveBeenCalledWith(errorMsg, null);
      });
    });
  });

  describe("getStopsNearLocation", function () {
    beforeEach(function () {
      this.bounds = new google.maps.LatLngBounds({lat: 47.6010176, lng: -122.34413842707518},
        {lat: 47.5908976, lng: -122.35425842707518});
      this.callback = jasmine.createSpy("callback");
      this.subject.getStopsNearLocation(this.bounds, this.callback);
    });

    it("should make an AJAX call with the correct center and radii", function () {
      expect(this.xhr).toBeTruthy();
      expect(this.xhr.open).toHaveBeenCalledWith("get",
        "/stops-for-location?lat=47.596&lng=-122.3492&latSpan=-0.0101&lngSpan=-0.0101");
      expect(this.xhr.send).toHaveBeenCalled();
    });

    describe("When the AJAX call succeeds", function () {
      beforeEach(function () {
        this.payload = [
	        {
	          id: "1_110", 
	          name: "1st Ave S & Yesler Way",
	          lat: 47.601391,
	          lon: -122.334282
	        }
        ];
        this.xhr.response = JSON.stringify(this.payload);
        this.xhr.readyState = 4;
        this.xhr.status = 200;
        this.xhr.onreadystatechange();
      });

      it("should call the callback with the stops", function () {
        expect(this.callback).toHaveBeenCalledWith(null, this.payload);
      });
    });
  });
});
