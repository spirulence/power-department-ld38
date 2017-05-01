/*  Demand.ts
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

import {Facilities, SubNetwork} from "./Facilities";
import {GameMap} from "./GameMap";

export enum Consumers{
    Residential = 3
}

export interface DemandSatisfaction{
    unconnected: number;
    unreliable: number;
    reliable: number;
}

export class Demand{
    set facilities(value: Facilities) {
        this._facilities = value;
    }
    set map(value: GameMap) {
        this._map = value;
        this.calculateTotalDemand();
    }

    private _map: GameMap;
    private _facilities: Facilities;
    totalDemand: number;

    satisfaction: DemandSatisfaction;

    constructor(){
        this.totalDemand = 0;
    }

    calculateSatisfaction(){
        let satisfaction: DemandSatisfaction = {
            unconnected: 0,
            unreliable: 0,
            reliable: 0
        };

        for(let subNetwork of this._facilities.powerNetwork.allSubnetworks()){
            let supply = Demand.calculateSupply(subNetwork);
            let losses = Demand.calculateLosses(subNetwork);
            let connectedDemand = this.calculateConnectedDemand(subNetwork);


            if(supply !== 0){
                if( (supply - losses) < connectedDemand){
                    satisfaction.unreliable += connectedDemand;
                }else {
                    satisfaction.reliable += connectedDemand;
                }
            }
        }

        satisfaction.unconnected = this.totalDemand - satisfaction.reliable - satisfaction.unreliable;

        this.satisfaction = satisfaction;
    }

    private static calculateSupply(subNetwork: SubNetwork) {
        return subNetwork.plants.length * 200;
    }

    private calculateTotalDemand() {
        this.totalDemand = 0;
        for(let row = 0; row < this._map.height; row++){
            for(let column = 0; column < this._map.width; column++) {
                let tile = this._map.getTile({x: column, y:row});
                if (tile.terrain === Consumers.Residential) {
                    this.totalDemand += 5;
                }
            }
        }
    }

    private calculateConnectedDemand(subNetwork: SubNetwork) {
        let demand = 0;
        for(let substation of subNetwork.substations){
            for(let covered of substation.coverageArea()){
                let tile = this._map.getTile(covered);
                if(tile.terrain === Consumers.Residential){
                    demand += 5;
                }
            }
        }
        return demand;
    }

    private static calculateLosses(subNetwork: SubNetwork) {
        let losses = 0;
        for(let line of subNetwork.lines){
            let lossX = Math.abs(line.from.x - line.to.x);
            let lossY = Math.abs(line.from.y - line.to.y);
            losses += Math.max(lossX, lossY);
        }
        return losses;
    }
}
