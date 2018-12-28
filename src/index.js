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
    }, abstract);

    SpinalGraphService.addChildInContext(
      contextId,
      abstractNode,
      contextId,
      dashboardVariables.RELATION_NAME,
      SPINAL_RELATION_TYPE
    );
  },

  async getDashboardByType(contextId, dashboardType) {

    let children = await SpinalGraphService.getChildren(contextId,
      dashboardVariables.RELATION_NAME);


    let res = [];

    for (let i = 0; i < children.length; i++) {
      const child = children[i];
      if (child.type.get() === dashboardType) {
        res.push(child);
      }

    }

    return res;

  },
  async hasDashBoard(nodeId) {
    let children = await SpinalGraphService.getChildren(nodeId,
      dashboardVariables.ENDPOINT_RELATION_NAME);


    return children.length > 0
  },
  async linkToDashboard(nodeId, dashboardId) {


    if (await dashboardService.hasDashBoard(nodeId)) return;


    let dashboardInfo = SpinalGraphService.getInfo(dashboardId);

    let element = await dashboardInfo.element.load();


    /** Ajouter id du node dans le dasboard */
    // if (!element.connected) {
    //   element.add_attr({
    //     connected: []
    //   })
    // }
    // element.connected.push(nodeId);
    /**       Fin             */


    SpinalGraphService.addChild(dashboardId, nodeId, dashboardVariables.DASHBOARD_TO_ELEMENT_RELATION,
      SPINAL_RELATION_TYPE);


    /** Attribuer id dashboard à l'element nodeId */
    // SpinalGraphService.getInfo(nodeId).element.load().then(el => {
    //   if (!el.dashboardId) {
    //     el.add_attr({
    //       dashboardId: dashboardId
    //     })
    //   } else {
    //     el.dashboardId.set(dashboardId);
    //   }
    // })
    /** Fin */

    let sensor = element.sensor.get();


    // Pour chaque element du sensor ajouter un endpoint à la relation hasEndpoint

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
      )

      let child = SpinalGraphService.createNode({
        name: dashboardInfo.name.get(),
        type: dashboardInfo.type.get()
      }, endpoint);

      SpinalGraphService.addChild(nodeId, child,
        dashboardVariables
        .ENDPOINT_RELATION_NAME,
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