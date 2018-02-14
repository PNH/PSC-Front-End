angular
  .module('app')
  .component('learningLibCategoryCom', {
    templateUrl: 'app/learninglibrary/template/categories.html',
    controller: function ($scope, $state, $log, $q, $timeout, LearninglibSDK, PlaylistSDK, alertify, blockUI) {
      var self = this;
      const featuredload = blockUI.instances.get('featuredLoading');
      const categoriesload = blockUI.instances.get('categoriesloading');
      self.featured = null;
      self.categories = null;
      self.selectedDropdownItem = null;
      self.dropdownItems = [];
      $scope.query = self.selectedDropdownItem;
      self.searching = false;
      self.addtoplaylistPopupClicked = false;
      //
      // get featured
      featuredload.start();
      LearninglibSDK.getFeatured(true).then(function (response) {
        self.featured = response.content;
        featuredload.stop();
      },
      function (error) {
        $log.error(error);
        featuredload.stop();
      });
      // get categories
      categoriesload.start();
      LearninglibSDK.getCategories(true).then(function (response) {
        self.categories = response.content;
        categoriesload.stop();
      },
      function (error) {
        $log.error(error);
        categoriesload.stop();
      });

      // events
      self.onCategoryClicked = function onCategoryClicked(categoryIndex, subcategoryIndex) {
        angular.forEach(self.categories, function (value, key) {
          if (categoryIndex === key) {
            var _subcategory = value.list[subcategoryIndex];
            if (_subcategory.hasChildern) {
              $state.go('library-subcategories', {categoryid: _subcategory.id});
            } else {
              $state.go('library-detail', {categoryid: _subcategory.id});
            }
          }
        });
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

      self.onVideoItemClicked = function onVideoItemClicked(index) {
        self.selectedVideo = self.featured[index];
      };

      self.stopPlayer = function stopPlayer() {
        $scope.$evalAsync(function () {
          self.selectedVideo = false;
        });
      };

      /**
       * Get user playlist
      */
      function getUserPlaylist() {
        PlaylistSDK.getLists().then(function (response) {
          self.userPlaylist = response.content;
        },
        function (error) {
          self.userPlaylist = [];
          $log.error(error);
        });
      }
      getUserPlaylist();

      /**
       * Trigger user playlist
      */
      self.triggerUserPlaylist = function triggerUserPlaylist(video, videoPlaylist) {
        self.addtoplaylistPopupClicked = true;
        $timeout(function () {
          self.triggerCtrl(video, videoPlaylist);
        }, 100);
      };

      /**
       * Add to playlist function
      */
      self.onAddToPlaylist = function onAddToPlaylist(videoId, playlistId, alredyIn) {
        if (alredyIn) {
          PlaylistSDK.deleteResource(playlistId, videoId).then(function (response) {
            $log.debug(response);
            alertify.success("Resource removed from playlist");

            for (var v = 0; v < self.featured.length; v++) {
              if (self.featured[v].id === videoId) {
                for (var p = 0; p < self.featured[v].playlist.length; p++) {
                  if (self.featured[v].playlist[p] === playlistId) {
                    self.featured[v].playlist.splice(p, 1);
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

            for (var v = 0; v < self.featured.length; v++) {
              if (self.featured[v].id === videoId) {
                self.featured[v].playlist.push(playlistId);
              }
            }
          },
          function (error) {
            $log.error(error);
          });
        }
      };

      /**
       * Create new playlist function
      */
      self.onNewPlaylistClicked = function onNewPlaylistClicked() {
        self.isProcessing = true;
        PlaylistSDK.createList(self.playlistName).then(function () {
          self.isProcessing = false;
          alertify.success("New playlist created");
          angular.element('#createPlaylist').modal('hide');
          // $timeout(function () {
          //   $state.go('playlist');
          // }, 200);
        },
        function (error) {
          $scope.error = {
            message: error.error
          };
          $log.error(error);
          self.isProcessing = false;
        });
      };
    }
  });
