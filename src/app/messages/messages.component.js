angular
  .module('app')
  .component('messagesCom', {
    templateUrl: 'app/messages/template/messages.html',
    controller: function ($q, $log, $stateParams, $filter, $state, ConnectionsSDK, MessagesSDK, UserSDK, alertify) {
      var self = this;

      var _friendlyMessage = "Please search for a Connection on the left to start a private conversation.";
      self.pagination = 8;
      self.pageIndex = 1;
      self.people = [];
      self.query = "";
      self.threads = [];
      self.selectedUserId = null;
      self.messages = null;
      self.me = UserSDK.getUser();
      self.isProcessing = false;
      self.isSearching = false;
      self.isLoading = false;
      self.isMoreMessagesAvailable = true;
      self.friendlyLabel = "No messages";
      self.deleteProcessing = false;
      $log.debug(self.me);

      if ($stateParams.userid) {
        // self.selectedUserId = $stateParams.userid;
        self.friendlyLabel = _friendlyMessage;
        self.messages = null;
        // getMessageHistory(self.selectedUserId, self.pageIndex, self.pagination, 0);
      }

      loadChatUsers();

      // Events
      self.onSearch = function onSearch(query) {
        if (query.length > 0) {
          $log.debug(query);
          var search = {
            radius: -1,
            page: 1,
            limit: 30,
            query: query
          };
          self.threads = null;
          self.isSearching = true;
          MessagesSDK.searchPeople(search, false).then(function (response) {
            if (response.content) {
              self.threads = [];
              angular.forEach(response.content, function (user) {
                var _name = user.user.firstName + " " + user.user.lastName;
                self.threads.push({
                  id: user.user.id,
                  username: _name
                });
              });
              $log.debug(self.threads);
            }
            self.isSearching = false;
          }, function (error) {
            $log.error(error);
            self.isSearching = false;
          });
        } else {
          loadChatUsers();
        }
      };

      self.onUserThreadClicked = function (id, thread) {
        self.pageIndex = 1;
        self.selectedUserId = id;
        self.pageIndex = 1;
        self.messages = null;
        self.isMoreMessagesAvailable = true;
        thread.unread = 0;
        getMessageHistory(id, self.pageIndex, self.pagination, 0);
      };

      self.deleteConversation = function (threadId) {
        alertify.okBtn("yes").cancelBtn("no").confirm("Are you sure you want to delete this entire conversation?", function (ev) {
          ev.preventDefault();
          self.deleteProcessing = true;
          MessagesSDK.deleteConversation(threadId, false).then(function (response) {
            if (response.status === 200) {
              self.threads = $filter('removefromarray')(self.threads, 'id', threadId);
              alertify.success('Conversation deleted successfully.');
              resetWindow();
            }
            self.deleteProcessing = false;
          }, function (error) {
            $log.error(error);
            self.deleteProcessing = false;
            alertify.error('Oops! Something went wrong. Please try again later.');
          });
        }, function (ev) {
          ev.preventDefault();
        });
      };

      self.onReplyClicked = function (message) {
        if (angular.isDefined(message)) {
          self.isProcessing = true;
          MessagesSDK.sendMessage(message, [self.selectedUserId]).then(function (response) {
            $log.debug(response);
            if (response.status === 200) {
              if (self.messages === null) {
                self.messages = [];
              }
              self.messages.push(response.content);
              self.message = null;
            } else {

            }
            self.isProcessing = false;
          }, function (error) {
            $log.error(error);
            self.isProcessing = false;
          });
        } else {}
      };

      self.onLoadMoreClicked = function () {
        var deferred = $q.defer();
        getMessageHistory(self.selectedUserId, ++self.pageIndex, self.pagination, 0).then(function () {
          deferred.resolve();
        }, function () {
          deferred.reject();
        });
        return deferred.promise;
      };

      self.goToWall = function (id) {
        if (id > 0) {
          $state.go('wall', {
            userid: id
          });
        }
      };

      // Private
      function loadChatUsers() {
        self.threads = [];
        self.isSearching = true;
        MessagesSDK.getChatUsers(true).then(function (response) {
          if (response.content) {
            angular.forEach(response.content, function (user) {
              var _name = user.firstName + " " + user.lastName;
              self.threads.push({
                id: user.id,
                username: _name,
                unread: user.unread_messages_count
              });
            });
          }
          self.isSearching = false;
        }, function (error) {
          $log.error(error);
          self.isSearching = false;
        });
      }

      function resetWindow() {
        self.messages = null;
        self.selectedUserId = null;
        self.friendlyLabel = _friendlyMessage;
        loadChatUsers();
      }

      function getMessageHistory(userId, page, limit, index) {
        var deferred = $q.defer();
        $log.debug("getMessageHistory");
        self.friendlyLabel = "";
        self.isLoading = true;
        MessagesSDK.getMessages(userId, page, limit, index, false).then(function (response) {
          if (response.content) {
            if (self.messages && self.messages.length > 0) {
              $log.debug("merging");
              self.messages = self.messages.concat(response.content);
            } else {
              $log.debug("creating");
              self.messages = response.content;
            }
            $log.debug(self.messages);
            deferred.resolve();
          } else {
            self.isMoreMessagesAvailable = false;
            self.friendlyLabel = "No messages";
          }
          self.isLoading = false;
        }, function (error) {
          $log.error(error);
          self.friendlyLabel = "No messages";
          self.isLoading = false;
          self.isMoreMessagesAvailable = false;
          deferred.reject();
        });
        return deferred.promise;
      }
    }
  });
