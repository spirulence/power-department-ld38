import {System} from "./System";
import {EntityManager} from "tiny-ecs";
import {Speculative} from "../components/Speculative";

export class SpeculativeRenderSystem implements System{
    private game: Phaser.Game;
    private sprites: Phaser.Sprite[];
    private group: Phaser.Group;

    constructor(game: Phaser.Game){
        this.game = game;
        this.sprites = [];
        this.group = game.add.group();
    }

    process(entities: EntityManager): void {
        let allSpeculative = entities.queryComponents([Speculative]);

        while(allSpeculative.length > this.sprites.length){
            this.sprites.push(this.game.add.sprite(-100, -100, "overlay-tiles"));
        }

        while(allSpeculative.length < this.sprites.length){
            for(let sprite of this.sprites){
                sprite.position.set(-1000,-1000);
            }
        }

        let index = 0;
        for(let speculative of allSpeculative){
            let position = speculative.tilePosition;
            this.sprites[index].x = position.x * 8;
            this.sprites[index].y = position.y * 8;
            this.sprites[index].frame = 5;

            index++;
        }
    }

}