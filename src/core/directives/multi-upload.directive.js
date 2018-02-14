angular
  .module('core.directive')
  .directive('multiUpload',
    function () {
      return {
        restrict: 'EA',
        templateUrl: 'core/directives/templates/multi-upload.html',
        scope: {
          files: '=',
          controls: '='
        },
        bindToController: true,
        controllerAs: 'multiUploadCtrl',
        controller: function (alertify) {
          var self = this;
          self._controls = self.controls || {};
          self.attachedFiles = [];

          self.onInputFileChange = function (files) {
            angular.forEach(files, function (file) {
              var _equals = 0;
              // In Kb
              var _size = 1024;
              var _defaultSize = 2048;
              if ((file.type === 'image/png' || file.type === 'image/jpeg' || file.type === 'image/jpg') && (file.size / _size <= _defaultSize)) {
                if (self.attachedFiles.length > 0) {
                  angular.forEach(self.attachedFiles, function (attached) {
                    if (angular.equals(attached, file)) {
                      _equals += 1;
                    }
                  });
                  if (!_equals > 0) {
                    self.attachedFiles.push(file);
                  }
                } else {
                  self.attachedFiles.push(file);
                }
              } else if (file.size / _size > _defaultSize) {
                alertify.okBtn("Ok").alert('Please select an image less than ' + (_defaultSize / _size) + ' MBs.');
              } else if (file.type !== 'image/png' || file.type !== 'image/jpeg' || file.type !== 'image/jpg') {
                alertify.okBtn("Ok").alert('Only JPGs and PNGs are supported.');
              }
            });
            self.files = self.attachedFiles;
          };

          // Remove an item from the list
          self._controls.removeItem = function (index) {
            self.attachedFiles.splice(index, 1);
            self.files = self.attachedFiles;
          };

          // Reset attached files
          self._controls.reset = function () {
            self.attachedFiles = [];
          };

          self._controls.triggerFileInput = function () {
            angular.element('#multiUploadButton').click();
          };
        }
      };
    });
