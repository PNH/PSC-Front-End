angular
  .module('filter')
  .filter('duration', function () {
    return function (time) {
      var hours = Math.floor(time / 3600);
      time -= hours * 3600;
      var minutes = Math.floor(time / 60);
      var seconds = time - minutes * 60;
      var showHours = hours > 0 ? hours + ':' : '';
      var showMinutes = function () {
        var temp = minutes;
        if (hours > 0) {
          temp = addZero(minutes);
        }
        return temp;
      };
      function addZero(num) {
        var temp;
        if (num < 10) {
          temp = '0' + num;
        } else {
          temp = num;
        }
        return temp;
      }

      return showHours + showMinutes() + ':' + addZero(seconds);
    };
  });
