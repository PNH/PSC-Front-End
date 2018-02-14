angular
  .module('filter')
  .filter('onbaordlevel', function () {
    return function (items, level) {
      var filtered = [];
      for (var i = 0; i < items.length; i++) {
        var item = items[i];
        if (item.level.id === level) {
          filtered.push(item);
        }
      }
      return filtered;
    };
  });
