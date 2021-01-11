'use strict';

function Profiler() {
  if (typeof window == "undefined") {
    const {performance, PerformanceObserver} = require('perf_hooks');
    this.performance = performance;
  }

  //TODO: Implement browser version
}

Profiler.prototype.timify = function(name, fn) {
  try {
    this.performance.mark(name);
    return fn();
    this.performance.measure(name, name)
  } catch (e) {
    throw e;
  }
}

Profiler.prototype.mark = function(name) {
    this.performance.mark(name);
}

Profiler.prototype.measure = function(name) {
    this.performance.measure(name, name);
}

Profiler.prototype.clear = function() {
  this.performance.clearMarks();
}

module.exports = new Profiler();
