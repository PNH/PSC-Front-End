angular
  .module('app')
  .component('learningLibDetailCom', {
    templateUrl: 'app/learninglibrary/template/detail.html',
    controller: function ($scope, $state, $log, $stateParams, $q, $timeout, $filter, $sce, LearninglibSDK, PlaylistSDK, alertify) {
      var self = this;
      self.categoryid = null;
      self.title = null;
      self.parentCategory = null;
      self.videos = null;
      self.audios = null;
      self.documents = null;
      self.playlists = null;
      self.selectedDropdownItem = null;
      self.selectedDocument = null;
      self.dropdownItems = [];
      $scope.query = self.selectedDropdownItem;
      self.searching = false;
      self.isProcessing = false;
      self.videoPlayerControls = {};
      self.audioPlayerControls = {};

      $log.debug("learningLibDetailCom called");

      PlaylistSDK.getLists().then(function (response) {
        self.playlists = response.content;
      },
      function (error) {
        self.playlists = [];
        $log.error(error);
      });

      if ($stateParams.categoryid) {
        if ($stateParams.parent) {
          var _parentid = parseInt($stateParams.parent, 10);
          var _categories = [];
          // sorting out the category and sub-category of resource
          LearninglibSDK.getCategories(true).then(function (response) {
            angular.forEach(response.content, function (value) {
              angular.forEach(value.list, function (category) {
                _categories.push(category);
              });
            });
            angular.forEach(_categories, function (category) {
              if (category.id === _parentid) {
                self.parentCategory = category;
              }
            });
          },
          function (error) {
            $log.error(error);
          });
        }
        // load resource
        self.categoryid = parseInt($stateParams.categoryid, 10);
        self.title = $stateParams.title;
        $log.debug("LearninglibSDK getResources called");
        LearninglibSDK.getResources(self.categoryid).then(function (response) {
          self.videos = response.content.videos;
          self.audios = response.content.audios;
          self.documents = response.content.documents;
          $log.debug("LearninglibSDK getResources end");
        },
        function (error) {
          $log.error(error);
        });
      } else {

      }

      /**
       * Add to playlist function
      */
      self.onAddToPlaylist = function onAddToPlaylist(videoId, playlistId, alredyIn) {
        if (alredyIn) {
          PlaylistSDK.deleteResource(playlistId, videoId).then(function (response) {
            $log.debug(response);
            alertify.success("Resource removed from playlist");
            // getLearningLibrary();

            if (self.video) {
              for (var p1 = 0; p1 < self.video.playlist.length; p1++) {
                if (self.video.playlist[p1] === playlistId) {
                  self.video.playlist.splice(p1, 1);
                }
              }
            } else {
              for (var v = 0; v < self.videos.length; v++) {
                if (self.videos.id === videoId) {
                  for (var p2 = 0; p2 < self.videos[v].playlist.length; p2++) {
                    if (self.videos[v].playlist[p2] === playlistId) {
                      self.videos[v].playlist.splice(p2, 1);
                    }
                  }
                }
              }
            }
          },
          function (error) {
            $log.error(error);
          });
        } else {
          PlaylistSDK.addResource(playlistId, videoId).then(function (response) {
            $log.debug(response);
            alertify.success("Resource added to playlist");
            // getLearningLibrary();

            if (self.video) {
              if (angular.isDefined(self.video.playlist)) {
                self.video.playlist.push(playlistId);
              } else {
                self.video.playlist = [playlistId];
              }
            } else {
              for (var v = 0; v < self.videos.length; v++) {
                if (self.videos.id === videoId) {
                  self.videos.playlist.push(playlistId);
                }
              }
            }
          },
          function (error) {
            $log.error(error);
          });
        }
      };

      self.onSearch = function onSearch(query) {
        var filter = $q.defer();
        if (self.searching) {

        } else {
          self.searching = true;
          LearninglibSDK.lookUp(query).then(function (response) {
            self.dropdownItems = angular.fromJson(response.content);
            $log.debug(self.dropdownItems);
            filter.resolve(self.dropdownItems);
            self.searching = false;
          },
          function (error) {
            $log.error(error);
            self.searching = false;
          });
        }
        return filter.promise;
      };

      self.onNewPlaylistClicked = function onNewPlaylistClicked() {
        self.isProcessing = true;
        PlaylistSDK.createList(self.playlistName).then(function () {
          self.isProcessing = false;
          alertify.success("New playlist created");
          angular.element('#createPlaylist').modal('hide');
          // $timeout(function () {
          //   $state.go('playlist');
          // }, 200);
          self.playlistName = null;
        },
        function (error) {
          $scope.error = {
            message: error.error
          };
          $log.error(error);
          self.isProcessing = false;
        });
      };

      self.onDocumentItemClicked = function onDocumentItemClicked(index) {
        self.selectedDocument = self.documents[index];
        // self.selectedDocument.fullPath = $sce.trustAsResourceUrl('https://docs.google.com/gview?url=https:' + self.selectedDocument.path + '&embedded=true');
        self.selectedDocument.fullPath = 'https:' + self.selectedDocument.path;
      };

      self.stopPlayer = function stopPlayer() {
        $scope.$evalAsync(function () {
          self.selectedDocument = false;
          if (self.videos.length > 0) {
            self.videoPlayerControls.stop();
          }
          if (self.audios.length > 0) {
            self.audioPlayerControls.stop();
          }
        });
      };
    }
  });
