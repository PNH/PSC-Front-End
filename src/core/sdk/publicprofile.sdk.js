angular
  .module('core.sdk')
  .service('PublicProfileSDK', function ($q, $log, PublicProfileAPI, localStorageService, ValidationAPI) {
    /**
     * Get user information
     */
    this.getUser = function (userId, local) {
      local = angular.isUndefined(local) ? false : local;
      var deferred = $q.defer();
      var _localStorage = 'api/users/user-' + userId;
      var packet = localStorageService.get(_localStorage);
      if (ValidationAPI.hasExpired(packet) || !local) {
        PublicProfileAPI.user().query({
          uid: userId
        }).$promise.then(
          function (response) {
            if (response.status === 200) {
              packet = {
                data: response,
                timestamp: new Date().getTime()
              };
              if (local) {
                localStorageService.set(_localStorage, packet);
              } else {
                localStorageService.remove(_localStorage);
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
      var _log = 'PublicProfileSDK:getUser: ' + _localStorage;
      $log.debug(_log);

      return deferred.promise;
    };
  });
