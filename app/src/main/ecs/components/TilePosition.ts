export class TilePosition{
    x = -1;
    y = -1;

    equals(other: TilePosition){
        return other.x == this.x && other.y == this.y;
    }
}