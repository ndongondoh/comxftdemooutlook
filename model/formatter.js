// Utility for formatting values
sap.ui.define([
	"./helpers",
	"sap/ui/core/format/DateFormat"
], function(helpers, DateFormat) {
	"use strict";

	var me = {
		/**
		 * @memberOf com.xft.demo.outlook.model.formatter
		 */
		masterDate: function(timeStamp) {
			if (!timeStamp)
				return "";
			var itemDate = new Date(timeStamp);
			if (!itemDate || itemDate.toLocaleString() == "Invalid Date")
				return timeStamp;
			
			var dateNow = new Date(Date.now());
			var bIsToday = dateNow.getUTCDate() == itemDate.getUTCDate()
							&& dateNow.getUTCMonth() == itemDate.getUTCMonth()
							&& dateNow.getUTCFullYear() == itemDate.getUTCFullYear();
			var bIsCurrYear = dateNow.getUTCFullYear() == itemDate.getUTCFullYear();
			
			var sLocale = sap.ui.getCore().getConfiguration().getLanguage();
			
			try {
				var oFormatterInstance;
				if (bIsToday) {
					oFormatterInstance = DateFormat.getDateTimeInstance({
						format: "Hm", // 12:48
						style: "medium",
						strictParsing: true,
						relative: false
					}/*, sap.ui.core.Locale('en')*/);
				}
				else {
					var sFormat = bIsCurrYear ? "MMMD" : "YMMDD"; //1. Jun : 01.06.1997 
					oFormatterInstance = DateFormat.getDateInstance({
						format: sFormat,
						style: "medium",
						strictParsing: true,
						relative: false
					}/*, sap.ui.core.Locale('en')*/);
				}
				return oFormatterInstance.format(itemDate);
			}
			catch (e) {
				var oParam;
				if (bIsToday) {
					oParam = { hour: "2-digit", minute: "2-digit" }; //12:48
					//oParam.second	= "2-digit";
					return itemDate.toLocaleTimeString(sLocale, oParam);
				}
				else {
					if (bIsCurrYear) {
						oParam = { day: "numeric", month: "short" }; //1. Jun
					}
					else {
						oParam = { day: "2-digit", month: "2-digit", year: "numeric" }; //01.06.1997
					}
					return itemDate.toLocaleDateString(sLocale, oParam);
				 }
			}
		},
		/**
		 * @memberOf com.xft.demo.outlook.model.formatter
		 */
		detailDateTime: function(timeStamp) {
			return helpers.getDate(timeStamp, true);
		}
	};
	return me;
});