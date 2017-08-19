  FusionCharts.ready(function(){
    var w=window.innerWidth*0.85;
    var h=window.innerHeight*0.6;
    var fusioncharts = new FusionCharts({
    type: 'gantt',
    renderAt: 'fusionchart',
    width: w,
    height: h,
    dataFormat: 'json',
    dataSource: {
        "chart": {
            "dateformat": "mm/dd/yyyy",
//            "caption": "",
//            "subcaption": "",
			"slackFillColor":"#CC0000",
            "theme": "fint",
            "canvasBorderAlpha": "40"
        },
//		"datatable": {
//            "headervalign": "bottom",
//            "datacolumn": [{
//                "headertext": "Assign",
//                "headerfontsize": "18",
//                "headervalign": "bottom",
//                "headeralign": "left",
//                "align": "left",
//                "fontsize": "12",
//                "text": [{
//                    "label": "Com"
//                }, {
//                    "label": "GG"
//                }, {
//                    "label": "Com"
//                }, {
//                    "label": "Com"
//                }]
//            }]
//        },
        "categories": [{
            "category": [{
                "start": "05/01/2017",
                "end": "05/31/2017",
                "label": "MAY"
            }, {
                "start": "06/01/2017",
                "end": "06/30/2017",
                "label": "JUNE"
            }]
        }],
        "processes": {
            "fontsize": "18",
            "isbold": "1",
            "align": "center",
//            "headerText": "Work",
//            "headerFontSize": "20",
//            "headerVAlign": "bottom",
//            "headerAlign": "left",
            "process": [{
                "label": "Set Hosting"
            }, {
                "label": "Assign Course"
            }, {
                "label": "Major Debug"
            }, {
                "label": "User Debug"
            }]
        },
        "tasks": {
            "task": [{
                "start": "05/14/2017",
                "end": "06/02/2017",
				"percentComplete": "60"
            }, {
                "start": "05/31/2017",
                "end": "06/02/2017",
				"percentComplete": "0"
            }, {
                "start": "06/03/2017",
                "end": "06/09/2017",
				"percentComplete": "0"
            }, {
                "start": "06/10/2017",
                "end": "06/17/2017",
				"percentComplete": "0"
            }]
        }

    }
}
);
    fusioncharts.render();
});