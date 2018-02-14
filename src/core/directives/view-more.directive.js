angular
  .module('core.directive')
  .directive('viewMore',
    function ($log, $timeout) {
      return {
        restrict: 'A',
        template: '<div ng-transclude> </div><div ng-show="hasViewMore" class="view-more__toggle"><span class="glyphicon glyphicon-menu-down" aria-hidden="true"></span></div>',
        transclude: true,
        scope: {
          height: '@'
        },
        link: function postLink(scope, elem) {
          elem.addClass('view-more');
          // elem.addClass('view-more').append('<div class="view-more__toggle"><span class="glyphicon glyphicon-menu-down" aria-hidden="true"></span></div>');
          // var content = elem.find('.view-more__content');
          var calHeight = scope.height;
          function setHeight() {
            // var contentHeight = content.height();
            elem.css({
              // height: (contentHeight / 100) * scope.height,
              height: calHeight,
              opacity: 1
            });
          }

          scope.hasViewMore = true;
          $timeout(function () {
            var contentList = elem;
            if (contentList[0].children[0].offsetHeight < (Number(scope.height) + 50)) {
              scope.hasViewMore = false;
            }
          }, 100);

          elem.css({'padding-bottom': '50px'});
          elem.find('span.glyphicon').on('click', function (event) {
            var content = elem.find('.view-more__content');
            var contentHeight = content.height() + 20;

            if (angular.element(event.currentTarget).hasClass('active')) {
              angular.element(event.currentTarget).removeClass('active');
              // elem.height((contentHeight / 100) * scope.height);
              elem.height(contentHeight);
              elem.height(scope.height - 50);
            } else {
              angular.element(event.currentTarget).addClass('active');
              elem.height(contentHeight);
              $timeout(function () {
                elem.height('auto');
              }, 300);
            }
          });

          $timeout(function () {
            if (scope.hasViewMore) {
              setHeight();
            }
          }, 500);
        }
      };
    });
