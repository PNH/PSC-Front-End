angular
  .module('core.directive')
  .directive('prlConnection',
    function () {
      return {
        restrict: 'E',
        scope: {
          id: '=',
          user: '=',
          label: '@',
          delete: '=',
          action: '=',
          disconnect: '=',
          connect: '='
          // people: '@',
          // isConnected: '@'
        },
        bindToController: true,
        templateUrl: 'core/directives/templates/prl-connection.html',
        controllerAs: 'connectionCtrl',
        controller: function ($state) {
          var self = this;
          self.isDeletionProcessing = false;
          self.isAcceptProcessing = false;
          self.isDeclineProcessing = false;
          self.isDisconnectProcessing = false;
          self.isConnectProcessing = false;

          self.deleteInvitation = function (invId) {
            self.isDeletionProcessing = true;
            self.delete(invId).then(function () {
              self.isDeletionProcessing = false;
            }, function () {
              self.isDeletionProcessing = false;
            });
          };

          self.invitationAction = function (invId, actionType) {
            var m = {
              stopProcessing: function () {
                self.isAcceptProcessing = false;
                self.isDeclineProcessing = false;
              }
            };
            if (actionType === 2) {
              self.isAcceptProcessing = true;
            } else if (actionType === 3) {
              self.isDeclineProcessing = true;
            }
            self.action(invId, actionType).then(function () {
              m.stopProcessing();
            }, function () {
              m.stopProcessing();
            });
          };

          self.disconnectConnection = function (invId) {
            self.isDisconnectProcessing = true;
            self.disconnect(invId).then(function (response) {
              self.isDisconnectProcessing = false;
              if (response.content) {
                self.user = response.content.user;
              }
            }, function () {
              self.isDisconnectProcessing = false;
            });
          };

          self.connectionConnection = function (userId) {
            self.isConnectProcessing = true;
            self.connect(userId).then(function (response) {
              self.isConnectProcessing = false;
              self.user = response.content.user;
            }, function () {
              self.isConnectProcessing = false;
            });
          };

          self.goToWall = function (id) {
            if (id > 0) {
              $state.go('wall', {
                userid: id
              });
            }
          };
        }
      };
    });
