export class InsertBDSController {
      constructor ($stateParams, $http, $scope) {
        'ngInject';
        this.http = $http;
        this.nodeLocation = 'http://localhost:5000';
        this.status = '';
        this.errorChunks = 0;
        this.chunkComplete = 0;
        this.running = false;
        this.dataRows = [];
        this.data = [];
        this.chunks = 0;
        this.columnNames = [];
        this.numberUploaded = 0;
        this.showData();
          this.facilities = [];
          this.reps = [];
          this.billers = [];
          this.insurances = [];
          this.takehome = [];
          this.bcbs = [];
          this.insprefix = [];
          this.facilitiesClick = false;
          this.repsClick = false;
          this.billersClick = false;
          this.insurancesClick = false;
          this.takehomeClick = false;
          this.bcbsClick = false;
          this.insprefixClick = false;
          this.buildChoices();
          this.filter = '';
          this.location = {
              left: 0,
              top: 0
          }
          this.limit = 10;
      }
    checkFocus(item, $event) {
        var items = {
          Facility: "facilitiesClick",
          Rep: "repsClick",
          Biller: "billersClick",
          Insurance: "insurancesClick",
          TakeHomeSerial: "takehomeClick",
          BCBSPrefix: "bcbsClick",
          InsurancePrefix: "insprefixClick"
        }
        for (var prop in items) {
            if (items[prop] !== items[item]) {
                this[items[prop]] = false;
            }
        }
        this[items[item]] = true;
        var obj = $event.target.getBoundingClientRect();
        this.location.top = obj.top + 15;
        this.location.left = obj.left;
    }
    buildChoices() {
        var items = {
          facilities: [],
          reps: [],
          billers: [],
          insurances: [],
          takehome: [],
          bcbs: [],
          insprefix: []
        }
        for (var prop in items) {
            this.showData(prop);
        }
    }
    resetData() {
        this.errorChunks = 0;
        this.chunkComplete = 0;
        this.running = false;
        this.dataRows = [];
        this.data = [];
        this.chunks = 0;
        this.columnNames = [];
        this.numberUploaded = 0;
        this.status = '';
    }
    setDataInfo(controller, data, dataRows, item) {
        if (item && item !== 'bds') {
            controller[item] = dataRows;
        }
        else {
            controller.columnNames = [];
            for (var prop in dataRows[0]) {
                if (prop !== '_id') {
                    controller.columnNames.push(prop);
                }
            }
            controller.data = data;
            //controller.dataRows = dataRows;
            for (var i=0; i <= 200; i++) {
                var obj = {};
                for (var prop in dataRows[0]) {
                    if (prop !== '_id') {
                        obj[prop] = null;
                    }
                }
                controller.dataRows.push(obj)
            }
        }
    }

    showData(item) {
        var controller = this;
        controller.resetData();
        controller.status = "Pulling Data...please wait"
        if (!item) {
            item = 'bds';
            var limit = 1;
        }
        else {
            limit = 'all'
        }
        this.http.get(this.nodeLocation + '/api/data/' + item + '?limit=' + limit)
            .success(function(data){
                controller.setDataInfo(controller, data, data.docs, item);
                controller.status = "Data Loaded Successfully"
        })
            .error(function(error) {
                console.log(error);
        })
    }
}
