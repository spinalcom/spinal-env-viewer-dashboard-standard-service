import ContextGeographicService from "spinal-env-viewer-context-geographic-service";


const DASHBOARD_CONTEXT = "Dashboard Standard";
const DASHBOARD_CONTEXT_TYPE = "dashboardContext";
const RELATION_NAME = "hasDashBoard";
const ENDPOINT_RELATION_NAME = "hasDashEndpoint";
const DASHBOARD_TO_ELEMENT_RELATION = "hasConnected";

const CALCULATION_RULES = Object.freeze({
  sum: 0,
  average: 1,
  max: 2,
  min: 3,
  reference: 4
})

// Affiché par ordre (à ne pas Modifier, ou ajouter l'element à la fin)
const GEOGRAPHIC_TYPES = [{
    name: "Site",
    type: ContextGeographicService.constants.SITE_TYPE
  },
  {
    name: "Building",
    type: ContextGeographicService.constants.BUILDING_TYPE
  },
  {
    name: "Floor",
    type: ContextGeographicService.constants.FLOOR_TYPE
  },
  {
    name: "Zone",
    type: ContextGeographicService.constants.ZONE_TYPE
  },
  {
    name: "Room",
    type: ContextGeographicService.constants.ROOM_TYPE
  },
  {
    name: "Equipment",
    type: ContextGeographicService.constants.EQUIPMENT_TYPE
  }

]




export {
  DASHBOARD_CONTEXT,
  DASHBOARD_CONTEXT_TYPE,
  RELATION_NAME,
  GEOGRAPHIC_TYPES,
  ENDPOINT_RELATION_NAME,
  DASHBOARD_TO_ELEMENT_RELATION,
  CALCULATION_RULES
}