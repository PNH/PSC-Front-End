angular
  .module('core.directive')
  .directive('simpleReply',
    function (SETTINGS) {
      return {
        restrict: 'E',
        templateUrl: 'core/directives/templates/simple-reply.html',
        scope: {
          placeholder: '@',
          post: '=',
          buttonText: '@',
          content: '=',
          privacy: '=',
          attachments: '=',
          attachmentsAvailable: '=',
          config: '='
        },
        bindToController: true,
        controllerAs: 'simpleReplyCtrl',
        controller: function () {
          var self = this;
          self.saveEnabled = Boolean(self.attachmentsAvailable);
          self.postModel = {
            content: self.content
          };
          if (angular.isDefined(self.privacy)) {
            self.postModel.privacy = String(self.privacy);
          }
          self.isProcessing = false;
          self.postAttachment = null;
          self.summernoteOptions = self.config || SETTINGS.SUMMERNOTE_CONFIG;
          self.summernoteOptions.placeholder = self.placeholder;
          self.onCreatePostClicked = function onCreatePostClicked(postObj) {
            self.isProcessing = true;
            self.post(postObj).then(function () {
              resetPostModel();
            }, function () {
              resetPostModel();
            });
          };
          function resetPostModel() {
            self.postModel = null;
            self.isProcessing = false;
          }
        }
      };
    });
