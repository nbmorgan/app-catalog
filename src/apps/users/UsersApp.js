(function () {
    var Ext = window.Ext4 || window.Ext;

    Ext.define('Rally.apps.users.UsersApp', {
        extend: 'Rally.app.GridBoardApp',
        requires: [
            'Rally.apps.users.plugins.SubscriptionSeats',
            'Rally.data.wsapi.ModelFactory',
            'Rally.ui.combobox.plugin.PreferenceEnabledComboBox',
            'Rally.util.Ref',
            'Rally.ui.gridboard.plugin.GridBoardInlineFilterControl',
            'Rally.ui.gridboard.plugin.GridBoardSharedViewControl'
        ],

        cls: 'users-app',
        isWorkspaceScoped: true,
        modelNames: ['User'],
        scopeOfUserPrefs: 'subscription',
        statePrefix: 'users',

        getGridBoardPlugins: function () {
            return this.callParent(arguments).concat([{
                ptype: 'rallysubscriptionseats',
                context: this.getContext()
            }]);
        },

        getGridConfig: function () {
            return _.merge(this.callParent(arguments), {
                enableBulkEdit: false,
                rowActionColumnConfig: {
                    menuOptions: {
                        showInlineAdd: false
                    }
                }
            });
        },

        getFieldPickerConfig: function () {
            var config = this.callParent();
            config.gridAlwaysSelectedValues = [
               'UserName'
            ];
            return config;
        },

        getScopedStateId: function (suffix) {
            return Ext.create('Rally.state.ScopedStateUtil').getScopedStateId(this.getStateId(suffix), {
                appID: this.getContext().getAppId(),
                filterByUser: true
            });
        },

        _createWorkspacePicker: function () {
            var deferred = new Deft.Deferred();

            this.workspacePicker = Ext.create('Rally.ui.combobox.ComboBox', {
                allowClear: true,
                autoExpand: true,
                clearText: '-- Clear Filter --',
                cls:'user-workspace-picker',
                context: this.getContext(),
                editable: false,
                emptyText: 'Filter by Workspace',
                itemId: 'userWorkspacePicker',
                listeners: {
                    ready: {
                        fn: function() {
                            deferred.resolve();
                        },
                        single: true
                    },
                    scope: this
                },
                plugins: [{
                    ptype: 'rallypreferenceenabledcombobox',
                    preferenceName: this.getScopedStateId('workspace-combobox')
                }],
                storeConfig: {
                    autoLoad: true,
                    filters: [{property: 'State', value: 'Open'}],
                    limit: Infinity,
                    model: Ext.identityFn('Workspace'),
                    proxy: Rally.data.wsapi.ModelFactory.buildProxy(Rally.environment.getServer().getContextPath() + '/webservice/v2.x/workspaces/admin', 'workspace', null, 'v2.x'),
                    sorters: {
                        property: 'Name',
                        direction: 'ASC'
                    }
                }
            });
            return deferred.promise;
        },

        _getSelectedWorkspace: function() {
            return this.workspacePicker.getStore().findRecord('_ref', this.workspacePicker.getValue());
        },

        _onWorkspaceSelect: function() {
            this._setWorkspaceOnContext();
            this.loadGridBoard();
        },

        _setWorkspaceOnContext: function() {
            this.context = this.getContext().clone();
            this.context.setWorkspace(this._getSelectedWorkspace() ? this._getSelectedWorkspace().data : Rally.environment.getContext().getWorkspace());
        },

        getAddNewConfig: function () {
            return _.merge(this.callParent(arguments), {margin:0});
        },

        getGridBoardConfig: function () {
            var config = this.callParent(arguments);
            return _.merge(config, {
                listeners: {
                    viewchange: function() {
                        this.loadGridBoard();
                    },
                    scope: this
                }
            });
        },

        getGridBoardCustomFilterControlConfig: function () {
            var blackListFields = ['ArtifactSearch', 'ModelType', 'SubscriptionID'];
            var whiteListFields = [];
            var defaultFields = ['UserSearch', 'WorkspaceScope'];
            var additionalFields = [{
                name: 'UserSearch',
                displayName: 'Search'
            }, {
                name: 'WorkspaceScope',
                displayName: 'Workspace Scope'
            }];

            return {
                ptype: 'rallygridboardinlinefiltercontrol',
                inlineFilterButtonConfig: {
                    stateful: true,
                    stateId: this.getScopedStateId('inline-filter'),
                    model: this.models[0],
                    inlineFilterPanelConfig: {
                        quickFilterPanelConfig: {
                            defaultFields: defaultFields,
                            addQuickFilterConfig: {
                                blackListFields: blackListFields,
                                whiteListFields: whiteListFields,
                                additionalFields: additionalFields
                            }
                        },
                        advancedFilterPanelConfig: {
                            advancedFilterRowsConfig: {
                                propertyFieldConfig: {
                                    blackListFields: blackListFields,
                                    whiteListFields: whiteListFields,
                                    width: 185
                                }
                            }
                        },
                        getFilters: function() {
                            var matchType = this.getMatchType(),
                                filters = [].concat(this.getQuickFilters()).concat(this.getAdvancedFilters()),
                                workspaceScopeFilter = _.find(filters, { name: 'WorkspaceScope'});

                            if (workspaceScopeFilter && workspaceScopeFilter.property !== 'WorkspacePermission' && matchType !== 'CUSTOM') {
                                filters = _.reject(filters, { name: 'WorkspaceScope'} );
                            }

                            return filters;
                        }
                    }
                }
            };
        },

        getSharedViewConfig: function() {
            return {
                ptype: 'rallygridboardsharedviewcontrol',
                sharedViewConfig: {
                    stateful: true,
                    stateId: this.getScopedStateId('shared-view'),
                    enableUrlSharing: this.isFullPageApp !== false,
                    enableProjectSharing: false,
                    defaultViews: _.map(this._getDefaultViews(), function(view){
                        Ext.apply(view, {
                            Value: Ext.JSON.encode(view.Value, true)
                        });
                        return view;
                    }, this)
                }
            };
        },

        _getDefaultViews: function() {
            if (this.toggleState === 'grid'){
                var columns = [
                        {dataIndex: 'UserName'},
                        {dataIndex: 'EmailAddress'},
                        {dataIndex: 'FirstName'},
                        {dataIndex: 'LastName'},
                        {dataIndex: 'DisplayName'},
                        {dataIndex: 'Disabled'},
                        {dataIndex: 'WorkspacePermission'}
                    ];

                return [{
                    Name: 'Default View',
                    identifier: 1,
                    Value: {
                        toggleState: 'grid',
                        columns: columns
                    }
                }];
            }

            return [];
        }
    });
})();