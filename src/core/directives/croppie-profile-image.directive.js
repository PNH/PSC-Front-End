angular
  .module('core.directive')
  .directive('croppieProfileImage',
    function ($timeout, blockUI) {
      return {
        restrict: 'E',
        templateUrl: 'core/directives/templates/croppie-profile-image.html',
        transclude: 'true',
        scope: {
          file: '=',
          image: '=',
          title: '@',
          dimensions: '@',
          controls: '=',
          onSelected: '='
        },
        link: function (scope, elem) {
          scope._controls = scope.controls || {};
          scope.outputImg = null;
          const profilePictureLoad = blockUI.instances.get('profilePictureLoading');

          scope.updateProfilePic = updateProfilePic;
          scope.closePopup = closePopup;
          scope.onClose = onClose;

          scope._controls.reset = reset;

          init();

          function init() {
            angular.element('#profilePreview').bind('click', function () {
              angular.element('#profileSelector').click();
            });
            angular.element('#profileSelector').bind('change', function (event) {
              selectProfilePic(event);
            });
          }

          /**
           * Model onClose callback
           */
          function onClose() {
            resetScope();
          }

          /**
           * Close popup
           */
          function closePopup() {
            angular.element('#updateProfilePicture').modal('hide');
            resetScope();
          }

          /**
           * Update profile picture
           *
           * @param {String} img Base64 string of the image
           */
          function updateProfilePic(img) {
            scope.file = img;
            angular.element('#profilePreview').attr('src', img);
            angular.element('#updateProfilePicture').modal('hide');
          }

          /**
           * Reset scope
           */
          function resetScope() {
            scope.inputImg = null;
            scope.outputImg = null;
          }

          /**
           * Create File object from base64 data URL
           *
           * @param {String} dataurl Base64
           * @param {String} filename File name
           * @returns File Object
           */
          // function dataURLtoFile(dataurl, filename) {
          //   var arr = dataurl.split(',');
          //   var mime = arr[0].match(/:(.*?);/)[1];
          //   var ext = mime.split('/')[1];
          //   var fileName = filename + '.' + ext;
          //   var bstr = atob(arr[1]);
          //   var n = bstr.length;
          //   var u8arr = new Uint8Array(n);
          //   while (n--) {
          //     u8arr[n] = bstr.charCodeAt(n);
          //   }
          //   return new File([u8arr], fileName, {
          //     type: mime
          //   });
          // }

          /**
           * Select profile picture event
           *
           * @param {Object} event Input file onChange event
           */
          function selectProfilePic(event) {
            profilePictureLoad.start();
            angular.element('#updateProfilePicture').modal('show');
            var _files = event.target.files;
            if (_files[0].type.includes('image/')) {
              scope.$apply();
            } else {
              elem.val('');
            }
            var reader = new FileReader();
            reader.onload = function (e) {
              $timeout(function () {
                scope.inputImg = e.target.result;
                profilePictureLoad.stop();
                if (scope.onSelected) {
                  scope.onSelected(e);
                }
              }, 300);
            };
            reader.readAsDataURL(_files[0]);
          }

          /**
           * ========================================
           *  Controls methods
           * ========================================
           */

          /**
           * Reset picture preview
           */
          function reset() {
            angular.element('#profilePreview').attr('src', '');
          }
        }
      };
    });
