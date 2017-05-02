/*  LinePlacer.ts
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

import {Facilities, PowerLine, VertexPoint} from "./Facilities";
import {GameMap, MapTile} from "./GameMap";


export class LinePlacer{
    private source: MapTile;
    private destination: MapTile;
    private map: GameMap;
    private line: PowerLine;
    private facilities: Facilities;
    onFinish: () => void;
    private callback: {mapHovered: any; mapClicked: any};

    constructor(map: GameMap, facilities: Facilities, source: MapTile){
        this.map = map;
        this.facilities = facilities;
        this.source = source;
        this.destination = null;
        this.line = null;

        this.callback = {
            mapHovered: this.destMoved.bind(this),
            mapClicked: this.clickCallback.bind(this)
        };
        this.map.addCallback(this.callback);
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
        this.onFinish();
        this.map.removeCallback(this.callback);
        if(this.line.isValid()) {
            this.facilities.purchaseLine(this.line);
        }
    }
}
