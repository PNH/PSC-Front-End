angular
  .module('core.directive')
  .directive('slideToggle',
    function () {
      return {
        restrict: 'A',
        scope: {
          isOpen: "=slideToggle"
        },
        link: function (scope, element, attr) {
          var slideDuration = parseInt(attr.slideToggleDuration, 10) || 200;
          function toggleCall(newIsOpenVal, oldIsOpenVal) {
            if (newIsOpenVal !== oldIsOpenVal) {
              element.stop().slideToggle(slideDuration);
            }
          }
          toggleCall(1, 2);
          scope.$watch('isOpen', function (newIsOpenVal, oldIsOpenVal) {
            toggleCall(newIsOpenVal, oldIsOpenVal);
          });
        }
      };
    });
