angular
  .module('filter')
  .filter('isequal', function () {
    return function (input, value) {
      return input === value ? 'active' : '';
    };
  });
