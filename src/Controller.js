(function () {
  "use strict";
  // Base class for controllers. Should always be subclassed.
  MB.Controller = class {
    createDom() {
      throw new Error("Must override createDom()");
    }

    createDomFromTemplate(selector) {
      var template = document.querySelector(selector).textContent;
      var dom = document.createElement("div");
      dom.innerHTML = template;
      return dom;
    }
  
    shown() {
      // For overriding.
    }
  
    appendTo(container) {
      this._root = this.createDom();
      container.appendChild(this._root);
      this.shown();
    }
  
    remove() {
      this._root.parentNode.removeChild(this._root);
    }
  };
}());
