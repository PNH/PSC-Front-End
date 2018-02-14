angular
  .module('core.service')
  .factory('OnboardAPI',
    function ($resource, SETTINGS, $log) {
      var services = {
        onbaord: onbaord,
        solutionMap: solutionMap,
        shareSolutionMap: shareSolutionMap
      };

      function onbaord() {
        var url = SETTINGS.BASE_URL + SETTINGS.API_V1 + 'onboarding';
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
            cancellable: true
          }
        });
      }

      function solutionMap() {
        var url = SETTINGS.BASE_URL + SETTINGS.API_V1 + 'horse/:hid/issues';
        $log.debug(url);
        return $resource(url, {hid: '@hid'}, {
          query: {
            method: 'GET',
            isArray: false,
            cancellable: true
          },
          update: {
            method: 'PUT',
            isArray: false,
            cancellable: true
          }
        });
      }

      function shareSolutionMap() {
        var url = SETTINGS.BASE_URL + SETTINGS.API_V1 + 'horse/:hid/wall/solutionmap/nil';
        $log.debug(url);
        return $resource(url, {hid: '@hid'}, {
          share: {
            method: 'POST',
            isArray: false,
            cancellable: true,
            headers: {
              'Content-Type': undefined,
              'enctype': 'multipart/form-data'
            },
            transformRequest: function (obj) {
              var formData = makeFormdata(obj);
              return formData;
            }
          }
        });
      }

      function makeFormdata(object) {
        var formData = new FormData();
        angular.forEach(object, function (value, property) {
          if (object.hasOwnProperty(property)) {
            if (angular.isObject(object[property]) && property !== 'image') {
              var fdata = makeFormdata(object[property]);
              angular.forEach(fdata, function (value, key) {
                var _actproperty = property + "[" + key + "]";
                formData.append(_actproperty, value);
              });
            } else if (object[property] === null || angular.isUndefined(object[property])) {
              if (property === 'image') {
                return; // if no attachment attached, just ignore property
              }
              formData.append(property, "");
            } else {
              formData.append(property, object[property]);
            }
          }
        });
        return formData;
      }

      return services;
    }
  );
