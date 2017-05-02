import {System} from "./System";
import {EntityManager} from "tiny-ecs";
import {Built} from "../components/Built";
import {TilePosition} from "../components/TilePosition";
import {Planned} from "../components/Planned";
import {MinimumSeparation} from "../components/MinimumSeparation";
import {buildChecker} from "../../../utils/MapChecker";

export class PlanFacilityValidator implements System{
    process(entities: EntityManager): void {

        let existingChecker = buildChecker(entities.queryComponents([Built, TilePosition]));

        let forRemoval: any[] = [];
        for(let facility of entities.queryComponents([Planned, TilePosition, MinimumSeparation])){
            let range = facility.minimumSeparation.cells + 1;
            let existing = existingChecker(range, facility.tilePosition);
            if(existing){
                forRemoval.push(facility);
            }
        }

        for(let toRemove of forRemoval){
            entities.removeEntity(toRemove);
        }
    }



}