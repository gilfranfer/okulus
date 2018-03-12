okulusApp.factory('ChartsSvc', ['$rootScope', '$firebaseArray', '$firebaseObject',
	function($rootScope, $firebaseArray, $firebaseObject){

    var totalCompletedReunions = 0;
    var totalCanceledReunions = 0;
    var totalApprovedReports = 0;
    var totalRejectedReports = 0;
    var totalPendingReports = 0;

    return {
        getReunionStatusTotals: function(){
            return  {completedReunions: totalCompletedReunions, canceledReunions:totalCanceledReunions,
                     approvedReports: totalApprovedReports, rejectedReports: totalRejectedReports, pendingReports: totalPendingReports};
        },
        buildCharts: function(reportsList, groupId) {
            totalCompletedReunions = 0;
            totalCanceledReunions = 0;
            totalApprovedReports = 0;
            totalRejectedReports = 0;
            totalPendingReports = 0;

			let groupDetailsMap = new Map();
            let groupNameAsCategory = [];
            let totalMembersByReport = [];
            let totalGuestsByReport = [];
            let totalMoneyByReport = [];
            let totalDurationByReport = [];
            let moneyData = [];

						//Collect Data from each report
            reportsList.forEach(function(report, index) {

                if(report.audit && report.audit.reportStatus == "approved"){
                    totalApprovedReports ++;
                }else if(report.audit && report.audit.reportStatus == "rejected"){
                    totalRejectedReports ++;
                }else{
                    totalPendingReports ++;
                }

                if(report.audit && report.audit.reportStatus == "rejected"){

                }else{
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

						let totalMembers = 0
						let totalGuests = 0
						groupDetailsMap.forEach(function(value, key) {
							groupNameAsCategory.push(key);
							totalGuestsByReport.push(value.guests);
							totalMembersByReport.push(value.members);
							totalMoneyByReport.push(value.money);
							totalDurationByReport.push(value.duration);
							totalMembers += value.members;
							totalGuests += value.guests;
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

						var durationByGroupOptions = {
                chart: { type: 'area', inverted: false },
                credits: { enabled: false },
                title: { text: 'Duración' },
                xAxis: { categories: groupNameAsCategory },
                yAxis: { min:0, title: { text: '' },
                        stackLabels: { enabled: true,
                            style: { fontWeight: 'bold', color: (Highcharts.theme && Highcharts.theme.textColor) || 'gray' }
                        }
                      },
                legend: { reversed: true },
                series: [ { name: 'Duración', data: totalDurationByReport } ]
            };

						var moneyByGroupOptions = {
                chart: { type: 'area', inverted: false },
                credits: { enabled: false },
                title: { text: 'Ofrenda' },
                xAxis: { categories: groupNameAsCategory },
                yAxis: { min:0, title: { text: '' },
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
                title: { text: 'Reuniones: '+(totalCompletedReunions+totalCanceledReunions)},
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
                title: { text: 'Asistencia Total: '+(totalMembers+totalGuests)},
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

            Highcharts.chart('attendanceByGroupContainer', attendanceByGroupOptions);
            Highcharts.chart('reunionsPieContainer', reunionsPieOptions);
            Highcharts.chart('attendancePieContainer', attendancePieOptions);
            Highcharts.chart('moneyContainer', moneyByGroupOptions);
            Highcharts.chart('durationContainer', durationByGroupOptions);
        }
    };
	}
]);
