angular
  .module('app')
  .component('wallCom', {
    templateUrl: 'app/wall/template/wall.html',
    controller: function ($state, $stateParams, $log, $q, $filter, $rootScope, WallSDK, UserSDK, HorseSDK, PublicProfileSDK, ConnectionsSDK, NotificationsSDK, EventsSDK, SETTINGS, blockUI, alertify) {
      var self = this;

      self.posts = [];
      self.badges = [];
      self.notifications = [];
      self.myevents = [];
      self.selectedWallPostPrivacy = String(9999);
      self.wallType = 'my';
      self.summernoteOptions = SETTINGS.SUMMERNOTE_CONFIG;
      self.liveWallFiltersOptions = {
        filters: [
          {type: 'all', label: 'All'},
          {type: 'connected', label: 'Connected'},
          {type: 'instructor', label: 'Instructor'},
          {type: 'staff', label: 'Staff'}
        ],
        updates: {
          wall: [{type: 'WallPost'}, {type: 'Playlist'}],
          horse: [{type: 'HorseHealth'}, {type: 'HorseProgress'}, {type: 'WallSolutionmapPost'}]
        }
      };

      // User roles
      var _userRole = UserSDK.getUserRole();
      self.ownerId = UserSDK.getUserId();
      self.isOwner = false;
      self.rootAccess = false;
      self.wallId = null;
      self.selectedHorse = HorseSDK.getCurrentHorse();
      self.externalUser = null;

      // Pagination
      var _postIndex = 1;
      var _paginationLimit = 10;
      var _hasPosted = false;
      self._postReachedEnd = false;

      // Loaders
      const postLoad = blockUI.instances.get("groupsPostsLoading");
      const badgesLoad = blockUI.instances.get("sidebarBadgesLoading");
      const userLoad = blockUI.instances.get("userLoading");
      const notificationLoad = blockUI.instances.get('notificationsLoading');
      const myeventLoad = blockUI.instances.get('myeventsLoading');
      self.createProcessing = false;
      self.likeProcessing = false;
      self.hasUserLoaded = false;

      // Models
      self.postModel = "";
      self.attachedFiles = [];

      // Controls
      self.uploadCtrl = {};

      /**
       * Merge two arrays
       *
       * @param {Array} arr1 Array 1
       * @param {Array} arr2 Array 2
       * @returns Merge array
       */
      function mergeArray(arr1, arr2) {
        var temp = arr1;
        if (_hasPosted) {
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
       * Get public user object
       *
       * @param {Integer} userId User ID
       */
      function getUser(userId, callBackFn) {
        userLoad.start();
        PublicProfileSDK.getUser(userId, false).then(function (response) {
          if (response.content) {
            self.externalUser = response.content.user;
          }
          return HorseSDK.getOthersHorses(userId, false);
        }).then(function (response) {
          self.externalUser.horses = response.content;
          callBackFn();
          userLoad.stop();
        }).catch(function (error) {
          $log.error(error);
          userLoad.stop();
        });
      }

      /**
       * Get posts
       *
       * @param {Integer} wallId Wall ID (User's ID)
       * @param {Integer} page Page index
       * @param {Integer} limit Page limit
       */
      function getPosts(wallId, page, limit) {
        var deferred = $q.defer();
        self.postLoadIsProcessing = true;
        WallSDK.getPosts(wallId, page, limit, true).then(function (response) {
          if (response.content === null) {
            self._postReachedEnd = true;
          } else if (response.content.length < limit) {
            self.posts = mergeArray(self.posts, response.content);
            self._postReachedEnd = true;
          } else if (!response.content.length < limit) {
            self.posts = mergeArray(self.posts, response.content);
          }
          _postIndex += 1;
          self.postLoadIsProcessing = false;
          deferred.resolve();
        }, function (error) {
          $log.error(error);
          self._postReachedEnd = true;
          self.postLoadIsProcessing = false;
          deferred.reject();
        });
        return deferred.promise;
      }

      /**
       * Init for `getPosts`
       */
      function _getPosts() {
        postLoad.start();
        _resetPosts();
        resetFiltersOptions();
        getPosts(self.wallId, _postIndex, _paginationLimit).then(function () {
          postLoad.stop();
        }, function () {
          postLoad.stop();
        });
      }

      /**
       * Get public wall posts
       *
       * @param {Integer} page Page index
       * @param {Integer} limit Page limit
       * @returns Posts
       */
      function getPublicPosts(page, limit, type, filter) {
        var deferred = $q.defer();
        self.postLoadIsProcessing = true;
        WallSDK.getPublicPosts(page, limit, type, filter, false).then(function (response) {
          if (response.content === null) {
            self._postReachedEnd = true;
          } else if (response.content.length < limit) {
            self.posts = mergeArray(self.posts, response.content);
            self._postReachedEnd = true;
          } else if (!response.content.length < limit) {
            self.posts = mergeArray(self.posts, response.content);
          }
          _postIndex += 1;
          self.postLoadIsProcessing = false;
          deferred.resolve();
        }, function (error) {
          $log.error(error);
          self._postReachedEnd = true;
          self.postLoadIsProcessing = false;
          deferred.reject();
        });
        return deferred.promise;
      }

      /**
       * Init for `getPublicPosts`
       */
      function _getPublicPosts() {
        postLoad.start();
        _resetPosts();
        resetFiltersOptions();
        var filters = self.liveWallFilters.updates.wall;
        getPublicPosts(_postIndex, _paginationLimit, self.liveWallFilters.filter.type, angular.toJson(filters)).then(function () {
          postLoad.stop();
        }, function () {
          postLoad.stop();
        });
      }

      function _resetPosts() {
        self.posts = [];
        _postIndex = 1;
        self._postReachedEnd = false;
      }

      /**
       * Reset Filters and Options
       */
      function resetFiltersOptions() {
        self.liveWallFilters = {
          filter: self.liveWallFiltersOptions.filters[0],
          updates: {
            wall: self.liveWallFiltersOptions.updates.wall,
            horse: -1
          }
        };
      }

      /**
       * Filter public posts
       *
       * @param {String} type Selected filter type (all, connected, instructor, staff)
       */
      function filterPublicPosts(type, filter) {
        postLoad.start();
        var filters = [];

        if (filter.wall === -1 && filter.horse === -1) {
          self.liveWallFilters.updates.wall = self.liveWallFiltersOptions.updates.wall;
          self.liveWallFilters.updates.horse = self.liveWallFiltersOptions.updates.horse;
          filters = self.liveWallFilters.updates.wall.concat(self.liveWallFilters.updates.horse);
        } else {
          filters = mergeFilters(filter);
        }

        _resetPosts();
        getPublicPosts(_postIndex, _paginationLimit, type, angular.toJson(filters)).then(function () {
          postLoad.stop();
        }, function () {
          postLoad.stop();
        });
      }

      /**
       * Merge filters
       *
       * @param {Object} filters Selected filters object
       * @returns Merged filters array
       */
      function mergeFilters(filters) {
        var filter = [];
        for (var prop in filters) {
          if (filters.hasOwnProperty(prop)) {
            if (filters[prop] !== -1) {
              filter = filter.concat(filters[prop]);
            }
          }
        }
        return filter;
      }

      /**
       * Create a group post
       *
       * @param {Integer} wallId Wall ID (User's ID)
       * @param {String} post Post content
       */
      function createPost(wallId, post) {
        self.createProcessing = true;
        var payload = {
          content: post ? post : ''
        };
        if (self.selectedWallPostPrivacy !== '9999') {
          payload.privacy = Number(self.selectedWallPostPrivacy);
        }
        function checkFilter(push) {
          if (self.liveWallFilters.filter.type === 'all' && self.liveWallFilters.updates.wall === self.liveWallFiltersOptions.updates.wall) {
            push();
          }
        }
        WallSDK.createPost(wallId, payload, false).then(function (response) {
          if (response.status === 200) {
            if (self.attachedFiles.length > 0) {
              var attachmentChain = [];
              angular.forEach(self.attachedFiles, function (value) {
                attachmentChain.push(WallSDK.addPostAttachment(wallId, response.content.id, {
                  attachment: value
                }).then(function (response) {
                  return response;
                }));
              });
              $q.all(attachmentChain).then(function (response) {
                var attachmentResponse = response[0];
                angular.forEach(response, function (value) {
                  if (attachmentResponse.content.wall_post_attachment.length < value.content.wall_post_attachment.length) {
                    attachmentResponse = value;
                  }
                });
                checkFilter(function () {
                  self.posts.push(attachmentResponse.content);
                });
                self.uploadCtrl.reset();
                _hasPosted = true;
                alertify.success('Post has been successfully added.');
                self.postModel = "";
                self.attachedFiles = [];
                self.createProcessing = false;
                self.selectedWallPostPrivacy = String(9999);
              });
            } else {
              checkFilter(function () {
                self.posts.push(response.content);
              });
              _hasPosted = true;
              alertify.success('Post has been successfully added.');
              self.postModel = "";
              self.attachedFiles = [];
              self.createProcessing = false;
              self.selectedWallPostPrivacy = String(9999);
            }
          } else {
            alertify.error(response.message);
          }
        }, function (error) {
          $log.error(error);
          self.createProcessing = false;
          alertify.error("Something went wrong! Please try again later.");
        });
      }

      /**
       * Trigger `multi-upload` to attach files
       */
      function attachFile() {
        self.uploadCtrl.triggerFileInput();
      }

      /**
       * Remove an attached file
       *
       * @param {Integer} index Index of the attached file
       */
      function removeAttachedFile(index) {
        self.uploadCtrl.removeItem(index);
      }

      /**
       * Edit post
       *
       * @param {Integer} postId Post ID
       * @param {String} post Post content
       * @returns Update status
       */
      function editPost(postId, post, postType) {
        switch (postType) {
          case "WallPost":
            wallPostEdit();
            break;
          case "HorseHealth":
            healthLogPostEdit();
            break;
          case "HorseProgress":
            progressLogPostEdit();
            break;

          default: $log.log("Post type not found");
        }

        var deferred = $q.defer();

        function wallPostEdit() {
          WallSDK.editPost(self.wallId, postId, {
            content: post.content,
            privacy: post.privacy
          }, false).then(function (response) {
            if (response.status === 200) {
              alertify.success("Post has been successfully updated.");
            } else {
              alertify.error(response.message);
            }
            deferred.resolve(response);
          }, function (error) {
            $log.error(error);
            deferred.reject(error);
            alertify.error("Something went wrong! Please try again later.");
          });
        }

        function healthLogPostEdit() {
          HorseSDK.editHorseHealthLog(self.wallId, postId, post, false).then(function (response) {
            if (response.status === 200) {
              alertify.success("Post has been successfully updated.");
            } else {
              alertify.error(response.message);
            }
            deferred.resolve(response);
          }, function (error) {
            $log.error(error);
            deferred.reject(error);
            alertify.error("Something went wrong! Please try again later.");
          });
        }

        function progressLogPostEdit() {
          HorseSDK.editHorseProgressLog(self.wallId, postId, post, false).then(function (response) {
            if (response.status === 200) {
              alertify.success("Post has been successfully updated.");
            } else {
              alertify.error(response.message);
            }
            deferred.resolve(response);
          }, function (error) {
            $log.error(error);
            deferred.reject(error);
            alertify.error("Something went wrong! Please try again later.");
          });
        }

        return deferred.promise;
      }

      /**
       * Delete post
       *
       * @param {Integer} postId Post ID
       * @returns Update status
       */
      function deletePost(postId) {
        var deferred = $q.defer();
        WallSDK.deletePost(self.wallId, postId, false).then(function (response) {
          if (response.status === 200) {
            self.posts = $filter('removefromarray')(self.posts, 'id', postId);
            alertify.success("Post has been successfully deleted.");
          } else {
            alertify.error(response.message);
          }
          deferred.resolve(response);
        }, function (error) {
          $log.error(error);
          deferred.reject(error);
          alertify.error("Something went wrong! Please try again later.");
        });
        return deferred.promise;
      }

      /**
       * Like/Dislike a post
       *
       * @param {Integer} postId Post ID
       * @param {Bool} isLiked Liked state
       * @returns Like status
       */
      function likePost(postId, isLiked) {
        var deferred = $q.defer();
        if (isLiked) {
          WallSDK.dislikePost(self.wallId, postId, false).then(function (response) {
            deferred.resolve(response);
          }, function (error) {
            $log.error(error);
            deferred.reject(error);
          });
        } else {
          WallSDK.likePost(self.wallId, postId, false).then(function (response) {
            deferred.resolve(response);
          }, function (error) {
            $log.error(error);
            deferred.reject(error);
          });
        }
        return deferred.promise;
      }

      /**
       * Comment a post
       *
       * @param {Integer} postId Commenting post's ID
       * @param {String} comment Comment content
       * @returns Post status
       */
      function createComment(postId, comment) {
        var deferred = $q.defer();
        WallSDK.createComment(self.wallId, postId, {
          comment: comment.content
        }, false).then(function (response) {
          if (response.status === 200) {
            alertify.success("Your comment has been successfully added.");
          } else {
            alertify.success("Something went wrong. Please try again later.");
          }
          deferred.resolve(response);
        }, function (error) {
          alertify.success("Something went wrong. Please try again later.");
          $log.error(error);
          deferred.reject(error);
        });
        return deferred.promise;
      }

      /**
       * Edit comment
       *
       * @param {Integer} postId Parent post ID
       * @param {Integer} commentId Comment ID
       * @param {String} comment Comment content
       * @returns Update status
       */
      function editComment(postId, commentId, comment) {
        var deferred = $q.defer();
        WallSDK.editComment(self.wallId, postId, commentId, {
          comment: comment.content
        }, false).then(function (response) {
          if (response.status === 200) {
            alertify.success("Your comment has been successfully updated.");
          } else {
            alertify.success("Something went wrong. Please try again later.");
          }
          deferred.resolve(response);
        }, function (error) {
          alertify.success("Something went wrong. Please try again later.");
          $log.error(error);
          deferred.reject(error);
        });
        return deferred.promise;
      }

      /**
       * Delete comment
       *
       * @param {Integer} postId Post ID
       * @param {Integer} commentId Comment ID
       * @returns Delete status
       */
      function deleteComment(postId, commentId) {
        var deferred = $q.defer();
        WallSDK.deleteComment(self.wallId, postId, commentId, false).then(function (response) {
          deferred.resolve(response);
        }, function (error) {
          deferred.reject(error);
        });
        return deferred.promise;
      }

      /**
       * Get comments within a post
       *
       * @param {Integer} postId Parent post's ID
       * @param {Integer} page Page index
       * @returns Comments list
       */
      function getComments(postId, page) {
        var deferred = $q.defer();
        WallSDK.getComments(self.wallId, postId, page, _paginationLimit, true).then(function (response) {
          deferred.resolve(response);
        }, function (error) {
          alertify.error("Something went wrong. Please try again later.");
          $log.error(error);
          deferred.reject(error);
        });
        return deferred.promise;
      }

      /**
       * Get badges for the selected horse
       *
       * @param {Integer} horseId Horse ID
       */
      function getBadges(horseId) {
        badgesLoad.start();
        HorseSDK.getBadges(horseId, true).then(function (response) {
          angular.forEach(response.content, function (level) {
            angular.forEach(level.badges, function (badge) {
              badge.level = level.level;
              if (badge.earned_at) {
                self.badges.push(badge);
              }
            });
          });
          // self.badges = response.content;
          badgesLoad.stop();
        }, function (error) {
          $log.error(error);
          badgesLoad.stop();
        });
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
       * Get notifications
       */
      function getNotifications() {
        notificationLoad.start();
        NotificationsSDK.getNotify(1, 5, null, false).then(function (response) {
          if (response.status === 200) {
            self.notifications = response.content;
          }
          notificationLoad.stop();
        }, function () {
          notificationLoad.stop();
        });
      }

      /**
       * Mark a notification as read
       *
       * @param {Integer} notifyId Notification ID
       * @returns Mark status, marked notification
       */
      function readNotification(notifyId) {
        var deferred = $q.defer();
        NotificationsSDK.readNotify(notifyId).then(function (response) {
          deferred.resolve(response);
        }, function (error) {
          deferred.reject(error);
        });
        return deferred.promise;
      }

      /**
       * Remove a notification as read
       *
       * @param {Integer} notifyId Notification ID
       * @returns Delete status
       */
      function deleteNotification(notifyId) {
        var deferred = $q.defer();
        NotificationsSDK.deleteNotify(notifyId).then(function (response) {
          if (response.status === 200) {
            self.notifications = $filter('removefromarray')(self.notifications, 'id', notifyId);
          }
          deferred.resolve();
        }, function (error) {
          deferred.reject(error);
        });
        return deferred.promise;
      }

      EventsSDK.getMyEvents(1, 3, 0, true).then(function (response) {
        myeventLoad.start();
        self.myevents = response.content;
        $log.debug(response);
        myeventLoad.stop();
      }, function (error) {
        $log.error(error);
        myeventLoad.stop();
      });

      /**
       * Event Item click event
       */
      function onEventItemClicked(eventId, statusLabel) {
        if (statusLabel === "canceled") {
          alertify.log('This event has been cancelled.');
        } else {
          $state.go('eventdetails', ({
            eventid: eventId
          }));
        }
      }

      /**
       * Capture shared playlist callback
       *
       * @param {Object} payload Shared playlist
       */
      function playlistShared(payload) {
        if (payload.user_id === self.wallId) {
          self.posts.push(payload);
        }
      }

      /**
       * Public methods
       */
      // Posts
      self.createPost = createPost;
      // self.attachGroupPost = attachPost;
      self.editPost = editPost;
      self.deletePost = deletePost;
      self.likePost = likePost;
      self.onLoadMorePostsClicked = function () {
        getPosts(self.wallId, _postIndex, _paginationLimit);
      };
      self.onLoadMorePublicPostsClicked = function (filter, updates) {
        var updateFilters = angular.toJson(mergeFilters(updates));
        getPublicPosts(_postIndex, _paginationLimit, filter.type, updateFilters);
      };
      self.loadPersonalWall = _getPosts;
      self.loadPublicWall = _getPublicPosts;
      self.attachClicked = attachFile;
      self.removeAttachedFileClicked = removeAttachedFile;
      self.filterPublicPosts = filterPublicPosts;

      // Comments
      self.getComments = getComments;
      self.commentPost = createComment;
      self.editComment = editComment;
      self.deleteComment = deleteComment;

      // Connections
      self.connect = connect;
      self.disconnect = disconnect;

      // Sidebar
      self.readNotification = readNotification;
      self.deleteNotification = deleteNotification;
      self.onEventItemClicked = onEventItemClicked;

      // Playlist
      self.playlistShared = playlistShared;

      /**
       * Init
       */
      function _init() {
        self.wallId = Number($stateParams.userid);
        self.wallType = $stateParams.public ? 'parelli' : 'my';
        if (self.wallId && !isNaN(self.wallId)) {
          if (self.wallType === 'my') {
            _getPosts();
          } else {
            _getPublicPosts();
          }
          if (self.ownerId === self.wallId) {
            self.isOwner = true;
            self.hasUserLoaded = true;
            getNotifications();
            var newUserNotify = $rootScope.$on(SETTINGS.NOTIFICATION.NOTIFY, function (event, data) {
              self.notifications = self.notifications.concat(data);
            });
            $rootScope.$on('$destroy', newUserNotify);
            if (self.selectedHorse) {
              getBadges(self.selectedHorse.id);
            }
          } else {
            getUser(self.wallId, function () {
              self.hasUserLoaded = true;
            });
          }
        }
        if (_userRole === 'admin' || _userRole === 'super_admin') {
          self.rootAccess = true;
        }
      }
      _init();
    }
  });
