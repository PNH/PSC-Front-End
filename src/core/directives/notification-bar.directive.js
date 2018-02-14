angular
  .module('core.directive')
  .directive('notificationBar',
    function ($rootScope, $timeout, SETTINGS, alertify) {
      return {
        restrict: 'E',
        templateUrl: 'core/directives/templates/notification-bar.html',
        link: function postLink() {
          function popNotification(type, message) {
            switch (type) {
              case 0:
                alertify.error(message);
                break;
              case 1:
                alertify.success(message);
                break;
              default:

            }
            // scope.notifyClass = (type === 1) ? 'success' : 'error';
            // scope.message = message;
            //
            // elem.find('.notification-bar').slideDown('fast').addClass(scope.notifyClass);
            //
            // $timeout(function () {
            //   closeNotification();
            // }, 5000);
          }

          // function closeNotification() {
          //   elem.find('.notification-bar').slideUp('fast').removeClass('success error');
          // }
          //
          // elem.find('.glyphicon-remove').bind('click', function () {
          //   closeNotification();
          // });

          var gobalNoty = $rootScope.$on(SETTINGS.NOTIFICATION.GLOBAL, function (event, data) {
            popNotification(data.type, data.message);
          });

          $rootScope.$on('$destroy', gobalNoty);
        }
      };
    });
