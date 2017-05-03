import {System} from "./System";
import {EntityManager} from "tiny-ecs";
import {TilePosition} from "../components/TilePosition";
import {MinimumSeparation} from "../components/MinimumSeparation";
import {buildChecker} from "../../../utils/MapChecker";
import {Validated} from "../components/Validated";
import {NeedsValidation} from "../components/NeedsValidation";

export class PlanFacilityValidator implements System{
    process(entities: EntityManager): void {

        let existingChecker = buildChecker(entities.queryComponents([TilePosition, Validated]));

        let forRemoval: any[] = [];
        for(let facility of entities.queryComponents([TilePosition, MinimumSeparation, NeedsValidation])){
            let range = facility.minimumSeparation.cells;
            let blockExists = existingChecker(range, facility.tilePosition);
            if(blockExists){
                forRemoval.push(facility);
            }else{
                facility.removeComponent(NeedsValidation);
                facility.addComponent(Validated);
            }
        }

        for(let toRemove of forRemoval){
            entities.removeEntity(toRemove);
        }
    }
}