(function () {
    var Ext = window.Ext4 || window.Ext;

    Ext.define('Rally.apps.backlog.BacklogApp', {
        extend: 'Rally.app.GridBoardApp',
        alias: 'widget.backlogapp',
        columnNames: ['FormattedID', 'Name', 'PlanEstimate', 'Priority', 'Owner'],
        requires: [
            'Rally.data.wsapi.Filter',
            'Rally.ui.gridboard.plugin.GridBoardInlineFilterControl',
            'Rally.ui.gridboard.plugin.GridBoardSharedViewControl'
        ],
        modelNames: ['hierarchicalrequirement', 'defect', 'defectsuite'],
        statePrefix: 'backlog',

        getAddNewConfig: function () {
            var config = {};
            if (this.getContext().isFeatureEnabled('F8943_UPGRADE_TO_NEWEST_FILTERING_SHARED_VIEWS_ON_MANY_PAGES')) {
                config.margin = 0;
            }

            return _.merge(this.callParent(arguments), config);
        },

        getPermanentFilters: function (types) {
            types = (types === undefined ? ['hierarchicalrequirement', 'defect', 'defectSuite'] : types);

            var typeCriteria = [];
            if (_.contains(types, 'defect')) {
                typeCriteria.push(Rally.data.wsapi.Filter.and([
                    { property: 'State', operator: '!=', value: 'Closed' },
                    { property: 'TypeDefOid', operator: '=', value: this._getModelFor('defect').typeDefOid }
                ]));
            }
            if (_.contains(types, 'hierarchicalrequirement')) {
                typeCriteria.push(Rally.data.wsapi.Filter.and([
                    { property: 'DirectChildrenCount', operator: '=', value: 0 },
                    { property: 'TypeDefOid', operator: '=', value: this._getModelFor('hierarchicalrequirement').typeDefOid }
                ]));
            }

            var defectSuiteModel = this._getModelFor('defectsuite');
            return [
                Rally.data.wsapi.Filter.and([
                    { property: 'Release', operator: '=', value: null },
                    { property: 'Iteration', operator: '=', value: null }
                ]),
                Rally.data.wsapi.Filter.or(typeCriteria.concat(defectSuiteModel ? [{ property: 'TypeDefOid', operator: '=', value: defectSuiteModel.typeDefOid }] : []))
            ];
        },

        getGridConfig: function () {
            return _.merge(this.callParent(arguments), {
                inlineAddConfig: {
                    listeners: {
                        beforeeditorshow: function (addNewCmp, params) {
                            params.Iteration = 'u'; // explicitly set iteration to unscheduled so it doesn't default to current iteration on TPS editor.
                        }
                    }
                }
            });
        },

        getGridStoreConfig: function () {
            return {
                enableHierarchy: false
            };
        },

        getGridBoardCustomFilterControlConfig: function () {
            var context = this.getContext();
            var blackListFields = ['ObjectUUID', 'Iteration', 'PortfolioItem', 'Release', 'Subscription'];
            var whiteListFields = ['Milestones', 'Tags'];

            if (context.isFeatureEnabled('F8943_UPGRADE_TO_NEWEST_FILTERING_SHARED_VIEWS_ON_MANY_PAGES')) {
                return {
                    ptype: 'rallygridboardinlinefiltercontrol',
                    inline: true,
                    skinny: true,
                    inlineFilterButtonConfig: {
                        stateful: true,
                        stateId: context.getScopedStateId('backlog-inline-filter'),
                        filterChildren: true,
                        modelNames: this.modelNames,
                        inlineFilterPanelConfig: {
                            quickFilterPanelConfig: {
                                defaultFields: [
                                    'ArtifactSearch',
                                    'Owner',
                                    'ModelType'
                                ],
                                addQuickFilterConfig: {
                                    blackListFields: blackListFields,
                                    whiteListFields: whiteListFields
                                }
                            },
                            advancedFilterPanelConfig: {
                                advancedFilterRowsConfig: {
                                    propertyFieldConfig: {
                                        blackListFields: blackListFields,
                                        whiteListFields: whiteListFields
                                    }
                                }
                            }
                        }
                    }
                };
            }

            return {
                showOwnerFilter: false,
                showIdFilter: true,
                idFilterConfig: {
                    stateful: true,
                    stateId: this.getScopedStateId('backlog-id-filter'),
                    storeConfig: {
                        autoLoad: true,
                        pageSize: 25,
                        fetch: ['FormattedID', '_refObjectName'],
                        filters: this.getPermanentFilters()
                    }
                }
            };
        },

        getSharedViewConfig: function() {
            var context = this.getContext();
            if (context.isFeatureEnabled('F8943_UPGRADE_TO_NEWEST_FILTERING_SHARED_VIEWS_ON_MANY_PAGES')) {
                return {
                    ptype: 'rallygridboardsharedviewcontrol',
                    sharedViewConfig: {
                        stateful: true,
                        stateId: context.getScopedStateId('backlog-shared-view'),
                        enableUrlSharing: this.isFullPageApp !== false
                    },
                    enableGridEditing: context.isFeatureEnabled('S91174_ISP_SHARED_VIEWS_MAKE_PREFERENCE_NAMES_UPDATABLE')
                };
            }

            return {};
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

        _getModelFor: function(type) {
            return _.find(this.models, { typePath: type });
        },

        onFilterTypesChange: function(types) {
            this.gridboard.gridConfig.storeConfig.filters = this.getPermanentFilters(types);
        }
    });
})();