sap.ui.define([
	"./BaseController"
], function (Controller) {
	"use strict";

	var me = Controller.extend("com.xft.demo.outlook.controller.App", {
		onInit: function() {
			this.getView().addStyleClass(this.designMode.getCompactCozyClass());
	        //render(window.location.hash, this.getApp());
			var oOfficeModel = this.getModel("office");
			oOfficeModel.initialize(this, window.location.hash);
			/*var isAuthenticated = oOfficeModel.getIsAuthenticated();
			if (!isAuthenticated) {
				oOfficeModel.authenticate(window.location.search, window.location.hash);
			}*/
		},
		
		getApp: function() {
			return this.byId("App");
		}

	});
	
	return me;
});