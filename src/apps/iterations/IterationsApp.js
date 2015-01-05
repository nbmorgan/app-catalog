(function () {
    var Ext = window.Ext4 || window.Ext;

    Ext.define('Rally.apps.iterations.IterationsApp', {
        extend: 'Rally.app.GridBoardApp',
        cls: 'iterations-app',
        config: {
            enableOwnerFilter: false,
            enableRanking: false,
            modelNames: ['Iteration'],
            defaultSettings: {
                columnNames: ['Name','Theme','StartDate','EndDate','PlannedVelocity','State']
            }
        },

        getStateId: function () {
            return 'iterations';
        },

        getGridConfig: function () {
            return _.merge(this.callParent(arguments), {
                enableRanking: false,
                noDataItemName: 'iterations'
            });
        },

        getGridStoreConfig: function () {
            return {
                enableHierarchy: false,
                childPageSizeEnabled: false
            };
        },

        getAddNewConfig: function () {
            return {
                showRank: false,
                showAddWithDetails: true,
                openEditorAfterAddFailure: true,
                ignoredRequiredFields: ['Name', 'State', 'Project'],
                minWidth: 800,
                additionalFields: [
                    {
                        xtype: 'rallydatefield',
                        emptyText: 'Select Start Date',
                        name: 'StartDate'
                    },{
                        xtype: 'rallydatefield',
                        emptyText: 'Select End Date',
                        name: 'EndDate'
                    }
                ],
                listeners: {
                    beforecreate: this._onBeforeCreate
                }
            };
        },

        _onBeforeCreate: function(addNew, record, params) {
            record.set('State', 'Planning');
        }
    });
})();