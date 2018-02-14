angular
  .module('app')
  .component('homeCom', {
    templateUrl: 'app/home/template/home.html',
    controller: function ($scope, $rootScope, $log, $stateParams, $window, $location, SETTINGS, HomeSDK, UserSDK) {
      var self = this;
      self.loggedIn = false;
      self.testimonialsBackgroundURL = null;

      function init() {
        getJoinTheClub();
        getTestimonials();
        // check loggin
        self.user = UserSDK.getUser();
        if (self.user) {
          self.loggedIn = true;
        }
        // logout if needed
        if ($stateParams.logout) {
          UserSDK.logout().then(function () {
            logout();
          }, function (error) {
            logout();
            $log.error(error);
          });
        }
      }
      init();

      /**
       * Get join the club
       */
      function getJoinTheClub() {
        HomeSDK.getJoinTheClub(true).then(function (response) {
          self.joinTheClub = response.content.blocks;
        }, function (error) {
          $log.debug(error);
        });
      }

      /**
       * Get testimonials
       */
      function getTestimonials() {
        HomeSDK.getTestimonialsBackground(true).then(function (response) {
          self.testimonialsBackgroundURL = response.content.blocks[0].contents[0].data;
        }, function (error) {
          $log.debug(error);
        });
        HomeSDK.getTestimonials(true).then(function (response) {
          self.testimonials = response.content;
        }, function (error) {
          $log.debug(error);
        });
      }

      /**
       * Broadcast logout
       */
      function logout() {
        $rootScope.$broadcast(SETTINGS.NOTIFICATION.LOGOUT, {
          type: 0,
          message: 'You\'ve been successfully logged out'
        });
        // $window.location = '#/';
        $location.url($location.path());
      }
    }
  });
