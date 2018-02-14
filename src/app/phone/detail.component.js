angular
  .module('app')
  .component('detailCom', {
    templateUrl: 'app/phone/template/detail.html',
    // controllerAs: 'detail',
    controller: function ($http, $stateParams, $log, PhoneSDK) {
      var self = this;
      self.msg = 'hello';
      // self.phone = PhoneAPI.getPhone($stateParams.pid);
      var data = PhoneSDK.getPhone($stateParams.pid, false);
      self.phone = data.data;
      // self.phone = PhoneAPI.get({pid: $stateParams.pid}, function (phone) {
      //   self.setImage(phone.images[0]);
      // }, function (error) {
      //   $log.error(error);
      // });

      self.setImage = function setImage(imageUrl) {
        self.mainImageUrl = imageUrl;
      };
    }
  });
