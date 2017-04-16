export class GeneralUploadController {
      constructor ($stateParams, $http, $scope) {
        'ngInject';

        this.name = $stateParams.name;
        this.http = $http;
        this.nodeLocation = 'http://localhost:5000';
        this.url = '/api/upload/' + this.name;
        this.columnNames = [];
        this.numberUploaded = 0;
        this.data = [];
        this.rows = [];
        this.status = '';
        this.scope = $scope;
        this.isSuccessful = false;
        this.isFailure = false;
        this.errorChunks = 0;
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
    }

    setDataInfo(controller, data, dataRows) {
        controller.columnNames = [];
        for (var prop in dataRows[0]) {
            if (prop !== '_id') {
                controller.columnNames.push(prop);
            }

        }
        controller.data = data;
        controller.dataRows = dataRows;
    }

    showData() {
        var controller = this;
        controller.resetData();
        controller.status = "Pulling Data...please wait"
        this.http.get(this.nodeLocation + '/api/data/' + this.name)
            .success(function(data){
                controller.setDataInfo(controller, data, data.docs);
                controller.status = "Data Loaded Successfully"
        })
            .error(function(error) {
                console.log(error);
        })
    }

    readData() {
        var controller = this;

        if (!controller.running) {
            controller.resetData();
            controller.running = true;

            var files = document.getElementById('fileInput');
            var file = files.files[0];
            var split = file.name.split(".");
            var type = split[split.length - 1]
            controller.status = "Reading File: " + file.name;
            if (type == 'csv') {
                Papa.parse(file, {
                    header: true,
                    complete: function(result, file) {
                        console.log(file);
                        var chunks = Math.ceil(result.data.length/1000);
                        var json = result.data;
                        controller.status = "Sheet is " + json.length + " rows long. Chunks: " + chunks;
                        controller.chunks = chunks;
                        controller.chunkComplete = 0;
                        controller.uploadData(json);
                    }
                });
            }
            else if (type == 'xls' || 'xlsx') {
                var reader = new FileReader();
                    reader.onload = function(e) {
                        var data = e.target.result;
                        var workbook = XLSX.read(data, {type: 'binary'});
                        var sheetName = workbook.SheetNames[0];
                        controller.status = "Getting Sheet:" + sheetName;
                        var json = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);
                        data = null;
                        workbook = null;
                        sheetName = null;
                        if (json.length > 0) {
                            var chunks = Math.ceil(json.length/1000);
                            controller.status = "Sheet is " + json.length + " rows long. Chunks: " + chunks;
                            controller.chunks = chunks;
                            controller.chunkComplete = 0;
                            controller.uploadData(json);
                        }
                        else {
                            json = null;
                            controller.status = "No data to upload";
                        }
                    }
                    reader.readAsBinaryString(file);
            }
            else {
                alert("bad file type")
            }
        }
    }

    uploadData(json) {
        var controller = this;
        var conf = confirm("Are you sure you would like to update this dataset?")
        if (conf) {
            this.http.post(this.nodeLocation + '/api/remove/' + this.name, {headers: {"Content-Type": "application/json"}})
                .success(function(data) {
                            var n = 0;
            var len = json.length;
            var par = 1000;
            var setJ = [];

            var currpar = par - 1;
            controller.errorChunks = 0;
            controller.chunkComplete = 0;
            controller.numberUploaded = 0;
            var i = 0;

            do {
                setJ = json.slice(n, currpar);
                if (setJ && setJ.length > 0) {
                    controller.http.post(controller.nodeLocation + controller.url, JSON.stringify(setJ), {
                        transformRequest: angular.identity,
                        headers: {"Content-Type": "application/json"}
                    })

                    .success(function(data){

                        controller.numberUploaded += data.count;
                        controller.chunkComplete++;
                        controller.status = "Chunks " + controller.chunkComplete + " of " + controller.chunks + " loaded (With: " + controller.errorChunks + " errors)"
                        if (controller.chunkComplete == controller.chunks) {
                            controller.setDataInfo(controller, data, data.response.ops)
                        }

                    })
                    .error(function(err) {

                        console.log(err);
                        controller.chunkComplete++;
                        controller.errorChunks++;
                        controller.status = "Chunks " + controller.chunkComplete + " of " + controller.chunks + " loaded (With: " + controller.errorChunks + " errors)"

                    })

                }
                i++
                n = par * i;
                currpar = (par * (i + 1)) - 1;

            }
            while (i < controller.chunks)
            controller.running = false;
            })

        }
    }
}

