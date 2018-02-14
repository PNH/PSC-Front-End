angular
  .module('core.directive')
  .directive('tabs',
    function () {
      return {
        restrict: 'A',
        scope: {
          onSwitch: '&'
        },
        link: function postLink(scope, elem) {
          elem.find('.nav-tabs li').on('click', function () {
            scope.onSwitch();
          });
        }
      };
    });
