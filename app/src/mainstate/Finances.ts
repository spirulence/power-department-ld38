import {EventedMillion} from "./EventedQuantity";
import {Facility, PowerLine} from "./Facilities";

export class FinancialStatement{
    cash: EventedMillion;

    revenue: EventedMillion;
    upkeep: EventedMillion;
    fuel: EventedMillion;
    payroll: EventedMillion;
    loanInterest: EventedMillion;

    projectedCash: EventedMillion;

    constructor(){
        this.cash = new EventedMillion(0);
        this.revenue = new EventedMillion(0);
        this.upkeep = new EventedMillion(0);
        this.fuel = new EventedMillion(0);
        this.loanInterest = new EventedMillion(0);
        this.payroll = new EventedMillion(0);
        this.projectedCash = new EventedMillion(0);
    }

    project() {
        this.projectedCash.set(
            this.cash.number + this.revenue.number
            - this.upkeep.number - this.fuel.number - this.loanInterest.number - this.payroll.number);
    }
}

export class Finances{
    current: FinancialStatement;

    constructor(){
        this.maxDebt = 100;
        this.current = new FinancialStatement();
    }

    private maxDebt: number;

    addCash(cash: number){
        this.current.cash.add(cash);
        this.current.project();
    }

    canAffordFacility(facility: Facility){
        let total = facility.initialCosts.land + facility.initialCosts.materials;
        return this.current.cash.isEnough(total, this.maxDebt, true);
    }

    canAffordLine(line: PowerLine){
        return this.current.cash.isEnough(line.cost, this.maxDebt, true);
    }

    newFacility(facility: Facility){
        this.current.cash.deduct(facility.initialCosts.materials);
        this.current.cash.deduct(facility.initialCosts.land);

        this.current.upkeep.add(facility.quarterlyCosts.upkeep);
        this.current.fuel.add(facility.quarterlyCosts.fuel);
        this.current.project();
    }


    newLine(line: PowerLine) {
        this.current.cash.deduct(line.cost);
    }
}