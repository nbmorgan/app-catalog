(function () {
    var Ext = window.Ext4 || window.Ext;

    Ext.define('Rally.apps.defectsuites.DefectSuitesApp', {
        extend: 'Rally.app.GridBoardApp',
        cls: 'defectsuites-app',
        requires: [
            'Rally.ui.gridboard.plugin.GridBoardActionsMenu',
            'Rally.ui.grid.TreeGridPrintDialog',
            'Rally.ui.grid.GridExport'
        ],

        config: {
            enableOwnerFilter: true,
            modelNames: ['DefectSuite'],
            defaultSettings: {
                columnNames: ['DisplayColor','Name', 'DefectStatus','State','Priority','Severity','Owner']
            },
            stateConfig: 'defectsuites'
        },

        getGridConfig: function () {
            return _.merge(this.callParent(arguments), {
                noDataItemName: 'Defect Suite',
                enableInlineAdd: true,
                inlineAddConfig: {
                    enableAddPlusNewChildStories: false
                }
            });
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
                        text: 'Export to CSV',
                        handler: function() {
                            window.location = Rally.ui.grid.GridExport.buildCsvExportUrl(this.gridboard.getGridOrBoard());
                        },
                        scope: this
                    },
                    {
                        text: 'Export to XML',
                        handler: function() {
                            window.location = Rally.ui.grid.GridExport.buildXmlExportUrl(this.gridboard.getGridOrBoard());
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