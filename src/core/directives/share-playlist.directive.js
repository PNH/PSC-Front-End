angular
  .module('core.directive')
  .directive('sharePlaylist',
    function ($timeout) {
      return {
        restrict: 'E',
        templateUrl: 'core/directives/templates/share-playlist.html',
        scope: {
          playlistId: '=',
          shareCallback: '='
        },
        controller: function ($log, ConnectionsSDK, GroupsSDK, PlaylistSDK, UserSDK, blockUI, alertify) {
          var self = this;

          self.userId = UserSDK.getUserId();
          self.sharingToWallProcessing = false;

          self.randId = Math.floor(Math.random() * 1000);

          // Models
          self.shareToWallType = "1";
          self.userName = null;
          self.groupName = null;
          self.searchedUsers = [];
          self.searchedGroups = [];
          self.selectedUser = null;
          self.selectedGroup = null;
          self.isSearchGroupProcessing = false;
          self.isSearchConnectionProcessing = false;

          // Loaders
          var searchedUsernamesLoad = blockUI.instances.get('searchedUsernamesLoading');
          var searchedGroupsLoad = blockUI.instances.get('searchedGroupsLoading');

          // Methods
          self.searchUsername = searchUsername;
          self.selectAUser = selectAUser;
          self.resetShareToWallPopup = resetShareToWallPopup;
          self.shareToWall = shareToWall;
          self.switchWallShareType = switchWallShareType;
          self.removeSelectedItem = removeSelectedItem;

          self.searchGroup = searchGroup;
          self.selectAGroup = selectAGroup;
          self.resetShareToGroupPopup = resetShareToGroupPopup;
          self.shareToGroup = shareToGroup;

          self.savePlaylist = savePlaylist;

          // ***********************************************************************************

          /**
           * Search for users
           *
           * @param {String} name User name
           */
          function searchUsername(name) {
            self.isSearchConnectionProcessing = true;
            searchedUsernamesLoad.start();
            ConnectionsSDK.searchConnected({
              limit: 10,
              page: 1,
              query: name,
              radius: -1
            }, false).then(function (response) {
              self.searchedUsers = response.content;
              searchedUsernamesLoad.stop();
              self.isSearchConnectionProcessing = false;
            }, function (error) {
              $log.error(error);
              self.searchedUsers = [];
              searchedUsernamesLoad.stop();
              self.isSearchConnectionProcessing = false;
            });
          }

          /**
           * Search for groups
           *
           * @param {String} name Group name
           */
          function searchGroup(name) {
            self.isSearchGroupProcessing = true;
            searchedGroupsLoad.start();
            GroupsSDK.searchGroups({
              limit: 10,
              page: 1,
              query: name
            }, false).then(function (response) {
              self.searchedGroups = response.content;
              searchedGroupsLoad.stop();
              self.isSearchGroupProcessing = false;
            }, function (error) {
              $log.error(error);
              self.searchedGroups = [];
              searchedGroupsLoad.stop();
              self.isSearchGroupProcessing = false;
            });
          }

          /**
           * Select a user to share
           *
           * @param {Object} user Selected user object
           */
          function selectAUser(user) {
            self.selectedUser = user;
          }

          /**
           * Select a group to share
           *
           * @param {Object} group Selected group object
           */
          function selectAGroup(group) {
            self.selectedGroup = group;
          }

          /**
           * Reset Share To Wall popup content
           */
          function resetShareToWallPopup() {
            self.shareToWallType = "1";
            self.userName = null;
            self.searchedUsers = [];
            self.selectedUser = null;
          }

          /**
           * Reset Share To Group popup content
           */
          function resetShareToGroupPopup() {
            self.groupName = null;
            self.searchedGroups = [];
            self.selectedGroup = null;
          }

          /**
           * Switch wall share type
           */
          function switchWallShareType() {
            self.userName = null;
            self.searchedUsers = [];
            self.selectedUser = null;
          }

          /**
           * Share to wall
           *
           * @param {Integer} playlistId Playlist ID
           * @param {Integer} wallId Wall ID (User ID)
           */
          function shareToWall(playlistId, wallId) {
            self.sharingToWallProcessing = true;
            PlaylistSDK.shareToWall(playlistId, wallId, {}, false).then(function (response) {
              self.sharingToWallProcessing = false;
              resetShareToWallPopup();
              resetShareToWallPopup();
              dismissPopups();
              if (self.shareCallback) {
                self.shareCallback(response.content);
              }
              alertify.success('Playlist successfully shared.');
            }, function (error) {
              $log.error(error);
              alertify.error('Oops! Something went wrong. Please try again later.');
              self.sharingToWallProcessing = false;
            });
          }

          /**
           * Reset selected user/group
           */
          function removeSelectedItem() {
            self.selectedUser = null;
            self.selectedGroup = null;
          }

          /**
           * Share to group
           *
           * @param {Integer} playlistId Playlist ID
           * @param {Integer} groupId Group ID
           */
          function shareToGroup(playlistId, groupId) {
            self.sharingToWallProcessing = true;
            PlaylistSDK.shareToGroup(playlistId, groupId, {}, false).then(function (response) {
              self.sharingToWallProcessing = false;
              resetShareToWallPopup();
              dismissPopups();
              resetShareToGroupPopup();
              alertify.success('Playlist successfully shared.');
              if (self.shareCallback) {
                self.shareCallback(response.content);
              }
            }, function (error) {
              $log.error(error);
              alertify.error('Oops! Something went wrong. Please try again later.');
              self.sharingToWallProcessing = false;
            });
          }

          /**
           * Dismiss popup
           */
          function dismissPopups() {
            angular.element('#shareToWall' + self.randId).modal('hide');
            angular.element('#shareToGroup' + self.randId).modal('hide');
          }

          /**
           * Save playlist to my playlists collection
           *
           * @param {Integer} playlistId Playlist ID
           */
          function savePlaylist(playlistId) {
            PlaylistSDK.savePlaylist(playlistId, {}, false).then(function () {
              alertify.success('Playlist saved.');
            }, function (error) {
              $log.error(error);
              alertify.error(error.message);
            });
          }
        },
        bindToController: true,
        controllerAs: 'sharePlaylist',
        link: function postLink(scope, elem) {
          scope.resetGroup = function () {
            $timeout(function () {
              scope.sharePlaylist.resetShareToGroupPopup();
            }, 500);
          };
          scope.resetWall = function () {
            $timeout(function () {
              scope.sharePlaylist.resetShareToWallPopup();
            }, 500);
          };
          scope.focusOnGroup = function () {
            $timeout(function () {
              elem.find('#group-name-search').focus();
            });
          };
        }
      };
    });
