angular
  .module('app')
  .component('myEventsCom', {
    templateUrl: 'app/events/template/myevents.html',
    controller: function ($log, $q, $scope, $timeout, $window, $state, SETTINGS, EventsSDK, MetaSDK, UserSDK, blockUI, moment, alertify) {
      var self = this;

      self.pointMarker = {
        lat: 37.632711,
        lng: -120.572511
      };
      self.geolocator = $window.navigator.geolocation || {};
      $log.warn(self.locationB);

      if (self.geolocator) {
        self.geolocator.getCurrentPosition(handlePosition);
      }

      function handlePosition(pos) {
        self.pointMarker.lat = pos.coords.latitude;
        self.pointMarker.lng = pos.coords.longitude;
        self.event.location.xCoordinate = pos.coords.latitude;
        self.event.location.yCoordinate = pos.coords.longitude;
      }

      self.paginationLimit = 8;
      self.summernoteOptions = SETTINGS.SUMMERNOTE_CONFIG_BASIC;

      /**
       * MyEvents
       */
      self.myEvents = [];
      self.dateSortedMyEvents = [];
      self.dateSortedMyEvents[0] = {};

      // Pagination
      self.isMyEventLoading = false;
      self.myEventsIndex = 1;
      self.hasMyEventsReachedEnd = false;
      self.myEventType = 0;

      // BlockUI instances
      const existingMyEventsLoad = blockUI.instances.get('existingMyEventsLoading');

      /**
       * Get events
       *
       * @param {String} type Get events
       * @returns Promise
       */
      var tempDate;
      var tempDateCount = 0;
      var tempSortedCount = 0;
      var tempiValue = 0;

      function getMyEvents() {
        var deferred = $q.defer();
        var m = {
          concatMyEvents: function (content) {
            if (content) {
              if (content.length === 0) {
                self.hasMyEventsReachedEnd = true;
              } else if (content.length < self.paginationLimit) {
                self.myEvents = self.myEvents.concat(content);
                self.hasMyEventsReachedEnd = true;
              } else if (content.length === self.paginationLimit) {
                self.myEvents = self.myEvents.concat(content);
              }
            } else {
              self.hasMyEventsReachedEnd = true;
            }

            if (self.myEvents.length > 0) {
              tempiValue = 0;
              if (self.dateSortedMyEvents[0].hasOwnProperty("date")) {
                for (var s = 0; s < self.dateSortedMyEvents.length; s++) {
                  tempiValue += self.dateSortedMyEvents[s].content.length;
                }
              }
              // $log.log(self.dateSortedMyEvents);

              tempDate = moment((self.myEvents[tempDateCount].startDate).slice(0, -1)).format('MMMM D[,] YYYY');
              // $log.log(self.myEvents[tempDateCount].startDate);
              // $log.log((self.myEvents[tempDateCount].startDate).slice(0, -1));
              // $log.log(tempDate);
              for (var i = tempiValue; i < self.myEvents.length; i++) {
                if (moment((self.myEvents[i].startDate).slice(0, -1)).format('MMMM D[,] YYYY') === tempDate) {
                  if (self.dateSortedMyEvents[tempSortedCount].hasOwnProperty("date")) {
                    self.dateSortedMyEvents[tempSortedCount].content.push(self.myEvents[i]);
                  } else {
                    self.dateSortedMyEvents[tempSortedCount].date = moment((self.myEvents[tempDateCount].startDate).slice(0, -1)).format('MMMM D[,] YYYY');
                    self.dateSortedMyEvents[tempSortedCount].content = [];
                    self.dateSortedMyEvents[tempSortedCount].content.push(self.myEvents[i]);
                  }
                } else {
                  tempDateCount = i;
                  tempSortedCount++;
                  self.dateSortedMyEvents[tempSortedCount] = {};
                  self.dateSortedMyEvents[tempSortedCount].date = moment((self.myEvents[tempDateCount].startDate).slice(0, -1)).format('MMMM D[,] YYYY');
                  self.dateSortedMyEvents[tempSortedCount].content = [];
                  self.dateSortedMyEvents[tempSortedCount].content.push(self.myEvents[i]);
                  tempDate = moment((self.myEvents[tempDateCount].startDate).slice(0, -1)).format('MMMM D[,] YYYY');
                }
              }
              // $log.log(self.dateSortedMyEvents);
            } else {
              self.dateSortedMyEvents = [];
            }
          }
        };
        EventsSDK.getMyEvents(self.myEventsIndex, self.paginationLimit, self.myEventType, false).then(function (response) {
          m.concatMyEvents(response.content);
          deferred.resolve(response);
          self.myEventsIndex += 1;
        }, function (error) {
          $log.debug(error);
          deferred.reject(error);
        });

        return deferred.promise;
      }

      function resetMyEvents() {
        self.myEventsIndex = 1;
        self.myEvents = [];
        self.dateSortedMyEvents = [];
        self.dateSortedMyEvents[0] = {};
        self.hasMyEventsReachedEnd = false;
        tempDateCount = 0;
        tempSortedCount = 0;
        tempiValue = 0;
      }

      function resetCreatePopup() {
        self.submitBtnClicked = false;
        self.isNewEventProcessing = false;
        self.event = {};
        self.event.startDate = "";
        self.event.endDate = "";
        self.event.regOpenDate = "";
        self.event.regCloseDate = "";
        self.event.location = {};
        self.event.priceBox = [];
        self.descriptionModel = "";
        self.event.primaryInstructorName = null;
        self.event.assistInstructorName = null;
        self.event.selectedAssistingInstructors = [];
        self.event.url = null;
        self.resetInstructorInputDropdown = false;
        self.pointMarker = {
          lat: 37.632711,
          lng: -120.572511
        };
        self.event.mainCategory = String(self.mainCategories[0].id);
        onMainCategorySelected(String(self.mainCategories[0].id));
      }

      /**
       * Init method for getMyEvents
       */
      function _getMyEvents() {
        existingMyEventsLoad.start();
        getMyEvents().then(function () {
          existingMyEventsLoad.stop();
        }, function () {
          existingMyEventsLoad.stop();
        });
      }

      /**
       * Public methods
       */
      self.viewMoreMyEvents = function () {
        self.isMyEventLoading = true;
        getMyEvents().then(function () {
          self.isMyEventLoading = false;
        }, function () {
          self.isMyEventLoading = false;
        });
      };

      /**
       * Get events by type
       *
       * @param {String} event type
       * @returns Promise
       */
      self.sortOptionsMyEvents = [{
        id: 0,
        name: "All"
      }, {
        id: 1,
        name: "Organized By Me"
      }, {
        id: 2,
        name: "Instructor"
      }, {
        id: 3,
        name: "I'm Going"
      }];
      self.selectedMyEventType = String(0);
      self.currentUser = UserSDK.getUser();
      if (!self.currentUser.is_instructor) {
        self.sortOptionsMyEvents.splice(2, 1);
      }

      function onChangeMyEventType(type) {
        self.myEventType = Number(type);
        resetMyEvents();
        _getMyEvents();
      }

      /**
       * Create event modal open event
       */
      self.openMap = false;
      function onPopupClicked() {
        $timeout(function () {
          self.openMap = true;
          self.resetInstructorInputDropdown = true;
          $timeout(function () {
            angular.element('.input-primary-instructor-class').on('keyup', onChangePrimaryInstructor);
            angular.element('.input-assisting-instructor-class')[0].disabled = true;
          }, 1000);
        }, 500);
      }

      /**
       * Event Item click event
       */
      function onEventItemClicked(eventId, statusLabel) {
        if (statusLabel === "canceled") {
          $state.go('eventdetails', ({
            eventid: eventId
          }));
          // alertify.log('This event has been cancelled.');
        } else {
          $state.go('eventdetails', ({
            eventid: eventId
          }));
        }
      }

      /**
       * Add new Event
       */
      self.submitBtnClicked = false;
      self.isNewEventProcessing = false;
      self.event = {};
      self.event.location = {};
      self.event.priceBox = [];
      self.descriptionModel = "";
      self.todayDate = moment((new Date()), 'YYYY-MM-DD HH:mm:ss');

      function createEvent(newEventObj) {
        self.isNewEventProcessing = true;
        var deferred = $q.defer();
        EventsSDK.makeEvent(newEventObj, false).then(function (response) {
          if (response.status === 201) {
            alertify.success('Event created successfully.');
            resetMyEvents();
            resetCreatePopup();
            _getMyEvents();
            angular.element('#createEvent').modal('hide');
          }
          // $log.log(response);
          deferred.resolve(response);
          self.isNewEventProcessing = false;
        }, function (error) {
          $log.error(error);
          alertify.error('Oops! Something went wrong. Please try again.');
          deferred.reject(error);
          self.isNewEventProcessing = false;
        });
        return deferred.promise;
      }

      function onNewEventClicked() {
        self.validateURL = self.createNewEvent.url.$invalid;
        self.submitBtnClicked = true;

        self.setStartDateTemp = moment(self.event.startDate, 'M/D/YYYY');
        self.event.setStartDate = (moment(self.setStartDateTemp).format('YYYY-MM-DD HH:mm:ss'));

        self.setEndDateTemp = moment(self.event.endDate, 'M/D/YYYY');
        self.event.setEndDate = (moment(self.setEndDateTemp).format('YYYY-MM-DD HH:mm:ss'));

        self.setRegOpenDateTemp = moment(self.event.regOpenDate, 'M/D/YYYY');
        self.event.setRegOpenDate = (moment(self.setRegOpenDateTemp).format('YYYY-MM-DD HH:mm:ss'));

        self.setRegCloseDateTemp = moment(self.event.regCloseDate, 'M/D/YYYY');
        self.event.setRegCloseDate = (moment(self.setRegCloseDateTemp).format('YYYY-MM-DD HH:mm:ss'));

        self.event.instructors = [];
        if (self.event.primaryInstructorName) {
          self.event.instructors.push({id: self.event.primaryInstructorName.id, type: 1});
        }
        if (self.event.selectedAssistingInstructors.length > 0) {
          if (!angular.isObject(self.event.primaryInstructorName)) {
            return;
          }
          for (var c = 0; c < self.event.selectedAssistingInstructors.length; c++) {
            self.event.instructors.push({id: self.event.selectedAssistingInstructors[c].id, type: 0});
          }
        }
        $log.log(self.event.instructors);

        self.event.prices = [];
        for (var i = 0; i < self.event.priceBox.length; i++) {
          if (angular.isUndefined(self.event.priceBox[i])) {
            continue;
          }
          self.event.prices.push({
            title: String(self.event.priceBox[i].priceDetails),
            price: String(self.event.priceBox[i].priceValue)
          });
        }

        self.newEvent = {
          title: self.event.eventTitle,
          description: self.event.eventDescription,
          startDate: self.event.setStartDate,
          endDate: self.event.setEndDate,
          street: self.event.location.street,
          state: self.event.location.state,
          city: self.event.location.city,
          country: self.event.location.country,
          zipcode: self.event.location.zipcode,
          latitude: self.pointMarker.lat,
          longitude: self.pointMarker.lng,
          categories: angular.toJson([{
            id: Number(self.event.subCategory)
          }])
        };

        if (self.event.setRegOpenDate !== "Invalid date") {
          self.newEvent.openingDate = self.event.setRegOpenDate;
        }
        if (self.event.setRegCloseDate !== "Invalid date") {
          self.newEvent.closingDate = self.event.setRegCloseDate;
        }

        if (self.event.url) {
          self.newEvent.url = self.event.url;
        }

        if (self.event.instructors.length > 0) {
          self.newEvent.instructors = angular.toJson(self.event.instructors);
        }

        if (self.event.prices.length > 0) {
          self.newEvent.pricings = [];
          self.newEvent.pricings = angular.toJson(self.event.prices);

          for (var b = 0; b < self.event.prices.length; b++) {
            if ((self.event.prices[b].title === "undefined" || self.event.prices[b].title === "") && (self.event.prices[b].price === "undefined" || self.event.prices[b].price === "null" || self.event.prices[b].price === "")) {
              self.isPricingsValid = true;
              // $log.log("price ok");
              continue;
            }
            if (self.event.prices[b].title.includes("undefined") || self.event.prices[b].title.includes("null") || (self.event.prices[b].price > 0 && self.event.prices[b].title.length === 0)) {
              self.isPricingsValid = false;
              alertify.log("Please fill price details");
              return;
            } else if (self.event.prices[b].price.includes("undefined") || self.event.prices[b].price.includes("null") || (self.event.prices[b].title.length > 0 && self.event.prices[b].prices === 0)) {
              self.isPricingsValid = false;
              alertify.log("Please fill price value");
              return;
            }
          }
          self.isPricingsValid = true;
          // self.newEvent.pricings.push({pricings: angular.toJson(self.event.prices)});
          // } else if (angular.element('#priceD').length === 1) {
          // alertify.log("Please fill or remove price.");
        } else {
          self.isPricingsValid = true;
        }

        if (!self.isEventLocationCorrect) {
          alertify.log("Location not found");
        }

        $log.log(self.newEvent);
        if (self.createNewEvent.$valid && self.isEventLocationCorrect && self.isPricingsValid) {
          // $log.log("New Event created clicked");

          createEvent(self.newEvent);
        }
      }

      function onCancelClicked() {
        resetCreatePopup();
      }

      // get countries
      MetaSDK.getCountries("en").then(function (response) {
        self.countries = response;
      });

      function onCountrySelected(code) {
        angular.forEach(self.countries, function (country) {
          if (country.code === code) {
            self.states = country.states;
          }
        });
      }

      function onMapMarkerDrag(event) {
        self.event.location.xCoordinate = event.latLng.lat();
        self.event.location.yCoordinate = event.latLng.lng();
      }

      function onAddressInputComplted() {
        var _address = self.event.location.street;
        MetaSDK.getGeocode(_address, self.event.location.zipcode, 'en', self.event.location.country, SETTINGS.GOOGLE_GEO_KEY).then(function (response) {
          $log.debug(response);
          if (response.data.status === 'OK') {
            if (response.data.results.length > 0) {
              var _location = response.data.results[0];
              self.pointMarker.lat = _location.geometry.location.lat;
              self.pointMarker.lng = _location.geometry.location.lng;
              //
              self.event.location.xCoordinate = _location.geometry.location.lat;
              self.event.location.yCoordinate = _location.geometry.location.lng;
              self.isEventLocationCorrect = true;
            }
          } else {
            if (angular.isDefined(self.event.location.street) && angular.isDefined(self.event.location.country) && angular.isDefined(self.event.location.state) && angular.isDefined(self.event.location.city)) {
              alertify.log("Location not found");
            }
            self.isEventLocationCorrect = false;
          }
        }, function (error) {
          $log.error(error);
        });
      }

      // get event Main Categories
      EventsSDK.getEventCategories().then(function (response) {
        self.mainCategories = response.content;
        var _userRole = UserSDK.getUserRole();
        self.rootAccess = false;

        if (_userRole === 'admin' || _userRole === 'super_admin') {
          self.rootAccess = true;
        }

        if (!self.rootAccess) {
          for (var i = 0; i < self.mainCategories.length; i++) {
            if (self.mainCategories[i].title === "Official") {
              self.mainCategories.splice(i, 1);
            }
          }
        }
        self.event.mainCategory = String(self.mainCategories[0].id);
        onMainCategorySelected(String(self.mainCategories[0].id));
      });

      function onMainCategorySelected(mainCat) {
        for (var i = 0; i < self.mainCategories.length; i++) {
          if (self.mainCategories[i].id === Number(mainCat)) {
            self.subCategories = self.mainCategories[i].children;
          }
        }
      }

      /**
       * Instructor Search input-dropdown
       */
      self.searching = false;
      self.event.instructor = null;
      self.dropdownInstuctors = [];
      function onSearchInstructor(query) {
        var filter = $q.defer();
        if (self.searching) {

        } else {
          self.searching = true;
          if (angular.isDefined(self.dropdownInstuctors)) {
            // $log.log(self.dropdownInstuctors);
            self.dropdownInstuctors.splice(0, self.dropdownInstuctors.length);
          }
          EventsSDK.getSearchInstructors(query, false).then(function (response) {
            $log.log(response);
            self.tempInstuctors = response.content;
            /*eslint-disable */
            if (response.content) {
              mainLoop: for (var i = 0; i < response.content.length; i++) {
                self.tempInstuctorName = response.content[i].firstName + " " + response.content[i].lastName;

                // if (self.event.primaryInstructorName === null) {
                //   break;
                // }

                // Check Assisting Instructors Array
                for (var c = 0; c < self.event.selectedAssistingInstructors.length; c++) {
                  if (self.event.selectedAssistingInstructors[c].id === response.content[i].id) {
                    $log.log("added instructor");
                    continue mainLoop;
                  }
                }

                // Check Primary Instructor variable
                if (self.event.primaryInstructorName !== null && self.event.primaryInstructorName.id === response.content[i].id) {
                  $log.log("added instructor");
                  continue;
                }

                self.dropdownInstuctors.push({id: response.content[i].id, readableName: self.tempInstuctorName});
              }
            }
            /*eslint-enable */
            $log.debug(self.dropdownInstuctors);
            filter.resolve(self.dropdownInstuctors);
            self.searching = false;
          }, function (error) {
            $log.error(error);
            self.searching = false;
          });
        }
        return filter.promise;
      }

      /**
       * Primary Instructor add event
      */
      function onAddPrimaryInstructor() {
        angular.element('.input-assisting-instructor-class')[0].disabled = false;
      }

      /**
       * Primary Instructor input onChange event
      */
      function onChangePrimaryInstructor() {
        if (angular.isObject(self.event.primaryInstructorName)) {
          angular.element('.input-assisting-instructor-class')[0].disabled = false;
        } else {
          angular.element('.input-assisting-instructor-class')[0].disabled = true;
        }
      }

      /**
       * Assisting Instructor add event
      */
      self.event.selectedAssistingInstructors = [];
      function onAddAssistingInstructor(item) {
        self.event.assistInstructorName = " ";
        for (var s = 0; s < self.event.selectedAssistingInstructors.length; s++) {
          if (self.event.selectedAssistingInstructors[s] === item) {
            return;
          }
        }
        self.event.selectedAssistingInstructors.push(item);
      }

      /**
       * Instructor remove event
       */
      function onRemoveInstructor(id) {
        for (var a = 0; a < self.event.selectedAssistingInstructors.length; a++) {
          if (self.event.selectedAssistingInstructors[a].id === id) {
            self.event.selectedAssistingInstructors.splice(a, 1);
          }
        }
      }

      // self.priceCount = 0;
      self.priceBox = {
        prices: []
      };
      self.priceBox = [0];

      function onAddMoreClicked() {
        self.priceBox.push(self.priceBox.length);
      }

      function onRemoveOneClicked(index) {
        self.event.priceBox.splice(index, 1);
        self.priceBox.splice(index, 1);

        for (var i = index; i < self.priceBox.length; i++) {
          self.priceBox[i]--;
        }
      }

      self.onEventItemClicked = onEventItemClicked;
      self.onChangeMyEventType = onChangeMyEventType;
      self.onPopupClicked = onPopupClicked;
      self.onNewEventClicked = onNewEventClicked;
      self.onCancelClicked = onCancelClicked;
      self.onCountrySelected = onCountrySelected;
      self.onMapMarkerDrag = onMapMarkerDrag;
      self.onAddressInputComplted = onAddressInputComplted;
      self.onMainCategorySelected = onMainCategorySelected;

      self.onSearchInstructor = onSearchInstructor;
      self.onAddPrimaryInstructor = onAddPrimaryInstructor;
      self.onAddAssistingInstructor = onAddAssistingInstructor;
      self.onRemoveInstructor = onRemoveInstructor;

      self.onAddMoreClicked = onAddMoreClicked;
      self.onRemoveOneClicked = onRemoveOneClicked;

      /**
       * Init
       */
      function _init() {
        // getMyEvents();
        _getMyEvents();
      }
      _init();
    }
  });
