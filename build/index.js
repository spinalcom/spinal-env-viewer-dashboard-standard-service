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

    _spinalEnvViewerGraphService.SpinalGraphService.addChildInContext(contextId, abstractNode, contextId, dashboardVariables.RELATION_NAME, _spinalEnvViewerGraphService.SPINAL_RELATION_LST_PTR_TYPE);
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
          _spinalEnvViewerGraphService.SpinalGraphService.addChildInContext(dashboardId, nodeId, contextId, dashboardVariables.DASHBOARD_TO_ELEMENT_RELATION, _spinalEnvViewerGraphService.SPINAL_RELATION_LST_PTR_TYPE);

          let sensor = element.sensor.get();

          sensor.forEach(function (attr) {

            let endpoint = new _spinalModelBmsnetwork.SpinalBmsEndpoint(attr.name, "SpinalEndpoint_Path", attr.value, attr.unit, attr.dataType, attr.type);

            let child = _spinalEnvViewerGraphService.SpinalGraphService.createNode({
              name: attr.name,
              type: attr.type
            }, endpoint);

            _spinalEnvViewerGraphService.SpinalGraphService.addChild(nodeId, child, dashboardVariables.ENDPOINT_RELATION_NAME, _spinalEnvViewerGraphService.SPINAL_RELATION_LST_PTR_TYPE);
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

        _spinalEnvViewerGraphService.SpinalGraphService.removeChild(oldDash, nodeId, dashboardVariables.DASHBOARD_TO_ELEMENT_RELATION, _spinalEnvViewerGraphService.SPINAL_RELATION_LST_PTR_TYPE).then(el => {
          if (callback) callback(el);
        });
      });
    });
  },
  removeAllEndpoints(nodeId) {
    return _spinalEnvViewerGraphService.SpinalGraphService.getChildren(nodeId, [dashboardVariables.ENDPOINT_RELATION_NAME]).then(endpoints => {
      for (let i = 0; i < endpoints.length; i++) {
        _spinalEnvViewerGraphService.SpinalGraphService.removeChild(nodeId, endpoints[i].id.get(), dashboardVariables.ENDPOINT_RELATION_NAME, _spinalEnvViewerGraphService.SPINAL_RELATION_LST_PTR_TYPE);
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
          //   SPINAL_RELATION_LST_PTR_TYPE
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9pbmRleC5qcyJdLCJuYW1lcyI6WyJkYXNoYm9hcmRWYXJpYWJsZXMiLCJBYnN0cmFjdEVsZW1lbnQiLCJyZXF1aXJlIiwiZGFzaGJvYXJkU2VydmljZSIsImNyZWF0ZVN0YW5kYXJkRGFzaEJvYXJkQ29udGV4dCIsImNvbnRleHROYW1lIiwiY29udGV4dCIsIlNwaW5hbEdyYXBoU2VydmljZSIsImdldENvbnRleHQiLCJhZGRDb250ZXh0IiwiREFTSEJPQVJEX0NPTlRFWFRfVFlQRSIsImNyZWF0ZVN0YW5kYXJkRGFzaEJvYXJkIiwiY29udGV4dElkIiwiZGFzaGJvYXJkTmFtZSIsImRhc2hib2FyZFR5cGUiLCJhdHRyaWJ1dGVzIiwiYWJzdHJhY3QiLCJhZGRfYXR0ciIsInNlbnNvciIsImNvbm5lY3RlZCIsImZvckVhY2giLCJhdHRyIiwiY2hlY2tlZCIsInB1c2giLCJhYnN0cmFjdE5vZGUiLCJjcmVhdGVOb2RlIiwibmFtZSIsInR5cGUiLCJhZGRDaGlsZEluQ29udGV4dCIsIlJFTEFUSU9OX05BTUUiLCJTUElOQUxfUkVMQVRJT05fTFNUX1BUUl9UWVBFIiwiZ2V0RGFzaGJvYXJkQnlUeXBlIiwiZ2V0Q2hpbGRyZW4iLCJ0aGVuIiwiY2hpbGRyZW4iLCJyZXMiLCJpIiwibGVuZ3RoIiwiY2hpbGQiLCJnZXQiLCJoYXNEYXNoQm9hcmQiLCJub2RlSWQiLCJFTkRQT0lOVF9SRUxBVElPTl9OQU1FIiwibGlua1RvRGFzaGJvYXJkIiwiZGFzaGJvYXJkSWQiLCJkIiwidW5MaW5rVG9EYXNoQm9hcmQiLCJkYXNoYm9hcmRJbmZvIiwiZ2V0SW5mbyIsImVsZW1lbnQiLCJsb2FkIiwiREFTSEJPQVJEX1RPX0VMRU1FTlRfUkVMQVRJT04iLCJlbmRwb2ludCIsIlNwaW5hbEJtc0VuZHBvaW50IiwidmFsdWUiLCJ1bml0IiwiZGF0YVR5cGUiLCJhZGRDaGlsZCIsImdldEFsbERhc2hib2FyZENvbnRleHQiLCJncmFwaCIsImdldEdyYXBoIiwiY29udGV4dHMiLCJpbmZvIiwiY2FsbGJhY2siLCJfZ2V0UGFyZW50Iiwib2xkRGFzaCIsInJlbW92ZUFsbEVuZHBvaW50cyIsInJlbW92ZUNoaWxkIiwiZWwiLCJlbmRwb2ludHMiLCJpZCIsImFkZENhbGN1bGF0aW9uUnVsZSIsImVuZHBvaW50VHlwZSIsInJ1bGUiLCJyZWZlcmVuY2UiLCJpbmRleCIsImdldFJlYWxOb2RlIiwiZGFzaF9jYWxfcnVsZSIsInJlbV9hdHRyIiwicmVmIiwiZWRpdERhc2hib2FyZCIsIm5ld05hbWUiLCJOZXdTZW5zb3IiLCJkYXNoYm9hcmROb2RlIiwic2V0IiwiZGFzaEJvYXJkRWxlbWVudCIsImRpZmZlcmVuY2UiLCJfZ2V0RGlmZmVyZW5jZUJldHdlZW5Ud29BcnJheSIsImNvbnNvbGUiLCJsb2ciLCJpbmNsdWRlcyIsInNwbGljZSIsImluZGV4T2YiLCJhZGRSZWZlcmVuY2VUb0JpbU9iamVjdCIsImJpbU9iamVjdElkIiwicmVmZXJlbmNlSWQiLCJub2RlIiwicmVsYXRpb25OYW1lIiwicGFyZW50cyIsInBhcmVudCIsImFycmF5MSIsImFycmF5MiIsImZ1bGwiLCJjb25jYXQiLCJmaWx0ZXIiLCJsYXN0SW5kZXhPZiJdLCJtYXBwaW5ncyI6Ijs7Ozs7OztBQUFBOztJQUFZQSxrQjs7QUFDWjs7QUFLQTs7Ozs7O0FBSUEsTUFBTTtBQUNKQztBQURJLElBRUZDLFFBQVEsaUNBQVIsQ0FGSjs7QUFNQSxJQUFJQyxtQkFBbUI7QUFDckJDLGlDQUErQkMsV0FBL0IsRUFBNEM7QUFDMUMsUUFBSUMsVUFBVUMsZ0RBQW1CQyxVQUFuQixDQUE4QkgsV0FBOUIsQ0FBZDs7QUFFQSxRQUFJLE9BQU9DLE9BQVAsS0FBbUIsV0FBdkIsRUFBb0MsT0FBTyxLQUFQOztBQUVwQyxXQUFPQyxnREFBbUJFLFVBQW5CLENBQ0xKLFdBREssRUFFTEwsbUJBQW1CVSxzQkFGZCxFQUdMLElBQUlULGVBQUosQ0FBb0JJLFdBQXBCLENBSEssQ0FBUDtBQUtELEdBWG9CO0FBWXJCTSwwQkFBd0JD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QUFDNUMsUUFBSUMsT0FBT0YsT0FBT0csTUFBUCxDQUFjRixNQUFkLENBQVg7O0FBRUEsV0FBT0MsS0FBS0UsTUFBTCxDQUFhcEMsRUFBRCxJQUFRO0FBQ3pCLGFBQU9rQyxLQUFLVixPQUFMLENBQWF4QixFQUFiLE1BQXFCa0MsS0FBS0csV0FBTCxDQUFpQnJDLEVBQWpCLENBQTVCO0FBQ0QsS0FGTSxDQUFQO0FBSUQ7QUFuUW9CLENBQXZCOztRQXVRRWpFLGdCLEdBQUFBLGdCO1FBQ0FILGtCLEdBQUFBLGtCOztBQWdCRiIsImZpbGUiOiJpbmRleC5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCAqIGFzIGRhc2hib2FyZFZhcmlhYmxlcyBmcm9tIFwiLi9nbG9iYWxWYXJpYWJsZXNcIjtcbmltcG9ydCB7XG4gIFNQSU5BTF9SRUxBVElPTl9MU1RfUFRSX1RZUEUsXG4gIFNwaW5hbEdyYXBoU2VydmljZVxufSBmcm9tIFwic3BpbmFsLWVudi12aWV3ZXItZ3JhcGgtc2VydmljZVwiO1xuXG5pbXBvcnQge1xuICBTcGluYWxCbXNFbmRwb2ludFxufSBmcm9tIFwic3BpbmFsLW1vZGVsLWJtc25ldHdvcmtcIjtcblxuY29uc3Qge1xuICBBYnN0cmFjdEVsZW1lbnRcbn0gPSByZXF1aXJlKFwic3BpbmFsLW1vZGVscy1idWlsZGluZy1lbGVtZW50c1wiKTtcblxuXG5cbmxldCBkYXNoYm9hcmRTZXJ2aWNlID0ge1xuICBjcmVhdGVTdGFuZGFyZERhc2hCb2FyZENvbnRleHQoY29udGV4dE5hbWUpIHtcbiAgICBsZXQgY29udGV4dCA9IFNwaW5hbEdyYXBoU2VydmljZS5nZXRDb250ZXh0KGNvbnRleHROYW1lKTtcblxuICAgIGlmICh0eXBlb2YgY29udGV4dCAhPT0gXCJ1bmRlZmluZWRcIikgcmV0dXJuIGZhbHNlO1xuXG4gICAgcmV0dXJuIFNwaW5hbEdyYXBoU2VydmljZS5hZGRDb250ZXh0KFxuICAgICAgY29udGV4dE5hbWUsXG4gICAgICBkYXNoYm9hcmRWYXJpYWJsZXMuREFTSEJPQVJEX0NPTlRFWFRfVFlQRSxcbiAgICAgIG5ldyBBYnN0cmFjdEVsZW1lbnQoY29udGV4dE5hbWUpXG4gICAgKTtcbiAgfSxcbiAgY3JlYXRlU3RhbmRhcmREYXNoQm9hcmQoY29udGV4dElkLCBkYXNoYm9hcmROYW1lLCBkYXNoYm9hcmRUeXBlLCBhdHRyaWJ1dGVzKSB7XG4gICAgbGV0IGFic3RyYWN0ID0gbmV3IEFic3RyYWN0RWxlbWVudChkYXNoYm9hcmROYW1lKTtcblxuICAgIGFic3RyYWN0LmFkZF9hdHRyKHtcbiAgICAgIHNlbnNvcjogW10sXG4gICAgICBjb25uZWN0ZWQ6IFtdXG4gICAgfSk7XG5cbiAgICBhdHRyaWJ1dGVzLmZvckVhY2goYXR0ciA9PiB7XG4gICAgICBkZWxldGUgYXR0ci5jaGVja2VkO1xuICAgICAgYWJzdHJhY3Quc2Vuc29yLnB1c2goYXR0cik7XG4gICAgfSk7XG5cbiAgICBsZXQgYWJzdHJhY3ROb2RlID0gU3BpbmFsR3JhcGhTZXJ2aWNlLmNyZWF0ZU5vZGUoe1xuICAgICAgICBuYW1lOiBkYXNoYm9hcmROYW1lLFxuICAgICAgICB0eXBlOiBkYXNoYm9hcmRUeXBlXG4gICAgICB9LFxuICAgICAgYWJzdHJhY3RcbiAgICApO1xuXG4gICAgU3BpbmFsR3JhcGhTZXJ2aWNlLmFkZENoaWxkSW5Db250ZXh0KFxuICAgICAgY29udGV4dElkLFxuICAgICAgYWJzdHJhY3ROb2RlLFxuICAgICAgY29udGV4dElkLFxuICAgICAgZGFzaGJvYXJkVmFyaWFibGVzLlJFTEFUSU9OX05BTUUsXG4gICAgICBTUElOQUxfUkVMQVRJT05fTFNUX1BUUl9UWVBFXG4gICAgKTtcbiAgfSxcblxuICBnZXREYXNoYm9hcmRCeVR5cGUoY29udGV4dElkLCBkYXNoYm9hcmRUeXBlKSB7XG4gICAgcmV0dXJuIFNwaW5hbEdyYXBoU2VydmljZS5nZXRDaGlsZHJlbihcbiAgICAgIGNvbnRleHRJZCxcbiAgICAgIGRhc2hib2FyZFZhcmlhYmxlcy5SRUxBVElPTl9OQU1FXG4gICAgKS50aGVuKGNoaWxkcmVuID0+IHtcbiAgICAgIGxldCByZXMgPSBbXTtcblxuICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBjaGlsZHJlbi5sZW5ndGg7IGkrKykge1xuICAgICAgICBjb25zdCBjaGlsZCA9IGNoaWxkcmVuW2ldO1xuICAgICAgICBpZiAoY2hpbGQudHlwZS5nZXQoKSA9PT0gZGFzaGJvYXJkVHlwZSkge1xuICAgICAgICAgIHJlcy5wdXNoKGNoaWxkKTtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICByZXR1cm4gcmVzO1xuICAgIH0pO1xuICB9LFxuICBoYXNEYXNoQm9hcmQobm9kZUlkKSB7XG4gICAgcmV0dXJuIFNwaW5hbEdyYXBoU2VydmljZS5nZXRDaGlsZHJlbihcbiAgICAgIG5vZGVJZCxcbiAgICAgIGRhc2hib2FyZFZhcmlhYmxlcy5FTkRQT0lOVF9SRUxBVElPTl9OQU1FXG4gICAgKS50aGVuKGNoaWxkcmVuID0+IHtcbiAgICAgIHJldHVybiBjaGlsZHJlbi5sZW5ndGggPiAwO1xuICAgIH0pO1xuICB9LFxuICBsaW5rVG9EYXNoYm9hcmQoY29udGV4dElkLCBub2RlSWQsIGRhc2hib2FyZElkKSB7XG4gICAgdGhpcy5oYXNEYXNoQm9hcmQobm9kZUlkKS50aGVuKGFzeW5jIGQgPT4ge1xuICAgICAgaWYgKGQpIGF3YWl0IHRoaXMudW5MaW5rVG9EYXNoQm9hcmQobm9kZUlkKTtcblxuICAgICAgbGV0IGRhc2hib2FyZEluZm8gPSBTcGluYWxHcmFwaFNlcnZpY2UuZ2V0SW5mbyhkYXNoYm9hcmRJZCk7XG5cbiAgICAgIGRhc2hib2FyZEluZm8uZWxlbWVudC5sb2FkKCkudGhlbihlbGVtZW50ID0+IHtcbiAgICAgICAgU3BpbmFsR3JhcGhTZXJ2aWNlLmFkZENoaWxkSW5Db250ZXh0KFxuICAgICAgICAgIGRhc2hib2FyZElkLFxuICAgICAgICAgIG5vZGVJZCxcbiAgICAgICAgICBjb250ZXh0SWQsXG4gICAgICAgICAgZGFzaGJvYXJkVmFyaWFibGVzLkRBU0hCT0FSRF9UT19FTEVNRU5UX1JFTEFUSU9OLFxuICAgICAgICAgIFNQSU5BTF9SRUxBVElPTl9MU1RfUFRSX1RZUEVcbiAgICAgICAgKTtcblxuXG4gICAgICAgIGxldCBzZW5zb3IgPSBlbGVtZW50LnNlbnNvci5nZXQoKTtcblxuICAgICAgICBzZW5zb3IuZm9yRWFjaChhdHRyID0+IHtcblxuICAgICAgICAgIGxldCBlbmRwb2ludCA9IG5ldyBTcGluYWxCbXNFbmRwb2ludChcbiAgICAgICAgICAgIGF0dHIubmFtZSxcbiAgICAgICAgICAgIFwiU3BpbmFsRW5kcG9pbnRfUGF0aFwiLFxuICAgICAgICAgICAgYXR0ci52YWx1ZSxcbiAgICAgICAgICAgIGF0dHIudW5pdCxcbiAgICAgICAgICAgIGF0dHIuZGF0YVR5cGUsXG4gICAgICAgICAgICBhdHRyLnR5cGVcbiAgICAgICAgICApO1xuXG4gICAgICAgICAgbGV0IGNoaWxkID0gU3BpbmFsR3JhcGhTZXJ2aWNlLmNyZWF0ZU5vZGUoe1xuICAgICAgICAgICAgICBuYW1lOiBhdHRyLm5hbWUsXG4gICAgICAgICAgICAgIHR5cGU6IGF0dHIudHlwZVxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIGVuZHBvaW50XG4gICAgICAgICAgKTtcblxuICAgICAgICAgIFNwaW5hbEdyYXBoU2VydmljZS5hZGRDaGlsZChcbiAgICAgICAgICAgIG5vZGVJZCxcbiAgICAgICAgICAgIGNoaWxkLFxuICAgICAgICAgICAgZGFzaGJvYXJkVmFyaWFibGVzLkVORFBPSU5UX1JFTEFUSU9OX05BTUUsXG4gICAgICAgICAgICBTUElOQUxfUkVMQVRJT05fTFNUX1BUUl9UWVBFXG4gICAgICAgICAgKTtcbiAgICAgICAgfSk7XG4gICAgICB9KTtcblxuICAgIH0pXG5cblxuICB9LFxuICBnZXRBbGxEYXNoYm9hcmRDb250ZXh0KCkge1xuICAgIGxldCBncmFwaCA9IFNwaW5hbEdyYXBoU2VydmljZS5nZXRHcmFwaCgpO1xuXG4gICAgcmV0dXJuIGdyYXBoLmdldENoaWxkcmVuKFtcImhhc0NvbnRleHRcIl0pLnRoZW4oY29udGV4dHMgPT4ge1xuICAgICAgbGV0IHJlcyA9IFtdO1xuXG4gICAgICBjb250ZXh0cy5mb3JFYWNoKGNvbnRleHQgPT4ge1xuICAgICAgICBpZiAoXG4gICAgICAgICAgY29udGV4dC5pbmZvLnR5cGUuZ2V0KCkgPT0gZGFzaGJvYXJkVmFyaWFibGVzLkRBU0hCT0FSRF9DT05URVhUX1RZUEVcbiAgICAgICAgKSB7XG4gICAgICAgICAgcmVzLnB1c2goY29udGV4dC5pbmZvKTtcbiAgICAgICAgfVxuICAgICAgfSk7XG5cbiAgICAgIHJldHVybiByZXM7XG4gICAgfSk7XG4gIH0sXG4gIHVuTGlua1RvRGFzaEJvYXJkKG5vZGVJZCwgY2FsbGJhY2spIHtcblxuICAgIHRoaXMuX2dldFBhcmVudChub2RlSWQsIGRhc2hib2FyZFZhcmlhYmxlcy5EQVNIQk9BUkRfVE9fRUxFTUVOVF9SRUxBVElPTilcbiAgICAgIC50aGVuKG9sZERhc2ggPT4ge1xuICAgICAgICBkYXNoYm9hcmRTZXJ2aWNlLnJlbW92ZUFsbEVuZHBvaW50cyhub2RlSWQpLnRoZW4oKCkgPT4ge1xuXG4gICAgICAgICAgU3BpbmFsR3JhcGhTZXJ2aWNlLnJlbW92ZUNoaWxkKG9sZERhc2gsIG5vZGVJZCxcbiAgICAgICAgICAgIGRhc2hib2FyZFZhcmlhYmxlcy5EQVNIQk9BUkRfVE9fRUxFTUVOVF9SRUxBVElPTixcbiAgICAgICAgICAgIFNQSU5BTF9SRUxBVElPTl9MU1RfUFRSX1RZUEUpLnRoZW4oXG4gICAgICAgICAgICBlbCA9PiB7XG4gICAgICAgICAgICAgIGlmIChjYWxsYmFjaykgY2FsbGJhY2soZWwpO1xuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgfSk7XG4gICAgICB9KVxuXG4gIH0sXG4gIHJlbW92ZUFsbEVuZHBvaW50cyhub2RlSWQpIHtcbiAgICByZXR1cm4gU3BpbmFsR3JhcGhTZXJ2aWNlLmdldENoaWxkcmVuKG5vZGVJZCwgW1xuICAgICAgZGFzaGJvYXJkVmFyaWFibGVzLkVORFBPSU5UX1JFTEFUSU9OX05BTUVcbiAgICBdKS50aGVuKGVuZHBvaW50cyA9PiB7XG4gICAgICBmb3IgKGxldCBpID0gMDsgaSA8IGVuZHBvaW50cy5sZW5ndGg7IGkrKykge1xuICAgICAgICBTcGluYWxHcmFwaFNlcnZpY2UucmVtb3ZlQ2hpbGQoXG4gICAgICAgICAgbm9kZUlkLFxuICAgICAgICAgIGVuZHBvaW50c1tpXS5pZC5nZXQoKSxcbiAgICAgICAgICBkYXNoYm9hcmRWYXJpYWJsZXMuRU5EUE9JTlRfUkVMQVRJT05fTkFNRSxcbiAgICAgICAgICBTUElOQUxfUkVMQVRJT05fTFNUX1BUUl9UWVBFXG4gICAgICAgICk7XG4gICAgICB9XG4gICAgICByZXR1cm47XG4gICAgfSk7XG4gIH0sXG4gIGFkZENhbGN1bGF0aW9uUnVsZShub2RlSWQsIGVuZHBvaW50VHlwZSwgcnVsZSwgcmVmZXJlbmNlID0gbnVsbCkge1xuICAgIFNwaW5hbEdyYXBoU2VydmljZS5nZXRDaGlsZHJlbihcbiAgICAgIG5vZGVJZCxcbiAgICAgIGRhc2hib2FyZFZhcmlhYmxlcy5FTkRQT0lOVF9SRUxBVElPTl9OQU1FXG4gICAgKS50aGVuKGVuZHBvaW50cyA9PiB7XG4gICAgICBsZXQgZW5kcG9pbnQ7XG4gICAgICBmb3IgKGxldCBpbmRleCA9IDA7IGluZGV4IDwgZW5kcG9pbnRzLmxlbmd0aDsgaW5kZXgrKykge1xuICAgICAgICBjb25zdCBlbGVtZW50ID0gZW5kcG9pbnRzW2luZGV4XTtcbiAgICAgICAgaWYgKGVsZW1lbnQuaWQuZ2V0KCkgPT09IGVuZHBvaW50VHlwZSB8fCBlbGVtZW50LnR5cGUuZ2V0KCkgPT09XG4gICAgICAgICAgZW5kcG9pbnRUeXBlKSB7XG4gICAgICAgICAgZW5kcG9pbnQgPSBTcGluYWxHcmFwaFNlcnZpY2UuZ2V0UmVhbE5vZGUoZWxlbWVudC5pZC5nZXQoKSk7XG4gICAgICAgIH1cblxuICAgICAgfVxuXG4gICAgICBpZiAoZW5kcG9pbnQpIHtcbiAgICAgICAgaWYgKGVuZHBvaW50LmluZm8uZGFzaF9jYWxfcnVsZSlcbiAgICAgICAgICBlbmRwb2ludC5pbmZvLnJlbV9hdHRyKFwiZGFzaF9jYWxfcnVsZVwiKTtcblxuICAgICAgICBlbmRwb2ludC5pbmZvLmFkZF9hdHRyKFwiZGFzaF9jYWxfcnVsZVwiLCB7XG4gICAgICAgICAgcnVsZTogcnVsZSxcbiAgICAgICAgICByZWY6IHJlZmVyZW5jZVxuICAgICAgICB9KTtcbiAgICAgIH1cbiAgICB9KTtcbiAgfSxcbiAgLy9hIG1vZGlmaWVyXG4gIGVkaXREYXNoYm9hcmQoZGFzaGJvYXJkSWQsIG5ld05hbWUsIE5ld1NlbnNvcikge1xuICAgIGxldCBkYXNoYm9hcmROb2RlID0gU3BpbmFsR3JhcGhTZXJ2aWNlLmdldFJlYWxOb2RlKGRhc2hib2FyZElkKTtcbiAgICBkYXNoYm9hcmROb2RlLmluZm8ubmFtZS5zZXQobmV3TmFtZSk7XG5cbiAgICBkYXNoYm9hcmROb2RlLmVsZW1lbnQubG9hZCgpLnRoZW4oZGFzaEJvYXJkRWxlbWVudCA9PiB7XG4gICAgICBkYXNoQm9hcmRFbGVtZW50Lm5hbWUuc2V0KG5ld05hbWUpO1xuICAgICAgbGV0IHNlbnNvciA9IGRhc2hCb2FyZEVsZW1lbnQuc2Vuc29yLmdldCgpO1xuXG4gICAgICBsZXQgZGlmZmVyZW5jZSA9IHRoaXMuX2dldERpZmZlcmVuY2VCZXR3ZWVuVHdvQXJyYXkoTmV3U2Vuc29yLFxuICAgICAgICBzZW5zb3IpO1xuXG4gICAgICBjb25zb2xlLmxvZyhcImRpZmZlcmVuY2VcIiwgZGlmZmVyZW5jZSk7XG5cblxuICAgICAgZGlmZmVyZW5jZS5mb3JFYWNoKGVsID0+IHtcbiAgICAgICAgaWYgKCFzZW5zb3IuaW5jbHVkZXMoZWwpKSB7XG4gICAgICAgICAgZGFzaEJvYXJkRWxlbWVudC5zZW5zb3IucHVzaChlbCk7XG4gICAgICAgIH0gZWxzZSBpZiAoIU5ld1NlbnNvci5pbmNsdWRlcyhlbCkpIHtcbiAgICAgICAgICBkYXNoQm9hcmRFbGVtZW50LnNlbnNvci5zcGxpY2Uoc2Vuc29yLmluZGV4T2YoZWwpLCAxKTtcbiAgICAgICAgfVxuICAgICAgfSlcblxuICAgIH0pXG5cbiAgfSxcbiAgYWRkUmVmZXJlbmNlVG9CaW1PYmplY3QoYmltT2JqZWN0SWQsIHJlZmVyZW5jZUlkLCBlbmRwb2ludFR5cGUpIHtcbiAgICAvLyBTcGluYWxHcmFwaFNlcnZpY2UuY3JlYXRlTm9kZSgpXG4gICAgLy8gbGV0IG5vZGUgPSBTcGluYWxHcmFwaFNlcnZpY2UuZ2V0SW5mbyhyZWZlcmVuY2VJZCk7XG4gICAgLy8gbm9kZS5lbGVtZW50LmxvYWQoKS50aGVuKGVsZW1lbnQgPT4ge1xuICAgIC8vICAgaWYgKGVsZW1lbnQucmVmZXJlbmNlT2YpIGVsZW1lbnQucmVmZXJlbmNlT2Yuc2V0KGVuZHBvaW50VHlwZSk7XG4gICAgLy8gICBlbHNlIGVsZW1lbnQuYWRkX2F0dHIoe1xuICAgIC8vICAgICByZWZlcmVuY2VPZjogZW5kcG9pbnRUeXBlXG4gICAgLy8gICB9KVxuICAgIC8vIH0pXG5cbiAgICBsZXQgbm9kZSA9IFNwaW5hbEdyYXBoU2VydmljZS5nZXRSZWFsTm9kZShiaW1PYmplY3RJZCk7XG5cbiAgICBpZiAoIW5vZGUuaW5mby5yZWZlcmVuY2UpIG5vZGUuaW5mby5hZGRfYXR0cih7XG4gICAgICByZWZlcmVuY2U6IHt9XG4gICAgfSk7XG4gICAgaWYgKCFub2RlLmluZm8ucmVmZXJlbmNlW2VuZHBvaW50VHlwZV0pIHtcbiAgICAgIG5vZGUuaW5mby5yZWZlcmVuY2UuYWRkX2F0dHIoZW5kcG9pbnRUeXBlLCByZWZlcmVuY2VJZCk7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgbm9kZS5pbmZvLnJlZmVyZW5jZVtlbmRwb2ludFR5cGVdLnNldChyZWZlcmVuY2VJZCk7XG4gICAgcmV0dXJuO1xuXG5cbiAgICAvLyByZXR1cm4gU3BpbmFsR3JhcGhTZXJ2aWNlLmFkZENoaWxkKGJpbU9iamVjdElkLCAsIClcbiAgfSxcbiAgX2dldFBhcmVudChub2RlSWQsIHJlbGF0aW9uTmFtZSkge1xuICAgIGxldCBub2RlID0gU3BpbmFsR3JhcGhTZXJ2aWNlLmdldFJlYWxOb2RlKG5vZGVJZCk7XG4gICAgaWYgKG5vZGUucGFyZW50c1tyZWxhdGlvbk5hbWVdKSB7XG4gICAgICByZXR1cm4gbm9kZS5wYXJlbnRzW3JlbGF0aW9uTmFtZV1bMF0ubG9hZCgpLnRoZW4oYXN5bmMgcmVmID0+IHtcbiAgICAgICAgbGV0IHBhcmVudCA9IGF3YWl0IHJlZi5wYXJlbnQubG9hZCgpO1xuICAgICAgICByZXR1cm4gcGFyZW50LmluZm8uaWQuZ2V0KCk7XG4gICAgICB9KVxuICAgIH1cblxuICB9LFxuICBfZ2V0RGlmZmVyZW5jZUJldHdlZW5Ud29BcnJheShhcnJheTEsIGFycmF5Mikge1xuICAgIGxldCBmdWxsID0gYXJyYXkxLmNvbmNhdChhcnJheTIpO1xuXG4gICAgcmV0dXJuIGZ1bGwuZmlsdGVyKChlbCkgPT4ge1xuICAgICAgcmV0dXJuIGZ1bGwuaW5kZXhPZihlbCkgPT09IGZ1bGwubGFzdEluZGV4T2YoZWwpO1xuICAgIH0pXG5cbiAgfVxufTtcblxuZXhwb3J0IHtcbiAgZGFzaGJvYXJkU2VydmljZSxcbiAgZGFzaGJvYXJkVmFyaWFibGVzXG59O1xuXG5cblxuXG5cblxuXG5cblxuXG5cblxuXG5cbi8qXG5cbnVuTGlua1RvRGFzaEJvYXJkKGRhc2hib2FyZElkLCBub2RlSWQsIGNhbGxiYWNrKSB7XG4gICAgU3BpbmFsR3JhcGhTZXJ2aWNlLmdldENoaWxkcmVuKG5vZGVJZCwgW1xuICAgICAgZGFzaGJvYXJkVmFyaWFibGVzLkVORFBPSU5UX1JFTEFUSU9OX05BTUVcbiAgICBdKS50aGVuKGVsID0+IHtcbiAgICAgIGlmIChlbC5sZW5ndGggPiAwKSB7XG4gICAgICAgIGxldCBvbGREYXNoID0gZWxbMF0uaWQuZ2V0KCk7XG4gICAgICAgIGRhc2hib2FyZFNlcnZpY2UucmVtb3ZlQWxsRW5kcG9pbnRzKG5vZGVJZCkudGhlbigoKSA9PiB7XG4gICAgICAgICAgLy8gU3BpbmFsR3JhcGhTZXJ2aWNlLm1vdmVDaGlsZChcbiAgICAgICAgICAvLyAgIG9sZERhc2gsXG4gICAgICAgICAgLy8gICBkYXNoYm9hcmRJZCxcbiAgICAgICAgICAvLyAgIG5vZGVJZCxcbiAgICAgICAgICAvLyAgIGRhc2hib2FyZFZhcmlhYmxlcy5EQVNIQk9BUkRfVE9fRUxFTUVOVF9SRUxBVElPTixcbiAgICAgICAgICAvLyAgIFNQSU5BTF9SRUxBVElPTl9MU1RfUFRSX1RZUEVcbiAgICAgICAgICAvLyApLnRoZW4oZWwgPT4ge1xuICAgICAgICAgIC8vICAgaWYgKGVsKSB7XG4gICAgICAgICAgLy8gICAgIGNhbGxiYWNrKHRydWUpO1xuICAgICAgICAgIC8vICAgfVxuICAgICAgICAgIC8vIH0pO1xuXG4gICAgICAgICAgU3BpbmFsR3JhcGhTZXJ2aWNlLnJlbW92ZUNoaWxkKG9sZERhc2gsIG5vZGVJZCxcbiAgICAgICAgICAgIGRhc2hib2FyZFZhcmlhYmxlcy5EQVNIQk9BUkRfVE9fRUxFTUVOVF9SRUxBVElPTikudGhlbihcbiAgICAgICAgICAgIGVsID0+IHtcbiAgICAgICAgICAgICAgY2FsbGJhY2soZWwpO1xuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgfSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBjYWxsYmFjayhmYWxzZSk7XG4gICAgICB9XG4gICAgfSk7XG4gIH1cblxuKi8iXX0=