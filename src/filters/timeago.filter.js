angular
  .module('filter')
  .filter('timeago', function (moment) {
    return function (time) {
      return moment(time).subtract(10, 's').fromNow();
    };
  });
