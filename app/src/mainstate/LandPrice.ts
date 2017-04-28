import {TerrainTypes} from "./Terrain";
import {MapLayers} from "./Facilities";

export class LandPrice{

    set map(value: Phaser.Tilemap) {
        this._map = value;
        this.calculatePrices();
    }

    private _map: Phaser.Tilemap;
    private prices: number[][];

    private static readonly CHECKING_RANGE = 3;
    private static readonly MINIMUM_PRICE = 1;
    private static readonly CITY_PRICE_DRIVER = 2;

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
        let price = LandPrice.MINIMUM_PRICE;

        const range = LandPrice.CHECKING_RANGE;

        for(let yAdjust = - range; yAdjust <= range; yAdjust++){
            for(let xAdjust = -range; xAdjust <= range; xAdjust++){
                price += this.getClampedCity(row + yAdjust, column + xAdjust);
            }
        }
        return price;
    }

    private getClampedCity(y: number, x: number) {
        if(y >= 0 && x >= 0 && y < this._map.height && x < this._map.width){
            if(this._map.getTile(x, y, MapLayers.BASE, true).index === TerrainTypes.City){
                return LandPrice.CITY_PRICE_DRIVER;
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
