import {Facilities, PowerLine, VertexPoint} from "./Facilities";
import {GameMap, MapTile} from "./GameMap";


export class LinePlacer{
    private source: MapTile;
    private destination: MapTile;
    private map: GameMap;
    private line: PowerLine;
    private facilities: Facilities;

    constructor(map: GameMap, facilities: Facilities, source: MapTile){
        this.map = map;
        this.facilities = facilities;
        this.source = source;
        this.destination = null;
        this.line = null;

        this.map.addCallback({
            mapHovered: this.destMoved.bind(this),
            mapClicked: this.clickCallback.bind(this)
        })
    }

    private destMoved(tile: MapTile){
        this.clearAndRedrawTemp(tile);
    }

    private clearAndRedrawTemp(destination: MapTile) {
        this.clearTemporaryLayer();

        this.line = new PowerLine(
            new VertexPoint(this.source.location.x, this.source.location.y, -1),
            new VertexPoint(destination.location.x, destination.location.y, -1),
            this.map);

        this.line.drawTemporary()
    }

    private clearTemporaryLayer() {
        if(this.line != null){
            this.line.clearTemporary();
        }
    }

    clickCallback(tile: MapTile) {
        this.clearAndRedrawTemp(tile);
        this.clearTemporaryLayer();
        if(this.line.isValid()) {
            this.facilities.purchaseLine(this.line);
        }
    }
}