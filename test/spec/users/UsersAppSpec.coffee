Ext = window.Ext4 || window.Ext

Ext.require [
  'Rally.auth.UserPermissions',
  'Rally.app.Context'
]

describe 'Rally.apps.users.UsersApp', ->
  helpers
    stubFeatureToggle: (toggles, value = true) ->
      stub = @stub(Rally.app.Context::, 'isFeatureEnabled')
      stub.withArgs(toggle).returns(value) for toggle in toggles
      stub

    getPluginOfType: (filterptype) ->
      gridBoard = @app.down 'rallygridboard'
      _.find gridBoard.plugins, (plugin) ->
        plugin.ptype == filterptype

    createApp: ->
      @app = Ext.create 'Rally.apps.users.UsersApp',
        context: Ext.create 'Rally.app.Context',
          initialValues:
            permissions: Rally.environment.getContext().getPermissions()
            workspace: Rally.environment.getContext().getWorkspace()
        height: 1000
        renderTo: 'testDiv'

      @waitForComponentReady @app

  beforeEach ->
    @permissionStub = @stub(Rally.auth.UserPermissions::, 'isWorkspaceAdminInMoreThanOneWorkspace').returns false
    @ajax.whenQuerying('typedefinition').respondWith [Rally.test.mock.data.WsapiModelFactory.getModelDefinition('User')]

    @ajax.whenQuerying('User').respondWith @mom.getData('User')

    @workspaces = @mom.getData 'Workspace', values: WorkspaceConfiguration: {}
    @ajax.whenQueryingEndpoint('workspaces/admin').respondWith @workspaces

    @ajax.whenQueryingEndpoint('/licensing/seats.sp').respondWith {}

  describe 'basic', ->
    beforeEach ->
      @createApp()

    it 'should create the application', ->
      expect(@app).not.toBeNull()

    it 'should have a count of subscription seats as the last item in the left header', ->
      expect(@getPluginOfType('rallysubscriptionseats')).toBeDefined()
      expect(@app.gridboard.getHeader().getLeft().items.last().xtype).toBe 'rallysubscriptionseats'

  describe 'workspace filter', ->
    beforeEach ->
      @createApp()

    it 'should not filter by workspace by default', ->
      expect(@app.gridboard.getGridOrBoard().store).toHaveNoFilters()

    it 'should filter by workspace when one is selected', ->
      new Helpers.ComboBoxHelper('.user-workspace-picker').openAndSelect(@workspaces[0]._refObjectName).then =>
        expect(@app.context.getWorkspace().ObjectID).toBe @workspaces[0].ObjectID
        expect(@app.gridboard.getGridOrBoard().store).toOnlyHaveFilter ['WorkspacePermission', '!=', 'No Access']

    it 'should be to the right of the filter control', ->
      headerItemIds = _.pluck @app.gridboard.getHeader().getLeft().items.getRange(), 'itemId'
      expect(headerItemIds.indexOf('gridBoardFilterControlCt')).toBe headerItemIds.indexOf('userWorkspacePicker') - 1

  describe 'workspace filter with toggle on', ->
    it 'should not filter by workspace by default', ->
      @createApp().then =>
        expect(@app.gridboard.getGridOrBoard().store).toHaveNoFilters()

    it 'should filter by workspace after one is selected & persisted', ->
      @stubFeatureToggle ['S108179_UPGRADE_TO_NEWEST_FILTERING_SHARED_VIEWS_ON_USERS'], true
      workspaceRecord = Ext.clone(Rally.environment.getContext().getWorkspace())
      workspaceRecord.ObjectID = '123'
      @createApp().then =>
        loadSpy = @spy(@app, 'loadGridBoard')
        @app.fireEvent 'workspaceselect', {}, [workspaceRecord]
        @app.fireEvent 'inlinefilterstatesave'
        expect(@app.context.getWorkspace().ObjectID).toBe '123'
        expect(loadSpy).toHaveBeenCalledOnce()

  describe '#getScopedStateId', ->
    beforeEach ->
      @createApp()

    it 'should include user scoping', ->
      expect(@app.getScopedStateId()).toContain 'user'

    it 'should not include workspace scoping', ->
      expect(@app.getScopedStateId()).not.toContain 'workspace'

  describe 'filtering panel plugin', ->
    it 'should have the old filter component by default', ->
      @createApp().then =>
        expect(@getPluginOfType('rallygridboardcustomfiltercontrol')).toBeDefined()

    it 'should use rallygridboard filtering plugin', ->
      @stubFeatureToggle ['S108179_UPGRADE_TO_NEWEST_FILTERING_SHARED_VIEWS_ON_USERS'], true
      @createApp().then =>
        expect(@getPluginOfType('rallygridboardinlinefiltercontrol')).toBeDefined()

    it 'should have workspace as quick filter when user has admin access to more than one workspace', ->
      @stubFeatureToggle ['S108179_UPGRADE_TO_NEWEST_FILTERING_SHARED_VIEWS_ON_USERS'], true
      @permissionStub.restore()
      @stub(Rally.environment.getContext().getPermissions(), 'isWorkspaceAdminInMoreThanOneWorkspace').returns true
      @createApp().then =>
        plugin = @getPluginOfType('rallygridboardinlinefiltercontrol')
        defaultFields = plugin.inlineFilterButtonConfig.inlineFilterPanelConfig.quickFilterPanelConfig.defaultFields
        expect(defaultFields.length).toBe 2
        expect(defaultFields[0]).toBe 'UserSearch'
        expect(defaultFields[1]).toBe 'AdminWorkspaces'

    it 'should set up Search quick filter by default', ->
      @stubFeatureToggle ['S108179_UPGRADE_TO_NEWEST_FILTERING_SHARED_VIEWS_ON_USERS'], true
      @createApp().then =>
        plugin = @getPluginOfType('rallygridboardinlinefiltercontrol')
        defaultFields = plugin.inlineFilterButtonConfig.inlineFilterPanelConfig.quickFilterPanelConfig.defaultFields
        expect(defaultFields.length).toBe 1
        expect(defaultFields[0]).toBe 'UserSearch'

  describe 'shared view plugin', ->
    it 'should not have shared view plugin if the toggle is off', ->
      @createApp().then =>
        expect(@getPluginOfType('rallygridboardsharedviewcontrol')).not.toBeDefined()

    it 'should use rallygridboard shared view plugin if toggled on', ->
      @stubFeatureToggle ['S108179_UPGRADE_TO_NEWEST_FILTERING_SHARED_VIEWS_ON_USERS'], true
      @createApp().then =>
        plugin = @getPluginOfType('rallygridboardsharedviewcontrol')
        expect(plugin).toBeDefined()
        expect(plugin.sharedViewConfig.stateful).toBe true
        expect(plugin.sharedViewConfig.stateId).toBe @app.getScopedStateId('shared-view')

    it 'sets current view on viewchange', ->
      @stubFeatureToggle ['S108179_UPGRADE_TO_NEWEST_FILTERING_SHARED_VIEWS_ON_USERS'], true
      @createApp().then =>
        loadSpy = @spy(@app, 'loadGridBoard')
        @app.gridboard.fireEvent 'viewchange'
        expect(loadSpy).toHaveBeenCalledOnce()
        expect(@app.down('#gridBoard')).toBeDefined()

    it 'contains default view', ->
      @stubFeatureToggle ['S108179_UPGRADE_TO_NEWEST_FILTERING_SHARED_VIEWS_ON_USERS'], true
      @createApp().then =>
        plugin = @getPluginOfType('rallygridboardsharedviewcontrol')
        expect(plugin.controlCmp.defaultViews.length).toBe 1
        expect(plugin.controlCmp.defaultViews[0].Name).toBe 'Default View'

