sap.ui.define([
	"../BaseController"
], function (BaseController) {
	"use strict";

	var me = BaseController.extend("com.xft.demo.outlook.controller.inbox.InboxMaster", {
		/**
		 * @memberOf com.xft.demo.outlook.controller.inbox.InboxMaste
		 * @protected
		 */
		onInit: function() {
			this.getView().addStyleClass(this.designMode.getCompactCozyClass());
			var oRouter = this.getRouter();
			oRouter.getRoute("inboxMaster").attachMatched(this._onRouteMatched, this);
		},
		
		_onRouteMatched: function (oEvent) {
			//var oAppModel = this.getModel("appProperties");
			var oArgs = oEvent.getParameter("arguments");
			this.HashQuery = oArgs["?query"];
			
			var oOfficeModel = this.getModel("office");
			if (!oOfficeModel.getIsAuthenticated()) {
				oOfficeModel.authenticate(window.location.search, window.location.hash);
			}
			
			oOfficeModel.get("/me/mailfolders/inbox/messages", {
				top: 50,
				select: "subject,from,receivedDateTime,bodyPreview,isRead",
				orderby: "receivedDateTime DESC",
				success: function(oData, rowResponse) {
					if (!oData && !rowResponse) {
						return;
					}
					var mdl = this.getModel("office");
					mdl.setProperty("/messages", oData.value);
					oOfficeModel.refresh();
				}.bind(this),
				error: function (oError) {
					if (!oError) {
						return;
					}
				}
			});
		},
		
		onInboxMasterItemPress: function(oEvent) {
			var oItem = oEvent.getSource();
			var oList = oItem.getParent();
			if (oList.getMode() == "MultiSelect") {
				return;
			}
			this.displayEmail(oItem);
		},
		
		onInboxMasterSelectionChange: function(oEvent) {
			var oList = oEvent.getSource();
			if (oList.getMode() == "MultiSelect") {
				return;
			}
			var oItem = oEvent.getParameter("listItem");
			this.displayEmail(oItem);
		},
		
		displayEmail: function(oItem) {
			this.getRouter().navTo("inboxDetail", {
				mailId: oItem.getBindingContext("office").getObject().id
				//query: this.addGlobalQueryParams()
			}, true /* w.o. history */);
		}
	});
	return me;
});