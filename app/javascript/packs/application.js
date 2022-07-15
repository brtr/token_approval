// This file is automatically compiled by Webpack, along with any other files
// present in this directory. You're encouraged to place your actual application logic in
// a relevant structure within app/javascript and only use these pack files to reference
// that code so it'll be compiled.
require("jquery");
require("@rails/ujs").start();
require("turbolinks").start();
require("@rails/activestorage").start();
require("channels");
require("bootstrap-datepicker");
require("bootstrap");
require("./main.js");
require('select2');
import "../stylesheets/application";
import 'select2';
import 'select2/dist/css/select2.css';

window.jQuery = $;
window.$ = $;

$(document).on("ajax:before ajaxStart page:fetch turbolinks:click", function(event) {
  'use strict';
  $("#spinner").removeClass("hide");
});