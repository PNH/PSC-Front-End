angular
  .module('core.service')
  .factory('MetaAPI',
    function ($log, $resource, SETTINGS) {
      var services = {
        rideStyle: rideStyle,
        relationship: relationship,
        equestrain: equestrain,
        country: country,
        countryRegion: countryRegion,
        geocode: geocode,
        horse: horse,
        currency: currency,
        cancellationReasons: cancellationReasons,
        userMeta: userMeta,
        pageTypesMeta: pageTypesMeta,
        menuPages: menuPages,
        pageContent: pageContent
      };

      function rideStyle() {
        var url = SETTINGS.BASE_URL + SETTINGS.API_V1 + 'users/meta/riding_styles';
        $log.debug(url);
        return $resource(url, {id: '@id'}, {
          query: {
            method: 'GET',
            // params: {goalid: goalid},
            isArray: false,
            cancellable: true
          }
        });
      }

      function relationship() {
        var url = SETTINGS.BASE_URL + SETTINGS.API_V1 + 'users/meta/relationship';
        $log.debug(url);
        return $resource(url, {id: '@id'}, {
          query: {
            method: 'GET',
            // params: {goalid: goalid},
            isArray: false,
            cancellable: true
          }
        });
      }

      function equestrain() {
        var url = SETTINGS.BASE_URL + SETTINGS.API_V1 + 'users/meta/equestrain_interest';
        $log.debug(url);
        return $resource(url, {id: '@id'}, {
          query: {
            method: 'GET',
            // params: {goalid: goalid},
            isArray: false,
            cancellable: true
          }
        });
      }

      function country() {
        return $resource('/core/data/countries.:lan.json', {lan: '@lan'}, {
          query: {
            method: 'GET',
            params: {lan: 'en'},
            isArray: true,
            cancellable: true
          }
        });
      }
      function countryRegion() {
        return $resource('/core/data/countriesRegion.:lan.json', {lan: '@lan'}, {
          query: {
            method: 'GET',
            params: {lan: 'en'},
            isArray: false,
            cancellable: true
          }
        });
      }

      function horse() {
        var url = SETTINGS.BASE_URL + SETTINGS.API_V1 + 'horses/meta';
        $log.debug(url);
        return $resource(url, {id: '@id'}, {
          query: {
            method: 'GET',
            // params: {goalid: goalid},
            isArray: false,
            cancellable: true
          }
        });
      }

      function currency() {
        var url = SETTINGS.BASE_URL + SETTINGS.API_V1 + 'currencies';
        $log.debug(url);
        return $resource(url, {id: '@id'}, {
          query: {
            method: 'GET',
            // params: {goalid: goalid},
            isArray: false,
            cancellable: true
          }
        });
      }

      function geocode() {
        return $resource('https://maps.googleapis.com/maps/api/geocode/json', {}, {
          get: {
            method: 'GET',
            transformResponse: function (data, headers, status) {
              var response = {};
              response.status = status;
              response.data = angular.fromJson(data);
              response.headers = headers();
              $log.debug(response.data);
              return response;
            }
          }
        });
      }

      function cancellationReasons() {
        var url = SETTINGS.BASE_URL + SETTINGS.API_V1 + 'user/membership/cancel/reasons';
        $log.debug(url);
        return $resource(url, {}, {
          query: {
            method: 'GET',
            isArray: false,
            cancellable: true
          }
        });
      }

      function userMeta() {
        var url = SETTINGS.BASE_URL + SETTINGS.API_V1 + 'users/meta';
        $log.debug(url);
        return $resource(url, {}, {
          query: {
            method: 'GET',
            isArray: false,
            cancellable: true
          }
        });
      }

      function pageTypesMeta() {
        var url = SETTINGS.BASE_URL + SETTINGS.API_V1 + 'pages/meta';
        $log.debug(url);
        return $resource(url, {}, {
          get: {
            method: 'GET',
            isArray: false,
            cancellable: true
          }
        });
      }

      function menuPages() {
        var url = SETTINGS.BASE_URL + SETTINGS.API_V1 + 'pages/:id';
        $log.debug(url);
        return $resource(url, {id: '@id'}, {
          get: {
            method: 'GET',
            isArray: false,
            cancellable: true
          }
        });
      }

      function pageContent() {
        var url = SETTINGS.BASE_URL + SETTINGS.API_V1 + 'page/:id';
        $log.debug(url);
        return $resource(url, {id: '@id'}, {
          get: {
            method: 'GET',
            isArray: false,
            cancellable: true
          }
        });
      }

      return services;
    }
  );
