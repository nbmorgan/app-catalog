(function () {
    var Ext = window.Ext4 || window.Ext;

    Ext.define('Rally.apps.customgridboard.CustomGridBoardApp', {
        extend: 'Rally.app.GridBoardApp',
        alias: 'widget.customgridboardapp',
        requires: [
            'Rally.ui.gridboard.plugin.GridBoardCustomView',
            'Rally.ui.gridboard.plugin.GridBoardModelPicker'
        ],
        statePrefix: 'customGridBoard',
        config: {
            enableGridBoardToggle: true,
            defaultSettings: {
                modelNames: ['hierarchicalrequirement']
            }
        },

        loadModelNames: function () {
            return Deft.Promise.when(this.getSetting('modelNames'));
        },

        getGridBoardPlugins: function () {
            return this.callParent(arguments).concat([
                {
                    ptype: 'rallygridboardcustomview',
                    stateId: this.getStateId()
                },
                {
                    ptype: 'rallygridboardmodelpicker',
                    stateId: this.getScopedStateId('model-picker')
                }
            ]);
        }
    });
})();
