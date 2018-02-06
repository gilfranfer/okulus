okulusApp.factory('ChartsSvc', ['$rootScope', '$firebaseArray', '$firebaseObject',
	function($rootScope, $firebaseArray, $firebaseObject){

    //add on change listener to reportsList
    return {
      buildAttendanceChart: function(reportsList) {
        let groupNameAsCategory = [];
        let totalAttendanceByReport = [];
        let totalMembersByReport = [];
        let totalGuestsByReport = [];

        let adultMaleByWeek = 0;
        let youngMaleByWeek = 0;
        let kidMaleByWeek = 0;
        let adultFemaleByWeek = 0;
        let youngFemaleByWeek = 0;
        let kidFemaleByWeek = 0;

        reportsList.forEach(function(report, index) {
          groupNameAsCategory.push(report.reunion.groupname);
          let guests =
            report.attendance.guests.female.adult +
            report.attendance.guests.female.young +
            report.attendance.guests.female.kid +
            report.attendance.guests.male.adult +
            report.attendance.guests.male.young +
            report.attendance.guests.male.kid;
          let members =
            report.attendance.members.female.adult +
            report.attendance.members.female.young +
            report.attendance.members.female.kid +
            report.attendance.members.male.adult +
            report.attendance.members.male.young +
            report.attendance.members.male.kid;
          totalGuestsByReport.push(guests);
          totalMembersByReport.push(members);
          totalAttendanceByReport.push(guests+members);

          adultMaleByWeek += (
            report.attendance.members.male.adult +
            report.attendance.guests.male.adult );
          youngMaleByWeek += (
            report.attendance.members.male.young +
            report.attendance.guests.male.young);
          kidMaleByWeek += (
            report.attendance.members.male.kid +
            report.attendance.guests.male.kid);

          adultFemaleByWeek += (
            report.attendance.members.female.adult +
            report.attendance.guests.female.adult );
          youngFemaleByWeek += (
            report.attendance.members.female.young +
            report.attendance.guests.female.young);
          kidFemaleByWeek += (
            report.attendance.members.female.kid +
            report.attendance.guests.female.kid);

				});

        var attendanceByGroupOptions = {
            chart: { type: 'bar' },
            credits: { enabled: false },
            title: { text: 'Asistencia por Grupo' },
            xAxis: { categories: groupNameAsCategory },
            yAxis: { min:0, title: { text: 'Personas Ministradas' },
                    stackLabels: { enabled: true,
                        style: { fontWeight: 'bold', color: (Highcharts.theme && Highcharts.theme.textColor) || 'gray' }
                    }
                  },
            legend: { reversed: true },
            plotOptions: { series: { stacking: 'normal' } },
            series: [ { name: 'Invitados', data: totalGuestsByReport },
                      { name: 'Miembros', data: totalMembersByReport }
                    ]
        };

        var genderDetailsOptions = {
            chart: { type: 'bar' },
            credits: { enabled: false },
            title: { text: 'Rangos de Edad' },
            subtitle: {},
            xAxis: [{
                      categories: ['Adultos', 'Jovenes', 'Niños'],
                      reversed: false,
                      labels: { step: 1 }
                    }],
            yAxis: {
                title: { text: null },
                labels: {
                    formatter: function () {
                        return Math.abs(this.value);
                    }
                }
            },
            plotOptions: {
                series: { stacking: 'normal' }
            },
            tooltip: {
                formatter: function () {
                    return '<b>' + this.series.name + ' ' + this.point.category + '</b><br/>' +
                        'Asistencia: ' + Highcharts.numberFormat(Math.abs(this.point.y), 0);
                }
            },
            series: [{
                name: 'Hombres',
                data: [-adultMaleByWeek, -youngMaleByWeek, -kidMaleByWeek]
            }, {
                name: 'Mujeres',
                data: [adultFemaleByWeek, youngFemaleByWeek, kidFemaleByWeek]
            }]
        };

        var genderPieOptions = {
            chart: { type: 'pie', plotBackgroundColor: null, plotBorderWidth: 0, plotShadow: false },
            credits: { enabled: false },
            title: { text: 'Género'},
            tooltip: {  pointFormat: '{series.name}: <b>{point.percentage:.1f}%</b>' },
            plotOptions: {
                pie: {
                  dataLabels: { enabled: false },
                  showInLegend: true
                }
            },
            series: [{
                type: 'pie', name: 'Asistencia',
                innerSize: '20%',
                data: [
                    ['Hombres', adultMaleByWeek + youngMaleByWeek + kidMaleByWeek],
                    ['Mujeres', adultFemaleByWeek + youngFemaleByWeek + kidFemaleByWeek]
                ]
            }]
        };


        Highcharts.chart('attendanceByGroup-container', attendanceByGroupOptions);
        Highcharts.chart('genderDetails-container', genderDetailsOptions);
        Highcharts.chart('genderPie-container', genderPieOptions);
        // Highcharts.chart('progressGauge-container', Highcharts.merge(gaugeOptions, gaugeProgress) );
        //Highcharts.chart('genderPie-container', genderPieOptions);



var gaugeOptions = {

    title: null,

    pane: {
        center: ['50%', '85%'],
        size: '140%',
        startAngle: -90,
        endAngle: 90,
        background: {
            backgroundColor: (Highcharts.theme && Highcharts.theme.background2) || '#EEE',
            innerRadius: '60%',
            outerRadius: '100%',
            shape: 'arc'
        }
    },

    tooltip: {
        enabled: false
    },

    // the value axis
    yAxis: {
        stops: [
            [0.1, '#55BF3B'], // green
            [0.5, '#DDDF0D'], // yellow
            [0.9, '#DF5353'] // red
        ],
        lineWidth: 0,
        minorTickInterval: null,
        tickAmount: 2,
        title: {
            y: -70
        },
        labels: {
            y: 16
        }
    },

    plotOptions: {
        solidgauge: {
            dataLabels: {
                y: 5,
                borderWidth: 0,
                useHTML: true
            }
        }
    }
};

// The speed gauge
var chartSpeed = Highcharts.chart('container-speed', Highcharts.merge(gaugeOptions, {
    yAxis: {
        min: 0,
        max: 200,
        title: {
            text: 'Speed'
        }
    },

    credits: {
        enabled: false
    },

    series: [{
      type: 'gauge',
        name: 'Speed',
        data: [80],
        dataLabels: {
            format: '<div style="text-align:center"><span style="font-size:25px;color:' +
                ((Highcharts.theme && Highcharts.theme.contrastTextColor) || 'black') + '">{y}</span><br/>' +
                   '<span style="font-size:12px;color:silver">km/h</span></div>'
        },
        tooltip: {
            valueSuffix: ' km/h'
        }
    }]

}));

// The RPM gauge
var chartRpm = Highcharts.chart('container-rpm', Highcharts.merge(gaugeOptions, {
    yAxis: {
        min: 0,
        max: 5,
        title: {
            text: 'RPM'
        }
    },

    series: [{
      type: 'gauge',
        name: 'RPM',
        data: [1],
        dataLabels: {
            format: '<div style="text-align:center"><span style="font-size:25px;color:' +
                ((Highcharts.theme && Highcharts.theme.contrastTextColor) || 'black') + '">{y:.1f}</span><br/>' +
                   '<span style="font-size:12px;color:silver">* 1000 / min</span></div>'
        },
        tooltip: {
            valueSuffix: ' revolutions/min'
        }
    }]

}));

// Bring life to the dials
setInterval(function () {
    // Speed
    var point,
        newVal,
        inc;

    if (chartSpeed) {
        point = chartSpeed.series[0].points[0];
        inc = Math.round((Math.random() - 0.5) * 100);
        newVal = point.y + inc;

        if (newVal < 0 || newVal > 200) {
            newVal = point.y - inc;
        }

        point.update(newVal);
    }

    // RPM
    if (chartRpm) {
        point = chartRpm.series[0].points[0];
        inc = Math.random() - 0.5;
        newVal = point.y + inc;

        if (newVal < 0 || newVal > 5) {
            newVal = point.y - inc;
        }

        point.update(newVal);
    }
}, 2000);




      }
    };
	}
]);
