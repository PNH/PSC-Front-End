angular
  .module('core.directive')
  .directive('prlPlayer',
    function ($log, $window, $timeout) {
      return {
        restrict: 'E',
        scope: {
          videos: '=',
          video: '=',
          numberofplaylistitems: '@',
          userPlaylist: '=',
          template: '@',
          addVideoFn: '=',
          playerControls: '='
        },
        bindToController: true,
        templateUrl: 'core/directives/templates/prl-player.html',
        controllerAs: 'playerCtrl',
        controller: function ($scope, $sce, $timeout, $window, PlaylistSDK, alertify) {
          var self = this;
          self.jwPlayerControls = {};
          self.internalControls = self.playerControls || {};
          self.addtoplaylistPopupClicked = false;

          if (self.video) {
            initPlayer(self.video, 0, false);
          } else {
            initPlayer(self.videos, 0, false);
          }
          $log.log("prl-player self.video");
          $log.log(self.video);
          $log.log("prl-player self.videos");
          $log.log(self.videos);

          /**
           * Select a media
           * @param  {Integer} i Array index of `self.videosList
           */
          self.playMedia = function (i) {
            if (self.videos[i].path === '#error' || self.videos[i].path === '#processing') {
              alertify.okBtn("OK").alert("This resource is unavailable at the moment. Please try again later.");
            } else {
              // self.jwPlayerControls.playAtIndex(i);
              self.selectedVideoIndex = i;
              var media = {
                title: self.videos[i].name,
                height: "100%",
                width: "100%",
                type: 'hls',
                image: self.videos[i].thumbnail,
                autostart: true,
                file: hasHttp(self.videos[i].path),
                duration: self.videos[i].duration,
                hlshtml: true,
                androidhls: true,
                tracks: tempRemoveDefaultFlag(self.videos[i].subtitles)
              };
              self.playerOptions = media;
              $scope.$evalAsync(function () {
                self.jwPlayerControls.play(media);
              });
              $log.debug('Media changed');
              $log.log(media);
            }
          };

          /**
           * Initialize player
           * @param  {Object/Array}  media  Media list or one media resource
           * @param  {Integer}       index  Array index of `self.videosList`
           * @param  {Bool}          autostart  Auto start the video after selection
           */
          function initPlayer(media, index, autostart) {
            self.selectedVideoIndex = index;
            if (angular.isArray(media)) {
              self.selectedVideoIndex = 0;
              var item1 = {
                title: media[0].name,
                height: "100%",
                width: "100%",
                type: 'hls',
                image: media[0].thumbnail,
                autostart: autostart,
                file: hasHttp(media[0].path),
                duration: media[0].duration,
                hlshtml: true,
                androidhls: true,
                tracks: tempRemoveDefaultFlag(media[0].subtitles)
              };
              self.playerOptions = item1;
              $scope.$evalAsync(function () {
                self.jwPlayerControls.play(item1);
              });
              $log.debug('Media initialized');
              $log.log(item1);
            } else {
              var item = {
                title: media.name,
                height: "100%",
                width: "100%",
                type: 'hls',
                image: media.thumbnail,
                autostart: autostart,
                file: hasHttp(media.path),
                duration: media.duration,
                tracks: tempRemoveDefaultFlag(media.subtitles)
              };
              self.playerOptions = item;
              $scope.$evalAsync(function () {
                self.jwPlayerControls.play(item);
              });
            }
          }

          /**
           * Check if URL contains http protocol and add 'https' if not present
           *
           * @param {String} url URL
           * @returns Updated URL
           */
          function hasHttp(url) {
            var http = url.indexOf('http');
            if (http === -1) {
              return 'https:' + url;
            }
            return url;
          }

          /**
           * Generate random ID for JW Player
           */
          self.generateId = function generateId() {
            var id = Math.ceil(Math.random() * 100000);
            self.playerId = 'prlPlayer' + id;
          };

          self.generateId();

          /**
           * Get user playlist
          */
          function getUserPlaylist() {
            PlaylistSDK.getLists().then(function (response) {
              self.userPlaylistPopup = response.content;
            },
            function (error) {
              self.userPlaylistPopup = [];
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
                // getLearningLibrary();

                if (self.video) {
                  for (var p1 = 0; p1 < self.video.playlist.length; p1++) {
                    if (self.video.playlist[p1] === playlistId) {
                      self.video.playlist.splice(p1, 1);
                    }
                  }
                } else {
                  for (var v = 0; v < self.videos.length; v++) {
                    if (self.videos[v].id === videoId) {
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
                    if (self.videos[v].id === videoId) {
                      if (angular.isDefined(self.videos[v].playlist)) {
                        self.videos[v].playlist.push(playlistId);
                      } else {
                        self.videos[v].playlist = (playlistId);
                      }
                    }
                  }
                }
              },
              function (error) {
                $log.error(error);
              });
            }
          };

          /**
           * TEMPORARY method to remove default flag from subtitles
           * DELETE LATER
           * @param {Array} subs Subtitles
           * @returns Subtitles without default flag
           */
          function tempRemoveDefaultFlag(subs) {
            var withoutSubs = [];
            angular.forEach(subs, function (value) {
              withoutSubs.push({file: value.file, kind: value.kind, label: value.label});
            });
            return withoutSubs;
          }

          /**
           * Public API
           */
          self.internalControls.stop = function stop() {
            self.jwPlayerControls.stop();
          };
        },
        link: function postLink(scope, elem) {
          scope.playerCtrl.doneLoading = false;

          function setHeight() {
            // $timeout >>> Microsoft EDGE Playlist thumb height issue
            $timeout(function () {
              var playerContainer = elem.find('.prl__player__player__container');
              var playlistContainer = elem.find('.prl__player__playlist__container');
              var playlistThumb = elem.find('.prl__player__playlist__thumb');
              var userPlaylist = elem.find('.prl__player__playlist__userplaylist');
              var playerHeight = playerContainer.height();

              playlistContainer.css({
                'max-height': playerHeight
              });
              playlistContainer.show();
              var screenWidth = $window.innerWidth;
              if (screenWidth < 500) {
                playlistThumb.each(function () {
                  angular.element(this).height(30);
                });
              } else {
                playlistThumb.each(function () {
                  angular.element(this).height((playerHeight / scope.playerCtrl.numberofplaylistitems) - 4);
                });
              }
              userPlaylist.css({
                'left': playlistThumb.width(),
                'top': playlistThumb.width() - 30,
                'max-height': playerHeight - 50
              });
              hideScrollbar();
            }, 1);
          }

          function hideScrollbar() {
            var scroller = elem.find('.ps-scrollbar-y-rail');
            if (scope.playerCtrl.numberofplaylistitems) {
              if (scope.playerCtrl.videos.length <= scope.playerCtrl.numberofplaylistitems) {
                scroller.hide();
              }
            }
          }

          angular.element(window).on('orientationchange', function () {
            setHeight();
          });

          scope.playerCtrl.jwPlayerControls.ready = function () {
            scope.$evalAsync(function () {
              $log.debug("jwPlayerControls ready called");
              scope.playerCtrl.doneLoading = true;
              $log.debug(scope.playerCtrl.doneLoading);
              // scope.$apply();
              setHeight();
            });
          };
          /**
           * Hide details bar when video starts playing
           */
          scope.playerCtrl.jwPlayerControls.playStarted = function () {
            var detailsBar = elem.find('.prl__player__bottom-bar');
            detailsBar.remove();
            elem.find('.prl-addtoplaylist-icon').css({display: 'none'});
          };
          scope.playerCtrl.jwPlayerControls.playPaused = function () {
            elem.find('.prl-addtoplaylist-icon').css({display: 'block'});
          };
          scope.openUserPlaylists = function (e) {
            angular.element(e.currentTarget).next().slideToggle();
          };
          // scope.playerCtrl.jwPlayerControls.play = function () {
            // console.log("PLAY......");
            // elem.find('.prl-addtoplaylist-icon').css({display: 'none'});
          // };
          // scope.playerCtrl.jwPlayerControls.pause = function () {
            // console.log("pause......");
            // elem.find('.prl-addtoplaylist-icon').css({display: 'block'});
          // };
        }
      };
    });
