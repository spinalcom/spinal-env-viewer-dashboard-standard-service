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
  //a modifier
  editDashboard(dashboardId, newName, NewSensor) {
    let dashboardNode = _spinalEnvViewerGraphService.SpinalGraphService.getRealNode(dashboardId);
    dashboardNode.info.name.set(newName);

    dashboardNode.element.load().then(dashBoardElement => {
      dashBoardElement.name.set(newName);
      let sensor = dashBoardElement.sensor.get();

      let difference = this._getDifferenceBetweenTwoArray(NewSensor, sensor);

      console.log("difference", difference);

      difference.forEach(el => {
        if (!sensor.includes(el)) {
          dashBoardElement.sensor.push(el);
        } else if (!NewSensor.includes(el)) {
          dashBoardElement.sensor.splice(sensor.indexOf(el), 1);
        }
      });
    });
  },
  addReferenceToBimObject(bimObjectId, referenceId, endpointType) {
    // SpinalGraphService.createNode()
    // let node = SpinalGraphService.getInfo(referenceId);
    // node.element.load().then(element => {
    //   if (element.referenceOf) element.referenceOf.set(endpointType);
    //   else element.add_attr({
    //     referenceOf: endpointType
    //   })
    // })

    let node = _spinalEnvViewerGraphService.SpinalGraphService.getRealNode(bimObjectId);

    if (!node.info.reference) node.info.add_attr({
      reference: {}
    });
    if (!node.info.reference[endpointType]) {
      node.info.reference.add_attr(endpointType, referenceId);
      return;
    }

    node.info.reference[endpointType].set(referenceId);
    return;

    // return SpinalGraphService.addChild(bimObjectId, , )
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
  },
  _getDifferenceBetweenTwoArray(array1, array2) {
    let full = array1.concat(array2);

    return full.filter(el => {
      return full.indexOf(el) === full.lastIndexOf(el);
    });
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9pbmRleC5qcyJdLCJuYW1lcyI6WyJkYXNoYm9hcmRWYXJpYWJsZXMiLCJBYnN0cmFjdEVsZW1lbnQiLCJyZXF1aXJlIiwiZGFzaGJvYXJkU2VydmljZSIsImNyZWF0ZVN0YW5kYXJkRGFzaEJvYXJkQ29udGV4dCIsImNvbnRleHROYW1lIiwiY29udGV4dCIsIlNwaW5hbEdyYXBoU2VydmljZSIsImdldENvbnRleHQiLCJhZGRDb250ZXh0IiwiREFTSEJPQVJEX0NPTlRFWFRfVFlQRSIsImNyZWF0ZVN0YW5kYXJkRGFzaEJvYXJkIiwiY29udGV4dElkIiwiZGFzaGJvYXJkTmFtZSIsImRhc2hib2FyZFR5cGUiLCJhdHRyaWJ1dGVzIiwiYWJzdHJhY3QiLCJhZGRfYXR0ciIsInNlbnNvciIsImNvbm5lY3RlZCIsImZvckVhY2giLCJhdHRyIiwiY2hlY2tlZCIsInB1c2giLCJhYnN0cmFjdE5vZGUiLCJjcmVhdGVOb2RlIiwibmFtZSIsInR5cGUiLCJhZGRDaGlsZEluQ29udGV4dCIsIlJFTEFUSU9OX05BTUUiLCJTUElOQUxfUkVMQVRJT05fVFlQRSIsImdldERhc2hib2FyZEJ5VHlwZSIsImdldENoaWxkcmVuIiwidGhlbiIsImNoaWxkcmVuIiwicmVzIiwiaSIsImxlbmd0aCIsImNoaWxkIiwiZ2V0IiwiaGFzRGFzaEJvYXJkIiwibm9kZUlkIiwiRU5EUE9JTlRfUkVMQVRJT05fTkFNRSIsImxpbmtUb0Rhc2hib2FyZCIsImRhc2hib2FyZElkIiwiZCIsInVuTGlua1RvRGFzaEJvYXJkIiwiZGFzaGJvYXJkSW5mbyIsImdldEluZm8iLCJlbGVtZW50IiwibG9hZCIsIkRBU0hCT0FSRF9UT19FTEVNRU5UX1JFTEFUSU9OIiwiZW5kcG9pbnQiLCJTcGluYWxCbXNFbmRwb2ludCIsInZhbHVlIiwidW5pdCIsImRhdGFUeXBlIiwiYWRkQ2hpbGQiLCJnZXRBbGxEYXNoYm9hcmRDb250ZXh0IiwiZ3JhcGgiLCJnZXRHcmFwaCIsImNvbnRleHRzIiwiaW5mbyIsImNhbGxiYWNrIiwiX2dldFBhcmVudCIsIm9sZERhc2giLCJyZW1vdmVBbGxFbmRwb2ludHMiLCJyZW1vdmVDaGlsZCIsImVsIiwiZW5kcG9pbnRzIiwiaWQiLCJhZGRDYWxjdWxhdGlvblJ1bGUiLCJlbmRwb2ludFR5cGUiLCJydWxlIiwicmVmZXJlbmNlIiwiaW5kZXgiLCJnZXRSZWFsTm9kZSIsImRhc2hfY2FsX3J1bGUiLCJyZW1fYXR0ciIsInJlZiIsImVkaXREYXNoYm9hcmQiLCJuZXdOYW1lIiwiTmV3U2Vuc29yIiwiZGFzaGJvYXJkTm9kZSIsInNldCIsImRhc2hCb2FyZEVsZW1lbnQiLCJkaWZmZXJlbmNlIiwiX2dldERpZmZlcmVuY2VCZXR3ZWVuVHdvQXJyYXkiLCJjb25zb2xlIiwibG9nIiwiaW5jbHVkZXMiLCJzcGxpY2UiLCJpbmRleE9mIiwiYWRkUmVmZXJlbmNlVG9CaW1PYmplY3QiLCJiaW1PYmplY3RJZCIsInJlZmVyZW5jZUlkIiwibm9kZSIsInJlbGF0aW9uTmFtZSIsInBhcmVudHMiLCJwYXJlbnQiLCJhcnJheTEiLCJhcnJheTIiLCJmdWxsIiwiY29uY2F0IiwiZmlsdGVyIiwibGFzdEluZGV4T2YiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7QUFBQTs7SUFBWUEsa0I7O0FBQ1o7O0FBS0E7Ozs7OztBQUlBLE1BQU07QUFDSkM7QUFESSxJQUVGQyxRQUFRLGlDQUFSLENBRko7O0FBSUEsSUFBSUMsbUJBQW1CO0FBQ3JCQyxpQ0FBK0JDLFdBQS9CLEVBQTRDO0FBQzFDLFFBQUlDLFVBQVVDLGdEQUFtQkMsVUFBbkIsQ0FBOEJILFdBQTlCLENBQWQ7O0FBRUEsUUFBSSxPQUFPQyxPQUFQLEtBQW1CLFdBQXZCLEVBQW9DLE9BQU8sS0FBUDs7QUFFcEMsV0FBT0MsZ0RBQW1CRSxVQUFuQixDQUNMSixXQURLLEVBRUxMLG1CQUFtQlUsc0JBRmQsRUFHTCxJQUFJVCxlQUFKLENBQW9CSSxXQUFwQixDQUhLLENBQVA7QUFLRCxHQVhvQjtBQVlyQk0sMEJBQXdCQyxTQUF4QixF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QUlDLE9BQU9GLE9BQU9HLE1BQVAsQ0FBY0YsTUFBZCxDQUFYOztBQUVBLFdBQU9DLEtBQUtFLE1BQUwsQ0FBYXBDLEVBQUQsSUFBUTtBQUN6QixhQUFPa0MsS0FBS1YsT0FBTCxDQUFheEIsRUFBYixNQUFxQmtDLEtBQUtHLFdBQUwsQ0FBaUJyQyxFQUFqQixDQUE1QjtBQUNELEtBRk0sQ0FBUDtBQUlEO0FBblFvQixDQUF2Qjs7UUF1UUVqRSxnQixHQUFBQSxnQjtRQUNBSCxrQixHQUFBQSxrQjs7QUFnQkYiLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgKiBhcyBkYXNoYm9hcmRWYXJpYWJsZXMgZnJvbSBcIi4vZ2xvYmFsVmFyaWFibGVzXCI7XG5pbXBvcnQge1xuICBTUElOQUxfUkVMQVRJT05fVFlQRSxcbiAgU3BpbmFsR3JhcGhTZXJ2aWNlXG59IGZyb20gXCJzcGluYWwtZW52LXZpZXdlci1ncmFwaC1zZXJ2aWNlXCI7XG5cbmltcG9ydCB7XG4gIFNwaW5hbEJtc0VuZHBvaW50XG59IGZyb20gXCJzcGluYWwtbW9kZWwtYm1zbmV0d29ya1wiO1xuXG5jb25zdCB7XG4gIEFic3RyYWN0RWxlbWVudFxufSA9IHJlcXVpcmUoXCJzcGluYWwtbW9kZWxzLWJ1aWxkaW5nLWVsZW1lbnRzXCIpO1xuXG5sZXQgZGFzaGJvYXJkU2VydmljZSA9IHtcbiAgY3JlYXRlU3RhbmRhcmREYXNoQm9hcmRDb250ZXh0KGNvbnRleHROYW1lKSB7XG4gICAgbGV0IGNvbnRleHQgPSBTcGluYWxHcmFwaFNlcnZpY2UuZ2V0Q29udGV4dChjb250ZXh0TmFtZSk7XG5cbiAgICBpZiAodHlwZW9mIGNvbnRleHQgIT09IFwidW5kZWZpbmVkXCIpIHJldHVybiBmYWxzZTtcblxuICAgIHJldHVybiBTcGluYWxHcmFwaFNlcnZpY2UuYWRkQ29udGV4dChcbiAgICAgIGNvbnRleHROYW1lLFxuICAgICAgZGFzaGJvYXJkVmFyaWFibGVzLkRBU0hCT0FSRF9DT05URVhUX1RZUEUsXG4gICAgICBuZXcgQWJzdHJhY3RFbGVtZW50KGNvbnRleHROYW1lKVxuICAgICk7XG4gIH0sXG4gIGNyZWF0ZVN0YW5kYXJkRGFzaEJvYXJkKGNvbnRleHRJZCwgZGFzaGJvYXJkTmFtZSwgZGFzaGJvYXJkVHlwZSwgYXR0cmlidXRlcykge1xuICAgIGxldCBhYnN0cmFjdCA9IG5ldyBBYnN0cmFjdEVsZW1lbnQoZGFzaGJvYXJkTmFtZSk7XG5cbiAgICBhYnN0cmFjdC5hZGRfYXR0cih7XG4gICAgICBzZW5zb3I6IFtdLFxuICAgICAgY29ubmVjdGVkOiBbXVxuICAgIH0pO1xuXG4gICAgYXR0cmlidXRlcy5mb3JFYWNoKGF0dHIgPT4ge1xuICAgICAgZGVsZXRlIGF0dHIuY2hlY2tlZDtcbiAgICAgIGFic3RyYWN0LnNlbnNvci5wdXNoKGF0dHIpO1xuICAgIH0pO1xuXG4gICAgbGV0IGFic3RyYWN0Tm9kZSA9IFNwaW5hbEdyYXBoU2VydmljZS5jcmVhdGVOb2RlKHtcbiAgICAgICAgbmFtZTogZGFzaGJvYXJkTmFtZSxcbiAgICAgICAgdHlwZTogZGFzaGJvYXJkVHlwZVxuICAgICAgfSxcbiAgICAgIGFic3RyYWN0XG4gICAgKTtcblxuICAgIFNwaW5hbEdyYXBoU2VydmljZS5hZGRDaGlsZEluQ29udGV4dChcbiAgICAgIGNvbnRleHRJZCxcbiAgICAgIGFic3RyYWN0Tm9kZSxcbiAgICAgIGNvbnRleHRJZCxcbiAgICAgIGRhc2hib2FyZFZhcmlhYmxlcy5SRUxBVElPTl9OQU1FLFxuICAgICAgU1BJTkFMX1JFTEFUSU9OX1RZUEVcbiAgICApO1xuICB9LFxuXG4gIGdldERhc2hib2FyZEJ5VHlwZShjb250ZXh0SWQsIGRhc2hib2FyZFR5cGUpIHtcbiAgICByZXR1cm4gU3BpbmFsR3JhcGhTZXJ2aWNlLmdldENoaWxkcmVuKFxuICAgICAgY29udGV4dElkLFxuICAgICAgZGFzaGJvYXJkVmFyaWFibGVzLlJFTEFUSU9OX05BTUVcbiAgICApLnRoZW4oY2hpbGRyZW4gPT4ge1xuICAgICAgbGV0IHJlcyA9IFtdO1xuXG4gICAgICBmb3IgKGxldCBpID0gMDsgaSA8IGNoaWxkcmVuLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIGNvbnN0IGNoaWxkID0gY2hpbGRyZW5baV07XG4gICAgICAgIGlmIChjaGlsZC50eXBlLmdldCgpID09PSBkYXNoYm9hcmRUeXBlKSB7XG4gICAgICAgICAgcmVzLnB1c2goY2hpbGQpO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIHJldHVybiByZXM7XG4gICAgfSk7XG4gIH0sXG4gIGhhc0Rhc2hCb2FyZChub2RlSWQpIHtcbiAgICByZXR1cm4gU3BpbmFsR3JhcGhTZXJ2aWNlLmdldENoaWxkcmVuKFxuICAgICAgbm9kZUlkLFxuICAgICAgZGFzaGJvYXJkVmFyaWFibGVzLkVORFBPSU5UX1JFTEFUSU9OX05BTUVcbiAgICApLnRoZW4oY2hpbGRyZW4gPT4ge1xuICAgICAgcmV0dXJuIGNoaWxkcmVuLmxlbmd0aCA+IDA7XG4gICAgfSk7XG4gIH0sXG4gIGxpbmtUb0Rhc2hib2FyZChjb250ZXh0SWQsIG5vZGVJZCwgZGFzaGJvYXJkSWQpIHtcbiAgICB0aGlzLmhhc0Rhc2hCb2FyZChub2RlSWQpLnRoZW4oYXN5bmMgZCA9PiB7XG4gICAgICBpZiAoZCkgYXdhaXQgdGhpcy51bkxpbmtUb0Rhc2hCb2FyZChub2RlSWQpO1xuXG4gICAgICBsZXQgZGFzaGJvYXJkSW5mbyA9IFNwaW5hbEdyYXBoU2VydmljZS5nZXRJbmZvKGRhc2hib2FyZElkKTtcblxuICAgICAgZGFzaGJvYXJkSW5mby5lbGVtZW50LmxvYWQoKS50aGVuKGVsZW1lbnQgPT4ge1xuICAgICAgICBTcGluYWxHcmFwaFNlcnZpY2UuYWRkQ2hpbGRJbkNvbnRleHQoXG4gICAgICAgICAgZGFzaGJvYXJkSWQsXG4gICAgICAgICAgbm9kZUlkLFxuICAgICAgICAgIGNvbnRleHRJZCxcbiAgICAgICAgICBkYXNoYm9hcmRWYXJpYWJsZXMuREFTSEJPQVJEX1RPX0VMRU1FTlRfUkVMQVRJT04sXG4gICAgICAgICAgU1BJTkFMX1JFTEFUSU9OX1RZUEVcbiAgICAgICAgKTtcblxuXG4gICAgICAgIGxldCBzZW5zb3IgPSBlbGVtZW50LnNlbnNvci5nZXQoKTtcblxuICAgICAgICBzZW5zb3IuZm9yRWFjaChhdHRyID0+IHtcblxuICAgICAgICAgIGxldCBlbmRwb2ludCA9IG5ldyBTcGluYWxCbXNFbmRwb2ludChcbiAgICAgICAgICAgIGF0dHIubmFtZSxcbiAgICAgICAgICAgIFwiU3BpbmFsRW5kcG9pbnRfUGF0aFwiLFxuICAgICAgICAgICAgYXR0ci52YWx1ZSxcbiAgICAgICAgICAgIGF0dHIudW5pdCxcbiAgICAgICAgICAgIGF0dHIuZGF0YVR5cGUsXG4gICAgICAgICAgICBhdHRyLnR5cGVcbiAgICAgICAgICApO1xuXG4gICAgICAgICAgbGV0IGNoaWxkID0gU3BpbmFsR3JhcGhTZXJ2aWNlLmNyZWF0ZU5vZGUoe1xuICAgICAgICAgICAgICBuYW1lOiBhdHRyLm5hbWUsXG4gICAgICAgICAgICAgIHR5cGU6IGF0dHIudHlwZVxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIGVuZHBvaW50XG4gICAgICAgICAgKTtcblxuICAgICAgICAgIFNwaW5hbEdyYXBoU2VydmljZS5hZGRDaGlsZChcbiAgICAgICAgICAgIG5vZGVJZCxcbiAgICAgICAgICAgIGNoaWxkLFxuICAgICAgICAgICAgZGFzaGJvYXJkVmFyaWFibGVzLkVORFBPSU5UX1JFTEFUSU9OX05BTUUsXG4gICAgICAgICAgICBTUElOQUxfUkVMQVRJT05fVFlQRVxuICAgICAgICAgICk7XG4gICAgICAgIH0pO1xuICAgICAgfSk7XG5cbiAgICB9KVxuXG5cbiAgfSxcbiAgZ2V0QWxsRGFzaGJvYXJkQ29udGV4dCgpIHtcbiAgICBsZXQgZ3JhcGggPSBTcGluYWxHcmFwaFNlcnZpY2UuZ2V0R3JhcGgoKTtcblxuICAgIHJldHVybiBncmFwaC5nZXRDaGlsZHJlbihbXCJoYXNDb250ZXh0XCJdKS50aGVuKGNvbnRleHRzID0+IHtcbiAgICAgIGxldCByZXMgPSBbXTtcblxuICAgICAgY29udGV4dHMuZm9yRWFjaChjb250ZXh0ID0+IHtcbiAgICAgICAgaWYgKFxuICAgICAgICAgIGNvbnRleHQuaW5mby50eXBlLmdldCgpID09IGRhc2hib2FyZFZhcmlhYmxlcy5EQVNIQk9BUkRfQ09OVEVYVF9UWVBFXG4gICAgICAgICkge1xuICAgICAgICAgIHJlcy5wdXNoKGNvbnRleHQuaW5mbyk7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuXG4gICAgICByZXR1cm4gcmVzO1xuICAgIH0pO1xuICB9LFxuICB1bkxpbmtUb0Rhc2hCb2FyZChub2RlSWQsIGNhbGxiYWNrKSB7XG5cbiAgICB0aGlzLl9nZXRQYXJlbnQobm9kZUlkLCBkYXNoYm9hcmRWYXJpYWJsZXMuREFTSEJPQVJEX1RPX0VMRU1FTlRfUkVMQVRJT04pXG4gICAgICAudGhlbihvbGREYXNoID0+IHtcbiAgICAgICAgZGFzaGJvYXJkU2VydmljZS5yZW1vdmVBbGxFbmRwb2ludHMobm9kZUlkKS50aGVuKCgpID0+IHtcblxuICAgICAgICAgIFNwaW5hbEdyYXBoU2VydmljZS5yZW1vdmVDaGlsZChvbGREYXNoLCBub2RlSWQsXG4gICAgICAgICAgICBkYXNoYm9hcmRWYXJpYWJsZXMuREFTSEJPQVJEX1RPX0VMRU1FTlRfUkVMQVRJT04sXG4gICAgICAgICAgICBTUElOQUxfUkVMQVRJT05fVFlQRSkudGhlbihcbiAgICAgICAgICAgIGVsID0+IHtcbiAgICAgICAgICAgICAgaWYgKGNhbGxiYWNrKSBjYWxsYmFjayhlbCk7XG4gICAgICAgICAgICB9KTtcblxuICAgICAgICB9KTtcbiAgICAgIH0pXG5cbiAgfSxcbiAgcmVtb3ZlQWxsRW5kcG9pbnRzKG5vZGVJZCkge1xuICAgIHJldHVybiBTcGluYWxHcmFwaFNlcnZpY2UuZ2V0Q2hpbGRyZW4obm9kZUlkLCBbXG4gICAgICBkYXNoYm9hcmRWYXJpYWJsZXMuRU5EUE9JTlRfUkVMQVRJT05fTkFNRVxuICAgIF0pLnRoZW4oZW5kcG9pbnRzID0+IHtcbiAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgZW5kcG9pbnRzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIFNwaW5hbEdyYXBoU2VydmljZS5yZW1vdmVDaGlsZChcbiAgICAgICAgICBub2RlSWQsXG4gICAgICAgICAgZW5kcG9pbnRzW2ldLmlkLmdldCgpLFxuICAgICAgICAgIGRhc2hib2FyZFZhcmlhYmxlcy5FTkRQT0lOVF9SRUxBVElPTl9OQU1FLFxuICAgICAgICAgIFNQSU5BTF9SRUxBVElPTl9UWVBFXG4gICAgICAgICk7XG4gICAgICB9XG4gICAgICByZXR1cm47XG4gICAgfSk7XG4gIH0sXG4gIGFkZENhbGN1bGF0aW9uUnVsZShub2RlSWQsIGVuZHBvaW50VHlwZSwgcnVsZSwgcmVmZXJlbmNlID0gbnVsbCkge1xuICAgIFNwaW5hbEdyYXBoU2VydmljZS5nZXRDaGlsZHJlbihcbiAgICAgIG5vZGVJZCxcbiAgICAgIGRhc2hib2FyZFZhcmlhYmxlcy5FTkRQT0lOVF9SRUxBVElPTl9OQU1FXG4gICAgKS50aGVuKGVuZHBvaW50cyA9PiB7XG4gICAgICBsZXQgZW5kcG9pbnQ7XG4gICAgICBmb3IgKGxldCBpbmRleCA9IDA7IGluZGV4IDwgZW5kcG9pbnRzLmxlbmd0aDsgaW5kZXgrKykge1xuICAgICAgICBjb25zdCBlbGVtZW50ID0gZW5kcG9pbnRzW2luZGV4XTtcbiAgICAgICAgaWYgKGVsZW1lbnQuaWQuZ2V0KCkgPT09IGVuZHBvaW50VHlwZSB8fCBlbGVtZW50LnR5cGUuZ2V0KCkgPT09XG4gICAgICAgICAgZW5kcG9pbnRUeXBlKSB7XG4gICAgICAgICAgZW5kcG9pbnQgPSBTcGluYWxHcmFwaFNlcnZpY2UuZ2V0UmVhbE5vZGUoZWxlbWVudC5pZC5nZXQoKSk7XG4gICAgICAgIH1cblxuICAgICAgfVxuXG4gICAgICBpZiAoZW5kcG9pbnQpIHtcbiAgICAgICAgaWYgKGVuZHBvaW50LmluZm8uZGFzaF9jYWxfcnVsZSlcbiAgICAgICAgICBlbmRwb2ludC5pbmZvLnJlbV9hdHRyKFwiZGFzaF9jYWxfcnVsZVwiKTtcblxuICAgICAgICBlbmRwb2ludC5pbmZvLmFkZF9hdHRyKFwiZGFzaF9jYWxfcnVsZVwiLCB7XG4gICAgICAgICAgcnVsZTogcnVsZSxcbiAgICAgICAgICByZWY6IHJlZmVyZW5jZVxuICAgICAgICB9KTtcbiAgICAgIH1cbiAgICB9KTtcbiAgfSxcbiAgLy9hIG1vZGlmaWVyXG4gIGVkaXREYXNoYm9hcmQoZGFzaGJvYXJkSWQsIG5ld05hbWUsIE5ld1NlbnNvcikge1xuICAgIGxldCBkYXNoYm9hcmROb2RlID0gU3BpbmFsR3JhcGhTZXJ2aWNlLmdldFJlYWxOb2RlKGRhc2hib2FyZElkKTtcbiAgICBkYXNoYm9hcmROb2RlLmluZm8ubmFtZS5zZXQobmV3TmFtZSk7XG5cbiAgICBkYXNoYm9hcmROb2RlLmVsZW1lbnQubG9hZCgpLnRoZW4oZGFzaEJvYXJkRWxlbWVudCA9PiB7XG4gICAgICBkYXNoQm9hcmRFbGVtZW50Lm5hbWUuc2V0KG5ld05hbWUpO1xuICAgICAgbGV0IHNlbnNvciA9IGRhc2hCb2FyZEVsZW1lbnQuc2Vuc29yLmdldCgpO1xuXG4gICAgICBsZXQgZGlmZmVyZW5jZSA9IHRoaXMuX2dldERpZmZlcmVuY2VCZXR3ZWVuVHdvQXJyYXkoTmV3U2Vuc29yLFxuICAgICAgICBzZW5zb3IpO1xuXG4gICAgICBjb25zb2xlLmxvZyhcImRpZmZlcmVuY2VcIiwgZGlmZmVyZW5jZSk7XG5cblxuICAgICAgZGlmZmVyZW5jZS5mb3JFYWNoKGVsID0+IHtcbiAgICAgICAgaWYgKCFzZW5zb3IuaW5jbHVkZXMoZWwpKSB7XG4gICAgICAgICAgZGFzaEJvYXJkRWxlbWVudC5zZW5zb3IucHVzaChlbCk7XG4gICAgICAgIH0gZWxzZSBpZiAoIU5ld1NlbnNvci5pbmNsdWRlcyhlbCkpIHtcbiAgICAgICAgICBkYXNoQm9hcmRFbGVtZW50LnNlbnNvci5zcGxpY2Uoc2Vuc29yLmluZGV4T2YoZWwpLCAxKTtcbiAgICAgICAgfVxuICAgICAgfSlcblxuICAgIH0pXG5cbiAgfSxcbiAgYWRkUmVmZXJlbmNlVG9CaW1PYmplY3QoYmltT2JqZWN0SWQsIHJlZmVyZW5jZUlkLCBlbmRwb2ludFR5cGUpIHtcbiAgICAvLyBTcGluYWxHcmFwaFNlcnZpY2UuY3JlYXRlTm9kZSgpXG4gICAgLy8gbGV0IG5vZGUgPSBTcGluYWxHcmFwaFNlcnZpY2UuZ2V0SW5mbyhyZWZlcmVuY2VJZCk7XG4gICAgLy8gbm9kZS5lbGVtZW50LmxvYWQoKS50aGVuKGVsZW1lbnQgPT4ge1xuICAgIC8vICAgaWYgKGVsZW1lbnQucmVmZXJlbmNlT2YpIGVsZW1lbnQucmVmZXJlbmNlT2Yuc2V0KGVuZHBvaW50VHlwZSk7XG4gICAgLy8gICBlbHNlIGVsZW1lbnQuYWRkX2F0dHIoe1xuICAgIC8vICAgICByZWZlcmVuY2VPZjogZW5kcG9pbnRUeXBlXG4gICAgLy8gICB9KVxuICAgIC8vIH0pXG5cbiAgICBsZXQgbm9kZSA9IFNwaW5hbEdyYXBoU2VydmljZS5nZXRSZWFsTm9kZShiaW1PYmplY3RJZCk7XG5cbiAgICBpZiAoIW5vZGUuaW5mby5yZWZlcmVuY2UpIG5vZGUuaW5mby5hZGRfYXR0cih7XG4gICAgICByZWZlcmVuY2U6IHt9XG4gICAgfSk7XG4gICAgaWYgKCFub2RlLmluZm8ucmVmZXJlbmNlW2VuZHBvaW50VHlwZV0pIHtcbiAgICAgIG5vZGUuaW5mby5yZWZlcmVuY2UuYWRkX2F0dHIoZW5kcG9pbnRUeXBlLCByZWZlcmVuY2VJZCk7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgbm9kZS5pbmZvLnJlZmVyZW5jZVtlbmRwb2ludFR5cGVdLnNldChyZWZlcmVuY2VJZCk7XG4gICAgcmV0dXJuO1xuXG5cbiAgICAvLyByZXR1cm4gU3BpbmFsR3JhcGhTZXJ2aWNlLmFkZENoaWxkKGJpbU9iamVjdElkLCAsIClcbiAgfSxcbiAgX2dldFBhcmVudChub2RlSWQsIHJlbGF0aW9uTmFtZSkge1xuICAgIGxldCBub2RlID0gU3BpbmFsR3JhcGhTZXJ2aWNlLmdldFJlYWxOb2RlKG5vZGVJZCk7XG4gICAgaWYgKG5vZGUucGFyZW50c1tyZWxhdGlvbk5hbWVdKSB7XG4gICAgICByZXR1cm4gbm9kZS5wYXJlbnRzW3JlbGF0aW9uTmFtZV1bMF0ubG9hZCgpLnRoZW4oYXN5bmMgcmVmID0+IHtcbiAgICAgICAgbGV0IHBhcmVudCA9IGF3YWl0IHJlZi5wYXJlbnQubG9hZCgpO1xuICAgICAgICByZXR1cm4gcGFyZW50LmluZm8uaWQuZ2V0KCk7XG4gICAgICB9KVxuICAgIH1cblxuICB9LFxuICBfZ2V0RGlmZmVyZW5jZUJldHdlZW5Ud29BcnJheShhcnJheTEsIGFycmF5Mikge1xuICAgIGxldCBmdWxsID0gYXJyYXkxLmNvbmNhdChhcnJheTIpO1xuXG4gICAgcmV0dXJuIGZ1bGwuZmlsdGVyKChlbCkgPT4ge1xuICAgICAgcmV0dXJuIGZ1bGwuaW5kZXhPZihlbCkgPT09IGZ1bGwubGFzdEluZGV4T2YoZWwpO1xuICAgIH0pXG5cbiAgfVxufTtcblxuZXhwb3J0IHtcbiAgZGFzaGJvYXJkU2VydmljZSxcbiAgZGFzaGJvYXJkVmFyaWFibGVzXG59O1xuXG5cblxuXG5cblxuXG5cblxuXG5cblxuXG5cbi8qXG5cbnVuTGlua1RvRGFzaEJvYXJkKGRhc2hib2FyZElkLCBub2RlSWQsIGNhbGxiYWNrKSB7XG4gICAgU3BpbmFsR3JhcGhTZXJ2aWNlLmdldENoaWxkcmVuKG5vZGVJZCwgW1xuICAgICAgZGFzaGJvYXJkVmFyaWFibGVzLkVORFBPSU5UX1JFTEFUSU9OX05BTUVcbiAgICBdKS50aGVuKGVsID0+IHtcbiAgICAgIGlmIChlbC5sZW5ndGggPiAwKSB7XG4gICAgICAgIGxldCBvbGREYXNoID0gZWxbMF0uaWQuZ2V0KCk7XG4gICAgICAgIGRhc2hib2FyZFNlcnZpY2UucmVtb3ZlQWxsRW5kcG9pbnRzKG5vZGVJZCkudGhlbigoKSA9PiB7XG4gICAgICAgICAgLy8gU3BpbmFsR3JhcGhTZXJ2aWNlLm1vdmVDaGlsZChcbiAgICAgICAgICAvLyAgIG9sZERhc2gsXG4gICAgICAgICAgLy8gICBkYXNoYm9hcmRJZCxcbiAgICAgICAgICAvLyAgIG5vZGVJZCxcbiAgICAgICAgICAvLyAgIGRhc2hib2FyZFZhcmlhYmxlcy5EQVNIQk9BUkRfVE9fRUxFTUVOVF9SRUxBVElPTixcbiAgICAgICAgICAvLyAgIFNQSU5BTF9SRUxBVElPTl9UWVBFXG4gICAgICAgICAgLy8gKS50aGVuKGVsID0+IHtcbiAgICAgICAgICAvLyAgIGlmIChlbCkge1xuICAgICAgICAgIC8vICAgICBjYWxsYmFjayh0cnVlKTtcbiAgICAgICAgICAvLyAgIH1cbiAgICAgICAgICAvLyB9KTtcblxuICAgICAgICAgIFNwaW5hbEdyYXBoU2VydmljZS5yZW1vdmVDaGlsZChvbGREYXNoLCBub2RlSWQsXG4gICAgICAgICAgICBkYXNoYm9hcmRWYXJpYWJsZXMuREFTSEJPQVJEX1RPX0VMRU1FTlRfUkVMQVRJT04pLnRoZW4oXG4gICAgICAgICAgICBlbCA9PiB7XG4gICAgICAgICAgICAgIGNhbGxiYWNrKGVsKTtcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgIH0pO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgY2FsbGJhY2soZmFsc2UpO1xuICAgICAgfVxuICAgIH0pO1xuICB9XG5cbiovIl19