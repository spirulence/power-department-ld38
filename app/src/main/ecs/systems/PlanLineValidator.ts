import {System} from "./System";
import {EntityManager} from "tiny-ecs";
import {TwoPoints} from "../components/TwoPoints";
import {Planned} from "../components/Planned";
import {GraphComponent} from "../components/GraphComponent";
import {TilePosition} from "../components/TilePosition";
import {buildChecker} from "../../../utils/MapChecker";

export class PlanLineValidator implements System{

    process(entities: EntityManager): void {
        let checker = buildChecker(entities.queryComponents([GraphComponent, TilePosition]));

        const lines = entities.queryComponents([Planned, TwoPoints]);

        let forRemoval: any[] = [];
        for(let line of lines){
            if(!checker(0, line.twoPoints.from) || !checker(0, line.twoPoints.to)){
                forRemoval.push(line);
                continue;
            }
            for(let line2 of lines){
                if(line !== line2){
                    if(line.twoPoints.equals(line2.twoPoints)){
                        forRemoval.push(line);
                    }
                }
            }
        }

        for(let toRemove of forRemoval){
            entities.removeEntity(toRemove);
        }
    }

}
