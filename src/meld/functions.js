import { prefix as pref } from 'meld-clients-core/lib/library/prefixes'

export const transformArrangement = (vivoScore) => {
  // Take graph of arrangement and make more intuitive local object
  let obj = {};
  obj.shortTitle = vivoScore[pref.bibo+"shortTitle"];
  obj.genre = pref.dbpedia+"genre" in vivoScore ? vivoScore[pref.dbpedia+"genre"]['@id'] : false;
  obj.arranger = vivoScore[pref.gndo+'arranger']; // Change so we have name, not URL
  obj.publisher = vivoScore[pref.dce+"publisher"]; // Change so we have name, not URL
  obj.date = vivoScore[pref.gndo+"dateOfPublication"];
  obj.MEI = pref.frbr+"embodiment" in vivoScore ? vivoScore[pref.frbr+"embodiment"]['@id'] : false;
  obj.place = vivoScore[pref.rdau+"P60163"];
//    obj.catNumber = pref.wdt+"P217" in vivoScore ? vivoScore[pref.wdt+"P217"]['@id'] : false;
  obj.catNumber = vivoScore[pref.wdt+"P217"];
  obj.work = vivoScore[pref.rdau+"P60242"];
//		console.log("Processed a ", vivoScore, " into a ", obj);
  return obj;
}

export const addWork = (worklist, arrangement) => {
	if(!arrangement.work || !'@id' in arrangement.work) return worklist;
	const wID = arrangement.work['@id'];
	if(worklist.find(x => x['@id']===wID)){
		return worklist;
	} else {
		let wl2 = worklist.slice();
		wl2.push(arrangement.work);
		return wl2;
	}
}
