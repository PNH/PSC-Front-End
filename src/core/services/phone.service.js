angular
  .module('core.service')
  .factory('PhoneAPI',
    function ($resource) {
      var services = {
        phone: phone
      };

      function phone() {
        return $resource('/core/data/:pid.json', {pid: '@pid'}, {
          query: {
            method: 'GET',
            params: {pid: 'phones'},
            isArray: false,
            cancellable: true
          }
        });
      }

      return services;
    }
  );

// angular
//   .module('core.service')
//   .factory('PhoneAPI', ['$resource',
//     function ($resource) {
//       return function phone (pid) {
//         return $resource('/core/data/:pid.json', {pid: '@pid'}, {
//         query: {
//           method: 'GET',
//           params: {pid: 'phones'},
//           isArray: true,
//           cancellable: true
//         }
//       });
//     }
//     }
//   ]);

// angular
//   .module('core.service')
//   .factory('PhoneAPI', phoneApi);
//
// function phoneApi($http, $log) {
//   return {
//     getPhones: function () {
//       $http.get('/core/data/phones.json')
//       .then(function (response) {
//         return response.data;
//       })
//       .catch(function (error) {
//         $log.error(error);
//         return error;
//       });
//     },
//     getPhone: function (pid) {
//       var _pid = pid;
//       $http.get('/core/data/' + _pid + '.json')
//       .then(function (response) {
//         return response.data;
//       })
//       .catch(function (error) {
//         $log.error(error);
//         return error;
//       });
//     }
//   };
// }
