angular
  .module('app')
  .component('learningLibSearchCom', {
    templateUrl: 'app/learninglibrary/template/search.html',
    controller: function ($scope, $state, $stateParams, $q, $log, $sce, LearninglibSDK, alertify) {
      var self = this;
      self.query = null;
      self.results = null;
      self.selectedVideo = null;
      self.selectedAudio = null;
      self.selectedDocument = null;
      self.selectedDropdownItem = null;
      self.dropdownItems = [];
      $scope.query = null;
      self.searching = false;
      self.category = $stateParams.category ? $stateParams.category : 'MP4';
      //
      if ($stateParams.query) {
        self.query = $stateParams.query.trim();
        self.selectedDropdownItem = self.query;
        LearninglibSDK.searchResource(self.query).then(function (response) {
          self.results = response.content;
        },
        function (error) {
          $log.error(error);
        });
      } else {
        self.results = [];
        self.query = "";
      }

      // events
      self.onVideoItemClicked = function onVideoItemClicked(index) {
        if (self.results.videos[index].path === '#error' || self.results.videos[index].path === '#processing') {
          alertify.okBtn("OK").alert("This resource is unavailable at the moment. Please try again later.");
        } else {
          angular.element('#videoModal').modal('show');
          self.selectedVideo = self.results.videos[index];
        }
      };

      self.onAudioItemClicked = function onAudioItemClicked(index) {
        if (self.results.audios[index].path === '#error' || self.results.audios[index].path === '#processing') {
          alertify.okBtn("OK").alert("This resource is unavailable at the moment. Please try again later.");
        } else {
          angular.element('#audioModal').modal('show');
          self.selectedAudio = self.results.audios[index];
        }
      };

      self.onDocumentItemClicked = function onDocumentItemClicked(index) {
        self.selectedDocument = self.results.documents[index];
        // self.selectedDocument.fullPath = $sce.trustAsResourceUrl('https://docs.google.com/gview?url=https:' + self.selectedDocument.path + '&embedded=true');
        self.selectedDocument.fullPath = 'https:' + self.selectedDocument.path;
      };
      self.onSearch = function onSearch(query) {
        var filter = $q.defer();
        if (self.searching) {

        } else {
          self.searching = true;
          LearninglibSDK.lookUp(query).then(function (response) {
            self.dropdownItems = angular.fromJson(response.content);
            $log.debug(self.dropdownItems);
            filter.resolve(self.dropdownItems);
            self.searching = false;
          },
          function (error) {
            $log.error(error);
            self.searching = false;
          });
        }
        return filter.promise;
      };
      self.stopPlayer = function stopPlayer() {
        $scope.$evalAsync(function () {
          self.selectedVideo = false;
          self.selectedAudio = false;
          self.selectedDocument = false;
        });
      };
    }
  });
