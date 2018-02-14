angular
  .module('filter')
  .filter('htmlToPlaintext', function () {
    return function (text) {
      return text ? String(text).replace(/<[^>]+>/gm, '') : '';
    };
  });
