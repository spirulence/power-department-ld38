export function line(from: {x:number, y:number}, to: {x:number, y:number}){
    let coords: {x: number, y: number}[] = [];
    bresenham(from.x, from.y, to.x, to.y, function(x:number, y: number){
        coords.push({x:x, y:y});
    });
    return coords;
}

export function bresenham(x0:number, y0:number, x1:number, y1: number, setPixel: (x:number, y:number)=>void) {
    let dx = Math.abs(x1 - x0);
    let dy = Math.abs(y1 - y0);

    let sx = x0 < x1 ? 1 : -1;
    let sy = y0 < y1 ? 1 : -1;

    let err = dx - dy;

    while (true) {
        setPixel(x0, y0);

        if(x0 == x1 && y0 == y1)
            return;

        let e2 = 2 * err;
        if(e2 > -dy) {
            err -= dy;
            x0 = sx + x0;
        }
        if(e2 < dx) {
            err += dx;
            y0 = sy + y0;
        }
    }
}