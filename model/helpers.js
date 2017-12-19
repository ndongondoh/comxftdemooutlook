sap.ui.define([
	"sap/ui/core/format/DateFormat"
], function(DateFormat) {
	"use strict";

	var me = {
			/**
			 * @memberOf com.xft.app.cycle.history.model.helpers
			 * @param {string} timeStamp
			 * @param {boolean} [bWithTime] - Defines whether formatted date
			 * should be displayed with time. (default: <b>false</b>)
			 * @returns {string} - Formatted date or date time
			 * @static
			 * @public
			 */
			getDate: function(timeStamp, bWithTime) {
				if (!timeStamp)
					return "";
				var oDate = new Date(timeStamp);
				if (!oDate || oDate.toLocaleString() == "Invalid Date")
					return timeStamp;
				
				bWithTime = bWithTime === true;
				
				var sLocale = sap.ui.getCore().getConfiguration().getLanguage();
				
				try {
					var oFormatterInstance;
					if (bWithTime) {
						oFormatterInstance = DateFormat.getDateTimeInstance({
							format: "YMMEDDHm", //"YMMDDHms",
							style: "medium",
							strictParsing: true,
							relative: false
						}/*, sap.ui.core.Locale('en')*/);
					}
					else {
						oFormatterInstance = DateFormat.getDateInstance({
							format: "YMMDD",
							style: "medium",
							strictParsing: true,
							relative: false
						}/*, sap.ui.core.Locale('en')*/);
					}
					return oFormatterInstance.format(oDate);
				}
				catch (e) {
					var oParam = {
					 	day: "2-digit", month: "2-digit", year: "numeric", weekday: "short"
					 };
					 if (bWithTime) {
					 	oParam.hour		= "2-digit";
					 	oParam.minute	= "2-digit";
					 	//oParam.second	= "2-digit";
					 }
					 return oDate.toLocaleDateString(sLocale, oParam);
				}
			},

			/**
			 * @memberOf com.xft.app.epa.lend.model.helpers
			 * @public
			 */
			getUriParam: function(oQuery, sParam) {
				if (!sParam || !oQuery)
					return undefined;
				sParam = sParam.trim();
				var sParamLowerCase = sParam.toLowerCase();
				var sParamUpperCase = sParam.toUpperCase();
				// 1. get search id from optional component-routing query
				if (oQuery[sParam])
					return oQuery[sParam];
				else if (oQuery[sParamLowerCase])
					return oQuery[sParamLowerCase];
				else if (oQuery[sParamUpperCase])
					return oQuery[sParamUpperCase];
				
				for (var p in oQuery) {
					if (this.equals(p, sParam, false))
						return oQuery[p];
				}

				// 2. get search id from url hash param
				var regParam = RegExp(sParam+"=[^?&#]+", "i");
				var aHash = location.hash.match(regParam);
				if (aHash) {
					aHash = aHash[0].split("=");
					if (aHash.length > 1)
						return aHash[1];
				}
				
				// 3. get search query from uri query params
				var sVal;
				if ((sVal = jQuery.sap.getUriParameters().get(sParam)) != undefined) {
					return decodeURIComponent(sVal);
				}
				else if ((sVal = jQuery.sap.getUriParameters().get(sParamLowerCase)) != undefined) {
					return decodeURIComponent(sVal);
				}
				else if ((sVal = jQuery.sap.getUriParameters().get(sParamUpperCase)) != undefined) {
					return decodeURIComponent(sVal);
				}
				
				return undefined;
			},
			
			filterAggregation: function(oBinding, sText, mFields, bOr) {
				if (mFields == undefined || !(oBinding instanceof Object))
					return;
				// "AND" logical conjunction is applied as default.
				var bAnd = bOr === false;
				var filters = [];
				if (sText.length > 0) {
					if (typeof mFields == "string" && mFields.length > 0) {
						filters.push(
							new sap.ui.model.Filter(mFields,
									sap.ui.model.FilterOperator.Contains, sText)
						);
					}
					else if (mFields instanceof Array) {
						var aFields = [];
						for( var i in mFields) {
							if (typeof mFields[i] == "string" && mFields[i].length > 0) {
								aFields.push(
									new sap.ui.model.Filter(mFields[i],
											sap.ui.model.FilterOperator.Contains, sText)
								);
							}
						}
						if (aFields.length) {
							filters.push(new sap.ui.model.Filter({
								filters: aFields, 
								and: bAnd
							}));
						}
					}
				}
				oBinding.filter(filters);
			},

			guid: function() {
				var buf = new Uint16Array(8);
				(window.crypto || window.msCrypto).getRandomValues(buf);
				function s4(num) {
					var ret = num.toString(16);
					while (ret.length < 4) {
						ret = '0' + ret;
					}
					return ret;
				}
				return s4(buf[0]) + s4(buf[1]) + '-' + s4(buf[2]) + '-' + s4(buf[3]) + '-' +
						s4(buf[4]) + '-' + s4(buf[5]) + s4(buf[6]) + s4(buf[7]);
			},

			parseHashParams: function(sHash) {
				var params = sHash.slice(1).split("&");
				var paramarray = {};
				params.forEach(function(param) {
					param = param.split("=");
					paramarray[param[0]] = param[1];
				});
				return paramarray;
			}
	};
	
	return me;
});