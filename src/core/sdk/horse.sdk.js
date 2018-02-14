angular
  .module('core.sdk')
  .service('HorseSDK', function ($q, $log, HorseAPI, localStorageService, ValidationAPI) {
    this.getHorses = function (local) {
      local = angular.isUndefined(local) ? false : local;
      var deferred = $q.defer();
      var _localStrage = 'api/horses';
      var packet = localStorageService.get(_localStrage);
      if (ValidationAPI.hasExpired(packet) || !local) {
        HorseAPI.horses().query().$promise.then(
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
      var _log = 'HorseSDK:getHorses: ' + _localStrage;
      $log.debug(_log);

      return deferred.promise;
    };

    this.updateHorses = function (horseId, horse, local) {
      local = angular.isUndefined(local) ? false : local;
      var deferred = $q.defer();
      var _localStrage = 'api/horse/update';
      HorseAPI.horses().update({hid: horseId}, horse).$promise.then(
        function (response) {
          if (response.status === 201) {
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
      var _log = 'HorseSDK:updateHorses: ' + _localStrage;
      $log.debug(_log);

      return deferred.promise;
    };

    this.removeHorses = function (horseId, local) {
      local = angular.isUndefined(local) ? false : local;
      var deferred = $q.defer();
      var _localStrage = 'api/horse/delete';
      HorseAPI.horses().delete({hid: horseId}).$promise.then(
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
      var _log = 'HorseSDK:removeHorses: ' + _localStrage;
      $log.debug(_log);

      return deferred.promise;
    };

    this.getBadges = function (horseId, local) {
      local = angular.isUndefined(local) ? false : local;
      var deferred = $q.defer();
      var _localStrage = 'api/horse/' + horseId + '/badges/earned';
      var packet = localStorageService.get(_localStrage);
      if (ValidationAPI.hasExpired(packet) || !local) {
        HorseAPI.badges().query({hid: horseId}).$promise.then(
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
            deferred.resolve({data: response, error: null});
          },
          function (error) {
            error = ValidationAPI.buildErrorMessage(error);
            deferred.reject(error);
          }
        );
      } else {
        deferred.resolve(packet.data);
      }
      var _log = 'HorseSDK:getBadges: ' + _localStrage;
      $log.debug(_log);

      return deferred.promise;
    };

    this.getSavvyStatus = function (horseId, local) {
      local = angular.isUndefined(local) ? false : local;
      var deferred = $q.defer();
      var _localStrage = 'api/horse/' + horseId + '/savvies/status';
      var packet = localStorageService.get(_localStrage);
      // var _header = UserSDK.getHeaders();
      // $log.warn(_header);
      if (ValidationAPI.hasExpired(packet) || !local) {
        HorseAPI.savvy().query({hid: horseId}).$promise.then(
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
            deferred.resolve({data: response, error: null});
          },
          function (error) {
            error = ValidationAPI.buildErrorMessage(error);
            deferred.reject(error);
          }
        );
      } else {
        deferred.resolve(packet.data);
      }
      var _log = 'HorseSDK:getSavvyStatus: ' + _localStrage;
      $log.debug(_log);

      return deferred.promise;
    };

    this.getPathway = function (horseId, levelId, lastId, limit, local) {
      local = angular.isUndefined(local) ? false : local;
      var deferred = $q.defer();
      var _localStrage = 'api/horse/' + horseId + '/level/' + levelId + '/pathway';
      var packet = localStorageService.get(_localStrage);
      if (ValidationAPI.hasExpired(packet) || !local) {
        HorseAPI.pathway().query({hid: horseId, lid: levelId, fromIndex: lastId, limit: limit}).$promise.then(
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
            deferred.resolve({data: response, error: null});
          },
          function (error) {
            error = ValidationAPI.buildErrorMessage(error);
            deferred.reject(error);
          }
        );
      } else {
        deferred.resolve(packet.data);
      }
      var _log = 'HorseSDK:getSavvyStatus: ' + _localStrage;
      $log.debug(_log);

      return deferred.promise;
    };

    this.setCurrentHorse = function (horse) {
      var _localStrage = 'api/current/horse';
      var packet = {data: horse, timestamp: new Date().getTime()};
      localStorageService.set(_localStrage, packet);
    };

    this.getCurrentHorse = function () {
      var _localStrage = 'api/current/horse';
      var packet = localStorageService.get(_localStrage);
      var _data = null;
      if (packet) {
        _data = packet.data;
      }
      return _data;
    };

    this.removeCurrentHorse = function () {
      var _localStrage = 'api/current/horse';
      localStorageService.remove(_localStrage);
    };

    /**
     * Get Horse Progress Logs
     *
     * @param {String} page Page index
     * @param {String} limit Pagination limit
     * @param {Bool} local Cache data
     * @returns Sent horse progress logs
     */
    this.getHorseProgressLogs = function (page, limit, horseId, local) {
      local = angular.isUndefined(local) ? false : local;
      var deferred = $q.defer();
      var _localStrage = 'api/horse/progress' + page;
      var packet = localStorageService.get(_localStrage);
      if (ValidationAPI.hasExpired(packet) || !local) {
        HorseAPI.progressLog().get({page: page, limit: limit, hid: horseId}).$promise.then(
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
      var _log = 'HorseAPI:getHorseProgressLogs: ' + _localStrage;
      $log.debug(_log);

      return deferred.promise;
    };

    /**
     * Save Progress Log
     *
     * @param {Bool} local Cache data
     * @returns Sent new horse progress log
     */
    this.makeHorseProgressLog = function (horseId, healthObj, local) {
      local = angular.isUndefined(local) ? false : local;
      var deferred = $q.defer();
      var _localStrage = 'api/horse/progress/new';
      var packet = localStorageService.get(_localStrage);
      if (ValidationAPI.hasExpired(packet) || !local) {
        HorseAPI.progressLog().save({hid: horseId}, healthObj).$promise.then(
          function (response) {
            if (response.status === 201) {
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
      var _log = 'HorseAPI:makeHorseProgressLog: ' + _localStrage;
      $log.debug(_log);

      return deferred.promise;
    };

    /**
     * Edit Progress Log
     *
     * @param {Bool} local Cache data
     * @returns Sent new horse progress log
    */
    this.editHorseProgressLog = function (horseId, progressPostId, progressObj, local) {
      local = angular.isUndefined(local) ? false : local;
      var deferred = $q.defer();
      var _localStrage = 'api/horse/progress/edit';
      var packet = localStorageService.get(_localStrage);
      if (ValidationAPI.hasExpired(packet) || !local) {
        HorseAPI.progressLog().update({hid: horseId, hpid: progressPostId}, progressObj).$promise.then(
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
      var _log = 'HorseAPI:editHorseProgressLog: ' + _localStrage;
      $log.debug(_log);

      return deferred.promise;
    };

    /**
     * Get Horse Health Logs
     *
     * @param {String} page Page index
     * @param {String} limit Pagination limit
     * @param {String} type Health Log type
     * @param {Bool} local Cache data
     * @returns Sent horse health logs
     */
    var requestGetHorseHealthLogs = [];
    this.getHorseHealthLogs = function (page, limit, horseId, type, local) {
      local = angular.isUndefined(local) ? false : local;
      var deferred = $q.defer();
      var _localStrage = 'api/horse/health' + page;
      var packet = localStorageService.get(_localStrage);
      requestGetHorseHealthLogs.push(HorseAPI.healthLog().get({page: page, limit: limit, hid: horseId, type: type}));
      for (var i = 0; i < requestGetHorseHealthLogs.length - 1; i++) {
        requestGetHorseHealthLogs[i].$cancelRequest();
      }
      requestGetHorseHealthLogs.splice(0, requestGetHorseHealthLogs.length - 1);
      if (ValidationAPI.hasExpired(packet) || !local) {
        requestGetHorseHealthLogs[0].$promise.then(
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
      var _log = 'HorseAPI:getHorseHealthLogs: ' + _localStrage;
      $log.debug(_log);

      return deferred.promise;
    };

    /**
     * Save Health Log
     *
     * @param {Bool} local Cache data
     * @returns Sent new horse health log
     */
    this.makeHorseHealthLog = function (horseId, healthObj, local) {
      local = angular.isUndefined(local) ? false : local;
      var deferred = $q.defer();
      var _localStrage = 'api/horse/health/new';
      var packet = localStorageService.get(_localStrage);
      if (ValidationAPI.hasExpired(packet) || !local) {
        HorseAPI.healthLog().save({hid: horseId}, healthObj).$promise.then(
          function (response) {
            if (response.status === 201) {
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
      var _log = 'HorseAPI:makeHorseHealthLog: ' + _localStrage;
      $log.debug(_log);

      return deferred.promise;
    };

    /**
     * Edit Health Log
     *
     * @param {Bool} local Cache data
     * @returns Sent new horse health log
     */
    this.editHorseHealthLog = function (horseId, healthPostId, healthObj, local) {
      local = angular.isUndefined(local) ? false : local;
      var deferred = $q.defer();
      var _localStrage = 'api/horse/health/edit';
      var packet = localStorageService.get(_localStrage);
      if (ValidationAPI.hasExpired(packet) || !local) {
        HorseAPI.healthLog().update({hid: horseId, hpid: healthPostId}, healthObj).$promise.then(
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
      var _log = 'HorseAPI:editHorseHealthLog: ' + _localStrage;
      $log.debug(_log);

      return deferred.promise;
    };

    /**
     * Get Horse Health Log Types
     *
     * @param {Bool} local Cache data
     * @returns Sent horse health log types
     */
    this.getHorseHealthLogTypes = function (local) {
      local = angular.isUndefined(local) ? false : local;
      var deferred = $q.defer();
      var _localStrage = 'api/horse/health/logtypes';
      var packet = localStorageService.get(_localStrage);
      if (ValidationAPI.hasExpired(packet) || !local) {
        HorseAPI.healthVisitTypes().get().$promise.then(
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
      var _log = 'HorseAPI:getHorseHealthLogTypes: ' + _localStrage;
      $log.debug(_log);

      return deferred.promise;
    };

    /**
     * Get other user's horses
     *
     * @param {Integer} userId User ID
     * @param {Bool} local Cache status
     * @returns Horses list
     */
    this.getOthersHorses = function (userId, local) {
      local = angular.isUndefined(local) ? false : local;
      var deferred = $q.defer();
      var _localStrage = 'api/horses';
      var packet = localStorageService.get(_localStrage);
      if (ValidationAPI.hasExpired(packet) || !local) {
        /* eslint-disable */
        // Disabled due to eslint errors which cannot be fixed at the moment since `connection_status` property has to be changed 
        // from the back end
        HorseAPI.horses().query({user_id: userId}).$promise.then(
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
      var _log = 'HorseSDK:getOthersHorses: ' + _localStrage;
      $log.debug(_log);

      return deferred.promise;
    };

    /**
     * Get horse's health log archives
     *
     * @param {Integer} horseId Horse ID
     * @returns Health log archives
     */
    this.getHealthLogArchives = function (horseId, local) {
      local = angular.isUndefined(local) ? false : local;
      var deferred = $q.defer();
      var _localStrage = 'api/horses/' + horseId + '/health/archive';
      var packet = localStorageService.get(_localStrage);
      if (ValidationAPI.hasExpired(packet) || !local) {
        HorseAPI.healthLogArchives().archives({hid: horseId}).$promise.then(
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
      var _log = 'HorseSDK:getHealthLogArchives: ' + _localStrage;
      $log.debug(_log);

      return deferred.promise;
    };

    /**
     * Get archived health logs from year and month
     *
     * @param {Integer} horseId Horse Id
     * @param {Integer} year Year
     * @param {Integer} month Month
     * @param {Bool} local Cache
     * @returns Archives
     */
    this.getHealthArchivedLogs = function (horseId, year, month, local) {
      local = angular.isUndefined(local) ? false : local;
      var deferred = $q.defer();
      var _localStrage = 'api/horses/' + horseId + '/health/archive';
      var packet = localStorageService.get(_localStrage);
      if (ValidationAPI.hasExpired(packet) || !local) {
        HorseAPI.healthLogArchives().logs({hid: horseId, year: year, month: month}).$promise.then(
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
      var _log = 'HorseSDK:getHealthArchivedLogs: ' + _localStrage;
      $log.debug(_log);

      return deferred.promise;
    };

    /**
     * Get horse's progress log archives
     *
     * @param {Integer} horseId Horse ID
     * @returns Progress log archives
     */
    this.getProgressLogArchives = function (horseId, local) {
      local = angular.isUndefined(local) ? false : local;
      var deferred = $q.defer();
      var _localStrage = 'api/horses/' + horseId + '/progress/archive';
      var packet = localStorageService.get(_localStrage);
      if (ValidationAPI.hasExpired(packet) || !local) {
        HorseAPI.progressLogArchives().archives({hid: horseId}).$promise.then(
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
      var _log = 'HorseSDK:getProgressLogArchives: ' + _localStrage;
      $log.debug(_log);

      return deferred.promise;
    };

    /**
     * Get archived progress logs from year and month
     *
     * @param {Integer} horseId Horse Id
     * @param {Integer} year Year
     * @param {Integer} month Month
     * @param {Bool} local Cache
     * @returns Archives
     */
    this.getProgressArchivedLogs = function (horseId, year, month, local) {
      local = angular.isUndefined(local) ? false : local;
      var deferred = $q.defer();
      var _localStrage = 'api/horses/' + horseId + '/progress/archive';
      var packet = localStorageService.get(_localStrage);
      if (ValidationAPI.hasExpired(packet) || !local) {
        HorseAPI.progressLogArchives().logs({hid: horseId, year: year, month: month}).$promise.then(
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
      var _log = 'HorseSDK:getProgressArchivedLogs: ' + _localStrage;
      $log.debug(_log);

      return deferred.promise;
    };
  });
