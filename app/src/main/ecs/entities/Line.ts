import {EntityManager} from "tiny-ecs";
import {TwoPoints} from "../components/TwoPoints";
import {Resistance} from "../components/Resistance";
import {GraphComponent} from "../components/GraphComponent";
import {TileRender} from "../components/TileRender";

export class Line{

    public static make(source: {x: number; y: number}, destination: {x: number; y: number}, entities: EntityManager){
        let entity = entities.createEntity()
            .addComponent(TwoPoints)
            .addComponent(TileRender)
            .addComponent(Resistance)
            .addComponent(GraphComponent);

        entity.tileRender.tile = 6;

        entity.twoPoints.from.x = source.x;
        entity.twoPoints.from.y = source.y;

        entity.twoPoints.to.x = destination.x;
        entity.twoPoints.to.y = destination.y;
        return entity;
    }
}