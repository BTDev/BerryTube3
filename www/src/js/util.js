/**
	Chat Module. Handles chatting, polls, and so on.
*/
var bt = (function (bt,module_name) {

	var util = bt.util = { e:bt.register(module_name) }; 

	util.e.pagetitle = function(pt){
		util.setPageTitle(pt);
	}
	
	util.setPageTitle = function(pt){
		document.title = pt;
	}
	
	return bt;
}(bt,"util"));
