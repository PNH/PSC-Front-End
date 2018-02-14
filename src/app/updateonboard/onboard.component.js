angular
  .module('app')
  .component('updateOnboardCom', {
    templateUrl: 'app/updateonboard/template/onboard.html',
    controller: function ($rootScope, $scope, $log, $state, $transitions, GoalSDK, IssueSDK, SETTINGS, LevelSDK, LessonSDK, SavvySDK, OnbaordSDK, $sce, MetaSDK, $window, MembershipSDK, UserSDK, HorseSDK, alertify) {
      var self = this;
      self.state = $state.current.name;
      self.goalBussy = false;
      self.allissues = [];
      self.selectedIssues = [];
      self._horseId = HorseSDK.getCurrentHorse().id;
      $scope.formData = {
        goal: null,
        commonissues: null,
        otherissues: null
      };
      self.isProcessing = false;
      self.userSelectedGoal = null;
      self.previouslySelectedOnboard = null;

      if (self.state === 'updateOnboard.comissues' && !self.allissues.length > 0) {
        $state.go('updateOnboard.goals');
      }

      self.user = UserSDK.getUser();

      self.goalBussy = true;
      GoalSDK.getGoals(false).then(function (response) {
        self.goals = response.content;
        self.goalBussy = false;
        return OnbaordSDK.getIssues(self._horseId, false);
      }, function (error) {
        $scope.$emit(SETTINGS.NOTIFICATION.GLOBAL, {
          type: 0,
          message: error
        });
        self.goalBussy = false;
      }).then(function (response) {
        self.previouslySelectedOnboard = response.content;
        self.userSelectedGoal = response.content.goal;
        if (self.userSelectedGoal) {
          setCurrentGoal(self.userSelectedGoal);
        }
      });

      LevelSDK.getLevels(true).then(function (response) {
        self.levels = response.content;
      });

      self.onNextClicked = function onNextClicked() {
        // self.selectedIssues = [];
        OnbaordSDK.setTempOnboard($scope.formData, false).then(function (data) {
          $log.debug(data);
        });
      };

      // goals form
      self.onGoalClicked = function onGoalClicked(index) {
        var goal = self.goals[index];
        self.allissues = [];
        $scope.formData.commonissues = null;
        $scope.formData.otherissues = null;
        setCurrentGoal(goal);
      };
      self.onComIssuesNextClicked = function onComIssuesNextClicked() {
        self.onNextClicked();
      };
      self.submitClicked = submitClicked;
      self.clearSelectedIssues = clearSelectedIssues;

      // private
      function setCurrentGoal(goal) {
        $scope.formData.goal = goal.id;
        self.goal = goal;
        self.selectedIssues = [];
        if (self.previouslySelectedOnboard.goal) {
          if (self.goal.id === self.previouslySelectedOnboard.goal.id) {
            self.selectedIssues = constructUserSelectedIssues(self.previouslySelectedOnboard.issues);
          }
        }
        getIssues(goal.id);
      }

      function getIssues(goalid) {
        IssueSDK.getIssues(goalid).then(function (response) {
          self.otherissues = [];
          angular.forEach(response.content, function (result) {
            if (result.title === 'Common') {
              self.commonissues = result.issues;
            } else {
              self.otherissues.push(result);
            }
          });
          // processIssues();
        });
      }

      function submitClicked(horseid, issues) {
        self.isProcessing = true;
        var _issues = [];
        angular.forEach(issues, function (val, key) {
          if (val) {
            _issues.push(key);
          }
        });
        OnbaordSDK.saveIssues(horseid, {
          issues: _issues,
          goal: self.goal.id
        }, false).then(function (response) {
          self.isProcessing = false;
          alertify.alert("Your Solutions Map has been updated with your new selections.", function () {
            $state.go('horse', {horseid: horseid});
          });
          $log.log(response);
        }, function (error) {
          self.isProcessing = false;
          $log.error(error);
          alertify.error('Oops! Something went wrong. Please try again later');
        });
      }

      /**
       * Construct selected issues' IDs from user's previously selected issues
       *
       * @param {Array} issues Previously selected issues object array
       * @returns Constructed issues' IDs array
       */
      function constructUserSelectedIssues(issues) {
        var selectedIssues = [];
        angular.forEach(issues, function (issue) {
          selectedIssues[issue.id] = true;
        });
        return selectedIssues;
      }

      /**
       * Clear selected issues
       */
      function clearSelectedIssues() {
        self.selectedIssues = [];
      }
    }
  });
