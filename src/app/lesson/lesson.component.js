angular
  .module('app')
  .component('lessonCom', {
    templateUrl: 'app/lesson/template/lesson.html',
    controller: function ($log, $state, $stateParams, $scope, $sce, $window, $timeout, LessonSDK, alertify) {
      var self = this;
      self.horseid = null;
      self.lesson = null;
      self.lessonCategory = null;
      self.playerOptions = {
        title: null,
        height: "100%",
        width: "100%",
        type: 'mp4',
        image: null
      };
      self.selectedVideoIndex = -1;
      self.isLessonCompleted = false;
      self.lessons = [];
      self.selector = {};
      self.categoryId = null;
      self.levelId = null;
      self.resources = null;
      self.selectedDocument = null;
      // controller core -->
      if (angular.isDefined($stateParams.horseid) && angular.isDefined($stateParams.lessonid)) {
        var _horseid = parseInt($stateParams.horseid, 10);
        var _lessonid = parseInt($stateParams.lessonid, 10);
        self.horseid = _horseid;
        LessonSDK.getLesson(_horseid, _lessonid).then(function (response) {
          $log.debug(response);
          self.lesson = response.content;
          self.lesson.description = $sce.trustAsHtml(self.lesson.description);
          self.lesson.objective = $sce.trustAsHtml(self.lesson.objective);
          self.isLessonCompleted = self.lesson.lessonCompleted;
          self.resources = self.lesson.videos.concat(self.lesson.audios);
          if (angular.isDefined(self.lesson.videos[0])) {
            playVideoAtIndex(0);
          }
        },
        function (error) {
          $log.error(error);
        });

        if (angular.isDefined($stateParams.category) && angular.isDefined($stateParams.level)) {
          self.categoryId = parseInt($stateParams.category, 10);
          self.levelId = parseInt($stateParams.level, 10);
          LessonSDK.getLessons(self.categoryId, self.levelId, false).then(function (response) {
            self.lessons = response.content;
            self.selector.data = self.lessons;
          },
          function (error) {
            $log.error(error);
          });

          LessonSDK.getCategories(self.levelId, self.horseid, true).then(function (response) {
            angular.forEach(response.content, function (category) {
              if (category.id === self.categoryId) {
                self.lessonCategory = category;
                self.selector.title = self.lessonCategory.title;
              }
            });
          },
          function (error) {
            $log.error(error);
          });
        }
      }
      // events
      $scope.$on('ng-jwplayer-ready', function (event, args) {
        $log.info('Player' + args.playerId + 'Ready.');
        // Get player from service
        // var player = jwplayerService.myPlayer[args.playerId];
      });

      self.onPlayItemClicked = function onPlayItemClicked(videoIndex) {
        self.selectedVideoIndex = videoIndex;
        playVideoAtIndex(videoIndex, true);
      };

      self.onCompleteLessonChecked = function onCompleteLessonChecked() {
        alertify.okBtn("yes").cancelBtn("no").confirm("Are you sure the lesson is complete?", function (ev) {
          ev.preventDefault();
          LessonSDK.completeLesson(self.lesson.id, self.horseid, true).then(function (response) {
            if (response.content) {
              self.isLessonCompleted = true;
              alertify.success("You've successfully completed the lesson!");
            } else {
              alertify.error("Failed to complete the lesson");
              self.isLessonCompleted = false;
            }
          },
          function (error) {
            alertify.error(error.message);
          });
        }, function (ev) {
          self.isLessonCompleted = false;
          ev.preventDefault();
          $scope.$apply();
        });
      };

      self.onQuickSelectionClicked = function onQuickSelectionClicked(index) {
        var _lesson = self.lessons[index];
        $state.go('lesson', {horseid: self.horseid, lessonid: _lesson.id, category: self.categoryId, level: self.levelId});
        // $window.location = '#/lesson/' + self.horseid + '/' + _lesson.id + "?category=" + self.categoryId + "&level=" + self.levelId;
      };

      // private
      function playVideoAtIndex(index, autoplay) {
        autoplay = angular.isUndefined(autoplay) ? false : autoplay;
        self.selectedVideoIndex = index;
        var video = self.lesson.videos[index];
        self.playerOptions = {
          title: video.name,
          image: video.thumbnail,
          autostart: autoplay,
          duration: video.duration
        };
        var _path = "https:" + video.path;
        $log.debug(_path);
        self.videoFile = $sce.trustAsResourceUrl(_path);
      }

      self.onDocumentItemClicked = function onDocumentItemClicked(index) {
        self.selectedDocument = self.lesson.documents[index];
        // self.selectedDocument.fullPath = $sce.trustAsResourceUrl('https://docs.google.com/gview?url=https:' + self.selectedDocument.path + '&embedded=true');
        self.selectedDocument.fullPath = 'https:' + self.selectedDocument.path;
      };

      self.stopPlayer = function stopPlayer() {
        $scope.$evalAsync(function () {
          self.selectedDocument = false;
        });
      };

      $timeout(function () {
        // self.contentHeight = angular.element('.view-more__content').offsetHeight;
        // $log.log("view-more__content : " + self.contentHeight);
        // angular.element(lesson-content);
      }, 2000);
    }
  });
