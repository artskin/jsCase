var svg1 = document.getElementById("svg1");
var perlist_path = document.getElementById("perlist_path");
var perlist_per = document.getElementById("perlist_per");

/****************************************/
/**************    数据             ***************/
/****************************************/

/*变化数据*/
var pathlist = [];
var perlist = [];

/*ajaxNew*/
function ajaxNew(param){
	var xmlhttp = new XMLHttpRequest();
	xmlhttp.onreadystatechange = function(){
		if(xmlhttp.readyState==4 && xmlhttp.status==200){
			perlist = JSON.parse( xmlhttp.responseText );
			setSvgper(perlist[perlist.length-1]);
		}else if(xmlhttp.readyState==4 && xmlhttp.status==404){
			console.log(xmlhttp.responseText);
		}
	}
	xmlhttp.open(param.mothed, param.url, param.async);
	xmlhttp.send(param.param);
}

/****************************************/
/************** 定义/执行事件   ***************/
/****************************************/

var flagi = 0;
function freshPath(){
	var paramUrl = "data/perTrailDate"+flagi+".json";
	var param = {
		"mothed":"get",
		"url":paramUrl,
		"async":"true",
		"type":"json",
		"param":""
	};
	ajaxNew(param);
	flagi< 3 ? flagi++ : flagi;
	console.log(flagi);
}

/*点击事件*/
btn_fresh.onclick = function(){
	freshPath();
};
btn_showPath.onclick = function(){
	perlist_path.style.display = "block";
}
btn_hidePath.onclick = function(){
	perlist_path.style.display = "none";
}
btn_empty.onclick = function(){
	perlist = [];
	setSvgper(perlist[perlist.length-1]);
}

/****************************************/
/**************    方法             ***************/
/****************************************/

/*创建pathlist内元素对象*/
function pathlistOBJ(id,d,stroke){
	var o = new Object();
	o.id = id;
	o.d = d;
	o.stroke = stroke;
	return o;
}
/*红绿黄 绿蓝靛 红蓝紫*/
/*获取随机16进制色值：#xxxxxx*/
function getRandomColor(j){
//	return '#'+Math.floor(Math.random()*16777215).toString(16);
	var colorList = ["#f00","#0f0","#00f","#f0f","#ff0","#0ff"];
	return colorList[j%colorList.length];
}
console.log( getRandomColor(0) );

/*判断id是否已在pathlist内，不在则为新id，返回true，创建新路径*/
function IsNewPath(id){
	var arr = [];
	for(i in pathlist){
		arr.push(pathlist[i].id);
	}
	if( arr.indexOf(id)>-1 ){
		return false;
	}else{
		return true;
	}
}

/*判断id是否在perlist最后一组内，在则返回true，显示该路径*/
function IsShowPath(id){
	var lastperlist = perlist[perlist.length-1];
	var arr = [];
	for(i in lastperlist){
		arr.push(lastperlist[i].id);
	}
	if( arr.indexOf(id)>-1 ){
		return true;
	}else{
		return false;
	}
}

/*设置-由生成路径列表 pathlist*/
function setPathlist(){
	pathlist = [];
	for(var i=0; i<perlist.length; i++){
		var a = perlist[i];
		for(j in a){
			if( IsNewPath(a[j].id) ){
				pathlist.push( pathlistOBJ( a[j].id, "M"+a[j].ix+" "+a[j].iy, getRandomColor(j)) );
			}else{
				for(k in pathlist){
					if( a[j].id==pathlist[k].id ){
						pathlist[k].d += " L"+ a[j].ix +" "+ a[j].iy;
					}
				}
			}
		}
	}
}

/*设置-绘制svg元素位置、文字、路径*/
function setSvgper(perlist){
	perlist_path.innerHTML = "";
	perlist_per.innerHTML = "";
	
	/*生成路径列表 pathlist*/
	setPathlist();
	/*路径写入DOM*/
	for(i in pathlist){
		var a = pathlist[i];
		perlist_path.appendChild( creatSvgP(a.id, a.d, a.stroke) );
	}
	/*个体单元写入DOM*/
	for(i in perlist){
		var a = perlist[i];
		perlist_per.appendChild( creatSvgPer(a.id, a.ix, a.iy, a.it) );
	}
}

/*path转换为animationMotion路径*/
function matchAnimageP(path){
	path = path.replace( /[ML]/g,"").split(" ");
	if(path.length>1){
		for(i in path){
			if(i%2 == 0){
				path[i] = String(Number(path[i]) - Number(path[path.length-2]));
				if(i==0){
					path[i] = "M"+path[i];
				}else{
					path[i] = "L"+path[i];
				}
			}else{
				path[i] = String(Number(path[i]) - Number(path[path.length-1]));
			}
		}
	}
	path = path.join(" ")
	return path;
}

/*动态创建svg元素*/
/*动态创建svg元素 - 路径*/
function creatSvgP(id,d,c){
	var path = document.createElementNS('http://www.w3.org/2000/svg','path');
	if( IsShowPath(id) ){
		path.setAttribute("class","p");
	}else{
		path.setAttribute("class","p hide");
	}
	path.setAttribute("id","p"+id);
	path.setAttribute("d",d);
	path.setAttribute("style","stroke:"+c+";");
	return path;
}
/*动态创建svg元素 - 单元（圆形+文字）*/
function creatSvgPer(id,x,y,t){
	var g = document.createElementNS('http://www.w3.org/2000/svg','g');
	g.setAttribute("class","per");
	g.setAttribute("id","per"+id);
	
	var c = '<circle class="c" id="c'+id+'" r="10" cx="'+x+'" cy="'+y+'"></circle>';
	var t = '<text class="t" id="t'+id+'" x="'+(x-5)+'" y="'+(y+6)+'">'+t+'</text>';
	var aM = '';
	if(document.getElementById("p"+id)){
		var animateP = matchAnimageP(document.getElementById("p"+id).getAttribute("d"));
		aM = '<animateMotion class="aM" path="'+animateP+'" dur="3s" begin="svg1.click;mouseover" restart="whenNotActive" repeatCount="1" />';
	}
	g.innerHTML = c + t + aM;
	return g;
}