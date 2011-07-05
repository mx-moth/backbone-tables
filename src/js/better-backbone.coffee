class Backbone.TableModel extends Backbone.Model
	Table: null
	links: null

	# Constructor: initialize
	#
	# When a new TableModel is instansiated, it adds itself to the tables list
	# Otherwise, not much happens here
	constructor: (data, options) ->
		@links = { }
		super data, options
		@touch()
		@Table.add @
	
	# Function: defineLinks
	# Define a bunch of links. See <defineLink>
	#
	# Parameters:
	#   links - An object that defines the name and details of a link.
	#
	# Returns:
	# This model instance
	defineLinks: (links) ->
		@defineLink name, link for name, link of links
		return @
	
	# Function: defineLinkK
	# Defines a link to another table
	#
	# Parameters:
	#   name - The name of the link. Used in <getLink>
	#   link - The an object containing the options for this link:
	#     model - The model this link joins to
	#
	# Returns:
	# This model instance
	#
	# See:
	#   - <getLink>
	#   - <defineLinks>
	defineLink: (name, link) ->
		@links[name] = link
		return @
	
	# Function: getLink
	# Retrieves the linked models for this model instance
	#
	# Parameters:
	#   name - The name of the link to fetch. See <defineLink>
	#   options - An object full of options. This will be passed on to the <TableModel.getAll>,
	#     which in turn passes it on further. The main parameters you will use are the error
	#     and success callbacks.
	#
	#     error - This is called if there is an error anywhere down the line
	#     success - Called with the linked model(s)
	# 
	# Returns:
	# This model instance.
	#
	# See:
	#   - <defineLink>
	getLink: (name, options) ->

		success = options.success || () ->
		error = options.error || () ->

		value = @get name
		link = @links[name]
		model = link
		table = model::Table

		# Dont bother fetching anything if value is null
		unless value
			success null
			return @

		table.getAll Array.from(value),
			error: error
			success: (docs) ->
				docs = docs.pop() unless Array.isArray(value)
				success docs

		return @
	
	# Function: touch
	# Updates the mtime and atime of this model to the supplied time, or now
	#
	# Parameters:
	#   time - The time to update the mtime to. Defaults to now
	#
	# Returns:
	# The model instance
	# 
	# See:
	# - <Table.limit>
	# - <Table.add>
	touch: (time = Date.now()) ->
		this.mtime = Date.now()
		this.atime = this.mtime
		return @

	# Function: grab
	# Marks this model as currently in use somewhere in the application. A model
	# can be in use by multiple things at any one time, and this will keep track
	# of them all. If a model is in use, it will not be deleted from a limited table.
	# Do not call <grab> twice from one place, unless you plan on calling <release>
	# twice as well.
	#
	# See:
	# - <Table.limit>
	# - <isUsed>
	# - <release>
	grab: () ->
		@touch
		@used++
		return @

	# Function: release
	# Unmarks this model as in use. A model can be in use by multiple things at any
	# one time, and this will keep track of them all. If a model is in use, it will
	# not be deleted from a limited table. Do not call <release> twice from one place,
	# unless you have already called <grab> twice as well.
	#
	# See:
	# - <Table.limit>
	# - <isUsed>
	# - <grab>
	release: () ->
		@used--
		return @

	# Function: isUsed
	# Returns true if this model is currently used, false otherwise
	isUsed: () -> return this.used isnt 0

class Backbone.Table extends Backbone.Collection

	constructor: (options) ->
		@url = options.url
		@model = options.model if options.model
		@model::url ?= @url
		@limit = options.limit
		super [], options
		@defineMethods options.methods
	
	# Function: _add
	# Adds a model to the table, by delegating to <Collection._add>. If there
	# are more models than the limit defined on the table, then the oldest records
	# not in use are deleted.
	#
	# Parameters:
	# 	model - The model to add, either as an instance of Model, or as raw data
	#
	# Returns:
	# The model?
	#
	# See:
	#  - <TableModel.touch>
	#  - <TableModel.isUsed>
	add: (model) ->
		super
		if @limit and @length > @limit
			clearTimeout @_addTimer if @_addTimer
			self = @

			# In case of rapid-fire removals, this is delayed some what
			@_addTimer = setTimeout (->

				# Grab and sort the unused models by their access time
				comparator = (a, b) -> return a.atime.valueOf() - b.atime.valueOf()
				notUsed = self.models.filter (model) -> not model.isUsed()
				notUsed.sort comparator

				# Remove as many models as needed from the front of the sorted array
				self.remove notUsed.models.slice 0, @length - @limit

				self._addTimer = null
			), 10

	# TODO implement this

	# Function: getAll
	# Get all the models, specified with the ids. If the models are not currently in memory,
	# fetch them from the server
	#
	# Parameters:
	#   ids - An array of the ids for the desired models
	#   options - An object containing options for this call and any subcalls
	#     error - This is called if there is an error anywhere down the line
	#     success - Called with a collection of the models that were found
	#
	# Returns:
	# This table instance
	getAll: (ids, options) ->

		success = options.success || () ->
		error = options.error || () ->
		refresh = options.refresh or false

		# Return if there are no ids
		idList = Array.from(ids)
		outstanding = idList.length

		results = []
		unknown = []

		if refresh
			unknown = idList
		else for id in idList
			doc = @get id
			if doc
				results.push doc
			else
				unknown.push id
			

		@fetchAll unknown,
			error: error
			success: (docs) ->
				success new Backbone.Collection results.concat docs
		
		return @
		
	# Function: fetchAll
	# Fetch a bunch of models from the server, specified by their ids.
	#
	# Parameters:
	#   ids - An array of the ids of the models to fetch
	#   options - An object containing options for this call and any subcalls
	#     error - This is called if there is an error anywhere down the line
	#     success - Called with an array of the models that were found
	#
	# Returns:
	# This table instance
	fetchAll: (ids, options) ->
		self = @
		ids = Array.from(ids)
		if ids.length is 0
			options.success [] if options.success
			return @

		Backbone.sync.call this, 'create', this,
			url: (Backbone.getUrl(@) || Backbone.urlError()) + '/fetch'
			method: 'create'
			contentType: 'application/json'
			data: JSON.stringify ids
			error: -> options.error
			success: (data) ->
				# Models add themselves to the table when they are created, so just turn
				# each datum into a model and we are done!
				parsed = self.parse data
				collection = self._prepareModels data

				options.success collection
				return
		
		return @
	
	# Function: _prepareModel
	# Parse a bunch of data from the server. If a record with the same id as one
	# of the ids passed in exists, then that record is updated. Otherwise, a new
	# record is created for that datum
	#
	# Parameters:
	#   data - Data to parse into new records
	#
	# Returns:
	# An array of models generated from the data
	_prepareModels: (data) ->
		self = @
		models = _.map data, (datum) ->
			doc = self.get datum.id
			if doc
				doc.set datum
			else
				doc = self._prepareModel datum
			return doc

		return models

	defineMethods: (methods = []) ->
		self = @
		for method in methods
			@[method] = (data, options = {}) ->
				options.data ?= data
				$.ajax
					url: @url + '/' + method
					type: 'post'
					processData: false
					dataType:     'json',
					processData:  false
					error: options.error
					contentType: 'application/json'
					data: JSON.stringify data
					success: (ids) ->
						self.getAll ids, options
