
import {EntityManager} from "tiny-ecs";
import {Salary} from "../components/Salary";
import {Manpower} from "../components/Manpower";

export class Employee{

    public static make(entities: EntityManager){
        let entity = entities.createEntity()
            .addComponent(Salary)
            .addComponent(Manpower);

        entity.salary.amount = 1;
        entity.manpower.amount = 1;

        return entity;
    }
}
