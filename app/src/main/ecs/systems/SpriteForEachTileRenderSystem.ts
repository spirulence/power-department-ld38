import {System} from "./System";
import {EntityManager} from "tiny-ecs";
import {TileRender} from "../components/TileRender";
import {TilePosition} from "../components/TilePosition";

export class SpriteForEachTileRenderSystem implements System{
    private game: Phaser.Game;
    private sprites: Phaser.Sprite[];
    private group: Phaser.Group;
    private components: any[];

    constructor(layer: Phaser.Group, components: any[]){
        this.components = components.concat([TileRender, TilePosition]);
        this.game = layer.game;
        this.sprites = [];
        this.group = layer;
    }

    process(entities: EntityManager): void {
        let toRender = entities.queryComponents(this.components);

        while(toRender.length > this.sprites.length){
            this.sprites.push(this.game.add.sprite(-100, -100, "overlay-tiles", null, this.group));
        }

        if(toRender.length < this.sprites.length){
            for(let sprite of this.sprites){
                sprite.position.set(-1000, -1000);
            }
        }

        let index = 0;
        for(let renderable of toRender){
            this.render(renderable, this.sprites[index]);
            index++;
        }
    }

    protected render(renderable: any, sprite: Phaser.Sprite) {
        sprite.frame = renderable.tileRender.tile;

        let position = renderable.tilePosition;
        sprite.x = position.x * 8;
        sprite.y = position.y * 8;

        this.renderHook(renderable, sprite);
    }

    protected renderHook(_renderable: any, _sprite: Phaser.Sprite){

    }

}