angular
  .module('filter')
  .filter('creditcard', function () {
    return function (cardnumber) {
      var match = /^(?:(4[0-9]{12}(?:[0-9]{3})?)|(5[1-5][0-9]{14})|(6(?:011|5[0-9]{2})[0-9]{12})|(3[47][0-9]{13})|(3(?:0[0-5]|[68][0-9])[0-9]{11})|((?:2131|1800|35[0-9]{3})[0-9]{11}))$/.exec(cardnumber);
      if (match) {
        // List of card types, in the same order as the regex capturing groups
        // var types = ['Visa', 'MasterCard', 'Discover', 'American Express', 'Diners Club', 'JCB'];
        // Find the capturing group that matched
        // Skip the zeroth element of the match array (the overall match)
        for (var i = 1; i < match.length; i++) {
          if (match[i]) {
            // Display the card type for that group
            return true;
          }
        }
      } else {
        return false;
      }
    };
  });
