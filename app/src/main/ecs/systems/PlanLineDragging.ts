import {System} from "./System";
import {EntityManager} from "tiny-ecs";
import {Dragging} from "../components/Dragging";
import {PlanLine} from "./PlanLine";

export class PlanLineDragging implements System{
    private planLine: PlanLine;

    constructor(planLine: PlanLine){
        this.planLine = planLine;
    }

    process(entities: EntityManager): void {
        // let targets = entities.queryComponents([Planned, TilePosition]).concat(entities.queryComponents([Built, TilePosition]));

        let dragging = entities.queryComponents([Dragging]).slice();

        for(let dragged of dragging){
            if(dragged.dragging.ended){
                entities.removeEntity(dragged);
                continue;
            }

            let current = dragged.dragging.current.clone();
            let x = Math.floor(current.x / 8);
            let y = Math.floor(current.y / 8);
            let source = {x:Math.floor(dragged.dragging.start.x / 8), y:Math.floor(dragged.dragging.start.y / 8)};
            let destination = {x:x, y:y};
            this.planLine.addLine(source, destination, true);
            // for(let target of targets){
            //     if(target.tilePosition.x == x && target.tilePosition.y == y){
            //         matched.push(dragged);
            //         let source = {x:Math.floor(dragged.dragging.start.x / 8), y:Math.floor(dragged.dragging.start.y / 8)};
            //         this.planLine.addLine(source, target.tilePosition, true);
            //     }
            // }
        }
    }



}