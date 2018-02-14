angular
  .module('app')
  .component('publicProfileCom', {
    templateUrl: 'app/publicprofile/template/profile.html',
    controller: function ($log, $stateParams, PublicProfileSDK, UserSDK, MetaSDK, alertify, blockUI) {
      var self = this;
      self.userId = null;
      self.user = null;
      self.relationships = [];
      self.countries = [];
      self.equestrain = [];
      const userProfileLoad = blockUI.instances.get('userProfileLoading');

      if ($stateParams.userid) {
        self.userId = $stateParams.userid;
        getUser(self.userId);
      }

      // get relationships
      MetaSDK.getRelationships(true).then(function (response) {
        self.relationships = response.content;
      });

      // get countries
      MetaSDK.getCountries("en").then(function (response) {
        self.countries = response;
      });

      // get equestrain
      MetaSDK.getEquestrain(true).then(function (response) {
        self.equestrain = response.content;
      });

      function getUser(userId) {
        userProfileLoad.start();
        PublicProfileSDK.getUser(userId, true).then(function (response) {
          if (response.content) {
            self.user = response.content.user;
            self.onCountrySelected(self.user.country);
          }
          userProfileLoad.stop();
        }, function (error) {
          $log.error(error);
          userProfileLoad.stop();
        });
      }

      self.onCountrySelected = function onCountrySelected(code) {
        angular.forEach(self.countries, function (country) {
          if (country.code === code) {
            self.states = country.states;
          }
        });
      };
    }
  });
