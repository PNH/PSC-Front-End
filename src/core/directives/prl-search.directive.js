angular
  .module('core.directive')
  .directive('prlSearch',
    function () {
      return {
        restrict: 'E',
        templateUrl: 'core/directives/templates/prl-search.html',
        controller: function ($scope, $log, $state, SearchSDK, HorseSDK, blockUI, alertify, SETTINGS) {
          var self = this;

          self.search = null;
          self.result = [];
          self.searchCriteria = null;
          self.selectedHorse = HorseSDK.getCurrentHorse();
          // console.log(HorseSDK.getCurrentHorse());
          self.searchFilters = SETTINGS.SEARCH_FILTERS;
          self.isAllFilterSelected = true;
          var isUserTypeSelected = false;
          var selectedUserRoles = [];
          var selectedFilters = [];

          // Pagination
          self.searchLimit = 25;
          self.resultIndex = 1;

          // Toggle
          self.togglePopup = false;

          // Loaders
          const searchLoad = blockUI.instances.get('searchLoading');

          /**
           * Search
           *
           * @param {String} query Search query
           */
          function search(query) {
            if (self.isAllFilterSelected || selectedFilters.length === 0) {
              self.isAllFilterSelected = true;
              selectAllFilters();
            }
            self.togglePopup = true;
            searchLoad.start();
            self.selectedHorse = HorseSDK.getCurrentHorse();
            self.searchCriteria = query;
            $scope.openPopup();
            SearchSDK.search(query, self.resultIndex, self.searchLimit, selectedFilters, false).then(function (response) {
              self.result = response.content;

              if (isUserTypeSelected && response.content !== null) {
                self.result = [];
                for (var u = response.content.length - 1; u >= 0; u--) {
                  if (angular.isUndefined(response.content[u].object.role)) {
                    self.result.push(response.content[u]);
                    continue;
                  }
                  for (var s = 0; s < selectedUserRoles.length; s++) {
                    if (response.content[u].object.role.toLowerCase() === selectedUserRoles[s].toLowerCase()) {
                      self.result.push(response.content[u]);
                      break;
                    }
                  }
                }
              }

              searchLoad.stop();
            }, function (error) {
              searchLoad.stop();
              $log.error(error);
            });
          }

          /**
           * Search Filter Checkbox Changed
           *
           * @param      {array/object}  items   is All Selected/The items
           */
          function onSearchFilterChanged(items) {
            resetData();
            if (angular.isObject(items)) {
              self.isAllFilterSelected = false;
            } else if (self.isAllFilterSelected === false) {
              self.isAllFilterSelected = true;
              search(self.search.query);
            } else {
              self.filterList = {};
              search(self.search.query);
              return;
            }
            if (items === true) {
              search(self.search.query);
              return;
            }
            angular.forEach(items, function (value, key) {
              if (value === true) {
                if (checkUserTypes(key)) {
                  selectedUserRoles.push(key);
                  if (!isUserTypeSelected) {
                    isUserTypeSelected = true;
                    selectedFilters.push("User");
                  }
                } else {
                  selectedFilters.push(key);
                }
              }
            });
            search(self.search.query);
          }

          /**
           * Select All Filter
           */
          function selectAllFilters() {
            resetData();
            for (var r = 0; r < self.searchFilters.length; r++) {
              if (checkUserTypes(self.searchFilters[r].value)) {
                selectedUserRoles.push(self.searchFilters[r].value);
                if (!isUserTypeSelected) {
                  isUserTypeSelected = true;
                  selectedFilters.push("User");
                }
                continue;
              }
              selectedFilters.push(self.searchFilters[r].value);
            }
          }

          /**
           * Check User Types
           *
           * @param      {string}   item    User Type
           * @return     {boolean}  if User Selected
           */
          function checkUserTypes(item) {
            if (item === "Member" || item === "Instructor" || item === "Staff") {
              return true;
            }
            return false;
          }

          /**
           * Reset Filter Variables
           */
          function resetData() {
            selectedFilters = [];
            selectedUserRoles = [];
            isUserTypeSelected = false;
          }

          /**
           * Go to a specific page selector from search results
           *
           * @param {String} type Result type
           * @param {Object} object Result object (Defers from type to type)
           */
          function goTo(type, object) {
            $scope.closePopup();
            switch (type) {
              case 'Group':
                $state.go('groupsdetail', {groupid: object.id});
                break;
              case 'User':
                $state.go('wall', {userid: object.id});
                break;
              case 'Event':
                $state.go('eventdetails', {eventid: object.id});
                break;
              case 'ForumTopic':
                $state.go('topicdetail', {subforumid: object.id, topicid: object.id});
                break;
              case 'Lesson':
                if (self.selectedHorse) {
                  $state.go('lesson', {horseid: self.selectedHorse.id, lessonid: object.id});
                } else {
                  alertify.okBtn("OK").alert('Please add a horse in your stall to access Lessons!');
                }
                break;
              case 'LearngingLibrary':
                var category = object.type === 'MP4' || object.type === 'MP3' ? object.type : 'DOC';
                $state.go('library-search', {query: object.name, category: category});
                break;
              default:
                $log.log(type);
            }
          }

          /**
           * Public methods
           */
          self.onSearch = search;
          self.onSearchFilterChanged = onSearchFilterChanged;
          self.goTo = goTo;
          self.closePopup = function () {
            self.togglePopup = false;
            $scope.closePopup();
          };
        },
        controllerAs: 'searchCtrl',
        link: function postLink(scope, elem) {
          scope.openPopup = function () {
            elem.find('.prl-search-popup').show();
            // angular.element('body').addClass('unscrollable');
          };
          scope.closePopup = function () {
            elem.find('.prl-search-popup').hide();
            // angular.element('body').removeClass('unscrollable');
          };
        }
      };
    });
