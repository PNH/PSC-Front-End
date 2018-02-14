angular
  .module('app')
  .component('passwordResetCom', {
    templateUrl: 'app/passwordreset/template/passwordreset.html',
    controller: function ($scope, $state, $log, $location, $stateParams, SETTINGS, UserSDK, alertify) {
      var self = this;
      self.tokenFound = false;
      self.authError = false;
      self.resetBusy = false;
      self.token = null;
      self.password = null;
      self.passwordConf = null;
      if ($stateParams.reset_password_token) {
        self.tokenFound = true;
        self.token = $stateParams.reset_password_token;
      } else {
        self.error = 'you are missing the token';
      }

      // events
      self.onPasswordRestClicked = function onPasswordRestClicked() {
        self.resetBusy = true;
        UserSDK.restPassword(self.token, self.password, self.passwordConf).then(function (response) {
          $log.debug(response);
          alertify.okBtn("OK").alert("Your password was updated successfully.", function (ev) {
            ev.preventDefault();
            $state.go('home');
          });
          self.resetBusy = false;
        }, function (error) {
          $log.error(error);
          self.resetBusy = false;
          alertify.okBtn("Ok").alert("Token has been expired.", function (ev) {
            ev.preventDefault();
            $state.go('home');
          });
        });
      };
    }
  });
