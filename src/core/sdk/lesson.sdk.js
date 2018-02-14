angular
  .module('core.sdk')
  .service('LessonSDK', function ($q, $log, LessonAPI, localStorageService, ValidationAPI) {
    // methods
    this.getCategories = function (levelid, horseid, local) {
      local = angular.isUndefined(local) ? false : local;
      var deferred = $q.defer();
      var _localStrage = 'api/lessons/' + levelid + '/categories';
      var packet = localStorageService.get(_localStrage);
      if (ValidationAPI.hasExpired(packet) || !local) {
        LessonAPI.categories().query({lvlid: levelid, horseId: horseid}).$promise.then(
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
      var _log = 'LessonSDK:getCategories: ' + _localStrage;
      $log.debug(_log);

      return deferred.promise;
    };

    this.getLessons = function (categoryId, levelId, local) {
      local = angular.isUndefined(local) ? false : local;
      var deferred = $q.defer();
      var _localStrage = 'api/lessons/' + categoryId;
      var packet = localStorageService.get(_localStrage);
      if (ValidationAPI.hasExpired(packet) || !local) {
        LessonAPI.lessons().query({categoryid: categoryId}).$promise.then(
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
      var _log = 'LessonSDK:getLessons: ' + _localStrage;
      $log.debug(_log);

      return deferred.promise;
    };

    this.getLesson = function (horseId, lessonId, local) {
      local = angular.isUndefined(local) ? false : local;
      var deferred = $q.defer();
      var _localStrage = 'api/lesson/' + lessonId;
      var packet = localStorageService.get(_localStrage);
      if (ValidationAPI.hasExpired(packet) || !local) {
        LessonAPI.lesson().get({horseId: horseId, lid: lessonId}).$promise.then(
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
      var _log = 'LessonSDK:getLesson: ' + _localStrage;
      $log.debug(_log);

      return deferred.promise;
    };

    this.completeLesson = function (lessonId, horseId, status, local) {
      local = angular.isUndefined(local) ? false : local;
      var deferred = $q.defer();
      var _localStrage = 'api/lesson/complete';
      LessonAPI.lesson().complete({lid: lessonId, horseId: horseId, status: status}).$promise.then(
        function (response) {
          if (response.status === 200) {
            var packet = {data: response, timestamp: new Date().getTime()};
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
      var _log = 'LessonSDK:completeLesson: ' + _localStrage;
      $log.debug(_log);

      return deferred.promise;
    };

    this.getSampleLesson = function (goaldId, local) {
      local = angular.isUndefined(local) ? false : local;
      var deferred = $q.defer();
      var _localStrage = 'api/samplelesson/' + goaldId;
      var packet = localStorageService.get(_localStrage);
      if (ValidationAPI.hasExpired(packet) || !local) {
        LessonAPI.sampleLesson(goaldId).query().$promise.then(
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
      var _log = 'LessonSDK:getSampleLesson: ' + _localStrage;
      $log.debug(_log);

      return deferred.promise;
    };

    // function handleResponse (localStrage, response, local, deferred) {
    //
    // };
  });
