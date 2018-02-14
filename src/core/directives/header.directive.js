angular
  .module('core.directive')
  .directive('prlHeader',
    function ($state, $transitions, $log, UserSDK) {
      return {
        restrict: 'E',
        templateUrl: 'core/directives/templates/header.html',
        controller: function ($scope, $rootScope, $window, $timeout, SETTINGS, OnbaordSDK, UserSDK, HorseSDK, MetaSDK, blockUI) {
          var self = this;
          self.user = null;
          self.horsey = false;
          self.loggedIn = false;
          self.horseId = null;
          self.horses = [];
          self.isLargeSearch = true;

          // BlockUI instances
          const customPagesLoad = blockUI.instances.get('customPagesLoading');
          customPagesLoad.start();

          loadUserData();

          // live chat related stuff
          $scope.liveChat = {};

          self.onHorseClicked = function onHorseClicked(horseId) {
            self.horseId = horseId;
            angular.forEach(self.horses, function (horse) {
              if (horse.id === horseId) {
                HorseSDK.setCurrentHorse(horse);
                loadUserData();
              }
            });
          };

          // events
          $transitions.onSuccess({}, function () {
            self.navbarClickCount = 0;
            OnbaordSDK.getTempOnboard(true).then(function (response) {
              if (response.horse) {
                self.horsey = (angular.isDefined(response.horse.name) && response.horse.name !== null) ? response.horse.name : false;
              }
            });
          });

          var loginNoty = $rootScope.$on(SETTINGS.NOTIFICATION.LOGIN, function () {
            loadUserData();
          });
          $rootScope.$on('$destroy', loginNoty);

          var logoutNoty = $scope.$on(SETTINGS.NOTIFICATION.LOGOUT, function () {
            loadUserData();
          });
          $rootScope.$on('$destroy', logoutNoty);

          var newHorseNoty = $scope.$on(SETTINGS.NOTIFICATION.NEWHORSE, function () {
            loadUserData();
          });
          $scope.$on('$destroy', newHorseNoty);

          // private
          function loadUserData() {
            self.user = UserSDK.getUser();
            if (self.user) {
              self.loggedIn = true;

              HorseSDK.getHorses().then(function (response) {
                self.horses = response.content;
                var _horse = HorseSDK.getCurrentHorse();
                if (_horse) {
                  self.horseId = _horse.id;
                } else if (self.horses[0]) {
                  self.horseId = self.horses[0].id;
                }
              }, function (error) {
                $log.error(error);
              });
            } else {
              self.user = null;
              self.horseId = null;
              self.horsey = null;
              self.loggedIn = false;
            }
          }

          /**
           * Gets the more menu items.
           */
          function getMoreMenuItems() {
            MetaSDK.getMenuPages(0, true).then(function (response) {
              self.menuItems = response.content;
              $log.debug(response);
              customPagesLoad.stop();
            }, function (error) {
              $log.error(error);
            });
          }
          getMoreMenuItems();

          // Screen Resize Event
          angular.element($window).bind('resize', checkWhichSeachBlock());

          /**
           * Check Screen Size and Set Visible
           */
          function checkWhichSeachBlock() {
            self.windowWidth = $window.innerWidth;
            if (self.windowWidth > 1070) {
              self.isLargeSearch = true;
            } else {
              self.isLargeSearch = false;
            }
          }
          checkWhichSeachBlock();
        },
        controllerAs: 'headerCtrl',
        link: function postLink(scope) {
          scope.state = $state.current.name;

          /**
           * Add .index class to header on home page
           */
          function bodyClass() {
            self.user = UserSDK.getUser();
            scope.state = $state.current.name;
            // scope.stateHidden = false;
            // if (scope.state === 'onboard' || scope.state === 'onboard.home' || scope.state === 'onboard.goals' || scope.state === 'onboard.horseinfo' || scope.state === 'onboard.comissues' || scope.state === 'onboard.pathway' || scope.state === 'onboard.samplemodule' || scope.state === 'registration' || scope.state === 'registration.userinfo' || scope.state === 'registration.billing' || scope.state === 'registration.creditcard' || scope.state === 'registration.review' || scope.state === 'membertype') {
            //   scope.stateHidden = true;
            // }
            angular.element('body').addClass('body');
            if (scope.state === 'home' || scope.state === 'about' || scope.state === 'contact' || (scope.state === 'blog' || scope.state === 'blogdetail' || scope.state === 'custompage') && self.user === null) {
              angular.element('body').addClass('index');
            } else {
              angular.element('body').removeClass('index');
            }
          }

          /**
           * Add header scroll effect on scroll and window width
           */
          function headerScroll() {
            var header = angular.element('#header');
            scope.state = $state.current.name;

            if (scope.state === "custompage") {
              scope.pageslug = $state.params.pageslug;
              $log.log(scope.pageslug);
            }

            var wWidth = angular.element(window).width();
            header.removeClass('fill');
            
            if (wWidth <= 768 || scope.state !== 'home') {
              header.addClass('fill');
            } else {
              angular.element(window).scroll(function () {
                if (scope.state === 'home') {
                  if (angular.element(this).scrollTop() > 50) {
                    header.addClass('fill');
                  } else {
                    header.removeClass('fill');
                  }
                }
              });
            }
          }

          scope.collapseNavbar = function () {
            angular.element('.navbar-collapse').collapse('hide');
          };

          $transitions.onSuccess({}, function () {
            $log.warn("transitions onSuccess");
            bodyClass();
            headerScroll();
          });
          bodyClass();
          headerScroll();
        }
      };
    });
