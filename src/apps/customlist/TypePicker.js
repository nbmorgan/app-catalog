(function () {
    var Ext = window.Ext4 || window.Ext;

    Ext.define('Rally.apps.customlist.TypePicker', {
        extend: 'Ext.form.FieldContainer',
        alias: 'widget.customlisttypepicker',
        requires: [
            'Rally.data.ModelTypes',
            'Rally.ui.combobox.CheckBoxComboBox',
            'Rally.ui.combobox.ComboBox'
        ],
        mixins: {
            field: 'Ext.form.field.Field'
        },

        cls: 'customListTypePicker',

        initComponent: function () {
            this.callParent(arguments);

            this.mixins.field.initField.call(this);

            this._load().then({
                success: function () {
                    this.fireEvent('ready', this);
                },
                scope: this
            });
        },

        transformOriginalValue: function (value) {
            return (value.types && value.types.split(',')) || (value.type && [value.type]) || [];
        },

        refreshWithNewContext: function (context) {
            this.context = context;
            this.removeAll(true);
            this._load();
        },

        getSubmitData: function () {
            var data = {};
            data[this.name] = this.getValue().join(',');
            return data;
        },

        getLabelCellStyle: function () {
            return this.callParent(arguments) + 'vertical-align: top';
        },

        _load: function () {
            return this._loadTypeDefs().then({
                success: this._initControls,
                scope: this
            });
        },

        _loadTypeDefs: function () {
            var deferred = new Deft.Deferred();
            Ext.create('Rally.data.wsapi.Store', {
                autoLoad: true,
                context: this.context.getDataContext(),
                fetch: ['DisplayName', 'ElementName', 'TypePath', 'Parent', 'UserListable', 'Ordinal'],
                filters: [ { property: 'UserListable', value: true } ],
                listeners: {
                    load: function (store, types) {
                        deferred.resolve(types);
                    }
                },
                model: Ext.identityFn('TypeDefinition'),
                remoteFilter: true,
                remoteSort: false,
                sorters: [ { property: 'DisplayName' } ]
            });
            return deferred.promise;
        },

        _initControls: function (typeDefs) {
            var selectedTypePaths = this.getValue();
            var activeRow = null;
            var rowConfigs = this._getRowConfigs();

            _.each(rowConfigs, function (config) {
                var filterFn = _.bind(config.filterFn || _.identity, this);
                var sortFn = _.bind(config.sortFn || this._sortByDisplayName, this);
                var applicableSelectedTypePaths = _.filter(selectedTypePaths, filterFn);
                var applicableTypesForRow = _.filter(typeDefs, function (typeDef) {
                    return filterFn(typeDef.get('TypePath'));
                }).sort(sortFn);

                if (applicableSelectedTypePaths.length > 0 && !activeRow) {
                    activeRow = config.id;
                    this.setValue(config.multiSelect ? applicableSelectedTypePaths : applicableSelectedTypePaths[0]);
                }

                typeDefs = _.difference(typeDefs, applicableTypesForRow);

                this._addPickerRow(_.assign({}, config, {
                    isActiveRow: activeRow === config.id,
                    types: applicableTypesForRow
                }));
            }, this);

            this._setActiveRow(activeRow || rowConfigs[0].id);
        },

        _getRowConfigs: function () {
            return [
                {
                    id: 'workItems',
                    defaultValue: 'HierarchicalRequirement',
                    filterFn: this._isWorkItemType,
                    label: 'Work Items',
                    multiSelect: true,
                    sortFn: this._sortWorkItems
                },
                {
                    id: 'timeboxes',
                    defaultValue: 'Iteration',
                    filterFn: this._isTimeboxType,
                    label: 'Timeboxes'
                },
                {
                    id: 'other',
                    label: 'Other Types'
                }
            ];
        },

        _addPickerRow: function (config) {
            this.add({
                xtype: 'container',
                items: [
                    this._getRadioConfig(config),
                    this._getPickerConfig(config)
                ]
            });
        },

        _getRadioConfig: function (config) {
            return {
                xtype: 'radiofield',
                boxLabel: config.label,
                cls: 'customListTypePickerRadio',
                itemId: config.id + 'Radio',
                listeners: {
                    change: function (radio, selected) {
                        if (selected) {
                            this._setActiveRow(config.id);
                        }
                    },
                    scope: this
                },
                name: 'typeRadioGroup',
                submitValue: false,
                value: config.isActiveRow
            };
        },

        _getPickerConfig: function (config) {
            return {
                xtype: config.multiSelect ? 'rallycheckboxcombobox' : 'rallycombobox',
                allowBlank: false,
                autoSelect: !config.defaultValue,
                context: this.context,
                disabled: !config.isActiveRow,
                displayField: 'DisplayName',
                editable: false,
                initialValue: config.defaultValue,
                itemId: config.id + 'Picker',
                listeners: {
                    select: function (combo, selectedTypes) {
                        this.setValue(this._getTypePathsFromTypeDefs(selectedTypes));
                        this.fireEvent('typeschanged', this, selectedTypes);
                    },
                    scope: this
                },
                store: this._createMemoryStore(config.types),
                submitValue: false,
                value: config.isActiveRow ? this.getValue() : undefined,
                valueField: 'TypePath',
                width: 300
            };
        },

        _setActiveRow: function (newActiveRowId) {
            var oldPicker = this._getPicker(this.activeRowId);
            if (oldPicker) {
                oldPicker.setDisabled(true);
            }

            this.activeRowId = newActiveRowId;

            var newPicker = this._getPicker(newActiveRowId);
            if (newPicker) {
                newPicker.setDisabled(false);
                this.setValue(this._getTypePathsFromTypeDefs(newPicker.getValue()));
            }
        },

        _getTypePathsFromTypeDefs: function (typeDefs) {
            return _.map(_.isArray(typeDefs) ? typeDefs : [typeDefs], function (typeDef) {
                return typeDef.isModel ? typeDef.get('TypePath') : typeDef;
            });
        },

        _getPicker: function (id) {
            return id && this.down('#' + id + 'Picker');
        },

        _createMemoryStore: function (typeDefs) {
            return Ext.create('Ext.data.JsonStore', {
                autoDestroy: true,
                autoLoad: true,
                data: typeDefs,
                fields: ['DisplayName', 'TypePath'],
                proxy: { type: 'memory' }
            });
        },

        _isWorkItemType: function (typePath) {
            return Rally.data.ModelTypes.isArtifact(typePath);
        },

        _isTimeboxType: function (typePath) {
            return _.contains(['Iteration', 'Release', 'Milestone'], typePath);
        },

        _sortByDisplayName: function (itemA, itemB) {
            var valA = itemA.get('DisplayName').toLowerCase();
            var valB = itemB.get('DisplayName').toLowerCase();
            return valA === valB ? 0 : (valA < valB ? -1 : 1);
        },

        _sortWorkItems: function (itemA, itemB) {
            var ordinalA = itemA.get('Ordinal');
            var ordinalB = itemB.get('Ordinal');

            if (ordinalA !== ordinalB && ordinalA !== -1 && ordinalB !== -1) {
                return ordinalA < ordinalB ? -1 : 1;
            }

            return this._sortByDisplayName(itemA, itemB);
        }
    });
})();