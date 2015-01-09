(function () {
    var Ext = window.Ext4 || window.Ext;

    Ext.define('Rally.apps.customgridboard.CustomGridBoardApp', {
        extend: 'Rally.app.GridBoardApp',
        alias: 'widget.customgridboardapp',
        requires: [
            'Rally.ui.grid.FieldColumnFactory',
            'Rally.ui.gridboard.plugin.GridBoardCustomView'
        ],
        config: {
            statePrefix: 'customtree',
            enableGridBoardToggle: false,
            defaultSettings: {
                modelNames: ['hierarchicalrequirement']
            }
        },

        loadModelNames: function () {
            var modelNames = this.getSetting('modelNames');
            return Deft.Promise.when(_.isString(modelNames) ? modelNames.split(',') : modelNames);
        },

        getHeaderControls: function () {
            return this.callParent(arguments).concat(this._createModelPicker());
        },

        getGridBoardPlugins: function () {
            return this.callParent(arguments).concat([
                {
                    ptype: 'rallygridboardcustomview',
                    stateId: this.getStateId()
                }
            ]);
        },

        getGridConfig: function () {
            return _.merge(this.callParent(arguments), {
                enableRanking: this._areArtifacts(this.modelNames),
                autoAddAllModelFieldsAsColumns: _.isEmpty(this.getColumnCfgs())
            });
        },

        getColumnCfgs: function () {
            return Rally.ui.grid.FieldColumnFactory.getDefaultFieldsForTypes(this.modelNames);
        },

        changeTypes: function (newTypes) {
            this.gridboard.changeModelTypes(_.clone(newTypes));
        },

        onModelTypesChange: function (gridboard, newTypes) {
            var oldTypes = this.modelNames;
            this.modelNames = _.clone(newTypes);
            this._setColumnsForNewTypes(oldTypes, newTypes);

            this.updateSettingsValues({
                settings: {
                    modelNames: newTypes
                }
            });

            this.loadGridBoard();
        },

        addGridBoard: function () {
            this.callParent(arguments);
            this.gridboard.on('modeltypeschange', this.onModelTypesChange, this);
        },

        loadGridBoard: function () {
            this.enableOwnerFilter = this._areArtifacts(this.modelNames);
            return this.callParent(arguments);
        },

        _createModelPicker: function (options) {
            this.modelPicker = Ext.create('Rally.ui.picker.ModelTypePicker', _.merge({
                blackListTypes: [
                    'AllowedAttributeValue',
                    'Attachment',
                    'AttachmentContent',
                    'AttributeDefinition',
                    'ConversationPost',
                    'Preference',
                    'ProjectPermission',
                    'ScheduledTestCase',
                    'State',
                    'TypeDefinition',
                    'WebLinkDefinition',
                    'Workspace',
                    'WorkspacePermission'
                ],
                fieldLabel: 'Types',
                labelWidth: 34,
                margin: '0',
                value: this.modelNames,
                width: 250,
                listeners: {
                    collapse: function (picker) {
                        var selectedModels = picker.getSubmitValue();
                        if (selectedModels.length && this._selectedModelsAreDifferent(selectedModels)) {
                            picker.resetOriginalValue();
                            this.changeTypes(selectedModels);
                        } else {
                            picker.reset();
                            picker.syncSelectionText();
                        }
                    },
                    scope: this
                }
            }, options));
            return this.modelPicker;
        },

        _setColumnsForNewTypes: function (oldTypes, newTypes) {
            if (this.toggleState !== 'grid') {
                return;
            }

            var grid = this.gridboard.getGridOrBoard();
            var gridState = grid.getState();
            var newColumns = Rally.ui.grid.FieldColumnFactory.getDefaultFieldsForTypes(newTypes);

            if (this._areArtifacts(oldTypes) && this._areArtifacts(newTypes)) {
                var existingColumns = gridState.columns;
                var existingColumnNames = _(existingColumns).map(function (column) {
                    return _.isString(column) ? column : column.dataIndex }
                ).compact().value();
                var defaultColumnsRemoved = _.difference(Rally.ui.grid.FieldColumnFactory.getDefaultFieldsForTypes(oldTypes), existingColumnNames);
                var newColumnsToAdd = _.difference(newColumns, defaultColumnsRemoved, existingColumnNames);

                newColumns = _.filter(existingColumns, function (column) {
                    return column && !_.contains(defaultColumnsRemoved, column.dataIndex || column);
                }).concat(_.map(newColumnsToAdd, function (column) {
                    return { dataIndex: column };
                }));
            }

            gridState.columns = newColumns;

            Ext.state.Manager.set(grid.stateId, gridState);
        },

        _areArtifacts: function (types) {
            return _.any(types, function (type) {
                return Rally.data.ModelTypes.isArtifact(type);
            });
        },

        _selectedModelsAreDifferent: function (selectedModels) {
            var normalizedCurrentModels = _.map(this.modelNames, function (model) { return model.toLowerCase(); });
            var normalizedSelectedModels = _.map(selectedModels, function (model) { return model.toLowerCase(); });

            return normalizedCurrentModels.length != normalizedSelectedModels.length ||
                _.intersection(normalizedCurrentModels, normalizedSelectedModels).length != normalizedCurrentModels.length;
        }
    });
})();
