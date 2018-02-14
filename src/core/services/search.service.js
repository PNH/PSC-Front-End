angular
  .module('core.service')
  .factory('SearchAPI',
    function ($resource, SETTINGS, $log) {
      var services = {
        search: search
      };

      function search() {
        var url = SETTINGS.BASE_URL + SETTINGS.API_V1 + 'fullsearch/find';
        $log.debug(url);
        return $resource(url, {}, {
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
