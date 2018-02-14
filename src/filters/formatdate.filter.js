angular
  .module('filter')
  .filter('formatdate', function (moment) {
    return function (date, style) {
      moment.updateLocale('en', {
        meridiem: function (hour) {
          return hour < 12 ? 'a.m.' : 'p.m.';
        }
      });
      var dateTemp;
      var format;
      switch (style) {
        case 1:
          // 7:16 p.m., February 2 2017
          format = moment(date).format('h:mm a[,] MMMM D[,] YYYY');
          break;
        case 2:
          // February 2 2017
          format = moment(date).format('MMMM D[,] YYYY');
          break;
        case 3:
          // 03/20/2017
          format = moment(date).format('M/D/YYYY');
          break;
        case 4:
          // February 2 2017 without timezone
          if (!date || !date.length) {
            return;
          }
          dateTemp = date.slice(0, -1);
          format = moment(dateTemp).format('MMMM D[,] YYYY');
          break;
        case 5:
          // F03/20/2017 without timezone
          if (!date || !date.length) {
            return;
          }
          dateTemp = date.slice(0, -1);
          format = moment(dateTemp).format('M/D/YYYY');
          // format = moment(dateTemp).format('MMMM D[,] YYYY');
          break;
        case 6:
          // Thu 16 May 2017
          format = moment(date).format('ddd D MMMM YYYY');
          break;
        case 7:
          format = moment(date).format('M');
          break;
        case 8:
          format = moment(date).format('YYYY');
          break;
        case 9:
          var dateObj = moment(date, 'M');
          format = moment(dateObj).format('MMMM');
          break;
        default:
          // 7:16 p.m., February 2 2017
          format = moment(date).format('h:mm a[,] MMMM D[,] YYYY');
      }
      return format;
    };
  });
