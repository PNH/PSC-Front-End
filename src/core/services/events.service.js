angular
  .module('core.service')
  .factory('EventsAPI',
    function ($resource, SETTINGS, $log) {
      var services = {
        event: event,
        eventCreate: eventCreate,
        myEvents: myEvents,
        eventsCalendar: eventsCalendar,
        eventCategories: eventCategories,
        searchInstructors: searchInstructors,
        joinEvent: joinEvent
      };

      /**
       * Events API
       */
      function event() {
        var url = SETTINGS.BASE_URL + SETTINGS.API_V1 + 'event/:id';
        $log.debug(url);
        return $resource(url, {invId: '@id'}, {
          get: {
            method: 'GET',
            isArray: false,
            cancellable: true
          },
          create: {
            method: 'POST',
            isArray: false,
            cancellable: true
          },
          delete: {
            method: 'DELETE',
            isArray: false,
            cancellable: true
          }
        });
      }

      function eventCreate() {
        var url = SETTINGS.BASE_URL + SETTINGS.API_V1 + 'event/nil';
        $log.debug(url);
        return $resource(url, {}, {
          save: {
            method: 'POST',
            isArray: false,
            cancellable: true
          }
        });
      }

      function myEvents() {
        var url = SETTINGS.BASE_URL + SETTINGS.API_V1 + 'events/my';
        $log.debug(url);
        return $resource(url, {page: '@page', limit: '@limit'}, {
          get: {
            method: 'GET',
            isArray: false,
            cancellable: true
          }
        });
      }

      function eventsCalendar() {
        var url = SETTINGS.BASE_URL + SETTINGS.API_V1 + 'events';
        $log.debug(url);
        return $resource(url, {page: '@page', limit: '@limit', country: '@country', radius: '@radius', startDate: '@startDate', zipcode: '@zipcode'}, {
          get: {
            method: 'POST',
            isArray: false,
            cancellable: true
          }
        });
      }

      function eventCategories() {
        var url = SETTINGS.BASE_URL + SETTINGS.API_V1 + 'events/categories/0';
        $log.debug(url);
        return $resource(url, {}, {
          get: {
            method: 'GET',
            isArray: false,
            cancellable: true
          }
        });
      }

      function searchInstructors() {
        var url = SETTINGS.BASE_URL + SETTINGS.API_V1 + 'members/instructors/search/:query';
        $log.debug(url);
        return $resource(url, {query: '@query'}, {
          get: {
            method: 'GET',
            isArray: false,
            cancellable: true
          }
        });
      }

      function joinEvent() {
        var url = SETTINGS.BASE_URL + SETTINGS.API_V1 + 'event/:id/join';
        $log.debug(url);
        return $resource(url, {id: '@id', action: '@action'}, {
          update: {
            method: 'POST',
            isArray: false,
            cancellable: true
          }
        });
      }

      return services;
    }
  );
