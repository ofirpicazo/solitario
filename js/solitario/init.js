// Copyright 2012 Ofir Picazo. All Rights Reserved

goog.provide('solitario.init');

goog.require('goog.dom');

/**
 * Start point for the application.
 */
solitario.init = function() {
  var rey = goog.dom.getElement('sk');
  window.console.debug(rey);
};

goog.exportSymbol('solitario.init', solitario.init);