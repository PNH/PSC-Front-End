angular
  .module('core.directive')
  .directive('bsCarousel',
    function () {
      return {
        restrict: 'A',
        link: function postLink(scope, elem) {
          function mobileSliderAdaptive() {
            angular.element('.carousel:not(.main-page)').each(function () {
              var carousel = angular.element(this);
              var holder = carousel.find('.carousel-inner');
              var badges = holder.find('.badge-item');
              var active = '';

              var slider = {
                itemNum: Math.ceil(badges.length / 4),
                badgeArr: []
              };

              badges.each(function (i) {
                slider.badgeArr.push(badges[i]);
              });

              holder.empty();

              for (var j = 0; j < slider.itemNum; j++) {
                if (j === 0) {
                  active = 'active';
                } else {
                  active = '';
                }
                holder.append('<div class="item ' + active + '"></item>');
              }

              var item = holder.find('.item');
              var len = item.length;

              item.each(function () {
                angular.element(this).append('<div class="badges-box"></div><div class="badges-box"></div>');
              });

              for (var i = 0; i < len; i++) {
                angular.element(item[i]).find('.badges-box').each(function () {
                  for (var j = 0; j < 2; j++) {
                    angular.element(this).append(slider.badgeArr.shift());
                  }
                });
              }
            });
          }

          function resize() {
            var flag = true;

            var resizeContent = function () {
              if (angular.element(window).width() < 945) {
                if (flag) {
                  mobileSliderAdaptive();
                }
                flag = false;
              }
            };
            angular.element(window).resize(function () {
              resizeContent();
            });
            resizeContent();
          }
          elem.find('.carousel-control').on('click', function () {
            var button = angular.element(this).attr('data-slide');
            elem.carousel(button);
          });
          resize();
        }
      };
    });
