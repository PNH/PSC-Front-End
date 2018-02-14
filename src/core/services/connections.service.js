angular
  .module('core.service')
  .factory('ConnectionsAPI',
    function ($resource, SETTINGS, $log) {
      var services = {
        connections: connections,
        myConnections: myConnections,
        search: search,
        connectedSearch: connectedSearch
      };

      /**
       * Connections API
       */
      function connections() {
        var url = SETTINGS.BASE_URL + SETTINGS.API_V1 + 'users/connections/:invId';
        $log.debug(url);
        return $resource(url, {invId: '@invId'}, {
          get: {
            method: 'GET',
            params: {invId: 'nil'},
            isArray: false,
            cancellable: true
          },
          connect: {
            method: 'POST',
            params: {invId: 'nil'},
            isArray: false,
            cancellable: true
          },
          delete: {
            method: 'DELETE',
            isArray: false,
            cancellable: true
          },
          action: {
            method: 'PUT',
            isArray: false,
            cancellable: true
          }
        });
      }

      function myConnections() {
        var url = SETTINGS.BASE_URL + SETTINGS.API_V1 + 'connections/my/requests';
        $log.debug(url);
        return $resource(url, {page: '@page', limit: '@limit'}, {
          get: {
            method: 'GET',
            isArray: false,
            cancellable: true
          }
        });
      }

      function search() {
        var url = SETTINGS.BASE_URL + SETTINGS.API_V1 + 'users/connections/search';
        $log.debug(url);
        return $resource(url, {}, {
          search: {
            method: 'POST',
            isArray: false,
            cancellable: true
          }
        });
      }

      function connectedSearch() {
        var url = SETTINGS.BASE_URL + SETTINGS.API_V1 + 'users/search';
        $log.debug(url);
        return $resource(url, {}, {
          search: {
            method: 'POST',
            isArray: false,
            cancellable: true
          }
        });
      }

      return services;
    }
  );
