angular
  .module('core.sdk')
  .service('WallSDK',
    function ($q, $log, WallAPI, localStorageService, ValidationAPI) {
      /**
       * Get wall posts of an user
       *
       * @param {Integer} wallId Wall ID (User's ID)
       * @param {Integer} page Page index
       * @param {Integer} limit Posts limit
       * @param {Bool} local Cache posts
       * @returns Posts
       */
      var requestGetPosts = [];
      this.getPosts = function (wallId, page, limit, local) {
        local = angular.isUndefined(local) ? false : local;
        var deferred = $q.defer();
        var _localStorage = 'api/wall/' + wallId + '/posts/' + page;
        var packet = localStorageService.get(_localStorage);
        requestGetPosts.push(WallAPI.posts().query({wid: wallId, page: page, limit: limit, commentLimit: limit}));
        for (var i = 0; i < requestGetPosts.length - 1; i++) {
          requestGetPosts[i].$cancelRequest();
        }
        requestGetPosts.splice(0, requestGetPosts.length - 1);
        if (ValidationAPI.hasExpired(packet) || !local) {
          requestGetPosts[0].$promise.then(
            function (response) {
              if (response.status === 200) {
                packet = {
                  data: response,
                  timestamp: new Date().getTime()
                };
                if (local) {
                  localStorageService.set(_localStorage, packet);
                } else {
                  localStorageService.remove(_localStorage);
                }
                deferred.resolve(packet.data);
              } else {
                var error = {
                  status: response.status,
                  message: response.message
                };
                deferred.reject(error);
              }
            },
            function (error) {
              error = ValidationAPI.buildErrorMessage(error);
              deferred.reject(error);
            }
          );
        } else {
          deferred.resolve(packet.data);
        }
        var _log = 'WallSDK:getPosts: ' + _localStorage;
        $log.debug(_log);

        return deferred.promise;
      };

      /**
       * Get public wall posts
       *
       * @param {Integer} page Page index
       * @param {Integer} limit Posts limit
       * @param {Bool} local Cache posts
       * @returns Posts
       */
      this.getPublicPosts = function (page, limit, type, filters, local) {
        local = angular.isUndefined(local) ? false : local;
        var deferred = $q.defer();
        var _localStorage = 'api/wall/public/' + type + '/' + filters + '/posts/' + page;
        var packet = localStorageService.get(_localStorage);
        if (ValidationAPI.hasExpired(packet) || !local) {
          var payload = {
            type: type
          };
          if (filters) {
            payload.filters = filters;
          }
          requestGetPosts.push(WallAPI.publicPosts().query({page: page, limit: limit, commentLimit: limit}, payload));
          for (var i = 0; i < requestGetPosts.length - 1; i++) {
            requestGetPosts[i].$cancelRequest();
          }
          requestGetPosts.splice(0, requestGetPosts.length - 1);
          requestGetPosts[0].$promise.then(
            function (response) {
              if (response.status === 200) {
                packet = {
                  data: response,
                  timestamp: new Date().getTime()
                };
                if (local) {
                  localStorageService.set(_localStorage, packet);
                } else {
                  localStorageService.remove(_localStorage);
                }
                deferred.resolve(packet.data);
              } else {
                var error = {
                  status: response.status,
                  message: response.message
                };
                deferred.reject(error);
              }
            },
            function (error) {
              error = ValidationAPI.buildErrorMessage(error);
              deferred.reject(error);
            }
          );
        } else {
          deferred.resolve(packet.data);
        }
        var _log = 'WallSDK:getPosts: ' + _localStorage;
        $log.debug(_log);

        return deferred.promise;
      };

      /**
       * Create a wall post
       *
       * @param {Integer} wallId Wall ID (User's ID)
       * @param {Object} post Post object ({"content": "First wall post", "status": 1, "privacy": 1})
       * @param {Bool} local Cache data
       * @returns Post status, created post
       */
      this.createPost = function (wallId, post, local) {
        local = angular.isUndefined(local) ? false : local;
        var deferred = $q.defer();
        var _localStorage = 'api/wall/posts/new';
        var packet = localStorageService.get(_localStorage);
        if (ValidationAPI.hasExpired(packet) || !local) {
          WallAPI.posts().create({wid: wallId}, post).$promise.then(
            function (response) {
              if (response.status === 200) {
                packet = {
                  data: response,
                  timestamp: new Date().getTime()
                };
                if (local) {
                  localStorageService.set(_localStorage, packet);
                } else {
                  localStorageService.remove(_localStorage);
                }
                deferred.resolve(packet.data);
              } else {
                var error = {
                  status: response.status,
                  message: response.message
                };
                deferred.reject(error);
              }
            },
            function (error) {
              error = ValidationAPI.buildErrorMessage(error);
              deferred.reject(error);
            }
          );
        } else {
          deferred.resolve(packet.data);
        }
        var _log = 'WallSDK:createPost: ' + _localStorage;
        $log.debug(_log);

        return deferred.promise;
      };

      /**
       * Add an attachment to a post
       *
       * @param {Integer} wallId Wall ID (User's ID)
       * @param {Integer} postId Post ID
       * @param {Object} attachment Attached file object
       * @param {Bool} local Cache data
       * @returns Post status, attached post
       */
      this.addPostAttachment = function (wallId, postId, attachment, local) {
        local = angular.isUndefined(local) ? false : local;
        var deferred = $q.defer();
        var _localStorage = 'api/groups/posts/attachment/add';
        var packet = localStorageService.get(_localStorage);
        if (ValidationAPI.hasExpired(packet) || !local) {
          WallAPI.attachments().add({wid: wallId, pid: postId}, attachment).$promise.then(
            function (response) {
              if (response.status === 200) {
                packet = {
                  data: response,
                  timestamp: new Date().getTime()
                };
                if (local) {
                  localStorageService.set(_localStorage, packet);
                } else {
                  localStorageService.remove(_localStorage);
                }
                deferred.resolve(packet.data);
              } else {
                var error = {
                  status: response.status,
                  message: response.message
                };
                deferred.reject(error);
              }
            },
            function (error) {
              error = ValidationAPI.buildErrorMessage(error);
              deferred.reject(error);
            }
          );
        } else {
          deferred.resolve(packet.data);
        }
        var _log = 'WallSDK:addPostAttachment: ' + _localStorage;
        $log.debug(_log);

        return deferred.promise;
      };

      /**
       * Edit a wall post
       *
       * @param {Integer} wallId Wall ID (User's ID)
       * @param {Integer} postId Post ID
       * @param {Object} post Post object ({"content": "First wall post", "status": 1, "privacy": 1})
       * @param {Bool} local Cache data
       * @returns Update status, updated post
       */
      this.editPost = function (wallId, postId, post, local) {
        local = angular.isUndefined(local) ? false : local;
        var deferred = $q.defer();
        var _localStorage = 'api/wall/posts/edit';
        var packet = localStorageService.get(_localStorage);
        if (ValidationAPI.hasExpired(packet) || !local) {
          WallAPI.posts().update({wid: wallId, pid: postId}, post).$promise.then(
            function (response) {
              if (response.status === 200) {
                packet = {
                  data: response,
                  timestamp: new Date().getTime()
                };
                if (local) {
                  localStorageService.set(_localStorage, packet);
                } else {
                  localStorageService.remove(_localStorage);
                }
                deferred.resolve(packet.data);
              } else {
                var error = {
                  status: response.status,
                  message: response.message
                };
                deferred.reject(error);
              }
            },
            function (error) {
              error = ValidationAPI.buildErrorMessage(error);
              deferred.reject(error);
            }
          );
        } else {
          deferred.resolve(packet.data);
        }
        var _log = 'WallSDK:editPost: ' + _localStorage;
        $log.debug(_log);

        return deferred.promise;
      };

      /**
       * Delete a wall post
       *
       * @param {Integer} wallId Wall ID (User's ID)
       * @param {Integer} postId Post ID
       * @param {Bool} local Cache data
       * @returns Update status, updated post
       */
      this.deletePost = function (wallId, postId, local) {
        local = angular.isUndefined(local) ? false : local;
        var deferred = $q.defer();
        var _localStorage = 'api/wall/posts/edit';
        var packet = localStorageService.get(_localStorage);
        if (ValidationAPI.hasExpired(packet) || !local) {
          WallAPI.posts().delete({wid: wallId, pid: postId}).$promise.then(
            function (response) {
              if (response.status === 200) {
                packet = {
                  data: response,
                  timestamp: new Date().getTime()
                };
                if (local) {
                  localStorageService.set(_localStorage, packet);
                } else {
                  localStorageService.remove(_localStorage);
                }
                deferred.resolve(packet.data);
              } else {
                var error = {
                  status: response.status,
                  message: response.message
                };
                deferred.reject(error);
              }
            },
            function (error) {
              error = ValidationAPI.buildErrorMessage(error);
              deferred.reject(error);
            }
          );
        } else {
          deferred.resolve(packet.data);
        }
        var _log = 'WallSDK:editPost: ' + _localStorage;
        $log.debug(_log);

        return deferred.promise;
      };

      /**
       * Like a wall post
       *
       * @param {Integer} wallId Wall ID (User's ID)
       * @param {Integer} postId Post ID
       * @param {Bool} local Cache data
       * @returns Post status, liked status
       */
      this.likePost = function (wallId, postId, local) {
        local = angular.isUndefined(local) ? false : local;
        var deferred = $q.defer();
        var _localStorage = 'api/groups/posts/like';
        var packet = localStorageService.get(_localStorage);
        if (ValidationAPI.hasExpired(packet) || !local) {
          WallAPI.likePost().like({wid: wallId, pid: postId}).$promise.then(
            function (response) {
              if (response.status === 200) {
                packet = {
                  data: response,
                  timestamp: new Date().getTime()
                };
                if (local) {
                  localStorageService.set(_localStorage, packet);
                } else {
                  localStorageService.remove(_localStorage);
                }
                deferred.resolve(packet.data);
              } else {
                var error = {
                  status: response.status,
                  message: response.message
                };
                deferred.reject(error);
              }
            },
            function (error) {
              error = ValidationAPI.buildErrorMessage(error);
              deferred.reject(error);
            }
          );
        } else {
          deferred.resolve(packet.data);
        }
        var _log = 'WallSDK:likePost: ' + _localStorage;
        $log.debug(_log);

        return deferred.promise;
      };

      /**
       * Dislike a post
       *
       * @param {Integer} wallId Wall ID (User's ID)
       * @param {Integer} postId Post ID
       * @param {Bool} local Cache data
       * @returns Post status, disliked status
       */
      this.dislikePost = function (wallId, postId, local) {
        local = angular.isUndefined(local) ? false : local;
        var deferred = $q.defer();
        var _localStorage = 'api/groups/posts/create';
        var packet = localStorageService.get(_localStorage);
        if (ValidationAPI.hasExpired(packet) || !local) {
          WallAPI.likePost().unlike({wid: wallId, pid: postId}).$promise.then(
            function (response) {
              if (response.status === 200) {
                packet = {
                  data: response,
                  timestamp: new Date().getTime()
                };
                if (local) {
                  localStorageService.set(_localStorage, packet);
                } else {
                  localStorageService.remove(_localStorage);
                }
                deferred.resolve(packet.data);
              } else {
                var error = {
                  status: response.status,
                  message: response.message
                };
                deferred.reject(error);
              }
            },
            function (error) {
              error = ValidationAPI.buildErrorMessage(error);
              deferred.reject(error);
            }
          );
        } else {
          deferred.resolve(packet.data);
        }
        var _log = 'WallSDK:dislikePost: ' + _localStorage;
        $log.debug(_log);

        return deferred.promise;
      };

      /**
       * Create comment
       *
       * @param {Integer} wallId Wall ID (User's ID)
       * @param {Integer} postId Post ID
       * @param {Object} comment Comment object
       * @param {Bool} local Cache data
       * @returns Post status, created comment
       */
      this.createComment = function (wallId, postId, comment, local) {
        local = angular.isUndefined(local) ? false : local;
        var deferred = $q.defer();
        var _localStorage = 'api/groups/posts/comments/create';
        var packet = localStorageService.get(_localStorage);
        if (ValidationAPI.hasExpired(packet) || !local) {
          WallAPI.comments().create({wid: wallId, pid: postId}, comment).$promise.then(
            function (response) {
              if (response.status === 200) {
                packet = {
                  data: response,
                  timestamp: new Date().getTime()
                };
                if (local) {
                  localStorageService.set(_localStorage, packet);
                } else {
                  localStorageService.remove(_localStorage);
                }
                deferred.resolve(packet.data);
              } else {
                var error = {
                  status: response.status,
                  message: response.message
                };
                deferred.reject(error);
              }
            },
            function (error) {
              error = ValidationAPI.buildErrorMessage(error);
              deferred.reject(error);
            }
          );
        } else {
          deferred.resolve(packet.data);
        }
        var _log = 'WallSDK:createComment: ' + _localStorage;
        $log.debug(_log);

        return deferred.promise;
      };

      /**
       * Get comments
       *
       * @param {Integer} wallId Wall ID (User's ID)
       * @param {Integer} postId Post ID
       * @param {Integer} page Page index
       * @param {Integer} limit Result limit
       * @param {Bool} local Cache data
       * @returns Comments list
       */
      this.getComments = function (wallId, postId, page, limit, local) {
        local = angular.isUndefined(local) ? false : local;
        var deferred = $q.defer();
        var _localStorage = 'api/wall/' + wallId + '/posts/' + postId + '/comments/page/' + page;
        var packet = localStorageService.get(_localStorage);
        if (ValidationAPI.hasExpired(packet) || !local) {
          WallAPI.comments().get({wid: wallId, pid: postId, page: page, limit: limit}).$promise.then(
            function (response) {
              if (response.status === 200) {
                packet = {
                  data: response,
                  timestamp: new Date().getTime()
                };
                if (local) {
                  localStorageService.set(_localStorage, packet);
                } else {
                  localStorageService.remove(_localStorage);
                }
                deferred.resolve(packet.data);
              } else {
                var error = {
                  status: response.status,
                  message: response.message
                };
                deferred.reject(error);
              }
            },
            function (error) {
              error = ValidationAPI.buildErrorMessage(error);
              deferred.reject(error);
            }
          );
        } else {
          deferred.resolve(packet.data);
        }
        var _log = 'WallSDK:getComments: ' + _localStorage;
        $log.debug(_log);

        return deferred.promise;
      };

      /**
       * Edit comment
       *
       * @param {Integer} wallId Wall ID (User's ID)
       * @param {Integer} postId Post ID
       * @param {Integer} commentId Comment ID
       * @param {Object} comment Comment object
       * @param {Bool} local Cache data
       * @returns Update status, updated comment
       */
      this.editComment = function (wallId, postId, commentId, comment, local) {
        local = angular.isUndefined(local) ? false : local;
        var deferred = $q.defer();
        var _localStorage = 'api/groups/posts/comments/edit';
        var packet = localStorageService.get(_localStorage);
        if (ValidationAPI.hasExpired(packet) || !local) {
          WallAPI.comments().update({wid: wallId, pid: postId, cid: commentId}, comment).$promise.then(
            function (response) {
              if (response.status === 200) {
                packet = {
                  data: response,
                  timestamp: new Date().getTime()
                };
                if (local) {
                  localStorageService.set(_localStorage, packet);
                } else {
                  localStorageService.remove(_localStorage);
                }
                deferred.resolve(packet.data);
              } else {
                var error = {
                  status: response.status,
                  message: response.message
                };
                deferred.reject(error);
              }
            },
            function (error) {
              error = ValidationAPI.buildErrorMessage(error);
              deferred.reject(error);
            }
          );
        } else {
          deferred.resolve(packet.data);
        }
        var _log = 'WallSDK:editComment: ' + _localStorage;
        $log.debug(_log);

        return deferred.promise;
      };

      /**
       * Delete comment
       *
       * @param {Integer} wallId Wall ID (User's ID)
       * @param {Integer} postId Post ID
       * @param {Integer} commentId Comment ID
       * @param {Bool} local Cache data
       * @returns Delete status
       */
      this.deleteComment = function (wallId, postId, commentId, local) {
        local = angular.isUndefined(local) ? false : local;
        var deferred = $q.defer();
        var _localStorage = 'api/groups/posts/comments/delete';
        var packet = localStorageService.get(_localStorage);
        if (ValidationAPI.hasExpired(packet) || !local) {
          WallAPI.comments().delete({wid: wallId, pid: postId, cid: commentId}).$promise.then(
            function (response) {
              if (response.status === 200) {
                packet = {
                  data: response,
                  timestamp: new Date().getTime()
                };
                if (local) {
                  localStorageService.set(_localStorage, packet);
                } else {
                  localStorageService.remove(_localStorage);
                }
                deferred.resolve(packet.data);
              } else {
                var error = {
                  status: response.status,
                  message: response.message
                };
                deferred.reject(error);
              }
            },
            function (error) {
              error = ValidationAPI.buildErrorMessage(error);
              deferred.reject(error);
            }
          );
        } else {
          deferred.resolve(packet.data);
        }
        var _log = 'WallSDK:deleteComment: ' + _localStorage;
        $log.debug(_log);

        return deferred.promise;
      };
    });
