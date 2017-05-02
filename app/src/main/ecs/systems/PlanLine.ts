import {System} from "./System";
import {EntityManager} from "tiny-ecs";
import {Planned} from "../components/Planned";
import {Line} from "../entities/Line";
import {Hovered} from "../components/Hovered";

export class PlanLine implements System{
    private entities: EntityManager;

    constructor(entities: EntityManager){
        this.entities = entities;
    }

    finish(entity: any, hovered: boolean) {
        if (hovered) {
            this.clearHover();
            entity.addTag("hovered");
            entity.addComponent(Hovered);
        } else {
            entity.addComponent(Planned);
        }
    }

    clearHover() {
        this.entities.removeEntitiesByTag("hovered");
    }

    process(_entities: EntityManager): void {

    }

    addLine(source: {x: number; y: number}, destination: {x: number; y: number}, hovered: boolean) {
        let entity = Line.make(source, destination, this.entities);
        this.finish(entity, hovered);
    }
}
