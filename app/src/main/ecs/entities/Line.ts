import {EntityManager} from "tiny-ecs";
import {TwoPoints} from "../components/TwoPoints";
import {Resistance} from "../components/Resistance";
import {GraphComponent} from "../components/GraphComponent";

export class Line{

    public static make(entities: EntityManager){
        return entities.createEntity().addComponent(TwoPoints).addComponent(Resistance).addComponent(GraphComponent);
    }
}