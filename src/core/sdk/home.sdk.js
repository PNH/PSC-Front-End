angular
  .module('core.sdk')
  .service('HomeSDK', function ($q, $log, HomeAPI, localStorageService, ValidationAPI) {
    this.getJoinTheClub = function (local) {
      local = angular.isUndefined(local) ? false : local;
      var deferred = $q.defer();
      var _localStrage = 'api/jointheclub';
      var packet = localStorageService.get(_localStrage);
      if (ValidationAPI.hasExpired(packet) || !local) {
        HomeAPI.joinTheClub().query().$promise.then(
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
      var _log = 'HomeSDK:getJoinTheClub: ' + _localStrage;
      $log.debug(_log);

      return deferred.promise;
    };

    this.getTestimonials = function (local) {
      local = angular.isUndefined(local) ? false : local;
      var deferred = $q.defer();
      var _localStrage = 'api/testimonials';
      var packet = localStorageService.get(_localStrage);
      if (ValidationAPI.hasExpired(packet) || !local) {
        HomeAPI.testimonial().query().$promise.then(
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
      var _log = 'HomeSDK:getTestimonials: ' + _localStrage;
      $log.debug(_log);

      return deferred.promise;
    };

    this.getIntroVideo = function (local) {
      local = angular.isUndefined(local) ? false : local;
      var deferred = $q.defer();
      var _localStrage = 'api/introvideo';
      var packet = localStorageService.get(_localStrage);
      if (ValidationAPI.hasExpired(packet) || !local) {
        HomeAPI.introVideo().query().$promise.then(
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
      var _log = 'HomeSDK:getIntroVideo: ' + _localStrage;
      $log.debug(_log);

      return deferred.promise;
    };

    this.getHomeVideo = function (local) {
      local = angular.isUndefined(local) ? false : local;
      var deferred = $q.defer();
      var _localStrage = 'api/homepage_video';
      var packet = localStorageService.get(_localStrage);
      if (ValidationAPI.hasExpired(packet) || !local) {
        HomeAPI.getHomeVideo().query().$promise.then(
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
      var _log = 'HomeSDK:homepage_video: ' + _localStrage;
      $log.debug(_log);

      return deferred.promise;
    };

    this.getTestimonialsBackground = function (local) {
      local = angular.isUndefined(local) ? false : local;
      var deferred = $q.defer();
      var _localStrage = 'api/testimonials/background';
      var packet = localStorageService.get(_localStrage);
      if (ValidationAPI.hasExpired(packet) || !local) {
        HomeAPI.testimonialBackground().query().$promise.then(
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
      var _log = 'HomeSDK:getTestimonialsBackground: ' + _localStrage;
      $log.debug(_log);

      return deferred.promise;
    };
  });
