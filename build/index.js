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
    dashboardService.unLinkToDashBoard(dashboardId, nodeId, el => {

      console.log("leeeee", el);

      let dashboardInfo = _spinalEnvViewerGraphService.SpinalGraphService.getInfo(dashboardId);

      dashboardInfo.element.load().then(element => {
        if (!el) {
          _spinalEnvViewerGraphService.SpinalGraphService.addChildInContext(dashboardId, nodeId, contextId, dashboardVariables.DASHBOARD_TO_ELEMENT_RELATION, _spinalEnvViewerGraphService.SPINAL_RELATION_TYPE);
        }

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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9pbmRleC5qcyJdLCJuYW1lcyI6WyJkYXNoYm9hcmRWYXJpYWJsZXMiLCJBYnN0cmFjdEVsZW1lbnQiLCJyZXF1aXJlIiwiZGFzaGJvYXJkU2VydmljZSIsImNyZWF0ZVN0YW5kYXJkRGFzaEJvYXJkQ29udGV4dCIsImNvbnRleHROYW1lIiwiY29udGV4dCIsIlNwaW5hbEdyYXBoU2VydmljZSIsImdldENvbnRleHQiLCJhZGRDb250ZXh0IiwiREFTSEJPQVJEX0NPTlRFWFRfVFlQRSIsImNyZWF0ZVN0YW5kYXJkRGFzaEJvYXJkIiwiY29udGV4dElkIiwiZGFzaGJvYXJkTmFtZSIsImRhc2hib2FyZFR5cGUiLCJhdHRyaWJ1dGVzIiwiYWJzdHJhY3QiLCJhZGRfYXR0ciIsInNlbnNvciIsImNvbm5lY3RlZCIsImZvckVhY2giLCJhdHRyIiwiY2hlY2tlZCIsInB1c2giLCJhYnN0cmFjdE5vZGUiLCJjcmVhdGVOb2RlIiwibmFtZSIsInR5cGUiLCJhZGRDaGlsZEluQ29udGV4dCIsIlJFTEFUSU9OX05BTUUiLCJTUElOQUxfUkVMQVRJT05fVFlQRSIsImdldERhc2hib2FyZEJ5VHlwZSIsImdldENoaWxkcmVuIiwidGhlbiIsImNoaWxkcmVuIiwicmVzIiwiaSIsImxlbmd0aCIsImNoaWxkIiwiZ2V0IiwiaGFzRGFzaEJvYXJkIiwibm9kZUlkIiwiRU5EUE9JTlRfUkVMQVRJT05fTkFNRSIsImxpbmtUb0Rhc2hib2FyZCIsImRhc2hib2FyZElkIiwiY29uc29sZSIsImxvZyIsInVuTGlua1RvRGFzaEJvYXJkIiwiZWwiLCJkYXNoYm9hcmRJbmZvIiwiZ2V0SW5mbyIsImVsZW1lbnQiLCJsb2FkIiwiREFTSEJPQVJEX1RPX0VMRU1FTlRfUkVMQVRJT04iLCJlbmRwb2ludCIsIlNwaW5hbEVuZHBvaW50IiwidmFsdWUiLCJ1bml0IiwiZGF0YVR5cGUiLCJhZGRDaGlsZCIsImdldEFsbERhc2hib2FyZENvbnRleHQiLCJncmFwaCIsImdldEdyYXBoIiwiY29udGV4dHMiLCJpbmZvIiwiY2FsbGJhY2siLCJvbGREYXNoIiwiaWQiLCJyZW1vdmVBbGxFbmRwb2ludHMiLCJtb3ZlQ2hpbGQiLCJlbmRwb2ludHMiLCJyZW1vdmVDaGlsZCJdLCJtYXBwaW5ncyI6Ijs7Ozs7OztBQUFBOztJQUFZQSxrQjs7QUFDWjs7QUFLQTs7OztBQUlBLE1BQU07QUFDSkM7QUFESSxJQUVGQyxRQUFRLGlDQUFSLENBRko7O0FBSUEsSUFBSUMsbUJBQW1CO0FBQ3JCQyxpQ0FBK0JDLFdBQS9CLEVBQTRDO0FBQzFDLFFBQUlDLFVBQVVDLGdEQUFtQkMsVUFBbkIsQ0FBOEJILFdBQTlCLENBQWQ7O0FBRUEsUUFBSSxPQUFPQyxPQUFQLEtBQW1CLFdBQXZCLEVBQW9DLE9BQU8sS0FBUDs7QUFFcEMsV0FBT0MsZ0RBQW1CRSxVQUFuQixDQUNMSixXQURLLEVBRUxMLG1CQUFtQlUsc0JBRmQsRUFHTCxJQUFJVCxlQUFKLENBQW9CSSxXQUFwQixDQUhLLENBQVA7QUFLRCxHQVhvQjtBQVlyQk0sMEJBQXdCQyxTQUF4QixFQUFtQ0MsYUFBbkMsRUFBa0RDLGFBQWxELEVBQWlFQyxVQUFqRSxFQUE2RTtBQUMzRSxRQUFJQyxXQUFXLElBQUlmLGVBQUosQ0FBb0JZLGFBQXBCLENBQWY7O0FBRUFHLGFBQVNDLFFBQVQsQ0FBa0I7QUFDaEJDLGNBQVEsRUFEUTtBQUVoQkMsaUJBQVc7QUFGSyxLQUFsQjs7QUFLQUosZUFBV0ssT0FBWCxDQUFtQkMsUUFBUTtBQUN6QixhQUFPQSxLQUFLQyxPQUFaO0FBQ0FOLGVBQVNFLE1BQVQsQ0FBZ0JLLElBQWhCLENBQXFCRixJQUFyQjtBQUNELEtBSEQ7O0FBS0EsUUFBSUcsZUFBZWpCLGdEQUFtQmtCLFVBQW5CLENBQThCO0FBQzdDQyxZQUFNYixhQUR1QztBQUU3Q2MsWUFBTWI7QUFGdUMsS0FBOUIsRUFJakJFLFFBSmlCLENBQW5COztBQU9BVCxvREFBbUJxQixpQkFBbkIsQ0FDRWhCLFNBREYsRUFFRVksWUFGRixFQUdFWixTQUhGLEVBSUVa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RUFpQix1QkFBUyxJQUFUO0FBQ0Q7QUFDRixXQVJEO0FBVUQsU0E3QkQ7QUErQkQsT0FuQ0QsTUFtQ087QUFDTEEsaUJBQVMsS0FBVDtBQUNEO0FBS0YsS0E5Q0g7QUErQ0QsR0FsTm9CO0FBbU5yQkcscUJBQW1CM0IsTUFBbkIsRUFBMkI7O0FBRXpCSSxZQUFRQyxHQUFSLENBQVksNkJBQVo7QUFDQSxXQUFPdkMsZ0RBQW1CeUIsV0FBbkIsQ0FBK0JTLE1BQS9CLEVBQXVDLENBQzVDekMsbUJBQW1CMEMsc0JBRHlCLENBQXZDLEVBRUpULElBRkksQ0FFQ3FDLGFBQWE7QUFDbkIsV0FBSyxJQUFJbEMsSUFBSSxDQUFiLEVBQWdCQSxJQUFJa0MsVUFBVWpDLE1BQTlCLEVBQXNDRCxHQUF0QyxFQUEyQztBQUN6QzdCLHdEQUFtQmdFLFdBQW5CLENBQ0U5QixNQURGLEVBRUU2QixVQUFVbEMsQ0FBVixFQUFhK0IsRUFBYixDQUFnQjVCLEdBQWhCLEVBRkYsRUFHRXZDLG1CQUFtQjBDLHNCQUhyQixFQUlFWixpREFKRjtBQU1EOztBQUVEZSxjQUFRQyxHQUFSLENBQVksdUJBQVo7QUFDQTtBQUNELEtBZE0sQ0FBUDtBQWVEO0FBck9vQixDQUF2Qjs7UUF5T0UzQyxnQixHQUFBQSxnQjtRQUNBSCxrQixHQUFBQSxrQiIsImZpbGUiOiJpbmRleC5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCAqIGFzIGRhc2hib2FyZFZhcmlhYmxlcyBmcm9tIFwiLi9nbG9iYWxWYXJpYWJsZXNcIjtcbmltcG9ydCB7XG4gIFNQSU5BTF9SRUxBVElPTl9UWVBFLFxuICBTcGluYWxHcmFwaFNlcnZpY2Vcbn0gZnJvbSBcInNwaW5hbC1lbnYtdmlld2VyLWdyYXBoLXNlcnZpY2VcIjtcblxuaW1wb3J0IHtcbiAgU3BpbmFsRW5kcG9pbnRcbn0gZnJvbSBcInNwaW5hbC1tb2RlbHMtYm1zTmV0d29ya1wiO1xuXG5jb25zdCB7XG4gIEFic3RyYWN0RWxlbWVudFxufSA9IHJlcXVpcmUoXCJzcGluYWwtbW9kZWxzLWJ1aWxkaW5nLWVsZW1lbnRzXCIpO1xuXG5sZXQgZGFzaGJvYXJkU2VydmljZSA9IHtcbiAgY3JlYXRlU3RhbmRhcmREYXNoQm9hcmRDb250ZXh0KGNvbnRleHROYW1lKSB7XG4gICAgbGV0IGNvbnRleHQgPSBTcGluYWxHcmFwaFNlcnZpY2UuZ2V0Q29udGV4dChjb250ZXh0TmFtZSk7XG5cbiAgICBpZiAodHlwZW9mIGNvbnRleHQgIT09IFwidW5kZWZpbmVkXCIpIHJldHVybiBmYWxzZTtcblxuICAgIHJldHVybiBTcGluYWxHcmFwaFNlcnZpY2UuYWRkQ29udGV4dChcbiAgICAgIGNvbnRleHROYW1lLFxuICAgICAgZGFzaGJvYXJkVmFyaWFibGVzLkRBU0hCT0FSRF9DT05URVhUX1RZUEUsXG4gICAgICBuZXcgQWJzdHJhY3RFbGVtZW50KGNvbnRleHROYW1lKVxuICAgICk7XG4gIH0sXG4gIGNyZWF0ZVN0YW5kYXJkRGFzaEJvYXJkKGNvbnRleHRJZCwgZGFzaGJvYXJkTmFtZSwgZGFzaGJvYXJkVHlwZSwgYXR0cmlidXRlcykge1xuICAgIGxldCBhYnN0cmFjdCA9IG5ldyBBYnN0cmFjdEVsZW1lbnQoZGFzaGJvYXJkTmFtZSk7XG5cbiAgICBhYnN0cmFjdC5hZGRfYXR0cih7XG4gICAgICBzZW5zb3I6IFtdLFxuICAgICAgY29ubmVjdGVkOiBbXVxuICAgIH0pO1xuXG4gICAgYXR0cmlidXRlcy5mb3JFYWNoKGF0dHIgPT4ge1xuICAgICAgZGVsZXRlIGF0dHIuY2hlY2tlZDtcbiAgICAgIGFic3RyYWN0LnNlbnNvci5wdXNoKGF0dHIpO1xuICAgIH0pO1xuXG4gICAgbGV0IGFic3RyYWN0Tm9kZSA9IFNwaW5hbEdyYXBoU2VydmljZS5jcmVhdGVOb2RlKHtcbiAgICAgICAgbmFtZTogZGFzaGJvYXJkTmFtZSxcbiAgICAgICAgdHlwZTogZGFzaGJvYXJkVHlwZVxuICAgICAgfSxcbiAgICAgIGFic3RyYWN0XG4gICAgKTtcblxuICAgIFNwaW5hbEdyYXBoU2VydmljZS5hZGRDaGlsZEluQ29udGV4dChcbiAgICAgIGNvbnRleHRJZCxcbiAgICAgIGFic3RyYWN0Tm9kZSxcbiAgICAgIGNvbnRleHRJZCxcbiAgICAgIGRhc2hib2FyZFZhcmlhYmxlcy5SRUxBVElPTl9OQU1FLFxuICAgICAgU1BJTkFMX1JFTEFUSU9OX1RZUEVcbiAgICApO1xuICB9LFxuXG4gIGdldERhc2hib2FyZEJ5VHlwZShjb250ZXh0SWQsIGRhc2hib2FyZFR5cGUpIHtcbiAgICByZXR1cm4gU3BpbmFsR3JhcGhTZXJ2aWNlLmdldENoaWxkcmVuKFxuICAgICAgY29udGV4dElkLFxuICAgICAgZGFzaGJvYXJkVmFyaWFibGVzLlJFTEFUSU9OX05BTUVcbiAgICApLnRoZW4oY2hpbGRyZW4gPT4ge1xuICAgICAgbGV0IHJlcyA9IFtdO1xuXG4gICAgICBmb3IgKGxldCBpID0gMDsgaSA8IGNoaWxkcmVuLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIGNvbnN0IGNoaWxkID0gY2hpbGRyZW5baV07XG4gICAgICAgIGlmIChjaGlsZC50eXBlLmdldCgpID09PSBkYXNoYm9hcmRUeXBlKSB7XG4gICAgICAgICAgcmVzLnB1c2goY2hpbGQpO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIHJldHVybiByZXM7XG4gICAgfSk7XG4gIH0sXG4gIGhhc0Rhc2hCb2FyZChub2RlSWQpIHtcbiAgICByZXR1cm4gU3BpbmFsR3JhcGhTZXJ2aWNlLmdldENoaWxkcmVuKFxuICAgICAgbm9kZUlkLFxuICAgICAgZGFzaGJvYXJkVmFyaWFibGVzLkVORFBPSU5UX1JFTEFUSU9OX05BTUVcbiAgICApLnRoZW4oY2hpbGRyZW4gPT4ge1xuICAgICAgcmV0dXJuIGNoaWxkcmVuLmxlbmd0aCA+IDA7XG4gICAgfSk7XG4gIH0sXG4gIGxpbmtUb0Rhc2hib2FyZChjb250ZXh0SWQsIG5vZGVJZCwgZGFzaGJvYXJkSWQpIHtcbiAgICBjb25zb2xlLmxvZyhcImxpbmsgVG8gZGFzaGJvYXJkXCIpO1xuICAgIGRhc2hib2FyZFNlcnZpY2UudW5MaW5rVG9EYXNoQm9hcmQoZGFzaGJvYXJkSWQsIG5vZGVJZCwgKGVsKSA9PiB7XG5cbiAgICAgIGNvbnNvbGUubG9nKFwibGVlZWVlXCIsIGVsKTtcblxuICAgICAgbGV0IGRhc2hib2FyZEluZm8gPSBTcGluYWxHcmFwaFNlcnZpY2UuZ2V0SW5mbyhkYXNoYm9hcmRJZCk7XG5cbiAgICAgIGRhc2hib2FyZEluZm8uZWxlbWVudC5sb2FkKCkudGhlbihlbGVtZW50ID0+IHtcbiAgICAgICAgaWYgKCFlbCkge1xuICAgICAgICAgIFNwaW5hbEdyYXBoU2VydmljZS5hZGRDaGlsZEluQ29udGV4dChcbiAgICAgICAgICAgIGRhc2hib2FyZElkLFxuICAgICAgICAgICAgbm9kZUlkLFxuICAgICAgICAgICAgY29udGV4dElkLFxuICAgICAgICAgICAgZGFzaGJvYXJkVmFyaWFibGVzLkRBU0hCT0FSRF9UT19FTEVNRU5UX1JFTEFUSU9OLFxuICAgICAgICAgICAgU1BJTkFMX1JFTEFUSU9OX1RZUEVcbiAgICAgICAgICApO1xuXG4gICAgICAgIH1cblxuICAgICAgICBsZXQgc2Vuc29yID0gZWxlbWVudC5zZW5zb3IuZ2V0KCk7XG5cbiAgICAgICAgc2Vuc29yLmZvckVhY2goYXR0ciA9PiB7XG4gICAgICAgICAgbGV0IGVuZHBvaW50ID0gbmV3IFNwaW5hbEVuZHBvaW50KFxuICAgICAgICAgICAgYXR0ci5uYW1lLFxuICAgICAgICAgICAgXCJTcGluYWxFbmRwb2ludFwiLFxuICAgICAgICAgICAgYXR0ci52YWx1ZSxcbiAgICAgICAgICAgIGF0dHIudW5pdCxcbiAgICAgICAgICAgIGF0dHIuZGF0YVR5cGUsXG4gICAgICAgICAgICAwLFxuICAgICAgICAgICAgMzAsXG4gICAgICAgICAgICBhdHRyLmRhdGFUeXBlXG4gICAgICAgICAgKTtcblxuICAgICAgICAgIGxldCBjaGlsZCA9IFNwaW5hbEdyYXBoU2VydmljZS5jcmVhdGVOb2RlKHtcbiAgICAgICAgICAgICAgbmFtZTogZGFzaGJvYXJkSW5mby5uYW1lLmdldCgpLFxuICAgICAgICAgICAgICB0eXBlOiBkYXNoYm9hcmRJbmZvLnR5cGUuZ2V0KClcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBlbmRwb2ludFxuICAgICAgICAgICk7XG5cbiAgICAgICAgICBTcGluYWxHcmFwaFNlcnZpY2UuYWRkQ2hpbGQoXG4gICAgICAgICAgICBub2RlSWQsXG4gICAgICAgICAgICBjaGlsZCxcbiAgICAgICAgICAgIGRhc2hib2FyZFZhcmlhYmxlcy5FTkRQT0lOVF9SRUxBVElPTl9OQU1FLFxuICAgICAgICAgICAgU1BJTkFMX1JFTEFUSU9OX1RZUEVcbiAgICAgICAgICApO1xuICAgICAgICB9KTtcbiAgICAgIH0pO1xuICAgIH0pO1xuICB9LFxuICBnZXRBbGxEYXNoYm9hcmRDb250ZXh0KCkge1xuICAgIGxldCBncmFwaCA9IFNwaW5hbEdyYXBoU2VydmljZS5nZXRHcmFwaCgpO1xuXG4gICAgcmV0dXJuIGdyYXBoLmdldENoaWxkcmVuKFtcImhhc0NvbnRleHRcIl0pLnRoZW4oY29udGV4dHMgPT4ge1xuICAgICAgbGV0IHJlcyA9IFtdO1xuXG4gICAgICBjb250ZXh0cy5mb3JFYWNoKGNvbnRleHQgPT4ge1xuICAgICAgICBpZiAoXG4gICAgICAgICAgY29udGV4dC5pbmZvLnR5cGUuZ2V0KCkgPT0gZGFzaGJvYXJkVmFyaWFibGVzLkRBU0hCT0FSRF9DT05URVhUX1RZUEVcbiAgICAgICAgKSB7XG4gICAgICAgICAgcmVzLnB1c2goY29udGV4dC5pbmZvKTtcbiAgICAgICAgfVxuICAgICAgfSk7XG5cbiAgICAgIHJldHVybiByZXM7XG4gICAgfSk7XG4gIH0sXG4gIHVuTGlua1RvRGFzaEJvYXJkKGRhc2hib2FyZElkLCBub2RlSWQsIGNhbGxiYWNrKSB7XG4gICAgY29uc29sZS5sb2coXCJ1bkxpbmtNZXRob2QgY2FsbGVkXCIpO1xuICAgIC8vIGRhc2hib2FyZFNlcnZpY2UuaGFzRGFzaEJvYXJkKG5vZGVJZCkudGhlbihlbCA9PiB7XG4gICAgLy8gICBpZiAoZWwpIHtcbiAgICAvLyAgICAgY29uc29sZS5sb2coXCJoYXMgRGFzaGJvYXJkXCIpO1xuICAgIC8vICAgICBkYXNoYm9hcmRTZXJ2aWNlLnJlbW92ZUFsbEVuZHBvaW50cyhub2RlSWQpLnRoZW4oKCkgPT4ge1xuXG4gICAgLy8gICAgICAgY29uc29sZS5sb2coXCJub3cgcmVtb3ZlIGRhc2hib2FyZCBjb25uZWN0ZWRcIik7XG4gICAgLy8gICAgICAgU3BpbmFsR3JhcGhTZXJ2aWNlLnJlbW92ZUNoaWxkKFxuICAgIC8vICAgICAgICAgZGFzaGJvYXJkSWQsXG4gICAgLy8gICAgICAgICBub2RlSWQsXG4gICAgLy8gICAgICAgICBkYXNoYm9hcmRWYXJpYWJsZXMuREFTSEJPQVJEX1RPX0VMRU1FTlRfUkVMQVRJT04sXG4gICAgLy8gICAgICAgICBTUElOQUxfUkVMQVRJT05fVFlQRVxuICAgIC8vICAgICAgICkudGhlbihcbiAgICAvLyAgICAgICAgIChlbCkgPT4ge1xuICAgIC8vICAgICAgICAgICBjb25zb2xlLmxvZyhcImNhbGwgY2FsbGJhY2tcIiwgZWwpO1xuXG4gICAgLy8gICAgICAgICAgIGNhbGxiYWNrKCk7XG4gICAgLy8gICAgICAgICB9LFxuICAgIC8vICAgICAgICAgZXJyb3IgPT4ge1xuICAgIC8vICAgICAgICAgICBjb25zb2xlLmxvZyhcImVycm9yXCIsIGVycm9yKTtcbiAgICAvLyAgICAgICAgIH1cbiAgICAvLyAgICAgICApO1xuICAgIC8vICAgICB9KTtcbiAgICAvLyAgIH0gZWxzZSB7XG4gICAgLy8gICAgIGNvbnNvbGUubG9nKFwiaGFzIG5vdCBkYXNoYm9hcmRcIik7XG4gICAgLy8gICAgIGNhbGxiYWNrKCk7XG4gICAgLy8gICB9XG4gICAgLy8gfSk7XG4gICAgU3BpbmFsR3JhcGhTZXJ2aWNlLmdldENoaWxkcmVuKG5vZGVJZCwgW2Rhc2hib2FyZFZhcmlhYmxlcy5FTkRQT0lOVF9SRUxBVElPTl9OQU1FXSlcbiAgICAgIC50aGVuKGVsID0+IHtcblxuXG4gICAgICAgIGlmIChlbC5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgbGV0IG9sZERhc2ggPSBlbFswXS5pZC5nZXQoKTtcblxuICAgICAgICAgIGNvbnNvbGUubG9nKFwiaGFzIERhc2hib2FyZFwiKTtcbiAgICAgICAgICBkYXNoYm9hcmRTZXJ2aWNlLnJlbW92ZUFsbEVuZHBvaW50cyhub2RlSWQpLnRoZW4oKCkgPT4ge1xuXG4gICAgICAgICAgICBjb25zb2xlLmxvZyhcIm5vdyByZW1vdmUgZGFzaGJvYXJkIGNvbm5lY3RlZFwiKTtcbiAgICAgICAgICAgIC8vIFNwaW5hbEdyYXBoU2VydmljZS5yZW1vdmVDaGlsZChcbiAgICAgICAgICAgIC8vICAgZGFzaGJvYXJkSWQsXG4gICAgICAgICAgICAvLyAgIG5vZGVJZCxcbiAgICAgICAgICAgIC8vICAgZGFzaGJvYXJkVmFyaWFibGVzLkRBU0hCT0FSRF9UT19FTEVNRU5UX1JFTEFUSU9OLFxuICAgICAgICAgICAgLy8gICBTUElOQUxfUkVMQVRJT05fVFlQRVxuICAgICAgICAgICAgLy8gKS50aGVuKFxuICAgICAgICAgICAgLy8gICAoZWwpID0+IHtcbiAgICAgICAgICAgIC8vICAgICBjb25zb2xlLmxvZyhcImNhbGwgY2FsbGJhY2tcIiwgZWwpO1xuXG4gICAgICAgICAgICAvLyAgICAgY2FsbGJhY2soKTtcbiAgICAgICAgICAgIC8vICAgfSxcbiAgICAgICAgICAgIC8vICAgZXJyb3IgPT4ge1xuICAgICAgICAgICAgLy8gICAgIGNvbnNvbGUubG9nKFwiZXJyb3JcIiwgZXJyb3IpO1xuICAgICAgICAgICAgLy8gICB9XG4gICAgICAgICAgICAvLyApO1xuXG4gICAgICAgICAgICBTcGluYWxHcmFwaFNlcnZpY2UubW92ZUNoaWxkKG9sZERhc2gsIGRhc2hib2FyZElkLCBub2RlSWQsXG4gICAgICAgICAgICAgIGRhc2hib2FyZFZhcmlhYmxlcy5EQVNIQk9BUkRfVE9fRUxFTUVOVF9SRUxBVElPTixcbiAgICAgICAgICAgICAgU1BJTkFMX1JFTEFUSU9OX1RZUEUpLnRoZW4oKGVsKSA9PiB7XG4gICAgICAgICAgICAgIGlmIChlbCkge1xuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKFwiYmVmb3JlIGNhbGxiYWNrXCIsIGVsKTtcblxuICAgICAgICAgICAgICAgIGNhbGxiYWNrKHRydWUpO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KVxuXG4gICAgICAgICAgfSk7XG5cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBjYWxsYmFjayhmYWxzZSk7XG4gICAgICAgIH1cblxuXG5cblxuICAgICAgfSlcbiAgfSxcbiAgcmVtb3ZlQWxsRW5kcG9pbnRzKG5vZGVJZCkge1xuXG4gICAgY29uc29sZS5sb2coXCJyZW1vdmUgYWxsIGVuZHBvaW50cyBjYWxsZWRcIik7XG4gICAgcmV0dXJuIFNwaW5hbEdyYXBoU2VydmljZS5nZXRDaGlsZHJlbihub2RlSWQsIFtcbiAgICAgIGRhc2hib2FyZFZhcmlhYmxlcy5FTkRQT0lOVF9SRUxBVElPTl9OQU1FXG4gICAgXSkudGhlbihlbmRwb2ludHMgPT4ge1xuICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBlbmRwb2ludHMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgU3BpbmFsR3JhcGhTZXJ2aWNlLnJlbW92ZUNoaWxkKFxuICAgICAgICAgIG5vZGVJZCxcbiAgICAgICAgICBlbmRwb2ludHNbaV0uaWQuZ2V0KCksXG4gICAgICAgICAgZGFzaGJvYXJkVmFyaWFibGVzLkVORFBPSU5UX1JFTEFUSU9OX05BTUUsXG4gICAgICAgICAgU1BJTkFMX1JFTEFUSU9OX1RZUEVcbiAgICAgICAgKTtcbiAgICAgIH1cblxuICAgICAgY29uc29sZS5sb2coXCJhbGwgZW5kcG9pbnRzIHJlbW92ZWRcIik7XG4gICAgICByZXR1cm47XG4gICAgfSk7XG4gIH1cbn07XG5cbmV4cG9ydCB7XG4gIGRhc2hib2FyZFNlcnZpY2UsXG4gIGRhc2hib2FyZFZhcmlhYmxlc1xufTsiXX0=