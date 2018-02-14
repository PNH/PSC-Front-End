angular
  .module('core.directive')
  .directive('prlPdf',
    function ($sce) {
      return {
        restrict: 'E',
        templateUrl: 'core/directives/templates/prl-pdf.html',
        scope: {
          src: '='
        },
        link: function postLink(scope) {
          scope.pdfUrl = $sce.trustAsResourceUrl("https://docs.google.com/viewer?url=" + encodeURIComponent(scope.src).replace(/~/g, '%7E') + "&embedded=true");
        }
      };
    });
