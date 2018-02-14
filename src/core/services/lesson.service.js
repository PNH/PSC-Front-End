angular
  .module('core.service')
  .factory('LessonAPI',
    function ($log, $resource, SETTINGS) {
      var services = {
        categories: categories,
        lessons: lessons,
        lesson: lesson,
        sampleLesson: sampleLesson
      };

      function categories() {
        var url = SETTINGS.BASE_URL + SETTINGS.API_V1 + 'levels/:lvlid/lesson_categories/:id';
        $log.debug(url);
        return $resource(url, {lvlid: '@lvlid', id: '@id'}, {
          query: {
            method: 'GET',
            params: {lvlid: ''},
            isArray: false,
            cancellable: true
          }
        });
      }

      function lessons() {
        var url = SETTINGS.BASE_URL + SETTINGS.API_V1 + 'lesson_categories/:categoryid/lessons/:lvlid';
        $log.debug(url);
        return $resource(url, {categoryid: '@categoryid', lvlid: '@lvlid'}, {
          query: {
            method: 'GET',
            params: {categoryid: '', lvlid: ''},
            isArray: false,
            cancellable: true
          }
        });
      }

      function lesson() {
        var url = SETTINGS.BASE_URL + SETTINGS.API_V1 + 'lessons/:lid';
        $log.debug(url);
        return $resource(url, {lid: '@lid'}, {
          query: {
            method: 'GET',
            params: {lid: ''},
            isArray: false,
            cancellable: true
          },
          complete: {
            method: 'POST',
            isArray: false,
            cancellable: true
          }
        });
      }

      function sampleLesson(goalid) {
        var url = SETTINGS.BASE_URL + SETTINGS.API_V1 + 'goals/:goalid/sample_lessons/:lid';
        $log.debug(url);
        return $resource(url, {goalid: '@goalid', lid: '@lid'}, {
          query: {
            method: 'GET',
            params: {goalid: goalid, lid: ''},
            isArray: false,
            cancellable: true
          }
        });
      }

      return services;
    }
  );
