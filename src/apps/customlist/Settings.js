(function () {
    var Ext = window.Ext4 || window.Ext;

    var getHiddenFieldConfig = function (name) {
        return {
            name: name,
            xtype: 'rallytextfield',
            hidden: true,
            handlesEvents: {
                typeschanged: function (types) {
                    this.setValue(null);
                }
            }
        };
    };

    Ext.define('Rally.apps.customlist.Settings', {
        singleton: true,
        requires: [
            'Rally.apps.customlist.TypePicker',
            'Rally.ui.combobox.FieldComboBox',
            'Rally.ui.combobox.ComboBox',
            'Rally.ui.CheckboxField'
        ],

        getFields: function (context) {
            return [
                this._getTypePickerConfig(context),
                { type: 'query' },
                {
                    name: 'showControls',
                    xtype: 'rallycheckboxfield',
                    fieldLabel: 'Show Control Bar'
                },
                getHiddenFieldConfig('columnNames'),
                getHiddenFieldConfig('order')
            ];
        },

        _getTypePickerConfig: function (context) {
            return Rally.environment.getContext().isFeatureEnabled('MULTI_TYPE_CUSTOM_LIST') ? {
                xtype: 'customlisttypepicker',
                name: 'types',
                bubbleEvents: ['typeschanged'],
                context: context,
                fieldLabel: 'Type(s)',
                handlesEvents: {
                    projectscopechanged: function (context) {
                        this.refreshWithNewContext(context);
                    }
                },
                mapsToMultiplePreferenceKeys: ['type', 'types'],
                readyEvent: 'ready',
                shouldRespondToScopeChange: true
            } : {
                name: 'type',
                xtype: 'rallycombobox',
                allowBlank: false,
                autoSelect: false,
                shouldRespondToScopeChange: true,
                context: context,
                initialValue: 'HierarchicalRequirement',
                storeConfig: {
                    model: Ext.identityFn('TypeDefinition'),
                    sorters: [{ property: 'DisplayName' }],
                    fetch: ['DisplayName', 'ElementName', 'TypePath', 'Parent', 'UserListable'],
                    filters: [{ property: 'UserListable', value: true }],
                    autoLoad: false,
                    remoteSort: false,
                    remoteFilter: true
                },
                displayField: 'DisplayName',
                valueField: 'TypePath',
                listeners: {
                    select: function (combo) {
                        combo.fireEvent('typeschanged', [combo.getRecord().get('TypePath')]);
                    }
                },
                bubbleEvents: ['typeschanged'],
                readyEvent: 'ready',
                handlesEvents: {
                    projectscopechanged: function (context) {
                        this.refreshWithNewContext(context);
                    }
                }
            };
        }
    });
})();