import {Facilities, PowerLine, VertexPoint, MapLayers} from "./Facilities";


export class LinePlacer{
    private source: Phaser.Tile;
    private destination: Phaser.Tile;
    private map: Phaser.Tilemap;
    private line: PowerLine;
    private mapGroup: Phaser.Group;

    moveCallback: (ptr: Phaser.Pointer, x: number, y: number, _isClick: boolean)=>void;

    constructor(map: Phaser.Tilemap, mapGroup: Phaser.Group, source: Phaser.Tile){
        this.map = map;
        this.mapGroup = mapGroup;
        this.source = source;
        this.destination = null;
        this.line = null;

        this.moveCallback = this.destMoved.bind(this)
    }

    private destMoved(pointer: Phaser.Pointer, _x: number, _y: number, _isClick: boolean){
        let coords = this.mapGroup.toLocal(pointer.position, this.mapGroup.parent);

        let destinationTile = this.map.getTileWorldXY(coords.x, coords.y, undefined, undefined, MapLayers.BASE, true);
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