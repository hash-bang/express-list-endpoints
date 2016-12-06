/**
 * Print in console all the verbs detected for the passed route
 */
var getRouteMethods = function(route, settings) {
  var methods = [];

  for (var method in route.methods) {
    if (method === '_all' && !settings.includeAll) continue;

    methods.push(method.toUpperCase());
  }

  return methods;
};

/**
 * Return an array of strings with all the detected endpoints
 */
var getEndpoints = function(app, options) {
  var regExp = /^\/\^\\\/(?:([\w\\\.\-]*(?:\\\/[\w\\\.\-]*)*)|(\(\?:\(\[\^\\\/\]\+\?\)\)))\\\/.*/;
  var stack = app.stack || app._router && app._router.stack;
  var settings = {
    includeAll: false,
    path: '',
    endpoints: [],
  };

  if (options) { // Merge options into settings
    for (var k in options) { settings[k] = options[k] };
  }

  stack.forEach(function(val) {
    var newPath = regExp.exec(val.regexp);

    if (val.route) {
      settings.endpoints.push({
        path: settings.path + val.route.path,
        methods: getRouteMethods(val.route, settings)
      });

    } else if (val.name === 'router' || val.name === 'bound dispatch') {
      if (newPath) {
        var parsedPath = newPath[1].replace(/\\\//g, '/');

        getEndpoints(val.handle, Object.assign({}, settings, {path: settings.path + '/' + parsedPath, endpoints: settings.endpoints}));

      } else {
        getEndpoints(val.handle, Object.assign({}, settings, {path : settings.path, endpoints: settings.endpoints}));
      }
    }
  });

  return settings.endpoints;
};

module.exports = getEndpoints;
