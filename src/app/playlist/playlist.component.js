angular
  .module('app')
  .component('playlistCom', {
    templateUrl: 'app/playlist/template/playlist.html',
    controller: function ($log, $state, $stateParams, $scope, PlaylistSDK, alertify, $timeout) {
      var self = this;
      self.playlists = null;
      self.selectedPlaylist = null;
      self.playlistResources = null;
      self.updatedTitle = null;
      self.isProcessing = false;
      self.playlistId = null;

      // get user PlaylistSDK
      PlaylistSDK.getLists(false).then(function (response) {
        self.playlists = response.content;

        if ($stateParams.id) {
          var _playlistid = parseInt($stateParams.id, 10);
          self.playlistId = _playlistid;
          angular.forEach(self.playlists, function (playlist) {
            if (playlist.id === _playlistid) {
              self.selectedPlaylist = playlist;
              self.updatedTitle = self.selectedPlaylist.title;
            }
          });

          PlaylistSDK.getResources(_playlistid).then(function (response) {
            self.playlistResources = response.content;
          },
          function (error) {
            $log.error(error);
            alertify.error("Something went wrong!");
          });
        } else if (self.playlists[self.playlists.length - 1]) {
          var _id = self.playlists[self.playlists.length - 1].id;
          $state.go('playlist', {id: _id});
        }
      },
      function (error) {
        self.playlists = [];
        $log.error(error);
      });

      // events
      self.onNewPlaylistClicked = function onNewPlaylistClicked() {
        self.isProcessing = true;
        PlaylistSDK.createList(self.playlistName).then(function (response) {
          angular.element('#createPlaylist').modal('hide');
          self.isProcessing = false;
          alertify.success("Playlist has been successfully created.");
          // PlaylistSDK.getLists(false).then(function (response) {
          //   alertify.success("New playlist created");
          //   self.playlists = response.content;
          // },
          // function (error) {
          //   $log.error(error);
          //   alertify.error("Failed to create the playlist");
          // });
          var _playlistid = parseInt(response.content, 10);
          $timeout(function () {
            $state.go('playlist', {id: _playlistid});
          }, 200);
        },
        function (error) {
          $scope.error = {
            message: error.error
          };
          $log.error(error);
          self.isProcessing = false;
          alertify.error("Failed to create the playlist.");
        });
      };

      self.onUpdatePlaylistClicked = function onUpdatePlaylistClicked() {
        var _tempPlaylist = angular.copy(self.selectedPlaylist);
        _tempPlaylist.title = self.updatedTitle;
        PlaylistSDK.updateList(self.selectedPlaylist.id, _tempPlaylist).then(function () {
          alertify.success("Playlist's title has been updated.");
          angular.element('#editPlaylist').modal('hide');
          self.selectedPlaylist = _tempPlaylist;
          angular.forEach(self.playlists, function (playlist, index) {
            if (playlist.id === self.selectedPlaylist.id) {
              self.playlists[index] = _tempPlaylist;
            }
          });
        },
        function (error) {
          $scope.error = {
            message: error.error
          };
          $log.error(error);
        });
      };

      self.onDeletePlaylistClicked = function onDeletePlaylistClicked() {
        alertify.okBtn("yes").cancelBtn("no").confirm("Are you sure you want to delete this playlist?", function () {
          PlaylistSDK.deleteList(self.selectedPlaylist.id).then(function () {
            alertify.success("Playlist has been deleted.");
            $state.go('playlist', {id: null});
          },
          function (error) {
            $log.error(error);
            alertify.error("Something went wrong");
          });
        }, function () {
          self.isLessonCompleted = false;
        });
      };

      self.onAddToPlaylist = function onAddToPlaylist(videoId, playlistId, alredyIn) {
        if (alredyIn) {
          PlaylistSDK.deleteResource(playlistId, videoId).then(function (response) {
            $log.debug(response);
            alertify.success("Resource has been removed from the playlist.");
            $state.reload();
          },
          function (error) {
            $log.error(error);
          });
        } else {
          PlaylistSDK.addResource(playlistId, videoId).then(function (response) {
            $log.debug(response);
            alertify.success("Resource has been added to the playlist.");
            $state.reload();
          },
          function (error) {
            $log.error(error);
          });
        }
      };
    }
  });
