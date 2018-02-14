angular
  .module('core.directive')
  .directive('chatBubble',
    function ($timeout) {
      return {
        restrict: 'C',
        link: function postLink(scope, elem) {
          function setContainerHeight() {
            var container = angular.element('#step4');
            container.css('height', 'auto');
            var containerHeight = container.height();

            if (!elem.hasClass('ng-hide')) {
              var newHeight = elem.height();
              container.height(containerHeight + newHeight);
            }
          }
          angular.element(window).resize(function () {
            setContainerHeight();
          });
          $timeout(setContainerHeight(), 10);
        }
      };
    });
