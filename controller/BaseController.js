sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/core/UIComponent",
	"sap/ui/core/routing/History",
	"../model/formatter",
	"../model/helpers",
	"../model/designMode"
], function(Controller, UIComponent, History, formatter, helpers, designMode) {
	"use strict";

	var me = Controller.extend("com.xft.demo.outlook.controller.BaseController", {
		
		formatter: formatter,
		helpers: helpers,
		designMode: designMode,

		/**
		 * @memberOf com.xft.demo.outlook.controller.BaseController
		 */ 
		getEventBus: function() {
			return this.getOwnerComponent().getEventBus();
		},
		
		getRouter: function() {
			return UIComponent.getRouterFor(this);
		},
		
		getModel: function(sName) {
			return this.getView().getModel(sName) 
						|| this.getOwnerComponent().getModel(sName);
		},
		
		setModel: function(oModel, sName) {
			return this.getView().setModel(oModel, sName);
		},
		
		getResourceBundle: function() {
			return (this.getModel("i18n") || this.getOwnerComponent().getModel("i18n")).getResourceBundle();
		},
		
		getManifestEntry: function(sId, mDefVal) {
			var sValue = this.getOwnerComponent().getManifestEntry(sId);
			if (sValue == undefined && mDefVal !== undefined)
				return mDefVal;
			else
				return sValue;
		},
		
		getServiceUrl: function(sName) {
			var sUrl = undefined;
			if (typeof sName != "string")
				sName = "";
			else
				sName = sName.trim();
			if (sName.length == 0) { // mainService
				sUrl = this.getManifestEntry("/sap.app/dataSources/mainService/uri");
			}
			else { // Named further services
				switch (sName) {
				case 'search': 
					sUrl = this.getManifestEntry("/sap.app/dataSources/searchService/uri");
					break;
				}
			}
			if (!sUrl) {
				var oModel = this.getModel(sName);
				if (oModel)
					sUrl = oModel.sServiceUrl;
			}
			
			return sUrl;
		},

		getSplittAppControl: function() {
			return this.byId("RecordSplitApp");
		},
		
		onNavBack: function() {
			if (History.getInstance().getPreviousHash() !== undefined) {
				history.go(-1);
			} else {
				this.navToHome(true);
			}
		},
		
		navToHome: function(bWithoutHist) {
			bWithoutHist = bWithoutHist === true; // Default = false
			this.getRouter().navTo("home", {
				query: this.addGlobalQueryParams()
			}, bWithoutHist);
		},
		
//		navToRecordNode: function(sRecId, sNodeId, bAlldocs, bReplace) {
//			/*******************************************************************/
//			var oVModel = this.getModel("view");
//			var aPath = [];
//			var oAppModel = this.getModel("appProperties");
//			var aPath = oAppModel.getProperty("/nodePath") || [];
//			var oCurrentNode = oVModel ? oVModel.getProperty("/oNode") : undefined;
//			if (oCurrentNode) {
//				var iIndex = aPath.length;
//				aPath.push({
//					RecId: oCurrentNode.RecId,
//					NodeId: oCurrentNode.NodeId,
//					Description: oCurrentNode.Description,
//					Index: iIndex
//				});
//			}
//			else {
//				aPath = [];
//			}
//			oAppModel.setProperty("/nodePath", aPath);
//			/*******************************************************************/
//			if(typeof(sNodeId) == 'boolean') {
//				bReplace = bAlldocs;
//				bAlldocs = sNodeId;
//				sNodeId = undefined;
//			}
//			bReplace = bReplace === true;
//			var oQuery = {
//				nodes:	bAlldocs === true ? 'alldocs' : 'subnodes'
//			};
//			if (sNodeId)
//				oQuery.parentid = sNodeId;
//			this.addGlobalQueryParams(oQuery);
//			var sTarget = this.noSplitApp === true ? "recordNodes" : "recordDetailNodes";
//			this.getRouter().navTo(sTarget, {
//				RecId : sRecId,
//				query: oQuery
//			}, bReplace);
//		},
		
		getHistorySteps: function(sRoute, bForward) {
			var oUiHistory = History.getInstance();
			//No history
			if (oUiHistory.getPreviousHash() == undefined 
					|| !(oUiHistory.aHistory instanceof Array)
					|| oUiHistory.iHistoryPosition == undefined) {
				return undefined;
			}
			var oRoute = this.getRouter().getRoute(sRoute);
			if (!oRoute) return undefined;
			
			bForward = bForward	=== true;
			
			var sPattern = oRoute.getPattern()
						.replace(/\//g, "[/]")
						.replace(/[:][?][^:]+[:]/ig, "([\/]?[?][^\/]*)?") // :?abcd:
						.replace(/[{][^}]+[}]/ig, "[^\/]+"); // {efgh}
			var regExp = RegExp("^[\/]?" + sPattern + "[\/]?$", "i");
			var iPosition = oUiHistory.iHistoryPosition;
			var i, iSteps;
			if (!bForward) { // Backward
				for (i = iPosition - 1; i >= 0; i--) {
					if (!regExp.test(oUiHistory.aHistory[i]))
						continue;
					// Route matched in history -> go back until matching route
					iSteps = i - iPosition;
					return iSteps;
				}
			}
			else { // Forward
				for (i = iPosition + 1; i < oUiHistory.aHistory.length; i++) {
					if (!regExp.test(oUiHistory.aHistory[i]))
						continue;
					// Route matched in history -> go forward until matching route
					iSteps = i - iPosition;
					return iSteps;
				}
			}
			return undefined;
		},
		
		displayRecordNodeDocument: function(oContext) {
			if (!oContext || !oContext.getObject().HasNodeContent)
				return;
			var sServiceUrl = this.getServiceUrl();
			var sPath = sServiceUrl + oContext.getPath() + '/RecordNodeDocument/$value';
			sap.m.URLHelper.redirect(sPath, true);
		},
		
		addGlobalQueryParams: function(oObject) {
			if (oObject === undefined)
				oObject = {};
			
//			//File type
//			var sFtype = this.getUriParam("ftype");
//			if (sFtype)
//				oObject.ftype = sFtype;
			
			return !jQuery.isEmptyObject(oObject) ? oObject : undefined;
		},
		
		getUriParam: function(sParam, oQuery) {
			return this.helpers.getUriParam(oQuery || this.HashQuery, sParam);
		}
	});
	
	return me;
});