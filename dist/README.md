## Udacity Senior Web Developer Project1: Event Rgistration ##


A/ Introduction

I srtarted this projoject while I was learning AngularJs 1.x
The tutorial I was using is "Building and Angular App: Eggly" by Lukas Ruebbelke (https://egghead.io/lessons/angularjs-building-an-angular-app-eggly-introduction).
So I thought it would be a great learning experience to build a CRUD application for the Event Regitration project using the Angular framework.

The main issue I encontered that cost me a lot of time was finding and using the proper date and time pickers.
I probably tried at least 75% of the datepickers and timepickers found by Google search. However, either I did not like them or they are not user-friendly by screen readers.
Some will work well but still will break after minification.

Finally, I used the solution created by Filippo Oretti and Dario Andrei for the datepicker. Then I combined with Recras' timepicker. Both solutions use angular so they integrate very well into my solution. Other solutions are jQuery solutions and create a problem with Angular with regards to asychronous code execution.

Of course, I referred to many articles on StackOverflow for coding issues I encontered during development and the essential ones dealt with date manipulation in JavaScript.

This is my first major app developed with Angular and all the code holds in a single js file. Although it's totally against good coding practice, my primary goal here was to "see it works". I will certainly refactor the code later to comply with the best practice recommendations.

The application is hosted on Firebase and I used the user authentication/authorization mechanisms as well as the data persistance provided by Firebase.

The app is live and can be used at:

https://scurve.firebaseapp.com

B/ Usage:

1/ Connect to the app. Point your browser to:
	https://scurve.firebaseapp.com

2/ Sign up: Create an account

3/ Login with the account used to sign up

Enjoy creating your events



C/ References

- Building and Angular App: Eggly" by Lukas Ruebbelke
	https://egghead.io/lessons/angularjs-building-an-angular-app-eggly-introduction

- Google places autocomplete JavaScript API:
	https://developers.google.com/places/javascript/

- modal login and registration:
	https://angular-ui.github.io/bootstrap

- Filippo Oretti and Dario Andrei's
	https://github.com/720kb/angular-datepicker

- Recras's Agular jQuery timepicker
	http://recras.github.io/angular-jquery-timepicker/

- Password strength check:
	https://www.thepolyglotdeveloper.com/2015/05/use-regex-to-test-password-strength-in-javascript

- Angular Forms Properties and Date RegEx:
	http://www.yearofmoo.com/2014/09/taming-forms-in-angularjs-1-3.html

- Prevent backSpce default event:
	http://stackoverflow.com/questions/29006000/prevent-backspace-from-navigating-back-in-angularjs

- Application Development Directory Structure:
	https://github.com/himynameisdave/eggs-genny/wiki/Basic-Directory-Structure