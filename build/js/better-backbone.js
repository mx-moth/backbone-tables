(function() {
  var __hasProp = Object.prototype.hasOwnProperty, __extends = function(child, parent) {
    for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; }
    function ctor() { this.constructor = child; }
    ctor.prototype = parent.prototype;
    child.prototype = new ctor;
    child.__super__ = parent.prototype;
    return child;
  };
  Backbone.TableModel = (function() {
    __extends(TableModel, Backbone.Model);
    TableModel.prototype.Table = null;
    TableModel.prototype.links = null;
    function TableModel(data, options) {
      this.links = {};
      TableModel.__super__.constructor.call(this, data, options);
      this.touch();
      this.Table.add(this);
    }
    TableModel.prototype.defineLinks = function(links) {
      var link, name;
      for (name in links) {
        link = links[name];
        this.defineLink(name, link);
      }
      return this;
    };
    TableModel.prototype.defineLink = function(name, link) {
      this.links[name] = link;
      return this;
    };
    TableModel.prototype.getLink = function(name, options) {
      var error, link, model, success, table, value;
      success = options.success || function() {};
      error = options.error || function() {};
      value = this.get(name);
      link = this.links[name];
      model = link;
      table = model.prototype.Table;
      if (!value) {
        success(null);
        return this;
      }
      table.getAll(Array.from(value), {
        error: error,
        success: function(docs) {
          if (!Array.isArray(value)) {
            docs = docs.pop();
          }
          return success(docs);
        }
      });
      return this;
    };
    TableModel.prototype.touch = function(time) {
      if (time == null) {
        time = Date.now();
      }
      this.mtime = Date.now();
      this.atime = this.mtime;
      return this;
    };
    TableModel.prototype.grab = function() {
      this.touch;
      this.used++;
      return this;
    };
    TableModel.prototype.release = function() {
      this.used--;
      return this;
    };
    TableModel.prototype.isUsed = function() {
      return this.used !== 0;
    };
    return TableModel;
  })();
  Backbone.Table = (function() {
    __extends(Table, Backbone.Collection);
    function Table(options) {
      var _base, _ref;
      this.url = options.url;
      if (options.model) {
        this.model = options.model;
      }
            if ((_ref = (_base = this.model).prototype.url) != null) {
        _ref;
      } else {
        _base.prototype.url = this.url;
      };
      this.limit = options.limit;
      Table.__super__.constructor.call(this, [], options);
      this.defineMethods(options.methods);
    }
    Table.prototype.add = function(model) {
      var self;
      Table.__super__.add.apply(this, arguments);
      if (this.limit && this.length > this.limit) {
        if (this._addTimer) {
          clearTimeout(this._addTimer);
        }
        self = this;
        return this._addTimer = setTimeout((function() {
          var comparator, notUsed;
          comparator = function(a, b) {
            return a.atime.valueOf() - b.atime.valueOf();
          };
          notUsed = self.models.filter(function(model) {
            return !model.isUsed();
          });
          notUsed.sort(comparator);
          self.remove(notUsed.models.slice(0, this.length - this.limit));
          return self._addTimer = null;
        }), 10);
      }
    };
    Table.prototype.getAll = function(ids, options) {
      var doc, error, id, idList, outstanding, refresh, results, success, unknown, _i, _len;
      success = options.success || function() {};
      error = options.error || function() {};
      refresh = options.refresh || false;
      idList = Array.from(ids);
      outstanding = idList.length;
      results = [];
      unknown = [];
      if (refresh) {
        unknown = idList;
      } else {
        for (_i = 0, _len = idList.length; _i < _len; _i++) {
          id = idList[_i];
          doc = this.get(id);
          if (doc) {
            results.push(doc);
          } else {
            unknown.push(id);
          }
        }
      }
      this.fetchAll(unknown, {
        error: error,
        success: function(docs) {
          return success(new Backbone.Collection(results.concat(docs)));
        }
      });
      return this;
    };
    Table.prototype.fetchAll = function(ids, options) {
      var self;
      self = this;
      ids = Array.from(ids);
      if (ids.length === 0) {
        if (options.success) {
          options.success([]);
        }
        return this;
      }
      Backbone.sync.call(this, 'create', this, {
        url: (Backbone.getUrl(this) || Backbone.urlError()) + '/fetch',
        method: 'create',
        contentType: 'application/json',
        data: JSON.stringify(ids),
        error: function() {
          return options.error;
        },
        success: function(data) {
          var collection, parsed;
          parsed = self.parse(data);
          collection = self._prepareModels(data);
          options.success(collection);
        }
      });
      return this;
    };
    Table.prototype._prepareModels = function(data) {
      var models, self;
      self = this;
      models = _.map(data, function(datum) {
        var doc;
        doc = self.get(datum.id);
        if (doc) {
          doc.set(datum);
        } else {
          doc = self._prepareModel(datum);
        }
        return doc;
      });
      return models;
    };
    Table.prototype.defineMethods = function(methods) {
      var method, self, _i, _len, _results;
      if (methods == null) {
        methods = [];
      }
      self = this;
      _results = [];
      for (_i = 0, _len = methods.length; _i < _len; _i++) {
        method = methods[_i];
        _results.push(this[method] = function(data, options) {
          var _ref;
          if (options == null) {
            options = {};
          }
                    if ((_ref = options.data) != null) {
            _ref;
          } else {
            options.data = data;
          };
          return $.ajax({
            url: this.url + '/' + method,
            type: 'post',
            processData: false,
            dataType: 'json',
            processData: false,
            error: options.error,
            contentType: 'application/json',
            data: JSON.stringify(data),
            success: function(ids) {
              return self.getAll(ids, options);
            }
          });
        });
      }
      return _results;
    };
    return Table;
  })();
}).call(this);
