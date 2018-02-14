angular
  .module('core.service')
  .factory('DeepLinkFactory',
    function ($state) {
      var services = {
        checkLogged: checkLogged
      };

      function checkLogged(status, next, param) {
        if (status === 401) {
          $state.go('home', ({popup: true}));
        } else {
          $state.go(next, (param));
        }
      }

      return services;
    }
  );
