angular
  .module('app')
  .config(routesConfig);

/** @ngInject */
function routesConfig($stateProvider, $urlRouterProvider, $locationProvider) {
  $locationProvider.html5Mode(false).hashPrefix('!');
  $urlRouterProvider.when('', '/');
  $urlRouterProvider.otherwise('/404');

  $stateProvider
    .state('home', {
      url: '/?logout:popup',
      component: 'homeCom',
      data: {
        isFree: true
      }
    })
    // .state('home-detail', {
    //   url: '/detail/:pid',
    //   component: 'detailCom'
    // })
    // .state('test', {
    //   url: '/test',
    //   component: 'sdkTestCom',
    //   data: {
    //     isFree: true
    //   }
    // })
    .state('about', {
      url: '/about',
      component: 'aboutCom',
      data: {
        isFree: true
      }
    })
    .state('contact', {
      url: '/contact',
      component: 'contactCom',
      data: {
        isFree: true
      }
    })
    .state('404', {
      url: '/404',
      component: 'notfoundCom',
      data: {
        isFree: true
      }
    })
    .state('onboard', {
      url: '/onboard',
      component: 'onbaordCom',
      data: {
        isFree: true
      }
    })
    .state('onboard.home', {
      url: '/home',
      templateUrl: 'app/onboard/template/_onboard.home.html',
      data: {
        isFree: true
      }
    })
    .state('onboard.goals', {
      url: '/goals',
      templateUrl: 'app/onboard/template/_onboard.goals.html',
      data: {
        isFree: true
      }
    })
    .state('onboard.horseinfo', {
      url: '/horseinfo',
      templateUrl: 'app/onboard/template/_onboard.horseinfo.html',
      data: {
        isFree: true
      }
    })
    .state('onboard.comissues', {
      url: '/comissues',
      templateUrl: 'app/onboard/template/_onboard.comissues.html',
      data: {
        isFree: true
      }
    })
    .state('onboard.pathway', {
      url: '/pathway',
      templateUrl: 'app/onboard/template/_onboard.pathway.html',
      data: {
        isFree: true
      }
    })
    .state('onboard.samplemodule', {
      url: '/samplemodule',
      templateUrl: 'app/onboard/template/_onboard.samplemodule.html',
      data: {
        isFree: true
      }
    })
    .state('updateOnboard', {
      url: '/onboard/edit',
      component: 'updateOnboardCom',
      data: {
        isFree: false
      }
    })
    .state('updateOnboard.goals', {
      url: '/goals',
      templateUrl: 'app/updateonboard/template/_onboard.goals.html',
      data: {
        isFree: false
      }
    })
    .state('updateOnboard.comissues', {
      url: '/comissues',
      templateUrl: 'app/updateonboard/template/_onboard.comissues.html',
      data: {
        isFree: false
      }
    })
    .state('registration', {
      url: '/registration?:currency&:referral',
      component: 'registrationCom',
      data: {
        isFree: true
      }
    })
    .state('registration.userinfo', {
      url: '/userinfo/:type',
      templateUrl: 'app/registration/template/_registration.userinfo.html',
      data: {
        isFree: true
      }
    })
    .state('registration.billing', {
      url: '/billing',
      templateUrl: 'app/registration/template/_registration.billing.html',
      data: {
        isFree: true
      }
    })
    .state('registration.creditcard', {
      url: '/creditcard',
      templateUrl: 'app/registration/template/_registration.creditcard.html',
      data: {
        isFree: true
      }
    })
    .state('registration.review', {
      url: '/review',
      templateUrl: 'app/registration/template/_registration.review.html',
      data: {
        isFree: true
      }
    })
    .state('membertype', {
      url: '/membertype?:referral',
      component: 'memberTypeCom',
      data: {
        isFree: true
      }
    })
    .state('pathway', {
      url: '/pathway/:horseid?levelid',
      component: 'pathwayCom',
      data: {
        isFree: false
      }
    })
    .state('badges', {
      url: '/badges/:horseid',
      component: 'badgesCom',
      data: {
        isFree: false
      }
    })
    .state('dashboard', {
      url: '/dashboard/:horseid',
      component: 'dashboardCom',
      data: {
        isFree: false
      }
    })
    .state('lesson', {
      url: '/lesson/:horseid/:lessonid?:category&:level',
      component: 'lessonCom',
      data: {
        isFree: false
      }
    })
    .state('profile', {
      url: '/profile',
      component: 'profileCom',
      data: {
        isFree: false
      }
    })
    .state('library', {
      url: '/library',
      component: 'learningLibCategoryCom',
      data: {
        isFree: false
      }
    })
    .state('library-subcategories', {
      url: '/library/:categoryid/categories',
      component: 'learningLibSubCategoryCom',
      data: {
        isFree: false
      }
    })
    .state('library-detail', {
      url: '/library/:categoryid/resources?:parent&:title',
      component: 'learningLibDetailCom',
      data: {
        isFree: false
      }
    })
    .state('library-search', {
      url: '/library/search?:query&:category',
      component: 'learningLibSearchCom',
      data: {
        isFree: false
      }
    })
    .state('playlist', {
      url: '/playlist?:id',
      component: 'playlistCom',
      data: {
        isFree: false
      }
    })
    .state('horse', {
      url: '/horse/:horseid?type',
      component: 'horseprofileCom',
      data: {
        isFree: false
      }
    })
    .state('passwordreset', {
      url: '/passwordreset?:reset_password_token',
      component: 'passwordResetCom',
      data: {
        isFree: true
      }
    })
    .state('maintenance', {
      url: '/maintenance',
      component: 'maintenanceCom',
      data: {
        isFree: true
      }
    })
    .state('savvyessentials', {
      url: '/savvyessentials',
      component: 'savvyEssentialsCom',
      data: {
        isFree: false
      }
    })
    .state('blog', {
      url: '/blog:blogslug',
      component: 'blogCom',
      data: {
        isFree: true
      }
    })
    .state('blogdetail', {
      url: '/blog/post/:slug',
      component: 'blogDetailCom',
      data: {
        isFree: true
      }
    })
    .state('blogcreate', {
      url: '/blog/create',
      component: 'blogCreateCom',
      data: {
        isFree: false
      }
    })
    .state('memberminutes', {
      url: '/memberminutes',
      component: 'memberMinutesCom',
      data: {
        isFree: false
      }
    })
    .state('memberminutesdetail', {
      url: '/memberminutes/:id',
      component: 'memberMinutesDetailCom',
      data: {
        isFree: false
      }
    })
    .state('forums', {
      url: '/forums',
      component: 'forumsCom',
      data: {
        isFree: false
      }
    })
    .state('subforums', {
      url: '/forums/:subforumid',
      component: 'subForumCom',
      data: {
        isFree: false
      }
    })
    .state('topicdetail', {
      url: '/forums/:subforumid/:topicid',
      component: 'topicDetailCom',
      data: {
        isFree: false
      }
    })
    .state('checklist', {
      url: '/checklist',
      component: 'checklistCom',
      data: {
        isFree: false
      }
    })
    .state('groups', {
      url: '/groups',
      component: 'groupsCom',
      data: {
        isFree: false
      }
    })
    .state('groupsdetail', {
      url: '/groups/:groupid',
      component: 'groupsDetailCom',
      data: {
        isFree: false
      }
    })
    .state('publicprofile', {
      url: '/publicprofile/:userid',
      component: 'publicProfileCom',
      data: {
        isFree: false
      }
    })
    .state('connections', {
      url: '/connections',
      component: 'connectionsCom',
      data: {
        isFree: false
      }
    })
    .state('makeconnections', {
      url: '/makeconnections',
      component: 'makeConnectionsCom',
      data: {
        isFree: false
      }
    })
    .state('wall', {
      url: '/wall/:userid?public',
      component: 'wallCom',
      data: {
        isFree: false
      }
    })
    .state('eventcalendar', {
      url: '/eventcalendar',
      component: 'eventCalendarCom',
      data: {
        isFree: false
      }
    })
    .state('eventdetails', {
      url: '/eventdetails/:eventid',
      component: 'eventDetailsCom',
      data: {
        isFree: false
      }
    })
    .state('myevents', {
      url: '/myevents',
      component: 'myEventsCom',
      data: {
        isFree: false
      }
    })
    .state('custompage', {
      url: '/page/:pageslug',
      component: 'customPageCom',
      data: {
        isFree: true
      }
    })
    .state('notifications', {
      url: '/notifications',
      component: 'notificationsCom',
      data: {
        isFree: false
      }
    })
    .state('messages', {
      url: '/messages?:userid',
      component: 'messagesCom',
      data: {
        isFree: false
      }
    })
    .state('settings', {
      url: '/settings',
      component: 'settingsCom',
      data: {
        isFree: false
      }
    })
    .state('horseprofile', {
      url: '/:userid/horseprofile/:horseid?type',
      component: 'publicHorseprofileCom',
      data: {
        isFree: false
      }
    });
}
