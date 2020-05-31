
/****************************************/
/**************    缩放、移动svg             ***************/
/****************************************/

var svg1 = document.getElementById("svg1");



var svg1w = svg1.getAttribute("width"),svg1h = svg1.getAttribute("height");
var startx = 0, endx = 0;
var starty = 0, endy = 0;
var svg1_v1 = svg1.getAttribute("viewBox").split(" ")[0];
var svg1_v2 = svg1.getAttribute("viewBox").split(" ")[1];
var svg1_v3 = svg1.getAttribute("viewBox").split(" ")[2];
var svg1_v4 = svg1.getAttribute("viewBox").split(" ")[3];
svg1.onwheel = function(e){
	e = e || window.event;
	eDetail = e.wheelDelta || e.detail;
	if(eDetail>0){
		svg1_v3 = Number(svg1_v3)/1.1;
		svg1_v4 = Number(svg1_v4)/1.1;
		svg1_v1 = Number(svg1w-svg1_v3)/2;
		svg1_v2 = Number(svg1h-svg1_v4)/2;
	}else if(eDetail<0){
		svg1_v3 = Number(svg1_v3)*1.1;
		svg1_v4 = Number(svg1_v4)*1.1;
		svg1_v1 = Number(svg1w-svg1_v3)/2;
		svg1_v2 = Number(svg1h-svg1_v4)/2;
	}
	var s1_viewBox = svg1_v1+" "+svg1_v2+" "+svg1_v3+" "+svg1_v4;
	svg1.setAttribute("viewBox",s1_viewBox);
}
var moveflag = false;
svg1.onmousedown = function(e){
	e = e || window.event;
	moveflag = true;
	startx = e.x;
	starty = e.y;
}
svg1.onmouseup = function(){
	moveflag = false;
	svg1_v1 = endx;
	svg1_v2 = endy;
}
svg1.onmousemove = function(e){
	e = e || window.event;
	if(moveflag == true){
		endx = (Number(svg1_v1) - Number(e.x-startx))*(svg1_v3/svg1w);
		endy = (Number(svg1_v2) - Number(e.y-starty))*(svg1_v4/svg1h);
		svg1.setAttribute("viewBox",endx+" "+endy+" "+svg1_v3+" "+svg1_v4);
	}
}