(function(){

    var Ext = window.Ext4 || window.Ext;

    /**
    * shows print dialog for Iteration Progress App
    */
    Ext.define('Rally.apps.iterationtrackingboard.PrintDialog', {
        alias:'widget.iterationprogessappprintdialog',
        extend: 'Rally.ui.dialog.PrintDialog',
        requires: ['Ext.form.RadioGroup', 'Rally.ui.Button'],

        autoShow: true,
        cls: 'iteration-progress-dialog print-dialog',
        height: 300,
        layout: {
            type: 'vbox',
            align: 'left'
        },
        width: 520,

        constructor: function(config) {
            this.nodesToExpand = [];
            this.allRecords = [];

            this.callParent([Ext.merge({
                items: [
                    {
                        xtype: 'container',
                        html: 'What would you like to print?',
                        cls: 'dialog-title'
                    },
                    {
                        xtype: 'radiogroup',
                        itemId: 'whattoprint',
                        vertical: true,
                        columns: 1,
                        height: 70,
                        width: 470,
                        items: [
                            {
                                boxLabel: 'Summary list of work items',
                                name: 'reportType',
                                inputValue: 'summary',
                                checked: true
                            },
                            {
                                boxLabel: 'Summary list of work items with children',
                                name: 'reportType',
                                inputValue: 'includechildren'
                            }
                        ]
                    },
                    {
                        xtype: 'container',
                        cls: config.showWarning ? 'print-warning' : 'print-warning rly-hidden',
                        html: '<div class="icon-warning alert"></div> Print is limited to 200 work items.'
                    }
                ]
            }, config)]);
        },

        initComponent: function() {
            this.callParent(arguments);

            this.on('print', this._handlePrintClick, this);
        },

        _handlePrintClick: function() {
            var treeStoreBuilder = Ext.create('Rally.data.wsapi.TreeStoreBuilder');
            var storeConfig = this._buildStoreConfig();
            treeStoreBuilder.build(storeConfig).then({
                success: function(store) {
                    // parent types must be overridden after the store is built because the builder automatically overrides the config
                    store.parentTypes = this.grid.getStore().parentTypes;
                    store.load();
                },
                scope: this
            });
        },

        _buildStoreConfig: function() {
            var includeChildren = this.down('#whattoprint').getChecked()[0].inputValue === 'includechildren';
            var gridStore = this.grid.getStore();
            return {
                models: ['User Story', 'Defect', 'Defect Suite', 'Test Set'],
                autoLoad: false,
                pageSize: 200,
                remoteSort: true,
                root: {expanded: includeChildren},
                enableHierarchy: includeChildren,
                childPageSizeEnabled: false,
                fetch: gridStore.fetch,
                filters: gridStore.filters ? gridStore.filters.items : [],
                sorters: gridStore.getSorters(),
                listeners: {
                    load: this._onStoreLoad,
                    scope: this
                }
            };
        },

        _onStoreLoad: function(treeStore, node, records, success, eOpts) {
            if (_.isEmpty(this.allRecords)) {
                this.allRecords = records;
            }

            if (treeStore.enableHierarchy) {
                this.nodesToExpand = _.without(this.nodesToExpand, node.getId());

                _(records).filter(function(record) {
                    return !record.isLeaf();
                }).forEach(function(record) {
                    this.nodesToExpand.push(record.getId());
                    record.expand(true);
                }, this);
            }

            if (_.isEmpty(this.nodesToExpand)) {
                this._onDataReady();
            }
        },

        _onDataReady: function() {
            var iterationName = this.timeboxScope.getRecord() ? this.timeboxScope.getRecord().get('Name') : 'Unscheduled';
            var treeGridPrinter = Ext.create('Rally.ui.grid.TreeGridPrinter', {
                records: this.allRecords,
                grid: this.grid,
                iterationName: iterationName
            });
            var win = Rally.getWindow();

            if(win.printWindow) {
                win.printWindow.close();
            }

            win.printWindow = win.open(Rally.environment.getServer().getContextUrl() + '/print/printContainer.html', 'printWindow', 'height=600,width=1000,toolbar=no,menubar=no,scrollbars=yes');
            if (!win.printWindow) {
                alert('It looks like you have a popup blocker installed. Please turn this off to see the print window.');
                return;
            }
            treeGridPrinter.print(win.printWindow);
            win.printWindow.focus();

            this.destroy();
        }
    });
})();
