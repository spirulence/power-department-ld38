import {System} from "./System";
import {EntityManager} from "tiny-ecs";
import {Substation} from "../entities/Substation";
import {Planned} from "../components/Planned";
import {Generator} from "../entities/Generator";
import {Hovered} from "../components/Hovered";
import {NeedsValidation} from "../components/NeedsValidation";

export class PlanFacility implements System{
    private entities: EntityManager;

    constructor(entities: EntityManager){
        this.entities = entities;
    }

    addSubstation(x: number, y: number, hovered: boolean){
        let entity = Substation.make(this.entities, x, y);
        this.finish(entity, hovered);
    }

    finish(entity: any, hovered: boolean) {
        if (hovered) {
            this.clearHover();
            entity.addTag("hovered");
            entity.addComponent(Hovered);
        } else {
            entity.addComponent(Planned);
            entity.addComponent(NeedsValidation);
        }
    }

    clearHover() {
        this.entities.removeEntitiesByTag("hovered");
    }

    process(_entities: EntityManager): void {
    }

    addGenerator(x: number, y: number, hovered: boolean) {
        let entity = Generator.make(this.entities, x, y);
        this.finish(entity, hovered);
    }
}