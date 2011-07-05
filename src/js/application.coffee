App =
	Model: {}
	View: {}

class App.Model.View extends Backbone.TableModel
	Table: new Backbone.Table
		url: '/ajax/views'
		model: @

	defaults:
		name: ''
		content: ''

class App.Model.User extends Backbone.TableModel
	Table: new Backbone.Table
		url: '/ajax/users'
		model: @
		methods: ['list']

	defaults:
		username: ''
		email: ''
		groups: []

	initialize: (options) ->
		super
		@defineLinks
			'groups': App.Model.Group

class App.Model.Group extends Backbone.TableModel
	Table: new Backbone.Table
		model: @
		url: '/ajax/groups'

	defaults:
		name: ''
		users: []

	initialize: (options) ->
		super
		@defineLinks 'users': App.Model.User

App.Model.User::Table.list {page: 0, count: 10},
	success: () ->
		console.log "getList success:", arguments
		App.Model.User::Table.list {page: 0, count: 20},
			success: () ->
				console.log "getList success:", arguments
			error: () ->
				console.log "getList error:", arguments
	error: () ->
		console.log "getList error:", arguments

###
admin.getLink 'users',
	success: (users) ->
		console.log 'Group', admin.get('name'), 'has users', users.pluck('name').join (', ')
		users.forEach (user) ->
			user.getLink 'groups',
				success: (groups) ->
					console.log "User", user.get('name'), 'is in groups', groups.pluck('name').join ', '
					groups.each (group) ->
						group.getLink 'users',
							success: (users) ->
								console.log 'Group', group.get('name'), 'has users', users.pluck('name').join (', ')
							error: (err) ->
								console.log "Error getting users", err
				error: (err) ->
					console.log "Error getting groups:", err
	error: (err) ->
		console.log "Error getting users:", err


###
