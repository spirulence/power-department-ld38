export type InventoryNotifier = (inv: Inventory, event: string)=>void;

export class Inventory{
    dollarsMillions: number;
    notifiers: InventoryNotifier[];
    private maximumDebt = 100;

    constructor(money: number){
        this.dollarsMillions = money;
        this.notifiers = [];
    }

    addNotifier(callback: InventoryNotifier){
        this.notifiers.push(callback);
    }

    enoughDollars(purchase: number){
        return (this.dollarsMillions + this.maximumDebt) >= purchase;
    }

    deductDollars(purchase: number) {
        this.dollarsMillions -= purchase;
        this.notify("purchase");
    }

    private notify(event: string) {
        for (let callback of this.notifiers) {
            callback(this, event);
        }
    }

    addDollars(addition: number) {
        this.dollarsMillions += addition;
    }

    notifyNotEnoughDollars() {
        this.notify("notEnough");
    }

    firstNotify() {
        this.notify("isSetup");
    }
}
