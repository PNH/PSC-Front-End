angular
  .module('core.directive')
  .directive('goUp',
    function () {
      return {
        restrict: 'E',
        template: '<div class="up-btn"></div>',
        link: function postLink(scope, elem) {
          elem.bind('click', function () {
            angular.element('body, html').animate({scrollTop: 0}, 800);
          });
        }
      };
    });
