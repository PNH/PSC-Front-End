angular
  .module('core.directive')
  .directive('guestUserForm',
    function (vcRecaptchaService, SETTINGS) {
      return {
        restrict: 'E',
        templateUrl: 'core/directives/templates/guest-user-form.html',
        scope: {
          placeholder: '@',
          post: '=',
          buttonText: '@',
          content: '='
        },
        bindToController: true,
        controllerAs: 'guestUserFormCtrl',
        controller: function () {
          var self = this;
          var widgetId;
          self.onSubmitFormClicked = false;
          self.googleReCaptchaKey = SETTINGS.GOOGLE_RECAPTCHA;
          self.onWidgetCreate = function onWidgetCreate(_widgetId) {
            widgetId = _widgetId;
          };
          // Guest User Form
          self.submitCommentBtnClicked = false;
          self.guestFrom = {};

          self.postModel = {
            content: self.content
          };
          self.isProcessing = false;
          self.postAttachment = null;
          self.summernoteOptions = SETTINGS.SUMMERNOTE_CONFIG_BASIC;
          self.summernoteOptions.placeholder = self.placeholder;
          self.onCreatePostClicked = function onCreatePostClicked(postObj) {
            self.onSubmitFormClicked = true;

            if (self.blogGuestCommentForm.$invalid) {
              return;
            }

            self.isProcessing = true;
            self.post(postObj, self.guestFrom).then(function () {
              resetForms();
            }, function () {
              resetForms();
            });
          };
          function resetForms() {
            self.postModel = null;
            self.isProcessing = false;
            self.onSubmitFormClicked = false;
            self.guestFrom = {};
            vcRecaptchaService.reload(widgetId);
          }
        }
      };
    });
