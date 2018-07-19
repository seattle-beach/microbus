describe("NearbyStopsController", function () {
  "use strict";
  beforeEach(function () {
    this.browserLocationService = {
      getLocation: jasmine.createSpy("getLocation")
    };
    this.stopService = {
      getStopsNearLocation: jasmine.createSpy("getStopsNearLocation")
    };
    this.subject = new MB.NearbyStopsController(this.browserLocationService, this.stopService);
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
      expect(MB.latestMap).toBeTruthy();
      expect(MB.latestMap._container).toBe(this.root.querySelector(".map-container"));
      expect(MB.latestMap._config.center).toEqual({
        lat: 47.5959576,
        lng: -122.33709630000001
      });
    });

    describe("When the map's bounds become available", function () {
      beforeEach(function () {
        this.bounds = new google.maps.LatLngBounds({lat: 47.6010176, lng: -122.34413842707518},
          {lat: 47.5908976, lng: -122.35425842707518});
        spyOn(MB.latestMap, "getBounds").and.returnValue(this.bounds);
        MB.latestMap._listeners.bounds_changed();
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
          expect(MB.latestMarker).toBeTruthy();
          expect(MB.latestMarker._config.position.lat).toEqual(47.601391);
          expect(MB.latestMarker._config.position.lng).toEqual(-122.334282);
          expect(MB.latestMarker._config.map).toBe(MB.latestMap);
          expect(MB.latestMarker._config.title).toEqual("1st Ave S & Yesler Way");
        });

        describe("When the user clicks a stop marker", function () {
          beforeEach(function () {
            MB.latestMarker._listeners.click();
          });

          it("should show an info window containing the stop name", function () {
            expect(MB.latestInfoWindow).toBeTruthy();
            expect(MB.latestInfoWindow._map).toBe(this.subject._map);
            expect(MB.latestInfoWindow._marker).toBe(MB.latestMarker);
            expect(MB.latestInfoWindow.getContent().textContent).toMatch("1st Ave S & Yesler Way");
          });

          it("should not show two info windows for the same stop", function () {
            MB.latestMarker._listeners.click();
            var firstWindow = MB.latestInfoWindow;
            MB.latestMarker._listeners.click();
            expect(MB.latestInfoWindow).toBe(firstWindow);
            MB.latestInfoWindow._listeners.closeclick();
            MB.latestMarker._listeners.click();
            expect(MB.latestInfoWindow).not.toBe(firstWindow);
          });

          describe("When the user clicks the stop name in the info window", function () {
            beforeEach(function () {
              this.shouldShowStopHandler = jasmine.createSpy("shouldShowStop handler");
              this.subject.shouldShowStop.subscribe(this.shouldShowStopHandler);
              MB.specHelper.simulateClick(MB.latestInfoWindow.getContent().querySelector("a"));
            });

            it("should show a StopInfoController for that stop", function () {
              expect(this.shouldShowStopHandler).toHaveBeenCalledWith("1_110");
            });
          });
        });
      });

      describe("When the bounds change repeatedly", function () {
        it("should throttle the requests", function () {
          MB.latestMap._listeners.bounds_changed();
          MB.latestMap._listeners.bounds_changed();
          expect(this.stopService.getStopsNearLocation.calls.count()).toEqual(1);
          jasmine.clock().tick(500);
          expect(this.stopService.getStopsNearLocation.calls.count()).toEqual(2);
        });

        it("should create new markers for new stops", function () {
          var existingMarker = MB.latestMarker;
          MB.latestMap._listeners.bounds_changed();
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

          expect(MB.latestMarker).not.toBe(existingMarker);
          expect(MB.latestMarker._config.title).toEqual("Boren Ave & Jefferson St");
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
          var existingMarker = MB.latestMarker;
          MB.latestMap._listeners.bounds_changed();
          jasmine.clock().tick(500);
          cb = this.stopService.getStopsNearLocation.calls.mostRecent().args[1];
          cb(null, [stop]);

          expect(MB.latestMarker).toBe(existingMarker);
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
      expect(errorNode.textContent).toEqual("You haven't given Microbus permission to use your location.");
    });
  });
});
