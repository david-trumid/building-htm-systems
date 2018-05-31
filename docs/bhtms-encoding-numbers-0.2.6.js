/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// define __esModule on exports
/******/ 	__webpack_require__.r = function(exports) {
/******/ 		Object.defineProperty(exports, '__esModule', { value: true });
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 0);
/******/ })
/************************************************************************/
/******/ ({

/***/ "./node_modules/javascript-data-store/src/jsds.js":
/*!********************************************************!*\
  !*** ./node_modules/javascript-data-store/src/jsds.js ***!
  \********************************************************/
/*! no static exports found */
/***/ (function(module, exports) {

eval("/*\n * Copyright (c) 2010 Matthew A. Taylor\n *\n * Permission is hereby granted, free of charge, to any person obtaining a copy\n * of this software and associated documentation files (the \"Software\"), to deal\n * in the Software without restriction, including without limitation the rights\n * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell\n * copies of the Software, and to permit persons to whom the Software is\n * furnished to do so, subject to the following conditions:\n *\n * The above copyright notice and this permission notice shall be included in\n * all copies or substantial portions of the Software.\n *\n * THE SOFTWARE IS PROVIDED \"AS IS\", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR\n * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,\n * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE\n * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER\n * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,\n * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN\n * THE SOFTWARE.\n */\n\nvar REGEX_DOT_G = /\\./g,\n    BSLASH_DOT = '\\.',\n    REGEX_STAR_G = /\\*/g,\n    ID_LENGTH = 16,\n\n// static export\nJSDS,\n\n// private props\nrandoms = [],\n\n// private functions\nstoreIt,\n    update,\n    mergeArraysIntoSet,\n    arrayContains,\n    arrayRemoveItem,\n    fire,\n    listenerApplies,\n    removeListener,\n    getCompleteKey,\n    pullOutKeys,\n    toRegex,\n    valueMatchesKeyString,\n    clone,\n    getValue,\n    getRandomId,\n    generateRandomId;\n\n/*************************/\n/* The JSDataStore Class */\n/*************************/\n\nfunction JSDataStore(id) {\n    // data stores\n    this._s = {};\n    // event listeners\n    this._l = {};\n    this.id = id;\n}\n\nJSDataStore.prototype = {\n\n    /**\n     * Stores data\n     *\n     * key {String}: the key to be used to store the data. The same key can be used to retrieve\n     *               the data\n     * val {Object}: Any value to be stored in the store\n     * opts {Object} (optional): options to be used when storing data:\n     *                          'update': if true, values already existing within objects and\n     *                                    arrays will not be clobbered\n     * returns {Object}: The last value stored within specified key or undefined\n     *\n     * (fires 'store' event)\n     */\n    set: function (key, val, opts /*optional*/) {\n        var result;\n        opts = opts || { update: false };\n        fire.call(this, 'set', {\n            key: key,\n            value: val,\n            id: this.id,\n            when: 'before',\n            args: Array.prototype.slice.call(arguments, 0, arguments.length)\n        });\n        result = storeIt(this._s, key, opts, val);\n        fire.call(this, 'set', {\n            key: key,\n            value: val,\n            id: this.id,\n            when: 'after',\n            result: this.get(key, { quiet: true })\n        });\n        return result;\n    },\n\n    /**\n     * Gets data back out of store\n     *\n     * key {String}: the key of the data you want back\n     * returns {Object}: the data or undefined if key doesn't exist\n     *\n     * (fires 'get' event)\n     */\n    get: function (key) {\n        var s = this._s,\n            keys,\n            i = 0,\n            j = 0,\n            opts,\n            result,\n            splitKeys,\n            args = Array.prototype.slice.call(arguments, 0, arguments.length);\n\n        opts = args[args.length - 1];\n        if (typeof opts === 'string') {\n            opts = {};\n        } else {\n            args.pop();\n        }\n\n        if (!opts.quiet) {\n            fire.call(this, 'get', {\n                key: key,\n                when: 'before',\n                args: args\n            });\n        }\n\n        if (args.length === 1 && key.indexOf(BSLASH_DOT) < 0) {\n            result = s[key];\n        } else {\n            if (args.length > 1) {\n                keys = [];\n                for (i = 0; i < args.length; i++) {\n                    if (args[i].indexOf(BSLASH_DOT) > -1) {\n                        splitKeys = args[i].split(BSLASH_DOT);\n                        for (j = 0; j < splitKeys.length; j++) {\n                            keys.push(splitKeys[j]);\n                        }\n                    } else {\n                        keys.push(args[i]);\n                    }\n                }\n            } else if (key.indexOf(BSLASH_DOT) > -1) {\n                keys = key.split(BSLASH_DOT);\n            }\n\n            result = getValue(s, keys);\n        }\n\n        if (!opts.quiet) {\n            fire.call(this, 'get', {\n                key: key,\n                value: result,\n                when: 'after',\n                result: result\n            });\n        }\n        return result;\n    },\n\n    /**\n     * Adds a listener to this store. The listener will be executed when an event of\n     * the specified type is emitted and all the conditions defined in the parameters\n     * are met.\n     *\n     * type {String}: the type of event to listen for ('store', 'get', 'clear', etc.)\n     * options {object}: an object that contains one or more of the following configurations:\n     *                  'callback': the function to be executed\n     *                  'scope': the scope object for the callback execution\n     *                  'key': the storage key to listen for. If specified only stores into this key will\n     *                          cause callback to be executed\n     *                  'when': 'before' or 'after' (default is 'after')\n     */\n    on: function (type, opts) {\n        var me = this,\n            cbid = getRandomId(),\n            key = opts.key,\n            fn = opts.callback,\n            scope = opts.scope || this,\n            when = opts.when || 'after';\n        if (!this._l[type]) {\n            this._l[type] = [];\n        }\n        this._l[type].push({ id: cbid, callback: fn, scope: scope, key: key, when: when });\n        return {\n            id: cbid,\n            remove: function () {\n                removeListener(me._l[type], cbid);\n            }\n        };\n    },\n\n    before: function (type, key, cb, scpe) {\n        var callback = cb,\n            scope = scpe;\n        // key is optional\n        if (typeof key === 'function') {\n            callback = key;\n            scope = cb;\n            key = undefined;\n        }\n        return this.on(type, {\n            callback: callback,\n            key: key,\n            when: 'before',\n            scope: scope\n        });\n    },\n\n    after: function (type, key, cb, scpe) {\n        var callback = cb,\n            scope = scpe;\n        // key is optional\n        if (typeof key === 'function') {\n            callback = key;\n            scope = cb;\n            key = undefined;\n        }\n        function myCb() {\n            console.log(arguments);\n        }\n        return this.on(type, {\n            callback: callback,\n            key: key,\n            when: 'after',\n            scope: scope\n        });\n    },\n\n    /**\n     * Removes all data from store\n     *\n     * (fires 'clear' event)\n     */\n    clear: function () {\n        this._s = {};\n        fire.call(this, 'clear');\n    },\n\n    /**\n     * Removes all internal references to this data store. Note that to entirely release\n     * store object for garbage collection, you must also set any local references to the\n     * store to null!\n     *\n     * (fires 'remove' and 'clear' events)\n     */\n    remove: function () {\n        var ltype, optsArray, opts, i;\n        this.clear();\n        delete JSDS._stores[this.id];\n        arrayRemoveItem(randoms, this.id);\n        fire.call(this, 'remove');\n    }\n};\n\n/*************************/\n/* Global JSDS namespace */\n/*************************/\n\nJSDS = {\n\n    _stores: {},\n\n    /**\n     * Create a new data store object. If no id is specified, a random id will be\n     * generated.\n     *\n     * id {String} (optional): to identify this store for events and later retrieval\n     */\n    create: function (id) {\n\n        id = id || getRandomId();\n\n        if (this._stores[id]) {\n            throw new Error('Cannot overwrite existing data store \"' + id + '\"!');\n        }\n\n        this._stores[id] = new JSDataStore(id);\n\n        return this._stores[id];\n    },\n\n    /**\n     * Retrieves an existing data store object by id\n     *\n     * id {String}: the id of the store to retrieve\n     * returns {JSDataStore} the data store\n     */\n    get: function (id) {\n        return this._stores[id];\n    },\n\n    /**\n     * Removes all data stores objects. Specifically, each JSDataStore object's remove()\n     * method is called, and all local references to each are deleted.\n     */\n    clear: function () {\n        var storeId;\n        for (storeId in this._stores) {\n            if (this._stores.hasOwnProperty(storeId)) {\n                this._stores[storeId].remove();\n                delete this._stores[storeId];\n            }\n        }\n        this._stores = {};\n    },\n\n    /**\n     * Returns a count of the existing data stores in memory\n     */\n    count: function () {\n        var cnt = 0,\n            p;\n        for (p in this._stores) {\n            if (this._stores.hasOwnProperty(p)) {\n                cnt++;\n            }\n        }\n        return cnt;\n    },\n\n    /**\n     * Returns a list of ids [String] for all data store obects in memory\n     */\n    ids: function () {\n        var id,\n            ids = [];\n        for (id in this._stores) {\n            if (this._stores.hasOwnProperty(id)) {\n                ids.push(id);\n            }\n        }\n        return ids;\n    }\n};\n\n/*****************/\n/* PRIVATE STUFF */\n/*****************/\n\n// recursive store function\nstoreIt = function (store, key, opts, val, oldVal /*optional*/) {\n    var result, keys, oldKey;\n    if (key.indexOf(BSLASH_DOT) >= 0) {\n        keys = key.split('.');\n        oldVal = store[keys[0]] ? clone(store[keys[0]]) : undefined;\n        oldKey = keys.shift();\n        if (store[oldKey] === undefined) {\n            store[oldKey] = {};\n        }\n        return storeIt(store[oldKey], keys.join('.'), opts, val, oldVal);\n    }\n    result = oldVal ? oldVal[key] : store[key];\n    // if this is an update, and there is an old value to update\n    if (opts.update) {\n        update(store, val, key);\n    }\n    // if not an update, just overwrite the old value\n    else {\n            store[key] = val;\n        }\n    return result;\n};\n\n// recursive update function used to overwrite values within the store without\n// clobbering properties of objects\nupdate = function (store, val, key) {\n    var vprop;\n    if (typeof val !== 'object' || val instanceof Array) {\n        if (store[key] && val instanceof Array) {\n            mergeArraysIntoSet(store[key], val);\n        } else {\n            store[key] = val;\n        }\n    } else {\n        for (vprop in val) {\n            if (val.hasOwnProperty(vprop)) {\n                if (!store[key]) {\n                    store[key] = {};\n                }\n                if (store[key].hasOwnProperty(vprop)) {\n                    update(store[key], val[vprop], vprop);\n                } else {\n                    store[key][vprop] = val[vprop];\n                }\n            }\n        }\n    }\n};\n\n// merge two arrays without duplicate values\nmergeArraysIntoSet = function (lhs, rhs) {\n    var i = 0;\n    for (; i < rhs.length; i++) {\n        if (!arrayContains(lhs, rhs[i])) {\n            lhs.push(rhs[i]);\n        }\n    }\n};\n\n// internal utility function\narrayContains = function (arr, val, comparator /* optional */) {\n    var i = 0;\n    comparator = comparator || function (lhs, rhs) {\n        return lhs === rhs;\n    };\n    for (; i < arr.length; i++) {\n        if (comparator(arr[i], val)) {\n            return true;\n        }\n    }\n    return false;\n};\n\narrayRemoveItem = function (arr, item) {\n    var i, needle;\n    for (i = 0; i < arr.length; i++) {\n        if (arr[i] === item) {\n            needle = i;\n            break;\n        }\n    }\n    if (needle) {\n        arr.splice(needle, 1);\n    }\n};\n\n// fire an event of 'type' with included arguments to be passed to listeners functions\n// WARNING: this function must be invoked as fire.call(scope, type, args) because it uses 'this'.\n// The reason is so this function is not publicly exposed on JSDS instances\nfire = function (type, fireOptions) {\n    var i,\n        opts,\n        scope,\n        listeners,\n        pulledKeys,\n        listeners = this._l[type] || [];\n\n    fireOptions = fireOptions || {};\n\n    if (listeners.length) {\n        for (i = 0; i < listeners.length; i++) {\n            opts = listeners[i];\n            if (listenerApplies.call(this, opts, fireOptions)) {\n                scope = opts.scope || this;\n                if (opts.key && fireOptions) {\n                    if (opts.key.indexOf('*') >= 0) {\n                        pulledKeys = pullOutKeys(fireOptions.value);\n                        fireOptions.value = {};\n                        fireOptions.value.key = fireOptions.key + pulledKeys;\n                        fireOptions.value.value = getValue(this._s, fireOptions.value.key.split('.'));\n                    } else {\n                        fireOptions.value = getValue(this._s, opts.key.split('.'));\n                    }\n                }\n                if (fireOptions.args) {\n                    opts.callback.apply(scope, fireOptions.args);\n                } else if (fireOptions.result) {\n                    opts.callback.call(scope, fireOptions.result);\n                } else {\n                    opts.callback.call(scope, fireOptions.result);\n                }\n            }\n        }\n    }\n};\n\n// WARNING: this function must be invoked as listenerApplies.call(scope, listener, crit) because it uses 'this'.\n// The reason is so this function is not publicly exposed on JSDS instances\nlistenerApplies = function (listener, crit) {\n    var result = false,\n        last,\n        sub,\n        k,\n        replacedKey,\n        breakout = false;\n    if (listener.when && crit.when) {\n        if (listener.when !== crit.when) {\n            return false;\n        }\n    }\n    if (!listener.key || !crit) {\n        return true;\n    }\n    if (!crit.key || crit.key.match(toRegex(listener.key))) {\n        return true;\n    }\n    last = crit.key.length;\n    while (!breakout) {\n        sub = crit.key.substr(0, last);\n        last = sub.lastIndexOf(BSLASH_DOT);\n        if (last < 0) {\n            k = sub;\n            breakout = true;\n        } else {\n            k = sub.substr(0, last);\n        }\n        if (listener.key.indexOf('*') === 0) {\n            return valueMatchesKeyString(crit.value, listener.key.replace(/\\*/, crit.key).substr(crit.key.length + 1));\n        } else if (listener.key.indexOf('*') > 0) {\n            replacedKey = getCompleteKey(crit);\n            return toRegex(replacedKey).match(listener.key);\n        }\n        return valueMatchesKeyString(crit.value, listener.key.substr(crit.key.length + 1));\n    }\n    return result;\n};\n\nremoveListener = function (listeners, id) {\n    var i, l, needle;\n    for (i = 0; i < listeners.length; i++) {\n        l = listeners[i];\n        if (l.id && l.id === id) {\n            needle = i;\n            break;\n        }\n    }\n    if (typeof needle !== 'undefined') {\n        listeners.splice(needle, 1);\n    }\n};\n\ngetCompleteKey = function (o) {\n    var val = o.value,\n        key = o.key;\n    return key + pullOutKeys(val);\n};\n\npullOutKeys = function (v) {\n    var p,\n        res = '';\n    for (p in v) {\n        if (v.hasOwnProperty(p)) {\n            res += '.' + p;\n            if (typeof v[p] === 'object' && !(v[p] instanceof Array)) {\n                res += pullOutKeys(v[p]);\n            }\n        }\n    }\n    return res;\n};\n\ntoRegex = function (s) {\n    return s.replace(REGEX_DOT_G, '\\\\.').replace(REGEX_STAR_G, '\\.*');\n};\n\nvalueMatchesKeyString = function (val, key) {\n    var p,\n        i = 0,\n        keys = key.split('.');\n    for (p in val) {\n        if (val.hasOwnProperty(p)) {\n            if (keys[i] === '*' || p === keys[i]) {\n                if (typeof val[p] === 'object' && !(val[p] instanceof Array)) {\n                    return valueMatchesKeyString(val[p], keys.slice(i + 1).join('.'));\n                } else {\n                    return true;\n                }\n            }\n        }\n        i++;\n    }\n    return false;\n};\n\n// used to copy branches within the store. Object and array friendly\nclone = function (val) {\n    var newObj, i, prop;\n    if (val instanceof Array) {\n        newObj = [];\n        for (i = 0; i < val.length; i++) {\n            newObj[i] = clone(val[i]);\n        }\n    } else if (typeof val === 'object') {\n        newObj = {};\n        for (prop in val) {\n            if (val.hasOwnProperty(prop)) {\n                newObj[prop] = clone(val[prop]);\n            }\n        }\n    } else {\n        return val;\n    }\n    return newObj;\n};\n\n// returns a value from a store given an array of keys that is meant to describe depth\n// within the storage tree\ngetValue = function (store, keys) {\n    var key = keys.shift(),\n        endKey,\n        arrResult,\n        p,\n        keysClone;\n    if (key === '*') {\n        arrResult = [];\n        for (p in store) {\n            if (store.hasOwnProperty(p)) {\n                keysClone = clone(keys);\n                arrResult.push(getValue(store[p], keysClone));\n            }\n        }\n        return arrResult;\n    }\n    if (keys[0] && store[key] && (store[key][keys[0]] || keys[0] === '*')) {\n        return getValue(store[key], keys);\n    } else {\n        if (keys.length) {\n            endKey = keys[0];\n        } else {\n            endKey = key;\n        }\n        return store[endKey];\n    }\n};\n\ngenerateRandomId = function (length) {\n    var text = \"\",\n        i,\n        possible = \"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz\";\n    for (i = 0; i < length; i++) {\n        text += possible.charAt(Math.floor(Math.random() * possible.length));\n    }\n    return text;\n};\n\ngetRandomId = function () {\n    var id = generateRandomId(ID_LENGTH);\n    // no duplicate ids allowed\n    while (arrayContains(randoms, id)) {\n        id = generateRandomId(ID_LENGTH);\n    }\n    randoms.push(id);\n    return id;\n};\n\nmodule.exports = JSDS;\n\n//# sourceURL=webpack:///./node_modules/javascript-data-store/src/jsds.js?");

/***/ }),

/***/ "./node_modules/simplehtm/src/encoders/relativeScalar.js":
/*!***************************************************************!*\
  !*** ./node_modules/simplehtm/src/encoders/relativeScalar.js ***!
  \***************************************************************/
/*! no static exports found */
/***/ (function(module, exports) {

eval("function encode(value, n, resolution, min, max) {\n    let bitIndexToValue = d3.scaleLinear().domain([0, n]).range([min, max]);\n    let encoding = [];\n    // For each bit in the encoding.\n    for (let i = 0; i < n; i++) {\n        let bitScalarValue = bitIndexToValue(i),\n            bitValue = 0,\n            valueDiff = bitScalarValue - value,\n            valueDistance = Math.abs(valueDiff),\n            radius = resolution / 2;\n        if (valueDistance <= radius) bitValue = 1;\n        encoding.push(bitValue);\n    }\n    return encoding;\n}\n\nfunction encodeBounded(value, n, resolution, min, max) {\n    let bitIndexToValue = d3.scaleLinear().domain([0, n]).range([min, max]);\n    let encoding = [];\n    // For each bit in the encoding.\n    for (let i = 0; i < n; i++) {\n        let bitValue = bitIndexToValue(i),\n            bit = 0,\n            valueDiff = bitValue - value,\n            valueDistance = Math.abs(valueDiff),\n            radius = resolution / 2;\n        if (valueDistance <= radius) bit = 1;\n        // Keeps the bucket from changing size at min/max values\n        if (value < min + radius && bitValue < min + resolution) bit = 1;\n        if (value > max - radius && bitValue > max - resolution) bit = 1;\n        encoding.push(bit);\n    }\n    return encoding;\n}\n\nclass RelativeScalarEncoder {\n\n    constructor(n, resolution, min, max, bounded = false) {\n        this.n = n;\n        this.resolution = resolution;\n        this.min = min;\n        this.max = max;\n        this.range = max - min;\n        this.bounded = bounded;\n        this._bitIndexToValue = d3.scaleLinear().domain([0, n]).range([min, max]);\n    }\n\n    encode(value) {\n        if (this.bounded) {\n            return encodeBounded(value, this.n, this.resolution, this.min, this.max);\n        }\n        return encode(value, this.n, this.resolution, this.min, this.max);\n    }\n\n    getRangeFromBitIndex(i) {\n        let v = this._bitIndexToValue(i),\n            res = this.resolution,\n            min = this.min,\n            max = this.max,\n            radius = res / 2,\n            left = Math.max(this.min, v - radius),\n            right = Math.min(this.max, v + radius);\n        // Keeps the bucket from changing size at min/max values\n        if (this.bounded) {\n            if (left < min + radius) left = min;\n            if (right > max - radius) right = max;\n        }\n        return [left, right];\n    }\n}\n\nmodule.exports = RelativeScalarEncoder;\n\n//# sourceURL=webpack:///./node_modules/simplehtm/src/encoders/relativeScalar.js?");

/***/ }),

/***/ "./src/widgets/encoding-numbers/index.js":
/*!***********************************************!*\
  !*** ./src/widgets/encoding-numbers/index.js ***!
  \***********************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

eval("window.BHTMS = {\n    simpleNumberEncoder: __webpack_require__(/*! ./simpleNumberEncoder */ \"./src/widgets/encoding-numbers/simpleNumberEncoder.js\"),\n    JSDS: __webpack_require__(/*! JSDS */ \"./node_modules/javascript-data-store/src/jsds.js\")\n};\n\n//# sourceURL=webpack:///./src/widgets/encoding-numbers/index.js?");

/***/ }),

/***/ "./src/widgets/encoding-numbers/simpleNumberEncoder.js":
/*!*************************************************************!*\
  !*** ./src/widgets/encoding-numbers/simpleNumberEncoder.js ***!
  \*************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

eval("let RelativeScalarEncoder = __webpack_require__(/*! RelativeScalarEncoder */ \"./node_modules/simplehtm/src/encoders/relativeScalar.js\");\nlet JSDS = __webpack_require__(/*! JSDS */ \"./node_modules/javascript-data-store/src/jsds.js\");\nlet utils = __webpack_require__(/*! ../utils */ \"./src/widgets/utils.js\");\nlet html = __webpack_require__(/*! ./simpleNumberEncoder.tmpl.html */ \"./src/widgets/encoding-numbers/simpleNumberEncoder.tmpl.html\");\n\nconst onColor = 'skyblue';\nconst offColor = 'white';\nlet jsds = JSDS.create('simple-number-encoder');\n\nmodule.exports = (elementId, bounded = false) => {\n\n    utils.loadHtml(html.default, elementId, () => {\n        let $d3El = d3.select('#' + elementId),\n            $jqEl = $('#' + elementId);\n\n        let width = 560,\n            height = 180,\n            minValue = 0,\n            maxValue = 55,\n            bits = 100,\n            value = 30;\n\n        let jsdsHandles = [];\n\n        let valueScaleTopMargin = 40,\n            valueScaleSideMargins = 10;\n\n        let $resolutionSlider = $jqEl.find('.resolutionSlider'),\n            $resolutionDisplays = $jqEl.find('.resolutionDisplay');\n\n        let resolution = parseInt(parseInt($resolutionSlider.val()) / 100);\n\n        let $svg = $d3El.select('svg').attr('width', width).attr('height', height);\n\n        let valueToX;\n        let xToValue;\n\n        let encoder;\n\n        function setUpValueAxis(min, max, maxWidth) {\n            let width = maxWidth - valueScaleSideMargins * 2;\n            let x = valueScaleSideMargins,\n                y = valueScaleTopMargin;\n            valueToX = d3.scaleLinear().domain([min, max]).range([0, width]);\n            xToValue = d3.scaleLinear().domain([0, width]).range([min, max]);\n            let xAxis = d3.axisBottom(valueToX);\n            $svg.append('g').attr('transform', 'translate(' + x + ',' + y + ')').call(xAxis);\n            $svg.on('mousemove', () => {\n                let mouse = d3.mouse($svg.node());\n                if (mouse[1] > 80) return;\n                let mouseX = mouse[0] - valueScaleSideMargins;\n                mouseX = Math.min(maxWidth - valueScaleSideMargins * 2, mouseX);\n                mouseX = Math.max(0, mouseX);\n                value = utils.precisionRound(xToValue(mouseX), 1);\n                jsds.set('value', value);\n            });\n        }\n\n        function updateOutputBits(encoding, maxWidth) {\n            let topMargin = 120;\n            let padding = 30;\n            let bits = encoding.length;\n            let width = maxWidth - padding * 2;\n            let bitsToOutputDisplay = d3.scaleLinear().domain([0, bits]).range([0, width]);\n            let cellWidth = Math.floor(width / bits);\n            let $outputGroup = $svg.select('g.encoding');\n            let $hoverGroup = $svg.select('g.range');\n\n            function treatCellRects(r) {\n                r.attr('class', 'bit').attr('fill', d => {\n                    if (d) return onColor;else return offColor;\n                }).attr('stroke', 'darkgrey').attr('stroke-width', 0.5).attr('fill-opacity', 1).attr('x', function (d, i) {\n                    return bitsToOutputDisplay(i);\n                }).attr('y', padding).attr('width', cellWidth).attr('height', cellWidth * 4);\n            }\n\n            // Update\n            let rects = $outputGroup.selectAll('rect.bit').data(encoding);\n            treatCellRects(rects);\n\n            // Enter\n            let newRects = rects.enter().append('rect');\n            treatCellRects(newRects);\n\n            // Exit\n            rects.exit().remove();\n\n            $outputGroup.attr('transform', 'translate(' + padding + ',' + topMargin + ')');\n\n            rects = $outputGroup.selectAll('rect.bit');\n\n            let lineFunction = d3.line().x(function (d) {\n                return d.x;\n            }).y(function (d) {\n                return d.y;\n            }).curve(d3.curveCatmullRom.alpha(0.5));\n\n            function hoverRange(selectedOutputBit) {\n                let index = selectedOutputBit.index;\n                let cx = padding + bitsToOutputDisplay(index) + cellWidth / 2;\n                let cy = topMargin + 30;\n                let valueRange = encoder.getRangeFromBitIndex(index);\n                $hoverGroup.select('g.range circle').attr('r', cellWidth / 2).attr('cx', cx).attr('cy', cy).attr('fill', 'royalblue');\n                let leftValueBound = Math.max(minValue, valueRange[0]),\n                    rightValueBound = Math.min(maxValue, valueRange[1]);\n                let leftLineData = [];\n                let rightLineData = [];\n                leftLineData.push({ x: cx, y: cy });\n                rightLineData.push({ x: cx, y: cy });\n                let nearX = valueScaleSideMargins + valueToX(leftValueBound);\n                let farX = valueScaleSideMargins + valueToX(rightValueBound);\n                // Intermediary points for curving\n                leftLineData.push({\n                    x: cx - 10,\n                    y: cy - 20\n                });\n                leftLineData.push({\n                    x: nearX,\n                    y: valueScaleTopMargin + 20\n                });\n                rightLineData.push({\n                    x: cx + 10,\n                    y: cy - 20\n                });\n                rightLineData.push({\n                    x: farX,\n                    y: valueScaleTopMargin + 20\n                });\n\n                // Point on value line\n                leftLineData.push({\n                    x: nearX,\n                    y: valueScaleTopMargin\n                });\n                rightLineData.push({\n                    x: farX,\n                    y: valueScaleTopMargin\n                });\n                $hoverGroup.select('path.left').attr('d', lineFunction(leftLineData)).attr('stroke', 'black').attr('fill', 'none');\n                $hoverGroup.select('path.right').attr('d', lineFunction(rightLineData)).attr('stroke', 'black').attr('fill', 'none');\n                $hoverGroup.attr('visibility', 'visible');\n            }\n\n            rects.on('mouseenter', (bit, index) => {\n                jsds.set('selectedOutputBit', { state: bit, index: index });\n            });\n\n            while (jsdsHandles.length) {\n                jsdsHandles.pop().remove();\n            }\n\n            let setBitHandle = jsds.after('set', 'selectedOutputBit', hoverRange);\n            let setResHandle = jsds.after('set', 'resolution', () => {\n                let selectedBit = jsds.get('selectedOutputBit');\n                if (selectedBit) hoverRange(selectedBit);\n            });\n            jsdsHandles.push(setBitHandle);\n            jsdsHandles.push(setResHandle);\n        }\n\n        function updateValue(value) {\n            let xOffset = valueScaleSideMargins,\n                yOffset = valueScaleTopMargin,\n                markerWidth = 1,\n                markerHeight = 40;\n\n            let x = valueToX(value) - markerWidth / 2;\n            let y = 0 - markerHeight / 2 - 6;\n\n            $svg.select('g.value text').attr('x', x - 6).attr('y', y).attr('font-family', 'sans-serif').attr('font-size', '10pt').text(value);\n            let spacing = 7;\n            $svg.select('g.value rect').attr('stroke', 'red').attr('stroke-width', 1.5).attr('fill', 'none').attr('width', markerWidth).attr('height', markerHeight).attr('x', x).attr('y', y + spacing);\n\n            $svg.select('g.value').attr('transform', 'translate(' + xOffset + ',' + yOffset + ')');\n        }\n\n        function updateDisplays(encoding, value) {\n            updateOutputBits(encoding, width);\n            updateValue(value);\n        }\n\n        function redraw() {\n            updateDisplays(jsds.get(elementId + '-encoding'), jsds.get('value'));\n        }\n\n        // User interaction via resolution slider.\n        $resolutionSlider.on('input', () => {\n            jsds.set('resolution', Math.max(1, parseInt(parseInt($resolutionSlider.val()) / 100)));\n        });\n\n        // Once an encoding is set, we can draw.\n        jsds.after('set', elementId + '-encoding', redraw);\n\n        // When user changes resolution, we must re-create the encoder and re-encode the value.\n        jsds.after('set', 'resolution', v => {\n            encoder = new RelativeScalarEncoder(bits, v, minValue, maxValue, bounded);\n            $resolutionDisplays.html(v);\n            $resolutionSlider.val(v * 100);\n            let value = jsds.get('value');\n            jsds.set(elementId + '-encoding', encoder.encode(value));\n        });\n\n        // When a new value is set, it should be encoded.\n        jsds.after('set', 'value', v => {\n            jsds.set(elementId + '-encoding', encoder.encode(v));\n        });\n\n        // Start Program\n\n        setUpValueAxis(minValue, maxValue, width);\n        encoder = new RelativeScalarEncoder(bits, resolution, minValue, maxValue, bounded);\n        jsds.set('value', value);\n        jsds.set('resolution', parseInt(parseInt($resolutionSlider.val()) / 100));\n    });\n};\n\n//# sourceURL=webpack:///./src/widgets/encoding-numbers/simpleNumberEncoder.js?");

/***/ }),

/***/ "./src/widgets/encoding-numbers/simpleNumberEncoder.tmpl.html":
/*!********************************************************************!*\
  !*** ./src/widgets/encoding-numbers/simpleNumberEncoder.tmpl.html ***!
  \********************************************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony default export */ __webpack_exports__[\"default\"] = (`<svg font-family=\"sans-serif\">\n\n    <text x=\"10\" y=\"30\" font-size=\"10pt\">scalar value</text>\n\n    <g class=\"value\">\n        <text></text>\n        <rect></rect>\n    </g>\n\n    <text x=\"10\" y=\"140\" font-family=\"sans-serif\" font-size=\"10pt\">encoding</text>\n\n    <g class=\"encoding\">\n    </g>\n    <g class=\"range\" visibility=\"hidden\">\n        <circle></circle>\n        <path class=\"left\"></path>\n        <path class=\"right\"></path>\n    </g>\n</svg>\n<div>\n    <p>\n        <input type=\"range\" min=\"1\" max=\"5500\" step=\"100\" value=\"1000\" class=\"resolutionSlider\"> resolution:\n        <span class=\"resolutionDisplay\"></span>\n    </p>\n</div>\n<div class=\"figure-description\">\n    <p>\n        <strong>Mouse over</strong> the value line to encode a scalar value. <strong>Mouse over</strong> the encoding below it to see the scalar value range each bit represents. <strong>Change the resolution</strong> with the slider.\n    </p>\n</div>\n`);\n\n//# sourceURL=webpack:///./src/widgets/encoding-numbers/simpleNumberEncoder.tmpl.html?");

/***/ }),

/***/ "./src/widgets/utils.js":
/*!******************************!*\
  !*** ./src/widgets/utils.js ***!
  \******************************/
/*! no static exports found */
/***/ (function(module, exports) {

eval("// Loads given html into an element, calls the cb one time when loaded.\nfunction loadHtml(html, elementId, cb) {\n    let $el = $('#' + elementId);\n    $el.html(html).promise().done(cb);\n}\n\nfunction getRandomInt(max) {\n    return Math.floor(Math.random() * Math.floor(max));\n}\n\nfunction precisionRound(number, precision) {\n    let factor = Math.pow(10, precision);\n    return Math.round(number * factor) / factor;\n}\n\nfunction getRandomArbitrary(min, max) {\n    return Math.random() * (max - min) + min;\n}\n\nlet mod = function (a, b) {\n    return (a % b + b) % b;\n};\n\n// Standard Normal variate using Box-Muller transform.\nlet randomBoxMuller = function () {\n    let u = 0,\n        v = 0;\n    while (u === 0) u = Math.random(); //Converting [0,1) to (0,1)\n    while (v === 0) v = Math.random();\n    return Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);\n};\n\nfunction randomTorusWalk(d, w, h, speed) {\n    let X = [];\n    let V = [];\n    let x = [0.5 * w, 0.5 * h];\n\n    X.push(x.slice());\n    let v = [0.0, 0.0];\n    let theta = 0.0;\n\n    for (let t = 0; t < d; t++) {\n        theta += randomBoxMuller() / 4;\n        v[0] = speed * Math.cos(theta);\n        v[1] = speed * Math.sin(theta);\n        x[0] += v[0];\n        x[1] += v[1];\n        x[0] = mod(x[0], w);\n        x[1] = mod(x[1], h);\n        X.push(x.slice());\n        V.push(v.slice());\n    }\n    return [X, V];\n}\n\nmodule.exports = {\n    loadHtml: loadHtml,\n    getRandomInt: getRandomInt,\n    getRandomArbitrary: getRandomArbitrary,\n    precisionRound: precisionRound,\n    randomTorusWalk: randomTorusWalk\n};\n\n//# sourceURL=webpack:///./src/widgets/utils.js?");

/***/ }),

/***/ 0:
/*!*****************************************************!*\
  !*** multi ./src/widgets/encoding-numbers/index.js ***!
  \*****************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

eval("module.exports = __webpack_require__(/*! ./src/widgets/encoding-numbers/index.js */\"./src/widgets/encoding-numbers/index.js\");\n\n\n//# sourceURL=webpack:///multi_./src/widgets/encoding-numbers/index.js?");

/***/ })

/******/ });