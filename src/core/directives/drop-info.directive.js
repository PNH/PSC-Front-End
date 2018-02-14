angular
  .module('core.directive')
  .directive('dropinfo',
    function () {
      return {
        restrict: 'E',
        templateUrl: 'core/directives/templates/dropinfo.html',
        link: function postLink(scope, elem) {
          elem.find('#dropIco').bind('click', function () {
            if (elem.find('#dropIco').hasClass('down') === true) {
              elem.find('#dropIco').removeClass('down');
              elem.find('#dropIco').addClass('up');
              elem.find('#pro-content').slideToggle();
            } else {
              elem.find('#dropIco').removeClass('up');
              elem.find('#pro-content').slideToggle();
              elem.find('#dropIco').addClass('down');
            }
          });
        }
      };
    });
