import {System} from "./System";
import {EntityManager} from "tiny-ecs";
import {Resistance} from "../components/Resistance";
import {Speculative} from "../components/Speculative";
import {TwoPoints} from "../components/TwoPoints";
import {EventedMillion, EventedNumber} from "../../mvc/model/EventedQuantity";

export class SpeculativeCostSystem implements System{

    materials = new EventedMillion(0);
    land = new EventedMillion(0);
    workers = new EventedNumber(0);
    resistance = new EventedNumber(0);


    process(entities: EntityManager): void {
        this.materials.set(0);
        this.land.set(0);
        this.workers.set(0);
        this.resistance.set(0);

        let resistors = entities.queryComponents([Speculative, Resistance, TwoPoints]);
        for(let resistor of resistors){
            const lineLength = SpeculativeCostSystem.calcLength(resistor.twoPoints);
            this.resistance.add(Math.ceil(resistor.resistance.resistance * lineLength * .5));
            this.land.add(Math.ceil(lineLength/10)+1);
            this.workers.add(Math.ceil(lineLength/4)+1);
            this.materials.add(lineLength);
        }

    }

    private static calcLength(twoPoints: TwoPoints) {
        let absX = Math.abs(twoPoints.from.x - twoPoints.to.x);
        let absY = Math.abs(twoPoints.from.y - twoPoints.to.y);
        return Math.max(absX, absY) + 1;
    }

}