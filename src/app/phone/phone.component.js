angular
  .module('app')
  .component('phoneCom', {
    templateUrl: 'app/phone/template/home.html',
    // controllerAs: 'home',
    controller: function ($scope, $http, $log, PhoneSDK) {
      var self = this;
      // self.phones = PhoneAPI.query(function (data) {
      //   $log.debug(data);
      // }, function (error) {
      //   $log.error(error);
      // });
      var data = PhoneSDK.getPhones();
      self.phones = data.data;
      this.orderProp = 'age';
      $scope.somename = {name: 'Naomi', address: '1600 Amphitheatre'};
      // $http.get('core/data/phones.json').then(function (response) {
      //   self.phones = response.data;
      // });
    }
  });
