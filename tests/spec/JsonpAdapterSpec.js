describe("JsonpAdapter", function() {
  "use strict";

  beforeEach(function() {
    this.dom = document.createElement("div");
    this.subject = new MB.JsonpAdapter(this.dom);
  });

  afterEach(function() {
    Object.keys(MB).forEach(function(k) {
      if (k.indexOf("_jsonpShim") === 0) {
        delete MB[k];
      }
    });
  });

  it("creates a shim", function() {
    expect(MB._jsonpShim0).toBeFalsy(); // precondition
    this.subject.get('http://localhost/some.url');
    expect(MB._jsonpShim0).toEqual(jasmine.any(Function));
  });

  it("adds a script tag with the specified url and the shim name", function() {
    this.subject.get('http://localhost/some.url');
    var script = this.dom.querySelector("script");
    expect(script).toBeTruthy();
    expect(script.src).toEqual('http://localhost/some.url?callback=MB._jsonpShim0');
  });

  it("appends the shim param to an existing query string", function() {
    this.subject.get('http://localhost/some.url?foo=bar');
    var script = this.dom.querySelector("script");
    expect(script).toBeTruthy();
    expect(script.src).toEqual('http://localhost/some.url?foo=bar&callback=MB._jsonpShim0');
  });

  describe("When the shim is called", function() {
    it("calls the callback with the shim's argument", function() {
      var callback = jasmine.createSpy('callback');
      this.subject.get('http://localhost/some.url', callback);
      MB._jsonpShim0('payload');
      expect(callback).toHaveBeenCalledWith(null, 'payload');
    });

    it("removes the shim", function() {
      this.subject.get('http://localhost/some.url', function() {});
      MB._jsonpShim0();
      expect(MB._jsonpShim0).toBeFalsy();
    });
  });

  describe("When the created script tag fails to load", function() {
    it("calls the callback with an error", function() {
      var callback = jasmine.createSpy('callback');
      this.subject.get('http://localhost/some.url', callback);
      this.dom.querySelector("script").onerror();
      expect(callback).toHaveBeenCalled();
      expect(callback.calls.mostRecent().args[0]).toBeTruthy();
      expect(callback.calls.mostRecent().args[1]).toBeFalsy();
    });

    it("removes the shim", function() {
      this.subject.get('http://localhost/some.url', function() {});
      this.dom.querySelector("script").onerror();
      expect(MB._jsonpShim0).toBeFalsy();
    });
  });

  it("supports concurrent requests", function() {
      var callback0 = jasmine.createSpy('callback0');
      var callback1 = jasmine.createSpy('callback1');
      this.subject.get('http://localhost/some.url', callback0);
      expect(MB._jsonpShim0).toBeTruthy();
      this.subject.get('http://localhost/some.url', callback1);
      expect(MB._jsonpShim1).toBeTruthy();

      MB._jsonpShim0('payload0');
      expect(callback0).toHaveBeenCalledWith(null, 'payload0');
      expect(MB._jsonpShim0).toBeFalsy();

      MB._jsonpShim1('payload1');
      expect(callback1).toHaveBeenCalledWith(null, 'payload1');
      expect(MB._jsonpShim1).toBeFalsy();
  });
});
