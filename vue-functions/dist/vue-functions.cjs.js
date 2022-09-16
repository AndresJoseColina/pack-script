/*!
 * vue-functions v2.0.6
 * (c) phphe <phphe@outlook.com> (https://github.com/phphe)
 * Homepage: undefined
 * Released under the MIT License.
 */
'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

var _toConsumableArray = _interopDefault(require('@babel/runtime/helpers/toConsumableArray'));
var _regeneratorRuntime = _interopDefault(require('@babel/runtime/regenerator'));
var hp = require('helper-js');

var _marked = /*#__PURE__*/_regeneratorRuntime.mark(iterateObjectWithoutDollarDash);
/**
 * [updatablePropsEvenUnbound description]
 * @param  {[type]} props [object or getter]
 * @return {[type]}       [description]
 * props eg: {
    value: {$localName: 'current', $localSetter: (value, vm)},
  }
  default localName is `localProps_${name}`
 */

function updatablePropsEvenUnbound(props) {
  if (hp.isFunction(props)) {
    props = props();
  } else {
    // object
    props = Object.assign({}, props);
  }

  var standardProps = {}; // without key starts with `$`

  var _loop = function _loop(name) {
    var prop = props[name]; // complete 补全选项

    if (!prop.$localName) {
      prop.$localName = "localProps_".concat(name);
    }

    if (!prop.$localSetter) {
      prop.$localSetter = function (value) {
        return value;
      };
    } // make standardProp


    var standardProp = {};
    standardProps[name] = standardProp;
    Object.keys(props[name]).forEach(function (key) {
      if (key[0] !== '$') {
        standardProp[key] = prop[key];
      }
    });
  };

  for (var name in props) {
    _loop(name);
  }

  var component = {
    props: standardProps,
    computed: {},
    watch: {}
  };

  component.data = function () {
    var t = {
      localValueOfUpdatableProps: {}
    };

    for (var _i = 0, _Object$keys = Object.keys(props); _i < _Object$keys.length; _i++) {
      var _name = _Object$keys[_i];
      t.localValueOfUpdatableProps[_name] = this[_name];
    }

    return t;
  };

  var _loop2 = function _loop2() {
    var name = _Object$keys2[_i2];
    var prop = props[name];

    component.watch[name] = function (value) {
      this.localValueOfUpdatableProps[name] = prop.$localSetter(value, this);
    };

    var localName = prop.$localName;
    component.computed[localName] = {
      get: function get() {
        return this.localValueOfUpdatableProps[name];
      },
      set: function set(value) {
        if (name === 'value') {
          this.$emit('input', value);
        } else {
          this.$emit("update:".concat(name), value);
        }

        this.localValueOfUpdatableProps[name] = prop.$localSetter(value, this);
      }
    };
  };

  for (var _i2 = 0, _Object$keys2 = Object.keys(props); _i2 < _Object$keys2.length; _i2++) {
    _loop2();
  }

  return component;
}
function isPropTrue(value) {
  return value === '' || value;
} // the dependences in getter can't be auto resolved. must use exec to include dependences

function watchAsync(vm, getter, handler, opt) {
  var destroies = [];
  var value, oldValue;
  var count = -1; // updated count

  main();
  return destroy;

  function destroy() {
    destroies.forEach(function (f) {
      return f();
    });
    destroies = [];
  }

  function exec(getter, opt) {
    var value;
    var first = true;
    var unwatch = vm.$watch(function () {
      return getter.call(vm, exec);
    }, function (value2) {
      value = value2;

      if (first) {
        first = false;
      } else {
        main();
      }
    }, {
      immediate: true,
      deep: opt && opt.deep
    });
    destroies.push(unwatch);
    return value;
  }

  function main() {
    destroy();
    var result = getter.call(vm, exec);
    count++;
    var localCount = count;
    oldValue = value;

    var getterExecuted = function getterExecuted(value) {
      if (localCount !== count) {
        // expired
        return;
      }

      if (localCount === 0) {
        if (opt && opt.immediate) {
          handler.call(vm, value, oldValue);
        }
      } else {
        handler.call(vm, value, oldValue);
      }
    }; //


    if (hp.isPromise(result)) {
      result.then(getterExecuted);
    } else {
      getterExecuted(result);
    }
  }
} // do handler first, handler return getter

function doWatch(vm, handler) {
  var oldValue, unwatch;

  var update = function update() {
    var getter = handler.call(vm, oldValue);
    unwatch = vm.$watch(getter, function (value) {
      unwatch();
      oldValue = value;
      update();
    });
  };

  update();
  return function () {
    return unwatch && unwatch();
  };
}
function iterateObjectWithoutDollarDash(obj) {
  var key, start;
  return _regeneratorRuntime.wrap(function iterateObjectWithoutDollarDash$(_context) {
    while (1) {
      switch (_context.prev = _context.next) {
        case 0:
          _context.t0 = _regeneratorRuntime.keys(obj);

        case 1:
          if ((_context.t1 = _context.t0()).done) {
            _context.next = 9;
            break;
          }

          key = _context.t1.value;
          start = key.substr(0, 1);

          if (!(start !== '$' && start !== '_')) {
            _context.next = 7;
            break;
          }

          _context.next = 7;
          return {
            key: key,
            value: obj[key]
          };

        case 7:
          _context.next = 1;
          break;

        case 9:
        case "end":
          return _context.stop();
      }
    }
  }, _marked);
} // add reactive `windowSize`

var windowSize = {
  data: function data() {
    return {
      windowSize: {
        innerWidth: window.innerWidth,
        innerHeight: window.innerHeight,
        outerWidth: window.outerWidth,
        outerHeight: window.outerHeight
      }
    };
  },
  methods: {
    updateWindowSize: function updateWindowSize() {
      Object.assign(this.windowSize, {
        innerWidth: window.innerWidth,
        innerHeight: window.innerHeight,
        outerWidth: window.outerWidth,
        outerHeight: window.outerHeight
      });
    }
  },
  created: function created() {
    var _this = this;

    this._windowSize_onresize = function () {
      _this.updateWindowSize();

      _this.$emit('window-resize');
    };

    hp.onDOM(window, 'resize', this._windowSize_onresize);
  },
  beforeDestroy: function beforeDestroy() {
    hp.offDOM(window, 'resize', this._windowSize_onresize);
  }
};
function registerPreventURLChange(Vue, router, msg) {
  var preventRouter = false;
  var msg0 = "It looks like you have been editing something.\nIf you leave before saving, your changes will be lost.";
  router.beforeEach(function (to, from, next) {
    if (preventRouter) {
      if (window.confirm(msg || msg0)) {
        Vue.allowURLChange();
        next();
      } else {
        next(false);
      }
    } else {
      next();
    }
  });

  var beforeunload = function beforeunload(e) {
    var confirmationMessage = msg || msg0;
    e.returnValue = confirmationMessage; // Gecko, Trident, Chrome 34+

    return confirmationMessage; // Gecko, WebKit, Chrome <34
  };

  Vue.preventURLChange = Vue.prototype.$preventURLChange = function (msg2) {
    if (msg2 != null) {
      msg = msg2;
    }

    if (!preventRouter) {
      preventRouter = true;
      window.addEventListener("beforeunload", beforeunload);
    }
  };

  Vue.allowURLChange = Vue.prototype.$allowURLChange = function () {
    preventRouter = false;
    window.removeEventListener("beforeunload", beforeunload);
  };
}
var hookHelper = {
  methods: {
    // todo extract hooks to vue-functions
    // get hooks in this._hooks, without which in props
    _getNonPropHooksByName: function _getNonPropHooksByName(name) {
      if (this._hooks) {
        return this._hooks[name];
      }
    },
    addHook: function addHook(name, func) {
      if (!this._getNonPropHooksByName(name)) {
        if (!this._hooks) {
          this._hooks = {};
        }

        if (!this._hooks[name]) {
          this._hooks[name] = [];
        }
      }

      this._hooks[name].push(func);
    },
    removeHook: function removeHook(name, func) {
      var hooks = this._getNonPropHooksByName(name);

      if (hooks) {
        hp.arrayRemove(hooks, func);
      }
    },
    hasHook: function hasHook(name) {
      return this._getNonPropHooksByName(name) || this[name];
    },
    executeHook: function executeHook(name, args) {
      var _this2 = this;

      var hooks = this._getNonPropHooksByName(name);

      hooks = hooks ? hooks.slice() : [];

      if (this[name] && hp.isFunction(this[name])) {
        hooks.push(function (next) {
          for (var _len = arguments.length, args = new Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
            args[_key - 1] = arguments[_key];
          }

          return _this2[name].apply(_this2, args);
        });
      }

      return hp.joinFunctionsByNext(hooks).apply(void 0, _toConsumableArray(args));
    }
  }
};
var mountedMixin = {
  data: function data() {
    var _this3 = this;

    return {
      mounted: new Promise(function (resolve, reject) {
        _this3._mounted_resolve = resolve;
      })
    };
  },
  mounted: function mounted() {
    this._mounted_resolve();
  }
};

exports.doWatch = doWatch;
exports.hookHelper = hookHelper;
exports.isPropTrue = isPropTrue;
exports.iterateObjectWithoutDollarDash = iterateObjectWithoutDollarDash;
exports.mountedMixin = mountedMixin;
exports.registerPreventURLChange = registerPreventURLChange;
exports.updatablePropsEvenUnbound = updatablePropsEvenUnbound;
exports.watchAsync = watchAsync;
exports.windowSize = windowSize;
