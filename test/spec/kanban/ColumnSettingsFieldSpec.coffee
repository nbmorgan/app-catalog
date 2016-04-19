Ext = window.Ext4 || window.Ext

Ext.require [
  'Rally.apps.kanban.ColumnSettingsField'
]

describe 'Rally.apps.kanban.ColumnSettingsField', ->
  beforeEach ->
    @customFieldSubmitValue = 'c_mycardfield'
    @customFieldRenderValue = 'mycardfield'

  afterEach ->
    Rally.test.destroyComponentsOfQuery 'editor'
    Rally.test.destroyComponentsOfQuery 'kanbancolumnsettingsfield'

  it 'creates rows for each allowed value', ->
    @createKanbanSettingsField(
      renderTo: 'testDiv'
    )
    @refreshField()

    @waitForCallback(@readyCallback).then =>
      firstCells = Ext.dom.Query.select(".#{Ext.baseCSSPrefix}grid-cell-first > .#{Ext.baseCSSPrefix}grid-cell-inner")
      expect(firstCells.length).toBe 2
      expect(html).toBe @allowedValues[i] for html, i in Ext.Array.pluck(firstCells, 'innerHTML')

  it 'only validates field if the store has been loaded', ->
    @createKanbanSettingsField()
    expect(@field.getErrors().length).toBe 0

  it 'validates field when store loaded', ->
    @createKanbanSettingsField(
      renderTo: 'testDiv'
    )
    @refreshField()

    @waitForCallback(@readyCallback).then =>
      expect(@field.getErrors().length).toBe 1
      expect(@field.getErrors()[0]).toBe 'At least one column must be shown.'

  it 'should destroy columns grid when destroyed', ->
    @createKanbanSettingsField(
      renderTo: 'testDiv'
    )
    gridDestroySpy = @spy(@field._grid, 'destroy')
    @field.destroy()
    expect(gridDestroySpy).toHaveBeenCalledOnce()

  it 'should display 4 columns with the scheduleStateMapping picker as the last column', ->
     @createKanbanSettingsField(
       renderTo: 'testDiv'
     )
     @refreshField()

     @waitForCallback(@readyCallback).then =>
       expect(@field._grid.columns.length).toBe 4
       expect(@field._grid.columns[3].dataIndex).toBe 'scheduleStateMapping'

  it 'should display saved columns pref data', ->
    @_assertGridSetWithValues(
      expectedValues: ['Defined', 'Yes', '2', 'Defined', 'In-Progress', 'No', '∞', '--No Mapping--']
    )

  it 'should submit columns pref data when user saves settings', ->
    @_assertGridSetWithValues(
      expectedValues: ['Defined', 'Yes', '2', 'Defined', 'In-Progress', 'No', '∞', '--No Mapping--']
    )

    @waitForCallback(@readyCallback).then =>
      data = @field.getSubmitData()
      expect(data.foo).toBe @value

  helpers
    createKanbanSettingsField: (config) ->
      @readyCallback = @stub()

      @field = Ext.create('Rally.apps.kanban.ColumnSettingsField', Ext.apply(
        name: 'foo'
        listeners:
          ready: @readyCallback
        , config)
      )

    _assertGridSetWithValues: (options) ->
      @createKanbanSettingsField(
        renderTo: 'testDiv',
        defaultCardFields: options.defaultCardFields
      )
      @refreshField()
      @value = Ext.JSON.encode
        Defined: {wip:2, scheduleStateMapping:"Defined"}

      @field.setValue(@value)
      @waitForCallback(@readyCallback).then =>
        cells = Ext.dom.Query.select(".#{Ext.baseCSSPrefix}grid-cell > .#{Ext.baseCSSPrefix}grid-cell-inner")
        expect(html).toBe options.expectedValues[i] for html, i in Ext.Array.pluck(cells, 'innerHTML')

    refreshField: (@allowedValues = ["Defined", "In-Progress"]) ->
      scheduleStateField = Rally.test.mock.data.WsapiModelFactory.getModel('UserStory').getField('ScheduleState')
      @ajax.whenQueryingAllowedValues(scheduleStateField).respondWith @allowedValues
      @field.refreshWithNewField scheduleStateField