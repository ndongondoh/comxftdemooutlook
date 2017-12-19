sap.ui.define([
	"sap/ui/model/json/JSONModel",
	"../BaseController"
], function(JSONModel, BaseController) {
	"use strict";

	var me = BaseController.extend("com.xft.demo.outlook.controller.inbox.InboxSplitApp", {
		onInit: function() {
			this.getView().addStyleClass(this.designMode.getCompactCozyClass());
			this.initSplitAppObj();

			var oRouter = this.getRouter();
			oRouter.getRoute("inboxSplit").attachMatched(this._onRouteMatched, this);
		},

		onOrientationChange: function() {
			//var bLandscapeOrientation = oEvent.getParameter("landscape");
		},
		
		initSplitAppObj : function() {
			this.getModel("appProperties").setProperty(
					"/splitAppControl", this.byId("InboxSplitApp"));
		},
		
		_onRouteMatched: function (oEvent) {
			//var oAppModel = this.getModel("appProperties");
			var oArgs = oEvent.getParameter("arguments");
			this.HashQuery = oArgs["?query"];
		}
	});
	
	return me;
});