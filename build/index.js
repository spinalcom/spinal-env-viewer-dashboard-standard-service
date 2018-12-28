"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.dashboardVariables = exports.dashboardService = undefined;

var _globalVariables = require("./globalVariables");

var dashboardVariables = _interopRequireWildcard(_globalVariables);

var _spinalEnvViewerGraphService = require("spinal-env-viewer-graph-service");

var _spinalModelsBmsNetwork = require("spinal-models-bmsNetwork");

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

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
    return _asyncToGenerator(function* () {

      let children = yield _spinalEnvViewerGraphService.SpinalGraphService.getChildren(contextId, dashboardVariables.RELATION_NAME);

      let res = [];

      for (let i = 0; i < children.length; i++) {
        const child = children[i];
        if (child.type.get() === dashboardType) {
          res.push(child);
        }
      }

      return res;
    })();
  },
  hasDashBoard(nodeId) {
    return _asyncToGenerator(function* () {
      let children = yield _spinalEnvViewerGraphService.SpinalGraphService.getChildren(nodeId, dashboardVariables.ENDPOINT_RELATION_NAME);

      return children.length > 0;
    })();
  },
  linkToDashboard(nodeId, dashboardId) {
    return _asyncToGenerator(function* () {

      if (yield dashboardService.hasDashBoard(nodeId)) return;

      let dashboardInfo = _spinalEnvViewerGraphService.SpinalGraphService.getInfo(dashboardId);

      let element = yield dashboardInfo.element.load();

      /** Ajouter id du node dans le dasboard */
      // if (!element.connected) {
      //   element.add_attr({
      //     connected: []
      //   })
      // }
      // element.connected.push(nodeId);
      /**       Fin             */

      _spinalEnvViewerGraphService.SpinalGraphService.addChild(dashboardId, nodeId, dashboardVariables.DASHBOARD_TO_ELEMENT_RELATION, _spinalEnvViewerGraphService.SPINAL_RELATION_TYPE);

      /** Attribuer id dashboard à l'element nodeId */
      // SpinalGraphService.getInfo(nodeId).element.load().then(el => {
      //   if (!el.dashboardId) {
      //     el.add_attr({
      //       dashboardId: dashboardId
      //     })
      //   } else {
      //     el.dashboardId.set(dashboardId);
      //   }
      // })
      /** Fin */

      let sensor = element.sensor.get();

      // Pour chaque element du sensor ajouter un endpoint à la relation hasEndpoint

      sensor.forEach(function (attr) {

        let endpoint = new _spinalModelsBmsNetwork.SpinalEndpoint(attr.name, "SpinalEndpoint", attr.value, attr.unit, attr.dataType, 0, 30, attr.dataType);

        let child = _spinalEnvViewerGraphService.SpinalGraphService.createNode({
          name: dashboardInfo.name.get(),
          type: dashboardInfo.type.get()
        }, endpoint);

        _spinalEnvViewerGraphService.SpinalGraphService.addChild(nodeId, child, dashboardVariables.ENDPOINT_RELATION_NAME, _spinalEnvViewerGraphService.SPINAL_RELATION_TYPE);
      });
    })();
  },
  getAllDashboardContext() {
    return _asyncToGenerator(function* () {
      let res = [];
      let graph = _spinalEnvViewerGraphService.SpinalGraphService.getGraph();

      let contexts = yield graph.getChildren(["hasContext"]);

      contexts.forEach(function (context) {
        if (context.info.type.get() == dashboardVariables.DASHBOARD_CONTEXT_TYPE) {
          res.push(context.info);
        }
      });

      return res;
    })();
  }

};

exports.dashboardService = dashboardService;
exports.dashboardVariables = dashboardVariables;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9pbmRleC5qcyJdLCJuYW1lcyI6WyJkYXNoYm9hcmRWYXJpYWJsZXMiLCJBYnN0cmFjdEVsZW1lbnQiLCJyZXF1aXJlIiwiZGFzaGJvYXJkU2VydmljZSIsImNyZWF0ZVN0YW5kYXJkRGFzaEJvYXJkQ29udGV4dCIsImNvbnRleHROYW1lIiwiY29udGV4dCIsIlNwaW5hbEdyYXBoU2VydmljZSIsImdldENvbnRleHQiLCJhZGRDb250ZXh0IiwiREFTSEJPQVJEX0NPTlRFWFRfVFlQRSIsImNyZWF0ZVN0YW5kYXJkRGFzaEJvYXJkIiwiY29udGV4dElkIiwiZGFzaGJvYXJkTmFtZSIsImRhc2hib2FyZFR5cGUiLCJhdHRyaWJ1dGVzIiwiYWJzdHJhY3QiLCJhZGRfYXR0ciIsInNlbnNvciIsImNvbm5lY3RlZCIsImZvckVhY2giLCJhdHRyIiwiY2hlY2tlZCIsInB1c2giLCJhYnN0cmFjdE5vZGUiLCJjcmVhdGVOb2RlIiwibmFtZSIsInR5cGUiLCJhZGRDaGlsZEluQ29udGV4dCIsIlJFTEFUSU9OX05BTUUiLCJTUElOQUxfUkVMQVRJT05fVFlQRSIsImdldERhc2hib2FyZEJ5VHlwZSIsImNoaWxkcmVuIiwiZ2V0Q2hpbGRyZW4iLCJyZXMiLCJpIiwibGVuZ3RoIiwiY2hpbGQiLCJnZXQiLCJoYXNEYXNoQm9hcmQiLCJub2RlSWQiLCJFTkRQT0lOVF9SRUxBVElPTl9OQU1FIiwibGlua1RvRGFzaGJvYXJkIiwiZGFzaGJvYXJkSWQiLCJkYXNoYm9hcmRJbmZvIiwiZ2V0SW5mbyIsImVsZW1lbnQiLCJsb2FkIiwiYWRkQ2hpbGQiLCJEQVNIQk9BUkRfVE9fRUxFTUVOVF9SRUxBVElPTiIsImVuZHBvaW50IiwiU3BpbmFsRW5kcG9pbnQiLCJ2YWx1ZSIsInVuaXQiLCJkYXRhVHlwZSIsImdldEFsbERhc2hib2FyZENvbnRleHQiLCJncmFwaCIsImdldEdyYXBoIiwiY29udGV4dHMiLCJpbmZvIl0sIm1hcHBpbmdzIjoiOzs7Ozs7O0FBQUE7O0lB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eC5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCAqIGFzIGRhc2hib2FyZFZhcmlhYmxlcyBmcm9tIFwiLi9nbG9iYWxWYXJpYWJsZXNcIjtcbmltcG9ydCB7XG4gIFNQSU5BTF9SRUxBVElPTl9UWVBFLFxuICBTcGluYWxHcmFwaFNlcnZpY2Vcbn0gZnJvbSBcInNwaW5hbC1lbnYtdmlld2VyLWdyYXBoLXNlcnZpY2VcIjtcblxuaW1wb3J0IHtcbiAgU3BpbmFsRW5kcG9pbnRcbn0gZnJvbSBcInNwaW5hbC1tb2RlbHMtYm1zTmV0d29ya1wiO1xuXG5jb25zdCB7XG4gIEFic3RyYWN0RWxlbWVudFxufSA9IHJlcXVpcmUoXCJzcGluYWwtbW9kZWxzLWJ1aWxkaW5nLWVsZW1lbnRzXCIpO1xuXG5sZXQgZGFzaGJvYXJkU2VydmljZSA9IHtcbiAgY3JlYXRlU3RhbmRhcmREYXNoQm9hcmRDb250ZXh0KGNvbnRleHROYW1lKSB7XG5cbiAgICBsZXQgY29udGV4dCA9IFNwaW5hbEdyYXBoU2VydmljZS5nZXRDb250ZXh0KGNvbnRleHROYW1lKTtcblxuICAgIGlmICh0eXBlb2YgY29udGV4dCAhPT0gXCJ1bmRlZmluZWRcIikgcmV0dXJuIGZhbHNlO1xuXG5cbiAgICByZXR1cm4gU3BpbmFsR3JhcGhTZXJ2aWNlLmFkZENvbnRleHQoY29udGV4dE5hbWUsIGRhc2hib2FyZFZhcmlhYmxlcy5EQVNIQk9BUkRfQ09OVEVYVF9UWVBFLFxuICAgICAgbmV3IEFic3RyYWN0RWxlbWVudChjb250ZXh0TmFtZSkpO1xuXG4gIH0sXG4gIGNyZWF0ZVN0YW5kYXJkRGFzaEJvYXJkKGNvbnRleHRJZCwgZGFzaGJvYXJkTmFtZSwgZGFzaGJvYXJkVHlwZSwgYXR0cmlidXRlcykge1xuICAgIGxldCBhYnN0cmFjdCA9IG5ldyBBYnN0cmFjdEVsZW1lbnQoZGFzaGJvYXJkTmFtZSk7XG5cbiAgICBhYnN0cmFjdC5hZGRfYXR0cih7XG4gICAgICBzZW5zb3I6IFtdLFxuICAgICAgY29ubmVjdGVkOiBbXVxuICAgIH0pO1xuXG4gICAgYXR0cmlidXRlcy5mb3JFYWNoKGF0dHIgPT4ge1xuICAgICAgZGVsZXRlIGF0dHIuY2hlY2tlZDtcbiAgICAgIGFic3RyYWN0LnNlbnNvci5wdXNoKGF0dHIpO1xuICAgIH0pO1xuXG4gICAgbGV0IGFic3RyYWN0Tm9kZSA9IFNwaW5hbEdyYXBoU2VydmljZS5jcmVhdGVOb2RlKHtcbiAgICAgIG5hbWU6IGRhc2hib2FyZE5hbWUsXG4gICAgICB0eXBlOiBkYXNoYm9hcmRUeXBlXG4gICAgfSwgYWJzdHJhY3QpO1xuXG4gICAgU3BpbmFsR3JhcGhTZXJ2aWNlLmFkZENoaWxkSW5Db250ZXh0KFxuICAgICAgY29udGV4dElkLFxuICAgICAgYWJzdHJhY3ROb2RlLFxuICAgICAgY29udGV4dElkLFxuICAgICAgZGFzaGJvYXJkVmFyaWFibGVzLlJFTEFUSU9OX05BTUUsXG4gICAgICBTUElOQUxfUkVMQVRJT05fVFlQRVxuICAgICk7XG4gIH0sXG5cbiAgYXN5bmMgZ2V0RGFzaGJvYXJkQnlUeXBlKGNvbnRleHRJZCwgZGFzaGJvYXJkVHlwZSkge1xuXG4gICAgbGV0IGNoaWxkcmVuID0gYXdhaXQgU3BpbmFsR3JhcGhTZXJ2aWNlLmdldENoaWxkcmVuKGNvbnRleHRJZCxcbiAgICAgIGRhc2hib2FyZFZhcmlhYmxlcy5SRUxBVElPTl9OQU1FKTtcblxuXG4gICAgbGV0IHJlcyA9IFtdO1xuXG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBjaGlsZHJlbi5sZW5ndGg7IGkrKykge1xuICAgICAgY29uc3QgY2hpbGQgPSBjaGlsZHJlbltpXTtcbiAgICAgIGlmIChjaGlsZC50eXBlLmdldCgpID09PSBkYXNoYm9hcmRUeXBlKSB7XG4gICAgICAgIHJlcy5wdXNoKGNoaWxkKTtcbiAgICAgIH1cblxuICAgIH1cblxuICAgIHJldHVybiByZXM7XG5cbiAgfSxcbiAgYXN5bmMgaGFzRGFzaEJvYXJkKG5vZGVJZCkge1xuICAgIGxldCBjaGlsZHJlbiA9IGF3YWl0IFNwaW5hbEdyYXBoU2VydmljZS5nZXRDaGlsZHJlbihub2RlSWQsXG4gICAgICBkYXNoYm9hcmRWYXJpYWJsZXMuRU5EUE9JTlRfUkVMQVRJT05fTkFNRSk7XG5cblxuICAgIHJldHVybiBjaGlsZHJlbi5sZW5ndGggPiAwXG4gIH0sXG4gIGFzeW5jIGxpbmtUb0Rhc2hib2FyZChub2RlSWQsIGRhc2hib2FyZElkKSB7XG5cblxuICAgIGlmIChhd2FpdCBkYXNoYm9hcmRTZXJ2aWNlLmhhc0Rhc2hCb2FyZChub2RlSWQpKSByZXR1cm47XG5cblxuICAgIGxldCBkYXNoYm9hcmRJbmZvID0gU3BpbmFsR3JhcGhTZXJ2aWNlLmdldEluZm8oZGFzaGJvYXJkSWQpO1xuXG4gICAgbGV0IGVsZW1lbnQgPSBhd2FpdCBkYXNoYm9hcmRJbmZvLmVsZW1lbnQubG9hZCgpO1xuXG5cbiAgICAvKiogQWpvdXRlciBpZCBkdSBub2RlIGRhbnMgbGUgZGFzYm9hcmQgKi9cbiAgICAvLyBpZiAoIWVsZW1lbnQuY29ubmVjdGVkKSB7XG4gICAgLy8gICBlbGVtZW50LmFkZF9hdHRyKHtcbiAgICAvLyAgICAgY29ubmVjdGVkOiBbXVxuICAgIC8vICAgfSlcbiAgICAvLyB9XG4gICAgLy8gZWxlbWVudC5jb25uZWN0ZWQucHVzaChub2RlSWQpO1xuICAgIC8qKiAgICAgICBGaW4gICAgICAgICAgICAgKi9cblxuXG4gICAgU3BpbmFsR3JhcGhTZXJ2aWNlLmFkZENoaWxkKGRhc2hib2FyZElkLCBub2RlSWQsIGRhc2hib2FyZFZhcmlhYmxlcy5EQVNIQk9BUkRfVE9fRUxFTUVOVF9SRUxBVElPTixcbiAgICAgIFNQSU5BTF9SRUxBVElPTl9UWVBFKTtcblxuXG4gICAgLyoqIEF0dHJpYnVlciBpZCBkYXNoYm9hcmQgw6AgbCdlbGVtZW50IG5vZGVJZCAqL1xuICAgIC8vIFNwaW5hbEdyYXBoU2VydmljZS5nZXRJbmZvKG5vZGVJZCkuZWxlbWVudC5sb2FkKCkudGhlbihlbCA9PiB7XG4gICAgLy8gICBpZiAoIWVsLmRhc2hib2FyZElkKSB7XG4gICAgLy8gICAgIGVsLmFkZF9hdHRyKHtcbiAgICAvLyAgICAgICBkYXNoYm9hcmRJZDogZGFzaGJvYXJkSWRcbiAgICAvLyAgICAgfSlcbiAgICAvLyAgIH0gZWxzZSB7XG4gICAgLy8gICAgIGVsLmRhc2hib2FyZElkLnNldChkYXNoYm9hcmRJZCk7XG4gICAgLy8gICB9XG4gICAgLy8gfSlcbiAgICAvKiogRmluICovXG5cbiAgICBsZXQgc2Vuc29yID0gZWxlbWVudC5zZW5zb3IuZ2V0KCk7XG5cblxuICAgIC8vIFBvdXIgY2hhcXVlIGVsZW1lbnQgZHUgc2Vuc29yIGFqb3V0ZXIgdW4gZW5kcG9pbnQgw6AgbGEgcmVsYXRpb24gaGFzRW5kcG9pbnRcblxuICAgIHNlbnNvci5mb3JFYWNoKGF0dHIgPT4ge1xuXG4gICAgICBsZXQgZW5kcG9pbnQgPSBuZXcgU3BpbmFsRW5kcG9pbnQoXG4gICAgICAgIGF0dHIubmFtZSxcbiAgICAgICAgXCJTcGluYWxFbmRwb2ludFwiLFxuICAgICAgICBhdHRyLnZhbHVlLFxuICAgICAgICBhdHRyLnVuaXQsXG4gICAgICAgIGF0dHIuZGF0YVR5cGUsXG4gICAgICAgIDAsXG4gICAgICAgIDMwLFxuICAgICAgICBhdHRyLmRhdGFUeXBlXG4gICAgICApXG5cbiAgICAgIGxldCBjaGlsZCA9IFNwaW5hbEdyYXBoU2VydmljZS5jcmVhdGVOb2RlKHtcbiAgICAgICAgbmFtZTogZGFzaGJvYXJkSW5mby5uYW1lLmdldCgpLFxuICAgICAgICB0eXBlOiBkYXNoYm9hcmRJbmZvLnR5cGUuZ2V0KClcbiAgICAgIH0sIGVuZHBvaW50KTtcblxuICAgICAgU3BpbmFsR3JhcGhTZXJ2aWNlLmFkZENoaWxkKG5vZGVJZCwgY2hpbGQsXG4gICAgICAgIGRhc2hib2FyZFZhcmlhYmxlc1xuICAgICAgICAuRU5EUE9JTlRfUkVMQVRJT05fTkFNRSxcbiAgICAgICAgU1BJTkFMX1JFTEFUSU9OX1RZUEUpO1xuICAgIH0pO1xuXG4gIH0sXG4gIGFzeW5jIGdldEFsbERhc2hib2FyZENvbnRleHQoKSB7XG4gICAgbGV0IHJlcyA9IFtdO1xuICAgIGxldCBncmFwaCA9IFNwaW5hbEdyYXBoU2VydmljZS5nZXRHcmFwaCgpO1xuXG4gICAgbGV0IGNvbnRleHRzID0gYXdhaXQgZ3JhcGguZ2V0Q2hpbGRyZW4oW1wiaGFzQ29udGV4dFwiXSk7XG5cbiAgICBjb250ZXh0cy5mb3JFYWNoKGNvbnRleHQgPT4ge1xuICAgICAgaWYgKGNvbnRleHQuaW5mby50eXBlLmdldCgpID09IGRhc2hib2FyZFZhcmlhYmxlcy5EQVNIQk9BUkRfQ09OVEVYVF9UWVBFKSB7XG4gICAgICAgIHJlcy5wdXNoKGNvbnRleHQuaW5mbyk7XG4gICAgICB9XG4gICAgfSlcblxuICAgIHJldHVybiByZXM7XG5cbiAgfVxuXG59XG5cbmV4cG9ydCB7XG4gIGRhc2hib2FyZFNlcnZpY2UsXG4gIGRhc2hib2FyZFZhcmlhYmxlc1xufTsiXX0=