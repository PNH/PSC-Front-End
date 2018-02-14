angular
  .module('core.service')
  .factory('LearninglibAPI',
    function ($log, $resource, SETTINGS) {
      var services = {
        featured: featured,
        categories: categories,
        resources: resources,
        search: search,
        lookup: lookup
      };

      function featured() {
        var url = SETTINGS.BASE_URL + SETTINGS.API_V1 + 'learning_libraries/featured/:id';
        $log.debug(url);
        return $resource(url, {id: '@id'}, {
          query: {
            method: 'GET',
            params: {id: ''},
            isArray: false,
            cancellable: true
          }
        });
      }

      function categories() {
        var url = SETTINGS.BASE_URL + SETTINGS.API_V1 + 'learning_libraries/categories/:id';
        $log.debug(url);
        return $resource(url, {id: '@id'}, {
          query: {
            method: 'GET',
            isArray: false,
            cancellable: true
          }
        });
      }

      function resources() {
        var url = SETTINGS.BASE_URL + SETTINGS.API_V1 + 'learning_libraries/categories/:categoryid/resources/:id';
        $log.debug(url);
        return $resource(url, {id: '@id'}, {
          query: {
            method: 'GET',
            isArray: false,
            cancellable: true
          }
        });
      }

      function search() {
        var url = SETTINGS.BASE_URL + SETTINGS.API_V1 + 'learning_libraries/search';
        $log.debug(url);
        return $resource(url, {}, {
          query: {
            method: 'GET',
            isArray: false,
            cancellable: true
          }
        });
      }

      function lookup() {
        var url = SETTINGS.BASE_URL + SETTINGS.API_V1 + 'learning_libraries/titles';
        $log.debug(url);
        return $resource(url, {}, {
          query: {
            method: 'GET',
            isArray: false,
            cancellable: true
          }
        });
      }

      return services;
    }
  );
