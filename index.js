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

  async getDashboardByType(contextId, type) {

    // let TYPE = (SpinalGraphService.getInfo(selectedNodeId)).type.get();

    var res = [];

    let children = await SpinalGraphService.getChildren(contextId,
      dashboardVariables.RELATION_NAME);


    children.forEach(element => {
      if (element.type.get() == type) {
        res.push({
          name: element.name.get(),
          id: element.id.get()
        });
      }
    });

    return res;
  },
  async hasDashBoard(selectedNodeId) {
    let children = await SpinalGraphService.getChildren(selectedNodeId,
      dashboardVariables.ENDPOINT_RELATION_NAME);


    return children.length > 0
  },
  async linkToDashboard(nodeId, dashboardSelectedId) {


    if (await dashboardService.hasDashBoard(nodeId)) return;

    console.log("has not dashboard")
    let dashboardInfo = SpinalGraphService.getInfo(dashboardSelectedId);

    dashboardInfo.element.load().then(element => {
      let sensor = element.sensor.get();

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

        SpinalGraphService.addChild(nodeId, child,
          dashboardVariables
          .ENDPOINT_RELATION_NAME,
          SPINAL_RELATION_TYPE);
      });
    })


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