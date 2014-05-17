/* jshint camelcase:false */

'use strict';

var template  = require('./template.html');
var reactive  = require('reactive');
var dom       = require('dom');
var request   = require('superagent');

module.exports = GoogleSignin;


/**
 * Constructor
 * @constructor
 */
function GoogleSignin(clientId, authenticationCallback) {
  this.clientId = clientId;
  this.onAuth = authenticationCallback;

  // Make this available within the global scope to allow
  // for binding to the Google button control
  window.gplusSigninCallback = this.onSignin.bind(this);
}


/**
 * Injects the required google api script tag into the page
 */
GoogleSignin.prototype.injectScript = function() {
  var s = document.getElementsByTagName('script')[0];
  var po = document.createElement('script');
  po.type = 'text/javascript';
  po.async = true;
  po.src = 'https://apis.google.com/js/client:plusone.js';
  s.parentNode.insertBefore(po, s);
};


/**
 * Adds the google signin button to the passed in element
 *
 * @param {Element} appendTo - The element to append the google button within
 */
GoogleSignin.prototype.bindButton = function(appendTo) {
  this.view = reactive(template, this, {delegate: this});
  dom(appendTo).append(this.view.el);
};


/**
 * Links the google user to the corresponding app account.
 *
 * @params {Object} authResult - User credentials returned from Google
 */
GoogleSignin.prototype.onSignin = function(authResult) {
  var onAuthCallback = this.onAuth;
  var requiresAuth = authResult.code;

  if (authResult.access_token) {
    dom('#signinButton').css({display: 'none'});
  }

  if (requiresAuth) {
    request
      .post('/api/users')
      .send({ code: authResult.code })
      .end(function(err, res) {
        dom('#signinButton').css({display: 'none'});
        onAuthCallback(err, res.body);
      });
  }
};
