Ext = window.Ext4 || window.Ext

Ext.require [
  'Rally.apps.releaseplanning.ReleasePlanningApp',
  'Rally.app.Context'
]

describe 'Rally.apps.releaseplanning.ReleasePlanningApp', ->
  helpers
    getTimeboxColumns: ->
      @app.gridboard.getGridOrBoard().getColumns().slice(1)

    getColumn: (index) ->
      @app.gridboard.getGridOrBoard().getColumns()[index]

    getProgressBarHtml: (columnIndex) ->
      @getColumn(columnIndex).getProgressBar().getEl().select('.progress-bar-label').item(0).getHTML()

    getPlugin: (filterptype) ->
      gridBoard = @app.down 'rallygridboard'
      _.find gridBoard.plugins, (plugin) ->
        plugin.ptype == filterptype

    stubFeatureToggle: (toggles, value = true) ->
      stub = @stub(Rally.app.Context.prototype, 'isFeatureEnabled');
      stub.withArgs(toggle).returns(value) for toggle in toggles
      stub
      
    createApp: ->
      @ajax.whenQuerying('typedefinition').respondWith [Rally.test.mock.data.WsapiModelFactory.getModelDefinition('PortfolioItemFeature')]

      @releaseData = Helpers.TimeboxDataCreatorHelper.createTimeboxData
        timeboxCount: 4
        type: 'release'
        plannedVelocity: 77

      # return the releases out of order. sorting should be done correctly on the client
      @releaseData[1] = @releaseData[3];
      @releaseData = @releaseData.slice(0,3);
      @ajax.whenQuerying('release').respondWith @releaseData

      @featureData = @mom.getData 'portfolioitem/feature',
        values:
          Release: @releaseData[0]
          PreliminaryEstimate:
            Value: 12

      @ajax.whenQuerying('portfolioitem/feature').respondWith @featureData,
        sums:
          PreliminaryEstimateValue: 42

      @app = Ext.create 'Rally.apps.releaseplanning.ReleasePlanningApp',
        context: Ext.create 'Rally.app.Context',
          initialValues:
            project:
              Children:
                Count: 0
              _ref: @releaseData[0].Project._ref
            subscription: Rally.environment.getContext().getSubscription()
            workspace: Rally.environment.getContext().getWorkspace()
        renderTo: 'testDiv'

      @waitForComponentReady @app

  afterEach ->
    @app?.destroy()

  it 'should show a feature card in the correct release column', ->
    @createApp().then =>
      expect(@getColumn(1).getCards()[0].getRecord().get('Name')).toBe @featureData[0].Name

  it 'should show a progress bar based on preliminary estimate and planned velocity', ->
    @createApp().then =>
      expect(@getProgressBarHtml(1)).toStartWith '42'
      expect(@getProgressBarHtml(1)).toContain '77'

  it 'should order the release columns based on end date', ->
    @createApp().then =>
      sortedReleaseNames = _.pluck _.sortBy(@releaseData, (release) -> new Date(release.ReleaseDate)), 'Name'
      expect(_.map(@getTimeboxColumns(), (column) -> column.getTimeboxRecord().get('Name'))).toEqual sortedReleaseNames

  it 'should not use rallygridboard custom filter control', ->
    @createApp().then =>
      plugin = @getPlugin 'rallygridboardcustomfiltercontrol'
      expect(plugin).not.toBeDefined()

  describe 'filtering panel plugin', ->
    it 'should not have the old filter component', ->
      @createApp().then =>
        expect(@getPlugin('rallygridboardcustomfiltercontrol')).not.toBeDefined()

    it 'should use rallygridboard filtering plugin', ->
      @createApp().then =>
        expect(@getPlugin('rallygridboardinlinefiltercontrol')).toBeDefined()

  describe 'shared view plugin', ->

    it 'should use rallygridboard shared view plugin', ->
      @createApp().then =>
        plugin = @getPlugin('rallygridboardsharedviewcontrol')
        expect(plugin).toBeDefined()
        expect(plugin.sharedViewConfig.stateful).toBe true
        expect(plugin.sharedViewConfig.stateId).toBe @app.getContext().getScopedStateId('release-planning-shared-view')

    it 'sets current view on viewchange', ->
      @createApp().then =>
        buildGridBoardSpy = @spy(@app, '_buildGridBoard')
        destroyGridboardSpy = @spy(@app.down('rallygridboard'), 'destroy')
        @app.gridboard.fireEvent 'viewchange'
        expect(buildGridBoardSpy).toHaveBeenCalledOnce()
        expect(destroyGridboardSpy).toHaveBeenCalledOnce()
        expect(@app.down 'rallygridboard').toBeDefined()

    it 'contains default view', ->
      @createApp().then =>
        plugin = @getPlugin('rallygridboardsharedviewcontrol')
        expect(plugin.controlCmp.defaultViews.length).toBe 1
        expect(plugin.controlCmp.defaultViews[0].Name).toBe 'Default View'

