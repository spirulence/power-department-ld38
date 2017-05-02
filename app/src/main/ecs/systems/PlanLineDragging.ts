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

        let dragging = entities.queryComponents([Dragging]).slice();

        for(let dragged of dragging){
            let current = dragged.dragging.current.clone();
            let x = Math.floor(current.x / 8);
            let y = Math.floor(current.y / 8);
            let source = {x:Math.floor(dragged.dragging.start.x / 8), y:Math.floor(dragged.dragging.start.y / 8)};
            let destination = {x:x, y:y};
            if(dragged.dragging.ended){
                entities.removeEntity(dragged);
                this.planLine.addLine(source, destination, false);
            }else{
                this.planLine.addLine(source, destination, true);
            }
        }
    }



}