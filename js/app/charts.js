okulusApp.factory('ChartsSvc', ['$rootScope', '$firebaseArray', '$firebaseObject',
	function($rootScope, $firebaseArray, $firebaseObject){

    var totalCompletedReunions = 0;
    var totalCanceledReunions = 0;
    var totalApprovedReports = 0;
    var totalRejectedReports = 0;
    var totalPendingReports = 0;
    var totalMoney = 0.0;
    var totalDuration = 0;
    var totalAttendance = 0;

    return {
        getReunionTotals: function(){
            return  { completedReunions: totalCompletedReunions, canceledReunions:totalCanceledReunions,
                      approvedReports: totalApprovedReports, rejectedReports: totalRejectedReports, pendingReports: totalPendingReports,
											totalMoney: totalMoney.toFixed(2), totalDuration: totalDuration, totalAttendance: totalAttendance
										};
        },
				/* Use the reportsList to get some data (Attendance, Money, Duration) that will
				be used to build the Charts. There are 2 approaches to paint Categories:
				1. Using the groups name, when a Specific groups was not selected.
				2. Using the Week Id, when only one group was selected */
        buildCharts: function(reportsList, groupId, chartOrientation) {
						//reset summary variables
            totalCompletedReunions = 0; totalCanceledReunions = 0;
						totalApprovedReports = 0; totalRejectedReports = 0; totalPendingReports = 0;
						totalMoney = 0.0;  totalDuration = 0; totalAttendance = 0;
						//Array Holders for CAtegories and Data Series
            let groupNameAsCategory = [];
            let totalMembersByReport = [];
            let totalGuestsByReport = [];
            let totalMoneyByReport = [];
            let totalDurationByReport = [];
            let moneyData = [];
						//Using a Map to collect all data from the same Group accross all weeks
						let groupDetailsMap = new Map();

						//Collect Data from each report
            reportsList.forEach(function(report, index) {
                if(report.audit && report.audit.reportStatus == "approved"){
                    totalApprovedReports ++;
                }else if(report.audit && report.audit.reportStatus == "rejected"){
                    totalRejectedReports ++;
                }else{
                    totalPendingReports ++;
                }

								//Data from Rejected Reports is not considered, because it will add incorrect date to the totals
                if(report.audit && report.audit.reportStatus != "rejected"){
                    if(report.reunion.status == "completed"){
                        totalCompletedReunions++;
                    }else{
                        totalCanceledReunions ++;
                    }
                    let guests = report.attendance.guests.total;
                    let members = report.attendance.members.total;
                    let duration = report.reunion.duration;
                    let money = report.reunion.money;

										if(groupId){
											//When a group was selected, we will be displayign reports and charts
											//only for that group, so we better change the Category name to the weekID.
											//transform weekID from 201801 to 2018-01
											let str = report.reunion.weekId;
											let formattedWeekId = str.substring(0,4)+"-"+str.substring(4);
											groupDetailsMap.set(formattedWeekId,{guests:guests, members:members, duration:duration , money:money });
										}else{
											//When selecting only a week range and no group, we might end up having many reports
											//for the same group, so we better put same group data together
											// groupname (key), {guests:0, members:0}
											if(groupDetailsMap.has(report.reunion.groupname)){
												let groupsTotals = groupDetailsMap.get(report.reunion.groupname);
												groupsTotals.guests += guests;
												groupsTotals.members += members;
												groupsTotals.duration += duration;
												groupsTotals.money += money;
												groupDetailsMap.set(report.reunion.groupname,groupsTotals);
											}else{
												groupDetailsMap.set(report.reunion.groupname,{guests:guests, members:members, duration:duration , money:money });
											}
										}
                    //For Money Scatter Charts
                    moneyData.push( [report.reunion.money, guests+members] );
                }
            });

						let totalMembers = 0;
						let totalGuests = 0;
						let groups = 0;
						/* Using the Map (with totals per group over weeks) to build Data Series*/
						groupDetailsMap.forEach(function(value, key) {
							//Chart Categories
							groupNameAsCategory.push(key);
							//Data Series
							totalGuestsByReport.push(value.guests);
							totalMembersByReport.push(value.members);
							totalMoneyByReport.push(value.money);
							totalDurationByReport.push(value.duration);

							totalMoney += parseFloat(value.money);
							totalDuration += value.duration;
							totalAttendance += value.members + value.guests;
							totalMembers += value.members;
							totalGuests += value.guests;
							groups++;
						});
            //Build Charts
            var attendanceByGroupOptions = {
                //chart: attendanceChart,
                credits: { enabled: false },
                title: { text: '' },
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

						var durationByGroupOptions = {
                //chart: areaCharts,
                credits: { enabled: false },
                title: { text: '' },
                xAxis: { categories: groupNameAsCategory },
                yAxis: { min:0, title: { text: 'Minutos Ministrados' },
                        stackLabels: { enabled: true,
                            style: { fontWeight: 'bold', color: (Highcharts.theme && Highcharts.theme.textColor) || 'gray' }
                        }
                      },
                legend: { reversed: true },
                series: [ { name: 'Duración', data: totalDurationByReport } ]
            };

						var moneyByGroupOptions = {
                //chart: areaCharts,
                credits: { enabled: false },
                title: { text: '' },
                xAxis: { categories: groupNameAsCategory },
                yAxis: { min:0, title: { text: 'Ofrenda' },
                        stackLabels: { enabled: true,
                            style: { fontWeight: 'bold', color: (Highcharts.theme && Highcharts.theme.textColor) || 'gray' }
                        }
                      },
                legend: { reversed: true },
                series: [ { name: 'Ofrenda', data: totalMoneyByReport } ]
            };

						var reunionsPieOptions = {
                chart: { type: 'pie', plotBackgroundColor: null, plotBorderWidth: 0, plotShadow: false },
                credits: { enabled: false },
                title: { text: 'Reuniones '},
                tooltip: {  pointFormat: '{series.name}: <b>{point.y} ({point.percentage:.1f}%)</b>' },
                plotOptions: {
                    pie: {
                      dataLabels: { enabled: false },
                      showInLegend: true//, colors: ['#007BFF','#FFC0CB']
                    }
                },
                series: [{
                    type: 'pie', name: 'Reuniones',
                    innerSize: '20%',
                    data: [
                        ['Realizadas', totalCompletedReunions],
                        ['Canceladas', totalCanceledReunions]
                    ]
                }]
            };

						var attendancePieOptions = {
                chart: { type: 'pie', plotBackgroundColor: null, plotBorderWidth: 0, plotShadow: false },
                credits: { enabled: false },
                title: { text: 'Asistencia'},
                tooltip: {  pointFormat: '{series.name}: <b>{point.y} ({point.percentage:.1f}%)</b>' },
                plotOptions: {
                    pie: {
                      dataLabels: { enabled: false },
                      showInLegend: true//, colors: ['#007BFF','#FFC0CB']
                    }
                },
                series: [{
                    type: 'pie', name: 'Asistencia',
                    innerSize: '20%',
                    data: [
                        ['Miembros', totalMembers],
                        ['Invitados', totalGuests]
                    ]
                }]
            };

						if( chartOrientation == 'landscape'){
							attendanceByGroupOptions.chart =  { type: 'column', height:600};
							attendanceByGroupOptions.yAxis.opposite =  false;
							durationByGroupOptions.chart = { type: 'area', inverted: false, height:600 };
							durationByGroupOptions.yAxis.opposite =  false;
							moneyByGroupOptions.chart = { type: 'area', inverted: false, height:600 };
							moneyByGroupOptions.yAxis.opposite =  false;
						}else{ //portrait
							attendanceByGroupOptions.chart =  { type: 'bar', height: (300+(groups*15)) };
							attendanceByGroupOptions.yAxis.opposite =  true;
							durationByGroupOptions.chart = { type: 'area', inverted: true, height: (300+(groups*20)) };
							durationByGroupOptions.yAxis.opposite =  true;
							moneyByGroupOptions.chart = { type: 'area', inverted: true, height: (300+(groups*20)) };
							moneyByGroupOptions.yAxis.opposite =  true;
						}

            Highcharts.chart('attendanceByGroupContainer', attendanceByGroupOptions);
            Highcharts.chart('reunionsPieContainer', reunionsPieOptions);
            Highcharts.chart('attendancePieContainer', attendancePieOptions);
            Highcharts.chart('moneyContainer', moneyByGroupOptions);
            Highcharts.chart('durationContainer', durationByGroupOptions);
        }
    };
	}
]);
