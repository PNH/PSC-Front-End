angular
  .module('core.service')
  .factory('BlogAPI',
    function ($resource, SETTINGS, $log) {
      var services = {
        blogs: blogs,
        post: post,
        postSlug: postSlug,
        comment: comment,
        archives: archives,
        meta: meta,
        tag: tag
      };

      function blogs() {
        var url = SETTINGS.BASE_URL + SETTINGS.API_V1 + 'blog/posts';
        $log.debug(url);
        return $resource(url, {}, {
          query: {
            method: 'GET',
            isArray: false,
            cancellable: true
          },
          save: {
            method: 'POST',
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

      function post() {
        var url = SETTINGS.BASE_URL + SETTINGS.API_V1 + 'blog/post/:postId';
        $log.debug(url);
        return $resource(url, {postId: '@postId'}, {
          query: {
            method: 'GET',
            isArray: false,
            cancellable: true
          }
        });
      }

      function postSlug() {
        var url = SETTINGS.BASE_URL + SETTINGS.API_V1 + 'post/:postSlug';
        $log.debug(url);
        return $resource(url, {postSlug: '@postSlug'}, {
          query: {
            method: 'GET',
            isArray: false,
            cancellable: true
          }
        });
      }

      function comment() {
        var url = SETTINGS.BASE_URL + SETTINGS.API_V1 + 'blog/post/:postId/comments/:commentId';
        $log.debug(url);
        return $resource(url, {postId: '@postId', commentId: '@commentId'}, {
          query: {
            method: 'GET',
            params: {commentId: null},
            isArray: false,
            cancellable: true
          },
          create: {
            method: 'POST',
            params: {commentId: null},
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

      function archives() {
        var url = SETTINGS.BASE_URL + SETTINGS.API_V1 + 'blog/archive';
        $log.debug(url);
        return $resource(url, {}, {
          query: {
            method: 'GET',
            isArray: false,
            cancellable: true
          }
        });
      }

      function meta() {
        var url = SETTINGS.BASE_URL + SETTINGS.API_V1 + 'blog/meta';
        $log.debug(url);
        return $resource(url, {}, {
          query: {
            method: 'GET',
            isArray: false,
            cancellable: true
          }
        });
      }

      function tag() {
        var url = SETTINGS.BASE_URL + SETTINGS.API_V1 + 'blog/tag-search';
        $log.debug(url);
        return $resource(url, {}, {
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

      return services;
    }
  );
