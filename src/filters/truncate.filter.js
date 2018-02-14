angular
  .module('app')
  .filter('truncate', function () {
    return function (input, limit) {
      var extension = input.substr(input.lastIndexOf('.') + 1);

      return ((limit >= input.length) ? input : input.substr(0, limit - 6) + '... (.' + extension + ')');
    };
  });
