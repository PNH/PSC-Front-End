angular
  .module('core.directive')
  .directive('prlFooter',
    function () {
      return {
        restrict: 'E',
        scope: {
          info: '=info'
        },
        templateUrl: 'core/directives/templates/footer.html'
      };
    });
