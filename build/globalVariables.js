"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.CALCULATION_RULES = exports.DASHBOARD_TO_ELEMENT_RELATION = exports.ENDPOINT_RELATION_NAME = exports.GEOGRAPHIC_TYPES = exports.RELATION_NAME = exports.DASHBOARD_CONTEXT_TYPE = exports.DASHBOARD_CONTEXT = undefined;

var _spinalEnvViewerContextGeographicService = require("spinal-env-viewer-context-geographic-service");

var _spinalEnvViewerContextGeographicService2 = _interopRequireDefault(_spinalEnvViewerContextGeographicService);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

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
});

// Affiché par ordre (à ne pas Modifier, ou ajouter l'element à la fin)
const GEOGRAPHIC_TYPES = [{
  name: "Site",
  type: _spinalEnvViewerContextGeographicService2.default.constants.SITE_TYPE
}, {
  name: "Building",
  type: _spinalEnvViewerContextGeographicService2.default.constants.BUILDING_TYPE
}, {
  name: "Floor",
  type: _spinalEnvViewerContextGeographicService2.default.constants.FLOOR_TYPE
}, {
  name: "Zone",
  type: _spinalEnvViewerContextGeographicService2.default.constants.ZONE_TYPE
}, {
  name: "Room",
  type: _spinalEnvViewerContextGeographicService2.default.constants.ROOM_TYPE
}, {
  name: "Equipment",
  type: _spinalEnvViewerContextGeographicService2.default.constants.EQUIPMENT_TYPE
}];

exports.DASHBOARD_CONTEXT = DASHBOARD_CONTEXT;
exports.DASHBOARD_CONTEXT_TYPE = DASHBOARD_CONTEXT_TYPE;
exports.RELATION_NAME = RELATION_NAME;
exports.GEOGRAPHIC_TYPES = GEOGRAPHIC_TYPES;
exports.ENDPOINT_RELATION_NAME = ENDPOINT_RELATION_NAME;
exports.DASHBOARD_TO_ELEMENT_RELATION = DASHBOARD_TO_ELEMENT_RELATION;
exports.CALCULATION_RULES = CALCULATION_RULES;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9nbG9iYWxWYXJpYWJsZXMuanMiXSwibmFtZXMiOlsiREFTSEJPQVJEX0NPTlRFWFQiLCJEQVNIQk9BUkRfQ09OVEVYVF9UWVBFIiwiUkVMQVRJT05fTkFNRSIsIkVORFBPSU5UX1JFTEFUSU9OX05BTUUiLCJEQVNIQk9BUkRfVE9fRUxFTUVOVF9SRUxBVElPTiIsIkNBTENVTEFUSU9OX1JVTEVTIiwiT2JqZWN0IiwiZnJlZXplIiwic3VtIiwiYXZlcmFnZSIsIm1heCIsIm1pbiIsInJlZmVyZW5jZSIsIkdFT0dSQVBISUNfVFlQRVMiLCJuYW1lIiwidHlwZSIsIkNvbnRleHRHZW9ncmFwaGljU2VydmljZSIsImNvbnN0YW50cyIsIlNJVEVfVFlQRSIsIkJVSUxESU5HX1RZUEUiLCJGTE9PUl9UWVBFIiwiWk9ORV9UWVBFIiwiUk9PTV9UWVBFIiwiRVFVSVBNRU5UX1RZUEUiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7QUFBQTs7Ozs7O0FBR0EsTUFBTUEsb0JBQW9CLG9CQUExQjtBQUNBLE1BQU1DLHlCQUF5QixrQkFBL0I7QUFDQSxNQUFNQyxnQkFBZ0IsY0FBdEI7QUFDQSxNQUFNQyx5QkFBeUIsaUJBQS9CO0FBQ0EsTUFBTUMsZ0NBQWdDLGNBQXRDOztBQUVBLE1BQU1DLG9CQUFvQkMsT0FBT0MsTUFBUCxDQUFjO0FBQ3RDQyxPQUFLLENBRGlDO0FBRXRDQyxXQUFTLENBRjZCO0FBR3RDQyxPQUFLLENBSGlDO0FBSXRDQyxPQUFLLENBSmlDO0FBS3RDQyxhQUFXO0FBTDJCLENBQWQsQ0FBMUI7O0FBUUE7QUFDQSxNQUFNQyxtQkFBbUIsQ0FBQztBQUN0QkMsUUFBTSxNQURnQjtBQUV0QkMsUUFBTUMsa0RBQXlCQyxTQUF6QixDQUFtQ0M7QUFGbkIsQ0FBRCxFQUl2QjtBQUNFSixRQUFNLFVBRFI7QUFFRUMsUUFBTUMsa0RBQXlCQyxTQUF6QixDQUFtQ0U7QUFGM0MsQ0FKdUIsRUFRdkI7QUFDRUwsUUFBTSxPQURSO0FBRUVDLFFBQU1DLGtEQUF5QkMsU0FBekIsQ0FBbUNHO0FBRjNDLENBUnVCLEVBWXZCO0FBQ0VOLFFBQU0sTUFEUjtBQUVFQyxRQUFNQyxrREFBeUJDLFNBQXpCLENBQW1DSTtBQUYzQyxDQVp1QixFQWdCdkI7QUFDRVAsUUFBTSxNQURSO0FBRUVDLFFBQU1DLGtEQUF5QkMsU0FBekIsQ0FBbUNLO0FBRjNDLENBaEJ1QixFQW9CdkI7QUFDRVIsUUFBTSxXQURSO0FBRUVDLFFBQU1DLGtEQUF5QkMsU0FBekIsQ0FBbUNNO0FBRjNDLENBcEJ1QixDQUF6Qjs7UUErQkV2QixpQixHQUFBQSxpQjtRQUNBQyxzQixHQUFBQSxzQjtRQUNBQyxhLEdBQUFBLGE7UUFDQVcsZ0IsR0FBQUEsZ0I7UUFDQVYsc0IsR0FBQUEsc0I7UUFDQUMsNkIsR0FBQUEsNkI7UUFDQUMsaUIsR0FBQUEsaUIiLCJmaWxlIjoiZ2xvYmFsVmFyaWFibGVzLmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IENvbnRleHRHZW9ncmFwaGljU2VydmljZSBmcm9tIFwic3BpbmFsLWVudi12aWV3ZXItY29udGV4dC1nZW9ncmFwaGljLXNlcnZpY2VcIjtcblxuXG5jb25zdCBEQVNIQk9BUkRfQ09OVEVYVCA9IFwiRGFzaGJvYXJkIFN0YW5kYXJkXCI7XG5jb25zdCBEQVNIQk9BUkRfQ09OVEVYVF9UWVBFID0gXCJkYXNoYm9hcmRDb250ZXh0XCI7XG5jb25zdCBSRUxBVElPTl9OQU1FID0gXCJoYXNEYXNoQm9hcmRcIjtcbmNvbnN0IEVORFBPSU5UX1JFTEFUSU9OX05BTUUgPSBcImhhc0Rhc2hFbmRwb2ludFwiO1xuY29uc3QgREFTSEJPQVJEX1RPX0VMRU1FTlRfUkVMQVRJT04gPSBcImhhc0Nvbm5lY3RlZFwiO1xuXG5jb25zdCBDQUxDVUxBVElPTl9SVUxFUyA9IE9iamVjdC5mcmVlemUoe1xuICBzdW06IDAsXG4gIGF2ZXJhZ2U6IDEsXG4gIG1heDogMixcbiAgbWluOiAzLFxuICByZWZlcmVuY2U6IDRcbn0pXG5cbi8vIEFmZmljaMOpIHBhciBvcmRyZSAow6AgbmUgcGFzIE1vZGlmaWVyLCBvdSBham91dGVyIGwnZWxlbWVudCDDoCBsYSBmaW4pXG5jb25zdCBHRU9HUkFQSElDX1RZUEVTID0gW3tcbiAgICBuYW1lOiBcIlNpdGVcIixcbiAgICB0eXBlOiBDb250ZXh0R2VvZ3JhcGhpY1NlcnZpY2UuY29uc3RhbnRzLlNJVEVfVFlQRVxuICB9LFxuICB7XG4gICAgbmFtZTogXCJCdWlsZGluZ1wiLFxuICAgIHR5cGU6IENvbnRleHRHZW9ncmFwaGljU2VydmljZS5jb25zdGFudHMuQlVJTERJTkdfVFlQRVxuICB9LFxuICB7XG4gICAgbmFtZTogXCJGbG9vclwiLFxuICAgIHR5cGU6IENvbnRleHRHZW9ncmFwaGljU2VydmljZS5jb25zdGFudHMuRkxPT1JfVFlQRVxuICB9LFxuICB7XG4gICAgbmFtZTogXCJab25lXCIsXG4gICAgdHlwZTogQ29udGV4dEdlb2dyYXBoaWNTZXJ2aWNlLmNvbnN0YW50cy5aT05FX1RZUEVcbiAgfSxcbiAge1xuICAgIG5hbWU6IFwiUm9vbVwiLFxuICAgIHR5cGU6IENvbnRleHRHZW9ncmFwaGljU2VydmljZS5jb25zdGFudHMuUk9PTV9UWVBFXG4gIH0sXG4gIHtcbiAgICBuYW1lOiBcIkVxdWlwbWVudFwiLFxuICAgIHR5cGU6IENvbnRleHRHZW9ncmFwaGljU2VydmljZS5jb25zdGFudHMuRVFVSVBNRU5UX1RZUEVcbiAgfVxuXG5dXG5cblxuXG5cbmV4cG9ydCB7XG4gIERBU0hCT0FSRF9DT05URVhULFxuICBEQVNIQk9BUkRfQ09OVEVYVF9UWVBFLFxuICBSRUxBVElPTl9OQU1FLFxuICBHRU9HUkFQSElDX1RZUEVTLFxuICBFTkRQT0lOVF9SRUxBVElPTl9OQU1FLFxuICBEQVNIQk9BUkRfVE9fRUxFTUVOVF9SRUxBVElPTixcbiAgQ0FMQ1VMQVRJT05fUlVMRVNcbn0iXX0=