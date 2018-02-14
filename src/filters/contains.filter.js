angular
  .module('filter')
  .filter('contains', function () {
    return function (collection, expression) {
      // collection = angular.isObject(collection) ? angular.toArray(collection) : collection;
      if (!collection) {
        return false;
      }
      return collection.includes(expression);
    };
  });
