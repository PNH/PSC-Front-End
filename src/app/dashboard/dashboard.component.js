angular
  .module('app')
  .component('dashboardCom', {
    templateUrl: 'app/dashboard/template/dashboard.html',
    controller: function ($log, $state, $rootScope, $stateParams, $scope, $filter, $q, $timeout, $sce, SETTINGS, HorseSDK, LearninglibSDK, UserSDK, NotificationsSDK, EventsSDK, SavvyEssentialsSDK, WallSDK, PlaylistSDK, alertify, blockUI, moment) {
      var self = this;
      const savvyload = blockUI.instances.get('savvystatusLoading');
      const featuredload = blockUI.instances.get('featuredloading');
      const notificationLoad = blockUI.instances.get('notificationsLoading');
      const myeventLoad = blockUI.instances.get('myeventsLoading');
      const savvyEssentialLoad = blockUI.instances.get('savvyEssentialsLoading');
      const parelliWallLoad = blockUI.instances.get('parelliWallLoading');
      self.badges = [];
      self.featured = [];
      self.level = null;
      self.notifications = [];
      self.myevents = [];
      self.wallId = UserSDK.getUserId();
      self.posts = [];
      self.rootAccess = false;
      self.userPlaylist = null;
      self.addtoplaylistPopupClicked = false;

      featuredload.start();
      function getLearningLibrary() {
        LearninglibSDK.getFeatured(true).then(function (response) {
          self.featured = response.content;
          $log.debug(response);
          featuredload.stop();
        }, function (error) {
          $log.error(error);
          featuredload.stop();
        });
      }
      getLearningLibrary();

      /**
       * My event API call
       */
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
       * Savvy Essentials API call
      */
      SavvyEssentialsSDK.getSavvyEssentials(moment().format("YYYY-MM-DD"), true).then(function (response) {
        self.savvyEssentials = response.content;
        savvyEssentialLoad.stop();
      }, function (error) {
        $log.error(error);
        savvyEssentialLoad.stop();
      });

      /**
       * Event Item click event
       */
      function onEventItemClicked(eventId, statusLabel) {
        if (statusLabel === "canceled") {
          // alertify.log('This event has been cancelled.');
          $state.go('eventdetails', ({eventid: eventId}));
        } else {
          $state.go('eventdetails', ({
            eventid: eventId
          }));
        }
      }

      if (angular.isDefined($stateParams.horseid) && $stateParams.horseid) {
        self.horseid = parseInt($stateParams.horseid, 10);
        HorseSDK.getBadges(self.horseid, true).then(function (response) {
          angular.forEach(response.content, function (level) {
            angular.forEach(level.badges, function (badge) {
              badge.level = level.level;
              if (badge.earned_at) {
                self.badges.push(badge);
              }
              // _tmpbadges.push(badge);
            });
            // _tmpbadges = _tmpbadges.concat(level.badges);
          });
          $log.warn(self.badges);
          // angular.forEach(_tmpbadges, function (badge) {
          //   if (badge.earned_at) {
          //     self.badges.push(badge);
          //   }
          // });
          $log.debug(self.badges);
        }, function (error) {
          $log.error(error);
        });

        savvyload.start();
        HorseSDK.getSavvyStatus(self.horseid, true).then(function (response) {
          self.levels = response.content;
          savvyload.stop();
        }, function (error) {
          $log.error(error);
          savvyload.stop();
        });
      } else {
        alertify.okBtn("YES").cancelBtn("LATER").confirm("Looks like you don't have any horses in your stall. Want to add one now?", function () {
          // user clicked "ok"
          $state.go('onboard.goals');
        }, function () {
          // user clicked "cancel"
        });
      }

      self.onVideoItemClicked = function onVideoItemClicked(index) {
        self.selectedVideo = self.featured[index];
      };

      self.stopPlayer = function stopPlayer() {
        $scope.$evalAsync(function () {
          self.selectedVideo = false;
        });
      };

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

      /**
       * Get public wall posts
       *
       * @param {Integer} page Page index
       * @param {Integer} limit Page limit
       * @returns Posts
       */
      function getPublicPosts(page, limit) {
        var deferred = $q.defer();
        var filters = [{type: 'WallPost'}, {type: 'Playlist'}];
        WallSDK.getPublicPosts(page, limit, 'all', angular.toJson(filters), false).then(function (response) {
          self.posts = response.content;
          deferred.resolve();
        }, function (error) {
          $log.error(error);
          deferred.reject();
        });
        return deferred.promise;
      }

      /**
       * Init for `getPublicPosts`
       */
      function _getPublicPosts() {
        parelliWallLoad.start();
        getPublicPosts(1, 5).then(function () {
          parelliWallLoad.stop();
        }, function () {
          parelliWallLoad.stop();
        });
      }

      /**
       * Edit post
       *
       * @param {Integer} postId Post ID
       * @param {String} post Post content
       * @returns Update status
       */
      function editPost(postId, post, postType) {
        var deferred = $q.defer();
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
            _getPublicPosts();
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
            alertify.error("Something went wrong. Please try again later.");
          }
          deferred.resolve(response);
        }, function (error) {
          alertify.error("Something went wrong. Please try again later.");
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
        WallSDK.getComments(self.wallId, postId, page, 5, true).then(function (response) {
          deferred.resolve(response);
        }, function (error) {
          alertify.error("Something went wrong. Please try again later.");
          $log.error(error);
          deferred.reject(error);
        });
        return deferred.promise;
      }

      /**
       * Get user playlist
       */
      function getUserPlaylist() {
        PlaylistSDK.getLists().then(function (response) {
          self.userPlaylist = response.content;
        },
        function (error) {
          self.userPlaylist = [];
          $log.error(error);
        });
      }
      getUserPlaylist();

      /**
       * Trigger user playlist
      */
      self.triggerUserPlaylist = function triggerUserPlaylist(video, videoPlaylist) {
        self.addtoplaylistPopupClicked = true;
        $timeout(function () {
          self.triggerCtrl(video, videoPlaylist);
        }, 100);
      };

      /**
       * Add to playlist function
      */
      self.onAddToPlaylist = function onAddToPlaylist(videoId, playlistId, alredyIn) {
        if (alredyIn) {
          PlaylistSDK.deleteResource(playlistId, videoId).then(function (response) {
            $log.debug(response);
            alertify.success("Resource removed from playlist");
            // getLearningLibrary();

            for (var v = 0; v < self.featured.length; v++) {
              if (self.featured[v].id === videoId) {
                for (var p = 0; p < self.featured[v].playlist.length; p++) {
                  if (self.featured[v].playlist[p] === playlistId) {
                    self.featured[v].playlist.splice(p, 1);
                  }
                }
              }
            }
          },
          function (error) {
            $log.error(error);
          });
        } else {
          PlaylistSDK.addResource(playlistId, videoId).then(function (response) {
            $log.debug(response);
            alertify.success("Resource added to playlist");
            // getLearningLibrary();

            for (var v = 0; v < self.featured.length; v++) {
              if (self.featured[v].id === videoId) {
                self.featured[v].playlist.push(playlistId);
              }
            }
          },
          function (error) {
            $log.error(error);
          });
        }
      };

      /**
       * Public methods
       */
      self.readNotification = readNotification;
      self.deleteNotification = deleteNotification;
      self.onEventItemClicked = onEventItemClicked;

      // Comments
      self.getComments = getComments;
      self.commentPost = createComment;
      self.editComment = editComment;
      self.deleteComment = deleteComment;

      self.editPost = editPost;
      self.deletePost = deletePost;
      self.likePost = likePost;

      function __init() {
        getNotifications();
        _getPublicPosts();
        var newUserNotify = $rootScope.$on(SETTINGS.NOTIFICATION.NOTIFY, function (event, data) {
          self.notifications = self.notifications.concat(data);
        });
        $rootScope.$on('$destroy', newUserNotify);
      }
      __init();
    }
  });
