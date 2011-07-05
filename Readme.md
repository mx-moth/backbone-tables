Two things that Backbone is missing is the concept of tables and links between them.
This removes these problems by introducing `Backbone.Table`

```javascript
var table;

/** Define the User model and associated table */
table = new Backbone.Table({
	url: '/ajax/users',
	methods: ['all', 'list', 'search'],
});
var User = Backbone.TableModel.extend({
	Table: table,

	initialize: function(options) {
		// This has a link to the Group table
		this.defineLinks({
			groups: Group,
			supervisor: User
		});
	}
});
table.model = App.Model.User;

/** Define the Group model and associated table */
table = new Backbone.Table({
	url: '/ajax/users',
	methods: ['all', 'list', 'search'],
});
var Group = Backbone.TableModel.extend({
	Table: table,

	initialize: function(options) {
		// This has a link to the User table
		this.defineLinks({ users: User });
	}
});
table.model = App.Model.Group;
```

## Tables and server methods

```javascript`
// POST to /ajax/users/list with data {page: 1, count: 10}
User.prototype.Table.list({page: 1, count: 10}, {
	success: function(users) {
		// users is a collection of users
	}
});
```

The callback will be called with a `Collection` of `User`s returned by the `/ajax/users/list` method.
`/ajax/users/list` actually returns an array of ids to `Backbone`, which then works out which models
it does not know about and fetches them from the server, using `/ajax/users/fetch`. This way, duplicate
data does not have to be returned. Additionally, if you make two different requests that both return
the user `tim`, the same instance of the `User` model will be returned, allowing for very smart views
that update no matter where or when the data is changed.

## Table links

```javascript
// Obtain a user model from somewhere
var user = new User({
	id: 'tim',
	name: 'Tim Heap',
	groups: ['admin', 'users'],
	supervisor: 'alex'
});

user.getLink('groups', {
	success: function(groups) {
		// groups is a collection holding the Groups 'admin' and 'users'
	}
});

user.getLink('supervisor', {
	success: function(supervisor) {
		// supervisor is an instance of User with the id alex
	}
});
```

Once links have been defined, the contents of the link can be fetched using the `getLink` function.
`getLink` will look in the attributes of the model and get the model ids in there. It will then use
the model defined using the `defineLinks` call to get the linked models. It works with both single
ids or arrays of ids, and will return the results as such. Because of table support with local caching,
the models returned may not be fetched from the server, and will always be the same instance, no matter
where they are called from.

## Server side stuff

The `url` defined on the table (`/ajax/users` in our examples). For retrieving model data, `/fetch` is
appended to the url, and POSTed to with a JSON encoded array of ids to fetch:

	POST /ajax/users/fetch
	Host	example.com
	Content-Type	application/json; charset=UTF-8
	Content-Length	21

	["tim","alex","emma"]

It expects a JSON encoded array of objects that represent the documents with those ids. Order is not
important.

Table methods are defined using the `methods` parameter when creating tables. A method, such as `list`,
will be requested using the url `/ajax/users/list` with any data supplied sent, JSON encoded:

```javascript
User.prototype.Table.list({page: 1, count: 10}, { success: ... });
```

	POST /ajax/users/list
	Host	example.com
	Content-Type	application/json; charset=UTF-8
	Content-Length	21

	{"page":1,"count":10}

It expects a JSON encoded array of ids as a response.
