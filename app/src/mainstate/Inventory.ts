export type InventoryNotifier = (inv: Inventory)=>void;

export class Inventory{
    dollarsMillions: number;
    notifiers: InventoryNotifier[];

    constructor(money: number){
        this.dollarsMillions = money;
        this.notifiers = [];
    }

    addNotifier(callback: InventoryNotifier){
        this.notifiers.push(callback);
    }

    enoughDollars(purchase: number){
        return this.dollarsMillions >= purchase;
    }

    deductDollars(purchase: number) {
        this.dollarsMillions -= purchase;
        this.notify();
    }

    notify() {
        for (let callback of this.notifiers) {
            callback(this);
        }
    }
}
