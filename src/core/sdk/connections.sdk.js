angular
  .module('core.sdk')
  .service('ConnectionsSDK', function ($q, $log, ConnectionsAPI, localStorageService, ValidationAPI) {
    /**
     * Get sent connection invitations
     *
     * @param {String} page Page index
     * @param {String} limit Pagination limit
     * @param {Bool} local Cache data
     * @returns Sent invitations
     */
    this.getSentInvitations = function (page, limit, local) {
      local = angular.isUndefined(local) ? false : local;
      var deferred = $q.defer();
      var _localStrage = 'api/connections/invitations/sent/page/' + page;
      var packet = localStorageService.get(_localStrage);
      if (ValidationAPI.hasExpired(packet) || !local) {
        ConnectionsAPI.myConnections().get({page: page, limit: limit}).$promise.then(
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
      var _log = 'ConnectionsAPI:getSentInvitations: ' + _localStrage;
      $log.debug(_log);

      return deferred.promise;
    };

    /**
     * Get received invitations
     *
     * @param {String} page Page index
     * @param {String} limit Pagination limit
     * @param {Bool} local Cache data
     * @returns Received invitations
     */
    this.getReceivedInvitations = function (page, limit, local) {
      local = angular.isUndefined(local) ? false : local;
      var deferred = $q.defer();
      var _localStrage = 'api/connections/invitations/received/page/' + page;
      var packet = localStorageService.get(_localStrage);
      if (ValidationAPI.hasExpired(packet) || !local) {
        ConnectionsAPI.connections().get({page: page, limit: limit, type: 1}).$promise.then(
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
      var _log = 'ConnectionsAPI:getReceivedInvitations: ' + _localStrage;
      $log.debug(_log);

      return deferred.promise;
    };

    /**
     * Delete sent invitation / remove connection
     *
     * @param {Integer} invId Invitation ID
     * @param {Bool} local Cache data
     * @returns Status
     */
    this.removeConnection = function (invId, local) {
      local = angular.isUndefined(local) ? false : local;
      var deferred = $q.defer();
      var _localStrage = 'api/connections/delete';
      var packet = localStorageService.get(_localStrage);
      if (ValidationAPI.hasExpired(packet) || !local) {
        ConnectionsAPI.connections().delete({invId: invId}).$promise.then(
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
      var _log = 'ConnectionsAPI:removeConnection: ' + _localStrage;
      $log.debug(_log);

      return deferred.promise;
    };

    /**
     * Received invitations actions
     *
     * @param {Integer} invId Invitation ID
     * @param {Integer} actionType Action Type.
     * Accepted action types: 2 (Accept), 3 (Decline)
     * @param {Bool} local Cache data
     * @returns Action status
     */
    this.invitationAction = function (invId, actionType, local) {
      local = angular.isUndefined(local) ? false : local;
      var deferred = $q.defer();
      var _localStrage = 'api/connections/invitations/received/actions';
      var packet = localStorageService.get(_localStrage);
      if (ValidationAPI.hasExpired(packet) || !local) {
          /* eslint-disable */
        ConnectionsAPI.connections().action({invId: invId}, {action_type: actionType}).$promise.then(
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
      var _log = 'ConnectionsAPI:invitationAction: ' + _localStrage;
      $log.debug(_log);

      return deferred.promise;
    };

    /**
     * Get existing connections
     *
     * @param {String} page Page index
     * @param {String} limit Pagination limit
     * @param {Bool} local Cache data
     * @returns Existing connections
     */
    this.getConnections = function (page, limit, local) {
      local = angular.isUndefined(local) ? false : local;
      var deferred = $q.defer();
      var _localStrage = 'api/connections/existing/page/' + page;
      var packet = localStorageService.get(_localStrage);
      if (ValidationAPI.hasExpired(packet) || !local) {
        ConnectionsAPI.connections().get({page: page, limit: limit, type: 2}).$promise.then(
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
      var _log = 'ConnectionsAPI:getConnections: ' + _localStrage;
      $log.debug(_log);

      return deferred.promise;
    };

    /**
     * Make connection
     *
     * @param {Integer} userId User ID
     * @param {Bool} local Cache data
     * @returns Connections status
     */
    this.makeConnection = function (userId, local) {
      local = angular.isUndefined(local) ? false : local;
      var deferred = $q.defer();
      var _localStrage = 'api/connections/make';
      var packet = localStorageService.get(_localStrage);
      if (ValidationAPI.hasExpired(packet) || !local) {
          /* eslint-disable */
        ConnectionsAPI.connections().connect({}, {user_id: userId}).$promise.then(
          /* eslint-enable */
          function (response) {
            if (response.status === 200 || response.status === 201) {
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
      var _log = 'ConnectionsAPI:makeConnection: ' + _localStrage;
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
        ConnectionsAPI.search().search({}, query).$promise.then(
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
      var _log = 'ConnectionsAPI:searchPeople: ' + _localStrage;
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
    this.searchConnected = function (query, local) {
      local = angular.isUndefined(local) ? false : local;
      var deferred = $q.defer();
      var _localStrage = 'api/connected/people';
      var packet = localStorageService.get(_localStrage);
      if (ValidationAPI.hasExpired(packet) || !local) {
        ConnectionsAPI.connectedSearch().search({}, query).$promise.then(
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
      var _log = 'ConnectionsAPI:searchConnected: ' + _localStrage;
      $log.debug(_log);

      return deferred.promise;
    };
  });
