angular
  .module('core.directive')
  .directive('convertToNumber',
    function () {
      return {
        require: 'ngModel',
        link: function (scope, element, attrs, ngModel) {
          ngModel.$parsers.push(function (val) {
            return val === null ? null : parseInt(val, 10);
          });
          ngModel.$formatters.push(function (val) {
            return val === null ? null : String(val);
          });
        }
      };
    });
