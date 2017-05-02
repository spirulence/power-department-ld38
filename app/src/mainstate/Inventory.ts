/*  Inventory.ts
 *  Copyright (C) 2017 Cameron B Seebach
 *
 *  This program is free software: you can redistribute it and/or modify
 *  it under the terms of the GNU Affero General Public License as published by
 *  the Free Software Foundation, either version 3 of the License, or
 *  (at your option) any later version.
 *
 *  This program is distributed in the hope that it will be useful,
 *  but WITHOUT ANY WARRANTY; without even the implied warranty of
 *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *  GNU Affero General Public License for more details.
 *
 *  You should have received a copy of the GNU Affero General Public License
 *  along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

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
