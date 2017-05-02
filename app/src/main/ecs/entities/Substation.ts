import {EntityManager} from "tiny-ecs";
import {DistributionPoint} from "../components/DistributionPoint";
import {GraphComponent} from "../components/GraphComponent";
import {TilePosition} from "../components/TilePosition";
import {TileRender} from "../components/TileRender";
import {MaterialsRequired} from "../components/MaterialsRequired";
import {MinimumSeparation} from "../components/MinimumSeparation";
export class Substation{

    public static make(entities: EntityManager, x: number, y: number){
        let entity = entities.createEntity()
            .addComponent(DistributionPoint)
            .addComponent(GraphComponent)
            .addComponent(TilePosition)
            .addComponent(TileRender)
            .addComponent(MaterialsRequired)
            .addComponent(MinimumSeparation);

        entity.materialsRequired.materials = 5;

        entity.tileRender.tile = 5;
        entity.tilePosition.x = x;
        entity.tilePosition.y = y;
        return entity;
    }
}