import {TilePosition} from "./TilePosition";

export class TwoPoints{
    from = new TilePosition();
    to = new TilePosition();

    calcLength(){
        let absX = Math.abs(this.from.x - this.to.x);
        let absY = Math.abs(this.from.y - this.to.y);
        return Math.max(absX, absY) + 1;
    }
}