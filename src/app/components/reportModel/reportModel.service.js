export class ReportModelService {
  constructor ($http, AllReportModelService) {
    'ngInject';
      this.model = null;
      this.running = false;
      this.http = $http;
      this.previewData = [];
      this.previewColumns = [];
      this.errorChunks = 0;
      this.successChunks = 0;
      this.numberUploaded = 0;
      this.nodeLocation = "http://localhost:5000";
      this.status = "";
      this.chunks = 0;
      this.AllReportModelService = AllReportModelService;
      this.Data = [];
      this.mappedItems = [];
  }
previewData(data) {
    this.previewData = data;
    this.previewColumns = [];
    for (prop in data[0]) {
        this.previewColumns.push(prop);
    }
}
 uploadData(dataid, name) {
    var controller = this;
    var data = conroller.AllReportModelService[name].Data[dataid];
    var conf = confirm("Are you sure you would like to update this dataset?")
    if (conf) {
        var len = data.length;
        var par = 1000;
        controller.chunks = Math.ceil(len/par);
        var current = par - 1;
        controller.errorChunks = 0;
        controller.successChunks = 0;
        controller.numberUploaded = 0;
        var enumerator = 0;
        var lower = 0;
        do {
            setJ = data.slice(lower, current);
            if (setJ && setJ.length > 0) {
                controller.http.post(controller.nodeLocation + "/api/upload/" + name, JSON.stringify(setJ), {
                    transformRequest: angular.identity,
                    headers: {"Content-Type": "application/json"}
                })
                .success(function (data) {
                    controller.numberUploaded += data.count;
                    controller.successChunks++;
                    controller.status = "Chunks " + controller.successChunks + " of " + controller.chunks + " loaded (With: " + controller.errorChunks + " errors)"
                    if (controller.successChunks == controller.chunks) {
                        //controller.setDataInfo(controller, data, data.response.ops)
                        console.log(data.response.ops);
                    }
                })
                .error(function(error){
                    console.log(err);
                    controller.chunkComplete++;
                    controller.errorChunks++;
                    controller.status = "Chunks " + controller.chunkComplete + " of " + controller.chunks + " loaded (With: " + controller.errorChunks + " errors)"
                })
            }
            enumerator++;
            lower = par * enumerator;
            current = (par * (enumerator + 1)) - 1;
        }
        while (enumerator < controller.chunks)
        controller.running = false;
    }

 }

 getCSVConversion(file) {
    var model = this.model;
    var controller = this;
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
                var AggData = [];
                model.TotalRows = 0;
                var DataSheet = [];
                Papa.parse(csv, {
                    header: false,
                    skipEmptyLines: true,

                    step: function(results, parser) {
                        if (model.TotalRows == model.StartRow[i]) {
                            model.Headers[i] = results.data[0];
                            for (var a = 0; a < model.AggregationData[i].length; a++) {
                                AggData.push(results.data[0].indexOf(model.AggregationData[i][a]));
                            }
                        }
                        else if (model.TotalRows > model.StartRow[i]) {

                            var skip = false;
                            if (model.SkipColumns[i][0] !== null && model.SkipColumns[i][0] !== undefined) {
                                if (results.data[0][model.SkipColumns[i][0]] == "") {
                                    skip = true;
                                }

                            }
                            if (model.SkipColumns[i][1] !== null && model.SkipColumns[i][1] !== undefined && skip !== true) {
                                if (results.data[0][model.SkipColumns[i][1]] == "") {
                                    skip = true;
                                }
                            }
                            if (!skip) {
                                var AggData2 = 'a';
                                for (var a = 0; a < AggData.length; a++) {
                                    AggData2 = AggData2 + results.data[0][AggData[a]].toString();
                                }
                                var obj = {};
                                for (var r = 0; r < results.data[0].length; r++) {
                                    obj[model.Headers[i][r]] = results.data[0][r];
                                }
                                var newObj = model.NewMapping();
                                if (model.ParseNames[i]) {
                                    var names = model.patientParse(obj[model.Mapping[i]['PatientFirstName']]);
                                    obj['PatientFirstName'] = names.FirstName;
                                    obj['PatientLastName'] = names.LastName;
                                    obj['PatientOtherName'] = names.OtherNames;
                                }
                                else {
                                    obj['PatientFirstName'] = obj[model.Mapping[i]['PatientFirstName']];
                                    obj['PatientLastName'] = obj[model.Mapping[i]['PatientLastName']];
                                    obj['PatientOtherName'] = obj[model.Mapping[i]['PatientOtherName']];
                                }
                                for (var prop in newObj) {
                                    if (['PatientFirstName', 'PatientLastName', 'PatientOtherName'].indexOf(prop) > -1) {
                                        newObj[prop] = obj[prop];
                                    }
                                    else {
                                        newObj[prop] = model.MappingParse[prop](obj[model.Mapping[i][prop]], controller);
                                    }
                                }
                                if (DataSheet[AggData2]) {
                                    DataSheet[AggData2].AdjAmt += newObj.AdjAmt;
                                    DataSheet[AggData2].ChgAmt += newObj.ChgAmt;
                                    DataSheet[AggData2].PaidAmt += newObj.PaidAmt;
                                }
                                else {
                                    if (newObj["PaidAmt"] !== 0) {
                                        newObj["Aggregator"] = AggData2;
                                        var dtSplit = newObj.DOS.split("T");
                                        var dtSplit = dtSplit[0].split("-");
                                        var pdt  = parseInt(dtSplit[2]);
                                        var pyr = parseInt(dtSplit[0]);
                                        var pm = parseInt(dtSplit[1]) - 1;
                                        newObj["SortDate"] = new Date(pyr, pm, pdt);
                                        DataSheet[AggData2] = newObj;
                                    }
                                }
                            }

                        }
                        model.TotalRows++;
                        if (model.TotalRows % 1000 == 0) {
                            console.log("Loaded " + model.TotalRows);
                        }
                    },
                    complete: function(results) {
                        //var len = DataSheet.length;
                        //DataSheet.splice(len - 1 - model.SkipLastRows[i], model.SkipLastRows[i]);
                        var newDS = [];
                        for (var l in DataSheet) {
                            newDS.push(DataSheet[l]);
                        }
                        model.Data.push(newDS);
                        //controller.status("Processing Completed. Loaded " + newDS.length + " rows");
                        console.log(newDS.length);
                        controller.model.Data[0].sort(function(a, b) {
                            if (a.SortDate < b.SortDate) return 1;
                            if (a.SortDate > b.SortDate) return -1;
                            return 0;
                        })
                        console.log("Started");
                        //console.table(controller.model.Data[0]);
                        controller.getBDS(0);

                        controller.running = false;
                    }
                });
            }
        }
        reader.readAsBinaryString(file)
    }
    else {
        controller.status = "File is not an XLSX or XLS or CSV. Can not upload."
        controller.running = false;
    }
}

checkMatch(parent, matcher, isFacility) {
    var ln = 0;
    parent = parent.toLowerCase().trim();
    parent = parent.replace(/[\.\'\"\`\~\,\-\*\&]/gi,"");
    var parentSplit = parent.split(" ");

    matcher = matcher.toLowerCase().trim();
    matcher = matcher.replace(/[\.\'\"\`\~\,\-\*\&]/gi,"");
    var matcherSplit = matcher.split(" ");

    var sp = 0;
    var pct = 0;
    var tmp1 = 0;
    var tmp2 = 0;
    var drop = '';

    if (parent == matcher) {
        ln = 100
    }
    else if (parent.indexOf(matcher) > -1) {
        ln = 100 * (matcher.length/parent.length)
    }
    else if (matcherSplit.length > 1) {
        for (sp = 0; sp < matcherSplit.length; sp++) {
            var val = matcherSplit[sp]
            if (parent.indexOf(val) > -1) {
                tmp2 = 100 * (parent.length - matcherSplit[sp].length) / parent.length;
                tmp2 = (isNaN(tmp2)) ? 0 : tmp2;
                if (tmp1 < tmp2) {
                    tmp1 = tmp2
                }
            }
        }
        ln = tmp1;
    }
    else {
        if (parent[0] == matcher[0] && parent[parent.length - 1] == matcher[matcher.length - 1]) {
            ln = 50;
        }
    }
    return ln;
}

getBDS(offset=0) {
    var controller = this;
    controller["offset"] = offset;
    var mappedItems = [];
    this.http.get(this.nodeLocation + "/api/data/bds?offset=" + offset + "&limit=5000&sort=-DOS")
        .success(function(data){
            //controller.setDataInfo(controller, data, data.docs);
            //controller.status = "Data Loaded Successfully"

            /*data.docs.sort(function(a, b) {
                if (a.LastName < b.LastName) return -1;
                if (a.LastName > b.LastName) return 1;
                return 0;
            })*/

            //var myDot = 0;
            console.log("Running Line Items Now");
            for (var i=0; i < data.docs.length; i++) {
                var d = data.docs[i];
                var dsp = d.DOS.replace("T00:00:00.000Z", "").replace(/-/g,"/");
                var dsp2 = new Date(dsp);
                for (var k=0; k < controller.model.Data[0].length; k++) {
                    //if (controller.model.Data[0][k].mapped == false || controller.model.Data[0][k].mapped == undefined) {
                        var c = controller.model.Data[0][k];
                        var dos = false;
                        if (c.SortDate.valueOf() == dsp2.valueOf()) {
                            dos = true;
                        }
                        if (dos) {
                            var fn = controller.checkMatch(d.FirstName, c.PatientFirstName, false);
                            var ln = controller.checkMatch(d.LastName, c.PatientLastName, false);
                            /*var lc = controller.checkMatch(d.Facility, c.Location, true);
                            if (lc > 0) {
                                lc == 100;
                            }*/
                            //var fn2 = controller.checkMatch(c.PatientFirstName, false);
                            //var ln2 = controller.checkMatch(c.PatientLastName, false);

                            //ln = (ln > ln2) ? ln : ln2;
                            //ln = (fn > fn2) ? fn : fn2;

                            var per = (ln + fn)/200;
                            per = (isNaN(per)) ? 0 : per;
                            //if (per !== 0) {
                                controller.model.Data[0][k]["PercentMatch"] = (per * 100).toFixed(2);
                                controller.model.Data[0][k]["Facility"] = d.Facility;
                                controller.model.Data[0][k]["LastName"] = d.LastName;
                                controller.model.Data[0][k]["FirstName"] = d.FirstName;
                                controller.model.Data[0][k]["DateOS"] = d.DOS;
                                //controller.model.Data[0][k]["mapped"] = true;
                                controller.mappedItems.push(controller.model.Data[0][k]);
                                //controller.model.Data[0].splice(k, 1);
                            //}
                        }
                    //}
                }
            }
            controller.offset = controller.offset + 5000;
            console.log(controller.mappedItems);
            //console.log(myDot);
            console.log("Mapped: " + controller.mappedItems.length + " of " + controller.model.Data[0].length)

    })
        .error(function(error) {
            console.log(error);
    })
        .then(function(){
           /* if (controller.offset < 200000) {
                console.log("Starting Again")
                controller.getBDS(controller.offset);
            }
        else {
            console.table(controller.mappedItems);
            console.table(controller.model.Data[0]);
        }*/
    })
}
buildReport(fieldId, report) {
    var f = document.getElementById(fieldId);
    var file = f.files[0];
    this.model = this.AllReportModelService[report].model;
    this.getCSVConversion(file)
}

}
