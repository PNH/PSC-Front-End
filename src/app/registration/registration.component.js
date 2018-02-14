angular
  .module('app')
  .component('registrationCom', {
    templateUrl: 'app/registration/template/registration.html',
    // controllerAs: 'home',
    controller: function ($scope, $log, $state, $stateParams, $transitions, alertify, $timeout, SETTINGS, MetaSDK, MembershipSDK, OnbaordSDK, moment) {
      // controller core -->
      var self = this;
      self.baseUrl = SETTINGS.BASE_URL;
      self.state = $state.current.name;
      $scope.formData = {};
      self.emailExists = false;
      self.isEditig = false;
      self.monthValid = true;
      self.currencyType = null;
      self.currencies = null;
      self.referralCode = null;
      self.countries = null;
      self.states = null;
      self.isProcessing = false;
      if (angular.isDefined($stateParams.type)) {
        self.memtype = parseInt($stateParams.type, 10);
        MembershipSDK.setType(self.memtype, true).then(function () {
        });
      }

      if ($stateParams.currency) {
        self.currencyType = parseInt($stateParams.currency, 10);
        if (self.currencyType < 0) {
          $state.go('membertype');
          return;
        }
      }

      if ($stateParams.referral) {
        self.referralCode = $stateParams.referral;
        $log.debug("self.referralCode found: " + self.referralCode);
      }

      // https://scotch.io/tutorials/angularjs-multi-step-form-using-ui-router
      // we will store all of our form data in this object

      // $transitions.onStart({}, function() {});
      $transitions.onSuccess({}, function () {
        self.state = $state.current.name;
        if (self.state === 'registration.review') {
          self.isEditig = true;
        }
        angular.element('body, html').animate({scrollTop: 0}, 0);
      });
      // $scope.$on('$locationChangeStart', function (event, next, prev) {
      //   var answer = $window.confirm("Are you sure you want to leave this page?");
      //   if (!answer) {
      //     event.preventDefault();
      //   }
      // });
      // controller core end <--

      // on next
      self.onNextClicked = function onNextClicked() {
        const _tmpdata = angular.copy($scope.formData);
        _tmpdata.ccard = null;
        self.error = null;
        MembershipSDK.setTempMembership(_tmpdata, true).then(function (data) {
          $log.debug(data);
        });
      };

      self.onEmailValidateCheck = function onEmailValidateCheck() {
        if ($scope.formData.user.email) {
          MembershipSDK.isEmailExist($scope.formData.user.email).then(function (response) {
            self.emailExists = response.content.exist;
          });
        }
      };

      self.isExpireyValid = function isExpireyValid() {
        var date = new Date();
        if ($scope.formData.ccard.cardyear <= new Date().getFullYear()) {
          self.monthValid = (date.getMonth() + 1) <= $scope.formData.ccard.cardmonth;
        } else {
          self.monthValid = true;
        }
      };

      MembershipSDK.getType(true).then(function (response) {
        self.memtype = parseInt(response, 10);
        $scope.formData = {
          input: null,
          membershipType: self.memtype,
          user: {
          },
          billing: {
            country: "-1",
            referral: self.referralCode
          },
          ccard: {
          }
        };

        OnbaordSDK.getOnboard().then(function (response) {
          if (response !== null) {
            if (response.user !== null) {
              $scope.formData.user.email = response.user.email;
              self.onEmailValidateCheck();
            }
            if (response.user !== null && response.user.name !== null) {
              var _name = response.user.name;
              var _names = _name.split(" ");
              $scope.formData.user.fname = _names[0] ? _names[0] : '';
              $scope.formData.user.lname = _names[1] ? _names[1] : '';
            }
          }
        },
        function (error) {
          $log.debug(error);
        });

        MembershipSDK.getTempMembership(true).then(function (response) {
          if (response) {
            $scope.formData = response;
            $scope.formData.membershipType = self.memtype;
          }
        });

        MembershipSDK.getMemberships(true).then(function (response) {
          // $log.debug(data);
          angular.forEach(response.content, function (type) {
            if (type.id === $scope.formData.membershipType) {
              self.membership = type;
              self.membership.total = parseInt(self.membership.cost, 10) + parseInt(self.membership.tax, 10);
            }
          });
        });
      },
      function (error) {
        $log.error(error);
        $state.go('membertype');
        // $window.location = "#/membertype";
      });

      MetaSDK.getCountries("en").then(function (response) {
        self.countries = response;
      });

      MetaSDK.getCurrency(true).then(function (response) {
        $log.debug(response);
        self.currencies = response.content;
      },
      function (error) {
        $log.error(error);
      });

      self.onCountrySelected = function onCountrySelected(code) {
        angular.forEach(self.countries, function (country) {
          if (country.code === code) {
            self.states = country.states;
          }
        });
      };

      self.onPurchaseMembershipClicked = function onPurchaseMembershipClicked() {
        self.error = null;
        var postdata = makePostObj();
        if (postdata !== null) {
          self.isProcessing = true;
          angular.element('#registeringPopup').modal({backdrop: 'static', keyboard: false});
          angular.element('#registeringPopup').modal('show');
          MembershipSDK.setMembership(postdata, false).then(function (response) {
            $log.debug(response);
            MembershipSDK.removeTempMembership();
            OnbaordSDK.removeTempOnboard();
            OnbaordSDK.removeOnboard();
            alertify.delay(10000).success('Congratulations, you have successfully registered! Please Sign In with the credentials you created during registration to get started.');
            // $scope.$emit(SETTINGS.NOTIFICATION.GLOBAL, {type: 1, message: 'Parelli Training Program registration success! Your horse will thank you.'});
            // $window.location = "#/";
            angular.element('#registeringPopup').modal('hide');
            self.isProcessing = false;
            $timeout(function () {
              $state.go('home');
            }, 500);
          },
          function (error) {
            self.isProcessing = false;
            $scope.formData.input = null;
            $log.error(error);
            self.error = error;
            angular.element('#registeringPopup').modal('hide');
            $scope.$emit(SETTINGS.NOTIFICATION.GLOBAL, {type: 0, message: 'Parelli Training Program registration failed.'});
          });
        }
      };
      // private
      function makePostObj() {
        var post = {
          membershipTypeId: $scope.formData.membershipType,
          user: {
            email: angular.lowercase($scope.formData.user.email),
            firstName: $scope.formData.user.fname,
            lastName: $scope.formData.user.lname,
            telephone: $scope.formData.user.phone,
            password: $scope.formData.user.password,
            passwordConfirmation: $scope.formData.user.confirmPassword,
            currencyId: self.currencyType
          },
          billing: {
            street: $scope.formData.billing.address1,
            street2: $scope.formData.billing.address2,
            city: $scope.formData.billing.city,
            state: $scope.formData.billing.province,
            country: $scope.formData.billing.country,
            zipcode: $scope.formData.billing.zip,
            referralCode: $scope.formData.billing.referral
          },
          creditcard: {
            name: $scope.formData.ccard.cardname,
            number: $scope.formData.ccard.cardnumber,
            code: $scope.formData.ccard.cardcode,
            month: moment($scope.formData.ccard.cardmonth).format('M'),
            year: moment($scope.formData.ccard.cardyear).format('YYYY')
          }
        };

        if ($scope.formData.user.email === null || $scope.formData.user.fname === null) {
          post.user = null;
        }
        if ($scope.formData.billing.address1 === null || $scope.formData.billing.address2 === null) {
          post.billing = null;
        }

        return post;
      }
    }
  });
