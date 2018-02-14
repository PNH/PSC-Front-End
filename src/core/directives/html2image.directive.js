angular
  .module('core.directive')
  .directive('html2image',
    function ($q, $window) {
      return {
        restrict: 'A',
        scope: {
          controls: '='
        },
        link: function postLink(scope, elem) {
          scope.internalControls = scope.controls || {};

          scope.internalControls.exportImage = function () {
            var deferred = $q.defer();
            var html2canvas = $window.html2canvas;
            html2canvas(elem).then(function (response) {
              deferred.resolve(response.toDataURL());
            });
            return deferred.promise;
          };
        }
      };
    });
