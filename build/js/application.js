(function() {
  var App;
  var __hasProp = Object.prototype.hasOwnProperty, __extends = function(child, parent) {
    for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; }
    function ctor() { this.constructor = child; }
    ctor.prototype = parent.prototype;
    child.prototype = new ctor;
    child.__super__ = parent.prototype;
    return child;
  };
  App = {
    Model: {},
    View: {}
  };
  App.Model.View = (function() {
    __extends(View, Backbone.TableModel);
    function View() {
      View.__super__.constructor.apply(this, arguments);
    }
    View.prototype.Table = new Backbone.Table({
      url: '/ajax/views',
      model: View
    });
    View.prototype.defaults = {
      name: '',
      content: ''
    };
    return View;
  })();
  App.Model.User = (function() {
    __extends(User, Backbone.TableModel);
    function User() {
      User.__super__.constructor.apply(this, arguments);
    }
    User.prototype.Table = new Backbone.Table({
      url: '/ajax/users',
      model: User,
      methods: ['list']
    });
    User.prototype.defaults = {
      username: '',
      email: '',
      groups: []
    };
    User.prototype.initialize = function(options) {
      User.__super__.initialize.apply(this, arguments);
      return this.defineLinks({
        'groups': App.Model.Group
      });
    };
    return User;
  })();
  App.Model.Group = (function() {
    __extends(Group, Backbone.TableModel);
    function Group() {
      Group.__super__.constructor.apply(this, arguments);
    }
    Group.prototype.Table = new Backbone.Table({
      model: Group,
      url: '/ajax/groups'
    });
    Group.prototype.defaults = {
      name: '',
      users: []
    };
    Group.prototype.initialize = function(options) {
      Group.__super__.initialize.apply(this, arguments);
      return this.defineLinks({
        'users': App.Model.User
      });
    };
    return Group;
  })();
  App.Model.User.prototype.Table.list({
    page: 0,
    count: 10
  }, {
    success: function() {
      console.log("getList success:", arguments);
      return App.Model.User.prototype.Table.list({
        page: 0,
        count: 20
      }, {
        success: function() {
          return console.log("getList success:", arguments);
        },
        error: function() {
          return console.log("getList error:", arguments);
        }
      });
    },
    error: function() {
      return console.log("getList error:", arguments);
    }
  });
  /*
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
  
  
  */
}).call(this);
