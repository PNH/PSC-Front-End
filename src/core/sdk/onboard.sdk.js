angular
  .module('core.sdk')
  .service('OnbaordSDK', function ($q, $log, OnboardAPI, localStorageService, ValidationAPI) {
    this.setOnboard = function (data, local) {
      local = angular.isUndefined(local) ? false : local;
      var deferred = $q.defer();
      var _localStrage = 'api/onboard';
      OnboardAPI.onbaord().submit(data).$promise.then(
        function (response) {
          if (response.status === 201) {
            var packet = {data: data, timestamp: new Date().getTime()};
            if (local) {
              localStorageService.set(_localStrage, packet);
            } else {
              localStorageService.remove(_localStrage);
            }
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
      var _log = 'OnbaordSDK:setOnboard: ' + _localStrage;
      $log.debug(_log);

      return deferred.promise;
    };

    this.getOnboard = function (local) {
      local = angular.isUndefined(local) ? false : local;
      var deferred = $q.defer();
      var _localStrage = 'api/onboard';
      var packet = localStorageService.get(_localStrage);
      if (packet) {
        deferred.resolve(packet.data);
      } else {
        deferred.resolve(null);
      }
      var _log = 'OnbaordSDK:getOnboard: ' + _localStrage;
      $log.debug(_log);

      return deferred.promise;
    };

    this.removeOnboard = function () {
      var _localStrage = 'api/onboard';
      localStorageService.remove(_localStrage);
      var _log = 'OnbaordSDK:removeOnboard: ' + _localStrage;
      $log.debug(_log);
    };

    this.setTempOnboard = function (tempdata, local) {
      local = angular.isUndefined(local) ? false : local;
      var deferred = $q.defer();
      var _localStrage = 'api/onboard/tempdata';
      var packet = {data: tempdata, timestamp: new Date().getTime()};
      if (local) {
        localStorageService.set(_localStrage, packet);
      } else {
        localStorageService.remove(_localStrage);
      }
      deferred.resolve(true);

      var _log = 'OnbaordSDK:setTempOnboard: ' + _localStrage;
      $log.debug(_log);

      return deferred.promise;
    };

    this.getTempOnboard = function (local) {
      local = angular.isUndefined(local) ? false : local;
      var deferred = $q.defer();
      var _localStrage = 'api/onboard/tempdata';
      var packet = localStorageService.get(_localStrage);
      if (!local) {
        localStorageService.remove(_localStrage);
      }
      if (packet) {
        deferred.resolve(packet.data);
      } else {
        deferred.reject(null);
      }
      var _log = 'OnbaordSDK:getTempOnboard: ' + _localStrage;
      $log.debug(_log);

      return deferred.promise;
    };

    this.removeTempOnboard = function () {
      var _localStrage = 'api/onboard/tempdata';
      localStorageService.remove(_localStrage);
      var _log = 'OnbaordSDK:removeTempOnboard: ' + _localStrage;
      $log.debug(_log);
    };

    this.getIssues = function (horseId, local) {
      local = angular.isUndefined(local) ? false : local;
      var deferred = $q.defer();
      var _localStrage = 'api/onboard/savedissues';
      var packet = localStorageService.get(_localStrage);
      if (ValidationAPI.hasExpired(packet) || !local) {
        OnboardAPI.solutionMap().query({hid: horseId}).$promise.then(
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
      var _log = 'OnbaordSDK:getIssues: ' + _localStrage;
      $log.debug(_log);

      return deferred.promise;
    };

    this.saveIssues = function (horseId, issues, local) {
      local = angular.isUndefined(local) ? false : local;
      var deferred = $q.defer();
      var _localStrage = 'api/onboard/saveissues';
      var packet = localStorageService.get(_localStrage);
      if (ValidationAPI.hasExpired(packet) || !local) {
        OnboardAPI.solutionMap().update({hid: horseId}, issues).$promise.then(
          function (response) {
            if (response.status === 200 || response.status === 205) {
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
      var _log = 'OnbaordSDK:saveIssues: ' + _localStrage;
      $log.debug(_log);

      return deferred.promise;
    };

    this.shareSolutionMap = function (horseId, payload, local) {
      local = angular.isUndefined(local) ? false : local;
      var deferred = $q.defer();
      var _localStrage = 'api/onboard/share';
      var packet = localStorageService.get(_localStrage);
      if (ValidationAPI.hasExpired(packet) || !local) {
        OnboardAPI.shareSolutionMap().share({hid: horseId}, payload).$promise.then(
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
      var _log = 'OnbaordSDK:shareSolutionMap: ' + _localStrage;
      $log.debug(_log);

      return deferred.promise;
    };
  });
