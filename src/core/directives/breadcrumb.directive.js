angular
  .module('core.directive')
  .directive('breadcrumb',
    function () {
      return {
        restrict: 'E',
        scope: {
          home: '=',
          items: '=',
          current: '='
        },
        templateUrl: 'core/directives/templates/breadcrumb.html',
        controller: function ($log, $scope) {
          var self = this;

          // var currentUrl = $location.path().substr($location.path().lastIndexOf('/') + 1).replace(/-/g, ' ');

          self.items = $scope.items;
          self.current = $scope.current;
        },
        controllerAs: 'breadcrumbCtrl'
      };
    });
