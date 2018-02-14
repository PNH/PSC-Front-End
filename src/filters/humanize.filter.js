angular
  .module('filter')
  .filter('humanize', function () {
    return function (input) {
      if (input) {
        input = input.replace(".mp4", "");
        input = input.split("_").join(" ").toLowerCase();
        input = input.split("-").join(" ").toLowerCase();
        input = input.charAt(0).toUpperCase() + input.slice(1);
      }
      return input;
    };
  });
