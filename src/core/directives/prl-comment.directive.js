angular
  .module('core.directive')
  .directive('prlComment',
    function () {
      return {
        restrict: 'E',
        scope: {
          id: '=',
          comment: '=comment',
          reply: '=',
          like: '=',
          edit: '=',
          deleteComment: '=',
          textArea: '@',
          ownerId: '=',
          rootAccess: '='
        },
        bindToController: true,
        templateUrl: 'core/directives/templates/prl-comment.html',
        controllerAs: 'commentCtrl',
        controller: function ($q, $state, alertify) {
          var self = this;
          self.toggleEditBox = false;
          self.isDeleteProcessing = false;
          self.replyClicked = function (id) {
            self.reply(id);
          };
          self.likeClicked = function (id) {
            self.like(id);
          };
          self.onEditClicked = function onEditClicked(comment) {
            var deferred = $q.defer();
            self.edit(self.comment.id, comment).then(function (response) {
              angular.copy(response.content, self.comment);
              self.toggleEditBox = false;
              deferred.resolve(response);
            }, function (error) {
              self.toggleEditBox = false;
              deferred.reject(error);
            });
            return deferred.promise;
          };

          /**
           * Delete comment
           */
          self.onDeleteClicked = function (commentId) {
            alertify.okBtn("yes").cancelBtn("no").confirm("Are you sure you want to delete this reply?", function () {
              self.isDeleteProcessing = true;
              self.deleteComment(commentId).then(function () {
                self.isDeleteProcessing = false;
              }, function () {
                self.isDeleteProcessing = false;
              });
            });
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
