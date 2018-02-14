angular
  .module('core.sdk')
  .service('UserSDK', function ($q, $log, localStorageService, $cookies, UserAPI, ValidationAPI) {
    this.getHeaders = function () {
      var _header = {
        'access-token': null,
        'token-type': null,
        'client': null,
        'expiry': null,
        'uid': null,
        'isValid': true
      };

      var _localStrage = 'api/login';
      var packet = localStorageService.get(_localStrage);
      if (packet) {
        // do something with header file
        var _date = new Date();
        var _cseconds = _date / 1000;
        _header = packet.data;
        if (_cseconds < _header.expiry) {
          _header = packet.data;
          _header.isValid = true;
        } else {
          _header.isValid = false;
        }
      } else {
        _header.isValid = false;
      }

      return _header;
    };

    this.login = function (email, password, rememberme, local) {
      email = angular.lowercase(email);
      local = angular.isUndefined(local) ? false : local;
      var deferred = $q.defer();
      var _localStrage = 'api/login';
      UserAPI.login().submit({email: email, password: password}).$promise.then(
        function (response) {
          if (response.headers) {
            response.data.data.rememberme = rememberme;
            response.data.data.logintime = new Date().getTime();
            // $log.debug(response.data.data);
            saveAuthHeaders(response.headers);
            saveUser(response.data.data);
          }
          deferred.resolve(response);
        },
        function (error) {
          deferred.reject(error);
        }
      );

      var _log = 'UserSDK:login: ' + _localStrage;
      $log.debug(_log);

      return deferred.promise;
    };

    this.logout = function (local) {
      local = angular.isUndefined(local) ? false : local;
      var deferred = $q.defer();
      var _localStrage = 'api/logout';
      var _header = this.getHeaders();
      removeAuthHeaders();
      removeUser();
      localStorageService.clearAll();
      UserAPI.logout(_header).submit().$promise.then(
        function (response) {
          deferred.resolve({data: response, error: null});
        },
        function (error) {
          deferred.reject({data: null, error: error});
        }
      );
      var _log = 'UserSDK:logout: ' + _localStrage;
      $log.debug(_log);

      return deferred.promise;
    };

    this.validate = function (local) {
      local = angular.isUndefined(local) ? false : local;
      var deferred = $q.defer();
      var _localStrage = 'api/validate';
      UserAPI.validate().query().$promise.then(
        function (response) {
          deferred.resolve(response);
        },
        function (error) {
          error = ValidationAPI.buildErrorMessage(error);
          deferred.reject(error);
        }
      );
      var _log = 'UserSDK:login: ' + _localStrage;
      $log.debug(_log);

      return deferred.promise;
    };

    this.getUser = function () {
      var _localStrage = 'api/user';
      var packet = localStorageService.get(_localStrage);
      if (packet) {
        return packet.data;
      }
      return null;
    };

    this.getUserRole = function () {
      var _localStrage = 'api/user';
      var packet = localStorageService.get(_localStrage);
      if (packet) {
        return packet.data.role;
      }
      return null;
    };

    this.getUserId = function () {
      var _localStrage = 'api/user';
      var packet = localStorageService.get(_localStrage);
      if (packet) {
        return packet.data.id;
      }
      return null;
    };

    this.updateUser = function (data) {
      saveUser(data);
      return true;
    };

    this.removeUser = function () {
      var _localStrage = 'api/user';
      localStorageService.remove(_localStrage);
    };

    this.getFullProfile = function (local) {
      local = angular.isUndefined(local) ? false : local;
      var deferred = $q.defer();
      var _localStrage = 'api/profile';
      UserAPI.profile().query().$promise.then(
        function (response) {
          deferred.resolve(response);
        },
        function (error) {
          error = ValidationAPI.buildErrorMessage(error);
          deferred.reject(error);
        }
      );
      var _log = 'UserSDK:getFullProfile: ' + _localStrage;
      $log.debug(_log);

      return deferred.promise;
    };

    this.updateFullProfile = function (profile, local) {
      local = angular.isUndefined(local) ? false : local;
      var deferred = $q.defer();
      var _localStrage = 'api/profile';
      UserAPI.profile().submit(profile).$promise.then(
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
      var _log = 'UserSDK:updateFullProfile: ' + _localStrage;
      $log.debug(_log);

      return deferred.promise;
    };

    /*eslint-disable */
    this.updatePassword = function (currentPassword, password, confpass, email, local) {
      local = angular.isUndefined(local) ? false : local;
      var deferred = $q.defer();
      var _localStrage = 'api/updatepassword';
      UserAPI.password().update({current_password: currentPassword, password: password, password_confirmation: confpass, email: email}).$promise.then(
        function (response) {
          deferred.resolve(response);
        },
        function (error) {
          deferred.reject(error);
        }
      );
      var _log = 'UserSDK:updatePassword: ' + _localStrage;
      $log.debug(_log);

      return deferred.promise;
    };

    this.updateEmail = function (email, password, local) {
      local = angular.isUndefined(local) ? false : local;
      var deferred = $q.defer();
      var _localStrage = 'api/updateemail';
      UserAPI.email().update({email: email, password: password}).$promise.then(
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
          deferred.reject(error);
        }
      );
      var _log = 'UserSDK:updateEmail: ' + _localStrage;
      $log.debug(_log);

      return deferred.promise;
    };

    this.requestPasswordRest = function restPassword(email, redirectUrl, local) {
      email = angular.lowercase(email);
      local = angular.isUndefined(local) ? false : local;
      var deferred = $q.defer();
      var _localStrage = 'api/requestrestpassword';
      UserAPI.password().reset({email: email, redirect_url: redirectUrl}).$promise.then(
        function (response) {
          deferred.resolve(response);
        },
        function (error) {
          deferred.reject(error);
        }
      );
      var _log = 'UserSDK:requestPasswordRest: ' + _localStrage;
      $log.debug(_log);

      return deferred.promise;
    };

    this.restPassword = function restPassword(authToken, password, passwordConfirmation, local) {
      local = angular.isUndefined(local) ? false : local;
      var deferred = $q.defer();
      var _localStrage = 'api/restpassword';
      UserAPI.restpassword().reset({reset_password_token: authToken, password: password, password_confirmation: passwordConfirmation}).$promise.then(
        function (response) {
          deferred.resolve(response);
        },
        function (error) {
          deferred.reject(error);
        }
      );
      var _log = 'UserSDK:restPassword: ' + _localStrage;
      $log.debug(_log);

      return deferred.promise;
    };

    this.tokenAuthenticate = function tokenAuthenticate(rest_token, redirect_url, local) {
      local = angular.isUndefined(local) ? false : local;
      var deferred = $q.defer();
      var _localStrage = 'api/auth/resttoken';
      UserAPI.password().authenticate({reset_password_token: rest_token, redirect_url: redirect_url}).$promise.then(
        function (response) {
          deferred.resolve(response);
        },
        function (error) {
          deferred.reject(error);
        }
      );
      var _log = 'UserSDK:tokenAuthenticate: ' + _localStrage;
      $log.debug(_log);

      return deferred.promise;
    };
    /*eslint-enable */

    // private
    function saveAuthHeaders(headers) {
      var _localStrage = 'api/login';
      var _header = {
        'access-token': headers['access-token'],
        'token-type': headers['token-type'],
        'client': headers.client,
        'expiry': headers.expiry,
        'uid': headers.uid,
        'isValid': true
      };
      var _expiry = new Date(headers.expiry * 1000);
      $cookies.putObject('auth_headers', _header, {expires: _expiry});
      var packet = {data: _header, timestamp: new Date().getTime()};
      localStorageService.set(_localStrage, packet);
    }

    function saveUser(data) {
      var _localStrage = 'api/user';
      var packet = {data: data, timestamp: new Date().getTime()};
      localStorageService.set(_localStrage, packet);
    }

    function removeAuthHeaders() {
      var _localStrage = 'api/login';
      $cookies.remove('auth_headers');
      localStorageService.remove(_localStrage);
    }

    function removeUser() {
      var _localStrage = 'api/user';
      localStorageService.remove(_localStrage);
    }
  });
