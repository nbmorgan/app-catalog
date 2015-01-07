(function () {
    var Ext = window.Ext4 || window.Ext;

    Ext.define('Rally.apps.customgridboard.CustomGridBoardApp', {
        extend: 'Rally.app.GridBoardApp',
        alias: 'widget.customgridboardapp',
        requires: [
            'Rally.ui.Button',
            'Rally.ui.gridboard.plugin.GridBoardCustomView'
        ],
        statePrefix: 'customGridBoard',
        config: {
            enableGridBoardToggle: true,
            defaultSettings: {
                modelNames: ['hierarchicalrequirement']
            }
        },

        loadModelNames: function () {
            return Deft.Promise.when(this.getSetting('modelNames') || []);
        },

        loadGridBoard: function () {
            if (this.modelNames.length) {
                this.callParent(arguments);
            } else {
                Ext.create('Rally.ui.popover.Popover', {
                    target: this.getEl(),
                    items: [
                        this._createModelPicker(),
                        {
                            xtype: 'rallybutton',
                            itemId: 'acceptbutton',
                            text: 'Accept',
                            style: {
                                float: 'right'
                            }
                        }
                    ]
                });
            }
        },

        getHeaderControls: function () {
            return this.callParent(arguments).concat(this._createModelPicker());
        },

        _createModelPicker: function (options) {
            this.modelPicker = Ext.create('Rally.ui.picker.ModelTypePicker', _.merge({
                margin: '0 9 0 0',
                value: this.modelNames,
                width: 200,
                listeners: {
                    collapse: function (picker) {
                        var selectedModels = picker.getSubmitValue();
                        if (selectedModels.length && _.difference(selectedModels, this.modelNames).length > 0) {
                            picker.resetOriginalValue();
                            this.modelNames = selectedModels;
                            this.loadGridBoard();
                        }
                    },
                    scope: this
                }
            }, options));
            return this.modelPicker;
        },

        getGridBoardPlugins: function () {
            return this.callParent(arguments).concat([
                {
                    ptype: 'rallygridboardcustomview',
                    stateId: this.getStateId()
                }
            ]);
        }
    });
})();
