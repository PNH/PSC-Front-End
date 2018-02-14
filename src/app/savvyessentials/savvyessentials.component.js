angular
  .module('app')
  .component('savvyEssentialsCom', {
    templateUrl: 'app/savvyessentials/template/savvy-essentials.html',
    controller: function ($scope, $log, $q, $timeout, SavvyEssentialsSDK, DeepLinkFactory, moment, blockUI) {
      var self = this;
      self.savvyEssentials = [];

      // BlockUI instances
      const savvyEssentialsLoad = blockUI.instances.get('savvyEssentialsLoading');

      /**
       * Public Methods
      */
      self.onMediaItemClicked = onMediaItemClicked;
      self.onDocumentItemClicked = onDocumentItemClicked;
      self.onImageItemClicked = onImageItemClicked;
      self.stopPopup = stopPopup;

      /**
       * Init
       */
      function _init() {
        // getMyEvents();
        getSavvyEssentialsData();
      }
      _init();

      /**
       * Gets the savvy essentials data.
       *
       * @return     {Object}  The savvy essentials data.
       */
      function getSavvyEssentialsData() {
        savvyEssentialsLoad.start();
        var deferred = $q.defer();
        SavvyEssentialsSDK.getSavvyEssentials(moment().format("YYYY-MM-DD"), true).then(function (response) {
          self.savvyEssentials = response.content;

          $timeout(function () {
            angular.element('.content-block').find('a').each(function () {
              angular.element(this).attr('target', '_blank');
            });
          }, 2000);

          deferred.resolve();
          savvyEssentialsLoad.stop();
        }, function (error) {
          $log.error(error);
          DeepLinkFactory.checkLogged(error.status, 'savvyessentials');
          deferred.reject();
          savvyEssentialsLoad.stop();
        });
        return deferred.promise;
      }

      /**
       * Display Media Item Popup
       *
       * @param      {Object}  vid     The video
       */
      function onMediaItemClicked(vid) {
        angular.element('#mediaModal').modal('show');
        self.selectedMedia = vid;
        $log.debug('Touchstone detail media changed:');
        $log.debug(self.selectedMedia);
      }

      /**
       * Display Document Item Popup
       *
       * @param      {Object}  doc     The document
       */
      function onDocumentItemClicked(doc) {
        angular.element('#documentModal').modal('show');
        self.selectedDocument = doc;
        self.selectedDocument.fullPath = 'https:' + self.selectedDocument.path;
        $log.debug('Touchstone detail document changed:');
        $log.debug(self.selectedDocument);
      }

      /**
       * Display Image Item Popup
       *
       * @param      {Object}  img     The image
       */
      function onImageItemClicked(img) {
        angular.element('#imageModal').modal('show');
        self.selectedImage = img;
        self.selectedImage.fullPath = 'https:' + self.selectedImage.path;
        $log.debug('Touchstone detail document changed:');
        $log.debug(self.selectedImage);
      }

      /**
       * Stops a popup.
       */
      function stopPopup() {
        $scope.$evalAsync(function () {
          self.selectedMedia = null;
          self.selectedDocument = null;
          self.selectedImage = null;
        });
      }
    }
  });
