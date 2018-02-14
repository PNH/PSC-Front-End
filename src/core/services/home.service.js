angular
  .module('core.service')
  .factory('HomeAPI',
    function ($resource, SETTINGS, $log) {
      var services = {
        joinTheClub: joinTheClub,
        testimonial: testimonial,
        introVideo: introVideo,
        getHomeVideo: getHomeVideo,
        testimonialBackground: testimonialBackground
      };

      function joinTheClub() {
        var url = SETTINGS.BASE_URL + SETTINGS.API_V1 + 'content_blocks/join_the_club';
        $log.debug(url);
        return $resource(url, {}, {
          query: {
            method: 'GET',
            isArray: false,
            cancellable: true
          }
        });
      }

      function testimonial() {
        var url = SETTINGS.BASE_URL + SETTINGS.API_V1 + 'testimonials';
        $log.debug(url);
        return $resource(url, {}, {
          query: {
            method: 'GET',
            isArray: false,
            cancellable: true
          }
        });
      }

      function introVideo() {
        var url = SETTINGS.BASE_URL + SETTINGS.API_V1 + 'content_blocks/join_the_club';
        $log.debug(url);
        return $resource(url, {}, {
          query: {
            method: 'GET',
            isArray: false,
            cancellable: true
          }
        });
      }

      function getHomeVideo() {
        var url = SETTINGS.BASE_URL + SETTINGS.API_V1 + 'settings/homepage_video';
        $log.debug(url);
        return $resource(url, {}, {
          query: {
            method: 'GET',
            isArray: false,
            cancellable: true
          }
        });
      }

      function testimonialBackground() {
        var url = SETTINGS.BASE_URL + SETTINGS.API_V1 + 'content_blocks/testimonials';
        $log.debug(url);
        return $resource(url, {}, {
          query: {
            method: 'GET',
            isArray: false,
            cancellable: true
          }
        });
      }

      return services;
    }
  );
