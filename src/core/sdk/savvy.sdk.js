angular
  .module('core.sdk')
  .service('SavvySDK', function ($q, $log, SavvyAPI, localStorageService, ValidationAPI) {
    this.getSavvies = function (local) {
      local = angular.isUndefined(local) ? false : local;
      var deferred = $q.defer();
      var _localStrage = 'api/savvies/';
      var packet = localStorageService.get(_localStrage);
      if (ValidationAPI.hasExpired(packet) || !local) {
        SavvyAPI.savvy().query().$promise.then(
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
      var _log = 'SavvySDK:getSavvies: ' + _localStrage;
      $log.debug(_log);

      return deferred.promise;
    };

    this.getCategories = function (levelId, savvyId, local) {
      local = angular.isUndefined(local) ? false : local;
      var deferred = $q.defer();
      var _localStrage = 'api/savvies/' + levelId + '/categories/' + savvyId;
      var packet = localStorageService.get(_localStrage);
      if (ValidationAPI.hasExpired(packet) || !local) {
        SavvyAPI.lessonCategories(levelId, savvyId).query().$promise.then(
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
      var _log = 'SavvySDK:getCategories: ' + _localStrage;
      $log.debug(_log);

      return deferred.promise;
    };
  });
