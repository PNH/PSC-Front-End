angular
  .module('core.service')
  .factory('UserAPI',
    function ($resource, SETTINGS, $log) {
      var services = {
        login: login,
        logout: logout,
        validate: validate,
        profile: profile,
        password: password,
        restpassword: restpassword,
        email: email
      };

      function login() {
        var url = SETTINGS.BASE_URL + '/api/auth/sign_in/:id';
        $log.debug(url);
        return $resource(url, {id: '@id'}, {
          query: {
            url: 'http://google.com',
            method: 'GET',
            params: {id: ''},
            isArray: false,
            cancellable: true
          },
          submit: {
            method: 'POST',
            isArray: false,
            cancellable: true,
            headers: {"Content-Type": "application/json"},
            transformResponse: function (data, headers, status) {
              var response = {};
              response.status = status;
              response.data = angular.fromJson(data);
              response.headers = headers();
              return response;
            }
          }
        });
      }

      function logout() {
        var url = SETTINGS.BASE_URL + '/api/auth/sign_out';
        $log.debug(url);
        return $resource(url, {}, {
          query: {
            method: 'GET',
            isArray: false,
            cancellable: true
          },
          submit: {
            method: 'DELETE',
            isArray: false,
            cancellable: true
          }
        });
      }

      function validate() {
        var url = SETTINGS.BASE_URL + '/api/auth/validate_token';
        $log.debug(url);
        return $resource(url, {}, {
          query: {
            method: 'GET',
            isArray: false,
            cancellable: true
          }
        });
      }

      function profile() {
        var url = SETTINGS.BASE_URL + SETTINGS.API_V1 + 'users/profile';
        $log.debug(url);
        return $resource(url, {}, {
          query: {
            method: 'GET',
            isArray: false,
            cancellable: true
          },
          submit: {
            method: 'POST',
            isArray: false,
            cancellable: true,
            headers: {
              'Content-Type': undefined,
              'enctype': 'multipart/form-data'
            },
            transformRequest: function (obj) {
              var formdata = makeFormdata(obj);
              var formData = new FormData();
              angular.forEach(formdata, function (value, key) {
                // $log.error(key + "-" + value);
                formData.append(key, value);
              });
              return formData;
            }
          }
        });
      }

      /*eslint-disable */
      function password() {
        var url = SETTINGS.BASE_URL + '/api/auth/password';
        $log.debug(url);
        return $resource(url, {}, {
          update: {
            method: 'PUT',
            isArray: false,
            cancellable: true
          },
          reset: {
            method: 'POST',
            isArray: false,
            cancellable: true
          },
          authenticate: {
            url: url + '/edit',
            method: 'GET',
            isArray: false,
            cancellable: true
          }
        });
      }

      function email() {
        var url = SETTINGS.BASE_URL + SETTINGS.API_V1 + 'users/update_email';
        $log.debug(url);
        return $resource(url, {}, {
          update: {
            method: 'POST',
            isArray: false,
            cancellable: true
          }
        });
      }

      function restpassword() {
        var url = SETTINGS.BASE_URL + '/api/auth/passwords/reset';
        $log.debug(url);
        return $resource(url, {}, {
          reset: {
            method: 'POST',
            isArray: false,
            cancellable: true
          }
        });
      }
      /*eslint-enable */

      // private
      // function makeFormdata(object) {
      //   var formData = new FormData();
      //   angular.forEach(object, function (value, property) {
      //     if (object.hasOwnProperty(property)) {
      //       if (angular.isObject(object[property]) && property !== 'file') {
      //         var fdata = makeFormdata(object[property]);
      //         angular.forEach(fdata, function (value, key) {
      //           var _actproperty = property + "[" + key + "]";
      //           formData.append(_actproperty, value);
      //         });
      //       } else if (object[property] === null || angular.isUndefined(object[property])) {
      //         if (property === 'file') {
      //           return; // if no file attached, just ignore property
      //         }
      //         formData.append(property, "");
      //       } else {
      //         formData.append(property, object[property]);
      //       }
      //     }
      //   });
      //   return formData;
      // }

      // function makeFormdata(object) {
      //   var formObj = makeFormObject(object);
      //   var formData = new FormData();
      //   $log.error(formObj);
      //   angular.forEach(formObj, function (value, key) {
      //     $log.error(key + "-" + value);
      //     formData.append(key, value);
      //   });
      //
      //   return formData;
      // }
      //
      function makeFormdata(object) {
        var formData = {};
        angular.forEach(object, function (value, property) {
          if (object.hasOwnProperty(property)) {
            if (angular.isObject(object[property]) && property !== 'file') {
              var fdata = makeFormdata(object[property]);
              angular.forEach(fdata, function (value, key) {
                var _actproperty = property + "[" + key + "]";
                formData[_actproperty] = value;
              });
            } else if (object[property] === null || angular.isUndefined(object[property])) {
              if (property === 'file') {
                return; // if no file attached, just ignore property
              }
              formData[property] = "";
            } else {
              formData[property] = object[property];
            }
          }
        });
        return formData;
      }

      // function makeFormdata(object) {
      //   var formData = new Object();
      //   // $log.debug(formData.toString());
      //   angular.forEach(object, function (value, property) {
      //     // $log.debug("makeFormdata - looping");
      //     if (object.hasOwnProperty(property)) {
      //       // $log.debug("makeFormdata - hasOwnProperty true");
      //       if (angular.isObject(object[property]) && property !== 'file') {
      //         // $log.debug("makeFormdata - isObject true");
      //         // $log.debug("makeFormdata - isObject true - " + property);
      //         $log.debug(object);
      //         var fdata = makeFormdata(object[property]);
      //
      //         angular.forEach(fdata, function (value, key) {
      //           // $log.debug("makeFormdata - isObject true forEach " + key);
      //           var _actproperty = property + "[" + key + "]";
      //           // $log.debug(_actproperty + " - " + value);
      //           formData[_actproperty] = value;
      //           // formData.append(_actproperty, value);
      //         });
      //
      //       } else if (object[property] === null || angular.isUndefined(object[property])) {
      //         // $log.debug("makeFormdata - isObject false isUndefined obj");
      //         if (property === 'file') {
      //           return; // if no file attached, just ignore property
      //         }
      //         formData[property] = "";
      //         // formData.append(property, "");
      //         // $log.debug(property + "-" + object[property]);
      //       } else {
      //         // $log.debug("makeFormdata - isObject false");
      //         formData[property] = object[property];
      //         // formData.append(property, object[property]);
      //         // $log.debug(property + "-" + object[property]);
      //       }
      //     }
      //   });
      //
      //   angular.forEach(formData, function (value, key) {
      //     $log.warn(key + "=" + value);
      //   });
      //   $log.debug(formData.toString());
      //   return formData;
      // }

      // function makeArray(object) {
      //   var objarry = new Array();
      //   for (var property in object) {
      //     if (object.hasOwnProperty(property)) {
      //         // do stuff
      //         if (typeof object[property] !== 'object') {
      //           if (typeof object[property] !== 'undefined' || object[property] !== null) {
      //             objarry[property] = object[property];
      //           } else {
      //             objarry[property] = "";
      //           }
      //         } else {
      //           var fdata = makeArray(object[property]);
      //           objarry[property] = fdata;
      //         }
      //     }
      //   }
      //   return objarry;
      // }
      return services;
    }
  );
