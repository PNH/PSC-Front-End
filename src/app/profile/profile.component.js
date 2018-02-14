angular
  .module('app')
  .component('profileCom', {
    templateUrl: 'app/profile/template/profile.html',
    controller: function ($log, $state, $rootScope, $window, $timeout, $q, SETTINGS, UserSDK, MetaSDK, MembershipSDK, EventsSDK, blockUI, alertify, moment) {
      var self = this;
      var _userRole = UserSDK.getUserRole();

      // Loaders
      const cancellationReasonsLoad = blockUI.instances.get('cancellationReasonsLoading');
      const userProfileLoad = blockUI.instances.get('userProfileLoading');
      self.cancellingMembership = false;

      self.profile = null;
      self.user = {
        file: null
      };
      self.membership = null;
      self.ccard = null;
      self.rideStyles = [];
      self.countries = [];
      self.states = null;
      self.statesBilling = null;
      self.currencies = [];
      self.equestrain = [];
      self.humananalities = [];
      self.monthValid = true;
      self.isProcessing = false;
      self.genders = [];
      self.currentMemebershipType = null;
      self.cancellationReasons = [];
      self.pointMarker = {
        lat: null,
        lng: null
      };
      self.cancelMembership = {
        reason: null,
        explain: ''
      };
      self.invalidMap = false;
      self.emailExists = false;
      self.maxDate = '12/30/2010';

      self.cancelMemberhip = cancelMemberhip;
      self.isExpireyValid = isExpireyValid;
      self.onAddressInputComplted = onAddressInputComplted;
      self.onMembershipTypeChange = onMembershipTypeChange;
      self.onEmailRestClicked = onEmailRestClicked;
      self.onEmailValidateCheck = onEmailValidateCheck;
      self.onPasswordRestClicked = onPasswordRestClicked;
      self.onMapMarkerDrag = onMapMarkerDrag;
      self.onCountrySelectedBilling = onCountrySelectedBilling;
      self.onCountrySelected = onCountrySelected;
      self.onUpdateMembershipClicked = onUpdateMembershipClicked;
      self.onUpdateProfileClicked = onUpdateProfileClicked;
      self.searchInstructor = searchInstructor;
      self.addInstructor = addInstructor;
      self.removeInstructor = removeInstructor;

      init();
      /**
       * Init
       */
      function init() {
        var promises = [];
        self.geolocator = $window.navigator.geolocation || {};
        if (_userRole === 'admin' || _userRole === 'super_admin') {
          self.rootAccess = true;
        }
        if (self.geolocator) {
          self.geolocator.getCurrentPosition(handlePosition);
        }
        userProfileLoad.start();
        // Chain promises
        promises.push(MetaSDK.getCountries("en"));
        promises.push(MetaSDK.getUserMeta(true));
        promises.push(MetaSDK.getCurrency(true));
        promises.push(getFullProfile());
        $q.all(promises).then(function (response) {
          userProfileLoad.stop();
          // Set countries
          self.countries = response[0];
          // Set user options
          self.rideStyles = response[1].content.ridingStyle;
          self.equestrain = response[1].content.equestrainInterest;
          self.humananalities = response[1].content.humanities;
          self.genders = response[1].content.genders;
          // Set currencies
          self.currencies = response[2].content;
        }, function (error) {
          $log.error(error);
          alertify.error('Oops! Something went wrong. Please try again later.');
        });
        // Get cancellation reasons
        cancellationReasonsLoad.start();
        MetaSDK.getCancellationReasons(true).then(function (response) {
          self.cancellationReasons = response.content;
          cancellationReasonsLoad.stop();
        });
      }

      /**
       * Get user profile
       */
      function getFullProfile() {
        var deferred = $q.defer();
        UserSDK.getFullProfile().then(function (response) {
          if (response.content) {
            self.profile = response.content;
            self.user = response.content.user;
            if (response.content.user.birthday) {
              self.birthdayLocal = moment(response.content.user.birthday, 'M/D/YYYY');
            }
            self.membership = response.content.membership;
            self.ccard = response.content.creditcard;
            self.user.equestrainInterestLocal = deconstructEquestrians(response.content.user.equestrainInterest);
            self.user.instructorsLocal = response.content.user.instructors;
            /* eslint-disable */
            self.membership.joined_date = moment(self.membership.joined_date, 'YYYY-MM-DD').format('M/D/YYYY');
            self.ccard.expiry_month = response.content.creditcard.expiry_month ? moment(response.content.creditcard.expiry_month, 'M') : null;
            self.ccard.expiry_year = response.content.creditcard.expiry_year ? moment(response.content.creditcard.expiry_year, 'YYYY') : null;
            /* eslint-enable */
            // set defaults
            self.user.file = null;
            self.pointMarker.lat = self.user.homeAddress.xCoordinate;
            self.pointMarker.lng = self.user.homeAddress.yCoordinate;
            MembershipSDK.getMemberships(true).then(function (response) {
              self.memberTypes = response.content;
              angular.forEach(self.memberTypes, function (membership) {
                if (membership.id === self.membership.membershipTypeId) {
                  self.currentMemebershipType = membership;
                  $log.debug(self.currentMemebershipType);
                }
              });
            });

            self.onCountrySelected(self.user.homeAddress.country);
            self.onCountrySelectedBilling(self.user.billingAddress.country);
          }
          deferred.resolve();
        }, function (error) {
          deferred.reject();
          alertify.error(error.user);
          $log.error(error);
        });
        return deferred.promise;
      }

      /**
       * Update user profile
       *
       * @param {Object} user User object
       */
      function onUpdateProfileClicked(user) {
        // code cleanup
        self.profileError = null;
        user.level = restIfDefault(user.level, -1);
        user.relationship = restIfDefault(user.relationship, -1);
        user.humanity = restIfDefault(user.humanity, -1);
        user.equestrainInterest = angular.toJson(constructEquestrians(user.equestrainInterestLocal));
        user.instructors = angular.toJson(constructInstructors(user.instructorsLocal));
        if (angular.isDefined(self.birthdayLocal)) {
          self.profile.user.birthday = self.birthdayLocal._isValid ? moment(self.birthdayLocal).format('M/D/YYYY') : '';
        } else {
          self.profile.user.birthday = '';
        }
        // re-assign values
        self.profile.user = user;
        self.profile.membership = self.membership;
        self.profile.ccard = self.ccard;
        self.profile.update = 'profile';

        self.isProcessing = true;
        UserSDK.updateFullProfile(self.profile).then(function () {
          alertify.okBtn("OK").alert("Your profile information has been successfully updated.");
          getFullProfile();
          UserSDK.validate().then(function (response) {
            self.user.profilePic = response.data.profilePic;
            if (UserSDK.updateUser(response.data)) {
              $rootScope.$broadcast(SETTINGS.NOTIFICATION.PROFILEUPDATE, {
                type: 1,
                message: 'Profile has been updated'
              });
            }
            self.isProcessing = false;
          }, function (error) {
            $log.error(error);
            self.isProcessing = false;
          });
        }, function (error) {
          $log.error(error);
          self.isProcessing = false;
          self.profileError = error.message;
        });
      }

      /**
       * Update user membership
       */
      function onUpdateMembershipClicked() {
        angular.element('#waitingPopup').modal({
          backdrop: 'static',
          keyboard: false
        });
        angular.element('#waitingPopup').modal('show');
        // reset card for updateUser
        self.ccard.id = null;
        self.membershipError = null;
        // re-assign values
        self.profile.user = self.user;
        self.profile.user.equestrainInterest = angular.toJson(constructEquestrians(self.user.equestrainInterestLocal));
        self.profile.user.instructors = angular.toJson(constructInstructors(self.user.instructorsLocal));
        self.profile.membership = self.membership;
        self.profile.creditcard = angular.copy(self.ccard);
        self.profile.user.birthday = self.profile.user.birthday._isValid ? moment(self.profile.user.birthday).format('M/D/YYYY') : '';
        /* eslint-disable */
        self.profile.creditcard.expiry_month = moment(self.profile.creditcard.expiry_month).format('M');
        self.profile.creditcard.expiry_year = moment(self.profile.creditcard.expiry_year).format('YYYY');
        /* eslint-enable */
        // server flag to id
        self.profile.update = 'membership';

        self.isProcessing = true;
        UserSDK.updateFullProfile(self.profile).then(function () {
          self.isProcessing = false;
          angular.element('#waitingPopup').modal('hide');
          alertify.okBtn("OK").alert("Your Membership information has been successfully updated. Please log into the Dashboard again to continue your horsemanship journey.", function (ev) {
            ev.preventDefault();
            UserSDK.logout();
            $rootScope.$broadcast(SETTINGS.NOTIFICATION.LOGOUT, {
              type: 0,
              message: 'You\'ve been successfully logged out'
            });
            $state.go('home');
          });
        }, function (error) {
          angular.element('#waitingPopup').modal('hide');
          $log.error(error);
          self.isProcessing = false;
          self.membershipError = error.message;
        });
      }

      /**
       * Select country
       *
       * @param {Integer} code Country code
       */
      function onCountrySelected(code) {
        angular.forEach(self.countries, function (country) {
          if (country.code === code) {
            self.states = country.states;
          }
        });
      }

      /**
       * Select billing address country
       *
       * @param {Integer} code Country code
       */
      function onCountrySelectedBilling(code) {
        angular.forEach(self.countries, function (country) {
          if (country.code === code) {
            self.statesBilling = country.states;
          }
        });
      }

      /**
       * Map marker event
       *
       * @param {Object} event Event object
       */
      function onMapMarkerDrag(event) {
        self.user.homeAddress.xCoordinate = event.latLng.lat();
        self.user.homeAddress.yCoordinate = event.latLng.lng();
      }

      /**
       * Reset user password
       */
      function onPasswordRestClicked() {
        angular.element('#waitingPassPopup').modal({
          backdrop: 'static',
          keyboard: false
        });
        angular.element('#waitingPassPopup').modal('show');
        self.passwordError = null;
        self.isProcessing = true;
        UserSDK.updatePassword(self.user.oldpassword, self.user.password, self.user.confpassword, self.user.email).then(function (response) {
          alertify.okBtn("OK").alert(response.message);
          self.user.oldpassword = null;
          self.user.password = null;
          self.user.confpassword = null;
          self.isProcessing = false;
          angular.element('#waitingPassPopup').modal('hide');
        }, function (error) {
          self.passwordError = error;
          // alertify.error(error.data.error);
          $log.error(error);
          self.isProcessing = false;
          angular.element('#waitingPassPopup').modal('hide');
        });
      }

      /**
       * Validate email
       */
      function onEmailValidateCheck() {
        if (self.user.newEmail) {
          self.isProcessing = true;
          MembershipSDK.isEmailExist(self.user.newEmail).then(function (response) {
            self.emailExists = response.content.exist;
            self.isProcessing = false;
          }, function (error) {
            $log.error(error);
            self.isProcessing = false;
          });
        }
      }

      /**
       * Reset email
       */
      function onEmailRestClicked() {
        self.isProcessing = true;
        UserSDK.updateEmail(self.user.newEmail, self.user.passwordForEmail).then(function () {
          self.user.newEmail = null;
          self.user.passwordForEmail = null;
          alertify.okBtn("OK").alert("Email address has been updated. You will need to re-login to the system.", function (ev) {
            ev.preventDefault();
            UserSDK.logout();
            $rootScope.$broadcast(SETTINGS.NOTIFICATION.LOGOUT, {
              type: 0,
              message: 'You\'ve been successfully logged out'
            });
            $state.go('home');
          });
        }, function (error) {
          alertify.error(error.error);
          $log.error(error);
          self.isProcessing = false;
        });
      }

      /**
       * Change membership type
       */
      function onMembershipTypeChange() {
        var _memtype = parseInt(self.membership.membershipTypeId, 10);
        angular.forEach(self.memberTypes, function (type) {
          if (type.id === _memtype) {
            $log.debug(type);
            self.currentMemebershipType = type;
            self.membership.membershipTypeId = type.id;
          }
        });
      }

      /**
       * Address input changes event
       */
      function onAddressInputComplted() {
        var _address = self.user.homeAddress.street;
        MetaSDK.getGeocode(_address, self.user.homeAddress.zipcode, 'en', self.user.homeAddress.country, SETTINGS.GOOGLE_GEO_KEY).then(function (response) {
          $log.debug(response);
          if (response.data.status === 'OK') {
            if (response.data.results.length > 0) {
              var _location = response.data.results[0];
              self.pointMarker.lat = _location.geometry.location.lat;
              self.pointMarker.lng = _location.geometry.location.lng;
              //
              self.user.homeAddress.xCoordinate = _location.geometry.location.lat;
              self.user.homeAddress.yCoordinate = _location.geometry.location.lng;
            }
          } else {
            self.invalidMap = true;
            // alertify.log("Location not found");
          }
        }, function (error) {
          $log.error(error);
        });
      }

      /**
       * Credit card expiration validate
       */
      function isExpireyValid() {
        var date = new Date();
        if (self.ccard.cardyear <= new Date().getFullYear()) {
          self.monthValid = (date.getMonth() + 1) <= self.ccard.cardmonth;
        } else {
          self.monthValid = true;
        }
      }

      /**
       * Reset value if default
       */
      function restIfDefault(value, defaultValue) {
        $log.warn(value);
        $log.warn(defaultValue);
        var _obj = null;
        if (value === defaultValue) {
          _obj = null;
        } else {
          _obj = value;
        }
        return _obj;
      }

      /**
       * Map marker handle positions
       *
       * @param {Object} pos Handle positions
       */
      function handlePosition(pos) {
        self.pointMarker.lat = pos.coords.latitude;
        self.pointMarker.lng = pos.coords.longitude;
        self.user.homeAddress.xCoordinate = pos.coords.latitude;
        self.user.homeAddress.yCoordinate = pos.coords.longitude;
      }

      /**
       * Cancel membership
       *
       * @param {Integer} reason Reason ID
       * @param {String} explain Explaination
       */
      function cancelMemberhip(reason, explain) {
        self.cancellingMembership = true;
        var payload = {
          confirm: 1,
          reason: reason,
          note: explain
        };
        // close
        MembershipSDK.cancelMembership(payload).then(function () {
          angular.element('#deleteMembership').modal('hide');
          $timeout(function () {
            UserSDK.logout();
            $rootScope.$broadcast(SETTINGS.NOTIFICATION.LOGOUT, {
              type: 0,
              message: 'You\'ve been successfully logged out'
            });
            $state.go('home');
          }, 500);
          self.cancellingMembership = false;
        });
      }

      /**
       * Construct equestrian interests to send to the backend
       *
       * @param {Array} data Selected equestrian interests
       * @returns Constructed EI IDs array
       */
      function constructEquestrians(data) {
        var constructed = [];
        angular.forEach(data, function (val, key) {
          if (val) {
            constructed.push({
              id: key
            });
          }
        });
        return constructed;
      }

      /**
       * Deconstruct equestrian interests to view in the front end
       *
       * @param {Array} data Equestrian interests IDs
       * @returns Desonstructed EI IDs object array
       */
      function deconstructEquestrians(data) {
        var deconstructed = [];
        angular.forEach(data, function (val) {
          deconstructed[val] = true;
        });
        return deconstructed;
      }

      /**
       * Search instructors and filter them based on the selected instrutors
       *
       * @param {String} query Instructor name
       * @returns Filtered instructors list
       */
      function searchInstructor(query) {
        var deferred = $q.defer();
        EventsSDK.getSearchInstructors(query).then(function (response) {
          var instructors = response.content.map(function (h) {
            h.readableName = h.firstName + ' ' + h.lastName;
            return h;
          });
          self.searching = false;
          deferred.resolve(instructors);
        }, function (error) {
          $log.error(error);
          deferred.reject(error);
          self.searching = false;
        });
        return deferred.promise;
      }

      /**
       * Add selected instructor
       *
       * @param {Object} i Instructor user object
       */
      function addInstructor(i) {
        var isPresent = false;
        for (var j = 0; j < self.user.instructorsLocal.length; j++) {
          isPresent = self.user.instructorsLocal[j].id === i.id;
          if (isPresent) {
            break;
          }
        }
        if (!isPresent || !self.user.instructorsLocal.length > 0) {
          self.user.instructorsLocal.push(i);
        }
        self.selectedInstructor = {};
        self.defaultInstructors = [];
      }

      /**
       * Remove instructor
       *
       * @param {Integer} id Instructor ID
       */
      function removeInstructor(id) {
        self.user.instructorsLocal = self.user.instructorsLocal.filter(function (e) {
          return id !== e.id;
        });
      }

      /**
       * Construct instructors ID to send to the backend
       *
       * @param {Array} data Instructors object array
       * @returns Constructed array
       */
      function constructInstructors(data) {
        return data.map(function (e) {
          return {
            id: e.id
          };
        });
      }
    }
  });
