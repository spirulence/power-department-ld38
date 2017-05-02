export class MainLayers{

    map: Phaser.Group;
    planLines: Phaser.Group;
    planOthers: Phaser.Group;
    lines: Phaser.Group;
    others: Phaser.Group;
    gui: Phaser.Group;

    constructor(game: Phaser.Game){
        this.map = game.add.group(null);
        this.planLines = game.add.group(null);
        this.planOthers = game.add.group(null);
        this.lines = game.add.group(null);
        this.others = game.add.group(null);
        this.gui = game.add.group(null);

        game.world.add(this.map);
        game.world.add(this.planLines);
        game.world.add(this.planOthers);
        game.world.add(this.lines);
        game.world.add(this.others);
        game.world.add(this.gui);
    }
}