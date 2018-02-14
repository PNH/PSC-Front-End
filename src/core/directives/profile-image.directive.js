angular
  .module('core.directive')
  .directive('profileImage',
    function ($timeout) {
      return {
        restrict: 'E',
        templateUrl: 'core/directives/templates/profile-image.html',
        transclude: 'true',
        scope: {
          file: '=',
          image: '=',
          title: '@',
          dimensions: '@',
          controls: '='
        },
        link: function (scope, elem) {
          scope._controls = scope.controls || {};
          scope.profilePreviewId = 'profilePreview' + Math.ceil(Math.random() * 10000);
          scope.profileSelectorId = 'profielSelector' + Math.ceil(Math.random() * 10000);

          $timeout(function () {
            angular.element("#" + scope.profilePreviewId).bind('click', function () {
              angular.element('#' + scope.profileSelectorId).click();
            });
            angular.element("#" + scope.profileSelectorId).bind('change', function (event) {
              var _files = event.target.files;
              if (_files[0].type.includes('image/')) {
                scope.file = _files[0];
                scope.$apply();
              } else {
                elem.val('');
              }
              var reader = new FileReader();
              reader.onload = function (e) {
                angular.element("#" + scope.profilePreviewId).attr('src', e.target.result);
              };
              reader.readAsDataURL(_files[0]);
            });
          }, 300);

          scope._controls.reset = function () {
            angular.element("#" + scope.profilePreviewId).attr('src', '');
          };
        }
      };
    });
