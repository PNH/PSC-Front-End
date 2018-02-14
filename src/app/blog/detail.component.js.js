angular
  .module('app')
  .component('blogDetailCom', {
    templateUrl: 'app/blog/template/detail.html',
    controller: function ($stateParams, $log, $q, $state, $filter, BlogSDK, UserSDK, DeepLinkFactory, alertify, moment, blockUI, SETTINGS) {
      var self = this;

      self.postId = null;
      self.postSlug = null;
      self.post = null;
      self.comments = [];

      self.breadcrumbItems = [
        {
          name: "Blog",
          state: "blog({blogslug: null})"
        }
      ];
      self.summernoteOptions = SETTINGS.SUMMERNOTE_CONFIG_BASIC;

      // Pagination
      var _pagination = {
        index: 1,
        limit: 10
      };
      var _subCommentLimit = 5;
      self.mainCommentHasReachedEnd = false;
      var _hasPosted = false;

      // Loaders
      const blogPostLoad = blockUI.instances.get('blogPostLoading');
      self.isLoadingMainComments = false;
      self.isLoadingSubComments = false;

      // Models
      self.commentModel = null;

      // User roles
      var _userRole = UserSDK.getUserRole();
      self.rootAccess = false;
      self.userId = UserSDK.getUserId();

      // ****************************************************
      self.postType = "Blog";

      // Main Comments
      self.createMainComment = createMainComment;
      self.editMainComment = editMainComment;
      self.deleteMainComment = deleteMainComment;
      self.loadMainComments = _getMainComments;

      // Sub Comments
      self.createSubComment = createSubComment;
      self.editSubComment = editSubComment;
      self.deleteSubComment = deleteSubComment;
      self.getSubComments = getSubComments;

      _init();

      function _init() {
        // self.postId = Number($stateParams.id);
        self.postSlug = $stateParams.slug;
        if (self.postSlug) {
          getPost(self.postSlug, _pagination);
        }
        if (_userRole === 'admin' || _userRole === 'super_admin') {
          self.rootAccess = true;
        }
      }
      // ******************************************************

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
       * Get blog post
       *
       * @param {Integer} postSlug Blog post slug
       * @param {Object} page Pagination limit and page index
       */
      function getPost(postSlug, page) {
        blogPostLoad.start();
        BlogSDK.getPostBySlug(postSlug, page.limit, true).then(function (response) {
          self.post = response.content;
          self.postId = self.post.id;
          if (response.content.blog_post_comment === null) {
            self.mainCommentHasReachedEnd = true;
          } else if (response.content.blog_post_comment.length < page.limit) {
            self.comments = mergeArray(self.comments, response.content.blog_post_comment);
            self.mainCommentHasReachedEnd = true;
          } else if (!response.content.blog_post_comment.length < page.limit) {
            self.comments = mergeArray(self.comments, response.content.blog_post_comment);
          }
          page.index += 1;
          blogPostLoad.stop();
        }, function (error) {
          $log.error(error);
          blogPostLoad.stop();
          DeepLinkFactory.checkLogged(error.status, 'blogdetail');
        });
      }

      /**
       * Get main comments
       *
       * @param {Integer} blogPostId Post ID
       * @param {Integer} page Page index
       */
      function getMainComments(blogPostId, page) {
        var deferred = $q.defer();
        BlogSDK.getMainComments(blogPostId, page.index, page.limit, false).then(function (response) {
          if (response.content === null) {
            self.mainCommentHasReachedEnd = true;
          } else if (response.content.length < page.limit) {
            self.comments = mergeArray(self.comments, response.content);
            self.mainCommentHasReachedEnd = true;
          } else if (!response.content.length < page.limit) {
            self.comments = mergeArray(self.comments, response.content);
          }
          page.index += 1;
          deferred.resolve();
        }, function (error) {
          $log.error(error);
          self.mainCommentHasReachedEnd = true;
          deferred.reject();
        });
        return deferred.promise;
      }

      /**
       * Get sub comments
       *
       * @param {Integer} blogPostId Post ID
       * @param {Integer} page Page index
       */
      function getSubComments(mainCommentId, page) {
        var deferred = $q.defer();
        BlogSDK.getSubComments(self.postId, mainCommentId, page, _subCommentLimit, false).then(function (response) {
          deferred.resolve(response);
        }, function (error) {
          $log.error(error);
          deferred.reject(error);
        });
        return deferred.promise;
      }

      /**
       * Init for `getMainComments`
       */
      function _getMainComments() {
        self.isLoadingMainComments = true;
        getMainComments(self.postId, _pagination).then(function () {
          self.isLoadingMainComments = false;
        }, function () {
          self.isLoadingMainComments = false;
        });
      }

      /**
       * Creates a post comment.
       *
       * @param      {Integer}  content  The content
       * @return     {object}  Created status
       */
      var commentContent = {};
      function createMainComment(content, formDetails) {
        var deferred = $q.defer();
        if (self.userId === null) {
          commentContent = {
            comment: content.content,
            name: formDetails.guestName,
            email: formDetails.guestEmail,
            recaptcha: formDetails.reCaptcha
          };
        } else {
          commentContent = {
            comment: content.content
          };
        }
        BlogSDK.createComment(self.postId, commentContent, false).then(function (response) {
          self.comments.push(response.content);
          _hasPosted = true;
          self.commentModel = null;
          alertify.success('Comment has been successfully added.');
          deferred.resolve(response);
        }, function (error) {
          if (error.status === 400) {
            alertify.error(error.message);
          } else {
            alertify.error('Something went wrong. Please try again later.');
          }
          deferred.reject(error);
          self.isCreatingComment = false;
        });
        return deferred.promise;
      }

      /**
       * Edit Blog Post Main Comment
       *
       * @param      {Integer}  postCommentId  The post comment identifier
       * @param      {String}  post           Post content
       * @return     {object}  Edit status
       */
      function editMainComment(postCommentId, post) {
        var deferred = $q.defer();
        BlogSDK.updateComment(self.postId, postCommentId, {
          comment: post.content
        }).then(function (response) {
          if (response.status === 200) {
            alertify.success("Comment has been successfully updated.");
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
       * Delete Blog Post Main Comment
       *
       * @param      {Integer}  postCommentId  The post comment identifier
       * @return     {object}  Delete Status
       */
      function deleteMainComment(postCommentId) {
        var deferred = $q.defer();
        BlogSDK.deleteComment(self.postId, postCommentId, false).then(function (response) {
          if (response.status === 200) {
            self.comments = $filter('removefromarray')(self.comments, 'id', postCommentId);
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
       * Create a sub comment
       *
       * @param {String} content Comment content
       * @returns Created comment
       */
      function createSubComment(parentid, content) {
        var deferred = $q.defer();
        BlogSDK.createComment(self.postId, {
          comment: content.content,
          parentId: parentid
        }, false).then(function (response) {
          // self.comments.push(response.content);
          // _hasPosted = true;
          self.commentModel = null;
          alertify.success('Reply has been successfully added.');
          deferred.resolve(response);
        }, function (error) {
          alertify.error('Something went wrong. Please try again later.');
          deferred.reject(error);
          self.isCreatingComment = false;
        });
        return deferred.promise;
      }

      /**
       * Edit sub comment
       *
       * @param {Integer} commentId Comment ID
       * @param {String} content Comment content
       */
      function editSubComment(postId, commentId, content) {
        var deferred = $q.defer();
        BlogSDK.updateComment(postId, commentId, {comment: content.content}, false).then(function (response) {
          if (response.status === 200) {
            alertify.success('Reply has been successfully updated.');
          } else {
            alertify.error(response.message);
          }
          deferred.resolve(response);
        }, function (error) {
          $log.error(error);
          deferred.reject(error);
          alertify.error('Something went wrong! Please try again later.');
        });
        return deferred.promise;
      }

      /**
       * Delete sub comment
       *
       * @param      {Integer}  commentId  The comment identifier
       * @return     {Object}  Delete status
       */
      function deleteSubComment(postId, commentId) {
        var deferred = $q.defer();
        BlogSDK.deleteComment(postId, commentId, false).then(function (response) {
          deferred.resolve(response);
        }, function (error) {
          deferred.reject(error);
        });
        return deferred.promise;
      }
    }
  });
