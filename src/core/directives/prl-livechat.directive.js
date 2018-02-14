angular
  .module('core.directive')
  .directive('prlLivechat',
    function ($window, $log, $location) {
      return {
        restrict: 'E',
        scope: {
          license: '=license',
          controls: '='
        },
        // templateUrl: '/core/directives/templates/sample.html'
        link: function link(scope) {
          $window.__lc = $window.__lc || {};
          $window.__lc.license = scope.license;
          (function () {
            var _src = ($location.protocol() === 'https' ? 'https://' : 'http://') + 'cdn.livechatinc.com/tracking.js';
            var _script = '<script src="' + _src + '" type="text/javascript" async="true"></script>';
            angular.element('body').append(_script);
          })();
        },
        controller: function ($scope, $log, $rootScope, SETTINGS, UserSDK) {
          // http://stackoverflow.com/questions/16881478/how-to-call-a-method-defined-in-an-angularjs-directive
          /*eslint-disable */
          $window.LC_API = $window.LC_API || {};
          $window.LC_API.on_before_load = function () {
            logUser();
            $window.LC_API.hide_chat_window();
            $scope.internalControl = $scope.controls || {};

            $scope.internalControl.show = function () {
              $window.LC_API.open_chat_window();
            };

            $scope.internalControl.hide = function () {
              $window.LC_API.hide_chat_window();
            };

            $scope.internalControl.toggle = function () {
              var _isMaximized = $window.LC_API.chat_window_maximized();
              if (_isMaximized) {
                $log.debug('closing window');
                $window.LC_API.minimize_chat_window();
              } else {
                $log.debug('opening window');
                $window.LC_API.open_chat_window();
              }
            };

            var loginNoty = $rootScope.$on(SETTINGS.NOTIFICATION.LOGIN, function () {
              logUser();
            });
            $rootScope.$on('$destroy', loginNoty);

            $scope.$apply();

            // private
            function logUser() {
              var _user = UserSDK.getUser();
              if (_user) {
                $log.debug('Loggin user info to chat');
                $log.debug(_user);
                $window.__lc.visitor = {
                  name: _user.first_name,
                  email: _user.email
                };
                $window.__lc.params = [
                  {name: 'userId', value: _user.id}
                ];
              }
            }

          };
          /*eslint-enable */
        }
      };
    });
