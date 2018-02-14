angular
  .module('app')
  .component('connectionsCom', {
    templateUrl: 'app/connections/template/connections.html',
    controller: function ($log, $q, $filter, ConnectionsSDK, blockUI, alertify) {
      var self = this;

      self.paginationLimit = 8;

      /**
       * Invitations
       */
      self.invitations = [];

      // Pagination
      var selectedType;
      self.isInvitationLoading = false;
      self.invitationsIndex = 1;
      self.hasInvitationsReachedEnd = false;
      self.selectedInvitationType = 'received';

      // Block UI instances
      const requestsLoad = blockUI.instances.get('requestsLoading');

      /**
       * Connections
       */
      self.connections = [];
      self.filteredConnections = [];

      // Model
      self.hasFiltered = false;

      // Pagination
      self.connectionsIndex = 1;
      self.isConnectionsLoading = false;
      self.hasConnectionsReachedEnd = false;

      // Sort
      self._sortConnections = 'name';
      self.filterMembers = {
        instructor: true,
        member: true,
        staff: true
      };

      // BlockUI instances
      const existingConnectionsLoad = blockUI.instances.get('existingConnectionsLoading');

      /**
       * Get invitations
       *
       * @param {String} type Get invitations
       * Accepted parameters: sent, received
       * @returns Promise
       */
      function getInvitations(type) {
        var deferred = $q.defer();
        var m = {
          concatInvitations: function (content) {
            if (content) {
              if (content.length === 0) {
                self.hasInvitationsReachedEnd = true;
              } else if (content.length < self.paginationLimit) {
                self.invitations = self.invitations.concat(content);
                self.hasInvitationsReachedEnd = true;
              } else if (content.length === self.paginationLimit) {
                self.invitations = self.invitations.concat(content);
              }
            } else {
              self.hasInvitationsReachedEnd = true;
            }
          },
          resetInvitation: function () {
            self.invitationsIndex = 1;
            self.invitations = [];
            self.hasInvitationsReachedEnd = false;
          }
        };
        if (type === 'sent') {
          if (selectedType !== 'sent') {
            m.resetInvitation();
          }
          selectedType = type;
          ConnectionsSDK.getSentInvitations(self.invitationsIndex, self.paginationLimit, false).then(function (response) {
            m.concatInvitations(response.content);
            deferred.resolve(response);
            self.invitationsIndex += 1;
          }, function (error) {
            $log.debug(error);
            deferred.reject(error);
          });
        } else if (type === 'received') {
          if (selectedType !== 'received') {
            m.resetInvitation();
          }
          selectedType = type;
          ConnectionsSDK.getReceivedInvitations(self.invitationsIndex, self.paginationLimit, false).then(function (response) {
            m.concatInvitations(response.content);
            deferred.resolve(response);
            self.invitationsIndex += 1;
          }, function (error) {
            $log.debug(error);
            deferred.reject(error);
          });
        }
        return deferred.promise;
      }

      /**
       * Init for getInvitations method
       */
      function _getInvitations() {
        self.invitationsIndex = 1;
        self.hasInvitationsReachedEnd = false;
        requestsLoad.start();
        getInvitations(self.selectedInvitationType).then(function (response) {
          self.invitations = response.content;
          requestsLoad.stop();
        }, function () {
          requestsLoad.stop();
        });
      }

      /**
       * Delete a sent invitation
       *
       * @param {Integer} invId Invitation ID
       */
      function deleteInvitation(invId) {
        var deferred = $q.defer();
        ConnectionsSDK.removeConnection(invId, false).then(function (response) {
          if (response.status === 200) {
            self.invitations = $filter('removefromarray')(self.invitations, 'id', invId);
            alertify.success('Invitation has been deleted.');
            _getInvitations();
          }
          deferred.resolve(response);
        }, function (error) {
          $log.error(error);
          deferred.reject(error);
          alertify.error('Oops! Something went wrong. Please try again.');
        });
        return deferred.promise;
      }

      /**
       * Invitation actions
       *
       * Accept or decline received invitations
       *
       * @param {any} invId Invitation ID
       * @param {any} actionType Action Type.
       * Accepted action types: 2 (Accept), 3 (Decline)
       */
      function invitationAction(invId, actionType) {
        var deferred = $q.defer();
        ConnectionsSDK.invitationAction(invId, actionType, false).then(function (response) {
          if (response.status === 200) {
            self.invitations = $filter('removefromarray')(self.invitations, 'id', invId);
            if (actionType === 2) {
              _getConnections();
            }
            _getInvitations();
          }
          deferred.resolve(response);
        }, function (error) {
          $log.error(error);
          deferred.reject(error);
          alertify.error('Oops! Something went wrong. Please try again.');
        });
        return deferred.promise;
      }

      /**
       * Get existing connections
       *
       * @returns Existing connections
       */
      function getConnections() {
        var deferred = $q.defer();
        var m = {
          concatConnections: function (content) {
            if (content) {
              if (content.length === 0) {
                self.hasConnectionsReachedEnd = true;
              } else if (content.length < self.paginationLimit) {
                self.connections = self.connections.concat(content);
                self.hasConnectionsReachedEnd = true;
              } else if (content.length === self.paginationLimit) {
                self.connections = self.connections.concat(content);
              }
            } else {
              self.hasConnectionsReachedEnd = true;
            }
            self.filteredConnections = self.connections;
            if (self.hasFiltered) {
              filterByUsers(self.connections, self.filterMembers);
            }
          }
        };
        ConnectionsSDK.getConnections(self.connectionsIndex, self.paginationLimit, false).then(function (response) {
          if (response.status === 200) {
            m.concatConnections(response.content);
            self.connectionsIndex += 1;
          }
          deferred.resolve(response);
        }, function (error) {
          $log.error(error);
          deferred.reject(error);
          alertify.error('Oops! Something went wrong. Please try again.');
        });
        return deferred.promise;
      }

      /**
       * Init method for getConnections
       */
      function _getConnections() {
        existingConnectionsLoad.start();
        self.connectionsIndex = 1;
        self.hasConnectionsReachedEnd = false;
        self.connections = [];
        getConnections().then(function () {
          existingConnectionsLoad.stop();
        }, function () {
          existingConnectionsLoad.stop();
        });
      }

      /**
       * Disconnect from a connection
       *
       * @param {any} invId Invitation ID
       * @returns
       */
      function disconnect(invId) {
        var deferred = $q.defer();
        ConnectionsSDK.removeConnection(invId, false).then(function (response) {
          if (response.status === 200) {
            self.connections = $filter('removefromarray')(self.connections, 'id', invId);
            alertify.success('You have been successfully disconnected.');
            _getConnections();
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
       * Sort connections
       *
       * @param {String} order Sorting order
       */
      function sortConnections(order) {
        self._sortConnections = order;
      }

      /**
       * Filter users by role
       *
       * @param {Object} filter User role object
       */
      function filterByUsers(users, filter) {
        // Private methods
        var m = {
          getSelectedUserTypes: function (filter) {
            var selectedTypes = [];
            for (var type in filter) {
              if (filter[type]) {
                selectedTypes.push(type);
              }
            }
            return selectedTypes;
          }
        };

        if (!filter.member && !filter.instructor && !filter.staff) {
          self.filterMembers = {
            instructor: true,
            member: true,
            staff: true
          };
        }

        self.hasFiltered = true;
        var types = m.getSelectedUserTypes(self.filterMembers);
        var _filtered = [];

        angular.forEach(users, function (user) {
          if (types.includes(user.user.role)) {
            _filtered.push(user);
          }
        });
        self.filteredConnections = _filtered;
      }

      /**
       * Public methods
       */
      self.changeInvitationType = function (type) {
        requestsLoad.start();
        getInvitations(type).then(function () {
          requestsLoad.stop();
        }, function () {
          requestsLoad.stop();
        });
      };
      self.viewMoreInvitations = function (type) {
        var deferred = $q.defer();
        getInvitations(type).then(function () {
          deferred.resolve();
        }, function () {
          deferred.reject();
        });
        return deferred.promise;
      };
      self.viewMoreConnections = function () {
        var deferred = $q.defer();
        getConnections().then(function () {
          deferred.resolve();
        }, function () {
          deferred.reject();
        });
        return deferred.promise;
      };
      self.deleteInvitation = deleteInvitation;
      self.invitationAction = invitationAction;
      self.disconnectConnection = disconnect;
      self.sortConnections = sortConnections;
      self.filterResult = function (filter) {
        filterByUsers(self.connections, filter);
      };

      /**
       * Init
       */
      function _init() {
        self.changeInvitationType(self.selectedInvitationType);
        _getConnections();
      }
      _init();
    }
  });
