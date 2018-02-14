angular
  .module('core.sdk')
  .service('IssueSDK', function ($q, $log, IssueAPI, localStorageService, ValidationAPI) {
    // methods
    // this.getCategories = function (goalId, local) {
    //   local = angular.isUndefined(local) ? false : local;
    //   var _items;
    //   var _error;
    //   var _localStrage = 'api/issue/' + goalId + '/categories';
    //   var packet = localStorageService.get(_localStrage);
    //   if (ValidationAPI.hasExpired(packet) || !local) {
    //     _items = IssueAPI.category(goalId).query({}, function (data) {
    //       // $log.debug(data);
    //       packet = {data: data, timestamp: new Date().getTime()};
    //       if (local) {
    //         localStorageService.set(_localStrage, packet);
    //       } else {
    //         localStorageService.remove(_localStrage);
    //       }
    //       $log.debug(data);
    //       // angular.forEach(data, function (result) {
    //       //   $log.debug(result);
    //       // });
    //       // localStorageService.remove('api/getphones');
    //       // return data;
    //     }, function (error) {
    //       // return error;
    //       _error = error;
    //       $log.error(_localStrage);
    //       $log.error(error);
    //     });
    //   } else {
    //     _items = packet.data;
    //   }
    //   return {data: _items, error: _error};
    // };

    this.getCategories = function (goalId, local) {
      local = angular.isUndefined(local) ? false : local;
      var deferred = $q.defer();
      var _localStrage = 'api/issue/' + goalId + '/categories';
      var packet = localStorageService.get(_localStrage);
      if (ValidationAPI.hasExpired(packet) || !local) {
        IssueAPI.category(goalId).query().$promise.then(
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
      var _log = 'IssueSDK:getCategories: ' + _localStrage;
      $log.debug(_log);

      return deferred.promise;
    };

    this.getIssues = function (goalId, local) {
      local = angular.isUndefined(local) ? false : local;
      var deferred = $q.defer();
      var _localStrage = 'api/issue/' + goalId + '/issues';
      var packet = localStorageService.get(_localStrage);
      if (ValidationAPI.hasExpired(packet) || !local) {
        IssueAPI.issue(goalId).query().$promise.then(
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
      var _log = 'IssueSDK:getIssues: ' + _localStrage;
      $log.debug(_log);

      return deferred.promise;
    };

    this.getCategoryIssues = function (goalId, categoryId, local) {
      local = angular.isUndefined(local) ? false : local;
      var deferred = $q.defer();
      var _localStrage = 'api/issue/' + goalId + '/categories/' + categoryId + '/issues';
      var packet = localStorageService.get(_localStrage);
      if (ValidationAPI.hasExpired(packet) || !local) {
        IssueAPI.catissue(goalId, categoryId).query().$promise.then(
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
      var _log = 'IssueSDK:getCategoryIssues: ' + _localStrage;
      $log.debug(_log);

      return deferred.promise;
    };
  });
