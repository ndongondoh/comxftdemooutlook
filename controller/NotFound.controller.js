sap.ui.define([
	"./BaseController"
], function(BaseController) {
	"use strict";
	
	var me = BaseController.extend("com.xft.demo.outlook.controller.NotFound", {
		/**
		 * @memberOf com.xft.demo.outlook.controller.NotFound
		 */
		onInit: function() {
			var oRouter, oTarget;
			oRouter = this.getRouter();
			oTarget = oRouter.getTarget("notFound");
			oTarget.attachDisplay(function (oEvent) {
				this._oRouterData = oEvent.getParameter("data"); //store the data
			}, this);
		},
		
		onNavBack : function () {
			// in some cases we could display a certain target when the back button is pressed
			if (this._oRouterData && this._oRouterData.fromTarget) {
				this.getRouter().getTargets().display(this._oRouterData.fromTarget);
				delete this._oRouterData.fromTarget;
				return;
			}
			// call the parent's onNavBack
			BaseController.prototype.onNavBack.apply(this, arguments);
		}
	});
	return me;
});