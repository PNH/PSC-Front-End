angular
  .module('app')
  .component('groupsCom', {
    templateUrl: 'app/groups/template/groups.html',
    controller: function ($scope, $log, $q, $filter, GroupsSDK, blockUI, alertify) {
      var self = this;

      self.myGroups = [];
      self.allGroups = [];

      // Pagination
      var _paginationLimit = 10;
      var _myGroupsIndex = 1;
      var _allGroupsIndex = 1;
      var _hasCreatedGroup = false;
      self.myIsProcessing = false;
      self.allIsProcessing = false;
      self._allReachedEnd = false;
      self._myReachedEnd = false;

      // Loaders
      const myGroupsLoad = blockUI.instances.get('myGroupsLoading');
      const allGroupsLoad = blockUI.instances.get('allGroupsLoading');
      const sortedAllGroupsLoad = blockUI.instances.get('sortedAllGroupsLoading');
      self.creationProcessing = false;

      // Filter
      self.allGroupsSortOptions = [
        {
          id: 1,
          value: 'updated',
          label: 'Last Active'
        },
        {
          id: 2,
          value: 'asc',
          label: 'Date Created'
        }
      ];

      // Models
      self.createGroup = {
        title: null,
        description: null,
        image: null
      };
      self.allGroupsSortModel = self.allGroupsSortOptions[0];
      self.hasSubmitted = false;

      // Error messages
      self.groupCreationErrors = null;

      // Directive controls
      self.profileImageCtrl = {};

      /**
       * Merge given two arrays
       *
       * @param {Array} arr1 Array 1
       * @param {Array} arr2 Array 2
       * @returns Merged array
       */
      function mergeArray(arr1, arr2) {
        var temp = arr1;
        if (_hasCreatedGroup) {
          angular.forEach(arr2, function (value) {
            var hasFound = false;
            for (var i = 0; i < temp.length; i++) {
              if (value.id === temp[i].id) {
                hasFound = true;
              }
            }
            if (!hasFound) {
              temp.push(value);
            }
          });
        } else {
          angular.forEach(arr2, function (value) {
            temp.push(value);
          });
        }
        return temp;
      }

      /**
       * Get my groups
       *
       * @param {Integer} limit Page limit
       */
      function getMyGroups(limit) {
        var deferred = $q.defer();
        self.myIsProcessing = true;
        GroupsSDK.getMyGroups(_myGroupsIndex, limit, false).then(function (response) {
          if (response.content === null) {
            self._myReachedEnd = true;
          } else if (response.content.length < limit) {
            self.myGroups = mergeArray(self.myGroups, response.content);
            self._myReachedEnd = true;
          } else if (!response.content.length < limit) {
            self.myGroups = mergeArray(self.myGroups, response.content);
          }
          _myGroupsIndex += 1;
          self.myIsProcessing = false;
          deferred.resolve();
        }, function (error) {
          $log.error(error);
          self.myIsProcessing = false;
          deferred.reject();
        });
        return deferred.promise;
      }

      /**
       * Init method for `getMyGroups`
       */
      function _getMyGroups(limit) {
        myGroupsLoad.start();
        self.myGroups = [];
        self._myReachedEnd = false;
        _myGroupsIndex = 1;
        getMyGroups(limit).then(function () {
          myGroupsLoad.stop();
        }, function () {
          myGroupsLoad.stop();
        });
      }

      /**
       * Get all groups
       *
       * @param {Integer} limit Page limit
       */
      function getAllGroups(limit, order, reset) {
        var deferred = $q.defer();
        self.allIsProcessing = true;
        GroupsSDK.getAllGroups(_allGroupsIndex, limit, order, false).then(function (response) {
          if (reset) {
            self.allGroups = [];
          }
          if (response.content === null) {
            self._allReachedEnd = true;
          } else if (response.content.length < limit) {
            self.allGroups = mergeArray(self.allGroups, response.content);
            self._allReachedEnd = true;
          } else if (!response.content.length < limit) {
            self.allGroups = mergeArray(self.allGroups, response.content);
          }
          _allGroupsIndex += 1;
          deferred.resolve();
          self.allIsProcessing = false;
        }, function (error) {
          $log.error(error);
          self.allIsProcessing = false;
          deferred.reject();
        });
        return deferred.promise;
      }

      /**
       * Init method for `getAllGroups`
       */
      function _getAllGroups(limit, order) {
        allGroupsLoad.start();
        self.allGroups = [];
        self._allReachedEnd = false;
        _allGroupsIndex = 1;
        getAllGroups(limit, order).then(function () {
          allGroupsLoad.stop();
        }, function () {
          allGroupsLoad.stop();
        });
      }

      /**
       * Sort groups
       */
      function sortAllGroups(limit, order) {
        sortedAllGroupsLoad.start();
        self._allReachedEnd = false;
        _allGroupsIndex = 1;
        getAllGroups(limit, order, true).then(function () {
          sortedAllGroupsLoad.stop();
        }, function () {
          sortedAllGroupsLoad.stop();
        });
      }

      /**
       * Create a new group
       *
       * @param {Object} payload Group object
       */
      function createGroup(payload, isValid) {
        self.groupCreationErrors = null;
        self.hasSubmitted = true;
        if (isValid) {
          payload.status = 1;
          payload.privacyLevel = 1;
          self.creationProcessing = true;
          GroupsSDK.createGroup(payload, true).then(function (response) {
            if (response.status === 200) {
              alertify.success("Your group has been successfully created.");
              self.myGroups.unshift(response.content);
              _hasCreatedGroup = true;
            } else {
              $log.error(response);
              alertify.error("Failed to create the group.");
            }
            resetGroupCreationPopup();
          }, function (error) {
            $log.error(error);
            self.creationProcessing = false;
            if (error.status === 301) {
              self.groupCreationErrors = 'Group title is already taken. Please use a different title.';
              // self.groupCreationErrors = error.message[0];
            } else {
              alertify.error("Failed to create the group.");
            }
          });
        }
      }

      /**
       * Edit group
       *
       * @param {Integer} groupId Group ID
       * @param {Object} payload Group object
       */
      function updateGroup(groupId, payload) {
        var deferred = $q.defer();
        payload.status = 1;
        payload.privacyLevel = 1;
        GroupsSDK.updateGroup(groupId, payload, true).then(function (response) {
          if (response.status === 200) {
            alertify.success("Your group has been successfully updated.");
            deferred.resolve(response);
          } else {
            $log.error(response);
            alertify.error("Failed to update the group.");
            deferred.reject(response);
          }
        }, function (error) {
          $log.error(error);
          if (error.status !== 301) {
            alertify.error("Failed to update the group.");
          }
          deferred.reject(error);
        });
        return deferred.promise;
      }

      function resetGroupCreationPopup() {
        self.creationProcessing = false;
        self.createGroup = null;
        self.profileImageCtrl.reset();
        self.hasSubmitted = false;
        angular.element('#createGroup').modal('hide');
      }

      /**
       * Join a group
       *
       * @param {Integer} groupId Group ID
       * @returns Join status
       */
      function joinGroup(groupId) {
        var deferred = $q.defer();
        GroupsSDK.joinGroup(groupId).then(function (response) {
          alertify.success("You have successfully joined the group.");
          deferred.resolve(response);
        }, function (error) {
          alertify.success("Failed to join the group.");
          deferred.reject(error);
        });
        return deferred.promise;
      }

      /**
       * Leave a group
       *
       * @param {Integer} groupId Group ID
       * @returns Leave status
       */
      function leaveGroup(groupId) {
        var deferred = $q.defer();
        GroupsSDK.leaveGroup(groupId).then(function (response) {
          self.myGroups = $filter('removefromarray')(self.myGroups, 'id', groupId);
          alertify.success("You have successfully left the group.");
          deferred.resolve(response);
        }, function (error) {
          alertify.success("Failed to leave the group.");
          deferred.reject(error);
        });
        return deferred.promise;
      }

      /**
       * Delete a group
       *
       * @param {Integer} groupId Group ID
       * @returns Leave status
       */
      function deleteGroup(groupId) {
        var deferred = $q.defer();
        GroupsSDK.deleteGroup(groupId).then(function (response) {
          self.myGroups = $filter('removefromarray')(self.myGroups, 'id', groupId);
          self.allGroups = $filter('removefromarray')(self.allGroups, 'id', groupId);
          alertify.success("You have successfully deleted the group.");
          deferred.resolve(response);
        }, function (error) {
          alertify.success("Failed to delete the group.");
          deferred.reject(error);
        });
        return deferred.promise;
      }

      /**
       * Public methods
       */
      self.onGroupCreateClicked = createGroup;
      self.updateGroup = updateGroup;
      self.joinGroup = joinGroup;
      self.leaveGroup = leaveGroup;
      self.deleteGroup = deleteGroup;
      self.resetGroup = function () {
        $scope.$evalAsync(function () {
          self.creationProcessing = false;
          self.createGroup = {
            title: '',
            description: ''
          };
          self.profileImageCtrl.reset();
          self.hasSubmitted = false;
        });
      };
      self.onLoadAllGroupsClicked = function () {
        getAllGroups(_paginationLimit, self.allGroupsSortModel.value);
      };
      self.onLoadMyGroupsClicked = function () {
        getMyGroups(_paginationLimit);
      };
      self.sortAllGroups = function (option) {
        self.allGroupsSortModel = option;
        sortAllGroups(_paginationLimit, self.allGroupsSortModel.value);
      };
      self.switchToAll = function () {
        _getAllGroups(_paginationLimit, self.allGroupsSortModel.value);
      };
      self.switchToMy = function () {
        _getMyGroups(_paginationLimit, self.allGroupsSortModel.value);
      };

      /**
       * Init
       */
      function _init() {
        _getMyGroups(_paginationLimit);
        _getAllGroups(_paginationLimit, self.allGroupsSortModel.value);
      }
      _init();
    }
  });
