angular
  .module('core.service')
  .factory('SavvyAPI',
    function ($log, $resource, SETTINGS) {
      var services = {
        savvy: savvy,
        lessonCategories: lessonCategories
      };

      // function savvy(levelid) {
      //   var url = SETTINGS.BASE_URL + SETTINGS.API_V1 + 'levels/:levelid/savvies/:savyid';
      //   $log.debug(url);
      //   return $resource(url, {levelid: '@levelid', savyid: '@savyid'}, {
      //     query: {
      //       method: 'GET',
      //       params: {levelid: levelid, savyid: ''},
      //       isArray: true,
      //       cancellable: true
      //     }
      //   });
      // }

      function savvy() {
        var url = SETTINGS.BASE_URL + SETTINGS.API_V1 + 'savvies/:savyid';
        $log.debug(url);
        return $resource(url, {savyid: '@savyid'}, {
          query: {
            method: 'GET',
            params: {savyid: ''},
            isArray: false,
            cancellable: true
          }
        });
      }

      function lessonCategories(levelid, savvyid) {
        var url = SETTINGS.BASE_URL + SETTINGS.API_V1 + 'levels/:levelid/savvies/:savvyid/lesson_categories/:catid';
        $log.debug(url);
        return $resource(url, {levelid: '@levelid', savvyid: '@savvyid', catid: '@catid'}, {
          query: {
            method: 'GET',
            params: {levelid: levelid, savvyid: savvyid, catid: ''},
            isArray: false,
            cancellable: true
          }
        });
      }

      return services;
    }
  );
