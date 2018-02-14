angular
  .module('core.directive')
  .directive('fileread',
    function () {
      return {
        restrict: 'A',
        scope: {
          // Pass added files
          file: '=',
          // Pass files as parameters through given method
          readMethod: '='
        },
        link: function (scope, element) {
          element.bind("change", function (changeEvent) {
            var _files = changeEvent.target.files;
            var _temp = [];
            angular.forEach(_files, function (value) {
              _temp.push(value);
            });
            if (scope.file) {
              scope.file = _temp;
            }
            if (scope.readMethod) {
              scope.readMethod(_temp);
            }
            scope.$apply();
            // var reader = new FileReader();
            // reader.onload = function (loadEvent) {
            //   scope.$apply(function () {
            //     scope.fileread = loadEvent.target.result;
            //   });
            // };
            // reader.readAsDataURL(_files);
          });
        }
      };
    });
