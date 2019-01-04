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
    console.log("link To dashboard");
    dashboardService.unLinkToDashBoard(dashboardId, nodeId, () => {
      let dashboardInfo = _spinalEnvViewerGraphService.SpinalGraphService.getInfo(dashboardId);

      dashboardInfo.element.load().then(element => {
        _spinalEnvViewerGraphService.SpinalGraphService.addChildInContext(dashboardId, nodeId, contextId, dashboardVariables.DASHBOARD_TO_ELEMENT_RELATION, _spinalEnvViewerGraphService.SPINAL_RELATION_TYPE);

        let sensor = element.sensor.get();

        sensor.forEach(attr => {
          let endpoint = new _spinalModelsBmsNetwork.SpinalEndpoint(attr.name, "SpinalEndpoint", attr.value, attr.unit, attr.dataType, 0, 30, attr.dataType);

          let child = _spinalEnvViewerGraphService.SpinalGraphService.createNode({
            name: dashboardInfo.name.get(),
            type: dashboardInfo.type.get()
          }, endpoint);

          _spinalEnvViewerGraphService.SpinalGraphService.addChild(nodeId, child, dashboardVariables.ENDPOINT_RELATION_NAME, _spinalEnvViewerGraphService.SPINAL_RELATION_TYPE);
        });
      });
    });
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
  unLinkToDashBoard(dashboardId, nodeId, callback) {
    console.log("unLinkMethod called");
    dashboardService.hasDashBoard(nodeId).then(el => {
      if (el) {
        console.log("has Dashboard");
        dashboardService.removeAllEndpoints(nodeId).then(() => {
          console.log("now remove dashboard connected");
          _spinalEnvViewerGraphService.SpinalGraphService.removeChild(dashboardId, nodeId, dashboardVariables.DASHBOARD_TO_ELEMENT_RELATION, _spinalEnvViewerGraphService.SPINAL_RELATION_TYPE).then(() => {
            console.log("call callback");

            callback();
          }, error => {
            console.log("error", error);
          });
        });
      } else {
        console.log("has not dashboard");
        callback();
      }
    });
  },
  removeAllEndpoints(nodeId) {
    console.log("remove all endpoints called");
    return _spinalEnvViewerGraphService.SpinalGraphService.getChildren(nodeId, [dashboardVariables.ENDPOINT_RELATION_NAME]).then(endpoints => {
      for (let i = 0; i < endpoints.length; i++) {
        _spinalEnvViewerGraphService.SpinalGraphService.removeChild(nodeId, endpoints[i].id.get(), dashboardVariables.ENDPOINT_RELATION_NAME, _spinalEnvViewerGraphService.SPINAL_RELATION_TYPE);
      }

      console.log("all endpoints removed");
      return;
    });
  }
};

exports.dashboardService = dashboardService;
exports.dashboardVariables = dashboardVariables;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9pbmRleC5qcyJdLCJuYW1lcyI6WyJkYXNoYm9hcmRWYXJpYWJsZXMiLCJBYnN0cmFjdEVsZW1lbnQiLCJyZXF1aXJlIiwiZGFzaGJvYXJkU2VydmljZSIsImNyZWF0ZVN0YW5kYXJkRGFzaEJvYXJkQ29udGV4dCIsImNvbnRleHROYW1lIiwiY29udGV4dCIsIlNwaW5hbEdyYXBoU2VydmljZSIsImdldENvbnRleHQiLCJhZGRDb250ZXh0IiwiREFTSEJPQVJEX0NPTlRFWFRfVFlQRSIsImNyZWF0ZVN0YW5kYXJkRGFzaEJvYXJkIiwiY29udGV4dElkIiwiZGFzaGJvYXJkTmFtZSIsImRhc2hib2FyZFR5cGUiLCJhdHRyaWJ1dGVzIiwiYWJzdHJhY3QiLCJhZGRfYXR0ciIsInNlbnNvciIsImNvbm5lY3RlZCIsImZvckVhY2giLCJhdHRyIiwiY2hlY2tlZCIsInB1c2giLCJhYnN0cmFjdE5vZGUiLCJjcmVhdGVOb2RlIiwibmFtZSIsInR5cGUiLCJhZGRDaGlsZEluQ29udGV4dCIsIlJFTEFUSU9OX05BTUUiLCJTUElOQUxfUkVMQVRJT05fVFlQRSIsImdldERhc2hib2FyZEJ5VHlwZSIsImdldENoaWxkcmVuIiwidGhlbiIsImNoaWxkcmVuIiwicmVzIiwiaSIsImxlbmd0aCIsImNoaWxkIiwiZ2V0IiwiaGFzRGFzaEJvYXJkIiwibm9kZUlkIiwiRU5EUE9JTlRfUkVMQVRJT05fTkFNRSIsImxpbmtUb0Rhc2hib2FyZCIsImRhc2hib2FyZElkIiwiY29uc29sZSIsImxvZyIsInVuTGlua1RvRGFzaEJvYXJkIiwiZGFzaGJvYXJkSW5mbyIsImdldEluZm8iLCJlbGVtZW50IiwibG9hZCIsIkRBU0hCT0FSRF9UT19FTEVNRU5UX1JFTEFUSU9OIiwiZW5kcG9pbnQiLCJTcGluYWxFbmRwb2ludCIsInZhbHVlIiwidW5pdCIsImRhdGFUeXBlIiwiYWRkQ2hpbGQiLCJnZXRBbGxEYXNoYm9hcmRDb250ZXh0IiwiZ3JhcGgiLCJnZXRHcmFwaCIsImNvbnRleHRzIiwiaW5mbyIsImNhbGxiYWNrIiwiZWwiLCJyZW1vdmVBbGxFbmRwb2ludHMiLCJyZW1vdmVDaGlsZCIsImVycm9yIiwiZW5kcG9pbnRzIiwiaWQiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7QUFBQTs7SUFBWUEsa0I7O0FBQ1o7O0FBS0E7Ozs7QUFJQSxNQUFNO0FBQ0pDO0FBREksSUFFRkMsUUFBUSxpQ0FBUixDQUZKOztBQUlBLElBQUlDLG1CQUFtQjtBQUNyQkMsaUNBQStCQyxXQUEvQixFQUE0QztBQUMxQyxRQUFJQyxVQUFVQyxnREFBbUJDLFVBQW5CLENBQThCSCxXQUE5QixDQUFkOztBQUVBLFFBQUksT0FBT0MsT0FBUCxLQUFtQixXQUF2QixFQUFvQyxPQUFPLEtBQVA7O0FBRXBDLFdBQU9DLGdEQUFtQkUsVUFBbkIsQ0FDTEosV0FESyxFQUVMTCxtQkFBbUJVLHNCQUZkLEVBR0wsSUFBSVQsZUFBSixDQUFvQkksV0FBcEIsQ0FISyxDQUFQO0FBS0QsR0FYb0I7QUFZckJNLDBCQUF3QkMsU0FBeEIsRUFBbUNDLGFBQW5DLEVBQWtEQyxhQUFsRCxFQUFpRUMsVUFBakUsRUFBNkU7QUFDM0UsUUFBSUMsV0FBVyxJQUFJZixlQUFKLENBQW9CWSxhQUFwQixDQUFmOztBQUVBRyxhQUFTQyxRQUFULENBQWtCO0FBQ2hCQyxjQUFRLEVBRFE7QUFFaEJDLGlCQUFXO0FBRkssS0FBbEI7O0FBS0FKLGVBQVdLLE9BQVgsQ0FBbUJDLFFBQVE7QUFDekIsYUFBT0EsS0FBS0MsT0FBWjtBQUNBTixlQUFTRSxNQUFULENBQWdCSyxJQUFoQixDQUFxQkYsSUFBckI7QUFDRCxLQUhEOztBQUtBLFFBQUlHLGVBQWVqQixnREFBbUJrQixVQUFuQixDQUE4QjtBQUM3Q0MsWUFBTWIsYUFEdUM7QUFFN0NjLFlBQU1iO0FBRnVDLEtBQTlCLEVBSWpCRSxRQUppQixDQUFuQjs7QUFPQVQsb0RBQW1CcUIsaUJBQW5CLENBQ0VoQixTQURGLEVBRUVZLFlBRkYsRUFHRVosU0FIRixFQUlFWixtQkFBbUI2QixhQUpy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QyxFQUFiLENBQWdCL0IsR0FBaEIsRUFGRixFQUdFdkMsbUJBQW1CMEMsc0JBSHJCLEVBSUVaLGlEQUpGO0FBTUQ7O0FBRURlLGNBQVFDLEdBQVIsQ0FBWSx1QkFBWjtBQUNBO0FBQ0QsS0FkTSxDQUFQO0FBZUQ7QUE5S29CLENBQXZCOztRQWtMRTNDLGdCLEdBQUFBLGdCO1FBQ0FILGtCLEdBQUFBLGtCIiwiZmlsZSI6ImluZGV4LmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0ICogYXMgZGFzaGJvYXJkVmFyaWFibGVzIGZyb20gXCIuL2dsb2JhbFZhcmlhYmxlc1wiO1xuaW1wb3J0IHtcbiAgU1BJTkFMX1JFTEFUSU9OX1RZUEUsXG4gIFNwaW5hbEdyYXBoU2VydmljZVxufSBmcm9tIFwic3BpbmFsLWVudi12aWV3ZXItZ3JhcGgtc2VydmljZVwiO1xuXG5pbXBvcnQge1xuICBTcGluYWxFbmRwb2ludFxufSBmcm9tIFwic3BpbmFsLW1vZGVscy1ibXNOZXR3b3JrXCI7XG5cbmNvbnN0IHtcbiAgQWJzdHJhY3RFbGVtZW50XG59ID0gcmVxdWlyZShcInNwaW5hbC1tb2RlbHMtYnVpbGRpbmctZWxlbWVudHNcIik7XG5cbmxldCBkYXNoYm9hcmRTZXJ2aWNlID0ge1xuICBjcmVhdGVTdGFuZGFyZERhc2hCb2FyZENvbnRleHQoY29udGV4dE5hbWUpIHtcbiAgICBsZXQgY29udGV4dCA9IFNwaW5hbEdyYXBoU2VydmljZS5nZXRDb250ZXh0KGNvbnRleHROYW1lKTtcblxuICAgIGlmICh0eXBlb2YgY29udGV4dCAhPT0gXCJ1bmRlZmluZWRcIikgcmV0dXJuIGZhbHNlO1xuXG4gICAgcmV0dXJuIFNwaW5hbEdyYXBoU2VydmljZS5hZGRDb250ZXh0KFxuICAgICAgY29udGV4dE5hbWUsXG4gICAgICBkYXNoYm9hcmRWYXJpYWJsZXMuREFTSEJPQVJEX0NPTlRFWFRfVFlQRSxcbiAgICAgIG5ldyBBYnN0cmFjdEVsZW1lbnQoY29udGV4dE5hbWUpXG4gICAgKTtcbiAgfSxcbiAgY3JlYXRlU3RhbmRhcmREYXNoQm9hcmQoY29udGV4dElkLCBkYXNoYm9hcmROYW1lLCBkYXNoYm9hcmRUeXBlLCBhdHRyaWJ1dGVzKSB7XG4gICAgbGV0IGFic3RyYWN0ID0gbmV3IEFic3RyYWN0RWxlbWVudChkYXNoYm9hcmROYW1lKTtcblxuICAgIGFic3RyYWN0LmFkZF9hdHRyKHtcbiAgICAgIHNlbnNvcjogW10sXG4gICAgICBjb25uZWN0ZWQ6IFtdXG4gICAgfSk7XG5cbiAgICBhdHRyaWJ1dGVzLmZvckVhY2goYXR0ciA9PiB7XG4gICAgICBkZWxldGUgYXR0ci5jaGVja2VkO1xuICAgICAgYWJzdHJhY3Quc2Vuc29yLnB1c2goYXR0cik7XG4gICAgfSk7XG5cbiAgICBsZXQgYWJzdHJhY3ROb2RlID0gU3BpbmFsR3JhcGhTZXJ2aWNlLmNyZWF0ZU5vZGUoe1xuICAgICAgICBuYW1lOiBkYXNoYm9hcmROYW1lLFxuICAgICAgICB0eXBlOiBkYXNoYm9hcmRUeXBlXG4gICAgICB9LFxuICAgICAgYWJzdHJhY3RcbiAgICApO1xuXG4gICAgU3BpbmFsR3JhcGhTZXJ2aWNlLmFkZENoaWxkSW5Db250ZXh0KFxuICAgICAgY29udGV4dElkLFxuICAgICAgYWJzdHJhY3ROb2RlLFxuICAgICAgY29udGV4dElkLFxuICAgICAgZGFzaGJvYXJkVmFyaWFibGVzLlJFTEFUSU9OX05BTUUsXG4gICAgICBTUElOQUxfUkVMQVRJT05fVFlQRVxuICAgICk7XG4gIH0sXG5cbiAgZ2V0RGFzaGJvYXJkQnlUeXBlKGNvbnRleHRJZCwgZGFzaGJvYXJkVHlwZSkge1xuICAgIHJldHVybiBTcGluYWxHcmFwaFNlcnZpY2UuZ2V0Q2hpbGRyZW4oXG4gICAgICBjb250ZXh0SWQsXG4gICAgICBkYXNoYm9hcmRWYXJpYWJsZXMuUkVMQVRJT05fTkFNRVxuICAgICkudGhlbihjaGlsZHJlbiA9PiB7XG4gICAgICBsZXQgcmVzID0gW107XG5cbiAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgY2hpbGRyZW4ubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgY29uc3QgY2hpbGQgPSBjaGlsZHJlbltpXTtcbiAgICAgICAgaWYgKGNoaWxkLnR5cGUuZ2V0KCkgPT09IGRhc2hib2FyZFR5cGUpIHtcbiAgICAgICAgICByZXMucHVzaChjaGlsZCk7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgcmV0dXJuIHJlcztcbiAgICB9KTtcbiAgfSxcbiAgaGFzRGFzaEJvYXJkKG5vZGVJZCkge1xuICAgIHJldHVybiBTcGluYWxHcmFwaFNlcnZpY2UuZ2V0Q2hpbGRyZW4oXG4gICAgICBub2RlSWQsXG4gICAgICBkYXNoYm9hcmRWYXJpYWJsZXMuRU5EUE9JTlRfUkVMQVRJT05fTkFNRVxuICAgICkudGhlbihjaGlsZHJlbiA9PiB7XG4gICAgICByZXR1cm4gY2hpbGRyZW4ubGVuZ3RoID4gMDtcbiAgICB9KTtcbiAgfSxcbiAgbGlua1RvRGFzaGJvYXJkKGNvbnRleHRJZCwgbm9kZUlkLCBkYXNoYm9hcmRJZCkge1xuICAgIGNvbnNvbGUubG9nKFwibGluayBUbyBkYXNoYm9hcmRcIik7XG4gICAgZGFzaGJvYXJkU2VydmljZS51bkxpbmtUb0Rhc2hCb2FyZChkYXNoYm9hcmRJZCwgbm9kZUlkLCAoKSA9PiB7XG4gICAgICBsZXQgZGFzaGJvYXJkSW5mbyA9IFNwaW5hbEdyYXBoU2VydmljZS5nZXRJbmZvKGRhc2hib2FyZElkKTtcblxuICAgICAgZGFzaGJvYXJkSW5mby5lbGVtZW50LmxvYWQoKS50aGVuKGVsZW1lbnQgPT4ge1xuICAgICAgICBTcGluYWxHcmFwaFNlcnZpY2UuYWRkQ2hpbGRJbkNvbnRleHQoXG4gICAgICAgICAgZGFzaGJvYXJkSWQsXG4gICAgICAgICAgbm9kZUlkLFxuICAgICAgICAgIGNvbnRleHRJZCxcbiAgICAgICAgICBkYXNoYm9hcmRWYXJpYWJsZXMuREFTSEJPQVJEX1RPX0VMRU1FTlRfUkVMQVRJT04sXG4gICAgICAgICAgU1BJTkFMX1JFTEFUSU9OX1RZUEVcbiAgICAgICAgKTtcblxuICAgICAgICBsZXQgc2Vuc29yID0gZWxlbWVudC5zZW5zb3IuZ2V0KCk7XG5cbiAgICAgICAgc2Vuc29yLmZvckVhY2goYXR0ciA9PiB7XG4gICAgICAgICAgbGV0IGVuZHBvaW50ID0gbmV3IFNwaW5hbEVuZHBvaW50KFxuICAgICAgICAgICAgYXR0ci5uYW1lLFxuICAgICAgICAgICAgXCJTcGluYWxFbmRwb2ludFwiLFxuICAgICAgICAgICAgYXR0ci52YWx1ZSxcbiAgICAgICAgICAgIGF0dHIudW5pdCxcbiAgICAgICAgICAgIGF0dHIuZGF0YVR5cGUsXG4gICAgICAgICAgICAwLFxuICAgICAgICAgICAgMzAsXG4gICAgICAgICAgICBhdHRyLmRhdGFUeXBlXG4gICAgICAgICAgKTtcblxuICAgICAgICAgIGxldCBjaGlsZCA9IFNwaW5hbEdyYXBoU2VydmljZS5jcmVhdGVOb2RlKHtcbiAgICAgICAgICAgICAgbmFtZTogZGFzaGJvYXJkSW5mby5uYW1lLmdldCgpLFxuICAgICAgICAgICAgICB0eXBlOiBkYXNoYm9hcmRJbmZvLnR5cGUuZ2V0KClcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBlbmRwb2ludFxuICAgICAgICAgICk7XG5cbiAgICAgICAgICBTcGluYWxHcmFwaFNlcnZpY2UuYWRkQ2hpbGQoXG4gICAgICAgICAgICBub2RlSWQsXG4gICAgICAgICAgICBjaGlsZCxcbiAgICAgICAgICAgIGRhc2hib2FyZFZhcmlhYmxlcy5FTkRQT0lOVF9SRUxBVElPTl9OQU1FLFxuICAgICAgICAgICAgU1BJTkFMX1JFTEFUSU9OX1RZUEVcbiAgICAgICAgICApO1xuICAgICAgICB9KTtcbiAgICAgIH0pO1xuICAgIH0pO1xuICB9LFxuICBnZXRBbGxEYXNoYm9hcmRDb250ZXh0KCkge1xuICAgIGxldCBncmFwaCA9IFNwaW5hbEdyYXBoU2VydmljZS5nZXRHcmFwaCgpO1xuXG4gICAgcmV0dXJuIGdyYXBoLmdldENoaWxkcmVuKFtcImhhc0NvbnRleHRcIl0pLnRoZW4oY29udGV4dHMgPT4ge1xuICAgICAgbGV0IHJlcyA9IFtdO1xuXG4gICAgICBjb250ZXh0cy5mb3JFYWNoKGNvbnRleHQgPT4ge1xuICAgICAgICBpZiAoXG4gICAgICAgICAgY29udGV4dC5pbmZvLnR5cGUuZ2V0KCkgPT0gZGFzaGJvYXJkVmFyaWFibGVzLkRBU0hCT0FSRF9DT05URVhUX1RZUEVcbiAgICAgICAgKSB7XG4gICAgICAgICAgcmVzLnB1c2goY29udGV4dC5pbmZvKTtcbiAgICAgICAgfVxuICAgICAgfSk7XG5cbiAgICAgIHJldHVybiByZXM7XG4gICAgfSk7XG4gIH0sXG4gIHVuTGlua1RvRGFzaEJvYXJkKGRhc2hib2FyZElkLCBub2RlSWQsIGNhbGxiYWNrKSB7XG4gICAgY29uc29sZS5sb2coXCJ1bkxpbmtNZXRob2QgY2FsbGVkXCIpO1xuICAgIGRhc2hib2FyZFNlcnZpY2UuaGFzRGFzaEJvYXJkKG5vZGVJZCkudGhlbihlbCA9PiB7XG4gICAgICBpZiAoZWwpIHtcbiAgICAgICAgY29uc29sZS5sb2coXCJoYXMgRGFzaGJvYXJkXCIpO1xuICAgICAgICBkYXNoYm9hcmRTZXJ2aWNlLnJlbW92ZUFsbEVuZHBvaW50cyhub2RlSWQpLnRoZW4oKCkgPT4ge1xuICAgICAgICAgIGNvbnNvbGUubG9nKFwibm93IHJlbW92ZSBkYXNoYm9hcmQgY29ubmVjdGVkXCIpO1xuICAgICAgICAgIFNwaW5hbEdyYXBoU2VydmljZS5yZW1vdmVDaGlsZChcbiAgICAgICAgICAgIGRhc2hib2FyZElkLFxuICAgICAgICAgICAgbm9kZUlkLFxuICAgICAgICAgICAgZGFzaGJvYXJkVmFyaWFibGVzLkRBU0hCT0FSRF9UT19FTEVNRU5UX1JFTEFUSU9OLFxuICAgICAgICAgICAgU1BJTkFMX1JFTEFUSU9OX1RZUEVcbiAgICAgICAgICApLnRoZW4oXG4gICAgICAgICAgICAoKSA9PiB7XG4gICAgICAgICAgICAgIGNvbnNvbGUubG9nKFwiY2FsbCBjYWxsYmFja1wiKTtcblxuICAgICAgICAgICAgICBjYWxsYmFjaygpO1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIGVycm9yID0+IHtcbiAgICAgICAgICAgICAgY29uc29sZS5sb2coXCJlcnJvclwiLCBlcnJvcik7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgKTtcbiAgICAgICAgfSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBjb25zb2xlLmxvZyhcImhhcyBub3QgZGFzaGJvYXJkXCIpO1xuICAgICAgICBjYWxsYmFjaygpO1xuICAgICAgfVxuICAgIH0pO1xuICB9LFxuICByZW1vdmVBbGxFbmRwb2ludHMobm9kZUlkKSB7XG4gICAgY29uc29sZS5sb2coXCJyZW1vdmUgYWxsIGVuZHBvaW50cyBjYWxsZWRcIik7XG4gICAgcmV0dXJuIFNwaW5hbEdyYXBoU2VydmljZS5nZXRDaGlsZHJlbihub2RlSWQsIFtcbiAgICAgIGRhc2hib2FyZFZhcmlhYmxlcy5FTkRQT0lOVF9SRUxBVElPTl9OQU1FXG4gICAgXSkudGhlbihlbmRwb2ludHMgPT4ge1xuICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBlbmRwb2ludHMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgU3BpbmFsR3JhcGhTZXJ2aWNlLnJlbW92ZUNoaWxkKFxuICAgICAgICAgIG5vZGVJZCxcbiAgICAgICAgICBlbmRwb2ludHNbaV0uaWQuZ2V0KCksXG4gICAgICAgICAgZGFzaGJvYXJkVmFyaWFibGVzLkVORFBPSU5UX1JFTEFUSU9OX05BTUUsXG4gICAgICAgICAgU1BJTkFMX1JFTEFUSU9OX1RZUEVcbiAgICAgICAgKTtcbiAgICAgIH1cblxuICAgICAgY29uc29sZS5sb2coXCJhbGwgZW5kcG9pbnRzIHJlbW92ZWRcIik7XG4gICAgICByZXR1cm47XG4gICAgfSk7XG4gIH1cbn07XG5cbmV4cG9ydCB7XG4gIGRhc2hib2FyZFNlcnZpY2UsXG4gIGRhc2hib2FyZFZhcmlhYmxlc1xufTsiXX0=