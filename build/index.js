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

const {
  AbstractElement
} = require("spinal-models-building-elements");

// import {
//   SpinalEndpoint
// } from "spinal-models-bmsNetwork";

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
    dashboardService.unLinkToDashBoard(dashboardId, nodeId, el => {

      let dashboardInfo = _spinalEnvViewerGraphService.SpinalGraphService.getInfo(dashboardId);

      dashboardInfo.element.load().then(element => {
        if (!el) {
          _spinalEnvViewerGraphService.SpinalGraphService.addChildInContext(dashboardId, nodeId, contextId, dashboardVariables.DASHBOARD_TO_ELEMENT_RELATION, _spinalEnvViewerGraphService.SPINAL_RELATION_TYPE);
        }

        let sensor = element.sensor.get();

        sensor.forEach(attr => {
          // let endpoint = new SpinalEndpoint(
          //   attr.name,
          //   "SpinalEndpoint",
          //   attr.value,
          //   attr.unit,
          //   attr.dataType,
          //   0,
          //   30,
          //   attr.dataType
          // );

          let endpoint = new _spinalModelBmsnetwork.SpinalBmsEndpoint(attr.name, "SpinalEndpoint_Path", attr.value, attr.unit, attr.dataType, attr.type);

          let child = _spinalEnvViewerGraphService.SpinalGraphService.createNode({
            name: attr.name,
            type: attr.type
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
    // dashboardService.hasDashBoard(nodeId).then(el => {
    //   if (el) {
    //     console.log("has Dashboard");
    //     dashboardService.removeAllEndpoints(nodeId).then(() => {

    //       console.log("now remove dashboard connected");
    //       SpinalGraphService.removeChild(
    //         dashboardId,
    //         nodeId,
    //         dashboardVariables.DASHBOARD_TO_ELEMENT_RELATION,
    //         SPINAL_RELATION_TYPE
    //       ).then(
    //         (el) => {
    //           console.log("call callback", el);

    //           callback();
    //         },
    //         error => {
    //           console.log("error", error);
    //         }
    //       );
    //     });
    //   } else {
    //     console.log("has not dashboard");
    //     callback();
    //   }
    // });
    _spinalEnvViewerGraphService.SpinalGraphService.getChildren(nodeId, [dashboardVariables.ENDPOINT_RELATION_NAME]).then(el => {

      if (el.length > 0) {
        let oldDash = el[0].id.get();

        console.log("has Dashboard");
        dashboardService.removeAllEndpoints(nodeId).then(() => {

          console.log("now remove dashboard connected");
          // SpinalGraphService.removeChild(
          //   dashboardId,
          //   nodeId,
          //   dashboardVariables.DASHBOARD_TO_ELEMENT_RELATION,
          //   SPINAL_RELATION_TYPE
          // ).then(
          //   (el) => {
          //     console.log("call callback", el);

          //     callback();
          //   },
          //   error => {
          //     console.log("error", error);
          //   }
          // );

          _spinalEnvViewerGraphService.SpinalGraphService.moveChild(oldDash, dashboardId, nodeId, dashboardVariables.DASHBOARD_TO_ELEMENT_RELATION, _spinalEnvViewerGraphService.SPINAL_RELATION_TYPE).then(el => {
            if (el) {
              console.log("before callback", el);

              callback(true);
            }
          });
        });
      } else {
        callback(false);
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9pbmRleC5qcyJdLCJuYW1lcyI6WyJkYXNoYm9hcmRWYXJpYWJsZXMiLCJBYnN0cmFjdEVsZW1lbnQiLCJyZXF1aXJlIiwiZGFzaGJvYXJkU2VydmljZSIsImNyZWF0ZVN0YW5kYXJkRGFzaEJvYXJkQ29udGV4dCIsImNvbnRleHROYW1lIiwiY29udGV4dCIsIlNwaW5hbEdyYXBoU2VydmljZSIsImdldENvbnRleHQiLCJhZGRDb250ZXh0IiwiREFTSEJPQVJEX0NPTlRFWFRfVFlQRSIsImNyZWF0ZVN0YW5kYXJkRGFzaEJvYXJkIiwiY29udGV4dElkIiwiZGFzaGJvYXJkTmFtZSIsImRhc2hib2FyZFR5cGUiLCJhdHRyaWJ1dGVzIiwiYWJzdHJhY3QiLCJhZGRfYXR0ciIsInNlbnNvciIsImNvbm5lY3RlZCIsImZvckVhY2giLCJhdHRyIiwiY2hlY2tlZCIsInB1c2giLCJhYnN0cmFjdE5vZGUiLCJjcmVhdGVOb2RlIiwibmFtZSIsInR5cGUiLCJhZGRDaGlsZEluQ29udGV4dCIsIlJFTEFUSU9OX05BTUUiLCJTUElOQUxfUkVMQVRJT05fVFlQRSIsImdldERhc2hib2FyZEJ5VHlwZSIsImdldENoaWxkcmVuIiwidGhlbiIsImNoaWxkcmVuIiwicmVzIiwiaSIsImxlbmd0aCIsImNoaWxkIiwiZ2V0IiwiaGFzRGFzaEJvYXJkIiwibm9kZUlkIiwiRU5EUE9JTlRfUkVMQVRJT05fTkFNRSIsImxpbmtUb0Rhc2hib2FyZCIsImRhc2hib2FyZElkIiwidW5MaW5rVG9EYXNoQm9hcmQiLCJlbCIsImRhc2hib2FyZEluZm8iLCJnZXRJbmZvIiwiZWxlbWVudCIsImxvYWQiLCJEQVNIQk9BUkRfVE9fRUxFTUVOVF9SRUxBVElPTiIsImVuZHBvaW50IiwiU3BpbmFsQm1zRW5kcG9pbnQiLCJ2YWx1ZSIsInVuaXQiLCJkYXRhVHlwZSIsImFkZENoaWxkIiwiZ2V0QWxsRGFzaGJvYXJkQ29udGV4dCIsImdyYXBoIiwiZ2V0R3JhcGgiLCJjb250ZXh0cyIsImluZm8iLCJjYWxsYmFjayIsImNvbnNvbGUiLCJsb2ciLCJvbGREYXNoIiwiaWQiLCJyZW1vdmVBbGxFbmRwb2ludHMiLCJtb3ZlQ2hpbGQiLCJlbmRwb2ludHMiLCJyZW1vdmVDaGlsZCJdLCJtYXBwaW5ncyI6Ijs7Ozs7OztBQUFBOztJQUFZQSxrQjs7QUFDWjs7QUFTQTs7OztBQUlBLE1BQU07QUFDSkM7QUFESSxJQUVGQyxRQUFRLGlDQUFSLENBRko7O0FBUkE7QUFDQTtBQUNBOztBQVVBLElBQUlDLG1CQUFtQjtBQUNyQkMsaUNBQStCQyxXQUEvQixFQUE0QztBQUMxQyxRQUFJQyxVQUFVQyxnREFBbUJDLFVBQW5CLENBQThCSCxXQUE5QixDQUFkOztBQUVBLFFBQUksT0FBT0MsT0FBUCxLQUFtQixXQUF2QixFQUFvQyxPQUFPLEtBQVA7O0FBRXBDLFdBQU9DLGdEQUFtQkUsVUFBbkIsQ0FDTEosV0FESyxFQUVMTCxtQkFBbUJVLHNCQUZkLEVBR0wsSUFBSVQsZUFBSixDQUFvQkksV0FBcEIsQ0FISyxDQUFQO0FBS0QsR0FYb0I7QUFZckJNLDBCQUF3QkMsU0FBeEIsRUFBbUNDLGFBQW5DLEVBQWtEQyxhQUFsRCxFQUFpRUMsVUFBakUsRUFBNkU7QUFDM0UsUUFBSUMsV0FBVyxJQUFJZixlQUFKLENBQW9CWSxhQUFwQixDQUFmOztBQUVBRyxhQUFTQyxRQUFULENBQWtCO0FBQ2hCQyxjQUFRLEVBRFE7QUFFaEJDLGlCQUFXO0FBRkssS0FBbEI7O0FBS0FKLGVBQVdLLE9BQVgsQ0FBbUJDLFFBQVE7QUFDekIsYUFBT0EsS0FBS0MsT0FBWjtBQUNBTixlQUFTRSxNQUFULENBQWdCSyxJQUFoQixDQUFxQkYsSUFBckI7QUFDRCxLQUhEOztBQUtBLFFBQUlHLGVBQWVqQixnREFBbUJrQixVQUFuQixDQUE4QjtBQUM3Q0MsWUFBTWIsYUFEdUM7QUFFN0NjLFlBQU1iO0FBRnVDLEtBQTlCLEVBSWpCRSxRQUppQixDQUFuQjs7QUFPQVQsb0RBQW1CcUIsaUJBQW5CLENBQ0VoQixTQURGLEVBRUVZLFlB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LE1Bb0NPO0FBQ0xBLGlCQUFTLEtBQVQ7QUFDRDtBQUtGLEtBL0NIO0FBZ0RELEdBcE5vQjtBQXFOckJLLHFCQUFtQjNCLE1BQW5CLEVBQTJCOztBQUV6QnVCLFlBQVFDLEdBQVIsQ0FBWSw2QkFBWjtBQUNBLFdBQU8xRCxnREFBbUJ5QixXQUFuQixDQUErQlMsTUFBL0IsRUFBdUMsQ0FDNUN6QyxtQkFBbUIwQyxzQkFEeUIsQ0FBdkMsRUFFSlQsSUFGSSxDQUVDcUMsYUFBYTtBQUNuQixXQUFLLElBQUlsQyxJQUFJLENBQWIsRUFBZ0JBLElBQUlrQyxVQUFVakMsTUFBOUIsRUFBc0NELEdBQXRDLEVBQTJDO0FBQ3pDN0Isd0RBQW1CZ0UsV0FBbkIsQ0FDRTlCLE1BREYsRUFFRTZCLFVBQVVsQyxDQUFWLEVBQWErQixFQUFiLENBQWdCNUIsR0FBaEIsRUFGRixFQUdFdkMsbUJBQW1CMEMsc0JBSHJCLEVBSUVaLGlEQUpGO0FBTUQ7O0FBRURrQyxjQUFRQyxHQUFSLENBQVksdUJBQVo7QUFDQTtBQUNELEtBZE0sQ0FBUDtBQWVEO0FBdk9vQixDQUF2Qjs7UUEyT0U5RCxnQixHQUFBQSxnQjtRQUNBSCxrQixHQUFBQSxrQiIsImZpbGUiOiJpbmRleC5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCAqIGFzIGRhc2hib2FyZFZhcmlhYmxlcyBmcm9tIFwiLi9nbG9iYWxWYXJpYWJsZXNcIjtcbmltcG9ydCB7XG4gIFNQSU5BTF9SRUxBVElPTl9UWVBFLFxuICBTcGluYWxHcmFwaFNlcnZpY2Vcbn0gZnJvbSBcInNwaW5hbC1lbnYtdmlld2VyLWdyYXBoLXNlcnZpY2VcIjtcblxuLy8gaW1wb3J0IHtcbi8vICAgU3BpbmFsRW5kcG9pbnRcbi8vIH0gZnJvbSBcInNwaW5hbC1tb2RlbHMtYm1zTmV0d29ya1wiO1xuXG5pbXBvcnQge1xuICBTcGluYWxCbXNFbmRwb2ludFxufSBmcm9tIFwic3BpbmFsLW1vZGVsLWJtc25ldHdvcmtcIjtcblxuY29uc3Qge1xuICBBYnN0cmFjdEVsZW1lbnRcbn0gPSByZXF1aXJlKFwic3BpbmFsLW1vZGVscy1idWlsZGluZy1lbGVtZW50c1wiKTtcblxubGV0IGRhc2hib2FyZFNlcnZpY2UgPSB7XG4gIGNyZWF0ZVN0YW5kYXJkRGFzaEJvYXJkQ29udGV4dChjb250ZXh0TmFtZSkge1xuICAgIGxldCBjb250ZXh0ID0gU3BpbmFsR3JhcGhTZXJ2aWNlLmdldENvbnRleHQoY29udGV4dE5hbWUpO1xuXG4gICAgaWYgKHR5cGVvZiBjb250ZXh0ICE9PSBcInVuZGVmaW5lZFwiKSByZXR1cm4gZmFsc2U7XG5cbiAgICByZXR1cm4gU3BpbmFsR3JhcGhTZXJ2aWNlLmFkZENvbnRleHQoXG4gICAgICBjb250ZXh0TmFtZSxcbiAgICAgIGRhc2hib2FyZFZhcmlhYmxlcy5EQVNIQk9BUkRfQ09OVEVYVF9UWVBFLFxuICAgICAgbmV3IEFic3RyYWN0RWxlbWVudChjb250ZXh0TmFtZSlcbiAgICApO1xuICB9LFxuICBjcmVhdGVTdGFuZGFyZERhc2hCb2FyZChjb250ZXh0SWQsIGRhc2hib2FyZE5hbWUsIGRhc2hib2FyZFR5cGUsIGF0dHJpYnV0ZXMpIHtcbiAgICBsZXQgYWJzdHJhY3QgPSBuZXcgQWJzdHJhY3RFbGVtZW50KGRhc2hib2FyZE5hbWUpO1xuXG4gICAgYWJzdHJhY3QuYWRkX2F0dHIoe1xuICAgICAgc2Vuc29yOiBbXSxcbiAgICAgIGNvbm5lY3RlZDogW11cbiAgICB9KTtcblxuICAgIGF0dHJpYnV0ZXMuZm9yRWFjaChhdHRyID0+IHtcbiAgICAgIGRlbGV0ZSBhdHRyLmNoZWNrZWQ7XG4gICAgICBhYnN0cmFjdC5zZW5zb3IucHVzaChhdHRyKTtcbiAgICB9KTtcblxuICAgIGxldCBhYnN0cmFjdE5vZGUgPSBTcGluYWxHcmFwaFNlcnZpY2UuY3JlYXRlTm9kZSh7XG4gICAgICAgIG5hbWU6IGRhc2hib2FyZE5hbWUsXG4gICAgICAgIHR5cGU6IGRhc2hib2FyZFR5cGVcbiAgICAgIH0sXG4gICAgICBhYnN0cmFjdFxuICAgICk7XG5cbiAgICBTcGluYWxHcmFwaFNlcnZpY2UuYWRkQ2hpbGRJbkNvbnRleHQoXG4gICAgICBjb250ZXh0SWQsXG4gICAgICBhYnN0cmFjdE5vZGUsXG4gICAgICBjb250ZXh0SWQsXG4gICAgICBkYXNoYm9hcmRWYXJpYWJsZXMuUkVMQVRJT05fTkFNRSxcbiAgICAgIFNQSU5BTF9SRUxBVElPTl9UWVBFXG4gICAgKTtcbiAgfSxcblxuICBnZXREYXNoYm9hcmRCeVR5cGUoY29udGV4dElkLCBkYXNoYm9hcmRUeXBlKSB7XG4gICAgcmV0dXJuIFNwaW5hbEdyYXBoU2VydmljZS5nZXRDaGlsZHJlbihcbiAgICAgIGNvbnRleHRJZCxcbiAgICAgIGRhc2hib2FyZFZhcmlhYmxlcy5SRUxBVElPTl9OQU1FXG4gICAgKS50aGVuKGNoaWxkcmVuID0+IHtcbiAgICAgIGxldCByZXMgPSBbXTtcblxuICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBjaGlsZHJlbi5sZW5ndGg7IGkrKykge1xuICAgICAgICBjb25zdCBjaGlsZCA9IGNoaWxkcmVuW2ldO1xuICAgICAgICBpZiAoY2hpbGQudHlwZS5nZXQoKSA9PT0gZGFzaGJvYXJkVHlwZSkge1xuICAgICAgICAgIHJlcy5wdXNoKGNoaWxkKTtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICByZXR1cm4gcmVzO1xuICAgIH0pO1xuICB9LFxuICBoYXNEYXNoQm9hcmQobm9kZUlkKSB7XG4gICAgcmV0dXJuIFNwaW5hbEdyYXBoU2VydmljZS5nZXRDaGlsZHJlbihcbiAgICAgIG5vZGVJZCxcbiAgICAgIGRhc2hib2FyZFZhcmlhYmxlcy5FTkRQT0lOVF9SRUxBVElPTl9OQU1FXG4gICAgKS50aGVuKGNoaWxkcmVuID0+IHtcbiAgICAgIHJldHVybiBjaGlsZHJlbi5sZW5ndGggPiAwO1xuICAgIH0pO1xuICB9LFxuICBsaW5rVG9EYXNoYm9hcmQoY29udGV4dElkLCBub2RlSWQsIGRhc2hib2FyZElkKSB7XG4gICAgZGFzaGJvYXJkU2VydmljZS51bkxpbmtUb0Rhc2hCb2FyZChkYXNoYm9hcmRJZCwgbm9kZUlkLCAoZWwpID0+IHtcblxuICAgICAgbGV0IGRhc2hib2FyZEluZm8gPSBTcGluYWxHcmFwaFNlcnZpY2UuZ2V0SW5mbyhkYXNoYm9hcmRJZCk7XG5cbiAgICAgIGRhc2hib2FyZEluZm8uZWxlbWVudC5sb2FkKCkudGhlbihlbGVtZW50ID0+IHtcbiAgICAgICAgaWYgKCFlbCkge1xuICAgICAgICAgIFNwaW5hbEdyYXBoU2VydmljZS5hZGRDaGlsZEluQ29udGV4dChcbiAgICAgICAgICAgIGRhc2hib2FyZElkLFxuICAgICAgICAgICAgbm9kZUlkLFxuICAgICAgICAgICAgY29udGV4dElkLFxuICAgICAgICAgICAgZGFzaGJvYXJkVmFyaWFibGVzLkRBU0hCT0FSRF9UT19FTEVNRU5UX1JFTEFUSU9OLFxuICAgICAgICAgICAgU1BJTkFMX1JFTEFUSU9OX1RZUEVcbiAgICAgICAgICApO1xuXG4gICAgICAgIH1cblxuICAgICAgICBsZXQgc2Vuc29yID0gZWxlbWVudC5zZW5zb3IuZ2V0KCk7XG5cbiAgICAgICAgc2Vuc29yLmZvckVhY2goYXR0ciA9PiB7XG4gICAgICAgICAgLy8gbGV0IGVuZHBvaW50ID0gbmV3IFNwaW5hbEVuZHBvaW50KFxuICAgICAgICAgIC8vICAgYXR0ci5uYW1lLFxuICAgICAgICAgIC8vICAgXCJTcGluYWxFbmRwb2ludFwiLFxuICAgICAgICAgIC8vICAgYXR0ci52YWx1ZSxcbiAgICAgICAgICAvLyAgIGF0dHIudW5pdCxcbiAgICAgICAgICAvLyAgIGF0dHIuZGF0YVR5cGUsXG4gICAgICAgICAgLy8gICAwLFxuICAgICAgICAgIC8vICAgMzAsXG4gICAgICAgICAgLy8gICBhdHRyLmRhdGFUeXBlXG4gICAgICAgICAgLy8gKTtcblxuICAgICAgICAgIGxldCBlbmRwb2ludCA9IG5ldyBTcGluYWxCbXNFbmRwb2ludChhdHRyLm5hbWUsXG4gICAgICAgICAgICBcIlNwaW5hbEVuZHBvaW50X1BhdGhcIiwgYXR0ci52YWx1ZSwgYXR0ci51bml0LCBhdHRyLmRhdGFUeXBlLFxuICAgICAgICAgICAgYXR0ci50eXBlKTtcblxuICAgICAgICAgIGxldCBjaGlsZCA9IFNwaW5hbEdyYXBoU2VydmljZS5jcmVhdGVOb2RlKHtcbiAgICAgICAgICAgICAgbmFtZTogYXR0ci5uYW1lLFxuICAgICAgICAgICAgICB0eXBlOiBhdHRyLnR5cGVcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBlbmRwb2ludFxuICAgICAgICAgICk7XG5cbiAgICAgICAgICBTcGluYWxHcmFwaFNlcnZpY2UuYWRkQ2hpbGQoXG4gICAgICAgICAgICBub2RlSWQsXG4gICAgICAgICAgICBjaGlsZCxcbiAgICAgICAgICAgIGRhc2hib2FyZFZhcmlhYmxlcy5FTkRQT0lOVF9SRUxBVElPTl9OQU1FLFxuICAgICAgICAgICAgU1BJTkFMX1JFTEFUSU9OX1RZUEVcbiAgICAgICAgICApO1xuICAgICAgICB9KTtcbiAgICAgIH0pO1xuICAgIH0pO1xuICB9LFxuICBnZXRBbGxEYXNoYm9hcmRDb250ZXh0KCkge1xuICAgIGxldCBncmFwaCA9IFNwaW5hbEdyYXBoU2VydmljZS5nZXRHcmFwaCgpO1xuXG4gICAgcmV0dXJuIGdyYXBoLmdldENoaWxkcmVuKFtcImhhc0NvbnRleHRcIl0pLnRoZW4oY29udGV4dHMgPT4ge1xuICAgICAgbGV0IHJlcyA9IFtdO1xuXG4gICAgICBjb250ZXh0cy5mb3JFYWNoKGNvbnRleHQgPT4ge1xuICAgICAgICBpZiAoXG4gICAgICAgICAgY29udGV4dC5pbmZvLnR5cGUuZ2V0KCkgPT0gZGFzaGJvYXJkVmFyaWFibGVzLkRBU0hCT0FSRF9DT05URVhUX1RZUEVcbiAgICAgICAgKSB7XG4gICAgICAgICAgcmVzLnB1c2goY29udGV4dC5pbmZvKTtcbiAgICAgICAgfVxuICAgICAgfSk7XG5cbiAgICAgIHJldHVybiByZXM7XG4gICAgfSk7XG4gIH0sXG4gIHVuTGlua1RvRGFzaEJvYXJkKGRhc2hib2FyZElkLCBub2RlSWQsIGNhbGxiYWNrKSB7XG4gICAgY29uc29sZS5sb2coXCJ1bkxpbmtNZXRob2QgY2FsbGVkXCIpO1xuICAgIC8vIGRhc2hib2FyZFNlcnZpY2UuaGFzRGFzaEJvYXJkKG5vZGVJZCkudGhlbihlbCA9PiB7XG4gICAgLy8gICBpZiAoZWwpIHtcbiAgICAvLyAgICAgY29uc29sZS5sb2coXCJoYXMgRGFzaGJvYXJkXCIpO1xuICAgIC8vICAgICBkYXNoYm9hcmRTZXJ2aWNlLnJlbW92ZUFsbEVuZHBvaW50cyhub2RlSWQpLnRoZW4oKCkgPT4ge1xuXG4gICAgLy8gICAgICAgY29uc29sZS5sb2coXCJub3cgcmVtb3ZlIGRhc2hib2FyZCBjb25uZWN0ZWRcIik7XG4gICAgLy8gICAgICAgU3BpbmFsR3JhcGhTZXJ2aWNlLnJlbW92ZUNoaWxkKFxuICAgIC8vICAgICAgICAgZGFzaGJvYXJkSWQsXG4gICAgLy8gICAgICAgICBub2RlSWQsXG4gICAgLy8gICAgICAgICBkYXNoYm9hcmRWYXJpYWJsZXMuREFTSEJPQVJEX1RPX0VMRU1FTlRfUkVMQVRJT04sXG4gICAgLy8gICAgICAgICBTUElOQUxfUkVMQVRJT05fVFlQRVxuICAgIC8vICAgICAgICkudGhlbihcbiAgICAvLyAgICAgICAgIChlbCkgPT4ge1xuICAgIC8vICAgICAgICAgICBjb25zb2xlLmxvZyhcImNhbGwgY2FsbGJhY2tcIiwgZWwpO1xuXG4gICAgLy8gICAgICAgICAgIGNhbGxiYWNrKCk7XG4gICAgLy8gICAgICAgICB9LFxuICAgIC8vICAgICAgICAgZXJyb3IgPT4ge1xuICAgIC8vICAgICAgICAgICBjb25zb2xlLmxvZyhcImVycm9yXCIsIGVycm9yKTtcbiAgICAvLyAgICAgICAgIH1cbiAgICAvLyAgICAgICApO1xuICAgIC8vICAgICB9KTtcbiAgICAvLyAgIH0gZWxzZSB7XG4gICAgLy8gICAgIGNvbnNvbGUubG9nKFwiaGFzIG5vdCBkYXNoYm9hcmRcIik7XG4gICAgLy8gICAgIGNhbGxiYWNrKCk7XG4gICAgLy8gICB9XG4gICAgLy8gfSk7XG4gICAgU3BpbmFsR3JhcGhTZXJ2aWNlLmdldENoaWxkcmVuKG5vZGVJZCwgW2Rhc2hib2FyZFZhcmlhYmxlcy5FTkRQT0lOVF9SRUxBVElPTl9OQU1FXSlcbiAgICAgIC50aGVuKGVsID0+IHtcblxuXG4gICAgICAgIGlmIChlbC5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgbGV0IG9sZERhc2ggPSBlbFswXS5pZC5nZXQoKTtcblxuICAgICAgICAgIGNvbnNvbGUubG9nKFwiaGFzIERhc2hib2FyZFwiKTtcbiAgICAgICAgICBkYXNoYm9hcmRTZXJ2aWNlLnJlbW92ZUFsbEVuZHBvaW50cyhub2RlSWQpLnRoZW4oKCkgPT4ge1xuXG4gICAgICAgICAgICBjb25zb2xlLmxvZyhcIm5vdyByZW1vdmUgZGFzaGJvYXJkIGNvbm5lY3RlZFwiKTtcbiAgICAgICAgICAgIC8vIFNwaW5hbEdyYXBoU2VydmljZS5yZW1vdmVDaGlsZChcbiAgICAgICAgICAgIC8vICAgZGFzaGJvYXJkSWQsXG4gICAgICAgICAgICAvLyAgIG5vZGVJZCxcbiAgICAgICAgICAgIC8vICAgZGFzaGJvYXJkVmFyaWFibGVzLkRBU0hCT0FSRF9UT19FTEVNRU5UX1JFTEFUSU9OLFxuICAgICAgICAgICAgLy8gICBTUElOQUxfUkVMQVRJT05fVFlQRVxuICAgICAgICAgICAgLy8gKS50aGVuKFxuICAgICAgICAgICAgLy8gICAoZWwpID0+IHtcbiAgICAgICAgICAgIC8vICAgICBjb25zb2xlLmxvZyhcImNhbGwgY2FsbGJhY2tcIiwgZWwpO1xuXG4gICAgICAgICAgICAvLyAgICAgY2FsbGJhY2soKTtcbiAgICAgICAgICAgIC8vICAgfSxcbiAgICAgICAgICAgIC8vICAgZXJyb3IgPT4ge1xuICAgICAgICAgICAgLy8gICAgIGNvbnNvbGUubG9nKFwiZXJyb3JcIiwgZXJyb3IpO1xuICAgICAgICAgICAgLy8gICB9XG4gICAgICAgICAgICAvLyApO1xuXG4gICAgICAgICAgICBTcGluYWxHcmFwaFNlcnZpY2UubW92ZUNoaWxkKG9sZERhc2gsIGRhc2hib2FyZElkLFxuICAgICAgICAgICAgICBub2RlSWQsXG4gICAgICAgICAgICAgIGRhc2hib2FyZFZhcmlhYmxlcy5EQVNIQk9BUkRfVE9fRUxFTUVOVF9SRUxBVElPTixcbiAgICAgICAgICAgICAgU1BJTkFMX1JFTEFUSU9OX1RZUEUpLnRoZW4oKGVsKSA9PiB7XG4gICAgICAgICAgICAgIGlmIChlbCkge1xuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKFwiYmVmb3JlIGNhbGxiYWNrXCIsIGVsKTtcblxuICAgICAgICAgICAgICAgIGNhbGxiYWNrKHRydWUpO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KVxuXG4gICAgICAgICAgfSk7XG5cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBjYWxsYmFjayhmYWxzZSk7XG4gICAgICAgIH1cblxuXG5cblxuICAgICAgfSlcbiAgfSxcbiAgcmVtb3ZlQWxsRW5kcG9pbnRzKG5vZGVJZCkge1xuXG4gICAgY29uc29sZS5sb2coXCJyZW1vdmUgYWxsIGVuZHBvaW50cyBjYWxsZWRcIik7XG4gICAgcmV0dXJuIFNwaW5hbEdyYXBoU2VydmljZS5nZXRDaGlsZHJlbihub2RlSWQsIFtcbiAgICAgIGRhc2hib2FyZFZhcmlhYmxlcy5FTkRQT0lOVF9SRUxBVElPTl9OQU1FXG4gICAgXSkudGhlbihlbmRwb2ludHMgPT4ge1xuICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBlbmRwb2ludHMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgU3BpbmFsR3JhcGhTZXJ2aWNlLnJlbW92ZUNoaWxkKFxuICAgICAgICAgIG5vZGVJZCxcbiAgICAgICAgICBlbmRwb2ludHNbaV0uaWQuZ2V0KCksXG4gICAgICAgICAgZGFzaGJvYXJkVmFyaWFibGVzLkVORFBPSU5UX1JFTEFUSU9OX05BTUUsXG4gICAgICAgICAgU1BJTkFMX1JFTEFUSU9OX1RZUEVcbiAgICAgICAgKTtcbiAgICAgIH1cblxuICAgICAgY29uc29sZS5sb2coXCJhbGwgZW5kcG9pbnRzIHJlbW92ZWRcIik7XG4gICAgICByZXR1cm47XG4gICAgfSk7XG4gIH1cbn07XG5cbmV4cG9ydCB7XG4gIGRhc2hib2FyZFNlcnZpY2UsXG4gIGRhc2hib2FyZFZhcmlhYmxlc1xufTsiXX0=