import ORMModel from "../interfaces/ORMModel";
import ORM from "../interfaces/ORM";
import { v4 as uuid } from "uuid";
import getEmitter from "../libs/getEmitter";
import { WorkTime } from "@webresto/worktime";

const CHECK_INTERVAL = 60000;

sails.on("lifted", function () {
  setInterval(async function () {
    const maintenance = await Maintenance.getActiveMaintenance();
    if (maintenance) {
      getEmitter().emit("core-maintenance-enabled", maintenance);
    } else {
      getEmitter().emit("core-maintenance-disabled");
    }
  }, CHECK_INTERVAL);
});

let attributes = {
  /** id */
  id: {
    type: "string",
    //required: true,
  } as unknown as string,
  /** title of maintenance */
  title: "string",

  /** description of maintenance (maybe HTML) */
  description: "string",

  /** is active flag */
  enable: {
    type: "boolean",
    defaultsTo: true,
  } as unknown as boolean,
  worktime: "json" as unknown as WorkTime,
  startDate: "string",
  stopDate: "string",
};

type attributes = typeof attributes;
interface Maintenance extends attributes, ORM {}
export default Maintenance;

let Model = {
  beforeCreate: function (paymentMethod, next) {
    paymentMethod.id = uuid();
    next();
  },

  siteIsOff: async function () {
    const maintenances = await Maintenance.getActiveMaintenance();
    return maintenances ? true : false;
  },

  // TODO: add turnSiteOff method

  getActiveMaintenance: async function () {
    // TODO: here need add worktime support
    let maintenances = await Maintenance.find({ enable: true });

    maintenances = maintenances.filter((maintenance) => {
      let start: number, stop: number;
      if (maintenance.startDate) {
        start = new Date(maintenance.startDate).getTime();
      }
      if (maintenance.stopDate) {
        stop = new Date(maintenance.stopDate).getTime();
      }
      const now = new Date().getTime();
      return between(start, stop, now);
    });

    return maintenances[0];
  },
};

module.exports = {
  primaryKey: "id",
  attributes: attributes,
  ...Model,
};

declare global {
  const Maintenance: typeof Model & ORMModel<Maintenance>;
}

function between(from: number, to: number, a: number): boolean {
  return (!from && !to) || (!from && to >= a) || (!to && from < a) || (from < a && to >= a);
}
