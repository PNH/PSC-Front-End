angular
  .module('core.sdk')
  .service('NotificationsSDK', function ($q, $log, NotificationsAPI, localStorageService, ValidationAPI) {
    /**
     * Get all notifications or notifications after a certain notification
     *
     * @param {Integer} page Page number
     * @param {Integer} limit Notificatins limit
     * @param {Integer} index Last notification ID
     * @param {Bool} local Cache data
     * @returns Notifications
     */
    this.getNotify = function (page, limit, index, local) {
      local = angular.isUndefined(local) ? false : local;
      var deferred = $q.defer();
      var _localStrage = 'api/notifications/page/' + page;
      var packet = localStorageService.get(_localStrage);
      if (ValidationAPI.hasExpired(packet) || !local) {
        NotificationsAPI.notify().query({
          page: page,
          limit: limit,
          index: index
        }).$promise.then(
          function (response) {
            if (response.status === 200) {
              packet = {
                data: response,
                timestamp: new Date().getTime()
              };
              if (local) {
                localStorageService.set(_localStrage, packet);
              } else {
                localStorageService.remove(_localStrage);
              }
              deferred.resolve(packet.data);
            } else {
              var error = {
                status: response.status,
                message: response.message
              };
              deferred.reject(error);
            }
          },
          function (error) {
            error = ValidationAPI.buildErrorMessage(error);
            deferred.reject(error);
          }
        );
      } else {
        deferred.resolve(packet.data);
      }
      var _log = 'NotificationsSDK:getNotify: ' + _localStrage;
      $log.debug(_log);

      return deferred.promise;
    };

    /**
     * Mark notification as read
     *
     * @param {Integer} notifyId Notification ID
     * @param {any} local Cache data
     * @returns Marked status
     */
    this.readNotify = function (notifyId, local) {
      local = angular.isUndefined(local) ? false : local;
      var deferred = $q.defer();
      var _localStrage = 'api/notifications/read';
      var packet = localStorageService.get(_localStrage);
      if (ValidationAPI.hasExpired(packet) || !local) {
        NotificationsAPI.notify().read({
          nid: notifyId
        }, {
          status: 0
        }).$promise.then(
          function (response) {
            if (response.status === 200) {
              packet = {
                data: response,
                timestamp: new Date().getTime()
              };
              if (local) {
                localStorageService.set(_localStrage, packet);
              } else {
                localStorageService.remove(_localStrage);
              }
              deferred.resolve(packet.data);
            } else {
              var error = {
                status: response.status,
                message: response.message
              };
              deferred.reject(error);
            }
          },
          function (error) {
            error = ValidationAPI.buildErrorMessage(error);
            deferred.reject(error);
          }
        );
      } else {
        deferred.resolve(packet.data);
      }
      var _log = 'NotificationsSDK:readNotify: ' + _localStrage;
      $log.debug(_log);

      return deferred.promise;
    };

    /**
     * Delete notification
     *
     * @param {Integer} notifyId Nptification ID
     * @param {Bool} local Cache data
     * @returns Delete status
     */
    this.deleteNotify = function (notifyId, local) {
      local = angular.isUndefined(local) ? false : local;
      var deferred = $q.defer();
      var _localStrage = 'api/notifications/delete';
      var packet = localStorageService.get(_localStrage);
      if (ValidationAPI.hasExpired(packet) || !local) {
        NotificationsAPI.notify().delete({
          nid: notifyId
        }).$promise.then(
          function (response) {
            if (response.status === 200) {
              packet = {
                data: response,
                timestamp: new Date().getTime()
              };
              if (local) {
                localStorageService.set(_localStrage, packet);
              } else {
                localStorageService.remove(_localStrage);
              }
              deferred.resolve(packet.data);
            } else {
              var error = {
                status: response.status,
                message: response.message
              };
              deferred.reject(error);
            }
          },
          function (error) {
            error = ValidationAPI.buildErrorMessage(error);
            deferred.reject(error);
          }
        );
      } else {
        deferred.resolve(packet.data);
      }
      var _log = 'NotificationsSDK:deleteNotify: ' + _localStrage;
      $log.debug(_log);

      return deferred.promise;
    };
  });
