/*  NetworkHighlighter.ts
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

import {Facilities, SubNetwork, VertexPoint, Facility, FacilityTypes} from "./Facilities";
import {GameMap, MapTile} from "./GameMap";

export enum Highlights{
    Powered = 8,
    Hovered = 9
}

interface SimplePoint {
    x: number,
    y: number
}

export class NetworkHighlighter{
    set mapGroup(value: Phaser.Group) {
        this._mapGroup = value;
    }
    set map(value: GameMap) {
        this._map = value;
        this._map.addCallback({
            mapHovered: this.highlightHover.bind(this),
            mapClicked: function(){}
        })
    }
    set facilities(value: Facilities) {
        this._facilities = value;
    }
    private _facilities: Facilities;
    private _map: GameMap;
    private _mapGroup: Phaser.Group;

    private lastHighlights: SimplePoint[];
    private lastHighlightPoint: SimplePoint;

    constructor(){
        this.lastHighlights = [];
        this.lastHighlightPoint = {x:-1, y:-1};
    }

    highlightHover(tile: MapTile) {
        if(tile.facility == FacilityTypes.Nothing){
            this.clearHighlights();
            return
        }

        let coord = {x: tile.location.x, y: tile.location.y};

        if(coord.x === this.lastHighlightPoint.x && coord.y === this.lastHighlightPoint.y){
            return
        }

        this.clearHighlights();

        let vertexPoint = new VertexPoint(coord.x, coord.y, -1);
        if (this._facilities.isFacilityAt(vertexPoint)) {
            let subNetwork = this._facilities.powerNetwork.subnetworkAt(vertexPoint);
            this.highlightSubNetwork(subNetwork);
        }
    }

    private highlightSubNetwork(subNetwork: SubNetwork) {
        if(subNetwork.plants.length > 0)
            for (let substation of subNetwork.substations)
                this.highlightDistribution(substation);
    }

    private highlightDistribution(substation: Facility) {
        for (let covered of substation.coverageArea()) {
            this._map.layers.highlights.setTile(covered, Highlights.Powered);
            this.lastHighlights.push(covered);
        }
    }

    private clearHighlights() {
        for(let highlight of this.lastHighlights){
            this._map.layers.highlights.clearTile(highlight);
        }
        this.lastHighlights = [];
    }
}
