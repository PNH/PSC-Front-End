angular
  .module('app', ['ui.router', 'filter', 'core.service', 'core.sdk', 'ngAnimate', 'core.directive', 'moment-picker', 'ng-jwplayer', 'blockUI', 'perfect_scrollbar', '720kb.tooltips', 'mgcrea.ngStrap', 'ngAlertify', 'infinite-scroll', 'ngMap', 'angular-loading-bar', 'inputDropdown', 'angularMoment', 'nya.bootstrap.select', 'ngFileSaver', 'ngCroppie', 'summernote', 'vcRecaptcha'])
  .config(function ($provide, blockUIConfig, cfpLoadingBarProvider, $compileProvider, $logProvider) {
    blockUIConfig.delay = 0;
    blockUIConfig.template = '<div class="loader-spinner"><div class="uil-flickr-css" style="transform:scale(0.2);"><div></div><div></div></div></div>';
    blockUIConfig.autoBlock = false;
    // KeepaliveProvider.http(SETTINGS.BASE_URL + '/api/auth/validate_token');
    // Google Maps
    // uiGmapGoogleMapApiProvider.configure({
    //     key: 'AIzaSyBkLJt6qh1IocAzXwg9zCrAtE8rZYB43YY',
    //     v: '3.20', //defaults to latest 3.X anyhow
    //     libraries: 'weather,geometry,visualization'
    // });
    // Google Geo-coding AIzaSyCD7Nbr-7JNdiQ1za_rqQP8TOOQgW4dCCk
    // top loading spinner
    cfpLoadingBarProvider.includeSpinner = false;
    // disable debug info - running in production
    // $compileProvider.debugInfoEnabled(false);
    $compileProvider.aHrefSanitizationWhitelist(/^\s*(https?|ftp|mailto|data|chrome-extension):/);
    $logProvider.debugEnabled(true);
  })
  .run(function ($rootScope, $log, $state, $transitions, $location, $stateParams, $cookies, alertify, $window, $interval, UserSDK, HorseSDK, NotificationsSDK, SETTINGS) {
    var _user = UserSDK.getUser();
    var _sessionTimer = null;
    var _horse = HorseSDK.getCurrentHorse();

    // Notifications
    var _hasNotificationsChecked = false;
    var _lastNotification = null;

    if (_user) {
      sessionCheck();
    }

    // $interval(function () {
    //   // a shity hack
    //   $rootScope.$apply();
    // }, 1000 * 60 * 1);

    // var _idleStart = $rootScope.$on('IdleStart', function () {
    //   $log.debug('IdleStart');
    // });
    // $rootScope.$on('$destroy', _idleStart);
    //
    // var _idleTimeout = $rootScope.$on('IdleTimeout', function () {
    //   $log.debug('IdleTimeout');
    //   if (_user && isRemebermeValid()) {
    //
    //   } else {
    //     UserSDK.logout();
    //     $rootScope.$broadcast(SETTINGS.NOTIFICATION.LOGOUT, {type: 0, message: 'You\'ve been successfully logged out'});
    //     alertify.okBtn("OK").alert("You have been logged out", function (ev) {
    //       ev.preventDefault();
    //       $state.go('home');
    //     });
    //   }
    // });
    // $rootScope.$on('$destroy', _idleTimeout);

    var loginNoty = $rootScope.$on(SETTINGS.NOTIFICATION.LOGIN, function () {
      sessionCheck();
    });
    $rootScope.$on('$destroy', loginNoty);

    // var scrollToTop = $rootScope.$on('$stateChangeSuccess', function () {
    //   angular.element("html, body").animate({
    //     scrollTop: 0
    //   }, 200);
    // });
    // $rootScope.$on('$destroy', scrollToTop);

    $transitions.onSuccess({}, function () {
      $window.scrollTo(0, 0);
    });

    // var keepAliveWatch = $rootScope.$on('Keepalive', function () {
    //   // do something to keep the user's session g
    //   // sessionCheck();
    // });
    // $rootScope.$on('$destroy', keepAliveWatch);

    // private
    function sessionCheck() {
      if (_sessionTimer === null) {
        _sessionTimer = $interval(function sessionTimer() {
          var _user = UserSDK.getUser();
          if (_user) {
            // Validate user
            UserSDK.validate().then(function (response) {
              // TEMP FIX TO PREVENT USER IMAGE FROM REFRESHING EVERYTIME THE SESSION GETS VALIDATED
              response.data.profilePic = _user.profilePic;
              if (UserSDK.updateUser(response.data)) {
                $log.debug("profile updated");
                $rootScope.$broadcast(SETTINGS.NOTIFICATION.PROFILEUPDATE, {
                  type: 1,
                  message: 'Profile has been updated'
                });
              }
            }, function (error) {
              if (error.status === 401) {
                $interval.cancel(_sessionTimer);
                logoutUser();
              }
            });

            // Get notifications
            getNotify(_hasNotificationsChecked, _lastNotification);
          }
        }, 1000 * 30 * 1);
      }
    }

    // function isRemebermeValid(user) {
    //   var _isValid = false;
    //   if (user && user.rememberme) {
    //     var _headers = UserSDK.getHeaders();
    //     var _currtime = new Date().getTime();
    //     if (_currtime < _headers.expiry) {
    //       _isValid = true;
    //     }
    //   }
    //   $log.debug("isRemebermeValid:" + _isValid);
    // }

    function logoutUser() {
      UserSDK.logout();
      $rootScope.$broadcast(SETTINGS.NOTIFICATION.LOGOUT, {
        type: 0,
        message: 'You\'ve been successfully logged out'
      });
      alertify.okBtn("OK").alert("You have been logged out", function (ev) {
        ev.preventDefault();
        $state.go('home');
      });
    }

    function isOnMainteneceMode(status) {
      // document.cookie = "on_devmode=true";
      if (status) {
        var _devmode = !$cookies.getObject('on_devmode');
        if (_devmode) {
          $state.go('maintenance');
          UserSDK.logout();
        }
        $transitions.onStart({}, function () {
          if (_devmode) {
            $state.go('maintenance');
          }
        });
      }
    }

    function dashboardLock() {
      // Re route user into the dashboard if user object is present
      $transitions.onSuccess({
        to: 'home'
      }, function () {
        _user = UserSDK.getUser();
        if (!$stateParams.logout && _user) {
          if (_horse) {
            $state.go('dashboard', {
              horseid: _horse.id
            });
          } else {
            $state.go('dashboard', {
              horseid: null
            });
          }
        }
      });
    }

    function getNotify(hasChecked, index) {
      if (hasChecked) {
        NotificationsSDK.getNotify(1, 100, index).then(function (response) {
          _lastNotification = response.content[0].id;
          $rootScope.$broadcast(SETTINGS.NOTIFICATION.NOTIFY, response.content);
        });
      } else {
        _hasNotificationsChecked = true;
        NotificationsSDK.getNotify(1, 1, index).then(function (response) {
          _lastNotification = response.content[0].id;
        });
      }
    }

    getNotify(_hasNotificationsChecked, _lastNotification);

    // Maintenance mode
    isOnMainteneceMode(false);
    dashboardLock();

    /**
     * Check If Deep Link
     *
     * @param      {String}   state   The state
     * @return     {boolean}  in deep link
     */
    function checkDeepLinks(state) {
      var stateList = SETTINGS.DEEP_LINKS;
      return (stateList.includes(state));
    }

    var requestedRoute = null;
    /**
     * Before Loding Page, Get Requested URL
    */
    $transitions.onStart({}, function ($transition) {
      var _user = UserSDK.getUser();
      if ($transition.$to().name === "home" && checkDeepLinks($transition.$from().name) && !_user) {
        requestedRoute = $location.path();
      }
    });

    /**
     * After Loading Home Page, Popup login and redirect to url
    */
    $transitions.onSuccess({}, function () {
      var _user = UserSDK.getUser();

      if (requestedRoute && $state.current.name === "home" && $stateParams.popup && !_user) {
        angular.element("#loginPopup").modal("show");
      } else if (requestedRoute && _user) {
        // once logged in, redirect to the last route and reset it
        $location.path(requestedRoute).replace();
        requestedRoute = null;
      }
    });
  });
