import {Facilities, FacilityTypes} from "./Facilities";
import {Inventory} from "./Inventory";

interface SimplePoint{
    x: number,
    y: number
}

function bresenhamLine(x0:number, y0:number, x1:number, y1: number, setPixel: (x:number, y:number)=>void) {
    let dx = Math.abs(x1 - x0);
    let dy = Math.abs(y1 - y0);

    let sx = x0 < x1 ? 1 : -1;
    let sy = y0 < y1 ? 1 : -1;

    let err = dx - dy;

    while (true) {
        setPixel(x0, y0);

        if(x0 == x1 && y0 == y1)
            return;

        let e2 = 2 * err;
        if(e2 > -dy) {
            err -= dy;
            x0 = sx + x0;
        }
        if(e2 < dx) {
            err += dx;
            y0 = sy + y0;
        }
    }
}

export class LinePlacer{
    private source: Phaser.Tile;
    private destination: Phaser.Tile;
    private map: Phaser.Tilemap;
    private coords: SimplePoint[];

    moveCallback: (ptr: Phaser.Pointer, x: number, y: number, _isClick: boolean)=>void;

    private static readonly TEMP_LAYER = "temporary";
    private static readonly POWER_LAYER = "power";

    constructor(map: Phaser.Tilemap, source: Phaser.Tile){
        this.map = map;
        this.source = source;
        this.destination = null;
        this.coords = [];

        this.moveCallback = this.destMoved.bind(this)
    }

    private destMoved(_ptr: Phaser.Pointer, x: number, y: number, _isClick: boolean){
        let destinationTile = this.map.getTileWorldXY(x, y, undefined, undefined, "power", true);
        if(destinationTile != null){
            this.clearAndRedrawTemp(destinationTile);
        }
    }

    private clearAndRedrawTemp(destinationTile: Phaser.Tile) {
        this.clearTempLayer();
        this.destination = destinationTile;
        this.computeLineCoords();
        this.truncateLineCoords();
        this.drawTempLayer();
    }

    private clearTempLayer() {
        for(let coord of this.coords){
            this.map.putTile(null, coord.x, coord.y, LinePlacer.TEMP_LAYER)
        }
    }

    private computeLineCoords() {
        let coords = new Array<SimplePoint>();
        let setPixel = function(x:number, y: number){
            coords.push({x:x, y:y})
        };

        bresenhamLine(this.source.x, this.source.y, this.destination.x, this.destination.y, setPixel);

        coords = coords.slice(1);
        this.coords = coords;
    }

    private truncateLineCoords() {
        let newCoords = new Array<SimplePoint>();
        for(let coord of this.coords) {
            let tile = this.map.getTile(coord.x, coord.y, LinePlacer.POWER_LAYER);
            if (tile != null && this.isTruncateType(tile.index)) {
                this.coords = newCoords;
                return
            }
            newCoords.push(coord)
        }
    }

    private isTruncateType(tileIndex: number){
        switch(tileIndex){
            case FacilityTypes.Plant:
                return true;
            case FacilityTypes.Substation:
                return true;
            default:
                return false;
        }
    }

    private drawTempLayer() {
        for(let coord of this.coords) {
            this.map.putTile(7, coord.x, coord.y, LinePlacer.TEMP_LAYER);
        }
    }

    clickCallback(powerTile: Phaser.Tile, inventory: Inventory, facilities: Facilities) {
        this.clearAndRedrawTemp(powerTile);
        this.clearTempLayer();
        this.purchase(inventory, facilities);
    }

    private purchase(inventory: Inventory, facilities: Facilities) {
        let cost = this.coords.length;
        if(inventory.enoughDollars(cost) && facilities.areConnectable(this.source, this.destination)){
            inventory.deductDollars(cost);
            for(let coord of this.coords){
                this.map.putTile(FacilityTypes.PowerLine, coord.x, coord.y, LinePlacer.POWER_LAYER);
            }
            facilities.addLine(this.source, this.destination);
        }
    }
}