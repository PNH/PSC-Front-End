angular
  .module('app')
  .component('badgesCom', {
    templateUrl: 'app/badges/template/badges.html',
    controller: function ($log, $stateParams, HorseSDK) {
      var self = this;
      self.horseid = null;
      self.badges = {
        level1: [],
        level2: [],
        level3: [],
        level4: []
      };
      var content = angular.element('#content');
      var archBlock = content.find('.block');

      initPage();

      if (angular.isDefined($stateParams.horseid)) {
        self.horseid = parseInt($stateParams.horseid, 10);
        HorseSDK.getBadges(self.horseid, true).then(function (response) {
          angular.forEach(response.content, function (level) {
            switch (level.level) {
              case 1:
                self.badges.level1 = self.badges.level1.concat(level.badges);
                break;
              case 2:
                self.badges.level2 = self.badges.level2.concat(level.badges);
                break;
              case 3:
                self.badges.level3 = self.badges.level3.concat(level.badges);
                break;
              case 4:
                self.badges.level4 = self.badges.level4.concat(level.badges);
                break;
              default:

            }
          });
          // self.badges.level1 = organizeBadges(self.badges.level1);
          // self.badges.level2 = organizeBadges(self.badges.level2);
          // self.badges.level3 = organizeBadges(self.badges.level3);
          // self.badges.level4 = organizeBadges(self.badges.level4);
          // console.log(self.badges);
        },
        function (error) {
          $log.error(error);
        });
      }

      // private
      function initPage() {
        archBlock.each(function () {
          var block = angular.element(this);
          var box = block.find('.box');
          // var ddBox = block.find('.dropdown-box');

          box.click(function () {
            var that = angular.element(this);
            that.parent(block).toggleClass('open');
            // if (that.parent(block).hasClass('open')) {
            //   ddBox.slideUp(300, function () {
            //     that.parent(block).removeClass('open');
            //   });
            // } else {
            //   ddBox.slideDown(300, function () {
            //     that.parent(block).addClass('open');
            //   });
            // }
          });
        });
      }

      // function organizeBadges(badgeArray) {
      //   var _tmparray = badgeArray;
      //   var _organized = [];
      //   var _array16 = [];
      //   var _array8 = [];
      //   if (_tmparray.length > 0) {
      //     angular.forEach(_tmparray, function (badge) {
      //       _array8.push(badge);
      //       if (_array8.length === 6) {
      //         _array16.push(angular.copy(_array8));
      //         _array8 = [];
      //       }
      //
      //       if (_array16.length === 2) {
      //         _organized.push(angular.copy(_array16));
      //         _array16 = [];
      //       }
      //     });
      //   }
      //   if (_array8.length > 0) {
      //     _array16.push(angular.copy(_array8));
      //   }
      //   if (_array16.length > 0) {
      //     _organized.push(angular.copy(_array16));
      //   }
      //   return _organized;
      // }
    }
  });
