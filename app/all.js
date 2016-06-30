/*global angular document navigator*/
(function withAngular(angular, navigator) {

  'use strict';

  var A_DAY_IN_MILLISECONDS = 86400000
	, isMobile = (function isMobile() {

	  if (navigator.userAgent &&
		(navigator.userAgent.match(/Android/i) ||
		navigator.userAgent.match(/webOS/i) ||
		navigator.userAgent.match(/iPhone/i) ||
		navigator.userAgent.match(/iPad/i) ||
		navigator.userAgent.match(/iPod/i) ||
		navigator.userAgent.match(/BlackBerry/i) ||
		navigator.userAgent.match(/Windows Phone/i))) {

		return true;
	  }
	}())
	, generateMonthAndYearHeader = function generateMonthAndYearHeader(prevButton, nextButton) {

	  if (isMobile) {

		return [
		  '<div class="_720kb-datepicker-calendar-header">',
			'<div class="_720kb-datepicker-calendar-header-middle _720kb-datepicker-mobile-item _720kb-datepicker-calendar-month">',
			  '<select ng-model="month" title="{{ dateMonthTitle }}" ng-change="selectedMonthHandle(month)">',
				'<option ng-repeat="item in months" ng-selected="item === month" ng-disabled=\'!isSelectableMaxDate(item + " " + day + ", " + year) || !isSelectableMinDate(item + " " + day + ", " + year)\' ng-value="$index + 1" value="$index + 1">',
				  '{{ item }}',
				'</option>',
			  '</select>',
			'</div>',
		  '</div>',
		  '<div class="_720kb-datepicker-calendar-header">',
			'<div class="_720kb-datepicker-calendar-header-middle _720kb-datepicker-mobile-item _720kb-datepicker-calendar-month">',
			  '<select ng-model="mobileYear" title="{{ dateYearTitle }}" ng-change="setNewYear(mobileYear)">',
				'<option ng-repeat="item in paginationYears track by $index" ng-selected="year === item" ng-disabled="!isSelectableMinYear(item) || !isSelectableMaxYear(item)" ng-value="item" value="item">',
				  '{{ item }}',
				'</option>',
			  '</select>',
			'</div>',
		  '</div>'
		];
	  }

	  return [
		'<div class="_720kb-datepicker-calendar-header">',
		  '<div class="_720kb-datepicker-calendar-header-left">',
			'<a class="_720kb-datepicker-calendar-month-button" href="javascript:void(0)" ng-class="{\'_720kb-datepicker-item-hidden\': !willPrevMonthBeSelectable()}" ng-click="prevMonth()" title="{{ buttonPrevTitle }}">',
			  prevButton,
			'</a>',
		  '</div>',
		  '<div class="_720kb-datepicker-calendar-header-middle _720kb-datepicker-calendar-month">',
			'{{month}}&nbsp;',
			'<a href="javascript:void(0)" ng-click="paginateYears(year); showYearsPagination = !showYearsPagination;">',
			  '<span>',
				'{{year}}',
				'<i ng-class="{\'_720kb-datepicker-calendar-header-closed-pagination\': !showYearsPagination, \'_720kb-datepicker-calendar-header-opened-pagination\': showYearsPagination}"></i>',
			  '</span>',
			'</a>',
		  '</div>',
		  '<div class="_720kb-datepicker-calendar-header-right">',
		  '<a class="_720kb-datepicker-calendar-month-button" ng-class="{\'_720kb-datepicker-item-hidden\': !willNextMonthBeSelectable()}" href="javascript:void(0)" ng-click="nextMonth()" title="{{ buttonNextTitle }}">',
			nextButton,
		  '</a>',
		  '</div>',
		'</div>'
	  ];
	}
	, generateYearsPaginationHeader = function generateYearsPaginationHeader(prevButton, nextButton) {

	  return [
		'<div class="_720kb-datepicker-calendar-header" ng-show="showYearsPagination">',
		  '<div class="_720kb-datepicker-calendar-years-pagination">',
			'<a ng-class="{\'_720kb-datepicker-active\': y === year, \'_720kb-datepicker-disabled\': !isSelectableMaxYear(y) || !isSelectableMinYear(y)}" href="javascript:void(0)" ng-click="setNewYear(y)" ng-repeat="y in paginationYears track by $index">',
			  '{{y}}',
			'</a>',
		  '</div>',
		  '<div class="_720kb-datepicker-calendar-years-pagination-pages">',
			'<a href="javascript:void(0)" ng-click="paginateYears(paginationYears[0])" ng-class="{\'_720kb-datepicker-item-hidden\': paginationYearsPrevDisabled}">',
			  prevButton,
			'</a>',
			'<a href="javascript:void(0)" ng-click="paginateYears(paginationYears[paginationYears.length -1 ])" ng-class="{\'_720kb-datepicker-item-hidden\': paginationYearsNextDisabled}">',
			  nextButton,
			'</a>',
		  '</div>',
		'</div>'
	  ];
	}
	, generateDaysColumns = function generateDaysColumns() {

	  return [
	  '<div class="_720kb-datepicker-calendar-days-header">',
		'<div ng-repeat="d in daysInString">',
		  '{{d}}',
		'</div>',
	  '</div>'
	  ];
	}
	, generateDays = function generateDays() {

	  return [
		'<div class="_720kb-datepicker-calendar-body">',
		  '<a href="javascript:void(0)" ng-repeat="px in prevMonthDays" class="_720kb-datepicker-calendar-day _720kb-datepicker-disabled">',
			'{{px}}',
		  '</a>',
		  '<a href="javascript:void(0)" ng-repeat="item in days" ng-click="setDatepickerDay(item)" ng-class="{\'_720kb-datepicker-active\': day === item, \'_720kb-datepicker-disabled\': !isSelectableMinDate(year + \'/\' + monthNumber + \'/\' + item ) || !isSelectableMaxDate(year + \'/\' + monthNumber + \'/\' + item) || !isSelectableDate(monthNumber, year, item)}" class="_720kb-datepicker-calendar-day">',
			'{{item}}',
		  '</a>',
		  '<a href="javascript:void(0)" ng-repeat="nx in nextMonthDays" class="_720kb-datepicker-calendar-day _720kb-datepicker-disabled">',
			'{{nx}}',
		  '</a>',
		'</div>'
	  ];
	}
	, generateHtmlTemplate = function generateHtmlTemplate(prevButton, nextButton) {

	  var toReturn = [
		'<div class="_720kb-datepicker-calendar {{datepickerClass}} {{datepickerID}}" ng-class="{\'_720kb-datepicker-forced-to-open\': checkVisibility()}" ng-blur="hideCalendar()">',
		'</div>'
	  ]
	  , monthAndYearHeader = generateMonthAndYearHeader(prevButton, nextButton)
	  , yearsPaginationHeader = generateYearsPaginationHeader(prevButton, nextButton)
	  , daysColumns = generateDaysColumns()
	  , days = generateDays()
	  , iterator = function iterator(aRow) {

		toReturn.splice(toReturn.length - 1, 0, aRow);
	  };

	  monthAndYearHeader.forEach(iterator);
	  yearsPaginationHeader.forEach(iterator);
	  daysColumns.forEach(iterator);
	  days.forEach(iterator);

	  return toReturn.join('');
	}
	, datepickerDirective = function datepickerDirective($window, $compile, $locale, $filter, $interpolate) {

	  var linkingFunction = function linkingFunction($scope, element, attr) {

		//get child input
		var selector = attr.selector
		  , thisInput = angular.element(selector ? element[0].querySelector('.' + selector) : element[0].children[0])
		  , theCalendar
		  , defaultPrevButton = '<b class="_720kb-datepicker-default-button">&lang;</b>'
		  , defaultNextButton = '<b class="_720kb-datepicker-default-button">&rang;</b>'
		  , prevButton = attr.buttonPrev || defaultPrevButton
		  , nextButton = attr.buttonNext || defaultNextButton
		  , dateFormat = attr.dateFormat
		  //, dateMinLimit
		  //, dateMaxLimit
		  , dateDisabledDates = $scope.$eval($scope.dateDisabledDates)
		  , date = new Date()
		  , isMouseOn = false
		  , isMouseOnInput = false
		  , datetime = $locale.DATETIME_FORMATS
		  , pageDatepickers
		  , hours24h = 86400000
		  , htmlTemplate = generateHtmlTemplate(prevButton, nextButton)
		  , onClickOnWindow = function onClickOnWindow() {

			if (!isMouseOn &&
			  !isMouseOnInput && theCalendar) {

			  $scope.hideCalendar();
			}
		  }
		  , resetToMinDate = function resetToMinDate() {

			$scope.month = $filter('date')(new Date($scope.dateMinLimit), 'MMMM');
			$scope.monthNumber = Number($filter('date')(new Date($scope.dateMinLimit), 'MM'));
			$scope.day = Number($filter('date')(new Date($scope.dateMinLimit), 'dd'));
			$scope.year = Number($filter('date')(new Date($scope.dateMinLimit), 'yyyy'));
		  }
		  , resetToMaxDate = function resetToMaxDate() {

			$scope.month = $filter('date')(new Date($scope.dateMaxLimit), 'MMMM');
			$scope.monthNumber = Number($filter('date')(new Date($scope.dateMaxLimit), 'MM'));
			$scope.day = Number($filter('date')(new Date($scope.dateMaxLimit), 'dd'));
			$scope.year = Number($filter('date')(new Date($scope.dateMaxLimit), 'yyyy'));
		  }
		  , prevYear = function prevYear() {

			$scope.year = Number($scope.year) - 1;
		  }
		  , nextYear = function nextYear() {

			$scope.year = Number($scope.year) + 1;
		  }
		  , setInputValue = function setInputValue() {

			if ($scope.isSelectableMinDate($scope.year + '/' + $scope.monthNumber + '/' + $scope.day) &&
				$scope.isSelectableMaxDate($scope.year + '/' + $scope.monthNumber + '/' + $scope.day)) {

			  var modelDate = new Date($scope.year + '/' + $scope.monthNumber + '/' + $scope.day);

			  if (attr.dateFormat) {

				thisInput.val($filter('date')(modelDate, dateFormat));
			  } else {

				thisInput.val(modelDate);
			  }

			  thisInput.triggerHandler('input');
			  thisInput.triggerHandler('change');//just to be sure;
			} else {

			  return false;
			}
		  }
		  , classHelper = {
			'add': function add(ele, klass) {
			  var classes;

			  if (ele.className.indexOf(klass) > -1) {

				return;
			  }

			  classes = ele.className.split(' ');
			  classes.push(klass);
			  ele.className = classes.join(' ');
			},
			'remove': function remove(ele, klass) {
			  var i
				, classes;

			  if (ele.className.indexOf(klass) === -1) {

				return;
			  }

			  classes = ele.className.split(' ');
			  for (i = 0; i < classes.length; i += 1) {

				if (classes[i] === klass) {

				  classes = classes.slice(0, i).concat(classes.slice(i + 1));
				  break;
				}
			  }
			  ele.className = classes.join(' ');
			}
		  }
		  , showCalendar = function showCalendar() {
			//lets hide all the latest instances of datepicker
			pageDatepickers = $window.document.getElementsByClassName('_720kb-datepicker-calendar');

			angular.forEach(pageDatepickers, function forEachDatepickerPages(value, key) {
			  if (pageDatepickers[key].classList) {

				pageDatepickers[key].classList.remove('_720kb-datepicker-open');
			  } else {

				classHelper.remove(pageDatepickers[key], '_720kb-datepicker-open');
			  }
			});

			if (theCalendar.classList) {

			  theCalendar.classList.add('_720kb-datepicker-open');
			} else {

			  classHelper.add(theCalendar, '_720kb-datepicker-open');
			}
		  }
		  , checkToggle = function checkToggle() {
			if (!$scope.datepickerToggle) {

			  return true;
			}

			return $scope.$eval($scope.datepickerToggle);
		  }
		  , checkVisibility = function checkVisibility() {
			if (!$scope.datepickerShow) {

			  return false;
			}
			return $scope.$eval($scope.datepickerShow);
		  }
		  , setDaysInMonth = function setDaysInMonth(month, year) {

			var i
			  , limitDate = new Date(year, month, 0).getDate()
			  , firstDayMonthNumber = new Date(year + '/' + month + '/' + 1).getDay()
			  , lastDayMonthNumber = new Date(year + '/' + month + '/' + limitDate).getDay()
			  , prevMonthDays = []
			  , nextMonthDays = []
			  , howManyNextDays
			  , howManyPreviousDays
			  , monthAlias;

			$scope.days = [];

			for (i = 1; i <= limitDate; i += 1) {

			  $scope.days.push(i);
			}

			//get previous month days is first day in month is not Sunday
			if (firstDayMonthNumber === 0) {

			  //no need for it
			  $scope.prevMonthDays = [];
			} else {

			  howManyPreviousDays = firstDayMonthNumber;
			  //get previous month
			  if (Number(month) === 1) {

				monthAlias = 12;
			  } else {

				monthAlias = month - 1;
			  }
			  //return previous month days
			  for (i = 1; i <= new Date(year, monthAlias, 0).getDate(); i += 1) {

				prevMonthDays.push(i);
			  }
			  //attach previous month days
			  $scope.prevMonthDays = prevMonthDays.slice(-howManyPreviousDays);
			}

			//get next month days is first day in month is not Sunday
			if (lastDayMonthNumber < 6) {

			  howManyNextDays = 6 - lastDayMonthNumber;
			  //get previous month

			  //return next month days
			  for (i = 1; i <= howManyNextDays; i += 1) {

				nextMonthDays.push(i);
			  }
			  //attach previous month days
			  $scope.nextMonthDays = nextMonthDays;
			} else {
			  //no need for it
			  $scope.nextMonthDays = [];
			}
		  }
		  , unregisterDataSetWatcher = $scope.$watch('dateSet', function dateSetWatcher(newValue) {

			if (newValue) {

			  date = new Date(newValue);

			  $scope.month = $filter('date')(date, 'MMMM');//december-November like
			  $scope.monthNumber = Number($filter('date')(date, 'MM')); // 01-12 like
			  $scope.day = Number($filter('date')(date, 'dd')); //01-31 like
			  $scope.year = Number($filter('date')(date, 'yyyy'));//2014 like

			  setDaysInMonth($scope.monthNumber, $scope.year);

			  if ($scope.dateSetHidden !== 'true') {

				setInputValue();
			  }
			}
		  });

		$scope.nextMonth = function nextMonth() {

		  if ($scope.monthNumber === 12) {

			$scope.monthNumber = 1;
			//its happy new year
			nextYear();
		  } else {

			$scope.monthNumber += 1;
		  }

		  //check if max date is ok
		  if ($scope.dateMaxLimit) {

			if (!$scope.isSelectableMaxDate($scope.year + '/' + $scope.monthNumber + '/' + $scope.days[0])) {

			  resetToMaxDate();
			}
		  }

		  //set next month
		  $scope.month = $filter('date')(new Date($scope.year, $scope.monthNumber - 1), 'MMMM');
		  //reinit days
		  setDaysInMonth($scope.monthNumber, $scope.year);
		  //deactivate selected day
		  $scope.day = undefined;
		};

		$scope.willPrevMonthBeSelectable = function willPrevMonthBeSelectable() {
		  var monthNumber = $scope.monthNumber
			, year = $scope.year
			, prevDay = $filter('date')(new Date(new Date(year + '/' + monthNumber + '/01').getTime() - hours24h), 'dd'); //get last day in previous month

		  if (monthNumber === 1) {

			monthNumber = 12;
			year = year - 1;
		  } else {

			monthNumber -= 1;
		  }

		  if ($scope.dateMinLimit) {
			if (!$scope.isSelectableMinDate(year + '/' + monthNumber + '/' + prevDay)) {

			  return false;
			}
		  }

		  return true;
		};

		$scope.willNextMonthBeSelectable = function willNextMonthBeSelectable() {
		  var monthNumber = $scope.monthNumber
			, year = $scope.year;

		  if (monthNumber === 12) {

			monthNumber = 1;
			year += 1;
		  } else {

			monthNumber += 1;
		  }

		  if ($scope.dateMaxLimit) {
			if (!$scope.isSelectableMaxDate(year + '/' + monthNumber + '/01')) {

			  return false;
			}
		  }

		  return true;
		};

		$scope.prevMonth = function managePrevMonth() {

		  if ($scope.monthNumber === 1) {

			$scope.monthNumber = 12;
			//its happy new year
			prevYear();
		  } else {

			$scope.monthNumber -= 1;
		  }
		  //check if min date is ok
		  if ($scope.dateMinLimit) {

			if (!$scope.isSelectableMinDate($scope.year + '/' + $scope.monthNumber + '/' + $scope.days[$scope.days.length - 1])) {

			  resetToMinDate();
			}
		  }
		  //set next month
		  $scope.month = $filter('date')(new Date($scope.year, $scope.monthNumber - 1), 'MMMM');
		  //reinit days
		  setDaysInMonth($scope.monthNumber, $scope.year);
		  //deactivate selected day
		  $scope.day = undefined;
		};

		$scope.selectedMonthHandle = function manageSelectedMonthHandle(selectedMonthNumber) {

		  $scope.monthNumber = Number($filter('date')(new Date(selectedMonthNumber + '/01/2000'), 'MM'));
		  setDaysInMonth($scope.monthNumber, $scope.year);
		  setInputValue();
		};

		$scope.setNewYear = function setNewYear(year) {

		  //deactivate selected day
		  if (!isMobile) {
			$scope.day = undefined;
		  }

		  if ($scope.dateMaxLimit &&
			$scope.year < Number(year)) {

			if (!$scope.isSelectableMaxYear(year)) {

			  return;
			}
		  } else if ($scope.dateMinLimit &&
			$scope.year > Number(year)) {

			if (!$scope.isSelectableMinYear(year)) {

			  return;
			}
		  }

		  $scope.year = Number(year);
		  setDaysInMonth($scope.monthNumber, $scope.year);
		  $scope.paginateYears(year);
		  $scope.showYearsPagination = false;
		};

		$scope.hideCalendar = function hideCalendar() {
		  if (theCalendar.classList){
			theCalendar.classList.remove('_720kb-datepicker-open');
		  } else {

			classHelper.remove(theCalendar, '_720kb-datepicker-open');
		  }
		};

		$scope.setDatepickerDay = function setDatepickerDay(day) {

		  if ($scope.isSelectableDate($scope.monthNumber, $scope.year, day) &&
			  $scope.isSelectableMaxDate($scope.year + '/' + $scope.monthNumber + '/' + day) &&
			  $scope.isSelectableMinDate($scope.year + '/' + $scope.monthNumber + '/' + day)) {

			$scope.day = Number(day);
			setInputValue();

			if (attr.hasOwnProperty('dateRefocus')) {
			  thisInput[0].focus();
			}

			$scope.hideCalendar();
		  }
		};

		$scope.paginateYears = function paginateYears(startingYear) {
		  var i
		   , theNewYears = []
		   , daysToPrepend = 10
		   , daysToAppend = 10;

		  $scope.paginationYears = [];
		  if (isMobile) {

			daysToPrepend = 50;
			daysToAppend = 50;
			if ( $scope.dateMinLimit && $scope.dateMaxLimit) {

			  startingYear = new Date($scope.dateMaxLimit).getFullYear();
			  daysToPrepend = startingYear - new Date($scope.dateMinLimit).getFullYear();
			  daysToAppend = 1;
			}
		  }

		  for (i = daysToPrepend; i > 0; i -= 1) {

			theNewYears.push(Number(startingYear) - i);
		  }

		  for (i = 0; i < daysToAppend; i += 1) {

			theNewYears.push(Number(startingYear) + i);
		  }
		  //date typing in input date-typer
		  if ($scope.dateTyper === 'true') {

			thisInput.on('keyup blur', function onTyping() {

			  if (thisInput[0].value &&
				thisInput[0].value.length &&
				thisInput[0].value.length > 0) {

				try {

				  date = new Date(thisInput[0].value.toString());

				  if (date.getFullYear() &&
				   !isNaN(date.getDay()) &&
				   !isNaN(date.getMonth()) &&
				   $scope.isSelectableDate(date) &&
				   $scope.isSelectableMaxDate(date) &&
				   $scope.isSelectableMinDate(date)) {

					$scope.$apply(function applyTyping() {

					  $scope.month = $filter('date')(date, 'MMMM');//december-November like
					  $scope.monthNumber = Number($filter('date')(date, 'MM')); // 01-12 like
					  $scope.day = Number($filter('date')(date, 'dd')); //01-31 like

					  if (date.getFullYear().toString().length === 4) {
						$scope.year = Number($filter('date')(date, 'yyyy'));//2014 like
					  }
					  setDaysInMonth($scope.monthNumber, $scope.year);
					});
				  }
				} catch (e) {

				  return e;
				}
			  }
			});
		  }
		  //check range dates
		  if ($scope.dateMaxLimit &&
			theNewYears &&
			theNewYears.length &&
			!$scope.isSelectableMaxYear(Number(theNewYears[theNewYears.length - 1]) + 1)) {

			$scope.paginationYearsNextDisabled = true;
		  } else {

			$scope.paginationYearsNextDisabled = false;
		  }

		  if ($scope.dateMinLimit &&
			theNewYears &&
			theNewYears.length &&
			!$scope.isSelectableMinYear(Number(theNewYears[0]) - 1)) {

			$scope.paginationYearsPrevDisabled = true;
		  } else {

			$scope.paginationYearsPrevDisabled = false;
		  }

		  $scope.paginationYears = theNewYears;
		};

		$scope.isSelectableDate = function isSelectableDate(monthNumber, year, day) {
		  var i = 0;

		  if (dateDisabledDates &&
			dateDisabledDates.length > 0) {

			for (i; i <= dateDisabledDates.length; i += 1) {

			  if (new Date(dateDisabledDates[i]).getTime() === new Date(monthNumber + '/' + day + '/' + year).getTime()) {

				return false;
			  }
			}
		  }
		  return true;
		};

		$scope.isSelectableMinDate = function isSelectableMinDate(aDate) {
		  //if current date
		  if (!!$scope.dateMinLimit &&
			 !!new Date($scope.dateMinLimit) &&
			 new Date(aDate).getTime() < new Date($scope.dateMinLimit).getTime()) {

			return false;
		  }

		  return true;
		};

		$scope.isSelectableMaxDate = function isSelectableMaxDate(aDate) {
		  //if current date
		  if (!!$scope.dateMaxLimit &&
			 !!new Date($scope.dateMaxLimit) &&
			 new Date(aDate).getTime() > new Date($scope.dateMaxLimit).getTime()) {

			return false;
		  }

		  return true;
		};

		$scope.isSelectableMaxYear = function isSelectableMaxYear(year) {
		  if (!!$scope.dateMaxLimit &&
			year > new Date($scope.dateMaxLimit).getFullYear()) {

			return false;
		  }

		  return true;
		};

		$scope.isSelectableMinYear = function isSelectableMinYear(year) {
		  if (!!$scope.dateMinLimit &&
			year < new Date($scope.dateMinLimit).getFullYear()) {

			return false;
		  }

		  return true;
		};

		// respect previously configured interpolation symbols.
		htmlTemplate = htmlTemplate.replace(/{{/g, $interpolate.startSymbol()).replace(/}}/g, $interpolate.endSymbol());
		$scope.dateMonthTitle = $scope.dateMonthTitle || 'Select month';
		$scope.dateYearTitle = $scope.dateYearTitle || 'Select year';
		$scope.buttonNextTitle = $scope.buttonNextTitle || 'Next';
		$scope.buttonPrevTitle = $scope.buttonPrevTitle || 'Prev';
		$scope.month = $filter('date')(date, 'MMMM');//december-November like
		$scope.monthNumber = Number($filter('date')(date, 'MM')); // 01-12 like
		$scope.day = Number($filter('date')(date, 'dd')); //01-31 like

		if ($scope.dateMaxLimit) {

		  $scope.year = Number($filter('date')(new Date($scope.dateMaxLimit), 'yyyy'));//2014 like
		} else {

		  $scope.year = Number($filter('date')(date, 'yyyy'));//2014 like
		}
		$scope.months = datetime.MONTH;
		$scope.daysInString = ['0', '1', '2', '3', '4', '5', '6'].map(function mappingFunc(el) {

		  return $filter('date')(new Date(new Date('06/08/2014').valueOf() + A_DAY_IN_MILLISECONDS * el), 'EEE');
		});

		//create the calendar holder and append where needed
		if ($scope.datepickerAppendTo &&
		  $scope.datepickerAppendTo.indexOf('.') !== -1) {

		  $scope.datepickerID = 'datepicker-id-' + new Date().getTime() + (Math.floor(Math.random() * 6) + 8);
		  angular.element(document.getElementsByClassName($scope.datepickerAppendTo.replace('.', ''))[0]).append($compile(angular.element(htmlTemplate))($scope, function afterCompile(el) {

			theCalendar = angular.element(el)[0];
		  }));
		} else if ($scope.datepickerAppendTo &&
		  $scope.datepickerAppendTo.indexOf('#') !== -1) {

		  $scope.datepickerID = 'datepicker-id-' + new Date().getTime() + (Math.floor(Math.random() * 6) + 8);
		  angular.element(document.getElementById($scope.datepickerAppendTo.replace('#', ''))).append($compile(angular.element(htmlTemplate))($scope, function afterCompile(el) {

			theCalendar = angular.element(el)[0];
		  }));
		} else if ($scope.datepickerAppendTo &&
		  $scope.datepickerAppendTo === 'body') {
		  $scope.datepickerID = 'datepicker-id-' + (new Date().getTime() + (Math.floor(Math.random() * 6) + 8));
		  angular.element(document).find('body').append($compile(angular.element(htmlTemplate))($scope, function afterCompile(el) {

			theCalendar = angular.element(el)[0];
		  }));
		} else {

		  thisInput.after($compile(angular.element(htmlTemplate))($scope));
		  //get the calendar as element
		  theCalendar = element[0].querySelector('._720kb-datepicker-calendar');
		}
		//if datepicker-toggle="" is not present or true by default
		if (checkToggle()) {

		  thisInput.on('focus click focusin', function onFocusAndClick() {

			isMouseOnInput = true;

			if (!isMouseOn &&
			!isMouseOnInput && theCalendar) {

			  $scope.hideCalendar();
			} else {

			  showCalendar();
			}
		  });
		}

		thisInput.on('focusout blur', function onBlurAndFocusOut() {

		  isMouseOnInput = false;
		});
		//some tricky dirty events to fire if click is outside of the calendar and show/hide calendar when needed
		angular.element(theCalendar).on('mouseenter', function onMouseEnter() {

		  isMouseOn = true;
		});

		angular.element(theCalendar).on('mouseleave', function onMouseLeave() {

		  isMouseOn = false;
		});

		angular.element(theCalendar).on('focusin', function onCalendarFocus() {

		  isMouseOn = true;
		});

		angular.element($window).on('click focus focusin', onClickOnWindow);

		//check always if given range of dates is ok
		if ($scope.dateMinLimit &&
		  !$scope.isSelectableMinYear($scope.year) ||
		  !$scope.isSelectableMinDate($scope.year + '/' + $scope.monthNumber + '/' + $scope.day)) {

		  resetToMinDate();
		}

		if ($scope.dateMaxLimit &&
		  !$scope.isSelectableMaxYear($scope.year) ||
		  !$scope.isSelectableMaxDate($scope.year + '/' + $scope.monthNumber + '/' + $scope.day)) {

		  resetToMaxDate();
		}

		//datepicker boot start
		$scope.paginateYears($scope.year);

		setDaysInMonth($scope.monthNumber, $scope.year);
		$scope.checkVisibility = checkVisibility;

		$scope.$on('$destroy', function unregisterListener() {

		  unregisterDataSetWatcher();
		  thisInput.off('focus click focusout blur');
		  angular.element(theCalendar).off('mouseenter mouseleave focusin');
		  angular.element($window).off('click focus focusin', onClickOnWindow);
		});
	  };

	  return {
		'restrict': 'AEC',
		'scope': {
		  'dateSet': '@',
		  'dateMinLimit': '@',
		  'dateMaxLimit': '@',
		  'dateMonthTitle': '@',
		  'dateYearTitle': '@',
		  'buttonNextTitle': '@',
		  'buttonPrevTitle': '@',
		  'dateDisabledDates': '@',
		  'dateSetHidden': '@',
		  'dateTyper': '@',
		  'datepickerAppendTo': '@',
		  'datepickerToggle': '@',
		  'datepickerClass': '@',
		  'datepickerShow': '@'
		},
		'link': linkingFunction
	  };
	};

  angular.module('720kb.datepicker', [])
			   .directive('datepicker', ['$window', '$compile', '$locale', '$filter', '$interpolate', datepickerDirective]);
}(angular, navigator));

/*!
 * Datepicker for Bootstrap v1.7.0-dev (https://github.com/eternicode/bootstrap-datepicker)
 *
 * Copyright 2012 Stefan Petre
 * Improvements by Andrew Rowls
 * Licensed under the Apache License v2.0 (http://www.apache.org/licenses/LICENSE-2.0)
 */
!function(a){"function"==typeof define&&define.amd?define(["jquery"],a):a("object"==typeof exports?require("jquery"):jQuery)}(function(a,b){function c(){return new Date(Date.UTC.apply(Date,arguments))}function d(){var a=new Date;return c(a.getFullYear(),a.getMonth(),a.getDate())}function e(a,b){return a.getUTCFullYear()===b.getUTCFullYear()&&a.getUTCMonth()===b.getUTCMonth()&&a.getUTCDate()===b.getUTCDate()}function f(a){return function(){return this[a].apply(this,arguments)}}function g(a){return a&&!isNaN(a.getTime())}function h(b,c){function d(a,b){return b.toLowerCase()}var e,f=a(b).data(),g={},h=new RegExp("^"+c.toLowerCase()+"([A-Z])");c=new RegExp("^"+c.toLowerCase());for(var i in f)c.test(i)&&(e=i.replace(h,d),g[e]=f[i]);return g}function i(b){var c={};if(q[b]||(b=b.split("-")[0],q[b])){var d=q[b];return a.each(p,function(a,b){b in d&&(c[b]=d[b])}),c}}var j=function(){var b={get:function(a){return this.slice(a)[0]},contains:function(a){for(var b=a&&a.valueOf(),c=0,d=this.length;d>c;c++)if(this[c].valueOf()===b)return c;return-1},remove:function(a){this.splice(a,1)},replace:function(b){b&&(a.isArray(b)||(b=[b]),this.clear(),this.push.apply(this,b))},clear:function(){this.length=0},copy:function(){var a=new j;return a.replace(this),a}};return function(){var c=[];return c.push.apply(c,arguments),a.extend(c,b),c}}(),k=function(b,c){a(b).data("datepicker",this),this._process_options(c),this.dates=new j,this.viewDate=this.o.defaultViewDate,this.focusDate=null,this.element=a(b),this.isInput=this.element.is("input"),this.inputField=this.isInput?this.element:this.element.find("input"),this.component=this.element.hasClass("date")?this.element.find(".add-on, .input-group-addon, .btn"):!1,this.hasInput=this.component&&this.inputField.length,this.component&&0===this.component.length&&(this.component=!1),this.isInline=!this.component&&this.element.is("div"),this.picker=a(r.template),this._check_template(this.o.templates.leftArrow)&&this.picker.find(".prev").html(this.o.templates.leftArrow),this._check_template(this.o.templates.rightArrow)&&this.picker.find(".next").html(this.o.templates.rightArrow),this._buildEvents(),this._attachEvents(),this.isInline?this.picker.addClass("datepicker-inline").appendTo(this.element):this.picker.addClass("datepicker-dropdown dropdown-menu"),this.o.rtl&&this.picker.addClass("datepicker-rtl"),this.viewMode=this.o.startView,this.o.calendarWeeks&&this.picker.find("thead .datepicker-title, tfoot .today, tfoot .clear").attr("colspan",function(a,b){return parseInt(b)+1}),this._allow_update=!1,this.setStartDate(this._o.startDate),this.setEndDate(this._o.endDate),this.setDaysOfWeekDisabled(this.o.daysOfWeekDisabled),this.setDaysOfWeekHighlighted(this.o.daysOfWeekHighlighted),this.setDatesDisabled(this.o.datesDisabled),this.fillDow(),this.fillMonths(),this._allow_update=!0,this.update(),this.showMode(),this.isInline&&this.show()};k.prototype={constructor:k,_resolveViewName:function(a,c){return 0===a||"days"===a||"month"===a?0:1===a||"months"===a||"year"===a?1:2===a||"years"===a||"decade"===a?2:3===a||"decades"===a||"century"===a?3:4===a||"centuries"===a||"millennium"===a?4:c===b?!1:c},_check_template:function(c){try{if(c===b||""===c)return!1;if((c.match(/[<>]/g)||[]).length<=0)return!0;var d=a(c);return d.length>0}catch(e){return!1}},_process_options:function(b){this._o=a.extend({},this._o,b);var e=this.o=a.extend({},this._o),f=e.language;q[f]||(f=f.split("-")[0],q[f]||(f=o.language)),e.language=f,e.startView=this._resolveViewName(e.startView,0),e.minViewMode=this._resolveViewName(e.minViewMode,0),e.maxViewMode=this._resolveViewName(e.maxViewMode,4),e.startView=Math.min(e.startView,e.maxViewMode),e.startView=Math.max(e.startView,e.minViewMode),e.multidate!==!0&&(e.multidate=Number(e.multidate)||!1,e.multidate!==!1&&(e.multidate=Math.max(0,e.multidate))),e.multidateSeparator=String(e.multidateSeparator),e.weekStart%=7,e.weekEnd=(e.weekStart+6)%7;var g=r.parseFormat(e.format);e.startDate!==-(1/0)&&(e.startDate?e.startDate instanceof Date?e.startDate=this._local_to_utc(this._zero_time(e.startDate)):e.startDate=r.parseDate(e.startDate,g,e.language,e.assumeNearbyYear):e.startDate=-(1/0)),e.endDate!==1/0&&(e.endDate?e.endDate instanceof Date?e.endDate=this._local_to_utc(this._zero_time(e.endDate)):e.endDate=r.parseDate(e.endDate,g,e.language,e.assumeNearbyYear):e.endDate=1/0),e.daysOfWeekDisabled=e.daysOfWeekDisabled||[],a.isArray(e.daysOfWeekDisabled)||(e.daysOfWeekDisabled=e.daysOfWeekDisabled.split(/[,\s]*/)),e.daysOfWeekDisabled=a.map(e.daysOfWeekDisabled,function(a){return parseInt(a,10)}),e.daysOfWeekHighlighted=e.daysOfWeekHighlighted||[],a.isArray(e.daysOfWeekHighlighted)||(e.daysOfWeekHighlighted=e.daysOfWeekHighlighted.split(/[,\s]*/)),e.daysOfWeekHighlighted=a.map(e.daysOfWeekHighlighted,function(a){return parseInt(a,10)}),e.datesDisabled=e.datesDisabled||[],a.isArray(e.datesDisabled)||(e.datesDisabled=[e.datesDisabled]),e.datesDisabled=a.map(e.datesDisabled,function(a){return r.parseDate(a,g,e.language,e.assumeNearbyYear)});var h=String(e.orientation).toLowerCase().split(/\s+/g),i=e.orientation.toLowerCase();if(h=a.grep(h,function(a){return/^auto|left|right|top|bottom$/.test(a)}),e.orientation={x:"auto",y:"auto"},i&&"auto"!==i)if(1===h.length)switch(h[0]){case"top":case"bottom":e.orientation.y=h[0];break;case"left":case"right":e.orientation.x=h[0]}else i=a.grep(h,function(a){return/^left|right$/.test(a)}),e.orientation.x=i[0]||"auto",i=a.grep(h,function(a){return/^top|bottom$/.test(a)}),e.orientation.y=i[0]||"auto";else;if(e.defaultViewDate){var j=e.defaultViewDate.year||(new Date).getFullYear(),k=e.defaultViewDate.month||0,l=e.defaultViewDate.day||1;e.defaultViewDate=c(j,k,l)}else e.defaultViewDate=d()},_events:[],_secondaryEvents:[],_applyEvents:function(a){for(var c,d,e,f=0;f<a.length;f++)c=a[f][0],2===a[f].length?(d=b,e=a[f][1]):3===a[f].length&&(d=a[f][1],e=a[f][2]),c.on(e,d)},_unapplyEvents:function(a){for(var c,d,e,f=0;f<a.length;f++)c=a[f][0],2===a[f].length?(e=b,d=a[f][1]):3===a[f].length&&(e=a[f][1],d=a[f][2]),c.off(d,e)},_buildEvents:function(){var b={keyup:a.proxy(function(b){-1===a.inArray(b.keyCode,[27,37,39,38,40,32,13,9])&&this.update()},this),keydown:a.proxy(this.keydown,this),paste:a.proxy(this.paste,this)};this.o.showOnFocus===!0&&(b.focus=a.proxy(this.show,this)),this.isInput?this._events=[[this.element,b]]:this.component&&this.hasInput?this._events=[[this.inputField,b],[this.component,{click:a.proxy(this.show,this)}]]:this._events=[[this.element,{click:a.proxy(this.show,this),keydown:a.proxy(this.keydown,this)}]],this._events.push([this.element,"*",{blur:a.proxy(function(a){this._focused_from=a.target},this)}],[this.element,{blur:a.proxy(function(a){this._focused_from=a.target},this)}]),this.o.immediateUpdates&&this._events.push([this.element,{"changeYear changeMonth":a.proxy(function(a){this.update(a.date)},this)}]),this._secondaryEvents=[[this.picker,{click:a.proxy(this.click,this)}],[a(window),{resize:a.proxy(this.place,this)}],[a(document),{mousedown:a.proxy(function(a){this.element.is(a.target)||this.element.find(a.target).length||this.picker.is(a.target)||this.picker.find(a.target).length||this.isInline||this.hide()},this)}]]},_attachEvents:function(){this._detachEvents(),this._applyEvents(this._events)},_detachEvents:function(){this._unapplyEvents(this._events)},_attachSecondaryEvents:function(){this._detachSecondaryEvents(),this._applyEvents(this._secondaryEvents)},_detachSecondaryEvents:function(){this._unapplyEvents(this._secondaryEvents)},_trigger:function(b,c){var d=c||this.dates.get(-1),e=this._utc_to_local(d);this.element.trigger({type:b,date:e,dates:a.map(this.dates,this._utc_to_local),format:a.proxy(function(a,b){0===arguments.length?(a=this.dates.length-1,b=this.o.format):"string"==typeof a&&(b=a,a=this.dates.length-1),b=b||this.o.format;var c=this.dates.get(a);return r.formatDate(c,b,this.o.language)},this)})},show:function(){return this.inputField.prop("disabled")||this.inputField.prop("readonly")&&this.o.enableOnReadonly===!1?void 0:(this.isInline||this.picker.appendTo(this.o.container),this.place(),this.picker.show(),this._attachSecondaryEvents(),this._trigger("show"),(window.navigator.msMaxTouchPoints||"ontouchstart"in document)&&this.o.disableTouchKeyboard&&a(this.element).blur(),this)},hide:function(){return this.isInline||!this.picker.is(":visible")?this:(this.focusDate=null,this.picker.hide().detach(),this._detachSecondaryEvents(),this.viewMode=this.o.startView,this.showMode(),this.o.forceParse&&this.inputField.val()&&this.setValue(),this._trigger("hide"),this)},destroy:function(){return this.hide(),this._detachEvents(),this._detachSecondaryEvents(),this.picker.remove(),delete this.element.data().datepicker,this.isInput||delete this.element.data().date,this},paste:function(b){var c;if(b.originalEvent.clipboardData&&b.originalEvent.clipboardData.types&&-1!==a.inArray("text/plain",b.originalEvent.clipboardData.types))c=b.originalEvent.clipboardData.getData("text/plain");else{if(!window.clipboardData)return;c=window.clipboardData.getData("Text")}this.setDate(c),this.update(),b.preventDefault()},_utc_to_local:function(a){return a&&new Date(a.getTime()+6e4*a.getTimezoneOffset())},_local_to_utc:function(a){return a&&new Date(a.getTime()-6e4*a.getTimezoneOffset())},_zero_time:function(a){return a&&new Date(a.getFullYear(),a.getMonth(),a.getDate())},_zero_utc_time:function(a){return a&&new Date(Date.UTC(a.getUTCFullYear(),a.getUTCMonth(),a.getUTCDate()))},getDates:function(){return a.map(this.dates,this._utc_to_local)},getUTCDates:function(){return a.map(this.dates,function(a){return new Date(a)})},getDate:function(){return this._utc_to_local(this.getUTCDate())},getUTCDate:function(){var a=this.dates.get(-1);return"undefined"!=typeof a?new Date(a):null},clearDates:function(){this.inputField&&this.inputField.val(""),this.update(),this._trigger("changeDate"),this.o.autoclose&&this.hide()},setDates:function(){var b=a.isArray(arguments[0])?arguments[0]:arguments;return this.update.apply(this,b),this._trigger("changeDate"),this.setValue(),this},setUTCDates:function(){var b=a.isArray(arguments[0])?arguments[0]:arguments;return this.update.apply(this,a.map(b,this._utc_to_local)),this._trigger("changeDate"),this.setValue(),this},setDate:f("setDates"),setUTCDate:f("setUTCDates"),remove:f("destroy"),setValue:function(){var a=this.getFormattedDate();return this.inputField.val(a),this},getFormattedDate:function(c){c===b&&(c=this.o.format);var d=this.o.language;return a.map(this.dates,function(a){return r.formatDate(a,c,d)}).join(this.o.multidateSeparator)},getStartDate:function(){return this.o.startDate},setStartDate:function(a){return this._process_options({startDate:a}),this.update(),this.updateNavArrows(),this},getEndDate:function(){return this.o.endDate},setEndDate:function(a){return this._process_options({endDate:a}),this.update(),this.updateNavArrows(),this},setDaysOfWeekDisabled:function(a){return this._process_options({daysOfWeekDisabled:a}),this.update(),this.updateNavArrows(),this},setDaysOfWeekHighlighted:function(a){return this._process_options({daysOfWeekHighlighted:a}),this.update(),this},setDatesDisabled:function(a){this._process_options({datesDisabled:a}),this.update(),this.updateNavArrows()},place:function(){if(this.isInline)return this;var b=this.picker.outerWidth(),c=this.picker.outerHeight(),d=10,e=a(this.o.container),f=e.width(),g="body"===this.o.container?a(document).scrollTop():e.scrollTop(),h=e.offset(),i=[];this.element.parents().each(function(){var b=a(this).css("z-index");"auto"!==b&&0!==b&&i.push(parseInt(b))});var j=Math.max.apply(Math,i)+this.o.zIndexOffset,k=this.component?this.component.parent().offset():this.element.offset(),l=this.component?this.component.outerHeight(!0):this.element.outerHeight(!1),m=this.component?this.component.outerWidth(!0):this.element.outerWidth(!1),n=k.left-h.left,o=k.top-h.top;"body"!==this.o.container&&(o+=g),this.picker.removeClass("datepicker-orient-top datepicker-orient-bottom datepicker-orient-right datepicker-orient-left"),"auto"!==this.o.orientation.x?(this.picker.addClass("datepicker-orient-"+this.o.orientation.x),"right"===this.o.orientation.x&&(n-=b-m)):k.left<0?(this.picker.addClass("datepicker-orient-left"),n-=k.left-d):n+b>f?(this.picker.addClass("datepicker-orient-right"),n+=m-b):this.picker.addClass("datepicker-orient-left");var p,q=this.o.orientation.y;if("auto"===q&&(p=-g+o-c,q=0>p?"bottom":"top"),this.picker.addClass("datepicker-orient-"+q),"top"===q?o-=c+parseInt(this.picker.css("padding-top")):o+=l,this.o.rtl){var r=f-(n+m);this.picker.css({top:o,right:r,zIndex:j})}else this.picker.css({top:o,left:n,zIndex:j});return this},_allow_update:!0,update:function(){if(!this._allow_update)return this;var b=this.dates.copy(),c=[],d=!1;return arguments.length?(a.each(arguments,a.proxy(function(a,b){b instanceof Date&&(b=this._local_to_utc(b)),c.push(b)},this)),d=!0):(c=this.isInput?this.element.val():this.element.data("date")||this.inputField.val(),c=c&&this.o.multidate?c.split(this.o.multidateSeparator):[c],delete this.element.data().date),c=a.map(c,a.proxy(function(a){return r.parseDate(a,this.o.format,this.o.language,this.o.assumeNearbyYear)},this)),c=a.grep(c,a.proxy(function(a){return!this.dateWithinRange(a)||!a},this),!0),this.dates.replace(c),this.dates.length?this.viewDate=new Date(this.dates.get(-1)):this.viewDate<this.o.startDate?this.viewDate=new Date(this.o.startDate):this.viewDate>this.o.endDate?this.viewDate=new Date(this.o.endDate):this.viewDate=this.o.defaultViewDate,d?this.setValue():c.length&&String(b)!==String(this.dates)&&this._trigger("changeDate"),!this.dates.length&&b.length&&this._trigger("clearDate"),this.fill(),this.element.change(),this},fillDow:function(){var b=this.o.weekStart,c="<tr>";for(this.o.calendarWeeks&&(this.picker.find(".datepicker-days .datepicker-switch").attr("colspan",function(a,b){return parseInt(b)+1}),c+='<th class="cw">&#160;</th>');b<this.o.weekStart+7;)c+='<th class="dow',a.inArray(b,this.o.daysOfWeekDisabled)>-1&&(c+=" disabled"),c+='">'+q[this.o.language].daysMin[b++%7]+"</th>";c+="</tr>",this.picker.find(".datepicker-days thead").append(c)},fillMonths:function(){for(var a=this._utc_to_local(this.viewDate),b="",c=0;12>c;){var d=a&&a.getMonth()===c?" focused":"";b+='<span class="month'+d+'">'+q[this.o.language].monthsShort[c++]+"</span>"}this.picker.find(".datepicker-months td").html(b)},setRange:function(b){b&&b.length?this.range=a.map(b,function(a){return a.valueOf()}):delete this.range,this.fill()},getClassNames:function(b){var c=[],d=this.viewDate.getUTCFullYear(),e=this.viewDate.getUTCMonth(),f=new Date;return b.getUTCFullYear()<d||b.getUTCFullYear()===d&&b.getUTCMonth()<e?c.push("old"):(b.getUTCFullYear()>d||b.getUTCFullYear()===d&&b.getUTCMonth()>e)&&c.push("new"),this.focusDate&&b.valueOf()===this.focusDate.valueOf()&&c.push("focused"),this.o.todayHighlight&&b.getUTCFullYear()===f.getFullYear()&&b.getUTCMonth()===f.getMonth()&&b.getUTCDate()===f.getDate()&&c.push("today"),-1!==this.dates.contains(b)&&c.push("active"),this.dateWithinRange(b)||c.push("disabled"),this.dateIsDisabled(b)&&c.push("disabled","disabled-date"),-1!==a.inArray(b.getUTCDay(),this.o.daysOfWeekHighlighted)&&c.push("highlighted"),this.range&&(b>this.range[0]&&b<this.range[this.range.length-1]&&c.push("range"),-1!==a.inArray(b.valueOf(),this.range)&&c.push("selected"),b.valueOf()===this.range[0]&&c.push("range-start"),b.valueOf()===this.range[this.range.length-1]&&c.push("range-end")),c},_fill_yearsView:function(c,d,e,f,g,h,i,j){var k,l,m,n,o,p,q,r,s,t,u;for(k="",l=this.picker.find(c),m=parseInt(g/e,10)*e,o=parseInt(h/f,10)*f,p=parseInt(i/f,10)*f,n=a.map(this.dates,function(a){return parseInt(a.getUTCFullYear()/f,10)*f}),l.find(".datepicker-switch").text(m+"-"+(m+9*f)),q=m-f,r=-1;11>r;r+=1)s=[d],t=null,-1===r?s.push("old"):10===r&&s.push("new"),-1!==a.inArray(q,n)&&s.push("active"),(o>q||q>p)&&s.push("disabled"),q===this.viewDate.getFullYear()&&s.push("focused"),j!==a.noop&&(u=j(new Date(q,0,1)),u===b?u={}:"boolean"==typeof u?u={enabled:u}:"string"==typeof u&&(u={classes:u}),u.enabled===!1&&s.push("disabled"),u.classes&&(s=s.concat(u.classes.split(/\s+/))),u.tooltip&&(t=u.tooltip)),k+='<span class="'+s.join(" ")+'"'+(t?' title="'+t+'"':"")+">"+q+"</span>",q+=f;l.find("td").html(k)},fill:function(){var d,e,f=new Date(this.viewDate),g=f.getUTCFullYear(),h=f.getUTCMonth(),i=this.o.startDate!==-(1/0)?this.o.startDate.getUTCFullYear():-(1/0),j=this.o.startDate!==-(1/0)?this.o.startDate.getUTCMonth():-(1/0),k=this.o.endDate!==1/0?this.o.endDate.getUTCFullYear():1/0,l=this.o.endDate!==1/0?this.o.endDate.getUTCMonth():1/0,m=q[this.o.language].today||q.en.today||"",n=q[this.o.language].clear||q.en.clear||"",o=q[this.o.language].titleFormat||q.en.titleFormat;if(!isNaN(g)&&!isNaN(h)){this.picker.find(".datepicker-days .datepicker-switch").text(r.formatDate(f,o,this.o.language)),this.picker.find("tfoot .today").text(m).toggle(this.o.todayBtn!==!1),this.picker.find("tfoot .clear").text(n).toggle(this.o.clearBtn!==!1),this.picker.find("thead .datepicker-title").text(this.o.title).toggle(""!==this.o.title),this.updateNavArrows(),this.fillMonths();var p=c(g,h-1,28),s=r.getDaysInMonth(p.getUTCFullYear(),p.getUTCMonth());p.setUTCDate(s),p.setUTCDate(s-(p.getUTCDay()-this.o.weekStart+7)%7);var t=new Date(p);p.getUTCFullYear()<100&&t.setUTCFullYear(p.getUTCFullYear()),t.setUTCDate(t.getUTCDate()+42),t=t.valueOf();for(var u,v=[];p.valueOf()<t;){if(p.getUTCDay()===this.o.weekStart&&(v.push("<tr>"),this.o.calendarWeeks)){var w=new Date(+p+(this.o.weekStart-p.getUTCDay()-7)%7*864e5),x=new Date(Number(w)+(11-w.getUTCDay())%7*864e5),y=new Date(Number(y=c(x.getUTCFullYear(),0,1))+(11-y.getUTCDay())%7*864e5),z=(x-y)/864e5/7+1;v.push('<td class="cw">'+z+"</td>")}u=this.getClassNames(p),u.push("day"),this.o.beforeShowDay!==a.noop&&(e=this.o.beforeShowDay(this._utc_to_local(p)),e===b?e={}:"boolean"==typeof e?e={enabled:e}:"string"==typeof e&&(e={classes:e}),e.enabled===!1&&u.push("disabled"),e.classes&&(u=u.concat(e.classes.split(/\s+/))),e.tooltip&&(d=e.tooltip)),u=a.unique(u),v.push('<td class="'+u.join(" ")+'"'+(d?' title="'+d+'"':"")+(this.o.dateCells?' data-date="'+p.getTime().toString()+'"':"")+">"+p.getUTCDate()+"</td>"),d=null,p.getUTCDay()===this.o.weekEnd&&v.push("</tr>"),p.setUTCDate(p.getUTCDate()+1)}this.picker.find(".datepicker-days tbody").empty().append(v.join(""));var A=q[this.o.language].monthsTitle||q.en.monthsTitle||"Months",B=this.picker.find(".datepicker-months").find(".datepicker-switch").text(this.o.maxViewMode<2?A:g).end().find("span").removeClass("active");if(a.each(this.dates,function(a,b){b.getUTCFullYear()===g&&B.eq(b.getUTCMonth()).addClass("active")}),(i>g||g>k)&&B.addClass("disabled"),g===i&&B.slice(0,j).addClass("disabled"),g===k&&B.slice(l+1).addClass("disabled"),this.o.beforeShowMonth!==a.noop){var C=this;a.each(B,function(c,d){var e=new Date(g,c,1),f=C.o.beforeShowMonth(e);f===b?f={}:"boolean"==typeof f?f={enabled:f}:"string"==typeof f&&(f={classes:f}),f.enabled!==!1||a(d).hasClass("disabled")||a(d).addClass("disabled"),f.classes&&a(d).addClass(f.classes),f.tooltip&&a(d).prop("title",f.tooltip)})}this._fill_yearsView(".datepicker-years","year",10,1,g,i,k,this.o.beforeShowYear),this._fill_yearsView(".datepicker-decades","decade",100,10,g,i,k,this.o.beforeShowDecade),this._fill_yearsView(".datepicker-centuries","century",1e3,100,g,i,k,this.o.beforeShowCentury)}},updateNavArrows:function(){if(this._allow_update){var a=new Date(this.viewDate),b=a.getUTCFullYear(),c=a.getUTCMonth();switch(this.viewMode){case 0:this.o.startDate!==-(1/0)&&b<=this.o.startDate.getUTCFullYear()&&c<=this.o.startDate.getUTCMonth()?this.picker.find(".prev").addClass("disabled"):this.picker.find(".prev").removeClass("disabled"),this.o.endDate!==1/0&&b>=this.o.endDate.getUTCFullYear()&&c>=this.o.endDate.getUTCMonth()?this.picker.find(".next").addClass("disabled"):this.picker.find(".next").removeClass("disabled");break;case 1:case 2:case 3:case 4:this.o.startDate!==-(1/0)&&b<=this.o.startDate.getUTCFullYear()||this.o.maxViewMode<2?this.picker.find(".prev").addClass("disabled"):this.picker.find(".prev").removeClass("disabled"),this.o.endDate!==1/0&&b>=this.o.endDate.getUTCFullYear()||this.o.maxViewMode<2?this.picker.find(".next").addClass("disabled"):this.picker.find(".next").removeClass("disabled")}}},click:function(b){b.preventDefault(),b.stopPropagation();var e,f,g,h,i,j,k;e=a(b.target),e.hasClass("datepicker-switch")&&this.showMode(1);var l=e.closest(".prev, .next");l.length>0&&(f=r.modes[this.viewMode].navStep*(l.hasClass("prev")?-1:1),0===this.viewMode?(this.viewDate=this.moveMonth(this.viewDate,f),this._trigger("changeMonth",this.viewDate)):(this.viewDate=this.moveYear(this.viewDate,f),1===this.viewMode&&this._trigger("changeYear",this.viewDate)),this.fill()),e.hasClass("today")&&!e.hasClass("day")&&(this.showMode(-2),this._setDate(d(),"linked"===this.o.todayBtn?null:"view")),e.hasClass("clear")&&this.clearDates(),e.hasClass("disabled")||(e.hasClass("day")&&(g=parseInt(e.text(),10)||1,h=this.viewDate.getUTCFullYear(),i=this.viewDate.getUTCMonth(),e.hasClass("old")&&(0===i?(i=11,h-=1,j=!0,k=!0):(i-=1,j=!0)),e.hasClass("new")&&(11===i?(i=0,h+=1,j=!0,k=!0):(i+=1,j=!0)),this._setDate(c(h,i,g)),k&&this._trigger("changeYear",this.viewDate),j&&this._trigger("changeMonth",this.viewDate)),e.hasClass("month")&&(this.viewDate.setUTCDate(1),g=1,i=e.parent().find("span").index(e),h=this.viewDate.getUTCFullYear(),this.viewDate.setUTCMonth(i),this._trigger("changeMonth",this.viewDate),1===this.o.minViewMode?(this._setDate(c(h,i,g)),this.showMode()):this.showMode(-1),this.fill()),(e.hasClass("year")||e.hasClass("decade")||e.hasClass("century"))&&(this.viewDate.setUTCDate(1),g=1,i=0,h=parseInt(e.text(),10)||0,this.viewDate.setUTCFullYear(h),e.hasClass("year")&&(this._trigger("changeYear",this.viewDate),2===this.o.minViewMode&&this._setDate(c(h,i,g))),e.hasClass("decade")&&(this._trigger("changeDecade",this.viewDate),3===this.o.minViewMode&&this._setDate(c(h,i,g))),e.hasClass("century")&&(this._trigger("changeCentury",this.viewDate),4===this.o.minViewMode&&this._setDate(c(h,i,g))),this.showMode(-1),this.fill())),this.picker.is(":visible")&&this._focused_from&&a(this._focused_from).focus(),delete this._focused_from},_toggle_multidate:function(a){var b=this.dates.contains(a);if(a||this.dates.clear(),-1!==b?(this.o.multidate===!0||this.o.multidate>1||this.o.toggleActive)&&this.dates.remove(b):this.o.multidate===!1?(this.dates.clear(),this.dates.push(a)):this.dates.push(a),"number"==typeof this.o.multidate)for(;this.dates.length>this.o.multidate;)this.dates.remove(0)},_setDate:function(a,b){b&&"date"!==b||this._toggle_multidate(a&&new Date(a)),b&&"view"!==b||(this.viewDate=a&&new Date(a)),this.fill(),this.setValue(),b&&"view"===b||this._trigger("changeDate"),this.inputField&&this.inputField.change(),!this.o.autoclose||b&&"date"!==b||this.hide()},moveDay:function(a,b){var c=new Date(a);return c.setUTCDate(a.getUTCDate()+b),c},moveWeek:function(a,b){return this.moveDay(a,7*b)},moveMonth:function(a,b){if(!g(a))return this.o.defaultViewDate;if(!b)return a;var c,d,e=new Date(a.valueOf()),f=e.getUTCDate(),h=e.getUTCMonth(),i=Math.abs(b);if(b=b>0?1:-1,1===i)d=-1===b?function(){return e.getUTCMonth()===h}:function(){return e.getUTCMonth()!==c},c=h+b,e.setUTCMonth(c),(0>c||c>11)&&(c=(c+12)%12);else{for(var j=0;i>j;j++)e=this.moveMonth(e,b);c=e.getUTCMonth(),e.setUTCDate(f),d=function(){return c!==e.getUTCMonth()}}for(;d();)e.setUTCDate(--f),e.setUTCMonth(c);return e},moveYear:function(a,b){return this.moveMonth(a,12*b)},moveAvailableDate:function(a,b,c){do{if(a=this[c](a,b),!this.dateWithinRange(a))return!1;c="moveDay"}while(this.dateIsDisabled(a));return a},weekOfDateIsDisabled:function(b){return-1!==a.inArray(b.getUTCDay(),this.o.daysOfWeekDisabled)},dateIsDisabled:function(b){return this.weekOfDateIsDisabled(b)||a.grep(this.o.datesDisabled,function(a){return e(b,a)}).length>0},dateWithinRange:function(a){return a>=this.o.startDate&&a<=this.o.endDate},keydown:function(a){if(!this.picker.is(":visible"))return void((40===a.keyCode||27===a.keyCode)&&(this.show(),a.stopPropagation()));var b,c,d=!1,e=this.focusDate||this.viewDate;switch(a.keyCode){case 27:this.focusDate?(this.focusDate=null,this.viewDate=this.dates.get(-1)||this.viewDate,this.fill()):this.hide(),a.preventDefault(),a.stopPropagation();break;case 37:case 38:case 39:case 40:if(!this.o.keyboardNavigation||7===this.o.daysOfWeekDisabled.length)break;b=37===a.keyCode||38===a.keyCode?-1:1,0===this.viewMode?a.ctrlKey?(c=this.moveAvailableDate(e,b,"moveYear"),c&&this._trigger("changeYear",this.viewDate)):a.shiftKey?(c=this.moveAvailableDate(e,b,"moveMonth"),c&&this._trigger("changeMonth",this.viewDate)):37===a.keyCode||39===a.keyCode?c=this.moveAvailableDate(e,b,"moveDay"):this.weekOfDateIsDisabled(e)||(c=this.moveAvailableDate(e,b,"moveWeek")):1===this.viewMode?((38===a.keyCode||40===a.keyCode)&&(b=4*b),c=this.moveAvailableDate(e,b,"moveMonth")):2===this.viewMode&&((38===a.keyCode||40===a.keyCode)&&(b=4*b),c=this.moveAvailableDate(e,b,"moveYear")),c&&(this.focusDate=this.viewDate=c,this.setValue(),this.fill(),a.preventDefault());break;case 13:if(!this.o.forceParse)break;e=this.focusDate||this.dates.get(-1)||this.viewDate,this.o.keyboardNavigation&&(this._toggle_multidate(e),d=!0),this.focusDate=null,this.viewDate=this.dates.get(-1)||this.viewDate,this.setValue(),this.fill(),this.picker.is(":visible")&&(a.preventDefault(),a.stopPropagation(),this.o.autoclose&&this.hide());break;case 9:this.focusDate=null,this.viewDate=this.dates.get(-1)||this.viewDate,this.fill(),this.hide()}d&&(this.dates.length?this._trigger("changeDate"):this._trigger("clearDate"),this.inputField&&this.inputField.change())},showMode:function(a){a&&(this.viewMode=Math.max(this.o.minViewMode,Math.min(this.o.maxViewMode,this.viewMode+a))),this.picker.children("div").hide().filter(".datepicker-"+r.modes[this.viewMode].clsName).show(),this.updateNavArrows()}};var l=function(b,c){a(b).data("datepicker",this),this.element=a(b),this.inputs=a.map(c.inputs,function(a){return a.jquery?a[0]:a}),delete c.inputs,n.call(a(this.inputs),c).on("changeDate",a.proxy(this.dateUpdated,this)),this.pickers=a.map(this.inputs,function(b){return a(b).data("datepicker")}),this.updateDates()};l.prototype={updateDates:function(){this.dates=a.map(this.pickers,function(a){return a.getUTCDate()}),this.updateRanges()},updateRanges:function(){var b=a.map(this.dates,function(a){return a.valueOf()});a.each(this.pickers,function(a,c){c.setRange(b)})},dateUpdated:function(b){if(!this.updating){this.updating=!0;var c=a(b.target).data("datepicker");if("undefined"!=typeof c){var d=c.getUTCDate(),e=a.inArray(b.target,this.inputs),f=e-1,g=e+1,h=this.inputs.length;if(-1!==e){if(a.each(this.pickers,function(a,b){b.getUTCDate()||b.setUTCDate(d)}),d<this.dates[f])for(;f>=0&&d<this.dates[f];)this.pickers[f--].setUTCDate(d);else if(d>this.dates[g])for(;h>g&&d>this.dates[g];)this.pickers[g++].setUTCDate(d);this.updateDates(),delete this.updating}}}},remove:function(){a.map(this.pickers,function(a){a.remove()}),delete this.element.data().datepicker}};var m=a.fn.datepicker,n=function(c){var d=Array.apply(null,arguments);d.shift();var e;if(this.each(function(){var b=a(this),f=b.data("datepicker"),g="object"==typeof c&&c;if(!f){var j=h(this,"date"),m=a.extend({},o,j,g),n=i(m.language),p=a.extend({},o,n,j,g);b.hasClass("input-daterange")||p.inputs?(a.extend(p,{inputs:p.inputs||b.find("input").toArray()}),f=new l(this,p)):f=new k(this,p),b.data("datepicker",f)}"string"==typeof c&&"function"==typeof f[c]&&(e=f[c].apply(f,d))}),e===b||e instanceof k||e instanceof l)return this;if(this.length>1)throw new Error("Using only allowed for the collection of a single element ("+c+" function)");return e};a.fn.datepicker=n;var o=a.fn.datepicker.defaults={assumeNearbyYear:!1,autoclose:!1,beforeShowDay:a.noop,beforeShowMonth:a.noop,beforeShowYear:a.noop,beforeShowDecade:a.noop,beforeShowCentury:a.noop,calendarWeeks:!1,clearBtn:!1,toggleActive:!1,daysOfWeekDisabled:[],daysOfWeekHighlighted:[],datesDisabled:[],endDate:1/0,forceParse:!0,format:"mm/dd/yyyy",keyboardNavigation:!0,language:"en",minViewMode:0,maxViewMode:4,multidate:!1,multidateSeparator:",",orientation:"auto",rtl:!1,startDate:-(1/0),startView:0,todayBtn:!1,todayHighlight:!1,weekStart:0,disableTouchKeyboard:!1,enableOnReadonly:!0,showOnFocus:!0,zIndexOffset:10,container:"body",immediateUpdates:!1,dateCells:!1,title:"",templates:{leftArrow:"&laquo;",rightArrow:"&raquo;"}},p=a.fn.datepicker.locale_opts=["format","rtl","weekStart"];a.fn.datepicker.Constructor=k;var q=a.fn.datepicker.dates={en:{days:["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"],daysShort:["Sun","Mon","Tue","Wed","Thu","Fri","Sat"],daysMin:["Su","Mo","Tu","We","Th","Fr","Sa"],months:["January","February","March","April","May","June","July","August","September","October","November","December"],monthsShort:["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"],today:"Today",clear:"Clear",titleFormat:"MM yyyy"}},r={modes:[{clsName:"days",navFnc:"Month",navStep:1},{clsName:"months",navFnc:"FullYear",navStep:1},{clsName:"years",navFnc:"FullYear",navStep:10},{clsName:"decades",navFnc:"FullDecade",navStep:100},{clsName:"centuries",navFnc:"FullCentury",navStep:1e3}],isLeapYear:function(a){return a%4===0&&a%100!==0||a%400===0},getDaysInMonth:function(a,b){return[31,r.isLeapYear(a)?29:28,31,30,31,30,31,31,30,31,30,31][b]},validParts:/dd?|DD?|mm?|MM?|yy(?:yy)?/g,nonpunctuation:/[^ -\/:-@\u5e74\u6708\u65e5\[-`{-~\t\n\r]+/g,parseFormat:function(a){if("function"==typeof a.toValue&&"function"==typeof a.toDisplay)return a;var b=a.replace(this.validParts,"\x00").split("\x00"),c=a.match(this.validParts);if(!b||!b.length||!c||0===c.length)throw new Error("Invalid date format.");return{separators:b,parts:c}},parseDate:function(e,f,g,h){function i(a,b){return b===!0&&(b=10),100>a&&(a+=2e3,a>(new Date).getFullYear()+b&&(a-=100)),a}function j(){var a=this.slice(0,s[n].length),b=s[n].slice(0,a.length);return a.toLowerCase()===b.toLowerCase()}if(!e)return b;if(e instanceof Date)return e;if("string"==typeof f&&(f=r.parseFormat(f)),f.toValue)return f.toValue(e,f,g);var l,m,n,o,p=/([\-+]\d+)([dmwy])/,s=e.match(/([\-+]\d+)([dmwy])/g),t={d:"moveDay",m:"moveMonth",w:"moveWeek",y:"moveYear"},u={yesterday:"-1d",today:"+0d",tomorrow:"+1d"};if(/^[\-+]\d+[dmwy]([\s,]+[\-+]\d+[dmwy])*$/.test(e)){for(e=new Date,n=0;n<s.length;n++)l=p.exec(s[n]),m=parseInt(l[1]),o=t[l[2]],e=k.prototype[o](e,m);return c(e.getUTCFullYear(),e.getUTCMonth(),e.getUTCDate())}if("undefined"!=typeof u[e]&&(e=u[e],s=e.match(/([\-+]\d+)([dmwy])/g),/^[\-+]\d+[dmwy]([\s,]+[\-+]\d+[dmwy])*$/.test(e))){for(e=new Date,n=0;n<s.length;n++)l=p.exec(s[n]),m=parseInt(l[1]),o=t[l[2]],e=k.prototype[o](e,m);return c(e.getUTCFullYear(),e.getUTCMonth(),e.getUTCDate())}s=e&&e.match(this.nonpunctuation)||[],e=new Date;var v,w,x={},y=["yyyy","yy","M","MM","m","mm","d","dd"],z={yyyy:function(a,b){return a.setUTCFullYear(h?i(b,h):b)},yy:function(a,b){return a.setUTCFullYear(h?i(b,h):b)},m:function(a,b){if(isNaN(a))return a;for(b-=1;0>b;)b+=12;for(b%=12,a.setUTCMonth(b);a.getUTCMonth()!==b;)a.setUTCDate(a.getUTCDate()-1);return a},d:function(a,b){return a.setUTCDate(b)}};z.M=z.MM=z.mm=z.m,z.dd=z.d,e=d();var A=f.parts.slice();if(s.length!==A.length&&(A=a(A).filter(function(b,c){return-1!==a.inArray(c,y)}).toArray()),s.length===A.length){var B;for(n=0,B=A.length;B>n;n++){if(v=parseInt(s[n],10),l=A[n],isNaN(v))switch(l){case"MM":w=a(q[g].months).filter(j),v=a.inArray(w[0],q[g].months)+1;break;case"M":w=a(q[g].monthsShort).filter(j),v=a.inArray(w[0],q[g].monthsShort)+1}x[l]=v}var C,D;for(n=0;n<y.length;n++)D=y[n],D in x&&!isNaN(x[D])&&(C=new Date(e),z[D](C,x[D]),isNaN(C)||(e=C))}return e},formatDate:function(b,c,d){if(!b)return"";if("string"==typeof c&&(c=r.parseFormat(c)),
c.toDisplay)return c.toDisplay(b,c,d);var e={d:b.getUTCDate(),D:q[d].daysShort[b.getUTCDay()],DD:q[d].days[b.getUTCDay()],m:b.getUTCMonth()+1,M:q[d].monthsShort[b.getUTCMonth()],MM:q[d].months[b.getUTCMonth()],yy:b.getUTCFullYear().toString().substring(2),yyyy:b.getUTCFullYear()};e.dd=(e.d<10?"0":"")+e.d,e.mm=(e.m<10?"0":"")+e.m,b=[];for(var f=a.extend([],c.separators),g=0,h=c.parts.length;h>=g;g++)f.length&&b.push(f.shift()),b.push(e[c.parts[g]]);return b.join("")},headTemplate:'<thead><tr><th colspan="7" class="datepicker-title"></th></tr><tr><th class="prev">&laquo;</th><th colspan="5" class="datepicker-switch"></th><th class="next">&raquo;</th></tr></thead>',contTemplate:'<tbody><tr><td colspan="7"></td></tr></tbody>',footTemplate:'<tfoot><tr><th colspan="7" class="today"></th></tr><tr><th colspan="7" class="clear"></th></tr></tfoot>'};r.template='<div class="datepicker"><div class="datepicker-days"><table class="table-condensed">'+r.headTemplate+"<tbody></tbody>"+r.footTemplate+'</table></div><div class="datepicker-months"><table class="table-condensed">'+r.headTemplate+r.contTemplate+r.footTemplate+'</table></div><div class="datepicker-years"><table class="table-condensed">'+r.headTemplate+r.contTemplate+r.footTemplate+'</table></div><div class="datepicker-decades"><table class="table-condensed">'+r.headTemplate+r.contTemplate+r.footTemplate+'</table></div><div class="datepicker-centuries"><table class="table-condensed">'+r.headTemplate+r.contTemplate+r.footTemplate+"</table></div></div>",a.fn.datepicker.DPGlobal=r,a.fn.datepicker.noConflict=function(){return a.fn.datepicker=m,this},a.fn.datepicker.version="1.7.0-dev",a(document).on("focus.datepicker.data-api click.datepicker.data-api",'[data-provide="datepicker"]',function(b){var c=a(this);c.data("datepicker")||(b.preventDefault(),n.call(c,"show"))}),a(function(){n.call(a('[data-provide="datepicker-inline"]'))})});

'use strict';
$(document).on('keydown', function (e) {
	if(e.which === 8 && e.target.nodeName !== 'INPUT' && e.target.nodeName !== 'SELECT' ){
		e.preventDefault();
	}
});

angular.module('eventApp', ['ngRoute', 'ngMessages', 'firebase', 'ui.timepicker', '720kb.datepicker'])

	.config(['$routeProvider', function ($routeProvider) {
		$routeProvider
		.when('/', {
			controller: 'AppController',
			controllerAs: 'app'
		})
		.when('/contact', {
			templateUrl: 'contact/templates/contactus.html',
			controller: 'AppController',
			controllerAs: 'app'
		})
		.when('/signin', {
			templateUrl: 'signIn/templates/signIn.html',
			controller: 'SignInCtrl'
		})
		.when('/signin/:email', {
			templateUrl: 'signIn/templates/signIn.html',
			controller: 'SignInCtrl'
		})
		.when('/register', {
			templateUrl: 'register/templates/register.html',
			controller: 'RegisterCtrl'
		})
		.when('/event', {
			templateUrl: 'events/templates/event.html',
			controller: 'EventController'
		})
		.when('/allevents', {
			templateUrl: 'events/templates/allEventsDetails.html',
			controller: 'EventController'
		})
		.otherwise({
			redirectTo: '/contact'
		});
	}])

	.controller('AppController', ['$scope', '$document', '$rootScope', '$location', '$routeParams', '$firebaseObject', '$firebaseArray','$timeout', 'EventService', function ($scope, $document, $rootScope, $location, $routeParams, $firebaseObject, $firebaseArray, $timeout, EventService) {
		// parent controller for the app
		$scope.isLoggedIn = false;
		$scope.signInFailure = false;
		$scope.isRegistered = false;

		$scope.signinWindow = function(){
			$timeout( function() {
				document.getElementById('signinemail').focus ();
			}, 500);
		};

		$scope.registerWindow = function(){
			$timeout( function() {
				document.getElementById('registername').focus ();
			}, 500);
			$scope.regForm.$setUntouched();
			$scope.regForm.$setPristine ();
		};

		$scope.resetUser = function () {
			$scope.user = {};
		};

		var URL = 'https://scurve.firebaseio.com';
		var ref = new Firebase(URL);

		//    logging out user
		$scope.logOut = function () {
			// ref.unauth ();
			$scope.isLoggedIn = false;
			$scope.isRegistered = false;
			$scope.registerError = false;
			$scope.resetUser ();
			EventService.ClearUser ();
			$scope.events = {};
			$scope.topMenuSelect('contact');
			$location.path('#/home');
			$scope.authUser = null;
			$timeout( function () {
				document.getElementById('signinButton').focus ();
			}, 1000);
		};

		//        signin user
		$scope.signIn = function (e) {
			e.preventDefault();
			var email = $scope.user.email;
			var password = $scope.user.password;

			// Sign in to Firebase
			ref.authWithPassword ( {
				email: email,
				password: password
			}, authHandler); 
		};

		function authHandler (error, authData) {
			if (error){
				$timeout (function() {
					$scope.signInFailure = true;
				}, 0);
				//	console.log('Error login in: ' + error);
			} else {
				$timeout(function () {
					$scope.isLoggedIn = true;
					$scope.signInFailure = false;
				}, 0);
				$scope.authUser = authData.uid;
				$timeout(gotoNewEvent, 500);
			}
		}

		function gotoNewEvent () {
			$scope.topMenuSelect('edit');
			//  initialize service locally
			EventService.addUser (
						{email: $scope.email
						});
			$location.path('/event/');
		}

		//        register user
		$scope.registerUser = function (e) {
			e.preventDefault();
			var email = $scope.user.email;
			var name = $scope.user.name;
			var password = $scope.user.password;
			var title = $scope.user.title;
			// var newUser = {
			// 	name: name,
			// 	email: email,
			// 	title: title
			// };
			ref.createUser ( {
				email: email,
				password: password,
				name: name,
				title: title
			},
			function (error, userData) {
				if (error) {
					console.log('Error creating user: ' + error);
					$timeout(function () {
						$scope.registerError = true;
					}, 1000);
				} else {
					$timeout(function () {
						$scope.isRegistered = true;
						$scope.registerError = false;
					// $scope.users.addUser(newUser); //register user
					}, 500);
				}
			});
		};

		$scope.contactMenuIsSelected = true;

		$scope.topMenuSelect = function (menuItem) {
			// set menu item active
			switch (menuItem) {
			case 'contact':
				$scope.contactMenuIsSelected = true;
				$scope.editMenuIsSelected = false;
				$scope.allMenuIsSelected = false;
				break;
			case 'edit':
				if ( $scope.isLoggedIn ) {
					$scope.contactMenuIsSelected = false;
					$scope.editMenuIsSelected = true;
					$scope.allMenuIsSelected = false;
				} else {
					$scope.contactMenuIsSelected = true;
				}
				break;
			case 'all':
				if ( $scope.isLoggedIn ){
					// console.log('selected: ' + menuItem);
					$scope.contactMenuIsSelected = false;
					$scope.editMenuIsSelected = false;
					$scope.allMenuIsSelected = true;
				} else {
					$scope.contactMenuIsSelected = true;
				}
				break;
			}
		};
	}])

	.service('EventService', function () {
		// used to provide data service if needed. Actually persisted at firebase
		var event = this;
		var users = [];
		event.getUser = function (email) {
			if (users.length === 1){
				return users[0];
			} else {
				return null;
			}
		};
		event.addUser = function (user) {
			users.push(user);
		};
		event.ClearUser = function(){
			users = [];
		};

	})
	
	.directive('notLoggedin', function () {
		return {
			restrict: 'E',
			templateUrl: 'welcome/templates/welcome.html',
			controller: 'AppController'
		};
	})

	.directive('emailIsvalid', ['$timeout', function($timeout){
		// guest list directive: check for valid email list
		return {
			restrict: 'A',
			require: 'ngModel',
			link: function(scope, element, attr, ctrl){
				function guestList(guestsAddresses){
					var regEx = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
					var isGuestListValid;
					element.on('focus', $timeout(function () {
						isGuestListValid = true;
						var guestList = element.val().replace(/ /g, '');
						guestList = guestList.split(',');
						angular.forEach(guestList, function (item, key) {
							isGuestListValid = isGuestListValid && regEx.test(item);
						});
						// console.log('guestlist is valid? ' + isGuestListValid);
						ctrl.$setViewValue(element.val ());
						ctrl.$render ();
						ctrl.$setValidity('guestAddressList', isGuestListValid);
						return guestsAddresses;
					}, 0));
					return guestsAddresses;
				}
				ctrl.$parsers.push(guestList);
			}
		};
	}])

	.directive('eventDetails', function () {
		return{
			restrict: 'EA',
//            require: 'ngModel',
			templateUrl: 'events/templates/eventDetails.html',
			controller: 'EventController'
		};
	})

	.directive('geteventLocation',[ '$timeout', function ($timeout) {
		// used for location autocomplete
		return {
			restrict: 'A',
			require: 'ngModel',
			link: function (scope, element, attr, ctrl) {
				function getLocation (fieldValue) {
					element.on('change', function () { //try on blur
						$timeout(showValue, 0);
					});
					function showValue () {
						ctrl.$setViewValue(element.val());
						ctrl.$render();
						// element.focus();
						return fieldValue;
					}
					element.focus();
					return fieldValue;
				}
				ctrl.$parsers.push(getLocation);
			}
		};
	}])

	.directive('strongPassword', function () {
		// strong password enforcement
		return{
			restrict: 'A',
			require: 'ngModel',
			link: function (scope, element, attr, ctrl) {
				function customValidator (ngPasswordValue) {
					if (/[a-z]/.test(ngPasswordValue)) {
						ctrl.$setValidity('lowercaseValidator', true);
					}
					else{
						ctrl.$setValidity('lowercaseValidator', false);
					}
					if (/[A-Z]/.test(ngPasswordValue)){
						ctrl.$setValidity('uppercaseValidator', true);
					}
					else{
						ctrl.$setValidity('uppercaseValidator', false);
					}
					if (/[0-9]/.test(ngPasswordValue)){
						ctrl.$setValidity('numberValidator', true);
					}
					else{
						ctrl.$setValidity('numberValidator', false);
					}
					if (/\W+/.test(ngPasswordValue)){
						ctrl.$setValidity('specialCharValidator', true);
					}
					else{
						ctrl.$setValidity('specialCharValidator', false);
					}
					if (ngPasswordValue.length >= 8){
						ctrl.$setValidity('lengthValidator', true);
					} else{
						ctrl.$setValidity('lengthValidator', false);
					}
					return ngPasswordValue;
				}
				ctrl.$parsers.push(customValidator);
			}
		};
	})

	.directive('titleBar', function () {
		return{
			restrict: 'AE',
			scope: '=',
			controller: 'AppController',
			templateUrl: 'signIn/templates/titlebar.html'
		};
	})

	.controller('EventController', ['$scope', '$document', '$location', '$routeParams', '$filter', '$firebaseArray', '$timeout', function ($scope, $document, $location, $routeParams, $filter, $firebaseArray, $timeout) {
		// controller to manage events operations (CRUD)
		window.onkeydown = function (e) {
			if (e.keyCode == 8 && e.target == document.body)
				e.preventDefault();
		};

		// var that = this;
		$scope.event = {};
		$scope.user = {};
		$scope.events = {};
		$scope.selectedEvent = null;
		$scope.readOnly = false;
		$scope.isEditing =false;
		$scope.validateSelection = false;
		$scope.endDateIsSet = false;
		$scope.eventCreatedSuccess = false;
		$scope.eventEditedSuccess = false;
		
		var timeDelta = 2; // 2hours default delta between start time and end time
		var selectedEventIndex;

		if ( !$scope.isEditing ) {
			initDateTime();
		}

		$scope.timePickerOptions = {
			step: 30,
			timeFormat: 'g:ia',
			appendTo: 'body'
		};

		function initDateTime () {
			// initializes dates and times
			var rightNow = new Date();
			$scope.event.eventStartDate = $filter('date')(new Date(rightNow), 'M/d/yyyy');
			$scope.event.eventStartTime = rightNow;
			$scope.event.eventEndTime = plusDeltaHours(rightNow, timeDelta);
			// $scope.event.eventEndDate = $filter('date')(new Date(rightNow), 'M/d/yyyy');
			$scope.event.eventEndDate = $filter('date')(new Date($scope.event.eventEndTime), 'M/d/yyyy');
		}

		function plusDeltaHours (thatTime, timeDelta) {
			// add timeDelta to thatTime
			var timePlusDeltaHours = new Date(thatTime); // 1st create a date object
			timePlusDeltaHours.setHours(thatTime.getHours() + timeDelta);
			return timePlusDeltaHours;
		}

		$scope.dateIsValid = function (d) {
			// enforce valid date
			var DATE_REGEXP = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/;
			if (d == null || d == '' || d == undefined) {
				return false;
			}
			if (DATE_REGEXP.test(d)) {
				
				return true;
			}
			return false;
		};

		$scope.timeIsValid = function (t) {
			// enforce valid time
			var TIME_REGEXP = /^(\d{1,2}):(\d{1,2})\s(am|AM|pm|PM)$/;
			if (t == null || t == '' || t == undefined) {
				return false;
			}
			if (t instanceof Date) {
				var aTime = $filter('date')(new Date(t), 'shortTime');
				return TIME_REGEXP.test(aTime);			
			}
			return false;
		};

		$('#eventStartDate').on('change', function () {
			// Adjust startDate, endDate, startTime and endTime
				// var currentDate = new Date($('#eventStartTime').timepicker('getTime'));
			var currentDate = new Date($scope.event.eventStartTime);
			var newDate = new Date($scope.event.eventStartDate);
			newDate.setHours(currentDate.getHours());
			newDate.setMinutes(currentDate.getMinutes());
			$scope.event.eventStartTime = newDate;
			if (new Date($scope.event.eventStartDate) > new Date($scope.event.eventEndDate)) {
				$scope.event.eventEndDate = $scope.event.eventStartDate;
			}

			if ($scope.event.eventStartDate == $scope.event.eventEndDate) {
			// $timeout(function () {
				if (new Date($scope.event.eventStartTime) >= new Date($scope.event.eventEndTime)){
					// $scope.event.eventEndTime = plusDeltaHours(new Date($scope.event.eventStartTime), timeDelta);
					// $scope.event.eventEndDate = $filter('date')($scope.event.eventEndTime, 'M/d/yyyy');
					$scope.event.eventStartTime = $scope.event.eventEndTime;
					$scope.event.eventEndTime = plusDeltaHours(new Date($scope.event.eventStartTime), timeDelta);
				}
			// }, 0);
			}
		});

		$('#eventEndDate').on('change', function () {
			// Adjust startDate, endDate, startTime and endTime
				// var currentDate = new Date($('#eventEndTime').timepicker('getTime'));
			var currentDate = new Date($scope.event.eventEndTime);
			var newDate = new Date($scope.event.eventEndDate);
			newDate.setHours(currentDate.getHours());
			newDate.setMinutes(currentDate.getMinutes());
			$scope.event.eventEndTime = newDate;

			if (new Date($scope.event.eventEndDate) < new Date($scope.event.eventStartDate)) {
				$scope.event.eventStartDate = $scope.event.eventEndDate;
			}

			if ($scope.event.eventEndDate == $scope.event.eventStartDate) {
				// $timeout(function () {
				if ($scope.event.eventStartTime >= $scope.event.eventEndTime){
					$scope.event.eventEndTime = $scope.event.eventStartTime;
					$scope.event.eventStartTime = plusDeltaHours(new Date($scope.event.eventEndTime), -timeDelta);
				}
				// }, 0);
			}
		});

		$('#editedEventStartDate').on('change', function () {
			// Adjust startDate, endDate, startTime and endTime
			if (!$scope.readOnly && $scope.isEditing) {
				var currentDate = new Date($('#editedEventStartTime').timepicker('getTime'));
				//	console.log('current start time ' + currentDate);
				var newDate = new Date($scope.editedEvent.eventStartDate);
				newDate.setHours(currentDate.getHours());
				newDate.setMinutes(currentDate.getMinutes());
				$scope.editedEvent.eventStartTime = newDate;
			}
			if (new Date($scope.editedEvent.eventStartDate) > new Date($scope.editedEvent.eventEndDate)) {
				$scope.editedEvent.eventEndDate = $scope.editedEvent.eventStartDate;
				if (new Date($scope.editedEvent.eventStartTime) > new Date($scope.editedEvent.eventEndTime)){
					$scope.editedEvent.eventStartTime = $scope.editedEvent.eventEndTime;
					$scope.editedEvent.eventEndTime = plusDeltaHours(new Date($scope.editedEvent.eventStartTime), timeDelta);					
				}
			}
		});

		$('#editedEventEndDate').on('change', function () {
			// Adjust startDate, endDate, startTime and endTime
			if (!$scope.readOnly && !$scope.isEditing) {
				var currentDate = new Date($('#editedEventEndTime').timepicker('getTime'));
				//	console.log('current end time ' + currentDate);
				var newDate = new Date($scope.editedEvent.eventEndDate);
				newDate.setHours(currentDate.getHours());
				newDate.setMinutes(currentDate.getMinutes());
				$scope.editedEvent.eventEndTime = newDate;
			}
			if (new Date($scope.editedEvent.eventEndDate) < new Date($scope.editedEvent.eventStartDate)) {
				$scope.editedEvent.eventStartDate = $scope.editedEvent.eventEndDate;
				if (new Date($scope.editedEvent.eventStartTime) > new Date($scope.editedEvent.eventEndTime)){
					$scope.editedEvent.eventEndTime = $scope.event.eventStartTime;
					$scope.editedEvent.eventStartTime = plusDeltaHours(new Date($scope.editedEvent.eventEndTime), -timeDelta);
				}
			}
		});

		$('#eventStartDate').on('keydown', function(e) {
			tabAway(e, '#eventStartTime', '#eventHost');
		});

		$('#eventEndDate').on('keydown', function(e) {
			tabAway(e, '#eventEndTime', '#eventStartTime');
		});

		$('#editedEventStartDate').on('keydown', function(e) {
			tabAway(e, '#editedEventStartTime', '#editedEventHost');
		});

		$('#editedEventEndDate').on('keydown', function(e) {
			tabAway(e, '#editedEventEndTime', '#editedEventStartTime');
		});

		function tabAway (e, el, preEl) {
			// TAB or SHIFT + TAB set focus to next/previous logical input field
			var keyCode = e.keyCode || e.which;
			var specialKey = window.event? event : e;
			if ( specialKey.shiftKey && keyCode == 9) {
				e.preventDefault();
				$(preEl).focus();
			}
			else if (keyCode == 9) {
				e.preventDefault();
				$(el).focus();
			}
		}

		$('#eventStartTime').on('change', function () {
			// Adjust startTime and endTime
			if ($scope.event.eventEndDate == $scope.event.eventStartDate)
			{
				$timeout(function () {
					if ($scope.event.eventStartTime >= $scope.event.eventEndTime) {
						$scope.event.eventEndTime = plusDeltaHours($scope.event.eventStartTime, timeDelta);
						$scope.event.eventEndDate = $filter('date')($scope.event.eventEndTime, 'M/d/yyyy');
					}
				}, 0);
			}
		});

		$('#eventEndTime').on('change', function () {
			// Adjust startTime and endTime
			if ($scope.event.eventEndDate == $scope.event.eventStartDate)
			{
				$timeout(function () {
					if ($scope.event.eventStartTime >= $scope.event.eventEndTime) {
						$scope.event.eventStartTime = plusDeltaHours($scope.event.eventEndTime, -timeDelta);
						$scope.event.eventStartDate = $filter('date')($scope.event.eventStartTime, 'M/d/yyyy');
					}
				}, 0);
			}
		});

		$('#editedEventStartTime').on('change', function () {
			// Adjust startTime and endTime
			if ($scope.editedEvent.eventEndDate == $scope.editedEvent.eventStartDate)
			{
				$timeout(function () {
					if ($scope.editedEvent.eventStartTime >= $scope.editedEvent.eventEndTime) {
						$scope.editedEvent.eventEndTime = plusDeltaHours($scope.editedEvent.eventStartTime, timeDelta);
						$scope.editedEvent.eventEndDate = $filter('date')($scope.editedEvent.eventEndTime, 'M/d/yyyy');
					}
				}, 0);
			}
		});

		$('#editedEventEndTime').on('change', function () {
			// Adjust startTime and endTime
			if ($scope.editedEvent.eventEndDate == $scope.editedEvent.eventStartDate)
			{
				$timeout(function () {
					if ($scope.editedEvent.eventStartTime >= $scope.editedEvent.eventEndTime) {
						$scope.editedEvent.eventStartTime = plusDeltaHours($scope.editedEvent.eventStartTime, -timeDelta);
						$scope.editedEvent.eventStartDate = $filter('date')($scope.editedEvent.eventStartTime, 'M/d/yyyy');
					}
				}, 0);
			}

			var newDate = $filter('date')($scope.editedEvent.eventEndTime, 'M/d/yyyy');
			if (new Date(newDate) > new Date($scope.editedEvent.eventStartDate))
			{
				$scope.editedEvent.eventEndDate = newDate;
			}
		});

		$scope.guestList = function (gList) {
			// compile guest email addresses in a list
			if (gList) {
				var guestList = '';
				gList.forEach (function (guest) {
					guestList +=  guest + ', ';
				});
				return guestList;
			}
			return null;
		};
		var URL = 'https://scurve.firebaseio.com/';
		if ($scope.$parent.authUser) {
			// get user events from firebase if user is successfully logged in
			var eventRef = new Firebase(URL + 'xevents/user/' + $scope.authUser);
			$scope.events = $firebaseArray(eventRef);
			$scope.events.$loaded()
					.then(function (x) {
						x === $scope.events;
						// console.log('data loaded successfully');
					})
					.catch(function (error) {
						// console.log('Error reading from Firebase: ' + error);
					});
		}

		$scope.isRequired = function () {
			return true;
		};

		$scope.clearEventForm = function () {
			$scope.event = {};
			initDateTime ();
			document.getElementById('eventName').focus ();
			$scope.validateSelection = false;
			$scope.readOnly = false;
			$scope.isEditing =false;
			$scope.eventForm.$setUntouched();
			$scope.eventForm.$setPristine ();

		};

		$scope.numberOfEvents = function () {
			return $scope.events.length;
		};

		$scope.setMenuActive = function (menuItem) {
			$scope.$parent.topMenuSelect(menuItem);
		};

		$scope.eventListIsEmpty = function () {
			if ($scope.numberOfEvents() === 0) {
				return true;
			} else {
				return false;
			}
		};

		$scope.convertDate = function (mydate) {
			return new Date(mydate);
		};

		$scope.selectEvent = function (myEvent, createStatus, editStatus) {
			$scope.eventCreatedSuccess = createStatus || false;
			$scope.eventEditedSuccess = editStatus || false;
			myEvent.eventStartTime = new Date(myEvent.eventStartTime);
			myEvent.eventEndTime = new Date(myEvent.eventEndTime);
			
			$scope.validateSelection = true;
			$scope.selectedEvent = angular.copy(myEvent); // make deep copy
			$scope.eventSelected = true;
			$scope.readOnly = true;
			$scope.isEditing = false;
			$scope.event = myEvent;
			$scope.eventSelectedId = myEvent.$id;
			selectedEventIndex = $scope.events.$indexFor(myEvent.$id);
			$timeout(function () {
				document.getElementById('editButton').focus();
			}, 0);
		};

		$scope.editEvent = function (myForm, e) {
			e.preventDefault();
			$scope.eventEditedSuccess = false;
			$scope.eventCreatedSuccess = false;
			$scope.readOnly = false;
			$scope.isEditing = true;
			$scope.editedEvent = $scope.selectedEvent; // deep copy of selected event
			$timeout( function () {
				document.getElementById('editedEventName').focus();
				myForm.$setPristine ();
			}, 0);
		};

		$scope.cancelEditing = function (e) {
			e.preventDefault();
			// $scope.readOnly = true;
			// $scope.isEditing =false;
			$scope.selectEvent($scope.event);
		};

		$scope.saveEditedEvent = function(editedEvent){
			$scope.events[selectedEventIndex].eventLocation = editedEvent.eventLocation;
			$scope.events[selectedEventIndex].eventGuestList = editedEvent.eventGuestList;
			if (editedEvent.eventNotesCheck){
				$scope.events[selectedEventIndex].eventNotesCheck = editedEvent.eventNotesCheck;
				$scope.events[selectedEventIndex].eventNotes = editedEvent.eventNotes;
			}
			$scope.events[selectedEventIndex].eventName = editedEvent.eventName;
			$scope.events[selectedEventIndex].eventType = editedEvent.eventType;
			$scope.events[selectedEventIndex].eventHost = editedEvent.eventHost;
			$scope.events[selectedEventIndex].eventStartDate = editedEvent.eventStartDate;
			$scope.events[selectedEventIndex].eventStartTime = editedEvent.eventStartTime.getTime();
			$scope.events[selectedEventIndex].eventEndDate = editedEvent.eventEndDate;
			$scope.events[selectedEventIndex].eventEndTime = editedEvent.eventEndTime.getTime();
			$scope.events.$save($scope.events.$indexFor(editedEvent.$id))
				.then(function(eventRef) {
					eventRef.key === $scope.editedEvent.$id;
					// console.log('Event edited with success');
				});

			// go back to selection mode
			$scope.selectEvent(editedEvent, false, true);
			// $scope.eventEditedSuccess = true;
			$timeout(function () {
				document.getElementById('eventName').focus();
			}, 0);
			// console.log('Finished editing..');
		};

		$scope.deleteEvent = function(eventToDelete) {
			$scope.events.$remove(selectedEventIndex)
			.then(function(eventRef){
					// eventRef.key() === $scope.selectedEvent.$id;
					// console.log('event successfully deleted.. ');
			});
			$scope.setMenuActive('all');
			$location.path('/allevents/');
			// $scope.clearEventForm();
		};

		$scope.createNewEvent = function(newEvent, form, e){
			e.preventDefault();
			var firebaseEvent = {};
			firebaseEvent = angular.copy(newEvent); // make deep copy
			firebaseEvent.eventStartTime = newEvent.eventStartTime.getTime();
			firebaseEvent.eventEndTime = newEvent.eventEndTime.getTime();
			$scope.events.$add(firebaseEvent);
				// present blank form?
			// $scope.clearEventForm(form);
				// or present details of created event?
			$scope.setMenuActive('all');
			$location.path('/allevents/');
				// or present details of created event?
			// $scope.eventCreatedSuccess = true;
			// $scope.selectEvent(newEvent, true);
		};
	}
]);

      var placeSearch, autocomplete, editLocation, editHost;
      var componentForm = {
        street_number: 'short_name',
        route: 'long_name',
        locality: 'long_name',
        administrative_area_level_1: 'short_name',
        country: 'long_name',
        postal_code: 'short_name'
      };

      function initAutocomplete() {
        // Create the autocomplete object, restricting the search to geographical
        // location types.
        autocomplete = new google.maps.places.Autocomplete(
            /** @type {!HTMLInputElement} */(document.getElementById('eventLocation')),
            {types: ['geocode']});

        editLocation = new google.maps.places.Autocomplete(
            /** @type {!HTMLInputElement} */(document.getElementById('editedEventLocation')),
            {types: ['geocode']});
      }

      function fillInAddress() {
        // Get the place details from the autocomplete object.
        var place = autocomplete.getPlace();

        for (var component in componentForm) {
          document.getElementById(component).value = '';
          document.getElementById(component).disabled = false;
        }

        // Get each component of the address from the place details
        // and fill the corresponding field on the form.
        for (var i = 0; i < place.address_components.length; i++) {
          var addressType = place.address_components[i].types[0];
          if (componentForm[addressType]) {
            var val = place.address_components[i][componentForm[addressType]];
            document.getElementById(addressType).value = val;
          }
        }
      }

      // Bias the autocomplete object to the user's geographical location,
      // as supplied by the browser's 'navigator.geolocation' object.
      function geolocate() {
        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(function(position) {
            var geolocation = {
              lat: position.coords.latitude,
              lng: position.coords.longitude
            };
            var circle = new google.maps.Circle({
              center: geolocation,
              radius: position.coords.accuracy
            });
            autocomplete.setBounds(circle.getBounds());
//            placeSearch.setBounds(circle.getBounds());
          });
        }
      }

/*!
 * jquery-timepicker v1.11.1 - A jQuery timepicker plugin inspired by Google Calendar. It supports both mouse and keyboard navigation.
 * Copyright (c) 2016 Jon Thornton - http://jonthornton.github.com/jquery-timepicker/
 * License: MIT
 */

!function(a){"object"==typeof exports&&exports&&"object"==typeof module&&module&&module.exports===exports?a(require("jquery")):"function"==typeof define&&define.amd?define(["jquery"],a):a(jQuery)}(function(a){function b(a){var b=a[0];return b.offsetWidth>0&&b.offsetHeight>0}function c(b){if(b.minTime&&(b.minTime=t(b.minTime)),b.maxTime&&(b.maxTime=t(b.maxTime)),b.durationTime&&"function"!=typeof b.durationTime&&(b.durationTime=t(b.durationTime)),"now"==b.scrollDefault)b.scrollDefault=function(){return b.roundingFunction(t(new Date),b)};else if(b.scrollDefault&&"function"!=typeof b.scrollDefault){var c=b.scrollDefault;b.scrollDefault=function(){return b.roundingFunction(t(c),b)}}else b.minTime&&(b.scrollDefault=function(){return b.roundingFunction(b.minTime,b)});if("string"===a.type(b.timeFormat)&&b.timeFormat.match(/[gh]/)&&(b._twelveHourTime=!0),b.showOnFocus===!1&&-1!=b.showOn.indexOf("focus")&&b.showOn.splice(b.showOn.indexOf("focus"),1),b.disableTimeRanges.length>0){for(var d in b.disableTimeRanges)b.disableTimeRanges[d]=[t(b.disableTimeRanges[d][0]),t(b.disableTimeRanges[d][1])];b.disableTimeRanges=b.disableTimeRanges.sort(function(a,b){return a[0]-b[0]});for(var d=b.disableTimeRanges.length-1;d>0;d--)b.disableTimeRanges[d][0]<=b.disableTimeRanges[d-1][1]&&(b.disableTimeRanges[d-1]=[Math.min(b.disableTimeRanges[d][0],b.disableTimeRanges[d-1][0]),Math.max(b.disableTimeRanges[d][1],b.disableTimeRanges[d-1][1])],b.disableTimeRanges.splice(d,1))}return b}function d(b){var c=b.data("timepicker-settings"),d=b.data("timepicker-list");if(d&&d.length&&(d.remove(),b.data("timepicker-list",!1)),c.useSelect){d=a("<select />",{"class":"ui-timepicker-select"});var g=d}else{d=a("<ul />",{"class":"ui-timepicker-list"});var g=a("<div />",{"class":"ui-timepicker-wrapper",tabindex:-1});g.css({display:"none",position:"absolute"}).append(d)}if(c.noneOption)if(c.noneOption===!0&&(c.noneOption=c.useSelect?"Time...":"None"),a.isArray(c.noneOption)){for(var i in c.noneOption)if(parseInt(i,10)==i){var k=e(c.noneOption[i],c.useSelect);d.append(k)}}else{var k=e(c.noneOption,c.useSelect);d.append(k)}if(c.className&&g.addClass(c.className),(null!==c.minTime||null!==c.durationTime)&&c.showDuration){"function"==typeof c.step?"function":c.step;g.addClass("ui-timepicker-with-duration"),g.addClass("ui-timepicker-step-"+c.step)}var l=c.minTime;"function"==typeof c.durationTime?l=t(c.durationTime()):null!==c.durationTime&&(l=c.durationTime);var n=null!==c.minTime?c.minTime:0,o=null!==c.maxTime?c.maxTime:n+u-1;n>o&&(o+=u),o===u-1&&"string"===a.type(c.timeFormat)&&c.show2400&&(o=u);var p=c.disableTimeRanges,v=0,x=p.length,y=c.step;"function"!=typeof y&&(y=function(){return c.step});for(var i=n,z=0;o>=i;z++,i+=60*y(z)){var A=i,B=s(A,c);if(c.useSelect){var C=a("<option />",{value:B});C.text(B)}else{var C=a("<li />");C.addClass(43200>A%86400?"ui-timepicker-am":"ui-timepicker-pm"),C.data("time",86400>=A?A:A%86400),C.text(B)}if((null!==c.minTime||null!==c.durationTime)&&c.showDuration){var D=r(i-l,c.step);if(c.useSelect)C.text(C.text()+" ("+D+")");else{var E=a("<span />",{"class":"ui-timepicker-duration"});E.text(" ("+D+")"),C.append(E)}}x>v&&(A>=p[v][1]&&(v+=1),p[v]&&A>=p[v][0]&&A<p[v][1]&&(c.useSelect?C.prop("disabled",!0):C.addClass("ui-timepicker-disabled"))),d.append(C)}if(g.data("timepicker-input",b),b.data("timepicker-list",g),c.useSelect)b.val()&&d.val(f(t(b.val()),c)),d.on("focus",function(){a(this).data("timepicker-input").trigger("showTimepicker")}),d.on("blur",function(){a(this).data("timepicker-input").trigger("hideTimepicker")}),d.on("change",function(){m(b,a(this).val(),"select")}),m(b,d.val(),"initial"),b.hide().after(d);else{var F=c.appendTo;"string"==typeof F?F=a(F):"function"==typeof F&&(F=F(b)),F.append(g),j(b,d),d.on("mousedown click","li",function(c){b.off("focus.timepicker"),b.on("focus.timepicker-ie-hack",function(){b.off("focus.timepicker-ie-hack"),b.on("focus.timepicker",w.show)}),h(b)||b[0].focus(),d.find("li").removeClass("ui-timepicker-selected"),a(this).addClass("ui-timepicker-selected"),q(b)&&(b.trigger("hideTimepicker"),d.on("mouseup.timepicker click.timepicker","li",function(a){d.off("mouseup.timepicker click.timepicker"),g.hide()}))})}}function e(b,c){var d,e,f;return"object"==typeof b?(d=b.label,e=b.className,f=b.value):"string"==typeof b?d=b:a.error("Invalid noneOption value"),c?a("<option />",{value:f,"class":e,text:d}):a("<li />",{"class":e,text:d}).data("time",String(f))}function f(a,b){return a=b.roundingFunction(a,b),null!==a?s(a,b):void 0}function g(b){if(b.target!=window){var c=a(b.target);c.closest(".ui-timepicker-input").length||c.closest(".ui-timepicker-wrapper").length||(w.hide(),a(document).unbind(".ui-timepicker"),a(window).unbind(".ui-timepicker"))}}function h(a){var b=a.data("timepicker-settings");return(window.navigator.msMaxTouchPoints||"ontouchstart"in document)&&b.disableTouchKeyboard}function i(b,c,d){if(!d&&0!==d)return!1;var e=b.data("timepicker-settings"),f=!1,d=e.roundingFunction(d,e);return c.find("li").each(function(b,c){var e=a(c);if("number"==typeof e.data("time"))return e.data("time")==d?(f=e,!1):void 0}),f}function j(a,b){b.find("li").removeClass("ui-timepicker-selected");var c=t(l(a),a.data("timepicker-settings"));if(null!==c){var d=i(a,b,c);if(d){var e=d.offset().top-b.offset().top;(e+d.outerHeight()>b.outerHeight()||0>e)&&b.scrollTop(b.scrollTop()+d.position().top-d.outerHeight()),d.addClass("ui-timepicker-selected")}}}function k(b,c){if(""!==this.value&&"timepicker"!=c){var d=a(this);if(!d.is(":focus")||b&&"change"==b.type){var e=d.data("timepicker-settings"),f=t(this.value,e);if(null===f)return void d.trigger("timeFormatError");var g=!1;null!==e.minTime&&f<e.minTime&&null!==e.maxTime&&f>e.maxTime&&(g=!0),a.each(e.disableTimeRanges,function(){return f>=this[0]&&f<this[1]?(g=!0,!1):void 0}),e.forceRoundTime&&(f=e.roundingFunction(f,e));var h=s(f,e);g?m(d,h,"error")&&d.trigger("timeRangeError"):m(d,h)}}}function l(a){return a.is("input")?a.val():a.data("ui-timepicker-value")}function m(a,b,c){if(a.is("input")){a.val(b);var d=a.data("timepicker-settings");d.useSelect&&"select"!=c&&"initial"!=c&&a.data("timepicker-list").val(f(t(b),d))}return a.data("ui-timepicker-value")!=b?(a.data("ui-timepicker-value",b),"select"==c?a.trigger("selectTime").trigger("changeTime").trigger("change","timepicker"):"error"!=c&&a.trigger("changeTime"),!0):(a.trigger("selectTime"),!1)}function n(a){switch(a.keyCode){case 13:case 9:return;default:a.preventDefault()}}function o(c){var d=a(this),e=d.data("timepicker-list");if(!e||!b(e)){if(40!=c.keyCode)return!0;w.show.call(d.get(0)),e=d.data("timepicker-list"),h(d)||d.focus()}switch(c.keyCode){case 13:return q(d)&&w.hide.apply(this),c.preventDefault(),!1;case 38:var f=e.find(".ui-timepicker-selected");return f.length?f.is(":first-child")||(f.removeClass("ui-timepicker-selected"),f.prev().addClass("ui-timepicker-selected"),f.prev().position().top<f.outerHeight()&&e.scrollTop(e.scrollTop()-f.outerHeight())):(e.find("li").each(function(b,c){return a(c).position().top>0?(f=a(c),!1):void 0}),f.addClass("ui-timepicker-selected")),!1;case 40:return f=e.find(".ui-timepicker-selected"),0===f.length?(e.find("li").each(function(b,c){return a(c).position().top>0?(f=a(c),!1):void 0}),f.addClass("ui-timepicker-selected")):f.is(":last-child")||(f.removeClass("ui-timepicker-selected"),f.next().addClass("ui-timepicker-selected"),f.next().position().top+2*f.outerHeight()>e.outerHeight()&&e.scrollTop(e.scrollTop()+f.outerHeight())),!1;case 27:e.find("li").removeClass("ui-timepicker-selected"),w.hide();break;case 9:w.hide();break;default:return!0}}function p(c){var d=a(this),e=d.data("timepicker-list"),f=d.data("timepicker-settings");if(!e||!b(e)||f.disableTextInput)return!0;switch(c.keyCode){case 96:case 97:case 98:case 99:case 100:case 101:case 102:case 103:case 104:case 105:case 48:case 49:case 50:case 51:case 52:case 53:case 54:case 55:case 56:case 57:case 65:case 77:case 80:case 186:case 8:case 46:f.typeaheadHighlight?j(d,e):e.hide()}}function q(a){var b=a.data("timepicker-settings"),c=a.data("timepicker-list"),d=null,e=c.find(".ui-timepicker-selected");return e.hasClass("ui-timepicker-disabled")?!1:(e.length&&(d=e.data("time")),null!==d&&("string"!=typeof d&&(d=s(d,b)),m(a,d,"select")),!0)}function r(a,b){a=Math.abs(a);var c,d,e=Math.round(a/60),f=[];return 60>e?f=[e,v.mins]:(c=Math.floor(e/60),d=e%60,30==b&&30==d&&(c+=v.decimal+5),f.push(c),f.push(1==c?v.hr:v.hrs),30!=b&&d&&(f.push(d),f.push(v.mins))),f.join(" ")}function s(b,c){if("number"!=typeof b)return null;var d=parseInt(b%60),e=parseInt(b/60%60),f=parseInt(b/3600%24),g=new Date(1970,0,2,f,e,d,0);if(isNaN(g.getTime()))return null;if("function"===a.type(c.timeFormat))return c.timeFormat(g);for(var h,i,j="",k=0;k<c.timeFormat.length;k++)switch(i=c.timeFormat.charAt(k)){case"a":j+=g.getHours()>11?v.pm:v.am;break;case"A":j+=g.getHours()>11?v.PM:v.AM;break;case"g":h=g.getHours()%12,j+=0===h?"12":h;break;case"G":h=g.getHours(),b===u&&(h=c.show2400?24:0),j+=h;break;case"h":h=g.getHours()%12,0!==h&&10>h&&(h="0"+h),j+=0===h?"12":h;break;case"H":h=g.getHours(),b===u&&(h=c.show2400?24:0),j+=h>9?h:"0"+h;break;case"i":var e=g.getMinutes();j+=e>9?e:"0"+e;break;case"s":d=g.getSeconds(),j+=d>9?d:"0"+d;break;case"\\":k++,j+=c.timeFormat.charAt(k);break;default:j+=i}return j}function t(a,b){if(""===a||null===a)return null;if("object"==typeof a)return 3600*a.getHours()+60*a.getMinutes()+a.getSeconds();if("string"!=typeof a)return a;a=a.toLowerCase().replace(/[\s\.]/g,""),("a"==a.slice(-1)||"p"==a.slice(-1))&&(a+="m");var c="("+v.am.replace(".","")+"|"+v.pm.replace(".","")+"|"+v.AM.replace(".","")+"|"+v.PM.replace(".","")+")?",d=new RegExp("^"+c+"([0-9]?[0-9])\\W?([0-5][0-9])?\\W?([0-5][0-9])?"+c+"$"),e=a.match(d);if(!e)return null;var f=parseInt(1*e[2],10);if(f>24){if(b&&b.wrapHours===!1)return null;f%=24}var g=e[1]||e[5],h=f;if(12>=f&&g){var i=g==v.pm||g==v.PM;h=12==f?i?12:0:f+(i?12:0)}var j=1*e[3]||0,k=1*e[4]||0,l=3600*h+60*j+k;if(12>f&&!g&&b&&b._twelveHourTime&&b.scrollDefault){var m=l-b.scrollDefault();0>m&&m>=u/-2&&(l=(l+u/2)%u)}return l}var u=86400,v={am:"am",pm:"pm",AM:"AM",PM:"PM",decimal:".",mins:"mins",hr:"hr",hrs:"hrs"},w={init:function(b){return this.each(function(){var e=a(this),f=[];for(var g in a.fn.timepicker.defaults)e.data(g)&&(f[g]=e.data(g));var h=a.extend({},a.fn.timepicker.defaults,f,b);if(h.lang&&(v=a.extend(v,h.lang)),h=c(h),e.data("timepicker-settings",h),e.addClass("ui-timepicker-input"),h.useSelect)d(e);else{if(e.prop("autocomplete","off"),h.showOn)for(var i in h.showOn)e.on(h.showOn[i]+".timepicker",w.show);e.on("change.timepicker",k),e.on("keydown.timepicker",o),e.on("keyup.timepicker",p),h.disableTextInput&&e.on("keydown.timepicker",n),k.call(e.get(0))}})},show:function(c){var e=a(this),f=e.data("timepicker-settings");if(c&&c.preventDefault(),f.useSelect)return void e.data("timepicker-list").focus();h(e)&&e.blur();var k=e.data("timepicker-list");if(!e.prop("readonly")&&(k&&0!==k.length&&"function"!=typeof f.durationTime||(d(e),k=e.data("timepicker-list")),!b(k))){e.data("ui-timepicker-value",e.val()),j(e,k),w.hide(),k.show();var m={};f.orientation.match(/r/)?m.left=e.offset().left+e.outerWidth()-k.outerWidth()+parseInt(k.css("marginLeft").replace("px",""),10):m.left=e.offset().left+parseInt(k.css("marginLeft").replace("px",""),10);var n;n=f.orientation.match(/t/)?"t":f.orientation.match(/b/)?"b":e.offset().top+e.outerHeight(!0)+k.outerHeight()>a(window).height()+a(window).scrollTop()?"t":"b","t"==n?(k.addClass("ui-timepicker-positioned-top"),m.top=e.offset().top-k.outerHeight()+parseInt(k.css("marginTop").replace("px",""),10)):(k.removeClass("ui-timepicker-positioned-top"),m.top=e.offset().top+e.outerHeight()+parseInt(k.css("marginTop").replace("px",""),10)),k.offset(m);var o=k.find(".ui-timepicker-selected");if(!o.length){var p=t(l(e));null!==p?o=i(e,k,p):f.scrollDefault&&(o=i(e,k,f.scrollDefault()))}if(o&&o.length){var q=k.scrollTop()+o.position().top-o.outerHeight();k.scrollTop(q)}else k.scrollTop(0);return f.stopScrollPropagation&&a(document).on("wheel.ui-timepicker",".ui-timepicker-wrapper",function(b){b.preventDefault();var c=a(this).scrollTop();a(this).scrollTop(c+b.originalEvent.deltaY)}),a(document).on("touchstart.ui-timepicker mousedown.ui-timepicker",g),a(window).on("resize.ui-timepicker",g),f.closeOnWindowScroll&&a(document).on("scroll.ui-timepicker",g),e.trigger("showTimepicker"),this}},hide:function(c){var d=a(this),e=d.data("timepicker-settings");return e&&e.useSelect&&d.blur(),a(".ui-timepicker-wrapper").each(function(){var c=a(this);if(b(c)){var d=c.data("timepicker-input"),e=d.data("timepicker-settings");e&&e.selectOnBlur&&q(d),c.hide(),d.trigger("hideTimepicker")}}),this},option:function(b,e){return"string"==typeof b&&"undefined"==typeof e?a(this).data("timepicker-settings")[b]:this.each(function(){var f=a(this),g=f.data("timepicker-settings"),h=f.data("timepicker-list");"object"==typeof b?g=a.extend(g,b):"string"==typeof b&&(g[b]=e),g=c(g),f.data("timepicker-settings",g),h&&(h.remove(),f.data("timepicker-list",!1)),g.useSelect&&d(f)})},getSecondsFromMidnight:function(){return t(l(this))},getTime:function(a){var b=this,c=l(b);if(!c)return null;var d=t(c);if(null===d)return null;a||(a=new Date);var e=new Date(a);return e.setHours(d/3600),e.setMinutes(d%3600/60),e.setSeconds(d%60),e.setMilliseconds(0),e},isVisible:function(){var a=this,c=a.data("timepicker-list");return!(!c||!b(c))},setTime:function(a){var b=this,c=b.data("timepicker-settings");if(c.forceRoundTime)var d=f(t(a),c);else var d=s(t(a),c);return a&&null===d&&c.noneOption&&(d=a),m(b,d),b.data("timepicker-list")&&j(b,b.data("timepicker-list")),this},remove:function(){var a=this;if(a.hasClass("ui-timepicker-input")){var b=a.data("timepicker-settings");return a.removeAttr("autocomplete","off"),a.removeClass("ui-timepicker-input"),a.removeData("timepicker-settings"),a.off(".timepicker"),a.data("timepicker-list")&&a.data("timepicker-list").remove(),b.useSelect&&a.show(),a.removeData("timepicker-list"),this}}};a.fn.timepicker=function(b){return this.length?w[b]?this.hasClass("ui-timepicker-input")?w[b].apply(this,Array.prototype.slice.call(arguments,1)):this:"object"!=typeof b&&b?void a.error("Method "+b+" does not exist on jQuery.timepicker"):w.init.apply(this,arguments):this},a.fn.timepicker.defaults={appendTo:"body",className:null,closeOnWindowScroll:!1,disableTextInput:!1,disableTimeRanges:[],disableTouchKeyboard:!1,durationTime:null,forceRoundTime:!1,maxTime:null,minTime:null,noneOption:!1,orientation:"l",roundingFunction:function(a,b){if(null===a)return null;if("number"!=typeof b.step)return a;var c=a%(60*b.step);return c>=30*b.step?a+=60*b.step-c:a-=c,a==u&&b.show2400?a:a%u},scrollDefault:null,selectOnBlur:!1,show2400:!1,showDuration:!1,showOn:["click","focus"],showOnFocus:!0,step:30,stopScrollPropagation:!1,timeFormat:"g:ia",typeaheadHighlight:!0,useSelect:!1,wrapHours:!0}});

var m=angular.module("ui.timepicker",[]);m.value("uiTimepickerConfig",{step:15}),m.directive("uiTimepicker",["uiTimepickerConfig","$parse","$window",function(a,b,c){var d=c.moment,e=function(a){return void 0!==d&&d.isMoment(a)&&a.isValid()},f=function(a){return null!==a&&(angular.isDate(a)||e(a))};return{restrict:"A",require:"ngModel",scope:{ngModel:"=",baseDate:"=",uiTimepicker:"="},priority:1,link:function(b,c,g,h){"use strict";var i=angular.copy(a),j=i.asMoment||!1;delete i.asMoment,h.$render=function(){var a=h.$modelValue;if(angular.isDefined(a)){if(null!==a&&""!==a&&!f(a))throw new Error("ng-Model value must be a Date or Moment object - currently it is a "+typeof a+".");e(a)&&(a=a.toDate()),c.is(":focus")||m()||c.timepicker("setTime",a),null===a&&k()}},b.$watch("ngModel",function(){h.$render()},!0),i.appendTo=i.appendTo||c.parent(),c.timepicker(angular.extend(i,b.uiTimepicker?b.uiTimepicker:{}));var k=function(){c.timepicker("setTime",null)},l=function(){return c.val().trim()},m=function(){return l()&&null===h.$modelValue};c.on("$destroy",function(){c.timepicker("remove")});var n=function(){var a=h.$modelValue?h.$modelValue:b.baseDate;return e(a)?a.toDate():a},o=function(a){return j?d(a):a};c.is("input")?(h.$parsers.unshift(function(a){var b=c.timepicker("getTime",n());return b?o(b):b}),h.$validators.time=function(a){return g.required||l()?f(a):!0}):c.on("changeTime",function(){b.$evalAsync(function(){var a=c.timepicker("getTime",n());h.$setViewValue(a)})})}}}]);