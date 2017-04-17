import {Facilities, SubNetwork, SUBSTATION_LEVELS} from "./Facilities";

export enum Highlights{
    Powered = 8,
    Hovered = 9
}

interface SimplePoint {
    x: number,
    y: number
}

export class NetworkHighlighter{
    set map(value: Phaser.Tilemap) {
        this._map = value;
    }
    set facilities(value: Facilities) {
        this._facilities = value;
    }
    private _facilities: Facilities;
    private _map: Phaser.Tilemap;

    private lastHighlights: SimplePoint[];
    private lastHighlightPoint: SimplePoint;

    private static readonly TEMP_LAYER = "temporary";

    constructor(){
        this.lastHighlights = [];
        this.lastHighlightPoint = {x:-1, y:-1};
    }

    highlightHover(_ptr: Phaser.Pointer, x: number, y: number, _isClick: boolean) {
        let tile = this._map.getTileWorldXY(x, y, undefined, undefined, NetworkHighlighter.TEMP_LAYER, true);
        let coord = {x: tile.x, y: tile.y};

        if(coord.x === this.lastHighlightPoint.x && coord.y === this.lastHighlightPoint.y){
            return
        }

        this.clearHighlights();

        let at = this._facilities.powerNetwork.at(coord);
        if (at !== "") {
            let subNetwork = this._facilities.powerNetwork.subnetworkAt(coord);
            this.highlightSubNetwork(subNetwork);
        }
    }

    private highlightSubNetwork(subNetwork: SubNetwork) {
        if(subNetwork.plants.length > 0)
            for (let substation of subNetwork.substations)
                this.highlightDistribution(substation);
    }

    private highlightDistribution(substation: SimplePoint) {
        let coverage = SUBSTATION_LEVELS[0];
        for (let offset of coverage) {
            let covered: SimplePoint = {x: offset.x + substation.x, y: offset.y + substation.y};
            this._map.putTile(Highlights.Powered, covered.x, covered.y, NetworkHighlighter.TEMP_LAYER);
            this.lastHighlights.push(covered);
        }
    }

    private clearHighlights() {
        for(let highlight of this.lastHighlights){
            this._map.putTile(null, highlight.x, highlight.y, NetworkHighlighter.TEMP_LAYER)
        }
        this.lastHighlights = [];
    }
}