angular
  .module('app')
  .component('pathwayCom', {
    templateUrl: 'app/pathway/template/pathway.html',
    // controllerAs: 'home',
    controller: function ($scope, $log, $state, $stateParams, $window, $timeout, $sce, HorseSDK, UserSDK, LessonSDK, blockUI) {
      //
      var self = this;
      const savvyload = blockUI.instances.get('savvystatusLoading');
      const lessonsload = blockUI.instances.get('lessonsLoading');
      self.horseid = null;
      self.level = null;
      self.pathway = [];
      self.pathwayBusy = false;
      self.reachedEnd = false;
      var _lastLessongCategoryId = 0;
      var _currentPageIndex = 0;
      self.lessons = [];
      self.lessonCategory = null;
      const _pagingLimit = 5;
      self.selector = {};
      //
      if (angular.isDefined($stateParams.horseid)) {
        self.horseid = parseInt($stateParams.horseid, 10);
        // get horse savvy levels
        savvyload.start();
        HorseSDK.getSavvyStatus(self.horseid, true).then(function (response) {
          self.levels = response.content;
          angular.forEach(self.levels, function (level) {
            if (angular.isDefined($stateParams.levelid)) {
              var _lvlid = parseInt($stateParams.levelid, 10);
              if (level.level.id === _lvlid) {
                self.level = level.level;
              }
            } else if (level.isLastCompletedLevel === true) {
              // looking for the last completed level, and trying to load it
              self.level = level.level;
              _lastLessongCategoryId = level.lastCompletedLessonCategory;
            } else {
              // if no last completed level found, use something default
              self.level = self.levels[0].level;
              $state.go('pathway', {horseid: self.horseid, levelid: self.level.id});
              // $window.location = '#/pathway/' + self.horseid + '?levelid=' + self.level.id;
            }
          });

          self.selector.title = self.level.title + " - Topics";
          // get lesson categories for that level
          loadLessonCategories(self.level.id, self.horseid);
          loadPathway(self.horseid, self.level.id, _pagingLimit, false);
          savvyload.stop();
        },
        function (error) {
          $log.error(error);
          savvyload.stop();
        });
      }

      // events
      self.hitBottom = function () {
        if (self.level) {
          loadPathway(self.horseid, self.level.id, _pagingLimit, false);
        }
      };

      self.onLessonCategoryClicked = function onLessonCategoryClicked(index) {
        self.lessons = [];
        self.lessonCategory = self.pathway[index];
        // id correction due to server response
        self.lessonCategory.id = self.lessonCategory.lessonCategory;
        loadLessons(self.lessonCategory.lessonCategory, self.level.id);
      };

      self.onQuickSelectionClicked = function onQuickSelectionClicked(index) {
        self.lessons = [];
        self.lessonCategory = self.lessonsCategories[index];
        var _extraToGo = _lastLessongCategoryId - self.lessonCategory.id;
        loadLessons(self.lessonCategory.id, self.level.id);
        if (_extraToGo > 0) {
          loadPathway(self.horseid, self.level.id, (_pagingLimit + _extraToGo + 1), false);
        }
      };

      self.onLessonClicked = function onLessonClicked(id) {
        var _lesson = null;
        angular.forEach(self.lessons, function (lesson) {
          if (lesson.id === id) {
            _lesson = lesson;
          }
        });
        if (_lesson) {
          angular.element('#myModal').modal('hide');
          $timeout(function () {
            self.hitBottom = null;
            $state.go('lesson', {horseid: self.horseid, lessonid: _lesson.id, category: self.lessonCategory.id, level: self.level.id});
            // $window.location = '#/lesson/' + self.horseid + '/' + _lesson.id + "?category=" + self.lessonCategory.id + "&level=" + self.level.id;
          }, 500);
        }
      };

      // private
      function loadPathway(horseId, levelId, limit, jump) {
        if (self.pathwayBusy || self.reachedEnd) {
          return;
        }
        if (jump) {
          self.pathway = [];
        }
        self.pathwayBusy = true;
        HorseSDK.getPathway(horseId, levelId, _currentPageIndex, limit, false).then(function (response) {
          angular.forEach(response.content.data, function (category) {
            category.description = $sce.trustAsHtml(category.description);
            self.pathway.push(category);
            _lastLessongCategoryId = category.lessonCategory;
          });
          if (response.content.data.length === 0) {
            self.reachedEnd = true;
          }
          _currentPageIndex = response.content.start_index + limit;
          self.pathwayBusy = false;
        },
        function (error) {
          $log.error(error);
          self.pathwayBusy = false;
        });
      }

      function loadLessonCategories(levelId, horseId) {
        LessonSDK.getCategories(levelId, horseId, true).then(function (response) {
          $log.debug(response);
          self.lessonsCategories = response.content;
          self.selector.data = self.lessonsCategories;
        },
        function (error) {
          $log.error(error);
        });
      }

      function loadLessons(categoryId, levelId) {
        lessonsload.start();
        LessonSDK.getLessons(categoryId, levelId, false).then(function (response) {
          self.lessons = response.content;
          lessonsload.stop();
        },
        function (error) {
          $log.error(error);
          lessonsload.stop();
        });
      }
    }
  });
