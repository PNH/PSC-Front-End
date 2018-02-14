angular
  .module('core.service')
  .factory('MembershipAPI',
    function ($log, $resource, SETTINGS) {
      var services = {
        membership: membership,
        exist: exist,
        cancel: cancel
      };

      function membership() {
        var url = SETTINGS.BASE_URL + SETTINGS.API_V1 + 'memberships';
        $log.debug(url);
        return $resource(url, {}, {
          query: {
            method: 'GET',
            // params: {goalid: goalid},
            isArray: false,
            cancellable: true
          },
          submit: {
            method: 'POST',
            isArray: false,
            cancellable: true
          }
        });
      }

      function exist() {
        var url = SETTINGS.BASE_URL + SETTINGS.API_V1 + 'users/exist';
        $log.debug(url);
        return $resource(url, {email: '@email'}, {
          query: {
            method: 'GET',
            // params: {lan: 'en'},
            isArray: false,
            cancellable: true
          }
        });
      }

      function cancel() {
        var url = SETTINGS.BASE_URL + SETTINGS.API_V1 + 'user/membership/cancel';
        $log.debug(url);
        return $resource(url, {}, {
          cancel: {
            method: 'POST',
            isArray: false,
            cancellable: true
          }
        });
      }

      return services;
    }
  );
