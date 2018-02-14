angular
  .module('core.sdk')
  .service('ResourcesSDK', function ($q, $log, ResourcesAPI, localStorageService, ValidationAPI) {
    /**
     * Save attached image as a base64 string
     *
     * @param {String} base64String Base64 string of the image
     * @param {Integer} kind Post for statistics. types: "walls": 0, "forums": 1 "blogs": 2, "groups": 3, "events": 4, "comments": 5, "others": 6
     * @param {Bool} local Cache status
     * @returns Attached file's S3 bucket URL
     */
    this.postBase64Resource = function (base64String, kind, local) {
      local = angular.isUndefined(local) ? false : local;
      var deferred = $q.defer();
      var _localStrage = 'api/resources/base64';
      var packet = localStorageService.get(_localStrage);
      if (ValidationAPI.hasExpired(packet) || !local) {
        ResourcesAPI.base64Resource().save({}, {file: base64String, kind: kind}).$promise.then(
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
      var _log = 'ResourcesSDK:postBase64Resource: ' + _localStrage;
      $log.debug(_log);

      return deferred.promise;
    };
  });
