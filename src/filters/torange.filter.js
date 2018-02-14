angular
  .module('filter')
  .filter('toRange',
    function () {
      return function (input) {
        var lowBound;
        var highBound;
        if (input.length === 1) {
          lowBound = 0;
          highBound = +Number(input[0]) - 1;
        } else if (input.length === 2) {
          lowBound = +Number(input[0]);
          highBound = +Number(input[1]);
        }
        var i = lowBound;
        var result = [];
        while (i <= highBound) {
          result.push(i);
          i++;
        }
        return result;
      };
    });
