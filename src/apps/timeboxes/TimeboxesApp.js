(function () {
    var Ext = window.Ext4 || window.Ext;

    var appIDMap = {
        milestone: -200004,
        iteration: -200013,
        release: -200012
    };

    Ext.define('Rally.apps.timeboxes.TimeboxesApp', {
        extend: 'Rally.app.GridBoardApp',
        require: ['Deft.Deferred'],

        enableGridBoardToggle: true,

        loadSettingsAndLaunch: function () {
            if (this.modelPicker) {
                this.callParent(arguments);
            } else {
                this._createPicker().then({
                    success: function (selectedType) {
                        this.changeModelType(selectedType);
                    },
                    scope: this
                });
            }
        },

        changeModelType: function (newType) {
            this.context = this.getContext().clone({
                appID: appIDMap[newType]
            });
            this.modelNames = [newType];
            this.statePrefix = newType;
            this.loadSettingsAndLaunch();
        },

        getGridBoardToggleConfig: function () {
            return _.merge(this.callParent(arguments), {
                showBoardToggle: false,
                showChartToggle: true
            });
        },

        getChartConfig: function () {
            if (_.contains(this.modelNames, 'iteration')) {
                return {
                    xtype: 'component',
                    style: {
                        overflow: 'hidden'
                    },
                    html: '<iframe style="width: 100%; height: 100%" src="'+ Rally.environment.getServer().getContextPath() +'/charts/iterationVelocityChart.sp"></iframe>'
                };
            }
        },

        _createPicker: function () {
            var deferred = new Deft.Deferred();

            this.modelPicker = Ext.create('Rally.ui.combobox.PreferenceEnabledComboBox', {
                context: this.getContext().clone({
                    appID: null
                }),
                listeners: {
                    change: this._onTimeboxTypeChanged,
                    ready: {
                        fn: function (combo) {
                            deferred.resolve(combo.getValue());
                        },
                        single: true
                    },
                    scope: this
                },
                preferenceName: 'timebox-combobox',
                displayField: 'name',
                valueField: 'type',
                queryMode: 'local',
                renderTo: Ext.query('#content .titlebar .dashboard-timebox-container')[0],
                storeType: 'Ext.data.Store',
                storeConfig: {
                    proxy: {
                        type: 'memory'
                    },
                    fields: ['name', 'type'],
                    data: [
                        { name: 'Releases', type: 'release' },
                        { name: 'Iterations', type: 'iteration' },
                        { name: 'Milestones', type: 'milestone' }
                    ]
                }
            });

            return deferred.promise;
        },

        _onTimeboxTypeChanged: function () {
            if (this.modelPicker) {
                this.changeModelType(this.modelPicker.getValue());
            }
        }
    });
})();