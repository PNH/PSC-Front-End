angular
  .module('core.directive')
  .directive('groupPost',
    function () {
      return {
        restrict: 'E',
        templateUrl: 'core/directives/templates/group-post.html',
        scope: {
          post: '=',
          like: '=',
          comment: '=',
          editPost: '=',
          deletePost: '=',
          getComments: '=',
          editComment: '=',
          deleteComment: '=',
          rootAccess: '=',
          sharePlaylistCallback: '='
        },
        bindToController: true,
        controllerAs: 'groupPostCtrl',
        controller: function ($q, $log, $filter, $state, PlaylistSDK, blockUI, alertify) {
          var self = this;

          self.comments = self.post.group_post_comment;

          // Pagination
          var _commentIndex = 2;
          var _hasCommented = false;
          self._paginationLimit = 5;
          self._commentReachedEnd = false;

          // Loaders
          self.isLikeProcessing = false;

          // Toggles
          self.toggleCommentBox = false;
          self.toggleEditBox = false;
          self.showTextArea = true;

          // Playlists
          self.playlists = null;

          /**
           * Merge two arrays
           *
           * @param {Array} arr1 Array 1
           * @param {Array} arr2 Array 2
           * @returns Merge array
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
           * @param {Integer} postId Post ID
           * @param {Integer} likes Number of likes
           * @param {Bool} isLiked Liked status
           */
          function likePost(postId, likes, isLiked) {
            self.isLikeProcessing = true;
            self.like(postId, isLiked).then(function (response) {
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
           * @param {Integer} page Page index
           * @param {Integer} limit Comments limit
           */
          function getComments(commentId, page, limit) {
            var deferred = $q.defer();
            self.getComments(commentId, _commentIndex).then(function (response) {
              if (response.content === null) {
                self._commentReachedEnd = true;
              } else if (response.content.length < limit) {
                self.comments = mergeArray(self.comments, response.content);
                self._commentReachedEnd = true;
              } else if (!response.content.length < limit) {
                self.posts = mergeArray(self.comments, response.content);
              }
              _commentIndex += 1;
              deferred.resolve();
            }, function (error) {
              $log.error(error);
              self._commentReachedEnd = true;
              deferred.reject();
            });
            return deferred.promise;
          }

          /**
           * Create comment
           *
           * @param {String} comment Comment content
           * @returns Post status, new post
           */
          function createComment(comment) {
            var deferred = $q.defer();
            self.comment(self.post.id, comment).then(function (response) {
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
           * @returns Update status, updated comment
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
                alertify.success("Comment has been successfully deleted.");
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
           * @param {String} post Post content
           * @returns Update status, updated post
           */
          function editPost(post) {
            var deferred = $q.defer();
            self.editPost(self.post.id, post).then(function (response) {
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
           * @param {String} post Post content
           * @returns Update status, updated post
           */
          function deletePost(postId) {
            alertify.okBtn("yes").cancelBtn("no").confirm("Are you sure you want to delete this post?", function () {
              self.isDeleteProcessing = true;
              self.deletePost(postId, false).then(function () {
                self.isDeleteProcessing = false;
              }, function () {
                self.isDeleteProcessing = false;
              });
            });
          }

          /**
           * Add a media to playlist
           *
           * @param {Integer} videoId Resource ID
           * @param {Integer} playlistId Playlist ID
           * @param {Bool} alredyIn Status of the resource already being in the playlist
           */
          function onAddToPlaylist(videoId, playlistId, alredyIn) {
            if (alredyIn) {
              PlaylistSDK.deleteResource(playlistId, videoId).then(function (response) {
                $log.debug(response);
                alertify.success("Resource has been removed from the playlist.");
                $state.reload();
              }, function (error) {
                $log.error(error);
              });
            } else {
              PlaylistSDK.addResource(playlistId, videoId).then(function (response) {
                $log.debug(response);
                alertify.success("Resource has been added to the playlist.");
                $state.reload();
              }, function (error) {
                $log.error(error);
              });
            }
          }

          /**
           * Get playlists
           */
          function getPlaylists() {
            PlaylistSDK.getLists(false).then(function (response) {
              self.playlists = response.content;
            }, function (error) {
              self.playlists = [];
              $log.error(error);
            });
          }

          /**
           * Callback for sharing playlist
           *
           * @param {Object} payload Shared promise
           */
          function sharePlaylist(payload) {
            self.sharePlaylistCallback(payload);
          }

          /**
           * Public method
           */
          // Post
          self.onLikePostClicked = likePost;
          self.editPostClicked = editPost;
          self.deletePostClicked = deletePost;

          // Comments
          self.editCommentClicked = editComment;
          self.deleteCommentClicked = deleteComment;
          self.createPostComment = createComment;
          self.loadComments = function (id) {
            var deferred = $q.defer();
            getComments(id, _commentIndex, self._paginationLimit).then(function () {
              deferred.resolve();
            }, function () {
              deferred.reject();
            });
            return deferred.promise;
          };

          // Playlists
          self.onAddToPlaylist = onAddToPlaylist;
          self.sharePlaylist = sharePlaylist;
          getPlaylists();
        }
      };
    });
