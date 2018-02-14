angular
  .module('core.directive')
  .directive('scrolledBottom',
    function ($window) {
      return {
        restrict: 'A',
        link: function postLink(scope, element, attrs) {
          angular.element($window).on("scroll", function () {
            var scrollHeight = angular.element(document).height();
            var scrollPosition = angular.element($window).height() + angular.element($window).scrollTop();
            if ((scrollHeight - scrollPosition) / (scrollHeight - 200) === 0) {
              scope.$apply(attrs.scrolledBottom);
            }
          });
        }
      };
    });
