export class BillerReportController {
      constructor ($stateParams, $http, $scope, AllReportModelService, ReportModelService) {
        'ngInject';

          this.name = $stateParams.name;
          this.http = $http;
          this.isWorkbook = false;
          this.running = false;
          this.csvSheets = [];
          this.AllReportModelService = AllReportModelService;
          this.ReportModelService = ReportModelService;
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

    /*getCSVConversion(fileId) {
        var model = this.model;
        var controller = this;
        var f = document.getElementById(fileId);
        var file = f.files[0];
        var fileDetail = file.name.split('.');
        var filename = fileDetail[0];
        var filetype = fileDetail[1];
        controller.running = true;
        controller.status = "Checking " + filename;
        if (filetype == 'xls' || filetype == 'xlsx') {
            controller.status = "Reading File: " + filename;
            var reader = new FileReader();
            reader.onload = function(e) {
                var data = e.target.result;
                var workbook = XLSX.read(data, {type: 'binary'});
                for (var i = 0; i < model.ParseSheets.length; i++) {
                    var sheetName = workbook.SheetNames[model.ParseSheets[i]];
                    var sheet = workbook.Sheets[sheetName];
                    var csv = XLSX.utils.sheet_to_csv(sheet);
                    model.TotalRows = 0;
                    var DataSheet = [];
                    Papa.parse(csv, {
                        header: false,
                        skipEmptyLines: true,
                        step: function(results, parser) {
                            if (model.TotalRows == model.StartRow) {
                                model.Headers = results.data[0];
                            }
                            else if (model.TotalRows > model.StartRow) {

                                var skip = false;
                                if (model.SkipColumns[0] !== null && model.SkipColumns[0] !== undefined) {
                                    if (results.data[0][model.SkipColumns[0]] == "") {
                                        skip = true;
                                    }

                                }
                                if (model.SkipColumns[1] !== null && model.SkipColumns[1] !== undefined && skip !== true) {
                                    if (results.data[0][model.SkipColumns[1]] == "") {
                                        skip = true;
                                    }
                                }
                                if (!skip) {
                                    var obj = {};
                                    for (var r = 0; r < results.data[0].length; r++) {
                                        obj[model.Headers[r]] = results.data[0][r];
                                    }
                                    var newObj = model.NewMapping();
                                    if (model.ParseNames) {
                                        var names = model.patientParse(obj[model.Mapping['PatientFirstName']]);
                                        obj['PatientFirstName'] = names.FirstName;
                                        obj['PatientLastName'] = names.LastName;
                                        obj['PatientOtherName'] = names.OtherNames;
                                    }
                                    else {
                                        obj['PatientFirstName'] = obj[model.Mapping['PatientFirstName']];
                                        obj['PatientLastName'] = obj[model.Mapping['PatientLastName']];
                                        obj['PatientOtherName'] = obj[model.Mapping['PatientOtherName']];
                                    }
                                    for (var prop in newObj) {
                                        if (['PatientFirstName', 'PatientLastName', 'PatientOtherName'].indexOf(prop) > -1) {
                                            newObj[prop] = obj[prop];
                                        }
                                        else {
                                            newObj[prop] = model.MappingParse[prop](obj[model.Mapping[prop]], controller);
                                        }
                                    }
                                    DataSheet.push(newObj);
                                }

                            }
                            model.TotalRows++;
                            if (model.TotalRows % 1000 == 0) {
                                console.log("Loaded " + model.TotalRows);
                            }
                        },
                        complete: function(results) {
                            var len = DataSheet.length;
                            model.Data.push(DataSheet);
                            DataSheet.splice(len - 1 - model.Data.SkipLastRows, model.Data.SkipLastRows);
                            console.log("Processing Completed. Loaded " + DataSheet.length + " rows");
                            console.table(DataSheet)
                        }
                    });
                }
                controller.running = false;
            }
            reader.readAsBinaryString(file)
        }
        else {
            controller.status = "File is not an XLSX or XLS or CSV. Can not upload."
            controller.running = false;
        }
    }*/

    getChunks(sheetName) {
        var controller = this;
        controller.running = true;
        if (controller.running) {
            controller.status = "Getting Sheet:" + sheetName;
            var json = XLSX.utils.sheet_to_json(controller.workbook.Sheets[sheetName]);
            if (json.length > 0) {
                var chunks = Math.ceil(json.length/1000);
                controller.status = "Sheet is " + json.length + " rows long. Chunks: " + chunks;
                controller.chunks = chunks;
                controller.chunkComplete = 0;
                controller.dataPreview = json.splice(0, 20);
                controller.columns = [];
                for (var prop in json[0]) {
                    controller.columns.push(prop);
                }
                controller.running = false;
                //controller.uploadData(json);
            }
            else {
                json = null;
                controller.status = "No data to upload";
            }
        }
    }

    readData() {
        var controller = this;

        if (!controller.running) {
            //controller.resetData();
            controller.running = true;

            var files = document.getElementById('billerReport');
            var file = files.files[0];
            var split = file.name.split(".");
            var type = split[split.length - 1]
            controller.status = "Reading File: " + file.name;
            if (type == 'xls' || 'xlsx') {
                var reader = new FileReader();
                    reader.onload = function(e) {
                        var data = e.target.result;
                        var workbook = XLSX.read(data, {type: 'binary'});
                        controller.sheetNames = workbook.SheetNames;
                        controller.workbook = workbook;
                        controller.isWorkbook = true;
                        controller.running = false;
                        //controller.getChunks();
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
