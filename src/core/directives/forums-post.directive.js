angular
  .module('core.directive')
  .directive('forumPost',
    function () {
      return {
        restrict: 'E',
        templateUrl: 'core/directives/templates/forum-post.html',
        scope: {
          post: '=',
          like: '=',
          comment: '=',
          getComments: '=',
          editPost: '=',
          deletePost: '=',
          editComment: '=',
          deleteComment: '=',
          rootAccess: '='
        },
        bindToController: true,
        controllerAs: 'forumPostCtrl',
        controller: function ($scope, $q, $log, $filter, $state, blockUI, alertify) {
          var self = this;

          self.comments = self.post.forum_post_comment;

          // Pagination
          var _commentIndex = 2;
          var _hasCommented = false;
          self._paginationLimit = 5;
          self._commentReachedEnd = false;

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
           * Like a post
           *
           * @param {Integer} id Post ID
           * @param {Integer} likes Number of likes in the post
           * @param {Bool} isLiked Liked state
           */
          function likePost(id, likes, isLiked) {
            self.isLikeProcessing = true;
            self.like(id, isLiked).then(function (response) {
              if (response.content === null) {
                self.post.likes -= 1;
                self.post.liked = false;
              } else {
                self.post.likes += 1;
                self.post.liked = true;
              }
              self.isLikeProcessing = false;
            }, function () {
              self.isLikeProcessing = false;
            });
          }

          /**
           * Get comments
           *
           * @param {Integer} commentId Comment ID
           */
          function getComments(commentId) {
            var deferred = $q.defer();
            self.getComments(commentId, _commentIndex).then(function (response) {
              if (response.content === null) {
                self._commentReachedEnd = true;
                alertify.error('No more replies to load.');
              } else if (response.content.length < self._paginationLimit) {
                self.comments = mergeArray(self.comments, response.content);
                self._commentReachedEnd = true;
              } else if (!response.content.length < self._paginationLimit) {
                self.posts = mergeArray(self.comments, response.content);
              }
              _commentIndex += 1;
              deferred.resolve(response);
            }, function (error) {
              $log.error(error);
              self._commentReachedEnd = true;
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
          function createComment(commentObj) {
            var deferred = $q.defer();
            self.comment(self.post.id, commentObj).then(function (response) {
              if (response.status === 200) {
                self.comments.unshift(response.content);
                _hasCommented = true;
              }
              deferred.resolve(response);
              self.toggleCommentBox = false;
            }, function (error) {
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
          function editComment(commentId, comment) {
            var deferred = $q.defer();
            self.editComment(self.post.id, commentId, comment).then(function (response) {
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
          function editPost(postObj) {
            var deferred = $q.defer();
            self.editPost(self.post.id, postObj).then(function (response) {
              angular.copy(response.content, self.post);
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
          function deletePost(postId) {
            alertify.okBtn("yes").cancelBtn("no").confirm("Are you sure you want to delete this reply?", function () {
              self.isDeleteProcessing = true;
              self.deletePost(postId).then(function () {
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
          function deleteComment(commentId) {
            var deferred = $q.defer();
            self.deleteComment(self.post.id, commentId).then(function (response) {
              if (response.status === 200) {
                self.comments = $filter('removefromarray')(self.comments, 'id', commentId);
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
          self.onLikePostClicked = likePost;
          self.editPostClicked = editPost;
          self.deletePostClicked = deletePost;

          // Comments
          self.loadComments = getComments;
          self.createPostComment = createComment;
          self.editCommentClicked = editComment;
          self.deleteCommentClicked = deleteComment;

          self.onImageAttachmentClicked = function onImageAttachmentClicked(url) {
            self.imagePopup = url;
          };

          // Popups
          self.unloadPopups = function unloadPopups() {
            self.imagePopup = null;
          };

          self.goToWall = function (id) {
            if (id > 0) {
              $state.go('wall', {
                userid: id
              });
            }
          };
        }
      };
    });
