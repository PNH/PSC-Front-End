angular
  .module('app')
  .component('settingsCom', {
    templateUrl: 'app/settings/template/settings.html',
    controller: function ($log, SettingsSDK, alertify, blockUI) {
      var self = this;

      // Loaders
      const privacyLoad = blockUI.instances.get('privacyLoading');
      self.privacySaving = false;

      // Settings
      self.privacySettings = [
        {id: 1, label: 'Public', value: 1},
        {id: 2, label: 'Private', value: 0},
        {id: 3, label: 'Connection\'s Only', value: 2}
      ];

      // Models
      self.privacy = {};
      self.privacy.wall = self.privacySettings[0];

      /**
       * Get privacy settings
       */
      function getPrivacySettings() {
        privacyLoad.start();
        SettingsSDK.getPrivacySettings(false).then(function (response) {
          angular.forEach(self.privacySettings, function (value, index) {
            if (value.value === response.content.status) {
              self.privacy.wall = self.privacySettings[index];
            }
          });
          privacyLoad.stop();
        }, function (error) {
          $log.error(error);
          alertify.error('Cannot load settings. Please try again later');
          privacyLoad.stop();
        });
      }

      /**
       * Set privacy settings
       */
      function setPrivacySettings() {
        self.privacySaving = true;
        SettingsSDK.setPrivacySettings(self.privacy.wall.value, false).then(function (response) {
          $log.log(response);
          self.privacySaving = false;
          alertify.success('Settings have been updated successfully.');
          getPrivacySettings();
        }, function (error) {
          $log.error(error);
          self.privacySaving = false;
          alertify.error('Oops! Something went wrong. Please try again later.');
        });
      }

      /**
       * Public methods
       */
      self.savePrivacySettings = setPrivacySettings;

      /**
       * Init
       */
      function _init() {
        getPrivacySettings();
      }
      _init();
    }
  });
