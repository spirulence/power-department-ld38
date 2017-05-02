import {EntityManager} from "tiny-ecs";

export interface System{

    process(entities: EntityManager): void;
}