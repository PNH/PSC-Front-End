angular
  .module('core.directive')
  .directive('checkLogin',
    function ($transitions, $state, $log, $rootScope, SETTINGS, UserSDK) {
      return {
        restrict: 'A',
        link: function postLink() {
          $transitions.onSuccess({}, function (trans) {
            if (!trans.$to().data.isFree && !UserSDK.getUser()) {
              // reload the login route
              $rootScope.$broadcast(SETTINGS.NOTIFICATION.LOGOUT, {type: 0, message: 'You\'ve been successfully logged out'});
              $state.go('home');
            }
          });
        }
      };
    });
