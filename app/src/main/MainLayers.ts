export class MainLayers{

    map: Phaser.Group;
    planLines: Phaser.Group;
    planOthers: Phaser.Group;
    lines: Phaser.Group;
    others: Phaser.Group;
    gui: Phaser.Group;
    draggable: Phaser.Group;

    constructor(game: Phaser.Game){
        this.map = game.make.group(null);
        this.planLines = game.make.group(null);
        this.planOthers = game.make.group(null);
        this.lines = game.make.group(null);
        this.others = game.make.group(null);
        this.draggable = game.make.group(null);
        this.gui = game.make.group(null);

        game.world.add(this.map);
        game.world.add(this.planLines);
        game.world.add(this.planOthers);
        game.world.add(this.lines);
        game.world.add(this.others);
        game.world.add(this.draggable);
        game.world.add(this.gui);
    }
}