/**
 * Insert and binds a Google+ Sign in button on the page.
 *
 * Inser the following script tag into the head element:
 *   <script async src="https://apis.google.com/js/client:plusone.js"></script>
 *
 * Ex:
 *  <!-- html -->
 *  <div id="google-signin"></div>
 *
 *  <!-- js binding -->
 *
 *  var customScopes = [
 *    'https://www.googleapis.com/auth/plus.login',
 *    'https://www.googleapis.com/auth/userinfo.email',
 *    'https://www.googleapis.com/auth/plus.login'
 *  ];
 *
 *  var googleSignin = new GoogleSignin(
 *    '#google-signin',
 *    'your_client_id',
 *    customScopes,
 *    function(authResult) {
 *      // make api calls here
 *    });
 */

/* jshint camelcase:false */

'use strict';

var template  = require('./template.html');
var reactive  = require('reactive');
var dom       = require('dom');

module.exports = GoogleSignin;


/**
 * Constructor
 * @constructor
 */
function GoogleSignin(selector, clientId, scopes, authenticationCallback) {
  if (selector === null) throw new Error('css selector is required');
  if (clientId === null) throw new Error('clientId is required');

  if ('function' === typeof scopes) {
    authenticationCallback = scopes;
    scopes = ['https://www.googleapis.com/auth/plus.login'];
  }

  if (!(this instanceof GoogleSignin)) {
    return new GoogleSignin(selector, clientId, scopes, authenticationCallback);
  }

  this.selector = selector;
  this.clientId = clientId;
  this.scopes   = scopes.join(' ');
  this.onAuth   = authenticationCallback;

  // Make this available within the global scope to allow
  // for binding to the Google button control
  window.gplusSigninCallback = this.onSignin.bind(this);

  this._bindButton();
  this._injectScript();
}


/**
 * Adds the google signin button to the passed in element
 */
GoogleSignin.prototype._bindButton = function() {
  this.view = reactive(template, this, {delegate: this});
  dom(this.selector).append(this.view.el);
};


/**
 * Links the google user to the corresponding app account.
 *
 * @params {Object} authResult - User credentials returned from Google
 */
GoogleSignin.prototype.onSignin = function(authResult) {
  /* global gapi */
  var onAuthCallback  = this.onAuth,
      requiresAuth    = authResult.code;

  if (authResult.access_token) {
    dom('#signinButton')
      .removeClass('fade-in')
      .addClass('fade-out');
  } else {
    dom('#signinButton')
      .removeClass('fade-out')
      .addClass('fade-in');
  }

  if (requiresAuth) {
    gapi.client.load('plus', 'v1', function() {
      var request = gapi.client.plus.people.get({ 'userId': 'me' });
      request.execute(function(resp) {
        onAuthCallback(resp);
      });
    });
  }
};
