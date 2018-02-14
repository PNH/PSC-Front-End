angular
  .module('core.sdk')
  .service('PlaylistSDK', function ($q, $log, PlaylistAPI, localStorageService, ValidationAPI) {
    // methods
    this.getLists = function (local) {
      local = angular.isUndefined(local) ? false : local;
      var deferred = $q.defer();
      var _localStrage = 'api/playlists';
      var packet = localStorageService.get(_localStrage);
      if (ValidationAPI.hasExpired(packet) || !local) {
        PlaylistAPI.playlist().query().$promise.then(
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
      var _log = 'PlaylistSDK:getPlaylists: ' + _localStrage;
      $log.debug(_log);

      return deferred.promise;
    };

    this.createList = function (title, local) {
      local = angular.isUndefined(local) ? false : local;
      var deferred = $q.defer();
      var _localStrage = 'api/playlists/create';
      PlaylistAPI.playlist().create({title: title}).$promise.then(
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
      var _log = 'PlaylistSDK:createPlaylist: ' + _localStrage;
      $log.debug(_log);

      return deferred.promise;
    };

    this.deleteList = function (listid, local) {
      local = angular.isUndefined(local) ? false : local;
      var deferred = $q.defer();
      var _localStrage = 'api/playlists/remove';
      PlaylistAPI.playlist().remove({id: listid}).$promise.then(
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
      var _log = 'PlaylistSDK:deletePlaylist: ' + _localStrage;
      $log.debug(_log);

      return deferred.promise;
    };

    this.updateList = function (listid, playlist, local) {
      local = angular.isUndefined(local) ? false : local;
      var deferred = $q.defer();
      var _localStrage = 'api/playlists/update';
      PlaylistAPI.playlist().update({id: listid}, playlist).$promise.then(
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
      var _log = 'PlaylistSDK:deletePlaylist: ' + _localStrage;
      $log.debug(_log);

      return deferred.promise;
    };

    this.getResources = function (listid, local) {
      local = angular.isUndefined(local) ? false : local;
      var deferred = $q.defer();
      var _localStrage = 'api/playlists' + listid + '/resources';
      var packet = localStorageService.get(_localStrage);
      if (ValidationAPI.hasExpired(packet) || !local) {
        PlaylistAPI.resources().query({listid: listid}).$promise.then(
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
      var _log = 'PlaylistSDK:getResources: ' + _localStrage;
      $log.debug(_log);

      return deferred.promise;
    };

    this.addResource = function (listid, resourceid, local) {
      local = angular.isUndefined(local) ? false : local;
      var deferred = $q.defer();
      var _localStrage = 'api/playlists/resource/add';
      PlaylistAPI.resources().create({listid: listid}, {resourceId: resourceid}).$promise.then(
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
      var _log = 'PlaylistSDK:addResource: ' + _localStrage;
      $log.debug(_log);

      return deferred.promise;
    };

    this.deleteResource = function (listid, resourceid, local) {
      local = angular.isUndefined(local) ? false : local;
      var deferred = $q.defer();
      var _localStrage = 'api/playlists/resource/remove';
      PlaylistAPI.resources().remove({listid: listid, resourceId: resourceid}).$promise.then(
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
      var _log = 'PlaylistSDK:deleteResource: ' + _localStrage;
      $log.debug(_log);

      return deferred.promise;
    };

    /**
     * Share to wall
     *
     * @param {Integer} playlistId Playlist ID
     * @param {Integer} wallId Wall ID
     * @param {Object} payload Sharing content
     * @param {Bool} local Cache data
     * @returns Shared playlist
     */
    this.shareToWall = function (playlistId, wallId, payload, local) {
      local = angular.isUndefined(local) ? false : local;
      var deferred = $q.defer();
      var _localStrage = 'api/playlists/share/wall/';
      var packet = localStorageService.get(_localStrage);
      if (ValidationAPI.hasExpired(packet) || !local) {
        PlaylistAPI.shareToWall().share({pid: playlistId, wid: wallId}, payload).$promise.then(
          function (response) {
            if (response.status === 200 || response.status === 201) {
              packet = {
                data: response,
                timestamp: new Date().getTime()
              };
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
      var _log = 'PlaylistSDK:shareToWall: ' + _localStrage;
      $log.debug(_log);

      return deferred.promise;
    };

    /**
     * Share to Group
     *
     * @param {Integer} playlistId Playlist ID
     * @param {Integer} groupId Group ID
     * @param {Object} payload Sharing content
     * @param {Bool} local Cache data
     * @returns Shared playlist
     */
    this.shareToGroup = function (playlistId, groupId, payload, local) {
      local = angular.isUndefined(local) ? false : local;
      var deferred = $q.defer();
      var _localStrage = 'api/playlists/share/group/';
      var packet = localStorageService.get(_localStrage);
      if (ValidationAPI.hasExpired(packet) || !local) {
        PlaylistAPI.shareToGroup().share({pid: playlistId, gid: groupId}, payload).$promise.then(
          function (response) {
            if (response.status === 200 || response.status === 201) {
              packet = {
                data: response,
                timestamp: new Date().getTime()
              };
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
      var _log = 'PlaylistSDK:shareToGroup: ' + _localStrage;
      $log.debug(_log);

      return deferred.promise;
    };

    /**
     * Save playlist
     *
     * @param {Integer} playlistId Playlist ID
     * @param {Object} payload Sharing content
     * @param {Bool} local Cache data
     * @returns Shared playlist
     */
    this.savePlaylist = function (playlistId, payload, local) {
      local = angular.isUndefined(local) ? false : local;
      var deferred = $q.defer();
      var _localStrage = 'api/playlists/save/';
      var packet = localStorageService.get(_localStrage);
      if (ValidationAPI.hasExpired(packet) || !local) {
        PlaylistAPI.savePlaylist().save({pid: playlistId}, payload).$promise.then(
          function (response) {
            if (response.status === 200 || response.status === 201) {
              packet = {
                data: response,
                timestamp: new Date().getTime()
              };
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
      var _log = 'PlaylistSDK:savePlaylist: ' + _localStrage;
      $log.debug(_log);

      return deferred.promise;
    };
  });
