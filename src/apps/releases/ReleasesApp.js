(function () {
    var Ext = window.Ext4 || window.Ext;

    Ext.define('Rally.apps.releases.ReleasesApp', {
        extend: 'Rally.app.GridBoardApp',
        cls: 'releases-app',
        config: {
            enableOwnerFilter: false,
            enableRanking: false,
            modelNames: ['Release'],
            defaultSettings: {
                columnNames: ['Name','Theme','ReleaseStartDate','ReleaseDate','PlannedVelocity','State']
            }
        },

        getStateId: function () {
            return 'releases';
        },

        getGridConfig: function () {
            return _.merge(this.callParent(arguments), {
                enableRanking: false,
                noDataItemName: 'releases'
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
                ignoredRequiredFields: ['Name', 'State', 'Project', 'GrossEstimateConversionRatio'],
                minWidth: 800,
                additionalFields: [
                    {
                        xtype: 'rallydatefield',
                        emptyText: 'Select Start Date',
                        name: 'ReleaseStartDate'
                    },{
                        xtype: 'rallydatefield',
                        emptyText: 'Select Release Date',
                        name: 'ReleaseDate'
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