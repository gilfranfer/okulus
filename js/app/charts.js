okulusApp.factory('ChartsSvc', ['$rootScope', '$firebaseArray', '$firebaseObject',
	function($rootScope, $firebaseArray, $firebaseObject){

    getTotalAttendance = function(attendance){
        let total =
            attendance.female.adult +
            attendance.female.young +
            attendance.female.kid +
            attendance.male.adult +
            attendance.male.young +
            attendance.male.kid;
        return total;
    }
    //add on change listener to reportsList
    return {
        buildAttendanceCharts: function(reportsList) {
            let totalCompletedStatusReunions = 0;
            
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

            //Collect Data from each report
            reportsList.forEach(function(report, index) {

                if(report.reunion.status == "completed"){
                    totalCompletedStatusReunions++;
                }

                groupNameAsCategory.push(report.reunion.groupname);
                //For attendance Charts
                let guests = getTotalAttendance(report.attendance.guests);
                let members = getTotalAttendance(report.attendance.members);

                totalGuestsByReport.push(guests);
                totalMembersByReport.push(members);
                totalAttendanceByReport.push(guests+members);

                //For Detail Attendance Chart
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

                    //For Money Scatter Charts
                    //scatterMoneyData.push( [report.reunion.money, guests+members] );
                });

            //Build Charts
            var attendanceByGroupOptions = {
                chart: { type: 'column' },
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
                series: [ { name: 'Invitados', color: 'rgba(40,167,69,.8)', data: totalGuestsByReport },
                          { name: 'Miembros', color: 'rgba(0,123,255,.8)', data: totalMembersByReport }
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
                    name: 'Hombres', color: 'rgba(0,123,255,.8)',
                    data: [-adultMaleByWeek, -youngMaleByWeek, -kidMaleByWeek]
                }, {
                    name: 'Mujeres', color: 'rgba(255, 192, 203, .8)',
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
                      showInLegend: true,
                                        colors: ['#007BFF','#FFC0CB']
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
        },

      buildAttendanceChart: function(reportsList,activeGroupsCount) {
        // console.log(activeGroupsCount);
        // let activeGroupsCount = 10;
        let totalCompletedStatusReunions = 0;
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

				let scatterMoneyData = [];

        reportsList.forEach(function(report, index) {
					//For Gauge Charts
					if(report.reunion.status == "completed"){
            totalCompletedStatusReunions++;
          }

					//For attendance Charts
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

					//For Detail Attendance Charts
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

					//For Money Scatter Charts
					scatterMoneyData.push( [report.reunion.money, guests+members] );
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
            series: [ { name: 'Invitados', color: 'rgba(40,167,69,.8)', data: totalGuestsByReport },
                      { name: 'Miembros', color: 'rgba(0,123,255,.8)', data: totalMembersByReport }
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
                name: 'Hombres', color: 'rgba(0,123,255,.8)',
                data: [-adultMaleByWeek, -youngMaleByWeek, -kidMaleByWeek]
            }, {
                name: 'Mujeres', color: 'rgba(255, 192, 203, .8)',
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
                  showInLegend: true,
									colors: ['#007BFF','#FFC0CB']
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

        var gaugeOptions = {
            chart: { type: 'solidgauge' },
            title: null,
            tooltip: { enabled: false },
            credits: { enabled: false },
            pane: {
                center: ['50%', '85%'],
                size: '140%',
                startAngle: -90, endAngle: 90,
                background: {
                    backgroundColor: (Highcharts.theme && Highcharts.theme.background2) || '#EEE',
                    innerRadius: '60%', outerRadius: '100%',
                    shape: 'arc'
                }
            },
            yAxis: {
                stops: [
                    [0.1, '#e52c2c'], // red
                    [0.5, '#f4f600'], // yellow
                    [0.9, '#37a71c ']  // green
                ],
                lineWidth: 0,
                minorTickInterval: null,
                //tickAmount: 2,
                title: { y: -70 },
                labels: { y: 16 }
            },
            plotOptions: {
                solidgauge: { dataLabels: { y: 5, borderWidth: 0, useHTML: true }   }
            }
        };

        var gaugeProgress = {
            yAxis: { min: 0, max: activeGroupsCount, title: { text: 'Reportes Entregados' }
            },
            series: [{
                data: [reportsList.length],
                dataLabels: {
                    format: '<div style="text-align:center"><span style="font-size:25px;">{y}</span><br/>' +
                           '<span style="font-size:12px;color:silver">de '+activeGroupsCount+'</span></div>'
                }
            }]
        };

        var gaugeStatus = {
            yAxis: { min: 0, max: activeGroupsCount, title: { text: 'Reuniones Realizadas' }
            },
            series: [{
                data: [totalCompletedStatusReunions],
                dataLabels: {
                    format: '<div style="text-align:center"><span style="font-size:25px;">{y}</span><br/>' +
                           '<span style="font-size:12px;color:silver">de '+activeGroupsCount+'</span></div>'
                }
            }]
        };

			var scatterOptions = {
			    chart: { type: 'scatter',  zoomType: 'xy'},
			    title: { text: 'Relación de Asistencia y Diezmo' },
			    subtitle: { text: ''},
					credits: { enabled: false },
					legend: { enabled: false },
			    xAxis: {
			        title: {
			            enabled: true,
			            text: 'Diezmo'
			        },
			        startOnTick: true, endOnTick: true,
			        showLastLabel: true
			    },
			    yAxis: {
			        title: { text: 'Asistencia' }
			    },
			    plotOptions: {
			        scatter: {
			            marker: {
			                radius: 10,
			                states: { hover: { enabled: true, lineColor: 'rgb(100,100,100)' } }
			            },
			            states: {
			                hover: { marker: { enabled: false  } }
			            },
			            tooltip: {
			                headerFormat: '{point.y} asistentes, <br>',
			                pointFormat: '${point.x}'
			            }
			        }
			    },
			    series: [{
			        name: '',
			        color: 'rgba(0,123,255,.8)',
			        data: scatterMoneyData
			    }]
			};

        Highcharts.chart('attendanceByGroup-container', attendanceByGroupOptions);
        Highcharts.chart('genderDetails-container', genderDetailsOptions);
        Highcharts.chart('genderPie-container', genderPieOptions);
        Highcharts.chart('progressGauge-container', Highcharts.merge(gaugeOptions, gaugeProgress) );
        Highcharts.chart('statusGauge-container', Highcharts.merge(gaugeOptions, gaugeStatus) );
				Highcharts.chart('moneyScatter-container', scatterOptions);
      } //function buildAttendanceChart end
    };
	}
]);
