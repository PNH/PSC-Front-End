angular
  .module('app')
  .component('eventDetailsCom', {
    templateUrl: 'app/events/template/event-details.html',
    controller: function ($log, $q, $stateParams, $state, $timeout, EventsSDK, ConnectionsSDK, UserSDK, blockUI, alertify) {
      var self = this;

      self.eventId = Number($stateParams.eventid);
      // var _userRole = UserSDK.getUserRole();
      // self.rootAccess = false;

      // if (_userRole === 'admin' || _userRole === 'super_admin') {
      //   self.rootAccess = true;
      // }

      /**
       * EventDetail
       */
      self.eventDetail = [];
      self.isEventCancelled = false;

      // Pagination
      // self.isMyEventLoading = false;
      self.isConnectProcessing = false;
      self.isStatusProcessing = false;

      // BlockUI instances
      const eventDetailsLoad = blockUI.instances.get('eventDetailsLoading');

      /**
       * Get events
       *
       * @returns Promise
      */
      function getEventDetail() {
        var deferred = $q.defer();
        var m = {
          concatEventDetail: function (content) {
            self.eventDetail = content;
            // $log.log(self.eventDetail);
            if (self.eventDetail.status.status === 2) {
              self.isEventCancelled = true;
            }
            if (self.eventDetail.participationStatus.participants > 0) {
              self.deleteOrCancel = "CANCEL";
            } else {
              self.deleteOrCancel = "DELETE";
            }
            if (self.eventDetail.url === "") {
              self.hasSignupUrl = false;
            } else {
              self.hasSignupUrl = true;
            }
            self.currentUser = UserSDK.getUser();
            splitInstructors(self.eventDetail.instructors);
            setStatus();
          }
        };
        EventsSDK.getEventById(self.eventId, false).then(function (response) {
          m.concatEventDetail(response.content);
          deferred.resolve(response);
        }, function (error) {
          $log.debug(error);
          deferred.reject(error);
        });

        return deferred.promise;
      }

      /**
       * split primary instructors and assisting instructors
      */
      function splitInstructors(instructors) {
        self.primaryInstructors = [];
        for (var p = 0; p < instructors.length; p++) {
          if (instructors[p].joinType.key === 1) {
            self.primaryInstructors.push(instructors[p]);
          }
        }

        self.assistingInstructors = [];
        for (var a = 0; a < self.eventDetail.instructors.length; a++) {
          if (self.eventDetail.instructors[a].joinType.key === 0) {
            self.assistingInstructors.push(self.eventDetail.instructors[a]);
          }
        }
      }

      /**
       * Get user
       *
       * @returns Promise
      */
      function setStatus() {
        $timeout(function () {
          if (self.eventDetail.participationStatus.status === 1) {
            self.statusText = "I'm Going";
          } else if (self.eventDetail.participationStatus.status === 2) {
            self.statusText = "Maybe";
          } else {
            self.statusText = "Not Going";
          }
        }, 100);
      }

      /**
       * Delete event
       *
      */
      function onDeletEventClicked() {
        if (self.eventDetail.participationStatus.participants > 0) {
          alertify.okBtn("yes").cancelBtn("no").confirm('Are you sure you want to cancel this event?', function () {
            eventDeleteEvent();
          }, function () {
          // alertify.log('Not deleted');
          });
        } else {
          alertify.okBtn("yes").cancelBtn("no").confirm('Are you sure you want to delete this event?', function () {
            eventDeleteEvent();
          }, function () {
          // alertify.log('Not deleted');
          });
        }
      }
      function eventDeleteEvent() {
        EventsSDK.deleteEvent(self.eventId).then(function (response) {
          $log.debug(response);
          if (self.eventDetail.participationStatus.participants > 0) {
            alertify.log('Event has been cancelled successfully.');
          } else {
            alertify.log('Event has been deleted successfully.');
          }
          $state.go('myevents');
        },
        function (error) {
          $log.error(error);
        });
      }

      /**
       * Send a connect request to a user
       *
       * @param {Integer} userId Requestee's user ID
       * @returns Requested status, object
       */
      function connect(type, userId) {
        self.isConnectProcessing = true;
        var deferred = $q.defer();
        ConnectionsSDK.makeConnection(userId, false).then(function (response) {
          if (response.status === 201) {
            // self.people = removeFromArray(self.people, userId);
            // $log.log("response****");
            // $log.log(response);
            self.isConnectProcessing = false;
            // if (response.content.user.isInstructor) {
            //   self.eventDetail.instructors[0] = response.content.user;
            // } else {
            //   self.eventDetail.organizer = response.content.user;
            // }

            if (type === 'organizer') {
              self.eventDetail.organizer = response.content.user;
              // self.connectedOrganizer = true;
            } else if (type === 'instructor') {
              for (var i = 0; i < self.eventDetail.instructors.length; i++) {
                if (self.eventDetail.instructors[i].id === userId) {
                  self.eventDetail.instructors[i].connectionStatus = response.content.user.connectionStatus;
                  splitInstructors(self.eventDetail.instructors);
                }
              }
              // self.connectedInstructor = true;
            }
            // self.eventDetail.organizer = response;
            alertify.success('Connection request sent successfully.');
            // $state.reload();
          }
          deferred.resolve(response);
        }, function (error) {
          $log.error(error);
          alertify.error('Oops! Something went wrong. Please try again later.');
          deferred.reject(error);
        });
        return deferred.promise;
      }

      function onEventStatusClicked(status) {
        self.isStatusProcessing = true;
        var deferred = $q.defer();
        EventsSDK.setJoinEvent(self.eventId, status, false).then(function (response) {
          alertify.success('Event status updated successfully.');
          deferred.resolve(response);
          // $log.log(response);
          self.eventDetail = response.content;
          setStatus();
          self.isStatusProcessing = false;
          // _getEventDetail();
        }, function (error) {
          $log.error(error);
          alertify.error('Oops! Something went wrong. Please try again later.');
          deferred.reject(error);
          self.isStatusProcessing = false;
        });
        return deferred.promise;
      }

      /**
       * Public methods
      */
      self.onDeletEventClicked = onDeletEventClicked;
      self.connectConnection = connect;
      self.onEventStatusClicked = onEventStatusClicked;

      /**
       * Init method for getEventDetail
       */
      function _getEventDetail() {
        eventDetailsLoad.start();
        getEventDetail().then(function () {
          eventDetailsLoad.stop();
        }, function () {
          eventDetailsLoad.stop();
        });
      }

      /**
       * Init
       */
      function _init() {
        // getEventDetail();
        _getEventDetail();
      }
      _init();
    }
  });
