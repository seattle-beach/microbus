(function () {
  "use strict";
  var isSuccess = function (xhr) {
   return xhr.status >= 200 && xhr.status < 300;
  };

  WB.makeRestGet = function (xhr, url, transformError, jsonTransform, callback) {
    xhr.onreadystatechange = function () {
      var response;

      if (xhr.readyState === 4) {
        if (isSuccess(xhr)) {
          response = JSON.parse(xhr.response);

          if (jsonTransform) {
            response = jsonTransform(response);
          }

          callback(null, response);
        } else {
          callback(transformError(xhr.status, xhr.response), null);
        }
      }
    };

    xhr.open("get", url);
    xhr.send();
  };

  WB.makeRestPost = function (xhr, url, body, transformError, callback) {
    xhr.onreadystatechange = function () {
      if (xhr.readyState === 4) {
        if (isSuccess(xhr)) {
          callback(null);
        } else {
          callback(transformError(xhr.status, xhr.response));
        }
      }
    };

    xhr.open("post", url);
    xhr.setRequestHeader('Content-type', 'application/json');
    xhr.send(JSON.stringify(body));
  };
}());
