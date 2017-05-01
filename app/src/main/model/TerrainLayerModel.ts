
export class TerrainLayerModel{
    public key: string;
    public terrain: number[][];
    public height: number;
    public width: number;

    private json: any;

    constructor(game: Phaser.Game, key: string){
        this.json = game.cache.getJSON(key);
        this.key = key;
        this.height = this.json.height;
        this.width = this.json.width;

        let baseLayerIndex = this.findBaseLayer();

        this.loadBaseLayer(baseLayerIndex);
    }

    private loadBaseLayer(baseLayerIndex: number) {
        this.terrain = [];
        let jsonDataIndex = 0;
        for (let row = 0; row < this.json.height; row++) {
            this.terrain.push([]);
            for (let column = 0; column < this.json.width; column++) {
                this.terrain[row].push(this.json.layers[baseLayerIndex].data[jsonDataIndex]);
                jsonDataIndex++;
            }
        }
    }

    private findBaseLayer() {
        let layerIndex = 0;
        for(let layer of this.json.layers){
            if(layer.name == "base"){
                return layerIndex;
            }
            layerIndex++;
        }
        return -1;
    }

}