angular
  .module('core.sdk')
  .service('MembershipSDK', function ($q, $log, MembershipAPI, ValidationAPI, localStorageService) {
    this.setMembership = function (data, local) {
      data.user.email = angular.lowercase(data.user.email);
      local = angular.isUndefined(local) ? false : local;
      var deferred = $q.defer();
      var _localStrage = 'api/membership';
      MembershipAPI.membership().submit(data).$promise.then(
        function (response) {
          if (response.status === 201) {
            var packet = {data: response, timestamp: new Date().getTime()};
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
      var _log = 'MembershipSDK:setMembership: ' + _localStrage;
      $log.debug(_log);

      return deferred.promise;
    };

    this.getMemberships = function (local) {
      local = angular.isUndefined(local) ? false : local;
      var deferred = $q.defer();
      var _localStrage = 'api/memberships';
      var packet = localStorageService.get(_localStrage);
      if (ValidationAPI.hasExpired(packet) || !local) {
        MembershipAPI.membership().query().$promise.then(
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
      var _log = 'MembershipSDK:getMemberships: ' + _localStrage;
      $log.debug(_log);

      return deferred.promise;
    };

    this.setType = function (type, local) {
      local = angular.isUndefined(local) ? false : local;
      var deferred = $q.defer();
      var _localStrage = 'api/membership/type';
      var packet = {data: type, timestamp: new Date().getTime()};
      if (local) {
        localStorageService.set(_localStrage, packet);
      } else {
        localStorageService.remove(_localStrage);
      }
      deferred.resolve(true);

      var _log = 'MembershipSDK:setType: ' + _localStrage;
      $log.debug(_log);

      return deferred.promise;
    };

    this.getType = function (local) {
      local = angular.isUndefined(local) ? false : local;
      var deferred = $q.defer();
      var _localStrage = 'api/membership/type';
      var packet = localStorageService.get(_localStrage);
      if (!local) {
        localStorageService.remove(_localStrage);
      }
      if (packet) {
        deferred.resolve(packet.data);
      } else {
        deferred.reject({data: null, error: "empty"});
      }
      var _log = 'MembershipSDK:getType: ' + _localStrage;
      $log.debug(_log);

      return deferred.promise;
    };

    this.setTempMembership = function (tempdata, local) {
      local = angular.isUndefined(local) ? false : local;
      var deferred = $q.defer();
      var _localStrage = 'api/membership/tempdata';
      var packet = {data: tempdata, timestamp: new Date().getTime()};
      if (local) {
        localStorageService.set(_localStrage, packet);
      } else {
        localStorageService.remove(_localStrage);
      }
      deferred.resolve(true);

      var _log = 'MembershipSDK:setTempMembership: ' + _localStrage;
      $log.debug(_log);

      return deferred.promise;
    };

    this.getTempMembership = function (local) {
      local = angular.isUndefined(local) ? false : local;
      var deferred = $q.defer();
      var _localStrage = 'api/membership/tempdata';
      var packet = localStorageService.get(_localStrage);
      if (!local) {
        localStorageService.remove(_localStrage);
      }
      if (packet) {
        deferred.resolve(packet.data);
      } else {
        deferred.resolve(null);
      }
      var _log = 'MembershipSDK:getTempMembership: ' + _localStrage;
      $log.debug(_log);

      return deferred.promise;
    };

    this.removeTempMembership = function () {
      var _localStrage = 'api/membership/tempdata';
      localStorageService.remove(_localStrage);
    };

    this.isEmailExist = function (email) {
      var deferred = $q.defer();
      var _localStrage = 'api/users/exist';
      MembershipAPI.exist().query({email: email}).$promise.then(
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
      var _log = 'MembershipSDK:isEmailExist: ' + _localStrage;
      $log.debug(_log);

      return deferred.promise;
    };

    this.cancelMembership = function (payload) {
      var deferred = $q.defer();
      var _localStrage = 'api/users/membershipcancel';
      MembershipAPI.cancel().cancel({}, payload).$promise.then(
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
      var _log = 'MembershipSDK:cancelMembership: ' + _localStrage;
      $log.debug(_log);

      return deferred.promise;
    };
  });
