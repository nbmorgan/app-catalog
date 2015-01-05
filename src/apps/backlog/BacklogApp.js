(function () {
    var Ext = window.Ext4 || window.Ext;

    Ext.define('Rally.apps.backlog.BacklogApp', {
        extend: 'Rally.app.GridBoardApp',
        requires: [
            'Rally.ui.gridboard.plugin.GridBoardActionsMenu',
            'Rally.ui.grid.TreeGridPrintDialog',
            'Rally.ui.dialog.CsvImportDialog',
            'Rally.ui.grid.GridCsvExport'
        ],

        cls: 'backlog-app',
        config: {
            enableOwnerFilter: false,
            modelNames: ['User Story', 'Defect', 'Defect Suite'],
            defaultSettings: {
                columnNames: ['FormattedID','DisplayColor','Name','ScheduleState','Owner','PlanEstimate']
            }
        },

        getStateId: function () {
            return 'backlog';
        },

        getGridConfig: function () {
            return _.merge(this.callParent(arguments), {
                enableRanking: true,
                noDataItemName: 'backlog',
                storeConfig: {
                    filters: [
                        Rally.data.wsapi.Filter.and([
                            {property: 'Release', operator: '=', value: null},
                            {property: 'Iteration', operator: '=', value: null}
                        ])
                    ]
                }
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
                        text: 'Import User Stories...',
                        handler: function() {
                            Ext.widget({
                                xtype: 'rallycsvimportdialog',
                                type: 'HierarchicalRequirement',
                                title: 'Import User Stories'
                            });
                        }
                    },
                    {
                        text: 'Print...',
                        handler: function() {
                            Ext.create('Rally.ui.grid.TreeGridPrintDialog', {
                                grid: this.gridboard.getGridOrBoard(),
                                treeGridPrinterConfig: {
                                    largeHeaderText: 'Backlog'
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
                        html: 'Import/Export/Print',
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