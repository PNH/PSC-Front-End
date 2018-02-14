angular
  .module('core.directive')
  .directive('prlLogin',
    function ($log, $timeout) {
      return {
        restrict: 'E',
        templateUrl: 'core/directives/templates/login.html',
        link: function postLink(scope) {
          angular.element('#forgotPassBtn, #forgotPassBtn2').on('click', function () {
            angular.element('#loginPopup').modal('hide');
            angular.element('#authenticationPopup').modal('hide');
            angular.element('#forgotPassPopup').modal('show');
          });
          angular.element('.li-signup-link, .li-signup-btn').on('click', function () {
            angular.element('#loginPopup').modal('hide');
            angular.element('#authenticationPopup').modal('hide');
          });
          angular.element('#forgotPassPopup, #loginPopup, #authenticationPopup').on('hidden.bs.modal', function () {
            scope.onCloseClicked();
            angular.element('#wrapper').css({position: 'initial'});
          });
          angular.element('#forgotPassPopup, #loginPopup, #authenticationPopup').on('show.bs.modal', function () {
            $timeout(function () {
              angular.element('#wrapper').css({position: 'fixed'});
            }, 500);
          });
        },
        controller: function ($scope, $window, $state, SETTINGS, UserSDK, HorseSDK, blockUI, $location, $stateParams) {
          var self = this;
          $scope.isProcessing = false;
          $scope.onLoginClicked = function onLoginClicked() {
            $scope.error = null;
            $scope.isProcessing = true;
            UserSDK.login($scope.email, $scope.password, $scope.rememberme).then(function () {
              angular.element('#loginPopup').modal('hide');
              angular.element('#authenticationPopup').modal('hide');
              $scope.$emit(SETTINGS.NOTIFICATION.LOGIN, {
                type: 1,
                message: 'You\'ve successfully Logged In'
              });
              $scope.email = null;
              $scope.password = null;
              // reload the page to load the horse dashboard
              HorseSDK.getHorses().then(function (response) {
                self.horses = response.content;
                if (self.horses.length > 0) {
                  var _currentHorse = self.horses[0];
                  HorseSDK.setCurrentHorse(_currentHorse);
                  if ($stateParams.blogslug) {
                    $state.go('blogdetail', ({slug: $stateParams.blogslug}));
                  } else {
                    $state.go('dashboard', {
                      horseid: _currentHorse.id
                    });
                  }
                } else {
                  if ($stateParams.blogslug) {
                    $state.go('blogdetail', ({slug: $stateParams.blogslug}));
                  }
                  $state.go('dashboard', {
                    horseid: null
                  });
                }
              }, function (error) {
                $log.error(error);
              });
              $scope.isProcessing = false;
            }, function (error) {
              $log.debug(error);
              if (error.data) {
                $scope.error = {
                  message: error.data.data.errors[0]
                };
              }
              $scope.isProcessing = false;
            });
          };

          $scope.onForgetPassClicked = function onForgetPassClicked() {
            $scope.error = null;
            $scope.isProcessing = true;
            var _redirectUrl = 'http://' + $location.host() + '/#!/passwordreset';
            UserSDK.requestPasswordRest($scope.email, _redirectUrl).then(function (response) {
              $scope.isProcessing = false;
              $scope.error = {
                message: response.message,
                isSuccess: response.success
              };
            }, function (error) {
              $scope.isProcessing = false;
              $log.debug(error);
              var _message = '';
              if (error.data.errors) {
                _message = error.data.errors[0];
              } else {
                _message = "We couldn't find your email";
              }
              $scope.error = {
                message: _message
              };
            });
          };

          $scope.onCloseClicked = function onCloseClicked() {
            $scope.error = null;
            $scope.email = null;
            $scope.password = null;
          };
        }
      };
    });
