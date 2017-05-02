
import {BaseSystem} from "./BaseSystem";
import {TwoPoints} from "../components/TwoPoints";
import {WorkersRequired} from "../components/WorkersRequired";

export class LineWorkersRequiredSystem extends BaseSystem{

    private static readonly LENGTH_FACTOR = 0.2;
    private static readonly PLUS_MINIMUM = 1;

    getTypes(): any[] {
        return [WorkersRequired, TwoPoints];
    }

    processEach(entity: any): void {
        let length = entity.twoPoints.calcLength();
        entity.workersRequired.workers = Math.ceil(length * LineWorkersRequiredSystem.LENGTH_FACTOR)
            + LineWorkersRequiredSystem.PLUS_MINIMUM;
    }

}