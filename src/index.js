import * as dashboardVariables from "./globalVariables";
import {
  SPINAL_RELATION_LST_PTR_TYPE,
  SpinalGraphService
} from "spinal-env-viewer-graph-service";

import {
  SpinalBmsEndpoint
} from "spinal-model-bmsnetwork";

const {
  AbstractElement
} = require("spinal-models-building-elements");



let dashboardService = {
  createStandardDashBoardContext(contextName) {
    let context = SpinalGraphService.getContext(contextName);

    if (typeof context !== "undefined") return false;

    return SpinalGraphService.addContext(
      contextName,
      dashboardVariables.DASHBOARD_CONTEXT_TYPE,
      new AbstractElement(contextName)
    );
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

    let abstractNode = SpinalGraphService.createNode({
        name: dashboardName,
        type: dashboardType
      },
      abstract
    );

    SpinalGraphService.addChildInContext(
      contextId,
      abstractNode,
      contextId,
      dashboardVariables.RELATION_NAME,
      SPINAL_RELATION_LST_PTR_TYPE
    );
  },

  getDashboardByType(contextId, dashboardType) {
    return SpinalGraphService.getChildren(
      contextId,
      dashboardVariables.RELATION_NAME
    ).then(children => {
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
    return SpinalGraphService.getChildren(
      nodeId,
      dashboardVariables.ENDPOINT_RELATION_NAME
    ).then(children => {
      return children.length > 0;
    });
  },
  linkToDashboard(contextId, nodeId, dashboardId) {
    this.hasDashBoard(nodeId).then(async d => {
      if (d) await this.unLinkToDashBoard(nodeId);

      let dashboardInfo = SpinalGraphService.getInfo(dashboardId);

      dashboardInfo.element.load().then(element => {
        SpinalGraphService.addChildInContext(
          dashboardId,
          nodeId,
          contextId,
          dashboardVariables.DASHBOARD_TO_ELEMENT_RELATION,
          SPINAL_RELATION_LST_PTR_TYPE
        );


        let sensor = element.sensor.get();

        sensor.forEach(attr => {

          let endpoint = new SpinalBmsEndpoint(
            attr.name,
            "SpinalEndpoint_Path",
            attr.value,
            attr.unit,
            attr.dataType,
            attr.type
          );

          let child = SpinalGraphService.createNode({
              name: attr.name,
              type: attr.type
            },
            endpoint
          );

          SpinalGraphService.addChild(
            nodeId,
            child,
            dashboardVariables.ENDPOINT_RELATION_NAME,
            SPINAL_RELATION_LST_PTR_TYPE
          );
        });
      });

    })


  },
  getAllDashboardContext() {
    let graph = SpinalGraphService.getGraph();

    return graph.getChildren(["hasContext"]).then(contexts => {
      let res = [];

      contexts.forEach(context => {
        if (
          context.info.type.get() == dashboardVariables.DASHBOARD_CONTEXT_TYPE
        ) {
          res.push(context.info);
        }
      });

      return res;
    });
  },
  unLinkToDashBoard(nodeId, callback) {

    this._getParent(nodeId, dashboardVariables.DASHBOARD_TO_ELEMENT_RELATION)
      .then(oldDash => {
        dashboardService.removeAllEndpoints(nodeId).then(() => {

          SpinalGraphService.removeChild(oldDash, nodeId,
            dashboardVariables.DASHBOARD_TO_ELEMENT_RELATION,
            SPINAL_RELATION_LST_PTR_TYPE).then(
            el => {
              if (callback) callback(el);
            });

        });
      })

  },
  removeAllEndpoints(nodeId) {
    return SpinalGraphService.getChildren(nodeId, [
      dashboardVariables.ENDPOINT_RELATION_NAME
    ]).then(endpoints => {
      for (let i = 0; i < endpoints.length; i++) {
        SpinalGraphService.removeChild(
          nodeId,
          endpoints[i].id.get(),
          dashboardVariables.ENDPOINT_RELATION_NAME,
          SPINAL_RELATION_LST_PTR_TYPE
        );
      }
      return;
    });
  },
  addCalculationRule(nodeId, endpointType, rule, reference = null) {
    SpinalGraphService.getChildren(
      nodeId,
      dashboardVariables.ENDPOINT_RELATION_NAME
    ).then(endpoints => {
      let endpoint;
      for (let index = 0; index < endpoints.length; index++) {
        const element = endpoints[index];
        if (element.id.get() === endpointType || element.type.get() ===
          endpointType) {
          endpoint = SpinalGraphService.getRealNode(element.id.get());
        }

      }

      if (endpoint) {
        if (endpoint.info.dash_cal_rule)
          endpoint.info.rem_attr("dash_cal_rule");

        endpoint.info.add_attr("dash_cal_rule", {
          rule: rule,
          ref: reference
        });
      }
    });
  },
  //a modifier
  editDashboard(dashboardId, newName, NewSensor) {
    let dashboardNode = SpinalGraphService.getRealNode(dashboardId);
    dashboardNode.info.name.set(newName);

    dashboardNode.element.load().then(dashBoardElement => {
      dashBoardElement.name.set(newName);
      let sensor = dashBoardElement.sensor.get();

      let difference = this._getDifferenceBetweenTwoArray(NewSensor,
        sensor);

      console.log("difference", difference);


      difference.forEach(el => {
        if (!sensor.includes(el)) {
          dashBoardElement.sensor.push(el);
        } else if (!NewSensor.includes(el)) {
          dashBoardElement.sensor.splice(sensor.indexOf(el), 1);
        }
      })

    })

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

    let node = SpinalGraphService.getRealNode(bimObjectId);

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
    let node = SpinalGraphService.getRealNode(nodeId);
    if (node.parents[relationName]) {
      return node.parents[relationName][0].load().then(async ref => {
        let parent = await ref.parent.load();
        return parent.info.id.get();
      })
    }

  },
  _getDifferenceBetweenTwoArray(array1, array2) {
    let full = array1.concat(array2);

    return full.filter((el) => {
      return full.indexOf(el) === full.lastIndexOf(el);
    })

  }
};

export {
  dashboardService,
  dashboardVariables
};














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