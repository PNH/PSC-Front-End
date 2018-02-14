angular
  .module('core.service')
  .factory('MemberMinutesAPI',
    function ($log, $resource, SETTINGS) {
      var services = {
        memberMinutes: memberMinutes,
        archives: archives,
        detail: detail
      };

      function memberMinutes() {
        var url = SETTINGS.BASE_URL + SETTINGS.API_V1 + 'memberminutes/';
        $log.debug(url);
        return $resource(url, {}, {
          query: {
            method: 'GET',
            isArray: false,
            cancellable: true
          }
        });
      }

      function archives() {
        var url = SETTINGS.BASE_URL + SETTINGS.API_V1 + 'memberminutes/archive';
        $log.debug(url);
        return $resource(url, {}, {
          query: {
            method: 'GET',
            isArray: false,
            cancellable: true
          }
        });
      }

      function detail() {
        var url = SETTINGS.BASE_URL + SETTINGS.API_V1 + 'memberminute-sections/:id';
        $log.debug(url);
        return $resource(url, {id: '@id'}, {
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
