describe("RouteFilterController", function () {
  "use strict";

  var checkboxLabelsText = function (root) {
    var labels = root.querySelectorAll("label");
    return Array.prototype.map.call(labels, function (label) {
      return label.textContent;
    });
  };

  beforeEach(function () {
    this.subject = new MB.RouteFilterController(["855", "31"]);
    this.root = document.createElement("div");
    this.subject.appendTo(this.root);
  });

  it("should show a checkbox for each route", function () {
    expect(checkboxLabelsText(this.root)).toEqual([" 31", " 855"]);
  });

  describe("When the RouteFilterController gets constructed with a current filter", function () {
    beforeEach(function () {
      this.subject = new MB.RouteFilterController(["31", "855"], ["31"]);
      this.root = document.createElement("div");
      this.subject.appendTo(this.root);
    });

    it("should only check the boxes that are in the current filter", function () {
      var checkboxes = this.root.querySelectorAll("input[type=checkbox]");
      expect(checkboxes[0].checked).toEqual(true);
      expect(checkboxes[1].checked).toEqual(false);
    });
  });

  describe("When the user clicks Apply", function () {
    beforeEach(function () {
      this.subscriber = jasmine.createSpy("subscriber");
      this.subject.completed.subscribe(this.subscriber);
      this.root.querySelector("input[type=checkbox]").checked = false;
      MB.specHelper.simulateClick(this.root.querySelector("button"));
    });

    it("should trigger the completed event with the list of selected stops", function () {
      expect(this.subscriber).toHaveBeenCalledWith(["855"]);
    });
  });

  it("should sort routes numerically", function () {
    this.subject = new MB.RouteFilterController(["113", "28E", "28", "D", "C"]);
    this.root = document.createElement("div");
    this.subject.appendTo(this.root);
    var text = checkboxLabelsText(this.root).map(function (s) {
      return s.trim();
    });
    expect(text).toEqual(["28", "28E", "113", "C", "D"]);
  });
});
