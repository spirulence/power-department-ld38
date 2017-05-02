
import {BaseSystem} from "./BaseSystem";
import {TwoPoints} from "../components/TwoPoints";
import {MaterialsRequired} from "../components/MaterialsRequired";

export class LineMaterialsRequiredSystem extends BaseSystem{

    private static readonly LENGTH_FACTOR = 0.4;
    private static readonly PLUS_MINIMUM = 5;

    getTypes(): any[] {
        return [MaterialsRequired, TwoPoints];
    }

    processEach(entity: any): void {
        let length = entity.twoPoints.calcLength();
        entity.materialsRequired.materials = Math.ceil(length * LineMaterialsRequiredSystem.LENGTH_FACTOR)
            + LineMaterialsRequiredSystem.PLUS_MINIMUM;
    }

}