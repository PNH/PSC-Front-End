angular
  .module('core.service')
  .factory('PlaylistAPI',
    function ($log, $resource, SETTINGS) {
      var services = {
        playlist: playlist,
        resources: resources,
        shareToWall: shareToWall,
        shareToGroup: shareToGroup,
        savePlaylist: savePlaylist
      };

      function playlist() {
        var url = SETTINGS.BASE_URL + SETTINGS.API_V1 + 'playlists/:id';
        $log.debug(url);
        return $resource(url, {id: '@id'}, {
          query: {
            method: 'GET',
            isArray: false,
            cancellable: true
          },
          create: {
            method: 'POST',
            isArray: false,
            cancellable: true
          },
          remove: {
            method: 'DELETE',
            isArray: false,
            cancellable: true
          },
          update: {
            method: 'PUT',
            isArray: false,
            cancellable: true
          }
        });
      }

      function resources() {
        var url = SETTINGS.BASE_URL + SETTINGS.API_V1 + 'playlists/:listid/resources/:id';
        $log.debug(url);
        return $resource(url, {playlistid: '@listid', id: '@id'}, {
          query: {
            method: 'GET',
            isArray: false,
            cancellable: true
          },
          create: {
            method: 'POST',
            isArray: false,
            cancellable: true
          },
          remove: {
            method: 'DELETE',
            isArray: false,
            cancellable: true
          }
        });
      }

      function shareToWall() {
        var url = SETTINGS.BASE_URL + SETTINGS.API_V1 + 'playlists/:pid/walls/:wid/share/nil';
        $log.debug(url);
        return $resource(url, {pid: '@pid', wid: '@wid'}, {
          share: {
            method: 'POST',
            isArray: false,
            cancellable: true
          }
        });
      }

      function shareToGroup() {
        var url = SETTINGS.BASE_URL + SETTINGS.API_V1 + 'playlists/:pid/groups/:gid/share/nil';
        $log.debug(url);
        return $resource(url, {pid: '@pid', gid: '@gid'}, {
          share: {
            method: 'POST',
            isArray: false,
            cancellable: true
          }
        });
      }

      function savePlaylist() {
        var url = SETTINGS.BASE_URL + SETTINGS.API_V1 + 'playlists/:pid/addtomine';
        $log.debug(url);
        return $resource(url, {pid: '@pid'}, {
          save: {
            method: 'POST',
            isArray: false,
            cancellable: true
          }
        });
      }

      return services;
    }
  );
