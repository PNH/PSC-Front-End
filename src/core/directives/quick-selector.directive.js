angular
  .module('core.directive')
  .directive('quickSelector',
    function () {
      return {
        restrict: 'E',
        scope: true,
        templateUrl: 'core/directives/templates/quick-selector.html',
        link: function postLink() {
          angular.element('.qs-toggle').on('click', function () {
            angular.element('.qs-list__container').toggleClass('active');
            angular.element('.qs-list').slideToggle();
          });

          // angular.element(document).on('mouseup', function (e) {
          //   var container = angular.element('.qs-list');
          //   var toggler = angular.element('.qs-toggle');
          //
          //   if (!container.is(e.target) && container.has(e.target).length === 0 && !toggler.is(e.target)) {
          //     container.slideUp();
          //   }
          // });
        }
      };
    });
