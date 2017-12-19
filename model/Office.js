sap.ui.define([
    "sap/ui/model/Model",
    "sap/ui/model/json/JSONModel",
    "./helpers",
    "sap/m/MessageToast"
], function(UIModel, JSONModel, helpers, MessageToast) {
	"use strict";

	var me = JSONModel.extend("com.xft.demo.outlook.model.Office", {

		constructor: function(oData, bObserve) {
			JSONModel.prototype.constructor.apply(this, arguments);
			var data = this.getData();

			// Set initial values
//			data.accessToken = window.sessionStorage.accessToken;
//			data.tokenID = window.sessionStorage.idToken;
//			data.tokenExpires = window.sessionStorage.tokenExpires;
			data.authEndpoint = data.authEndpoint || "https://login.microsoftonline.com/common/oauth2/v2.0/authorize?";
			data.redirectUrl = data.redirectUrl || window.location.origin + window.location.pathname;
			data.appId = data.appId || "bb3b5a62-350c-44f3-886b-7d1a74136109";
			data.scopes = data.scopes || "Mail.Read openid profile User.Read";//Write Mail.Send';// Calendar.Read';

			data.responseMode = data.responseMode || "fragment"; //'form_post';
			data.responseType = data.responseType || "id_token token";
		},
		
		getIsAuthenticated: function() {
			var oData = this.getData();
            var now = new Date().getTime();
			if (window.sessionStorage.accessToken != null 
					&& window.sessionStorage.accessToken.length > 0
					&& now <= parseInt(window.sessionStorage.tokenExpires)) {
				return true;
			}
			return false;
		},

		/***
		 * Build and then call the authentication URL
		 * @memberOf com.xft.demo.outlook.model.Office
		 */
		authenticate: function(sSearch, sHash) { //function buildAuthUrl()
			if (sSearch == undefined)
				sSearch = window.location.search;
			if (sHash == undefined)
				sHash = window.location.hash;
			var oData = this.getData();

			window.sessionStorage.setItem("locationSearch", sSearch);
			window.sessionStorage.setItem("locationHash", sHash);
			// Generate random values for state and nonce
			window.sessionStorage.authState = helpers.guid();
			window.sessionStorage.authNonce = helpers.guid();
			var authParams = {
					client_id:		oData.appId,
					response_type:	oData.responseType,
					redirect_uri:	oData.redirectUrl,
					scope:			oData.scopes,
					state:			window.sessionStorage.authState,
					nonce:			window.sessionStorage.authNonce,
					response_mode:	oData.responseMode
			};
			// Build authentication uri
			var sUrl = oData.authEndpoint + $.param(authParams);
			// Navigate to authentication uri
			sap.m.URLHelper.redirect(sUrl, false);
		},

		initialize: function(oController, sHash) {  // function render()
			if (sHash == undefined)
				sHash = window.location.hash;
			var sAction = sHash.split("=")[0];
			// Check for presence of access token
			var isAuthenticated = this.getIsAuthenticated();
			// Update JSON-Model Object with current token data
			this.updateTokenData();
			// Check whether already authenticated!
			if (isAuthenticated) {
				window.sessionStorage.removeItem("locationSearch");
				window.sessionStorage.removeItem("locationHash");
				
                // Create the Graph client
				this.initGraphClient();
                
				//Go back as winner
				return;
			}
			
			// Not authenticated yet...
			switch (sAction) {
			case "#access_token": 
				// Server response with autentication to exists
				// Fetch token response and return success status 
				this.handleTokenResponse(sHash, oController);
				return;
			default:
				// Redirect to home page
				//renderWelcome(isAuthenticated, app);
			}
			//this.authenticate();
			return;
		},
		
		initGraphClient: function() {
            this._oGraphClient = MicrosoftGraph.Client.init({
            	authProvider: (done) => {
            		// Just return the token
            		done(null, window.sessionStorage.accessToken);
        		}
        	});
		},
		
		handleTokenResponse: function(sHash, oController) { // function handleTokenResponse(hash)
			// clear tokens
			window.sessionStorage.removeItem('accessToken');
			window.sessionStorage.removeItem('idToken');
			window.sessionStorage.removeItem('tokenExpires');
			var tokenresponse = helpers.parseHashParams(sHash);
			// Check that state is what we sent in sign in request
			if (tokenresponse.state != window.sessionStorage.authState) {
				window.sessionStorage.removeItem('authState');
				window.sessionStorage.removeItem('authNonce');
				// Report error
				//window.location.hash = "#error=Invalid+state&error_description=The+state+in+the+authorization+response+did+not+match+the+expected+value.+Please+try+signing+in+again.";
				oController.getRouter().navTo("authError", {
					//query: this.addGlobalQueryParams()
				}, false);
				return;
			}
			window.sessionStorage.removeItem('authState');
			window.sessionStorage.removeItem('authNonce');
			window.sessionStorage.accessToken = tokenresponse.access_token;
			window.sessionStorage.idToken = tokenresponse.id_token;
			// Get the number of seconds the token is valid for,
			// Subtract 5 minutes (300 sec) to account for differences in clock settings
			// Convert to milliseconds
			var expiresin = (parseInt(tokenresponse.expires_in) - 300) * 1000;
			var now = new Date();
			var expireDate = new Date(now.getTime() + expiresin);
			window.sessionStorage.tokenExpires = expireDate.getTime();
			
			// Redirect to home page after authentication was done
			var sUrl = this.getData().redirectUrl + (window.sessionStorage.locationSearch || "")
							+ (window.sessionStorage.locationHash || "");
//	        MessageToast.show("Successfully Logged In!", {
//	            duration: 1000 });
			sap.m.URLHelper.redirect(sUrl, false);
		},
		
		updateTokenData: function() { //function renderTokens()
			// Update JSON-Model Object with current token data
			// (will cleared if not authenticated)
			var oData = this.getData();
			if (this.getIsAuthenticated()) {
				oData.accessToken = window.sessionStorage.accessToken;
				oData.tokenID = window.sessionStorage.idToken;
				oData.tokenExpires = window.sessionStorage.tokenExpires;
			}
			else {
				oData.accessToken = null;
				oData.tokenID = null;
				oData.tokenExpires = null;
			}
		},
		
		get: function(sPath, mSettings) {
			if (mSettings instanceof Object == false)
				mSettings = {};
			var oRequest = this._oGraphClient.api(sPath);
			
			// Query Parameters
			// $select, $expand and $orderby
			if ((typeof mSettings.select == "string") || (mSettings.select instanceof Array))
				oRequest = oRequest.select(mSettings.select);
			if ((typeof mSettings.expand  == "string") || (mSettings.expand  instanceof Array))
				oRequest = oRequest.expand(mSettings.expand);
			if ((typeof mSettings.orderby  == "string") || (mSettings.orderby  instanceof Array))
				oRequest = oRequest.orderby(mSettings.orderby);
			// $top and $skip
			if (!isNaN(mSettings.top))
				oRequest = oRequest.top(Number(mSettings.top));
			if (!isNaN(mSettings.skip))
				oRequest = oRequest.skip(Number(mSettings.skip));
			// $count
			if (mSettings.count === true)
				oRequest = oRequest.count(true);
			// $filter
			if (typeof mSettings.filter == "string")
				oRequest = oRequest.filter(mSettings.filter);
			
			// .version()
			if (mSettings.version != undefined)
				oRequest = oRequest.version(mSettings.version);
			// .query()
			if (mSettings.query != undefined)
				oRequest = oRequest.query(mSettings.query);
			// .header() and .headers()
			if ((typeof mSettings.header == "string") || (mSettings.header instanceof Object))
				oRequest = oRequest.header(mSettings.header);
			if ((typeof mSettings.headers == "string") || (mSettings.headers instanceof Object))
				oRequest = oRequest.headers(mSettings.headers);
			// .responseType()
			if (mSettings.responseType)
				oRequest = oRequest.responseType(mSettings.responseType);
			
			// send the query
			oRequest.get((error, result, rawResponse) => {
					if (error) {
						if (typeof mSettings.error == "function")
							mSettings.error(error);
					}
					else if (typeof mSettings.success == "function") {
						mSettings.success(result, rawResponse);
					}
			});
		},
		
		getList: function(sPath, oContext, aSorters, aFilters, mParameters) {
			//var sPath = "/me/mailfolders/" + sMailFolder + "/messages";
			var mSettings = {};
			this.get(sPath, mSettings);
			return UIModel.prototype.bindList.apply(this, arguments);
		}
	});
	
	return me;
});