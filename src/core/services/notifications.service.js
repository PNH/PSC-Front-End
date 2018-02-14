angular
  .module('core.service')
  .factory('NotificationsAPI',
    function ($resource, SETTINGS, $log) {
      var services = {
        notify: notify
      };

      function notify() {
        var url = SETTINGS.BASE_URL + SETTINGS.API_V1 + 'notifications/messages/:nid';
        $log.debug(url);
        return $resource(url, {nid: '@nid'}, {
          query: {
            method: 'GET',
            params: {nid: ''},
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
      return services;
    }
  );
