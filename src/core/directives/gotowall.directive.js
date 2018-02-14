angular
  .module('core.directive')
  .directive('goToWall',
    function ($state, UserSDK) {
      return {
        restrict: 'A',
        scope: {
          wallId: '=',
          isMember: '='
        },
        link: function postLink(scope, elem) {
          // Go to user's wall on click if wall ID is valid && user ID is valid && (angular.isUndefined(scope.isMember) || scope.isMember)
          elem.on('click', function () {
            if (scope.wallId > 0 && UserSDK.getUserId() > 0 && (angular.isUndefined(scope.isMember) || scope.isMember)) {
              $state.go('wall', {
                userid: scope.wallId
              });
            }
          });
        }
      };
    });
