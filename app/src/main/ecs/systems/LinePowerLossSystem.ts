
import {BaseSystem} from "./BaseSystem";
import {TwoPoints} from "../components/TwoPoints";
import {Resistance} from "../components/Resistance";
import {PowerLoss} from "../components/PowerLoss";

export class LinePowerLossSystem extends BaseSystem{

    getTypes(): any[] {
        return [PowerLoss, Resistance, TwoPoints];
    }

    processEach(entity: any): void {
        let length = entity.twoPoints.calcLength();
        entity.powerLoss.loss = Math.ceil(length * entity.resistance.resistance);
    }

}