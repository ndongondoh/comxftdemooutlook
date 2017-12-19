/**
 * After 20 minutes of inactivity user sessions are invalidated. If the user 
 * tries to access an invalidated session, SAP HANA Cloud Platform returns a 
 * logon page, where the user must log on again. If you are using SAML as a 
 * logon method, you cannot rely on the response code to find out whether the 
 * session has expired because it is either 200 or 302. To check whether the 
 * response requires a new logon, get the com.sap.cloud.security.login HTTP 
 * header and reload the page.
 */
jQuery(document).ajaxComplete(function(e, jqXHR) {
    if(jqXHR.getResponseHeader("com.sap.cloud.security.login")) {
        alert("Browser session expired, page will be reloaded.");
        window.location.reload();
    }
});

sap.ui.define([
	"sap/ui/core/UIComponent",
	"sap/ui/Device",
	"./model/models",
	"sap/ui/model/json/JSONModel"
], function(UIComponent, Device, models) {
	"use strict";

	var me = UIComponent.extend("com.xft.demo.outlook.Component", {
		metadata: {
			manifest: "json"
		},

		/**
		 * The component is initialized by UI5 automatically during the startup of the app and calls the init method once.
		 * @public
		 * @override
		 */
		init: function() {
			// set the device model
			this.setModel(models.createDeviceModel(), "device");
			// set the FLP model
			this.setModel(models.createFLPModel(), "FLP");
			
			// Set app Properties
			var oAppModel = new sap.ui.model.json.JSONModel({
				busy: true
			});
			oAppModel.setDefaultBindingMode("TwoWay");
			this.setModel(oAppModel, "appProperties");
			
			var oOfficeModel = models.createOfficeModel({
				authEndpoint: 'https://login.microsoftonline.com/common/oauth2/v2.0/authorize?',
				redirectUrl: window.location.origin + window.location.pathname,
				appId: 'bb3b5a62-350c-44f3-886b-7d1a74136109',
				scopes: 'Mail.Read openid profile User.Read'//Write Mail.Send';// Calendar.Read',
			});
			this.setModel(oOfficeModel, "office");
			
			// call the base component's init function
			UIComponent.prototype.init.apply(this, arguments);
			// create the views based on the url/hash
			this.getRouter().initialize();
		}
	});
	return me;
});