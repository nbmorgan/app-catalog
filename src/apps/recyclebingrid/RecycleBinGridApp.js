(function () {
    var Ext = window.Ext4 || window.Ext;

    Ext.define('Rally.apps.recyclebingrid.RecycleBinGridApp', {
        extend: 'Rally.app.App',

        mixins: ['Rally.clientmetrics.ClientMetricsRecordable'],

        statePrefix: 'recyclebin',
        loadGridAfterStateRestore: true,

        autoScroll: false,

        config: {
            defaultSettings: {
                modelNames: ['RecycleBinEntry'],
                columnNames: ['ID','Name','Type','DeletedBy', 'DeletionDate']
            }
        },

        launch: function () {
            if(!this.rendered) {
                this.on('afterrender', function(){
                    this._loadApp();
                }, this, {single: true});
            } else {
                this._loadApp();
            }
        },

        _loadApp: function() {
            this._getGridStore().then({
                success: function(gridStore) {
                    this._addGridBoard(gridStore);
                },
                scope: this
            });
        },

        _addGridBoard: function(gridStore) {
            this.gridboard = this.add(this._getGridBoardConfig(gridStore));
        },

        _getGridBoardConfig: function (gridStore) {
            var context = this.getContext(),
                gridStateString = this.statePrefix + '-treegrid',
                gridStateId = context.getScopedStateId(gridStateString),
                gridboardPlugins = [];

            return {
                itemId: 'gridBoard',
                xtype: 'rallygridboard',
                stateId: this.statePrefix + '-gridboard',
                context: context,
                plugins: gridboardPlugins,
                toggleState: 'grid',
                modelNames: this.getSetting('modelNames'),
                cardBoardConfig: {},
                gridConfig: this._getGridConfig(gridStore, context, gridStateId),
                storeConfig: {},
                height: 500
            };
        },

        _getGridConfig: function(gridStore, context, stateId) {
           return {
               xtype: 'rallytreegrid',
               store: gridStore,
               columnCfgs: this.getSetting('columnNames') || this.columnNames,
               summaryColumns: [],
               enableRanking: false,
               enableBulkEdit: false,
               stateId: stateId,
               stateful: true,
               alwaysShowDefaultColumns: true,
               listeners: {} //this needs to listen for pagination etc
           };
       },

       _getGridStore: function() {
           var storeConfig = Ext.apply(this.storeConfig || {}, {
               models: this.getSetting('modelNames'),
               autoLoad: true,
               remoteSort: true,
               root: {expanded: true},
               pageSize: 25,
               enableHierarchy: false,
               childPageSizeEnabled: false,
               fetch: this.columnNames
           });

           return Ext.create('Rally.data.wsapi.TreeStoreBuilder').build(storeConfig);
       }
    });
})();
