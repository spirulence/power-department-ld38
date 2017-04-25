import {Facilities, SubNetwork, VertexPoint, Facility, MapLayers} from "./Facilities";

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

    constructor(){
        this.lastHighlights = [];
        this.lastHighlightPoint = {x:-1, y:-1};
    }

    highlightHover(_ptr: Phaser.Pointer, x: number, y: number, _isClick: boolean) {
        let tile = this._map.getTileWorldXY(x, y, undefined, undefined, MapLayers.TEMP_LAYER, true);
        if(tile == null){
            this.clearHighlights();
            return
        }

        let coord = {x: tile.x, y: tile.y};

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
            this._map.putTile(Highlights.Powered, covered.x, covered.y, MapLayers.HIGHLIGHTS);
            this.lastHighlights.push(covered);
        }
    }

    private clearHighlights() {
        for(let highlight of this.lastHighlights){
            this._map.putTile(null, highlight.x, highlight.y, MapLayers.HIGHLIGHTS)
        }
        this.lastHighlights = [];
    }
}