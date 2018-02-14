angular
  .module('core.sdk')
  .service('LearninglibSDK', function ($q, $log, LearninglibAPI, localStorageService, ValidationAPI) {
    // methods
    this.getFeatured = function (local) {
      local = angular.isUndefined(local) ? false : local;
      var deferred = $q.defer();
      var _localStrage = 'api/learning/featured';
      var packet = localStorageService.get(_localStrage);
      if (ValidationAPI.hasExpired(packet) || !local) {
        LearninglibAPI.featured().query().$promise.then(
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
      var _log = 'LearninglibSDK:getFeatured: ' + _localStrage;
      $log.debug(_log);

      return deferred.promise;
    };

    this.getCategories = function (local) {
      local = angular.isUndefined(local) ? false : local;
      var deferred = $q.defer();
      var _localStrage = 'api/learning/categories';
      var packet = localStorageService.get(_localStrage);
      if (ValidationAPI.hasExpired(packet) || !local) {
        LearninglibAPI.categories().query().$promise.then(
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
      var _log = 'LearninglibSDK:getCategories: ' + _localStrage;
      $log.debug(_log);

      return deferred.promise;
    };

    this.getSubCategories = function (categoryId, local) {
      local = angular.isUndefined(local) ? false : local;
      var deferred = $q.defer();
      var _localStrage = 'api/learning/categories/' + categoryId;
      var packet = localStorageService.get(_localStrage);
      if (ValidationAPI.hasExpired(packet) || !local) {
        LearninglibAPI.categories().query({id: categoryId}).$promise.then(
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
      var _log = 'LearninglibSDK:getSubCategories: ' + _localStrage;
      $log.debug(_log);

      return deferred.promise;
    };

    this.getResources = function (categoryId, local) {
      local = angular.isUndefined(local) ? false : local;
      var deferred = $q.defer();
      var _localStrage = 'api/learning/categories/' + categoryId + '/resources';
      var packet = localStorageService.get(_localStrage);
      if (ValidationAPI.hasExpired(packet) || !local) {
        LearninglibAPI.resources().query({categoryid: categoryId}).$promise.then(
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
      var _log = 'LearninglibSDK:getResources: ' + _localStrage;
      $log.debug(_log);

      return deferred.promise;
    };

    this.searchResource = function (query, local) {
      local = angular.isUndefined(local) ? false : local;
      var deferred = $q.defer();
      var _localStrage = 'api/learning/search';
      LearninglibAPI.search().query({term: query}).$promise.then(
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
      var _log = 'LearninglibSDK:searchResource: ' + _localStrage;
      $log.debug(_log);

      return deferred.promise;
    };

    this.lookUp = function (query, local) {
      local = angular.isUndefined(local) ? false : local;
      var deferred = $q.defer();
      var _localStrage = 'api/learning/search';
      LearninglibAPI.lookup().query({term: query}).$promise.then(
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
      var _log = 'LearninglibSDK:lookUp: ' + _localStrage;
      $log.debug(_log);

      return deferred.promise;
    };
  });
