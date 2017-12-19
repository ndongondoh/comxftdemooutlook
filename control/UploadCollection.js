sap.ui.define([
	"jquery.sap.global",
	"sap/m/UploadCollection"
], function(q, UploadCollection) {
	"use strict";
	
	var me = UploadCollection.extend("com.xft.demo.outlook.control.UploadCollection", {
		metadata: {
		},

		setUploadUrl: function (value) {
			if (this.getProperty("instantUpload") !== false) {
				sap.m.UploadCollection.prototype.setUploadUrl.apply(this, arguments);
				return;
			}
			// Per default, the property uploadUrl can only be set once, while the 
			// value of insptanceUpload is FALSE.
			this.setProperty("instantUpload", true, true); // disables the default check
			if (sap.m.UploadCollection.prototype.setUploadUrl) {
				//Ensure that the default setter is called. Doing so ensures that
				// every extension or change will be executed as well.
				sap.m.UploadCollection.prototype.setUploadUrl.apply(this, arguments);
				// Because before we call the original function we override the 
				// instantUpload property for short time, to disable the check
			}
			
			// Afterwords we set back the instantUpload property to be back 
			// in a save and consistent state
			this.setProperty("instantUpload", false, true);
		},

		renderer : "sap.m.UploadCollectionRenderer",
		
		onAfterRendering: function() {
			if (UploadCollection.prototype.onAfterRendering) {
				UploadCollection.prototype.onAfterRendering.apply(this);
			}
		}
	});
	
    me.prototype._bindDragEnterLeave = function() {
        this._bDragDropEnabled = this._isDragAndDropAllowed();
        if (!this._bDragDropEnabled) {
            return;
        }
        if (!this._oDragDropHandler) {
            this._oDragDropHandler = {
                dragEnterUIArea: this._onDragEnterUIArea.bind(this),
                dragLeaveUIArea: this._onDragLeaveUIArea.bind(this),
                dragOverUIArea: this._onDragOverUIArea.bind(this),
                dropOnUIArea: this._onDropOnUIArea.bind(this),
                dragEnterUploadCollection: this._onDragEnterUploadCollection.bind(this),
                dragLeaveUploadCollection: this._onDragLeaveUploadCollection.bind(this),
                dragOverUploadCollection: this._onDragOverUploadCollection.bind(this),
                dropOnUploadCollection: this._onDropOnUploadCollection.bind(this)
            };
        }
        this._$RootNode = q(document.body);
        this._$RootNode.bind("dragenter", this._oDragDropHandler.dragEnterUIArea);
        this._$RootNode.bind("dragleave", this._oDragDropHandler.dragLeaveUIArea);
        this._$RootNode.bind("dragover", this._oDragDropHandler.dragOverUIArea);
        this._$RootNode.bind("drop", this._oDragDropHandler.dropOnUIArea);
        this._$DragDropArea = this.$("drag-drop-area");
        this.$().bind("dragenter", this._oDragDropHandler.dragEnterUploadCollection);
        this.$().bind("dragleave", this._oDragDropHandler.dragLeaveUploadCollection);
        this.$().bind("dragover", this._oDragDropHandler.dragOverUploadCollection);
        this.$().bind("drop", this._oDragDropHandler.dropOnUploadCollection);
    };
    me.prototype._unbindDragEnterLeave = function() {
        if (!this._bDragDropEnabled && !this._oDragDropHandler) {
            return;
        }
        if (this._$RootNode) {
            this._$RootNode.unbind("dragenter", this._oDragDropHandler.dragEnterUIArea);
            this._$RootNode.unbind("dragleave", this._oDragDropHandler.dragLeaveUIArea);
            this._$RootNode.unbind("dragover", this._oDragDropHandler.dragOverUIArea);
            this._$RootNode.unbind("drop", this._oDragDropHandler.dropOnUIArea);
        }
        this.$().unbind("dragenter", this._oDragDropHandler.dragEnterUploadCollection);
        this.$().unbind("dragleave", this._oDragDropHandler.dragLeaveUploadCollection);
        this.$().unbind("dragover", this._oDragDropHandler.dragOverUploadCollection);
        this.$().unbind("drop", this._oDragDropHandler.dropOnUploadCollection);
    };
	
	/**********************************************************************************/
	
	return me;
});