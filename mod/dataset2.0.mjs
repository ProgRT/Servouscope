import {parseSu} from './servou.mjs';
import {parseASL} from './asl.mjs';

function isServou(str){return str.substring(0,5) == '[REC]';}
function isASL(str){str.substring(0,18) == 'ASL 3.4 .rwa ASCII'}

export function parseDataset(str){
	if(isServou(str)){return parseSu(str)}
	else if(isASL){return parseASL(str)}
	else {console.error("Unknown file format.")}
}
