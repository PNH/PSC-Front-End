angular
  .module('core.service')
  .factory('GroupsAPI',
    function ($resource, SETTINGS, $log) {
      var services = {
        mygroups: mygroups,
        allgroups: allgroups,
        group: group,
        join: join,
        posts: posts,
        postAttachments: postAttachments,
        getPosts: getPosts,
        likePost: likePost,
        commentPost: commentPost,
        getComments: getComments,
        search: search
      };

      function mygroups() {
        var url = SETTINGS.BASE_URL + SETTINGS.API_V1 + 'groups/my/filtered';
        $log.debug(url);
        return $resource(url, {}, {
          query: {
            method: 'GET',
            isArray: false,
            cancellable: true
          }
        });
      }

      function allgroups() {
        var url = SETTINGS.BASE_URL + SETTINGS.API_V1 + 'groups/all/filtered';
        $log.debug(url);
        return $resource(url, {}, {
          query: {
            method: 'GET',
            isArray: false,
            cancellable: true
          }
        });
      }

      function group() {
        var url = SETTINGS.BASE_URL + SETTINGS.API_V1 + 'groups/:gid';
        $log.debug(url);
        return $resource(url, {gid: '@gid'}, {
          query: {
            method: 'GET',
            isArray: false,
            cancellable: true
          },
          create: {
            method: 'POST',
            params: {gid: 'nil'},
            isArray: false,
            cancellable: true,
            headers: {
              'Content-Type': undefined,
              'enctype': 'multipart/form-data'
            },
            transformRequest: function (obj) {
              var formdata = makeFormdata(obj);
              return formdata;
            }
          },
          update: {
            method: 'PUT',
            isArray: false,
            cancellable: true,
            headers: {
              'Content-Type': undefined,
              'enctype': 'multipart/form-data'
            },
            transformRequest: function (obj) {
              var formdata = makeFormdata(obj);
              return formdata;
            }
          },
          delete: {
            method: 'DELETE',
            isArray: false,
            cancellable: true
          }
        });
      }

      function join() {
        var url = SETTINGS.BASE_URL + SETTINGS.API_V1 + 'groups/:gid/join';
        $log.debug(url);
        return $resource(url, {gid: '@gid'}, {
          join: {
            method: 'POST',
            isArray: false,
            cancellable: true
          },
          leave: {
            method: 'DELETE',
            isArray: false,
            cancellable: true
          }
        });
      }

      function posts() {
        var url = SETTINGS.BASE_URL + SETTINGS.API_V1 + 'groups/:gid/posts/:pid';
        $log.debug(url);
        return $resource(url, {gid: '@gid', pid: '@pid'}, {
          query: {
            method: 'GET',
            params: {pid: 'nil'},
            isArray: false,
            cancellable: true
          },
          create: {
            method: 'POST',
            params: {pid: 'null'},
            isArray: false,
            cancellable: true
          },
          update: {
            method: 'PUT',
            isArray: false,
            cancellable: true
          },
          remove: {
            method: 'DELETE',
            isArray: false,
            cancellable: true
          }
        });
      }

      function postAttachments() {
        var url = SETTINGS.BASE_URL + SETTINGS.API_V1 + 'groups/:gid/posts/:pid/resource/:rid';
        $log.debug(url);
        return $resource(url, {gid: '@gid', pid: '@pid', rid: '@rid'}, {
          query: {
            method: 'GET',
            params: {rid: 'nil'},
            isArray: false,
            cancellable: true
          },
          add: {
            method: 'POST',
            params: {rid: 'nil'},
            isArray: false,
            cancellable: true,
            headers: {
              'Content-Type': undefined,
              'enctype': 'multipart/form-data'
            },
            transformRequest: function (obj) {
              var formdata = makeFormdata(obj);
              angular.forEach(formdata, function (value, key) {
                $log.warn(key + "=" + value);
              });
              return formdata;
            }
          },
          remove: {
            method: 'DELETE',
            isArray: false,
            cancellable: true
          }
        });
      }

      function getPosts() {
        var url = SETTINGS.BASE_URL + SETTINGS.API_V1 + 'groups/:gid/posts/nil';
        $log.debug(url);
        return $resource(url, {gid: '@gid'}, {
          query: {
            method: 'GET',
            isArray: false,
            cancellable: true
          }
        });
      }

      function likePost() {
        var url = SETTINGS.BASE_URL + SETTINGS.API_V1 + 'groups/:gid/posts/:pid/like';
        $log.debug(url);
        return $resource(url, {gid: '@gid', pid: '@pid'}, {
          like: {
            method: 'POST',
            isArray: false,
            cancellable: true
          },
          unlike: {
            method: 'DELETE',
            isArray: false,
            cancellable: true
          }
        });
      }

      function commentPost() {
        var url = SETTINGS.BASE_URL + SETTINGS.API_V1 + 'groups/:gid/posts/:pid/comment/:cid';
        $log.debug(url);
        return $resource(url, {gid: '@gid', pid: '@pid', cid: '@cid'}, {
          get: {
            method: 'GET',
            params: {cid: 'nil'},
            isArray: false,
            cancellable: true
          },
          create: {
            method: 'POST',
            params: {cid: 'nil'},
            isArray: false,
            cancellable: true
          },
          update: {
            method: 'PUT',
            isArray: false,
            cancellable: true
          },
          remove: {
            method: 'DELETE',
            isArray: false,
            cancellable: true
          }
        });
      }

      function getComments() {
        var url = SETTINGS.BASE_URL + SETTINGS.API_V1 + 'groups/:gid/posts/:pid/comment/nil';
        $log.debug(url);
        return $resource(url, {gid: '@gid', pid: '@pid'}, {
          query: {
            method: 'GET',
            isArray: false,
            cancellable: true
          }
        });
      }

      function makeFormdata(object) {
        var formData = new FormData();
        angular.forEach(object, function (value, property) {
          if (object.hasOwnProperty(property)) {
            if (angular.isObject(object[property]) && (property !== 'document' && property !== 'image')) {
              var fdata = makeFormdata(object[property]);
              angular.forEach(fdata, function (value, key) {
                var _actproperty = property + "[" + key + "]";
                formData.append(_actproperty, value);
              });
            } else if (object[property] === null || angular.isUndefined(object[property])) {
              if (property === 'document' || property === 'image') {
                return; // if no image attached, just ignore property
              }
              formData.append(property, "");
            } else {
              formData.append(property, object[property]);
            }
          }
        });
        return formData;
      }

      function search() {
        var url = SETTINGS.BASE_URL + SETTINGS.API_V1 + 'user/groups/search';
        $log.debug(url);
        return $resource(url, {}, {
          search: {
            method: 'POST',
            isArray: false,
            cancellable: true
          }
        });
      }

      return services;
    });
