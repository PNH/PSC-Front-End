angular
  .module('core.directive')
  .directive('fileUpload',
    function () {
      return {
        // templateUrl: 'core/directives/templates/file-upload.html',
        scope: {
          file: '='
        },
        link: function ($scope, elem) {
          elem.bind('change', function (event) {
            var files = event.target.files;
            if (files[0].type.includes('image/')) {
              $scope.file = files[0];
              $scope.$apply();
            } else {
              elem.val('');
            }
          });
        }
      };
    });
