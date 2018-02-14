angular
  .module('filter')
  .filter('trusthtml', function ($sce) {
    return function (text) {
      return $sce.trustAsHtml(text);
    };
  });
