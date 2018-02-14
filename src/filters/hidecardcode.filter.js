angular
  .module('filter')
  .filter('hidecardcode', function () {
    return function (cardnumber) {
      var _newnumber = '';
      if (angular.isDefined(cardnumber)) {
        cardnumber = cardnumber.toString();
        for (var i = 0; i < cardnumber.length; i++) {
          _newnumber += 'x';
        }
        // _newnumber += cardnumber.substring(cardnumber.length - 1, cardnumber.length);
      }
      return _newnumber;
    };
  });
