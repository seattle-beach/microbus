/* globals console: true */
(function () {
  "use strict";

  WB.specHelper = {
    simulateClick: function (element) {
      var event = document.createEvent("MouseEvent");
      event.initMouseEvent("click", true, true, window);
      element.dispatchEvent(event);
    },
    mockXhrFactory: function () {
      return {
        open: jasmine.createSpy("open"),
        send: jasmine.createSpy("send"),
        setRequestHeader: jasmine.createSpy("setRequestHeader")
      };
    }
  };

  beforeAll(function (done) {
    window.addEventListener("error", function (error) {
      // Fail the current spec
      expect(error.message).toBe({});
    });

    var xhr = new XMLHttpRequest();

    xhr.onreadystatechange = function () {
      if (xhr.readyState === 4) {
        if (xhr.status === 200) {
          var template_html = xhr.response;
          var container = document.createElement("div");
          container.innerHTML = template_html;
          document.body.appendChild(container);
          done();
        } else {
          console.error("Couldn't load templates.html");
        }
      }
    };

    xhr.open("get", "/src/templates.html");
    xhr.send();
  });

  beforeEach(function () {
    jasmine.addMatchers({
      toContainElement: function () {
        return {
          compare: function (actual, expected) {
            var selector = expected;
            var root = actual;
            var matchingNode = root.querySelector(selector);
            return {
              pass: !!matchingNode,
              message: "Expected " + root + " to contain an element matching \"" + selector + "\""
            };
          }
        };
      },
      toHaveClass: function () {
        return {
          compare: function (actual, expected) {
            var element = actual;
            var className = expected;
            var pass = element.classList.contains(className);
            var message;

            if (pass) {
              message = "Expected " + element + " not to have class \"" + className + "\"";
            } else {
              message = "Expected " + element + " to have class \"" + className + "\"";
            }

            return {
              pass: pass,
              message: message
            };
          }
        };
      }
    });

    spyOn(WB.NavigationService.prototype, "hash").and.throwError(
      "Caught an unmocked access to a location object's hash()");
    spyOn(WB.NavigationService.prototype, "search").and.throwError(
      "Caught an unmocked access to a location object's search()");
    spyOn(WB.NavigationService.prototype, "pushState");
    spyOn(WB.NavigationService.prototype, "navigate").and.throwError(
      "Caught an unmocked access to a location object's navigate()");


    var addGoogleEvents = function (thing) {
      thing._listeners = {};
      thing.addListener = function (eventName, cb) {
        thing._listeners[eventName] = cb;
      };
    };

    // Stubs
    window.google = {
      maps: {
        Map: function (container, config) {
          WB.latestMap = {
            _config: config,
            _container: container,
            getBounds: function () { return undefined; },
          };
          addGoogleEvents(WB.latestMap);
          return WB.latestMap;
        },
        Marker: function (config) {
          WB.latestMarker = {
            _config: config
          };
          addGoogleEvents(WB.latestMarker);
          return WB.latestMarker;
        },
        LatLngBounds: function (sw, ne) {
          if (typeof sw !== "function") {
            sw = new google.maps.LatLng(sw.lat, sw.lng);
          }
          if (typeof ne !== "function") {
            ne = new google.maps.LatLng(ne.lat, ne.lng);
          }
          this.getSouthWest = function () { return sw; };
          this.getNorthEast = function () { return ne; };
          this.getCenter = function () {
            var lat = sw.lat() + (ne.lat() - sw.lat()) / 2;
            var lng = sw.lng() + (ne.lng() - sw.lng()) / 2;
            return new google.maps.LatLng(lat, lng);
          };
        },
        LatLng: function (lat, lng) {
          this.lat = function () { return lat; };
          this.lng = function () { return lng; };
        },
        InfoWindow: function(config) {
          var dom = document.createElement("div");
          dom.appendChild(config.content);

          WB.latestInfoWindow = {
            getContent: function () {
              return dom;
            },
            open: function (map, marker) {
              this._map = map;
              this._marker = marker;
            }
          };
          addGoogleEvents(WB.latestInfoWindow);
          return WB.latestInfoWindow;
        },
        ControlPosition: {
          TOP_RIGHT: "TR"
        }
      }

    };

    jasmine.clock().install();
  });

  afterEach(function () {
    jasmine.clock().uninstall();
  });
}());
