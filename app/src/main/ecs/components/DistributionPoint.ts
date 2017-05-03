export class DistributionPoint{

    //@formatter:off
    readonly COVERAGE_LEVELS: {x:number, y:number}[][] = [
        [
            {x:-1, y:1},  {x:0,y:1},  {x:1,y:1},
            {x:-1, y:0},  {x:0,y:0},  {x:1,y:0},
            {x:-1, y:-1}, {x:0,y:-1}, {x:1,y:-1}
        ],
        [
            {x:-1, y:2},  {x:0,y:2},  {x:1,y:2},
            {x:-2, y:1},  {x:-1, y:1},  {x:0,y:1},  {x:1,y:1},  {x:2, y:1},
            {x:-2, y:0},  {x:-1, y:0},  {x:0,y:0},  {x:1,y:0},  {x:2, y:0},
            {x:-2, y:-1}, {x:-1, y:-1}, {x:0,y:-1}, {x:1,y:-1}, {x:2, y:-1},
            {x:-1, y:-2}, {x:0,y:-2}, {x:1,y:-2},
        ],
        [
            {x:0,y:3},
            {x:-1, y:2},  {x:0,y:2},  {x:1,y:2},
            {x:-2, y:1},  {x:-1, y:1},  {x:0,y:1},  {x:1,y:1},  {x:2, y:1},
            {x:-3, y:0},  {x:-2, y:0},  {x:-1, y:0},  {x:0,y:0},  {x:1,y:0},  {x:2, y:0}, {x:3, y:0},
            {x:-2, y:-1}, {x:-1, y:-1}, {x:0,y:-1}, {x:1,y:-1}, {x:2, y:-1},
            {x:-1, y:-2}, {x:0,y:-2}, {x:1,y:-2},
            {x:0,y:-3}
        ]
    ];
    //@formatter:on

    coverageLevel = 0;
}