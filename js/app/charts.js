okulusApp.factory('ChartsSvc', ['$rootScope', '$firebaseArray', '$firebaseObject',
	function($rootScope, $firebaseArray, $firebaseObject){

    // getTotalAttendance = function(attendance){
    //     let total =
    //         attendance.female.adult +
    //         attendance.female.young +
    //         attendance.female.kid +
    //         attendance.male.adult +
    //         attendance.male.young +
    //         attendance.male.kid;
    //     return total;
    // }

    var totalCompletedReunions = 0;
    var totalCanceledReunions = 0;

    //add on change listener to reportsList
    return {
        getReunionStatusTotals: function(){
            return  {completedReunions: totalCompletedReunions, canceledReunions:totalCanceledReunions};
        },
        buildAttendanceCharts: function(reportsList, groupId) {
            totalCompletedReunions = 0;
            totalCanceledReunions = 0;

						let groupDetailsMap = new Map();
            let groupNameAsCategory = [];
            //let totalAttendanceByReport = [];
            let totalMembersByReport = [];
            let totalGuestsByReport = [];

            // let adultMaleByWeek = 0;
            // let youngMaleByWeek = 0;
            // let kidMaleByWeek = 0;
            // let adultFemaleByWeek = 0;
            // let youngFemaleByWeek = 0;
            // let kidFemaleByWeek = 0;

						//Collect Data from each report
            reportsList.forEach(function(report, index) {

                if(report.reunion.status == "completed"){
                    totalCompletedReunions++;
                }else{
                    totalCanceledReunions ++;
                }

                // let guests = getTotalAttendance(report.attendance.guests);
                // let members = getTotalAttendance(report.attendance.members);
                let guests = report.attendance.guests.total;
                let members = report.attendance.members.total;

								if(groupId){
									//When a group was selected, we will be displayign reports and charts
									//only for that group, so we better change the Category name to the weekID.
									//transform weekID from 201801 to 2018-01
									let str = report.reunion.weekId;
									let formattedWeekId = str.substring(0,4)+"-"+str.substring(4);
									groupDetailsMap.set(formattedWeekId,{guests:guests, members:members});
								}else{
									//When selecting only a week range and no group, we might end up having many reports
									//for the same group, so we better put same group data together
									// groupname (key), {guests:0, members:0}
									if(groupDetailsMap.has(report.reunion.groupname)){
										let totalGroupAttendance = groupDetailsMap.get(report.reunion.groupname);
										totalGroupAttendance.guests += guests;
										totalGroupAttendance.members += members;
										groupDetailsMap.set(report.reunion.groupname,totalGroupAttendance);
									}else{
										groupDetailsMap.set(report.reunion.groupname,{guests:guests, members:members});
									}
								}

                //For Detail Attendance Chart
                // adultMaleByWeek += (
                //   report.attendance.members.male.adult +
                //   report.attendance.guests.male.adult );
                // youngMaleByWeek += (
                //   report.attendance.members.male.young +
                //   report.attendance.guests.male.young);
                // kidMaleByWeek += (
                //   report.attendance.members.male.kid +
                //   report.attendance.guests.male.kid);
                // adultFemaleByWeek += (
                //   report.attendance.members.female.adult +
                //   report.attendance.guests.female.adult );
                // youngFemaleByWeek += (
                //   report.attendance.members.female.young +
                //   report.attendance.guests.female.young);
                // kidFemaleByWeek += (
                //   report.attendance.members.female.kid +
                //   report.attendance.guests.female.kid);

                //For Money Scatter Charts
                //scatterMoneyData.push( [report.reunion.money, guests+members] );
            });
						groupDetailsMap.forEach(function(value, key) {
							groupNameAsCategory.push(key);
							totalGuestsByReport.push(value.guests);
							totalMembersByReport.push(value.members);
						});

            //Build Charts
            var attendanceByGroupOptions = {
                chart: { type: 'column' },
                credits: { enabled: false },
                title: { text: 'Asistencia Total (Miembros e Invitados)' },
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
            // var genderDetailsOptions = {
            //     chart: { type: 'bar' },
            //     credits: { enabled: false },
            //     title: { text: 'Rangos de Edad' },
            //     subtitle: {},
            //     xAxis: [{
            //               categories: ['Adultos', 'Jovenes', 'Niños'],
            //               reversed: false,
            //               labels: { step: 1 }
            //             }],
            //     yAxis: {
            //         title: { text: null },
            //         labels: {
            //             formatter: function () {
            //                 return Math.abs(this.value);
            //             }
            //         }
            //     },
            //     plotOptions: {
            //         series: { stacking: 'normal' }
            //     },
            //     tooltip: {
            //         formatter: function () {
            //             return '<b>' + this.series.name + ' ' + this.point.category + '</b><br/>' +
            //                 'Asistencia: ' + Highcharts.numberFormat(Math.abs(this.point.y), 0);
            //         }
            //     },
            //     series: [{
            //         name: 'Hombres', color: 'rgba(0,123,255,.8)',
            //         data: [-adultMaleByWeek, -youngMaleByWeek, -kidMaleByWeek]
            //     }, {
            //         name: 'Mujeres', color: 'rgba(255, 192, 203, .8)',
            //         data: [adultFemaleByWeek, youngFemaleByWeek, kidFemaleByWeek]
            //     }]
            // };
            // var genderPieOptions = {
            //     chart: { type: 'pie', plotBackgroundColor: null, plotBorderWidth: 0, plotShadow: false },
            //     credits: { enabled: false },
            //     title: { text: 'Género'},
            //     tooltip: {  pointFormat: '{series.name}: <b>{point.percentage:.1f}%</b>' },
            //     plotOptions: {
            //         pie: {
            //           dataLabels: { enabled: false },
            //           showInLegend: true,
            //                             colors: ['#007BFF','#FFC0CB']
            //         }
            //     },
            //     series: [{
            //         type: 'pie', name: 'Asistencia',
            //         innerSize: '20%',
            //         data: [
            //             ['Hombres', adultMaleByWeek + youngMaleByWeek + kidMaleByWeek],
            //             ['Mujeres', adultFemaleByWeek + youngFemaleByWeek + kidFemaleByWeek]
            //         ]
            //     }]
            // };
            Highcharts.chart('attendanceByGroup-container', attendanceByGroupOptions);
            // Highcharts.chart('genderDetails-container', genderDetailsOptions);
            // Highcharts.chart('genderPie-container', genderPieOptions);
        }
    };
	}
]);
