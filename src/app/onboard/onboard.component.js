angular
  .module('app')
  .component('onbaordCom', {
    templateUrl: 'app/onboard/template/onboard.html',
    // controllerAs: 'home',
    controller: function ($rootScope, $scope, $log, $state, $transitions, GoalSDK, IssueSDK, SETTINGS, LevelSDK, LessonSDK, SavvySDK, OnbaordSDK, $sce, MetaSDK, $window, MembershipSDK, UserSDK, HorseSDK, alertify) {
      // controller core -->
      var self = this;
      self.maxAge = 35;
      self.baseUrl = SETTINGS.BASE_URL;
      self.state = $state.current.name;
      self.loggedIn = false;
      self.goalBussy = false;
      // https://scotch.io/tutorials/angularjs-multi-step-form-using-ui-router
      // we will store all of our form data in this object
      self.allissues = [];
      self.emailExists = false;
      self.emailChecking = false;
      self.resources = null;
      $scope.formData = {
        goal: null,
        commonissues: null,
        otherissues: null,
        user: {email: null, name: null, ridestyle: "-1"},
        horse: {name: null, gender: "-1", age: "-1"}
      };
      self.isProcessing = false;

      initHintPopup();
      // $scope.playlistConfig = {
      //   autoHideScrollbar: false,
      //   setHeight: 371,
      //   scrollInertia: 0,
      //   axis: 'y',
      //   advanced: {
      //     updateOnContentResize: true
      //   },
      //   scrollButtons: {
      //     scrollAmount: 'auto', // scroll amount when button pressed
      //     enable: true // enable scrolling buttons by default
      //   }
      // };
      // https://developer.jwplayer.com/jw-player/docs/developer-guide/customization/configuration-reference/#setup
      // http://www.3playmedia.com/how-it-works/how-to-guides/jw-player/
      self.selectedVideoIndex = -1;
      // callback method is used to update the wizard tab selection
      $transitions.onSuccess({}, function () {
        self.state = $state.current.name;
        if (self.state === 'onboard.comissues') {
          emitHorseInfo();
        }
        angular.element('body, html').animate({scrollTop: 0}, 0);
      });
      $scope.$on('ng-jwplayer-ready', function (event, args) {
        $log.info('Player' + args.playerId + 'Ready.');
        // Get player from service
        // var player = jwplayerService.myPlayer[args.playerId];
      });
      // controller core end <--
      self.user = UserSDK.getUser();
      if (self.user) {
        self.loggedIn = true;
        $scope.formData.user.email = self.user.email;
      }

      self.goalBussy = true;
      GoalSDK.getGoals(true).then(function (response) {
        self.goals = response.content;
        OnbaordSDK.getTempOnboard(true).then(function (response) {
          $scope.formData = response;
          if ($scope.formData.goal !== null) {
            angular.forEach(self.goals, function (goal) {
              if ($scope.formData.goal === goal.id) {
                setCurrentGoal(goal);
                // self.onGoalClicked(index);
              }
            });
          }
        },
        function (error) {
          $log.debug(error);
          if ($scope.formData.goal === null) {
            $state.go('onboard.goals');
          }
        });
        self.goalBussy = false;
      }, function (error) {
        $scope.$emit(SETTINGS.NOTIFICATION.GLOBAL, {type: 0, message: error});
        self.goalBussy = false;
      });

      LevelSDK.getLevels(true).then(function (response) {
        self.levels = response.content;
      });

      MetaSDK.getUserMeta(true).then(function (response) {
        self.rideStyles = response.content.ridingStyle;
      });

      // on next
      self.onNextClicked = function onNextClicked() {
        $log.debug("onNextClicked");
        $log.debug($scope.formData);
        OnbaordSDK.setTempOnboard($scope.formData, true).then(function (data) {
          $log.debug(data);
        });
        initHintPopup();
      };

      self.onEmailValidateCheck = function onEmailValidateCheck() {
        if ($scope.formData.user.email) {
          self.emailChecking = true;
          MembershipSDK.isEmailExist($scope.formData.user.email).then(function (response) {
            self.emailExists = response.content.exist;
            self.emailChecking = false;
          },
          function (error) {
            $log.error(error);
            self.emailChecking = false;
          });
        }
      };

      // goals form
      self.onGoalClicked = function onGoalClicked(index) {
        var goal = self.goals[index];
        // $scope.formData.goal = goal.id;
        // self.goal = goal;
        self.allissues = [];
        $scope.formData.commonissues = null;
        $scope.formData.otherissues = null;
        // // get all savvies of the system
        // SavvySDK.getSavvies().then(function (data) {
        //   $log.debug(data);
        // });

        // get issues related to the selected goal
        setCurrentGoal(goal);
      };

      // common issues form
      self.onComIssuesNextClicked = function onComIssuesNextClicked() {
        self.onNextClicked();
        processIssues();
      };

      // sample lesson form
      self.onPlayItemClicked = function onPlayItemClicked(videoIndex) {
        self.selectedVideoIndex = videoIndex;
        playVideoAtIndex(videoIndex, true);
      };

      self.onIssueItemChecked = function onIssueItemChecked() {
        processIssues();
      };

      // submit
      self.onSubmitFormClicked = function onSubmitFormClicked() {
        self.isProcessing = true;
        var postdata = makePostObj();
        // if (postdata.user !== null && postdata.horse !== null) {
        if (postdata !== null && postdata.issues !== null) {
          OnbaordSDK.setOnboard(postdata, true).then(function (response) {
            $log.debug(response);
            OnbaordSDK.removeTempOnboard();
            if (self.loggedIn) {
              var _horseId = parseInt(response.content, 10);
              setCurrentHorse(_horseId);
              // $window.location = "#/dashboard/" + _horseId;
              $state.go('dashboard', {horseid: _horseId});
              self.isProcessing = false;
            } else {
              // $scope.$emit(SETTINGS.NOTIFICATION.GLOBAL, {type: 1, message: 'You\'ve successfully on-board with Parelli Training Program!'});
              // $window.location = "#/membertype";
              $state.go('membertype');
              self.isProcessing = false;
            }
          },
          function (error) {
            $log.error(error);
            $scope.$emit(SETTINGS.NOTIFICATION.GLOBAL, {type: 0, message: 'Parelli Training Program onboarding process failed.'});
            self.isProcessing = false;
          });
        }
      };
      // self.onIssueCategoryTabClicked = function onIssueCategoryTabClicked(event) {
      //   // $log.debug(event);
      //   // $log.debug(jQuery(event.srcElement).val());
      //   // $(event).toolbar(scope.$eval(attrs.toolbarTip));
      //   // event.currentTarget.tab('show');
      //   // jQuery('#tab2').addClass('active');
      //   // $(event.srcElement).tab('show');
      //   // angular.element(event.srcElement).scope().tab('show');
      //   // event.srcElement.scope().tab('show');
      //   // angular.element(event).tab('show');
      // };

      // private
      function setCurrentGoal(goal) {
        $scope.formData.goal = goal.id;
        self.goal = goal;
        getIssues(goal.id);
        getSampleLesson(goal.id);
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
          processIssues();
        });
      }

      function getSampleLesson(goalid) {
        LessonSDK.getSampleLesson(goalid).then(function (response) {
          self.lesson = response.content;
          self.resources = self.lesson.videos.concat(self.lesson.audios);
          self.lesson.description = $sce.trustAsHtml(self.lesson.description);
          if (angular.isDefined(self.lesson.videos[0])) {
            playVideoAtIndex(0);
          }
        },
        function (error) {
          $log.debug(error);
        });
      }

      function processIssues() {
        self.allissues = [];
        if ($scope.formData.commonissues) {
          angular.forEach($scope.formData.commonissues, function (value, key) {
            if (value) {
              self.allissues.push(self.commonissues[key]);
            }
          });
        }

        if ($scope.formData.otherissues) {
          angular.forEach($scope.formData.otherissues, function (value1, key1) {
            angular.forEach(value1, function (value2, key2) {
              if (value2) {
                self.allissues.push(self.otherissues[key1].issues[key2]);
              }
            });
          });
        }
      }

      function makePostObj() {
        var issueids = [];
        angular.forEach(self.allissues, function (issue) {
          issueids.push(issue.id);
        });

        var _rideStyle = restIfDefault($scope.formData.user.ridestyle, '-1');
        var _gender = restIfDefault($scope.formData.horse.gender, '-1');
        var _age = restIfDefault($scope.formData.horse.age, '-1');
        var post = {
          user: {
            email: $scope.formData.user.email,
            name: $scope.formData.user.name,
            ridingStyle: _rideStyle
          },
          horse: {
            name: $scope.formData.horse.name,
            breed: $scope.formData.horse.breed,
            age: _age,
            sex: _gender
          },
          goal: self.goal.id,
          issues: issueids
        };

        if (self.loggedIn) {
          post.user.email = $scope.formData.user.email;
        }
        if ($scope.formData.user.email === null) {
          post.user = null;
        }
        if ($scope.formData.horse.name === null) {
          post.horse = null;
        }
        if (issueids.length <= 0) {
          post.issues = null;
        }
        return post;
      }

      function restIfDefault(value, defaultValue) {
        var _obj = null;
        if (value === defaultValue) {
          _obj = null;
        } else {
          _obj = value;
        }
        return _obj;
      }

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

      function emitHorseInfo() {
        if (angular.isDefined($scope.formData.horse.name) && $scope.formData.horse.name !== null) {
          $scope.$emit(SETTINGS.NOTIFICATION.HORESEY, {type: 1, message: $scope.formData.horse.name});
        }
      }

      function setCurrentHorse(horseId) {
        HorseSDK.getHorses().then(function (response) {
          $log.debug(response);
          $log.debug("new horse " + horseId);
          angular.forEach(response.content, function (horse) {
            if (horseId === horse.id) {
              $log.debug("current horse updated");
              var _currentHorse = horse;
              HorseSDK.setCurrentHorse(_currentHorse);
              $rootScope.$broadcast(SETTINGS.NOTIFICATION.NEWHORSE, {type: 1, message: 'You\'ve successfully on-board with Parelli Training Program!'});
            }
          });
        },
        function (error) {
          alertify.error("Failed to set the current Horse");
          $log.error(error);
        });
      }

      // function to process the form
      $scope.onSubmit = function () {
        // alert('awesome!');
      };

      function initHintPopup() {
        angular.element(function () {
          angular.element('[data-toggle="popover"]').popover();
        });

        angular.element('body').bind('click', function (e) {
          if (angular.element(e.target).data('toggle') !== 'popover' && angular.element(e.target).parents('.popover.in').length === 0) {
            angular.element('[data-toggle="popover"]').popover('hide');
          }
        });
      }
    }
  });
