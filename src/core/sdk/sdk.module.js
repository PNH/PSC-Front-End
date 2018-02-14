angular
  .module('core.sdk', ['LocalStorageModule', 'core.service', 'core.common', 'ngCookies'])
  .config(function (localStorageServiceProvider) {
    localStorageServiceProvider
      .setPrefix('parelli');
    // $authProvider.configure({
    //   apiUrl: SETTINGS.BASE_URL + '/api'
    // });
      // https://github.com/grevory/angular-local-storage
  });
