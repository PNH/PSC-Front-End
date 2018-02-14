angular
  .module('app')
  .component('sdkTestCom', {
    templateUrl: 'app/tests/template/sdktest.html',
    // controllerAs: 'home',
    controller: function ($scope, $log, moment) {
      var self = this;

      $scope.day = moment('2017-01-23', 'YYYY-MM-DD');
      $log.debug($scope.day);

      $scope.controllers = {};

      $scope.controllers.datePicked = function datePicked(day) {
        $log.debug(day);
      };

      $scope.playerControlls = {};

      $scope.playerControlls.ready = function (time) {
        $log.debug("play ready callback");
        $log.debug(time);
      };

      $scope.playerControlls.onError = function (message) {
        $log.debug("play ready callback");
        $log.debug(message);
      };

      $scope.playerControlls.complete = function () {
        $log.debug("play completed callback");
      };

      $scope.playerControlls.playlistReady = function (items) {
        $log.debug(items);
        $log.debug("play playlistReady callback");
      };

      $scope.playerControlls.playlistItemChange = function (item) {
        $log.debug(item);
        $log.debug("play playlistItemChange callback");
      };

      $scope.playerControlls.playlistCompleted = function () {
        $log.debug("play playlistCompleted callback");
      };

      self.onPlayItemClicked = function onPlayItemClicked(link) {
        var _item = {
          file: link,
          width: 640,
          height: 270,
          autostart: true,
          mute: true // optional, but recommended
        };
        // properties are
        // description[String], mediaid[String], file[String] -> sources[0].file, image[String], preload[String] -> metadata | auto | none, title[String], tracks[Array], sources[Array], allSources[Array]
        // reference: https://developer.jwplayer.com/jw-player/docs/developer-guide/api/javascript_api_reference/#playlist
        $scope.playerControlls.play(_item);
      };

      self.onPlayItemsClicked = function onPlayItemsClicked(link) {
        var _item = {
          file: link,
          width: 640,
          height: 270,
          autostart: true,
          mute: true // optional, but recommended
        };

        var _playlist = [];
        _playlist.push(_item);
        _playlist.push(_item);
        _playlist.push(_item);
        _playlist.push(_item);
        _playlist.push(_item);
        $scope.playerControlls.addPlaylist(_playlist);
      };

      self.onPlaylistItemAtIndex = function onPlaylistItemAtIndex(index) {
        $scope.playerControlls.playAtIndex(index);
      };

      // var playerInstance = $window.jwplayer("player");
      // playerInstance.setup({
      //   file: "http://clips.vorwaerts-gmbh.de/big_buck_bunny.mp4",
      //   width: 640,
      //   height: 270,
      //   autostart: true,
      //   mute: true //optional, but recommended
      // });
      //
      // playerInstance.setVolume(50);
      //
      // playerInstance.on('ready', function(e) {
      //   $log.debug("jwplayer ready");
      // });
      //
      // playerInstance.on('playlistItem', function(e) {
      //   $log.debug("jwplayer playlistItem");
      // });
      //
      // playerInstance.on('playlistComplete', function(e) {
      //   $log.debug("jwplayer playlistComplete");
      // });
      //
      // playerInstance.on('setupError', function(e) {
      //   $log.debug("jwplayer setupError");
      // });
      //
      // playerInstance.on('complete', function(e) {
      //   alert("Volume is changed to: "+ e.volume);
      //   playerInstance.setup({
      //     file: "http://clips.vorwaerts-gmbh.de/big_buck_bunny.mp4",
      //     width: 640,
      //     height: 270,
      //     autostart: true,
      //     mute: true //optional, but recommended
      //   });
      // });
    }
  });
