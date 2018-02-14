angular
.module('core.common', ['ngCookies'])
.constant('SETTINGS', {
  BASE_URL: 'https://parellisavvyclub.com',
  API_V1: '/api/v1/',
  DATA_EXPIRY_TIME: 10000,
  NOTIFICATION: {
    GLOBAL: 'global-notification',
    HORESEY: 'horsey-notification',
    LOGIN: 'login-notification',
    LOGOUT: 'logout-notification',
    NEWHORSE: 'new-horse-notification',
    PROFILEUPDATE: 'profile-update-notification',
    NOTIFY: 'global-user-notifications'
  },
  GOOGLE_MAP_KEY: 'AIzaSyBkLJt6qh1IocAzXwg9zCrAtE8rZYB43YY',
  GOOGLE_GEO_KEY: 'AIzaSyCsnvhsR78fIH_7gPbC9l46hOzNlhc2jHA',
  GOOGLE_RECAPTCHA: '6Lc3-CcUAAAAAPLLdSTH-wUHMYl-PRxndpGXNO4W',
  SUMMERNOTE_CONFIG: {
    focus: false,
    airMode: false,
    toolbar: [
      ['style', ['bold', 'italic', 'underline', 'clear']],
      ['alignment', ['ul', 'ol']],
      ['insert', ['link', 'picture', 'video']]
    ]
  },
  SUMMERNOTE_CONFIG_BASIC: {
    focus: false,
    airMode: false,
    toolbar: [
    ['style', ['bold', 'italic', 'underline', 'clear']],
    ['alignment', ['ul', 'ol']]
    ]
  },
  HORSE_LEVEL_ITEMS: {
    online: {
      name: "On Line",
      levels:
      [{
        name: "Level 1",
        levelId: 1,
        savvyId: 1
      }, {
        name: "Level 2",
        levelId: 2,
        savvyId: 2
      }, {
        name: "Level 3",
        levelId: 3,
        savvyId: 5
      }, {
        name: "Level 4",
        levelId: 4,
        savvyId: 9
      }, {
        name: "Level 4+",
        levelId: 5,
        savvyId: 13
      }]
    },
    liberty: {
      name: "On Line",
      levels:
      [{
        name: "Level 2",
        levelId: 2,
        savvyId: 3
      }, {
        name: "Level 3",
        levelId: 3,
        savvyId: 6
      }, {
        name: "Level 4",
        levelId: 4,
        savvyId: 10
      }, {
        name: "Level 4+",
        levelId: 5,
        savvyId: 14
      }]
    },
    freestyle: {
      name: "On Line",
      levels:
      [{
        name: "Level 2",
        levelId: 2,
        savvyId: 4
      }, {
        name: "Level 3",
        levelId: 3,
        savvyId: 7
      }, {
        name: "Level 4",
        levelId: 4,
        savvyId: 11
      }, {
        name: "Level 4+",
        levelId: 5,
        savvyId: 15
      }]
    },
    finesse: {
      name: "On Line",
      levels:
      [{
        name: "Level 3",
        levelId: 3,
        savvyId: 8
      }, {
        name: "Level 4",
        levelId: 4,
        savvyId: 12
      }, {
        name: "Level 4+",
        levelId: 5,
        savvyId: 16
      }]
    }
  },
  SEARCH_FILTERS: [
    {
      name: "Member",
      value: "Member"
    }, {
      name: "Instructor",
      value: "Instructor"
    }, {
      name: "Staff",
      value: "Staff"
    }, {
      name: "Learning Library",
      value: "LearngingLibrary"
    }, {
      name: "Group",
      value: "Group"
    }, {
      name: "Event",
      value: "Event"
    }, {
      name: "Forum Topic",
      value: "ForumTopic"
    }, {
      name: "Lesson",
      value: "Lesson"
    }],
  DEEP_LINKS: [
    "blogdetail",
    "memberminutesdetail",
    "savvyessentials"
  ]
})
.config(function ($httpProvider) {
  $httpProvider.interceptors.push('netInterceptor');

  // Disable API caching on browsers
  // if (!$httpProvider.defaults.headers.get) {
  //   $httpProvider.defaults.headers.get = {};
  // }
  // $httpProvider.defaults.headers.get['Cache-Control'] = 'no-cache';
  // $httpProvider.defaults.headers.get.Pragma = 'no-cache';
});
