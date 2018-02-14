angular
  .module('app')
  .component('memberTypeCom', {
    templateUrl: 'app/registration/template/member-type.html',
    // controllerAs: 'home',
    controller: function ($log, MembershipSDK, MetaSDK, $stateParams) {
      var self = this;
      self.currencies = null;
      self.selectedCurrency = -1;
      self.referralCode = null;

      if ($stateParams.referral) {
        self.referralCode = $stateParams.referral;
      }

      MetaSDK.getCurrency(true).then(function (response) {
        $log.debug(response);
        self.currencies = response.content;
      },
      function (error) {
        $log.error(error);
      });
      MembershipSDK.getMemberships(true).then(function (response) {
        $log.debug(response);
        self.memberTypes = response.content;
      });

      // events
      self.onMembershipTypeClicked = function onMembershipTypeClicked(type) {
        MembershipSDK.setType(type, true).then(function (response) {
          $log.debug(response);
        });
      };
    }
  });
