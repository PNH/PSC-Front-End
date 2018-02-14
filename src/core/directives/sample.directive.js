angular
  .module('core.directive')
  .directive('mySample',
    function () {
      return {
        restrict: 'E',
        scope: {
          info: '=info'
        },
        templateUrl: '/core/directives/templates/sample.html'
      };
    });
