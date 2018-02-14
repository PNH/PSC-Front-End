angular
  .module('core.directive')
  .directive('prlOnboardHeader',
    function () {
      return {
        restrict: 'E',
        scope: {
          info: '=info'
        },
        templateUrl: 'core/directives/templates/onboard-header.html'
      };
    });
