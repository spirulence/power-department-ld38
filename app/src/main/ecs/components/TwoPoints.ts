import {TilePosition} from "./TilePosition";

export class TwoPoints{
    from = new TilePosition();
    to = new TilePosition();

    calcLength(){
        let absX = Math.abs(this.from.x - this.to.x);
        let absY = Math.abs(this.from.y - this.to.y);
        return Math.max(absX, absY) + 1;
    }

    equals(other: TwoPoints){
        return (this.from.equals(other.from) && this.to.equals(other.to)) ||
            (this.from.equals(other.to) && this.to.equals(other.from));
    }
}