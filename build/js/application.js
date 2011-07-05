$(function() {
	var App = window.App = window.App || {};
	if (!App.Model) App.Model = {};
	if (!App.View) App.View = {};

	App.Model.View = Backbone.TableModel.extend({
		url: '/ajax/views',

		defaults: {
			name: '',
			content: '',
		}
	});

	App.Model.User = Backbone.TableModel.extend({
		url: '/ajax/users',
		Table: { methods: ['list'], },

		defaults: {
			username: '',
			email: '',
			groups: []
		},

		initialize: function(options) {
			this.defineLinks({
				groups: App.Model.Group
			});
		},
	});

	App.Model.Group = Backbone.TableModel.extend({
		url: '/ajax/groups',
		Table: { methods: ['list'], },

		defaults: {
			name: '',
			users: []
		},

		initialize: function(options) {
			this.defineLinks({'users': App.Model.User});
		},
	});

	App.View.Index = Backbone.View.extend({
		render: function() {
			var html = ["<h2>Demo</h2><ul>"];
			html.push("<li><a href='/#users'>List users</a></li>");
			html.push("<li><a href='/#groups'>List groups</a></li>");
			html.push("</ul>");
			$(this.el).append(html.join(''));
			return this;
		}
	});

	App.View.UserList = Backbone.View.extend({

		events: {
			'click .next': 'nextPage',
			'click .prev': 'prevPage'
		},

		page: 0,
		pages: 1,
		count: 10,

		initialize: function() {
			_.bindAll(this, 'update');
			this.template = _.template($('script.template.user-list').html());
		},

		render: function() {
			var html = ["<h2>Users</h2>"];
			this.showPage(this.page);
			return this;
		},

		showPage: function(page) {
			this.page = page;
			App.Model.User.Table.list({page: page, count: this.count}, {
				success: this.update,
				error: function() { }
			});
		},

		update: function(users, data) {
			this.pages = data.pages;
			data.users = users.toJSON();
			$(this.el).html(this.template(data));
		},

		nextPage: function() {
			var nextPage = this.page + 1;
			if (nextPage < this.pages) {
				this.showPage(nextPage);
			}
		},

		prevPage: function() {
			var prevPage = this.page - 1;
			if (prevPage >= 0) {
				this.showPage(prevPage);
			}
		},
	});

	App.View.UserView = Backbone.View.extend({

		initialize: function(options) {
			_.bindAll(this, 'refresh');
			this.getUser(options.userId);
			this.template = _.template($('script.template.user-view').html());
		},

		getUser: function(userId) {
			var self = this;
			this.userId = userId;
			App.Model.User.Table.get(userId, {
				success: function(user) {
					console.log(userId, user);
					self.model = user;
					self.model.bind('change', self.refresh);
					self.refresh();
				}
			});
		},

		render: function() {
			this.rendered = true;
			this.refresh();
			return this;
		},

		refresh: function() {
			if (!this.model || !this.rendered) return;
			console.log("Refreshing layout");
			var html = this.template(this.model.toJSON());
			console.log(this.el, $(this.el), html);
			$(this.el).html(html);
		},
	});

	App.View.GroupList = Backbone.View.extend({

		events: {
			'click .next': 'nextPage',
			'click .prev': 'prevPage'
		},

		page: 0,
		pages: 1,
		count: 10,

		initialize: function() {
			_.bindAll(this, 'update');
			this.template = _.template($('script.template.group-list').html());
		},

		render: function() {
			this.showPage(this.page);
			return this;
		},

		showPage: function(page) {
			this.page = page;
			App.Model.Group.Table.list({page: page, count: this.count}, {
				success: this.update,
				error: function() { }
			});
		},

		update: function(groups, data) {
			this.pages = data.pages;
			data.groups = groups.toJSON();
			$(this.el).html(this.template(data));
		},

		nextPage: function() {
			var nextPage = this.page + 1;
			if (nextPage < this.pages) {
				this.showPage(nextPage);
			}
		},

		prevPage: function() {
			var prevPage = this.page - 1;
			if (prevPage >= 0) {
				this.showPage(prevPage);
			}
		},
	});

	App.View.GroupView = Backbone.View.extend({

		initialize: function(options) {
			_.bindAll(this, 'refresh');
			this.getGroup(options.groupId);
			this.template = _.template($('script.template.group-view').html());
		},

		getGroup: function(groupId) {
			var self = this;
			this.groupId = groupId;
			App.Model.Group.Table.get(groupId, {
				success: function(group) {
					console.log(groupId, group);
					self.model = group;
					self.model.bind('change', self.refresh);
					self.refresh();
				}
			});
		},

		render: function() {
			this.rendered = true;
			this.refresh();
			return this;
		},

		refresh: function() {
			if (!this.model || !this.rendered) return;
			console.log("Refreshing layout");
			var html = this.template(this.model.toJSON());
			console.log(this.el, $(this.el), html);
			$(this.el).html(html);
		},
	});

	App.Application = Backbone.Router.extend({
		routes: {
			'': 'index',
			'users': 'usersList',
			'users/:user': 'userView',
			'groups': 'groupsList',
			'groups/:group': 'groupView',
		},

		container: null,

		initialize: function() {
			this.container = $('#content');
			this.bind('route', function() {
			});
		},

		destroyCurrent: function() {
			if (this.current) {
				this.current.remove();
			}
			this.current = null;
		},

		index: function() {
			this.destroyCurrent();
			var index = new App.View.Index();
			$(this.container).append(index.render().el);
			this.current = index;
		},

		usersList: function() {
			this.destroyCurrent();
			var list = new App.View.UserList();
			$(this.container).append(list.render().el);
			this.current = list;
		},

		userView: function(user) {
			this.destroyCurrent();
			var view = new App.View.UserView({userId: user});
			$(this.container).append(view.render().el);
			this.current = view;
		},

		groupsList: function() {
			this.destroyCurrent();
			var list = new App.View.GroupList();
			$(this.container).append(list.render().el);
			this.current = list;
		},

		groupView: function(group) {
			this.destroyCurrent();
			var view = new App.View.GroupView({groupId: group});
			$(this.container).append(view.render().el);
			this.current = view;
		},
	});

	var app = new App.Application();
	Backbone.history.start();
});
