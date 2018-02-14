angular
  .module('app')
  .component('forumsCom', {
    templateUrl: 'app/forums/template/forums.html',
    controller: function ($log, $q, ForumsSDK, blockUI, alertify) {
      var self = this;
      const forumsLoad = blockUI.instances.get('forumsLoading');
      self.forums = null;

      /**
       * Get forums
       */
      function getForums() {
        forumsLoad.start();
        ForumsSDK.getForums(true).then(function (response) {
          if (response.status === 200) {
            self.forums = response.content;
          } else {
            $log.error(response);
            alertify.error('Oops! Something went wrong. Please try again later.');
          }
          forumsLoad.stop();
        }, function (error) {
          $log.error(error);
          alertify.error('Oops! Something went wrong. Please try again later.');
          forumsLoad.stop();
        });
      }

      /**
       * Init
       */
      getForums();
    }
  });
