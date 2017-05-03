import {SpriteForEachTileRenderSystem} from "./SpriteForEachTileRenderSystem";

export class PlanMarkerRender extends SpriteForEachTileRenderSystem{

    protected renderHook(_renderable: any, _sprite: Phaser.Sprite) {
        _sprite.position.add(8,8);
        _sprite.frame = 10;
    }
}