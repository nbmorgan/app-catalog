(function () {
    var Ext = window.Ext4 || window.Ext;

    Ext.define('Rally.apps.portfolioitemstreegrid.PortfolioItemsTreeGridApp', {
        extend: 'Rally.apps.common.PortfolioItemsGridBoardApp',
        mixins: ['Rally.clientmetrics.ClientMetricsRecordable'],
        requires: [
            'Rally.ui.gridboard.plugin.GridBoardActionsMenu',
            'Rally.ui.grid.TreeGridPrintDialog',
            'Rally.ui.dialog.CsvImportDialog',
            'Rally.ui.grid.GridCsvExport'
        ],

        componentCls: 'pitreegrid',
        printHeaderLabel: 'Portfolio Items',
        statePrefix: 'portfolio-tree',
        toggleState: 'grid',

        getGridConfig: function(options){
            var config = this.callParent(arguments);
            config.bufferedRenderer = true;
            config.enableInlineAdd = this.getContext().isFeatureEnabled('F6038_ENABLE_INLINE_ADD');
            return config;
        }
    });
})();
