import {EntityManager} from "tiny-ecs";
import {MapComponent} from "../components/MapComponent";

export class Level{

    public static make(entities: EntityManager){
        let entity = entities.createEntity();
        return entity.addComponent(MapComponent);
    }
}