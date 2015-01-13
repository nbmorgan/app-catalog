(function () {
    var Ext = window.Ext4 || window.Ext;

    Ext.define('Rally.apps.defectsuites.DefectSuitesApp', {
        extend: 'Rally.app.GridBoardApp',
        cls: 'defectsuites-app',
        requires: [
            'Rally.ui.gridboard.plugin.GridBoardActionsMenu',
            'Rally.ui.grid.TreeGridPrintDialog',
            'Rally.ui.grid.GridCsvExport'
        ],

        config: {
            enableOwnerFilter: true,
            modelNames: ['DefectSuite'],
            defaultSettings: {
                columnNames: ['DisplayColor','Name','State','Priority','Severity','Owner']
            }
        },

        getStateId: function () {
            return 'defects';
        },

        getGridConfig: function () {
            return _.merge(this.callParent(arguments), {
                enableRanking: true,
                noDataItemName: 'defectsuites'
            });
        },

        getGridStoreConfig: function () {
            return {
                enableHierarchy: true,
                childPageSizeEnabled: true
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
                                    largeHeaderText: 'Defect Suites'
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