(function () {
    var Ext = window.Ext4 || window.Ext;

    var appIDMap = {
        milestone: -200004,
        iteration: -200013,
        release: -200012
    };

    Ext.define('Rally.apps.timeboxes.TimeboxesApp', {
        extend: 'Rally.app.GridBoardApp',
        require: [
            'Deft.Deferred',
            'Rally.apps.chartbuilder.EaselAlmBridge',
            'Rally.ui.combobox.MilestoneComboBox',
            "Rally.apps.chartbuilder.StateFieldPicker",
            'Rally.util.Help'],

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

        getSettingsFields: function () {
            debugger;
            var fields = this.callParent(arguments) || [];
            // get the settings fields that the chart requires
            var listOfTransformedSettings = this.almBridge.getSettingsFields();
            return fields.concat(listOfTransformedSettings);
        },

        getDefaultSettings: function() {
            var defaults = this.callParent(arguments);
            var defaultsFromEaselChart = this.almBridge.getDefaultSettings();
            debugger;
            return Ext.apply(defaults, defaultsFromEaselChart, {} );
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

        showSettings: function() {
            // this feels like a hack
            this.owner.defaultSettings = this.getDefaultSettings();
            //this.owner.showSettings();
        },

        getChartConfig: function () {
            if (_.contains(this.modelNames, 'iteration')) {
                return {
                    xtype:'rallyd3chart',
                    config: this._getChartConfig()
                }
            }
            else if (_.contains(this.modelNames, 'milestone')) {
                return {
                    itemId: 'mrcontainer',
                    xtype: 'component',
                    listeners: {
                        afterrender: function(){
                            this.almBridge = Ext.create('Rally.apps.chartbuilder.EaselAlmBridge', {
                                chartType : 'milestone-burn',
                                app: this
                            });
                            this.down("#mrcontainer").el.dom.firstChild.almBridge = this.almBridge;
                            this.almBridge.registerSettingsFields([
                                { type: 'milestone-picker', name: 'milestone', label: 'Milestone', value: '22897900071'}
                            ])
                        },
                        scope: this
                    },
                    style: {
                        overflow: 'hidden'
                    },
                    html: this.constructIFrame()
                };
            }
            else if (_.contains(this.modelNames, 'release')) {
                return {
                    xtype: 'component',
                    style: {
                        overflow: 'hidden'
                    },
                    html: '<iframe style="width: 100%; height: 100%" src="'+ Rally.environment.getServer().getContextPath() +'/charts/iterationVelocityChart.sp"></iframe>'
                };
            }
        },

        constructIFrame: function() {
            var filename = this.isDebugMode() ? 'almchart.html' : 'almchart.min.html';
            var version = this.getChartVersionFromRequest();
            var url = '/analytics/chart/' + version + '/' + filename + '?_gen=' + this._getCacheGeneration();
            return '<iframe frameborder="0" style="overflow:hidden;" scrolling="no" width="100%" height="100%" src="' + url + '"></iframe>';
        },

        getChartVersionFromRequest: function() {
            var parameters = Ext.Object.fromQueryString(location.search || '');
            return (parameters.chartVersion || 'releases/current');
        },

        _getCacheGeneration : function(theDate) {
            theDate = theDate || new Date();
            return Ext.Date.format(theDate, 'YmdH');
        },

        isDebugMode: function() {
            var parameters = Ext.Object.fromQueryString(location.search || '');
            return parameters.packtag === 'false';
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