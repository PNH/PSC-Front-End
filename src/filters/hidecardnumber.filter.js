angular
  .module('filter')
  .filter('hidecardnumber', function () {
    return function (cardnumber) {
      var _newnumber = '';
      if (angular.isDefined(cardnumber)) {
        cardnumber = cardnumber.toString();
        for (var i = 0; i < cardnumber.length - 4; i++) {
          _newnumber += 'x';
        }
        _newnumber += cardnumber.substring(cardnumber.length - 4, cardnumber.length);
      }
      return _newnumber;
    };
  });
