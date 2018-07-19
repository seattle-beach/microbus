describe("NearbyStopsController", function () {
  "use strict";
  beforeEach(function () {
    this.browserLocationService = {
      getLocation: jasmine.createSpy("getLocation")
    };
    this.stopService = {
      getStopsNearLocation: jasmine.createSpy("getStopsNearLocation")
    };
    this.subject = new WB.NearbyStopsController(this.browserLocationService, this.stopService);
    this.root = document.createElement("div");
    this.subject.appendTo(this.root);
  });

  it("should request the user's location", function () {
    expect(this.browserLocationService.getLocation).toHaveBeenCalledWith(jasmine.any(Function));
  });

  describe("When the location request succeeds", function () {
    beforeEach(function () {
      var cb = this.browserLocationService.getLocation.calls.mostRecent().args[0];
      cb(null, {lat: 47.5959576, lng: -122.33709630000001});
    });

    it("should show a map centered on the user's location", function () {
      expect(WB.latestMap).toBeTruthy();
      expect(WB.latestMap._container).toBe(this.root.querySelector(".map-container"));
      expect(WB.latestMap._config.center).toEqual({
        lat: 47.5959576,
        lng: -122.33709630000001
      });
    });

    describe("When the map's bounds become available", function () {
      beforeEach(function () {
        this.bounds = new google.maps.LatLngBounds({lat: 47.6010176, lng: -122.34413842707518},
          {lat: 47.5908976, lng: -122.35425842707518});
        spyOn(WB.latestMap, "getBounds").and.returnValue(this.bounds);
        WB.latestMap._listeners.bounds_changed();
      });

      it("should request stops in the region bounded by the map", function () {
        expect(this.stopService.getStopsNearLocation).toHaveBeenCalledWith(this.bounds, jasmine.any(Function));
      });
  
      describe("When the stops request succeeds", function () {
        beforeEach(function () {
          var cb = this.stopService.getStopsNearLocation.calls.mostRecent().args[1];
          cb(null, [
            {
              id: "1_110", 
              name: "1st Ave S & Yesler Way",
              lat: 47.601391,
              lon: -122.334282
            }
          ]);
        });
  
        it("should mark the stops on the map", function () {
          expect(WB.latestMarker).toBeTruthy();
          expect(WB.latestMarker._config.position.lat).toEqual(47.601391);
          expect(WB.latestMarker._config.position.lng).toEqual(-122.334282);
          expect(WB.latestMarker._config.map).toBe(WB.latestMap);
          expect(WB.latestMarker._config.title).toEqual("1st Ave S & Yesler Way");
        });

        describe("When the user clicks a stop marker", function () {
          beforeEach(function () {
            WB.latestMarker._listeners.click();
          });

          it("should show an info window containing the stop name", function () {
            expect(WB.latestInfoWindow).toBeTruthy();
            expect(WB.latestInfoWindow._map).toBe(this.subject._map);
            expect(WB.latestInfoWindow._marker).toBe(WB.latestMarker);
            expect(WB.latestInfoWindow.getContent().textContent).toMatch("1st Ave S & Yesler Way");
          });

          it("should not show two info windows for the same stop", function () {
            WB.latestMarker._listeners.click();
            var firstWindow = WB.latestInfoWindow;
            WB.latestMarker._listeners.click();
            expect(WB.latestInfoWindow).toBe(firstWindow);
            WB.latestInfoWindow._listeners.closeclick();
            WB.latestMarker._listeners.click();
            expect(WB.latestInfoWindow).not.toBe(firstWindow);
          });

          describe("When the user clicks the stop name in the info window", function () {
            beforeEach(function () {
              this.shouldShowStopHandler = jasmine.createSpy("shouldShowStop handler");
              this.subject.shouldShowStop.subscribe(this.shouldShowStopHandler);
              WB.specHelper.simulateClick(WB.latestInfoWindow.getContent().querySelector("a"));
            });

            it("should show a StopInfoController for that stop", function () {
              expect(this.shouldShowStopHandler).toHaveBeenCalledWith("1_110");
            });
          });
        });
      });

      describe("When the bounds change repeatedly", function () {
        it("should throttle the requests", function () {
          WB.latestMap._listeners.bounds_changed();
          WB.latestMap._listeners.bounds_changed();
          expect(this.stopService.getStopsNearLocation.calls.count()).toEqual(1);
          jasmine.clock().tick(500);
          expect(this.stopService.getStopsNearLocation.calls.count()).toEqual(2);
        });

        it("should create new markers for new stops", function () {
          var existingMarker = WB.latestMarker;
          WB.latestMap._listeners.bounds_changed();
          jasmine.clock().tick(500);
          var cb = this.stopService.getStopsNearLocation.calls.mostRecent().args[1];
          cb(null, [
            {  
              id: "1_11025",
              name: "Boren Ave & Jefferson St",
              latitude: 47.606068,
              longitude:-122.322029
            }
          ]);

          expect(WB.latestMarker).not.toBe(existingMarker);
          expect(WB.latestMarker._config.title).toEqual("Boren Ave & Jefferson St");
        });

        it("should not create new markers for existing stops", function () {
          var stop = {  
            id: "1_110", 
            name: "1st Ave S & Yesler Way",
            latitude: 47.601391,
            longitude: -122.334282
          }; 
          var cb = this.stopService.getStopsNearLocation.calls.mostRecent().args[1];
          cb(null, [stop]);
          var existingMarker = WB.latestMarker;
          WB.latestMap._listeners.bounds_changed();
          jasmine.clock().tick(500);
          cb = this.stopService.getStopsNearLocation.calls.mostRecent().args[1];
          cb(null, [stop]);

          expect(WB.latestMarker).toBe(existingMarker);
        });
      });
    });
  });

  describe("When the location request fails", function () {
    beforeEach(function () {
      var cb = this.browserLocationService.getLocation.calls.mostRecent().args[0];
      cb("nope!");
    });

    it("should display an error", function () {
      var errorNode = this.root.querySelector(".error");
      expect(errorNode).not.toHaveClass("hidden");
      expect(errorNode.textContent).toEqual("You haven't given Weatherbus permission to use your location.");
    });
  });
});
