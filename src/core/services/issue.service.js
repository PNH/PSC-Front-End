angular
  .module('core.service')
  .factory('IssueAPI',
    function ($resource, SETTINGS, $log) {
      var services = {
        category: category,
        catissue: catissue,
        issue: issue
      };

      function category(goalid) {
        var url = SETTINGS.BASE_URL + SETTINGS.API_V1 + 'goals/:goalid/issue_categories/:catid';
        $log.debug(url);
        return $resource(url, {goalid: '@goalid', catid: '@catid'}, {
          query: {
            method: 'GET',
            params: {goalid: goalid},
            isArray: false,
            cancellable: true
          }
        });
      }

      function catissue(goalid, catid) {
        var url = SETTINGS.BASE_URL + SETTINGS.API_V1 + 'goals/:goalid/issue_categories/:catid/issues/:issueid';
        $log.debug(url);
        return $resource(url, {goalid: '@goalid', catid: '@catid', issueid: '@issueid'}, {
          query: {
            method: 'GET',
            params: {goalid: goalid, catid: catid},
            isArray: false,
            cancellable: true
          }
        });
      }

      function issue(goalid) {
        var url = SETTINGS.BASE_URL + SETTINGS.API_V1 + 'goals/:goalid/issues/:issueid';
        $log.debug(url);
        return $resource(url, {goalid: '@goalid', issueid: '@issueid'}, {
          query: {
            method: 'GET',
            params: {goalid: goalid},
            isArray: false,
            cancellable: true
          }
        });
      }

      return services;
    }
  );
