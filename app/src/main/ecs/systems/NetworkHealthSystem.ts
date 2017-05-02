import {System} from "./System";
import {EntityManager} from "tiny-ecs";

export class NetworkHealthSystem implements System{

    supply = 0;
    connected = 0;
    unreliable = 0;
    unconnected = 0;

    process(_entities: EntityManager): void {

    }

}