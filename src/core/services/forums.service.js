angular
  .module('core.service')
  .factory('ForumsAPI',
    function ($resource, $log, SETTINGS) {
      var services = {
        forums: forums,
        getSubForum: getSubForum,
        getTopics: getTopics,
        topics: topics,
        getTopic: getTopic,
        posts: posts,
        postAttachments: postAttachments,
        // getPosts: getPosts,
        comments: comments
        // getComments: getComments
      };

      function forums() {
        var url = SETTINGS.BASE_URL + SETTINGS.API_V1 + 'forums';
        $log.debug(url);
        return $resource(url, {}, {
          query: {
            method: 'GET',
            isArray: false,
            cancellable: true
          },
          create: {
            method: 'POST',
            isArray: false,
            cancellable: true
          }
        });
      }

      function getSubForum() {
        var url = SETTINGS.BASE_URL + SETTINGS.API_V1 + 'sub-forums/:sid';
        $log.debug(url);
        return $resource(url, {sid: '@sid', page: '@page', limit: '@limit'}, {
          query: {
            method: 'GET',
            isArray: false,
            cancellable: true
          }
        });
      }

      function getTopics() {
        var url = SETTINGS.BASE_URL + SETTINGS.API_V1 + 'forums/:fid/forum-topics';
        $log.debug(url);
        return $resource(url, {fid: '@fid', page: '@page', limit: '@limit'}, {
          query: {
            method: 'GET',
            isArray: false,
            cancellable: true
          }
        });
      }

      function topics() {
        var url = SETTINGS.BASE_URL + SETTINGS.API_V1 + 'forums/:sid/forum-topics/:tid';
        $log.debug(url);
        return $resource(url, {sid: '@sid', tid: '@tid'}, {
          create: {
            method: 'POST',
            params: {tid: ''},
            isArray: false,
            cancellable: true
          },
          edit: {
            method: 'PUT',
            params: {tid: ''},
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

      function getTopic() {
        var url = SETTINGS.BASE_URL + SETTINGS.API_V1 + 'forum-topics/:tid';
        $log.debug(url);
        return $resource(url, {tid: '@tid'}, {
          query: {
            method: 'GET',
            isArray: false,
            cancellable: true
          }
        });
      }

      // function getPosts() {
      //   var url = SETTINGS.BASE_URL + SETTINGS.API_V1 + 'forum-topics/:tid/posts?page=:page&limit=:limit';
      //   $log.debug(url);
      //   return $resource(url, {tid: '@tid', page: '@page', limit: '@limit'}, {
      //     query: {
      //       method: 'GET',
      //       isArray: false,
      //       cancellable: true
      //     }
      //   });
      // }

      function posts() {
        var url = SETTINGS.BASE_URL + SETTINGS.API_V1 + 'forum-topics/:tid/forum-posts/:pid';
        $log.debug(url);
        return $resource(url, {tid: '@tid', pid: '@pid'}, {
          query: {
            method: 'GET',
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
            params: {pid: ''},
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

      function comments() {
        var url = SETTINGS.BASE_URL + SETTINGS.API_V1 + 'forum-posts/:pid/forum-comments/:cid';
        $log.debug(url);
        return $resource(url, {pid: '@pid', cid: '@cid'}, {
          query: {
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
            params: {cid: ''},
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
      //   var url = SETTINGS.BASE_URL + SETTINGS.API_V1 + 'forum-topics/:tid/posts/:pid/comments?page=:page&limit=:limit';
      //   $log.debug(url);
      //   return $resource(url, {tid: '@tid', pid: '@pid', page: '@page', limit: '@limit'}, {
      //     query: {
      //       method: 'GET',
      //       isArray: false,
      //       cancellable: true
      //     }
      //   });
      // }

      function postAttachments() {
        var url = SETTINGS.BASE_URL + SETTINGS.API_V1 + 'forum-posts/:pid/attachment/:aid';
        $log.debug(url);
        return $resource(url, {pid: '@pid', aid: '@aid'}, {
          add: {
            method: 'POST',
            params: {aid: 'null'},
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
          }
        });
      }

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
                return; // if no document attached, just ignore property
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
