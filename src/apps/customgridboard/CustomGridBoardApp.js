(function () {
    var Ext = window.Ext4 || window.Ext;

    Ext.define('Rally.apps.customgridboard.CustomGridBoardApp', {
        extend: 'Rally.app.GridBoardApp',
        alias: 'widget.customgridboardapp',
        requires: [
            'Rally.ui.Button',
            'Rally.ui.gridboard.plugin.GridBoardCustomView'
        ],
        statePrefix: 'customGridBoard',
        config: {
            enableGridBoardToggle: false,
            defaultSettings: {
                modelNames: ['hierarchicalrequirement']
            }
        },

        loadModelNames: function () {
            var modelNames = this.getSetting('modelNames');
            return Deft.Promise.when(_.isString(modelNames) ? Ext.JSON.decode(modelNames) : modelNames);
        },

        getHeaderControls: function () {
            return this.callParent(arguments).concat(this._createModelPicker());
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

        changeTypes: function (newTypes) {
            var oldTypes = this.modelNames;
            this.modelNames = _.clone(newTypes);
            this.gridboard.changeModelTypes(_.clone(newTypes));

            if (!this._areArtifacts(oldTypes) || !this._areArtifacts(newTypes)) {
                this._setDefaultColumns();
            }

            this.updateSettingsValues({
                settings: {
                    modelNames: Ext.JSON.encode(newTypes)
                }
            });

            this.loadGridBoard();
        },

        _setDefaultColumns: function () {
            debugger;
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
        },

        getGridBoardPlugins: function () {
            return this.callParent(arguments).concat([
                {
                    ptype: 'rallygridboardcustomview',
                    stateId: this.getStateId()
                }
            ]);
        }
    });
})();
