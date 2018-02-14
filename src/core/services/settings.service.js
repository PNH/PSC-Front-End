angular
  .module('core.service')
  .factory('SettingsAPI',
    function ($resource, SETTINGS, $log) {
      var services = {
        privacy: privacy
      };

      function privacy() {
        var url = SETTINGS.BASE_URL + SETTINGS.API_V1 + 'privacysettings';
        $log.debug(url);
        return $resource(url, {}, {
          query: {
            method: 'GET',
            isArray: false,
            cancellable: true
          },
          save: {
            method: 'POST',
            isArray: false,
            cancellable: true
          }
        });
      }
      return services;
    }
  );
