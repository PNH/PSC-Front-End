angular
  .module('filter')
  .filter('datetoiso', function (moment) {
    return function (date) {
      return moment(date, 'YYYY-MM-DD').format();
    };
  });
