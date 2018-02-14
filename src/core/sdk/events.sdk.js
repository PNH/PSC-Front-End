angular
  .module('core.sdk')
  .service('EventsSDK', function ($q, $log, EventsAPI, localStorageService, ValidationAPI) {
    /**
     * Get my events
     *
     * @param {String} page Page index
     * @param {String} limit Pagination limit
     * @param {String} type Event type
     * @param {Bool} local Cache data
     * @returns Sent my events
     */
    var requestGetMyEvents = [];
    this.getMyEvents = function (page, limit, type, local) {
      local = angular.isUndefined(local) ? false : local;
      var deferred = $q.defer();
      var _localStrage = 'api/events/page/' + page;
      var packet = localStorageService.get(_localStrage);
      requestGetMyEvents.push(EventsAPI.myEvents().get({page: page, limit: limit, type: type}));
      for (var i = 0; i < requestGetMyEvents.length - 1; i++) {
        requestGetMyEvents[i].$cancelRequest();
      }
      requestGetMyEvents.splice(0, requestGetMyEvents.length - 1);
      if (ValidationAPI.hasExpired(packet) || !local) {
        requestGetMyEvents[0].$promise.then(
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
      var _log = 'EventsAPI:getMyEvents: ' + _localStrage;
      $log.debug(_log);

      return deferred.promise;
    };

    /**
     * Get event
     *
     * @param {Integer} Id
     * @param {Bool} local Cache data
     * @returns Event
     */
    this.getEventById = function (id, local) {
      local = angular.isUndefined(local) ? false : local;
      var deferred = $q.defer();
      var _localStrage = 'api/event/details/' + id;
      var packet = localStorageService.get(_localStrage);
      if (ValidationAPI.hasExpired(packet) || !local) {
        EventsAPI.event().get({id: id}).$promise.then(
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
      var _log = 'EventsAPI:getMyEvents: ' + _localStrage;
      $log.debug(_log);

      return deferred.promise;
    };

    /**
     * Get Event Categories
     *
    */
    this.getEventCategories = function (local) {
      local = angular.isUndefined(local) ? false : local;
      var deferred = $q.defer();
      var _localStrage = 'api/eventCategories/';
      var packet = localStorageService.get(_localStrage);
      if (ValidationAPI.hasExpired(packet) || !local) {
        EventsAPI.eventCategories().get().$promise.then(
          function (response) {
            if (response) {
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
      var _log = 'EventsAPI:getEventCategories: ' + _localStrage;
      $log.debug(_log);

      return deferred.promise;
    };

    /**
     * Get Event Categories
     * @param {String} query Search query
     *
    */
    this.getSearchInstructors = function (query, local) {
      local = angular.isUndefined(local) ? false : local;
      var deferred = $q.defer();
      var _localStrage = 'api/event/instructors/';
      var packet = localStorageService.get(_localStrage);
      if (ValidationAPI.hasExpired(packet) || !local) {
        EventsAPI.searchInstructors().get({query: query}).$promise.then(
          function (response) {
            if (response) {
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
      var _log = 'EventsAPI:getSearchInstructors: ' + _localStrage;
      $log.debug(_log);

      return deferred.promise;
    };

    /**
     * Get existing events
     *
     * @param {String} page Page index
     * @param {String} limit Pagination limit
     * @param {String} countr, radius, event start date, event end date, zipcode
     * @param {Bool} local Cache data
     * @returns Existing events
     */
    var requestGetEventsCalendar = [];
    this.getEventsCalendar = function (page, limit, country, radius, startDate, zipcode, local) {
      local = angular.isUndefined(local) ? false : local;
      var deferred = $q.defer();
      var _localStrage = 'api/events/page/' + page;
      var packet = localStorageService.get(_localStrage);
      requestGetEventsCalendar.push(EventsAPI.eventsCalendar().get({page: page, limit: limit, country: country, radius: radius, startDate: startDate}));
      for (var i = 0; i < requestGetEventsCalendar.length - 1; i++) {
        requestGetEventsCalendar[i].$cancelRequest();
      }
      requestGetEventsCalendar.splice(0, requestGetEventsCalendar.length - 1);
      if (ValidationAPI.hasExpired(packet) || !local) {
        if (zipcode === null) {
          requestGetEventsCalendar[0].$promise.then(
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
          EventsAPI.eventsCalendar().get({page: page, limit: limit, country: country, radius: radius, startDate: startDate, zipcode: zipcode}).$promise.then(
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
        }
      } else {
        deferred.resolve(packet.data);
      }
      var _log = 'EventsAPI:getEventsCalendar: ' + _localStrage;
      $log.debug(_log);

      return deferred.promise;
    };

    /**
     * Make event
     *
     * @param {Integer} Event object
     * @param {Bool} local Cache data
     * @returns Events status
     */
    this.makeEvent = function (eventObj, local) {
      local = angular.isUndefined(local) ? false : local;
      var deferred = $q.defer();
      var _localStrage = 'api/event/make';
      var packet = localStorageService.get(_localStrage);
      if (ValidationAPI.hasExpired(packet) || !local) {
        EventsAPI.eventCreate().save(eventObj).$promise.then(
          function (response) {
            if (response) {
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
      var _log = 'EventsAPI:makeEvent: ' + _localStrage;
      $log.debug(_log);

      return deferred.promise;
    };

    /**
     * Delete Event
     *
     * @param {Integer} Event Id
     * @returns Events status
     */
    this.deleteEvent = function (eventid) {
      var deferred = $q.defer();
      EventsAPI.event().delete({id: eventid}).$promise.then(
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
      var _log = 'EventsAPI:deleteEvent';
      $log.debug(_log);

      return deferred.promise;
    };

    /**
     * Join Event
     *
     * @param {Integer} event id
     * @param {Bool} local Cache data
     * @returns Events status
     */
    this.setJoinEvent = function (id, action, local) {
      local = angular.isUndefined(local) ? false : local;
      var deferred = $q.defer();
      var _localStrage = 'api/event/join' + id;
      var packet = localStorageService.get(_localStrage);
      if (ValidationAPI.hasExpired(packet) || !local) {
        EventsAPI.joinEvent().update({id: id, action: action}).$promise.then(
          function (response) {
            if (response) {
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
      var _log = 'EventsAPI:setJoinEvent: ' + _localStrage;
      $log.debug(_log);

      return deferred.promise;
    };
  });
