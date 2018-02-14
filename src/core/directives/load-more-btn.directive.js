angular
  .module('core.directive')
  .directive('loadMoreBtn',
    function () {
      return {
        restrict: 'E',
        templateUrl: 'core/directives/templates/load-more-btn.html',
        scope: {
          id: '=',
          label: '@',
          load: '=',
          direction: '@'
        },
        bindToController: true,
        controllerAs: 'loadMoreCtrl',
        controller: function () {
          var self = this;

          // Loaders
          self.isProcessing = false;

          /**
           * Load content
           *
           * @param {Integer} id ID
           */
          function loadContent(id) {
            self.isProcessing = true;
            self.load(id).then(function () {
              self.isProcessing = false;
            }, function () {
              self.isProcessing = false;
            });
          }

          /**
           * Public methods
           */
          self.loadContent = loadContent;
        }
      };
    });
