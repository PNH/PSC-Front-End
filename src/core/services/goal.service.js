angular
  .module('core.service')
  .factory('GoalAPI',
    function ($resource, SETTINGS, $log) {
      var services = {
        goal: goal
      };

      function goal() {
        var url = SETTINGS.BASE_URL + SETTINGS.API_V1 + 'goals';
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
