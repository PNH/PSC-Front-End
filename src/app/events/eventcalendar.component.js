angular
  .module('app')
  .component('eventCalendarCom', {
    templateUrl: 'app/events/template/eventcalendar.html',
    controller: function ($log, $q, $state, $timeout, $window, SETTINGS, EventsSDK, MetaSDK, UserSDK, blockUI, moment, alertify) {
      var self = this;

      /* ---------------- Create Event Popup ---------------- */
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
      self.summernoteOptions = SETTINGS.SUMMERNOTE_CONFIG_BASIC;

      /* ---------------- Create Event Popup ---------------- */

      self.todayDate = null;
      // self.todayDate = moment(new Date(), 'YYYY-MM-DD');
      // self.todayDate = moment().utc(self.startDate).format('YYYY-MM-DD');

      self.paginationLimit = 10;
      self.country = "all";
      self.contentTitle = "All Events";
      self.radius = "2000";
      // self.startDate = moment(self.todayDate, 'YYYY-MM-DD');
      // self.startDate = moment().utc(self.startDate).format('YYYY-MM-DD');
      // self.startDate = moment(self.todayDate, 'YYYY-MM-DD').subtract(50, 'years');
      self.startDate = self.todayDate ? moment.utc(self.startDate).format('YYYY-MM-DD') : self.todayDate;
      // self.endDate = moment(self.todayDate, 'YYYY-MM-DD').add(5, 'years');
      self.eventZipcode = null;
      // self.selectedType = "mainCat";
      self.selectedType = "mainCat";
      self.selectedTypeId = String(99999);
      self.onGoFilterClicked = false;

      /**
       * EventCalendar
       */
      self.eventCalendar = [];
      self.sortedEventCalendar = [];
      // self.dateSortedEventCalendar = [];
      // self.dateSortedEventCalendar[0] = {};

      // Pagination
      self.isEventCalendarLoading = false;
      self.isCountryLoading = false;
      self.eventCalendarIndex = 1;
      self.hasEventCalendarReachedEnd = false;

      // BlockUI instances
      const existingEventCalendarLoad = blockUI.instances.get('existingEventCalendarLoading');

      /**
       * Get events
       *
       * @param {String} type Get events
       * @returns Promise
      */
      function getEventCalendar() {
        var deferred = $q.defer();
        var m = {
          concatEventCalendar: function (content) {
            if (content) {
              if (content.length === 0) {
                self.hasEventCalendarReachedEnd = true;
              } else if (content.length < self.paginationLimit) {
                self.eventCalendar = self.eventCalendar.concat(content);
                self.hasEventCalendarReachedEnd = true;
              } else if (content.length === self.paginationLimit) {
                self.eventCalendar = self.eventCalendar.concat(content);
              }
            } else {
              self.hasEventCalendarReachedEnd = true;
            }
            // $log.log("-----eventCalendar-----");
            // $log.log(self.eventCalendar);
            getEventByCategory(self.selectedType, self.selectedTypeId);
          }
        };
        EventsSDK.getEventsCalendar(self.eventCalendarIndex, self.paginationLimit, self.country, self.radius, self.startDate, self.eventZipcode, false).then(function (response) {
          m.concatEventCalendar(response.content);
          // $log.log(response);
          deferred.resolve(response);
          self.eventCalendarIndex += 1;
        }, function (error) {
          $log.debug(error);
          deferred.reject(error);
        });

        return deferred.promise;
      }

      /**
       * Reset event calendar
       *
      */
      function resetEventCalendar() {
        self.eventCalendarIndex = 1;
        self.eventCalendar = [];
        // $log.log('++++++++++++++++++++++++++++++');
        // $log.log(self.eventCalendar);
        self.hasEventCalendarReachedEnd = false;
      }

      function resetSidebarFilter() {
        self.eventZipcode = null;
        self.contentTitle = "All Events";
        self.sidebarCountry = String(-1);
        self.country = 'all';
        if (self.country === 'us') {
          self.sidebarCountry = 'US';
        } else if (self.country === 'au') {
          self.sidebarCountry = 'AU';
        } else if (self.country === 'gb') {
          self.sidebarCountry = 'GB';
        }
        self.zipcode = null;
        self.withinMiles = String(0);
        self.radius = "2000";
        // self.country = "all";
      }
      resetSidebarFilter();

      /**
       * Event Item click event
      */
      function onEventItemClicked(eventId, statusLabel) {
        if (statusLabel === "canceled") {
          // alertify.log('This event has been cancelled.');
          $state.go('eventdetails', ({eventid: eventId}));
        } else {
          $state.go('eventdetails', ({eventid: eventId}));
        }
      }

      /**
       * Country Tab click event
       *
      */
      function onCountryClicked(countryCode, countryName) {
        getEventCategories();
        resetSidebarFilter();
        self.isCountryLoading = true;
        self.country = String(countryCode);

        if (self.country === 'us') {
          self.sidebarCountry = 'US';
        } else if (self.country === 'au') {
          self.sidebarCountry = 'AU';
        } else if (self.country === 'gb') {
          self.sidebarCountry = 'GB';
        }

        self.startDate = null;
        self.contentTitle = countryName + " Events";
        self.onGoFilterClicked = false;
        resetEventCalendar();
        self.selectedTypeId = String(99999);
        _getEventCalendar();
        $timeout(function () {
          self.isCountryLoading = false;
        }, 100);
      }

      // get event Main Categories
      function getEventCategories() {
        var deferred = $q.defer();
        EventsSDK.getEventCategories(true).then(function (response) {
          self.eventCalMainCategories = response.content;

          self.selectedMainCategory = String(99999);
          self.selectedSubCategory = String(99999);
          deferred.resolve(response);
        }, function (error) {
          $log.debug(error);
          deferred.reject(error);
        });

        return deferred.promise;
      }
      getEventCategories();

      /**
       * Main category select event
       *
      */
      function onEventCalendarMainCategorySelected(mainCat) {
        // $log.log(mainCat);
        self.eventCalSubCategories = [];
        for (var i = 0; i < self.eventCalMainCategories.length; i++) {
          // $log.log(self.eventCalMainCategories[i].id);
          if (self.eventCalMainCategories[i].id === Number(mainCat)) {
            self.eventCalSubCategories = angular.copy(self.eventCalMainCategories[i].children);
          }
        }
        self.selectedSubCategory = String(99999);
      }

      /**
       * Category type change event
      */
      function getEventByCategory(type, id) {
        self.removeEventIndexSet = [];
        self.sortedEventCalendar = angular.copy(self.eventCalendar);
        // $log.log("----self.sortedEventCalendar----");
        // $log.log(self.sortedEventCalendar);
        // $log.log("SORT ----------------- " + id);
        if (self.selectedTypeId !== null && id !== String(99999)) {
          for (var c = 0; c < self.eventCalendar.length; c++) {
            self.removeEvent = true;
            self.removeEventId = 0;
            if (type === "mainCat") {
              for (var d = 0; d < self.eventCalendar[c].categories.length; d++) {
                if (self.eventCalendar[c].categories[d].parent_id === Number(id)) {
                  self.removeEvent = false;
                }
              }
            } else if (type === "subCat") {
              for (var l = 0; l < self.eventCalendar[c].categories.length; l++) {
                if (self.eventCalendar[c].categories[l].id === Number(id)) {
                  self.removeEvent = false;
                }
              }
            }
            if (self.removeEvent) {
              self.removeEventIndexSet.push(c);
            }
          }

          for (var r = (self.removeEventIndexSet.length - 1); r >= 0; r--) {
            self.sortedEventCalendar.splice(self.removeEventIndexSet[r], 1);
          }
        }

        // $log.log("----self.sortedEventCalendar----");
        // $log.log(self.sortedEventCalendar);
      }

      /**
       * Calendar on click event
      */
      self.controllers = {};
      self.controllers.datePicked = function datePicked(day) {
        // $log.log(day);
        // $log.log("day : " + moment(day._d).format('MMMM D[,] YYYY'));

        self.startDate = moment(day, 'YYYY-MM-DD');
        // $log.log(self.startDate);

        self.startDate = moment(self.startDate).format('YYYY-MM-DD');
        // $log.log(self.startDate);

        resetEventCalendar();
        _getEventCalendar();
      };

      // get countries
      MetaSDK.getCountries("en").then(function (response) {
        self.countries = response;
      });

      // get countries by region
      MetaSDK.getCountriesRegion("en").then(function (response) {
        self.countriesRegion = response;
        $log.log(self.countriesRegion);
      });

      /**
       * Sidebar filter clicked
      */
      self.sidebarFilter = [];
      self.onGoFilterClicked = false;
      function onGoSubmitClicked() {
        self.onGoFilterClicked = true;

        if (self.sidebarCountry !== String(-1) && self.sidebarFilter.zipcode.$valid && self.withinMiles !== String(0)) {
          self.country = self.sidebarCountry;
          self.eventZipcode = self.zipcode;
          self.radius = self.withinMiles;
          resetEventCalendar();
          _getEventCalendar();
        }
      }

      /**
       * Sidebar filter reset event
      */
      function onResetClicked() {
        self.onGoFilterClicked = false;
        resetSidebarFilter();
        resetEventCalendar();
        // angular.element('event-calendar-menu-all').trigger('click');
        _getEventCalendar();
      }

      /**
       * Sidebar calendar reset event
      */
      self.isCalendarClearProcessing = false;
      function clearCalendar() {
        self.isCalendarClearProcessing = true;
        // self.controllers.resetPicked();
        self.startDate = null;
        // resetSidebarFilter();
        resetEventCalendar();
        _getEventCalendar();
        $timeout(function () {
          self.isCalendarClearProcessing = false;
        }, 1);
      }

      /**
       * Init method for getEventCalendar
      */
      function _getEventCalendar() {
        existingEventCalendarLoad.start();
        getEventCalendar().then(function () {
          existingEventCalendarLoad.stop();
        }, function () {
          existingEventCalendarLoad.stop();
        });
      }

      /**
       * Public methods
       */
      function viewMoreEventCalendar() {
        self.isEventCalendarLoading = true;
        getEventCalendar().then(function () {
          self.isEventCalendarLoading = false;
        }, function () {
          self.isEventCalendarLoading = false;
        });
      }

      function changeEventType(type, id) {
        self.selectedType = type;
        self.selectedTypeId = id;
        getEventByCategory(self.selectedType, self.selectedTypeId);
        // _getEventCalendar();
      }

      /* ---------------- Create Event Popup ---------------- */
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
        self.event.instructorName = null;
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
            resetCreatePopup();
            // _getEventCalendar();
            self.onCountryClicked('all', 'All');
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
      // MetaSDK.getCountries("en").then(function (response) {
      //   self.countries = response;
      // });

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
      EventsSDK.getEventCategories(true).then(function (response) {
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
            $log.log("Added instructor");
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

      /* ---------------- Create Event Popup ---------------- */

      self.onEventCalendarMainCategorySelected = onEventCalendarMainCategorySelected;
      self.viewMoreEventCalendar = viewMoreEventCalendar;
      self.changeEventType = changeEventType;
      self.onEventItemClicked = onEventItemClicked;
      self.onGoSubmitClicked = onGoSubmitClicked;
      self.onResetClicked = onResetClicked;
      self.onCountryClicked = onCountryClicked;
      self.clearCalendar = clearCalendar;

      /**
       * Init
       */
      function _init() {
        // getEventCalendar();
        _getEventCalendar();
      }
      _init();
    }
  });
