sap.ui.define([
	"./BaseController",
	"../model/helpers"
], function (BaseController, helpers) {
	"use strict";

	var me = BaseController.extend("com.xft.demo.outlook.controller.Home", {
		/**
		 * @memberOf com.xft.demo.outlook.controller.Home
		 * @protected
		 */
		onInit: function() {
			this.getView().addStyleClass(this.designMode.getCompactCozyClass());
			var oRouter = this.getRouter();
			
			var oSortableList = this.byId("InboxMasterList");
			var listId = oSortableList.getId();
			var listUlId = listId + "-listUl";
			oSortableList.onAfterRendering = function() {
				if (sap.m.List.prototype.onAfterRendering) {
					sap.m.List.prototype.onAfterRendering.apply(this);
				}
				jQuery("#"+listUlId+" li").draggable({
					helper: "clone"
				});
			};

			/*var oUploadCollection = this.byId("UploadCollection");
			var uplId = oUploadCollection.getId();
			oUploadCollection.onAfterRendering = function() {
				if (com.xft.demo.outlook.control.UploadCollection.prototype.onAfterRendering) {
					com.xft.demo.outlook.control.UploadCollection.prototype.onAfterRendering.apply(this);
				}
		        
				jQuery("#"+uplId+"-list-listUl").droppable({
					drop: function( event, ui ) {
						var listElementId = ui.draggable.context.id;
						var draggedElement = sap.ui.getCore().byId(listElementId);
						var oObject = draggedElement.getBindingContext("office").getObject();
						
						oUploadCollection.insertItem(
							new sap.m.UploadCollectionItem({
								documentId: oObject.id,
								fileName: oObject.subject,
								//thumbnailUrl: "sap-icon://email",
								//url: draggedElement.getBindingContext("office").getPath(),
								mimeType: "text/plain",
								enableEdit: false,
								enableDelete: true,
								visibleEdit: false,
								visibleDelete: true,
								attributes: [
						             new sap.m.ObjectAttribute({
						            	 text: oObject.from.emailAddress.name
						             }),
						             new sap.m.ObjectAttribute({
						            	 text: helpers.getDate(oObject.receivedDateTime, true)
						             })
					            ]
							}),
							0
						);
					}
				});
		     }*/
			
			oRouter.getRoute("home").attachMatched(this._onRouteMatched, this);
		},
		
		_onRouteMatched: function (oEvent) {
			//var oAppModel = this.getModel("appProperties");
			var oArgs = oEvent.getParameter("arguments");
			this.HashQuery = oArgs["?query"];
			
			var oOfficeModel = this.getModel("office");
			if (!oOfficeModel.getIsAuthenticated()) {
				oOfficeModel.authenticate(window.location.search, window.location.hash);
			}
			
			oOfficeModel.get("/me", {
				success: function(oData, rowResponse) {
					if (!oData && !rowResponse) {
						return;
					}
					var mdl = this.getModel("office");
					mdl.setProperty("/me", oData);
					mdl.refresh();
					
					/*this.getView().bindElement({
						path: "office>/messages(" + oData.id + ")",
						events: {
							change: function(oEvent) {
							}.bind(this)
						}
					});*/
				}.bind(this),
				error: function (oError) {
					if (!oError) {
						return;
					}
				}
			});
			
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
		
		getPage: function() {
			return this.byId("HomePage");
		},
		
		onInboxBtnPress: function() {
			var oDeviceMdl = this.getModel("device");
			var sTarget = oDeviceMdl.getProperty("/system/phone") ? "inboxMaster" : "inboxHome";
			this.getRouter().navTo(sTarget, {
				query: this.addGlobalQueryParams()
			}, false);
		},
		
		onCalendarBtnPress: function() {
			this.getRouter().navTo("calendar", {
				query: this.addGlobalQueryParams()
			}, false);
		}

	});
	
	return me;
});