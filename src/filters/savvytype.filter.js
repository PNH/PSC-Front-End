angular
  .module('filter')
  .filter('savvytype', function () {
    return function (type) {
      var image;
      switch (type) {
        case 1:
          image = './resources/images/savvy/icon1.png';
          break;
        case 2:
          image = './resources/images/savvy/icon2.png';
          break;
        case 3:
          image = './resources/images/savvy/icon3.png';
          break;
        case 4:
          image = './resources/images/savvy/icon3.png';
          break;
        default:
          image = './resources/images/savvy/icon3.png';
      }
      return image;
    };
  });
