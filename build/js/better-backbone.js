Backbone.TableModel = Backbone.Model.extend({

	Table: null,

	links: null,

	constructor: function(data, options) {
		this.links = { };
		this.touch();
		Backbone.Model.apply(this, arguments);
		this.Table.add(this);
	},
	
	/*
	 * Function: defineLinks
	 * Define a bunch of links. See <defineLink>
	 *
	 * Parameters:
	 *   links - An object that defines the name and details of a link.
	 *
	 * Returns:
	 * This model instance
	 */
	defineLinks: function (links) {
		var self = this;
		_.each(links, function(link, name) {
			self.defineLink(name, link);
		});
		return this;
	},
	
	/*
	 * Function: defineLinkK
	 * Defines a link to another table
	 *
	 * Parameters:
	 *   name - The name of the link. Used in <getLink>
	 *   link - The an object containing the options for this link:
	 *     model - The model this link joins to
	 *
	 * Returns:
	 * This model instance
	 *
	 * See:
	 *   - <getLink>
	 *   - <defineLinks>
	 */
	defineLink: function (name, link) {
		this.links[name] = link;
		return this;
	},
	
	/*
	 * Function: getLink
	 * Retrieves the linked models for this model instance
	 *
	 * Parameters:
	 *   name - The name of the link to fetch. See <defineLink>
	 *   options - An object full of options. This will be passed on to the <TableModel.getAll>,
	 *     which in turn passes it on further. The main parameters you will use are the error
	 *     and success callbacks.
	 *
	 *     error - This is called if there is an error anywhere down the line
	 *     success - Called with the linked model(s)
	 * 
	 * Returns:
	 * This model instance.
	 *
	 * See:
	 *   - <defineLink>
	 */
	getLink: function (name, options) {
		options = options || {};

		value = this.get(name);
		link = this.links[name];
		model = link;
		table = model.Table;

		// Dont bother fetching anything if value is null
		if (!value) {
			options.success && options.success(null);
			return this;
		}

		table.getAll(Array.from(value), {
			error: options.error,
			success: function (docs) {
				if (!Array.isArray(value)) {
					docs = docs.pop();
				}
				options.success && options.success(docs);
			},
		});

		return this;
	},
	
	/*
	 * Function: touch
	 * Updates the mtime and atime of this model to the supplied time, or now
	 *
	 * Parameters:
	 *   time - The time to update the mtime to. Defaults to now
	 *
	 * Returns:
	 * The model instance
	 * 
	 * See:
	 * - <Table.limit>
	 * - <Table.add>
	 */
	touch: function (time) {
		time = time || Date.now();
		this.mtime = time;
		this.atime = time;
		return this;
	},

	/*
	 * Function: grab
	 * Marks this model as currently in use somewhere in the application. A model
	 * can be in use by multiple things at any one time, and this will keep track
	 * of them all. If a model is in use, it will not be deleted from a limited table.
	 * Do not call <grab> twice from one place, unless you plan on calling <release>
	 * twice as well.
	 *
	 * See:
	 * - <Table.limit>
	 * - <isUsed>
	 * - <release>
	 */
	grab: function () {
		this.touch();
		this.used++;
		return this;
	},

	/*
	 * Function: release
	 * Unmarks this model as in use. A model can be in use by multiple things at any
	 * one time, and this will keep track of them all. If a model is in use, it will
	 * not be deleted from a limited table. Do not call <release> twice from one place,
	 * unless you have already called <grab> twice as well.
	 *
	 * See:
	 * - <Table.limit>
	 * - <isUsed>
	 * - <grab>
	 */
	release: function () {
		this.used--;

		if (this.used < 0) {
			this.used = 0;
			throw new Error("Model.release called with no corresponding Model.grab");
		}
			
		return this;
	},

	/*
	 * Function: isUsed
	 * Returns true if this model is currently used, false otherwise
	 */
	isUsed: function () {
		return this.used !== 0;
	},
});

(function() {
	var makeExtend = function(oldExtend, object) {
		object.extend = function() {
			var child = oldExtend.apply(this, arguments);

			// makeExtend(child.extend, object);

			var options = child.prototype.Table || {};
			options.url = child.prototype.url;
			options.model = child;

			child.Table = child.prototype.Table = new Backbone.Table(options);

			return child;
		};
	};

	makeExtend(Backbone.Model.extend, Backbone.TableModel);
})();

Backbone.Table = function (options) {
	options = _.extend({}, this.defaults, options);

	this.url = options.url;
	this.model = options.model;
	this.limit = options.limit;
	this.collection = new Backbone.Collection();
	this.collection.model = this.model;
	this.defineMethods(options.methods);
};

_.extend(Backbone.Table.prototype, Backbone.Events, {

	defaults: {
		url: null,
		model: null,
		limit: false,
		methods: [],
	},

	/*
	 * Function: add
	 * Adds a model to the table, by delegating to the <collection>. If there
	 * are more models than the limit defined on the table, then the oldest records
	 * not in use are deleted.
	 *
	 * Parameters:
	 * 	model - The model to add, either as an instance of Model, or as raw data
	 *
	 * Returns:
	 * The model?
	 *
	 * See:
	 *  - <TableModel.touch>
	 *  - <TableModel.isUsed>
	 *
	 * TODO: See if this works
	 */
	add: function (model) {
		var self = this, collection = this.collection;
		collection.add(model);
		if (this.limit && collection.length > this.limit) {
			if (this._addTimer) {
				clearTimeout(this._addTimer);
				this._addTimer = null;
			}

			// In case of rapid-fire removals, this is delayed some what
			this._addTimer = setTimeout(function() {

				// Grab and sort the unused models by their access time
				var comparator = function (a, b) { return a.atime.valueOf() - b.atime.valueOf() };
				var notUsed = collection.models.filter(function (model) { return !model.isUsed(); });
				notUsed.sort(comparator);

				var toRemove = notUsed.models.slice(0, this.length - this.limit);

				// Remove as many models as needed from the front of the sorted array
				collection.remove(toRemove);
				_.each(toRemove, function(model) { model.destroy(); });

				self._addTimer = null;
			}, 10);
		};
	},

	/**
	 * Function: get
	 * Get a single model, specified by an id. Delegates to getAll, and has exactly the same
	 * options and parameters
	 */
	get: function(id, options) {
		options = _.clone(options);
		var success = options.success;
		options.success = function(docs) {
			console.log("get success:", arguments);
			success && success(docs.at(0));
		};

		return this.getAll([id], options);
	},

	/*
	 * Function: getAll
	 * Get all the models, specified with the ids. If the models are not currently in memory,
	 * fetch them from the server
	 *
	 * Parameters:
	 *   ids - An array of the ids for the desired models
	 *   options - An object containing options for this call and any subcalls
	 *     error - This is called if there is an error anywhere down the line
	 *     success - Called with a collection of the models that were found
	 *
	 * Returns:
	 * This table instance
	 */
	getAll: function (ids, options) {
		var refresh = options.refresh || false

		// Return if there are no ids
		var idList = Array.from(ids)

		var results = [];
		var unknown = [];

		var collection = this.collection;

		if (refresh) {
			unknown = idList;
		} else {
			_.each(idList, function(id) {
				doc = collection.get(id);
				if (doc) {
					results.push(doc);
				} else {
					unknown.push(id);
				}
			});
		}

		this.fetchAll(unknown, {
			error: options.error,
			success: function (docs) {
				if (options.success) options.success(new Backbone.Collection(results.concat(docs)));
			}
		});

		return this;
	},
		
	/*
	 * Function: fetchAll
	 * Fetch a bunch of models from the server, specified by their ids.
	 *
	 * Parameters:
	 *   ids - An array of the ids of the models to fetch
	 *   options - An object containing options for this call and any subcalls
	 *     error - This is called if there is an error anywhere down the line
	 *     success - Called with an array of the models that were found
	 *
	 * Returns:
	 * This table instance
	 */
	fetchAll: function (ids, options) {
		var self = this;
		ids = Array.from(ids);
		if (ids.length === 0) {
			if (options.success) options.success([]);
			return this;
		}

		Backbone.sync.call(this, 'create', this, {
			url: (Backbone.getUrl(this) || Backbone.urlError()) + '/fetch',
			method: 'create',
			contentType: 'application/json',
			data: JSON.stringify(ids),
			error: options.error,
			success: function (data) {
				// Models add themselves to the table when they are created, so just turn
				// each datum into a model and we are done!
				collection = self.prepareModels(data);

				if (options.success) options.success(collection);
			}
		});
		
		return this;
	},
	
	/*
	 * Function: prepareModels
	 * Parse a bunch of data from the server. If a record with the same id as one
	 * of the ids passed in exists, then that record is updated. Otherwise, a new
	 * record is created for that datum
	 *
	 * Parameters:
	 *   data - Data to parse into new records
	 *
	 * Returns:
	 * An array of models generated from the data
	 */
	prepareModels: function (data) {
		var self = this, collection = this.collection;

		models = _.map(data, function (datum) {
			var doc = collection.get(datum.id);
			if (doc) {
				doc.set(datum);
			} else {
				doc = collection._prepareModel(datum);
			}
			return doc;
		});

		return models;
	},

	defineMethods: function (methods) {
		var self = this;
		_.each(methods, function(method) {
			self[method] = function (data, options) {
				options = options || {};

				$.ajax({
					url: self.url + '/' + method,
					type: 'post',
					processData: false,
					dataType: 'json',
					processData:  false,
					contentType: 'application/json',
					data: JSON.stringify(data),
					error: options.error,
					success: function (data) {
						var ids;
						if (_.isArray(data)) {
							ids = data;
							data = null;
						} else {
							ids = data.docs;
						}

						self.getAll(ids, {
							refresh: options.refresh,
							error: options.error,
							success: function(docs) {
								if (options.success) options.success(docs, data);
							}
						});
					},
				});
			};
		});
	},
});
