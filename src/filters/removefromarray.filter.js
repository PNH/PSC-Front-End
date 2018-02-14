angular
  .module('filter')
  .filter('removefromarray', function () {
    return function (arr, prop, val) {
      var temp = arr;
      angular.forEach(temp, function (value, index) {
        if (value[prop] === val) {
          temp.splice(index, 1);
        }
      });
      return temp;
    };
  });
