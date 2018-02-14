angular
  .module('core.directive')
  .directive('blogPost',
    function () {
      return {
        restrict: 'E',
        templateUrl: 'core/directives/templates/blog-post.html',
        scope: {
          comment: '=',
          like: '=',
          reply: '=',
          getReplies: '=',
          editComment: '=',
          deleteComment: '=',
          editReply: '=',
          deleteReply: '=',
          rootAccess: '='
        },
        bindToController: true,
        controllerAs: 'blogPostCtrl',
        controller: function ($scope, $q, $log, $filter, $state, blockUI, UserSDK, alertify, SETTINGS) {
          var self = this;

          self.userId = UserSDK.getUserId();
          self.summernoteOptions = SETTINGS.SUMMERNOTE_CONFIG_BASIC;

          self.comment.content = "";
          self.comment.content = self.comment.comment;
          self.comment.commentcount = self.comment.replies.count;
          self.replies = self.comment.replies.comments;

          // Pagination
          var _commentIndex = 2;
          var _hasCommented = false;
          self._paginationLimit = 5;
          self._repliesReachedEnd = false;

          // Loaders
          self.isLikeProcessing = false;
          self.isDeleteProcessing = false;

          // Toggles
          self.toggleCommentBox = false;
          self.toggleEditBox = false;
          self.imagePopup = null;

          /**
           * Merge given two arrays
           *
           * @param {Array} arr1 Array 1
           * @param {Array} arr2 Array 2
           * @returns Merged array
           */
          function mergeArray(arr1, arr2) {
            var temp = arr1;
            if (_hasCommented) {
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
           * Get replies
           *
           * @param {Integer} commentId Comment ID
           */
          function getReplies(commentId) {
            var deferred = $q.defer();
            self.getReplies(commentId, _commentIndex).then(function (response) {
              if (response.content === null) {
                self._repliesReachedEnd = true;
                alertify.error('No more replies to load.');
              } else if (response.content.length < self._paginationLimit) {
                self.replies = mergeArray(self.replies, response.content);
                self._repliesReachedEnd = true;
              } else if (!response.content.length < self._paginationLimit) {
                self.replies = mergeArray(self.replies, response.content);
              }
              _commentIndex += 1;
              deferred.resolve(response);
            }, function (error) {
              $log.error(error);
              self._repliesReachedEnd = true;
              alertify.error('No more replies to load.');
              deferred.reject(error);
            });
            return deferred.promise;
          }

          /**
           * Create comment
           *
           * @param {Object} commentObj Comment object
           * @returns Create status
           */
          function createReply(commentObj) {
            var deferred = $q.defer();
            self.reply(self.comment.id, commentObj).then(function (response) {
              if (response.status === 200 || response.status === 201) {
                self.replies.unshift(response.content);
                _hasCommented = true;
              }
              deferred.resolve(response);
              self.toggleCommentBox = false;
              // self.loadComments(self.comment.id);
            }, function (error) {
              // self.toggleCommentBox = false;
              deferred.reject(error);
            });
            return deferred.promise;
          }

          /**
           * Edit comment
           *
           * @param {Integer} commentId Comment ID
           * @param {String} comment Comment content
           * @returns Update status
           */
          function editReply(commentId, comment) {
            var deferred = $q.defer();
            self.editReply(self.comment.id, commentId, comment).then(function (response) {
              deferred.resolve(response);
            }, function (error) {
              deferred.reject(error);
            });
            return deferred.promise;
          }

          /**
           * Edit post
           *
           * @param {Object} postObj Post object
           * @returns Update status
           */
          function editComment(postObj) {
            var deferred = $q.defer();
            self.editComment(self.comment.id, postObj).then(function (response) {
              angular.copy(response.content, self.comment);
              self.comment.content = self.comment.comment;
              self.toggleEditBox = false;
              deferred.resolve(response);
            }, function (error) {
              deferred.reject(error);
            });
            return deferred.promise;
          }

          /**
           * Delete post
           *
           * @param {Integer} postId Post ID
           */
          function deleteComment(postId) {
            alertify.okBtn("yes").cancelBtn("no").confirm("Are you sure you want to delete this reply?", function () {
              self.isDeleteProcessing = true;
              self.deleteComment(postId).then(function () {
                self.isDeleteProcessing = false;
              }, function () {
                self.isDeleteProcessing = false;
              });
            });
          }

          /**
           * Delete comment
           *
           * @param {Integer} commentId Comment ID
           * @returns Delete status
           */
          function deleteReply(commentId) {
            var deferred = $q.defer();
            self.deleteReply(self.comment.id, commentId).then(function (response) {
              if (response.status === 200) {
                self.replies = $filter('removefromarray')(self.replies, 'id', commentId);
                alertify.success("Reply has been successfully deleted.");
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
           * Public methods
           */
          // Posts
          // self.onLikePostClicked = likePost;
          self.editCommentClicked = editComment;
          self.deleteCommentClicked = deleteComment;

          // Comments
          self.loadReplies = getReplies;
          self.createPostReply = createReply;
          self.editReplyClicked = editReply;
          self.deleteReplyClicked = deleteReply;

          self.onImageAttachmentClicked = function onImageAttachmentClicked(url) {
            self.imagePopup = url;
          };

          // Popups
          self.unloadPopups = function unloadPopups() {
            self.imagePopup = null;
          };

          self.goToWall = function (id) {
            if (id > 0 && self.userId) {
              $state.go('wall', {
                userid: id
              });
            }
          };
        }
      };
    });
