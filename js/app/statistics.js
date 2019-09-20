/* Linked directly to the statistics.html (for user and admin), to control the
 creation of charts and tables based on the Reports found */
okulusApp.controller('StatisticsCntrl',
	['$rootScope','$scope', 'WeeksSvc','ReportsSvc','GroupsSvc','MembersSvc',
	function ($rootScope, $scope, WeeksSvc, ReportsSvc, GroupsSvc,MembersSvc) {
		//Default chart Orientation (portrait or landscape)
		$scope.chartOrientation = 'landscape';
		//This will save the unflitered result from the report Finder
		$scope.rawReportsFound = undefined;
		$rootScope.reportFinder = {weekStatusOpt:'all', groupStatusOpt: 'all'};
		/* Method to retrieve reports form database and build the detailed Dashboard.
		We create separate DB calls (one per selected week) to fetch the reports. This
		is because the selected weeks might not be in sequence. Later, a Map with the
		selected groups is used to filter out irrelevant reports, and build the Dashboard elements. */
		$scope.buildReportsDashboard = function(){
			$scope.response = {loading:true, message:systemMsgs.inProgress.searchingReports};
			/* Get reports for each selected week, using promises to wait for the data */
			let selectedWeeksMap = new Map();
			let weekReportsPromises = [];
			$scope.selectedWeeks.forEach(function(weekId){
				selectedWeeksMap.set(weekId,weekId);
				weekReportsPromises.push( ReportsSvc.getReportsForWeek(weekId).$loaded() );
			});
			console.debug("Promises created:", weekReportsPromises);

			/* Copy the selected group Ids to a Map. This will be used to filter out reports */
			let selectedGroupsMap = new Map();
			$scope.selectedGroups.forEach( function(groupId){ selectedGroupsMap.set(groupId,groupId); });

			/* A "Promise.all" will return an array with the result of each promise,
			in this case the list of reports for each selected week. We'll Use the data from the
			promises to: 1) Filter-in only the reports for the selected groups, 2)Create a Watch
			function for each week to detect real time DB updates, and 3) Build the charts. */
			Promise.all(weekReportsPromises).then(function(reportsPerWeekArray){
				$scope.$apply(function(){
				console.debug("Promises fulfilled. Starting to filter reports");
				let filteredReports = $scope.filterReports(reportsPerWeekArray, selectedGroupsMap);

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

				$scope.response = null;
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
				// //Proceed to build the Table and Charts
				$scope.sortBy = 'reviewStatus';
				$scope.descSort = false;

				console.debug("Reunion Summary:", $scope.reunionSummary);
				console.debug("Reports to Display:", $scope.reportsToDisplay);
				console.debug("Details Map:", $scope.detailsMap);
				$scope.buildCharts($scope.reunionSummary, $scope.detailsMap, $scope.chartOrientation);
				console.debug("Charts built");
				});
				window.scrollBy(0, $( "#reportFinder" ).height());
			});
		};

		/* Method to filter-in the reports belonging only to groups selected by the user
		reportsPerWeekArray: An array containing $firebaseArray objects for each user's selected weeks
		selectedGroups: Array with the Ids of the User's selected groups. It will be used to filter the reports */
		$scope.filterReports = function(reportsPerWeekArray, selectedGroups){
			/* For each report fetched from DB, confirm if it is a valid one and add it to
			the reportsToDisplay list. A report is valid when its groupId	exists in the
			user's selection (selectedGroups).
			Use Data from each report to update the totals in reunionParams.
			The detailsMap will be used, later on, as the Chart's categories and series */
			let reportsToDisplay = [];
			let detailsMap = new Map();
			let reunionParams = {
				totalReports:0, approvedReports: 0, rejectedReports: 0, pendingReports: 0,
				completedReunions: 0, canceledReunions: 0, totalReunions: 0,
				totalAttendance: 0, membersAttendance: 0, guestsAttendance:0,
				totalMoney: 0.00, totalDuration:0
			};

			/* Each element of reportsPerWeekArray is a $firebaseArray, that needs to be
			$loaded first, so we can iterate over each report for that week, and get the
			required data to build the dashboard. */
			reportsPerWeekArray.forEach(function(reportsOfOneWeek, index){
				// console.debug("filtering reports of week:" + index, reportsOfOneWeek);
				reportsOfOneWeek.forEach(function(report, index){
					/*Discard reports with groupId not in the User's selection*/
					if( !selectedGroups.has(report.groupId) ){
						return;
					}

					reportsToDisplay.push(report);
					reunionParams.totalReports++;
					/* Update counters */
					if(report.reviewStatus == constants.status.approved){
						reunionParams.approvedReports++;
					} else if(report.reviewStatus == constants.status.pending){
						reunionParams.pendingReports++;
					} else if(report.reviewStatus == constants.status.rejected){
						reunionParams.rejectedReports++;
						/* Data from Rejected Reports will not be considered because it will
						introduce irrelevant or incorrect values to the totals */
						return;
					}

					if(report.status == constants.status.completed){
						reunionParams.completedReunions++;
					}else if(report.status == constants.status.canceled){
						reunionParams.canceledReunions++;
					}
					reunionParams.totalReunions++;
					//Update total attendance (summary), duration and money
					reunionParams.totalAttendance += report.totalAttendance;
					reunionParams.membersAttendance += report.membersAttendance;
					reunionParams.guestsAttendance += report.guestsAttendance;
					reunionParams.totalDuration += report.duration;
					if(report.money){
						reunionParams.totalMoney += (parseFloat(report.money));
					}

					/* Save everyting in the detailsMap, that will be used to paint the charts */
					let mapKey = undefined;
					let mapElement = undefined;
					if(selectedGroups.size == 1){
						/* When 1 group was selected, the weekId will be the key in the Map */
						let str = report.weekId;
						let formattedWeekId = str.substring(0,4)+"-"+str.substring(4);
						mapKey = formattedWeekId;
					}
					else if(selectedGroups.size > 1){
						/* When selecting more than one group, we'll use the Group Names the key */
						mapKey = report.groupname;
					}

					if(detailsMap.has(mapKey)){
						/* The map might already have the key because of:
						1. When the mapKey is the week: There are more than one report for the same week and group combination.
						2. When the mapKeyis the groupname: There are more than one report for the group (not necessarily for the same week)
						In this case, we accumulate the values.*/
						mapElement = detailsMap.get(mapKey);
						mapElement.guests += report.guestsAttendance;
						mapElement.members += report.membersAttendance;
						mapElement.duration += report.duration;
						mapElement.reportsCount ++;
						if(report.money){
							mapElement.money += report.money;
						}
					}else{
						/* Create a new Key, value */
						report.money = (report.money)?report.money:0.00;
						mapElement = {guests:report.guestsAttendance, members:report.membersAttendance,
													 duration:report.duration, money:report.money, reportsCount:1};
					}

					detailsMap.set(mapKey,mapElement);

					//For Money Scatter Charts
					//moneyData.push( [report.money, guests+members] );

				});
			});

			//For the Summary Cards
			$scope.reunionSummary = reunionParams;
			//For the Reports table
			$scope.reportsToDisplay = reportsToDisplay;
			//Build the Charts
			$scope.detailsMap = detailsMap;
			return reportsToDisplay;
		};

		/* Build Highcharts elements, using categoriesDataMap and reunionParams objects
		constructed during the Report filtering process.
		- categoriesDataMap contains totals for each category.
			ex. Map = [{ key: "San Antonio", value: { guests: 5, members: 12, money: 195.4, duration: 339 }, ... ]
		- reunionSummary contains totals for all the reports in all categories. Used in then sumary table too.
		*/
		$scope.buildCharts = function(reunionSummary, categoriesDataMap, chartOrientation){

			/* Use the categoriesDataMap to build Data Series */
			let categories = [];
			let guestsSeries = [];
			let membersSeries = [];
			let moneySeries = [];
			let moneyAvgSeries = [];
			let durationSeries = [];
			let series = 0;
			categoriesDataMap.forEach(function(reunionTotals, key){
				categories.push(key);
				guestsSeries.push(reunionTotals.guests);
				membersSeries.push(reunionTotals.members);
				moneySeries.push(reunionTotals.money);
				moneyAvgSeries.push( (reunionTotals.money/(reunionTotals.guests+reunionTotals.members)) );
				durationSeries.push(reunionTotals.duration);
				series++;
			});

			//Build Chart Config Objects
			var attendanceByGroupOptions = {
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
						{ value: reunionSummary.goodAttendanceIndicator, zIndex: 3,
							color: 'red', width: 2, dashStyle: 'dash',
							label: {text: '', align:'center', style:{color: 'gray'}}
						},
						//lines for excelent attendance indicator
						{ value: reunionSummary.excelentAttendanceIndicator, zIndex: 3,
							color: 'green', width: 2, dashStyle: 'dash',
							label: {text: '', align:'center', style:{color: 'gray'}}
						}
					]
				},
				plotOptions: { series: {stacking: 'normal'} },
				series: [
					{ name: $rootScope.i18n.charts.attendanceGuestsSerie, color: 'rgba(40,167,69,.8)', data: guestsSeries },
					{ name: $rootScope.i18n.charts.attendanceMemberstSerie, color: 'rgba(0,123,255,.8)', data: membersSeries }
				]
			};
			var attendancePieOptions = {
					chart: { type: 'pie', plotBackgroundColor: null, plotBorderWidth: 0, plotShadow: false },
					title: { text: $rootScope.i18n.charts.attendanceLbl}, credits: { enabled: false },
					tooltip: {  pointFormat: '{series.name}: <b>{point.y} ({point.percentage:.1f}%)</b>' },
					plotOptions: {
							pie: {
								dataLabels: { enabled: false },
								showInLegend: true, colors: ['rgba(0,123,255,.8)','rgba(40,167,69,.8)']
							}
					},
					series: [{
							type: 'pie', name: $rootScope.i18n.charts.attendanceLbl,
							innerSize: '20%',
							data: [
									[$rootScope.i18n.charts.attendanceMemberstSerie, reunionSummary.membersAttendance],
									[$rootScope.i18n.charts.attendanceGuestsSerie, reunionSummary.guestsAttendance]
							]
					}]
			};
			var reunionsPieOptions = {
					chart: { type: 'pie', plotBackgroundColor: null, plotBorderWidth: 0, plotShadow: false },
					title: { text: $rootScope.i18n.charts.reunionsLbl}, credits: { enabled: false },
					tooltip: {  pointFormat: '{series.name}: <b>{point.y} ({point.percentage:.1f}%)</b>' },
					plotOptions: {
							pie: {
								dataLabels: { enabled: false },
								showInLegend: true, colors: ['rgba(40,167,69,.8)','#dc3545']
							}
					},
					series: [{
							type: 'pie', name: $rootScope.i18n.charts.reunionsLbl,
							innerSize: '20%',
							data: [
									[$rootScope.i18n.charts.completedLbl, reunionSummary.completedReunions],
									[$rootScope.i18n.charts.canceledLbl, reunionSummary.canceledReunions]
							]
					}]
			};
			var durationByGroupOptions = {
					//chart: areaCharts,
					title: { text: '' },credits: { enabled: false },
					xAxis: { categories: categories },
					yAxis: { min:0, title: { text: $rootScope.i18n.charts.durationTitle},
									stackLabels: { enabled: true,
											style: { fontWeight: 'bold', color: (Highcharts.theme && Highcharts.theme.textColor) || 'gray' }
									}
								},
					legend: { reversed: true },
					series: [ { name: $rootScope.i18n.charts.durationLbl, data: durationSeries } ]
			};
			var moneyByGroupOptions = {
					//chart: areaCharts,
					credits: { enabled: false },
					title: { text: '' },
					xAxis: { categories: categories },
					yAxis: { min:0, title: { text: $rootScope.i18n.charts.moneyTitle },
									stackLabels: { enabled: true,
											style: { fontWeight: 'bold', color: (Highcharts.theme && Highcharts.theme.textColor) || 'gray' }
									}
								},
					legend: { reversed: true },
					series: [ { type:'column', name: $rootScope.i18n.charts.moneyTitle , data: moneySeries},
										{ type:'line', name: $rootScope.i18n.charts.moneyAvgTitle , data: moneyAvgSeries, label:{enabled:false} } ]
			};

			//adjust some char config according to the Chart Orientation
			if( chartOrientation == 'landscape'){
				attendanceByGroupOptions.chart =  { type: 'column', height:600};
				attendanceByGroupOptions.yAxis.opposite =  false;
				attendanceByGroupOptions.xAxis.labels =  {rotation: -90};

				durationByGroupOptions.chart = { type: 'column', inverted: false, height:600 };
				durationByGroupOptions.yAxis.opposite =  false;
				durationByGroupOptions.xAxis.labels =  {rotation: -90};

				moneyByGroupOptions.chart = { inverted: false, height:600 };
				moneyByGroupOptions.yAxis.opposite =  false;
				moneyByGroupOptions.xAxis.labels =  {rotation: -90};
			}else{
				//portrait
				attendanceByGroupOptions.chart =  { type: 'bar', height: (300+(series*15)) };
				attendanceByGroupOptions.yAxis.opposite =  true;
				attendanceByGroupOptions.xAxis.labels =  {rotation: 0};

				durationByGroupOptions.chart = { type: 'bar', inverted: true, height: (300+(series*20)) };
				durationByGroupOptions.yAxis.opposite =  true;
				durationByGroupOptions.xAxis.labels =  {rotation: 0};

				moneyByGroupOptions.chart = { inverted: true, height: (300+(series*20)) };
				moneyByGroupOptions.yAxis.opposite =  true;
				durationByGroupOptions.xAxis.labels =  {rotation: 0};
			}

			//Paint Charts
			Highcharts.chart('attendanceByGroupContainer', attendanceByGroupOptions);
			Highcharts.chart('attendancePieContainer', attendancePieOptions);
			Highcharts.chart('reunionsPieContainer', reunionsPieOptions);
			Highcharts.chart('durationContainer', durationByGroupOptions);
			if($rootScope.config.reports.showMoneyField){
				Highcharts.chart('moneyContainer', moneyByGroupOptions);
			}

			console.debug("categories:",categories);
			console.debug("guestsSeries:",guestsSeries);
			console.debug("membersSeries:",membersSeries);
			console.debug("moneySeries:",moneySeries);
			console.debug("durationSeries:",durationSeries);
		};

		/**/
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

		$scope.selectAllGroups = function() {
			selectObj = document.getElementById("specificGroupSelect");
			let allgroups = [];
			for(var i = 0; i < selectObj.length; i++) {
				allgroups.push(selectObj.options[i].value);
			}
			$scope.specificGroups = allgroups;
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

		$scope.updateGroupSelectList = function (){
			//console.debug($rootScope.reportFinder.groupStatusOpt);
			$scope.groupsList = getGroupsFromDatabase($rootScope.reportFinder.groupStatusOpt);
			$scope.selectedGroups = [];
			//Reset the Group type
			$rootScope.reportFinder.groupTypeOpt="";
			$rootScope.reportFinder.currentGroupListFiltered = false;
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

		/* The Group type select depends on the Group status select.
		This method makes sure the $scope.groupsList has data from db for active,
		inactive or both statuses, and then proceeds to filter groups from that list
		based on the "type" value.*/
		$scope.updateGroupTypeSelect = function (){
			let tempGroupList = new Array();
			if($rootScope.reportFinder.currentGroupListFiltered){
				//This menas an original list from DB was filtered by this same method before,
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
