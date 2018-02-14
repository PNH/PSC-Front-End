angular
  .module('app')
  .component('horseprofileCom', {
    templateUrl: 'app/horseprofile/template/horseprofile.html',
    controller: function ($scope, $log, $q, $rootScope, $timeout, $sce, $state, $filter, $window, $stateParams, SETTINGS, HorseSDK, MetaSDK, OnbaordSDK, WallSDK, LevelSDK, UserSDK, alertify, blockUI, moment, FileSaver, Blob) {
      var self = this;
      self.todayDate = new Date();
      self.horseId = null;
      self.horse = null;
      self.horsenalities = [];
      self.genders = [];
      self.currentUserId = UserSDK.getUserId();
      self.isProcessing = false;
      self.attachedFiles = [];
      self.archives = null;
      self.year = null;
      self.month = null;
      self.horseTabType = null;
      self.isIE = isIEorEDGE();

      // Progress
      self.progressLogs = [];
      self.progresslog = {};
      self.levelItems = SETTINGS.HORSE_LEVEL_ITEMS;
      self.selectedProgressPostPrivacy = '9999';

      // Health Logs
      self.healthLogType = -1;
      self.healthLogs = [];
      self.healthlog = {};
      self.selectedHealthPostPrivacy = '9999';

      // Pagination
      var _paginationLimit = 10;
      self.paginationLimit = 10;
      self.isHealthLogLoading = false;
      self.HealthLogIndex = 1;
      self.hasHealthLogReachedEnd = false;

      self.isProgressLogLoading = false;
      self.progressLogIndex = 1;
      self.hasProgressLogReachedEnd = false;

      self.isNewHealthLogProcessing = false;
      self.isNewProgressLogProcessing = false;

      // Controls
      self.uploadCtrl = {};

      // BlockUI instances
      const existingHealthLogLoad = blockUI.instances.get('existingHealthLogLoading');
      const existingProgressLogLoad = blockUI.instances.get('existingProgressLogLoading');
      const solutionMapLoad = blockUI.instances.get('solutionMapLoading');
      const healthLogLoad = blockUI.instances.get('healthLogLoading');

      //
      MetaSDK.getHorseMeta(true).then(function (response) {
        self.horsenalities = response.content.horsenality;
        self.genders = response.content.sex;
      }, function (error) {
        $log.error(error);
      });
      self.issues = [];
      self.levels = null;
      self.html2imgControls = {};
      self.onboardImage = null;

      // Loaders
      self.isImageGenerating = false;
      self.sharingToWall = false;

      // Public methods
      self.downloadImage = downloadImage;
      self.goToUpdateOnboard = goToUpdateOnboard;
      self.postToWall = postToWall;

      // Progress Log
      self.onProgressPostSubmit = onProgressPostSubmit;
      self.viewMoreProgressLog = viewMoreProgressLog;

      // Health Log
      self.onHealthPostSubmit = onHealthPostSubmit;
      self.viewMoreHealthLog = viewMoreHealthLog;
      self.onHealthTypeChange = onHealthTypeChange;
      self.onHealthLogDateRemove = onHealthLogDateRemove;

      // Post methods
      self.editPost = editPost;
      self.deletePost = deletePost;
      self.likePost = likePost;
      self.attachClicked = attachFile;
      self.removeAttachedFileClicked = removeAttachedFile;

      // Comments
      self.getComments = getComments;
      self.commentPost = createComment;
      self.editComment = editComment;
      self.deleteComment = deleteComment;

      // Archives
      self.onArchiveClicked = onArchiveClicked;
      self.resetArchive = resetArchive;

      // Init
      init();

      function init() {
        MetaSDK.getHorseMeta(true).then(function (response) {
          self.horsenalities = response.content.horsenality;
          self.genders = response.content.sex;
        }, function (error) {
          $log.error(error);
        });

        if (angular.isDefined($stateParams.horseid)) {
          self.horseId = parseInt($stateParams.horseid, 10);
          LevelSDK.getLevels(true).then(function (response) {
            self.levels = response.content;
          });
          getIssues(self.horseId);
          HorseSDK.getHorses(true).then(function (response) {
            angular.forEach(response.content, function (horse) {
              if (horse.id === self.horseId) {
                self.horse = horse;
                self.horse.birthday = moment(horse.birthday, 'M/D/YYYY');
                self.horse.file = null;
              }
            });
          }, function (error) {
            $log.error(error);
          });
        } else {
          alertify.okBtn("OK").alert("Please select a horse first", function (ev) {
            ev.preventDefault();
          });
        }

        self.horseTabType = $stateParams.type ? $stateParams.type : '0';
        if (self.horseTabType === '1') {
          getProgressArchives(self.horseId, function () {
            _getProgressLog();
          });
        } else if (self.horseTabType === '2') {
          getHealthArchives(self.horseId, function () {
            _getHealthLog();
          });
        }
      }

      // events
      self.onUpdateProfileClicked = function onUpdateProfileClicked() {
        self.isProcessing = true;
        self.horse.birthday = self.horse.birthday._isValid ? moment(self.horse.birthday).format('M/D/YYYY') : '';

        HorseSDK.updateHorses(self.horseId, self.horse).then(function () {
          HorseSDK.getHorses(false).then(function (response) {
            angular.forEach(response.content, function (horse) {
              if (horse.id === self.horseId) {
                self.horse = horse;
                self.horse.birthday = moment(self.horse.birthday, 'M/D/YYYY');
                self.horse.file = null;
                HorseSDK.setCurrentHorse(self.horse);
                $log.debug(self.horse);
                alertify.okBtn("OK").alert("Horse profile information has been successfully updated.");
                $rootScope.$broadcast(SETTINGS.NOTIFICATION.NEWHORSE, {
                  type: 1,
                  message: 'Profile has been updated'
                });
              }
            });
          }, function (error) {
            $log.error(error);
          });
          self.isProcessing = false;
        }, function (error) {
          $log.error(error);
          self.isProcessing = false;
        });
      };

      self.onDeleteProfileClicked = function onDeleteProfileClicked() {
        alertify.okBtn("yes").cancelBtn("no").confirm("Are you sure you want to remove this horse?", function () {
          HorseSDK.removeHorses(self.horseId).then(function () {
            var _horse = null;
            HorseSDK.removeCurrentHorse();
            $rootScope.$broadcast(SETTINGS.NOTIFICATION.NEWHORSE, {
              type: 1,
              message: 'Profile has been updated'
            });
            HorseSDK.getHorses().then(function (response) {
              var _horses = response.content;
              if (_horses[0]) {
                _horse = _horses[0];
                HorseSDK.setCurrentHorse(_horse);
                $state.go('dashboard', {
                  horseid: _horse.id
                });
              } else {
                $state.go('dashboard', {
                  horseid: null
                });
              }
            }, function (error) {
              $log.error(error);
              alertify.error(error.message);
            });
          }, function (error) {
            $log.error(error);
          });
        }, function () {});
      };

      /**
       * Get Progress Logs
       *
       * @param {String} type - Health Log Type
       * @returns Promise
       */
      function getProgressLog() {
        var deferred = $q.defer();
        var m = {
          concatProgressLog: function (content) {
            if (content) {
              if (content.length === 0) {
                self.hasProgressLogReachedEnd = true;
              } else if (content.length < self.paginationLimit) {
                self.progressLogs = self.progressLogs.concat(content);
                self.hasProgressLogReachedEnd = true;
              } else if (content.length === self.paginationLimit) {
                self.progressLogs = self.progressLogs.concat(content);
              }
            } else {
              self.hasProgressLogReachedEnd = true;
            }

            $log.log("-----------------self.progressLogs-----------------");
            $log.log(self.progressLogs);
          }
        };
        HorseSDK.getHorseProgressLogs(self.progressLogIndex, self.paginationLimit, $stateParams.horseid, false).then(function (response) {
          m.concatProgressLog(response.content);
          $log.log(response);
          deferred.resolve(response);
          self.progressLogIndex += 1;
        }, function (error) {
          $log.debug(error);
          deferred.reject(error);
        });

        return deferred.promise;
      }

      /**
       * Progress Log Post Submit Event
       */
      self.submitBtnClickedProgress = false;

      function onProgressPostSubmit() {
        self.submitBtnClickedProgress = true;
        $log.log(self.progressForm);

        self.progresslog.onlineLevelTemp = angular.fromJson(self.progresslog.onlineLevel);
        self.progresslog.libertyLevelTemp = angular.fromJson(self.progresslog.libertyLevel);
        self.progresslog.freestyleLevelTemp = angular.fromJson(self.progresslog.freestyleLevel);
        self.progresslog.finesseLevelTemp = angular.fromJson(self.progresslog.finesseLevel);

        $log.log(self.progresslog);

        var tempSavvies = [];
        if (self.progresslog.onlineLevelTemp !== Number(9999)) {
          tempSavvies.push({savvy: self.progresslog.onlineLevelTemp.savvyId, level: Number(self.progresslog.onlineLevelTemp.levelId), time: self.progresslog.onlineTime});
        }
        if (self.progresslog.libertyLevelTemp !== Number(9999)) {
          tempSavvies.push({savvy: self.progresslog.libertyLevelTemp.savvyId, level: Number(self.progresslog.libertyLevelTemp.levelId), time: self.progresslog.libertyTime});
        }
        if (self.progresslog.freestyleLevelTemp !== Number(9999)) {
          tempSavvies.push({savvy: self.progresslog.freestyleLevelTemp.savvyId, level: Number(self.progresslog.freestyleLevelTemp.levelId), time: self.progresslog.freestyleTime});
        }
        if (self.progresslog.finesseLevelTemp !== Number(9999)) {
          tempSavvies.push({savvy: self.progresslog.finesseLevelTemp.savvyId, level: Number(self.progresslog.finesseLevelTemp.levelId), time: self.progresslog.finesseTime});
        }

        if (tempSavvies.length === 0) {
          alertify.error('Please add savvy level and minutes');
          return;
        }
        self.newProgressLog = {
          savvies: angular.toJson(tempSavvies)
        };

        if (angular.isDefined(self.progresslog.notes) && self.progresslog.notes !== "") {
          self.newProgressLog.note = self.progresslog.notes;
        }
        if (self.selectedProgressPostPrivacy !== String(9999)) {
          self.newProgressLog.privacy = self.selectedProgressPostPrivacy;
        }

        $log.log(self.newProgressLog);
        if (self.progressForm.$valid) {
          $log.log("New Progress created clicked");

          addNewProgressLog($stateParams.horseid, self.newProgressLog);
        }
      }

      /**
       * Progress log add API Call
       */
      function addNewProgressLog(horseId, newProgressLogObj) {
        self.isNewProgressLogProcessing = true;
        var deferred = $q.defer();
        HorseSDK.makeHorseProgressLog(horseId, newProgressLogObj, false).then(function (response) {
          if (response.status === 201) {
            if (self.attachedFiles.length > 0) {
              var attachmentChain = [];
              angular.forEach(self.attachedFiles, function (value) {
                attachmentChain.push(WallSDK.addPostAttachment(self.currentUserId, response.content.id, {
                  attachment: value
                }).then(function (response) {
                  return response;
                }));
              });
              $q.all(attachmentChain).then(function (response) {
                var attachmentResponse = response[0];
                angular.forEach(response, function (value) {
                  if (attachmentResponse.content.wall_post_attachment.length < value.content.wall_post_attachment.length) {
                    attachmentResponse = value;
                  }
                });
                // self.posts.push(attachmentResponse.content);
                self.progressLogs.push(attachmentResponse.content);
                self.uploadCtrl.reset();
                // _hasPosted = true;
                alertify.success('Progress Post has been successfully added.');
                // self.postModel = "";
                self.attachedFiles = [];
                // self.createProcessing = false;
                self.isNewProgressLogProcessing = false;
                getProgressArchives(self.horseId);
              });
            } else {
              alertify.success('Progress Post has been successfully added.');
              $log.log(response);
              deferred.resolve(response);
              self.progressLogs.push(response.content);
              self.isNewProgressLogProcessing = false;
              getProgressArchives(self.horseId);
            }
            resetProgressLogFormData();
          }
        }, function (error) {
          $log.error(error);
          alertify.error('Oops! Something went wrong. Please try again.');
          deferred.reject(error);
          self.isNewProgressLogProcessing = false;
        });
        return deferred.promise;
      }

      function resetProgressLogFormData() {
        self.submitBtnClickedProgress = false;
        self.newProgressLog = {};
        self.progresslog = {};
        self.progresslog.onlineLevel = '9999';
        self.progresslog.libertyLevel = '9999';
        self.progresslog.freestyleLevel = '9999';
        self.progresslog.finesseLevel = '9999';
        self.selectedProgressPostPrivacy = '9999';
      }
      resetProgressLogFormData();

      /**
       * Get Health Logs
       *
       * @param {String} type - Health Log Type
       * @returns Promise
       */
      function getHealthLog() {
        var deferred = $q.defer();
        var m = {
          concatHealthLog: function (content) {
            if (content) {
              if (content.length === 0) {
                self.hasHealthLogReachedEnd = true;
              } else if (content.length < self.paginationLimit) {
                self.healthLogs = self.healthLogs.concat(content);
                self.hasHealthLogReachedEnd = true;
              } else if (content.length === self.paginationLimit) {
                self.healthLogs = self.healthLogs.concat(content);
              }
            } else {
              self.hasHealthLogReachedEnd = true;
            }

            $log.log("-----------------self.healthLogs-----------------");
            $log.log(self.healthLogs);
          }
        };
        HorseSDK.getHorseHealthLogs(self.HealthLogIndex, self.paginationLimit, $stateParams.horseid, self.healthLogType, false).then(function (response) {
          m.concatHealthLog(response.content);
          // $log.log(response);
          deferred.resolve(response);
          self.HealthLogIndex += 1;
        }, function (error) {
          $log.debug(error);
          deferred.reject(error);
        });

        return deferred.promise;
      }

      /**
       * Get HealthLog types
       */
      function getHealthVisitTypes() {
        var deferred = $q.defer();
        HorseSDK.getHorseHealthLogTypes().then(function (response) {
          self.healthLogTypes = response.content;
          // $log.log(self.healthLogTypes);
          deferred.resolve(response);
        }, function (error) {
          $log.debug(error);
          deferred.reject(error);
        });

        return deferred.promise;
      }
      getHealthVisitTypes();

      /**
       * Health Log Post Submit Event
       */
      self.submitBtnClicked = false;

      function onHealthPostSubmit() {
        self.submitBtnClicked = true;
        $log.log(self.horseHealthForm);

        $log.log("--------------self.healthlog.providerName---------------");
        $log.log(self.healthlog.providerName);

        $log.log("--------------self.healthlog.visitDate---------------");
        $log.log(self.healthlog.visitDate);
        self.visitDateTemp = moment(self.healthlog.visitDate, 'MM/DD/YYYY');
        self.healthlog.visitDateSending = (moment(self.visitDateTemp).format('DD/MM/YYYY'));

        $log.log("--------------self.healthlog.nextVisitDate---------------");
        $log.log(self.healthlog.nextVisitDate);
        self.nextVisitDate = moment(self.healthlog.nextVisitDate, 'MM/DD/YYYY');
        self.healthlog.nextVisitDateSending = (moment(self.nextVisitDate).format('DD/MM/YYYY'));

        $log.log("--------------self.healthlog.selectedHealthVisitType---------------");
        $log.log(self.healthlog.selectedHealthVisitType);

        $log.log("--------------self.healthlog.notes---------------");
        $log.log(self.healthlog.notes);

        $log.log("--------------self.healthlog.assessment---------------");
        $log.log(self.healthlog.assessment);

        $log.log("--------------self.healthlog.treatmentOutcome---------------");
        $log.log(self.healthlog.treatmentOutcome);

        $log.log("--------------self.healthlog.treatmentCare---------------");
        $log.log(self.healthlog.treatmentCare);

        $log.log("--------------self.healthlog.recommendations---------------");
        $log.log(self.healthlog.recommendations);

        self.newHealthLog = {
          provider: self.healthlog.providerName,
          visit: self.healthlog.visitDateSending,
          visitType: self.healthlog.selectedHealthVisitType,
          healthType: self.healthLogType
        };

        if (angular.isDefined(self.healthlog.nextVisitDate) && self.healthlog.nextVisitDate !== "") {
          self.newHealthLog.nextVisit = self.healthlog.nextVisitDateSending;
        }
        if (angular.isDefined(self.healthlog.notes) && self.healthlog.notes !== "") {
          self.newHealthLog.note = self.healthlog.notes;
        }
        if (angular.isDefined(self.healthlog.assessment) && self.healthlog.assessment !== "") {
          self.newHealthLog.assessment = self.healthlog.assessment;
        }
        if (angular.isDefined(self.healthlog.treatmentOutcome) && self.healthlog.treatmentOutcome !== "") {
          self.newHealthLog.treatmentOutcome = self.healthlog.treatmentOutcome;
        }
        if (angular.isDefined(self.healthlog.treatmentCare) && self.healthlog.treatmentCare !== "") {
          self.newHealthLog.treatmentCare = self.healthlog.treatmentCare;
        }
        if (angular.isDefined(self.healthlog.recommendations) && self.healthlog.recommendations !== "") {
          self.newHealthLog.recommendations = self.healthlog.recommendations;
        }
        if (self.selectedHealthPostPrivacy !== String(9999)) {
          self.newHealthLog.privacy = Number(self.selectedHealthPostPrivacy);
        }

        $log.log(self.newHealthLog);
        if (self.horseHealthForm.$valid) {
          $log.log("New Health Log created clicked");

          addNewHealthLog($stateParams.horseid, self.newHealthLog);
        }
      }

      /**
       * Health log add API Call
       */
      function addNewHealthLog(horseId, newHealthLogObj) {
        self.isNewHealthLogProcessing = true;
        var deferred = $q.defer();
        HorseSDK.makeHorseHealthLog(horseId, newHealthLogObj, false).then(function (response) {
          if (response.status === 201) {
            if (self.attachedFiles.length > 0) {
              var attachmentChain = [];
              angular.forEach(self.attachedFiles, function (value) {
                attachmentChain.push(WallSDK.addPostAttachment(self.currentUserId, response.content.id, {
                  attachment: value
                }).then(function (response) {
                  return response;
                }));
              });
              $q.all(attachmentChain).then(function (response) {
                var attachmentResponse = response[0];
                angular.forEach(response, function (value) {
                  if (attachmentResponse.content.wall_post_attachment.length < value.content.wall_post_attachment.length) {
                    attachmentResponse = value;
                  }
                });
                // self.posts.push(attachmentResponse.content);
                self.healthLogs.push(attachmentResponse.content);
                self.uploadCtrl.reset();
                // _hasPosted = true;
                alertify.success('Health Post has been successfully added.');
                // self.postModel = "";
                self.attachedFiles = [];
                // self.createProcessing = false;
                self.isNewHealthLogProcessing = false;
                getHealthArchives(self.horseId);
              });
            } else {
              alertify.success('Health Post has been successfully added.');
              $log.log(response);
              deferred.resolve(response);
              self.healthLogs.push(response.content);
              self.isNewHealthLogProcessing = false;
              getHealthArchives(self.horseId);
            }
            resetHealthLogFormData();
          }
        }, function (error) {
          $log.error(error);
          alertify.error('Oops! Something went wrong. Please try again.');
          deferred.reject(error);
          self.isNewHealthLogProcessing = false;
        });
        return deferred.promise;
      }

      /**
       * Trigger `multi-upload` to attach files
       */
      function attachFile() {
        self.uploadCtrl.triggerFileInput();
      }

      /**
       * Remove an attached file
       *
       * @param {Integer} index Index of the attached file
       */
      function removeAttachedFile(index) {
        self.uploadCtrl.removeItem(index);
      }

      /**
       * Edit post
       *
       * @param {Integer} postId Post ID
       * @param {String} post Post content
       * @returns Update status
       */
      function editPost(postId, post, postType) {
        switch (postType) {
          case "HorseProgress":
            progressPostEdit();
            break;
          case "HorseHealth":
            healthLogPostEdit();
            break;

          default:
            $log.log("Post type not found");
        }

        var deferred = $q.defer();

        function progressPostEdit() {
          HorseSDK.editHorseProgressLog(self.currentUserId, postId, post, false).then(function (response) {
            if (response.status === 200) {
              alertify.success("Post has been successfully updated.");
            } else {
              alertify.error(response.message);
            }
            deferred.resolve(response);
          }, function (error) {
            $log.error(error);
            deferred.reject(error);
            alertify.error("Something went wrong! Please try again later.");
          });
        }

        function healthLogPostEdit() {
          HorseSDK.editHorseHealthLog(self.currentUserId, postId, post, false).then(function (response) {
            if (response.status === 200) {
              alertify.success("Post has been successfully updated.");
            } else {
              alertify.error(response.message);
            }
            deferred.resolve(response);
          }, function (error) {
            $log.error(error);
            deferred.reject(error);
            alertify.error("Something went wrong! Please try again later.");
          });
        }

        return deferred.promise;
      }

      /**
       * Delete post
       *
       * @param {Integer} postId Post ID
       * @returns Update status
       */
      function deletePost(postId) {
        var deferred = $q.defer();
        WallSDK.deletePost(self.currentUserId, postId, false).then(function (response) {
          if (response.status === 200) {
            self.healthLogs = $filter('removefromarray')(self.healthLogs, 'id', postId);
            self.progressLogs = $filter('removefromarray')(self.progressLogs, 'id', postId);
            alertify.success("Post has been successfully deleted.");
            getProgressArchives(self.horseId);
            getHealthArchives(self.horseId);
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
       * Like/Dislike a post
       *
       * @param {Integer} postId Post ID
       * @param {Bool} isLiked Liked state
       * @returns Like status
       */
      function likePost(postId, isLiked) {
        var deferred = $q.defer();
        if (isLiked) {
          WallSDK.dislikePost(self.currentUserId, postId, false).then(function (response) {
            deferred.resolve(response);
          }, function (error) {
            $log.error(error);
            deferred.reject(error);
          });
        } else {
          WallSDK.likePost(self.currentUserId, postId, false).then(function (response) {
            deferred.resolve(response);
          }, function (error) {
            $log.error(error);
            deferred.reject(error);
          });
        }
        return deferred.promise;
      }

      /**
       * Comment a post
       *
       * @param {Integer} postId Commenting post's ID
       * @param {String} comment Comment content
       * @returns Post status
       */
      function createComment(postId, comment) {
        var deferred = $q.defer();
        WallSDK.createComment(self.currentUserId, postId, {
          comment: comment.content
        }, false).then(function (response) {
          if (response.status === 200) {
            alertify.success("Your comment has been successfully added.");
          } else {
            alertify.success("Something went wrong. Please try again later.");
          }
          deferred.resolve(response);
        }, function (error) {
          alertify.success("Something went wrong. Please try again later.");
          $log.error(error);
          deferred.reject(error);
        });
        return deferred.promise;
      }

      /**
       * Edit comment
       *
       * @param {Integer} postId Parent post ID
       * @param {Integer} commentId Comment ID
       * @param {String} comment Comment content
       * @returns Update status
       */
      function editComment(postId, commentId, comment) {
        var deferred = $q.defer();
        WallSDK.editComment(self.currentUserId, postId, commentId, {
          comment: comment.content
        }, false).then(function (response) {
          if (response.status === 200) {
            alertify.success("Your comment has been successfully updated.");
          } else {
            alertify.success("Something went wrong. Please try again later.");
          }
          deferred.resolve(response);
        }, function (error) {
          alertify.success("Something went wrong. Please try again later.");
          $log.error(error);
          deferred.reject(error);
        });
        return deferred.promise;
      }

      /**
       * Delete comment
       *
       * @param {Integer} postId Post ID
       * @param {Integer} commentId Comment ID
       * @returns Delete status
       */
      function deleteComment(postId, commentId) {
        var deferred = $q.defer();
        WallSDK.deleteComment(self.currentUserId, postId, commentId, false).then(function (response) {
          deferred.resolve(response);
        }, function (error) {
          deferred.reject(error);
        });
        return deferred.promise;
      }

      /**
       * Get comments within a post
       *
       * @param {Integer} postId Parent post's ID
       * @param {Integer} page Page index
       * @returns Comments list
       */
      function getComments(postId, page) {
        var deferred = $q.defer();
        WallSDK.getComments(self.currentUserId, postId, page, _paginationLimit, true).then(function (response) {
          deferred.resolve(response);
        }, function (error) {
          alertify.error("Something went wrong. Please try again later.");
          $log.error(error);
          deferred.reject(error);
        });
        return deferred.promise;
      }

      /**
       * Horse Health Tab Change Event
       */
      function onHealthTypeChange(type) {
        $log.log("Health Type : " + type);
        self.healthLogType = type;

        self.uploadCtrl.reset();
        self.attachedFiles = [];

        resetHealthLogFormData();
        resetHealthLogs();
        _getHealthLog();
      }

      /**
       * Init method for getProgressLog
       */
      function _getProgressLog() {
        existingProgressLogLoad.start();
        getProgressLog().then(function () {
          existingProgressLogLoad.stop();
        }, function () {
          existingProgressLogLoad.stop();
        });
      }

      /**
       * Init method for getHealthLog
       */
      function _getHealthLog() {
        existingHealthLogLoad.start();
        getHealthLog().then(function () {
          existingHealthLogLoad.stop();
        }, function () {
          existingHealthLogLoad.stop();
        });
      }

      /**
       * Reset Health Form
       */
      function resetHealthLogFormData() {
        self.submitBtnClicked = false;
        self.selectedHealthPostPrivacy = '9999';
        self.healthlog = {};
        self.newHealthLog = {};
      }

      /**
       * Reset Health Log Data
       */
      function resetHealthLogs() {
        self.HealthLogs = [];
        self.healthLogs = [];
        self.HealthLogIndex = 1;
        self.hasHealthLogReachedEnd = false;
      }

      /**
       * Reset Progress Log Data
       */
      function resetProgressLogs() {
        self.progressLogs = [];
        self.progressLogIndex = 1;
      }

      /**
       * View more function Progress Logs
       */
      function viewMoreProgressLog() {
        self.isProgressLogLoading = true;
        getProgressLog().then(function () {
          self.isProgressLogLoading = false;
        }, function () {
          self.isProgressLogLoading = false;
        });
      }

      /**
       * View more function Health Logs
       */
      function viewMoreHealthLog() {
        self.isHealthLogLoading = true;
        getHealthLog().then(function () {
          self.isHealthLogLoading = false;
        }, function () {
          self.isHealthLogLoading = false;
        });
      }

      function getIssues(horseId) {
        solutionMapLoad.start();
        OnbaordSDK.getIssues(horseId, true).then(function (response) {
          self.issues = response.content.issues;
          solutionMapLoad.stop();
        }, function (error) {
          solutionMapLoad.stop();
          $log.error(error);
        });
      }

      /**
       * Download solution map
       */
      function downloadImage() {
        self.isImageGenerating = true;
        self.html2imgControls.exportImage().then(function (response) {
          self.isImageGenerating = false;
          var base64 = response.split(',')[1];
          var data = b64toBlob(base64, 'image/png');
          FileSaver.saveAs(data, 'solutionmap.png');
        });
      }

      /**
       * Base64 to Blob
       *
       * @param {String} b64Data Base64 string
       * @param {String} contentType Blob content type
       * @param {Integer} sliceSize Slice size
       * @returns Blob
       */
      function b64toBlob(b64Data, contentType, sliceSize) {
        contentType = contentType || '';
        sliceSize = sliceSize || 512;
        var byteCharacters = atob(b64Data);
        var byteArrays = [];
        for (var offset = 0; offset < byteCharacters.length; offset += sliceSize) {
          var slice = byteCharacters.slice(offset, offset + sliceSize);
          var byteNumbers = new Array(slice.length);
          for (var i = 0; i < slice.length; i++) {
            byteNumbers[i] = slice.charCodeAt(i);
          }
          var byteArray = new Uint8Array(byteNumbers);
          byteArrays.push(byteArray);
        }
        var blob = new Blob(byteArrays, {
          type: contentType
        });
        return blob;
      }

      function goToUpdateOnboard() {
        alertify.okBtn("OK").cancelBtn("Cancel").confirm("Have you accomplished your goals or solved problems? Update your map now and select new goals to stay progressive! If you'd like to save a copy of this map, please Cancel and select Download Map first, before making updates.", function () {
          $state.go('updateOnboard.goals');
        });
      }

      /**
       * Share solution map to wall
       *
       * @param {Integer} horseid Horse ID
       */
      function postToWall(horseid) {
        self.sharingToWall = true;
        self.html2imgControls.exportImage().then(function (response) {
          // var image = dataURLtoFile(response, 'solutionmap.png');
          OnbaordSDK.shareSolutionMap(horseid, {
            solutionmap_image: response
          }).then(function () {
            self.sharingToWall = false;
            alertify.success('Successfully shared to My Wall');
          }, function (error) {
            self.sharingToWall = false;
            $log.error(error);
            alertify.error('Oops! Something went wrong. Please try again later');
          });
        });
      }

      /**
       * Get health log archives
       *
       * @param {Integer} horseId Horse ID
       * @param {Integer} year Year
       * @param {Integer} month Month
       */
      function getHealthArchivedLogs(horseId, year, month) {
        healthLogLoad.start();
        HorseSDK.getHealthArchivedLogs(horseId, year, month, false).then(function (response) {
          healthLogLoad.stop();
          self.healthLogs = response.content;
        }, function (error) {
          healthLogLoad.stop();
          $log.error(error);
        });
      }

      /**
       * Get progress log archives
       *
       * @param {Integer} horseId Horse ID
       * @param {Integer} year Year
       * @param {Integer} month Month
       */
      function getProgressArchivedLogs(horseId, year, month) {
        healthLogLoad.start();
        HorseSDK.getProgressArchivedLogs(horseId, year, month, false).then(function (response) {
          healthLogLoad.stop();
          self.progressLogs = response.content;
        }, function (error) {
          healthLogLoad.stop();
          $log.error(error);
        });
      }

      /**
       * Reset archives
       */
      function resetArchive() {
        self.year = null;
        self.month = null;
        if (self.horseTabType === '1') {
          resetProgressLogs();
          _getProgressLog();
        } else if (self.horseTabType === '2') {
          resetHealthLogs();
          _getHealthLog();
        }
      }

      /**
       * Browse archives
       *
       * @param {Integer} year Year
       * @param {Integer} month Month
       */
      function onArchiveClicked(horseId, year, month, tab) {
        self.year = year;
        self.month = month;
        if (tab === '1') {
          getProgressArchivedLogs(horseId, year, month);
        } else {
          getHealthArchivedLogs(horseId, year, month);
        }
      }

      /**
       * Get health log archives
       *
       * @param {Integer} horseId Horse ID
       */
      function getHealthArchives(horseId, callback) {
        existingHealthLogLoad.start();
        HorseSDK.getHealthLogArchives(horseId, false).then(function (response) {
          if (callback) {
            callback(response);
          }
          self.archives = response.content;
          existingHealthLogLoad.stop();
        }, function (error) {
          if (callback) {
            callback(error);
          }
          existingHealthLogLoad.stop();
          $log.error(error);
        });
      }

      /**
       * Get health log archives
       *
       * @param {Integer} horseId Horse ID
       */
      function getProgressArchives(horseId, callback) {
        existingHealthLogLoad.start();
        HorseSDK.getProgressLogArchives(horseId, false).then(function (response) {
          if (callback) {
            callback(response);
          }
          self.archives = response.content;
          existingHealthLogLoad.stop();
        }, function (error) {
          if (callback) {
            callback(error);
          }
          existingHealthLogLoad.stop();
          $log.error(error);
        });
      }

      /**
       * Health log popup next visit date remove
       */
      function onHealthLogDateRemove() {
        self.healthlog.nextVisitDate = null;
      }

      /**
       * Check for IE or Edge
       *
       * @returns Bool
       */
      function isIEorEDGE() {
        return navigator.appName === 'Microsoft Internet Explorer' || (navigator.appName === "Netscape" && navigator.appVersion.indexOf('Edge') > -1);
      }
    }
  });
