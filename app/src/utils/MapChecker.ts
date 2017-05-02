export function buildChecker(entities: any[]) {
    let facilitiesMap: {[x: number]: {[y: number]: boolean}} = {};
    for (let facility of entities) {
        let position = facility.tilePosition;
        if (facilitiesMap[position.x] == null) {
            facilitiesMap[position.x] = {};
        }
        facilitiesMap[position.x][position.y] = true;
    }

    let facilityAt = function(position: {x: number, y:number}){
        if(facilitiesMap[position.x] == null){
            return false;
        }
        if(facilitiesMap[position.x][position.y] == null){
            return false;
        }
        return facilitiesMap[position.x][position.y];
    };

    let checkRange = function(range: number, position: {x:number, y:number}){
        for(let x = -range; x<= range; x++){
            for(let y = -range; y<= range; y++){
                if(facilityAt({x:x+position.x, y:y+position.y})){
                    return true;
                }
            }
        }
        return false;
    };

    return checkRange;
}
