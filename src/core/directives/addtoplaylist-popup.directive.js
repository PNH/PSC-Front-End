angular
  .module('core.directive')
  .directive('addToPlaylist',
    function ($log) {
      return {
        restrict: 'E',
        scope: {
          show: '=',
          addToPlaylist: '=',
          userPlaylists: '=',
          popupToggle: '='
        },
        templateUrl: 'core/directives/templates/addtoplaylist-popup.html',
        controllerAs: 'addToPlaylistCtrl',
        controller: function ($log, $scope, PlaylistSDK, alertify) {
          $scope.isProcessing = false;
          $scope.createPlaylistToggle = false;

          $scope.onNewPlaylistCreateClicked = onNewPlaylistCreateClicked;
          $scope.toggleCreatePlaylist = toggleCreatePlaylist;

          /**
           * Get user playlist
           */
          function getUserPlaylist() {
            PlaylistSDK.getLists().then(function (response) {
              $scope.userPlaylist = response.content;
              $scope.playlists = response.content;
            }, function (error) {
              $scope.userPlaylist = [];
              $log.error(error);
            });
          }
          getUserPlaylist();

          /**
           * Create new playlist function
           */
          function onNewPlaylistCreateClicked(value) {
            $scope.isProcessing = true;
            PlaylistSDK.createList(value).then(function () {
              $scope.isProcessing = false;
              alertify.success("New playlist created");
              getUserPlaylist();
              $scope.createPlaylistToggle = false;
              $scope.playlistName = '';
            }, function (error) {
              $scope.error = {
                message: error.error
              };
              $log.error(error);
              $scope.isProcessing = false;
            });
          }

          function toggleCreatePlaylist() {
            $scope.createPlaylistToggle = !$scope.createPlaylistToggle;
          }
        },
        link: function postLink(scope, elem) {
          scope.playlists = null;
          scope.video = null;
          scope.videoPlaylists = null;

          if (scope.userPlaylists) {
            scope.playlists = scope.userPlaylists;
          }

          elem.find('#atp-close').on('click', function () {
            elem.find('.add-to-playlist__bg').fadeOut('fast');
            angular.element('body').removeClass('unscrollable');
          });

          elem.find('#atp-close-bg').on('click', function (event) {
            if (event.target === elem.find('.add-to-playlist__bg')[0]) {
              elem.find('.add-to-playlist__bg').fadeOut('fast');
              angular.element('body').removeClass('unscrollable');
            }
          });

          scope.show = function (video, videoPlaylist) {
            scope.video = video;
            $log.debug(videoPlaylist);
            elem.find('.add-to-playlist__bg').fadeIn('fast');
            angular.element('body').addClass('unscrollable');
          };

          scope.addVideo = function (vid, pid, alredyAdded) {
            scope.addToPlaylist(vid, pid, alredyAdded);
          };
        }
      };
    });
