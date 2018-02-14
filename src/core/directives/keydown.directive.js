angular
  .module('core.directive')
  .directive('keypressEvent',
  function () {
    return {
      controllerAs: 'keypressEventCtrl',
      // controller: function ($scope, $log) {
      //   $log.log($scope.keyValue);
      //   // $log.log($scope.keyFunction);
      //   angular.element.bind('keydown', function (event) {
      //     console.log(event);
      //     if (event.which === $scope.keyValue) { // 27 = esc key
      //       scope.$apply(function () {
      //         // scope.$eval($scope.keyFunction);
      //       });

      //       event.preventDefault();
      //     }
      //   });
      // },
      link: function postLink(scope, elem, attrs) {
        // console.log(attrs);
        // console.log(attrs.keyValue);
        // angular.element.bind('keydown keypress', function (event) {
        //   console.log("ggggg");
        // });
        elem.bind('keydown keypress', function (event) {
          // console.log(event);
          if (event.which === 27) { // 27 = esc key
            scope.$apply(function () {
              // scope.$eval(attrs.keyFunction);
              // console.log("CLOSE EVENT... >>>>>");
              angular.element('#atp-close').trigger('click');
            });

            event.preventDefault();
          } else if (event.which === 13) { // 13 = enter key
            scope.$apply(function () {
              scope.$eval(attrs.keypressEvent);
            });

            event.preventDefault();
          }
        });
      }
    };
  });
