!(function(){ 
	new Function(`$Request = (type, callback, $data, $stage)=> {
		if ($data)
			if ($data.admin) return;
		
		const setInterval = ((handler, timeout)=> {
			return (function _Recall() {
				setTimeout(() => {
					handler();
					
					_Recall();
				}, timeout)
			})();
		})
		let isHacker = true;
		if (type == 'devtools') {
			delete window.WebSocket, delete window.setInterval;
			setInterval(() => new Function('debugger')(), 10);
			$(document).keydown(function(e) {
				if ((e.keyCode == 123) || (e.ctrlKey && e.shiftKey && (e.keyCode == 73 || e.keyCode == 105)) ) {
					e.preventDefault();
					e.returnValue = false;
				};
			});
			
			var defaultProperty = Object.getPrototypeOf;
			Object.getPrototypeOf = (...args) => {
				if (Error().stack.includes("getCompletions")) {
					if (isHacker) {
						callback();
						isHacker = false;
					};
				}
				return defaultProperty(...args);
			};
		}
		if (type == 'macro') {
			setInterval(function() {
				if ($("#Talk").val().length) {
					$("#Talk").val("");
					
					callback();
				}
			}, 30);
			$stage.talk.keydown((e) => {
				if (e.key && /[가-힣]/gi.test(e.key)) {
					if (isHacker) {
						callback();
						isHacker = false;
					}
				}
			})
		}
	}`)()
})();