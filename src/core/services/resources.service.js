angular
  .module('core.service')
  .factory('ResourcesAPI',
    function ($log, $resource, SETTINGS) {
      var services = {
        base64Resource: base64Resource
      };

      function base64Resource() {
        var url = SETTINGS.BASE_URL + SETTINGS.API_V1 + 'resource/upload/base64';
        $log.debug(url);
        return $resource(url, {}, {
          save: {
            method: 'POST',
            isArray: false,
            cancellable: true
          }
        });
      }

      return services;
    }
  );
