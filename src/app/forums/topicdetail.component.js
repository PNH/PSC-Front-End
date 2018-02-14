angular
  .module('app')
  .component('topicDetailCom', {
    templateUrl: 'app/forums/template/topicdetail.html',
    controller: function ($state, $stateParams, $log, $q, $filter, ForumsSDK, UserSDK, blockUI, SETTINGS, alertify) {
      var self = this;
      // const postsLoad = blockUI.instances.get('postsLoading');

      self.subForumId = null;
      self.topicId = null;
      self.topic = null;
      self.posts = [];

      self.summernoteOptions = SETTINGS.SUMMERNOTE_CONFIG;

      // Pagination
      var _postsIndex = 1;
      var _postsLimit = 8;
      var _commentsLimit = 5;
      var _hasCreatedPost = false;
      self.postsReachedEnd = false;

      // User roles
      var _userRole = UserSDK.getUserRole();
      self.rootAccess = false;

      // Loaders
      const topicDetailLoad = blockUI.instances.get('topicDetailLoading');
      self.postsLoadIsProcessing = false;
      self.postCreationProcessing = false;
      self.topicEditIsProcessing = false;

      // Models
      self.postModel = '';
      self.editTopic = null;
      self.attachment = [];

      // Controls
      self.multiUploadControls = {};

      /**
       * Merge two arrays
       *
       * @param {Array} arr1 Array 1
       * @param {Array} arr2 Array 2
       * @param {Bool} hasCreated Flag to test the first array has elements from the second array
       * @returns Merge array
       */
      function mergeArray(arr1, arr2, hasCreated) {
        var temp = arr1;
        if (hasCreated) {
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
       * Get topic
       *
       * @param {Integer} topicId Topic ID
       * @param {Integer} limit Number of posts should contain in the topic
       */
      function _getTopicDetail(topicId, limit) {
        topicDetailLoad.start();
        ForumsSDK.getTopic(topicId, limit, false).then(function (response) {
          self.topic = response.content;
          if (response.content.posts.length === 0) {
            self.postsReachedEnd = true;
          } else if (response.content.posts.length < limit) {
            self.posts = response.content.posts;
            self.postsReachedEnd = true;
          } else if (!response.content.posts.length < limit) {
            self.posts = response.content.posts;
          }
          _postsIndex += 1;
          topicDetailLoad.stop();
          self.editTopic = {
            title: self.topic.title,
            description: self.topic.description
          };
        }, function (error) {
          $log.error(error);
          alertify.error('Oops! Something went wrong. Please try again later.');
        });
      }

      /**
       * Edit topic
       *
       * @param {Integer} subforumId Subforum ID
       * @param {Integer} topicId Topic ID
       * @param {String} content Topic content
       */
      function editTopic(subforumId, topicId, content) {
        self.topicEditIsProcessing = true;
        content.id = topicId;
        content.status = 1;
        content.privacy = 1;
        ForumsSDK.editTopic(subforumId, content, false).then(function (response) {
          if (response.status === 200) {
            alertify.success("Topic has been successfully updated.");
            self.topic.title = response.content.title;
            self.topic.description = response.content.description;
            self.editTopic = {
              title: self.topic.title,
              description: self.topic.description
            };
          } else {
            alertify.error(response.message);
          }
          resetEditTopic();
        }, function (error) {
          $log.error(error);
          alertify.error("Something went wrong! Please try again later.");
          resetEditTopic();
        });
      }

      function resetEditTopic() {
        self.topicEditIsProcessing = false;
        angular.element('#editTopic').modal('hide');
      }

      /**
       * Delete topic
       *
       * @param {Integer} subforumId Subforum ID
       * @param {Integer} topicId Topic ID
       */
      function deleteTopic(subforumId, topicId) {
        alertify.okBtn("yes").cancelBtn("no").confirm("Are you sure you want to delete this topic?", function () {
          ForumsSDK.deleteTopic(subforumId, topicId, false).then(function (response) {
            if (response.status === 200) {
              alertify.success("Topic has been successfully deleted.");
              $state.go('subforums', {
                subforumid: self.subForumId
              });
            } else {
              alertify.error(response.message);
            }
          }, function (error) {
            $log.error(error);
            alertify.error("Something went wrong! Please try again later.");
          });
        });
      }

      /**
       * Get posts
       *
       * @param {Integer} topicId Topic ID
       * @param {Integer} page Page index
       * @param {Integer} limit Page limit
       */
      function getPosts(topicId, page, limit) {
        self.postsLoadIsProcessing = true;
        ForumsSDK.getPosts(topicId, page, limit, false).then(function (response) {
          if (response.content === null) {
            self.postsReachedEnd = true;
            alertify.error('No more replies to load.');
          } else if (response.content.length < limit) {
            self.posts = mergeArray(self.posts, response.content, _hasCreatedPost);
            self.postsReachedEnd = true;
          } else if (!response.content.length < limit) {
            self.posts = mergeArray(self.posts, response.content, _hasCreatedPost);
          }
          _postsIndex += 1;
          self.postsLoadIsProcessing = false;
        }, function (error) {
          $log.error(error);
          self.postsReachedEnd = true;
          alertify.error('No more replies to load.');
          self.postsLoadIsProcessing = false;
        });
      }

      /**
       * Create post
       *
       * @param {Integer} topicId Topic ID
       * @param {String} content Post content
       */
      function createPost(topicId, post) {
        self.postCreationProcessing = true;
        ForumsSDK.createPost(topicId, {
          content: post ? post : ''
        }).then(function (response) {
          if (response.status === 200) {
            if (self.attachment.length > 0) {
              var attachmentChain = [];
              angular.forEach(self.attachment, function (value) {
                attachmentChain.push(ForumsSDK.addPostAttachment(topicId, response.content.id, {
                  attachment: value
                }).then(function (response) {
                  return response;
                }));
              });
              $q.all(attachmentChain).then(function (response) {
                var attachmentResponse = response[0];
                angular.forEach(response, function (value) {
                  if (attachmentResponse.content.forum_post_attachment.length < value.content.forum_post_attachment.length) {
                    attachmentResponse = value;
                  }
                });
                self.posts.push(attachmentResponse.content);
                self.multiUploadControls.reset();
                _hasCreatedPost = true;
                alertify.success('Reply has been successfully created.');
                self.postCreationProcessing = false;
                self.postModel = '';
                self.attachment = [];
              });
            } else {
              self.posts.push(response.content);
              _hasCreatedPost = true;
              alertify.success('Reply has been successfully created.');
              self.postCreationProcessing = false;
              self.postModel = '';
              self.attachment = [];
            }
          } else {
            alertify.error(response.message);
          }
        }, function (error) {
          $log.error(error);
          alertify.error('Oops! Something went wrong. Please try again later.');
          self.postCreationProcessing = false;
        });
      }

      /**
       * Trigger `multi-upload` to attach files
       */
      function attachFile() {
        self.multiUploadControls.triggerFileInput();
      }

      /**
       * Remove an attached file
       *
       * @param {Integer} index Index of the attached file
       */
      function removeAttachedFile(index) {
        self.multiUploadControls.removeItem(index);
      }

      /**
       * Edit post
       *
       * @param {Integer} postId Post ID
       * @param {String} post Post content
       * @returns Edit status
       */
      function editPost(postId, post) {
        var deferred = $q.defer();
        ForumsSDK.updatePost(self.topicId, {
          id: postId,
          content: post.content
        }).then(function (response) {
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
       * @returns Delete status
       */
      function deletePost(postId) {
        var deferred = $q.defer();
        ForumsSDK.deletePost(self.topicId, postId, false).then(function (response) {
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
       * Create comment
       *
       * @param {Integer} postId Post ID
       * @param {String} comment Comment content
       * @returns Create status
       */
      function createComment(postId, comment) {
        var deferred = $q.defer();
        ForumsSDK.createComment(self.topicId, postId, {
          comment: comment.content
        }, false).then(function (response) {
          if (response.status === 200) {
            alertify.success("Your reply has been successfully added.");
          } else {
            alertify.success("Something went wrong. Please try again later.");
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
       * @param {Integer} postId Post ID
       * @param {Integer} commentId Comment ID
       * @param {String} comment Comment content
       * @returns Edit status
       */
      function editComment(postId, commentId, comment) {
        var deferred = $q.defer();
        ForumsSDK.updateComment(self.topicId, postId, {
          id: commentId,
          parentId: commentId,
          comment: comment.content
        }, false).then(function (response) {
          if (response.status === 200) {
            alertify.success("Your reply has been successfully updated.");
          } else {
            alertify.success("Something went wrong. Please try again later.");
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
       * Delete comment
       *
       * @param {Integer} postId Post ID
       * @param {Integer} commentId Comment ID
       * @returns Delete status
       */
      function deleteComment(postId, commentId) {
        var deferred = $q.defer();
        ForumsSDK.deleteComment(self.topicId, postId, commentId, false).then(function (response) {
          deferred.resolve(response);
        }, function (error) {
          deferred.reject(error);
        });
        return deferred.promise;
      }

      /**
       * Get comments
       *
       * @param {Integer} postId Post ID
       * @param {Integer} page Page index
       * @returns Comments list
       */
      function getComments(postId, page) {
        var deferred = $q.defer();
        ForumsSDK.getComments(self.topicId, postId, page, _commentsLimit, true).then(function (response) {
          deferred.resolve(response);
        }, function (error) {
          alertify.error("Something went wrong. Please try again later.");
          $log.error(error);
          deferred.reject(error);
        });
        return deferred.promise;
      }

      /**
       * Public methods
       */
      // Topic
      self.onEditTopicClicked = editTopic;
      self.onDeleteTopicClicked = deleteTopic;

      // Post
      self.onCreateTopicPostClicked = createPost;
      self.editPost = editPost;
      self.deletePost = deletePost;
      self.onGetMorePostsClicked = function onGetMorePostsClicked() {
        getPosts(self.topicId, _postsIndex, _postsLimit);
      };
      self.attachClicked = attachFile;
      self.removeAttachedFileClicked = removeAttachedFile;

      // Comment
      self.getComments = getComments;
      self.createPostComment = createComment;
      self.editComment = editComment;
      self.deleteComment = deleteComment;

      /**
       * Init
       */
      function _init() {
        self.subForumId = Number($stateParams.subforumid);
        self.topicId = Number($stateParams.topicid);
        if (self.subForumId && !isNaN(self.subForumId) && self.topicId && !isNaN(self.topicId)) {
          _getTopicDetail(self.topicId, _postsLimit);
        }
        if (_userRole === 'admin' || _userRole === 'super_admin') {
          self.rootAccess = true;
        }
      }
      _init();
    }
  });
