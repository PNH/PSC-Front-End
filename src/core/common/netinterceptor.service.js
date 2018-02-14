angular
  .module('core.common')
  .service('netInterceptor', function ($log, $cookies, SETTINGS) {
    var netInterceptor = {
      request: function (config) {
        var _session = $cookies.getObject('auth_headers');
        if (_session) {
          var _domain = getDomain(config.url);
          if (validateSiteDomain(config.url)) {
            config.url += '?time=' + Date.now();
          }
          // exceptions on header
          if (_domain === 'maps.googleapis.com') {
            return config;
          }
          angular.forEach(_session, function (value, key) {
            config.headers[key] = value;
          });
        }
        return config;
      }
    };

    function getDomain(url) {
      var domain;
      // find & remove protocol (http, ftp, etc.) and get domain
      if (validateURL(url)) {
        domain = url.split('/')[2];
      } else {
        domain = url.split('/')[0];
      }
      // find & remove port number
      domain = domain.split(':')[0];
      return domain;
    }

    /**
     * Check if the URL is valid
     *
     * @param {String} url URL
     * @returns Validity
     */
    function validateURL(url) {
      // find protocol (http, ftp, etc.)
      return url.indexOf("://") > -1;
    }

    /**
     * Check if URL is valid and within the site domain
     *
     * @param {String} url URL
     * @returns Validity
     */
    function validateSiteDomain(url) {
      return validateURL(url) && url.includes(SETTINGS.BASE_URL);
    }

    return netInterceptor;
  });
