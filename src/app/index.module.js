/* global malarkey:false, moment:false */

import { config } from './index.config';
import { routerConfig } from './index.route';
import { runBlock } from './index.run';
import { MainController } from './main/main.controller';
import { GeneralUploadController } from './generalUploads/general.controller';
import { InsertBDSController } from './insertBDS/insertBDS.controller';
import { BillerReportController } from './billerReports/billerReport.controller';
import { RepReportController } from './repReports/repReport.controller';
import { GithubContributorService } from '../app/components/githubContributor/githubContributor.service';
import { WebDevTecService } from '../app/components/webDevTec/webDevTec.service';
import { ReportModelService } from '../app/components/reportModel/reportModel.service';
import { AllReportModelService } from '../app/components/reportModel/allReportModels.service';
import { NavbarDirective } from '../app/components/navbar/navbar.directive';
import { MalarkeyDirective } from '../app/components/malarkey/malarkey.directive';

angular.module('medvantageAdmin', ['ngAnimate', 'ngCookies', 'ngTouch', 'ngSanitize', 'ngMessages', 'ngAria', 'ui.router', 'toastr'])
  .constant('malarkey', malarkey)
  .constant('moment', moment)
  .config(config)
  .config(routerConfig)
  .run(runBlock)
  .service('githubContributor', GithubContributorService)
  .service('webDevTec', WebDevTecService)
  .service('ReportModelService', ReportModelService)
  .service('AllReportModelService', AllReportModelService)
  .controller('MainController', MainController)
  .controller('GeneralUploadController', GeneralUploadController)
  .controller('InsertBDSController', InsertBDSController)
  .controller('BillerReportController', BillerReportController)
    .controller('RepReportController', RepReportController)
  .directive('acmeNavbar', NavbarDirective)
  .directive('acmeMalarkey', MalarkeyDirective);
