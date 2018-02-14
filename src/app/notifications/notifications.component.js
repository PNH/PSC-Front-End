angular
  .module('app')
  .component('notificationsCom', {
    templateUrl: 'app/notifications/template/notifications.html',
    controller: function ($q, $log, $filter, $rootScope, SETTINGS, NotificationsSDK, blockUI) {
      var self = this;

      // Data
      self.notifications = [];

      // Loaders
      const notificationLoad = blockUI.instances.get('notificationsLoading');
      self.loadingNotificationsProcessing = false;

      // Pagination
      self.notificationsLimit = 10;
      self.notificationIndex = 1;
      self._notificationsReachedEnd = false;

      /**
       * Get notifications
       *
       * @param {Integer} page Page index
       * @param {Integer} limit Notifications limit
       * @return Notifications
       */
      function getNotifications(page, limit) {
        var deferred = $q.defer();
        NotificationsSDK.getNotify(page, limit, null, false).then(function (response) {
          if (response.status === 200) {
            if (response.content === null) {
              self._notificationsReachedEnd = true;
            } else if (response.content.length < limit) {
              self.notifications = self.notifications.concat(response.content);
              self._notificationsReachedEnd = true;
            } else if (!response.content.length < limit) {
              self.notifications = self.notifications.concat(response.content);
            }
          }
          self.notificationIndex += 1;
          deferred.resolve();
        }, function (error) {
          $log.error(error);
          deferred.reject();
        });
        return deferred.promise;
      }

      /**
       * `getNotifications` Init method
       *
       * @param {Integer} page Page index
       * @param {Integer} limit Notifications limit
       */
      function _getNotifications(page, limit) {
        notificationLoad.start();
        getNotifications(page, limit).then(function () {
          notificationLoad.stop();
        }, function () {
          notificationLoad.stop();
        });
      }

      /**
       * Mark a notification as read
       *
       * @param {Integer} notifyId Notification ID
       * @returns Mark status, marked notification
       */
      function readNotification(notifyId) {
        var deferred = $q.defer();
        NotificationsSDK.readNotify(notifyId).then(function (response) {
          deferred.resolve(response);
        }, function (error) {
          deferred.reject(error);
        });
        return deferred.promise;
      }

      /**
       * Remove a notification as read
       *
       * @param {Integer} notifyId Notification ID
       * @returns Delete status
       */
      function deleteNotification(notifyId) {
        var deferred = $q.defer();
        NotificationsSDK.deleteNotify(notifyId).then(function (response) {
          if (response.status === 200) {
            self.notifications = $filter('removefromarray')(self.notifications, 'id', notifyId);
          }
          deferred.resolve();
        }, function (error) {
          deferred.reject(error);
        });
        return deferred.promise;
      }

      /**
       * Public methods
       */
      self.readNotification = readNotification;
      self.deleteNotification = deleteNotification;
      self.loadNotifications = function () {
        self.loadingNotificationsProcessing = true;
        getNotifications(self.notificationIndex, self.notificationsLimit).then(function () {
          self.loadingNotificationsProcessing = false;
        }, function () {
          self.loadingNotificationsProcessing = false;
        });
      };

      function __init() {
        _getNotifications(self.notificationIndex, self.notificationsLimit);
        var newUserNotify = $rootScope.$on(SETTINGS.NOTIFICATION.NOTIFY, function (event, data) {
          self.notifications = self.notifications.concat(data);
        });
        $rootScope.$on('$destroy', newUserNotify);
      }
      __init();
    }
  });
