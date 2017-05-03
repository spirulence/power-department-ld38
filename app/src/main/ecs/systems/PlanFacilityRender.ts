import {SpriteForEachTileRenderSystem} from "./SpriteForEachTileRenderSystem";

export class PlanFacilityRender extends SpriteForEachTileRenderSystem{

    protected renderHook(_renderable: any, _sprite: Phaser.Sprite) {
        _sprite.alpha = 0.7;
    }
}