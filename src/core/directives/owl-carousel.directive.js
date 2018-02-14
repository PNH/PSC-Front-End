angular
  .module('core.directive')
  .directive('owlCarouselWrap',
    function ($timeout) {
      return {
        restrict: 'A',
        link: function postLink(scope, elem) {
          var options = {
            loop: false,
            responsiveClass: true,
            items: 5,
            margin: 10,
            dots: false,
            responsive: {
              320: {
                items: 1,
                nav: true
              },
              425: {
                items: 1,
                nav: true
              },
              667: {
                items: 2,
                nav: true
              },
              768: {
                items: 3,
                nav: true
              },
              1500: {
                items: 5,
                nav: true,
                loop: false
              }
            }
          };
          $timeout(function () {
            elem.owlCarousel(options);
          }, 100);
        }
      };
    });
