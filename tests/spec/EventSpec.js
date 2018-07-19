describe("Event", function () {
  "use strict";
  beforeEach(function () {
    this.subject = new MB.Event();
  });

  it("should allow subscribing", function () {
    var subscriber = jasmine.createSpy("subscriber");
    this.subject.subscribe(subscriber);
    this.subject.trigger();
    expect(subscriber).toHaveBeenCalled();
  });

  it("should pass the arguments to trigger() on to the subscribers", function () {
      var subscriber = jasmine.createSpy("subscriber");
      this.subject.subscribe(subscriber);
      this.subject.trigger("foo", "bar", 42);
      expect(subscriber).toHaveBeenCalledWith("foo", "bar", 42);
  });
});
