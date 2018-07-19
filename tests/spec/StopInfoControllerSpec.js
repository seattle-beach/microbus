describe("StopInfoController", function () {
  "use strict";

  beforeEach(function () {
    this.stopService = {
      getDeparturesForStop: jasmine.createSpy("getDeparturesForStop")
    };
    this.navService = {
      navigate: jasmine.createSpy("navigate"),
      pushState: jasmine.createSpy("pushState")
    };
    this.subject = new WB.StopInfoController("6789_0", null, this.stopService, this.navService);
    this.root = document.createElement("div");
    this.subject.appendTo(this.root);
  });

  it("should update the URL", function () {
    expect(this.navService.pushState).toHaveBeenCalledWith("#stop-6789_0");
  });

  it("should show a loading indicator", function () {
    expect(this.root).toContainElement(".loading");
    var loadingIndicator = this.root.querySelector(".loading");
    expect(loadingIndicator).not.toHaveClass("hidden");
  });

  it("should load information for the stop", function () {
    expect(this.stopService.getDeparturesForStop).toHaveBeenCalledWith("6789_0", jasmine.any(Function));
  });

  describe("When the stop information loads", function () {
    var getCellsText = function (row) {
      var cells = row.querySelectorAll("td");
      return Array.prototype.map.call(cells, function (td) { return td.textContent; });
    };

    beforeEach(function () {
      var args = this.stopService.getDeparturesForStop.calls.mostRecent().args;
      var cb = args[1];
      var result = [
        {
          predictedTime: new Date(1453316965000),
          routeShortName: "31",
          scheduledTime: new Date(1453317145000),
          headsign: "CENTRAL MAGNOLIA FREMONT"
        },
        {
          predictedTime: null,
          routeShortName: "855",
          scheduledTime: new Date(1516561850000),
          headsign: "Lynnwood"
        }
      ];
      cb(null, result);
    });

    it("should hide the loading indicator", function () {
      var loadingIndicator = this.root.querySelector(".loading");
      expect(loadingIndicator).toHaveClass("hidden");
    });

    it("should display upcoming departures", function () {
      expect(this.root).toContainElement("table.departures");
      var rows = this.root.querySelectorAll("table.departures tbody tr");
      expect(rows.length).toEqual(2); // TODO: custom matcher for number of elements matching a selector?
      var cells0 = getCellsText(rows[0]);
      var cells1 = getCellsText(rows[1]);

      expect(cells0[0]).toEqual("31 CENTRAL MAGNOLIA FREMONT");
      // Avoid time zone conversion issues by just checking the invariant part
      expect(cells0[1]).toMatch(/:09$/);
      expect(cells1[0]).toEqual("855 Lynnwood");
      expect(cells1[1]).toMatch(/:10 \(scheduled\)$/);
    });
  });

  describe("When the stop information fails to load", function () {
    beforeEach(function () {
      var args = this.stopService.getDeparturesForStop.calls.mostRecent().args;
      var callback = args[1];
      var error = "ERROR";
      callback(error, null);
    });

    it("should hide the loading indicator", function () {
      var loadingIndicator = this.root.querySelector(".loading");
      expect(loadingIndicator).toHaveClass("hidden");
    });

    it("should render an error message", function () {
      expect(this.root).toContainElement(".error");
      var msg = this.root.querySelector(".error");
      expect(msg).not.toHaveClass("hidden");
      expect(msg.textContent).toEqual("ERROR");
    });
  });

  describe("When the user clicks 'Filter Routes'", function () {
    beforeEach(function () {
      var args = this.stopService.getDeparturesForStop.calls.mostRecent().args;
      var cb = args[1];
      var result = [
        {
          predictedTime: new Date(1453316965000),
          routeShortName: "31",
          scheduledTime: new Date(1453317145000),
          headsign: "CENTRAL MAGNOLIA FREMONT"
        },
        {
          predictedTime: null,
          routeShortName: "855",
          scheduledTime: new Date(1516561850000),
          headsign: "Lynnwood"
        },
        {
          routeShortName: "31",
          scheduledTime: new Date(1516561850020),
          headsign: "CENTRAL MAGNOLIA FREMONT"
        },
      ];
      cb(null, result);

      WB.specHelper.simulateClick(this.root.querySelector(".filter-link"));
    });

    it("should show a filter controller", function () {
      var filterController = this.subject._filterController;
      expect(filterController).toBeTruthy();
      expect(this.root.querySelector(".filter-container").firstChild).toBe(filterController._root);
      expect(filterController._routes).toEqual(["31", "855"]);
    });

    it("should hide the link", function () {
      expect(this.root.querySelector(".filter-link")).toHaveClass("hidden");
    });

    describe("When the user applies the filter", function () {
      beforeEach(function () {
        WB.specHelper.simulateClick(this.subject._filterController._root.querySelector("button"));
      });

      it("should navigate to a filtered stop URL", function () {
        expect(this.navService.navigate).toHaveBeenCalledWith("?stop=6789_0&routes=31,855");
      });
    });
  });

  describe("When a route filter was supplied", function () {
    beforeEach(function () {
      this.subject = new WB.StopInfoController("6789_0", ["31"], this.stopService, this.navService);
      this.root = document.createElement("div");
      this.subject.appendTo(this.root);
    });

    describe("When the stop information loads", function () {
      beforeEach(function () {
        var args = this.stopService.getDeparturesForStop.calls.mostRecent().args;
        var cb = args[1];
        var result = [
          {
            predictedTime: new Date(1453316965000),
            routeShortName: "31",
            scheduledTime: new Date(1453317145000),
            headsign: "CENTRAL MAGNOLIA FREMONT"
          },
          {
            predictedTime: null,
            routeShortName: "855",
            scheduledTime: new Date(1516561850000),
            headsign: "Lynnwood"
          },
          {
            routeShortName: "31",
            scheduledTime: new Date(1516561850020),
            headsign: "CENTRAL MAGNOLIA FREMONT"
          }
        ];
        cb(null, result);
      });

      it("should only show departures for the routes in the filter", function () {
        var rows = this.root.querySelectorAll("table.departures tbody tr");
        expect(rows.length).toEqual(2);
        expect(rows[0].querySelector("td").textContent).toEqual("31 CENTRAL MAGNOLIA FREMONT");
        expect(rows[1].querySelector("td").textContent).toEqual("31 CENTRAL MAGNOLIA FREMONT");
      });

      describe("When the user clicks 'Filter Routes'", function () {
        beforeEach(function () {
          WB.specHelper.simulateClick(this.root.querySelector(".filter-link"));
        });

        it("should pass the current filter to the filter controller", function () {
          var filterController = this.subject._filterController;
          expect(filterController).toBeTruthy();
          expect(this.root.querySelector(".filter-container").firstChild).toBe(filterController._root);
          expect(filterController._currentFilter).toEqual(["31"]);
        });
      });
    });
  });
});
