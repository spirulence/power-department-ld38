
import {BaseSystem} from "./BaseSystem";
import {TwoPoints} from "../components/TwoPoints";
import {LandRequired} from "../components/LandRequired";

export class LineLandRequiredSystem extends BaseSystem{

    private static readonly LENGTH_FACTOR = 0.07;
    private static readonly PLUS_MINIMUM = 1;

    getTypes(): any[] {
        return [LandRequired, TwoPoints];
    }

    processEach(entity: any): void {
        let length = entity.twoPoints.calcLength();
        entity.landRequired.land = Math.ceil(length * LineLandRequiredSystem.LENGTH_FACTOR)
            + LineLandRequiredSystem.PLUS_MINIMUM;
    }

}