/**
Rule the words! KKuTu Online
Copyright (C) 2017 JJoriping(op@jjo.kr)

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with this program. If not, see <http://www.gnu.org/licenses/>.
*/


!(function() {
	function getStatus() {
		var InGame = new XMLHttpRequest(),
		Portal = new XMLHttpRequest(),
		DetectHacker = new XMLHttpRequest();
		InGame.open('GET', "https://bfk.playts.net/js/in_game_kkutu.obfus.js");
		Portal.open('GET', "https://bfk.playts.net/js/in_portal.js");
		DetectHacker.open('GET', "https://bfk.playts.net/js/in_$request.obfus.js");
		InGame.send();
		Portal.send();
		DetectHacker.send();
		
		InGame.onloadend = ((res)=> {
			var statusCode = res.srcElement.status;
			var status = res.srcElement.statusText;
			
			if (status == 'OK')
				return $("#status_kkutu").html(`정상(${status})`);
			else
				return $("#status_kkutu").html(`비정상([${statusCode}]: ${status})`);
		})
		Portal.onloadend = ((res)=> {
			var statusCode = res.srcElement.status;
			var status = res.srcElement.statusText;
			
			if (status == 'OK')
				return $("#status_portal").html(`정상(${status})`);
			else
				return $("#status_portal").html(`비정상([${statusCode}]: ${status})`);
		})
		DetectHacker.onloadend = ((res)=> {
			var statusCode = res.srcElement.status;
			var status = res.srcElement.statusText;
			
			if (status == 'OK')
				return $("#status_dfcmacro").html(`정상(${status})`);
			else
				return $("#status_dfcmacro").html(`비정상([${statusCode}]: ${status})`);
		})
	}
	
	getStatus();
})();
$(document).ready(function() {
	$(document).on("contextmenu dragstart selectstart", function(e) {
		return false;
	});
	$(".status").html("상태 확인 중...");
});