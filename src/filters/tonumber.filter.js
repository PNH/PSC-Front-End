angular
  .module('filter')
  .filter('tonumber', function () {
    return function (input) {
      var _number = parseInt(input, 10);
      return _number;
    };
  });
