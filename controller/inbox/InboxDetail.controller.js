sap.ui.define([
	"../BaseController"
], function (BaseController) {
	"use strict";

	var me = BaseController.extend("com.xft.demo.outlook.controller.inbox.InboxDetail", {
		/**
		 * @memberOf com.xft.demo.outlook.controller.inbox.InboxDetail
		 * @protected
		 */
		onInit: function() {
			this.getView().addStyleClass(this.designMode.getCompactCozyClass());
			var oRouter = this.getRouter();
			oRouter.getRoute("inboxDetail").attachMatched(this._onRouteMatched, this);
		},
		
		_onRouteMatched: function (oEvent) {
			//var oAppModel = this.getModel("appProperties");
			var oArgs = oEvent.getParameter("arguments");
			this.HashQuery = oArgs["?query"];
			
			var oOfficeModel = this.getModel("office");

			if (this.byId("MailHtmlBody")) {
				var sId = this.byId("MailHtmlBody").getId();
				
				var sSelector = "[data-sap-ui-preserve='" + sId + "']:not(meta#" + sId + ")";
				if (jQuery)
					jQuery(sSelector).remove();
				else
					$(sSelector).remove();
			}
			
			oOfficeModel.get("/me/messages/" + oArgs.mailId, {
				success: function(oData, rowResponse) {
					if (!oData && !rowResponse) {
						return;
					}
					var mdl = this.getModel("office");
					mdl.setProperty("/messages(" + oData.id + ")", oData);
					
					this.getView().bindElement({
						path: "office>/messages(" + oData.id + ")",
						events: {
							/*change: function(oEvt) {
							}*/
						}
					});
				}.bind(this),
				error: function (oError) {
					if (!oError) {
						return;
					}
				}
			});
		},
		
		onInboxDetailNavBack: function() {
			this.getRouter().navTo("inboxMaster", {
				query: this.addGlobalQueryParams()
			}, true);
		}
	});
	return me;
});