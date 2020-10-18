(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
const release  = require("./schemas/release.json");
const releaseP = require("./schemas/release-package.json");
const recordP  = require("./schemas/record-package.json");

const RELEASE  = "release";
const RELEASEP = "release package";
const RECORDP  = "record Package";
const LINKED_RELEASE   = "Linked Release";
const EMBEDDED_RELEASE = "Embedded Release";

const ocdsSchemas = {
  release,
  releaseP,
  recordP
}

//console.log("schemas:", ocdsSchemas);

exports.createOCDSHelper = async ocds => {
  //console.log("schemas:", this.ocdsSchemas);
  return {
    ocds,
    type    : jsonType(ocds),
    //schemas : this.ocdsSchemas,
    data    : await getData(ocds)
  }
}

const getData = async ocds => {
  const type = jsonType(ocds);
  if(type === RELEASE) return accesors.release(ocds);
  else if(type === RECORDP) return await accesors.recordPackage(ocds);
  else if(type === RELEASEP) return await accesors.releasePackage(ocds);
  else return null;
}

const accesors = {
  release        : rel => rel,
  releasePackage : rel => rel,
  recordPackage  :  async(rp, index) => {
    const records  = rp.records;
    const response = [];
    // check if has items
    if(!records.length) return null;

    for(const rel of records){
      console.log("rel:", rel);
      /*
      if(rel.compiledRelease){
        console.log("compiled!");
        response.push(rel.compiledRelease);
      }
      */
       if(rel.releases){
        console.log("not compiled");
        for(const el of rel.releases){
          let type = releaseType(el);
          if(type == EMBEDDED_RELEASE){
            response.push(el);
          }
          else{
            try{
              let res  = await fetch(el.url);
              let item = res.json();
              response.push(item); 
            }
            catch(e){
              console.log(e);
            }
          }
        }
      }
    } 
    return index ? response[index] : response;  
  }
}


const jsonType = file => {
  if(typeof file !== "object" || file === null) return null;
  if(file.releases) return RELEASEP;
  if(file.records) return RECORDP;
  if(file.ocid) return RELEASE;
  return null;
}

const releaseType = rel => {
  if(rel.url && rel.date)       return LINKED_RELEASE;
  else if(rel.ocid && rel.date) return EMBEDDED_RELEASE;
  else return null;
}


},{"./schemas/record-package.json":28,"./schemas/release-package.json":29,"./schemas/release.json":30}],2:[function(require,module,exports){
module.exports = require('./lib/axios');
},{"./lib/axios":4}],3:[function(require,module,exports){
'use strict';

var utils = require('./../utils');
var settle = require('./../core/settle');
var cookies = require('./../helpers/cookies');
var buildURL = require('./../helpers/buildURL');
var buildFullPath = require('../core/buildFullPath');
var parseHeaders = require('./../helpers/parseHeaders');
var isURLSameOrigin = require('./../helpers/isURLSameOrigin');
var createError = require('../core/createError');

module.exports = function xhrAdapter(config) {
  return new Promise(function dispatchXhrRequest(resolve, reject) {
    var requestData = config.data;
    var requestHeaders = config.headers;

    if (utils.isFormData(requestData)) {
      delete requestHeaders['Content-Type']; // Let the browser set it
    }

    if (
      (utils.isBlob(requestData) || utils.isFile(requestData)) &&
      requestData.type
    ) {
      delete requestHeaders['Content-Type']; // Let the browser set it
    }

    var request = new XMLHttpRequest();

    // HTTP basic authentication
    if (config.auth) {
      var username = config.auth.username || '';
      var password = unescape(encodeURIComponent(config.auth.password)) || '';
      requestHeaders.Authorization = 'Basic ' + btoa(username + ':' + password);
    }

    var fullPath = buildFullPath(config.baseURL, config.url);
    request.open(config.method.toUpperCase(), buildURL(fullPath, config.params, config.paramsSerializer), true);

    // Set the request timeout in MS
    request.timeout = config.timeout;

    // Listen for ready state
    request.onreadystatechange = function handleLoad() {
      if (!request || request.readyState !== 4) {
        return;
      }

      // The request errored out and we didn't get a response, this will be
      // handled by onerror instead
      // With one exception: request that using file: protocol, most browsers
      // will return status as 0 even though it's a successful request
      if (request.status === 0 && !(request.responseURL && request.responseURL.indexOf('file:') === 0)) {
        return;
      }

      // Prepare the response
      var responseHeaders = 'getAllResponseHeaders' in request ? parseHeaders(request.getAllResponseHeaders()) : null;
      var responseData = !config.responseType || config.responseType === 'text' ? request.responseText : request.response;
      var response = {
        data: responseData,
        status: request.status,
        statusText: request.statusText,
        headers: responseHeaders,
        config: config,
        request: request
      };

      settle(resolve, reject, response);

      // Clean up request
      request = null;
    };

    // Handle browser request cancellation (as opposed to a manual cancellation)
    request.onabort = function handleAbort() {
      if (!request) {
        return;
      }

      reject(createError('Request aborted', config, 'ECONNABORTED', request));

      // Clean up request
      request = null;
    };

    // Handle low level network errors
    request.onerror = function handleError() {
      // Real errors are hidden from us by the browser
      // onerror should only fire if it's a network error
      reject(createError('Network Error', config, null, request));

      // Clean up request
      request = null;
    };

    // Handle timeout
    request.ontimeout = function handleTimeout() {
      var timeoutErrorMessage = 'timeout of ' + config.timeout + 'ms exceeded';
      if (config.timeoutErrorMessage) {
        timeoutErrorMessage = config.timeoutErrorMessage;
      }
      reject(createError(timeoutErrorMessage, config, 'ECONNABORTED',
        request));

      // Clean up request
      request = null;
    };

    // Add xsrf header
    // This is only done if running in a standard browser environment.
    // Specifically not if we're in a web worker, or react-native.
    if (utils.isStandardBrowserEnv()) {
      // Add xsrf header
      var xsrfValue = (config.withCredentials || isURLSameOrigin(fullPath)) && config.xsrfCookieName ?
        cookies.read(config.xsrfCookieName) :
        undefined;

      if (xsrfValue) {
        requestHeaders[config.xsrfHeaderName] = xsrfValue;
      }
    }

    // Add headers to the request
    if ('setRequestHeader' in request) {
      utils.forEach(requestHeaders, function setRequestHeader(val, key) {
        if (typeof requestData === 'undefined' && key.toLowerCase() === 'content-type') {
          // Remove Content-Type if data is undefined
          delete requestHeaders[key];
        } else {
          // Otherwise add header to the request
          request.setRequestHeader(key, val);
        }
      });
    }

    // Add withCredentials to request if needed
    if (!utils.isUndefined(config.withCredentials)) {
      request.withCredentials = !!config.withCredentials;
    }

    // Add responseType to request if needed
    if (config.responseType) {
      try {
        request.responseType = config.responseType;
      } catch (e) {
        // Expected DOMException thrown by browsers not compatible XMLHttpRequest Level 2.
        // But, this can be suppressed for 'json' type as it can be parsed by default 'transformResponse' function.
        if (config.responseType !== 'json') {
          throw e;
        }
      }
    }

    // Handle progress if needed
    if (typeof config.onDownloadProgress === 'function') {
      request.addEventListener('progress', config.onDownloadProgress);
    }

    // Not all browsers support upload events
    if (typeof config.onUploadProgress === 'function' && request.upload) {
      request.upload.addEventListener('progress', config.onUploadProgress);
    }

    if (config.cancelToken) {
      // Handle cancellation
      config.cancelToken.promise.then(function onCanceled(cancel) {
        if (!request) {
          return;
        }

        request.abort();
        reject(cancel);
        // Clean up request
        request = null;
      });
    }

    if (!requestData) {
      requestData = null;
    }

    // Send the request
    request.send(requestData);
  });
};

},{"../core/buildFullPath":10,"../core/createError":11,"./../core/settle":15,"./../helpers/buildURL":19,"./../helpers/cookies":21,"./../helpers/isURLSameOrigin":23,"./../helpers/parseHeaders":25,"./../utils":27}],4:[function(require,module,exports){
'use strict';

var utils = require('./utils');
var bind = require('./helpers/bind');
var Axios = require('./core/Axios');
var mergeConfig = require('./core/mergeConfig');
var defaults = require('./defaults');

/**
 * Create an instance of Axios
 *
 * @param {Object} defaultConfig The default config for the instance
 * @return {Axios} A new instance of Axios
 */
function createInstance(defaultConfig) {
  var context = new Axios(defaultConfig);
  var instance = bind(Axios.prototype.request, context);

  // Copy axios.prototype to instance
  utils.extend(instance, Axios.prototype, context);

  // Copy context to instance
  utils.extend(instance, context);

  return instance;
}

// Create the default instance to be exported
var axios = createInstance(defaults);

// Expose Axios class to allow class inheritance
axios.Axios = Axios;

// Factory for creating new instances
axios.create = function create(instanceConfig) {
  return createInstance(mergeConfig(axios.defaults, instanceConfig));
};

// Expose Cancel & CancelToken
axios.Cancel = require('./cancel/Cancel');
axios.CancelToken = require('./cancel/CancelToken');
axios.isCancel = require('./cancel/isCancel');

// Expose all/spread
axios.all = function all(promises) {
  return Promise.all(promises);
};
axios.spread = require('./helpers/spread');

module.exports = axios;

// Allow use of default import syntax in TypeScript
module.exports.default = axios;

},{"./cancel/Cancel":5,"./cancel/CancelToken":6,"./cancel/isCancel":7,"./core/Axios":8,"./core/mergeConfig":14,"./defaults":17,"./helpers/bind":18,"./helpers/spread":26,"./utils":27}],5:[function(require,module,exports){
'use strict';

/**
 * A `Cancel` is an object that is thrown when an operation is canceled.
 *
 * @class
 * @param {string=} message The message.
 */
function Cancel(message) {
  this.message = message;
}

Cancel.prototype.toString = function toString() {
  return 'Cancel' + (this.message ? ': ' + this.message : '');
};

Cancel.prototype.__CANCEL__ = true;

module.exports = Cancel;

},{}],6:[function(require,module,exports){
'use strict';

var Cancel = require('./Cancel');

/**
 * A `CancelToken` is an object that can be used to request cancellation of an operation.
 *
 * @class
 * @param {Function} executor The executor function.
 */
function CancelToken(executor) {
  if (typeof executor !== 'function') {
    throw new TypeError('executor must be a function.');
  }

  var resolvePromise;
  this.promise = new Promise(function promiseExecutor(resolve) {
    resolvePromise = resolve;
  });

  var token = this;
  executor(function cancel(message) {
    if (token.reason) {
      // Cancellation has already been requested
      return;
    }

    token.reason = new Cancel(message);
    resolvePromise(token.reason);
  });
}

/**
 * Throws a `Cancel` if cancellation has been requested.
 */
CancelToken.prototype.throwIfRequested = function throwIfRequested() {
  if (this.reason) {
    throw this.reason;
  }
};

/**
 * Returns an object that contains a new `CancelToken` and a function that, when called,
 * cancels the `CancelToken`.
 */
CancelToken.source = function source() {
  var cancel;
  var token = new CancelToken(function executor(c) {
    cancel = c;
  });
  return {
    token: token,
    cancel: cancel
  };
};

module.exports = CancelToken;

},{"./Cancel":5}],7:[function(require,module,exports){
'use strict';

module.exports = function isCancel(value) {
  return !!(value && value.__CANCEL__);
};

},{}],8:[function(require,module,exports){
'use strict';

var utils = require('./../utils');
var buildURL = require('../helpers/buildURL');
var InterceptorManager = require('./InterceptorManager');
var dispatchRequest = require('./dispatchRequest');
var mergeConfig = require('./mergeConfig');

/**
 * Create a new instance of Axios
 *
 * @param {Object} instanceConfig The default config for the instance
 */
function Axios(instanceConfig) {
  this.defaults = instanceConfig;
  this.interceptors = {
    request: new InterceptorManager(),
    response: new InterceptorManager()
  };
}

/**
 * Dispatch a request
 *
 * @param {Object} config The config specific for this request (merged with this.defaults)
 */
Axios.prototype.request = function request(config) {
  /*eslint no-param-reassign:0*/
  // Allow for axios('example/url'[, config]) a la fetch API
  if (typeof config === 'string') {
    config = arguments[1] || {};
    config.url = arguments[0];
  } else {
    config = config || {};
  }

  config = mergeConfig(this.defaults, config);

  // Set config.method
  if (config.method) {
    config.method = config.method.toLowerCase();
  } else if (this.defaults.method) {
    config.method = this.defaults.method.toLowerCase();
  } else {
    config.method = 'get';
  }

  // Hook up interceptors middleware
  var chain = [dispatchRequest, undefined];
  var promise = Promise.resolve(config);

  this.interceptors.request.forEach(function unshiftRequestInterceptors(interceptor) {
    chain.unshift(interceptor.fulfilled, interceptor.rejected);
  });

  this.interceptors.response.forEach(function pushResponseInterceptors(interceptor) {
    chain.push(interceptor.fulfilled, interceptor.rejected);
  });

  while (chain.length) {
    promise = promise.then(chain.shift(), chain.shift());
  }

  return promise;
};

Axios.prototype.getUri = function getUri(config) {
  config = mergeConfig(this.defaults, config);
  return buildURL(config.url, config.params, config.paramsSerializer).replace(/^\?/, '');
};

// Provide aliases for supported request methods
utils.forEach(['delete', 'get', 'head', 'options'], function forEachMethodNoData(method) {
  /*eslint func-names:0*/
  Axios.prototype[method] = function(url, config) {
    return this.request(mergeConfig(config || {}, {
      method: method,
      url: url
    }));
  };
});

utils.forEach(['post', 'put', 'patch'], function forEachMethodWithData(method) {
  /*eslint func-names:0*/
  Axios.prototype[method] = function(url, data, config) {
    return this.request(mergeConfig(config || {}, {
      method: method,
      url: url,
      data: data
    }));
  };
});

module.exports = Axios;

},{"../helpers/buildURL":19,"./../utils":27,"./InterceptorManager":9,"./dispatchRequest":12,"./mergeConfig":14}],9:[function(require,module,exports){
'use strict';

var utils = require('./../utils');

function InterceptorManager() {
  this.handlers = [];
}

/**
 * Add a new interceptor to the stack
 *
 * @param {Function} fulfilled The function to handle `then` for a `Promise`
 * @param {Function} rejected The function to handle `reject` for a `Promise`
 *
 * @return {Number} An ID used to remove interceptor later
 */
InterceptorManager.prototype.use = function use(fulfilled, rejected) {
  this.handlers.push({
    fulfilled: fulfilled,
    rejected: rejected
  });
  return this.handlers.length - 1;
};

/**
 * Remove an interceptor from the stack
 *
 * @param {Number} id The ID that was returned by `use`
 */
InterceptorManager.prototype.eject = function eject(id) {
  if (this.handlers[id]) {
    this.handlers[id] = null;
  }
};

/**
 * Iterate over all the registered interceptors
 *
 * This method is particularly useful for skipping over any
 * interceptors that may have become `null` calling `eject`.
 *
 * @param {Function} fn The function to call for each interceptor
 */
InterceptorManager.prototype.forEach = function forEach(fn) {
  utils.forEach(this.handlers, function forEachHandler(h) {
    if (h !== null) {
      fn(h);
    }
  });
};

module.exports = InterceptorManager;

},{"./../utils":27}],10:[function(require,module,exports){
'use strict';

var isAbsoluteURL = require('../helpers/isAbsoluteURL');
var combineURLs = require('../helpers/combineURLs');

/**
 * Creates a new URL by combining the baseURL with the requestedURL,
 * only when the requestedURL is not already an absolute URL.
 * If the requestURL is absolute, this function returns the requestedURL untouched.
 *
 * @param {string} baseURL The base URL
 * @param {string} requestedURL Absolute or relative URL to combine
 * @returns {string} The combined full path
 */
module.exports = function buildFullPath(baseURL, requestedURL) {
  if (baseURL && !isAbsoluteURL(requestedURL)) {
    return combineURLs(baseURL, requestedURL);
  }
  return requestedURL;
};

},{"../helpers/combineURLs":20,"../helpers/isAbsoluteURL":22}],11:[function(require,module,exports){
'use strict';

var enhanceError = require('./enhanceError');

/**
 * Create an Error with the specified message, config, error code, request and response.
 *
 * @param {string} message The error message.
 * @param {Object} config The config.
 * @param {string} [code] The error code (for example, 'ECONNABORTED').
 * @param {Object} [request] The request.
 * @param {Object} [response] The response.
 * @returns {Error} The created error.
 */
module.exports = function createError(message, config, code, request, response) {
  var error = new Error(message);
  return enhanceError(error, config, code, request, response);
};

},{"./enhanceError":13}],12:[function(require,module,exports){
'use strict';

var utils = require('./../utils');
var transformData = require('./transformData');
var isCancel = require('../cancel/isCancel');
var defaults = require('../defaults');

/**
 * Throws a `Cancel` if cancellation has been requested.
 */
function throwIfCancellationRequested(config) {
  if (config.cancelToken) {
    config.cancelToken.throwIfRequested();
  }
}

/**
 * Dispatch a request to the server using the configured adapter.
 *
 * @param {object} config The config that is to be used for the request
 * @returns {Promise} The Promise to be fulfilled
 */
module.exports = function dispatchRequest(config) {
  throwIfCancellationRequested(config);

  // Ensure headers exist
  config.headers = config.headers || {};

  // Transform request data
  config.data = transformData(
    config.data,
    config.headers,
    config.transformRequest
  );

  // Flatten headers
  config.headers = utils.merge(
    config.headers.common || {},
    config.headers[config.method] || {},
    config.headers
  );

  utils.forEach(
    ['delete', 'get', 'head', 'post', 'put', 'patch', 'common'],
    function cleanHeaderConfig(method) {
      delete config.headers[method];
    }
  );

  var adapter = config.adapter || defaults.adapter;

  return adapter(config).then(function onAdapterResolution(response) {
    throwIfCancellationRequested(config);

    // Transform response data
    response.data = transformData(
      response.data,
      response.headers,
      config.transformResponse
    );

    return response;
  }, function onAdapterRejection(reason) {
    if (!isCancel(reason)) {
      throwIfCancellationRequested(config);

      // Transform response data
      if (reason && reason.response) {
        reason.response.data = transformData(
          reason.response.data,
          reason.response.headers,
          config.transformResponse
        );
      }
    }

    return Promise.reject(reason);
  });
};

},{"../cancel/isCancel":7,"../defaults":17,"./../utils":27,"./transformData":16}],13:[function(require,module,exports){
'use strict';

/**
 * Update an Error with the specified config, error code, and response.
 *
 * @param {Error} error The error to update.
 * @param {Object} config The config.
 * @param {string} [code] The error code (for example, 'ECONNABORTED').
 * @param {Object} [request] The request.
 * @param {Object} [response] The response.
 * @returns {Error} The error.
 */
module.exports = function enhanceError(error, config, code, request, response) {
  error.config = config;
  if (code) {
    error.code = code;
  }

  error.request = request;
  error.response = response;
  error.isAxiosError = true;

  error.toJSON = function toJSON() {
    return {
      // Standard
      message: this.message,
      name: this.name,
      // Microsoft
      description: this.description,
      number: this.number,
      // Mozilla
      fileName: this.fileName,
      lineNumber: this.lineNumber,
      columnNumber: this.columnNumber,
      stack: this.stack,
      // Axios
      config: this.config,
      code: this.code
    };
  };
  return error;
};

},{}],14:[function(require,module,exports){
'use strict';

var utils = require('../utils');

/**
 * Config-specific merge-function which creates a new config-object
 * by merging two configuration objects together.
 *
 * @param {Object} config1
 * @param {Object} config2
 * @returns {Object} New object resulting from merging config2 to config1
 */
module.exports = function mergeConfig(config1, config2) {
  // eslint-disable-next-line no-param-reassign
  config2 = config2 || {};
  var config = {};

  var valueFromConfig2Keys = ['url', 'method', 'data'];
  var mergeDeepPropertiesKeys = ['headers', 'auth', 'proxy', 'params'];
  var defaultToConfig2Keys = [
    'baseURL', 'transformRequest', 'transformResponse', 'paramsSerializer',
    'timeout', 'timeoutMessage', 'withCredentials', 'adapter', 'responseType', 'xsrfCookieName',
    'xsrfHeaderName', 'onUploadProgress', 'onDownloadProgress', 'decompress',
    'maxContentLength', 'maxBodyLength', 'maxRedirects', 'transport', 'httpAgent',
    'httpsAgent', 'cancelToken', 'socketPath', 'responseEncoding'
  ];
  var directMergeKeys = ['validateStatus'];

  function getMergedValue(target, source) {
    if (utils.isPlainObject(target) && utils.isPlainObject(source)) {
      return utils.merge(target, source);
    } else if (utils.isPlainObject(source)) {
      return utils.merge({}, source);
    } else if (utils.isArray(source)) {
      return source.slice();
    }
    return source;
  }

  function mergeDeepProperties(prop) {
    if (!utils.isUndefined(config2[prop])) {
      config[prop] = getMergedValue(config1[prop], config2[prop]);
    } else if (!utils.isUndefined(config1[prop])) {
      config[prop] = getMergedValue(undefined, config1[prop]);
    }
  }

  utils.forEach(valueFromConfig2Keys, function valueFromConfig2(prop) {
    if (!utils.isUndefined(config2[prop])) {
      config[prop] = getMergedValue(undefined, config2[prop]);
    }
  });

  utils.forEach(mergeDeepPropertiesKeys, mergeDeepProperties);

  utils.forEach(defaultToConfig2Keys, function defaultToConfig2(prop) {
    if (!utils.isUndefined(config2[prop])) {
      config[prop] = getMergedValue(undefined, config2[prop]);
    } else if (!utils.isUndefined(config1[prop])) {
      config[prop] = getMergedValue(undefined, config1[prop]);
    }
  });

  utils.forEach(directMergeKeys, function merge(prop) {
    if (prop in config2) {
      config[prop] = getMergedValue(config1[prop], config2[prop]);
    } else if (prop in config1) {
      config[prop] = getMergedValue(undefined, config1[prop]);
    }
  });

  var axiosKeys = valueFromConfig2Keys
    .concat(mergeDeepPropertiesKeys)
    .concat(defaultToConfig2Keys)
    .concat(directMergeKeys);

  var otherKeys = Object
    .keys(config1)
    .concat(Object.keys(config2))
    .filter(function filterAxiosKeys(key) {
      return axiosKeys.indexOf(key) === -1;
    });

  utils.forEach(otherKeys, mergeDeepProperties);

  return config;
};

},{"../utils":27}],15:[function(require,module,exports){
'use strict';

var createError = require('./createError');

/**
 * Resolve or reject a Promise based on response status.
 *
 * @param {Function} resolve A function that resolves the promise.
 * @param {Function} reject A function that rejects the promise.
 * @param {object} response The response.
 */
module.exports = function settle(resolve, reject, response) {
  var validateStatus = response.config.validateStatus;
  if (!response.status || !validateStatus || validateStatus(response.status)) {
    resolve(response);
  } else {
    reject(createError(
      'Request failed with status code ' + response.status,
      response.config,
      null,
      response.request,
      response
    ));
  }
};

},{"./createError":11}],16:[function(require,module,exports){
'use strict';

var utils = require('./../utils');

/**
 * Transform the data for a request or a response
 *
 * @param {Object|String} data The data to be transformed
 * @param {Array} headers The headers for the request or response
 * @param {Array|Function} fns A single function or Array of functions
 * @returns {*} The resulting transformed data
 */
module.exports = function transformData(data, headers, fns) {
  /*eslint no-param-reassign:0*/
  utils.forEach(fns, function transform(fn) {
    data = fn(data, headers);
  });

  return data;
};

},{"./../utils":27}],17:[function(require,module,exports){
(function (process){(function (){
'use strict';

var utils = require('./utils');
var normalizeHeaderName = require('./helpers/normalizeHeaderName');

var DEFAULT_CONTENT_TYPE = {
  'Content-Type': 'application/x-www-form-urlencoded'
};

function setContentTypeIfUnset(headers, value) {
  if (!utils.isUndefined(headers) && utils.isUndefined(headers['Content-Type'])) {
    headers['Content-Type'] = value;
  }
}

function getDefaultAdapter() {
  var adapter;
  if (typeof XMLHttpRequest !== 'undefined') {
    // For browsers use XHR adapter
    adapter = require('./adapters/xhr');
  } else if (typeof process !== 'undefined' && Object.prototype.toString.call(process) === '[object process]') {
    // For node use HTTP adapter
    adapter = require('./adapters/http');
  }
  return adapter;
}

var defaults = {
  adapter: getDefaultAdapter(),

  transformRequest: [function transformRequest(data, headers) {
    normalizeHeaderName(headers, 'Accept');
    normalizeHeaderName(headers, 'Content-Type');
    if (utils.isFormData(data) ||
      utils.isArrayBuffer(data) ||
      utils.isBuffer(data) ||
      utils.isStream(data) ||
      utils.isFile(data) ||
      utils.isBlob(data)
    ) {
      return data;
    }
    if (utils.isArrayBufferView(data)) {
      return data.buffer;
    }
    if (utils.isURLSearchParams(data)) {
      setContentTypeIfUnset(headers, 'application/x-www-form-urlencoded;charset=utf-8');
      return data.toString();
    }
    if (utils.isObject(data)) {
      setContentTypeIfUnset(headers, 'application/json;charset=utf-8');
      return JSON.stringify(data);
    }
    return data;
  }],

  transformResponse: [function transformResponse(data) {
    /*eslint no-param-reassign:0*/
    if (typeof data === 'string') {
      try {
        data = JSON.parse(data);
      } catch (e) { /* Ignore */ }
    }
    return data;
  }],

  /**
   * A timeout in milliseconds to abort a request. If set to 0 (default) a
   * timeout is not created.
   */
  timeout: 0,

  xsrfCookieName: 'XSRF-TOKEN',
  xsrfHeaderName: 'X-XSRF-TOKEN',

  maxContentLength: -1,
  maxBodyLength: -1,

  validateStatus: function validateStatus(status) {
    return status >= 200 && status < 300;
  }
};

defaults.headers = {
  common: {
    'Accept': 'application/json, text/plain, */*'
  }
};

utils.forEach(['delete', 'get', 'head'], function forEachMethodNoData(method) {
  defaults.headers[method] = {};
});

utils.forEach(['post', 'put', 'patch'], function forEachMethodWithData(method) {
  defaults.headers[method] = utils.merge(DEFAULT_CONTENT_TYPE);
});

module.exports = defaults;

}).call(this)}).call(this,require('_process'))
},{"./adapters/http":3,"./adapters/xhr":3,"./helpers/normalizeHeaderName":24,"./utils":27,"_process":32}],18:[function(require,module,exports){
'use strict';

module.exports = function bind(fn, thisArg) {
  return function wrap() {
    var args = new Array(arguments.length);
    for (var i = 0; i < args.length; i++) {
      args[i] = arguments[i];
    }
    return fn.apply(thisArg, args);
  };
};

},{}],19:[function(require,module,exports){
'use strict';

var utils = require('./../utils');

function encode(val) {
  return encodeURIComponent(val).
    replace(/%3A/gi, ':').
    replace(/%24/g, '$').
    replace(/%2C/gi, ',').
    replace(/%20/g, '+').
    replace(/%5B/gi, '[').
    replace(/%5D/gi, ']');
}

/**
 * Build a URL by appending params to the end
 *
 * @param {string} url The base of the url (e.g., http://www.google.com)
 * @param {object} [params] The params to be appended
 * @returns {string} The formatted url
 */
module.exports = function buildURL(url, params, paramsSerializer) {
  /*eslint no-param-reassign:0*/
  if (!params) {
    return url;
  }

  var serializedParams;
  if (paramsSerializer) {
    serializedParams = paramsSerializer(params);
  } else if (utils.isURLSearchParams(params)) {
    serializedParams = params.toString();
  } else {
    var parts = [];

    utils.forEach(params, function serialize(val, key) {
      if (val === null || typeof val === 'undefined') {
        return;
      }

      if (utils.isArray(val)) {
        key = key + '[]';
      } else {
        val = [val];
      }

      utils.forEach(val, function parseValue(v) {
        if (utils.isDate(v)) {
          v = v.toISOString();
        } else if (utils.isObject(v)) {
          v = JSON.stringify(v);
        }
        parts.push(encode(key) + '=' + encode(v));
      });
    });

    serializedParams = parts.join('&');
  }

  if (serializedParams) {
    var hashmarkIndex = url.indexOf('#');
    if (hashmarkIndex !== -1) {
      url = url.slice(0, hashmarkIndex);
    }

    url += (url.indexOf('?') === -1 ? '?' : '&') + serializedParams;
  }

  return url;
};

},{"./../utils":27}],20:[function(require,module,exports){
'use strict';

/**
 * Creates a new URL by combining the specified URLs
 *
 * @param {string} baseURL The base URL
 * @param {string} relativeURL The relative URL
 * @returns {string} The combined URL
 */
module.exports = function combineURLs(baseURL, relativeURL) {
  return relativeURL
    ? baseURL.replace(/\/+$/, '') + '/' + relativeURL.replace(/^\/+/, '')
    : baseURL;
};

},{}],21:[function(require,module,exports){
'use strict';

var utils = require('./../utils');

module.exports = (
  utils.isStandardBrowserEnv() ?

  // Standard browser envs support document.cookie
    (function standardBrowserEnv() {
      return {
        write: function write(name, value, expires, path, domain, secure) {
          var cookie = [];
          cookie.push(name + '=' + encodeURIComponent(value));

          if (utils.isNumber(expires)) {
            cookie.push('expires=' + new Date(expires).toGMTString());
          }

          if (utils.isString(path)) {
            cookie.push('path=' + path);
          }

          if (utils.isString(domain)) {
            cookie.push('domain=' + domain);
          }

          if (secure === true) {
            cookie.push('secure');
          }

          document.cookie = cookie.join('; ');
        },

        read: function read(name) {
          var match = document.cookie.match(new RegExp('(^|;\\s*)(' + name + ')=([^;]*)'));
          return (match ? decodeURIComponent(match[3]) : null);
        },

        remove: function remove(name) {
          this.write(name, '', Date.now() - 86400000);
        }
      };
    })() :

  // Non standard browser env (web workers, react-native) lack needed support.
    (function nonStandardBrowserEnv() {
      return {
        write: function write() {},
        read: function read() { return null; },
        remove: function remove() {}
      };
    })()
);

},{"./../utils":27}],22:[function(require,module,exports){
'use strict';

/**
 * Determines whether the specified URL is absolute
 *
 * @param {string} url The URL to test
 * @returns {boolean} True if the specified URL is absolute, otherwise false
 */
module.exports = function isAbsoluteURL(url) {
  // A URL is considered absolute if it begins with "<scheme>://" or "//" (protocol-relative URL).
  // RFC 3986 defines scheme name as a sequence of characters beginning with a letter and followed
  // by any combination of letters, digits, plus, period, or hyphen.
  return /^([a-z][a-z\d\+\-\.]*:)?\/\//i.test(url);
};

},{}],23:[function(require,module,exports){
'use strict';

var utils = require('./../utils');

module.exports = (
  utils.isStandardBrowserEnv() ?

  // Standard browser envs have full support of the APIs needed to test
  // whether the request URL is of the same origin as current location.
    (function standardBrowserEnv() {
      var msie = /(msie|trident)/i.test(navigator.userAgent);
      var urlParsingNode = document.createElement('a');
      var originURL;

      /**
    * Parse a URL to discover it's components
    *
    * @param {String} url The URL to be parsed
    * @returns {Object}
    */
      function resolveURL(url) {
        var href = url;

        if (msie) {
        // IE needs attribute set twice to normalize properties
          urlParsingNode.setAttribute('href', href);
          href = urlParsingNode.href;
        }

        urlParsingNode.setAttribute('href', href);

        // urlParsingNode provides the UrlUtils interface - http://url.spec.whatwg.org/#urlutils
        return {
          href: urlParsingNode.href,
          protocol: urlParsingNode.protocol ? urlParsingNode.protocol.replace(/:$/, '') : '',
          host: urlParsingNode.host,
          search: urlParsingNode.search ? urlParsingNode.search.replace(/^\?/, '') : '',
          hash: urlParsingNode.hash ? urlParsingNode.hash.replace(/^#/, '') : '',
          hostname: urlParsingNode.hostname,
          port: urlParsingNode.port,
          pathname: (urlParsingNode.pathname.charAt(0) === '/') ?
            urlParsingNode.pathname :
            '/' + urlParsingNode.pathname
        };
      }

      originURL = resolveURL(window.location.href);

      /**
    * Determine if a URL shares the same origin as the current location
    *
    * @param {String} requestURL The URL to test
    * @returns {boolean} True if URL shares the same origin, otherwise false
    */
      return function isURLSameOrigin(requestURL) {
        var parsed = (utils.isString(requestURL)) ? resolveURL(requestURL) : requestURL;
        return (parsed.protocol === originURL.protocol &&
            parsed.host === originURL.host);
      };
    })() :

  // Non standard browser envs (web workers, react-native) lack needed support.
    (function nonStandardBrowserEnv() {
      return function isURLSameOrigin() {
        return true;
      };
    })()
);

},{"./../utils":27}],24:[function(require,module,exports){
'use strict';

var utils = require('../utils');

module.exports = function normalizeHeaderName(headers, normalizedName) {
  utils.forEach(headers, function processHeader(value, name) {
    if (name !== normalizedName && name.toUpperCase() === normalizedName.toUpperCase()) {
      headers[normalizedName] = value;
      delete headers[name];
    }
  });
};

},{"../utils":27}],25:[function(require,module,exports){
'use strict';

var utils = require('./../utils');

// Headers whose duplicates are ignored by node
// c.f. https://nodejs.org/api/http.html#http_message_headers
var ignoreDuplicateOf = [
  'age', 'authorization', 'content-length', 'content-type', 'etag',
  'expires', 'from', 'host', 'if-modified-since', 'if-unmodified-since',
  'last-modified', 'location', 'max-forwards', 'proxy-authorization',
  'referer', 'retry-after', 'user-agent'
];

/**
 * Parse headers into an object
 *
 * ```
 * Date: Wed, 27 Aug 2014 08:58:49 GMT
 * Content-Type: application/json
 * Connection: keep-alive
 * Transfer-Encoding: chunked
 * ```
 *
 * @param {String} headers Headers needing to be parsed
 * @returns {Object} Headers parsed into an object
 */
module.exports = function parseHeaders(headers) {
  var parsed = {};
  var key;
  var val;
  var i;

  if (!headers) { return parsed; }

  utils.forEach(headers.split('\n'), function parser(line) {
    i = line.indexOf(':');
    key = utils.trim(line.substr(0, i)).toLowerCase();
    val = utils.trim(line.substr(i + 1));

    if (key) {
      if (parsed[key] && ignoreDuplicateOf.indexOf(key) >= 0) {
        return;
      }
      if (key === 'set-cookie') {
        parsed[key] = (parsed[key] ? parsed[key] : []).concat([val]);
      } else {
        parsed[key] = parsed[key] ? parsed[key] + ', ' + val : val;
      }
    }
  });

  return parsed;
};

},{"./../utils":27}],26:[function(require,module,exports){
'use strict';

/**
 * Syntactic sugar for invoking a function and expanding an array for arguments.
 *
 * Common use case would be to use `Function.prototype.apply`.
 *
 *  ```js
 *  function f(x, y, z) {}
 *  var args = [1, 2, 3];
 *  f.apply(null, args);
 *  ```
 *
 * With `spread` this example can be re-written.
 *
 *  ```js
 *  spread(function(x, y, z) {})([1, 2, 3]);
 *  ```
 *
 * @param {Function} callback
 * @returns {Function}
 */
module.exports = function spread(callback) {
  return function wrap(arr) {
    return callback.apply(null, arr);
  };
};

},{}],27:[function(require,module,exports){
'use strict';

var bind = require('./helpers/bind');

/*global toString:true*/

// utils is a library of generic helper functions non-specific to axios

var toString = Object.prototype.toString;

/**
 * Determine if a value is an Array
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is an Array, otherwise false
 */
function isArray(val) {
  return toString.call(val) === '[object Array]';
}

/**
 * Determine if a value is undefined
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if the value is undefined, otherwise false
 */
function isUndefined(val) {
  return typeof val === 'undefined';
}

/**
 * Determine if a value is a Buffer
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is a Buffer, otherwise false
 */
function isBuffer(val) {
  return val !== null && !isUndefined(val) && val.constructor !== null && !isUndefined(val.constructor)
    && typeof val.constructor.isBuffer === 'function' && val.constructor.isBuffer(val);
}

/**
 * Determine if a value is an ArrayBuffer
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is an ArrayBuffer, otherwise false
 */
function isArrayBuffer(val) {
  return toString.call(val) === '[object ArrayBuffer]';
}

/**
 * Determine if a value is a FormData
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is an FormData, otherwise false
 */
function isFormData(val) {
  return (typeof FormData !== 'undefined') && (val instanceof FormData);
}

/**
 * Determine if a value is a view on an ArrayBuffer
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is a view on an ArrayBuffer, otherwise false
 */
function isArrayBufferView(val) {
  var result;
  if ((typeof ArrayBuffer !== 'undefined') && (ArrayBuffer.isView)) {
    result = ArrayBuffer.isView(val);
  } else {
    result = (val) && (val.buffer) && (val.buffer instanceof ArrayBuffer);
  }
  return result;
}

/**
 * Determine if a value is a String
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is a String, otherwise false
 */
function isString(val) {
  return typeof val === 'string';
}

/**
 * Determine if a value is a Number
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is a Number, otherwise false
 */
function isNumber(val) {
  return typeof val === 'number';
}

/**
 * Determine if a value is an Object
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is an Object, otherwise false
 */
function isObject(val) {
  return val !== null && typeof val === 'object';
}

/**
 * Determine if a value is a plain Object
 *
 * @param {Object} val The value to test
 * @return {boolean} True if value is a plain Object, otherwise false
 */
function isPlainObject(val) {
  if (toString.call(val) !== '[object Object]') {
    return false;
  }

  var prototype = Object.getPrototypeOf(val);
  return prototype === null || prototype === Object.prototype;
}

/**
 * Determine if a value is a Date
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is a Date, otherwise false
 */
function isDate(val) {
  return toString.call(val) === '[object Date]';
}

/**
 * Determine if a value is a File
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is a File, otherwise false
 */
function isFile(val) {
  return toString.call(val) === '[object File]';
}

/**
 * Determine if a value is a Blob
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is a Blob, otherwise false
 */
function isBlob(val) {
  return toString.call(val) === '[object Blob]';
}

/**
 * Determine if a value is a Function
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is a Function, otherwise false
 */
function isFunction(val) {
  return toString.call(val) === '[object Function]';
}

/**
 * Determine if a value is a Stream
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is a Stream, otherwise false
 */
function isStream(val) {
  return isObject(val) && isFunction(val.pipe);
}

/**
 * Determine if a value is a URLSearchParams object
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is a URLSearchParams object, otherwise false
 */
function isURLSearchParams(val) {
  return typeof URLSearchParams !== 'undefined' && val instanceof URLSearchParams;
}

/**
 * Trim excess whitespace off the beginning and end of a string
 *
 * @param {String} str The String to trim
 * @returns {String} The String freed of excess whitespace
 */
function trim(str) {
  return str.replace(/^\s*/, '').replace(/\s*$/, '');
}

/**
 * Determine if we're running in a standard browser environment
 *
 * This allows axios to run in a web worker, and react-native.
 * Both environments support XMLHttpRequest, but not fully standard globals.
 *
 * web workers:
 *  typeof window -> undefined
 *  typeof document -> undefined
 *
 * react-native:
 *  navigator.product -> 'ReactNative'
 * nativescript
 *  navigator.product -> 'NativeScript' or 'NS'
 */
function isStandardBrowserEnv() {
  if (typeof navigator !== 'undefined' && (navigator.product === 'ReactNative' ||
                                           navigator.product === 'NativeScript' ||
                                           navigator.product === 'NS')) {
    return false;
  }
  return (
    typeof window !== 'undefined' &&
    typeof document !== 'undefined'
  );
}

/**
 * Iterate over an Array or an Object invoking a function for each item.
 *
 * If `obj` is an Array callback will be called passing
 * the value, index, and complete array for each item.
 *
 * If 'obj' is an Object callback will be called passing
 * the value, key, and complete object for each property.
 *
 * @param {Object|Array} obj The object to iterate
 * @param {Function} fn The callback to invoke for each item
 */
function forEach(obj, fn) {
  // Don't bother if no value provided
  if (obj === null || typeof obj === 'undefined') {
    return;
  }

  // Force an array if not already something iterable
  if (typeof obj !== 'object') {
    /*eslint no-param-reassign:0*/
    obj = [obj];
  }

  if (isArray(obj)) {
    // Iterate over array values
    for (var i = 0, l = obj.length; i < l; i++) {
      fn.call(null, obj[i], i, obj);
    }
  } else {
    // Iterate over object keys
    for (var key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        fn.call(null, obj[key], key, obj);
      }
    }
  }
}

/**
 * Accepts varargs expecting each argument to be an object, then
 * immutably merges the properties of each object and returns result.
 *
 * When multiple objects contain the same key the later object in
 * the arguments list will take precedence.
 *
 * Example:
 *
 * ```js
 * var result = merge({foo: 123}, {foo: 456});
 * console.log(result.foo); // outputs 456
 * ```
 *
 * @param {Object} obj1 Object to merge
 * @returns {Object} Result of all merge properties
 */
function merge(/* obj1, obj2, obj3, ... */) {
  var result = {};
  function assignValue(val, key) {
    if (isPlainObject(result[key]) && isPlainObject(val)) {
      result[key] = merge(result[key], val);
    } else if (isPlainObject(val)) {
      result[key] = merge({}, val);
    } else if (isArray(val)) {
      result[key] = val.slice();
    } else {
      result[key] = val;
    }
  }

  for (var i = 0, l = arguments.length; i < l; i++) {
    forEach(arguments[i], assignValue);
  }
  return result;
}

/**
 * Extends object a by mutably adding to it the properties of object b.
 *
 * @param {Object} a The object to be extended
 * @param {Object} b The object to copy properties from
 * @param {Object} thisArg The object to bind function to
 * @return {Object} The resulting value of object a
 */
function extend(a, b, thisArg) {
  forEach(b, function assignValue(val, key) {
    if (thisArg && typeof val === 'function') {
      a[key] = bind(val, thisArg);
    } else {
      a[key] = val;
    }
  });
  return a;
}

/**
 * Remove byte order marker. This catches EF BB BF (the UTF-8 BOM)
 *
 * @param {string} content with BOM
 * @return {string} content value without BOM
 */
function stripBOM(content) {
  if (content.charCodeAt(0) === 0xFEFF) {
    content = content.slice(1);
  }
  return content;
}

module.exports = {
  isArray: isArray,
  isArrayBuffer: isArrayBuffer,
  isBuffer: isBuffer,
  isFormData: isFormData,
  isArrayBufferView: isArrayBufferView,
  isString: isString,
  isNumber: isNumber,
  isObject: isObject,
  isPlainObject: isPlainObject,
  isUndefined: isUndefined,
  isDate: isDate,
  isFile: isFile,
  isBlob: isBlob,
  isFunction: isFunction,
  isStream: isStream,
  isURLSearchParams: isURLSearchParams,
  isStandardBrowserEnv: isStandardBrowserEnv,
  forEach: forEach,
  merge: merge,
  extend: extend,
  trim: trim,
  stripBOM: stripBOM
};

},{"./helpers/bind":18}],28:[function(require,module,exports){
module.exports={
  "id": "https://standard.open-contracting.org/schema/1__1__5/record-package-schema.json",
  "$schema": "http://json-schema.org/draft-04/schema#",
  "title": "Schema for an Open Contracting Record package",
  "description": "The record package contains a list of records along with some publishing metadata. The records pull together all the releases under a single Open Contracting ID and compile them into the latest version of the information along with the history of any data changes.",
  "type": "object",
  "properties": {
    "uri": {
      "title": "Package identifier",
      "description": "The URI of this package that identifies it uniquely in the world.",
      "type": "string",
      "format": "uri"
    },
    "version": {
      "title": "OCDS schema version",
      "description": "The version of the OCDS schema used in this package, expressed as major.minor For example: 1.0 or 1.1",
      "type": "string",
      "pattern": "^(\\d+\\.)(\\d+)$"
    },
    "extensions": {
      "title": "OCDS extensions",
      "description": "An array of OCDS extensions used in this package, in which each array item is the URL of an extension.json file.",
      "type": "array",
      "items": {
        "type": "string",
        "format": "uri"
      }
    },
    "publisher": {
      "title": "Publisher",
      "description": "Information to uniquely identify the publisher of this package.",
      "type": "object",
      "properties": {
        "name": {
          "title": "Name",
          "description": "The name of the organization or department responsible for publishing this data.",
          "type": "string"
        },
        "scheme": {
          "title": "Scheme",
          "description": "The scheme that holds the unique identifiers used to identify the item being identified.",
          "type": [
            "string",
            "null"
          ]
        },
        "uid": {
          "title": "uid",
          "description": "The unique ID for this entity under the given ID scheme.",
          "type": [
            "string",
            "null"
          ]
        },
        "uri": {
          "title": "URI",
          "description": "A URI to identify the publisher.",
          "type": [
            "string",
            "null"
          ],
          "format": "uri"
        }
      },
      "required": [
        "name"
      ]
    },
    "license": {
      "title": "License",
      "description": "A link to the license that applies to the data in this package. A Public Domain Dedication or [Open Definition Conformant](http://opendefinition.org/licenses/) license is recommended. The canonical URI of the license should be used. Documents linked from this file may be under other license conditions.",
      "type": [
        "string",
        "null"
      ],
      "format": "uri"
    },
    "publicationPolicy": {
      "title": "Publication policy",
      "description": "A link to a document describing the publishers publication policy.",
      "type": [
        "string",
        "null"
      ],
      "format": "uri"
    },
    "publishedDate": {
      "title": "Published date",
      "description": "The date that this package was published. If this package is generated 'on demand', this date should reflect the date of the last change to the underlying contents of the package.",
      "type": "string",
      "format": "date-time"
    },
    "packages": {
      "title": "Packages",
      "description": "A list of URIs of all the release packages that were used to create this record package.",
      "type": "array",
      "minItems": 1,
      "items": {
        "type": "string",
        "format": "uri"
      },
      "uniqueItems": true
    },
    "records": {
      "title": "Records",
      "description": "The records for this data package.",
      "type": "array",
      "minItems": 1,
      "items": {
        "$ref": "#/definitions/record"
      },
      "uniqueItems": true
    }
  },
  "required": [
    "uri",
    "publisher",
    "publishedDate",
    "records",
    "version"
  ],
  "definitions": {
    "record": {
      "title": "Record",
      "description": "An OCDS record must provide a list of all the existing OCDS releases relating to a single contracting process and should provide a compiled release containing the current state of all fields in the release schema. An OCDS record may also provide a versioned history of all changes to the data in the compiled release.",
      "type": "object",
      "properties": {
        "ocid": {
          "title": "Open Contracting ID",
          "description": "A unique identifier that identifies the unique Open Contracting Process. For more information see: https://standard.open-contracting.org/{{version}}/{{lang}}/getting_started/contracting_process/",
          "type": "string"
        },
        "releases": {
          "title": "Releases",
          "description": "An array of linking identifiers or releases",
          "oneOf": [
            {
              "title": "Linked releases",
              "description": "A list of objects that identify the releases associated with this Open Contracting ID. The releases MUST be sorted into date order in the array, from oldest (at position 0) to newest (last).",
              "type": "array",
              "items": {
                "description": "Information to uniquely identify the release.",
                "type": "object",
                "properties": {
                  "url": {
                    "title": "Release URL",
                    "description": "The URL of the release which contains the URL of the package with the release `id` appended using a fragment identifier e.g. https://standard.open-contracting.org/{{version}}/{{lang}}/examples/tender.json#ocds-213czf-000-00001",
                    "type": [
                      "string",
                      "null"
                    ],
                    "format": "uri"
                  },
                  "date": {
                    "title": "Release Date",
                    "description": "The date of the release. It should match the value of the `date` field of the release. This is used to sort the releases in the list in chronological order.",
                    "type": "string",
                    "format": "date-time"
                  },
                  "tag": {
                    "title": "Release Tag",
                    "description": "The tags of the release. It should match the value of the `tag` field of the release. This provides additional context when reviewing a record to see what types of releases are included for this ocid.",
                    "type": "array",
                    "items": {
                      "type": "string",
                      "enum": [
                        "planning",
                        "planningUpdate",
                        "tender",
                        "tenderAmendment",
                        "tenderUpdate",
                        "tenderCancellation",
                        "award",
                        "awardUpdate",
                        "awardCancellation",
                        "contract",
                        "contractUpdate",
                        "contractAmendment",
                        "implementation",
                        "implementationUpdate",
                        "contractTermination",
                        "compiled"
                      ]
                    },
                    "codelist": "releaseTag.csv",
                    "openCodelist": false,
                    "minItems": 1
                  }
                },
                "required": [
                  "url",
                  "date"
                ]
              },
              "minItems": 1
            },
            {
              "title": "Embedded releases",
              "description": "A list of releases, with all the data. The releases MUST be sorted into date order in the array, from oldest (at position 0) to newest (last).",
              "type": "array",
              "items": {
                "$ref": "https://standard.open-contracting.org/schema/1__1__5/release-schema.json"
              },
              "minItems": 1
            }
          ]
        },
        "compiledRelease": {
          "title": "Compiled release",
          "description": "This is the latest version of all the contracting data, it has the same schema as an open contracting release.",
          "$ref": "https://standard.open-contracting.org/schema/1__1__5/release-schema.json"
        },
        "versionedRelease": {
          "title": "Versioned release",
          "description": "This contains the history of all the data in the compiled release.",
          "$ref": "https://standard.open-contracting.org/schema/1__1__5/versioned-release-validation-schema.json"
        }
      },
      "required": [
        "ocid",
        "releases"
      ]
    }
  }
}
},{}],29:[function(require,module,exports){
module.exports={
  "id": "https://standard.open-contracting.org/schema/1__1__5/release-package-schema.json",
  "$schema": "http://json-schema.org/draft-04/schema#",
  "title": "Schema for an Open Contracting Release Package",
  "description": "The release package contains a list of releases along with some publishing metadata.",
  "type": "object",
  "required": [
    "uri",
    "publisher",
    "publishedDate",
    "releases",
    "version"
  ],
  "properties": {
    "uri": {
      "title": "Package identifier",
      "description": "The URI of this package that identifies it uniquely in the world. Recommended practice is to use a dereferenceable URI, where a persistent copy of this package is available.",
      "type": "string",
      "format": "uri"
    },
    "version": {
      "title": "OCDS schema version",
      "description": "The version of the OCDS schema used in this package, expressed as major.minor For example: 1.0 or 1.1",
      "type": "string",
      "pattern": "^(\\d+\\.)(\\d+)$"
    },
    "extensions": {
      "title": "OCDS extensions",
      "description": "An array of OCDS extensions used in this package, in which each array item is the URL of an extension.json file.",
      "type": "array",
      "items": {
        "type": "string",
        "format": "uri"
      }
    },
    "publishedDate": {
      "title": "Published date",
      "description": "The date that this package was published. If this package is generated 'on demand', this date should reflect the date of the last change to the underlying contents of the package.",
      "type": "string",
      "format": "date-time"
    },
    "releases": {
      "title": "Releases",
      "description": "An array of one or more OCDS releases.",
      "type": "array",
      "minItems": 1,
      "items": {
        "$ref": "https://standard.open-contracting.org/schema/1__1__5/release-schema.json"
      },
      "uniqueItems": true
    },
    "publisher": {
      "title": "Publisher",
      "description": "Information to uniquely identify the publisher of this package.",
      "type": "object",
      "properties": {
        "name": {
          "title": "Name",
          "description": "The name of the organization or department responsible for publishing this data.",
          "type": "string"
        },
        "scheme": {
          "title": "Scheme",
          "description": "The scheme that holds the unique identifiers used to identify the item being identified.",
          "type": [
            "string",
            "null"
          ]
        },
        "uid": {
          "title": "uid",
          "description": "The unique ID for this entity under the given ID scheme.",
          "type": [
            "string",
            "null"
          ]
        },
        "uri": {
          "title": "URI",
          "description": "A URI to identify the publisher.",
          "type": [
            "string",
            "null"
          ],
          "format": "uri"
        }
      },
      "required": [
        "name"
      ]
    },
    "license": {
      "title": "License",
      "description": "A link to the license that applies to the data in this package. A Public Domain Dedication or [Open Definition Conformant](http://opendefinition.org/licenses/) license is recommended. The canonical URI of the license should be used. Documents linked from this file may be under other license conditions.",
      "type": [
        "string",
        "null"
      ],
      "format": "uri"
    },
    "publicationPolicy": {
      "title": "Publication policy",
      "description": "A link to a document describing the publishers [publication policy](https://standard.open-contracting.org/{{version}}/{{lang}}/implementation/publication_policy/).",
      "type": [
        "string",
        "null"
      ],
      "format": "uri"
    }
  }
}
},{}],30:[function(require,module,exports){
module.exports={
  "id": "https://standard.open-contracting.org/schema/1__1__5/release-schema.json",
  "$schema": "http://json-schema.org/draft-04/schema#",
  "title": "Schema for an Open Contracting Release",
  "description": "Each release provides data about a single contracting process at a particular point in time. Releases can be used to notify users of new tenders, awards, contracts and other updates. Releases may repeat or update information provided previously in this contracting process. One contracting process may have many releases. A 'record' of a contracting process follows the same structure as a release, but combines information from multiple points in time into a single summary.",
  "type": "object",
  "properties": {
    "ocid": {
      "title": "Open Contracting ID",
      "description": "A globally unique identifier for this Open Contracting Process. Composed of an ocid prefix and an identifier for the contracting process. For more information see the [Open Contracting Identifier guidance](https://standard.open-contracting.org/{{version}}/{{lang}}/schema/identifiers/)",
      "type": "string",
      "minLength": 1
    },
    "id": {
      "title": "Release ID",
      "description": "An identifier for this particular release of information. A release identifier must be unique within the scope of its related contracting process (defined by a common ocid). A release identifier must not contain the # character.",
      "type": "string",
      "minLength": 1,
      "omitWhenMerged": true
    },
    "date": {
      "title": "Release Date",
      "description": "The date on which the information contained in the release was first recorded in, or published by, any system.",
      "type": "string",
      "format": "date-time",
      "omitWhenMerged": true
    },
    "tag": {
      "title": "Release Tag",
      "description": "One or more values from the closed [releaseTag](https://standard.open-contracting.org/{{version}}/{{lang}}/schema/codelists/#release-tag) codelist. Tags can be used to filter releases and to understand the kind of information that releases might contain.",
      "type": "array",
      "items": {
        "type": "string",
        "enum": [
          "planning",
          "planningUpdate",
          "tender",
          "tenderAmendment",
          "tenderUpdate",
          "tenderCancellation",
          "award",
          "awardUpdate",
          "awardCancellation",
          "contract",
          "contractUpdate",
          "contractAmendment",
          "implementation",
          "implementationUpdate",
          "contractTermination",
          "compiled"
        ]
      },
      "codelist": "releaseTag.csv",
      "openCodelist": false,
      "minItems": 1,
      "omitWhenMerged": true
    },
    "initiationType": {
      "title": "Initiation type",
      "description": "The type of initiation process used for this contract, from the closed [initiationType](https://standard.open-contracting.org/{{version}}/{{lang}}/schema/codelists/#initiation-type) codelist.",
      "type": "string",
      "enum": [
        "tender"
      ],
      "codelist": "initiationType.csv",
      "openCodelist": false
    },
    "parties": {
      "title": "Parties",
      "description": "Information on the parties (organizations, economic operators and other participants) who are involved in the contracting process and their roles, e.g. buyer, procuring entity, supplier etc. Organization references elsewhere in the schema are used to refer back to this entries in this list.",
      "type": "array",
      "items": {
        "$ref": "#/definitions/Organization"
      },
      "uniqueItems": true
    },
    "buyer": {
      "title": "Buyer",
      "description": "A buyer is an entity whose budget will be used to pay for goods, works or services related to a contract. This may be different from the procuring entity who may be specified in the tender data.",
      "$ref": "#/definitions/OrganizationReference"
    },
    "planning": {
      "title": "Planning",
      "description": "Information from the planning phase of the contracting process. This includes information related to the process of deciding what to contract, when and how.",
      "$ref": "#/definitions/Planning"
    },
    "tender": {
      "title": "Tender",
      "description": "The activities undertaken in order to enter into a contract.",
      "$ref": "#/definitions/Tender"
    },
    "awards": {
      "title": "Awards",
      "description": "Information from the award phase of the contracting process. There can be more than one award per contracting process e.g. because the contract is split among different providers, or because it is a standing offer.",
      "type": "array",
      "items": {
        "$ref": "#/definitions/Award"
      },
      "uniqueItems": true
    },
    "contracts": {
      "title": "Contracts",
      "description": "Information from the contract creation phase of the procurement process.",
      "type": "array",
      "items": {
        "$ref": "#/definitions/Contract"
      },
      "uniqueItems": true
    },
    "language": {
      "title": "Release language",
      "description": "The default language of the data using either two-letter [ISO639-1](https://en.wikipedia.org/wiki/List_of_ISO_639-1_codes), or extended [BCP47 language tags](http://www.w3.org/International/articles/language-tags/). The use of lowercase two-letter codes from [ISO639-1](https://en.wikipedia.org/wiki/List_of_ISO_639-1_codes) is recommended.",
      "type": [
        "string",
        "null"
      ],
      "default": "en"
    },
    "relatedProcesses": {
      "uniqueItems": true,
      "items": {
        "$ref": "#/definitions/RelatedProcess"
      },
      "description": "The details of related processes: for example, if this process follows on from one or more other processes, represented under a separate open contracting identifier (ocid). This is commonly used to relate mini-competitions to their parent frameworks or individual tenders to a broader planning process.",
      "title": "Related processes",
      "type": "array"
    }
  },
  "required": [
    "ocid",
    "id",
    "date",
    "tag",
    "initiationType"
  ],
  "definitions": {
    "Planning": {
      "title": "Planning",
      "description": "Information from the planning phase of the contracting process. Note that many other fields can be filled in a planning release, in the appropriate fields in other schema sections; these would likely be estimates at this stage, e.g. value in tender.",
      "type": "object",
      "properties": {
        "rationale": {
          "title": "Rationale",
          "description": "The rationale for the procurement provided in free text. More detail can be provided in an attached document.",
          "type": [
            "string",
            "null"
          ]
        },
        "budget": {
          "title": "Budget",
          "description": "Details of the budget that funds this contracting process.",
          "$ref": "#/definitions/Budget"
        },
        "documents": {
          "title": "Documents",
          "description": "A list of documents related to the planning process.",
          "type": "array",
          "items": {
            "$ref": "#/definitions/Document"
          }
        },
        "milestones": {
          "title": "Planning milestones",
          "description": "A list of milestones associated with the planning stage.",
          "type": "array",
          "items": {
            "$ref": "#/definitions/Milestone"
          }
        }
      },
      "patternProperties": {
        "^(rationale_(((([A-Za-z]{2,3}(-([A-Za-z]{3}(-[A-Za-z]{3}){0,2}))?)|[A-Za-z]{4}|[A-Za-z]{5,8})(-([A-Za-z]{4}))?(-([A-Za-z]{2}|[0-9]{3}))?(-([A-Za-z0-9]{5,8}|[0-9][A-Za-z0-9]{3}))*(-([0-9A-WY-Za-wy-z](-[A-Za-z0-9]{2,8})+))*(-(x(-[A-Za-z0-9]{1,8})+))?)|(x(-[A-Za-z0-9]{1,8})+)))$": {
          "type": [
            "string",
            "null"
          ]
        }
      }
    },
    "Tender": {
      "title": "Tender",
      "description": "Data regarding tender process - publicly inviting prospective contractors to submit bids for evaluation and selecting a winner or winners.",
      "type": "object",
      "required": [
        "id"
      ],
      "properties": {
        "id": {
          "title": "Tender ID",
          "description": "An identifier for this tender process. This may be the same as the ocid, or may be an internal identifier for this tender.",
          "type": [
            "string",
            "integer"
          ],
          "minLength": 1,
          "versionId": true
        },
        "title": {
          "title": "Tender title",
          "description": "A title for this tender. This will often be used by applications as a headline to attract interest, and to help analysts understand the nature of this procurement.",
          "type": [
            "string",
            "null"
          ]
        },
        "description": {
          "title": "Tender description",
          "description": "A summary description of the tender. This complements any structured information provided using the items array. Descriptions should be short and easy to read. Avoid using ALL CAPS.",
          "type": [
            "string",
            "null"
          ]
        },
        "status": {
          "title": "Tender status",
          "description": "The current status of the tender, from the closed [tenderStatus](https://standard.open-contracting.org/{{version}}/{{lang}}/schema/codelists/#tender-status) codelist.",
          "type": [
            "string",
            "null"
          ],
          "codelist": "tenderStatus.csv",
          "openCodelist": false,
          "enum": [
            "planning",
            "planned",
            "active",
            "cancelled",
            "unsuccessful",
            "complete",
            "withdrawn",
            null
          ]
        },
        "procuringEntity": {
          "title": "Procuring entity",
          "description": "The entity managing the procurement. This may be different from the buyer who pays for, or uses, the items being procured.",
          "$ref": "#/definitions/OrganizationReference"
        },
        "items": {
          "title": "Items to be procured",
          "description": "The goods and services to be purchased, broken into line items wherever possible. Items should not be duplicated, but the quantity specified instead.",
          "type": "array",
          "items": {
            "$ref": "#/definitions/Item"
          },
          "uniqueItems": true
        },
        "value": {
          "title": "Value",
          "description": "The total upper estimated value of the procurement. A negative value indicates that the contracting process may involve payments from the supplier to the buyer (commonly used in concession contracts).",
          "$ref": "#/definitions/Value"
        },
        "minValue": {
          "title": "Minimum value",
          "description": "The minimum estimated value of the procurement.  A negative value indicates that the contracting process may involve payments from the supplier to the buyer (commonly used in concession contracts).",
          "$ref": "#/definitions/Value"
        },
        "procurementMethod": {
          "title": "Procurement method",
          "description": "The procurement method, from the closed [method](https://standard.open-contracting.org/{{version}}/{{lang}}/schema/codelists/#method) codelist.",
          "type": [
            "string",
            "null"
          ],
          "codelist": "method.csv",
          "openCodelist": false,
          "enum": [
            "open",
            "selective",
            "limited",
            "direct",
            null
          ]
        },
        "procurementMethodDetails": {
          "title": "Procurement method details",
          "description": "Additional detail on the procurement method used. This field can be used to provide the local name of the particular procurement method used.",
          "type": [
            "string",
            "null"
          ]
        },
        "procurementMethodRationale": {
          "title": "Procurement method rationale",
          "description": "Rationale for the chosen procurement method. This is especially important to provide a justification in the case of limited tenders or direct awards.",
          "type": [
            "string",
            "null"
          ]
        },
        "mainProcurementCategory": {
          "title": "Main procurement category",
          "description": "The primary category describing the main object of this contracting process, from the closed [procurementCategory](https://standard.open-contracting.org/{{version}}/{{lang}}/schema/codelists/#procurement-category) codelist.",
          "type": [
            "string",
            "null"
          ],
          "codelist": "procurementCategory.csv",
          "openCodelist": false,
          "enum": [
            "goods",
            "works",
            "services",
            null
          ]
        },
        "additionalProcurementCategories": {
          "title": "Additional procurement categories",
          "description": "Any additional categories describing the objects of this contracting process, using the open [extendedProcurementCategory](https://standard.open-contracting.org/{{version}}/{{lang}}/schema/codelists/#extended-procurement-category) codelist.",
          "type": [
            "array",
            "null"
          ],
          "items": {
            "type": "string"
          },
          "codelist": "extendedProcurementCategory.csv",
          "openCodelist": true
        },
        "awardCriteria": {
          "title": "Award criteria",
          "description": "The award criteria for the procurement, using the open [awardCriteria](https://standard.open-contracting.org/{{version}}/{{lang}}/schema/codelists/#award-criteria) codelist.",
          "type": [
            "string",
            "null"
          ],
          "codelist": "awardCriteria.csv",
          "openCodelist": true
        },
        "awardCriteriaDetails": {
          "title": "Award criteria details",
          "description": "Any detailed or further information on the award or selection criteria.",
          "type": [
            "string",
            "null"
          ]
        },
        "submissionMethod": {
          "title": "Submission method",
          "description": "The methods by which bids are submitted, using the open [submissionMethod](https://standard.open-contracting.org/{{version}}/{{lang}}/schema/codelists/#submission-method) codelist.",
          "type": [
            "array",
            "null"
          ],
          "items": {
            "type": "string"
          },
          "codelist": "submissionMethod.csv",
          "openCodelist": true
        },
        "submissionMethodDetails": {
          "title": "Submission method details",
          "description": "Any detailed or further information on the submission method. This can include the address, e-mail address or online service to which bids are submitted, and any special requirements to be followed for submissions.",
          "type": [
            "string",
            "null"
          ]
        },
        "tenderPeriod": {
          "title": "Tender period",
          "description": "The period when the tender is open for submissions. The end date is the closing date for tender submissions.",
          "$ref": "#/definitions/Period"
        },
        "enquiryPeriod": {
          "title": "Enquiry period",
          "description": "The period during which potential bidders may submit questions and requests for clarification to the entity managing procurement. Details of how to submit enquiries should be provided in attached notices, or in submissionMethodDetails. Structured dates for when responses to questions will be made can be provided using tender milestones.",
          "$ref": "#/definitions/Period"
        },
        "hasEnquiries": {
          "title": "Has enquiries?",
          "description": "A true/false field to indicate whether any enquiries were received during the tender process. Structured information on enquiries that were received, and responses to them, can be provided using the enquiries extension.",
          "type": [
            "boolean",
            "null"
          ]
        },
        "eligibilityCriteria": {
          "title": "Eligibility criteria",
          "description": "A description of any eligibility criteria for potential suppliers.",
          "type": [
            "string",
            "null"
          ]
        },
        "awardPeriod": {
          "title": "Evaluation and award period",
          "description": "The period for decision making regarding the contract award. The end date should be the date on which an award decision is due to be finalized. The start date may be used to indicate the start of an evaluation period.",
          "$ref": "#/definitions/Period"
        },
        "contractPeriod": {
          "description": "The period over which the contract is estimated or required to be active. If the tender does not specify explicit dates, the duration field may be used.",
          "title": "Contract period",
          "$ref": "#/definitions/Period"
        },
        "numberOfTenderers": {
          "title": "Number of tenderers",
          "description": "The number of parties who submit a bid.",
          "type": [
            "integer",
            "null"
          ]
        },
        "tenderers": {
          "title": "Tenderers",
          "description": "All parties who submit a bid on a tender. More detailed information on bids and the bidding organization can be provided using the bid extension.",
          "type": "array",
          "items": {
            "$ref": "#/definitions/OrganizationReference"
          },
          "uniqueItems": true
        },
        "documents": {
          "title": "Documents",
          "description": "All documents and attachments related to the tender, including any notices. See the [documentType](https://standard.open-contracting.org/{{version}}/{{lang}}/schema/codelists/#document-type) codelist for details of potential documents to include. Common documents include official legal notices of tender, technical specifications, evaluation criteria, and, as a tender process progresses, clarifications and replies to queries.",
          "type": "array",
          "items": {
            "$ref": "#/definitions/Document"
          }
        },
        "milestones": {
          "title": "Milestones",
          "description": "A list of milestones associated with the tender.",
          "type": "array",
          "items": {
            "$ref": "#/definitions/Milestone"
          }
        },
        "amendments": {
          "description": "A tender amendment is a formal change to the tender, and generally involves the publication of a new tender notice/release. The rationale and a description of the changes made can be provided here.",
          "type": "array",
          "title": "Amendments",
          "items": {
            "$ref": "#/definitions/Amendment"
          }
        },
        "amendment": {
          "title": "Amendment",
          "description": "The use of individual amendment objects has been deprecated. From OCDS 1.1 information should be provided in the amendments array.",
          "$ref": "#/definitions/Amendment",
          "deprecated": {
            "description": "The single amendment object has been deprecated in favour of including amendments in an amendments (plural) array.",
            "deprecatedVersion": "1.1"
          }
        }
      },
      "patternProperties": {
        "^(title_(((([A-Za-z]{2,3}(-([A-Za-z]{3}(-[A-Za-z]{3}){0,2}))?)|[A-Za-z]{4}|[A-Za-z]{5,8})(-([A-Za-z]{4}))?(-([A-Za-z]{2}|[0-9]{3}))?(-([A-Za-z0-9]{5,8}|[0-9][A-Za-z0-9]{3}))*(-([0-9A-WY-Za-wy-z](-[A-Za-z0-9]{2,8})+))*(-(x(-[A-Za-z0-9]{1,8})+))?)|(x(-[A-Za-z0-9]{1,8})+)))$": {
          "type": [
            "string",
            "null"
          ]
        },
        "^(description_(((([A-Za-z]{2,3}(-([A-Za-z]{3}(-[A-Za-z]{3}){0,2}))?)|[A-Za-z]{4}|[A-Za-z]{5,8})(-([A-Za-z]{4}))?(-([A-Za-z]{2}|[0-9]{3}))?(-([A-Za-z0-9]{5,8}|[0-9][A-Za-z0-9]{3}))*(-([0-9A-WY-Za-wy-z](-[A-Za-z0-9]{2,8})+))*(-(x(-[A-Za-z0-9]{1,8})+))?)|(x(-[A-Za-z0-9]{1,8})+)))$": {
          "type": [
            "string",
            "null"
          ]
        },
        "^(procurementMethodRationale_(((([A-Za-z]{2,3}(-([A-Za-z]{3}(-[A-Za-z]{3}){0,2}))?)|[A-Za-z]{4}|[A-Za-z]{5,8})(-([A-Za-z]{4}))?(-([A-Za-z]{2}|[0-9]{3}))?(-([A-Za-z0-9]{5,8}|[0-9][A-Za-z0-9]{3}))*(-([0-9A-WY-Za-wy-z](-[A-Za-z0-9]{2,8})+))*(-(x(-[A-Za-z0-9]{1,8})+))?)|(x(-[A-Za-z0-9]{1,8})+)))$": {
          "type": [
            "string",
            "null"
          ]
        },
        "^(awardCriteriaDetails_(((([A-Za-z]{2,3}(-([A-Za-z]{3}(-[A-Za-z]{3}){0,2}))?)|[A-Za-z]{4}|[A-Za-z]{5,8})(-([A-Za-z]{4}))?(-([A-Za-z]{2}|[0-9]{3}))?(-([A-Za-z0-9]{5,8}|[0-9][A-Za-z0-9]{3}))*(-([0-9A-WY-Za-wy-z](-[A-Za-z0-9]{2,8})+))*(-(x(-[A-Za-z0-9]{1,8})+))?)|(x(-[A-Za-z0-9]{1,8})+)))$": {
          "type": [
            "string",
            "null"
          ]
        },
        "^(submissionMethodDetails_(((([A-Za-z]{2,3}(-([A-Za-z]{3}(-[A-Za-z]{3}){0,2}))?)|[A-Za-z]{4}|[A-Za-z]{5,8})(-([A-Za-z]{4}))?(-([A-Za-z]{2}|[0-9]{3}))?(-([A-Za-z0-9]{5,8}|[0-9][A-Za-z0-9]{3}))*(-([0-9A-WY-Za-wy-z](-[A-Za-z0-9]{2,8})+))*(-(x(-[A-Za-z0-9]{1,8})+))?)|(x(-[A-Za-z0-9]{1,8})+)))$": {
          "type": [
            "string",
            "null"
          ]
        },
        "^(eligibilityCriteria_(((([A-Za-z]{2,3}(-([A-Za-z]{3}(-[A-Za-z]{3}){0,2}))?)|[A-Za-z]{4}|[A-Za-z]{5,8})(-([A-Za-z]{4}))?(-([A-Za-z]{2}|[0-9]{3}))?(-([A-Za-z0-9]{5,8}|[0-9][A-Za-z0-9]{3}))*(-([0-9A-WY-Za-wy-z](-[A-Za-z0-9]{2,8})+))*(-(x(-[A-Za-z0-9]{1,8})+))?)|(x(-[A-Za-z0-9]{1,8})+)))$": {
          "type": [
            "string",
            "null"
          ]
        }
      }
    },
    "Award": {
      "title": "Award",
      "description": "An award for the given procurement. There can be more than one award per contracting process e.g. because the contract is split among different providers, or because it is a standing offer.",
      "type": "object",
      "required": [
        "id"
      ],
      "properties": {
        "id": {
          "title": "Award ID",
          "description": "The identifier for this award. It must be unique and must not change within the Open Contracting Process it is part of (defined by a single ocid). See the [identifier guidance](https://standard.open-contracting.org/{{version}}/{{lang}}/schema/identifiers/) for further details.",
          "type": [
            "string",
            "integer"
          ],
          "minLength": 1
        },
        "title": {
          "title": "Title",
          "description": "Award title",
          "type": [
            "string",
            "null"
          ]
        },
        "description": {
          "title": "Description",
          "description": "Award description",
          "type": [
            "string",
            "null"
          ]
        },
        "status": {
          "title": "Award status",
          "description": "The current status of the award, from the closed [awardStatus](https://standard.open-contracting.org/{{version}}/{{lang}}/schema/codelists/#award-status) codelist.",
          "type": [
            "string",
            "null"
          ],
          "enum": [
            "pending",
            "active",
            "cancelled",
            "unsuccessful",
            null
          ],
          "codelist": "awardStatus.csv",
          "openCodelist": false
        },
        "date": {
          "title": "Award date",
          "description": "The date of the contract award. This is usually the date on which a decision to award was made.",
          "type": [
            "string",
            "null"
          ],
          "format": "date-time"
        },
        "value": {
          "title": "Value",
          "description": "The total value of this award. In the case of a framework contract this may be the total estimated lifetime value, or maximum value, of the agreement. There may be more than one award per procurement. A negative value indicates that the award may involve payments from the supplier to the buyer (commonly used in concession contracts).",
          "$ref": "#/definitions/Value"
        },
        "suppliers": {
          "title": "Suppliers",
          "description": "The suppliers awarded this award. If different suppliers have been awarded different items or values, these should be split into separate award blocks.",
          "type": "array",
          "items": {
            "$ref": "#/definitions/OrganizationReference"
          },
          "uniqueItems": true
        },
        "items": {
          "title": "Items awarded",
          "description": "The goods and services awarded in this award, broken into line items wherever possible. Items should not be duplicated, but the quantity specified instead.",
          "type": "array",
          "minItems": 1,
          "items": {
            "$ref": "#/definitions/Item"
          },
          "uniqueItems": true
        },
        "contractPeriod": {
          "title": "Contract period",
          "description": "The period for which the contract has been awarded.",
          "$ref": "#/definitions/Period"
        },
        "documents": {
          "title": "Documents",
          "description": "All documents and attachments related to the award, including any notices.",
          "type": "array",
          "items": {
            "$ref": "#/definitions/Document"
          },
          "uniqueItems": true
        },
        "amendments": {
          "description": "An award amendment is a formal change to the details of the award, and generally involves the publication of a new award notice/release. The rationale and a description of the changes made can be provided here.",
          "type": "array",
          "title": "Amendments",
          "items": {
            "$ref": "#/definitions/Amendment"
          }
        },
        "amendment": {
          "title": "Amendment",
          "description": "The use of individual amendment objects has been deprecated. From OCDS 1.1 information should be provided in the amendments array.",
          "$ref": "#/definitions/Amendment",
          "deprecated": {
            "description": "The single amendment object has been deprecated in favour of including amendments in an amendments (plural) array.",
            "deprecatedVersion": "1.1"
          }
        }
      },
      "patternProperties": {
        "^(title_(((([A-Za-z]{2,3}(-([A-Za-z]{3}(-[A-Za-z]{3}){0,2}))?)|[A-Za-z]{4}|[A-Za-z]{5,8})(-([A-Za-z]{4}))?(-([A-Za-z]{2}|[0-9]{3}))?(-([A-Za-z0-9]{5,8}|[0-9][A-Za-z0-9]{3}))*(-([0-9A-WY-Za-wy-z](-[A-Za-z0-9]{2,8})+))*(-(x(-[A-Za-z0-9]{1,8})+))?)|(x(-[A-Za-z0-9]{1,8})+)))$": {
          "type": [
            "string",
            "null"
          ]
        },
        "^(description_(((([A-Za-z]{2,3}(-([A-Za-z]{3}(-[A-Za-z]{3}){0,2}))?)|[A-Za-z]{4}|[A-Za-z]{5,8})(-([A-Za-z]{4}))?(-([A-Za-z]{2}|[0-9]{3}))?(-([A-Za-z0-9]{5,8}|[0-9][A-Za-z0-9]{3}))*(-([0-9A-WY-Za-wy-z](-[A-Za-z0-9]{2,8})+))*(-(x(-[A-Za-z0-9]{1,8})+))?)|(x(-[A-Za-z0-9]{1,8})+)))$": {
          "type": [
            "string",
            "null"
          ]
        }
      }
    },
    "Contract": {
      "type": "object",
      "title": "Contract",
      "description": "Information regarding the signed contract between the buyer and supplier(s).",
      "required": [
        "id",
        "awardID"
      ],
      "properties": {
        "id": {
          "title": "Contract ID",
          "description": "The identifier for this contract. It must be unique and must not change within the Open Contracting Process it is part of (defined by a single ocid). See the [identifier guidance](https://standard.open-contracting.org/{{version}}/{{lang}}/schema/identifiers/) for further details.",
          "type": [
            "string",
            "integer"
          ],
          "minLength": 1
        },
        "awardID": {
          "title": "Award ID",
          "description": "The award.id against which this contract is being issued.",
          "type": [
            "string",
            "integer"
          ],
          "minLength": 1
        },
        "title": {
          "title": "Contract title",
          "description": "Contract title",
          "type": [
            "string",
            "null"
          ]
        },
        "description": {
          "title": "Contract description",
          "description": "Contract description",
          "type": [
            "string",
            "null"
          ]
        },
        "status": {
          "title": "Contract status",
          "description": "The current status of the contract, from the closed [contractStatus](https://standard.open-contracting.org/{{version}}/{{lang}}/schema/codelists/#contract-status) codelist.",
          "type": [
            "string",
            "null"
          ],
          "enum": [
            "pending",
            "active",
            "cancelled",
            "terminated",
            null
          ],
          "codelist": "contractStatus.csv",
          "openCodelist": false
        },
        "period": {
          "title": "Period",
          "description": "The start and end date for the contract.",
          "$ref": "#/definitions/Period"
        },
        "value": {
          "title": "Value",
          "description": "The total value of this contract. A negative value indicates that the contract will involve payments from the supplier to the buyer (commonly used in concession contracts).",
          "$ref": "#/definitions/Value"
        },
        "items": {
          "title": "Items contracted",
          "description": "The goods, services, and any intangible outcomes in this contract. Note: If the items are the same as the award do not repeat.",
          "type": "array",
          "minItems": 1,
          "items": {
            "$ref": "#/definitions/Item"
          },
          "uniqueItems": true
        },
        "dateSigned": {
          "title": "Date signed",
          "description": "The date the contract was signed. In the case of multiple signatures, the date of the last signature.",
          "type": [
            "string",
            "null"
          ],
          "format": "date-time"
        },
        "documents": {
          "title": "Documents",
          "description": "All documents and attachments related to the contract, including any notices.",
          "type": "array",
          "items": {
            "$ref": "#/definitions/Document"
          },
          "uniqueItems": true
        },
        "implementation": {
          "title": "Implementation",
          "description": "Information related to the implementation of the contract in accordance with the obligations laid out therein.",
          "$ref": "#/definitions/Implementation"
        },
        "relatedProcesses": {
          "uniqueItems": true,
          "items": {
            "$ref": "#/definitions/RelatedProcess"
          },
          "description": "The details of related processes: for example, if this process is followed by one or more contracting processes, represented under a separate open contracting identifier (ocid). This is commonly used to refer to subcontracts and to renewal or replacement processes for this contract.",
          "title": "Related processes",
          "type": "array"
        },
        "milestones": {
          "title": "Contract milestones",
          "description": "A list of milestones associated with the finalization of this contract.",
          "type": "array",
          "items": {
            "$ref": "#/definitions/Milestone"
          }
        },
        "amendments": {
          "description": "A contract amendment is a formal change to, or extension of, a contract, and generally involves the publication of a new contract notice/release, or some other documents detailing the change. The rationale and a description of the changes made can be provided here.",
          "type": "array",
          "title": "Amendments",
          "items": {
            "$ref": "#/definitions/Amendment"
          }
        },
        "amendment": {
          "title": "Amendment",
          "description": "The use of individual amendment objects has been deprecated. From OCDS 1.1 information should be provided in the amendments array.",
          "$ref": "#/definitions/Amendment",
          "deprecated": {
            "description": "The single amendment object has been deprecated in favour of including amendments in an amendments (plural) array.",
            "deprecatedVersion": "1.1"
          }
        }
      },
      "patternProperties": {
        "^(title_(((([A-Za-z]{2,3}(-([A-Za-z]{3}(-[A-Za-z]{3}){0,2}))?)|[A-Za-z]{4}|[A-Za-z]{5,8})(-([A-Za-z]{4}))?(-([A-Za-z]{2}|[0-9]{3}))?(-([A-Za-z0-9]{5,8}|[0-9][A-Za-z0-9]{3}))*(-([0-9A-WY-Za-wy-z](-[A-Za-z0-9]{2,8})+))*(-(x(-[A-Za-z0-9]{1,8})+))?)|(x(-[A-Za-z0-9]{1,8})+)))$": {
          "type": [
            "string",
            "null"
          ]
        },
        "^(description_(((([A-Za-z]{2,3}(-([A-Za-z]{3}(-[A-Za-z]{3}){0,2}))?)|[A-Za-z]{4}|[A-Za-z]{5,8})(-([A-Za-z]{4}))?(-([A-Za-z]{2}|[0-9]{3}))?(-([A-Za-z0-9]{5,8}|[0-9][A-Za-z0-9]{3}))*(-([0-9A-WY-Za-wy-z](-[A-Za-z0-9]{2,8})+))*(-(x(-[A-Za-z0-9]{1,8})+))?)|(x(-[A-Za-z0-9]{1,8})+)))$": {
          "type": [
            "string",
            "null"
          ]
        }
      }
    },
    "Implementation": {
      "type": "object",
      "title": "Implementation",
      "description": "Information during the performance / implementation stage of the contract.",
      "properties": {
        "transactions": {
          "title": "Transactions",
          "description": "A list of the spending transactions made against this contract",
          "type": "array",
          "items": {
            "$ref": "#/definitions/Transaction"
          },
          "uniqueItems": true
        },
        "milestones": {
          "title": "Milestones",
          "description": "As milestones are completed, the milestone's status and dates should be updated.",
          "type": "array",
          "items": {
            "$ref": "#/definitions/Milestone"
          },
          "uniqueItems": true
        },
        "documents": {
          "title": "Documents",
          "description": "Documents and reports that are part of the implementation phase e.g. audit and evaluation reports.",
          "type": "array",
          "items": {
            "$ref": "#/definitions/Document"
          },
          "uniqueItems": true
        }
      }
    },
    "Milestone": {
      "title": "Milestone",
      "description": "The milestone block can be used to represent a wide variety of events in the lifetime of a contracting process.",
      "type": "object",
      "required": [
        "id"
      ],
      "properties": {
        "id": {
          "title": "ID",
          "description": "A local identifier for this milestone, unique within this block. This field is used to keep track of multiple revisions of a milestone through the compilation from release to record mechanism.",
          "type": [
            "string",
            "integer"
          ],
          "minLength": 1
        },
        "title": {
          "title": "Title",
          "description": "Milestone title",
          "type": [
            "string",
            "null"
          ]
        },
        "type": {
          "title": "Milestone type",
          "description": "The nature of the milestone, using the open [milestoneType](https://standard.open-contracting.org/{{version}}/{{lang}}/schema/codelists/#milestone-type) codelist.",
          "type": [
            "string",
            "null"
          ],
          "codelist": "milestoneType.csv",
          "openCodelist": true
        },
        "description": {
          "title": "Description",
          "description": "A description of the milestone.",
          "type": [
            "string",
            "null"
          ]
        },
        "code": {
          "title": "Milestone code",
          "description": "Milestone codes can be used to track specific events that take place for a particular kind of contracting process. For example, a code of 'approvalLetter' can be used to allow applications to understand this milestone represents the date an approvalLetter is due or signed.",
          "type": [
            "string",
            "null"
          ]
        },
        "dueDate": {
          "title": "Due date",
          "description": "The date the milestone is due.",
          "type": [
            "string",
            "null"
          ],
          "format": "date-time"
        },
        "dateMet": {
          "format": "date-time",
          "title": "Date met",
          "description": "The date on which the milestone was met.",
          "type": [
            "string",
            "null"
          ]
        },
        "dateModified": {
          "title": "Date modified",
          "description": "The date the milestone was last reviewed or modified and the status was altered or confirmed to still be correct.",
          "type": [
            "string",
            "null"
          ],
          "format": "date-time"
        },
        "status": {
          "title": "Status",
          "description": "The status that was realized on the date provided in `dateModified`, from the closed [milestoneStatus](https://standard.open-contracting.org/{{version}}/{{lang}}/schema/codelists/#milestone-status) codelist.",
          "type": [
            "string",
            "null"
          ],
          "enum": [
            "scheduled",
            "met",
            "notMet",
            "partiallyMet",
            null
          ],
          "codelist": "milestoneStatus.csv",
          "openCodelist": false
        },
        "documents": {
          "title": "Documents",
          "description": "List of documents associated with this milestone (Deprecated in 1.1).",
          "type": "array",
          "deprecated": {
            "deprecatedVersion": "1.1",
            "description": "Inclusion of documents at the milestone level is now deprecated. Documentation should be attached in the tender, award, contract or implementation sections, and titles and descriptions used to highlight the related milestone. Publishers who wish to continue to provide documents at the milestone level should explicitly declare this by using the milestone documents extension."
          },
          "items": {
            "$ref": "#/definitions/Document"
          },
          "uniqueItems": true
        }
      },
      "patternProperties": {
        "^(title_(((([A-Za-z]{2,3}(-([A-Za-z]{3}(-[A-Za-z]{3}){0,2}))?)|[A-Za-z]{4}|[A-Za-z]{5,8})(-([A-Za-z]{4}))?(-([A-Za-z]{2}|[0-9]{3}))?(-([A-Za-z0-9]{5,8}|[0-9][A-Za-z0-9]{3}))*(-([0-9A-WY-Za-wy-z](-[A-Za-z0-9]{2,8})+))*(-(x(-[A-Za-z0-9]{1,8})+))?)|(x(-[A-Za-z0-9]{1,8})+)))$": {
          "type": [
            "string",
            "null"
          ]
        },
        "^(description_(((([A-Za-z]{2,3}(-([A-Za-z]{3}(-[A-Za-z]{3}){0,2}))?)|[A-Za-z]{4}|[A-Za-z]{5,8})(-([A-Za-z]{4}))?(-([A-Za-z]{2}|[0-9]{3}))?(-([A-Za-z0-9]{5,8}|[0-9][A-Za-z0-9]{3}))*(-([0-9A-WY-Za-wy-z](-[A-Za-z0-9]{2,8})+))*(-(x(-[A-Za-z0-9]{1,8})+))?)|(x(-[A-Za-z0-9]{1,8})+)))$": {
          "type": [
            "string",
            "null"
          ]
        }
      }
    },
    "Document": {
      "type": "object",
      "title": "Document",
      "description": "Links to, or descriptions of, external documents can be attached at various locations within the standard. Documents can be supporting information, formal notices, downloadable forms, or any other kind of resource that ought to be made public as part of full open contracting.",
      "required": [
        "id"
      ],
      "properties": {
        "id": {
          "title": "ID",
          "description": "A local, unique identifier for this document. This field is used to keep track of multiple revisions of a document through the compilation from release to record mechanism.",
          "type": [
            "string",
            "integer"
          ],
          "minLength": 1
        },
        "documentType": {
          "title": "Document type",
          "description": "A classification of the document described, using the open [documentType](https://standard.open-contracting.org/{{version}}/{{lang}}/schema/codelists/#document-type) codelist.",
          "type": [
            "string",
            "null"
          ],
          "codelist": "documentType.csv",
          "openCodelist": true
        },
        "title": {
          "title": "Title",
          "description": "The document title.",
          "type": [
            "string",
            "null"
          ]
        },
        "description": {
          "title": "Description",
          "description": "A short description of the document. Descriptions are recommended to not exceed 250 words. In the event the document is not accessible online, the description field can be used to describe arrangements for obtaining a copy of the document.",
          "type": [
            "string",
            "null"
          ]
        },
        "url": {
          "title": "URL",
          "description": "A direct link to the document or attachment. The server providing access to this document ought to be configured to correctly report the document mime type.",
          "type": [
            "string",
            "null"
          ],
          "format": "uri"
        },
        "datePublished": {
          "title": "Date published",
          "description": "The date on which the document was first published. This is particularly important for legally important documents such as notices of a tender.",
          "type": [
            "string",
            "null"
          ],
          "format": "date-time"
        },
        "dateModified": {
          "title": "Date modified",
          "description": "Date that the document was last modified",
          "type": [
            "string",
            "null"
          ],
          "format": "date-time"
        },
        "format": {
          "title": "Format",
          "description": "The format of the document, using the open [IANA Media Types](http://www.iana.org/assignments/media-types/) codelist (see the values in the 'Template' column), or using the 'offline/print' code if the described document is published offline. For example, web pages have a format of 'text/html'.",
          "type": [
            "string",
            "null"
          ]
        },
        "language": {
          "title": "Language",
          "description": "The language of the linked document using either two-letter [ISO639-1](https://en.wikipedia.org/wiki/List_of_ISO_639-1_codes), or extended [BCP47 language tags](http://www.w3.org/International/articles/language-tags/). The use of lowercase two-letter codes from [ISO639-1](https://en.wikipedia.org/wiki/List_of_ISO_639-1_codes) is recommended unless there is a clear user need for distinguishing the language subtype.",
          "type": [
            "string",
            "null"
          ]
        }
      },
      "patternProperties": {
        "^(title_(((([A-Za-z]{2,3}(-([A-Za-z]{3}(-[A-Za-z]{3}){0,2}))?)|[A-Za-z]{4}|[A-Za-z]{5,8})(-([A-Za-z]{4}))?(-([A-Za-z]{2}|[0-9]{3}))?(-([A-Za-z0-9]{5,8}|[0-9][A-Za-z0-9]{3}))*(-([0-9A-WY-Za-wy-z](-[A-Za-z0-9]{2,8})+))*(-(x(-[A-Za-z0-9]{1,8})+))?)|(x(-[A-Za-z0-9]{1,8})+)))$": {
          "type": [
            "string",
            "null"
          ]
        },
        "^(description_(((([A-Za-z]{2,3}(-([A-Za-z]{3}(-[A-Za-z]{3}){0,2}))?)|[A-Za-z]{4}|[A-Za-z]{5,8})(-([A-Za-z]{4}))?(-([A-Za-z]{2}|[0-9]{3}))?(-([A-Za-z0-9]{5,8}|[0-9][A-Za-z0-9]{3}))*(-([0-9A-WY-Za-wy-z](-[A-Za-z0-9]{2,8})+))*(-(x(-[A-Za-z0-9]{1,8})+))?)|(x(-[A-Za-z0-9]{1,8})+)))$": {
          "type": [
            "string",
            "null"
          ]
        }
      }
    },
    "Budget": {
      "type": "object",
      "title": "Budget information",
      "description": "This section contains information about the budget line, and associated projects, through which this contracting process is funded. It draws upon the data model of the [Fiscal Data Package](https://frictionlessdata.io/specs/fiscal-data-package/), and should be used to cross-reference to more detailed information held using a Budget Data Package, or, where no linked Budget Data Package is available, to provide enough information to allow a user to manually or automatically cross-reference with another published source of budget and project information.",
      "properties": {
        "id": {
          "title": "ID",
          "description": "An identifier for the budget line item which provides funds for this contracting process. This identifier should be possible to cross-reference against the provided data source.",
          "type": [
            "string",
            "integer",
            "null"
          ]
        },
        "description": {
          "title": "Budget Source",
          "description": "A short free text description of the budget source. May be used to provide the title of the budget line, or the programme used to fund this project.",
          "type": [
            "string",
            "null"
          ]
        },
        "amount": {
          "title": "Amount",
          "description": "The value reserved in the budget for this contracting process. A negative value indicates anticipated income to the budget as a result of this contracting process, rather than expenditure. Where the budget is drawn from multiple sources, the budget breakdown extension can be used.",
          "$ref": "#/definitions/Value"
        },
        "project": {
          "title": "Project title",
          "description": "The name of the project through which this contracting process is funded (if applicable). Some organizations maintain a registry of projects, and the data should use the name by which the project is known in that registry. No translation option is offered for this string, as translated values can be provided in third-party data, linked from the data source above.",
          "type": [
            "string",
            "null"
          ]
        },
        "projectID": {
          "title": "Project identifier",
          "description": "An external identifier for the project that this contracting process forms part of, or is funded via (if applicable). Some organizations maintain a registry of projects, and the data should use the identifier from the relevant registry of projects.",
          "type": [
            "string",
            "integer",
            "null"
          ]
        },
        "uri": {
          "title": "Linked budget information",
          "description": "A URI pointing directly to a machine-readable record about the budget line-item or line-items that fund this contracting process. Information can be provided in a range of formats, including using IATI, the Open Fiscal Data Standard or any other standard which provides structured data on budget sources. Human readable documents can be included using the planning.documents block.",
          "type": [
            "string",
            "null"
          ],
          "format": "uri"
        },
        "source": {
          "title": "Data Source",
          "description": "(Deprecated in 1.1) Used to point either to a corresponding Budget Data Package, or to a machine or human-readable source where users can find further information on the budget line item identifiers, or project identifiers, provided here.",
          "type": [
            "string",
            "null"
          ],
          "deprecated": {
            "deprecatedVersion": "1.1",
            "description": "The budget data source field was intended to link to machine-readable data about the budget for a contracting process, but has been widely mis-used to provide free-text descriptions of budget providers. As a result, it has been removed from version 1.1. budget/uri can be used to provide a link to machine-readable budget information, and budget/description can be used to provide human-readable information on the budget source."
          },
          "format": "uri"
        }
      },
      "patternProperties": {
        "^(source_(((([A-Za-z]{2,3}(-([A-Za-z]{3}(-[A-Za-z]{3}){0,2}))?)|[A-Za-z]{4}|[A-Za-z]{5,8})(-([A-Za-z]{4}))?(-([A-Za-z]{2}|[0-9]{3}))?(-([A-Za-z0-9]{5,8}|[0-9][A-Za-z0-9]{3}))*(-([0-9A-WY-Za-wy-z](-[A-Za-z0-9]{2,8})+))*(-(x(-[A-Za-z0-9]{1,8})+))?)|(x(-[A-Za-z0-9]{1,8})+)))$": {
          "type": [
            "string",
            "null"
          ]
        },
        "^(description_(((([A-Za-z]{2,3}(-([A-Za-z]{3}(-[A-Za-z]{3}){0,2}))?)|[A-Za-z]{4}|[A-Za-z]{5,8})(-([A-Za-z]{4}))?(-([A-Za-z]{2}|[0-9]{3}))?(-([A-Za-z0-9]{5,8}|[0-9][A-Za-z0-9]{3}))*(-([0-9A-WY-Za-wy-z](-[A-Za-z0-9]{2,8})+))*(-(x(-[A-Za-z0-9]{1,8})+))?)|(x(-[A-Za-z0-9]{1,8})+)))$": {
          "type": [
            "string",
            "null"
          ]
        },
        "^(project_(((([A-Za-z]{2,3}(-([A-Za-z]{3}(-[A-Za-z]{3}){0,2}))?)|[A-Za-z]{4}|[A-Za-z]{5,8})(-([A-Za-z]{4}))?(-([A-Za-z]{2}|[0-9]{3}))?(-([A-Za-z0-9]{5,8}|[0-9][A-Za-z0-9]{3}))*(-([0-9A-WY-Za-wy-z](-[A-Za-z0-9]{2,8})+))*(-(x(-[A-Za-z0-9]{1,8})+))?)|(x(-[A-Za-z0-9]{1,8})+)))$": {
          "type": [
            "string",
            "null"
          ]
        }
      }
    },
    "Transaction": {
      "type": "object",
      "title": "Transaction information",
      "description": "A spending transaction related to the contracting process. Draws upon the data models of the [Fiscal Data Package](https://frictionlessdata.io/specs/fiscal-data-package/) and the [International Aid Transparency Initiative](http://iatistandard.org/activity-standard/iati-activities/iati-activity/transaction/) and should be used to cross-reference to more detailed information held using a Fiscal Data Package, IATI file, or to provide enough information to allow a user to manually or automatically cross-reference with some other published source of transactional spending data.",
      "required": [
        "id"
      ],
      "properties": {
        "id": {
          "title": "ID",
          "description": "A unique identifier for this transaction. This identifier should be possible to cross-reference against the provided data source. For IATI this is the transaction reference.",
          "type": [
            "string",
            "integer"
          ],
          "minLength": 1
        },
        "source": {
          "title": "Data source",
          "description": "Used to point either to a corresponding Fiscal Data Package, IATI file, or machine or human-readable source where users can find further information on the budget line item identifiers, or project identifiers, provided here.",
          "type": [
            "string",
            "null"
          ],
          "format": "uri"
        },
        "date": {
          "title": "Date",
          "description": "The date of the transaction",
          "type": [
            "string",
            "null"
          ],
          "format": "date-time"
        },
        "value": {
          "$ref": "#/definitions/Value",
          "title": "Value",
          "description": "The value of the transaction."
        },
        "payer": {
          "$ref": "#/definitions/OrganizationReference",
          "title": "Payer",
          "description": "An organization reference for the organization from which the funds in this transaction originate."
        },
        "payee": {
          "$ref": "#/definitions/OrganizationReference",
          "title": "Payee",
          "description": "An organization reference for the organization which receives the funds in this transaction."
        },
        "uri": {
          "title": "Linked spending information",
          "description": "A URI pointing directly to a machine-readable record about this spending transaction.",
          "type": [
            "string",
            "null"
          ],
          "format": "uri"
        },
        "amount": {
          "title": "Amount",
          "description": "(Deprecated in 1.1. Use transaction.value instead) The value of the transaction. A negative value indicates a refund or correction.",
          "$ref": "#/definitions/Value",
          "deprecated": {
            "description": "This field has been replaced by the `transaction.value` field for consistency with the use of value and amount elsewhere in the standard.",
            "deprecatedVersion": "1.1"
          }
        },
        "providerOrganization": {
          "title": "Provider organization",
          "description": "(Deprecated in 1.1. Use transaction.payer instead.) The Organization Identifier for the organization from which the funds in this transaction originate. Expressed following the Organizational Identifier standard - consult the documentation and the codelist.",
          "$ref": "#/definitions/Identifier",
          "deprecated": {
            "description": "This field has been replaced by the `transaction.payer` field to resolve ambiguity arising from 'provider' being interpreted as relating to the goods or services procured rather than the flow of funds between the parties.",
            "deprecatedVersion": "1.1"
          }
        },
        "receiverOrganization": {
          "title": "Receiver organization",
          "description": "(Deprecated in 1.1. Use transaction.payee instead). The Organization Identifier for the organization which receives the funds in this transaction. Expressed following the Organizational Identifier standard - consult the documentation and the codelist.",
          "$ref": "#/definitions/Identifier",
          "deprecated": {
            "description": "This field has been replaced by the `transaction.payee` field to resolve ambiguity arising from 'receiver' being interpreted as relating to the goods or services procured rather than the flow of funds between the parties.",
            "deprecatedVersion": "1.1"
          }
        }
      }
    },
    "OrganizationReference": {
      "properties": {
        "name": {
          "type": [
            "string",
            "null"
          ],
          "description": "The name of the party being referenced. This must match the name of an entry in the parties section.",
          "title": "Organization name",
          "minLength": 1
        },
        "id": {
          "type": [
            "string",
            "integer"
          ],
          "description": "The id of the party being referenced. This must match the id of an entry in the parties section.",
          "title": "Organization ID"
        },
        "identifier": {
          "title": "Primary identifier",
          "description": "The primary identifier for this organization. Identifiers that uniquely pick out a legal entity should be preferred. Consult the [organization identifier guidance](https://standard.open-contracting.org/{{version}}/{{lang}}/schema/identifiers/) for the preferred scheme and identifier to use.",
          "deprecated": {
            "deprecatedVersion": "1.1",
            "description": "From version 1.1, organizations should be referenced by their identifier and name in a document, and detailed legal identifier information should only be provided in the relevant cross-referenced entry in the parties section at the top level of a release."
          },
          "$ref": "#/definitions/Identifier"
        },
        "address": {
          "deprecated": {
            "deprecatedVersion": "1.1",
            "description": "From version 1.1, organizations should be referenced by their identifier and name in a document, and address information should only be provided in the relevant cross-referenced entry in the parties section at the top level of a release."
          },
          "$ref": "#/definitions/Address",
          "description": "(Deprecated outside the parties section)",
          "title": "Address"
        },
        "additionalIdentifiers": {
          "type": "array",
          "deprecated": {
            "deprecatedVersion": "1.1",
            "description": "From version 1.1, organizations should be referenced by their identifier and name in a document, and additional identifiers for an organization should be provided in the relevant cross-referenced entry in the parties section at the top level of a release."
          },
          "items": {
            "$ref": "#/definitions/Identifier"
          },
          "title": "Additional identifiers",
          "uniqueItems": true,
          "wholeListMerge": true,
          "description": "(Deprecated outside the parties section) A list of additional / supplemental identifiers for the organization, using the [organization identifier guidance](https://standard.open-contracting.org/{{version}}/{{lang}}/schema/identifiers/). This can be used to provide an internally used identifier for this organization in addition to the primary legal entity identifier."
        },
        "contactPoint": {
          "deprecated": {
            "deprecatedVersion": "1.1",
            "description": "From version 1.1, organizations should be referenced by their identifier and name in a document, and contact point information for an organization should be provided in the relevant cross-referenced entry in the parties section at the top level of a release."
          },
          "$ref": "#/definitions/ContactPoint",
          "description": "(Deprecated outside the parties section)",
          "title": "Contact point"
        }
      },
      "type": "object",
      "description": "The id and name of the party being referenced. Used to cross-reference to the parties section",
      "title": "Organization reference"
    },
    "Organization": {
      "title": "Organization",
      "description": "A party (organization)",
      "type": "object",
      "properties": {
        "name": {
          "title": "Common name",
          "description": "A common name for this organization or other participant in the contracting process. The identifier object provides a space for the formal legal name, and so this may either repeat that value, or may provide the common name by which this organization or entity is known. This field may also include details of the department or sub-unit involved in this contracting process.",
          "type": [
            "string",
            "null"
          ]
        },
        "id": {
          "type": "string",
          "description": "The ID used for cross-referencing to this party from other sections of the release. This field may be built with the following structure {identifier.scheme}-{identifier.id}(-{department-identifier}).",
          "title": "Entity ID"
        },
        "identifier": {
          "title": "Primary identifier",
          "description": "The primary identifier for this organization or participant. Identifiers that uniquely pick out a legal entity should be preferred. Consult the [organization identifier guidance](https://standard.open-contracting.org/{{version}}/{{lang}}/schema/identifiers/) for the preferred scheme and identifier to use.",
          "$ref": "#/definitions/Identifier"
        },
        "additionalIdentifiers": {
          "title": "Additional identifiers",
          "description": "A list of additional / supplemental identifiers for the organization or participant, using the [organization identifier guidance](https://standard.open-contracting.org/{{version}}/{{lang}}/schema/identifiers/). This can be used to provide an internally used identifier for this organization in addition to the primary legal entity identifier.",
          "type": "array",
          "items": {
            "$ref": "#/definitions/Identifier"
          },
          "uniqueItems": true,
          "wholeListMerge": true
        },
        "address": {
          "title": "Address",
          "description": "An address. This may be the legally registered address of the organization, or may be a correspondence address for this particular contracting process.",
          "$ref": "#/definitions/Address"
        },
        "contactPoint": {
          "title": "Contact point",
          "description": "Contact details that can be used for this party.",
          "$ref": "#/definitions/ContactPoint"
        },
        "roles": {
          "title": "Party roles",
          "description": "The party's role(s) in the contracting process, using the open [partyRole](https://standard.open-contracting.org/{{version}}/{{lang}}/schema/codelists/#party-role) codelist.",
          "type": [
            "array",
            "null"
          ],
          "items": {
            "type": "string"
          },
          "codelist": "partyRole.csv",
          "openCodelist": true
        },
        "details": {
          "type": [
            "object",
            "null"
          ],
          "description": "Additional classification information about parties can be provided using partyDetail extensions that define particular fields and classification schemes.",
          "title": "Details"
        }
      },
      "patternProperties": {
        "^(name_(((([A-Za-z]{2,3}(-([A-Za-z]{3}(-[A-Za-z]{3}){0,2}))?)|[A-Za-z]{4}|[A-Za-z]{5,8})(-([A-Za-z]{4}))?(-([A-Za-z]{2}|[0-9]{3}))?(-([A-Za-z0-9]{5,8}|[0-9][A-Za-z0-9]{3}))*(-([0-9A-WY-Za-wy-z](-[A-Za-z0-9]{2,8})+))*(-(x(-[A-Za-z0-9]{1,8})+))?)|(x(-[A-Za-z0-9]{1,8})+)))$": {
          "type": [
            "string",
            "null"
          ]
        }
      }
    },
    "Item": {
      "title": "Item",
      "type": "object",
      "description": "A good, service, or work to be contracted.",
      "required": [
        "id"
      ],
      "properties": {
        "id": {
          "title": "ID",
          "description": "A local identifier to reference and merge the items by. Must be unique within a given array of items.",
          "type": [
            "string",
            "integer"
          ],
          "minLength": 1
        },
        "description": {
          "title": "Description",
          "description": "A description of the goods, services to be provided.",
          "type": [
            "string",
            "null"
          ]
        },
        "classification": {
          "title": "Classification",
          "description": "The primary classification for the item.",
          "$ref": "#/definitions/Classification"
        },
        "additionalClassifications": {
          "title": "Additional classifications",
          "description": "An array of additional classifications for the item.",
          "type": "array",
          "items": {
            "$ref": "#/definitions/Classification"
          },
          "uniqueItems": true,
          "wholeListMerge": true
        },
        "quantity": {
          "title": "Quantity",
          "description": "The number of units to be provided.",
          "type": [
            "number",
            "null"
          ]
        },
        "unit": {
          "title": "Unit",
          "description": "A description of the unit in which the supplies, services or works are provided (e.g. hours, kilograms) and the unit-price.",
          "type": "object",
          "properties": {
            "scheme": {
              "title": "Scheme",
              "description": "The list from which identifiers for units of measure are taken, using the open [unitClassificationScheme](https://standard.open-contracting.org/{{version}}/{{lang}}/schema/codelists/#unit-classification-scheme) codelist. 'UNCEFACT' is recommended.",
              "type": [
                "string",
                "null"
              ],
              "codelist": "unitClassificationScheme.csv",
              "openCodelist": true
            },
            "id": {
              "title": "ID",
              "description": "The identifier from the codelist referenced in the `scheme` field. Check the [unitClassificationScheme](https://standard.open-contracting.org/{{version}}/{{lang}}/schema/codelists/#unit-classification-scheme) codelist for details of how to find and use identifiers from the scheme in use.",
              "type": [
                "string",
                "null"
              ],
              "versionId": true
            },
            "name": {
              "title": "Name",
              "description": "Name of the unit.",
              "type": [
                "string",
                "null"
              ]
            },
            "value": {
              "title": "Value",
              "description": "The monetary value of a single unit.",
              "$ref": "#/definitions/Value"
            },
            "uri": {
              "title": "URI",
              "description": "The machine-readable URI for the unit of measure, provided by the scheme.",
              "format": "uri",
              "type": [
                "string",
                "null"
              ]
            }
          },
          "patternProperties": {
            "^(name_(((([A-Za-z]{2,3}(-([A-Za-z]{3}(-[A-Za-z]{3}){0,2}))?)|[A-Za-z]{4}|[A-Za-z]{5,8})(-([A-Za-z]{4}))?(-([A-Za-z]{2}|[0-9]{3}))?(-([A-Za-z0-9]{5,8}|[0-9][A-Za-z0-9]{3}))*(-([0-9A-WY-Za-wy-z](-[A-Za-z0-9]{2,8})+))*(-(x(-[A-Za-z0-9]{1,8})+))?)|(x(-[A-Za-z0-9]{1,8})+)))$": {
              "type": [
                "string",
                "null"
              ]
            }
          }
        }
      },
      "patternProperties": {
        "^(description_(((([A-Za-z]{2,3}(-([A-Za-z]{3}(-[A-Za-z]{3}){0,2}))?)|[A-Za-z]{4}|[A-Za-z]{5,8})(-([A-Za-z]{4}))?(-([A-Za-z]{2}|[0-9]{3}))?(-([A-Za-z0-9]{5,8}|[0-9][A-Za-z0-9]{3}))*(-([0-9A-WY-Za-wy-z](-[A-Za-z0-9]{2,8})+))*(-(x(-[A-Za-z0-9]{1,8})+))?)|(x(-[A-Za-z0-9]{1,8})+)))$": {
          "type": [
            "string",
            "null"
          ]
        }
      }
    },
    "Amendment": {
      "title": "Amendment",
      "type": "object",
      "description": "Amendment information",
      "properties": {
        "date": {
          "title": "Amendment date",
          "description": "The date of this amendment.",
          "type": [
            "string",
            "null"
          ],
          "format": "date-time"
        },
        "rationale": {
          "title": "Rationale",
          "description": "An explanation for the amendment.",
          "type": [
            "string",
            "null"
          ]
        },
        "id": {
          "description": "An identifier for this amendment: often the amendment number",
          "type": [
            "string",
            "null"
          ],
          "title": "ID"
        },
        "description": {
          "description": "A free text, or semi-structured, description of the changes made in this amendment.",
          "type": [
            "string",
            "null"
          ],
          "title": "Description"
        },
        "amendsReleaseID": {
          "description": "Provide the identifier (release.id) of the OCDS release (from this contracting process) that provides the values for this contracting process **before** the amendment was made.",
          "type": [
            "string",
            "null"
          ],
          "title": "Amended release (identifier)"
        },
        "releaseID": {
          "description": "Provide the identifier (release.id) of the OCDS release (from this contracting process) that provides the values for this contracting process **after** the amendment was made.",
          "type": [
            "string",
            "null"
          ],
          "title": "Amending release (identifier)"
        },
        "changes": {
          "title": "Amended fields",
          "description": "An array of change objects describing the fields changed, and their former values. (Deprecated in 1.1)",
          "type": "array",
          "items": {
            "type": "object",
            "properties": {
              "property": {
                "title": "Property",
                "description": "The property name that has been changed relative to the place the amendment is. For example if the contract value has changed, then the property under changes within the contract.amendment would be value.amount. (Deprecated in 1.1)",
                "type": "string"
              },
              "former_value": {
                "title": "Former Value",
                "description": "The previous value of the changed property, in whatever type the property is. (Deprecated in 1.1)",
                "type": [
                  "string",
                  "number",
                  "integer",
                  "array",
                  "object",
                  "null"
                ]
              }
            }
          },
          "deprecated": {
            "description": "A free-text or semi-structured string describing the changes made in each amendment can be provided in the amendment.description field. To provide structured information on the fields that have changed, publishers should provide releases indicating the state of the contracting process before and after the amendment.  ",
            "deprecatedVersion": "1.1"
          }
        }
      },
      "patternProperties": {
        "^(rationale_(((([A-Za-z]{2,3}(-([A-Za-z]{3}(-[A-Za-z]{3}){0,2}))?)|[A-Za-z]{4}|[A-Za-z]{5,8})(-([A-Za-z]{4}))?(-([A-Za-z]{2}|[0-9]{3}))?(-([A-Za-z0-9]{5,8}|[0-9][A-Za-z0-9]{3}))*(-([0-9A-WY-Za-wy-z](-[A-Za-z0-9]{2,8})+))*(-(x(-[A-Za-z0-9]{1,8})+))?)|(x(-[A-Za-z0-9]{1,8})+)))$": {
          "type": [
            "string",
            "null"
          ]
        }
      }
    },
    "Classification": {
      "title": "Classification",
      "description": "A classification consists of at least two parts: an identifier for the list (scheme) from which the classification is taken, and an identifier for the category from that list being applied. It is useful to also publish a text label and/or URI that users can draw on to interpret the classification.",
      "type": "object",
      "properties": {
        "scheme": {
          "title": "Scheme",
          "description": "The scheme or codelist from which the classification code is taken. For line item classifications, this uses the open [itemClassificationScheme](https://standard.open-contracting.org/{{version}}/{{lang}}/schema/codelists/#item-classification-scheme) codelist.",
          "type": [
            "string",
            "null"
          ],
          "codelist": "itemClassificationScheme.csv",
          "openCodelist": true
        },
        "id": {
          "title": "ID",
          "description": "The classification code taken from the scheme.",
          "type": [
            "string",
            "integer",
            "null"
          ],
          "versionId": true
        },
        "description": {
          "title": "Description",
          "description": "A textual description or title for the classification code.",
          "type": [
            "string",
            "null"
          ]
        },
        "uri": {
          "title": "URI",
          "description": "A URI to uniquely identify the classification code.",
          "type": [
            "string",
            "null"
          ],
          "format": "uri"
        }
      },
      "patternProperties": {
        "^(description_(((([A-Za-z]{2,3}(-([A-Za-z]{3}(-[A-Za-z]{3}){0,2}))?)|[A-Za-z]{4}|[A-Za-z]{5,8})(-([A-Za-z]{4}))?(-([A-Za-z]{2}|[0-9]{3}))?(-([A-Za-z0-9]{5,8}|[0-9][A-Za-z0-9]{3}))*(-([0-9A-WY-Za-wy-z](-[A-Za-z0-9]{2,8})+))*(-(x(-[A-Za-z0-9]{1,8})+))?)|(x(-[A-Za-z0-9]{1,8})+)))$": {
          "type": [
            "string",
            "null"
          ]
        }
      }
    },
    "Identifier": {
      "title": "Identifier",
      "description": "A unique identifier for a party (organization).",
      "type": "object",
      "properties": {
        "scheme": {
          "title": "Scheme",
          "description": "Organization identifiers should be taken from an existing organization identifier list. The scheme field is used to indicate the list or register from which the identifier is taken. This value should be taken from the [Organization Identifier Scheme](https://standard.open-contracting.org/{{version}}/{{lang}}/schema/codelists/#organization-identifier-scheme) codelist.",
          "type": [
            "string",
            "null"
          ]
        },
        "id": {
          "title": "ID",
          "description": "The identifier of the organization in the selected scheme.",
          "type": [
            "string",
            "integer",
            "null"
          ],
          "versionId": true
        },
        "legalName": {
          "title": "Legal Name",
          "description": "The legally registered name of the organization.",
          "type": [
            "string",
            "null"
          ]
        },
        "uri": {
          "title": "URI",
          "description": "A URI to identify the organization, such as those provided by [Open Corporates](http://www.opencorporates.com) or some other relevant URI provider. This is not for listing the website of the organization: that can be done through the URL field of the Organization contact point.",
          "type": [
            "string",
            "null"
          ],
          "format": "uri"
        }
      },
      "patternProperties": {
        "^(legalName_(((([A-Za-z]{2,3}(-([A-Za-z]{3}(-[A-Za-z]{3}){0,2}))?)|[A-Za-z]{4}|[A-Za-z]{5,8})(-([A-Za-z]{4}))?(-([A-Za-z]{2}|[0-9]{3}))?(-([A-Za-z0-9]{5,8}|[0-9][A-Za-z0-9]{3}))*(-([0-9A-WY-Za-wy-z](-[A-Za-z0-9]{2,8})+))*(-(x(-[A-Za-z0-9]{1,8})+))?)|(x(-[A-Za-z0-9]{1,8})+)))$": {
          "type": [
            "string",
            "null"
          ]
        }
      }
    },
    "Address": {
      "title": "Address",
      "description": "An address.",
      "type": "object",
      "properties": {
        "streetAddress": {
          "title": "Street address",
          "type": [
            "string",
            "null"
          ],
          "description": "The street address. For example, 1600 Amphitheatre Pkwy."
        },
        "locality": {
          "title": "Locality",
          "type": [
            "string",
            "null"
          ],
          "description": "The locality. For example, Mountain View."
        },
        "region": {
          "title": "Region",
          "type": [
            "string",
            "null"
          ],
          "description": "The region. For example, CA."
        },
        "postalCode": {
          "title": "Postal code",
          "type": [
            "string",
            "null"
          ],
          "description": "The postal code. For example, 94043."
        },
        "countryName": {
          "title": "Country name",
          "type": [
            "string",
            "null"
          ],
          "description": "The country name. For example, United States."
        }
      },
      "patternProperties": {
        "^(countryName_(((([A-Za-z]{2,3}(-([A-Za-z]{3}(-[A-Za-z]{3}){0,2}))?)|[A-Za-z]{4}|[A-Za-z]{5,8})(-([A-Za-z]{4}))?(-([A-Za-z]{2}|[0-9]{3}))?(-([A-Za-z0-9]{5,8}|[0-9][A-Za-z0-9]{3}))*(-([0-9A-WY-Za-wy-z](-[A-Za-z0-9]{2,8})+))*(-(x(-[A-Za-z0-9]{1,8})+))?)|(x(-[A-Za-z0-9]{1,8})+)))$": {
          "type": [
            "string",
            "null"
          ]
        }
      }
    },
    "ContactPoint": {
      "title": "Contact point",
      "type": "object",
      "description": "A person, contact point or department to contact in relation to this contracting process.",
      "properties": {
        "name": {
          "title": "Name",
          "type": [
            "string",
            "null"
          ],
          "description": "The name of the contact person, department, or contact point, for correspondence relating to this contracting process."
        },
        "email": {
          "title": "Email",
          "type": [
            "string",
            "null"
          ],
          "description": "The e-mail address of the contact point/person."
        },
        "telephone": {
          "title": "Telephone",
          "type": [
            "string",
            "null"
          ],
          "description": "The telephone number of the contact point/person. This should include the international dialing code."
        },
        "faxNumber": {
          "title": "Fax number",
          "type": [
            "string",
            "null"
          ],
          "description": "The fax number of the contact point/person. This should include the international dialing code."
        },
        "url": {
          "title": "URL",
          "type": [
            "string",
            "null"
          ],
          "description": "A web address for the contact point/person.",
          "format": "uri"
        }
      },
      "patternProperties": {
        "^(name_(((([A-Za-z]{2,3}(-([A-Za-z]{3}(-[A-Za-z]{3}){0,2}))?)|[A-Za-z]{4}|[A-Za-z]{5,8})(-([A-Za-z]{4}))?(-([A-Za-z]{2}|[0-9]{3}))?(-([A-Za-z0-9]{5,8}|[0-9][A-Za-z0-9]{3}))*(-([0-9A-WY-Za-wy-z](-[A-Za-z0-9]{2,8})+))*(-(x(-[A-Za-z0-9]{1,8})+))?)|(x(-[A-Za-z0-9]{1,8})+)))$": {
          "type": [
            "string",
            "null"
          ]
        }
      }
    },
    "Value": {
      "title": "Value",
      "description": "Financial values should be published with a currency attached.",
      "type": "object",
      "properties": {
        "amount": {
          "title": "Amount",
          "description": "Amount as a number.",
          "type": [
            "number",
            "null"
          ]
        },
        "currency": {
          "title": "Currency",
          "description": "The currency of the amount, from the closed [currency](https://standard.open-contracting.org/{{version}}/{{lang}}/schema/codelists/#currency) codelist.",
          "type": [
            "string",
            "null"
          ],
          "codelist": "currency.csv",
          "openCodelist": false,
          "enum": [
            "ADP",
            "AED",
            "AFA",
            "AFN",
            "ALK",
            "ALL",
            "AMD",
            "ANG",
            "AOA",
            "AOK",
            "AON",
            "AOR",
            "ARA",
            "ARP",
            "ARS",
            "ARY",
            "ATS",
            "AUD",
            "AWG",
            "AYM",
            "AZM",
            "AZN",
            "BAD",
            "BAM",
            "BBD",
            "BDT",
            "BEC",
            "BEF",
            "BEL",
            "BGJ",
            "BGK",
            "BGL",
            "BGN",
            "BHD",
            "BIF",
            "BMD",
            "BND",
            "BOB",
            "BOP",
            "BOV",
            "BRB",
            "BRC",
            "BRE",
            "BRL",
            "BRN",
            "BRR",
            "BSD",
            "BTN",
            "BUK",
            "BWP",
            "BYB",
            "BYN",
            "BYR",
            "BZD",
            "CAD",
            "CDF",
            "CHC",
            "CHE",
            "CHF",
            "CHW",
            "CLF",
            "CLP",
            "CNY",
            "COP",
            "COU",
            "CRC",
            "CSD",
            "CSJ",
            "CSK",
            "CUC",
            "CUP",
            "CVE",
            "CYP",
            "CZK",
            "DDM",
            "DEM",
            "DJF",
            "DKK",
            "DOP",
            "DZD",
            "ECS",
            "ECV",
            "EEK",
            "EGP",
            "ERN",
            "ESA",
            "ESB",
            "ESP",
            "ETB",
            "EUR",
            "FIM",
            "FJD",
            "FKP",
            "FRF",
            "GBP",
            "GEK",
            "GEL",
            "GHC",
            "GHP",
            "GHS",
            "GIP",
            "GMD",
            "GNE",
            "GNF",
            "GNS",
            "GQE",
            "GRD",
            "GTQ",
            "GWE",
            "GWP",
            "GYD",
            "HKD",
            "HNL",
            "HRD",
            "HRK",
            "HTG",
            "HUF",
            "IDR",
            "IEP",
            "ILP",
            "ILR",
            "ILS",
            "INR",
            "IQD",
            "IRR",
            "ISJ",
            "ISK",
            "ITL",
            "JMD",
            "JOD",
            "JPY",
            "KES",
            "KGS",
            "KHR",
            "KMF",
            "KPW",
            "KRW",
            "KWD",
            "KYD",
            "KZT",
            "LAJ",
            "LAK",
            "LBP",
            "LKR",
            "LRD",
            "LSL",
            "LSM",
            "LTL",
            "LTT",
            "LUC",
            "LUF",
            "LUL",
            "LVL",
            "LVR",
            "LYD",
            "MAD",
            "MDL",
            "MGA",
            "MGF",
            "MKD",
            "MLF",
            "MMK",
            "MNT",
            "MOP",
            "MRO",
            "MRU",
            "MTL",
            "MTP",
            "MUR",
            "MVQ",
            "MVR",
            "MWK",
            "MXN",
            "MXP",
            "MXV",
            "MYR",
            "MZE",
            "MZM",
            "MZN",
            "NAD",
            "NGN",
            "NIC",
            "NIO",
            "NLG",
            "NOK",
            "NPR",
            "NZD",
            "OMR",
            "PAB",
            "PEH",
            "PEI",
            "PEN",
            "PES",
            "PGK",
            "PHP",
            "PKR",
            "PLN",
            "PLZ",
            "PTE",
            "PYG",
            "QAR",
            "RHD",
            "ROK",
            "ROL",
            "RON",
            "RSD",
            "RUB",
            "RUR",
            "RWF",
            "SAR",
            "SBD",
            "SCR",
            "SDD",
            "SDG",
            "SDP",
            "SEK",
            "SGD",
            "SHP",
            "SIT",
            "SKK",
            "SLL",
            "SOS",
            "SRD",
            "SRG",
            "SSP",
            "STD",
            "STN",
            "SUR",
            "SVC",
            "SYP",
            "SZL",
            "THB",
            "TJR",
            "TJS",
            "TMM",
            "TMT",
            "TND",
            "TOP",
            "TPE",
            "TRL",
            "TRY",
            "TTD",
            "TWD",
            "TZS",
            "UAH",
            "UAK",
            "UGS",
            "UGW",
            "UGX",
            "USD",
            "USN",
            "USS",
            "UYI",
            "UYN",
            "UYP",
            "UYU",
            "UYW",
            "UZS",
            "VEB",
            "VEF",
            "VES",
            "VNC",
            "VND",
            "VUV",
            "WST",
            "XAF",
            "XAG",
            "XAU",
            "XBA",
            "XBB",
            "XBC",
            "XBD",
            "XCD",
            "XDR",
            "XEU",
            "XFO",
            "XFU",
            "XOF",
            "XPD",
            "XPF",
            "XPT",
            "XRE",
            "XSU",
            "XTS",
            "XUA",
            "XXX",
            "YDD",
            "YER",
            "YUD",
            "YUM",
            "YUN",
            "ZAL",
            "ZAR",
            "ZMK",
            "ZMW",
            "ZRN",
            "ZRZ",
            "ZWC",
            "ZWD",
            "ZWL",
            "ZWN",
            "ZWR",
            null
          ]
        }
      }
    },
    "Period": {
      "title": "Period",
      "description": "Key events during a contracting process may have a known start date, end date, duration, or maximum extent (the latest date the period can extend to). In some cases, not all of these fields will have known or relevant values.",
      "type": "object",
      "properties": {
        "startDate": {
          "title": "Start date",
          "description": "The start date for the period. When known, a precise start date must be provided.",
          "type": [
            "string",
            "null"
          ],
          "format": "date-time"
        },
        "endDate": {
          "title": "End date",
          "description": "The end date for the period. When known, a precise end date must be provided.",
          "type": [
            "string",
            "null"
          ],
          "format": "date-time"
        },
        "maxExtentDate": {
          "description": "The period cannot be extended beyond this date. This field can be used to express the maximum available date for extension or renewal of this period.",
          "format": "date-time",
          "title": "Maximum extent",
          "type": [
            "string",
            "null"
          ]
        },
        "durationInDays": {
          "description": "The maximum duration of this period in days. A user interface can collect or display this data in months or years as appropriate, and then convert it into days when storing this field. This field can be used when exact dates are not known. If a startDate and endDate are set, this field, if used, should be equal to the difference between startDate and endDate. Otherwise, if a startDate and maxExtentDate are set, this field, if used, should be equal to the difference between startDate and maxExtentDate.",
          "title": "Duration (days)",
          "type": [
            "integer",
            "null"
          ]
        }
      }
    },
    "RelatedProcess": {
      "description": "A reference to a related contracting process: generally one preceding or following on from the current process.",
      "type": "object",
      "title": "Related Process",
      "properties": {
        "id": {
          "title": "Relationship ID",
          "description": "A local identifier for this relationship, unique within this array.",
          "type": "string"
        },
        "relationship": {
          "items": {
            "type": "string"
          },
          "description": "The type of relationship, using the open [relatedProcess](https://standard.open-contracting.org/{{version}}/{{lang}}/schema/codelists/#related-process) codelist.",
          "title": "Relationship",
          "type": [
            "array",
            "null"
          ],
          "codelist": "relatedProcess.csv",
          "openCodelist": true
        },
        "title": {
          "description": "The title of the related process, where referencing an open contracting process, this field should match the tender/title field in the related process.",
          "title": "Related process title",
          "type": [
            "string",
            "null"
          ]
        },
        "scheme": {
          "title": "Scheme",
          "description": "The identification scheme used by this cross-reference, using the open [relatedProcessScheme](https://standard.open-contracting.org/{{version}}/{{lang}}/schema/codelists/#related-process-scheme) codelist.",
          "type": [
            "string",
            "null"
          ],
          "codelist": "relatedProcessScheme.csv",
          "openCodelist": true
        },
        "identifier": {
          "description": "The identifier of the related process. If the scheme is 'ocid', this must be an Open Contracting ID (ocid).",
          "title": "Identifier",
          "type": [
            "string",
            "null"
          ]
        },
        "uri": {
          "format": "uri",
          "description": "A URI pointing to a machine-readable document, release or record package containing the identified related process.",
          "title": "Related process URI",
          "type": [
            "string",
            "null"
          ]
        }
      }
    }
  }
}
},{}],31:[function(require,module,exports){
const readOCDS = require("../index");
const axios    = require("axios");

//const helper = readOCDS.createOCDSHelper({ocid : 12});

/*
// test secop release 1
axios.get("/ocds/secop-release_1.json").then(res => {
  const helper = readOCDS.createOCDSHelper(res.data)
  console.log("secop:", helper);
});
*/

// test inai record package 1
axios.get("/ocds/inai-record-package_1.json").then(res => {
  let helper = readOCDS.createOCDSHelper(res.data)
  console.log("inai:", helper);
});
/*
// test shcp record package 1
axios.get("/ocds/shcp-record-package_1.json").then(res => {
  const helper = readOCDS.createOCDSHelper(res.data);
  console.log("shcp:", helper);
});
*/
},{"../index":1,"axios":2}],32:[function(require,module,exports){
// shim for using process in browser
var process = module.exports = {};

// cached from whatever global is present so that test runners that stub it
// don't break things.  But we need to wrap it in a try catch in case it is
// wrapped in strict mode code which doesn't define any globals.  It's inside a
// function because try/catches deoptimize in certain engines.

var cachedSetTimeout;
var cachedClearTimeout;

function defaultSetTimout() {
    throw new Error('setTimeout has not been defined');
}
function defaultClearTimeout () {
    throw new Error('clearTimeout has not been defined');
}
(function () {
    try {
        if (typeof setTimeout === 'function') {
            cachedSetTimeout = setTimeout;
        } else {
            cachedSetTimeout = defaultSetTimout;
        }
    } catch (e) {
        cachedSetTimeout = defaultSetTimout;
    }
    try {
        if (typeof clearTimeout === 'function') {
            cachedClearTimeout = clearTimeout;
        } else {
            cachedClearTimeout = defaultClearTimeout;
        }
    } catch (e) {
        cachedClearTimeout = defaultClearTimeout;
    }
} ())
function runTimeout(fun) {
    if (cachedSetTimeout === setTimeout) {
        //normal enviroments in sane situations
        return setTimeout(fun, 0);
    }
    // if setTimeout wasn't available but was latter defined
    if ((cachedSetTimeout === defaultSetTimout || !cachedSetTimeout) && setTimeout) {
        cachedSetTimeout = setTimeout;
        return setTimeout(fun, 0);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedSetTimeout(fun, 0);
    } catch(e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't trust the global object when called normally
            return cachedSetTimeout.call(null, fun, 0);
        } catch(e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error
            return cachedSetTimeout.call(this, fun, 0);
        }
    }


}
function runClearTimeout(marker) {
    if (cachedClearTimeout === clearTimeout) {
        //normal enviroments in sane situations
        return clearTimeout(marker);
    }
    // if clearTimeout wasn't available but was latter defined
    if ((cachedClearTimeout === defaultClearTimeout || !cachedClearTimeout) && clearTimeout) {
        cachedClearTimeout = clearTimeout;
        return clearTimeout(marker);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedClearTimeout(marker);
    } catch (e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't  trust the global object when called normally
            return cachedClearTimeout.call(null, marker);
        } catch (e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error.
            // Some versions of I.E. have different rules for clearTimeout vs setTimeout
            return cachedClearTimeout.call(this, marker);
        }
    }



}
var queue = [];
var draining = false;
var currentQueue;
var queueIndex = -1;

function cleanUpNextTick() {
    if (!draining || !currentQueue) {
        return;
    }
    draining = false;
    if (currentQueue.length) {
        queue = currentQueue.concat(queue);
    } else {
        queueIndex = -1;
    }
    if (queue.length) {
        drainQueue();
    }
}

function drainQueue() {
    if (draining) {
        return;
    }
    var timeout = runTimeout(cleanUpNextTick);
    draining = true;

    var len = queue.length;
    while(len) {
        currentQueue = queue;
        queue = [];
        while (++queueIndex < len) {
            if (currentQueue) {
                currentQueue[queueIndex].run();
            }
        }
        queueIndex = -1;
        len = queue.length;
    }
    currentQueue = null;
    draining = false;
    runClearTimeout(timeout);
}

process.nextTick = function (fun) {
    var args = new Array(arguments.length - 1);
    if (arguments.length > 1) {
        for (var i = 1; i < arguments.length; i++) {
            args[i - 1] = arguments[i];
        }
    }
    queue.push(new Item(fun, args));
    if (queue.length === 1 && !draining) {
        runTimeout(drainQueue);
    }
};

// v8 likes predictible objects
function Item(fun, array) {
    this.fun = fun;
    this.array = array;
}
Item.prototype.run = function () {
    this.fun.apply(null, this.array);
};
process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];
process.version = ''; // empty string to avoid regexp issues
process.versions = {};

function noop() {}

process.on = noop;
process.addListener = noop;
process.once = noop;
process.off = noop;
process.removeListener = noop;
process.removeAllListeners = noop;
process.emit = noop;
process.prependListener = noop;
process.prependOnceListener = noop;

process.listeners = function (name) { return [] }

process.binding = function (name) {
    throw new Error('process.binding is not supported');
};

process.cwd = function () { return '/' };
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};
process.umask = function() { return 0; };

},{}]},{},[31]);
