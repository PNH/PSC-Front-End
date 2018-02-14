angular
  .module('core.directive')
  .directive('dashboardHeader',
    function () {
      return {
        restrict: 'E',
        scope: {
          title: '@',
          externalUser: '=',
          controls: '=',
          connect: '=',
          disconnect: '=',
          onHorseToggle: '='
        },
        templateUrl: 'core/directives/templates/dashboard-header.html',
        bindToController: true,
        controllerAs: 'dashboardHeaderCtrl',
        controller: function ($scope, $rootScope, $log, $window, $state, $stateParams, SETTINGS, UserSDK, HorseSDK, alertify) {
          var self = this;

          // Loaders
          self.isConnectProcessing = false;
          self.isDisconnectProcessing = false;

          self._controls = self.controls || {};

          self.selectedHorse = self.externalUser ? self.externalUser.horses[0] : null;

          self.onConnectClicked = onConnectClicked;
          self.onDisconnectClicked = onDisconnectClicked;
          self.selectHorse = selectHorse;
          self._controls.setNewUser = function () {
            loadData();
          };

          _init();

          function _init() {
            if (angular.isUndefined(self.title)) {
              self.title = 'My Dashboard';
            }
            loadData();
            var newHorseNoty = $scope.$on(SETTINGS.NOTIFICATION.NEWHORSE, function () {
              loadData();
            });
            $scope.$on('$destroy', newHorseNoty);

            var profileUpdateNoty = $scope.$on(SETTINGS.NOTIFICATION.PROFILEUPDATE, function () {
              loadData();
            });
            $scope.$on('$destroy', profileUpdateNoty);
          }

          /**
           * Select a horse
           *
           * @param {Object} user User object
           * @param {Object} horse Horse object
           */
          function selectHorse(user, horse) {
            self.selectedHorse = horse;
            if (self.onHorseToggle) {
              self.onHorseToggle(user.id, horse.id);
            }
          }

          /**
           * Disconnect event
           *
           * @param {Integer} invId Invitation ID
           */
          function onDisconnectClicked(invId) {
            alertify.okBtn("yes").cancelBtn("no").confirm("Are you sure want to disconnect?", function () {
              self.isDisconnectProcessing = true;
              self.disconnect(invId).then(function (response) {
                self.isDisconnectProcessing = false;
                if (response.content) {
                  /* eslint-disable */
                  // Disabled due to eslint errors which cannot be fixed at the moment since `connection_status` property has to be changed 
                  // from the back end
                  self.user.connection_status = response.content.user.connectionStatus;
                  /* eslint-enable */
                }
              }, function () {
                self.isDisconnectProcessing = false;
              });
            });
          }

          /**
           * Connect event
           *
           * @param {Integer} userId User ID
           */
          function onConnectClicked(userId) {
            self.isConnectProcessing = true;
            self.connect(userId).then(function (response) {
              self.isConnectProcessing = false;
              if (response.content) {
                /* eslint-disable */
                // Disabled due to eslint errors which cannot be fixed at the moment since `connection_status` property has to be changed 
                // from the back end
                self.user.connection_status = response.content.user.connectionStatus;
                /* eslint-enable */
              }
            }, function () {
              self.isConnectProcessing = false;
            });
          }

          /**
           * Load use data
           */
          function loadData() {
            if (self.externalUser) {
              self.user = self.externalUser;
              if ($state.current.name === 'horseprofile') {
                var horse = self.externalUser.horses.filter(function (e) {
                  return e.id === Number($stateParams.horseid);
                });
                self.selectedHorse = horse[0];
              }
              self.horse = null;
            } else {
              self.user = UserSDK.getUser();
              self.horse = HorseSDK.getCurrentHorse();
            }
          }
        }
      };
    });
