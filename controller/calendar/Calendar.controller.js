sap.ui.define([
   "../BaseController"
], function(Controller) {
	"use strict";

	var me = Controller.extend("com.xft.demo.outlook.controller.calendar.Calendar", {
		/***
		 * 
		 */
		onInit: function() {
		},
		
		getPage: function() {
			return this.byId("CalendarPage");
		}
	});
	
	return me;
});