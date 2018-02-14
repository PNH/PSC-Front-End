angular
  .module('app')
  .component('groupsDetailCom', {
    templateUrl: 'app/groups/template/detail.html',
    controller: function ($stateParams, $log, $q, $filter, UserSDK, GroupsSDK, SETTINGS, blockUI, alertify) {
      var self = this;

      self.groupId = null;
      self.posts = [];
      self.isMember = true;
      self.group = null;

      self.summernoteOptions = SETTINGS.SUMMERNOTE_CONFIG;
      self.summernoteOptions.placeholder = 'What\'s New';

      // Pagination
      var _postIndex = 1;
      var _paginationLimit = 10;
      var _hasPosted = false;
      self._postReachedEnd = false;

      // Loaders
      const postLoad = blockUI.instances.get("groupsPostsLoading");
      self.createProcessing = false;
      self.likeProcessing = false;

      // Models
      self.postModel = "";
      self.attachedFiles = [];

      // User roles
      var _userRole = UserSDK.getUserRole();
      self.rootAccess = false;

      // Multi upload controller
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
          _getPosts(self.groupId, _postIndex, _paginationLimit);
        }, function (error) {
          alertify.success("Failed to join the group.");
          deferred.reject(error);
        });
        return deferred.promise;
      }

      /**
       * Get group
       *
       * @param {Integer} groupId Group ID
       * @returns Group Details
       */
      function getGroup(groupId) {
        var deferred = $q.defer();
        GroupsSDK.getGroup(groupId).then(function (response) {
          deferred.resolve(response);
        }, function (error) {
          deferred.reject(error);
        });
        return deferred.promise;
      }

      /**
       * Get posts
       *
       * @param {Integer} groupId Group ID
       * @param {Integer} page Page index
       * @param {Integer} limit Page limit
       */
      function getPosts(groupId, page, limit) {
        var deferred = $q.defer();
        self.postLoadIsProcessing = true;
        GroupsSDK.getPosts(groupId, page, limit, false).then(function (response) {
          if (response.content === null) {
            self._postReachedEnd = true;
            // alertify.error('No more posts to load.');
          } else if (response.content.length < limit) {
            self.posts = mergeArray(self.posts, response.content);
            self._postReachedEnd = true;
          } else if (!response.content.length < limit) {
            self.posts = mergeArray(self.posts, response.content);
          }
          _postIndex += 1;
          self.postLoadIsProcessing = false;
          self.isMember = true;
          deferred.resolve();
        }, function (error) {
          $log.error(error);
          switch (error.status) {
            case 400:
              self.isMember = false;
              break;
            case 404:
              self.isMember = true;
              break;
            default:
              self.isMember = false;
          }
          self._postReachedEnd = true;
          self.postLoadIsProcessing = false;
          deferred.reject();
        });
        return deferred.promise;
      }

      /**
       * Init for `getPosts`
       */
      function _getPosts(groupId, page, limit) {
        postLoad.start();
        getGroup(groupId).then(function (response) {
          self.group = response.content;
          return getPosts(groupId, page, limit);
        }).then(function () {
          postLoad.stop();
        }, function () {
          postLoad.stop();
        });
      }

      /**
       * Create a group post
       *
       * @param {String} post Post content
       */
      function createPost(post) {
        self.createProcessing = true;
        GroupsSDK.createPost(self.groupId, {
          content: post ? post : ''
        }, false).then(function (response) {
          if (response.status === 200) {
            if (self.attachedFiles.length > 0) {
              var attachmentChain = [];
              angular.forEach(self.attachedFiles, function (value) {
                attachmentChain.push(GroupsSDK.addPostAttachment(self.groupId, response.content.id, {
                  document: value
                }).then(function (response) {
                  return response;
                }));
              });
              $q.all(attachmentChain).then(function (response) {
                var attachmentResponse = response[0];
                angular.forEach(response, function (value) {
                  if (attachmentResponse.content.group_post_attachment.length < value.content.group_post_attachment.length) {
                    attachmentResponse = value;
                  }
                });
                self.posts.push(attachmentResponse.content);
                self.uploadCtrl.reset();
                _hasPosted = true;
                alertify.success('Post has been successfully added.');
                self.postModel = "";
                self.attachedFiles = [];
                self.createProcessing = false;
              });
            } else {
              self.posts.push(response.content);
              _hasPosted = true;
              alertify.success('Post has been successfully added.');
              self.postModel = "";
              self.attachedFiles = [];
              self.createProcessing = false;
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
       * Attach an file to a post
       *
       * @param {Integer} postId Post ID
       * @param {File} attachment Attached file object
       * @returns Post status
       */
      function attachPost(postId, attachment) {
        var deferred = $q.defer();
        GroupsSDK.addPostAttachment(self.groupId, postId, attachment, false).then(function (response) {
          if (response.status === 200) {
            alertify.success("Post has been successfully added.");
            self.posts.unshift(response.content);
            _hasPosted = true;
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
       * Edit post
       *
       * @param {Integer} postId Post ID
       * @param {String} post Post content
       * @returns Update status
       */
      function editPost(postId, post) {
        var deferred = $q.defer();
        GroupsSDK.editPost(self.groupId, postId, {
          content: post.content
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
        GroupsSDK.deletePost(self.groupId, postId, false).then(function (response) {
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
          GroupsSDK.dislikePost(self.groupId, postId, false).then(function (response) {
            deferred.resolve(response);
          }, function (error) {
            $log.error(error);
            deferred.reject(error);
          });
        } else {
          GroupsSDK.likePost(self.groupId, postId, false).then(function (response) {
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
      function commentPost(postId, comment) {
        var deferred = $q.defer();
        GroupsSDK.commentPost(self.groupId, postId, {
          comment: comment.content,
          parentId: postId
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
        GroupsSDK.editComment(self.groupId, postId, commentId, {
          comment: comment.content,
          parentId: postId
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
        GroupsSDK.deleteComment(self.groupId, postId, commentId, false).then(function (response) {
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
        GroupsSDK.getComments(self.groupId, postId, page, _paginationLimit, false).then(function (response) {
          deferred.resolve(response);
        }, function (error) {
          alertify.error("Something went wrong. Please try again later.");
          $log.error(error);
          deferred.reject(error);
        });
        return deferred.promise;
      }

      /**
       * Capture shared playlist callback
       *
       * @param {Object} payload Shared playlist
       */
      function playlistShared(payload) {
        if (payload.group_id === self.groupId) {
          self.posts.push(payload);
        }
      }

      /**
       * Public methods
       */
      self.joinNow = joinGroup;

      // Posts
      self.createGroupPost = createPost;
      self.attachGroupPost = attachPost;
      self.editPost = editPost;
      self.deletePost = deletePost;
      self.likePost = likePost;
      self.onLoadMorePostsClicked = function () {
        getPosts(self.groupId, _postIndex, _paginationLimit);
      };
      self.attachClicked = attachFile;
      self.removeAttachedFileClicked = removeAttachedFile;

      // Comments
      self.getComments = getComments;
      self.commentPost = commentPost;
      self.editComment = editComment;
      self.deleteComment = deleteComment;

      // Playlist
      self.playlistShared = playlistShared;

      /**
       * Init
       */
      function _init() {
        self.groupId = Number($stateParams.groupid);
        if (self.groupId && !isNaN(self.groupId)) {
          _getPosts(self.groupId, _postIndex, _paginationLimit);
        }
        if (_userRole === 'admin' || _userRole === 'super_admin') {
          self.rootAccess = true;
        }
      }
      _init();
    }
  });
