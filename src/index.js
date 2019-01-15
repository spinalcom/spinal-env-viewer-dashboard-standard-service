import * as dashboardVariables from "./globalVariables";
import {
  SPINAL_RELATION_TYPE,
  SpinalGraphService
} from "spinal-env-viewer-graph-service";

// import {
//   SpinalEndpoint
// } from "spinal-models-bmsNetwork";

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
      SPINAL_RELATION_TYPE
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
    dashboardService.unLinkToDashBoard(dashboardId, nodeId, (el) => {

      let dashboardInfo = SpinalGraphService.getInfo(dashboardId);

      dashboardInfo.element.load().then(element => {
        if (!el) {
          SpinalGraphService.addChildInContext(
            dashboardId,
            nodeId,
            contextId,
            dashboardVariables.DASHBOARD_TO_ELEMENT_RELATION,
            SPINAL_RELATION_TYPE
          );

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

          let endpoint = new SpinalBmsEndpoint(attr.name,
            "SpinalEndpoint_Path", attr.value, attr.unit, attr.dataType,
            attr.type);

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
            SPINAL_RELATION_TYPE
          );
        });
      });
    });
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
  unLinkToDashBoard(dashboardId, nodeId, callback) {
    SpinalGraphService.getChildren(nodeId, [dashboardVariables.ENDPOINT_RELATION_NAME])
      .then(el => {


        if (el.length > 0) {
          let oldDash = el[0].id.get();
          dashboardService.removeAllEndpoints(nodeId).then(() => {

            SpinalGraphService.moveChild(oldDash, dashboardId,
              nodeId,
              dashboardVariables.DASHBOARD_TO_ELEMENT_RELATION,
              SPINAL_RELATION_TYPE).then((el) => {
              if (el) {
                callback(true);
              }
            })

          });

        } else {
          callback(false);
        }




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
          SPINAL_RELATION_TYPE
        );
      }
      return;
    });
  }
};

export {
  dashboardService,
  dashboardVariables
};