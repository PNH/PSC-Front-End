angular
  .module('app')
  .component('learningLibSubCategoryCom', {
    templateUrl: 'app/learninglibrary/template/subcategories.html',
    controller: function ($scope, $log, $stateParams, $q, LearninglibSDK) {
      var self = this;
      self.categoryid = null;
      self.subcategories = null;
      self.selectedDropdownItem = null;
      self.dropdownItems = [];
      $scope.query = self.selectedDropdownItem;
      self.searching = false;
      //
      if ($stateParams.categoryid) {
        self.categoryid = parseInt($stateParams.categoryid, 10);
        // get sub-categories
        LearninglibSDK.getSubCategories(self.categoryid).then(function (response) {
          self.subcategories = response.content;
          // self.subcategories.list = $filter('orderBy')(self.subcategories.list, 'title');
        },
        function (error) {
          $log.error(error);
          self.subcategories = [];
        });
      }

      // events
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
    }
  });
