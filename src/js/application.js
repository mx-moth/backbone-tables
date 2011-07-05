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
		Table: {
			methods: ['list'],
		},

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
			return this.el;
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
		},

		render: function() {
			var html = ["<h2>Users</h2>"];
			var $el = $(this.el);
			$el.append('<h2>Users</h2>');

			this.list = $('<ul class="users list">');
			this.numbers = $('<p class="numbers">');
			$el.append(this.list, this.numbers);

			$el.append($('<p class="pages"><button class="prev">Previous</button> <button class="next">Next</button></p>'));

			this.showPage(this.page);

			return this.el;
		},

		showPage: function(page) {
			this.page = page;
			App.Model.User.Table.list({page: page, count: this.count}, {
				success: this.update,
				error: function() { }
			});
		},

		update: function(users, data) {

			var $list = $(this.list);
			var $page = $(this.numbers);
			$list.empty();

			users.each(function(user) {
				$list.append($('<li><a href="#users/' + user.get('id') + '">' + user.get('name') + '</a></li>'));
			});
			$page.html('Page ' + (data.page + 1) + ' of ' + data.pages);
			this.pages = data.pages;
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
			$(this.container).append(index.render());
			this.current = index;
		},

		usersList: function() {
			this.destroyCurrent();
			var list = new App.View.UserList();
			$(this.container).append(list.render());
			this.current = list;
		},

		userView: function(user) {
			this.destroyCurrent();
			var view = new App.View.UserView({userId: user});
			$(this.container).append(view.render());
			this.current = view;
		},
	});

	var app = new App.Application();
	Backbone.history.start();
});
