import {TerrainTypes} from "./Terrain";
import {Layer} from "./GameMap";

const HIGHLIGHT_LEVELS = 5;

enum PriceHighlights{
    Level0 = 60,
    Level1 = 61,
    Level2 = 62,
    Level3 = 63,
    Level4 = 64
}

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
            if(this._map.getTile(x, y, "base", true).index === TerrainTypes.City){
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

    private static computeHighlight(price: number, min: number, max: number) {
        let numberOfLevels = HIGHLIGHT_LEVELS;

        let zeroBasedPrice = (price - min);
        let zeroBasedMax = (max - min);

        let percentage = zeroBasedPrice / zeroBasedMax;
        let level = Math.round(percentage * numberOfLevels);
        switch(level){
            case 0:
                return PriceHighlights.Level0;
            case 1:
                return PriceHighlights.Level1;
            case 2:
                return PriceHighlights.Level2;
            case 3:
                return PriceHighlights.Level3;
            default:
                return PriceHighlights.Level4;
        }
    }

    addToLayer(layer: Layer) {
        let max = 0;
        let min = LandPrice.CHECKING_RANGE * LandPrice.CHECKING_RANGE * LandPrice.CITY_PRICE_DRIVER;

        for(let row = 0; row < this._map.height; row++){
            for(let column = 0; column < this._map.width; column++){
                max = Math.max(this.prices[row][column], max);
                min = Math.min(this.prices[row][column], min);
            }
        }

        for(let row = 0; row < this._map.height; row++) {
            for (let column = 0; column < this._map.width; column++) {
                let price = this.prices[row][column];
                let highlight = LandPrice.computeHighlight(price, min, max);
                if(highlight != PriceHighlights.Level0){
                    layer.setTile({x:column, y: row}, highlight);
                }
            }
        }
    }
}
