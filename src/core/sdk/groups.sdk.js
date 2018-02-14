angular
  .module('core.sdk')
  .service('GroupsSDK',
    function ($q, $log, GroupsAPI, localStorageService, ValidationAPI) {
      /**
       * Get my groups
       */
      this.getMyGroups = function (page, limit, local) {
        local = angular.isUndefined(local) ? false : local;
        var deferred = $q.defer();
        var _localStrage = 'api/groups/my';
        var packet = localStorageService.get(_localStrage);
        if (ValidationAPI.hasExpired(packet) || !local) {
          GroupsAPI.mygroups().query({
            page: page,
            limit: limit
          }).$promise.then(
            function (response) {
              if (response.status === 200) {
                packet = {
                  data: response,
                  timestamp: new Date().getTime()
                };
                if (local) {
                  localStorageService.set(_localStrage, packet);
                } else {
                  localStorageService.remove(_localStrage);
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
        var _log = 'GroupsSDK:getMyGroups: ' + _localStrage;
        $log.debug(_log);

        return deferred.promise;
      };

      /**
       * Get all groups
       */
      this.getAllGroups = function (page, limit, order, local) {
        local = angular.isUndefined(local) ? false : local;
        var deferred = $q.defer();
        var _localStrage = 'api/groups/all';
        var packet = localStorageService.get(_localStrage);
        if (ValidationAPI.hasExpired(packet) || !local) {
          GroupsAPI.allgroups().query({
            page: page,
            limit: limit,
            order: order
          }).$promise.then(
            function (response) {
              if (response.status === 200) {
                packet = {
                  data: response,
                  timestamp: new Date().getTime()
                };
                if (local) {
                  localStorageService.set(_localStrage, packet);
                } else {
                  localStorageService.remove(_localStrage);
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
        var _log = 'GroupsSDK:getAllGroups: ' + _localStrage;
        $log.debug(_log);

        return deferred.promise;
      };

      /**
       * Create a group
       */
      this.createGroup = function (payload, local) {
        local = angular.isUndefined(local) ? false : local;
        var deferred = $q.defer();
        var _localStrage = 'api/groups/create';
        var packet = localStorageService.get(_localStrage);
        if (ValidationAPI.hasExpired(packet) || !local) {
          GroupsAPI.group().create(payload).$promise.then(
            function (response) {
              if (response.status === 200) {
                packet = {
                  data: response,
                  timestamp: new Date().getTime()
                };
                if (local) {
                  localStorageService.set(_localStrage, packet);
                } else {
                  localStorageService.remove(_localStrage);
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
        var _log = 'GroupsSDK:createGroup: ' + _localStrage;
        $log.debug(_log);

        return deferred.promise;
      };

      /**
       * Edit a group
       */
      this.updateGroup = function (groupId, payload, local) {
        local = angular.isUndefined(local) ? false : local;
        var deferred = $q.defer();
        var _localStrage = 'api/groups/update';
        var packet = localStorageService.get(_localStrage);
        if (ValidationAPI.hasExpired(packet) || !local) {
          GroupsAPI.group().update({
            gid: groupId
          }, payload).$promise.then(
            function (response) {
              if (response.status === 200) {
                packet = {
                  data: response,
                  timestamp: new Date().getTime()
                };
                if (local) {
                  localStorageService.set(_localStrage, packet);
                } else {
                  localStorageService.remove(_localStrage);
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
        var _log = 'GroupsSDK:updateGroup: ' + _localStrage;
        $log.debug(_log);

        return deferred.promise;
      };

      /**
       * Join a group
       */
      this.joinGroup = function (groupId, local) {
        local = angular.isUndefined(local) ? false : local;
        var deferred = $q.defer();
        var _localStrage = 'api/groups/join';
        var packet = localStorageService.get(_localStrage);
        if (ValidationAPI.hasExpired(packet) || !local) {
          GroupsAPI.join().join({
            gid: groupId
          }).$promise.then(
            function (response) {
              if (response.status === 200) {
                packet = {
                  data: response,
                  timestamp: new Date().getTime()
                };
                if (local) {
                  localStorageService.set(_localStrage, packet);
                } else {
                  localStorageService.remove(_localStrage);
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
        var _log = 'GroupsSDK:joinGroup: ' + _localStrage;
        $log.debug(_log);

        return deferred.promise;
      };

      /**
       * Leave a group
       */
      this.leaveGroup = function (groupId, local) {
        local = angular.isUndefined(local) ? false : local;
        var deferred = $q.defer();
        var _localStrage = 'api/groups/leave';
        var packet = localStorageService.get(_localStrage);
        if (ValidationAPI.hasExpired(packet) || !local) {
          GroupsAPI.join().leave({
            gid: groupId
          }).$promise.then(
            function (response) {
              if (response.status === 200) {
                packet = {
                  data: response,
                  timestamp: new Date().getTime()
                };
                if (local) {
                  localStorageService.set(_localStrage, packet);
                } else {
                  localStorageService.remove(_localStrage);
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
        var _log = 'GroupsSDK:leaveGroup: ' + _localStrage;
        $log.debug(_log);

        return deferred.promise;
      };

      /**
       * Delete a group
       */
      this.deleteGroup = function (groupId, local) {
        local = angular.isUndefined(local) ? false : local;
        var deferred = $q.defer();
        var _localStrage = 'api/groups/leave';
        var packet = localStorageService.get(_localStrage);
        if (ValidationAPI.hasExpired(packet) || !local) {
          GroupsAPI.group().delete({
            gid: groupId
          }).$promise.then(
            function (response) {
              if (response.status === 200) {
                packet = {
                  data: response,
                  timestamp: new Date().getTime()
                };
                if (local) {
                  localStorageService.set(_localStrage, packet);
                } else {
                  localStorageService.remove(_localStrage);
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
        var _log = 'GroupsSDK:deleteGroup: ' + _localStrage;
        $log.debug(_log);

        return deferred.promise;
      };

      /**
       * Get a group
       */
      this.getGroup = function (groupId, local) {
        local = angular.isUndefined(local) ? false : local;
        var deferred = $q.defer();
        var _localStrage = 'api/group/' + groupId;
        var packet = localStorageService.get(_localStrage);
        if (ValidationAPI.hasExpired(packet) || !local) {
          GroupsAPI.group().query({
            gid: groupId
          }).$promise.then(
            function (response) {
              if (response.status === 200) {
                packet = {
                  data: response,
                  timestamp: new Date().getTime()
                };
                if (local) {
                  localStorageService.set(_localStrage, packet);
                } else {
                  localStorageService.remove(_localStrage);
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
        var _log = 'GroupsSDK:getGroup: ' + _localStrage;
        $log.debug(_log);

        return deferred.promise;
      };

      /**
       * Get posts within a group
       */
      this.getPosts = function (groupId, page, limit, local) {
        local = angular.isUndefined(local) ? false : local;
        var deferred = $q.defer();
        var _localStorage = 'api/groups/posts';
        var packet = localStorageService.get(_localStorage);
        if (ValidationAPI.hasExpired(packet) || !local) {
          GroupsAPI.getPosts().query({
            gid: groupId,
            page: page,
            limit: limit,
            commentLimit: limit
          }).$promise.then(
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
        var _log = 'GroupsSDK:getPosts: ' + _localStorage;
        $log.debug(_log);

        return deferred.promise;
      };

      /**
       * Create a group post
       */
      this.createPost = function (groupId, contentObj, local) {
        local = angular.isUndefined(local) ? false : local;
        var deferred = $q.defer();
        var _localStorage = 'api/groups/posts/create';
        var packet = localStorageService.get(_localStorage);
        if (ValidationAPI.hasExpired(packet) || !local) {
          GroupsAPI.posts().create({
            gid: groupId
          }, contentObj).$promise.then(
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
        var _log = 'GroupsSDK:createPost: ' + _localStorage;
        $log.debug(_log);

        return deferred.promise;
      };

      /**
       * Add post attachments
       */
      this.addPostAttachment = function (groupId, postId, attachment, local) {
        local = angular.isUndefined(local) ? false : local;
        var deferred = $q.defer();
        var _localStorage = 'api/groups/posts/attachment/add';
        var packet = localStorageService.get(_localStorage);
        if (ValidationAPI.hasExpired(packet) || !local) {
          GroupsAPI.postAttachments().add({
            gid: groupId,
            pid: postId
          }, attachment).$promise.then(
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
        var _log = 'GroupsSDK:addPostAttachment: ' + _localStorage;
        $log.debug(_log);

        return deferred.promise;
      };

      /**
       * Edit a group post
       */
      this.editPost = function (groupId, postId, contentObj, local) {
        local = angular.isUndefined(local) ? false : local;
        var deferred = $q.defer();
        var _localStorage = 'api/groups/posts/edit';
        var packet = localStorageService.get(_localStorage);
        if (ValidationAPI.hasExpired(packet) || !local) {
          GroupsAPI.posts().update({
            gid: groupId,
            pid: postId
          }, contentObj).$promise.then(
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
        var _log = 'GroupsSDK:editPost: ' + _localStorage;
        $log.debug(_log);

        return deferred.promise;
      };

      /**
       * Delete a group post
       */
      this.deletePost = function (groupId, postId, local) {
        local = angular.isUndefined(local) ? false : local;
        var deferred = $q.defer();
        var _localStorage = 'api/groups/posts/delete';
        var packet = localStorageService.get(_localStorage);
        if (ValidationAPI.hasExpired(packet) || !local) {
          GroupsAPI.posts().remove({
            gid: groupId,
            pid: postId
          }).$promise.then(
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
        var _log = 'GroupsSDK:deletePost: ' + _localStorage;
        $log.debug(_log);

        return deferred.promise;
      };

      /**
       * Like a post
       */
      this.likePost = function (groupId, postId, local) {
        local = angular.isUndefined(local) ? false : local;
        var deferred = $q.defer();
        var _localStorage = 'api/groups/posts/like';
        var packet = localStorageService.get(_localStorage);
        if (ValidationAPI.hasExpired(packet) || !local) {
          GroupsAPI.likePost().like({
            gid: groupId,
            pid: postId
          }).$promise.then(
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
        var _log = 'GroupsSDK:likePost: ' + _localStorage;
        $log.debug(_log);

        return deferred.promise;
      };

      /**
       * Like a post
       */
      this.dislikePost = function (groupId, postId, local) {
        local = angular.isUndefined(local) ? false : local;
        var deferred = $q.defer();
        var _localStorage = 'api/groups/posts/create';
        var packet = localStorageService.get(_localStorage);
        if (ValidationAPI.hasExpired(packet) || !local) {
          GroupsAPI.likePost().unlike({
            gid: groupId,
            pid: postId
          }).$promise.then(
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
        var _log = 'GroupsSDK:dislikePost: ' + _localStorage;
        $log.debug(_log);

        return deferred.promise;
      };

      /**
       * Comment a post
       */
      this.commentPost = function (groupId, postId, contentObj, local) {
        local = angular.isUndefined(local) ? false : local;
        var deferred = $q.defer();
        var _localStorage = 'api/groups/posts/comments/create';
        var packet = localStorageService.get(_localStorage);
        if (ValidationAPI.hasExpired(packet) || !local) {
          GroupsAPI.commentPost().create({
            gid: groupId,
            pid: postId
          }, contentObj).$promise.then(
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
        var _log = 'GroupsSDK:commentPost: ' + _localStorage;
        $log.debug(_log);

        return deferred.promise;
      };

      /**
       * Get comments
       */
      this.getComments = function (groupId, postId, page, limit, local) {
        local = angular.isUndefined(local) ? false : local;
        var deferred = $q.defer();
        var _localStorage = 'api/groups/posts/comments/get';
        var packet = localStorageService.get(_localStorage);
        if (ValidationAPI.hasExpired(packet) || !local) {
          GroupsAPI.getComments().query({
            gid: groupId,
            pid: postId,
            page: page,
            limit: limit
          }).$promise.then(
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
        var _log = 'GroupsSDK:getComments: ' + _localStorage;
        $log.debug(_log);

        return deferred.promise;
      };

      /**
       * Edit comment
       */
      this.editComment = function (groupId, postId, commentId, contentObj, local) {
        local = angular.isUndefined(local) ? false : local;
        var deferred = $q.defer();
        var _localStorage = 'api/groups/posts/comments/edit';
        var packet = localStorageService.get(_localStorage);
        if (ValidationAPI.hasExpired(packet) || !local) {
          GroupsAPI.commentPost().update({
            gid: groupId,
            pid: postId,
            cid: commentId
          }, contentObj).$promise.then(
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
        var _log = 'GroupsSDK:editComment: ' + _localStorage;
        $log.debug(_log);

        return deferred.promise;
      };

      /**
       * Delete comment
       */
      this.deleteComment = function (groupId, postId, commentId, local) {
        local = angular.isUndefined(local) ? false : local;
        var deferred = $q.defer();
        var _localStorage = 'api/groups/posts/comments/delete';
        var packet = localStorageService.get(_localStorage);
        if (ValidationAPI.hasExpired(packet) || !local) {
          GroupsAPI.commentPost().remove({
            gid: groupId,
            pid: postId,
            cid: commentId
          }).$promise.then(
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
        var _log = 'GroupsSDK:deleteComment: ' + _localStorage;
        $log.debug(_log);

        return deferred.promise;
      };

      /**
       * Search groups
       *
       * @param {Object} query Search object
       * @param {Bool} local Cache data
       * @returns Available groups list
       */
      this.searchGroups = function (query, local) {
        local = angular.isUndefined(local) ? false : local;
        var deferred = $q.defer();
        var _localStrage = 'api/groups/search/' + query.query;
        var packet = localStorageService.get(_localStrage);
        if (ValidationAPI.hasExpired(packet) || !local) {
          GroupsAPI.search().search({}, query).$promise.then(
            function (response) {
              if (response.status === 200) {
                packet = {
                  data: response,
                  timestamp: new Date().getTime()
                };
                if (local) {
                  localStorageService.set(_localStrage, packet);
                } else {
                  localStorageService.remove(_localStrage);
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
        var _log = 'GroupsSDK:searchGroups: ' + _localStrage;
        $log.debug(_log);

        return deferred.promise;
      };
    });
