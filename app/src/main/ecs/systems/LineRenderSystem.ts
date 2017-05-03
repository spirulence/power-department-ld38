import {System} from "./System";
import {EntityManager} from "tiny-ecs";
import {TwoPoints} from "../components/TwoPoints";

export class TwoPointsRenderSystem implements System{
    private group: Phaser.Group;
    private graphics: Phaser.Graphics;
    private classes: any[];
    private lineColor: number;
    private lineWidth: number;

    constructor(layer: Phaser.Group, classes: any[], lineColor: number){
        this.lineWidth = 3;
        this.group = layer;
        this.lineColor = lineColor;
        this.graphics = new Phaser.Graphics(layer.game);
        layer.add(this.graphics);
        this.classes = classes.concat([TwoPoints]);
    }

    process(entities: EntityManager): void {
        let builtLines = entities.queryComponents(this.classes);

        this.graphics.clear();
        this.graphics.lineStyle(this.lineWidth, this.lineColor);
        let index = 0;
        for(let line of builtLines){
            let points: TwoPoints = line.twoPoints;
            this.graphics.moveTo(points.from.x*8+4, points.from.y*8+4);
            this.graphics.lineTo(points.to.x*8+4, points.to.y*8+4);
            index++;
        }
    }
}