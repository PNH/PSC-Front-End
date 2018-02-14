angular
  .module('core.service')
  .factory('LevelAPI',
    function ($log, $resource, SETTINGS) {
      var services = {
        level: level
      };

      function level() {
        var url = SETTINGS.BASE_URL + SETTINGS.API_V1 + 'levels';
        $log.debug(url);
        return $resource(url, {id: '@lvlid'}, {
          query: {
            method: 'GET',
            // params: {goalid: goalid},
            isArray: false,
            cancellable: true
          }
        });
      }

      return services;
    }
  );
