angular
  .module('core.directive')
  .directive('prlNotification',
    function () {
      return {
        restrict: 'E',
        scope: {
          notification: '=',
          read: '=',
          remove: '='
        },
        bindToController: true,
        templateUrl: 'core/directives/templates/prl-notification.html',
        controllerAs: 'notificationCtrl',
        controller: function ($state, $log, UserSDK) {
          var self = this;
          self.readProcessing = false;
          self.deleteProcessing = false;
          var userId = UserSDK.getUserId();

          /**
           * Read notification
           *
           * @param {Integer} notifyId Notification ID
           */
          function read(notifyId) {
            self.readProcessing = true;
            self.read(notifyId).then(function (response) {
              angular.copy(response.content, self.notification);
              self.readProcessing = false;
            }, function () {
              self.readProcessing = false;
            });
          }

          /**
           * Remove notification
           *
           * @param {Integer} notifyId Notification ID
           */
          function remove(notifyId) {
            self.deleteProcessing = true;
            self.remove(notifyId).then(function () {
              self.deleteProcessing = false;
            }, function () {
              self.deleteProcessing = false;
            });
          }

          /**
           * Go to a specific page of a notification
           *
           * @param {String} notifyType Notification types (system, userconnection, message)
           */
          function goTo(notifyId, notifyType) {
            switch (notifyType) {
              case 'userconnection':
                $state.go('connections');
                read(notifyId);
                break;
              case 'message':
                $state.go('messages', {
                  userid: userId
                });
                read(notifyId);
                break;
              default:
                $log.log('A system notification');
            }
          }

          /**
           * Public methods
           */
          self.readClicked = read;
          self.removeClicked = remove;
          self.goTo = goTo;
        }
      };
    });
