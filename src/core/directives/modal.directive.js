angular
  .module('core.directive')
  .directive('modal',
    function () {
      return {
        restrict: 'C',
        scope: {
          onClose: '&',
          onShown: '&'
        },
        link: function postLink(scope, elem) {
          elem.on('hide.bs.modal', function () {
            scope.onClose();
          });
          elem.on('shown.bs.modal', function () {
            scope.onShown();
          });
        }
      };
    });
