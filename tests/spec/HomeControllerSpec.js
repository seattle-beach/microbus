describe("HomeController", function () {
  "use strict";
  beforeEach(function () {
    this.stopService = {
      getDeparturesForStop: function () {}
    };
    this.navService = {
      pushState: function () {}
    };
    this.subject = new MB.HomeController({
      getLocation: function () {}
    }, this.stopService, this.navService);
    this.root = document.createElement("div");
    this.subject.appendTo(this.root);
  });

  describe("When the user clicks 'Nearby stops'", function () {
    beforeEach(function () {
      MB.specHelper.simulateClick(this.root.querySelector(".nearby-stops"));
    });

    it("should show a NearbyStopsController", function () {
      expect(this.subject._child instanceof MB.NearbyStopsController).toBe(true);
      expect(this.root.querySelector(".child").firstChild).toBe(this.subject._child._root);
    });

    describe("When the user clicks 'Nearby stops' again", function() {
      beforeEach(function() {
        this.firstNearbyStopsController = this.subject._child;
        MB.specHelper.simulateClick(this.root.querySelector(".nearby-stops"));
      });

      it("should not add another NearbyStopsController", function() {
        expect(this.subject._child).toBe(this.firstNearbyStopsController);
      });
    });

    describe("When the NearbyStopsController's shouldShowStop event fires", function () {
      beforeEach(function () {
        this.subject._child.shouldShowStop.trigger("1_619");
      });

      it("should replace the NearbyStopController with a StopInfoController", function () {
        expect(this.subject._child instanceof MB.StopInfoController).toBe(true);
        var stopInfoController = this.subject._child;
        expect(stopInfoController._stopId).toEqual("1_619");
        expect(stopInfoController._root.parentNode).toBe(this.subject._root.querySelector(".child"));
      });

      describe("When the user clicks 'Nearby Stops' again", function () {
        beforeEach(function () {
          this.stopInfoController = this.subject._child;
          spyOn(this.stopInfoController, "remove").and.callThrough();
          MB.specHelper.simulateClick(this.root.querySelector(".nearby-stops"));
        });

        it("should replace the stop controller with a NearbyStopsController", function () {
          expect(this.stopInfoController.remove).toHaveBeenCalled();
          expect(this.subject._child instanceof MB.NearbyStopsController).toBe(true);
          var childNodes = this.root.querySelector(".child").childNodes;
          expect(childNodes.length).toEqual(1);
          expect(childNodes[0]).toBe(this.subject._child._root);
        });
      });
    });
  });
});
