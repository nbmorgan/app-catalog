(function () {
    var Ext = window.Ext4 || window.Ext;

    Ext.define('Rally.apps.recyclebin.RecycleBinApp', {
        extend: 'Rally.app.GridBoardApp',
        cls: 'recyclebin-app',
        config: {
            enableOwnerFilter: false,
            enableAddNew: false,
            modelNames: ['RecycleBinEntry'],
            defaultSettings: {
                columnNames: ['ID','Name', 'Type','DeletedBy','DeletionDate']
            }
        },

        getStateId: function () {
            return 'recyclebin';
        },

        getGridConfig: function () {
            return _.merge(this.callParent(arguments), {
                enableRanking: true,
                enableBulkEdit: false,
                noDataItemName: 'deleted entrie'
            });
        },

        getGridStoreConfig: function () {
            return {
                enableHierarchy: false,
                childPageSizeEnabled: false
            };
        }
    });
})();