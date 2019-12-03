/* Linked directly to the statistics.html (for user and admin), to control the
 creation of charts and tables based on the Reports found */
okulusApp.controller('StatisticsCntrl',
	['$rootScope','$scope', 'WeeksSvc','ReportsSvc','GroupsSvc','MembersSvc',
	function ($rootScope, $scope, WeeksSvc, ReportsSvc, GroupsSvc,MembersSvc) {

		$scope.reportsListExpanded = true;
		$scope.reportChartsExpanded = true;
		$scope.attnChartsExpanded = true;
		$scope.moneyChartsExpanded = true;
		$scope.durationChartsExpanded = true;
		$scope.expandSection = function(section, value) {
			switch (section) {
				case 'reportsList':
					$scope.reportsListExpanded = value;
					break;
				case 'reportCharts':
					$scope.reportChartsExpanded = value;
					break;
				case 'attnCharts':
					$scope.attnChartsExpanded = value;
					break;
				case 'moneyCharts':
					$scope.moneyChartsExpanded = value;
					break;
				case 'durationCharts':
					$scope.durationChartsExpanded = value;
					break;
				default:
			}
		};

		//Default chart Orientation (portrait or landscape)
		$scope.chartOrientation = 'landscape';
		$scope.rawReportsFound = undefined;
		$rootScope.reportFinder = {weekStatusOpt:'all', groupStatusOpt: 'all'};

		/* Method to retrieve reports from database, using promises to wait for the data,
		 and build the detailed Dashboard. We create separate DB calls (one per selected week)
		 to fetch the reports. This is because the selected weeks might not be in sequence.
		 Then, a Map with the selected groups is used to filter out irrelevant reports,
		 and build the Dashboard elements. */
		$scope.buildReportsDashboard = function(){
			$scope.response = {loading:true, message:systemMsgs.inProgress.searchingReports};

			/* Get Reports for each selected Week. Push promises into an array */
			let selectedWeeksMap = new Map();
			let getReporstForWeekPromises = [];
			$scope.selectedWeeks.forEach(function(weekId){
				selectedWeeksMap.set(weekId,weekId);
				getReporstForWeekPromises.push( ReportsSvc.getReportsForWeek(weekId).$loaded() );
			});

			/* Copy the selected group Ids to a Map. This will be later used to filter reports */
			let selectedGroupsMap = new Map();
			$scope.selectedGroups.forEach( function(groupId){ selectedGroupsMap.set(groupId,groupId); });

			/* A "Promise.all" will return an array with the result of each promise,
			in this case the list of reports for each selected week. We'll Use the data from the
			promises to: 1) Filter-in only the reports for the selected groups, 2)Create a Watch
			function for each week to detect real time DB updates, and 3) Build the charts. */
			Promise.all(getReporstForWeekPromises).then(function(reportsPerWeekArray){
				//Put all inside apply to ensure the view is properly refreshed
				$scope.$apply(function(){
					console.debug("Promises fulfilled. Starting to filter reports");
					$scope.response = {loading:true, message:systemMsgs.inProgress.filteringReports};
					$scope.filterReports(reportsPerWeekArray, selectedGroupsMap);

					//These 2 values are week-based (in the configurations)
					let goodAttendanceIndicator = undefined;
					let excelentAttendanceIndicator = undefined;
					if(selectedGroupsMap.size == 1){
						/* When ONE group is selected we'll display the Weeks as Category (X axis),
						and the total attendance as Y axis. No need to modify the attendance indicators. */
						$scope.reunionSummary.goodAttendanceIndicator = $rootScope.config.reports.goodAttendanceNumber;
						$scope.reunionSummary.excelentAttendanceIndicator = $rootScope.config.reports.excelentAttendanceNumber;
					}else if(selectedGroupsMap.size > 1){
						/* When the user selects more than one group, the main chart will be displayed with Groups as
						Category (X axis), and the total attendance (Y axis) will be the sum of attendance in each
						report of the selected weeks. Because of that, we need to multiply those 2 values by the
						number of selected weeks */
						let numberOfWeeks = reportsPerWeekArray.length;
						$scope.reunionSummary.goodAttendanceIndicator = $rootScope.config.reports.goodAttendanceNumber*numberOfWeeks;
						$scope.reunionSummary.excelentAttendanceIndicator = $rootScope.config.reports.excelentAttendanceNumber*numberOfWeeks;
					}

					$scope.selectedGroupsMap = selectedGroupsMap;
					$scope.selectedWeeksMap = selectedWeeksMap;

					//Add watch functions
					// reportsPerWeekArray.forEach(function(reportsPerWeek){
					// 	reportsPerWeek.$watch(function(event){ notifyReportAdded(event); });
					// 	// $scope.rawReportsFound = ReportsSvc.getReportsforWeeksPeriod(oldestWeek, newestWeek);
					// 	// $scope.rawReportsFound.$loaded().then(function(reports){
					// 	// 	$scope.rawReportsFound.$watch(function(event){ notifyReportAdded(event); });
					// 	// 	buildReportsDashboard(reports, selectedGroupsMap, selectedWeeksMap, $scope.chartOrientation);
					// 	// 	$scope.selectedGroupsMap = selectedGroupsMap;
					// 	// 	$scope.selectedWeeksMap = selectedWeeksMap;
					// 	// 	$scope.response = null;
					// 	// 	//$scope.response = {success:true, message:systemMsgs.success.reportsRetrieved};
					// 	// });
					// });
					//

					// console.debug("Reunion Summary:", $scope.reunionSummary);
					// console.debug("Reports to Display:", $scope.reportsToDisplay);
					// console.debug("Details Map:", $scope.categoriesDataMap);

					//Proceed to build the Table and Charts
					$scope.response = {loading:true, message:systemMsgs.inProgress.buildingCharts};
					$scope.sortBy = 'reviewStatus';
					$scope.descSort = false;
					$scope.buildCharts($scope.reunionSummary, $scope.categoriesDataMap, $scope.chartOrientation);
					window.scrollBy(0, $( "#reportFinder" ).height());
					$scope.response = null;
				});
			});
		};

		/* Called from buildReportsDashboard()
		Method to filter-in the reports belonging only to groups selected by the user
		- reportsPerWeekArray: An array containing $firebaseArrays with Reports for each selected week
		- selectedGroups: Array with the Ids of the User's selected groups. It will be used to filter the reports */
		$scope.filterReports = function(reportsPerWeekArray, selectedGroups){
			let categoriesDataMap = new Map();
			let reportsToDisplay = [];
			let allReportsTotals = {
				reports:{ total:0, approved:0, rejected:0, pending:0, onTime:0, notOnTime:0 },
				reunions:{ total:0,completed:0, canceled:0 },
				attn:{
					total:0, members:0, guests:0,
					//Not used in the view right now
					male:0, female:0,
					membersMale:0, membersFemale:0,
					guestsMale:0, guestsFemale:0
				},
				//Not used in the view right now
				money:{total:0},
				duration:{total:0}
			};

			reportsPerWeekArray.forEach(function(reportsOfTheWeek, index){
				/* For each report fetched from DB, confirm if it is a valid one and add it to
				the reportsToDisplay list. A report is valid when its groupId	exists in the
				user's selection (selectedGroups).
				Use Data from each report to update: 1. The totals in allReportsTotals, and
				2. The totals in the categoriesDataMap (this will be used later as the Chart's categories and series */
				reportsOfTheWeek.forEach(function(report, index){
					if( !selectedGroups.has(report.groupId) ){
						console.debug("Report Discarted. Group not Selected:", report.groupname);
						return;
					}
					//Determine the key for the categoriesDataMap
					let mapKey = undefined;
					if(selectedGroups.size == 1){
						/* When only 1 group was selected, the weekId will be the key in the Map */
						let str = report.weekId;
						let formattedWeekId = str.substring(0,4)+"-"+str.substring(4);
						mapKey = formattedWeekId;
					}
					else if(selectedGroups.size > 1){
						/* When selecting more than one group, we'll use the Group Id as the key */
						mapKey = report.groupname;
					}

					/* The map might already have the key because:
					1. When the mapKey is the week: There are more than one report for the same week and group combination.
					2. When the mapKeyis the groupId: There are more than one report for the group (not necessarily for the same week)
					In this case, we always accumulate the values.*/
					let mapElement = undefined;
					if(!categoriesDataMap.has(mapKey)){
						mapElement = {
							reports:{ total:0, approved:0, rejected:0, pending:0, onTime:0, notOnTime:0 },
							reunions:{ total:0,completed:0, canceled:0 },
							attn:{
								total:0, members:0, guests:0,
								male:0, female:0,
								membersMale:0, membersFemale:0,
								guestsMale:0, guestsFemale:0
							},
							money:{total:0.0},
							duration:{total:0}
						};
						categoriesDataMap.set(mapKey,mapElement);
					}
					mapElement = categoriesDataMap.get(mapKey);

					reportsToDisplay.push(report);
					allReportsTotals.reports.total++;
					mapElement.reports.total++;

					if(report.reviewStatus == constants.status.approved){
						allReportsTotals.reports.approved++;
						mapElement.reports.approved++;
					} else if(report.reviewStatus == constants.status.pending){
						allReportsTotals.reports.pending++;
						mapElement.reports.pending++;
					} else if(report.reviewStatus == constants.status.rejected){
						allReportsTotals.reports.rejected++;
						mapElement.reports.rejected++;
						/* Data from Rejected Reports will not be considered because it will
						introduce irrelevant or incorrect values to the totals */
						console.debug("Report Discarted. Rejected Status");
						return;
					}

					if(report.onTime){
						allReportsTotals.reports.onTime++;
						mapElement.reports.onTime++;
					}else{
						allReportsTotals.reports.notOnTime++;
						mapElement.reports.notOnTime++;
					}
					//Increase Reunion Status Count
					allReportsTotals.reunions.total++;
					mapElement.reunions.total++;
					if(report.status == constants.status.completed){
						allReportsTotals.reunions.completed++;
						mapElement.reunions.completed++;
					}else if(report.status == constants.status.canceled){
						allReportsTotals.reunions.canceled++;
						mapElement.reunions.canceled++;
					}

					//Increase attendance
					allReportsTotals.attn.total += report.totalAttendance;
					allReportsTotals.attn.female += report.totalFemale;
					allReportsTotals.attn.male += report.totalMale;
					allReportsTotals.attn.members += report.membersAttendance;
					allReportsTotals.attn.membersMale += report.maleMembers;
					allReportsTotals.attn.membersFemale += report.femaleMembers;
					allReportsTotals.attn.guests += report.guestsAttendance;
					allReportsTotals.attn.guestsMale += report.maleGuests;
					allReportsTotals.attn.guestsFemale += report.femaleGuests;
					mapElement.attn.total += report.totalAttendance;
					mapElement.attn.female += report.totalFemale;
					mapElement.attn.male += report.totalMale;
					mapElement.attn.members += report.membersAttendance;
					mapElement.attn.membersMale += report.maleMembers;
					mapElement.attn.membersFemale += report.femaleMembers;
					mapElement.attn.guests += report.guestsAttendance;
					mapElement.attn.guestsMale += report.maleGuests;
					mapElement.attn.guestsFemale += report.femaleGuests;

					//Increase duration
					allReportsTotals.duration.total += report.duration;
					mapElement.duration.total += report.duration;
					allReportsTotals.duration.avgCompletedReunion = (allReportsTotals.duration.total / allReportsTotals.reunions.completed);
					allReportsTotals.duration.avgAttendance = (allReportsTotals.duration.total / allReportsTotals.attn.total);
					mapElement.duration.avgCompletedReunion = (mapElement.duration.total / mapElement.reunions.completed);
					mapElement.duration.avgAttendance = (mapElement.duration.total / mapElement.attn.total);

					//Increase money
					if(report.money){
						allReportsTotals.money.total += (parseFloat(report.money));
						mapElement.money.total += (parseFloat(report.money));
						allReportsTotals.money.avgCompletedReunion = (allReportsTotals.money.total / allReportsTotals.reunions.completed);
						allReportsTotals.money.avgAttendance = (allReportsTotals.money.total / allReportsTotals.attn.total);
						mapElement.money.avgCompletedReunion = (mapElement.money.total / mapElement.reunions.completed);
						mapElement.money.avgAttendance = (mapElement.money.total / mapElement.attn.total);
					}
				});
			});

			//For the Summary Cards
			$scope.reunionSummary = allReportsTotals;
			//For the Reports table
			$scope.reportsToDisplay = reportsToDisplay;
			//Build the Charts
			$scope.categoriesDataMap = categoriesDataMap;
		};

		/* Called from buildReportsDashboard(). Build Highcharts elements, using categoriesDataMap and
		allReportsTotals objects constructed during the Report filtering process.
		- categoriesDataMap contains totals for each category.
			ex. Map = [{ key: "San Antonio", value: { guests: 5, members: 12, money: 195.4, duration: 339 }, ... ]
		- reunionSummary contains totals for all the reports in all categories. Used in then sumary table too.	*/
		$scope.buildCharts = function(allReportsTotals, categoriesDataMap, chartOrientation){

			/* Use the categoriesDataMap to build Data Series */
			let categories = [];
			let guestsSeries = [];
			let membersSeries = [];
			let maleSeries = [];
			let femaleSeries = [];
			let moneySeries = [], moneyAvgReunionSeries = [], moneyAvgAttnSeries = [];
			let durationSeries = [], durationAvgReunionSeries = [], durationAvgAttnSeries = [];
			let completedSeries = [];
			let canceledSeries = [];
			let dueReportSeries = [];
			let onTimeReportSeries = [];
			let approvedSeries = [];
			let pendingSeries = [];
			let rejectedSeries = [];
			let series = 0;

			//Prepare all the series for the bar charts
			categoriesDataMap.forEach(function(reunionTotals, key){
				categories.push(key); //groupname or weekid
				guestsSeries.push(reunionTotals.attn.guests);
				membersSeries.push(reunionTotals.attn.members);
				maleSeries.push(reunionTotals.attn.male);
				femaleSeries.push(reunionTotals.attn.female);
				completedSeries.push(reunionTotals.reunions.completed);
				canceledSeries.push(reunionTotals.reunions.canceled);
				dueReportSeries.push(reunionTotals.reports.notOnTime);
				onTimeReportSeries.push(reunionTotals.reports.onTime);
				approvedSeries.push(reunionTotals.reports.approved);
				rejectedSeries.push(reunionTotals.reports.rejected);
				pendingSeries.push(reunionTotals.reports.pending);

				moneySeries.push(reunionTotals.money.total);
				durationSeries.push(reunionTotals.duration.total);

				if(reunionTotals.reunions.completed){
					let avg = reunionTotals.duration.total/reunionTotals.reunions.completed;
					avg = avg.toFixed(2);
					durationAvgReunionSeries.push( parseFloat(avg) );

					avg = reunionTotals.money.total/reunionTotals.reunions.completed;
					avg = avg.toFixed(2);
					moneyAvgReunionSeries.push( parseFloat(avg) );
				}else{
					moneyAvgReunionSeries.push(0);
					durationAvgReunionSeries.push(0);
				}

				if(reunionTotals.attn.total){
					let avg = reunionTotals.duration.total/reunionTotals.attn.total;
					avg = avg.toFixed(2);
					durationAvgAttnSeries.push( parseFloat(avg) );

					avg = reunionTotals.money.total/reunionTotals.attn.total;
					avg = avg.toFixed(2);
					moneyAvgAttnSeries.push( parseFloat(avg) );
				}else{
					durationAvgAttnSeries.push(0);
					moneyAvgAttnSeries.push(0);
				}

				series++;
			});
			// console.debug("categories:",categories);
			// console.debug("guestsSeries:",guestsSeries);
			// console.debug("membersSeries:",membersSeries);
			// console.debug("moneySeries:",moneySeries);
			// console.debug("durationSeries:",durationSeries);

			let colors = $rootScope.config.charts.colors;

			//Build Chart Config Objects
			var sexPie = getPieChartOptions();
			sexPie.series[0].data =  [
					{name:$rootScope.i18n.members.malesLbl, y:allReportsTotals.attn.male, color: colors.members.male},
					{name:$rootScope.i18n.members.femalesLbl, y:allReportsTotals.attn.female, color: colors.members.female}
			];

			var attnPie = getPieChartOptions();
			attnPie.series[0].data =  [
				{name:$rootScope.i18n.reports.membersLbl, y:allReportsTotals.attn.members, color:colors.members.member},
				{name:$rootScope.i18n.reports.guestsLbl, y:allReportsTotals.attn.guests, color:colors.members.guest}
			];

			var attendanceChart = {
				//chart: attendanceChart,
				title: { text: '' }, legend: { reversed: true }, credits: { enabled: false },
				xAxis: { categories: categories },
				yAxis: {
					min:0, title: { text: $rootScope.i18n.charts.attendanceTitle },
					stackLabels: { enabled: true,
						style: { fontWeight: 'bold', color: (Highcharts.theme && Highcharts.theme.textColor) || 'gray' }
					},
					plotLines: [
						//lines for good attendance indicator
						{ value: allReportsTotals.goodAttendanceIndicator, zIndex: 3,
							color: 'red', width: 2, dashStyle: 'dash',
							label: {text: '', align:'center', style:{color: 'gray'}}
						},
						//lines for excelent attendance indicator
						{ value: allReportsTotals.excelentAttendanceIndicator, zIndex: 3,
							color: 'green', width: 2, dashStyle: 'dash',
							label: {text: '', align:'center', style:{color: 'gray'}}
						}
					]
				},
				plotOptions: { column: {stacking: 'normal'} },
				series: [
					{ type: 'column',  data: guestsSeries, name: $rootScope.i18n.reports.guestsLbl, color: colors.members.guest },
					{ type: 'column',  data: membersSeries, name: $rootScope.i18n.reports.membersLbl, color: colors.members.member},
					{ type: 'spline', data: femaleSeries, name: $rootScope.i18n.members.femalesLbl, color: colors.members.female, lineWidth:4, label:{enabled:false} },
					{ type: 'spline', data: maleSeries, name: $rootScope.i18n.members.malesLbl, color: colors.members.male, lineWidth:4, label:{enabled:false} }
				]
			};

			var reportsPie = getPieChartOptions();
			reportsPie.title.text = $rootScope.i18n.reports.reportsLbl;
			reportsPie.series[0].data =  [
					{name:$rootScope.i18n.reports.pendingLbl,  y:allReportsTotals.reports.pending, color: colors.reports.pending},
					{name:$rootScope.i18n.reports.approvedLbl, y:allReportsTotals.reports.approved, color: colors.reports.approved},
					{name:$rootScope.i18n.reports.rejectedLbl, y:allReportsTotals.reports.rejected, color: colors.reports.rejected}
			];

			var reunionsPie = getPieChartOptions();
			reunionsPie.title.text = $rootScope.i18n.reportFinder.reunionsLbl;
			reunionsPie.series[0].data =  [
					{name:$rootScope.i18n.reports.completedLbl, y:allReportsTotals.reunions.completed, color: colors.reunions.completed},
					{name:$rootScope.i18n.reports.canceledLbl, y:allReportsTotals.reunions.canceled, color: colors.reunions.canceled}
			];

			var onTimePie = getPieChartOptions();
			onTimePie.title.text = $rootScope.i18n.reportFinder.reportsLbl;
			onTimePie.series[0].data =  [
					{name:$rootScope.i18n.reports.onTimeLbl, y:allReportsTotals.reports.onTime, color: colors.reports.ontime},
					/* Rejected reports are not checked for "onTime", so we take them out */
					{name:$rootScope.i18n.reports.notOnTimeLbl, y:allReportsTotals.reports.notOnTime, color: colors.reports.due}
			];

			var reunionsChart = {
				//chart: attendanceChart,
				title: { text: $rootScope.i18n.charts.reportsLbl }, legend: { reversed: true }, credits: { enabled: false },
				xAxis: { categories: categories },
				yAxis: {
					min:0, title: { text: $rootScope.i18n.charts.reportsAndReunionsTitle },
					stackLabels: { enabled: true,
						style: { fontWeight: 'bold', color: (Highcharts.theme && Highcharts.theme.textColor) || 'gray' }
					}, plotLines: []
				},
				plotOptions: { column: {stacking: 'normal'} },
				series: [
					{ type: 'column', stack:'reunion', data: completedSeries, name: $rootScope.i18n.reports.completedLbl, color: colors.reunions.completed },
					{ type: 'column', stack:'reunion', data: canceledSeries, name: $rootScope.i18n.reports.canceledLbl, color: colors.reunions.canceled },
					{ type: 'column', stack:'reports', data: approvedSeries, name: $rootScope.i18n.reports.approvedLbl, color: colors.reports.approved},
					{ type: 'column', stack:'reports', data: pendingSeries, name: $rootScope.i18n.reports.pendingLbl, color: colors.reports.pending},
					{ type: 'column', stack:'reports', data: rejectedSeries, name: $rootScope.i18n.reports.rejectedLbl, color: colors.reports.rejected},
					{ type: 'spline', data: dueReportSeries, name: $rootScope.i18n.reports.notOnTimeLbl, color: colors.reports.due, lineWidth:4, label:{enabled:false} },
					{ type: 'spline', data: onTimeReportSeries , name: $rootScope.i18n.reports.onTimeLbl, color: colors.reports.ontime, lineWidth:4, label:{enabled:false} }
				]
			};

			var durationByGroupOptions = {
					//chart: areaCharts,
					title: { text: '' },credits: { enabled: false },
					xAxis: { categories: categories },
					yAxis: [{ min:0, title: { text: $rootScope.i18n.charts.durationTitle},
									stackLabels: { enabled: true, style: { fontWeight: 'bold', color: (Highcharts.theme && Highcharts.theme.textColor) || 'gray' }}
									},
									{ min:0, title: { text: $rootScope.i18n.charts.avgTitle}, opposite:true,
										stackLabels: { enabled: true, style: { fontWeight: 'bold', color: (Highcharts.theme && Highcharts.theme.textColor) || 'gray' }}
									}],
					legend: { reversed: true },
					series: [ { type: 'column', name: $rootScope.i18n.charts.durationLbl, data: durationSeries, color: colors.reunions.duration },
					 					{ type: 'spline', name: $rootScope.i18n.charts.durationAvgReunionLbl, data: durationAvgReunionSeries, color: colors.reunions.durationAvgR, lineWidth:4, label:{enabled:false},yAxis: 1 },
					 					{ type: 'spline', name: $rootScope.i18n.charts.durationAvgAttnLbl, data: durationAvgAttnSeries, color: colors.reunions.durationAvgA, lineWidth:4, label:{enabled:false}, yAxis: 1 }
									]
			};

			var moneyByGroupOptions = {
					//chart: areaCharts,
					title: { text: '' },credits: { enabled: false },
					xAxis: { categories: categories },
					yAxis: [{ min:0, title: { text: $rootScope.i18n.charts.moneyTitle },
									stackLabels: { enabled: true, style: { fontWeight: 'bold', color: (Highcharts.theme && Highcharts.theme.textColor) || 'gray' } }
								},
								{ min:0, title: { text: $rootScope.i18n.charts.avgTitle}, opposite:true,
									stackLabels: { enabled: true, style: { fontWeight: 'bold', color: (Highcharts.theme && Highcharts.theme.textColor) || 'gray' }}
								}],
					legend: { reversed: true },
					series: [ { type:'column', name: $rootScope.i18n.charts.moneyTitle , data: moneySeries, color: colors.reunions.money},
										{ type:'spline', name: $rootScope.i18n.charts.moneyAvgReunionTitle , data: moneyAvgReunionSeries, color: colors.reunions.moneyAvgR, lineWidth:4, label:{enabled:false}, yAxis: 1},
										{ type:'spline', name: $rootScope.i18n.charts.moneyAvgAttnTitle , data: moneyAvgAttnSeries, color: colors.reunions.moneyAvgA, lineWidth:4, label:{enabled:false}, yAxis: 1}
									]
			};

			//Adjust some properties according to the Chart Orientation
			if(chartOrientation == 'landscape'){
				attendanceChart.chart =  { type: 'column', height:600};
				attendanceChart.yAxis.opposite =  false;

				reunionsChart.chart =  { type: 'column', height:600};
				reunionsChart.yAxis.opposite =  false;

				durationByGroupOptions.chart = { type: 'column', inverted: false, height:600 };
				durationByGroupOptions.yAxis.opposite =  false;

				moneyByGroupOptions.chart = { inverted: false, height:600 };
				moneyByGroupOptions.yAxis.opposite =  false;

				if(categories.length > 5){
					attendanceChart.xAxis.labels =  {rotation: -90};
					reunionsChart.xAxis.labels =  {rotation: -90};
					durationByGroupOptions.xAxis.labels =  {rotation: -90};
					moneyByGroupOptions.xAxis.labels =  {rotation: -90};
				}
			}else{
				//portrait
				attendanceChart.chart =  { type: 'bar', height: (300+(series*15)) };
				attendanceChart.yAxis.opposite =  true;
				attendanceChart.xAxis.labels =  {rotation: 0};

				durationByGroupOptions.chart = { type: 'bar', inverted: true, height: (300+(series*20)) };
				durationByGroupOptions.yAxis.opposite =  true;
				durationByGroupOptions.xAxis.labels =  {rotation: 0};

				moneyByGroupOptions.chart = { type: 'bar', inverted: true, height: (300+(series*20)) };
				moneyByGroupOptions.yAxis.opposite =  true;
				durationByGroupOptions.xAxis.labels =  {rotation: 0};
			}

			//Paint Charts
			Highcharts.chart('attendanceChartContainer', attendanceChart);
			Highcharts.chart('sexPieContainer', sexPie);
			Highcharts.chart('attTypePieContainer', attnPie);
			Highcharts.chart('reportsPieContainer', reportsPie);
			Highcharts.chart('onTimePieContainer', onTimePie);
			Highcharts.chart('reunionsPieContainer', reunionsPie);
			Highcharts.chart('reunionsChartContainer', reunionsChart);
			Highcharts.chart('durationContainer', durationByGroupOptions);
			if($rootScope.config.reports.showMoneyField){
				Highcharts.chart('moneyContainer', moneyByGroupOptions);
			}
		};

		getPieChartOptions = function(){
			return {
					chart: { type: 'pie', plotBackgroundColor: null, plotBorderWidth: 0, plotShadow: false },
					title: { text: ''},
					credits: { enabled: false },
					tooltip: {  pointFormat: '<b>{point.y} ({point.percentage:.1f}%)</b>' },
					plotOptions: {
							pie: {
								dataLabels: { enabled: false },
								showInLegend: true
							}
					},
					series: [{type: 'pie', innerSize: '20%', name:''}]
			};
		};

		/* Used for the Reports Table Sort, when clicking on the column header */
		$scope.chageSort = function(sortByProperty) {
			if($scope.sortBy == sortByProperty){
				//When clicking in the same porperty, invert sort order
				$scope.descSort = !$scope.descSort;
			}else{
				//start new sort always in asc order
				$scope.descSort = false;
				$scope.sortBy = sortByProperty;
			}
		};

		$scope.selectAllGroups = function (){
			$scope.selectedGroups = [];
			$scope.groupsList.$loaded().then(function(groups){
				//To preselect all the groups in the view
				groups.forEach(function(group){
					$scope.selectedGroups.push(group.$id);
				});
			});
		};

		$scope.selectAllWeeks = function (){
			$scope.selectedWeeks = [];
			$scope.weeksList.$loaded().then(function(weeks){
				//To preselect all the weeks in the view
				weeks.forEach(function(week){
					$scope.selectedWeeks.push(week.$id);
				});
			});
		};

		/* Called only from the Admin Report Finder.
		Refresh the list of weeks displayed. */
		$scope.updateWeekSelectList = function (){
			$scope.selectedWeeks = [];
			switch($rootScope.reportFinder.weekStatusOpt){
				case "all":
					$scope.weeksList = WeeksSvc.getAllWeeks();
					break;
				case "open":
					$scope.weeksList = WeeksSvc.getOpenWeeks();
					break;
				case "closed":
					$scope.weeksList = WeeksSvc.getClosedWeeks();
					break;
				case "visible":
					$scope.weeksList = WeeksSvc.getVisibleWeeks();
					break;
				case "hidden":
					$scope.weeksList = WeeksSvc.getHiddenWeeks();
					break;
			}
		};

		/* Called only from the Admin Report Finder.
		Refresh the list of groups displayed, based on the selected Group status
		(active/inacetive), and clear the selectedGroups array. Updating by the status
		has an impact in the groupType filter, so we need to reset. */
		$scope.updateGroupListByStatus = function (){
			$scope.selectedGroups = [];
			$scope.groupsList = getGroupsFromDatabase($rootScope.reportFinder.groupStatusOpt);
			$rootScope.reportFinder.groupTypeOpt = undefined;
			$rootScope.reportFinder.currentGroupListFiltered = false;
		};

		/* The Group type select depends on the Group status select.
		This method makes sure the $scope.groupsList has data from db for active,
		inactive or both statuses, and then proceeds to filter groups from that list
		based on the "type" value.*/
		$scope.updateGroupListByType = function (){
			let tempGroupList = new Array();
			if($rootScope.reportFinder.currentGroupListFiltered){
				//This means an original list from DB was filtered by this same method before,
				//so we need to get a fresh list from DB to avoid missing groups
				$scope.groupsList = getGroupsFromDatabase($rootScope.reportFinder.groupStatusOpt);
			}
			//Use the Current $scope.groupsList with DB data to filter results by the selected group type
			$scope.groupsList.$loaded().then(function(list) {
				if($rootScope.reportFinder.groupTypeOpt){
					list.forEach(function(group) {
						if(group.type == $rootScope.reportFinder.groupTypeOpt){
							tempGroupList.push(group);
						}
					});
					$scope.groupsList = tempGroupList;
					$rootScope.reportFinder.currentGroupListFiltered = true;
				}
			});
		};

		function getGroupsFromDatabase(groupStatus){
			//console.debug("Gettint groups from DB:",groupStatus);
			let groupsList;
			switch(groupStatus){
				case "all":
					groupsList = GroupsSvc.getAllGroups();
					break;
				case "active":
					groupsList = GroupsSvc.getActiveGroups();
					break;
				case "inactive":
					groupsList = GroupsSvc.getInactiveGroups();
					break;
			}
			return groupsList;
		};

		/* Detect when changes happen to reports in the User's selected week period
		notifyReportAdded = function(event){
			// let reportId = event.key;
			// ReportsSvc.getReportBasicObj(reportId).$loaded().then(function(report){
			// 	if($scope.selectedGroupsMap.has(report.groupId) && $scope.selectedWeeksMap.has(report.weekId)){
			// 		$scope.response = {error:true, message: systemMsgs.error.reportsWatch};
			// 	}
			// });
		};*/
}]);

/* Controller linked to /mystatistics
 * It will load the lists (weeks, groups, member rules) required for the view to work */
okulusApp.controller('UserStatisticsCntrl',
	['$location', '$rootScope','$scope','$firebaseAuth', 'MembersSvc', 'GroupsSvc', 'WeeksSvc', 'AuthenticationSvc',
	function($location, $rootScope,$scope,$firebaseAuth, MembersSvc, GroupsSvc, WeeksSvc, AuthenticationSvc){

		$scope.response = {loading:true, message:systemMsgs.inProgress.loadingAdminDash};
		$firebaseAuth().$onAuthStateChanged( function(authUser){if(authUser){
			AuthenticationSvc.loadSessionData(authUser.uid).$loaded().then(function (user) {
				if(!user.memberId){
					$rootScope.response = { error:true, message: systemMsgs.error.noMemberAssociated};
					$location.path(constants.pages.error);
					return;
				}

				$scope.selectedWeeks = [];
				$scope.selectedGroups = [];

				//Show only weeks allowed for report finder (Visible Weeks)
				$scope.weeksList = WeeksSvc.getVisibleWeeks();
				$scope.weeksList.$loaded().then(function(weeks){
					//To preselect the latest week in the view
					$scope.selectedWeeks.push(weeks.$keyAt(weeks.length-1));
				});
				//Show only groups the user have access to
				$scope.groupsList = [];
				$rootScope.currentSession.accessRules = MembersSvc.getMemberAccessRules(user.memberId);
				$rootScope.currentSession.accessRules.$loaded().then(function(rules){
					rules.forEach(function(rule){
						$scope.groupsList.push(GroupsSvc.getGroupBasicDataObject(rule.groupId));
						$scope.selectedGroups.push(rule.groupId);
					});
					$scope.response = null;
				});
			});
		}});
	}
]);

//Mapping: /admin/statistics
//Load all the elements for the Admin statistics and Admin Report Finder
okulusApp.controller('AdminStatisticsCntrl',
	['$rootScope','$scope','$location','$firebaseAuth',
		'WeeksSvc','GroupsSvc','AuthenticationSvc','ConfigSvc',
	function($rootScope, $scope, $location, $firebaseAuth,
		WeeksSvc, GroupsSvc, AuthenticationSvc, ConfigSvc){

		$scope.response = {loading:true, message:systemMsgs.inProgress.loadingReportFinder};
		$firebaseAuth().$onAuthStateChanged( function(authUser){ if(authUser){
			AuthenticationSvc.loadSessionData(authUser.uid).$loaded().then(function(user) {
				if(user.type == constants.roles.user){
					$rootScope.response = {error:true, showHomeButton: true, message:systemMsgs.error.noPrivileges};
					$location.path(constants.pages.error);
				}else{
					console.debug("AdminStatisticsCntrl");
					//Pre-defined values for the view
					$scope.adminViewActive = true;
					$scope.selectedWeeks = [];
					$scope.selectedGroups = [];

					//Initially, Display Visible Weeks only
					$rootScope.reportFinder.weekStatusOpt = 'visible';
					$scope.weeksList = WeeksSvc.getVisibleWeeks();
					//Preselect all weeks in the view
					$scope.weeksList.$loaded().then(function(weeks){
						weeks.forEach(function(week){
							$scope.selectedWeeks.push(week.$id);
						});
					});

					//Initially, All Groups are visilbe to the Admin
					$scope.groupsList = GroupsSvc.getAllGroups();
					//To preselect all the groups in the view
					$scope.groupsList.$loaded().then(function(groups){
						groups.forEach(function(group){
							$scope.selectedGroups.push(group.$id);
						});
						$scope.response = null;
					});

					$scope.grouptypesList = ConfigSvc.getGroupTypesArray();
				}
			});
		}});

}]);
