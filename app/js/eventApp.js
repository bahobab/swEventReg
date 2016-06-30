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
