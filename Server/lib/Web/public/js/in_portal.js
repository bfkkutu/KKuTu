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
	let isHacker = true;
	let _setInterval = window.setInterval;
	
	function detectHacker(type, callback) {
		if (type == 'devtools') {
			delete window.WebSocket, delete window.setInterval;
			_setInterval(() => new Function('debugger')(), 30);
			$(document).keydown(function(e) {
				if ((e.keyCode == 123)/*(F12)*/ || (e.ctrlKey && e.shiftKey && (e.keyCode == 73 || e.keyCode == 105))/*(Ctrl+Shift+I)*/ ) {
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
	}
	function a() {
		$.get("/servers", function(a) {
			var e = 0;
			b.list.empty(), c = a.list, a.list.forEach(function(a, c) {
				var f, g = null === a ? "x" : "o",
					h = "x" == g ? "-" : a + " / " + d,
					i = a / d * 100;
				e += a || 0, "o" == g && (i >= 99 ? g = "q" : i >= 90 && (g = "p")), b.list.append(f = $("<div>").addClass("server").attr("id", "server-" + c).append($("<div>").addClass("server-status ss-" + g)).append($("<div>").addClass("server-name").html(L["server_" + c])).append($("<div>").addClass("server-people graph").append($("<div>").addClass("graph-bar").width(i + "%")).append($("<label>").html(h))).append($("<div>").addClass("server-enter").html(L.serverEnter))), "x" != g ? f.on("click", function(a) {
					location.href = "/?server=" + c
				}) : f.children(".server-enter").html("-")
			}), b.total.html("&nbsp;" + L.TOTAL + " " + e + L.MN), b.refi.removeClass("fa-spin"), b.start.prop("disabled", !1)
		})
	}
	var b, c, d = 2e3;
	d = 100; // 최대 수용 인원
	$(document).ready(function() {
		b = {
			list: $("#server-list"),
			total: $("#server-total"),
			start: $("#game-start"), 
			ref: $("#server-refresh"),
			refi: $("#server-refresh>i")
		}, $("#Background").attr("src", "").addClass("jt-image").css({
			"background-image": `url('https://cdn.jsdelivr.net/npm/bfkkutudelivr@${L.cdn_version}/img/kkutu/gamebg.png')`,
			"background-size": "200px 200px"
		}), b.start.prop("disabled", !0).on("click", function(a) {
			var b, e;
			if ($("#account-info").html() === L.LOGIN) return $("#server-0").trigger("click");
			for (b = .9; b < 1; b += .01)
				for (e in c)
					if (c[e] < b * d) return void $("#server-" + e).trigger("click")
		}), b.ref.on("click", function(c) {
			//if (b.refi.hasClass("fa-spin")) return alert(L.serverWait);
			b.refi.addClass("fa-spin"), setTimeout(a, 1e3)
		}), setInterval(function() {
			b.ref.trigger("click")
		}, 6e4), a()
		$(document).on("contextmenu dragstart selectstart", function(e) {
			return false;
		});
		
		// Block the Devtools
		detectHacker('devtools', () => {
			alert("개발자 도구(F12)는 보안상의 이유로 사용하실 수 없습니다.");
			
			$("#Middle").html("<center><h1><br/><font color='black'>잘못된 접근입니다.</font></h1></center>");
			$("#Bottom").remove();
		})
	})
})();
