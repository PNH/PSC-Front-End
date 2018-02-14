angular
  .module('core.directive')
  .directive('dropdownBox',
    function () {
      return {
        restrict: 'A',
        link: function postLink(scope, elem) {
          var box = elem.find('.box');
          box.click(function () {
            var that = angular.element(this);
            that.parent(elem).toggleClass('open');
          });
        }
      };
    });
