export class RepReportController {
      constructor ($stateParams, $http, $scope) {
        'ngInject';
          this.nodeLocation = "http://localhost:5000";
          this.http = $http;
          this.params = $stateParams;
          this.name = $stateParams.name;
          this.commissions = 0;
          this.cogsTotal = 0;
          this.paidTotal = 0;
          this.currView = [];
          this.cogs = [];
          this.cleanCogs = [];
          this.final = [];
          this.cleanFinal = [];
          this.commisions = 0;
          this.runtimes = 0;
          this.currCols = [];
          this.cogsCols = [];
          this.finalCols = [];
          this.pullData();
      }

    getTotals() {
        var controller = this;

        var i = 0;
        var fac = []
        var prop = '';
        for (i = 0; i < controller.final.length; i++) {
            controller.paidTotal += controller.final[i].PaidAmount;
            controller.commisions += controller.final[i].PaidAmount * .4;
            if (fac[controller.final[i].Facility] == undefined || fac[controller.final[i].Facility] == null) {
                fac[controller.final[i].Facility] = controller.final[i];
                if (isNaN(fac[controller.final[i].Facility].PaidAmount)) {
                    fac[controller.final[i].Facility].PaidAmount = 0;
                }
            }
            else {
                fac[controller.final[i].Facility].PaidAmount += controller.final[i].PaidAmount;
            }
        }
        for (prop in fac) {
            controller.cleanFinal.push(fac[prop]);
        }
        fac = []
        for (i = 0; i < controller.cogs.length; i++) {
            controller.cogsTotal += controller.cogs[i].Amount;
            if (fac[controller.cogs[i].Customer] == undefined || fac[controller.cogs[i].Facility] == null) {
                fac[controller.cogs[i].Customer] = controller.cogs[i];
                if (isNaN(fac[controller.cogs[i].Customer].Amount)) {
                    fac[controller.cogs[i].Customer].PaidAmt = 0;
                }
            }
            else {
                fac[controller.cogs[i].Customer].Amount += controller.final[i].Amount;
            }
        }
        for (prop in fac) {
            controller.cleanCogs.push(fac[prop]);
        }
        for (prop in controller.cleanCogs[0]) {
            controller.cogsCols.push(prop);
        }
        for (prop in controller.cleanFinal[0]) {
            controller.finalCols.push(prop);
        }
    }
    getData(dataType, name) {
        var controller = this;
        var filter = controller.nodeLocation + '/api/data/' + dataType + '?filter=true&field=ID&eval=equals&value=' + name;
        this.http.get(filter)
            .success(function(data) {
                controller[dataType] = data.docs;
                controller.runtimes++;
                if (controller.runtimes == 2) {
                    controller.getTotals();
                }

        });
    }

    pullData() {
        var controller = this;
        controller.getData("final", controller.name);
        controller.getData("cogs", controller.name);
    }
}
