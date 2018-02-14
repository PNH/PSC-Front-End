angular
  .module('core.service')
  .factory('HorseAPI',
    function ($resource, SETTINGS, $log) {
      var services = {
        horses: horses,
        badges: badges,
        savvy: savvy,
        pathway: pathway,
        progressLog: progressLog,
        healthLog: healthLog,
        healthVisitTypes: healthVisitTypes,
        healthLogArchives: healthLogArchives,
        progressLogArchives: progressLogArchives
      };

      function horses() {
        var url = SETTINGS.BASE_URL + SETTINGS.API_V1 + 'horses/:hid';
        $log.debug(url);
        return $resource(url, {hid: '@hid'}, {
          query: {
            method: 'GET',
            isArray: false,
            params: {hid: ''},
            cancellable: true
          },
          update: {
            method: 'POST',
            isArray: false,
            cancellable: true,
            headers: {
              'Content-Type': undefined,
              'enctype': 'multipart/form-data'
            },
            transformRequest: function (obj) {
              var formdata = makeFormdata(obj);
              return formdata;
            }
          }
        });
      }

      function badges() {
        var url = SETTINGS.BASE_URL + SETTINGS.API_V1 + 'horses/:hid/badges';
        $log.debug(url);
        return $resource(url, {hid: '@hid'}, {
          query: {
            method: 'GET',
            isArray: false,
            params: {hid: ''},
            cancellable: true
          }
        });
      }

      function savvy() {
        var url = SETTINGS.BASE_URL + SETTINGS.API_V1 + 'horses/:hid/savvies/status';
        $log.debug(url);
        return $resource(url, {hid: '@hid'}, {
          query: {
            method: 'GET',
            isArray: false,
            params: {hid: ''},
            cancellable: true
          }
        });
      }

      function pathway() {
        var url = SETTINGS.BASE_URL + SETTINGS.API_V1 + 'horses/:hid/levels/:lid/pathway';
        $log.debug(url);
        return $resource(url, {hid: '@hid', lid: '@lid'}, {
          query: {
            method: 'GET',
            isArray: false,
            params: {hid: '', lid: ''},
            cancellable: true
          }
        });
      }

      // private
      function makeFormdata(object) {
        var formData = new FormData();
        angular.forEach(object, function (value, property) {
          if (object.hasOwnProperty(property)) {
            if (angular.isObject(object[property]) && property !== 'file') {
              var fdata = makeFormdata(object[property]);
              angular.forEach(fdata, function (value, key) {
                var _actproperty = property + "[" + key + "]";
                formData.append(_actproperty, value);
              });
            } else if (object[property] === null || angular.isUndefined(object[property])) {
              // if (property === 'file') {
              //   return; // if no file attached, just ignore property
              // }
              formData.append(property, "");
            } else {
              formData.append(property, object[property]);
            }
          }
        });
        return formData;
      }

      function progressLog() {
        var url = SETTINGS.BASE_URL + SETTINGS.API_V1 + 'horse/:hid/progress/:hpid';
        $log.debug(url);
        return $resource(url, {hid: '@hid', hpid: '@hpid'}, {
          get: {
            method: 'GET',
            isArray: false,
            params: {hid: '', hpid: 'nil'},
            cancellable: true
          },
          save: {
            method: 'POST',
            isArray: false,
            params: {hid: '', hpid: 'nil'},
            cancellable: true
          },
          update: {
            method: 'PUT',
            isArray: false,
            params: {hid: '', hpid: ''},
            cancellable: true
          }
        });
      }

      function healthLog() {
        var url = SETTINGS.BASE_URL + SETTINGS.API_V1 + 'horse/:hid/health/:hpid';
        $log.debug(url);
        return $resource(url, {hid: '@hid', hpid: '@hpid'}, {
          get: {
            method: 'GET',
            isArray: false,
            params: {hid: '', hpid: 'nil'},
            cancellable: true
          },
          save: {
            method: 'POST',
            isArray: false,
            params: {hid: '', hpid: 'nil'},
            cancellable: true
          },
          update: {
            method: 'PUT',
            isArray: false,
            params: {hid: '', hpid: ''},
            cancellable: true
          }
        });
      }

      function healthVisitTypes() {
        var url = SETTINGS.BASE_URL + SETTINGS.API_V1 + 'horse/health/types/0';
        $log.debug(url);
        return $resource(url, {}, {
          get: {
            method: 'GET',
            isArray: false,
            cancellable: true
          }
        });
      }

      function healthLogArchives() {
        var url = SETTINGS.BASE_URL + SETTINGS.API_V1 + 'horse/:hid/health/archives/:year/:month';
        $log.debug(url);
        return $resource(url, {hid: '@hid', year: '@year', month: '@month'}, {
          archives: {
            method: 'GET',
            params: {year: 'nil', month: ''},
            isArray: false,
            cancellable: true
          },
          logs: {
            method: 'GET',
            isArray: false,
            cancellable: true
          }
        });
      }

      function progressLogArchives() {
        var url = SETTINGS.BASE_URL + SETTINGS.API_V1 + 'horse/:hid/progress/archives/:year/:month';
        $log.debug(url);
        return $resource(url, {hid: '@hid', year: '@year', month: '@month'}, {
          archives: {
            method: 'GET',
            params: {year: 'nil', month: ''},
            isArray: false,
            cancellable: true
          },
          logs: {
            method: 'GET',
            isArray: false,
            cancellable: true
          }
        });
      }

      return services;
    });
