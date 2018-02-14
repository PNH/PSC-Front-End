angular
  .module('core.sdk')
  .service('SettingsSDK', function ($q, $log, SettingsAPI, localStorageService, ValidationAPI) {
    /**
     * Get user privacy settings
     *
     * @param {Bool} local Cache data
     * @returns Privacy settings
     */
    this.getPrivacySettings = function (local) {
      local = angular.isUndefined(local) ? false : local;
      var deferred = $q.defer();
      var _localStrage = 'api/settings/privacy';
      var packet = localStorageService.get(_localStrage);
      if (ValidationAPI.hasExpired(packet) || !local) {
        SettingsAPI.privacy().query().$promise.then(
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
      var _log = 'SettingsSDK:getPrivacySettings: ' + _localStrage;
      $log.debug(_log);

      return deferred.promise;
    };

    /**
     * Set user privacy settings
     *
     * @param {Bool} local Cache data
     * @returns Privacy settings
     */
    this.setPrivacySettings = function (privacy, local) {
      local = angular.isUndefined(local) ? false : local;
      var deferred = $q.defer();
      var _localStrage = 'api/settings/privacy/save';
      var packet = localStorageService.get(_localStrage);
      if (ValidationAPI.hasExpired(packet) || !local) {
        SettingsAPI.privacy().save({}, {status: privacy}).$promise.then(
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
      var _log = 'SettingsSDK:setPrivacySettings: ' + _localStrage;
      $log.debug(_log);

      return deferred.promise;
    };
  });
