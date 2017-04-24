import {TerrainTypes} from "./Terrain";
export class LandPrice{
    set map(value: Phaser.Tilemap) {
        this._map = value;
        this.calculatePrices();
    }

    private _map: Phaser.Tilemap;
    private prices: number[][];

    private calculatePrices() {
        this.prices = [];
        for(let row = 0; row < this._map.height; row++){
            this.prices.push([]);
            for(let column = 0; column < this._map.width; column++){
                this.prices[row].push(this.calculatePrice(row, column));
            }
        }
    }

    private calculatePrice(row: number, column: number) {
        let price = 1;

        const range = 3;

        for(let yAdjust = - range; yAdjust <= range; yAdjust++){
            for(let xAdjust = -range; xAdjust <= range; xAdjust++){
                price += this.getClampedCity(row + yAdjust, column + xAdjust);
            }
        }
        return price;
    }

    private getClampedCity(y: number, x: number) {
        if(y >= 0 && x >= 0 && y < this._map.height && x < this._map.width){
            if(this._map.getTile(x, y, "base", true).index === TerrainTypes.City){
                return 2;
            }else{
                return 0;
            }
        }else{
            return 0;
        }
    }

    getPrice(x: number, y: number){
        return this.prices[y][x];
    }
}
