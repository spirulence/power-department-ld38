import {System} from "./System";
import {EntityManager} from "tiny-ecs";
import {Planned} from "../components/Planned";
import {TwoPoints} from "../components/TwoPoints";
import {TileRender} from "../components/TileRender";
import {line} from "../../../utils/Bresenham";
import {Hovered} from "../components/Hovered";

export class SpeculativeLineRenderSystem implements System{
    private game: Phaser.Game;
    private sprites: Phaser.Sprite[];
    private group: Phaser.Group;

    constructor(game: Phaser.Game){
        this.game = game;
        this.sprites = [];
        this.group = game.add.group();
    }

    process(entities: EntityManager): void {
        let allSpeculative = entities.queryComponents([Planned, TwoPoints, TileRender]).concat(
            entities.queryComponents([Hovered, TileRender, TwoPoints]));

        let numSprites = SpeculativeLineRenderSystem.totalSprites(allSpeculative);

        while(numSprites > this.sprites.length){
            this.sprites.push(this.game.add.sprite(-1000, -1000, "overlay-tiles"));
        }

        if(numSprites < this.sprites.length){
            for(let sprite of this.sprites){
                sprite.position.set(-1000, -1000);
            }
        }

        let index = 0;
        for(let speculative of allSpeculative){
            let lineCoordinates = line(speculative.twoPoints.from, speculative.twoPoints.to);
            for(let position of lineCoordinates) {
                this.sprites[index].x = position.x * 8;
                this.sprites[index].y = position.y * 8;
                this.sprites[index].frame = speculative.tileRender.tile;
                this.sprites[index].alpha = 0.3;
                index++;
            }
        }
    }

    private static totalSprites(allSpeculative: any[]) {
        let numSprites = 0;
        for(let speculative of allSpeculative) {
            let twoPoints: TwoPoints = speculative.twoPoints;
            numSprites += SpeculativeLineRenderSystem.calcLineLength(twoPoints);
        }
        return numSprites;
    }

    private static calcLineLength(twoPoints: TwoPoints) {
        let absX = Math.abs(twoPoints.from.x - twoPoints.to.x);
        let absY = Math.abs(twoPoints.from.y - twoPoints.to.y);
        return Math.max(absX, absY) + 1;
    }
}