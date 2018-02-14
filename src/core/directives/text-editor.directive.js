angular
  .module('core.directive')
  .directive('textEditor',
    function ($window, $log, $timeout, ResourcesSDK, alertify) {
      return {
        restrict: 'E',
        scope: {
          methods: '=',
          postModel: '=',
          config: '=',
          postType: '@', // Post types: "walls": 0, "forums": 1 "blogs": 2, "groups": 3, "events": 4, "comments": 5, "others": 6
          isBusy: '='
        },
        template: '<div class="text-editor__container"><summernote class="wallpost-create-form" ng-model="postModel" config="config" on-image-upload="imageUpload(files)" editor="editor"></summernote><div id="{{divId}}" class="pica-container" style="display: none;"></div><div class="text-editor__uploading" ng-show="isBusy"><span>Uploading...</span></div></div>',
        link: function postLink(scope) {
          scope.divId = generateRandId('pica-container');
          scope.editor = {};
          var pica = $window.pica() || {};
          var DEFAULTS = {
            WIDTH: 800,
            MAX_UPLOADABLE_IMGS: 3,
            MAX_IMG_SIZE: 8000000
          };
          var uploadQueue = {
            current: 0,
            count: 0
          };

          scope.imageUpload = imageUpload;

          init();

          function init() {
            if (!scope.config) {
              $log.error('Summernote configurations are required!');
            }
          }

          /**
           * Method for SummerNote's `on-image-upload` callback
           * `on-image-upload` callback fires when an image being attached to the text editor
           * instead of attaching that image inside the text editor
           *
           * @param {Object} files Attached files object
           */
          function imageUpload(files) {
            uploadQueue = {
              current: 0,
              count: files.length
            };
            var overSizeLimitImgs = [];

            disableTexteditor(true);
            if (files) {
              if (DEFAULTS.MAX_UPLOADABLE_IMGS >= (files.length + getImgCount(scope.postModel))) {
                [].forEach.call(files, function (file) {
                  if (file.size > DEFAULTS.MAX_IMG_SIZE) {
                    overSizeLimitImgs.push(file);
                  } else {
                    readFile(file, function (dim) {
                      createCanvas(scope.divId, file, dim);
                    });
                  }
                });
                if (overSizeLimitImgs.length > 0) {
                  // var fileNames = '';
                  // angular.forEach(overSizeLimitImgs, function (file, index) {
                  //   fileNames += file.name + (overSizeLimitImgs.length > index + 1 ? ', ' : '');
                  // });
                  // alertify.alert('Some files you have attached (' + fileNames + ') are over ' + DEFAULTS.MAX_IMG_SIZE / 1000000 + 'MB. Please lower the image size and re-attach.');
                  alertify.alert('One or more files you have attached are over 8MB. Please lower the image size and try again.');
                  uploadQueue.count = DEFAULTS.MAX_UPLOADABLE_IMGS - overSizeLimitImgs.length;
                  if (overSizeLimitImgs.length === DEFAULTS.MAX_UPLOADABLE_IMGS || overSizeLimitImgs.length === 1) {
                    disableTexteditor(false);
                  }
                }
              } else {
                alertify.alert('You cannot attach more than ' + DEFAULTS.MAX_UPLOADABLE_IMGS + ' images within a single post.');
                disableTexteditor(false);
              }
            }
          }

          /**
           * Generate a canvas
           *
           * @param {String} containerId Container ID
           * @param {Object} file File object
           * @param {Object} dimensions Image size
           */
          function createCanvas(containerId, file, dimensions) {
            var dest = {
              width: dimensions.width > DEFAULTS.WIDTH ? DEFAULTS.WIDTH : dimensions.width,
              height: dimensions.width > DEFAULTS.WIDTH ? (dimensions.height * DEFAULTS.WIDTH) / dimensions.width : dimensions.width
            };
            var canvasId = generateRandId('pica-canvas');
            var canvas = angular.element('<canvas id="' + canvasId + '" width="' + dest.width + '" height="' + dest.height + '">');
            angular.element('#' + containerId).append(canvas);
            var img = new Image();
            img.src = URL.createObjectURL(file);
            img.onload = function () {
              pica.resize(img, canvas[0], {
                unsharpAmount: 80,
                unsharpRadius: 0.6,
                unsharpThreshold: 2,
                quality: 1
              }).then(function (result) {
                ResourcesSDK.postBase64Resource(result.toDataURL(file.type), scope.postType, false).then(function (response) {
                  scope.editor.summernote('editor.insertImage', response.content.file);
                  uploadQueue.current += 1;
                  if (uploadQueue.current === uploadQueue.count) {
                    // Add a delay while summernote being updated with added images
                    $timeout(function () {
                      disableTexteditor(false);
                    }, 2000);
                  }
                }, function (error) {
                  alertify.error('Something went wrong! Please try again later.');
                  disableTexteditor(false);
                  $log.error(error);
                });
                canvas.remove();
              });
              URL.revokeObjectURL(img.src);
            };
          }

          /**
           * Read an image and return image dimensions within the callback
           *
           * @param {Object} file Image file object
           * @param {Method} callback Callback method
           */
          function readFile(file, callback) {
            var render = new FileReader();
            render.onload = function () {
              var image = new Image();
              image.onload = function () {
                callback({
                  width: image.width,
                  height: image.height
                });
              };
              image.src = render.result;
            };
            render.readAsDataURL(file);
          }

          /**
           * Generate an ID with a random integer
           *
           * @param {String} string ID pre-fix
           * @returns Random ID
           */
          function generateRandId(string) {
            return string + Math.round(Math.random() * 100000);
          }

          /**
           * Get numebr of images attached in current post
           *
           * @param {String} model Model content
           * @returns Image count
           */
          function getImgCount(model) {
            return model.match(/<img/g) ? model.match(/<img/g).length : model.match(/<img/g);
          }

          /**
           * Disable text editor
           *
           * @param {Bool} state Text editor state
           */
          function disableTexteditor(state) {
            $timeout(function () {
              scope.isBusy = state;
            }, 300);
          }
        }
      };
    });
