angular
  .module('app')
  .component('memberMinutesDetailCom', {
    templateUrl: 'app/memberminutes/template/detail.html',
    controller: function ($log, $stateParams, MemberMinutesSDK, DeepLinkFactory, moment, alertify, blockUI) {
      var self = this;
      const mmDetailLoad = blockUI.instances.get('mmDetailLoading');
      self.mid = null;
      self.detail = null;

      if ($stateParams.id) {
        self.mid = $stateParams.id;
        getDetail(self.mid);
      }
      /**
       * Get detail
       */
      function getDetail(id) {
        mmDetailLoad.start();
        MemberMinutesSDK.getDetail(id, false).then(function (response) {
          self.detail = response.content;
          mmDetailLoad.stop();
        }, function (error) {
          $log.error(error);
          // alertify.error('Oops! Something went wrong. Please try again later.');
          mmDetailLoad.stop();
          DeepLinkFactory.checkLogged(error.status, 'memberminutesdetail');
        });
      }

      self.selectedMedia = {
        thumbnail: 'http://s3.amazonaws.com/savvyclub-staging/rich/rich_files/rich_files/143/original/finesse-1-300x200.jpg?1481874939',
        file: '//d1b004fs3yentq.cloudfront.net/test01.m3u8',
        name: 'Test touchstone video 2',
        duration: 256
      };
    }
  });
