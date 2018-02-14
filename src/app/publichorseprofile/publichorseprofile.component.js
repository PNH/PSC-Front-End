angular
  .module('app')
  .component('publicHorseprofileCom', {
    templateUrl: 'app/publichorseprofile/template/horseprofile.html',
    controller: function ($scope, $log, $q, $rootScope, $timeout, $sce, $state, $filter, $window, $stateParams, SETTINGS, HorseSDK, MetaSDK, OnbaordSDK, WallSDK, LevelSDK, UserSDK, PublicProfileSDK, ConnectionsSDK, alertify, blockUI, moment, FileSaver, Blob) {
      var self = this;
      self.todayDate = new Date();
      self.horseId = null;
      self.horse = null;
      self.horsenalities = [];
      self.genders = [];
      self.currentUserId = UserSDK.getUserId();
      self.userId = Number($stateParams.userid);
      self.isProcessing = false;
      self.attachedFiles = [];
      self.externalUser = null;
      self.hasUserLoaded = false;

      // Progress
      self.progressLogs = [];
      self.progresslog = {};
      self.levelItems = {
        online: {
          name: "On Line",
          levels: [
            {
              name: "Level 1",
              levelId: 1,
              savvyId: 1
            },
            {
              name: "Level 2",
              levelId: 2,
              savvyId: 2
            },
            {
              name: "Level 3",
              levelId: 3,
              savvyId: 5
            },
            {
              name: "Level 4",
              levelId: 4,
              savvyId: 9
            },
            {
              name: "Level 4+",
              levelId: 5,
              savvyId: 13
            }
          ]
        },
        liberty: {
          name: "On Line",
          levels: [
            {
              name: "Level 2",
              levelId: 2,
              savvyId: 3
            },
            {
              name: "Level 3",
              levelId: 3,
              savvyId: 6
            },
            {
              name: "Level 4",
              levelId: 4,
              savvyId: 10
            },
            {
              name: "Level 4+",
              levelId: 5,
              savvyId: 14
            }
          ]
        },
        freestyle: {
          name: "On Line",
          levels: [
            {
              name: "Level 2",
              levelId: 2,
              savvyId: 4
            },
            {
              name: "Level 3",
              levelId: 3,
              savvyId: 7
            },
            {
              name: "Level 4",
              levelId: 4,
              savvyId: 11
            },
            {
              name: "Level 4+",
              levelId: 5,
              savvyId: 15
            }
          ]
        },
        finesse: {
          name: "On Line",
          levels: [
            {
              name: "Level 3",
              levelId: 3,
              savvyId: 8
            },
            {
              name: "Level 4",
              levelId: 4,
              savvyId: 12
            },
            {
              name: "Level 4+",
              levelId: 5,
              savvyId: 16
            }
          ]
        }
      };
      self.selectedProgressPostPrivacy = '9999';

      // Health Logs
      self.healthLogType = -1;
      self.healthLogs = [];
      self.healthlog = {};
      self.selectedHealthPostPrivacy = '9999';

      // Pagination
      var _paginationLimit = 10;
      self.paginationLimit = 3;
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
      const userLoad = blockUI.instances.get('userLoading');

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

      // Progress Log
      self.viewMoreProgressLog = viewMoreProgressLog;

      // Health Log
      self.viewMoreHealthLog = viewMoreHealthLog;
      self.onHealthTypeChange = onHealthTypeChange;

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

      // Connections
      self.connect = connect;
      self.disconnect = disconnect;

      self.changeHorse = changeHorse;

      // Init
      init();

      function init() {
        self.horseTabType = $stateParams.type ? $stateParams.type : '0';
        if (self.horseTabType === '1') {
          _getProgressLog();
        } else if (self.horseTabType === '2') {
          _getHealthLog();
        }
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
          getUser(self.userId, function () {
            self.hasUserLoaded = true;
          });
        } else {
          alertify.okBtn("OK").alert("Please select a horse first", function (ev) {
            ev.preventDefault();
          });
        }
      }

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

      function resetHealthLogFormData() {
        self.submitBtnClicked = false;
        self.selectedHealthPostPrivacy = '9999';
        self.healthlog = {};
        self.newHealthLog = {};
      }

      function resetHealthLogs() {
        self.HealthLogs = [];
        self.healthLogs = [];
        self.HealthLogIndex = 1;
        self.hasHealthLogReachedEnd = false;
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
          self.issues = response.content;
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

      /**
       * Get public user object
       *
       * @param {Integer} userId User ID
       */
      function getUser(userId, callBackFn) {
        userLoad.start();
        PublicProfileSDK.getUser(userId, true).then(function (response) {
          if (response.content) {
            self.externalUser = response.content.user;
          }
          return HorseSDK.getOthersHorses(userId, true);
        }).then(function (response) {
          self.externalUser.horses = response.content;
          angular.forEach(response.content, function (horse) {
            if (horse.id === self.horseId) {
              self.horse = horse;
              self.horse.birthday = horse.birthday ? moment(horse.birthday, 'M/D/YYYY') : null;
              self.horse.file = null;
            }
          });
          callBackFn();
          userLoad.stop();
        }).catch(function (error) {
          $log.error(error);
          userLoad.stop();
        });
      }

      /**
       * Send a connect request to a user
       *
       * @param {Integer} userId Requestee's user ID
       * @returns Requested status, object
       */
      function connect(userId) {
        var deferred = $q.defer();
        ConnectionsSDK.makeConnection(userId, false).then(function (response) {
          if (response.status === 201) {
            // self.people = removeFromArray(self.people, userId);
            alertify.success('Connection request sent successfully.');
          }
          deferred.resolve(response);
        }, function (error) {
          $log.error(error);
          alertify.error('Oops! Something went wrong. Please try again later.');
          deferred.reject(error);
        });
        return deferred.promise;
      }

      /**
       * Disconnect from a connection
       *
       * @param {any} invId Invitation ID
       * @returns Disconnected object, status
       */
      function disconnect(invId) {
        var deferred = $q.defer();
        ConnectionsSDK.removeConnection(invId, false).then(function (response) {
          if (response.status === 200) {
            alertify.success('You have been successfully disconnected.');
          }
          deferred.resolve(response);
        }, function (error) {
          $log.error(error);
          deferred.reject(error);
          alertify.error('Oops! Something went wrong. Please try again later');
        });
        return deferred.promise;
      }

      /**
       * Change horse and load the data to that selected horse
       *
       * @param {Integer} userid User ID
       * @param {Integer} horseid Horse
       */
      function changeHorse(userid, horseid) {
        $state.go('horseprofile', {userid: userid, horseid: horseid, type: 0});
      }
    }
  });
