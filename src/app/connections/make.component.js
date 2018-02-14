angular
  .module('app')
  .component('makeConnectionsCom', {
    templateUrl: 'app/connections/template/make.html',
    controller: function ($log, $q, $filter, ConnectionsSDK, blockUI, alertify) {
      var self = this;

      self.paginationLimit = 8;

      /**
       * Connections
       */
      self.people = [];
      self.filteredPeople = [];

      // Pagination
      self.searchIndex = 1;
      self.searchLimit = 10;
      self.searchResultReachedEnd = false;

      // Search
      self.hasSearched = false;
      self.hasFiltered = false;
      self.searchedQuery = {
        query: null,
        radius: null
      };
      self.rangeOptions = [
        {
          id: 1,
          value: 10,
          name: '10 Miles (16 Km)'
        },
        {
          id: 2,
          value: 25,
          name: '25 Miles (40 Km)'
        },
        {
          id: 3,
          value: 50,
          name: '50 Miles (80 Km)'
        },
        {
          id: 4,
          value: 100,
          name: '100 Miles (160 Km)'
        },
        {
          id: 5,
          value: 200,
          name: '200 Miles (321 Km)'
        },
        {
          id: 6,
          value: 500,
          name: '500 Miles (804 Km)'
        },
        {
          id: 7,
          value: 0,
          name: 'Everywhere'
        }
      ];
      self.search = {
        radius: self.rangeOptions[1],
        query: ''
      };
      self.filterMembers = {
        instructor: true,
        member: true,
        staff: true
      };

      // Loaders
      const connectionSearchLoad = blockUI.instances.get('connectionSearchLoading');
      self.searchProcessing = false;
      self.searchLoadingProcessing = false;

      /**
       * Search people
       *
       * @param {Object} query Search query and radius
       */
      function searchPeople(query) {
        var deferred = $q.defer();
        var search = angular.copy(query);
        self.searchedQuery = {
          query: search.query,
          radius: search.radius
        };
        search.radius = query.radius.value;
        search.page = self.searchIndex;
        search.limit = self.searchLimit;
        self.searchIndex += 1;
        ConnectionsSDK.searchPeople(search, false).then(function (response) {
          if (self.searchIndex === 2) {
            self.people = [];
            self.filteredPeople = [];
          }
          if (response.status === 200 && response.content) {
            if (response.content.length === 0) {
              self.searchResultReachedEnd = true;
            } else if (response.content.length < self.searchLimit) {
              self.people = self.people.concat(response.content);
              self.searchResultReachedEnd = true;
            } else if (!response.content.length < self.searchLimit) {
              self.people = self.people.concat(response.content);
            }
          } else {
            self.searchResultReachedEnd = true;
          }
          self.filteredPeople = self.people;
          if (self.hasFiltered) {
            filterByUsers(self.people, self.filterMembers);
          }
          deferred.resolve();
        }, function (error) {
          $log.error(error);
          if (error.status === 406) {
            alertify.okBtn("OK").alert('Make it easy to find other horse lovers in your area by entering an address in your profile. If you don\'t, you can only use the \'Everywhere\' filter to search.');
            self.people = [];
            self.filteredPeople = [];
          } else {
            alertify.error('Oops! Something went wrong. Please try again later');
          }
          deferred.reject();
        });
        return deferred.promise;
      }

      /**
       * Init search
       */
      function _search() {
        connectionSearchLoad.start();
        searchPeople(self.search).then(function () {
          connectionSearchLoad.stop();
        }, function () {
          connectionSearchLoad.stop();
        });
      }

      /**
       * Disconnect from a connection
       *
       * @param {any} invId Invitation ID
       * @returns Disconnected object, status
       */
      function disconnect(invId) {
        var deferred = $q.defer();
        ConnectionsSDK.removeConnection(invId, false).then(function (response) {
          if (response.status === 200) {
            // self.people = removeFromArray(self.people, invId);
            alertify.success('You have been successfully disconnected.');
          }
          deferred.resolve(response);
        }, function (error) {
          $log.error(error);
          deferred.reject(error);
          alertify.error('Oops! Something went wrong. Please try again later');
        });
        return deferred.promise;
      }

      /**
       * Send a connect request to a user
       *
       * @param {Integer} userId Requestee's user ID
       * @returns Requested status, object
       */
      function connect(userId) {
        var deferred = $q.defer();
        ConnectionsSDK.makeConnection(userId, false).then(function (response) {
          if (response.status === 201) {
            // self.people = removeFromArray(self.people, userId);
            alertify.success('Connection request sent successfully.');
          }
          deferred.resolve(response);
        }, function (error) {
          $log.error(error);
          alertify.error('Oops! Something went wrong. Please try again later.');
          deferred.reject(error);
        });
        return deferred.promise;
      }

      // Remove an item from an array
      function removeFromArray(arr, val) {
        var temp = arr;
        angular.forEach(temp, function (value, index) {
          if (value.user.id === val) {
            temp.splice(index, 1);
          }
        });
        return temp;
      }

      /**
       * Filter users by role
       *
       * @param {Object} filter User role object
       */
      function filterByUsers(users, filter) {
        // Private methods
        var m = {
          getSelectedUserTypes: function (filter) {
            var selectedTypes = [];
            for (var type in filter) {
              if (filter[type]) {
                selectedTypes.push(type);
              }
            }
            return selectedTypes;
          }
        };

        if (!filter.member && !filter.instructor && !filter.staff) {
          self.filterMembers = {
            instructor: true,
            member: true,
            staff: true
          };
        }

        self.hasFiltered = true;
        var types = m.getSelectedUserTypes(self.filterMembers);
        var _filtered = [];

        angular.forEach(users, function (user) {
          if (types.includes(user.user.role)) {
            _filtered.push(user);
          }
        });
        self.filteredPeople = _filtered;
      }

      function clearForm() {
        self.searchResultReachedEnd = true;
        self.searchIndex = 1;
        self.people = [];
        self.search = {
          radius: self.rangeOptions[1],
          query: ''
        };
        self.filterMembers = {
          instructor: true,
          member: true,
          staff: true
        };
        _search();
        self.hasSearched = false;
      }

      /**
       * Public methods
       */
      self.clearForm = clearForm;
      self.onSearch = function (query) {
        connectionSearchLoad.start();
        self.searchProcessing = true;
        self.searchIndex = 1;
        self.hasSearched = true;
        self.searchResultReachedEnd = false;
        searchPeople(query).then(function () {
          connectionSearchLoad.stop();
          self.searchProcessing = false;
        }, function () {
          connectionSearchLoad.stop();
          self.searchProcessing = false;
        });
      };
      self.loadSearchResults = function (query) {
        self.searchLoadingProcessing = true;
        searchPeople(query).then(function () {
          self.searchLoadingProcessing = false;
        }, function () {
          self.searchLoadingProcessing = false;
        });
      };
      self.disconnectConnection = function (invId) {
        var deferred = $q.defer();
        disconnect(invId).then(function (response) {
          if (response.status === 200) {
            self.people = removeFromArray(self.people, invId);
          }
          deferred.resolve();
        }, function () {
          deferred.reject();
        });
        return deferred.promise;
      };
      self.makeConnectionDisconnect = function (invId) {
        var deferred = $q.defer();
        disconnect(invId).then(function (response) {
          deferred.resolve(response);
        }, function () {
          deferred.reject();
        });
        return deferred.promise;
      };
      self.connectConnection = function (userId) {
        var deferred = $q.defer();
        connect(userId).then(function (response) {
          deferred.resolve(response);
        }, function () {
          deferred.reject();
        });
        return deferred.promise;
      };
      self.filterResult = function (filter) {
        filterByUsers(self.people, filter);
      };

      /**
       * Init
       */
      function _init() {
        _search();
      }
      _init();
    }
  });
