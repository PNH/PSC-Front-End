angular
  .module('core.common')
  .service('ValidationAPI', function (SETTINGS) {
    this.hasExpired = function (packet) {
      var _hasExpired = false;
      if (packet) {
        if (packet.timestamp && new Date().getTime() - packet.timestamp > SETTINGS.DATA_EXPIRY_TIME) {
          _hasExpired = true;
        } else {
          _hasExpired = false;
        }
      } else {
        _hasExpired = true;
      }

      return _hasExpired;
    };

    this.buildErrorMessage = function (error) {
      switch (error.status) {
        case 404:
          error.message = 'resource not found';
          break;
        default:

      }

      return error;
    };
  });
