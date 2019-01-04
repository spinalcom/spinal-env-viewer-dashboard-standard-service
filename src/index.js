import * as dashboardVariables from "./globalVariables";
import {
  SPINAL_RELATION_TYPE,
  SpinalGraphService
} from "spinal-env-viewer-graph-service";

import {
  SpinalEndpoint
} from "spinal-models-bmsNetwork";

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
    console.log("link To dashboard");
    // dashboardService.unLinkToDashBoard(dashboardId, nodeId, () => {
    let dashboardInfo = SpinalGraphService.getInfo(dashboardId);

    dashboardInfo.element.load().then(element => {
      SpinalGraphService.addChildInContext(
        dashboardId,
        nodeId,
        contextId,
        dashboardVariables.DASHBOARD_TO_ELEMENT_RELATION,
        SPINAL_RELATION_TYPE
      );

      let sensor = element.sensor.get();

      sensor.forEach(attr => {
        let endpoint = new SpinalEndpoint(
          attr.name,
          "SpinalEndpoint",
          attr.value,
          attr.unit,
          attr.dataType,
          0,
          30,
          attr.dataType
        );

        let child = SpinalGraphService.createNode({
            name: dashboardInfo.name.get(),
            type: dashboardInfo.type.get()
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
    // });
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
    console.log("unLinkMethod called");
    dashboardService.hasDashBoard(nodeId).then(el => {
      if (el) {
        console.log("has Dashboard");
        dashboardService.removeAllEndpoints(nodeId).then(() => {
          console.log("now remove dashboard connected");
          SpinalGraphService.removeChild(
            dashboardId,
            nodeId,
            dashboardVariables.DASHBOARD_TO_ELEMENT_RELATION,
            SPINAL_RELATION_TYPE
          ).then(
            () => {
              console.log("call callback");

              callback();
            },
            error => {
              console.log("error", error);
            }
          );
        });
      } else {
        console.log("has not dashboard");
        callback();
      }
    });
  },
  removeAllEndpoints(nodeId) {
    console.log("remove all endpoints called");
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

      console.log("all endpoints removed");
      return;
    });
  }
};

export {
  dashboardService,
  dashboardVariables
};