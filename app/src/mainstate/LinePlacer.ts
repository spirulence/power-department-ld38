import {Facilities, PowerLine, VertexPoint, MapLayers} from "./Facilities";


export class LinePlacer{
    private source: Phaser.Tile;
    private destination: Phaser.Tile;
    private map: Phaser.Tilemap;
    private line: PowerLine;

    moveCallback: (ptr: Phaser.Pointer, x: number, y: number, _isClick: boolean)=>void;

    constructor(map: Phaser.Tilemap, source: Phaser.Tile){
        this.map = map;
        this.source = source;
        this.destination = null;
        this.line = null;

        this.moveCallback = this.destMoved.bind(this)
    }

    private destMoved(_ptr: Phaser.Pointer, x: number, y: number, _isClick: boolean){
        let destinationTile = this.map.getTileWorldXY(x, y, undefined, undefined, MapLayers.BASE, true);
        if(destinationTile != null){
            this.clearAndRedrawTemp(destinationTile);
        }
    }

    private clearAndRedrawTemp(destination: Phaser.Tile) {
        this.clearTemporaryLayer();

        this.line = new PowerLine(
            new VertexPoint(this.source.x, this.source.y, -1),
            new VertexPoint(destination.x, destination.y, -1),
            this.map);

        this.line.drawTemporary()
    }

    private clearTemporaryLayer() {
        if(this.line != null){
            this.line.clearTemporary();
        }
    }

    clickCallback(powerTile: Phaser.Tile, facilities: Facilities) {
        this.clearAndRedrawTemp(powerTile);
        this.clearTemporaryLayer();
        if(this.line.isValid()) {
            facilities.purchaseLine(this.line);
        }
    }
}