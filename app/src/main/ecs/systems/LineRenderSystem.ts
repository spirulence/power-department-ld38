import {System} from "./System";
import {EntityManager} from "tiny-ecs";
import {TwoPoints} from "../components/TwoPoints";
import {TileRender} from "../components/TileRender";
import {Built} from "../components/Built";

export class LineRenderSystem implements System{
    private game: Phaser.Game;
    private group: Phaser.Group;
    private graphics: Phaser.Graphics;

    constructor(game: Phaser.Game, layer: Phaser.Group){
        this.game = game;
        this.group = layer;
        this.graphics = game.add.graphics(0, 0, layer);
    }

    process(entities: EntityManager): void {
        let builtLines = entities.queryComponents([Built, TwoPoints, TileRender]);

        this.graphics.clear();
        this.graphics.lineStyle(3, 0xf4e542);
        let index = 0;
        for(let line of builtLines){
            let points: TwoPoints = line.twoPoints;
            this.graphics.moveTo(points.from.x*8+4, points.from.y*8+4);
            this.graphics.lineTo(points.to.x*8+4, points.to.y*8+4);
            index++;
        }
    }
}