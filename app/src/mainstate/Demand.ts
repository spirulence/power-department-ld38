import {Facilities, SubNetwork} from "./Facilities";

export enum Consumers{
    Residential = 3
}

export interface Satisfaction{
    unconnected: number;
    unreliable: number;
    reliable: number;
}

export class Demand{
    set facilities(value: Facilities) {
        this._facilities = value;
    }
    set map(value: Phaser.Tilemap) {
        this._map = value;
        this.calculateTotalDemand();
    }

    private _map: Phaser.Tilemap;
    private _facilities: Facilities;
    private totalDemand: number;

    satisfaction: Satisfaction;

    constructor(){
        this.totalDemand = 0;
    }

    calculateSatisfaction(){
        let satisfaction: Satisfaction = {
            unconnected: 0,
            unreliable: 0,
            reliable: 0
        };

        for(let subNetwork of this._facilities.powerNetwork.allSubnetworks()){
            let supply = this.calculateSupply(subNetwork);
            let connectedDemand = this.calculateConnectedDemand(subNetwork);


            if(supply !== 0){
                if(supply < connectedDemand){
                    satisfaction.unreliable += connectedDemand;
                }else {
                    satisfaction.reliable += connectedDemand;
                }
            }
        }

        satisfaction.unconnected = this.totalDemand - satisfaction.reliable - satisfaction.unreliable;

        this.satisfaction = satisfaction;
    }

    private calculateSupply(subNetwork: SubNetwork) {
        return subNetwork.plants.length * 200;
    }

    private calculateTotalDemand() {
        this.totalDemand = 0;
        for(let row = 0; row < this._map.height; row++){
            for(let column = 0; column < this._map.width; column++) {
                let tile = this._map.getTile(column, row, "base", true);
                if (tile.index === Consumers.Residential) {
                    this.totalDemand += 5;
                }
            }
        }
    }

    private calculateConnectedDemand(subNetwork: SubNetwork) {
        let demand = 0;
        for(let substation of subNetwork.substations){
            for(let covered of this._facilities.coverageArea(substation)){
                let tile = this._map.getTile(covered.x, covered.y, "base", true).index;
                if(tile === Consumers.Residential){
                    demand += 5;
                }
            }
        }
        return demand;
    }
}
