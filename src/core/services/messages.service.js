angular
  .module('core.service')
  .factory('MessagesAPI',
    function ($resource, SETTINGS, $log) {
      var services = {
        messages: messages,
        users: users,
        search: search
      };

      function users() {
        var url = SETTINGS.BASE_URL + SETTINGS.API_V1 + 'messages/users';
        $log.debug(url);
        return $resource(url, {}, {
          query: {
            method: 'GET',
            params: {},
            isArray: false,
            cancellable: true
          },
          delete: {
            method: 'DELETE',
            isArray: false,
            cancellable: true
          }
        });
      }

      function messages() {
        var url = SETTINGS.BASE_URL + SETTINGS.API_V1 + 'messages/:id';
        $log.debug(url);
        return $resource(url, {id: '@id'}, {
          query: {
            method: 'GET',
            params: {page: '@page', limit: '@limit'},
            isArray: false,
            cancellable: true
          },
          submit: {
            method: 'POST',
            isArray: false,
            cancellable: true
          },
          read: {
            method: 'PUT',
            isArray: false,
            cancellable: true
          },
          delete: {
            method: 'DELETE',
            isArray: false,
            cancellable: true
          }
        });
      }

      function search() {
        var url = SETTINGS.BASE_URL + SETTINGS.API_V1 + 'users/connected/search';
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
