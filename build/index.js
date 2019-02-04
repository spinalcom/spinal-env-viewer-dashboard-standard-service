"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.dashboardVariables = exports.dashboardService = undefined;

var _globalVariables = require("./globalVariables");

var dashboardVariables = _interopRequireWildcard(_globalVariables);

var _spinalEnvViewerGraphService = require("spinal-env-viewer-graph-service");

var _spinalModelBmsnetwork = require("spinal-model-bmsnetwork");

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

// import {
//   SpinalEndpoint
// } from "spinal-models-bmsNetwork";

const {
  AbstractElement
} = require("spinal-models-building-elements");

let dashboardService = {
  createStandardDashBoardContext(contextName) {
    let context = _spinalEnvViewerGraphService.SpinalGraphService.getContext(contextName);

    if (typeof context !== "undefined") return false;

    return _spinalEnvViewerGraphService.SpinalGraphService.addContext(contextName, dashboardVariables.DASHBOARD_CONTEXT_TYPE, new AbstractElement(contextName));
  },
  createStandardDashBoard(contextId, dashboardName, dashboardType, attributes) {
    let abstract = new AbstractElement(dashboardName);

    abstract.add_attr({
      sensor: [],
      connected: []
    });

    attributes.forEach(attr => {
      delete attr.checked;
      abstract.sensor.push(attr);
    });

    let abstractNode = _spinalEnvViewerGraphService.SpinalGraphService.createNode({
      name: dashboardName,
      type: dashboardType
    }, abstract);

    _spinalEnvViewerGraphService.SpinalGraphService.addChildInContext(contextId, abstractNode, contextId, dashboardVariables.RELATION_NAME, _spinalEnvViewerGraphService.SPINAL_RELATION_TYPE);
  },

  getDashboardByType(contextId, dashboardType) {
    return _spinalEnvViewerGraphService.SpinalGraphService.getChildren(contextId, dashboardVariables.RELATION_NAME).then(children => {
      let res = [];

      for (let i = 0; i < children.length; i++) {
        const child = children[i];
        if (child.type.get() === dashboardType) {
          res.push(child);
        }
      }

      return res;
    });
  },
  hasDashBoard(nodeId) {
    return _spinalEnvViewerGraphService.SpinalGraphService.getChildren(nodeId, dashboardVariables.ENDPOINT_RELATION_NAME).then(children => {
      return children.length > 0;
    });
  },
  linkToDashboard(contextId, nodeId, dashboardId) {
    var _this = this;

    this.hasDashBoard(nodeId).then((() => {
      var _ref = _asyncToGenerator(function* (d) {
        if (d) yield _this.unLinkToDashBoard(nodeId);

        let dashboardInfo = _spinalEnvViewerGraphService.SpinalGraphService.getInfo(dashboardId);

        dashboardInfo.element.load().then(function (element) {
          _spinalEnvViewerGraphService.SpinalGraphService.addChildInContext(dashboardId, nodeId, contextId, dashboardVariables.DASHBOARD_TO_ELEMENT_RELATION, _spinalEnvViewerGraphService.SPINAL_RELATION_TYPE);

          let sensor = element.sensor.get();

          sensor.forEach(function (attr) {

            let endpoint = new _spinalModelBmsnetwork.SpinalBmsEndpoint(attr.name, "SpinalEndpoint_Path", attr.value, attr.unit, attr.dataType, attr.type);

            let child = _spinalEnvViewerGraphService.SpinalGraphService.createNode({
              name: attr.name,
              type: attr.type
            }, endpoint);

            _spinalEnvViewerGraphService.SpinalGraphService.addChild(nodeId, child, dashboardVariables.ENDPOINT_RELATION_NAME, _spinalEnvViewerGraphService.SPINAL_RELATION_TYPE);
          });
        });
      });

      return function (_x) {
        return _ref.apply(this, arguments);
      };
    })());
  },
  getAllDashboardContext() {
    let graph = _spinalEnvViewerGraphService.SpinalGraphService.getGraph();

    return graph.getChildren(["hasContext"]).then(contexts => {
      let res = [];

      contexts.forEach(context => {
        if (context.info.type.get() == dashboardVariables.DASHBOARD_CONTEXT_TYPE) {
          res.push(context.info);
        }
      });

      return res;
    });
  },
  unLinkToDashBoard(nodeId, callback) {

    this._getParent(nodeId, dashboardVariables.DASHBOARD_TO_ELEMENT_RELATION).then(oldDash => {
      dashboardService.removeAllEndpoints(nodeId).then(() => {

        _spinalEnvViewerGraphService.SpinalGraphService.removeChild(oldDash, nodeId, dashboardVariables.DASHBOARD_TO_ELEMENT_RELATION, _spinalEnvViewerGraphService.SPINAL_RELATION_TYPE).then(el => {
          if (callback) callback(el);
        });
      });
    });
  },
  removeAllEndpoints(nodeId) {
    return _spinalEnvViewerGraphService.SpinalGraphService.getChildren(nodeId, [dashboardVariables.ENDPOINT_RELATION_NAME]).then(endpoints => {
      for (let i = 0; i < endpoints.length; i++) {
        _spinalEnvViewerGraphService.SpinalGraphService.removeChild(nodeId, endpoints[i].id.get(), dashboardVariables.ENDPOINT_RELATION_NAME, _spinalEnvViewerGraphService.SPINAL_RELATION_TYPE);
      }
      return;
    });
  },
  addCalculationRule(nodeId, endpointType, rule, reference = null) {
    _spinalEnvViewerGraphService.SpinalGraphService.getChildren(nodeId, dashboardVariables.ENDPOINT_RELATION_NAME).then(endpoints => {
      let endpoint;
      for (let index = 0; index < endpoints.length; index++) {
        const element = endpoints[index];
        if (element.id.get() === endpointType || element.type.get() === endpointType) {
          endpoint = _spinalEnvViewerGraphService.SpinalGraphService.getRealNode(element.id.get());
        }
      }

      if (endpoint) {
        if (endpoint.info.dash_cal_rule) endpoint.info.rem_attr("dash_cal_rule");

        endpoint.info.add_attr("dash_cal_rule", {
          rule: rule,
          ref: reference
        });
      }
    });
  },
  _getParent(nodeId, relationName) {
    let node = _spinalEnvViewerGraphService.SpinalGraphService.getRealNode(nodeId);
    if (node.parents[relationName]) {
      return node.parents[relationName][0].load().then((() => {
        var _ref2 = _asyncToGenerator(function* (ref) {
          let parent = yield ref.parent.load();
          return parent.info.id.get();
        });

        return function (_x2) {
          return _ref2.apply(this, arguments);
        };
      })());
    }
  }
};

exports.dashboardService = dashboardService;
exports.dashboardVariables = dashboardVariables;

/*

unLinkToDashBoard(dashboardId, nodeId, callback) {
    SpinalGraphService.getChildren(nodeId, [
      dashboardVariables.ENDPOINT_RELATION_NAME
    ]).then(el => {
      if (el.length > 0) {
        let oldDash = el[0].id.get();
        dashboardService.removeAllEndpoints(nodeId).then(() => {
          // SpinalGraphService.moveChild(
          //   oldDash,
          //   dashboardId,
          //   nodeId,
          //   dashboardVariables.DASHBOARD_TO_ELEMENT_RELATION,
          //   SPINAL_RELATION_TYPE
          // ).then(el => {
          //   if (el) {
          //     callback(true);
          //   }
          // });

          SpinalGraphService.removeChild(oldDash, nodeId,
            dashboardVariables.DASHBOARD_TO_ELEMENT_RELATION).then(
            el => {
              callback(el);
            });

        });
      } else {
        callback(false);
      }
    });
  }

*/
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9pbmRleC5qcyJdLCJuYW1lcyI6WyJkYXNoYm9hcmRWYXJpYWJsZXMiLCJBYnN0cmFjdEVsZW1lbnQiLCJyZXF1aXJlIiwiZGFzaGJvYXJkU2VydmljZSIsImNyZWF0ZVN0YW5kYXJkRGFzaEJvYXJkQ29udGV4dCIsImNvbnRleHROYW1lIiwiY29udGV4dCIsIlNwaW5hbEdyYXBoU2VydmljZSIsImdldENvbnRleHQiLCJhZGRDb250ZXh0IiwiREFTSEJPQVJEX0NPTlRFWFRfVFlQRSIsImNyZWF0ZVN0YW5kYXJkRGFzaEJvYXJkIiwiY29udGV4dElkIiwiZGFzaGJvYXJkTmFtZSIsImRhc2hib2FyZFR5cGUiLCJhdHRyaWJ1dGVzIiwiYWJzdHJhY3QiLCJhZGRfYXR0ciIsInNlbnNvciIsImNvbm5lY3RlZCIsImZvckVhY2giLCJhdHRyIiwiY2hlY2tlZCIsInB1c2giLCJhYnN0cmFjdE5vZGUiLCJjcmVhdGVOb2RlIiwibmFtZSIsInR5cGUiLCJhZGRDaGlsZEluQ29udGV4dCIsIlJFTEFUSU9OX05BTUUiLCJTUElOQUxfUkVMQVRJT05fVFlQRSIsImdldERhc2hib2FyZEJ5VHlwZSIsImdldENoaWxkcmVuIiwidGhlbiIsImNoaWxkcmVuIiwicmVzIiwiaSIsImxlbmd0aCIsImNoaWxkIiwiZ2V0IiwiaGFzRGFzaEJvYXJkIiwibm9kZUlkIiwiRU5EUE9JTlRfUkVMQVRJT05fTkFNRSIsImxpbmtUb0Rhc2hib2FyZCIsImRhc2hib2FyZElkIiwiZCIsInVuTGlua1RvRGFzaEJvYXJkIiwiZGFzaGJvYXJkSW5mbyIsImdldEluZm8iLCJlbGVtZW50IiwibG9hZCIsIkRBU0hCT0FSRF9UT19FTEVNRU5UX1JFTEFUSU9OIiwiZW5kcG9pbnQiLCJTcGluYWxCbXNFbmRwb2ludCIsInZhbHVlIiwidW5pdCIsImRhdGFUeXBlIiwiYWRkQ2hpbGQiLCJnZXRBbGxEYXNoYm9hcmRDb250ZXh0IiwiZ3JhcGgiLCJnZXRHcmFwaCIsImNvbnRleHRzIiwiaW5mbyIsImNhbGxiYWNrIiwiX2dldFBhcmVudCIsIm9sZERhc2giLCJyZW1vdmVBbGxFbmRwb2ludHMiLCJyZW1vdmVDaGlsZCIsImVsIiwiZW5kcG9pbnRzIiwiaWQiLCJhZGRDYWxjdWxhdGlvblJ1bGUiLCJlbmRwb2ludFR5cGUiLCJydWxlIiwicmVmZXJlbmNlIiwiaW5kZXgiLCJnZXRSZWFsTm9kZSIsImRhc2hfY2FsX3J1bGUiLCJyZW1fYXR0ciIsInJlZiIsInJlbGF0aW9uTmFtZSIsIm5vZGUiLCJwYXJlbnRzIiwicGFyZW50Il0sIm1hcHBpbmdzIjoiOzs7Ozs7O0FBQUE7O0lBQVlBLGtCOztBQUNaOztBQVNBOzs7Ozs7QUFKQTtBQUNBO0FBQ0E7O0FBTUEsTUFBTTtBQUNKQztBQURJLElBRUZDLFFBQVEsaUNBQVIsQ0FGSjs7QUFJQSxJQUFJQyxtQkFBbUI7QUFDckJDLGlDQUErQkMsV0FBL0IsRUFBNEM7QUFDMUMsUUFBSUMsVUFBVUMsZ0RBQW1CQyxVQUFuQixDQUE4QkgsV0FBOUIsQ0FBZDs7QUFFQSxRQUFJLE9BQU9DLE9BQVAsS0FBbUIsV0FBdkIsRUFBb0MsT0FBTyxLQUFQOztBQUVwQyxXQUFPQyxnREFBbUJFLFVBQW5CLENBQ0xKLFdBREssRUFFTEwsbUJBQW1CVSxzQkFGZCxFQUdMLElBQUlULGVBQUosQ0FBb0JJLFdBQXBCLENBSEssQ0FBUDtBQUtELEdBWG9CO0FBWXJCTSwwQkFBd0JDLFNBQXhCLEVBQW1DQyxhQUFuQyxFQUFrREMsYUFBbEQsRUFBaUVDLFVBQWpFLEVBQTZFO0FBQzNFLFFBQUlDLFdBQVcsSUFBSWYsZUFBSixDQUFvQlksYUFBcEIsQ0FBZjs7QUFFQUcsYUFBU0MsUUFBVCxDQUFrQjtBQUNoQkMsY0FBUSxFQURRO0FBRWhCQyxpQkFBVztBQUZLLEtBQWxCOztBQUtBSixlQUFXSyxPQUFYLENBQW1CQyxRQUFRO0FBQ3pCLGFBQU9BLEtBQUtDLE9BQVo7QUFDQU4sZUFBU0UsTUFBVCxDQUFnQkssSUFBaEIsQ0FBcUJGLElBQXJCO0FBQ0QsS0FIRDs7QUFL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QixFQUE4QjlCLElBQTlCLEdBQXFDakIsSUFBckM7QUFBQSxzQ0FBMEMsV0FBTThDLEdBQU4sRUFBYTtBQUM1RCxjQUFJSSxTQUFTLE1BQU1KLElBQUlJLE1BQUosQ0FBV2pDLElBQVgsRUFBbkI7QUFDQSxpQkFBT2lDLE9BQU9yQixJQUFQLENBQVlRLEVBQVosQ0FBZS9CLEdBQWYsRUFBUDtBQUNELFNBSE07O0FBQUE7QUFBQTtBQUFBO0FBQUEsV0FBUDtBQUlEO0FBRUY7QUF2TW9CLENBQXZCOztRQTJNRXBDLGdCLEdBQUFBLGdCO1FBQ0FILGtCLEdBQUFBLGtCOztBQWdCRiIsImZpbGUiOiJpbmRleC5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCAqIGFzIGRhc2hib2FyZFZhcmlhYmxlcyBmcm9tIFwiLi9nbG9iYWxWYXJpYWJsZXNcIjtcbmltcG9ydCB7XG4gIFNQSU5BTF9SRUxBVElPTl9UWVBFLFxuICBTcGluYWxHcmFwaFNlcnZpY2Vcbn0gZnJvbSBcInNwaW5hbC1lbnYtdmlld2VyLWdyYXBoLXNlcnZpY2VcIjtcblxuLy8gaW1wb3J0IHtcbi8vICAgU3BpbmFsRW5kcG9pbnRcbi8vIH0gZnJvbSBcInNwaW5hbC1tb2RlbHMtYm1zTmV0d29ya1wiO1xuXG5pbXBvcnQge1xuICBTcGluYWxCbXNFbmRwb2ludFxufSBmcm9tIFwic3BpbmFsLW1vZGVsLWJtc25ldHdvcmtcIjtcblxuY29uc3Qge1xuICBBYnN0cmFjdEVsZW1lbnRcbn0gPSByZXF1aXJlKFwic3BpbmFsLW1vZGVscy1idWlsZGluZy1lbGVtZW50c1wiKTtcblxubGV0IGRhc2hib2FyZFNlcnZpY2UgPSB7XG4gIGNyZWF0ZVN0YW5kYXJkRGFzaEJvYXJkQ29udGV4dChjb250ZXh0TmFtZSkge1xuICAgIGxldCBjb250ZXh0ID0gU3BpbmFsR3JhcGhTZXJ2aWNlLmdldENvbnRleHQoY29udGV4dE5hbWUpO1xuXG4gICAgaWYgKHR5cGVvZiBjb250ZXh0ICE9PSBcInVuZGVmaW5lZFwiKSByZXR1cm4gZmFsc2U7XG5cbiAgICByZXR1cm4gU3BpbmFsR3JhcGhTZXJ2aWNlLmFkZENvbnRleHQoXG4gICAgICBjb250ZXh0TmFtZSxcbiAgICAgIGRhc2hib2FyZFZhcmlhYmxlcy5EQVNIQk9BUkRfQ09OVEVYVF9UWVBFLFxuICAgICAgbmV3IEFic3RyYWN0RWxlbWVudChjb250ZXh0TmFtZSlcbiAgICApO1xuICB9LFxuICBjcmVhdGVTdGFuZGFyZERhc2hCb2FyZChjb250ZXh0SWQsIGRhc2hib2FyZE5hbWUsIGRhc2hib2FyZFR5cGUsIGF0dHJpYnV0ZXMpIHtcbiAgICBsZXQgYWJzdHJhY3QgPSBuZXcgQWJzdHJhY3RFbGVtZW50KGRhc2hib2FyZE5hbWUpO1xuXG4gICAgYWJzdHJhY3QuYWRkX2F0dHIoe1xuICAgICAgc2Vuc29yOiBbXSxcbiAgICAgIGNvbm5lY3RlZDogW11cbiAgICB9KTtcblxuICAgIGF0dHJpYnV0ZXMuZm9yRWFjaChhdHRyID0+IHtcbiAgICAgIGRlbGV0ZSBhdHRyLmNoZWNrZWQ7XG4gICAgICBhYnN0cmFjdC5zZW5zb3IucHVzaChhdHRyKTtcbiAgICB9KTtcblxuICAgIGxldCBhYnN0cmFjdE5vZGUgPSBTcGluYWxHcmFwaFNlcnZpY2UuY3JlYXRlTm9kZSh7XG4gICAgICAgIG5hbWU6IGRhc2hib2FyZE5hbWUsXG4gICAgICAgIHR5cGU6IGRhc2hib2FyZFR5cGVcbiAgICAgIH0sXG4gICAgICBhYnN0cmFjdFxuICAgICk7XG5cbiAgICBTcGluYWxHcmFwaFNlcnZpY2UuYWRkQ2hpbGRJbkNvbnRleHQoXG4gICAgICBjb250ZXh0SWQsXG4gICAgICBhYnN0cmFjdE5vZGUsXG4gICAgICBjb250ZXh0SWQsXG4gICAgICBkYXNoYm9hcmRWYXJpYWJsZXMuUkVMQVRJT05fTkFNRSxcbiAgICAgIFNQSU5BTF9SRUxBVElPTl9UWVBFXG4gICAgKTtcbiAgfSxcblxuICBnZXREYXNoYm9hcmRCeVR5cGUoY29udGV4dElkLCBkYXNoYm9hcmRUeXBlKSB7XG4gICAgcmV0dXJuIFNwaW5hbEdyYXBoU2VydmljZS5nZXRDaGlsZHJlbihcbiAgICAgIGNvbnRleHRJZCxcbiAgICAgIGRhc2hib2FyZFZhcmlhYmxlcy5SRUxBVElPTl9OQU1FXG4gICAgKS50aGVuKGNoaWxkcmVuID0+IHtcbiAgICAgIGxldCByZXMgPSBbXTtcblxuICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBjaGlsZHJlbi5sZW5ndGg7IGkrKykge1xuICAgICAgICBjb25zdCBjaGlsZCA9IGNoaWxkcmVuW2ldO1xuICAgICAgICBpZiAoY2hpbGQudHlwZS5nZXQoKSA9PT0gZGFzaGJvYXJkVHlwZSkge1xuICAgICAgICAgIHJlcy5wdXNoKGNoaWxkKTtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICByZXR1cm4gcmVzO1xuICAgIH0pO1xuICB9LFxuICBoYXNEYXNoQm9hcmQobm9kZUlkKSB7XG4gICAgcmV0dXJuIFNwaW5hbEdyYXBoU2VydmljZS5nZXRDaGlsZHJlbihcbiAgICAgIG5vZGVJZCxcbiAgICAgIGRhc2hib2FyZFZhcmlhYmxlcy5FTkRQT0lOVF9SRUxBVElPTl9OQU1FXG4gICAgKS50aGVuKGNoaWxkcmVuID0+IHtcbiAgICAgIHJldHVybiBjaGlsZHJlbi5sZW5ndGggPiAwO1xuICAgIH0pO1xuICB9LFxuICBsaW5rVG9EYXNoYm9hcmQoY29udGV4dElkLCBub2RlSWQsIGRhc2hib2FyZElkKSB7XG4gICAgdGhpcy5oYXNEYXNoQm9hcmQobm9kZUlkKS50aGVuKGFzeW5jIGQgPT4ge1xuICAgICAgaWYgKGQpIGF3YWl0IHRoaXMudW5MaW5rVG9EYXNoQm9hcmQobm9kZUlkKTtcblxuICAgICAgbGV0IGRhc2hib2FyZEluZm8gPSBTcGluYWxHcmFwaFNlcnZpY2UuZ2V0SW5mbyhkYXNoYm9hcmRJZCk7XG5cbiAgICAgIGRhc2hib2FyZEluZm8uZWxlbWVudC5sb2FkKCkudGhlbihlbGVtZW50ID0+IHtcbiAgICAgICAgU3BpbmFsR3JhcGhTZXJ2aWNlLmFkZENoaWxkSW5Db250ZXh0KFxuICAgICAgICAgIGRhc2hib2FyZElkLFxuICAgICAgICAgIG5vZGVJZCxcbiAgICAgICAgICBjb250ZXh0SWQsXG4gICAgICAgICAgZGFzaGJvYXJkVmFyaWFibGVzLkRBU0hCT0FSRF9UT19FTEVNRU5UX1JFTEFUSU9OLFxuICAgICAgICAgIFNQSU5BTF9SRUxBVElPTl9UWVBFXG4gICAgICAgICk7XG5cblxuICAgICAgICBsZXQgc2Vuc29yID0gZWxlbWVudC5zZW5zb3IuZ2V0KCk7XG5cbiAgICAgICAgc2Vuc29yLmZvckVhY2goYXR0ciA9PiB7XG5cbiAgICAgICAgICBsZXQgZW5kcG9pbnQgPSBuZXcgU3BpbmFsQm1zRW5kcG9pbnQoXG4gICAgICAgICAgICBhdHRyLm5hbWUsXG4gICAgICAgICAgICBcIlNwaW5hbEVuZHBvaW50X1BhdGhcIixcbiAgICAgICAgICAgIGF0dHIudmFsdWUsXG4gICAgICAgICAgICBhdHRyLnVuaXQsXG4gICAgICAgICAgICBhdHRyLmRhdGFUeXBlLFxuICAgICAgICAgICAgYXR0ci50eXBlXG4gICAgICAgICAgKTtcblxuICAgICAgICAgIGxldCBjaGlsZCA9IFNwaW5hbEdyYXBoU2VydmljZS5jcmVhdGVOb2RlKHtcbiAgICAgICAgICAgICAgbmFtZTogYXR0ci5uYW1lLFxuICAgICAgICAgICAgICB0eXBlOiBhdHRyLnR5cGVcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBlbmRwb2ludFxuICAgICAgICAgICk7XG5cbiAgICAgICAgICBTcGluYWxHcmFwaFNlcnZpY2UuYWRkQ2hpbGQoXG4gICAgICAgICAgICBub2RlSWQsXG4gICAgICAgICAgICBjaGlsZCxcbiAgICAgICAgICAgIGRhc2hib2FyZFZhcmlhYmxlcy5FTkRQT0lOVF9SRUxBVElPTl9OQU1FLFxuICAgICAgICAgICAgU1BJTkFMX1JFTEFUSU9OX1RZUEVcbiAgICAgICAgICApO1xuICAgICAgICB9KTtcbiAgICAgIH0pO1xuXG4gICAgfSlcblxuXG4gIH0sXG4gIGdldEFsbERhc2hib2FyZENvbnRleHQoKSB7XG4gICAgbGV0IGdyYXBoID0gU3BpbmFsR3JhcGhTZXJ2aWNlLmdldEdyYXBoKCk7XG5cbiAgICByZXR1cm4gZ3JhcGguZ2V0Q2hpbGRyZW4oW1wiaGFzQ29udGV4dFwiXSkudGhlbihjb250ZXh0cyA9PiB7XG4gICAgICBsZXQgcmVzID0gW107XG5cbiAgICAgIGNvbnRleHRzLmZvckVhY2goY29udGV4dCA9PiB7XG4gICAgICAgIGlmIChcbiAgICAgICAgICBjb250ZXh0LmluZm8udHlwZS5nZXQoKSA9PSBkYXNoYm9hcmRWYXJpYWJsZXMuREFTSEJPQVJEX0NPTlRFWFRfVFlQRVxuICAgICAgICApIHtcbiAgICAgICAgICByZXMucHVzaChjb250ZXh0LmluZm8pO1xuICAgICAgICB9XG4gICAgICB9KTtcblxuICAgICAgcmV0dXJuIHJlcztcbiAgICB9KTtcbiAgfSxcbiAgdW5MaW5rVG9EYXNoQm9hcmQobm9kZUlkLCBjYWxsYmFjaykge1xuXG4gICAgdGhpcy5fZ2V0UGFyZW50KG5vZGVJZCwgZGFzaGJvYXJkVmFyaWFibGVzLkRBU0hCT0FSRF9UT19FTEVNRU5UX1JFTEFUSU9OKVxuICAgICAgLnRoZW4ob2xkRGFzaCA9PiB7XG4gICAgICAgIGRhc2hib2FyZFNlcnZpY2UucmVtb3ZlQWxsRW5kcG9pbnRzKG5vZGVJZCkudGhlbigoKSA9PiB7XG5cbiAgICAgICAgICBTcGluYWxHcmFwaFNlcnZpY2UucmVtb3ZlQ2hpbGQob2xkRGFzaCwgbm9kZUlkLFxuICAgICAgICAgICAgZGFzaGJvYXJkVmFyaWFibGVzLkRBU0hCT0FSRF9UT19FTEVNRU5UX1JFTEFUSU9OLFxuICAgICAgICAgICAgU1BJTkFMX1JFTEFUSU9OX1RZUEUpLnRoZW4oXG4gICAgICAgICAgICBlbCA9PiB7XG4gICAgICAgICAgICAgIGlmIChjYWxsYmFjaykgY2FsbGJhY2soZWwpO1xuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgfSk7XG4gICAgICB9KVxuXG4gIH0sXG4gIHJlbW92ZUFsbEVuZHBvaW50cyhub2RlSWQpIHtcbiAgICByZXR1cm4gU3BpbmFsR3JhcGhTZXJ2aWNlLmdldENoaWxkcmVuKG5vZGVJZCwgW1xuICAgICAgZGFzaGJvYXJkVmFyaWFibGVzLkVORFBPSU5UX1JFTEFUSU9OX05BTUVcbiAgICBdKS50aGVuKGVuZHBvaW50cyA9PiB7XG4gICAgICBmb3IgKGxldCBpID0gMDsgaSA8IGVuZHBvaW50cy5sZW5ndGg7IGkrKykge1xuICAgICAgICBTcGluYWxHcmFwaFNlcnZpY2UucmVtb3ZlQ2hpbGQoXG4gICAgICAgICAgbm9kZUlkLFxuICAgICAgICAgIGVuZHBvaW50c1tpXS5pZC5nZXQoKSxcbiAgICAgICAgICBkYXNoYm9hcmRWYXJpYWJsZXMuRU5EUE9JTlRfUkVMQVRJT05fTkFNRSxcbiAgICAgICAgICBTUElOQUxfUkVMQVRJT05fVFlQRVxuICAgICAgICApO1xuICAgICAgfVxuICAgICAgcmV0dXJuO1xuICAgIH0pO1xuICB9LFxuICBhZGRDYWxjdWxhdGlvblJ1bGUobm9kZUlkLCBlbmRwb2ludFR5cGUsIHJ1bGUsIHJlZmVyZW5jZSA9IG51bGwpIHtcbiAgICBTcGluYWxHcmFwaFNlcnZpY2UuZ2V0Q2hpbGRyZW4oXG4gICAgICBub2RlSWQsXG4gICAgICBkYXNoYm9hcmRWYXJpYWJsZXMuRU5EUE9JTlRfUkVMQVRJT05fTkFNRVxuICAgICkudGhlbihlbmRwb2ludHMgPT4ge1xuICAgICAgbGV0IGVuZHBvaW50O1xuICAgICAgZm9yIChsZXQgaW5kZXggPSAwOyBpbmRleCA8IGVuZHBvaW50cy5sZW5ndGg7IGluZGV4KyspIHtcbiAgICAgICAgY29uc3QgZWxlbWVudCA9IGVuZHBvaW50c1tpbmRleF07XG4gICAgICAgIGlmIChlbGVtZW50LmlkLmdldCgpID09PSBlbmRwb2ludFR5cGUgfHwgZWxlbWVudC50eXBlLmdldCgpID09PVxuICAgICAgICAgIGVuZHBvaW50VHlwZSkge1xuICAgICAgICAgIGVuZHBvaW50ID0gU3BpbmFsR3JhcGhTZXJ2aWNlLmdldFJlYWxOb2RlKGVsZW1lbnQuaWQuZ2V0KCkpO1xuICAgICAgICB9XG5cbiAgICAgIH1cblxuICAgICAgaWYgKGVuZHBvaW50KSB7XG4gICAgICAgIGlmIChlbmRwb2ludC5pbmZvLmRhc2hfY2FsX3J1bGUpXG4gICAgICAgICAgZW5kcG9pbnQuaW5mby5yZW1fYXR0cihcImRhc2hfY2FsX3J1bGVcIik7XG5cbiAgICAgICAgZW5kcG9pbnQuaW5mby5hZGRfYXR0cihcImRhc2hfY2FsX3J1bGVcIiwge1xuICAgICAgICAgIHJ1bGU6IHJ1bGUsXG4gICAgICAgICAgcmVmOiByZWZlcmVuY2VcbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgfSk7XG4gIH0sXG4gIF9nZXRQYXJlbnQobm9kZUlkLCByZWxhdGlvbk5hbWUpIHtcbiAgICBsZXQgbm9kZSA9IFNwaW5hbEdyYXBoU2VydmljZS5nZXRSZWFsTm9kZShub2RlSWQpO1xuICAgIGlmIChub2RlLnBhcmVudHNbcmVsYXRpb25OYW1lXSkge1xuICAgICAgcmV0dXJuIG5vZGUucGFyZW50c1tyZWxhdGlvbk5hbWVdWzBdLmxvYWQoKS50aGVuKGFzeW5jIHJlZiA9PiB7XG4gICAgICAgIGxldCBwYXJlbnQgPSBhd2FpdCByZWYucGFyZW50LmxvYWQoKTtcbiAgICAgICAgcmV0dXJuIHBhcmVudC5pbmZvLmlkLmdldCgpO1xuICAgICAgfSlcbiAgICB9XG5cbiAgfVxufTtcblxuZXhwb3J0IHtcbiAgZGFzaGJvYXJkU2VydmljZSxcbiAgZGFzaGJvYXJkVmFyaWFibGVzXG59O1xuXG5cblxuXG5cblxuXG5cblxuXG5cblxuXG5cbi8qXG5cbnVuTGlua1RvRGFzaEJvYXJkKGRhc2hib2FyZElkLCBub2RlSWQsIGNhbGxiYWNrKSB7XG4gICAgU3BpbmFsR3JhcGhTZXJ2aWNlLmdldENoaWxkcmVuKG5vZGVJZCwgW1xuICAgICAgZGFzaGJvYXJkVmFyaWFibGVzLkVORFBPSU5UX1JFTEFUSU9OX05BTUVcbiAgICBdKS50aGVuKGVsID0+IHtcbiAgICAgIGlmIChlbC5sZW5ndGggPiAwKSB7XG4gICAgICAgIGxldCBvbGREYXNoID0gZWxbMF0uaWQuZ2V0KCk7XG4gICAgICAgIGRhc2hib2FyZFNlcnZpY2UucmVtb3ZlQWxsRW5kcG9pbnRzKG5vZGVJZCkudGhlbigoKSA9PiB7XG4gICAgICAgICAgLy8gU3BpbmFsR3JhcGhTZXJ2aWNlLm1vdmVDaGlsZChcbiAgICAgICAgICAvLyAgIG9sZERhc2gsXG4gICAgICAgICAgLy8gICBkYXNoYm9hcmRJZCxcbiAgICAgICAgICAvLyAgIG5vZGVJZCxcbiAgICAgICAgICAvLyAgIGRhc2hib2FyZFZhcmlhYmxlcy5EQVNIQk9BUkRfVE9fRUxFTUVOVF9SRUxBVElPTixcbiAgICAgICAgICAvLyAgIFNQSU5BTF9SRUxBVElPTl9UWVBFXG4gICAgICAgICAgLy8gKS50aGVuKGVsID0+IHtcbiAgICAgICAgICAvLyAgIGlmIChlbCkge1xuICAgICAgICAgIC8vICAgICBjYWxsYmFjayh0cnVlKTtcbiAgICAgICAgICAvLyAgIH1cbiAgICAgICAgICAvLyB9KTtcblxuICAgICAgICAgIFNwaW5hbEdyYXBoU2VydmljZS5yZW1vdmVDaGlsZChvbGREYXNoLCBub2RlSWQsXG4gICAgICAgICAgICBkYXNoYm9hcmRWYXJpYWJsZXMuREFTSEJPQVJEX1RPX0VMRU1FTlRfUkVMQVRJT04pLnRoZW4oXG4gICAgICAgICAgICBlbCA9PiB7XG4gICAgICAgICAgICAgIGNhbGxiYWNrKGVsKTtcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgIH0pO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgY2FsbGJhY2soZmFsc2UpO1xuICAgICAgfVxuICAgIH0pO1xuICB9XG5cbiovIl19