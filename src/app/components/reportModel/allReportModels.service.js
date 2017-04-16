export class AllReportModelService {
  constructor () {
    'ngInject';
      this.Duramed = {
          model: {},
          map: {
                  ReportName: "Duramed",
                  ParseSheets: [0],
                  SkipColumns: [0, 1],
                  StartRow: 2,
                  SkipLastRows: 1,
                  ParseNames: true,
                  AggregationData: ['Patient ID'],
                  Mapping: {
                      ARDate: "ARDate",
                      AdjAmt: "Adj Amount",
                      ChgAmt: "Chg Amount",
                      CPT: "CPT",
                      DOS: "DOS",
                      InsCo: "InsCo",
                      PatientFirstName: "Name",
                      PatientLastName: "Name",
                      PatientOtherName: "Name",
                      PaidAmt: "Pay Amount",
                      Provider: "Provider",
                      Doctor: "Ref Doctor",
                      Location: "Location"
                }
            }
    }
    this.ProDME = {
        model: {},
        map: {
                  ReportName: "ProDME",
                  ParseSheets: [0],
                  SkipColumns: [0, 1],
                  StartRow: 2,
                  SkipLastRows: 1,
                  ParseNames: true,
                  AggregationData: ['Patient ID'],
                  Mapping: {
                      ARDate: "ARDate",
                      AdjAmt: "Adj Amount",
                      ChgAmt: "Chg Amount",
                      CPT: "CPT",
                      DOS: "DOS",
                      InsCo: "InsCo",
                      PatientFirstName: "Name",
                      PatientLastName: "Name",
                      PatientOtherName: "Name",
                      PaidAmt: "Pay Amount",
                      Provider: "Provider",
                      Doctor: "Ref Doctor",
                      Location: "Location"
                }
            }
    }
    this.setup();
  }

    setup() {
        for (var prop in this) {
            this[prop].model = this.newModel();
            this[prop].model.ReportName = this[prop].map.ReportName;
            this[prop].model.ParseSheets.push(this[prop].map.ParseSheets);
            this[prop].model.SkipColumns.push(this[prop].map.SkipColumns);
            this[prop].model.StartRow.push(this[prop].map.StartRow);
            this[prop].model.SkipLastRows.push(this[prop].map.SkipLastRows);
            this[prop].model.ParseNames.push(this[prop].map.ParseNames);
            this[prop].model.Mapping.push(this[prop].map.Mapping);
            this[prop].model.AggregationData.push(this[prop].map.AggregationData);
        }
    }

    newModel() {
        return {
              ParseSheets: [],
              Headers: [],
              SkipColumns: [],
              StartRow: [],
              SkipLastRows: [],
              TotalRows: 0,
              ParseNames: [],
              Mapping: [],
              ReportName: "",
              AggregationData: [],
              NewMapping: function() {
                  return {
                      ARDate: null,
                      AdjAmt: null,
                      ChgAmt: null,
                      CPT: null,
                      DOS: null,
                      InsCo: null,
                      PatientFirstName: null,
                      PatientLastName: null,
                      PatientOtherName: null,
                      PaidAmt: null,
                      Provider: null,
                      Doctor: null,
                      Location: null
                  }
              },
              stringParse: function(v) {
                  return v;
              },
              intParse: function(v) {
                  if(v.indexOf('(') > -1) {
                      var i = -1;
                  }
                  else {
                      var i = 1;
                  }
                  v = v.replace(/[\$\(\)]/gi, "");
                  return parseInt(v) * i;
              },
              floatParse: function(v) {
                  if(v.indexOf('(') > -1) {
                      var i = -1;
                  }
                  else {
                      var i = 1;
                  }
                  v = v.replace(/[\$\(\)]/gi, "");
                  return parseFloat(v) * i;
              },
              dateParse: function(v) {
                  var d = Date.parse(v);
                  var dt = new Date(d);
                  var dd = dt.getMonth();
                  var dayD = dt.getDate();
                  dd++;
                  if (dd < 10) {
                      dd = '0' + dd.toString();
                  }
                  else {
                      dd = dd.toString();
                  }
                  if (dayD < 10) {
                      dayD = '0' + dayD.toString();
                  }
                  else {
                      dayD = dayD.toString();
                  }
                  var da = dt.getFullYear().toString() + "-" + dd + "-" + dayD + "T00:00:00.000Z";
                  return da;
              },
              patientParse: function(v) {
                    if (v !== "" && v !== null) {
                    var splitter = v.split(",");
                        var ln = splitter[0];
                        if (splitter[1]) {
                            var fsplit = splitter[1].trim().split(" ");
                            var fn = fsplit[0];
                            var ot = splitter[1].trim();
                        }
                        else {
                            var fn = "";
                            var ot = "";
                        }
                        return {
                            FirstName: fn,
                            LastName: ln,
                            OtherNames: ot
                        }
                    }
                    else {
                        return {
                            FirstName: "",
                            LastName: "",
                            OtherNames: ""
                        }
                    }

              },
              MappingParse: {
                  ARDate: function(v, controller) {return controller.model.dateParse(v)},
                  AdjAmt: function(v, controller) {return controller.model.floatParse(v)},
                  ChgAmt: function(v, controller) {return controller.model.floatParse(v)},
                  CPT: function(v, controller) {return controller.model.stringParse(v)},
                  DOS: function(v, controller) {return controller.model.dateParse(v)},
                  InsCo: function(v, controller) {return controller.model.stringParse(v)},
                  PatientFirstName: function(v, controller) {return controller.model.stringParse(v)},
                  PatientLastName: function(v, controller) {return controller.model.stringParse(v)},
                  PatientOtherName: function(v, controller) {return controller.model.stringParse(v)},
                  PaidAmt: function(v, controller) {return controller.model.floatParse(v)},
                  Provider: function(v, controller) {return controller.model.stringParse(v)},
                  Doctor: function(v, controller) {return controller.model.stringParse(v)},
                  Location: function(v, controller) {return controller.model.stringParse(v)}
              },
              Data: []
          }
    }
}
