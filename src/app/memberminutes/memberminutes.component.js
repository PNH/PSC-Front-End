angular
  .module('app')
  .component('memberMinutesCom', {
    templateUrl: 'app/memberminutes/template/memberminutes.html',
    controller: function ($log, MemberMinutesSDK, moment, alertify, blockUI) {
      var self = this;
      const memberMinutesLoad = blockUI.instances.get('memberMinutesLoading');
      const mmListLoad = blockUI.instances.get('mmListLoading');
      var _memberMIndex = 1;
      var _memberMLimit = 12;
      self.memberMHasReachedEnd = false;
      self.memberMinutes = [];
      self.featured = null;
      self.archives = null;
      self.year = null;
      self.month = null;

      /**
       * Update member mintues on archives
       */
      self.onArchiveClicked = function onArchiveClicked(y, m) {
        self.year = y;
        self.month = m;
        changeDate(_memberMIndex, _memberMLimit, moment().month(self.month).format('M'), self.year);
      };

      /**
       * Reset archive
       */
      self.resetArchive = function () {
        self.year = null;
        self.month = null;
        changeDate(_memberMIndex, _memberMLimit, '', '');
      };

      /**
       * Change archive date
       */
      function changeDate(page, limit, month, year) {
        mmListLoad.start();
        MemberMinutesSDK.getMemberMinutes(page, limit, month, year, false).then(function (response) {
          self.memberMHasReachedEnd = false;
          if (response.content.list.length < _memberMLimit) {
            self.memberMinutes = response.content.list;
            self.memberMHasReachedEnd = true;
          } else if (!response.content.list.length < _memberMLimit) {
            self.memberMinutes = response.content.list;
          }
          // _memberMIndex = 1;
          mmListLoad.stop();
        }, function (error) {
          $log.error(error);
          alertify.error('Oops! Something went wrong. Please try again later.');
          mmListLoad.stop();
        });
      }

      /**
       * Initialize member minutes
       */
      function initMemberMinutes(page, limit) {
        memberMinutesLoad.start();
        MemberMinutesSDK.getMemberMinutes(page, limit, '', '', true).then(function (response) {
          if (response.content.featured) {
            self.featured = response.content.featured[0];
          }
          if (!response.content.list.length > 0) {
            self.memberMHasReachedEnd = true;
          } else if (response.content.list.length < _memberMLimit) {
            self.memberMinutes = response.content.list;
            self.memberMHasReachedEnd = true;
          } else if (!response.content.list.length < _memberMLimit) {
            self.memberMinutes = response.content.list;
          }
          // _memberMIndex += 1;
          return MemberMinutesSDK.getArchives();
        }, function (error) {
          $log.error(error);
          alertify.error('Oops! Something went wrong. Please try again later.');
          // memberMinutesLoad.stop();
        })
        .then(function (response) {
          if (response.status === 200) {
            self.archives = response.content;
          }
          memberMinutesLoad.stop();
        });
      }

      /**
       * Init
       */
      initMemberMinutes(_memberMIndex, _memberMLimit);
    }
  });
