(function () {
    var Ext = window.Ext4 || window.Ext;

    Ext.define('Rally.apps.users.UsersApp', {
        extend: 'Rally.app.GridBoardApp',
        requires: [
            'Rally.ui.gridboard.plugin.GridBoardActionsMenu',
            'Rally.ui.grid.TreeGridPrintDialog',
            'Rally.ui.grid.GridCsvExport'
        ],

        cls: 'users-app',
        config: {
            enableOwnerFilter: false,
            modelNames: ['User'],
            defaultSettings: {
                columnNames: ['Username','EmailAddress','FirstName','LastName','DisplayName','Disabled']
            }
        },

        getStateId: function () {
            return 'users';
        },

        getGridConfig: function () {
            return _.merge(this.callParent(arguments), {
                enableRanking: false,
                enableBulkEdit: false,
                noDataItemName: 'user'
            });
        },

        getGridStoreConfig: function () {
            return {
                enableHierarchy: false,
                childPageSizeEnabled: false
            };
        },

        getGridBoardPlugins: function() {
            var plugins = this.callParent(arguments);

            plugins.push({
                ptype: 'rallygridboardactionsmenu',
                itemId: 'printExportMenuButton',
                menuItems: [
                    {
                        text: 'Print...',
                        handler: function() {
                            Ext.create('Rally.ui.grid.TreeGridPrintDialog', {
                                grid: this.gridboard.getGridOrBoard(),
                                treeGridPrinterConfig: {
                                    largeHeaderText: 'Users'
                                }
                            });
                        },
                        scope: this
                    },
                    {
                        text: 'Export...',
                        handler: function() {
                            window.location = Rally.ui.grid.GridCsvExport.buildCsvExportUrl(this.gridboard.getGridOrBoard());
                        },
                        scope: this
                    }
                ],
                buttonConfig: {
                    iconCls: 'icon-export',
                    toolTipConfig: {
                        html: 'Export/Print',
                        anchor: 'top',
                        hideDelay: 0
                    },
                    style: {
                        'margin' : '3px 0 0 10px'
                    }
                }
            });

            return plugins;
        }
    });
})();