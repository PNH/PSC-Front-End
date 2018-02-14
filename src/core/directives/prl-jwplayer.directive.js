angular
  .module('core.directive')
  .directive('prlJwplayer',
    function ($log, $compile, $window) {
      return {
        restrict: 'E',
        scope: {
          jwPlayerId: '=',
          jwPlayerControls: '='
        },
        // bindToController: true,
        // controllerAs: 'jwPlayerCtrl',
        // template: '<div id="prl-jwplayer"></div>',
        link: function link(scope, element) {
          var _id = scope.jwPlayerId;
          $log.debug("init player " + _id);
          var jwplayer = angular.element('<div id="' + _id + '"></div>');
          element.append(jwplayer);
          $compile(jwplayer)(scope);

          var playerInstance = $window.jwplayer(_id) || {};
          scope.player = playerInstance;
        },
        controller: function ($scope) {
          if ($scope) {
            $scope.internalControl = $scope.jwPlayerControls || {};

            $scope.internalControl.playLink = function (link) {
              $scope.player.setup({
                file: link,
                autostart: true,
                mute: true // optional, but recommended
              });

              bindReady();
              bindError();
              bindComplete();
            };

            $scope.internalControl.play = function (item) {
              $scope.player.setup(item);

              bindReady();
              bindPlay();
              bindPause();
              bindError();
              bindComplete();
            };

            $scope.internalControl.addPlaylist = function (items) {
              $scope.player.setup(items[0]);
              $scope.player.load(items);

              bindReady();
              bindPlay();
              bindPause();
              bindError();
              bindComplete();
              bindPlaylistReady();
              bindPlaylistItemChange();
              bindPlaylistCompleted();
            };

            $scope.internalControl.playAtIndex = function (index) {
              $scope.player.playlistItem(index);
            };

            $scope.internalControl.pause = function () {
              $scope.player.pause();
            };

            $scope.internalControl.stop = function () {
              $scope.player.stop();
            };

            $scope.internalControl.remove = function () {
              $scope.player.remove();
            };
          }
          // private
          function bindReady() {
            $scope.player.on('ready', function (time) {
              $log.debug("JW Player ready");
              $log.debug(time);
              $scope.internalControl.ready(time);
            });
          }

          function bindError() {
            $scope.player.on('setupError', function (message) {
              $log.log("setupError");
              $log.log(message);
              $scope.internalControl.onError(message);
            });
          }

          function bindComplete() {
            $scope.player.on('complete', function () {
              $scope.internalControl.complete();
            });
          }

          function bindPlaylistReady() {
            $scope.player.on('playlist', function (items) {
              $scope.internalControl.playlistReady(items);
            });
          }

          function bindPlaylistItemChange() {
            $scope.player.on('playlistItem', function (item) {
              $scope.internalControl.playlistItemChange(item);
            });
          }

          function bindPlaylistCompleted() {
            $scope.player.on('playlistComplete', function () {
              $scope.internalControl.playlistCompleted();
            });
          }

          function bindPlay() {
            $scope.player.on('play', function () {
              $scope.internalControl.playStarted();
            });
          }

          function bindPause() {
            $scope.player.on('pause', function () {
              $scope.internalControl.playPaused();
            });
          }
        }
      };
    });
