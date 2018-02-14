angular
  .module('core.sdk')
  .service('MessagesSDK', function ($q, $log, MessagesAPI, localStorageService, ValidationAPI) {
    this.getChatUsers = function (local) {
      local = angular.isUndefined(local) ? false : local;
      var deferred = $q.defer();
      var _localStrage = 'api/messages/users';
      var packet = localStorageService.get(_localStrage);
      if (ValidationAPI.hasExpired(packet) || !local) {
        MessagesAPI.users().query().$promise.then(
          function (response) {
            if (response.status === 200) {
              packet = {data: response, timestamp: new Date().getTime()};
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
      var _log = 'MessagesSDK:getChatUsers: ' + _localStrage;
      $log.debug(_log);

      return deferred.promise;
    };

    /**
     * Get all notifications or notifications after a certain notification
     *
     * @param {Integer} userId Recipient Id
     * @param {Integer} page Page number
     * @param {Integer} limit Notificatins limit
     * @param {Integer} index Last notification ID
     * @param {Bool} local Cache data
     * @returns Notifications
     */
    this.getMessages = function (userId, page, limit, index, local) {
      local = angular.isUndefined(local) ? false : local;
      var deferred = $q.defer();
      var _localStrage = 'api/messages/' + userId + '/page/' + page;
      var _query = {
        recipient: userId,
        page: page,
        limit: limit,
        index: index
      };

      MessagesAPI.messages().query(_query).$promise.then(
        function (response) {
          if (response.status === 200) {
            deferred.resolve(response);
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

      var _log = 'MessagesSDK:getMessages: ' + _localStrage;
      $log.debug(_log);

      return deferred.promise;
    };

    this.sendMessage = function (message, recipients, local) {
      local = angular.isUndefined(local) ? false : local;
      var deferred = $q.defer();
      var _localStrage = 'api/messages/send';
      var _data = {
        message: message,
        recipients: recipients
      };
      MessagesAPI.messages().submit(_data).$promise.then(
        function (response) {
          if (response.status === 200) {
            deferred.resolve(response);
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

      var _log = 'MessagesSDK:sendMessage: ' + _localStrage;
      $log.debug(_log);

      return deferred.promise;
    };

    /**
     * Search people
     *
     * @param {Object} query Search object
     * @param {Bool} local Cache data
     * @returns Available users list
     */
    this.searchPeople = function (query, local) {
      local = angular.isUndefined(local) ? false : local;
      var deferred = $q.defer();
      var _localStrage = 'api/connections/people';
      var packet = localStorageService.get(_localStrage);
      if (ValidationAPI.hasExpired(packet) || !local) {
        MessagesAPI.search().search({}, query).$promise.then(
          function (response) {
            if (response.status === 200) {
              packet = {data: response, timestamp: new Date().getTime()};
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
      var _log = 'MessagesSDK:searchPeople: ' + _localStrage;
      $log.debug(_log);

      return deferred.promise;
    };

    this.deleteConversation = function (threadId, local) {
      local = angular.isUndefined(local) ? false : local;
      var deferred = $q.defer();
      var _localStrage = 'api/messages/users';
      var packet = localStorageService.get(_localStrage);
      if (ValidationAPI.hasExpired(packet) || !local) {
        /* eslint-disable */
        MessagesAPI.users().delete({user_id: threadId}).$promise.then(
        /* eslint-enable */
          function (response) {
            if (response.status === 200) {
              packet = {data: response, timestamp: new Date().getTime()};
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
      var _log = 'MessagesSDK:deleteConversation: ' + _localStrage;
      $log.debug(_log);

      return deferred.promise;
    };
  });
