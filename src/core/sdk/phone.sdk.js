angular
  .module('core.sdk')
  .service('PhoneSDK', function ($log, PhoneAPI, localStorageService, ValidationAPI) {
    this.getPhones = function (local) {
      local = angular.isUndefined(local) ? false : local;
      var _phones;
      var _error;
      var packet = localStorageService.get('api/getphones');
      if (ValidationAPI.hasExpired(packet) || !local) {
        _phones = PhoneAPI.phone().query(function (data) {
          $log.debug('calling apis');
          packet = {data: data, timestamp: new Date().getTime()};
          localStorageService.set('api/getphones', packet);
          // localStorageService.remove('api/getphones');
          // return data;
        }, function (error) {
          // return error;
          _error = error;
          $log.error(error);
        });
      } else {
        _phones = packet.data;
      }
      return {data: _phones, error: _error};
    };
    this.getPhone = function (pid, local) {
      local = angular.isUndefined(local) ? false : local;
      var _phones;
      var _error;
      var packet = localStorageService.get('api/getphone/' + pid);
      if (ValidationAPI.hasExpired(packet) || !local) {
        _phones = PhoneAPI.phone().get({pid: pid}, function (phone) {
          $log.debug('calling apis');
          packet = {data: phone, timestamp: new Date().getTime()};
          if (local) {
            localStorageService.set('api/getphone/' + pid, packet);
          } else {
            localStorageService.remove('api/getphone/' + pid);
          }
        }, function (error) {
          _error = error;
          $log.error(error);
        });
      } else {
        _phones = packet.data;
      }
      return {data: _phones, error: _error};
    };
  });
