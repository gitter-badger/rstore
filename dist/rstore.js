(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory();
	else if(typeof define === 'function' && define.amd)
		define([], factory);
	else {
		var a = factory();
		for(var i in a) (typeof exports === 'object' ? exports : root)[i] = a[i];
	}
})(this, function() {
return /******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};

/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {

/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;

/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};

/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;

/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}


/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;

/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;

/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";

/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var _lens = __webpack_require__(1);

	var _lens2 = _interopRequireDefault(_lens);

	var _store = __webpack_require__(3);

	var _store2 = _interopRequireDefault(_store);

	var _utils = __webpack_require__(4);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	module.exports = {
	    fromEvent: _utils.fromEvent,
	    lens: _lens2.default,
	    store: _store2.default
	}; /**
	    * Created by ndyumin on 23.12.2015.
	    */

/***/ },
/* 1 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	/**
	 * Created by ndyumin on 29.12.2015.
	 */

	var clone = __webpack_require__(2);

	function defineGetter(name) {
	    return function (o) {
	        return o[name];
	    };
	}

	function defineSetter(name) {
	    return function (o, v) {
	        var _clone = clone(o);
	        _clone[name] = v;
	        return _clone;
	    };
	}

	function lens(name) {
	    function _lens(getter, setter) {
	        return {
	            get: getter,
	            set: setter,
	            toggle: function toggle(obj) {
	                return setter(obj, !getter(obj));
	            },
	            combine: function combine(l) {
	                return _lens(function (obj) {
	                    return l.get(getter(obj));
	                }, function (obj, val) {
	                    return setter(obj, l.set(getter(obj), val));
	                });
	            },
	            defineMapSetter: function defineMapSetter(mapper) {
	                return _lens(getter, function (obj, value) {
	                    return setter(obj, getter(obj).map(mapper(value)));
	                });
	            },
	            defineFilterSetter: function defineFilterSetter(filter) {
	                return _lens(getter, function (obj, value) {
	                    return setter(obj, getter(obj).filter(filter(value)));
	                });
	            }
	        };
	    }

	    return _lens(defineGetter(name), defineSetter(name));
	}

	module.exports = lens;

/***/ },
/* 2 */
/***/ function(module, exports) {

	"use strict";

	/**
	 * Created by ndyumin on 29.12.2015.
	 */
	function clone(o) {
	  return JSON.parse(JSON.stringify(o));
	}

	module.exports = clone;

/***/ },
/* 3 */
/***/ function(module, exports) {

	'use strict';

	function _typeof(obj) { return obj && typeof Symbol !== "undefined" && obj.constructor === Symbol ? "symbol" : typeof obj; }

	/**
	 * Created by ndyumin on 23.12.2015.
	 */

	function runUnsub(subscription) {
	    if (typeof subscription === 'function') {
	        return subscription();
	    }
	    if ((typeof subscription === 'undefined' ? 'undefined' : _typeof(subscription)) === 'object') {
	        if (typeof subscription.unsubscribe === 'function') {
	            return subscription.unsubscribe();
	        }
	        return console.log('ehm...', subscription);
	    }
	    return console.log('unknown subscription type', subscription);
	}

	function wrapObservable(s$) {
	    if (typeof s$.observe === 'function') {
	        return { subscribe: s$.observe.bind(s$) };
	    }
	    if (typeof s$.onValue === 'function') {
	        return { subscribe: s$.onValue.bind(s$) };
	    }
	    return s$;
	}

	function rstore(init) {
	    var plugged = [];

	    function _store(model) {
	        var executor = function executor(next) {
	            next(model);
	            var subscriptions = [];
	            var reducers = [].concat(plugged);
	            var clb = function clb(reducer) {
	                return function (v) {
	                    return next(model = reducer(model, v));
	                };
	            };
	            while (reducers.length) {
	                var s$ = wrapObservable(reducers.shift());
	                var reduce = reducers.shift();
	                subscriptions.push(s$.subscribe(clb(reduce)));
	            }
	            return function () {
	                return subscriptions.forEach(runUnsub);
	            };
	        };

	        return {
	            /**
	             * @deprecated
	             * use .subscribe instead
	             */
	            stream: function stream() {
	                return {
	                    onValue: (console.warn('this method will be removed in 0.3, use .subscribe instead'), executor)
	                };
	            },
	            /**
	             *
	             */
	            subscribe: executor,
	            plug: function plug() {
	                plugged.push.apply(plugged, arguments);
	                return _store(model);
	            }
	        };
	    }

	    return _store(init);
	}

	module.exports = rstore;

/***/ },
/* 4 */
/***/ function(module, exports) {

	"use strict";

	Object.defineProperty(exports, "__esModule", {
	    value: true
	});
	exports.fromEvent = fromEvent;
	/**
	 * Created by ndyumin on 18.04.2016.
	 */
	function fromEvent(node, eventName) {
	    return {
	        subscribe: function subscribe(observer) {
	            node.addEventListener(eventName, observer);
	            return function () {
	                return node.removeEventListener(eventName, observer);
	            };
	        }
	    };
	}

/***/ }
/******/ ])
});
;