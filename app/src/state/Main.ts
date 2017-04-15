export class Main extends Phaser.State {
    map: Phaser.Tilemap;

    create() {
        this.setupMap();
    }

    setupMap() {
        this.map = this.add.tilemap("map1");
        this.map.addTilesetImage("tileset", "tileset");

        let baseLayer = this.map.createLayer("base");
        baseLayer.resizeWorld();
    }

    update() {

    }
}
