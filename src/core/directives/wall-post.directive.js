angular
  .module('core.directive')
  .directive('wallPost',
    function () {
      return {
        restrict: 'E',
        templateUrl: 'core/directives/templates/wall-post.html',
        scope: {
          post: '=',
          like: '=',
          comment: '=',
          getComments: '=',
          editPost: '=',
          deletePost: '=',
          editComment: '=',
          deleteComment: '=',
          ownerId: '=',
          rootAccess: '=',
          sharePlaylistCallback: '='
        },
        bindToController: true,
        controllerAs: 'wallPostCtrl',
        controller: function ($q, $log, $filter, $timeout, $state, blockUI, HorseSDK, PlaylistSDK, alertify, moment, SETTINGS) {
          var self = this;

          self.comments = self.post.wall_post_comment;

          // Pagination
          var _commentIndex = 2;
          var _hasCommented = false;
          self._paginationLimit = 5;
          self._commentReachedEnd = false;

          // Loaders
          self.isLikeProcessing = false;
          self.isDeleteProcessing = false;

          // Toggles
          self.toggleCommentBox = false;
          self.toggleEditBox = false;
          self.showTextArea = true;
          self.toggleText = "More";

          // Horse Progress Logs
          self.hasProgressLogEditPopup = false;
          self.isNewProgressLogProcessing = false;
          self.levelItems = SETTINGS.HORSE_LEVEL_ITEMS;
          self.editProgresslog = {};
          // if (self.post.wallposting_type === "HorseProgress") {
          //   console.log("*****");
          //   angular.element("prl-horse-update-box-progress").scrollLeft(300);
          // }

          // Horse Health Logs
          self.hasHealthLogEditPopup = false;
          self.isNewHealthLogProcessing = false;
          self.editHealthlog = {};
          if (self.post.wallposting_type === "HorseHealth") {
            for (var keyName1 in self.post.wallposting.healthType) {
              if (self.post.wallposting.healthType.hasOwnProperty(keyName1)) {
                self.editHealthlog.healthType = keyName1;
                self.editHealthlog.healthTypeId = self.post.wallposting.healthType[keyName1];
              }
            }
            for (var keyName3 in self.post.wallposting.visitType) {
              if (self.post.wallposting.visitType.hasOwnProperty(keyName3)) {
                if (self.post.wallposting.visitType[keyName3] === 100) {
                  continue;
                }
                self.editHealthlog.healthVisitType = keyName3;
                self.editHealthlog.healthVisitTypeId = self.post.wallposting.visitType[keyName3];
              }
            }
            // self.hasHorseHealthMoreDetails = self.post.wallposting.nextVisit !== null || self.post.wallposting.note !== null || self.post.wallposting.assessment !== null || self.post.wallposting.treatmentOutcome !== null || self.post.wallposting.treatmentCare !== null || self.post.wallposting.recommendations !== null;
          }

          // BlockUI instances
          // const editPopupLoad = blockUI.instances.get('editPopupLoading');

          // Playlists
          self.playlists = null;

          /**
           * Merge two arrays
           *
           * @param {Array} arr1 Array 1
           * @param {Array} arr2 Array 2
           * @returns Merge array
           */
          function mergeArray(arr1, arr2) {
            var temp = arr1;
            if (_hasCommented) {
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
           * Get HealthLog types
          */
          function getHealthVisitTypes() {
            // editPopupLoad.start();
            var deferred = $q.defer();
            HorseSDK.getHorseHealthLogTypes(true).then(function (response) {
              self.healthLogTypes = response.content;
              deferred.resolve(response);
              // editPopupLoad.stop();
            }, function (error) {
              $log.debug(error);
              deferred.reject(error);
              // editPopupLoad.stop();
            });

            return deferred.promise;
          }

          /**
           * Like a post
           *
           * @param {Integer} postId Post ID
           * @param {Integer} likes Number of likes
           * @param {Bool} isLiked Liked status
           */
          function likePost(postId, likes, isLiked) {
            self.isLikeProcessing = true;
            self.like(postId, isLiked).then(function (response) {
              if (response.content === null) {
                self.post.likes -= 1;
                self.post.liked = false;
              } else {
                self.post.likes += 1;
                self.post.liked = true;
              }
              self.isLikeProcessing = false;
            }, function () {
              self.isLikeProcessing = false;
            });
          }

          /**
           * Get comments
           *
           * @param {Integer} commentId Comment ID
           * @param {Integer} page Page index
           * @param {Integer} limit Comments limit
           */
          function getComments(commentId, page, limit) {
            var deferred = $q.defer();
            self.getComments(commentId, _commentIndex).then(function (response) {
              if (response.content === null) {
                self._commentReachedEnd = true;
              } else if (response.content.length < limit) {
                self.comments = mergeArray(self.comments, response.content);
                self._commentReachedEnd = true;
              } else if (!response.content.length < limit) {
                self.posts = mergeArray(self.comments, response.content);
              }
              _commentIndex += 1;
              deferred.resolve();
            }, function (error) {
              $log.error(error);
              self._commentReachedEnd = true;
              deferred.reject();
            });
            return deferred.promise;
          }

          /**
           * Create comment
           *
           * @param {String} comment Comment content
           * @returns Post status, new post
           */
          function createComment(comment) {
            var deferred = $q.defer();
            self.comment(self.post.id, comment).then(function (response) {
              if (response.status === 200) {
                self.comments.unshift(response.content);
                _hasCommented = true;
              }
              deferred.resolve(response);
              self.toggleCommentBox = false;
            }, function (error) {
              deferred.reject(error);
            });
            return deferred.promise;
          }

          /**
           * Edit comment
           *
           * @param {Integer} commentId Comment ID
           * @param {String} comment Comment content
           * @returns Update status, updated comment
           */
          function editComment(commentId, comment) {
            var deferred = $q.defer();
            self.editComment(self.post.id, commentId, comment).then(function (response) {
              deferred.resolve(response);
            }, function (error) {
              deferred.reject(error);
            });
            return deferred.promise;
          }

          /**
           * Delete comment
           *
           * @param {Integer} commentId Comment ID
           * @returns Delete status
           */
          function deleteComment(commentId) {
            var deferred = $q.defer();
            self.deleteComment(self.post.id, commentId).then(function (response) {
              if (response.status === 200) {
                self.comments = $filter('removefromarray')(self.comments, 'id', commentId);
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
           * Progress Log Post Submit Event
          */
          self.editProgresslogBtnClicked = false;
          function onProgressPostEdit() {
            self.editProgresslogBtnClicked = true;
            $log.log(self.horseProgressEditForm);

            self.editProgresslog.onlineLevelTemp = angular.fromJson(self.editProgresslog.onlineLevel);
            self.editProgresslog.libertyLevelTemp = angular.fromJson(self.editProgresslog.libertyLevel);
            self.editProgresslog.freestyleLevelTemp = angular.fromJson(self.editProgresslog.freestyleLevel);
            self.editProgresslog.finesseLevelTemp = angular.fromJson(self.editProgresslog.finesseLevel);

            var tempSavvies = [];
            if (self.editProgresslog.onlineLevelTemp !== Number(9999)) {
              tempSavvies.push({savvy: self.editProgresslog.onlineLevelTemp.savvyId, level: Number(self.editProgresslog.onlineLevelTemp.levelId), time: self.editProgresslog.onlineTime});
            }
            if (self.editProgresslog.libertyLevelTemp !== Number(9999)) {
              tempSavvies.push({savvy: self.editProgresslog.libertyLevelTemp.savvyId, level: Number(self.editProgresslog.libertyLevelTemp.levelId), time: self.editProgresslog.libertyTime});
            }
            if (self.editProgresslog.freestyleLevelTemp !== Number(9999)) {
              tempSavvies.push({savvy: self.editProgresslog.freestyleLevelTemp.savvyId, level: Number(self.editProgresslog.freestyleLevelTemp.levelId), time: self.editProgresslog.freestyleTime});
            }
            if (self.editProgresslog.finesseLevelTemp !== Number(9999)) {
              tempSavvies.push({savvy: self.editProgresslog.finesseLevelTemp.savvyId, level: Number(self.editProgresslog.finesseLevelTemp.levelId), time: self.editProgresslog.finesseTime});
            }

            if (tempSavvies.length === 0) {
              alertify.error('Please add savvy level and minutes');
              return;
            }

            self.newProgressLog = {
              savvies: angular.toJson(tempSavvies)
            };

            if (angular.isDefined(self.editProgresslog.notes) && self.editProgresslog.notes !== "") {
              self.newProgressLog.note = self.editProgresslog.notes;
            }
            if (self.selectedProgressPostPrivacy === String(9999)) {
              self.newProgressLog.privacy = 1;
            } else {
              self.newProgressLog.privacy = self.selectedProgressPostPrivacy;
            }

            $log.log(self.newProgressLog);
            if (self.horseProgressEditForm.$valid) {
              $log.log("New Progress Log edit clicked");

              editPost(self.newProgressLog);
            }
          }

          /**
           * Health Log Post Submit Event
          */
          self.editHealthlogBtnClicked = false;
          function onHealthPostEdit() {
            self.editHealthlogBtnClicked = true;
            $log.log(self.horseHealthEditForm);

            $log.log("--------------self.editHealthlog.providerName---------------");
            $log.log(self.editHealthlog.providerName);

            $log.log("--------------self.editHealthlog.visitDate---------------");
            $log.log(self.editHealthlog.visitDate);
            self.visitDateTemp = moment(self.editHealthlog.visitDate, 'MM/DD/YYYY');
            self.editHealthlog.visitDateSending = (moment(self.visitDateTemp).format('DD/MM/YYYY'));

            $log.log("--------------self.editHealthlog.nextVisitDate---------------");
            $log.log(self.editHealthlog.nextVisitDate);
            self.nextVisitDateTemp = moment(self.editHealthlog.nextVisitDate, 'MM/DD/YYYY');
            self.editHealthlog.nextVisitDateSending = (moment(self.nextVisitDateTemp).format('DD/MM/YYYY'));

            $log.log("--------------self.editHealthlog.selectedHealthVisitType---------------");
            $log.log(self.editHealthlog.selectedHealthVisitType);

            $log.log("--------------self.editHealthlog.notes---------------");
            $log.log(self.editHealthlog.notes);

            $log.log("--------------self.editHealthlog.assessment---------------");
            $log.log(self.editHealthlog.assessment);

            $log.log("--------------self.editHealthlog.treatmentOutcome---------------");
            $log.log(self.editHealthlog.treatmentOutcome);

            $log.log("--------------self.editHealthlog.treatmentCare---------------");
            $log.log(self.editHealthlog.treatmentCare);

            $log.log("--------------self.editHealthlog.recommendations---------------");
            $log.log(self.editHealthlog.recommendations);

            self.newHealthLog = {
              provider: self.editHealthlog.providerName,
              visit: self.editHealthlog.visitDateSending,
              visitType: self.editHealthlog.selectedHealthVisitType,
              healthType: self.editHealthlog.healthTypeId
            };

            if (angular.isDefined(self.editHealthlog.nextVisitDate) && self.editHealthlog.nextVisitDate !== "") {
              self.newHealthLog.nextVisit = self.editHealthlog.nextVisitDateSending;
            }
            if (angular.isDefined(self.editHealthlog.notes) && self.editHealthlog.notes !== "") {
              self.newHealthLog.note = self.editHealthlog.notes;
            }
            if (angular.isDefined(self.editHealthlog.assessment) && self.editHealthlog.assessment !== "") {
              self.newHealthLog.assessment = self.editHealthlog.assessment;
            }
            if (angular.isDefined(self.editHealthlog.treatmentOutcome) && self.editHealthlog.treatmentOutcome !== "") {
              self.newHealthLog.treatmentOutcome = self.editHealthlog.treatmentOutcome;
            }
            if (angular.isDefined(self.editHealthlog.treatmentCare) && self.editHealthlog.treatmentCare !== "") {
              self.newHealthLog.treatmentCare = self.editHealthlog.treatmentCare;
            }
            if (angular.isDefined(self.editHealthlog.recommendations) && self.editHealthlog.recommendations !== "") {
              self.newHealthLog.recommendations = self.editHealthlog.recommendations;
            }
            if (self.selectedHealthPostPrivacy !== String(9999)) {
              self.newHealthLog.privacy = Number(self.selectedHealthPostPrivacy);
            }

            $log.log(self.newHealthLog);
            if (self.horseHealthEditForm.$valid) {
              $log.log("New Health Log edit clicked");

              editPost(self.newHealthLog);
            }
          }

          /**
           * Edit post
           *
           * @param {String} post Post content
           * @returns Update status, updated post
           */
          function editPost(post) {
            self.isNewHealthLogProcessing = true;
            var deferred = $q.defer();
            self.editPost(self.post.id, post, self.post.wallposting_type).then(function (response) {
              angular.copy(response.content, self.post);
              if (self.post.wallposting_type === "HorseHealth") {
                for (var keyName3 in self.post.wallposting.visitType) {
                  if (self.post.wallposting.visitType.hasOwnProperty(keyName3)) {
                    if (self.post.wallposting.visitType[keyName3] === 100) {
                      self.editHealthlog.healthVisitType = "";
                      self.editHealthlog.healthVisitTypeId = 100;
                      continue;
                    }
                    self.editHealthlog.healthVisitType = keyName3;
                    self.editHealthlog.healthVisitTypeId = self.post.wallposting.visitType[keyName3];
                  }
                }
              }
              self.toggleEditBox = false;
              deferred.resolve(response);
              angular.element('#editHealthPost' + self.post.id).modal('hide');
              angular.element('#editProgressPost' + self.post.id).modal('hide');
              self.isNewHealthLogProcessing = false;
            }, function (error) {
              deferred.reject(error);
              self.isNewHealthLogProcessing = false;
            });
            return deferred.promise;
          }

          /**
           * Progress Post Edit Button Clicked
           */
          function onEditProgressLogPopupClicked() {
            self.hasProgressLogEditPopup = true;

            self.editProgresslog.onlineLevel = String(9999);
            self.editProgresslog.libertyLevel = String(9999);
            self.editProgresslog.freestyleLevel = String(9999);
            self.editProgresslog.finesseLevel = String(9999);

            function savvyLevelObjCreator(savvy, level) {
              var obj = {
                name: "Level " + level,
                levelId: level,
                savvyId: savvy
              };
              if (level === 5) {
                obj.name = "Level 4+";
              }
              return angular.toJson(obj);
            }

            for (var l = 0; l < self.post.wallposting.logs.length; l++) {
              switch (self.post.wallposting.logs[l].savvy.id) {
                case self.levelItems.online.levels[0].savvyId: self.editProgresslog.onlineLevel = savvyLevelObjCreator(self.levelItems.online.levels[0].savvyId, 1);
                  self.editProgresslog.onlineTime = self.post.wallposting.logs[l].time;
                  break;
                case self.levelItems.online.levels[1].savvyId: self.editProgresslog.onlineLevel = savvyLevelObjCreator(self.levelItems.online.levels[1].savvyId, 2);
                  self.editProgresslog.onlineTime = self.post.wallposting.logs[l].time;
                  break;
                case self.levelItems.online.levels[2].savvyId: self.editProgresslog.onlineLevel = savvyLevelObjCreator(self.levelItems.online.levels[2].savvyId, 3);
                  self.editProgresslog.onlineTime = self.post.wallposting.logs[l].time;
                  break;
                case self.levelItems.online.levels[3].savvyId: self.editProgresslog.onlineLevel = savvyLevelObjCreator(self.levelItems.online.levels[3].savvyId, 4);
                  self.editProgresslog.onlineTime = self.post.wallposting.logs[l].time;
                  break;
                case self.levelItems.online.levels[4].savvyId: self.editProgresslog.onlineLevel = savvyLevelObjCreator(self.levelItems.online.levels[4].savvyId, 5);
                  self.editProgresslog.onlineTime = self.post.wallposting.logs[l].time;
                  break;
                case self.levelItems.liberty.levels[0].savvyId: self.editProgresslog.libertyLevel = savvyLevelObjCreator(self.levelItems.liberty.levels[0].savvyId, 2);
                  self.editProgresslog.libertyTime = self.post.wallposting.logs[l].time;
                  break;
                case self.levelItems.liberty.levels[1].savvyId: self.editProgresslog.libertyLevel = savvyLevelObjCreator(self.levelItems.liberty.levels[1].savvyId, 3);
                  self.editProgresslog.libertyTime = self.post.wallposting.logs[l].time;
                  break;
                case self.levelItems.liberty.levels[2].savvyId: self.editProgresslog.libertyLevel = savvyLevelObjCreator(self.levelItems.liberty.levels[2].savvyId, 4);
                  self.editProgresslog.libertyTime = self.post.wallposting.logs[l].time;
                  break;
                case self.levelItems.liberty.levels[3].savvyId: self.editProgresslog.libertyLevel = savvyLevelObjCreator(self.levelItems.liberty.levels[3].savvyId, 5);
                  self.editProgresslog.libertyTime = self.post.wallposting.logs[l].time;
                  break;
                case self.levelItems.freestyle.levels[0].savvyId: self.editProgresslog.freestyleLevel = savvyLevelObjCreator(self.levelItems.freestyle.levels[0].savvyId, 2);
                  self.editProgresslog.freestyleTime = self.post.wallposting.logs[l].time;
                  break;
                case self.levelItems.freestyle.levels[1].savvyId: self.editProgresslog.freestyleLevel = savvyLevelObjCreator(self.levelItems.freestyle.levels[1].savvyId, 3);
                  self.editProgresslog.freestyleTime = self.post.wallposting.logs[l].time;
                  break;
                case self.levelItems.freestyle.levels[2].savvyId: self.editProgresslog.freestyleLevel = savvyLevelObjCreator(self.levelItems.freestyle.levels[2].savvyId, 4);
                  self.editProgresslog.freestyleTime = self.post.wallposting.logs[l].time;
                  break;
                case self.levelItems.freestyle.levels[3].savvyId: self.editProgresslog.freestyleLevel = savvyLevelObjCreator(self.levelItems.freestyle.levels[3].savvyId, 5);
                  self.editProgresslog.freestyleTime = self.post.wallposting.logs[l].time;
                  break;
                case self.levelItems.finesse.levels[0].savvyId: self.editProgresslog.finesseLevel = savvyLevelObjCreator(self.levelItems.finesse.levels[0].savvyId, 3);
                  self.editProgresslog.finesseTime = self.post.wallposting.logs[l].time;
                  break;
                case self.levelItems.finesse.levels[1].savvyId: self.editProgresslog.finesseLevel = savvyLevelObjCreator(self.levelItems.finesse.levels[1].savvyId, 4);
                  self.editProgresslog.finesseTime = self.post.wallposting.logs[l].time;
                  break;
                case self.levelItems.finesse.levels[2].savvyId: self.editProgresslog.finesseLevel = savvyLevelObjCreator(self.levelItems.finesse.levels[2].savvyId, 5);
                  self.editProgresslog.finesseTime = self.post.wallposting.logs[l].time;
                  break;
                default: $log.log("No - Savvy Level");
                  break;
              }
            }
            self.editProgresslog.notes = self.post.wallposting.note;
            self.selectedProgressPostPrivacy = String(self.post.privacy);

            $log.log(self.editProgresslog);
          }

          /**
           * Health Post Edit Button Clicked
           */
          function onEditHealthLogPopupClicked() {
            self.hasHealthLogEditPopup = true;
            getHealthVisitTypes();

            self.editHealthlog.providerName = self.post.wallposting.provider;
            self.editHealthlog.visitDate = moment(self.post.wallposting.visit, 'YYYY-MM-DD');
            if (self.post.wallposting.nextVisit !== null) {
              self.editHealthlog.nextVisitDate = moment(self.post.wallposting.nextVisit, 'YYYY-MM-DD');
            }
            // self.editHealthlog.selectedHealthVisitType = self.post.wallposting.visitType;

            for (var keyName2 in self.post.wallposting.visitType) {
              if (self.post.wallposting.visitType.hasOwnProperty(keyName2)) {
                self.editHealthlog.selectedHealthVisitType = String(self.post.wallposting.visitType[keyName2]);
              }
            }

            self.editHealthlog.notes = self.post.wallposting.note;
            self.editHealthlog.assessment = self.post.wallposting.assessment;
            self.editHealthlog.treatmentOutcome = self.post.wallposting.treatmentOutcome;
            self.editHealthlog.treatmentCare = self.post.wallposting.treatmentCare;
            self.editHealthlog.recommendations = self.post.wallposting.recommendations;
            self.editHealthlog.privacy = String(self.post.privacy);

            self.selectedHealthPostPrivacy = String(self.post.privacy);

            $log.log(self.editHealthlog);
          }

          /**
           * Delete post
           *
           * @param {String} post Post content
           * @returns Update status, updated post
           */
          function deletePost(postId) {
            alertify.okBtn("yes").cancelBtn("no").confirm("Are you sure you want to delete this post?", function () {
              self.isDeleteProcessing = true;
              self.deletePost(postId, false).then(function () {
                self.isDeleteProcessing = false;
              }, function () {
                self.isDeleteProcessing = false;
              });
            });
          }

          /**
           * Add a media to playlist
           *
           * @param {Integer} videoId Resource ID
           * @param {Integer} playlistId Playlist ID
           * @param {Bool} alredyIn Status of the resource already being in the playlist
           */
          function onAddToPlaylist(videoId, playlistId, alredyIn) {
            if (alredyIn) {
              PlaylistSDK.deleteResource(playlistId, videoId).then(function (response) {
                $log.debug(response);
                alertify.success("Resource has been removed from the playlist.");
                $state.reload();
              }, function (error) {
                $log.error(error);
              });
            } else {
              PlaylistSDK.addResource(playlistId, videoId).then(function (response) {
                $log.debug(response);
                alertify.success("Resource has been added to the playlist.");
                $state.reload();
              }, function (error) {
                $log.error(error);
              });
            }
          }

          /**
           * Get playlists
           */
          // function getPlaylists() {
          //   PlaylistSDK.getLists(true).then(function (response) {
          //     self.playlists = response.content;
          //   }, function (error) {
          //     self.playlists = [];
          //     $log.error(error);
          //   });
          // }
          /**
           * Callback for sharing playlist
           *
           * @param {Object} payload Shared promise
           */
          function sharePlaylist(payload) {
            self.sharePlaylistCallback(payload);
          }
          /**
           * Health log popup next visit date remove
           */
          function onHealthLogDateRemove() {
            self.editHealthlog.nextVisitDate = null;
          }

          /**
           * Public method
           */
          // Post
          self.onLikePostClicked = likePost;
          self.editPostClicked = editPost;
          self.onEditProgressLogPopupClicked = onEditProgressLogPopupClicked;
          self.onEditHealthLogPopupClicked = onEditHealthLogPopupClicked;
          self.onProgressPostEdit = onProgressPostEdit;
          self.onHealthPostEdit = onHealthPostEdit;
          self.deletePostClicked = deletePost;

          // Comments
          self.editCommentClicked = editComment;
          self.createPostComment = createComment;
          self.deleteCommentClicked = deleteComment;
          self.loadComments = function (id) {
            var deferred = $q.defer();
            getComments(id, _commentIndex, self._paginationLimit).then(function () {
              deferred.resolve();
            }, function () {
              deferred.reject();
            });
            return deferred.promise;
          };

          // Health log date remove
          self.onHealthLogDateRemove = onHealthLogDateRemove;

          // Playlist
          self.onAddToPlaylist = onAddToPlaylist;
          self.sharePlaylist = sharePlaylist;
          // getPlaylists();

          // Scroll event
          if (self.post.wallposting_type === "HorseProgress") {
            $timeout(function () {
              for (var i = 0; i < angular.element(".prl-horse-update-box-progress").length; i++) {
                angular.element(".prl-horse-update-box-progress").scrollLeft((angular.element(".prl-horse-update-box-progress")[i].scrollWidth) / 3);
              }
            }, 2000);
          }
        }
      };
    });
