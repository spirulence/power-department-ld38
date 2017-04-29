

export abstract class EventedQuantity{
    protected callbacks: ((event: string, quantity: string) => void)[];

    constructor(){
        this.callbacks = [];
    }

    addCallback(callback: (event: string, quantity: string)=>void) {
        this.callbacks.push(callback);
    }

    protected onEvent(event: string){
        let representation = this.toString();
        for(let callback of this.callbacks){
            callback(event, representation);
        }
    }
}

export class EventedNumber extends EventedQuantity{
    public number: number;

    constructor(starting: number){
        super();
        this.number = starting;
    }

    toString(){
        return this.number.toString();
    }

    isEnough(deduction: number, leeway: number, fireEvent: boolean){
        let answer = (this.number + leeway) >= deduction;
        if(!answer && fireEvent){
            this.onEvent("notEnough");
        }
        return answer;
    }

    deduct(deduction: number){
        let oldNumber = this.number;
        let newNumber = this.number - deduction;
        this.number = newNumber;
        if(newNumber < 0 && oldNumber >= 0){
            this.onEvent("intoNegative");
        }
        this.onEvent("changed");
    }

    add(addition: number){
        let oldNumber = this.number;
        let newNumber = this.number + addition;
        this.number = newNumber;
        if(oldNumber < 0 && newNumber >= 0){
            this.onEvent("intoPositive");
        }
        this.onEvent("changed");
    }

    set(newNumber: number){
        let oldNumber = this.number;
        this.number = newNumber;
        if(oldNumber < 0 && newNumber >= 0){
            this.onEvent("intoPositive");
        }
        if(oldNumber >= 0 && newNumber < 0){
            this.onEvent("intoNegative");
        }
        this.onEvent("changed");

    }

}

export class EventedMillion extends EventedNumber{
    toString(){
        return this.number.toString()+"m";
    }
}