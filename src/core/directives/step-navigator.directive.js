angular
  .module('core.directive')
  .directive('stepNavigator',
    function ($timeout, $log) {
      return {
        restrict: 'A',
        link: function postLink(scope, elem) {
          function setConnectorWidth() {
            var itemSpaceAround = elem.find('li').width();
            var connectors = elem.find('li span.sn-connector');
            var circleWidth = elem.find('span.sn-circle').width();
            connectors.css({
              width: itemSpaceAround - circleWidth,
              left: ((itemSpaceAround - circleWidth) / 2) * (-1)
            });

            var wWidth = angular.element(window).width();
            $log.debug(wWidth);
            // if (wWidth) {
            //   connectors.css({
            //     width: wWidth - circleWidth,
            //     left: ((itemSpaceAround - circleWidth) / 2) * (-1)
            //   });
            // }
          }
          angular.element(window).on('resize orientationchange', function () {
            setConnectorWidth();
          });
          $timeout(setConnectorWidth, 10);
        }
      };
    });
