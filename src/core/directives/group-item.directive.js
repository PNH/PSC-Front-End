angular
  .module('core.directive')
  .directive('groupItem',
    function () {
      return {
        restrict: 'E',
        templateUrl: 'core/directives/templates/group-item.html',
        scope: {
          details: '=',
          join: '=',
          leave: '=',
          delete: '=',
          edit: '='
        },
        bindToController: true,
        controllerAs: 'groupItemCtrl',
        controller: function (alertify) {
          var self = this;
          self.isProcessing = false;
          self.isDeleteProcessing = false;
          self.updateProcessing = false;
          self.groupUpdateError = null;
          self.hasSubmitted = false;
          self.modelId = Math.ceil(Math.random() * 1000000);
          self.groupModel = {
            title: self.details.title,
            description: self.details.description
          };

          /**
           * Join a group
           */
          self.onJoinGroupClicked = function (gid) {
            self.isProcessing = true;
            self.join(gid).then(function (response) {
              self.details.ismember = response.content.ismember;
              self.isProcessing = false;
            }, function () {
              self.isProcessing = false;
            });
          };

          /**
           * Edit group
           */
          self.editGroup = function (groupId, model, isValid) {
            self.groupUpdateError = null;
            self.hasSubmitted = true;
            if (isValid) {
              self.updateProcessing = true;
              self.edit(groupId, model).then(function (response) {
                angular.copy(response.content, self.details);
                self.updateProcessing = false;
                angular.element('#updateGroup' + self.modelId).modal('hide');
                self.hasSubmitted = false;
              }, function (error) {
                self.updateProcessing = false;
                self.hasSubmitted = false;
                if (error.status === 301) {
                  self.groupUpdateError = 'Group title is already taken. Please use a different title.';
                }
              });
            }
          };

          /**
           * Join a group
           */
          self.onLeaveGroupClicked = function (gid, isModerator) {
            if (isModerator) {
              alertify.okBtn("yes").cancelBtn("no").confirm("You are the founder of this group. If you leave, the group will be deleted. Are you sure want to delete this group? (Please contact Parelli Central if you'd like to change founders.)", function () {
                self.isDeleteProcessing = true;
                self.delete(gid).then(function () {
                  self.isDeleteProcessing = false;
                }, function () {
                  self.isDeleteProcessing = false;
                });
              });
            } else {
              alertify.okBtn("yes").cancelBtn("no").confirm("Are you sure you want to remove yourself from this group?", function () {
                self.isDeleteProcessing = true;
                self.leave(gid).then(function (response) {
                  angular.copy(response.content, self.details);
                  self.isDeleteProcessing = false;
                }, function () {
                  self.isDeleteProcessing = false;
                });
              });
            }
          };
        }
      };
    });
