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


    return SpinalGraphService.addContext(contextName, dashboardVariables.DASHBOARD_CONTEXT_TYPE,
      new AbstractElement(contextName));

  },
  createStandardDashBoard(parentId, name, type, attributes) {
    let abstract = new AbstractElement(name);

    abstract.add_attr({
      sensor: []
    });

    attributes.forEach(attr => {
      delete attr.checked;
      abstract.sensor.push(attr);
    });

    let abstractNode = SpinalGraphService.createNode({
      name: name,
      type: type
    }, abstract);

    SpinalGraphService.addChildInContext(
      parentId,
      abstractNode,
      parentId,
      dashboardVariables.RELATION_NAME,
      SPINAL_RELATION_TYPE
    );
  },

  async getDashboardByType(contextId, selectedNodeId) {

    let TYPE = (SpinalGraphService.getInfo(selectedNodeId)).type.get();

    var res = [];

    let children = await SpinalGraphService.getChildren(contextId,
      dashboardVariables.RELATION_NAME);


    children.forEach(element => {
      if (element.type.get() == TYPE) {
        res.push({
          name: element.name.get(),
          id: element.id.get()
        });
      }
    });

    return res;
  },
  hasDashBoard(selectedNodeId) {
    return (SpinalGraphService.getChildren(selectedNodeId, dashboardVariables
      .RELATION_NAME).length == 0);
  },
  createRelation(nodeId, dashboardSelectedId) {

    if (dashboardService.hasDashBoard(nodeId)) return;

    var dashboardInfo = SpinalGraphService.getInfo(dashboardSelectedId).info;

    var sensor = dashboardInfo.element.sensor.get();

    sensor.forEach(attr => {
      let child = SpinalGraphService.createNode({
          name: dashboardInfo.name.get(),
          type: dashboardInfo.type.get()
        },
        new SpinalEndpoint(
          attr.name,
          "SpinalEndpoint",
          attr.value,
          attr.unit,
          attr.dataType
        )
      );

      SpinalEndpoint.addChild(nodeId, child, dashboardVariables.ENDPOINT_RELATION_NAME,
        SPINAL_RELATION_TYPE);
    });
  },
  async getAllDashboardContext() {
    let res = [];
    let graph = SpinalGraphService.getGraph();

    let contexts = await graph.getChildren(["hasContext"]);

    contexts.forEach(context => {
      if (context.info.type.get() == dashboardVariables.DASHBOARD_CONTEXT_TYPE) {
        res.push(context.info);
      }
    })

    return res;

  }
}

export {
  dashboardService,
  dashboardVariables
};