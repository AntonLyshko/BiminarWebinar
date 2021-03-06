import { PureComponent } from "react";

import { ConsoleSqlOutlined } from "@ant-design/icons";

function isInteger(value) {
  return (
    typeof value === "number" && isFinite(value) && Math.floor(value) === value
  );
}

function isRangeVisible(_ref) {
  var lastRenderedStartIndex = _ref.lastRenderedStartIndex,
    lastRenderedStopIndex = _ref.lastRenderedStopIndex,
    startIndex = _ref.startIndex,
    stopIndex = _ref.stopIndex;

  return !(
    startIndex > lastRenderedStopIndex || stopIndex < lastRenderedStartIndex
  );
}

function scanForUnloadedRanges(_ref) {
  var isItemLoaded = _ref.isItemLoaded,
    itemCount = _ref.itemCount,
    minimumBatchSize = _ref.minimumBatchSize,
    startIndex = _ref.startIndex,
    stopIndex = _ref.stopIndex;

  var unloadedRanges = [];

  var rangeStartIndex = null;
  var rangeStopIndex = null;

  console.log("itemCount", itemCount);
  console.log("stopIndex", stop);

  for (var _index = startIndex; _index >= stopIndex; _index--) {
    var loaded = isItemLoaded(_index);

    if (!loaded) {
      console.log("Not loaded");
      rangeStopIndex = _index;
      if (rangeStartIndex === null) {
        rangeStartIndex = _index;
      }
    } else if (rangeStopIndex !== null) {
      console.log("unloadedRange", rangeStartIndex, rangeStopIndex);
      unloadedRanges.push(rangeStartIndex, rangeStopIndex);

      rangeStartIndex = rangeStopIndex = null;
    }
  }

  // If :rangeStopIndex is not null it means we haven't ran out of unloaded rows.
  // Scan forward to try filling our :minimumBatchSize.
  if (rangeStopIndex !== null) {
    var potentialStopIndex = Math.min(
      Math.max(rangeStopIndex, rangeStartIndex + minimumBatchSize - 1),
      itemCount - 1
    );

    for (
      var _index2 = rangeStopIndex + 1;
      _index2 <= potentialStopIndex;
      _index2++
    ) {
      if (!isItemLoaded(_index2)) {
        rangeStopIndex = _index2;
      } else {
        break;
      }
    }

    unloadedRanges.push(rangeStartIndex, rangeStopIndex);
  }

  // Check to see if our first range ended prematurely.
  // In this case we should scan backwards to try filling our :minimumBatchSize.
  if (unloadedRanges.length) {
    while (
      unloadedRanges[1] - unloadedRanges[0] + 1 < minimumBatchSize &&
      unloadedRanges[0] > 0
    ) {
      var _index3 = unloadedRanges[0] - 1;

      if (!isItemLoaded(_index3)) {
        unloadedRanges[0] = _index3;
      } else {
        break;
      }
    }
  }

  return unloadedRanges;
}

var classCallCheck = function (instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
};

var createClass = (function () {
  function defineProperties(target, props) {
    for (var i = 0; i < props.length; i++) {
      var descriptor = props[i];
      descriptor.enumerable = descriptor.enumerable || false;
      descriptor.configurable = true;
      if ("value" in descriptor) descriptor.writable = true;
      Object.defineProperty(target, descriptor.key, descriptor);
    }
  }

  return function (Constructor, protoProps, staticProps) {
    if (protoProps) defineProperties(Constructor.prototype, protoProps);
    if (staticProps) defineProperties(Constructor, staticProps);
    return Constructor;
  };
})();

var inherits = function (subClass, superClass) {
  if (typeof superClass !== "function" && superClass !== null) {
    throw new TypeError(
      "Super expression must either be null or a function, not " +
        typeof superClass
    );
  }

  subClass.prototype = Object.create(superClass && superClass.prototype, {
    constructor: {
      value: subClass,
      enumerable: false,
      writable: true,
      configurable: true,
    },
  });
  if (superClass)
    Object.setPrototypeOf
      ? Object.setPrototypeOf(subClass, superClass)
      : (subClass.__proto__ = superClass);
};

var possibleConstructorReturn = function (self, call) {
  if (!self) {
    throw new ReferenceError(
      "this hasn't been initialised - super() hasn't been called"
    );
  }

  return call && (typeof call === "object" || typeof call === "function")
    ? call
    : self;
};

var InfiniteLoader = (function (_PureComponent) {
  inherits(InfiniteLoader, _PureComponent);

  function InfiniteLoader() {
    var _ref;

    var _temp, _this, _ret;

    classCallCheck(this, InfiniteLoader);

    for (
      var _len = arguments.length, args = Array(_len), _key = 0;
      _key < _len;
      _key++
    ) {
      args[_key] = arguments[_key];
    }

    return (
      (_ret =
        ((_temp =
          ((_this = possibleConstructorReturn(
            this,
            (_ref =
              InfiniteLoader.__proto__ ||
              Object.getPrototypeOf(InfiniteLoader)).call.apply(
              _ref,
              [this].concat(args)
            )
          )),
          _this)),
        (_this._lastRenderedStartIndex = -1),
        (_this._lastRenderedStopIndex = -1),
        (_this._memoizedUnloadedRanges = []),
        (_this._onItemsRendered = function (_ref2) {
          var visibleStartIndex = _ref2.visibleStartIndex;
          console.log("????????????", visibleStartIndex);
        }),
        (_this._setRef = function (listRef) {
          _this._listRef = listRef;
        }),
        _temp)),
      possibleConstructorReturn(_this, _ret)
    );
  }

  createClass(InfiniteLoader, [
    {
      key: "resetloadMoreItemsCache",
      value: function resetloadMoreItemsCache() {
        var autoReload =
          arguments.length > 0 && arguments[0] !== undefined
            ? arguments[0]
            : false;

        this._memoizedUnloadedRanges = [];

        if (autoReload) {
          this._ensureRowsLoaded(
            this._lastRenderedStartIndex,
            this._lastRenderedStopIndex
          );
        }
      },
    },
    {
      key: "componentDidMount",
      value: function componentDidMount() {
        if (process.env.NODE_ENV !== "production") {
          if (this._listRef == null) {
            console.warn(
              "Invalid list ref; please refer to InfiniteLoader documentation."
            );
          }
        }
      },
    },
    {
      key: "render",
      value: function render() {
        var children = this.props.children;

        console.log("CHILDREN", this.props);

        return children({
          onItemsRendered: this._onItemsRendered,
          ref: this._setRef,
        });
      },
    },
    {
      key: "_ensureRowsLoaded",
      value: function _ensureRowsLoaded(startIndex, stopIndex) {
        var _props = this.props,
          isItemLoaded = _props.isItemLoaded,
          itemCount = _props.itemCount,
          _props$minimumBatchSi = _props.minimumBatchSize,
          minimumBatchSize =
            _props$minimumBatchSi === undefined ? 10 : _props$minimumBatchSi,
          _props$threshold = _props.threshold,
          threshold = _props$threshold === undefined ? 15 : _props$threshold;

        console.log("startIndex ", startIndex);

        // if (startIndex <= 5) {
        //   this._loadUnloadedRanges(unloadedRanges);
        // }
      },
    },
    {
      key: "_loadUnloadedRanges",
      value: function _loadUnloadedRanges(unloadedRanges) {
        var _this2 = this;

        // loadMoreRows was renamed to loadMoreItems in v1.0.3; will be removed in v2.0
        var loadMoreItems = this.props.loadMoreItems || this.props.loadMoreRows;

        var _loop = function _loop(i) {
          var startIndex = unloadedRanges[i];
          var stopIndex = unloadedRanges[i + 1];
          var promise = loadMoreItems();
          if (promise != null) {
            promise.then(function () {
              // Refresh the visible rows if any of them have just been loaded.
              // Otherwise they will remain in their unloaded visual state.
              if (
                isRangeVisible({
                  lastRenderedStartIndex: _this2._lastRenderedStartIndex,
                  lastRenderedStopIndex: _this2._lastRenderedStopIndex,
                  startIndex: startIndex,
                  stopIndex: stopIndex,
                })
              ) {
                // Handle an unmount while promises are still in flight.
                if (_this2._listRef == null) {
                  return;
                }

                // Resize cached row sizes for VariableSizeList,
                // otherwise just re-render the list.
                if (typeof _this2._listRef.resetAfterIndex === "function") {
                  _this2._listRef.resetAfterIndex(startIndex, true);
                } else {
                  // HACK reset temporarily cached item styles to force PureComponent to re-render.
                  // This is pretty gross, but I'm okay with it for now.
                  // Don't judge me.
                  if (
                    typeof _this2._listRef._getItemStyleCache === "function"
                  ) {
                    _this2._listRef._getItemStyleCache(-1);
                  }
                  _this2._listRef.forceUpdate();
                }
              }
            });
          }
        };

        for (var i = 0; i < unloadedRanges.length; i += 2) {
          _loop(i);
        }
      },
    },
  ]);
  return InfiniteLoader;
})(PureComponent);

export default InfiniteLoader;
