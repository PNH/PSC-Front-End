angular
  .module('app')
  .component('customPageCom', {
    templateUrl: 'app/custompage/template/custom-page.html',
    controller: function ($scope, $log, $q, $stateParams, UserSDK, MetaSDK, blockUI) {
      var self = this;
      self.pageSlug = $stateParams.pageslug;
      self.userId = UserSDK.getUserId();

      // BlockUI instances
      const pageContentLoad = blockUI.instances.get('pageContentLoading');

      /**
       * Public methods
      */
      self.onMediaItemClicked = onMediaItemClicked;
      self.onDocumentItemClicked = onDocumentItemClicked;
      self.onImageItemClicked = onImageItemClicked;
      self.stopPopup = stopPopup;

      /**
       * Init
       */
      function _init() {
        _getPageContent();
      }
      _init();

      /**
       * Init method for getCustomPage
       */
      function _getPageContent() {
        pageContentLoad.start();
        getCustomPage().then(function () {
          pageContentLoad.stop();
        }, function () {
          pageContentLoad.stop();
        });
      }

      /**
       * Gets the custom page.
       *
       * @return     {object}  The custom page.
       */
      function getCustomPage() {
        var deferred = $q.defer();
        MetaSDK.getPageContent(self.pageSlug, false).then(function (response) {
          self.pageContent = response.content;
          $log.log(self.pageContent);
          deferred.resolve(response);
        }, function (error) {
          $log.debug(error);
          deferred.reject(error);
        });

        return deferred.promise;
      }

      function onMediaItemClicked(vid) {
        angular.element('#mediaModal-custompage').modal('show');
        self.selectedMedia = vid;
        $log.debug(self.selectedMedia);
      }

      function onDocumentItemClicked(doc) {
        angular.element('#documentModal-custompage').modal('show');
        self.selectedDocument = doc;
        self.selectedDocument.fullPath = 'https:' + self.selectedDocument.path;
        $log.debug(self.selectedDocument);
      }

      function onImageItemClicked(img) {
        angular.element('#imageModal-custompage').modal('show');
        self.selectedImage = img;
        self.selectedImage.fullPath = 'https:' + self.selectedImage.path;
        $log.debug(self.selectedImage);
      }

      function stopPopup() {
        $scope.$evalAsync(function () {
          self.selectedMedia = null;
          self.selectedDocument = null;
          self.selectedImage = null;
        });
      }
    }
  });
