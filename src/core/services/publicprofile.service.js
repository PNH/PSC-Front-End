angular
  .module('core.service')
  .factory('PublicProfileAPI',
    function ($resource, SETTINGS, $log) {
      var services = {
        user: user
      };

      function user() {
        var url = SETTINGS.BASE_URL + SETTINGS.API_V1 + 'users/:uid/profile';
        $log.debug(url);
        return $resource(url, {uid: '@uid'}, {
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
