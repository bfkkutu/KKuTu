window.addEventListener('DOMContentLoaded', (event) => {
	let passiveBtn = document.getElementsByClassName("passiveBtn");
			
	for(let i in passiveBtn){
		i = $(passiveBtn[i]);
		if(i.attr("href")){
			let href = i.attr("href");
			i.on("click", () => {
				location.href = href;
			});
			i.removeAttr("href");
		}
		if(i.attr("click")){
			let script = i.attr("click");
			i.on("click", () => {
				eval(script);
			});
			i.removeAttr("click");
		}
	}
});