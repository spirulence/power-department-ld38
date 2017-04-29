import {EventedNumber} from "./EventedQuantity";

export class Inventory{
    workers: EventedNumber;
    assigned: EventedNumber;
    available: EventedNumber;
    next: EventedNumber;
    nextNext: EventedNumber;

    constructor(workers: number){
        this.workers = new EventedNumber(workers);
        this.assigned = new EventedNumber(0);
        this.available = new EventedNumber(workers);
        this.next = new EventedNumber(workers);
        this.nextNext = new EventedNumber(workers);
    }
}
