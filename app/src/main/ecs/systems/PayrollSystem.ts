import {System} from "./System";
import {Salary} from "../components/Salary";
import {EntityManager} from "tiny-ecs";
import {EventedMillion} from "../../mvc/model/EventedQuantity";

export class PayrollSystem implements System{

    totalPayroll = new EventedMillion(0);

    process(entities: EntityManager): void {
        this.totalPayroll.set(0);
        for(let salaried of entities.queryComponents([Salary])){
            this.totalPayroll.add(salaried.salary.amount);
        }
    }

}