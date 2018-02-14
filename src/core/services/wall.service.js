angular
  .module('core.service')
  .factory('WallAPI',
    function ($resource, SETTINGS, $log) {
      var services = {
        posts: posts,
        attachments: attachments,
        // getPosts: getPosts,
        likePost: likePost,
        comments: comments,
        publicPosts: publicPosts
        // getComments: getComments
      };

      function posts() {
        var url = SETTINGS.BASE_URL + SETTINGS.API_V1 + 'walls/:wid/posts/:pid';
        $log.debug(url);
        return $resource(url, {wid: '@wid', pid: '@pid'}, {
          query: {
            method: 'GET',
            params: {pid: ''},
            isArray: false,
            cancellable: true
          },
          create: {
            method: 'POST',
            params: {pid: ''},
            isArray: false,
            cancellable: true
          },
          update: {
            method: 'PUT',
            isArray: false,
            cancellable: true
          },
          delete: {
            method: 'DELETE',
            isArray: false,
            cancellable: true
          }
        });
      }

      function publicPosts() {
        var url = SETTINGS.BASE_URL + SETTINGS.API_V1 + 'wall/public';
        $log.debug(url);
        return $resource(url, {}, {
          query: {
            method: 'POST',
            params: {pid: ''},
            isArray: false,
            cancellable: true
          }
        });
      }

      function attachments() {
        var url = SETTINGS.BASE_URL + SETTINGS.API_V1 + 'walls/:wid/posts/:pid/attachment/:aid';
        $log.debug(url);
        return $resource(url, {wid: '@wid', pid: '@pid', aid: '@aid'}, {
          add: {
            method: 'POST',
            params: {aid: 'save'},
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

      // function getPosts() {
      //   var url = SETTINGS.BASE_URL + SETTINGS.API_V1 + 'groups/:gid/posts/nil?page=:page&limit=:limit';
      //   $log.debug(url);
      //   return $resource(url, {gid: '@gid', page: '@page', limit: '@limit'}, {
      //     query: {
      //       method: 'GET',
      //       isArray: false,
      //       cancellable: true
      //     }
      //   });
      // }

      function likePost() {
        var url = SETTINGS.BASE_URL + SETTINGS.API_V1 + 'walls/:wid/posts/:pid/likes';
        $log.debug(url);
        return $resource(url, {wid: '@wid', pid: '@pid'}, {
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

      function comments() {
        var url = SETTINGS.BASE_URL + SETTINGS.API_V1 + 'walls/:wid/posts/:pid/comments/:cid';
        $log.debug(url);
        return $resource(url, {wid: '@wid', pid: '@pid', cid: '@cid'}, {
          get: {
            method: 'GET',
            params: {cid: ''},
            isArray: false,
            cancellable: true
          },
          create: {
            method: 'POST',
            params: {cid: ''},
            isArray: false,
            cancellable: true
          },
          update: {
            method: 'PUT',
            isArray: false,
            cancellable: true
          },
          delete: {
            method: 'DELETE',
            isArray: false,
            cancellable: true
          }
        });
      }

      // function getComments() {
      //   var url = SETTINGS.BASE_URL + SETTINGS.API_V1 + 'groups/:gid/posts/:pid/comment/nil?page=:page&limit=:limit';
      //   $log.debug(url);
      //   return $resource(url, {gid: '@gid', pid: '@pid', page: '@page', limit: '@limit'}, {
      //     query: {
      //       method: 'GET',
      //       isArray: false,
      //       cancellable: true
      //     }
      //   });
      // }

      function makeFormdata(object) {
        var formData = new FormData();
        angular.forEach(object, function (value, property) {
          if (object.hasOwnProperty(property)) {
            if (angular.isObject(object[property]) && property !== 'attachment') {
              var fdata = makeFormdata(object[property]);
              angular.forEach(fdata, function (value, key) {
                var _actproperty = property + "[" + key + "]";
                formData.append(_actproperty, value);
              });
            } else if (object[property] === null || angular.isUndefined(object[property])) {
              if (property === 'attachment') {
                return; // if no attachment attached, just ignore property
              }
              formData.append(property, "");
            } else {
              formData.append(property, object[property]);
            }
          }
        });
        return formData;
      }

      return services;
    });
