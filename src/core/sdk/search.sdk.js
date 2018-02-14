angular
  .module('core.sdk')
  .service('SearchSDK', function ($q, $log, SearchAPI, localStorageService, ValidationAPI) {
    /**
     * Site wide search for a given query
     *
     * @param {String} query Search query
     * @param {Integer} page Page index
     * @param {Integer} limit Result limit
     * @param {Bool} local Cache data
     * @returns Search result
     */
    this.search = function (query, page, limit, filters, local) {
      local = angular.isUndefined(local) ? false : local;
      var deferred = $q.defer();
      var _localStrage = 'api/search/' + query + '/page/' + page;
      var packet = localStorageService.get(_localStrage);
      if (ValidationAPI.hasExpired(packet) || !local) {
        SearchAPI.search().save({}, {query: query, page: page, limit: limit, filters: filters}).$promise.then(
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
      var _log = 'SearchSDK:search: ' + _localStrage;
      $log.debug(_log);

      return deferred.promise;
    };
  });
