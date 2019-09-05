//Mapping: /reports
okulusApp.controller('ReportsListCntrl',
	['$rootScope','$scope','$firebaseAuth','$location','ReportsSvc','GroupsSvc','AuthenticationSvc',
	function($rootScope,$scope,$firebaseAuth,$location,ReportsSvc,GroupsSvc,AuthenticationSvc){

		let unwatch = undefined;
		/* Executed everytime we enter to /groups
		  This function is used to confirm the user is Admin */
		$scope.response = {loading: true, message: systemMsgs.inProgress.loading };
		$firebaseAuth().$onAuthStateChanged(function(authUser){ if(authUser){
			AuthenticationSvc.loadSessionData(authUser.uid).$loaded().then( function(user){
				if(user.type == constants.roles.user){
					$rootScope.response = {error:true, showHomeButton: true, message:systemMsgs.error.noPrivileges};
					$location.path(constants.pages.error);
				}else{
					/* Get All Groups List, because Admin has access to all of them.
					This is useful for the groupSelectModal triggered from Create Report Button*/
					$rootScope.currentSession.accessGroups = GroupsSvc.getAllGroups();
					/*Load Report Counters and Set Watch*/
					$rootScope.reportsGlobalCount = ReportsSvc.getGlobalReportsCounter();
					$rootScope.reportsGlobalCount.$loaded().then(
						function(reportsCount) {
							$scope.response = undefined;
							/* Adding a Watch to the reportsGlobalCount to detect changes.
							The idea is to update the maxPossible value from adminReportsParams.*/
							if(unwatch){ unwatch(); }
							unwatch = $rootScope.reportsGlobalCount.$watch( function(data){
								if($rootScope.adminReportsParams){
									let loader = $rootScope.adminReportsParams.activeLoader;
									$rootScope.adminReportsParams = getParamsByLoader(loader);
									$scope.response = undefined;
								}
							});
					});
				}
			});
		}});

		/* All the following on-demand loaders (called from html view) will limit the
		 initial result list to the maxQueryListResults value (from $rootScope.config).
		 They will create a params object containing the name of the loader used,
		 and determining the max possible records to display. */
		$scope.loadAllReportsList = function () {
			$scope.response = {loading:true, message:systemMsgs.inProgress.loadingAllReports};
			$rootScope.adminReportsParams = getParamsByLoader("AllReportsLoader");
			$rootScope.adminReportsList = ReportsSvc.getAllReports();
			whenReportsRetrieved();
		};

		$scope.loadApprovedReportsList = function () {
 			$scope.response = {loading:true, message:systemMsgs.inProgress.loadingApprovedReports};
 			$rootScope.adminReportsParams = getParamsByLoader("ApprovedReportsLoader");
 			$rootScope.adminReportsList = ReportsSvc.getApprovedReports($rootScope.config.maxQueryListResults);
 			whenReportsRetrieved();
		};

		$scope.loadRejectedReportsList = function () {
 			$scope.response = {loading:true, message:systemMsgs.inProgress.loadingRejectedReports};
 			$rootScope.adminReportsParams = getParamsByLoader("RejectedReportsLoader");
 			$rootScope.adminReportsList = ReportsSvc.getRejectedReports($rootScope.config.maxQueryListResults);
 			whenReportsRetrieved();
		};

		$scope.loadPendingReportsList = function () {
 			$scope.response = {loading:true, message:systemMsgs.inProgress.loadingPendingReports};
 			$rootScope.adminReportsParams = getParamsByLoader("PendingReportsLoader");
 			$rootScope.adminReportsList = ReportsSvc.getPendingReports($rootScope.config.maxQueryListResults);
 			whenReportsRetrieved();
		};

		/* Load ALL pending reports. Use the adminReportsParams.activeLoader
		to determine what type of reports should be loaded, and how. */
		$scope.loadPendingReports = function () {
			let loaderName = $rootScope.adminReportsParams.activeLoader;
			$scope.response = {loading: true, message: systemMsgs.inProgress.loading };
			if(loaderName=="AllReportsLoader"){
				$rootScope.adminReportsList = ReportsSvc.getAllReports();
			} else if(loaderName=="ApprovedReportsLoader"){
				$rootScope.adminReportsList = ReportsSvc.getApprovedReports();
			} else if(loaderName=="RejectedReportsLoader"){
				$rootScope.adminReportsList = ReportsSvc.getRejectedReports();
			} else if(loaderName=="PendingReportsLoader"){
				$rootScope.adminReportsList = ReportsSvc.getPendingReports();
			}
			whenReportsRetrieved();
		};

		/*Build object with Params used in the view.
		 activeLoader: Will help to identify what type of reports we want to load.
		 searchFilter: Container for the view filter
		 title: Title of the Reports List will change according to the loader in use
		 maxPossible: Used to inform the user how many elements are pending to load */
		getParamsByLoader = function (loaderName) {
			let params = {activeLoader:loaderName, searchFilter:undefined};
			if(loaderName == "AllReportsLoader"){
				params.title= systemMsgs.success.allReportsTitle;
				params.maxPossible = $rootScope.reportsGlobalCount.total;
			}
			else if(loaderName == "ApprovedReportsLoader"){
				params.title= systemMsgs.success.approvedReportsTitle;
				params.maxPossible = $rootScope.reportsGlobalCount.approved;
			}
			else if(loaderName == "RejectedReportsLoader"){
				params.title= systemMsgs.success.rejectedReportsTitle;
				params.maxPossible = $rootScope.reportsGlobalCount.rejected;
			}
			else if(loaderName == "PendingReportsLoader"){
				params.title= systemMsgs.success.pendingReportsTitle;
				params.maxPossible = $rootScope.reportsGlobalCount.pending;
			}
			return params;
		};

		/*Prepares the response after the reports list is loaded */
		whenReportsRetrieved = function () {
			$rootScope.adminReportsList.$loaded().then(function(reports) {
				$scope.response = undefined;
				$rootScope.reportResponse = null;
				if(!reports.length){
					$scope.response = { error: true, message: systemMsgs.error.noReportsError };
				}
			}).catch( function(error){
				$scope.response = { error: true, message: systemMsgs.error.loadingReportsError };
				console.error(error);
			});
		};

	}
]);

okulusApp.controller('MyReportsCntrl',
	['$rootScope','$scope','$location','$firebaseAuth',
	'AuthenticationSvc','MembersSvc','ReportsSvc','GroupsSvc',
	function($rootScope,$scope,$location,$firebaseAuth,
	AuthenticationSvc,MembersSvc,ReportsSvc,GroupsSvc){

		/* Executed everytime we enter to /groups
		  This function is used to confirm the user is Admin */
		$scope.response = {loading: true, message: systemMsgs.inProgress.loading };
		$firebaseAuth().$onAuthStateChanged(function(authUser){ if(authUser){
			AuthenticationSvc.loadSessionData(authUser.uid).$loaded().then(function(user){
				if(!user.memberId){
					$rootScope.response = {error: true, message: systemMsgs.error.noMemberAssociated};
					$location.path(constants.pages.error);
					return;
				}

				/* Get Access Rules for a valid existing user, and use them to load the groups
				it has access to. This is useful for the groupSelectModal triggered from Quick Actions*/
				$rootScope.currentSession.accessGroups = [];
				$rootScope.currentSession.accessRules = MembersSvc.getMemberAccessRules(user.memberId);
				$rootScope.currentSession.accessRules.$loaded().then(function(rules){
					rules.forEach(function(rule){
						$rootScope.currentSession.accessGroups.push(GroupsSvc.getGroupBasicDataObject(rule.groupId));
					});
				});

				/*Pre-load all the User's Reports*/
				$scope.myReportsList = ReportsSvc.getReportsCreatedByUser(user.$id);
				$scope.myReportsList.$loaded().then(function(reports){
					$scope.filteredReportsList = reports;
					$scope.response = undefined;
				});
			});

		}});

		$scope.filterReportsByStatus = function(status){
			$scope.myReportsList.$loaded().then(function(reportsList){
				$scope.filteredReportsList = new Array();
				if(!status){
					$scope.filteredReportsList = $scope.myReportsList;
				}
				reportsList.forEach(function(report){
					if(report.reviewStatus == status){
						$scope.filteredReportsList.push(report);
					}
				});
			});
		};

	}
]);

//Controls the reportsFinder and reportsDashboard
okulusApp.controller('ReportsDashCntrl',
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
			console.debug($rootScope.reportFinder.weekStatusOpt);
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

/* Controller linked to '/reports/new/:groupId' /reports/view/:reportId and /reports/edit/:reportId
 * It will load the Report for the id passed */
okulusApp.controller('ReportDetailsCntrl',
['$rootScope','$scope','$routeParams', '$location','$firebaseAuth',
 'ReportsSvc', 'GroupsSvc', 'WeeksSvc','MembersSvc','AuditSvc','AuthenticationSvc',
	function($rootScope, $scope, $routeParams, $location, $firebaseAuth,
		ReportsSvc, GroupsSvc, WeeksSvc, MembersSvc, AuditSvc, AuthenticationSvc){

		$firebaseAuth().$onAuthStateChanged(function(authUser){ if(authUser){
			$scope.response = {loading: true, message: systemMsgs.inProgress.loadingReport };
			$scope.objectDetails = {};
			AuthenticationSvc.loadSessionData(authUser.uid).$loaded().then(function (user) {
				/* Only Valid Users (with an associated MemberId) can see the content */
				if($rootScope.currentSession.user.type != constants.roles.root && !user.memberId){
					$rootScope.response = {error: true, message: systemMsgs.error.noMemberAssociated};
					$location.path(constants.pages.error);
					return;
				}

				let whichReport = $routeParams.reportId;
				let whichGroup = $routeParams.groupId;
				// console.debug(whichReport,whichGroup);

				/* When Group Id available, we are comming from /reports/new/:groupId */
				if(whichGroup){
					$scope.prepareViewForNew(whichGroup);
				}
				/* Prepare for Edit or View Details of Existing Report */
				else{
					$scope.prepareViewForEdit(whichReport);
				}
			});
		}});

		$scope.prepareViewForNew = function (whichGroup) {
			$scope.reportParams = { actionLbl: $rootScope.i18n.reports.newLbl,
															isEdit: false, reportId: undefined, dateObj: new Date() };
			//To Control list of available members for attendance
			$scope.reportParams.groupMembersList = new Array()
			// /reports/list
			$scope.objectDetails.basicInfo = { reviewStatus:null};
			// reports/details
			$scope.objectDetails.study = {};
			$scope.objectDetails.audit = undefined;
			$scope.objectDetails.attendance = { guests:[], members:[] };
			//Get the most recent (by Id) week, with Status Open
			WeeksSvc.getGreatestOpenWeekArray().$loaded().then(function(weekList) {
				if(weekList.length == 1){
					let week = weekList[0];
					$scope.objectDetails.basicInfo.weekId = week.$id;
					$scope.objectDetails.basicInfo.weekName = week.name;
				}
			});
			//Get Group Basic Object to Pre-populate some report fields
			GroupsSvc.getGroupBasicDataObject(whichGroup).$loaded().then(function(groupObj) {
				if(!groupObj.$value){
					$rootScope.response = { error: true, message: systemMsgs.error.inexistingGroup };
					$location.path(constants.pages.error);
					return;
				}
				else if(!groupObj.isActive){
					$rootScope.response = { error: true, message: systemMsgs.error.inactiveGroup };
					$location.path(constants.pages.error);
					return;
				}

				$scope.objectDetails.basicInfo.groupId = groupObj.$id;
				$scope.objectDetails.basicInfo.groupname = groupObj.name;
				$scope.objectDetails.basicInfo.status = constants.status.completed;

				return GroupsSvc.getGroupRolesObject(whichGroup).$loaded();
			}).then(function(groupRoles) {
				//Pre-populate roles
				if(groupRoles){
					if(groupRoles.leadId){
						$scope.objectDetails.basicInfo.leadId = groupRoles.leadId;
						$scope.objectDetails.basicInfo.leadName = groupRoles.leadName;
					}
					if(groupRoles.traineeId){
						$scope.objectDetails.basicInfo.traineeId = groupRoles.traineeId;
						$scope.objectDetails.basicInfo.traineeName = groupRoles.traineeName;
					}
					if(groupRoles.hostId){
						$scope.objectDetails.basicInfo.hostId = groupRoles.hostId;
						$scope.objectDetails.basicInfo.hostName = groupRoles.hostName;
					}
				}else{
					//To avoid problems when calling prepareMembersForAttendaceListSelect
					groupRoles = {};
				}
				prepareMembersForAttendaceListSelect(whichGroup, groupRoles);
				$scope.response = undefined;
			}).catch(function(error) {
				console.error(error);
				$rootScope.response = { error: true, message: error };
				$location.path(constants.pages.error);
			});
		};

		/* Create a one "normal" Array list to hold all the members (include inactive) with baseGroup = thisGroup
		 plus, the Group's Lead, Host, Trainee (because sometimes those roles have a different baseGroup)*/
		prepareMembersForAttendaceListSelect = function (whichGroup,roles) {

			if(roles.leadId){
				pushMemberToAttendanceSelectList({id:roles.leadId, name: roles.leadName})
			}
			if(roles.hostId){
				pushMemberToAttendanceSelectList({id:roles.hostId, name: roles.hostName})
			}
			if(roles.traineeId){
				pushMemberToAttendanceSelectList({id:roles.traineeId, name: roles.traineeName})
			}
			MembersSvc.getMembersForBaseGroup(whichGroup).$loaded().then(function(list){
				list.forEach(function(member){
					//Avoid duplicated Elements in Member attendance List (lead, host, and trainee where added previously)
					if(member.$id != undefined && member.$id != roles.leadId  && member.$id != roles.traineeId && member.$id != roles.hostId){
						$scope.reportParams.groupMembersList.push({name:member.shortname,id:member.$id});
					}
				});
			});
		};

		/*Used when updating the Lead, Host, or Trainee; to add it in the list for attendance,
		beacuse maybe the selected member has a different basegGroup. Do not add duplicated
		members in the list, to avoid angular duplicity error while painting the select options*/
		pushMemberToAttendanceSelectList = function (memberObj) {
			let memberExist = false;
			$scope.reportParams.groupMembersList.forEach(function(member){
				if(member.id == memberObj.id){
					memberExist = true;
				}
			});
			if(!memberExist){
				$scope.reportParams.groupMembersList.push({name:memberObj.name, id:memberObj.id});
			}
		};

		$scope.prepareViewForEdit = function (whichReport) {
			$scope.reportParams = { actionLbl: $rootScope.i18n.reports.modifyLbl,
															isEdit: true, reportId: whichReport };
			//To Control list of available members for attendance
			$scope.reportParams.groupMembersList = new Array();

			$scope.objectDetails.basicInfo = ReportsSvc.getReportBasicObj(whichReport);
			$scope.objectDetails.basicInfo.$loaded().then(function(report){
				if(report.$value === null){
					$rootScope.response = {error: true, message: systemMsgs.error.recordDoesntExist };
					$location.path(constants.pages.error);
					return;
				}

				$scope.objectDetails.feedback = ReportsSvc.getReportFeedback(report.$id);
				$scope.objectDetails.study = ReportsSvc.getReportStudyObject(report.$id);
				$scope.objectDetails.audit = ReportsSvc.getReportAuditObject(report.$id);
				$scope.objectDetails.atten = ReportsSvc.getReportAttendanceObject(report.$id);
				$scope.objectDetails.atten.$loaded().then(function(attendanceObj){
					$scope.objectDetails.attendance = { guests:[], members:[] };
					if(attendanceObj.members){
						$scope.objectDetails.attendance.members = Object.values(attendanceObj.members);
					}
					if(attendanceObj.guests){
						$scope.objectDetails.attendance.guests = Object.values(attendanceObj.guests);
					}
				});
				//Prepare dateObj to populate the date input field
				if(report.date){
					$scope.reportParams.dateObj = new Date(report.date.year, report.date.month-1, report.date.day);
				}

				let roles = {leadId:report.leadId, leadName: report.leadName,
							traineeId: report.traineeId, traineeName: report.traineeName,
							hostId: report.hostId, hostName: report.hostName,}
				prepareMembersForAttendaceListSelect(report.groupId, roles);
				$scope.response = undefined;
			}).catch( function(error){
				console.error(error);
				$rootScope.response = { error: true, message: error };
				$location.path(constants.pages.error);
			});
		};

		/* Called from view */
		$scope.addSelectedMemberToAttendancelist = function () {
			let memberId = $scope.reportParams.addMemberId;
			let memberName = document.getElementById('memberSelect').options[document.getElementById('memberSelect').selectedIndex].text;
			addMemberAttendance(memberId,memberName);
		};

		$scope.addAllMembersToAteendace = function () {
			$scope.reportParams.groupMembersList.forEach(function(member){
				addMemberAttendance(member.id,member.name);
			});
		};

		/* Add a member to the attendace list
		1. Create a new Member attendace List, if doesnt exist
		2. When a list is already present, iterate to find if the member is already there
		3. Push the member to the attendace list
		4. Remove member from  "removedMembersMap", if there */
		addMemberAttendance = function(memberId,memberName){
			let memberExist = false;
			$scope.objectDetails.attendance.members.forEach(function(member){
				if(member.memberId == memberId){
					memberExist = true;
				}
			});

			if(memberExist){
				$scope.response = { membersListError: memberName + " "+ systemMsgs.error.duplicatedAttendance};
			}else{
				$scope.objectDetails.attendance.members.push({memberId:memberId,memberName:memberName});
				// $scope.response = { membersListOk: memberName + " "+ systemMsgs.success.attendanceAdded};
				$scope.response = null;
				/* The removedMembersMap is used to track the members that must be removed from the report,
				and the report should be removed from /member/details/:memberId/attendance
				This is useful when editing an existing report, because an user could:
				1. remove a member from the attendace list (this will add the member Id in removedMembersMap),
				2. and then add the member again. In this case we must delete the member from removedMembersMap */
				if($scope.removedMembersMap){
					$scope.removedMembersMap.delete(memberId);
				}
			}
		}

		/* Remove a Member from the attendace list */
		$scope.removeMemberAttendance = function (whichMember) {
			clearResponse();
			let memberName = whichMember.memberName;
			let memberId = whichMember.memberId;
			$scope.objectDetails.attendance.members.forEach(function(member,idx) {
				if(member.memberId == memberId){
  				$scope.objectDetails.attendance.members.splice(idx, 1);
					// $scope.response = { membersListOk: memberName + " "+ systemMsgs.success.attendanceRemoved};
					$scope.reportParams.forceSaveBtnShow = true;
					if(!$scope.removedMembersMap){
						$scope.removedMembersMap = new Map();
					}
					/*The removedMembersMap will be used when saving the report to identify
					 Members to be removed from the attendance list. Useful when editing an existing report */
					if(!$scope.removedMembersMap.get(memberId) ){
						$scope.removedMembersMap.set(memberId,memberId);
					}
				}
			});
		};

		/* Called from view */
		$scope.addGuestToAttendanceList = function () {
			let guestName = $scope.reportParams.addGuestName;
			let addGuestNameQty = $scope.reportParams.addGuestNameQty;
			if($scope.multipleGuestActive && addGuestNameQty > 1){
				//Adding more than 1 guest will create: <Guest name> - <#>
				while(addGuestNameQty>0){
					addGuestAttendance(guestName + " "+addGuestNameQty);
					addGuestNameQty--;
				}
			}else{
				addGuestAttendance(guestName);
			}
			$scope.reportParams.addGuestName = "";
			$scope.reportParams.addGuestNameQty = 1;
		};

		addGuestAttendance = function(guestName){
			let guestExist = false;
			$scope.objectDetails.attendance.guests.forEach(function(member) {
					if(member.guestName == guestName){
						guestExist = true;
					}
			});
			if(guestExist){
				$scope.response = { guestsListError: guestName + " " + systemMsgs.error.duplicatedAttendance};
			}else{
				$scope.objectDetails.attendance.guests.push({guestName:guestName});
				$scope.response = null;
				// $scope.response = { guestsListOk: guestName + " "+ systemMsgs.success.attendanceAdded};
			}
		};

		$scope.removeGuestAttendance = function (whichGuest) {
			clearResponse();
			let guestName = whichGuest.guestName;
			$scope.objectDetails.attendance.guests.forEach(function(member,idx) {
					if(member.guestName == guestName){
    				$scope.objectDetails.attendance.guests.splice(idx, 1);
						$scope.reportParams.forceSaveBtnShow = true;
						// $scope.response = { guestsListOk: guestName + " "+ systemMsgs.success.attendanceRemoved};
					}
			});
		};

		/*Called to preare the Select with the Host members*/
		$scope.prepareForHostUpdate = function(){
			$scope.response = {working:true, message: systemMsgs.inProgress.loading};

			if(!$scope.reportParams.hostsList){
				$scope.reportParams.hostsList = MembersSvc.getHostMembers();
			}
			$scope.reportParams.hostsList.$loaded().then(function(){
				clearResponse();
				$scope.reportParams.updatingHost = true;
			});
		};

		/*Update the Report hostId according to Host Selection */
		$scope.updateHost = function(){
			clearResponse();
			let hostId = $scope.objectDetails.basicInfo.hostId;
			if(hostId){
				let member = $scope.reportParams.hostsList.$getRecord(hostId);
				$scope.objectDetails.basicInfo.hostName = member.shortname;
				pushMemberToAttendanceSelectList({id:hostId, name: member.shortname})
			}else{
				$scope.objectDetails.basicInfo.hostId = null;
				$scope.objectDetails.basicInfo.hostName = null;
			}
			$scope.reportParams.updatingHost = false;
		};

		/*Called to preare the Select with the Lead members*/
		$scope.prepareForLeadUpdate = function(){
			$scope.response = {working:true, message: systemMsgs.inProgress.loading};

			if(!$scope.reportParams.leadsList){
				$scope.reportParams.leadsList = MembersSvc.getLeadMembers();
			}
			$scope.reportParams.leadsList.$loaded().then(function(){
				clearResponse();
				$scope.reportParams.updatingLead = true;
			});
		};

		/*Update the Report leadId according to Lead Selection */
		$scope.updateLead = function(){
			clearResponse();
			let leadId = $scope.objectDetails.basicInfo.leadId;
			if(leadId){
				let member = $scope.reportParams.leadsList.$getRecord(leadId);
				$scope.objectDetails.basicInfo.leadName = member.shortname;
				pushMemberToAttendanceSelectList({id:leadId, name: member.shortname})
			}else{
				$scope.objectDetails.basicInfo.leadId = null;
				$scope.objectDetails.basicInfo.leadName = null;
			}
			$scope.reportParams.updatingLead = false;
		};

		/*Called to preare the Select with the Lead members*/
		$scope.prepareForTraineeUpdate = function(){
			$scope.response = {working:true, message: systemMsgs.inProgress.loading};

			if(!$scope.reportParams.traineesList){
				$scope.reportParams.traineesList = MembersSvc.getTraineeMembers();
			}
			$scope.reportParams.traineesList.$loaded().then(function(){
				clearResponse();
				$scope.reportParams.updatingTrainee = true;
			});
		};

		/*Update the Report traineeId according to Trainee Selection */
		$scope.updateTrainee = function(){
			clearResponse();
			let traineeId = $scope.objectDetails.basicInfo.traineeId;
			if(traineeId){
				let member = $scope.reportParams.traineesList.$getRecord(traineeId);
				$scope.objectDetails.basicInfo.traineeName = member.shortname;
				pushMemberToAttendanceSelectList({id:traineeId, name: member.shortname})
			}else{
				$scope.objectDetails.basicInfo.traineeId = null;
				$scope.objectDetails.basicInfo.traineeName = null;
			}
			$scope.reportParams.updatingTrainee = false;
		};

		/*Called to preare the Select with the Lead members*/
		$scope.prepareForWeekUpdate = function(){
			$scope.response = {working:true, message: systemMsgs.inProgress.loading};

			if(!$scope.reportParams.weeksList){
				$scope.reportParams.weeksList = WeeksSvc.getOpenWeeks();
			}
			$scope.reportParams.weeksList.$loaded().then(function(){
				clearResponse();
				$scope.reportParams.updatingWeek = true;
			});
		};

		/*Update the Report weekId according to Week Selection */
		$scope.updateWeek = function(){
			clearResponse();
			let weekId = $scope.objectDetails.basicInfo.weekId;
			if(weekId){
				let week = $scope.reportParams.weeksList.$getRecord(weekId);
				$scope.objectDetails.basicInfo.weekName = week.name;
			}else{
				$scope.objectDetails.basicInfo.weekId = null;
				$scope.objectDetails.basicInfo.weekName = null;
			}
			$scope.reportParams.updatingWeek = false;
		};

		/* Create or Save Changes in a Report */
		$scope.saveReport = function(){
			clearResponse();
			//Validating Report
			$scope.response = { working:true, message: systemMsgs.inProgress.validatingReport };

			//Reports in Approved Status cannot be modified
			if( $scope.objectDetails.basicInfo.reviewStatus  == constants.status.approved){
				$scope.response = { error:true, message: systemMsgs.error.savingApprovedReport };
				return;
			}

			/* Before saving check if updatingHost, updatingTrainee, updatingLead, updatingWeek.
			Any of those values could be true because the user didnt click the save button,
			so, we must update the hostName, traineeName, leadName, or weekName accordingly
			to avoid mismatch in the id and name.*/
			if($scope.reportParams.updatingHost){
				$scope.updateHost();
			}
			if($scope.reportParams.updatingLead){
				$scope.updateLead();
			}
			if($scope.reportParams.updatingTrainee){
				$scope.updateTrainee();
			}
			if($scope.reportParams.updatingWeek){
				$scope.updateWeek();
			}

			//Preparing Report
			$scope.response = { working:true, message: systemMsgs.inProgress.preparingReport };
			$scope.objectDetails.basicInfo.date = ReportsSvc.buildDateJson($scope.reportParams.dateObj);
			$scope.objectDetails.basicInfo.dateMilis = $scope.reportParams.dateObj.getTime();
			let membersAttendanceList = $scope.objectDetails.attendance.members;
			let guestsAttendanceList = $scope.objectDetails.attendance.guests;

			/* When a Report is marked as "Canceled Reunion", some data must be
			 set to default values (Important when editing existing report)*/
			if($scope.objectDetails.basicInfo.status == constants.status.canceled){

				//All Members in Attendance list, if any, need to be moved to "removedMembersMap"
				//so we can delete the report reference in the Member
				if($scope.objectDetails.attendance.members){
					if(!$scope.removedMembersMap){
						$scope.removedMembersMap = new Map();
					}
					$scope.objectDetails.attendance.members.forEach(function(member,idx) {
						$scope.removedMembersMap.set(member.memberId,member.memberId);
					});
				}

				$scope.objectDetails.study = null;
				$scope.objectDetails.attendance = { guests:[], members:[] };
				$scope.objectDetails.basicInfo.duration = 0;
				$scope.objectDetails.basicInfo.money = 0;
				$scope.objectDetails.basicInfo.membersAttendance = 0;
				$scope.objectDetails.basicInfo.guestsAttendance = 0;
				$scope.objectDetails.basicInfo.totalAttendance = 0;
			}else{
				$scope.objectDetails.basicInfo.membersAttendance = membersAttendanceList?membersAttendanceList.length:0;
				$scope.objectDetails.basicInfo.guestsAttendance = guestsAttendanceList?guestsAttendanceList.length:0;
				$scope.objectDetails.basicInfo.totalAttendance = $scope.objectDetails.basicInfo.membersAttendance + $scope.objectDetails.basicInfo.guestsAttendance;
			}

			$scope.response = { working:true, message: systemMsgs.inProgress.savingReport };

			//Save Updates: Only valid for reports in "pending" or "rejected" review status
			if($scope.reportParams.isEdit){
				if($scope.objectDetails.basicInfo.reviewStatus == constants.status.rejected){
					//decrease Rejected Reports Count
					ReportsSvc.decreaseRejectedReportsCount($scope.objectDetails.basicInfo.createdById);
					//Change this report to Pendind status
					$scope.objectDetails.basicInfo.reviewStatus = constants.status.pending;
					//Increase Pending Reports Count
					ReportsSvc.increasePendingReportsCount($scope.objectDetails.basicInfo.createdById);
				}
				//else: reviewStatus will be "pending", because "approved" reports cannot be modified
				//Save changes in the $firebaseObject itself
				$scope.objectDetails.basicInfo.$save().then(function(ref){
					let report = $scope.objectDetails.basicInfo;
					if($scope.objectDetails.study){
						$scope.objectDetails.study.$save();
					}else{
						ReportsSvc.setReportStudyInfo(null,report.$id);
					}

					/* If the reports comes with canceled status, we should consider the possibility
					 where the same report was "completed" before and had a members attendance list.
					 In this case we should remove the reference to this report from all members. */
					if($scope.objectDetails.basicInfo.status == constants.status.canceled){
						if(!$scope.removedMembersMap){
							$scope.removedMembersMap = new Map();
						}
						//iterate over the members attendance list and push records to removedMembersMap
						let membersList = Object.values($scope.objectDetails.atten.members);
						membersList.forEach(function(elem){
							$scope.removedMembersMap.set(elem.memberId, elem.memberId);
						});
						membersAttendanceList = [];
						guestsAttendanceList = [];
					}
					/* When editing a report, some members from the original list could have been removed,
					so we need to remove the reference to the Report from the Member */
					ReportsSvc.removeReportRefereceFromMembers($scope.removedMembersMap, report.$id );

					//Always clean the Report's attendace folders, and set again
					$scope.objectDetails.atten.members = null;
					$scope.objectDetails.atten.guests = null;
					$scope.objectDetails.atten.$save();
					ReportsSvc.setMembersAttendaceList(membersAttendanceList,report);
					ReportsSvc.setGuestAttendaceList(guestsAttendanceList,report);

					AuditSvc.recordAudit(report.$id, constants.actions.update, constants.db.folders.reports);
					$scope.response = { success:true, message: systemMsgs.success.reportUpdated };
				});
			}
			//Create new Report
			else{
				let reportRef = ReportsSvc.getNewReportBasicRef();
				let reportBasicInfo = $scope.objectDetails.basicInfo;
				let reportStudyInfo = $scope.objectDetails.study;
				//New Reports get created with reviewStatus = pending
				reportBasicInfo.reviewStatus = constants.status.pending;
				//Used for an easy way to get all the reports created by one user
				reportBasicInfo.createdById = $rootScope.currentSession.user.$id;
				//Persist object to DB
				reportRef.set(reportBasicInfo);

				//Get Object after creation, and perform the rest of pendind tasks
				let reportObj = ReportsSvc.getReportBasicObj(reportRef.key);
				reportObj.$loaded().then(function(report){
					ReportsSvc.increaseTotalReportsCount($rootScope.currentSession.user.$id);
					ReportsSvc.increasePendingReportsCount($rootScope.currentSession.user.$id);
					ReportsSvc.setReportStudyInfo(reportStudyInfo,report.$id);
					//Members and Guests attendace list is added separately from the report basic info
					ReportsSvc.setMembersAttendaceList(membersAttendanceList,report);
					ReportsSvc.setGuestAttendaceList(guestsAttendanceList,report);
					//No need to removeReportRefereceFromMembers when creating a new report
					//ReportsSvc.removeReportRefereceFromMembers($scope.removedMembersMap,report.$id);

					//Save a reference to this Report in the /group/details/reports and /users/details/folders
					GroupsSvc.addReportReferenceToGroup(report);
					AuditSvc.recordAudit(report.$id, constants.actions.create, constants.db.folders.reports);
					$rootScope.reportResponse = { created:true, message: systemMsgs.success.reportCreated };
					$location.path(constants.pages.reportEdit+report.$id);
				});
			}
			$scope.reportParams.forceSaveBtnShow = false;
		};

		/* When deleting a Report:
			- Remove the Report from /report/list and /report/details
			- Decrease the Report Status (approved, rejected, pendidng) count, and total count
			- Create Audit for Report Removed
			- Remove the Report reference from the Group
			- Remove the Report reference from all Members in Attendance List
		*/
		$scope.removeReport = function(){
			clearResponse();
			$scope.response = { working:true, message: systemMsgs.inProgress.removingReport };
			//Normal Users only can remove reports pending to approve
			let currentStatus = $scope.objectDetails.basicInfo.reviewStatus;

			//Even admins cannot remove a report if it is already approved
			if( currentStatus == constants.status.approved){
				$scope.response = { error:true, message: systemMsgs.error.cantRemoveApprovedReport };
			}else if( currentStatus == constants.status.pending || currentStatus == constants.status.rejected ){
				//Admin removing a Pending or Rejected report or User removing a Pending Report
				let reportId = $scope.objectDetails.basicInfo.$id;
				let groupId = $scope.objectDetails.basicInfo.groupId;
				//Remove /report/list
				$scope.objectDetails.basicInfo.$remove().then(function(ref){
					//Remove /report/details
					ReportsSvc.removeReportDetails(reportId);
					//Audit on Report Delete
					AuditSvc.recordAudit(reportId, constants.actions.delete, constants.db.folders.reports);
					//Decrease total reports count
					ReportsSvc.decreaseTotalReportsCount($scope.objectDetails.basicInfo.createdById);
					//Decrease pending or rejected count
					if(currentStatus == constants.status.pending){
						ReportsSvc.decreasePendingReportsCount($scope.objectDetails.basicInfo.createdById);
					}else if(currentStatus == constants.status.rejected){
						ReportsSvc.decreaseRejectedReportsCount($scope.objectDetails.basicInfo.createdById);
					}
					//Remove the reference to this Report from the Group folder
					GroupsSvc.removeReportReferenceFromGroup(groupId,reportId);
					//Remove the reference to this Report from all Members in Attendance List
					let membersList = Object.values($scope.objectDetails.atten.members);
					membersList.forEach(function(record){
							MembersSvc.removeReportReferenceFromMember(record.memberId, reportId);
					});
					$rootScope.reportResponse = { deleted:true, message: systemMsgs.success.reportDeleted };
					$location.path( constants.pages.reportNew + groupId );
				});
			}
		};

		$scope.approveReport = function(){
			$scope.addCommentToFeedback()
			clearResponse();
			$scope.response = { approving:true, message: systemMsgs.inProgress.approvingReport };

			let originalStatus = $scope.objectDetails.basicInfo.reviewStatus;
			$scope.objectDetails.basicInfo.reviewStatus = constants.status.approved;
			$scope.objectDetails.basicInfo.$save().then(function(ref){
				//increase approved count
				ReportsSvc.increaseApprovedReportsCount($scope.objectDetails.basicInfo.createdById);
				//decrease pending or rejected count
				if(originalStatus == constants.status.pending){
					ReportsSvc.decreasePendingReportsCount($scope.objectDetails.basicInfo.createdById);
				}else if(originalStatus == constants.status.rejected){
					ReportsSvc.decreaseRejectedReportsCount($scope.objectDetails.basicInfo.createdById);
				}
				AuditSvc.recordAudit(ref.key, constants.actions.approve, constants.db.folders.reports);
				$scope.response = { approved:true, message: systemMsgs.success.reportApproved };
				$scope.reportParams.forceSaveBtnShow = false;
			});
		};

		$scope.rejectReport = function(){
			$scope.addCommentToFeedback()
			clearResponse();
			$scope.response = { rejecting:true, message: systemMsgs.inProgress.rejectingReport };

			let originalStatus = $scope.objectDetails.basicInfo.reviewStatus;
			$scope.objectDetails.basicInfo.reviewStatus = constants.status.rejected;
			$scope.objectDetails.basicInfo.$save().then(function(ref){
				ReportsSvc.increaseRejectedReportsCount($scope.objectDetails.basicInfo.createdById);
				if(originalStatus == constants.status.pending){
					ReportsSvc.decreasePendingReportsCount($scope.objectDetails.basicInfo.createdById);
				}else if(originalStatus == constants.status.approved){
					ReportsSvc.decreaseApprovedReportsCount($scope.objectDetails.basicInfo.createdById);
				}
				AuditSvc.recordAudit(ref.key, constants.actions.reject, constants.db.folders.reports);
				$scope.response = { rejected:true, message: systemMsgs.success.reportRejected };
				$scope.reportParams.forceSaveBtnShow = false;
			});
		};

		clearResponse = function() {
			$rootScope.reportResponse = null;
			$scope.response = null;
		};

		$scope.addCommentToFeedback = function() {
			if($scope.reportParams.feedbackComment){
				let post = {
					time:firebase.database.ServerValue.TIMESTAMP,
					fromId:$rootScope.currentSession.user.$id,
					from:$rootScope.currentSession.user.email,
					message:$scope.reportParams.feedbackComment
				}
				$scope.objectDetails.feedback.$add(post).then(function(record){
					$scope.reportParams.feedbackComment="";
				});
			}
		};

}]);

okulusApp.factory('ReportsSvc',
	['$firebaseArray', '$firebaseObject', 'MembersSvc',
	function($firebaseArray, $firebaseObject, MembersSvc){

		let baseRef = firebase.database().ref().child(constants.db.folders.root);
		let reportsListRef = baseRef.child(constants.db.folders.reportsList);
		let reportsDetailsRef = baseRef.child(constants.db.folders.reportsDetails);
		let reportReviewStatus = baseRef.child(constants.db.folders.reportsList).orderByChild(constants.db.fields.reviewStatus);
		let usersListRef = baseRef.child(constants.db.folders.usersList);

		/*Using a Transaction with an update function to reduce the counter by 1 */
		let decreaseCounter = function(counterRef){
			counterRef.transaction(function(currentCount) {
				if(currentCount>0)
					return currentCount - 1;
				return currentCount;
			});
		};

		/*Using a Transaction with an update function to increase the counter by 1 */
		let increaseCounter = function(counterRef){
			counterRef.transaction(function(currentCount) {
				return currentCount + 1;
			});
		};

		return {
			getGlobalReportsCounter: function(){
				return $firebaseObject(baseRef.child(constants.db.folders.reportsCounters));
			},
			/* Return all Reports, using a limit for the query, if specified*/
			getAllReports: function(limit) {
				if(limit){
					return $firebaseArray(reportsListRef.orderByKey().limitToLast(limit));
				}else{
					return $firebaseArray(reportsListRef.orderByKey());
				}
			},
			/* Return all Reports with reviewStatus:'approved', using a limit for the query, if specified*/
			getApprovedReports: function(limit) {
				if(limit){
					return $firebaseArray(reportReviewStatus.equalTo(constants.status.approved).limitToLast(limit));
				}else{
					return $firebaseArray(reportReviewStatus.equalTo(constants.status.approved));
				}
			},
			/* Return all Reports with reviewStatus:'pending', using a limit for the query, if specified*/
			getPendingReports: function(limit) {
				if(limit){
					return $firebaseArray(reportReviewStatus.equalTo(constants.status.pending).limitToLast(limit));
				}else{
					return $firebaseArray(reportReviewStatus.equalTo(constants.status.pending));
				}
			},
			/* Return all Reports with reviewStatus:'rejected', using a limit for the query, if specified*/
			getRejectedReports: function(limit) {
				if(limit){
					return $firebaseArray(reportReviewStatus.equalTo(constants.status.rejected).limitToLast(limit));
				}else{
					return $firebaseArray(reportReviewStatus.equalTo(constants.status.rejected));
				}
			},
			/*Return the reference to an exisitng Report's Basic Info */
			//Deprecated
			getReportBasicRef: function(reportId){
				return reportsListRef.child(reportId);
			},
			/*Create a new Key in reports/list and return it */
			getNewReportBasicRef: function(){
				return reportsListRef.push();
			},
			/* Return a $firebaseObject from reports/list s*/
			getReportBasicObj: function(reportId){
				return $firebaseObject(reportsListRef.child(reportId));
			},
			/* Get report audit from firebase and return as object */
			getReportAuditObject: function(whichReportId){
				return $firebaseObject(reportsDetailsRef.child(whichReportId).child(constants.db.folders.audit));
			},
			/* Get report attendace list from firebase and return as object */
			getReportAttendanceObject: function(whichReportId){
				return $firebaseObject(reportsDetailsRef.child(whichReportId).child(constants.db.folders.attendance));
			},
			/* Get report study from firebase and return as object */
			getReportStudyObject: function(whichReportId){
				return $firebaseObject(reportsDetailsRef.child(whichReportId).child(constants.db.folders.study));
			},
			/* Get report feedback from firebase and return as object */
			getReportFeedback: function(whichReportId){
				return $firebaseArray(reportsDetailsRef.child(whichReportId).child(constants.db.folders.feedback));
			},
			removeReportDetails: function(whichReportId){
				return reportsDetailsRef.child(whichReportId).set(null);
			},
			getReportsCreatedByUser: function(userId) {
				return $firebaseArray(reportsListRef.orderByChild(constants.db.fields.createdById).equalTo(userId));
			},
			/* Increment the number of Reports with reviewStatus = "approved"  */
			increaseApprovedReportsCount: function(creatorId) {
				let userCountRef = usersListRef.child(creatorId).child(constants.db.folders.approvedReportsCount);
				increaseCounter(userCountRef);
				let conunterRef = baseRef.child(constants.db.folders.approvedReportsCount);
				increaseCounter(conunterRef);
			},
			/* Reduce the number of Reports with reviewStatus = "approved"  */
			decreaseApprovedReportsCount: function(creatorId) {
				let userCountRef = usersListRef.child(creatorId).child(constants.db.folders.approvedReportsCount);
				decreaseCounter(userCountRef);
				let conunterRef = baseRef.child(constants.db.folders.approvedReportsCount);
				decreaseCounter(conunterRef);
			},
			/* Increment the number of Reports with reviewStatus = "rejected"  */
			increaseRejectedReportsCount: function(creatorId) {
				let userCountRef = usersListRef.child(creatorId).child(constants.db.folders.rejectedReportsCount);
				increaseCounter(userCountRef);
				let conunterRef = baseRef.child(constants.db.folders.rejectedReportsCount);
				increaseCounter(conunterRef);
			},
			/* Reduce the number of Reports with reviewStatus = "rejected"  */
			decreaseRejectedReportsCount: function(creatorId) {
				let userCountRef = usersListRef.child(creatorId).child(constants.db.folders.rejectedReportsCount);
				decreaseCounter(userCountRef);
				let conunterRef = baseRef.child(constants.db.folders.rejectedReportsCount);
				decreaseCounter(conunterRef);
			},
			/* Increment the number of Reports with reviewStatus = "pending"  */
			increasePendingReportsCount: function(creatorId) {
				let userCountRef = usersListRef.child(creatorId).child(constants.db.folders.pendingReportsCount);
				increaseCounter(userCountRef);
				let conunterRef = baseRef.child(constants.db.folders.pendingReportsCount);
				increaseCounter(conunterRef);
			},
			/* Reduce the number of Reports with reviewStatus = "pending"  */
			decreasePendingReportsCount: function(creatorId) {
				let userCountRef = usersListRef.child(creatorId).child(constants.db.folders.pendingReportsCount);
				decreaseCounter(userCountRef);
				let conunterRef = baseRef.child(constants.db.folders.pendingReportsCount);
				decreaseCounter(conunterRef);
			},
			/* Increment the number of total Reports */
			increaseTotalReportsCount: function(creatorId) {
				let userCountRef = usersListRef.child(creatorId).child(constants.db.folders.totalReportsCount);
				increaseCounter(userCountRef);
				let conunterRef = baseRef.child(constants.db.folders.totalReportsCount);
				increaseCounter(conunterRef);
			},
			/* Reduce the number of total Reports */
			decreaseTotalReportsCount: function(creatorId) {
				let userCountRef = usersListRef.child(creatorId).child(constants.db.folders.totalReportsCount);
				decreaseCounter(userCountRef);
				let conunterRef = baseRef.child(constants.db.folders.totalReportsCount);
				decreaseCounter(conunterRef);
			},
			/* Set the members attendance list in the /reports/details/:reportId/attendance/members folder */
			setMembersAttendaceList: function(attendanceList, report) {
				if(attendanceList){
					attendanceList.forEach(function(member) {
						reportsDetailsRef.child(report.$id).child(constants.db.folders.membersAttendance).child(member.memberId).set(
							{memberId:member.memberId, memberName:member.memberName}
						);
						MembersSvc.addReportReferenceToMember(member.memberId, report);
					});
				}
			},
			/* Set the guests attendance list in the /reports/details/:reportId/attendance/guests folder */
			setGuestAttendaceList: function(attendanceList, report) {
				if(attendanceList){
					attendanceList.forEach(function(guest) {
						reportsDetailsRef.child(report.$id).child(constants.db.folders.guestsAttendance).push({guestName:guest.guestName});
					});
				}
			},
			/* Save the Report Study info in /reports/details/:reportId/study/ */
			setReportStudyInfo: function(reportStudyInfo, reportId) {
				reportsDetailsRef.child(reportId).child(constants.db.folders.study).set(reportStudyInfo);
			},
			/* Set the guests attendance list in the /reports/details/:reportId/attendance/guests folder */
			removeReportRefereceFromMembers: function(membersMap, reportId) {
				if(membersMap){
					membersMap.forEach(function(value, key) {
						//both value and key are = memberId
						MembersSvc.removeReportReferenceFromMember(value, reportId);
					});
				}
			},
			/* Return all reports with WeedId in the provided period (both sides inclusive)*/
			getReportsforWeeksPeriod: function(fromWeek, toWeek){
				let query = reportsListRef.orderByChild(constants.db.fields.weekId).startAt(fromWeek).endAt(toWeek);
				return $firebaseArray(query);
			},
			/*Returns firebaseArray with the Reports for the given week, but limited to a specified amount */
			getReportsForWeek: function(weekId, limit){
				let reference = reportsListRef.orderByChild(constants.db.fields.weekId).equalTo(weekId);
				if(limit){
					return $firebaseArray(reference.limitToLast(limit));
				}else{
					return $firebaseArray(reference);
				}
			},
			//Deprecated
			getReportObj: function(reportId){
				return $firebaseObject(reportsListRef.child(reportId));
			},
			getReportsForWeek: function(weekId){
				let ref = reportsListRef.orderByChild(constants.db.fields.weekId).equalTo(weekId);
				return $firebaseArray(ref);
			},
			buildDateJson: function(dateObject){
		    	let dateJson = null;
		    	if(dateObject){
		    		dateJson = { day:dateObject.getDate(),
							 month: dateObject.getMonth()+1,
							 year:dateObject.getFullYear() };
				}
				return dateJson;
			}
		};
	}
]);


/*Controls the Quick "Create Report Button". */
okulusApp.controller('CreateReportCntrl',
	['$scope','$rootScope','$location','$firebaseAuth',
	function($scope, $rootScope, $location, $firebaseAuth){

		/* When the member has only 1 access rule */
		$scope.quickReportLauncher = function(){
			let groupId = $rootScope.currentSession.accessRules[0].groupId;
			$location.path(constants.pages.reportNew + groupId);
		};

		$scope.closeGroupSelectModal = function(group){
			let groupId = group.$id;
			$location.path(constants.pages.reportNew + groupId);
		};

	}]
);
