import {System} from "./System";
import {EntityManager} from "tiny-ecs";
import {Cash} from "../components/Cash";
import {EventedMillion} from "../../mvc/model/EventedQuantity";
import {Cost} from "../components/Cost";

export class CashSystem implements System{

    totalCash = new EventedMillion(0);

    process(entities: EntityManager): void {
        this.totalCash.set(0);

        for(let cash of entities.queryComponents([Cash])){
            this.totalCash.add(cash.cash.amount);
            entities.removeEntity(cash);
        }

        for(let cost of entities.queryComponents([Cost])){
            this.totalCash.deduct(cost.cost.amount);
            entities.removeEntity(cost);
        }

        entities.createEntity().addComponent(Cash).cash.amount = this.totalCash.number;
    }

}