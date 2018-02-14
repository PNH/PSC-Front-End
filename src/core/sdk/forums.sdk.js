angular
  .module('core.sdk')
  .service('ForumsSDK',
    function ($q, $log, ForumsAPI, localStorageService, ValidationAPI) {
      /**
       * Get forums
       */
      this.getForums = function (local) {
        local = angular.isUndefined(local) ? false : local;
        var deferred = $q.defer();
        var _localStrage = 'api/forums';
        var packet = localStorageService.get(_localStrage);
        if (ValidationAPI.hasExpired(packet) || !local) {
          ForumsAPI.forums().query({}).$promise.then(
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
        var _log = 'ForumsSDK:getForums: ' + _localStrage;
        $log.debug(_log);

        return deferred.promise;
      };

      /**
       * Get sub forums
       */
      this.getSubForum = function (subForumId, page, limit, local) {
        local = angular.isUndefined(local) ? false : local;
        var deferred = $q.defer();
        var _localStrage = 'api/forums/subforums/' + subForumId;
        var packet = localStorageService.get(_localStrage);
        if (ValidationAPI.hasExpired(packet) || !local) {
          ForumsAPI.getSubForum().query({sid: subForumId, page: page, limit: limit}).$promise.then(
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
        var _log = 'ForumsSDK:getSubForum: ' + _localStrage;
        $log.debug(_log);

        return deferred.promise;
      };

      /**
       * Get topics
       */
      this.getTopics = function (forumId, page, limit, local) {
        local = angular.isUndefined(local) ? false : local;
        var deferred = $q.defer();
        var _localStrage = 'api/forums/subforums/topics/' + forumId + '/' + page;
        var packet = localStorageService.get(_localStrage);
        if (ValidationAPI.hasExpired(packet) || !local) {
          ForumsAPI.getTopics().query({fid: forumId, page: page, limit: limit}).$promise.then(
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
        var _log = 'ForumsSDK:getTopics: ' + _localStrage;
        $log.debug(_log);

        return deferred.promise;
      };

      /**
       * Create topic
       */
      this.createTopic = function (subforumId, content, local) {
        local = angular.isUndefined(local) ? false : local;
        var deferred = $q.defer();
        var _localStrage = 'api/forums/topic/create';
        var packet = localStorageService.get(_localStrage);
        if (ValidationAPI.hasExpired(packet) || !local) {
          ForumsAPI.topics().create({sid: subforumId}, content).$promise.then(
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
        var _log = 'ForumsSDK:createTopic: ' + _localStrage;
        $log.debug(_log);

        return deferred.promise;
      };

      /**
       * Edit topic
       */
      this.editTopic = function (subforumId, content, local) {
        local = angular.isUndefined(local) ? false : local;
        var deferred = $q.defer();
        var _localStrage = 'api/forums/topic/edit';
        var packet = localStorageService.get(_localStrage);
        if (ValidationAPI.hasExpired(packet) || !local) {
          ForumsAPI.topics().edit({sid: subforumId}, content).$promise.then(
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
        var _log = 'ForumsSDK:editTopic: ' + _localStrage;
        $log.debug(_log);

        return deferred.promise;
      };

      /**
       * Delete topic
       */
      this.deleteTopic = function (subforumId, topicId, local) {
        local = angular.isUndefined(local) ? false : local;
        var deferred = $q.defer();
        var _localStrage = 'api/forums/topic/delete';
        var packet = localStorageService.get(_localStrage);
        $log.debug('topic id: ' + topicId);
        if (ValidationAPI.hasExpired(packet) || !local) {
          ForumsAPI.topics().delete({sid: subforumId, tid: topicId}).$promise.then(
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
        var _log = 'ForumsSDK:deleteTopic: ' + _localStrage;
        $log.debug(_log);

        return deferred.promise;
      };

      /**
       * Get topics
       */
      this.getTopic = function (topicId, limit, local) {
        local = angular.isUndefined(local) ? false : local;
        var deferred = $q.defer();
        var _localStrage = 'api/forums/topic/' + topicId;
        var packet = localStorageService.get(_localStrage);
        if (ValidationAPI.hasExpired(packet) || !local) {
          ForumsAPI.getTopic().query({tid: topicId, postLimit: limit}).$promise.then(
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
        var _log = 'ForumsSDK:getTopic: ' + _localStrage;
        $log.debug(_log);

        return deferred.promise;
      };

      /**
       * Get posts
       */
      this.getPosts = function (topicId, page, limit, local) {
        local = angular.isUndefined(local) ? false : local;
        var deferred = $q.defer();
        var _localStrage = 'api/forums/posts/' + topicId + '/' + page;
        var packet = localStorageService.get(_localStrage);
        if (ValidationAPI.hasExpired(packet) || !local) {
          ForumsAPI.posts().query({tid: topicId, page: page, limit: limit}).$promise.then(
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
        var _log = 'ForumsSDK:getPosts: ' + _localStrage;
        $log.debug(_log);

        return deferred.promise;
      };

      /**
       * Create post
       */
      this.createPost = function (topicId, content, local) {
        local = angular.isUndefined(local) ? false : local;
        var deferred = $q.defer();
        var _localStrage = 'api/forums/post/create';
        var packet = localStorageService.get(_localStrage);
        if (ValidationAPI.hasExpired(packet) || !local) {
          ForumsAPI.posts().create({tid: topicId}, content).$promise.then(
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
        var _log = 'ForumsSDK:createPost: ' + _localStrage;
        $log.debug(_log);

        return deferred.promise;
      };

      /**
       * Update post
       */
      this.updatePost = function (topicId, content, local) {
        local = angular.isUndefined(local) ? false : local;
        var deferred = $q.defer();
        var _localStrage = 'api/forums/post/update';
        var packet = localStorageService.get(_localStrage);
        if (ValidationAPI.hasExpired(packet) || !local) {
          ForumsAPI.posts().update({tid: topicId}, content).$promise.then(
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
        var _log = 'ForumsSDK:updatePost: ' + _localStrage;
        $log.debug(_log);

        return deferred.promise;
      };

      /**
       * Delete post
       */
      this.deletePost = function (topicId, postId, local) {
        local = angular.isUndefined(local) ? false : local;
        var deferred = $q.defer();
        var _localStrage = 'api/forums/post/delete';
        var packet = localStorageService.get(_localStrage);
        if (ValidationAPI.hasExpired(packet) || !local) {
          ForumsAPI.posts().delete({tid: topicId, pid: postId}).$promise.then(
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
        var _log = 'ForumsSDK:deletePost: ' + _localStrage;
        $log.debug(_log);

        return deferred.promise;
      };

      /**
       * Add post attachments
       */
      this.addPostAttachment = function (topicId, postId, attachment, local) {
        local = angular.isUndefined(local) ? false : local;
        var deferred = $q.defer();
        var _localStorage = 'api/groups/posts/attachment/add';
        var packet = localStorageService.get(_localStorage);
        if (ValidationAPI.hasExpired(packet) || !local) {
          ForumsAPI.postAttachments().add({pid: postId}, attachment).$promise.then(
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
       * Create comment
       */
      this.createComment = function (topicId, postId, content, local) {
        local = angular.isUndefined(local) ? false : local;
        var deferred = $q.defer();
        var _localStrage = 'api/forums/post/comment/create';
        var packet = localStorageService.get(_localStrage);
        if (ValidationAPI.hasExpired(packet) || !local) {
          ForumsAPI.comments().create({pid: postId}, content).$promise.then(
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
        var _log = 'ForumsSDK:createComment: ' + _localStrage;
        $log.debug(_log);

        return deferred.promise;
      };

      /**
       * Update comment
       */
      this.updateComment = function (topicId, postId, content, local) {
        local = angular.isUndefined(local) ? false : local;
        var deferred = $q.defer();
        var _localStrage = 'api/forums/post/comment/update';
        var packet = localStorageService.get(_localStrage);
        if (ValidationAPI.hasExpired(packet) || !local) {
          ForumsAPI.comments().update({tid: topicId, pid: postId}, content).$promise.then(
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
        var _log = 'ForumsSDK:updateComment: ' + _localStrage;
        $log.debug(_log);

        return deferred.promise;
      };

      /**
       * Delete comment
       */
      this.deleteComment = function (topicId, postId, commentId, local) {
        local = angular.isUndefined(local) ? false : local;
        var deferred = $q.defer();
        var _localStrage = 'api/forums/post/comment/delete';
        var packet = localStorageService.get(_localStrage);
        if (ValidationAPI.hasExpired(packet) || !local) {
          ForumsAPI.comments().delete({pid: postId, cid: commentId}).$promise.then(
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
        var _log = 'ForumsSDK:deleteComment: ' + _localStrage;
        $log.debug(_log);

        return deferred.promise;
      };

      /**
       * Get comments
       */
      this.getComments = function (topicId, postId, page, limit, local) {
        local = angular.isUndefined(local) ? false : local;
        var deferred = $q.defer();
        var _localStrage = 'api/forums/' + topicId + '/post/' + postId + '/comments/' + page;
        var packet = localStorageService.get(_localStrage);
        if (ValidationAPI.hasExpired(packet) || !local) {
          ForumsAPI.comments().query({pid: postId, page: page, limit: limit}).$promise.then(
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
        var _log = 'ForumsSDK:getComments: ' + _localStrage;
        $log.debug(_log);

        return deferred.promise;
      };
    });
