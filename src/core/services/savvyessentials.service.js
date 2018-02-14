angular
  .module('core.service')
  .factory('SavvyEssentialsAPI',
    function ($resource, SETTINGS, $log) {
      var services = {
        savvyessentials: savvyessentials
      };

      function savvyessentials() {
        var url = SETTINGS.BASE_URL + SETTINGS.API_V1 + 'savvy-essentials';
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
