import {System} from "./System";
import {EntityManager} from "tiny-ecs";
import {Planned} from "../components/Planned";
import {EventedMillion, EventedNumber} from "../../mvc/model/EventedQuantity";
import {PowerLoss} from "../components/PowerLoss";
import {MaterialsRequired} from "../components/MaterialsRequired";
import {LandRequired} from "../components/LandRequired";
import {WorkersRequired} from "../components/WorkersRequired";
import {Hovered} from "../components/Hovered";

export class PlanCost implements System{

    materials = new EventedMillion(0);
    land = new EventedMillion(0);
    workers = new EventedNumber(0);
    powerLoss = new EventedNumber(0);


    process(entities: EntityManager): void {
        this.materials.set(0);
        this.land.set(0);
        this.workers.set(0);
        this.powerLoss.set(0);

        let materialUsers = entities.queryComponents([Planned, MaterialsRequired])
            .concat(entities.queryComponents([Hovered, MaterialsRequired]));
        for(let user of materialUsers){
            this.materials.add(user.materialsRequired.materials);
        }

        let landUsers = entities.queryComponents([Planned, LandRequired])
            .concat(entities.queryComponents([Hovered, LandRequired]));
        for(let user of landUsers){
            this.land.add(user.landRequired.land);
        }

        let workersNeeded = entities.queryComponents([Planned, WorkersRequired])
            .concat(entities.queryComponents([Hovered, WorkersRequired]));
        for(let user of workersNeeded){
            this.workers.add(user.workersRequired.workers);
        }

        let losers = entities.queryComponents([Planned, PowerLoss])
            .concat(entities.queryComponents([Hovered, PowerLoss]));
        for(let loser of losers){
            this.powerLoss.add(loser.powerLoss.loss);
        }
    }

}