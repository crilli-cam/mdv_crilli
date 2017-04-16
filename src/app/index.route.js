export function routerConfig ($stateProvider, $urlRouterProvider) {
  'ngInject';
  $stateProvider
    .state('home', {
      url: '/',
      templateUrl: 'app/main/main.html',
      controller: 'MainController',
      controllerAs: 'main'
    })
    .state('generalUploads', {
      url: '/generaluploads/:name',
      templateUrl: 'app/generalUploads/general.html',
      controller: 'GeneralUploadController',
      controllerAs: 'gu'
    })
    .state('insertBDS', {
      url: '/insertBDS/:action',
      templateUrl: 'app/insertBDS/insertBDS.html',
      controller: 'InsertBDSController',
      controllerAs: 'bds'
    })
    .state('billerReports', {
      url: '/billerReports/:name',
      templateUrl: 'app/billerReports/billerReport.html',
      controller: 'BillerReportController',
      controllerAs: 'biller'
    })
    .state('repReports', {
      url: '/repReports/:name',
      templateUrl: 'app/repReports/repReport.html',
      controller: 'RepReportController',
      controllerAs: 'rep'
    });
  $urlRouterProvider.otherwise('/');
}
