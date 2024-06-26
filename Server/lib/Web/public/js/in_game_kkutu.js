(function () {
  L = new Proxy(L, {
    get: (target, name) =>
      target.hasOwnProperty(name) ? target[name] : `L#${name}`,
  });
  Object.filter = (obj, predicate) =>
    Object.keys(obj)
      .filter((key) => predicate(obj[key]))
      .reduce((res, key) => ((res[key] = obj[key]), res), {});

  function onSpace(a) {
    32 == a.keyCode && ($stage.chatBtn.trigger("click"), a.preventDefault());
  }

  function drawList() {
    var a = $data._list.slice($data.chain),
      b = $data.room.opts.proverb ? 1 : 5,
      c = "",
      d = a[0].length;
    d >= 20 && (c = "18px"),
      d >= 50 && (c = "15px"),
      $stage.game.display.css("font-size", c),
      (a[0] = "<label style='color: #FFFF44;'>" + a[0] + "</label>"),
      $stage.game.display.html(a.slice(0, b).join(" ")),
      $stage.game.chain.show().html($data.chain),
      $(".jjo-turn-time .graph-bar")
        .width("100%")
        .html(a.slice(b, 2 * b).join(" "))
        .css({
          "text-align": "center",
          "background-color": "#70712D",
        });
  }

  function restGoing(a) {
    $(".jjo-turn-time .graph-bar").html(a + L.afterRun),
      a > 0 && addTimeout(restGoing, 1e3, a - 1);
  }

  function drawSpeed(a) {
    var b;
    for (b in a)
      $("#game-user-" + b + " .game-user-score")
        .empty()
        .append(
          $("<div>")
            .css({
              float: "none",
              color: "#4444FF",
              "text-align": "center",
            })
            .html(
              a[b] + "<label style='font-size: 11px;'>" + L.kpm + "</label>"
            )
        );
  }

  /*function zeroPadding(a, b) {
		var c = a.toString();
		return "000000000000000".slice(0, Math.max(0, b - c.length)) + c
	}*/

  function send(a, b, c) {
    var d,
      e = {
        type: a,
      },
      f = c ? ws : rws || ws;
    for (d in b) e[d] = b[d];
    if ("test" != a && spamCount++ > 10) {
      if (++spamWarning >= 3) return f.close();
      spamCount = 5;
    }
    f.send(JSON.stringify(e));
  }

  function loading(a) {
    a
      ? $("#Intro").is(":visible")
        ? ($stage.loading.hide(), $("#intro-text").html(a))
        : $stage.loading.show().html(a)
      : $stage.loading.hide();
  }

  function showDialog(a, b) {
    var c = [$(window).width(), $(window).height()];
    return !b && a.is(":visible")
      ? (a.hide(), !1)
      : ($(".dialog-front").removeClass("dialog-front"),
        a
          .show()
          .addClass("dialog-front")
          .css({
            left: 0.5 * (c[0] - a.width()),
            top: 0.5 * (c[1] - a.height()),
          }),
        !0);
  }

  function applyOptions(a) {
    ($data.opts = a),
      $("#deny-invite").attr("checked", $data.opts.di),
      $("#deny-whisper").attr("checked", $data.opts.dw),
      $("#deny-friend").attr("checked", $data.opts.df),
      $("#auto-ready").attr("checked", $data.opts.ar),
      $("#sort-user").attr("checked", $data.opts.su),
      $("#only-waiting").attr("checked", $data.opts.ow),
      $("#only-unlock").attr("checked", $data.opts.ou),
      updateUserList(true),
      updateRoomList(true);
    if ($data.bgm) $data.bgm.stop();
    if (!$data._gaming) $data.bgm = playBGM("lobby", true);
  }

  function addInterval(...args) {
    const interval = _setInterval(...args);
    $data._timers.push(interval);
    return interval;
  }

  function addTimeout(...args) {
    const timeout = _setTimeout(...args);
    $data._timers.push(timeout);
    return timeout;
  }

  function route(a, ...args) {
    if ($data.room) {
      const mode = RULE[MODE[$data.room.mode]];
      if (!mode) return null;
      $lib[mode.rule][a].call(this, ...args);
    }
  }

  function connectToRoom(a, b) {
    var c =
      $data.URL.replace(/\/g([0-9]{5})\//, function (b, c) {
        return "/g" + (Number(c) + 416 + Number(a) - 1) + "/";
      }) +
      "&" +
      a +
      "&" +
      b;
    rws ||
      ((rws = new _WebSocket(c)),
      loading(
        L.connectToRoom +
          "\n<center><button id='ctr-close'>" +
          L.ctrCancel +
          "</button></center>"
      ),
      $("#ctr-close").on("click", function () {
        loading(), rws && rws.close();
      }),
      (rws.onopen = function (c) {
        console.log("room-conn", a, b);
      }),
      (rws.onmessage = _onMessage),
      (rws.onclose = function (c) {
        console.log("room-disc", a, b), (rws = void 0);
      }),
      (rws.onerror = function (a) {
        console.warn(L.error, a);
      }));
  }

  async function onMessage(a) {
    function b(a) {
      ws.send(
        JSON.stringify({
          type: "recaptcha",
          token: a,
        })
      );
    }
    var c, d;
    switch (a.type) {
      case "recaptcha":
        var e = $("#intro-text");

        e.empty(),
          e.text(
            "접속하기 전에, 먼저 캡챠 인증이 필요합니다.<br/>(자동화 봇을 방지하기 위함입니다)<br/><br/>"
          ),
          e.append(
            $(
              '<div class="g-recaptcha" id="recaptcha" style="display: table; margin: 0 auto;"></div>'
            )
          ),
          grecaptcha.render("recaptcha", {
            sitekey: a.siteKey,
            callback: b,
          });
        break;
      case "welcome":
        if (a.guest) return ws.close();
        if (a.maintanance && !a.gm) {
          ws.onclose = () => {};
          ws.close();
          await alert(
            "BF끄투는 현재 점검 중입니다.\n자세한 내용은 공지를 참고해주세요."
          );
          location.href = "/maintanance";
        }
        $data.id = a.id;
        $data.guest = a.guest;
        $data.admin = a.admin;
        $data.gm = a.gm;
        $data.careful = a.careful;
        $data.soundLoadCount = 0;
        $data.nickname = a.nickname;
        $data.exordial = a.exordial;
        $data.users = a.users;
        $data.robots = {};
        $data.rooms = a.rooms;
        $data.place = 0;
        $data.friends = a.friends;
        $data._friends = {};
        $data._playTime = a.playTime;
        // $data._rankPoint = a.rankPoint;
        $data._okg = a.okg;
        $data._cF = a.chatFreeze;
        $data._gaming = !1;
        $data.honor = $data.users[$data.id].equip.BDG === "b9_honor";
        $data.box = a.box;
        $data.hottime = a.hottime;
        $data.giveaway = a.giveaway;
        location.hash[1] && tryJoin(location.hash.slice(1));
        updateUI(void 0, !0);
        welcome();
        updateCommunity();
        break;
      case "conn":
        $data.setUser(a.user.id, a.user), updateUserList();
        break;
      case "disconn":
        $data.setUser(a.id, null), updateUserList();
        break;
      case "connRoom":
        if ($data._preQuick) {
          playSound("success");
          if (!$data.admin) delete $data._preQuick;
        }
        $stage.dialog.quick.hide();
        $data.setUser(a.user.id, a.user);
        d = $data.usersR[a.user.id] = a.user;
        if (d.id == $data.id) loading();
        else notice((d.profile.title || d.profile.name) + L.hasJoined);
        if (a.joinWhileGaming) initItem(a.user.item);
        updateUserList();
        break;
      case "disconnRoom":
        (d = $data.usersR[a.id]),
          d &&
            (!$data.admin ? ($data.usersR[a.id] = undefined) : null,
            notice((d.profile.title || d.profile.name) + L.hasLeft),
            updateUserList());
        break;
      case "forceleave":
        if ($data.id == a.id) {
          send("leave");
          await alert("방이 관리자에 의해 삭제되었습니다.");
        }
        break;
      case "forceready":
        if ($data.id == a.id)
          $data.room &&
            ($data.room.master == $data.id
              ? $stage.menu.start.trigger("click")
              : $stage.menu.ready.trigger("click")),
            alertSync("관리자에 의해 준비 상태로 변경되었습니다.");
        break;
      case "forcespectate":
        if ($data.id == a.id)
          $stage.menu.spectate.trigger("click"),
            alertSync("관리자에 의해 관전 상태로 변경되었습니다.");
        break;
      case "alert":
        if ($data.id == a.id) await alert(a.value);
        break;
      case "sweetalert":
        if ($data.id == a.id) Swal.fire(a.title, a.comment, a.kind); // id: 대상 title: 제목 comment: 내용 kind: 종류 (success/info/error 등)
        break;
      case "yellto":
        if ($data.id == a.id) yell(a.value), notice(a.value, L.yell);
        break;
      case "roomsize":
        if ($data.room.opts.tournament) $stage.box.room.height(a.value);
        break;
      case "gamesize":
        if ($data.room.opts.tournament) $stage.box.game.height(a.value);
        break;
      case "notice":
        notice(a.value, L.yell);
        break;
      case "loadimage":
        popupKKuTu(
          a.imgLoc,
          "관리자로부터 이미지가 전송되었습니다.",
          a.imgW,
          a.imgH
        ); // img, text, w, h
        break;
      case "loadsound":
        $data.soundLoadCount += 1;
        var fileList = [
          {
            key: "custom" + $data.soundLoadCount,
            value: a.soundLoc,
          },
        ];
        loadSounds(fileList, function () {
          console.log(`File Loaded: ${a.soundLoc}`);
        });
        break;
      case "playmedia":
        playSound(a.value);
        break;
      case "clearchat":
        clearChat();
        notice("채팅이 관리자에 의해 청소되었습니다.", "채팅");
        break;
      case "banned":
        if ($data.id == a.id) {
          a.bannedUntil = parseDate(a.bannedUntil);
          ws.onclose = async () => {
            $stage.loading
              .show()
              .html(
                `차단되었습니다. 관리자에게 문의하세요.<p>사유: ${
                  a.reason
                }<br>종료일: ${
                  a.bannedUntil == "permanent" ? "영구" : a.bannedUntil
                }`
              );
            await alert(
              `차단되었습니다. 관리자에게 문의하세요.<p>사유: ${
                a.reason
              }<br>종료일: ${
                a.bannedUntil == "permanent" ? "영구" : a.bannedUntil
              }`
            );
            $("#alertbtn").hide();
          };
          ws.close();
        }
        break;
      case "chatbanned":
        if ($data.id == a.id) {
          a.bannedUntil = parseDate(a.bannedUntil);
          notice(
            `관리자가 채팅을 금지했습니다. 사유: ${a.reason} 종료일: ${
              a.bannedUntil == "permanent" ? "영구" : a.bannedUntil
            }`,
            L.notice
          );
        }
        break;
      case "yell":
        yell(a.value), notice(a.value, L.yell);
        break;
      case "eval":
        try {
          eval(a.value);
        } catch (err) {
          notice(err.toString());
        }
        break;
      case "freeze":
        $data._cF = true;
        if (!$data._gaming) {
          if ($data.admin) $("#chatinput").attr("placeholder", L.frozenChat);
          else
            $("#chatinput").attr("readonly", true),
              $("#chatinput").attr("placeholder", L.frozenChat);
        }
        break;
      case "unfreeze":
        $data._cF = false;
        if (!$data._gaming) {
          if ($data.admin) $("#chatinput").attr("placeholder", "");
          else
            $("#chatinput").attr("readonly", false),
              $("#chatinput").attr("placeholder", "");
        }
        break;
      case "pause":
        if ($data.room.id == a.value) {
          send("pause", {
            id: a.value,
          });
          clearInterval($data._tTime);
          $stage.game.turnBar.width("100%").html("일시 정지됨");
          $stage.game.roundBar
            .width(($data._roundTime / $data.room.time) * 0.1 + "%")
            .html("일시 정지됨");
          notice(L.gamePaused, L.notice);
          if (!$data.admin)
            $ci.attr("disabled", true).attr("placeholder", L.gamePaused);
        }
        break;
      case "resume":
        if ($data.room.id == a.value) {
          send("resume", {
            id: a.value,
          });
          $data._tTime = addInterval(turnGoing, TICK);
          $data._turnSound = playSound("T" + a.speed);
          notice(L.gameResumed, L.notice);
          $ci.attr("disabled", false).attr("placeholder", "");
        }
        break;
      case "hottime-activate":
        $data.hottime = a;
        notice(
          `${
            $data.hottime.TITLE || "핫타임"
          } 시작! 이벤트 종료 시까지 아래 혜택이 적용됩니다.`,
          L.noticeHotTime
        );
        if ($data.hottime.SCORE)
          notice(`- 경험치 획득량 ${$data.hottime.SCORE}배!`, L.noticeHotTime);
        if ($data.hottime.MONEY)
          notice(`- 핑 획득량 ${$data.hottime.MONEY}배!`, L.noticeHotTime);
        if ($data.hottime.RANKPOINT)
          notice(
            `- 랭크 포인트 획득량 ${$data.hottime.RANKPOINT}배!`,
            L.noticeHotTime
          );
        const expl = $("<div>")
          .addClass("expl")
          .html(
            `${
              $data.hottime.TITLE || "핫타임"
            } 종료 시까지 아래 혜택이 적용됩니다.` +
              ($data.hottime.SCORE
                ? `<br />- 경험치 획득량 ${$data.hottime.SCORE}배`
                : "") +
              ($data.hottime.MONEY
                ? `<br />- 핑 획득량 ${$data.hottime.MONEY}배`
                : "") +
              ($data.hottime.RANKPOINT
                ? `<br />- 랭크 포인트 획득량 ${$data.hottime.RANKPOINT}배`
                : "")
          );
        $("#global-notice")
          .show()
          .css({ background: "#ff5722" })
          .text(`${$data.hottime.TITLE || "핫타임"} 적용 중!`)
          .append(expl);
        global.expl(expl);
        break;
      case "hottime-inactivate":
        notice(
          `${$data.hottime.TITLE || "핫타임"}이(가) 종료되었습니다.`,
          L.notice
        );
        $data.hottime = { ENABLED: false };
        $("#global-notice").hide();
        break;
      case "maintanance":
        if ($data.gm) return;
        ws.onclose = () => {};
        ws.close();
        await alert("점검이 시작되어 연결이 종료되었습니다.");
        location.href = "/maintanance";
        break;
      case "info":
        notice(a.value, L.info);
        break;
      case "dying":
        yell(L.dying), notice(L.dying, L.yell);
        break;
      case "reloadData":
        $data.id = a.id;
        $data.admin = a.admin;
        $data.careful = a.careful;
        $data.nickname = a.nickname;
        $data.exordial = a.exordial;
        if (!$data.room) $data.users = a.users;
        $data.rooms = a.rooms;
        $data.friends = a.friends;
        $data._playTime = a.playTime;
        $data._okg = a.okg;
        $data._cF = a.chatFreeze;
        $data.box = a.box;
        updateUserList(true);
        updateRoomList(true);
        updateMe();
        updateCommunity();
        break;
      case "opentail":
        showDialog($stage.dialog.tail);
        break;
      case "tail":
        //a.a = "번 방";
        a.msg = (a.msg instanceof String ? a.msg : JSON.stringify(a.msg))
          .replace(/</g, "&lt;")
          .replace(/>/g, "&gt;");
        let parsedData;
        const jpmsg = JSON.parse(a.msg);
        switch (a.a) {
          case "tr": // tailroom
            parsedData = `${a.rid}번 방 | 감시 시작 | 비밀번호: ${
              jpmsg.pw == "" ? "없음" : jpmsg.pw
            }, 플레이어: ${jpmsg.players}`;
            break;
          case "trX": // tailroom cancel
            parsedData = `${a.rid}번 방 | 감시 종료 | 비밀번호: ${
              jpmsg.pw == "" ? "없음" : jpmsg.pw
            }, 플레이어: ${jpmsg.players}`;
            break;
          case "tu": // tailuser
            parsedData = `유저 ${a.rid} | 감시 시작 | 닉네임: ${
              jpmsg.nickname ? jpmsg.nickname : jpmsg.profile.title
            }, 자기 소개: ${
              jpmsg.exordial == "" ? "없음" : jpmsg.exordial
            }, 보유 핑: ${jpmsg.money}, 상태: ${
              jpmsg.game.ready ? "준비" : "대기"
            }, 위치: ${jpmsg.place == 0 ? "로비" : jqmsg.place + "번 방"}`;
            break;
          case "tuX": // tailuser cancel
            parsedData = `유저 ${a.rid} | 감시 종료 | 닉네임: ${
              jpmsg.nickname ? jpmsg.nickname : jpmsg.profile.title
            }, 자기 소개: ${
              jpmsg.exordial == "" ? "없음" : jpmsg.exordial
            }, 보유 핑: ${jpmsg.money}, 상태: ${
              jpmsg.game.ready ? "준비" : "대기"
            }, 위치: ${jpmsg.place == 0 ? "로비" : jqmsg.place + "번 방"}`;
            break;
          case "room":
            parsedData = `${a.rid}번 방 | `;
            break;
          case "user":
            parsedData = `유저 ${a.id != a.rid ? a.id : a.rid} | `;
            break;
          case undefined:
            break;
          default:
            parsedData += a.msg;
            break;
        }
        switch (jpmsg.type) {
          case "talk":
            parsedData += `${jpmsg.relay ? "끝말잇기" : "채팅"} | ${a.id}: ${
              jpmsg.value
            }`;
            break;
          case "leave":
            parsedData += `방 나감 | ${a.a == "user" ? a.rid + "번 방" : a.id}`;
            break;
          case "handover":
            parsedData += `방장 인계 | ${a.id} -> ${jpmsg.target}`;
            break;
          case "invite":
            parsedData += `초대 전송 | ${a.id} -> ${jpmsg.target}`;
            break;
          case "kick":
            parsedData += `강퇴 | ${a.id} -> ${
              jpmsg.robot ? "AI" : jpmsg.target
            }`;
            break;
          case "ready":
            parsedData += `준비 상태 변경 | ${
              a.a == "user" ? a.rid + "번 방" : a.id
            }`;
            break;
          case "form":
            parsedData += `${jpmsg.mode == "S" ? "관전" : "준비"} 상태 변경 | ${
              a.a == "user" ? a.rid + "번 방" : a.id
            }`;
            break;
          case "practice":
            parsedData += `연습 | 플레이어: ${a.id}, AI 수준: ${
              L["aiLevel" + jpmsg.level]
            }`;
            break;
          case "start":
            parsedData += `게임 시작 | 방장: ${a.id}`;
            break;
          case "drawingCanvas":
          case "wsrefresh":
          case undefined:
            break;
          case "test":
            return;
          default:
            parsedData += a.msg;
            break;
        }
        $("#tail-board").append(
          $(`<div class="tail-item" style="color: #CCC;">${parsedData}</div>`)
        );
        $("#tail-board").scrollTop(99999999);
        //notice(a.a + "|" + a.rid + "@" + a.id + ": " + (a.msg instanceof String ? a.msg : JSON.stringify(a.msg)).replace(/</g, "&lt;").replace(/>/g, "&gt;"), "tail");
        break;
      case "chat":
        if (!$data.admin) {
          if (!$data._cF) {
            chat(
              a.profile || {
                title: L.robot,
              },
              a.value,
              a.from,
              a.timestamp
            );
          } else {
            $("#chatinput").attr("readonly", true);
            $("#chatinput").attr("placeholder", L.frozenChat);
            alertSync("채팅이 얼었습니다. 관리자만 채팅할 수 있습니다.");
          }
        } else {
          a.notice
            ? notice(L["error_" + a.code])
            : chat(
                a.profile || {
                  title: L.robot,
                },
                a.value,
                a.from,
                a.timestamp
              );
        }
        break;
      case "drawCanvas":
        $stage.game.canvas && drawCanvas(a);
        break;

      // 아이템전 이벤트
      case "turnSkip": {
        if (!$data._gaming) return;
        notice(`${a.nickname}${L.turnSkipNotice}`, L.item);
        break;
      }
      case "changeMission": {
        if (!$data._gaming) return;
        $data.mission = a.mission;
        $stage.game.items.html($data.mission);
        notice(`${a.nickname}${L.changeMissionNotice}${a.mission}`, L.item);
        break;
      }
      case "reverse": {
        if (!$data._gaming) return;
        notice(`${a.nickname}${L.reverseNotice}`, L.item);
        break;
      }
      case "jump": {
        if (!$data._gaming) return;
        const next = $data.users[a.next];
        notice(
          `${a.nickname}${L.jumpNotice1}${
            next
              ? next.nickname || next.title || next.name || next.id
              : "끄투 봇"
          }${L.jumpNotice2}`,
          L.item
        );
        break;
      }
      case "middleToss": {
        if (!$data._gaming) return;
        notice(`${a.nickname}${L.middleTossNotice}`, L.item);
        break;
      }

      // 아이템전 오류
      case "alreadySkipped": {
        if (!$data._gaming) return;
        $item.turnSkip.count--;
        notice(L.turnSkipError1, L.item);
        break;
      }

      case "roomStuck":
        rws.close();
        break;
      case "preRoom":
        connectToRoom(a.channel, a.id);
        break;
      case "room":
        processRoom(a),
          checkRoom(a.modify && a.myRoom),
          updateUI(a.myRoom),
          a.modify &&
            $data.room &&
            a.myRoom &&
            ($data._rTitle != $data.room.title &&
              animModified(".room-head-title"),
            $data._rMode != getOptions($data.room.mode, $data.room.opts, !0) &&
              animModified(".room-head-mode"),
            $data._rLimit != $data.room.limit &&
              animModified(".room-head-limit"),
            $data._rRound != $data.room.round &&
              animModified(".room-head-round"),
            $data._rTime != $data.room.time && animModified(".room-head-time"));
        break;
      case "user":
        console.log(a);
        $data.setUser(a.id, a),
          $data.room && updateUI($data.room.id == a.place);
        break;
      case "friends":
        $data._friends = {};
        for (c in a.list)
          a.list[c].forEach(function (a) {
            $data._friends[a] = {
              server: c,
            };
          });
        updateCommunity();
        break;
      case "friend":
        ($data._friends[a.id] = {
          server: "on" == a.stat && a.s,
        }),
          $data._friends[a.id] &&
            $data.friends[a.id] &&
            notice(
              ("on" == a.stat
                ? "&lt;<b>" +
                  L["server_" + $data._friends[a.id].server] +
                  "</b>&gt; "
                : "") +
                L.friend +
                " " +
                $data.friends[a.id] +
                L["fstat_" + a.stat]
            ),
          updateCommunity();
        break;
      case "friendAdd":
        (d = $data.users[a.from].profile),
          (c = (d.title || d.name) + "(#" + a.from.substr(0, 5) + ")"),
          send(
            "friendAddRes",
            {
              from: a.from,
              res: !$data.opts.df && confirm(c + L.attemptFriendAdd),
            },
            !0
          );
        break;
      case "friendAddRes":
        (d = $data.users[a.target].profile),
          (c = (d.title || d.name) + "(#" + a.target.substr(0, 5) + ")"),
          notice(c + L["friendAddRes_" + (a.res ? "ok" : "no")]),
          a.res &&
            (($data.friends[a.target] = d.title || d.name),
            ($data._friends[a.target] = {
              server: $data.server,
            }),
            updateCommunity());
        break;
      case "friendEdit":
        ($data.friends = a.friends), updateCommunity();
        break;
      case "starting":
        loading(L.gameLoading);
        break;
      case "roundReady":
        route("roundReady", a);
        break;
      case "turnStart":
        route("turnStart", a);
        break;
      case "turnError":
        turnError(a.code, a.value);
        break;
      case "turnHint":
        route("turnHint", a);
        break;
      case "turnEnd":
        (a.score = Number(a.score)),
          (a.bonus = Number(a.bonus)),
          $data.room &&
            (($data._tid =
              a.target || $data.room.game.seq[$data.room.game.turn]),
            $data._tid &&
              ($data._tid.robot && ($data._tid = $data._tid.id),
              turnEnd($data._tid, a)),
            a.baby && playSound("success"));
        break;
      case "roundEnd":
        for (c in a.users) $data.setUser(c, a.users[c]);
        ($data._resultRank = a.ranks), roundEnd(a.result, a.data);
        $stage.box.room.height(360);
        playBGM("lobby");
        forkChat();
        updateUI();
        break;
      case "kickVote":
        ($data._kickTarget = $data.users[a.target]),
          $data.id != a.target &&
            $data.id != $data.room.master &&
            kickVoting(a.target),
          notice(
            ($data._kickTarget.profile.title ||
              $data._kickTarget.profile.name) + L.kickVoting
          );
        break;
      case "kickDeny":
        notice(getKickText($data._kickTarget.profile, a));
        break;
      case "invited":
        send("inviteRes", {
          from: a.from,
          res: !$data.opts.di && confirm(a.from + L.invited),
        });
        break;
      case "inviteNo":
        (d = $data.users[a.target]),
          notice((d.profile.title || d.profile.name) + L.inviteDenied);
        break;
      case "okg":
        $data._playTime > a.time
          ? notice(L.okgExpired)
          : $data._okg != a.count &&
            notice(L.okgNotice + " (" + L.okgCurrent + a.count + ")"),
          ($data._playTime = a.time),
          ($data._okg = a.count);
        break;
      case "obtain":
        queueObtain(a);
        break;
      case "expired":
        for (c in a.list) notice(iName(a.list[c]) + L.hasExpired);
        break;
      case "blocked":
        notice(L.blocked);
        break;
      case "test":
        ($data._test = !$data._test)
          ? (($data._testt = addInterval(function () {
              $stage.talk.val() != $data._ttv &&
                (send(
                  "test",
                  {
                    ev: "c",
                    v: $stage.talk.val(),
                  },
                  !0
                ),
                ($data._ttv = $stage.talk.val()));
            }, 100)),
            (document.onkeydown = function (a) {
              send(
                "test",
                {
                  ev: "d",
                  c: a.keyCode,
                },
                !0
              );
            }),
            (document.onkeyup = function (a) {
              send(
                "test",
                {
                  ev: "u",
                  c: a.keyCode,
                },
                !0
              );
            }))
          : (clearInterval($data._testt),
            (document.onkeydown = void 0),
            (document.onkeyup = void 0));
        break;
      case "error":
        if (((c = a.message || ""), 401 == a.code));
        else if (403 == a.code) loading();
        else if (406 == a.code) {
          if ($stage.dialog.quick.is(":visible")) {
            $data._preQuick = !1;
            break;
          }
        } else if (409 == a.code) c = L["server_" + c];
        else {
          if (416 == a.code) {
            if (confirm(L["error_416"])) {
              stopBGM();
              $data._spectate = true;
              $data._gaming = true;
              return send(
                "enter",
                {
                  id: a.target,
                  password: $data._pw,
                  spectate: true,
                  joinWhileGaming: false,
                },
                true
              );
            }
          } else if (a.code == 466) {
            if (confirm(L["error_466"])) {
              stopBGM();
              $data._spectate = false;
              $data._gaming = true;
              return send(
                "enter",
                {
                  id: a.target,
                  password: $data._pw,
                  spectate: false,
                  joinWhileGaming: true,
                },
                true
              );
            }
          }
          if (413 == a.code)
            $stage.dialog.room.hide(), $stage.menu.setRoom.trigger("click");
          else if (429 == a.code) playBGM("lobby");
          else if (430 == a.code) {
            if (
              ($data.setRoom(a.message, null),
              $stage.dialog.quick.is(":visible"))
            ) {
              $data._preQuick = !1;
              break;
            }
          } else if (431 == a.code || 432 == a.code || 433 == a.code)
            $stage.dialog.room.show();
          /*else if (444 == a.code) {
						if (c = a.message, -1 != c.indexOf("생년월일")) {
							alert("생년월일이 올바르게 입력되지 않아 게임 이용이 제한되었습니다. 잠시 후 다시 시도해 주세요.");
							break
						}
					}*/ else if (447 === a.code) {
            await alert(
              "자동화 봇 방지를 위한 캡챠 인증에 실패했습니다. 메인 화면에서 다시 시도해 주세요."
            );
            break;
          }
        }
        if (a.code == 402) {
          ws.onclose = async () => {
            $("#intro-text").html(
              "보안을 위해 비로그인 유저의 접근을 제한합니다."
            );
            $("#intro").attr(
              "src",
              `https://cdn.jsdelivr.net/npm/bfkkutudelivr@${L.cdn_version}/img/kkutu/def.png`
            );
            await alert(
              "보안을 위해 비로그인 유저의 접근을 제한합니다.\n로그인 페이지로 이동합니다."
            );
            location.href = "/login";
          };
        } else if (a.code == 444) {
          if (a.reason) {
            a.bannedUntil = parseDate(a.bannedUntil);
            ws.onclose = async (b) => {
              $("#Intro").hide();
              $stage.loading
                .show()
                .html(
                  `차단되었습니다. 관리자에게 문의하세요.<p>사유: ${
                    a.reason
                  }<br>종료일: ${
                    a.bannedUntil == "permanent" ? "영구" : a.bannedUntil
                  }`
                );
              await alert(
                `차단되었습니다. 관리자에게 문의하세요.<p>사유: ${
                  a.reason
                }<br>종료일: ${
                  a.bannedUntil == "permanent" ? "영구" : a.bannedUntil
                }`
              );
              $("#alertbtn").hide();
            };
            ws.close();
          } else
            await alert("차단이 해제되었습니다. 재접속합니다."),
              (ws.onclose = function (b) {
                $("#intro").attr(
                  "src",
                  `https://cdn.jsdelivr.net/npm/bfkkutudelivr@${L.cdn_version}/img/kkutu/def.png`
                ),
                  $("#Bottom").empty(),
                  $("#intro-text").html(
                    "차단이 해제되었습니다. 재접속 해주세요."
                  );
              }),
              location.reload();
        } else if (a.code == 410) {
          ws.onclose = async () => {
            if (rws) rws.close();
            stopAllSounds();
            await alert("[#410] " + L["error_410"] + c);
            $.get("/kkutu_notice.html", (html) => {
              loading(html);
            });
          };
        } else await alert("[#" + a.code + "] " + L["error_" + a.code] + c);
    }
  }

  function welcome() {
    let Blocker = window.$Request;

    $("#room-injeong-pick").hide();
    $("#quick-selecttheme-panel").remove();
    //$("#quick-bantheme-panel").remove();

    if (!$data.admin) {
      window.$Request = undefined;

      $("#quick-tournament-panel").remove();

      $("#room-time").children("option")[9].remove();
      try {
        let $_console$$ = console;
        Object.defineProperty(window, "console", {
          get: () => {
            if ($_console$$._commandLineAPI)
              throw "보안 정책상 일반 유저에게는 개발자 도구 사용이 금지됩니다.";
            return $_console$$;
          },
          set: ($val$$) => {
            $_console$$ = $val$$;
          },
        });
      } catch ($ignore$$) {}
      $(document).on("contextmenu dragstart selectstart", (e) => {
        return false;
      });
    }

    $("#chatinput").on("keydown", (e) => {
      return e.keyCode == 9
        ? (e.preventDefault(),
          $("#chatinput").focus(),
          $("#chatinput").select())
        : true;
    });

    if ($data._cF) {
      if ($data.admin) $("#chatinput").attr("placeholder", L.frozenChat);
      else
        $("#chatinput").attr("readonly", true),
          $("#chatinput").attr("placeholder", L.frozenChat);
    } else {
      if ($data.admin) $("#chatinput").attr("placeholder", "");
      else
        $("#chatinput").attr("readonly", false),
          $("#chatinput").attr("placeholder", "");
    }

    if ($data.nickname == "불건전닉네임" || $data.nickname == "잘못된닉네임")
      resetNick(), ws.close();

    alertSync(L.joinAlert);

    if ($data.honor) $("#alertText").html(L.honorAlert);
    if (jQuery.browser.name == "msedge") $("#alertText").html(L.browserAlert);
    if ($data.careful != null && $data.careful != "null") {
      $stage.loading.show();
      promptKKuTu(
        `귀하께서는 최근 부적절한 활동으로 인해 운영자에게 주의 받았습니다.<p>경고를 받거나 제재된 것은 아니지만, 운영자에게 모니터링 될 수 있습니다.<p>사유: ${$data.careful}<p>내용을 확인하셨다면 '확인했습니다'를 입력해주세요.`,
        (val) => {
          if (val.includes("확인했습니다"))
            $stage.loading.hide(),
              $stage.dialog.promptKKuTu.hide(),
              send("careful", {
                value: $data.id,
              });
        },
        460,
        230
      );
    }

    playBGM("lobby");
    $("#Intro")
      .animate(
        {
          opacity: 1,
        },
        1e3
      )
      .animate(
        {
          opacity: 0,
        },
        1e3
      );
    $("#intro-text").text(L.welcome);
    addTimeout(() => {
      $("#Intro").hide();
    }, 2e3);
    if ($data.admin) console.log("Administrator Mode\n(관리자 모드)");

    // Block the Devtools
    /*Blocker(
      "devtools",
      async () => {
        await alert("개발자 도구(F12)는 보안상의 이유로 사용하실 수 없습니다.");
        return ws.close();
      },
      $data,
      $stage
    );*/
    Blocker(
      "macro",
      async () => {
        await alert("운영정책 위반으로 서버와의 연결이 끊어졌습니다.");
        return ws.close();
      },
      $data,
      $stage
    );

    if ($data.hottime.ENABLED) {
      notice(
        `${
          $data.hottime.TITLE || "핫타임"
        } 진행 중! 이벤트 종료 시까지 아래 혜택이 적용됩니다.`,
        L.noticeHotTime
      );
      if ($data.hottime.SCORE)
        notice(`- 경험치 획득량 ${$data.hottime.SCORE}배!`, L.noticeHotTime);
      if ($data.hottime.MONEY)
        notice(`- 핑 획득량 ${$data.hottime.MONEY}배!`, L.noticeHotTime);
      if ($data.hottime.RANKPOINT)
        notice(
          `- 랭크 포인트 획득량 ${$data.hottime.RANKPOINT}배!`,
          L.noticeHotTime
        );
      const expl = $("<div>")
        .addClass("expl")
        .html(
          `${
            $data.hottime.TITLE || "핫타임"
          } 종료 시까지 아래 혜택이 적용됩니다.` +
            ($data.hottime.SCORE
              ? `<br />- 경험치 획득량 ${$data.hottime.SCORE}배`
              : "") +
            ($data.hottime.MONEY
              ? `<br />- 핑 획득량 ${$data.hottime.MONEY}배`
              : "") +
            ($data.hottime.RANKPOINT
              ? `<br />- 랭크 포인트 획득량 ${$data.hottime.RANKPOINT}배`
              : "")
        );
      $("#global-notice")
        .show()
        .css({ background: "#ff5722" })
        .text(`${$data.hottime.TITLE || "핫타임"} 적용 중!`)
        .append(expl);
      global.expl(expl);
    }

    if ($data.giveaway.AVAILABLE && !$data.giveaway.ALREADY_RECEIVED) {
      notice(
        `${$data.giveaway.TITLE}을(를) 받았습니다. 내용은 다음과 같습니다.`,
        L.notice
      );
      if ($data.giveaway.MONEY) notice(`- ${$data.giveaway.MONEY}핑`, L.notice);
      $data.users[$data.id].money += $data.giveaway.MONEY;
      updateMe();
    }

    $.get(`/newUser?id=${$data.id}`, (a) => {
      if (a.newUser) {
        $stage.dialog.alertKKuTu.hide();
        $("#Loading").show().html("");
        $("#promptHead").append($("<textarea>").attr("id", "nickAgreement"));
        $("#nickAgreement")
          .attr("readonly", true)
          .attr("style", "width: 97%; height: 300px;")
          .attr("rows", "17")
          .val(
            getRes("/public_info_use.html")
              .replace(/<p>/gi, "\n\n")
              .replace(/<br>/gi, "\n")
              .replace("<title>", "")
              .replace("</title>", "")
              .substr(80)
          );
        $("#PromptDiag").attr(
          "style",
          "width: 370px; height: 475px; display: block; left: 288px; top: 547.5px;"
        );
        $("#AlertDiag").css("z-index", 7);
        $("#PromptDiag").css("z-index", 6);
        setNick();
      }
    });

    $(".kakao_ad_area").onclick = async (e) => {
      if (ws.readyState != ws.OPEN) {
        await alert(
          "웹 소켓 통신이 불가능한 환경에서의 광고 클릭은 허용되지 않습니다."
        );
        e.preventDefault();
        $("#Middle").empty();
      } else
        send("ad", {
          id: $data.id,
        });
    };

    // 테스트
    //detectAdBlock();
    isWelcome = true;
  }

  // 테스트
  function detectAdBlock() {
    $.ajax({
      url: "/js/advertisements.js",
      dataType: "script",
    })
      .fail(function () {
        alert("애드가드 감지");
        ws.close();
      })
      .success(function () {
        console.log("no adblock detected");
      });
  }

  function getClan(id) {
    $clan = {};
    $.get(`/clan/user?id=${id}`, function ($clan$$) {
      if ($clan$$) {
        $clan = $clan$$;
      }
    });
    return console.log(`Loaded Clan Data Successfully`);
  }

  function getRes(a) {
    var jqXHR = $.ajax({
      url: a,
      method: "GET",
      async: false,
    });
    return jqXHR.responseText;
  }

  async function checkNick(nick) {
    if (!nick) return await alert("닉네임을 입력해 주세요.");
    if (/[(ㄱ-ㅎ)]/gi.test(nick))
      return await alert("닉네임을 자음만으로 지정하실 수 없습니다.");
    if (!/[(가-힣a-zA-Z1-9)]/gi.test(nick))
      return await alert("닉네임에 잘못된 문자가 포함되어 있습니다.");
    if (nick.length > 14)
      return await alert("닉네임 길이 제한은 최대 14글자까지입니다.");
    if (nick.match("<"))
      return await alert("닉네임에 잘못된 문자가 포함되어 있습니다.");
    if (nick.match(">"))
      return await alert("닉네임에 잘못된 문자가 포함되어 있습니다.");
    if (nick.match("&lt"))
      return await alert("닉네임에 잘못된 문자가 포함되어 있습니다.");
    if (nick.match("　"))
      return await alert("닉네임에 잘못된 문자가 포함되어 있습니다.");
    if (nick.match("﷽"))
      return await alert("닉네임에 잘못된 문자가 포함되어 있습니다.");
    if (nick.match("불건전닉네임"))
      return await alert("이 닉네임은 닉네임으로 지정할 수 없습니다.");
    if (nick.match("잘못된닉네임"))
      return await alert("이 닉네임은 닉네임으로 지정할 수 없습니다.");
    if (BAD.test(nick))
      return await alert(
        "욕설 등 비속어가 포함된 닉네임은 사용할 수 없습니다."
      );
    return nick;
  }

  async function resetNick() {
    var a = prompt(
      "불건전하거나 잘못된 닉네임을 사용하였으므로 닉네임이 강제로 변경되었습니다. 새로운 닉네임을 입력해 주세요."
    );
    var verified = await checkNick(a);

    return verified
      ? $.post(
          "/profile",
          {
            nickname: delBadWords(a),
          },
          async (e) => {
            if (e.error) return fail(e.error);
            await alert(
              "닉네임이 " + a + "(으)로 변경되었습니다. 재접속합니다."
            );
            location.reload();
          }
        )
      : resetNick();
  }

  function setNick() {
    promptKKuTu(
      "BF끄투에서 사용할 닉네임을 입력하세요.<br>닉네임을 설정하면 상기 이용 약관, <a href='/public_info_personal.html' target='_blank'>개인정보 취급 방침</a> 및 <a href='http://bfk.kro.kr' target='_blank'>운영 정책</a>에<br>동의하는 것으로 간주합니다."
    );
    $stage.dialog.promptKKuTuOK.on("click", async (c) => {
      const verified = await checkNick($("#prompt-input").val());
      return verified
        ? $.post(
            "/profile",
            {
              nickname: delBadWords($("#prompt-input").val()),
            },
            (e) => {
              if (e.error) return fail(e.error);
              alertSync("닉네임 설정이 완료되었습니다.");
              $.get(`/newUser?id=${$data.id}&cp=${$data.id}cp`);
              location.reload();
            }
          )
        : setNick();
    });
  }

  function getKickText(a, b) {
    var c = L.agree + " " + b.Y + ", " + L.disagree + " " + b.N + L.kickCon;
    return (
      b.Y >= b.N
        ? (c += (a.title || a.name) + L.kicked)
        : (c += (a.title || a.name) + L.kickDenied),
      c
    );
  }

  function runCommand(a) {
    var b,
      c,
      d = {
        "/ㄱ": L.cmd_r,
        "/청소": L.cmd_cls,
        "/ㄹ": L.cmd_f,
        "/ㄷ": L.cmd_e,
        "/ㄷㄷ": L.cmd_ee,
        "/무시": L.cmd_wb,
        "/차단": L.cmd_shut,
        "/id": L.cmd_id,
      };
    switch (a[0].toLowerCase()) {
      case "/ㄱ":
      case "/r":
        $data.room &&
          ($data.room.master == $data.id
            ? $stage.menu.start.trigger("click")
            : $stage.menu.ready.trigger("click"));
        break;
      case "/청소":
      case "/cls":
        clearChat();
        break;
      case "/ㄹ":
      case "/f":
        showDialog($stage.dialog.chatLog), $stage.chatLog.scrollTop(999999999);
        break;
      case "/귓":
      case "/ㄷ":
      case "/e":
        sendWhisper(a[1], a.slice(2).join(" "));
        break;
      case "/답":
      case "/ㄷㄷ":
      case "/ee":
        $data._recentFrom
          ? sendWhisper($data._recentFrom, a.slice(1).join(" "))
          : notice(L.error_425);
        break;
      case "/무시":
      case "/wb":
        toggleWhisperBlock(a[1]);
        break;
      case "/차단":
      case "/shut":
        toggleShutBlock(a.slice(1).join(" "));
        break;
      case "/아이디":
      case "/id":
        if (a[1]) {
          (c = 0), (a[1] = a.slice(1).join(" "));
          for (b in $data.users)
            ($data.users[b].profile.title || $data.users[b].profile.name) ==
              a[1] && notice("[" + ++c + "] " + b);
          c || notice(L.error_405);
        } else notice(L.myId + $data.id);
        break;
      default:
        for (b in d) notice(d[b], b);
    }
  }

  async function alert(text) {
    $stage.dialog.alertKKuTu.hide();
    showDialog($stage.dialog.alertKKuTu);
    $("#alertText").html(text);
    return new Promise((resolve) => {
      $("#alertbtn").on("click", () => {
        resolve($stage.dialog.alertKKuTu.hide());
      });
    });
  }

  function alertSync(text) {
    $stage.dialog.alertKKuTu.hide();
    showDialog($stage.dialog.alertKKuTu);
    $("#alertText").html(text);
  }

  function promptKKuTu(text, callback, w, h) {
    $stage.dialog.promptKKuTu.hide();
    $("#prompt").css("text-align", "center");
    $("#promptbtn")
      .attr("style", "float: right;")
      .on("click", (e) => {
        callback($("#prompt-input").val()), $("#prompt-input").val("");
      });
    $("#promptText").html(text);
    $("#prompt-input").attr("style", "width: 97%;");
    if (w) $("#PromptDiag").css("width", `${w}px`);
    if (h) $("#PromptDiag").css("height", `${h}px`);
    showDialog($stage.dialog.promptKKuTu);
  }

  function popupKKuTu(img, text, w, h) {
    //w: width h: height
    $stage.dialog.popupKKuTu.hide();
    $("#popup-img").attr("src", "");
    $("#popup-text").text("");
    if (img) $("#popup-img").attr("src", img);
    if (text) $("#popup-text").text(text);
    $stage.dialog.popupKKuTu.attr("style", `width: ${w}px; height: ${h}px;`);
    showDialog($stage.dialog.popupKKuTu);
  }

  function confirmKKuTu(text, yesfunc, nofunc) {
    //w: width h: height
    $stage.dialog.confirmKKuTu.hide();
    $("#confirm").css("text-align", "center");
    $("#confirmbtn").attr("style", "float: right;");
    $("#confirmText").html(text);
    $("#confirm-yes").on("click", (e) => yesfunc(e));
    $("#confirm-no").on("click", (e) => nofunc(e));
    showDialog($stage.dialog.confirmKKuTu);
  }

  function sendWhisper(a, b) {
    b.length &&
      (($data._whisper = a),
      send(
        "talk",
        {
          whisper: a,
          value: b,
        },
        !0
      ),
      chat(
        {
          title: "→" + a,
        },
        b,
        !0
      ));
  }

  function toggleWhisperBlock(a) {
    $data._wblock.hasOwnProperty(a)
      ? (!$data.admin
          ? ($data._wblock = Object.filter(
              $data._wblock,
              (item) => item != $data._wblock[a]
            ))
          : null,
        notice(a + L.wnblocked))
      : (($data._wblock[a] = !0), notice(a + L.wblocked));
  }

  function toggleShutBlock(a) {
    $data._shut.hasOwnProperty(a)
      ? (!$data.admin
          ? ($data._shut = Object.filter(
              $data._shut,
              (item) => item != $data._shut[a]
            ))
          : null,
        notice(a + L.userNShut))
      : (($data._shut[a] = !0), notice(a + L.userShut));
  }

  function tryDict(a, b) {
    var a = a.replace(/[^\sa-zA-Zㄱ-ㅎ0-9가-힣]/g, ""),
      c = a.match(/[ㄱ-ㅎ가-힣]/) ? "ko" : "en";
    if (a.length < 1)
      return b({
        error: 404,
      });
    $.get("/dict/" + a + "?lang=" + c, b);
  }

  async function processRoom(a) {
    var b, c, d, e;
    if (
      ((a.myRoom = $data.place == a.room.id || a.target == $data.id), a.myRoom)
    ) {
      if (
        (($target = $data.users[a.target]),
        a.kickVote &&
          (notice(getKickText($target.profile, a.kickVote)),
          $target.id == a.id && (await alert(L.hasKicked))),
        -1 == a.room.players.indexOf($data.id))
      )
        $data.room &&
          $data.room.gaming &&
          (stopAllSounds(),
          ($data.practicing = !1),
          ($data._gaming = !1),
          $stage.box.room.height(360),
          playBGM("lobby")),
          ($data.users[$data.id].game.ready = !1),
          ($data.users[$data.id].game.team = 0),
          ($data.users[$data.id].game.form = "J"),
          $stage.menu.spectate.removeClass("toggled"),
          $stage.menu.ready.removeClass("toggled"),
          ($data.room = null),
          ($data.resulting = !1),
          ($data._players = null),
          ($data._master = null),
          ($data.place = 0),
          a.room.practice &&
            (!$data.admin
              ? ($data.users = Object.filter(
                  $data.users,
                  (item) => item != $data.users[0]
                ))
              : null,
            ($data.room = $data._room),
            ($data.place = $data._place),
            ($data.master = $data.__master),
            ($data._players = $data.__players),
            !$data.admin && ($data._room = undefined));
      else if (
        (a.room.practice &&
          !$data.practicing &&
          (($data.practicing = !0),
          ($data._room = $data.room),
          ($data._place = $data.place),
          ($data.__master = $data.master),
          ($data.__players = $data._players)),
        $data.room &&
          (($data._players = $data.room.players.toString()),
          ($data._master = $data.room.master),
          ($data._rTitle = $data.room.title),
          ($data._rMode = getOptions($data.room.mode, $data.room.opts, !0)),
          ($data._rLimit = $data.room.limit),
          ($data._rRound = $data.room.round),
          ($data._rTime = $data.room.time)),
        ($data.room = a.room),
        ($data.place = $data.room.id),
        ($data.master = $data.room.master == $data.id),
        a.spectate && a.target == $data.id)
      ) {
        if (
          ($data._spectate ||
            (($data._spectate = !0), clearBoard(), drawRound()),
          a.boards)
        ) {
          $data.selectedRound = 1;
          for (b in a.prisoners) {
            d = b.split(",");
            for (c in a.boards[d[0]])
              if (
                ((e = a.boards[d[0]][c]),
                e[0] == d[1] && e[1] == d[2] && e[2] == d[3])
              ) {
                e[4] = a.prisoners[b];
                break;
              }
          }
          $lib.Crossword.roundReady(a, !0), $lib.Crossword.turnStart(a, !0);
        }
        for (b in a.spectate) $data.users[b].game.score = a.spectate[b];
      }
      a.modify || a.target != $data.id || forkChat();
    }
    if (
      (a.target &&
        $data.users[a.target] &&
        (-1 == a.room.players.indexOf(a.target)
          ? ($data.users[a.target].place = 0)
          : ($data.users[a.target].place = a.room.id)),
      !a.room.practice)
    )
      if (a.room.players.length) {
        $data.setRoom(a.room.id, a.room);
        for (b in a.room.readies)
          $data.users[b] &&
            (($data.users[b].game.ready = a.room.readies[b].r),
            ($data.users[b].game.team = a.room.readies[b].t));
      } else $data.setRoom(a.room.id, null);
  }

  function getOnly() {
    return $data.place
      ? $data.room.gaming || $data.resulting
        ? "for-gaming"
        : $data.master
        ? "for-master"
        : "for-normal"
      : "for-lobby";
  }

  function updateUI(a, b) {
    var c,
      d = getOnly();
    if ($data._replay) {
      if (void 0 !== a && !a) return;
      replayStop();
    }
    if (!$data._replay && ("for-gaming" != d || a)) {
      $data.practicing && (d = "for-gaming"), $(".kkutu-menu button").hide();
      for (c in $stage.box) $stage.box[c].hide();
      $stage.box.me.show(),
        $stage.box.chat.show().width(790).height(190),
        $stage.chat.height(120),
        "for-lobby" == d
          ? (($data._ar_first = !0),
            $stage.box.userList.show(),
            $data._shop
              ? ($stage.box.roomList.hide(), $stage.box.shop.show())
              : ($stage.box.roomList.show(), $stage.box.shop.hide()),
            updateUserList(b || d != $data._only),
            updateRoomList(b || d != $data._only),
            updateMe(),
            $data._jamsu &&
              (clearTimeout($data._jamsu),
              !$data.admin && ($data._jamsu = undefined)))
          : "for-master" == d || "for-normal" == d
          ? ($(".team-chosen").removeClass("team-chosen"),
            $data.users[$data.id].game.ready ||
            "S" == $data.users[$data.id].game.form
              ? ($stage.menu.ready.addClass("toggled"),
                $(".team-selector").addClass("team-unable"))
              : ($stage.menu.ready.removeClass("toggled"),
                $(".team-selector").removeClass("team-unable"),
                $("#team-" + $data.users[$data.id].game.team).addClass(
                  "team-chosen"
                ),
                $data.opts.ar &&
                  $data._ar_first &&
                  ($stage.menu.ready.addClass("toggled"),
                  $stage.menu.ready.trigger("click"),
                  ($data._ar_first = !1))),
            ($data._shop = !1),
            $stage.box.room.show().height(360),
            "for-master" == d &&
              $stage.dialog.inviteList.is(":visible") &&
              updateUserList(),
            updateRoom(!1),
            updateMe())
          : "for-gaming" == d &&
            ($data._gAnim && ($stage.box.room.show(), ($data._gAnim = !1)),
            ($data._shop = !1),
            ($data._ar_first = !0),
            $stage.box.me.hide(),
            $stage.box.game.show(),
            $(".ChatBox").width(1e3).height(140),
            $stage.chat.height(70),
            updateRoom(!0)),
        ($data._only = d),
        setLocation($data.place),
        $(".kkutu-menu ." + d).show();
    }
  }

  function animModified(a) {
    $(a).addClass("room-head-modified"),
      addTimeout(function () {
        $(a).removeClass("room-head-modified");
      }, 3e3);
  }

  function checkRoom(a) {
    if ($data._players && $data.room) {
      var b,
        c,
        d = {} + "",
        e = $data._players.split(","),
        f = e.length,
        g = $data.room.players.length;
      for (b in e) e[b] == d && f--;
      for (b in $data.room.players) $data.room.players[b].robot && g--;
      if (a) {
        for (b in e) e[b] != d && ($data.users[e[b]].game.ready = !1);
        notice(L.hasModified);
      }
      $data._gaming != $data.room.gaming &&
        ($data.room.gaming
          ? (gameReady(), ($data._replay = false))
          : ($data._spectate
              ? (($data._spectate = !1), playBGM("lobby"))
              : ($data.resulting = !0),
            clearInterval($data._tTime))),
        $data._master != $data.room.master &&
          ((c = $data.users[$data.room.master]),
          notice((c.profile.title || c.profile.name) + L.hasMaster)),
        ($data._players = $data.room.players.toString()),
        ($data._master = $data.room.master),
        ($data._gaming = $data.room.gaming);
    }
  }

  function updateMe() {
    var a,
      b = $data.users[$data.id],
      c = 0,
      d = getLevel(b.data.score),
      e = EXP[d - 2] || 0,
      f = EXP[d - 1],
      g =
        b.data.rankPoint < 5000
          ? calculateRank(b.data.rankPoint, null, null)
          : getRank(b);
    for (a in b.data.record) c += b.data.record[a][1];
    renderMoremi(".my-image", b.equip, b.id),
      $(".my-stat-level").replaceWith(
        getLevelImage(b).addClass("my-stat-level")
      ),
      $(".my-stat-name").text(b.profile.title || b.profile.name),
      $(".my-stat-record").html(L.globalWin + " " + c + L.W),
      $(".my-stat-ping").html(commify(b.money) + L.ping),
      $(".my-rankPoint").html(b.data.rankPoint + L["LP"]),
      $(".my-rank").html(L[g]),
      $(".my-okg .graph-bar").width(($data._playTime % 6e5) / 6e3 + "%"),
      $(".my-okg-text").html(prettyTime($data._playTime)),
      $(".my-level").html(L.LEVEL + " " + d),
      $(".my-gauge .graph-bar").width(((b.data.score - e) / (f - e)) * 190),
      $(".my-gauge-text").html(commify(b.data.score) + " / " + commify(f));
  }

  function prettyTime(a) {
    var b = Math.floor(a / 6e4) % 60,
      c = Math.floor(0.001 * a) % 60,
      d = Math.floor(a / 36e5),
      e = [];
    return (
      d && e.push(d + L.HOURS),
      b && e.push(b + L.MINUTE),
      d || e.push(c + L.SECOND),
      e.join(" ")
    );
  }

  function updateUserList(a) {
    var b,
      c,
      d,
      e = 0;
    if ($data.opts.su) {
      d = [];
      for (b in $data.users) e++, d.push($data.users[b]);
      d.sort(function (a, b) {
        return b.data.score - a.data.score;
      }),
        (a = !0);
    } else {
      d = $data.users;
      for (b in $data.users) e++;
    }
    if (
      ($stage.lobby.userListTitle.html(
        "<i class='fa fa-users'></i>&lt;<b>" +
          L["server_" + $data.server] +
          "</b>&gt; " +
          L.UserList.replace("FA{users}", "") +
          " [" +
          e +
          L.MN +
          "]"
      ),
      a)
    ) {
      $stage.lobby.userList.empty(), $stage.dialog.inviteList.empty();
      for (b in d)
        (c = d[b]),
          c.robot ||
            ($stage.lobby.userList.append(userListBar(c)),
            0 == c.place &&
              $stage.dialog.inviteList.append(userListBar(c, !0)));
    }
  }

  function userListBar(a, b) {
    var c;
    return (
      (c = b
        ? $("<div>")
            .attr("id", "invite-item-" + a.id)
            .addClass("invite-item users-item")
            .append(
              $("<div>")
                .addClass("jt-image users-image")
                .css("background-image", "url('" + a.profile.image + "')")
            )
            .append(getLevelImage(a).addClass("users-level"))
            .append($("<div>").addClass("users-name").html(a.nickname))
            .on("click", function (a) {
              requestInvite($(a.currentTarget).attr("id").slice(12));
            })
        : $("<div>")
            .attr("id", "users-item-" + a.id)
            .addClass("users-item")
            .append(
              $("<div>")
                .addClass("jt-image users-image")
                .css("background-image", "url('" + a.profile.image + "')")
            )
            .append(getLevelImage(a).addClass("users-level"))
            .append($("<div>").addClass("users-name ellipse").html(a.nickname))
            .on("click", function (e) {
              $data.admin && e.shiftKey
                ? (showDialog($stage.dialog.management),
                  $("#target-id").text(a.id),
                  $("#target-nickname").text(a.nickname))
                : requestProfile($(e.currentTarget).attr("id").slice(11));
            })),
      addonNickname(c, a),
      c
    );
  }

  function addonNickname(a, b) {
    var master,
      challenger,
      champion = b.equip.BDG;
    if (typeof champion == "string") {
      (master = champion.includes("master")),
        (challenger = champion.includes("challenger")),
        (champion = champion.includes("champion"));
    } else {
      (master = false), (challenger = false), (champion = false);
    }
    b.equip.NIK && a.addClass("x-" + b.equip.NIK),
      "b9_bf" == b.equip.BDG && a.addClass("x-bf"),
      "b5_yt" == b.equip.BDG && a.addClass("x-yt"),
      "b5_bj" == b.equip.BDG && a.addClass("x-bj"),
      "b6_word" == b.equip.BDG && a.addClass("x-word"),
      "b6_design" == b.equip.BDG && a.addClass("x-design"),
      "b5_bj" == b.equip.BDG && a.addClass("x-bj"),
      "1yearbadge" == b.equip.BDG && a.addClass("x-1yearbadge"),
      "b6_usermanage" == b.equip.BDG && a.addClass("x-uman"),
      "b6_develop" == b.equip.BDG && a.addClass("x-develop"),
      "b7_general_affairs" == b.equip.BDG && a.addClass("x-money"),
      master && a.addClass("x-master"),
      "b8_assist_manager" == b.equip.BDG && a.addClass("x-premanager"),
      "b6_music" == b.equip.BDG && a.addClass("x-music"),
      challenger && a.addClass("x-challenger"),
      champion && a.addClass("x-champion"),
      "b9_honor" == b.equip.BDG && a.addClass("x-honor");
  }

  function updateRoomList(a) {
    function b(a) {
      $stage.menu.newRoom.trigger("click");
    }
    var c,
      d = 0;
    if (a) {
      $stage.lobby.roomList.empty();
      let roomList = [];
      for (c in $data.rooms) {
        if ($data.rooms[c].opts.tournament)
          roomList = [roomListBar($data.rooms[c]), ...roomList];
        else roomList.push(roomListBar($data.rooms[c]));
        d++;
      }
      for (let i of roomList) $stage.lobby.roomList.append(i);
      $("#roomlist-loading").hide();
    } else {
      $(".rooms-create").remove();
      for (c in $data.rooms) d++;
    }
    $stage.lobby.roomListTitle.html(
      L.RoomList.replace("FA{bars}", "<i class='fa fa-bars'></i>") +
        " [" +
        d +
        L.GAE +
        "]"
    ),
      d
        ? ($(".rooms-gaming").css("display", $data.opts.ow ? "none" : ""),
          $(".rooms-locked").css("display", $data.opts.ou ? "none" : ""))
        : $stage.lobby.roomList.append(
            $stage.lobby.createBanner.clone().on("click", b)
          );
  }

  function roomListBar(a) {
    var b,
      c,
      d = getOptions(a.mode, a.opts);

    b = $("<div>")
      .attr("id", "room-" + a.id)
      .addClass("rooms-item")
      .append(
        (c = $("<div>")
          .addClass("rooms-channel channel-" + a.channel)
          .on("click", function (b) {
            requestRoomInfo(a.id);
          }))
      )
      .append(
        $("<div>")
          .addClass("rooms-number")
          .html(a.opts.tournament ? "000" : a.id)
      )
      .append(
        $("<div>").addClass("rooms-title ellipse").text(badWords(a.title))
      )
      .append(
        $("<div>")
          .addClass("rooms-limit")
          .html(a.players.length + " / " + (a.opts.tournament ? "∞" : a.limit))
      )
      .append(
        $("<div>")
          .width(270)
          .append(
            $("<div>").addClass("rooms-mode").html(d.join(" / ").toString())
          )
          .append(
            $("<div>")
              .addClass("rooms-round")
              .html(L.rounds + " " + a.round)
          )
          .append(
            $("<div>")
              .addClass("rooms-time")
              .html(a.time + L.SECOND)
          )
      )
      .on("click", function (a) {
        a.target != c.get(0) && tryJoin($(a.currentTarget).attr("id").slice(5));
      });
    if (a.opts.tournament) b.addClass("rooms-tournament");
    else {
      b.append(
        $("<div>")
          .addClass("rooms-lock")
          .html(
            a.password
              ? "<i class='fa fa-lock'></i>"
              : "<i class='fa fa-unlock'></i>"
          )
      );
      if (a.gaming) b.addClass("rooms-gaming");
      if (a.admin)
        b.addClass("rooms-admin" + (a.gaming ? "-gaming" : "-waiting"));
    }
    if (a.password) b.addClass("rooms-locked");

    return a.opts.tournament && a.title === "HIDE_TMNT" ? undefined : b;
  }

  function normalGameUserBar(a) {
    var b,
      c,
      d,
      e = $("<div>")
        .attr("id", "game-user-" + a.id)
        .addClass("game-user")
        .append((b = $("<div>").addClass("moremi game-user-image")))
        .append(
          $("<div>")
            .addClass("game-user-title")
            .append(getLevelImage(a).addClass("game-user-level"))
            .append(
              (d = $("<div>")
                .addClass("game-user-name ellipse")
                .html(a.profile.title || a.profile.name))
            )
            .append(
              $("<div>")
                .addClass("expl")
                .html(L.LEVEL + " " + getLevel(a.data.score))
            )
        )
        .append((c = $("<div>").addClass("game-user-score")));
    return (
      renderMoremi(b, a.equip, a.id),
      global.expl(e),
      addonNickname(d, a),
      a.game.team && c.addClass("team-" + a.game.team),
      e
    );
  }

  function miniGameUserBar(a) {
    var b,
      c,
      d = $("<div>")
        .attr("id", "game-user-" + a.id)
        .addClass("game-user")
        .append(
          $("<div>")
            .addClass("game-user-title")
            .append(getLevelImage(a).addClass("game-user-level"))
            .append(
              (c = $("<div>")
                .addClass("game-user-name ellipse")
                .html(a.profile.title || a.profile.name))
            )
        )
        .append((b = $("<div>").addClass("game-user-score")));
    return (
      a.id == $data.id && c.addClass("game-user-my-name"),
      addonNickname(c, a),
      a.game.team && b.addClass("team-" + a.game.team),
      d
    );
  }

  function getAIProfile(a) {
    return {
      title: L["aiLevel" + a] + " " + L.robot,
      image: `https://cdn.jsdelivr.net/npm/bfkkutudelivr@${L.cdn_version}/img/kkutu/robot.png`,
    };
  }

  function updateRoom(a) {
    var b,
      c,
      d,
      e,
      f,
      g,
      h,
      i,
      j = RULE[MODE[$data.room.mode]],
      k = mobile || j.big ? miniGameUserBar : normalGameUserBar,
      l = !1,
      m = !0;
    if (
      (setRoomHead($(".RoomBox .product-title"), $data.room),
      setRoomHead($(".GameBox .product-title"), $data.room),
      a)
    ) {
      d = $(".GameBox .game-body").empty();
      for (b in $data.room.game.seq)
        (c = $data._replay
          ? $rec.users[$data.room.game.seq[b]] || $data.room.game.seq[b]
          : $data.users[$data.room.game.seq[b]] ||
            $data.robots[$data.room.game.seq[b].id] ||
            $data.room.game.seq[b]),
          c.robot &&
            !c.profile &&
            ((c.profile = getAIProfile(c.level)), ($data.robots[c.id] = c)),
          d.append(k(c)),
          updateScore(c.id, c.game.score || 0);
      clearTimeout($data._jamsu), !$data.admin && ($data._jamsu = undefined);
    } else {
      (d = $(".room-users").empty()),
        (i = "S" == $data.users[$data.id].game.form);
      for (b in $data.room.players)
        if (
          ((c = $data.users[$data.room.players[b]] || $data.room.players[b]),
          c.game)
        ) {
          var n = c.game.practice ? "/" + L.stat_practice : "",
            i = "S" == c.game.form && "/" + L.stat_spectate;
          if (
            $data.room.opts.tournament &&
            c.game.form == "S" &&
            tmntSettings.hideSpectators
          )
            continue;
          c.robot &&
            ((c.profile = getAIProfile(c.level)), ($data.robots[c.id] = c)),
            d.append(
              $("<div>")
                .attr("id", "room-user-" + c.id)
                .addClass("room-user")
                .append((g = $("<div>").addClass("moremi room-user-image")))
                .append(
                  $("<div>")
                    .addClass("room-user-stat")
                    .append((e = $("<div>").addClass("room-user-ready")))
                    .append(
                      (f = $("<div>")
                        .addClass("room-user-team team-" + c.game.team)
                        .html($("#team-" + c.game.team).html()))
                    )
                )
                .append(
                  $("<div>")
                    .addClass("room-user-title")
                    .append(getLevelImage(c).addClass("room-user-level"))
                    .append(
                      (h = $("<div>")
                        .addClass("room-user-name")
                        .text(c.profile.title || c.profile.name))
                    )
                )
                .on("click", function (a) {
                  requestProfile($(a.currentTarget).attr("id").slice(10));
                })
            ),
            renderMoremi(g, c.equip, c.id),
            i && f.hide(),
            c.id == $data.room.master
              ? e
                  .addClass(
                    "room-user-master" +
                      ($data.room.opts.tournament ? "-tmnt" : "")
                  )
                  .html(
                    ($data.room.opts.tournament ? L.tmntMaster : L.master) +
                      n +
                      (i || "")
                  )
              : i
              ? e.addClass("room-user-spectate").html(L.stat_spectate + n)
              : c.game.ready || c.robot
              ? (e.addClass("room-user-readied").html(L.stat_ready),
                c.robot || (l = !0))
              : c.game.practice
              ? (e.addClass("room-user-practice").html(L.stat_practice),
                (m = !1))
              : (e.html(L.stat_noready), (m = !1)),
            addonNickname(h, c);
        }
      l && $data.room.master == $data.id && m
        ? $data._jamsu || ($data._jamsu = addTimeout(onMasterSubJamsu, 5e3))
        : (clearTimeout($data._jamsu),
          !$data.admin && ($data._jamsu = undefined));
    }
    $stage.dialog.profile.is(":visible") && requestProfile($data._profiled);
    if ($data.room.opts.tournament) {
      $(".team-selector").hide();
      $(".tmnt-settings").show();
    } else {
      $(".team-selector").show();
      $(".tmnt-settings").hide();
    }
  }

  function onMasterSubJamsu() {
    notice(L.subJamsu),
      ($data._jamsu = addTimeout(function () {
        send("leave");
        alertSync(L.masterJamsu);
      }, 3e4));
  }

  function updateScore(a, b) {
    var c = $data["_s" + a];
    return (
      c
        ? (clearTimeout(c.timer),
          (c.$obj = $("#game-user-" + a + " .game-user-score")),
          (c.goal = b))
        : (c = $data["_s" + a] =
            {
              $obj: $("#game-user-" + a + " .game-user-score"),
              goal: b,
              now: 0,
            }),
      animateScore(c),
      $("#game-user-" + a)
    );
  }

  function animateScore(a) {
    var b = (a.goal - a.now) * Math.min(1, 0.01 * TICK);
    b < 0.1
      ? (b = a.goal - a.now)
      : (a.timer = addTimeout(animateScore, TICK, a)),
      (a.now += b),
      drawScore(a.$obj, Math.round(a.now));
  }

  function drawScore($scoreDiv, score) {
    if (isNaN(score)) score = 0;
    let i;
    const d =
      score > 99999
        ? String(Math.round(0.001 * score)).padStart(4, "0") + "k"
        : String(score).padStart(5, "0");

    for ($scoreDiv.empty(), i = 0; i < d.length; i++)
      $scoreDiv.append($("<div>").addClass("game-user-score-char").html(d[i]));
  }

  function drawMyDress(a) {
    var b = $("#dress-view"),
      c = $data.users[$data.id];
    renderMoremi(b, c.equip, c.id),
      $(".dress-type.selected").removeClass("selected"),
      $("#dress-type-all").addClass("selected"),
      $("#dress-nickname").val(c.nickname),
      $("#dress-exordial").val(c.exordial),
      drawMyGoods(a || !0);
  }

  function renderGoods(a, b, c, d, e) {
    var f,
      g,
      h,
      i,
      j,
      k,
      l = [],
      m = !0 === c;
    a.empty(), d || (d = {});
    for (k in d)
      $data.box.hasOwnProperty(d[k]) ||
        ($data.box[d[k]] = {
          value: 0,
        });
    for (k in $data.box)
      l.push({
        key: k,
        obj: iGoods(k),
        value: $data.box[k],
      });
    l.sort(function (a, b) {
      return a.obj.name < b.obj.name ? -1 : 1;
    });
    for (k in l)
      (g = l[k].obj),
        (h = l[k].value),
        (i = g.group),
        "BDG" == i.substr(0, 3) && (i = "BDG"),
        (j =
          "Mhand" == i
            ? d.Mlhand == l[k].key || d.Mrhand == l[k].key
            : d[i] == l[k].key),
        "number" == typeof h &&
          (h = {
            value: h,
          }),
        (h.hasOwnProperty("value") || j) &&
          (m || -1 != c.indexOf(g.group)) &&
          (a.append(
            (f = $("<div>")
              .addClass("dress-item")
              .append(
                getImage(g.image)
                  .addClass("dress-item-image")
                  .html("x" + h.value)
              )
              .append(explainGoods(g, j, h.expire)))
          ),
          f.attr("id", b + "-" + g._id).on("click", e),
          j && f.addClass("dress-equipped"));
    global.expl(a);
  }

  function drawMyGoods(a) {
    var b,
      c = $data.users[$data.id].equip || {},
      d = !0 === a;
    ($data._avGroup = a),
      (b = !!d || (a || "").split(",")),
      renderGoods($("#dress-goods"), "dress", b, c, function (a) {
        var b,
          c = $(a.currentTarget),
          d = c.attr("id").slice(6),
          e = iGoods(d);
        if (a.ctrlKey) {
          if (c.hasClass("dress-equipped")) return fail(426);
          if (
            !confirm(
              L.surePayback + commify(Math.round(0.2 * (e.cost || 0))) + L.ping
            )
          )
            return;
          $.post("/payback/" + d, function (a) {
            if (a.error) return fail(a.error);
            alertSync(L.painback);
            $data.box = a.box;
            $data.users[$data.id].money = a.money;
            drawMyDress($data._avGroup);
            updateUI(false);
          });
        } else if (-1 != AVAIL_EQUIP.indexOf(e.group))
          "Mhand" == e.group && (b = confirm(L.dressWhichHand)),
            requestEquip(d, b);
        else if ("CNS" == e.group) {
          if (!confirm(L.sureConsume)) return;
          $.post("/consume/" + d, function (a) {
            a.exp && notice(L.obtainExp + ": " + commify(a.exp)),
              a.money && notice(L.obtainMoney + ": " + commify(a.money)),
              a.gain.forEach(function (a) {
                queueObtain(a);
              }),
              ($data.box = a.box),
              ($data.users[$data.id].data = a.data),
              send("refresh"),
              drawMyDress($data._avGroup),
              updateMe();
          });
        }
      });
  }

  function requestEquip(a, b) {
    var c = $data.users[$data.id],
      d = $data.shop[a].group;
    "Mhand" == d && (d = b ? "Mlhand" : "Mrhand"),
      "BDG" == d.substr(0, 3) && (d = "BDG");
    var e = c.equip[d] == a;
    confirm(L[e ? "sureUnequip" : "sureEquip"] + ": " + L[a][0]) &&
      $.post(
        "/equip/" + a,
        {
          isLeft: b,
        },
        function (a) {
          if (a.error) return fail(a.error);
          ($data.box = a.box),
            (c.equip = a.equip),
            drawMyDress($data._avGroup),
            send("refresh"),
            updateUI(!1);
        }
      );
  }

  function drawCharFactory() {
    function a() {
      e.html($("<h4>").css("padding-top", "8px").width("100%").html(L.cfTray));
    }

    function b() {
      var b,
        h = {
          WPE: 1,
          WPC: 1,
          WPB: 2,
          WPA: 3,
        },
        j = "",
        k = 0,
        ev = false;
      e.empty(),
        $(".cf-tray-selected").removeClass("cf-tray-selected"),
        $data._tray.forEach(function (a) {
          (ev = a.includes("$WPE")),
            (b = iGoods(a)),
            (j += a.slice(4)),
            (k += h[a.slice(1, 4)]),
            e.append(
              $("<div>")
                .addClass("jt-image")
                .css("background-image", "url(" + b.image + ")")
                .attr("id", "cf-tray-" + a)
                .on("click", d)
            ),
            $("#cf-\\" + a).addClass("cf-tray-selected");
        }),
        f.html(L.searching),
        g.empty(),
        $stage.dialog.cfCompose.removeClass("cf-composable"),
        i.html(""),
        tryDict(j, function (a) {
          var b = !1;
          if (a.error) {
            if (3 != j.length) return f.html(L["wpFail_" + a.error]);
            (b = !0), f.html(L.cfBlend);
          }
          c(j, k, b, ev),
            $stage.dialog.cfCompose.addClass("cf-composable"),
            a.error ||
              f.html(processWord(a.word, a.mean, a.theme, a.type.split(",")));
        }),
        "" == j && a();
    }

    function c(a, b, c, d) {
      // word, length, blend, event word piece
      $.get(`/cf/${a}?l=${b}&b=${c ? "1" : ""}&e=${d}`, function (a) {
        if (a.error) return fail(a.error);
        g.empty(),
          a.data.forEach(function (a) {
            var b = iGoods(a.key),
              c = a.rate >= 1 ? L.cfRewAlways : (100 * a.rate).toFixed(1) + "%";
            g.append(
              $("<div>")
                .addClass("cf-rew-item")
                .append(
                  $("<div>")
                    .addClass("jt-image cf-rew-image")
                    .css("background-image", "url(" + b.image + ")")
                )
                .append(
                  $("<div>")
                    .width(100)
                    .append($("<div>").width(100).html(b.name))
                    .append(
                      $("<div>")
                        .addClass("cf-rew-value")
                        .html("x" + a.value)
                    )
                )
                .append($("<div>").addClass("cf-rew-rate").html(c))
            );
          }),
          i.html(L.cfCost + ": " + a.cost + L.ping);
      });
    }

    function d(a) {
      var c = $(a.currentTarget).attr("id").slice(8),
        d = $data._tray.indexOf(c);
      -1 != d && ($data._tray.splice(d, 1), b());
    }
    var e = $("#cf-tray"),
      f = $("#cf-dict"),
      g = $("#cf-reward"),
      h = $("#cf-goods"),
      i = $("#cf-cost");
    ($data._tray = []),
      f.empty(),
      g.empty(),
      i.html(""),
      $stage.dialog.cfCompose.removeClass("cf-composable"),
      renderGoods(h, "cf", ["PIX", "PIY", "PIZ"], null, function (a) {
        var c,
          d = $(a.currentTarget),
          e = d.attr("id").slice(3),
          f = $data.box[e],
          g = 0;
        if ($data._tray.length >= 100) return fail(435);
        for (c in $data._tray) $data._tray[c] == e && g++;
        f - g > 0 ? ($data._tray.push(e), b()) : fail(434);
      }),
      a();
  }

  function drawLeaderboard(a) {
    var b = $stage.dialog.lbTable.empty(),
      c = a.data[0] ? a.data[0].rank : 0,
      d = (a.page || Math.floor(c / 20)) + 1;
    a.data.forEach(function (a, c) {
      var d = $data.users[a.id];
      (d = d ? d.profile.title || d.profile.name : L.hidden),
        (a.score = Number(a.score)),
        b.append(
          $("<tr>")
            .attr("id", "ranking-" + a.id)
            .addClass("ranking-" + (a.rank + 1))
            .append($("<td>").html(a.rank + 1))
            .append(
              $("<td>")
                .append(
                  getLevelImage(
                    $data.users[a.id] || { data: { score: a.score } }
                  ).addClass("ranking-image")
                )
                .append(
                  $("<label>").css("padding-top", 2).html(getLevel(a.score))
                )
            )
            .append($("<td>").html(d))
            .append($("<td>").html(commify(a.score)))
        );
    }),
      $("#ranking-" + $data.id).addClass("ranking-me"),
      $stage.dialog.lbPage.html(L.page + " " + d),
      $stage.dialog.lbPrev.attr("disabled", d <= 1),
      $stage.dialog.lbNext.attr("disabled", a.data.length < 15),
      $stage.dialog.lbMe.attr("disabled", !!$data.guest),
      ($data._lbpage = d - 1);
  }

  function drawRPLeaderboard(a) {
    var b = $stage.dialog.rplbTable.empty(),
      c = a.data[0] ? a.data[0].rank : 0,
      d = (a.page || Math.floor(c / 20)) + 1,
      rd = getRankList(a);
    a.data.forEach(function (a, c) {
      var d = $data.users[a.id];
      (d = d ? d.profile.title || d.profile.name : L.hidden),
        b.append(
          $("<tr>")
            .attr("id", "rpranking-" + a.id)
            .addClass("rpranking-" + (a.rank + 1))
            .append($("<td>").html(a.rank + 1))
            .append(
              $("<td>")
                .append(
                  $("<div>")
                    .css({
                      float: "left",
                      "background-image": `url('https://cdn.jsdelivr.net/npm/bfkkutudelivr@${
                        L.cdn_version
                      }/img/kkutu/rankicon/${rd[a.id]}.png')`,
                      "background-position": "100% 100%",
                      "background-size": "100%",
                    })
                    .addClass("rpranking-image")
                )
                .append(
                  $("<label>").css("padding-top", 2).html(L[`${rd[a.id]}`])
                )
            )
            .append($("<td>").html(d))
            .append($("<td>").html(commify(a.score)))
        );
    }),
      $("#rpranking-" + $data.id).addClass("rpranking-me"),
      $stage.dialog.rplbPage.html(L.page + " " + d),
      $stage.dialog.rplbPrev.attr("disabled", d <= 1),
      $stage.dialog.rplbNext.attr("disabled", a.data.length < 15),
      $stage.dialog.rplbMe.attr("disabled", !!$data.guest),
      ($data._rplbpage = d - 1);
  }

  function drawReplayList(list) {
    let table = $stage.dialog.replaylbTable.empty();
    list.forEach((v, i) => {
      v.players = JSON.parse(v.players);
      v.events = JSON.parse(v.events);
      v.limit = Number(v.limit);
      v.mode = Number(v.mode);
      v.round = Number(v.round);
      v.roundTime = Number(v.roundTime);
      v.time = Number(v.time);
      table.append(
        $("<tr>")
          .attr("id", "replay-list-" + i)
          .addClass("replay-list" + i)
          .append($("<td>").html(i))
          .append($("<td>").html(new Date(v.time).toLocaleString()))
          .append(
            $("<td>").append(
              $("<button>")
                .text(L.replayDetail)
                .on("click", () => {
                  $rec = v;
                  showDialog($stage.dialog.replayDetail);
                  $("#replay-date").html(new Date(v.time).toLocaleString());
                  $("#replay-version").html(v.version);
                  const playerList = $("#replay-players").empty();
                  for (let i of v.players) {
                    let text = $("<div>")
                      .addClass("replay-player-bar ellipse")
                      .html(
                        i.title == "#undefined"
                          ? "끄투 봇"
                          : $data.users[i.id]
                          ? $data.users[i.id].nickname
                          : L.hidden
                      )
                      .prepend(getLevelImage(i).addClass("users-level"));
                    if (i.id == v.me) text.css("font-weight", "bold");
                    playerList.append(text);
                  }
                })
            )
          )
      );
    });
  }

  function updateCommunity() {
    function a(a) {
      var b = $(a.currentTarget).parent().parent().attr("id").slice(4),
        c = $data.friends[b],
        d = prompt(L.friendEditMemo, c);
      d &&
        send(
          "friendEdit",
          {
            id: b,
            memo: d,
          },
          !0
        );
    }

    function b(a) {
      var b = $(a.currentTarget).parent().parent().attr("id").slice(4),
        c = $data.friends[b];
      if ($data._friends[b].server) return fail(455);
      confirm(c + "(#" + b.substr(0, 5) + ")\n" + L.friendSureRemove) &&
        send(
          "friendRemove",
          {
            id: b,
          },
          !0
        );
    }
    var c,
      d,
      e,
      f,
      g = 0;
    $stage.dialog.commFriends.empty();
    for (c in $data.friends)
      g++,
        (f = $data.friends[c]),
        (d = $data._friends[c] || {}),
        (e = ($data.users[c] || {}).profile),
        $stage.dialog.commFriends.append(
          $("<div>")
            .addClass("cf-item")
            .attr("id", "cfi-" + c)
            .append(
              $("<div>").addClass(
                "cfi-status cfi-stat-" + (d.server ? "on" : "off")
              )
            )
            .append(
              $("<div>")
                .addClass("cfi-server")
                .html(d.server ? L["server_" + d.server] : "-")
            )
            .append(
              $("<div>")
                .addClass("cfi-name ellipse")
                .html(e ? e.title || e.name : L.hidden)
            )
            .append($("<div>").addClass("cfi-memo ellipse").text(f))
            .append(
              $("<div>")
                .addClass("cfi-menu")
                .append($("<i>").addClass("fa fa-pencil").on("click", a))
                .append($("<i>").addClass("fa fa-remove").on("click", b))
            )
        );
    $("#CommunityDiag .dialog-title").html(
      L.communityText + " (" + g + " / 100)"
    );
  }

  function requestRoomInfo(a) {
    var b = $data.rooms[a],
      c = $("#ri-players").empty();
    ($data._roominfo = a),
      $("#RoomInfoDiag .dialog-title").html(a + L.sRoomInfo),
      $("#ri-title").html(
        (b.password ? "<i class='fa fa-lock'></i>&nbsp;" : "") + b.title
      ),
      $("#ri-mode").html(L["mode" + MODE[b.mode]]),
      $("#ri-round").html(b.round + ", " + b.time + L.SECOND),
      $("#ri-limit").html(b.players.length + " / " + b.limit),
      b.players.forEach(function (a, d) {
        var e,
          f,
          g = b.readies[a] || {};
        (a = $data.users[a] || NULL_USER),
          b.players[d].robot
            ? ((a.profile = {
                title: L.robot,
              }),
              (a.equip = {
                robot: !0,
              }))
            : (g.t = g.t || 0),
          c.append(
            $("<div>")
              .addClass("ri-player")
              .append((f = $("<div>").addClass("moremi rip-moremi")))
              .append(
                (e = $("<div>")
                  .addClass("ellipse rip-title")
                  .html(a.profile.title || a.profile.name))
              )
              .append(
                $("<div>")
                  .addClass("rip-team team-" + g.t)
                  .html($("#team-" + g.t).html())
              )
              .append(
                $("<div>")
                  .addClass("rip-form")
                  .html(L["pform_" + g.f])
              )
          ),
          a.id == b.master &&
            e.prepend(
              $("<label>")
                .addClass("rip-master")
                .html("[" + L.master + "]&nbsp;")
            ),
          e.prepend(getLevelImage(a).addClass("profile-level rip-level")),
          renderMoremi(f, a.equip, a.id);
      }),
      showDialog($stage.dialog.roomInfo),
      $stage.dialog.roomInfo.show();
  }

  async function requestProfile(a) {
    var b,
      c,
      d,
      rankExpl,
      e = $data.users[a] || $data.robots[a],
      f = $("#profile-record").empty(),
      z = $data.users[a],
      ph = 495; // default size
    if (!e) return void notice(L.error_405);
    if (!e.robot) {
      var x =
        e.data.rankPoint < 5000
          ? calculateRank(e.data.rankPoint, null, null)
          : getRank(z);

      //$("#rankicon").attr("src", `https://cdn.jsdelivr.net/npm/bfkkutudelivr@${L.cdn_version}/img/kkutu/rankicon/` + x + ".png").attr("title", L[x]);

      $(".profile-level-progress").show();
      $(".profile-score-text").show();

      $stage.dialog.profileCopyID.on("click", function (a) {
        var tempElem = document.createElement("textarea");
        tempElem.value = e.id;
        document.body.appendChild(tempElem);
        tempElem.select();
        document.execCommand("copy");
        document.body.removeChild(tempElem);
        Swal.fire(
          "BF끄투",
          "이 유저의 식별번호 " +
            tempElem.value +
            "가 복사되었습니다.<br>(일부 브라우저의 경우 수동으로 복사해야 할 수 있습니다)",
          "success"
        );
      });
    }

    if (
      ($("#ProfileDiag .dialog-title").text(
        (e.profile.title || e.profile.name) + L.sProfile
      ),
      $(".profile-head")
        .empty()
        .append((b = $("<div>").addClass("moremi profile-moremi")))
        .append(
          $("<div>")
            .addClass("profile-head-item")
            .append(getImage(e.profile.image).addClass("profile-image"))
            .append(
              $("<div>")
                .addClass("profile-title ellipse")
                .text(e.profile.title || e.profile.name)
                .append(
                  $("<label>")
                    .addClass("profile-tag")
                    .html(" #" + e.id.toString().substr(0, 5))
                )
            )
        )
        .append(
          $("<div>")
            .addClass("profile-head-item")
            .css("width", "75%")
            .append(getLevelImage(e).addClass("profile-level"))
            .append(
              $("<div>")
                .addClass("profile-level-text")
                .html(L.LEVEL + " " + (d = getLevel(e.data.score)))
            )
            .append(
              $("<div>")
                .addClass("profile-score-text")
                .html(
                  commify(e.data.score) + " / " + commify(EXP[d - 1]) + L.PTS
                )
            )
        )
        .append(
          $("<div>")
            .css("width", "75%")
            .append(
              $("<progress>")
                .addClass("profile-level-progress")
                .css("width", "100%")
                .attr("max", 100)
                .attr(
                  "value",
                  Math.floor(
                    ((e.data.score - (EXP[d - 2] || 0)) /
                      (EXP[d - 1] - (EXP[d - 2] || 0))) *
                      100
                  )
                )
            )
        )
        .append(
          (c = $("<div>")
            .addClass("profile-head-item profile-exordial ellipse")
            .css("width", "75%")
            .text(badWords(e.exordial || ""))
            .append(
              $("<div>")
                .addClass("expl")
                .css({
                  "white-space": "normal",
                  width: 300,
                  "font-size": "11px",
                })
                .text(e.exordial)
            ))
        ),
      e.robot)
    )
      $stage.dialog.profileLevel.show(),
        $stage.dialog.profileLevel.prop(
          "disabled",
          $data.id != $data.room.master
        ),
        $("#rank").html(L["UNRANKED"]),
        $("#rankpoint").html("0" + L["LP"]),
        $("#profile-place").html($data.room.id + L.roomNumber);
    else {
      $stage.dialog.profileLevel.hide(),
        $("#profile-rank")
          .empty()
          .append(
            (rankExpl = $("<div>")
              .attr("id", "profile-rankicon")
              .append(
                $("<img>")
                  .attr("id", "rankicon")
                  .attr(
                    "src",
                    `https://cdn.jsdelivr.net/npm/bfkkutudelivr@${L.cdn_version}/img/kkutu/rankicon/${x}.png`
                  )
              )
              .append(
                $("<div>")
                  .addClass("expl")
                  .css({
                    "white-space": "normal",
                    width: 50,
                    "font-size": "11px",
                  })
                  .text(L[x])
              ))
          ),
        $("#rankpoint").html(z.data.rankPoint + L["LP"]),
        $("#profile-place").html(e.place ? e.place + L.roomNumber : L.lobby);
      for (d in e.data.record) {
        const g = e.data.record[d];
        const expl = $("<div>")
          .addClass("expl")
          .text(`${((g[1] / g[0]) * 100).toFixed(2)}%`);
        const $record = $("<div>")
          .addClass("profile-record-field")
          .append(
            $("<div>")
              .addClass("profile-field-name")
              .html(L["mode" + d])
          )
          .append(
            $("<div>")
              .addClass("profile-field-record")
              .html(g[0] + L.P + " " + g[1] + L.W)
          )
          .append(
            $("<div>")
              .addClass("profile-field-score")
              .html(commify(g[2]) + L.PTS)
          )
          .append(expl);
        f.append($record);
        if (g[0] != 0) global.expl($record);
      }
      renderMoremi(b, e.equip, e.id);
      //if(e.equip.NTG) $(".profile-title").css("background-image", "url("+iNTGImage(e.equip.NTG)+")")
    }
    if (e.data.score <= -1) {
      $(".profile-level-progress").hide();
      $(".profile-level-text").text("운영자");
      $(".profile-score-text").hide();
    }
    $("#profile-friendadd")
      .show()
      .on("click", () => {
        let confirmed = confirm(`${e.nickname}님에게 친구 추가 요청을 할까요?`);
        if (confirmed)
          return $data.users[e.id]
            ? void send(
                "friendAdd",
                {
                  target: e.id,
                },
                true
              )
            : fail(450);
      });
    if ($data.id == e.id) {
      $("#profile-friendadd").hide();
      ph = 465;
    } else if (e.exordial) ph = 510;
    $("#ProfileDiag").css("height", `${ph}px`);
    $data._profiled = a;
    $stage.dialog.profileKick.hide();
    $stage.dialog.profileReport.hide();
    $stage.dialog.profileShut.hide();
    $stage.dialog.profileDress.hide();
    $stage.dialog.profileWhisper.hide();
    $stage.dialog.profileHandover.hide();
    $stage.dialog.profileOpenMng.hide();
    if ($data.id == a) $stage.dialog.profileDress.show();
    else {
      if (!e.robot) {
        $stage.dialog.profileShut.show();
        $stage.dialog.profileReport.show();
        $stage.dialog.profileWhisper.show();
        if ($data.admin) {
          $stage.dialog.profileOpenMng.show();
          $stage.dialog.profileOpenMng.target = e;
        }
      }
    }
    if ($data.room && $data.id != a && $data.id == $data.room.master) {
      $stage.dialog.profileKick.show();
      $stage.dialog.profileHandover.show();
    }
    if ($data.id != e.id) $("#profile-warn").hide();
    else {
      $("#profile-warn").show();
      $("#warnRecord").text((await getWarn(a)) + L["WARNCOUNT"]);
    }
    showDialog($stage.dialog.profile);
    $stage.dialog.profile.show();
    global.expl(c);
    global.expl(rankExpl);
  }

  function requestInvite(a) {
    var b;
    ("AI" == a ||
      ((b = $data.users[a].profile.title || $data.users[a].profile.name),
      confirm(b + L.sureInvite))) &&
      send("invite", {
        target: a,
      });
  }

  async function getWarn(a) {
    const res = getRes(`/getwarn?target=${a}`);
    const warn = JSON.parse(res);
    if (!warn.message)
      return await alert("경고 누적 횟수를 조회하지 못했습니다." + warn.error);
    else return warn.message;
  }

  function parseDate(number) {
    if (typeof number != "number") return number;

    let year = number.slice(0, 4);
    let month = number.slice(4, 6);
    let day = number.slice(6, 8);
    let hour = number.slice(8, 10);

    return `${year}년 ${month}월 ${day}일 ${hour}시`;
  }

  function checkFailCombo(a) {
    $data._replay || $data.lastFail != $data.id || $data.id != a
      ? ($data.failCombo = 0)
      : ($data.failCombo++,
        1 == $data.failCombo && notice(L.trollWarning),
        $data.failCombo > 1 && (send("leave"), fail(437))),
      ($data.lastFail = a);
  }

  function clearGame() {
    if ($data._spaced) $lib.Typing.spaceOff();
    clearInterval($data._tTime);
    $data._relay = false;
    $("#items").hide();
    $(document).off("keydown", itemCommandEvent);
  }

  function gameReady() {
    var a, b;
    for (a in $data.room.players)
      (b = $data._replay
        ? $rec.users[$data.room.players[a]] || $data.room.players[a]
        : $data.users[$data.room.players[a]] ||
          $data.robots[$data.room.players[a].id]),
        (b.game.score = 0),
        !$data.admin && ($data["_s" + $data.room.players[a]] = undefined),
        !$data.admin && ($data.lastFail = undefined),
        ($data.failCombo = 0),
        ($data._spectate = -1 == $data.room.game.seq.indexOf($data.id)),
        ($data._gAnim = !0),
        $stage.box.room.show().height(360).animate(
          {
            height: 1,
          },
          500
        ),
        $stage.box.game.height(1).animate(
          {
            height: 410,
          },
          500
        ),
        stopBGM(),
        clearBoard(),
        $stage.game.display.html(L.soon),
        playSound("game_start"),
        forkChat(),
        addTimeout(function () {
          $stage.box.room.height(360).hide();
          $stage.chat.scrollTop(999999999);
        }, 500);
  }

  function replayPrevInit() {
    var a;
    for (a in $data.room.game.seq)
      $data.room.game.seq[a].robot && ($data.room.game.seq[a].game.score = 0);
    $rec.users = {};
    for (a in $rec.players) {
      var b = $rec.players[a].id,
        c = $rec.readies[b] || {},
        d = $data.users[b] || $data.robots[b],
        e = b;
      $rec.players[a].robot
        ? ((d = $rec.users[b] =
            {
              robot: !0,
            }),
          (e = $rec.players[a]),
          (e.game = {}))
        : (d = $rec.users[b] = {}),
        $data.room.players.push(e),
        (d.id = e),
        (d.profile = $rec.players[a]),
        (d.data = d.profile.data),
        (d.equip = d.profile.equip),
        (d.game = {
          score: 0,
          team: c.t,
        });
    }
    $data._rf = 0;
  }

  function replayReady() {
    var a;
    replayStop(),
      ($data._replay = true),
      ($data.room = {
        title: $rec.title,
        players: [],
        events: [],
        time: $rec.roundTime,
        round: $rec.round,
        mode: $rec.mode,
        limit: $rec.limit,
        game: $rec.game,
        opts: $rec.opts,
        readies: $rec.readies,
      }),
      replayPrevInit();
    for (a in $rec.events) $data.room.events.push($rec.events[a]);
    $stage.box.userList.hide(),
      $stage.box.roomList.hide(),
      $stage.box.game.show(),
      $stage.dialog.replay.hide(),
      gameReady(),
      updateRoom(!0),
      ($data.$gp = $(".GameBox .product-title")
        .empty()
        .append(($data.$gpt = $("<div>").addClass("game-replay-title")))
        .append(
          ($data.$gpc = $("<div>")
            .addClass("game-replay-controller")
            .append($("<button>").html(L.replayNext).on("click", replayNext))
            .append($("<button>").html(L.replayPause).on("click", replayPause))
            .append($("<button>").html(L.replayPrev).on("click", replayPrev)))
        )),
      ($data._gpp = L.replay + " - " + new Date($rec.time).toLocaleString()),
      ($data._gtt = $data.room.events[$data.room.events.length - 1].time),
      ($data._eventTime = 0),
      ($data._rt = addTimeout(replayTick, 2e3)),
      ($data._rprev = 0),
      ($data._rpause = !1),
      replayStatus();
  }

  function replayPrev() {
    var b,
      c,
      d = $data.room.events[--$data._rf];
    if (d) {
      b = d.time;
      do {
        if (!(d = $data.room.events[--$data._rf])) break;
      } while (b - d.time < 1e3);
      for (c = $data._rf - 1, replayPrevInit(), i = 0; i < c; i++) replayTick();
      $(".deltaScore").remove(), replayTick();
    }
  }

  function replayPause(a) {
    var b = ($data._rpause = !$data._rpause);
    $(a.target).html(b ? L.replayResume : L.replayPause);
  }

  function replayNext() {
    clearTimeout($data._rt);
    replayTick();
  }

  function replayStatus() {
    $data.$gpt.html(
      $data._gpp +
        " (" +
        (0.001 * $data._eventTime).toFixed(1) +
        L.SECOND +
        " / " +
        (0.001 * $data._gtt).toFixed(1) +
        L.SECOND +
        ")"
    );
  }

  function replayTick(a) {
    var b,
      c = $data.room.events[$data._rf];
    return (
      clearTimeout($data._rt),
      a || $data._rf++,
      c
        ? $data._rpause
          ? ($data._rf--, ($data._rt = addTimeout(replayTick, 100)))
          : ((b = c.data),
            b.hint &&
              (b.hint = {
                _id: b.hint,
              }),
            "chat" == b.type && (b.timestamp = $rec.time + c.time),
            onMessage(b),
            ($data._eventTime = c.time),
            replayStatus(),
            void ($data.room.events.length > $data._rf
              ? ($data._rt = addTimeout(
                  replayTick,
                  $data.room.events[$data._rf].time - c.time
                ))
              : replayStop()))
        : void replayStop()
    );
  }

  function replayStop() {
    if (!$data.admin) $data.room = undefined;
    $data._replay = false;
    $stage.box.room.height(360);
    clearTimeout($data._rt);
    updateUI();
    playBGM("lobby");
  }

  function clearBoard() {
    ($data._relay = !1),
      loading(),
      $stage.game.here.hide(),
      $stage.dialog.result.hide(),
      $stage.dialog.dress.hide(),
      $stage.dialog.charFactory.hide(),
      $(".jjoriping,.rounds,.game-body").removeClass("cw"),
      $(".jjoriping,.rounds").removeClass("dg"),
      $(".rounds").removeClass("painter"),
      $stage.game.display.empty(),
      $stage.game.chain.hide(),
      $stage.game.hints.empty().hide(),
      $stage.game.tools.hide(),
      $stage.game.cwcmd.hide(),
      $stage.game.bb.hide(),
      $stage.game.round.empty(),
      $stage.game.history.empty(),
      $stage.game.items.show().css("opacity", 0),
      $(".jjo-turn-time .graph-bar").width(0).css({
        float: "",
        "text-align": "",
        "background-color": "",
      }),
      $(".jjo-round-time .graph-bar")
        .width(0)
        .css({
          float: "",
          "text-align": "",
        })
        .removeClass("round-extreme"),
      $(".game-user-bomb").removeClass("game-user-bomb");
  }

  function drawRound(a) {
    var b;
    for ($stage.game.round.empty(), b = 0; b < $data.room.round; b++)
      $stage.game.round.append(
        ($l = $("<label>").html($data.room.game.title[b]))
      ),
        b + 1 == a && $l.addClass("rounds-current");
  }

  function turnGoing() {
    route("turnGoing");
  }

  function turnHint(a) {
    route("turnHint", a);
  }

  function turnError(a, b) {
    $stage.game.display.empty().append(
      $("<label>")
        .addClass("game-fail-text")
        .text((L["turnError_" + a] ? L["turnError_" + a] + ": " : "") + b)
    ),
      playSound("fail"),
      clearTimeout($data._fail),
      ($data._fail = addTimeout(function () {
        $stage.game.display.html($data._char);
      }, 1800));
  }

  function getScore(a) {
    return $data._replay
      ? $rec.users[a].game.score
      : ($data.users[a] || $data.robots[a]).game.score;
  }

  function addScore(a, b) {
    $data._replay
      ? ($rec.users[a].game.score += b)
      : (($data.users[a] || $data.robots[a]).game.score += b);
  }

  function drawObtainedScore(a, b) {
    return (
      a.append(b),
      addTimeout(function () {
        b.remove();
      }, 2e3),
      a
    );
  }

  function turnEnd(a, b) {
    route("turnEnd", a, b);
  }

  function roundEnd(a, b) {
    function c(a) {
      var b, e, f;
      ($data._result.goal = EXP[$data._result.level - 1]),
        ($data._result.before = EXP[$data._result.level - 2] || 0),
        $data._result.reward.score > 0 &&
          ((b = $data._result.reward.score * $data._coef),
          b < 0.05 && $data._coef && (b = $data._result.reward.score),
          ($data._result.reward.score -= b),
          ($data._result.exp += b),
          (e = getLevel($data._result.exp)),
          $data._result.level != e &&
            (($data._result._boing -= $data._result.goal - $data._result._exp),
            ($data._result._exp = $data._result.goal),
            playSound("lvup")),
          ($data._result.level = e),
          addTimeout(c, 50)),
        (f = $data._result.exp - $data._result._exp),
        d(
          "before",
          $data._result._exp,
          $data._result.before,
          $data._result.goal
        ),
        d(
          "current",
          Math.min(f, $data._result._boing),
          0,
          $data._result.goal - $data._result.before
        ),
        d(
          "bonus",
          Math.max(0, f - $data._result._boing),
          0,
          $data._result.goal - $data._result.before
        ),
        $(".result-me-level-body").html($data._result.level),
        $(".result-me-score-text").html(
          commify(Math.round($data._result.exp)) +
            " / " +
            commify($data._result.goal)
        );
    }

    function d(a, b, c, d) {
      $(".result-me-" + a + "-bar").width(((b - c) / (d - c)) * 100 + "%");
    }
    function explainReward(a, b, c) {
      function row($t, h, b) {
        console.log($t);
        $t.append($("<h5>").addClass("result-me-blog-head").html(h)).append(
          $("<h5>").addClass("result-me-blog-body").html(b)
        );
      }
      var e,
        f,
        g = $("<div>")
          .append($("<h4>").html(L.scoreGain))
          .append((e = $("<div>")))
          .append($("<h4>").html(L.moneyGain))
          .append((f = $("<div>")));
      console.log(e, f);
      return (
        row(e, L.scoreOrigin, a),
        row(f, L.moneyOrigin, b),
        c.forEach(function (c) {
          var g,
            h,
            i,
            j = c.charAt(0),
            k = c.charAt(1),
            l = c.slice(2, 5),
            m = Number(c.slice(5));
          "EXP" == l ? ((g = e), (i = a)) : "MNY" == l && ((g = f), (i = b));
          "g" == k
            ? (h = "+" + (i * m).toFixed(1))
            : "h" == k && (h = "+" + Math.floor(m));
          console.log(g);
          row(g, L["bonusFrom_" + j], h);
        }),
        g
      );
    }
    b || (b = {});
    var e,
      f,
      g,
      h,
      i,
      j,
      k,
      l,
      m,
      n = $(".result-board").empty();
    $(".result-me-expl").empty(),
      $stage.game.display.html(L.roundEnd),
      ($data._resultPage = 1),
      ($data._result = null),
      ($data._relay = false);
    for (e in a)
      (g = a[e]),
        (f = $data._replay ? $rec.users[g.id] : $data.users[g.id]),
        f || (f = NULL_USER),
        f.data &&
          g.reward &&
          ((g.reward.score = $data._replay ? 0 : Math.round(g.reward.score)),
          (j =
            getLevel((k = f.data.score)) >
            getLevel(f.data.score - g.reward.score)),
          n.append(
            (h = $("<div>")
              .addClass("result-board-item")
              .append(
                (i = $("<div>")
                  .addClass("result-board-rank")
                  .html(g.rank + 1))
              )
              .append(getLevelImage(f).addClass("result-board-level"))
              .append(
                $("<div>")
                  .addClass("result-board-name")
                  .html(f.profile.title || f.profile.name)
              )
              .append(
                $("<div>")
                  .addClass("result-board-score")
                  .html(
                    b.scores
                      ? L.avg + " " + commify(b.scores[g.id]) + L.kpm
                      : commify(g.score || 0) + L.PTS
                  )
              )
              .append(
                $("<div>")
                  .addClass("result-board-reward")
                  .html(g.reward.score ? "+" + commify(g.reward.score) : "-")
              )
              .append(
                $("<div>")
                  .addClass("result-board-lvup")
                  .css("display", j ? "block" : "none")
                  .append($("<i>").addClass("fa fa-arrow-up"))
                  .append($("<div>").html(L.lvUp))
              ))
          ),
          f.game.team && i.addClass("team-" + f.game.team),
          g.id == $data.id &&
            ((g.exp = f.data.score - g.reward.score),
            (g.level = getLevel(g.exp)),
            ($data._result = g),
            h.addClass("result-board-me"),
            $(".result-me-expl").append(
              explainReward(g.reward._score, g.reward._money, g.reward._blog)
            )));
    $(".result-me").css("opacity", 0),
      ($data._coef = 0),
      $data._result &&
        ((l = $data._result.reward.score - $data._result.reward._score),
        (m = $data._result.reward.money - $data._result.reward._money),
        ($data._result._exp = $data._result.exp),
        ($data._result._score = $data._result.reward.score),
        ($data._result._bonus = l),
        ($data._result._boing = $data._result.reward._score),
        ($data._result._addit = l),
        ($data._result._addp = m),
        (l =
          l > 0
            ? "<label class='result-me-bonus'>(+" + commify(l) + ")</label>"
            : ""),
        (m =
          m > 0
            ? "<label class='result-me-bonus'>(+" + commify(m) + ")</label>"
            : ""),
        notice(
          L.scoreGain +
            ": " +
            commify($data._result.reward.score) +
            ", " +
            L.moneyGain +
            ": " +
            commify($data._result.reward.money) +
            ", " +
            L.rankPointGain +
            ": " +
            commify($data._result.reward.rankPoint)
        ),
        $(".result-me").css("opacity", 1),
        $(".result-me-score").html(
          L.scoreGain + " +" + commify($data._result.reward.score) + l
        ),
        $(".result-me-money").html(
          L.moneyGain + " +" + commify($data._result.reward.money) + m
        )),
      addTimeout(() => {
        showDialog($stage.dialog.result);
        $("#items").hide();
        $(document).off("keydown", itemCommandEvent);
        if ($data._result) c(true);
        $stage.dialog.result.css("opacity", 0).animate(
          {
            opacity: 1,
          },
          500
        );
        addTimeout(() => {
          $data._coef = 0.05;
        }, 500);
      }, 2000);
    $stage.box.room.height(360);
    playBGM("lobby");
    forkChat();
    updateUI();
  }

  /*function roundEnd(result, data){
    if(!data) data = {};
    var i, o, r;
    var $b = $(".result-board").empty();
    var $o, $p;
    var lvUp, sc;
    var addit, addp;
    
    $(".result-me-expl").empty();
    $stage.game.display.html(L['roundEnd']);
    $data._resultPage = 1;
    $data._result = null;
    $data._relay = false
    for(i in result){
      r = result[i];
      if($data._replay){
        o = $rec.users[r.id];
      }else{
        o = $data.users[r.id];
      }
      if(!o){
        o = NULL_USER;
      }
      if(!o.data) continue;
      if(!r.reward) continue;
      
      r.reward.score = $data._replay ? 0 : Math.round(r.reward.score);
      lvUp = getLevel(sc = o.data.score) > getLevel(o.data.score - r.reward.score);
      
      $b.append($o = $("<div>").addClass("result-board-item")
        .append($p = $("<div>").addClass("result-board-rank").html(r.rank + 1))
        .append(getLevelImage(sc).addClass("result-board-level"))
        .append($("<div>").addClass("result-board-name").html(o.profile.title || o.profile.name))
        .append($("<div>").addClass("result-board-score")
          .html(data.scores ? (L['avg'] + " " + commify(data.scores[r.id]) + L['kpm']) : (commify(r.score || 0) + L['PTS']))
        )
        .append($("<div>").addClass("result-board-reward").html(r.reward.score ? ("+" + commify(r.reward.score)) : "-"))
        .append($("<div>").addClass("result-board-lvup").css('display', lvUp ? "block" : "none")
          .append($("<i>").addClass("fa fa-arrow-up"))
          .append($("<div>").html(L['lvUp']))
        )
      );
      if(o.game.team) $p.addClass("team-" + o.game.team);
      if(r.id == $data.id){
        r.exp = o.data.score - r.reward.score;
        r.level = getLevel(r.exp);
        $data._result = r;
        $o.addClass("result-board-me");
        $(".result-me-expl").append(explainReward(r.reward._score, r.reward._money, r.reward._blog));
      }
    }
    $(".result-me").css('opacity', 0);
    $data._coef = 0;
    if($data._result){
      addit = $data._result.reward.score - $data._result.reward._score;
      addp = $data._result.reward.money - $data._result.reward._money;
      
      $data._result._exp = $data._result.exp;
      $data._result._score = $data._result.reward.score;
      $data._result._bonus = addit;
      $data._result._boing = $data._result.reward._score;
      $data._result._addit = addit;
      $data._result._addp = addp;
      
      if(addit > 0){
        addit = "<label class='result-me-bonus'>(+" + commify(addit) + ")</label>";
      }else addit = "";
      if(addp > 0){
        addp = "<label class='result-me-bonus'>(+" + commify(addp) + ")</label>";
      }else addp = "";
      
      notice(L['scoreGain'] + ": " + commify($data._result.reward.score) + ", " + L['moneyGain'] + ": " + commify($data._result.reward.money));
      $(".result-me").css('opacity', 1);
      $(".result-me-score").html(L['scoreGain']+" +"+commify($data._result.reward.score)+addit);
      $(".result-me-money").html(L['moneyGain']+" +"+commify($data._result.reward.money)+addp);
    }
    function roundEndAnimation(first){
      var v, nl;
      var going;
      
      $data._result.goal = EXP[$data._result.level - 1];
      $data._result.before = EXP[$data._result.level - 2] || 0;
      if($data._result.reward.score > 0){
        v = $data._result.reward.score * $data._coef;
        if(v < 0.05 && $data._coef) v = $data._result.reward.score;
        
        $data._result.reward.score -= v;
        $data._result.exp += v;
        nl = getLevel($data._result.exp);
        if($data._result.level != nl){
          $data._result._boing -= $data._result.goal - $data._result._exp;
          $data._result._exp = $data._result.goal;
          playSound('lvup');
        }
        $data._result.level = nl;
        
        addTimeout(roundEndAnimation, 50);
      }
      going = $data._result.exp - $data._result._exp;
      draw('before', $data._result._exp, $data._result.before, $data._result.goal);
      draw('current', Math.min(going, $data._result._boing), 0, $data._result.goal - $data._result.before);
      draw('bonus', Math.max(0, going - $data._result._boing), 0, $data._result.goal - $data._result.before);
      
      $(".result-me-level-body").html($data._result.level);
      $(".result-me-score-text").html(commify(Math.round($data._result.exp)) + " / " + commify($data._result.goal));
    }
    function draw(phase, val, before, goal){
      $(".result-me-" + phase + "-bar").width((val - before) / (goal - before) * 100 + "%");
    }
    function explainReward(orgX, orgM, list){
      var $sb, $mb;
      var $R = $("<div>")
        .append($("<h4>").html(L['scoreGain']))
        .append($sb = $("<div>"))
        .append($("<h4>").html(L['moneyGain']))
        .append($mb = $("<div>"));
      
      row($sb, L['scoreOrigin'], orgX);
      row($mb, L['moneyOrigin'], orgM);
      list.forEach(function(item){
        var from = item.charAt(0);
        var type = item.charAt(1);
        var target = item.slice(2, 5);
        var value = Number(item.slice(5));
        var $t, vtx, org;
        
        if(target == 'EXP') $t = $sb, org = orgX;
        else if(target == 'MNY') $t = $mb, org = orgM;
        
        if(type == 'g') vtx = "+" + (org * value).toFixed(1);
        else if(type == 'h') vtx = "+" + Math.floor(value);
        
        row($t, L['bonusFrom_' + from], vtx);
      });
      function row($t, h, b){
        $t.append($("<h5>").addClass("result-me-blog-head").html(h))
          .append($("<h5>").addClass("result-me-blog-body").html(b));
      }
      return $R;
    }
    addTimeout(function(){
      showDialog($stage.dialog.result);
      $("#items").hide();
        $(document).off("keydown", itemCommandEvent);
      if($data._result) roundEndAnimation(true);
      $stage.dialog.result.css('opacity', 0).animate({ opacity: 1 }, 500);
      addTimeout(function(){
        $data._coef = 0.05;
      }, 500);
    }, 2000);
    if($data.room.opts.tournament)
      $stage.box.room.height(460)
      else $stage.box.room.height(360)
    stopRecord();
  }*/

  function drawRanking(a) {
    var b,
      c,
      d,
      e = $(".result-board").empty();
    if ((($data._resultPage = 2), !a))
      return $stage.dialog.resultOK.trigger("click");
    for (i in a.list)
      (r = a.list[i]),
        (o = $data.users[r.id] || {
          profile: {
            title: L.hidden,
          },
        }),
        (d = r.id == $data.id),
        e.append(
          (b = $("<div>")
            .addClass("result-board-item")
            .append(
              $("<div>")
                .addClass("result-board-rank")
                .html(r.rank + 1)
            )
            .append(getLevelImage(o).addClass("result-board-level"))
            .append(
              $("<div>")
                .addClass("result-board-name")
                .html(o.profile.title || o.profile.name)
            )
            .append(
              $("<div>")
                .addClass("result-board-score")
                .html(commify(r.score) + L.PTS)
            )
            .append($("<div>").addClass("result-board-reward").html(""))
            .append(
              (c = $("<div>")
                .addClass("result-board-lvup")
                .css("display", d ? "block" : "none")
                .append($("<i>").addClass("fa fa-arrow-up"))
                .append($("<div>").html(a.prev - r.rank)))
            ))
        ),
        d && (a.prev - r.rank <= 0 && c.hide(), b.addClass("result-board-me"));
  }

  function kickVoting(a) {
    var b = $data.users[a].profile;
    $("#kick-vote-text").html((b.title || b.name) + L.kickVoteText),
      ($data.kickTime = 10),
      ($data._kickTime = 10),
      ($data._kickTimer = addTimeout(kickVoteTick, 1e3)),
      showDialog($stage.dialog.kickVote);
  }

  function kickVoteTick() {
    $(".kick-vote-time .graph-bar").width(
      ($data.kickTime / $data._kickTime) * 300
    ),
      --$data.kickTime > 0
        ? ($data._kickTimer = addTimeout(kickVoteTick, 1e3))
        : $stage.dialog.kickVoteY.trigger("click");
  }

  function loadShop() {
    var a = $("#shop-shelf");
    a.html(L.LOADING),
      processShop(function (b) {
        if ((a.empty(), $data.guest && (b.error = 423), b.error))
          return $stage.menu.shop.trigger("click"), fail(b.error);
        b.goods
          .sort(function (a, b) {
            return b.updatedAt - a.updatedAt;
          })
          .forEach(function (b, c, d) {
            if (!(b.cost < 0)) {
              var e = iImage(!1, b);
              a.append(
                $("<div>")
                  .attr("id", "goods_" + b._id)
                  .addClass("goods")
                  .append(
                    $("<div>")
                      .addClass("jt-image goods-image")
                      .css("background-image", "url(" + e + ")")
                  )
                  .append($("<div>").addClass("goods-title").html(iName(b._id)))
                  .append(
                    $("<div>")
                      .addClass("goods-cost")
                      .html(commify(b.cost) + L.ping)
                  )
                  .append(explainGoods(b, !1))
                  .on("click", onGoods)
              );
            }
          }),
          global.expl(a);
      }),
      $(".shop-type.selected").removeClass("selected"),
      $("#shop-type-all").addClass("selected");
  }

  function filterShop(a) {
    var b,
      c,
      d,
      e = !0 === a;
    e || (a = a.split(","));
    for (d in $data.shop)
      (c = $data.shop[d]),
        c.cost < 0 ||
          ((b = $("#goods_" + d).show()),
          e || (-1 == a.indexOf(c.group) && b.hide()));
  }

  function explainGoods(a, b, c) {
    var d,
      e,
      f = $("<div>")
        .addClass("expl dress-expl")
        .append(
          $("<div>")
            .addClass("dress-item-title")
            .html(iName(a._id) + (b ? L.equipped : ""))
        )
        .append(
          $("<div>")
            .addClass("dress-item-group")
            .html(L["GROUP_" + a.group])
        )
        .append($("<div>").addClass("dress-item-expl").html(iDesc(a._id))),
      g = $("<div>").addClass("dress-item-opts");
    a.term &&
      f.append(
        $("<div>")
          .addClass("dress-item-term")
          .html(Math.floor(a.term / 86400) + L.DATE + " " + L.ITEM_TERM)
      ),
      c &&
        f.append(
          $("<div>")
            .addClass("dress-item-term")
            .html(new Date(1e3 * c).toLocaleString() + L.ITEM_TERMED)
        );
    for (d in a.options)
      if ("gif" != d) {
        var h = d.charAt(0);
        (e = a.options[d]),
          "g" == h
            ? (e = "+" + (100 * e).toFixed(1) + "%p")
            : "h" == h && (e = "+" + e),
          g
            .append(
              $("<label>")
                .addClass("item-opts-head")
                .html(L["OPTS_" + d])
            )
            .append($("<label>").addClass("item-opts-body").html(e))
            .append($("<br>"));
      }
    return e && f.append(g), f;
  }

  function processShop(a) {
    var b;
    $.get("/shop", function (c) {
      $data.shop = {};
      for (b in c.goods) $data.shop[c.goods[b]._id] = c.goods[b];
      a && a(c);
    });
  }

  function onGoods(a) {
    var b,
      c,
      d = $(a.currentTarget).attr("id").slice(6),
      e = $data.shop[d],
      f = $data.users[$data.id],
      g = f.money,
      h = g - e.cost,
      i = L.surePurchase,
      j = {};
    $data.box && $data.box[d] && (i = L.alreadyGot + " " + i),
      showDialog($stage.dialog.purchase, !0),
      $("#purchase-ping-before").html(commify(g) + L.ping),
      $("#purchase-ping-cost").html(commify(e.cost) + L.ping),
      $("#purchase-item-name").html(L[d][0]),
      (b = $("#purchase-ping-after").html(commify(h) + L.ping)),
      $("#purchase-item-desc").html(h < 0 ? L.notEnoughMoney : i);
    for (c in f.equip) j[c] = f.equip[c];
    (j[
      "Mhand" == e.group
        ? ["Mlhand", "Mrhand"][Math.floor(2 * Math.random())]
        : e.group
    ] = d),
      renderMoremi("#moremi-after", j, "shop"),
      ($data._sgood = d),
      $stage.dialog.purchaseOK.attr("disabled", h < 0),
      h < 0
        ? b.addClass("purchase-not-enough")
        : b.removeClass("purchase-not-enough");
  }

  function vibrate(a) {
    a < 1 ||
      ($("#Middle").css("padding-top", a),
      addTimeout(function () {
        $("#Middle").css("padding-top", 0), addTimeout(vibrate, 50, 0.7 * a);
      }, 50));
  }

  function pushDisplay(a, b, c, d) {
    var e,
      f,
      g,
      h,
      i,
      j,
      z = MODE[$data.room.mode],
      RULE = JSON.parse($("#RULE").html()),
      k = "KKT" == MODE[$data.room.mode],
      l = "KAP" == MODE[$data.room.mode],
      m = BEAT[(e = a.length)],
      n = 0,
      o = $data.turnTime / 96,
      p = $data.turnTime / 12;
    if (
      ($stage.game.display.empty(),
      m
        ? ((f = "As" + $data._speed), (m = m.split("")))
        : "en" == RULE[MODE[$data.room.mode]].lang && e < 10
        ? (f = "As" + $data._speed)
        : ((f = "Al"), vibrate(e)),
      (g = "K" + $data._speed),
      m)
    ) {
      for (h in m)
        "0" != m[h] &&
          ($stage.game.display.append(
            (i = $("<div>")
              .addClass("display-text")
              .css({
                float: l ? "right" : "left",
                "margin-top": -6,
                "font-size": 36,
              })
              .hide()
              .html(l ? a.charAt(e - n - 1) : a.charAt(n)))
          ),
          n++,
          addTimeout(
            function (a, b) {
              var c = {
                "margin-top": 0,
              };
              playSound(b),
                a.html() == $data.mission
                  ? (playSound("mission"),
                    a.css({
                      color: "#66FF66",
                    }),
                    (c["font-size"] = 24))
                  : (c["font-size"] = 20),
                a.show().animate(c, 100);
            },
            Number(h) * o,
            i,
            f
          ));
      (h = $stage.game.display.children("div").get(0)),
        $(h).css(
          l ? "margin-right" : "margin-left",
          0.5 * ($stage.game.display.width() - 20 * e)
        );
    } else if (((n = ""), l))
      for (h = 0; h < e; h++)
        addTimeout(
          function (a) {
            playSound(f),
              a == $data.mission
                ? (playSound("mission"),
                  (n = "<label style='color: #66FF66;'>" + a + "</label>" + n))
                : (n = a + n),
              $stage.game.display.html(n);
          },
          (Number(h) * p) / e,
          a[e - h - 1]
        );
    else
      for (h = 0; h < e; h++)
        addTimeout(
          function (a) {
            playSound(f),
              a == $data.mission
                ? (playSound("mission"),
                  (n += "<label style='color: #66FF66;'>" + a + "</label>"))
                : (n += a),
              $stage.game.display.html(n);
          },
          (Number(h) * p) / e,
          a[h]
        );
    addTimeout(function () {
      for (h = 0; h < 3; h++)
        addTimeout(
          function (a) {
            if (k) {
              if (1 == a) return;
              playSound("kung");
            }
            (m
              ? $stage.game.display.children(".display-text")
              : $stage.game.display
            )
              .css("font-size", 21)
              .animate(
                {
                  "font-size": 20,
                },
                o
              );
          },
          h * o * 2,
          h
        );
      addTimeout(pushHistory, 4 * o, a, b, c, d), k || playSound(g);
    }, p);
  }

  function pushHint(a) {
    var b,
      c = processWord("", a);
    $stage.game.hints.append(
      (b = $("<div>")
        .addClass("hint-item")
        .append($("<label>").html(c))
        .append(
          $("<div>")
            .addClass("expl")
            .css({
              "white-space": "normal",
              width: 200,
            })
            .html(c.html())
        ))
    ),
      mobile ||
        b.width(0).animate({
          width: 215,
        }),
      global.expl(b);
  }

  function pushHistory(a, b, c, d) {
    var e,
      f,
      g,
      h = d ? d.split(",") : [],
      i = {};
    $stage.game.history.prepend(
      (e = $("<div>")
        .addClass("ellipse history-item")
        .width(0)
        .animate({
          width: 200,
        })
        .html(a))
    ),
      (f = $stage.game.history.children()),
      f.length > 6 && f.last().remove(),
      (g = processWord(a, b, c, h)),
      h.forEach(function (a) {
        i[a] ||
          (L["class_" + a] &&
            ((i[a] = !0),
            e.append(
              $("<label>")
                .addClass("history-class")
                .html(L["class_" + a])
            )));
      }),
      e
        .append((f = $("<div>").addClass("history-mean ellipse").append(g)))
        .append(
          $("<div>")
            .addClass("expl")
            .css({
              width: 200,
              "white-space": "normal",
            })
            .html("<h5 style='color: #BBBBBB;'>" + g.html() + "</h5>")
        ),
      global.expl(e);
  }

  function processNormal(a, b) {
    return $("<label>").addClass("word").html(b);
  }

  function processWord(a, b, c, d) {
    function e(a) {
      return a
        .replace(/\$\$[^\$]+\$\$/g, function (a) {
          return (
            "<equ>" +
            a
              .slice(2, a.length - 2)
              .replace(/\^\{([^\}]+)\}/g, "<sup>$1</sup>")
              .replace(/_\{([^\}]+)\}/g, "<sub>$1</sub>")
              .replace(/\\geq/g, "≥") +
            "</equ>"
          );
        })
        .replace(/\*\*([^\*]+)\*\*/g, "<sup>$1</sup>")
        .replace(/\*([^\*]+)\*/g, "<sub>$1</sub>");
    }
    if (!b || -1 == b.indexOf("＂")) return processNormal(a, b);
    var f = $("<label>").addClass("word"),
      g = b
        .split(/＂[0-9]+＂/)
        .slice(1)
        .map(function (a) {
          return -1 == a.indexOf("［")
            ? [[a]]
            : a
                .split(/［[0-9]+］/)
                .slice(1)
                .map(function (a) {
                  return a.split(/（[0-9]+）/).slice(1);
                });
        }),
      h =
        (d &&
          d.map(function (a) {
            return L["class_" + a];
          }),
        c
          ? c.split(",").map(function (a) {
              return L["theme_" + a];
            })
          : []),
      i = g.length > 1;
    return (
      g.forEach(function (a, b) {
        var c = $("<label>").addClass("word-m1"),
          d = a.length > 1;
        i &&
          c.append(
            $("<label>")
              .addClass("word-head word-m1-head")
              .html(b + 1)
          ),
          a.forEach(function (a, b) {
            var f = $("<label>").addClass("word-m2"),
              g = a.length,
              i = g > 1,
              j = h.splice(0, g);
            d &&
              f.append(
                $("<label>")
                  .addClass("word-head word-m2-head")
                  .html(b + 1)
              ),
              a.forEach(function (a, b) {
                var c = $("<label>").addClass("word-m3"),
                  d = j.shift();
                i &&
                  c.append(
                    $("<label>")
                      .addClass("word-head word-m3-head")
                      .html(b + 1)
                  ),
                  d && c.append($("<label>").addClass("word-theme").html(d)),
                  c.append($("<label>").addClass("word-m3-body").html(e(a))),
                  f.append(c);
              }),
              c.append(f);
          }),
          f.append(c);
      }),
      f
    );
  }

  function getCharText(a, b, c) {
    var d = a + (b ? "(" + b + ")" : "");
    return (
      c && (d += "<label class='jjo-display-word-length'>(" + c + ")</label>"),
      d
    );
  }

  function getRequiredScore(a) {
    return Math.round(
      (0.3 * !(a % 5) + 1) *
        (0.4 * !(a % 15) + 1) *
        (0.5 * !(a % 45) + 1) *
        (120 +
          60 * Math.floor(a / 5) +
          120 * Math.floor((a * a) / 225) +
          180 * Math.floor((a * a) / 2025))
    );
  }

  function getLevel(a) {
    var b,
      c = EXP.length;
    for (b = 0; b < c && !(a < EXP[b]); b++);
    return b + 1;
  }

  function getLevelImage(user) {
    var lv = getLevel(user.data.score) - 1;
    var lX = (lv % 25) * -100;
    var lY = Math.floor(lv * 0.04) * -100;

    if (user.gm)
      return $("<div>").css({
        float: "left",
        "background-image": `url('https://cdn.jsdelivr.net/npm/bfkkutudelivr@latest/img/kkutu/lv/lvGM.png')`,
        "background-position": "100% 100%",
        "background-size": "100%",
      });
    return $("<div>").css({
      float: "left",
      "background-image": `url('https://cdn.jsdelivr.net/npm/bfkkutudelivr@latest/img/kkutu/lv/newlv.png')`,
      "background-position": lX + "% " + lY + "%",
      "background-size": "2560%",
    });
  }

  function getImage(a) {
    return $("<div>")
      .addClass("jt-image")
      .css("background-image", "url('" + a + "')");
  }

  function getOptions(a, b, c) {
    var d,
      e,
      f = [L["mode" + MODE[a]]];
    for (d in OPTIONS)
      (e = OPTIONS[d].name.toLowerCase()),
        b[e] && f.push(L["opt" + OPTIONS[d].name]);
    return c && f.push(b.injpick.join("|")), c ? f.toString() : f;
  }

  function setRoomHead(a, b) {
    var c,
      d = getOptions(b.mode, b.opts),
      e = RULE[MODE[b.mode]];
    a
      .empty()
      .append(
        $("<h5>")
          .addClass("room-head-number")
          .html("[" + (b.practice ? L.practice : b.id) + "]")
      )
      .append($("<h5>").addClass("room-head-title").text(badWords(b.title)))
      .append((c = $("<h5>").addClass("room-head-mode").html(d.join(" / "))))
      .append(
        $("<h5>")
          .addClass("room-head-limit")
          .html(
            (mobile ? "" : L.players + " ") + b.players.length + " / " + b.limit
          )
      )
      .append(
        $("<h5>")
          .addClass("room-head-round")
          .html(L.rounds + " " + b.round)
      )
      .append(
        $("<h5>")
          .addClass("room-head-time")
          .html(b.time + L.SECOND)
      ),
      -1 != e.opts.indexOf("ijp") &&
        (c.append(
          $("<div>")
            .addClass("expl")
            .html(
              "<h5>" +
                b.opts.injpick.map(function (a) {
                  return L["theme_" + a];
                }) +
                "</h5>"
            )
        ),
        global.expl(a));
  }

  function loadSounds(a, b) {
    ($data._lsRemain = a.length),
      a.forEach(function (a) {
        getAudio(a.key, a.value, b);
      });
  }

  function getAudio(a, b, c) {
    function d(c) {
      ($sound[a] = new f(b)), e();
    }

    function e() {
      0 == --$data._lsRemain
        ? c && c()
        : loading(L.loadRemain + $data._lsRemain);
    }

    function f(a) {
      var b = this;
      (this.audio = new Audio(a)),
        this.audio.load(),
        (this.start = function () {
          b.audio.play();
        }),
        (this.stop = function () {
          (b.audio.currentTime = 0), b.audio.pause();
        });
    }
    var g = new XMLHttpRequest();
    g.open("GET", b),
      (g.responseType = "arraybuffer"),
      (g.onload = function (b) {
        audioContext
          ? audioContext.decodeAudioData(
              b.target.response,
              function (b) {
                ($sound[a] = b), e();
              },
              d
            )
          : d();
      }),
      g.send();
  }

  function playBGM(a) {
    return (
      $data.bgm && $data.bgm.stop(),
      ($data.bgm = playSound(a === "lobby" ? $("#bgmselect").val() : a, true))
    );
  }

  function stopBGM() {
    $data.bgm && ($data.bgm.stop(), !$data.admin && ($data.bgm = undefined));
  }

  function playSound(key, loop) {
    var src;
    const volume = $(loop ? "#bgmvol" : "#effvol").val();
    const sound = $sound[key] || $sound.missing;

    if (typeof sound === "undefined") return;
    if (window.hasOwnProperty("AudioBuffer") && sound instanceof AudioBuffer) {
      const gainNode = audioContext.createGain();
      src = audioContext.createBufferSource();
      src.startedAt = audioContext.currentTime;
      src.loop = loop;
      if (volume) {
        gainNode.gain.value = volume;
        src.buffer = sound;
      } else {
        gainNode.gain.value = 0;
        src.buffer = audioContext.createBuffer(
          2,
          sound.length,
          audioContext.sampleRate
        );
      }
      gainNode.connect(audioContext.destination);
      src.connect(gainNode);
    } else {
      if (sound.readyState) sound.audio.currentTime = 0;
      sound.audio.loop = loop || false;
      sound.audio.volume = volume;
      src = sound;
    }
    if ($_sound[key]) $_sound[key].stop();
    $_sound[key] = src;
    src.key = key;
    src.start();

    return src;
  }

  function stopAllSounds() {
    var a;
    for (a in $_sound) $_sound[a].stop();
  }

  async function tryJoin(a) {
    var b;
    function pwCheck() {
      return new Promise((resolve) => {
        resolve(
          Swal.fire({
            title: L.putPassword,
            input: "password",
            inputPlaceholder: L.putPassword,
            inputAttributes: {
              autocapitalize: "off",
              autocorrect: "off",
            },
          })
        );
      });
    }
    $data.rooms[a] &&
      (($data.rooms[a].password &&
        !((b = await pwCheck()) /*prompt(L.putPassword)*/)) ||
        (($data._pw = $data.rooms[a].password ? b.value : b),
        send("enter", {
          id: a,
          password: $data.rooms[a].password ? b.value : b,
        })));
  }

  function clearChat() {
    $("#Chat").empty();
  }

  function initItem(item) {
    $(".ChatBox").height(180);
    $("#Chat").height(110);
    $item = item || {
      turnSkip: {
        limit: 1,
        count: 0,
      },
      changeMission: {
        limit: 3,
        count: 0,
      },
      reverse: {
        limit: 2,
        count: 0,
      },
      jump: {
        limit: 2,
        count: 0,
      },
      middleToss: {
        limit: 5,
        count: 0,
      },
    }; // 아이템 정보 초기화
    if (MODE[$data.room.mode] != "KKT") delete $item["middleToss"];
    if ($data.room.opts.randomturn) {
      delete $item["reverse"];
      delete $item["jump"];
    } else delete $item["turnSkip"];
    if (!$data.room.opts.mission) delete $item["changeMission"];
    $("#turnSkip").toggle(!!$data.room.opts.randomturn);
    $("#changeMission").toggle(!!$data.room.opts.mission);
    $("#reverse").toggle(!$data.room.opts.randomturn);
    $("#jump").toggle(!$data.room.opts.randomturn);
    $("#middleToss").toggle(MODE[$data.room.mode] == "KKT");
  }

  function forkChat() {
    var a = $("#Chat,#chat-log-board"),
      b = a.children(".chat-item").last().get(0);
    (b && "HR" == b.tagName) ||
      (a.append($("<hr>").addClass("chat-item")),
      $stage.chat.scrollTop(999999999));
  }

  function checkBad(a, b) {
    if (a == 0) {
      return (badSign = "NONE");
    }
    if (a == 4) {
      return (badSign = "LOW");
    }
    if (a == 7) {
      return (badSign = "MID");
    }
    if (a == 10) {
      return (badSign = "HIGH");
    }
    if (a == 19) {
      return (badSign = "WARN");
    }
    if (a == 26) {
      return (badSign = "DANGER");
    }

    return badSign;
  }

  function badWords(a, sender) {
    let filter = $("#badwordfilter").val().substr(0, 2);
    if (!sender) sender = {};
    if (OSV.test(a) && $("#hide-otherkkutu").is(":checked"))
      a = a.replace(OSV, "[타서버 필터링]");
    if (OSVURL.test(a)) a = a.replace(OSVURL, "[타서버 링크 공유 금지]");
    if (XSS.test(a) && !sender.admin) a = a.replace(XSS, "-");
    if (BAD.test(a) && filter != "NO") a = a.replace(BAD, filter);
    return a;
  }

  function checkBadWords(text) {
    return (
      OSV.test(text) || OSVURL.test(text) || XSS.test(text) || BAD.test(text)
    );
  }

  function continuingBadWords(originText, sender) {
    let filter = $("#badwordfilter").val().substr(0, 2);
    text = precedeChat + originText;
    precedeChat = originText;
    if (badWords(text, sender) != text)
      return filter + originText.split(originText.charAt(0))[1];
    else return originText;
  }

  function checkBadURL(a) {
    if (!a.includes("http")) return false;
    else {
      if (BAD.test(a)) {
        $.post("/report", {
          target: $data.id,
          submitter: "BadURL_AutoChecker",
          reason: `${a}`,
        });
        alertSync("유해 링크로 판단되어 자동으로 신고처리 되었습니다.");
        return true;
      } else return false;
    }
  }

  function delBadWords(text) {
    if (OSV.test(text)) text = text.replace(OSV, "");
    if (XSS.test(text)) text = text.replace(XSS, "");
    if (BAD.test(text)) text = text.replace(BAD, "");
    return text;
  }

  function getRank(a) {
    if (a.rank) return a.rank;
    if (a.data.rankPoint < 5000)
      return calculateRank(a.data.rankPoint, null, null);
    else return getRankName(a.data.rankPoint, a.id);
  }

  function getRankImage(a, b) {
    var rank = getRankName(a, b);
    return $("<div>").css({
      float: "left",
      "background-image": `url('https://cdn.jsdelivr.net/npm/bfkkutudelivr@${L.cdn_version}/img/kkutu/rankicon/${rank}.png')`,
      "background-position": "100% 100%",
      "background-size": "100%",
    });
  }

  function getRankName(rankPoint, b) {
    var rpRanking = JSON.parse(getRes("/rpRanking"));

    return calculateRank(rankPoint, b, rpRanking);
  }

  function getRankList(a) {
    var i,
      list = {};

    if (!a) {
      var rpRanking = JSON.parse(getRes("/rpRanking"));

      for (i in rpRanking.data) {
        list[rpRanking.data[i].id] = calculateRank(
          rpRanking.data[i].score,
          rpRanking.data[i].id,
          rpRanking
        );
      }
      return list;
    } else {
      for (i in a.data) {
        list[a.data[i].id] = calculateRank(a.data[i].score, a.data[i].id, a);
      }
      return list;
    }
  }

  function calculateRank(rankPoint, b, c) {
    var rank = "UNRANKED";

    if (rankPoint >= 5000) {
      // 5000점 이상
      rank = "MASTER";
      if (c.data[0].id == b) rank = "CHAMPION";
      if (c.data[1].id == b || c.data[2].id == b) rank = "CHALLENGER";
      if ($data.users[b] && !$data.users[b].rank) $data.users[b].rank = rank;
    } else {
      if (rankPoint >= 50 && rankPoint < 1000) {
        rank = "BRONZE";
      } else if (rankPoint >= 1000 && rankPoint < 2000) {
        rank = "SILVER";
      } else if (rankPoint >= 2000 && rankPoint < 3000) {
        rank = "GOLD";
      } else if (rankPoint >= 3000 && rankPoint < 4000) {
        rank = "PLATINUM";
      } else if (rankPoint >= 4000 && rankPoint < 5000) {
        rank = "DIAMOND";
      }
    }
    return rank;
  }

  function chatBalloon(a, b, c) {
    $("#cb-" + b).remove();
    var d,
      e,
      f = (2 & c ? $("#game-user-" + b) : $("#room-user-" + b)).offset(),
      g = 2 == c ? "chat-balloon-bot" : "chat-balloon-tip",
      h = $("<div>")
        .addClass("chat-balloon")
        .attr("id", "cb-" + b)
        .append($("<div>").addClass("jt-image " + g))
        [2 == c ? "prepend" : "append"]($("<h4>").html(a));
    f &&
      ($stage.balloons.append(h),
      1 == c
        ? ((d = 0), (e = 220))
        : 2 == c
        ? ((d = 35 - h.height()), (e = -2))
        : 3 == c
        ? ((d = 5), (e = 210))
        : ((d = 40), (e = 110)),
      h.css({
        top: f.top + d,
        left: f.left + e,
      }),
      addTimeout(function () {
        h.animate(
          {
            opacity: 0,
          },
          500,
          function () {
            h.remove();
          }
        );
      }, 2500));
  }

  function getBad(a) {
    if (badSign == "NONE")
      a.html(
        `<h4>욕설 사용량:</h4><div id="cursing-count">확인된 욕설이 없습니다.(횟수: ${badCount.toString()})</div>`
      );
    if (badSign == "LIT")
      a.html(
        `<h4>욕설 사용량:</h4><div id="cursing-count">매우 낮음(사용횟수: ${badCount.toString()})</div>`
      );
    if (badSign == "LOW")
      a.html(
        `<h4>욕설 사용량:</h4><div id="cursing-count">낮음(사용횟수: ${badCount.toString()})</div>`
      );
    if (badSign == "MID")
      a.html(
        `<h4>욕설 사용량:</h4><div id="cursing-count">조금 높음(사용횟수: ${badCount.toString()})</div>`
      );
    if (badSign == "HIGH")
      a.html(
        `<h4>욕설 사용량:</h4><div id="cursing-count">높음(사용횟수: ${badCount.toString()})</div>`
      );
    if (badSign == "WARN")
      a.html(
        `<h4>욕설 사용량:</h4><div id="cursing-count">매우 높음(사용횟수: ${badCount.toString()})</div>`
      );
  }

  function chat(a, b, c, d) {
    let e,
      f,
      g,
      h,
      i = d ? new Date(d) : new Date(),
      j = $data.users[a.id] ? $data.users[a.id].equip : {},
      p,
      v,
      s = "";
    if ($data.room && !c) {
      p = $(".room-users")[0].children[`room-user-${a.id}`];
      if (!p)
        updateRoom(!1),
          (p = $(".room-users")[0].children[`room-user-${a.id}`]),
          (v = p.innerText.includes(L.stat_spectate));
      else v = p.innerText.includes(L.stat_spectate);
      !v ? (s = "") : (s = "x-spectator");
    }
    if (!$data._shut[a.title || a.name]) {
      if (c) {
        if ($data.opts.dw) return;
        if ($data._wblock[c]) return;
      }
      checkBadURL(b) ? (b = "유해 링크로 판단되어 검열되었습니다.") : (b = b),
        (b = badWords(b, $data.users[a.id])),
        (b = continuingBadWords(b, $data.users[a.id])),
        playSound("k"),
        stackChat(),
        !mobile &&
          $data.room &&
          ((e =
            ($data.room.gaming ? 2 : 0) +
            ($(".jjoriping").hasClass("cw") ? 1 : 0)),
          chatBalloon(b, a.id, e)),
        $stage.chat.append(
          (g = $("<div>")
            .addClass("chat-item")
            .append(
              (e = $("<div>")
                .addClass(`chat-head ellipse ${s}`)
                .text(a.title || a.name))
            )
            .append(
              (f =
                /*$data.equip["BDG"]==="b6_develop"||$data.equip["BDG"]==="b9_bf"*/ false
                  ? $("<div>").addClass("chat-body").html(b)
                  : $("<div>").addClass("chat-body").html(b))
            )
            .append(
              $("<div>").addClass("chat-stamp").text(i.toLocaleTimeString())
            ))
        ),
        d && e.prepend($("<i>").addClass("fa fa-video-camera")),
        e.on("click", function (b) {
          $data.admin && b.shiftKey
            ? (showDialog($stage.dialog.management),
              $("#target-id").text(a.id),
              $("#target-nickname").text($data.users[a.id].nickname))
            : requestProfile(a.id);
        }),
        $stage.chatLog.append((g = g.clone())),
        g.append(
          $("<div>")
            .addClass("expl")
            .css("font-weight", "normal")
            .html("#" + (a.id || "").substr(0, 5))
        ),
        (h = b.match(/https?:\/\/[\w\.\?\/&#%=-_\+]+/g)) &&
          ((b = f.html()),
          h.forEach(function (a) {
            b = b.replace(
              a,
              `<a href='#' style='color: #2222FF;' onclick='if(confirm("${L.linkWarning}")) window.open("${a}");'>${a}</a>`
            );
          }),
          f.html(b)),
        c &&
          (!0 !== c && ($data._recentFrom = c),
          f.html(
            "<label style='color: #7777FF; font-weight: bold;'>&lt;" +
              L.whisper +
              "&gt;</label>" +
              f.html()
          )),
        addonNickname(e, {
          equip: j,
        }),
        $stage.chat.scrollTop(999999999);
    }
  }

  function reverse(a) {
    return a.split("").reverse().join("");
  }

  function drawCanvas(a) {
    route("drawCanvas", a);
  }

  function notice(a, b) {
    var c = new Date();
    playSound("k"),
      stackChat(),
      $("#Chat,#chat-log-board").append(
        $("<div>")
          .addClass("chat-item chat-notice")
          .append(
            $("<div>")
              .addClass("chat-head")
              .text(b || L.notice)
          )
          .append($("<div>").addClass("chat-body").text(a))
          .append(
            $("<div>").addClass("chat-stamp").text(c.toLocaleTimeString())
          )
      ),
      $stage.chat.scrollTop(999999999),
      "tail" == b && console.warn(c.toLocaleString(), a);
  }

  function stackChat() {
    var a = $("#Chat .chat-item"),
      b = $("#chat-log-board .chat-item");
    a.length > 99 && a.first().remove(), b.length > 199 && b.first().remove();
  }

  function iGoods(a) {
    var b;
    return (
      (b = "$" == a.charAt() ? $data.shop[a.slice(0, 4)] : $data.shop[a]),
      {
        _id: a,
        group: b.group,
        term: b.term,
        name: iName(a),
        cost: b.cost,
        image: iImage(a, b),
        desc: iDesc(a),
        options: b.options,
      }
    );
  }

  function iName(a) {
    return "$" == a.charAt()
      ? L[a.slice(0, 4)][0] + " - " + a.slice(4)
      : L[a][0];
  }

  function iDesc(a) {
    return "$" == a.charAt() ? L[a.slice(0, 4)][1] : L[a][1];
  }

  function iImage(a, b) {
    var c, d;
    if (a) {
      if ("$" == a.charAt()) return iDynImage(a.slice(1, 4), a.slice(4));
    } else
      "string" == typeof b &&
        (b = {
          _id: "def",
          group: b,
          options: {},
        });
    return (
      (c = $data.shop[a] || b),
      (d = c.options.hasOwnProperty("gif") ? ".gif" : ".png"),
      "BDG" == c.group.slice(0, 3)
        ? `https://cdn.jsdelivr.net/npm/bfkkutudelivr@${L.cdn_version}/img/kkutu/moremi/badge/` +
          c._id +
          d
        : "M" == c.group.charAt(0)
        ? `https://cdn.jsdelivr.net/npm/bfkkutudelivr@${L.cdn_version}/img/kkutu/moremi/` +
          (c.group.slice(1) != "heco" ? c.group.slice(1) : "head") +
          "/" +
          c._id +
          d
        : `https://cdn.jsdelivr.net/npm/bfkkutudelivr@${L.cdn_version}/img/kkutu/shop/` +
          c._id +
          ".png"
    );
  }

  function iDynImage(a, b) {
    var c,
      d = document.createElement("canvas"),
      e = d.getContext("2d");
    switch (
      ((d.width = d.height = 50),
      (e.font = "24px NBGothic"),
      (e.textAlign = "center"),
      (e.textBaseline = "middle"),
      a)
    ) {
      case "WPE":
      case "WPC":
      case "WPB":
      case "WPA":
        (c = ["WPE", "WPC", "WPB", "WPA"].indexOf(a)),
          e.beginPath(),
          e.arc(25, 25, 25, 0, 2 * Math.PI),
          (e.fillStyle = ["#FFCC00", "#DDDDDD", "#A6C5FF", "#FFEF31"][c]),
          e.fill(),
          (e.fillStyle = ["#000000", "#000000", "#4465C3", "#E69D12"][c]),
          e.fillText(b, 25, 25);
    }
    return d.toDataURL();
  }

  function iNTGImage(a) {
    var b, c;
    return (
      (c = $data.shop[a]),
      (b = c.options.hasOwnProperty("gif") ? ".gif" : ".png"),
      `https://cdn.jsdelivr.net/npm/bfkkutudelivr@${L.cdn_version}/img/kkutu/moremi/nametag/` +
        c._id +
        b
    );
  }

  function queueObtain(a) {
    $stage.dialog.obtain.is(":visible")
      ? $data._obtain.push(a)
      : (drawObtain(a), showDialog($stage.dialog.obtain, !0));
  }

  function drawObtain(a) {
    playSound("success"),
      $("#obtain-image").css("background-image", "url(" + iImage(a.key) + ")"),
      $("#obtain-name").html(iName(a.key));
  }

  function renderMoremi(a, b, r) {
    var c,
      d,
      s = b.MSKIN,
      e = $(a).empty(),
      f = {
        Mlhand: "Mhand",
        Mrhand: "Mhand",
      };
    if (r !== "shop") {
      var u = $data.users[r];
      if (u !== undefined)
        var o =
          u.data.rankPoint < 5000
            ? calculateRank(u.data.rankPoint, null, null)
            : getRank(u);
    }
    if (!s) s = "def";
    else if (s == "hide_moremi") {
      for (c in MOREMI_PART)
        (d = "M" + MOREMI_PART[c]),
          e.append(
            $("<img>")
              .addClass("moremies moremi-" + d.slice(1))
              .attr(
                "src",
                `https://cdn.jsdelivr.net/npm/bfkkutudelivr@${L.cdn_version}/img/kkutu/def.png`
              )
              .css({
                width: "100%",
                height: "100%",
              })
          );
      return;
    }
    b || (b = {});
    for (c in MOREMI_PART)
      (d = "M" + MOREMI_PART[c]),
        e.append(
          $("<img>")
            .addClass("moremies moremi-" + d.slice(1))
            .attr("src", iImage(b[d], f[d] || d))
            .css({
              width: "100%",
              height: "100%",
            })
        );
    (d = b.BDG) &&
      e.append(
        $("<img>")
          .addClass("moremies moremi-badge")
          .attr("src", iImage(d))
          .css({
            width: "100%",
            height: "100%",
          })
      );
    e.children(".moremi-back").after(
      $("<img>")
        .addClass("moremies moremi-body")
        .attr(
          "src",
          b.robot
            ? `https://cdn.jsdelivr.net/npm/bfkkutudelivr@${L.cdn_version}/img/kkutu/moremi/robot.png`
            : `https://cdn.jsdelivr.net/npm/bfkkutudelivr@${L.cdn_version}/img/kkutu/moremi/skin/${s}.png`
        )
        .css({
          width: "100%",
          height: "100%",
        })
    );
    e.children(".moremi-rhand").css("transform", "scaleX(-1)");
    if (r != "shop" && u != undefined) {
      if (o !== "UNRANKED") {
        e.append(
          $("<img>")
            .addClass("moremies moremi-tier")
            .attr(
              "src",
              `https://cdn.jsdelivr.net/npm/bfkkutudelivr@${L.cdn_version}/img/kkutu/rankedge/` +
                o +
                ".png"
            )
            .css({
              width: "100%",
              height: "100%",
            })
        );
      }
    }
  }

  function commify(a) {
    var b = /(^[+-]?\d+)(\d{3})/;
    if (null === a) return "?";
    for (a = a.toString(); b.test(a); ) a = a.replace(b, "$1,$2");
    return a;
  }

  function setLocation(a) {
    location.hash = a ? "#" + a : "";
  }

  async function fail(a) {
    return await alert(L["error_" + a]);
  }

  function yell(a) {
    $stage.yell.show().css("opacity", 1).text(a),
      addTimeout(function () {
        $stage.yell.animate(
          {
            opacity: 0,
          },
          3e3
        ),
          addTimeout(function () {
            $stage.yell.hide();
          }, 3e3);
      }, 1e3);
  }
  var MODE,
    BEAT = [
      null,
      "10000000",
      "10001000",
      "10010010",
      "10011010",
      "11011010",
      "11011110",
      "11011111",
      "11111111",
    ],
    NULL_USER = {
      profile: {
        title: L.null,
      },
      data: {
        score: 0,
      },
    },
    MOREMI_PART,
    AVAIL_EQUIP,
    RULE,
    OPTIONS,
    MAX_LEVEL = 366,
    TICK = 30,
    EXP = [],
    BAD = new RegExp(
      [
        "(시|싀|쉬|슈|씨|쒸|씌|쓔|쑤|시이{1,}|싀이{1,}|쉬이{1,}|씨이{1,}|쒸이{1,}|씌이{1,}|찌이{1,}|스|쓰|쯔|스으{1,}|쓰으{1,}|쯔으{1,}|수우{1,}|쑤우{1,}|십|싑|쉽|슙|씹|쓉|씝|쓥|씁|싶|싚|슆|슾|앂|씦|쓒|씊|쑾|ㅅ|ㅆ|ㅅㅣ{1,}|ㅅ이{1,}|ㅆ이{1,}|c|c이{1,}|C|C이{1,}|Ⓒ|Ⓒ이{1,}|^^ㅣ|^^I|^^l)[^가-힣]*(바|발|팔|빠|빨|불|벌|벨|밸|빠|ㅂ|ㅃ|ㅍ)",
        "(뷩|병|뱡|뱅|뱡|빙|븅|븽|뷰웅|비잉|볭|뱽|뼝|뺑|쁑|삥|삉|뺭|뼈엉|쀼웅|ㅂ)[^가-힣]*(쉰|신|싄|슨|씬|씐|진|즨|ㅅ|딱|시인|시나)",
        "(샛|섓|쌧|썠|쌨|샜|섔|쌨|썠|새|섀|세|셰|썌|쎼)[^가-힣]*(기|끼|끠|애끼|에끼)",
        "(저새|저색|저샛|저쉑|저샛|저셋|저섀|저셰|저쌔|저쎄|저썌|저쎼)[^가-힣]*(기|애{1,}기|에{1,}기|)",
        "(개|게|걔|깨|께|꼐|꺠)[^가-힣]*(같|새|샛|세|섀|셰)",
        "(니|닝|느|노|늬|너|쟤|걔|ㄴ)[^가-힣]*(ㄱㅁ|ㄱㅃ|ㅇㅁ|ㅇㅂ|엄{1,}마|검{1,}마|검|금|앰|앱|애{1,}비|애{1,}미|에{1,}미|에{1,}비|애{1,}믜|애{1,}븨|아{1,}빠|엄{1,}빠|의미|의비|븨|믜)",
        "(ㄱㅁ|ㄱㅃ|ㅇㅁ|ㅇㅂ|엄마|검마|앰|아빠|엄빠)[^가-힣]*(죽|뒤|돌|없)",
        "(앰|엠|얨|옘|앱|엡|옙|얩)[^가-힣]*(창|챵|촹|생|섕|셍|솅|쉥)",
        "(세|섹|색|쉑|쇡|세엑{1,}크|세액{1,}크|세크|새크|새에{1,}크|새애{1,}크|셍|셱|섁|세그|세엑|세액|세에{1,}엑|세애{1,}액|쎅|쎽|쎆|쎾|셲)[^가-힣]*(ㅅ|스|슥|슨|슫|슷|승|로스)",
        "(ㅈ|젓|젔|젇|젖|좟|좠|좓|좢)[^가-힣]*(뒏|됟|됫|됬|됏|됐|됃|같|갇|까|가|까)",
        "(자|쥬|자아{1,}|잠|좌|좌아{1,}|잗|잣|쟈|쟈아{1,}|보|뷰|보오{1,}|볻|봇|뵤)[^가-힣]*(지|짓|짇|즤|즫|즷|즹|빨)",
        "(질|입|안|밖)[^가-힣]*(싸)",
        "(후|훚|훗|훋)[^가-힣]*(장|쟝|좡)",
        "(꼬|보|딸|똘|빡)[^가-힣]*(추)",
        "(미친|잡|쓰레기|거지|그지|똥|ㅣ발)[^가-힣]*(녀석|놈|충|자식|냐|냔|세|네|것)",
        "미친",
        "(버|벅|뻐|뻑|퍼|퍽)[^가-힣]*(큐|뀨)",
        "(호)[^가-힣]*(로|모|구)",
        "(스|수|쓰|쑤|쓔|스으{1,}|수우{1,}|슈우{1,}|쓰우{1,}|쑤으{1,}|쓔으{1,})[^가-힣]*(랙|렉|럑|롁|랚|렊|럒|롂)",
        "(지|즤|디|G|ㅣ|치|찌|지이|지이{1,}|즤이{1,}|G이{1,}|즤|G이)[^가-힣]*(랄|라알)",
        "(딸)[^가-힣]*(딸|치|쳐|쳤|침)",
        "발[^가-힣]*기",
        "풀[^가-힣]*발",
        "딸[^가-힣]*딸",
        "강[^가-힣]*간",
        "자[^가-힣]*위",
        "부[^가-힣]*랄",
        "불[^가-힣]*알",
        "오[^가-힣]*르[^가-힣]*가[^가-힣]*즘",
        "처[^가-힣]*녀[^가-힣]*막",
        "질[^가-힣]*내",
        "질[^가-힣]*외",
        "정[^가-힣]*액",
        "자[^가-힣]*궁",
        "생[^가-힣]*리",
        "월[^가-힣]*경",
        "페[^가-힣]*도",
        "또[^가-힣]*라[^가-힣]*이",
        "장[^가-힣]*애",
        "종[^가-힣]*간",
        "쓰[^가-힣]*레[^가-힣]*기",
        "무[^가-힣]*뇌",
        "학[^가-힣]*식[^가-힣]*충",
        "급[^가-힣]*식[^가-힣]*충",
        "버[^가-힣]*러[^가-힣]*지",
        "찌[^가-힣]*꺼[^가-힣]*기",
        "삐[^가-힣]*꾸",
        "닥[^가-힣]*쳐",
        "꺼[^가-힣]*져",
        "애[^가-힣]*자",
        "찌[^가-힣]*그[^가-힣]*레[^가-힣]*기",
        "대[^가-힣]*가[^가-힣]*리",
        "면[^가-힣]*상",
        "와[^가-힣]*꾸",
        "시[^가-힣]*빠[^가-힣]*빠",
        "파[^가-힣]*오[^가-힣]*후",
        "사[^가-힣]*까[^가-힣]*시",
        "씹[^가-힣]*덕",
        "애[^가-힣]*미",
        "엿[^가-힣]*먹",
        "애[^가-힣]*비",
        "새[^가-힣]*끼",
        "줬[^가-힣]*까",
        "(뒤)[^가-힣]*(져|진|졌|질|짐)",
        "살[^가-힣]*지[^가-힣]*마",
        "자[^가-힣]*살[^가-힣]*(해|하|헤)",
        "자[^가-힣]*살",
        "살[^가-힣]*해",
        "(좆|좃|좄|졷|줫|줮|줟|죶|죳|죴|죧|조오{1,}|조옷{1,}|조옺{1,})",
        "(좆|좃|좄|졷|줫|줮|줟|죶|죳|죴|죧|존|조오{1,}|조옷{1,}|조옺{1,})[^가-힣]*나",
        "씹|씹",
        "봊|봊",
        "잦|잦",
        "(섹|섻)",
        "썅|썅",
        "ㅗ{1,}",
        "ㅄ|ㅄ",
        "ㄲㅈ|ㄲㅈ",
        "(ㅈ)[^가-힣]*(ㅂㅅ|ㄲ|ㄹ|ㄴ)",
        "조[^가-힣]*건[^가-힣]*만[^가-힣]*남",
        "(f|F)[^A-Za-z]*(u|U)[^A-Za-z]*(c|C)[^A-Za-z]*(k|K)",
        "(s|S)[^A-Za-z]*(h|H)[^A-Za-z]*(i|I)[^A-Za-z]*(t|T)",
        "(d|D)[^A-Za-z]*(a|A)[^A-Za-z]*(d|D)",
        "(m|M)[^A-Za-z]*(o|O)[^A-Za-z]*(m|M)",
        "(m|M)[^A-Za-z]*(o|O)[^A-Za-z]*(t|T)[^A-Za-z]*(h|H)[^A-Za-z]*(e|E)[^A-Za-z]*(r|R)",
        "(f|F)[^A-Za-z]*(a|A)[^A-Za-z]*(t|T)[^A-Za-z]*(h|H)[^A-Za-z]*(e|E)[^A-Za-z]*(r|R)",
        "(d|D)[^A-Za-z]*(a|A)[^A-Za-z]*(m|M)[^A-Za-z]*(n|N)",
        "(s|S)[^A-Za-z]*(h|H)[^A-Za-z]*(u|U)[^A-Za-z]*(t|T)",
        "(b|B)[^A-Za-z]*(i|I)[^A-Za-z]*(t|T)[^A-Za-z]*(c|C)[^A-Za-z]*(h|H)",
        "(d|D)[^A-Za-z]*(i|I)[^A-Za-z]*(c|C)[^A-Za-z]*(k|K)",
        "(s|S)[^A-Za-z]*(e|E)[^A-Za-z]*x",
        "(b|B)[^A-Za-z]*(a|A)[^A-Za-z]*(s|S)[^A-Za-z]*(t|T)[^A-Za-z]*(a|A)[^A-Za-z]*(r|R)[^A-Za-z]*(d|D)",
        "(c|C)[^A-Za-z]*(u|U)[^A-Za-z]*(n|N)[^A-Za-z]*(t|T)",
        "(p|P)[^A-Za-z]*(u|U)[^A-Za-z]*(s|S)[^A-Za-z]*(s|S)[^A-Za-z]*(y|Y)",
        "(f|F)[^A-Za-z]*(a|A)[^A-Za-z]*(g|G)",
        "(n|N)[^A-Za-z]*(i|I)[^A-Za-z]*(g|G)[^A-Za-z]*(g|G)[^A-Za-z]*(e|E)[^A-Za-z]*(r|R)",
        "(n|N)[^A-Za-z]*(i|I)[^A-Za-z]*(g|G)[^A-Za-z]*(g|G)[^A-Za-z]*(a|A)",
        "(n|N)[^A-Za-z]*(i|I)[^A-Za-z]*(g|G)[^A-Za-z]*(r|R)[^A-Za-z]*(o|O)",
        "(j|J)[^A-Za-z]*(u|U)[^A-Za-z]*(n|N)[^A-Za-z]*(k|K)",
        "(m|M)[^A-Za-z]*(u|U)[^A-Za-z]*(f|F)[^A-Za-z]*(f|F)",
        "(p|P)[^A-Za-z]*(i|I)[^A-Za-z]*(s|S)[^A-Za-z]*(s|S)",
        "(r|R)[^A-Za-z]*(e|E)[^A-Za-z]*(t|T)[^A-Za-z]*(a|A)[^A-Za-z]*(r|R)[^A-Za-z]*(d|D)",
        "(s|S)[^A-Za-z]*(l|L)[^A-Za-z]*(u|U)[^A-Za-z]*(t|T)",
        "(t|T)[^A-Za-z]*(i|I)[^A-Za-z]*(t|T)[^A-Za-z]*(s|S)",
        "(t|T)[^A-Za-z]*(r|R)[^A-Za-z]*(a|A)[^A-Za-z]*(s|S)[^A-Za-z]*(h|H)",
        "(t|T)[^A-Za-z]*(w|W)[^A-Za-z]*(a|A)[^A-Za-z]*(t|T)",
        "(w|W)[^A-Za-z]*(a|A)[^A-Za-z]*(n|N)[^A-Za-z]*(k|K)",
        "(w|W)[^A-Za-z]*(h|H)[^A-Za-z]*(o|O)[^A-Za-z]*(r|R)[^A-Za-z]*(e|E)",
        "(s|S)[^A-Za-z]*(i|I)[^A-Za-z]*(b|B)[^A-Za-z]*(a|A)[^A-Za-z]*(l|L)",
        "(g|G)[^A-Za-z]*(a|A)[^A-Za-z]*(s|S)[^A-Za-z]*(a|A)[^A-Za-z]*(k|K)[^A-Za-z]*(i|I)",
        "(a|A)[^A-Za-z]*(s|S)[^A-Za-z]*(s|S)[^A-Za-z]*(h|H)[^A-Za-z]*(o|O)[^A-Za-z]*(l|L)[^A-Za-z]*(e|E)",
        "(t|T)[^A-Za-z]*(l|L)[^A-Za-z]*q[^A-Za-z]*(k|K)[^A-Za-z]*(f|F)",
        "(t|T)[^A-Za-z]*(p|P)[^A-Za-z]*(r|R)[^A-Za-z]*(t|T)[^A-Za-z]*(m|M)",
        "(s|S)[^A-Za-z]*(e|E)[^A-Za-z]*(e|E)[^A-Za-z]*(b|B)[^A-Za-z]*(a|A)[^A-Za-z]*(l|L)",
        "PORN",
      ].join("|")
    ),
    XSS = new RegExp(
      [
        "(&lt;|<)(i|I)(m|M)(g|G)",
        "(&lt;|<)(s|S)(c|C)(r|R)(i|I)(p|P)(t|T)",
        "(&lt;|<)(h|H)(1|2|3|4|5|6)",
        "(&lt;|<)(a|A)",
      ].join("|")
    ),
    OSV = new RegExp(
      [
        "(끄투|끄)[^가-힣]*(코리아|코)",
        "(끄투|끄)[^가-힣]*(닷|닷플|닷플러스)",
        "(행|행성)[^가-힣]*(끄|끄투)",
        "(분홍|분|핑|핑크|핑크빛|분홍꽃)[^가-힣]*(끄|끄투)",
        "(지|지빵)[^가-힣]*(끄|끄투)",
        "(이름|이름없는)[^가-힣]*(끄|끄투)",
        "(Vel|vel|벨)[^가-힣]*(Tu|tu|투)",
        "(kkutu|KKuTu|끄투)[^가-힣]*(plus|Plus|플러스)",
        "(레전드|레|레전|전설)[^가-힣]*(끄|끄투)",
        "(트|투)[^가-힣]*(꾸)",
        "(끄|끄투)[^가-힣]*(리오|리|io|rio)",
        "(투데이|오늘)[^가-힣]*(끄|끄투)",
        "(리)[^가-힣]*(오)",
        "(디보이)[^가-힣]*(끄|끄투)",
        "(끄투|끄|kkutu|KKuTu)[^가-힣]*(어스|us|Us)",
        "(저런)[^가-힣]*(닷컴|끄투)",
        "(Blue|blue|블루|블)[^가-힣]*(끄투|끄|KKuTu|kkutu)",
      ].join("|")
    ),
    OSVURL = new RegExp(
      [
        "kkutu.co.kr",
        "randomstudio.kro.kr",
        "kkutu.romanhue.xyz",
        "kimustory.kro.kr",
        "kkutu.plus",
        "dboikkutu.kro.kr",
        "kkutu.us",
        "legendkkutu.kro.kr",
        "kkutu.org",
        "kkutu.blue",
        "kkutuplus.ml",
        "jgkkutu.kr",
        "kkutu.today",
        "kkutu.top",
        "planetkt.kr",
        "kkutu.io",
        "veltu.kro.kr",
        "kkutu.pw",
        "bluekkutu.com",
      ].join("|")
    ),
    chatCooldown = false,
    precedeChat = "",
    beforeChat = "",
    ws,
    wsRetryInterval,
    rws,
    $stage,
    $cis,
    $sound = {},
    $_sound = {},
    $data = {},
    $clan = false,
    $lib = {
      Classic: {},
      DaneoClassic: {},
      Jaqwi: {},
      Crossword: {},
      Typing: {},
      Reverse: {},
      Hunmin: {},
      Daneo: {},
      Sock: {},
      Drawing: {},
    },
    $rec,
    $item = {},
    itemCommandEvent = (e) => {
      if (!$data.room || !$data.room.opts.item)
        $(document).off("keydown", itemCommandEvent);
      if (e.key.includes("F")) {
        e.preventDefault();
        $(`#${Object.keys($item)[Number(e.key.charAt(1)) - 1]}`).trigger(
          "click"
        );
        $(document).off("keydown", itemCommandEvent);
      }
    },
    tmntSettings = { hideSpectators: true },
    mobile,
    audioContext =
      !!window.hasOwnProperty("AudioContext") && new AudioContext(),
    _WebSocket = window.WebSocket,
    _setInterval = setInterval,
    _setTimeout = setTimeout;
  $("#Background").attr("src", "").addClass("jt-image").css({
    "background-image": "url(/img/kkutu/gamebg.png)",
    "background-size": "200px 200px",
  });
  $(document).ready(() => {
    if (!$.localStorage("kks")) {
      $data.opts = {
        di: $("#deny-invite").is(":checked"),
        dw: $("#deny-whisper").is(":checked"),
        df: $("#deny-friend").is(":checked"),
        ar: $("#auto-ready").is(":checked"),
        su: $("#sort-user").is(":checked"),
        ow: $("#only-waiting").is(":checked"),
        ou: $("#only-unlock").is(":checked"),
      };
      $.localStorage("kks", JSON.stringify($data.opts));
    } else $data.opts = JSON.parse($.localStorage("kks"));
    function a(a, b, c) {
      var d = a.position();
      $(window).on("mousemove", (e) => {
        var f = e.pageX - b,
          g = e.pageY - c;
        a.css("left", d.left + f), a.css("top", d.top + g);
      });
    }

    function b(a) {
      $(window).off("mousemove");
    }

    function c(a, b) {
      let available = [0, 0, 0, 0];
      for (let c in OPTIONS) {
        let d = OPTIONS[c].name.toLowerCase();
        if (a.indexOf(c) == -1) {
          $("#" + b + "-" + d + "-panel").hide();
        } else {
          available[OPTIONS[c].diff]++;
          $("#" + b + "-" + d + "-panel").show();
        }
      }
      for (let i in available) {
        if (i != 0)
          $(`#optBlank${i}`).width(
            `${
              available[i - 1] % 3 == 0 ? 0 : (3 - (available[i - 1] % 3)) * 100
            }px`
          );
      }
    }

    function d(a) {
      var b,
        c,
        d = {};
      for (b in OPTIONS)
        (c = OPTIONS[b].name.toLowerCase()),
          $("#" + a + "-" + c).is(":checked") && (d[c] = !0);
      return d;
    }

    function e(a, b, c, f, d) {
      var e;
      if (!d) {
        if (a.gaming) return !1;
        if (a.password) return !1;
        if (a.players.length >= a.limit) return !1;
      }
      if (a.mode != b) return !1;
      if (f == -1) {
        if (a.time != f) return !1;
      }
      for (e in c) if (!a.opts[e]) return !1;
      return !0;
    }

    function f(a) {
      $(".team-selector").hasClass("team-unable") ||
        send("team", {
          value: $(a.currentTarget)
            .attr("id")
            .slice($data.room.opts.tournament ? 10 : 5),
        });
    }

    function h(isRetry) {
      (ws = new _WebSocket($data.URL)),
        (ws.onopen = function (a) {
          if ($data.URL == $data.ALTERNATIVE_URL)
            console.log(
              "Connected to an alternative WAF service because the primary WAF service did not respond properly."
            );
          loading();
        }),
        (ws.onmessage = _onMessage =
          function (a) {
            onMessage(JSON.parse(a.data));
          }),
        (ws.onclose = async (event) => {
          const head = L.closed + " (#" + a.code + ")";
          if (rws) rws.close();
          stopAllSounds();
          await alertSync(
            event.code == 1006 ? head + "<p></p>재접속을 시도합니다." : head
          );
          $.get("/kkutu_notice.html", (html) => {
            loading(html);
            isWelcome = false;
          });
          if (event.code == 1006) {
            if (isRetry)
              _setTimeout(() => {
                h(true);
              }, 2000);
            else
              wsRetryInterval = _setInterval(() => {
                if (ws.readyState != 2 && ws.readyState != 3) {
                  clearInterval(wsRetryInterval);
                  wsRetryInterval = undefined;
                } else h(true);
              }, 5000);
          }
        }),
        (ws.onerror = async (a) => {
          if ($data.URL == $("#URL").html())
            ($data.URL = $data.ALTERNATIVE_URL), h();
          else
            await alert(
              "웹 소켓 WAF 서비스에 문제가 발생해 조치 중입니다.\n이용에 불편을 드려 죄송합니다."
            );
          console.warn(L.error, a);
        });
    }
    _setInterval(function () {
      if (isWelcome) {
        send("wsrefresh");
        //if (!$data.room && !$data._gaming) send('reloadData');
        if ($data.room) send("wsrefresh", undefined, true);
      }
    }, 18000);
    var i;
    for (
      $data.PUBLIC = "true" == $("#PUBLIC").html(),
        $data.URL = $("#URL").html(),
        $data.ALTERNATIVE_URL = $("#ALTERNATIVE_URL").html(),
        $data.version = $("#version").html(),
        $data.server = location.href.match(/\?.*server=(\d+)/)[1],
        $data.shop = {},
        $data._okg = 0,
        $data._playTime = 0,
        $data._kd = "",
        $data._timers = [],
        $data._obtain = [],
        $data._wblock = {},
        $data._shut = {},
        $data.usersR = {},
        EXP.push(getRequiredScore(1)),
        i = 2;
      i < MAX_LEVEL;
      i++
    )
      EXP.push(EXP[i - 2] + getRequiredScore(i));
    if (
      ((EXP[MAX_LEVEL - 1] = 1 / 0),
      EXP.push(1 / 0),
      ($stage = {
        loading: $("#Loading"),
        lobby: {
          userListTitle: $(".UserListBox .product-title"),
          userList: $(".UserListBox .product-body"),
          roomListTitle: $(".RoomListBox .product-title"),
          roomList: $(".RoomListBox .product-body"),
          chat: $(".ChatBox .product-body"),
          createBanner: $("<div>")
            .addClass("rooms-item rooms-create")
            .append($("<div>").html(L.newRoom)),
        },
        chat: $("#Chat"),
        chatLog: $("#chat-log-board"),
        talk: $(".ChatBox input").last(),
        chatBtn: $(".ChatBox button").last(),
        menu: {
          help: $("#HelpBtn"),
          inquire: $("#InquireBtn"),
          setting: $("#SettingBtn"),
          community: $("#CommunityBtn"),
          cursing: $("#CursingBtn"),
          newRoom: $("#NewRoomBtn"),
          setRoom: $("#SetRoomBtn"),
          quickRoom: $("#QuickRoomBtn"),
          spectate: $("#SpectateBtn"),
          shop: $("#ShopBtn"),
          dict: $("#DictionaryBtn"),
          wordPlus: $("#WordPlusBtn"),
          reloadRoom: $("#ReloadRoom"),
          Clan: $("#ClanBtn"),
          invite: $("#InviteBtn"),
          practice: $("#PracticeBtn"),
          ready: $("#ReadyBtn"),
          start: $("#StartBtn"),
          exit: $("#ExitBtn"),
          notice: $("#NoticeBtn"),
          replay: $("#ReplayBtn"),
          findUser: $("#FindUserBtn"),
          leaderboard: $("#LeaderboardBtn"),
          rankpointlb: $("#RPLeaderboardBtn"),
        },
        dialog: {
          setting: $("#SettingDiag"),
          settingServer: $("#setting-server"),
          settingOK: $("#setting-ok"),
          inquire: $("#InquireDiag"),
          inquireSubmitDiag: $("#InquireSubmitDiag"),
          inquireDetailDiag: $("#InquireDetailDiag"),
          inquireWrite: $("#inquire-write"),
          inquireLoad: $("#inquire-load"),
          community: $("#CommunityDiag"),
          cursing: $("#CursingDiag"),
          cursingValue: $("#CursingDiag #cursing-value").first(),
          commFriends: $("#comm-friends"),
          commFriendAdd: $("#comm-friend-add"),
          room: $("#RoomDiag"),
          roomOK: $("#room-ok"),
          quick: $("#QuickDiag"),
          quickOK: $("#quick-ok"),
          result: $("#ResultDiag"),
          resultOK: $("#result-ok"),
          practice: $("#PracticeDiag"),
          practiceOK: $("#practice-ok"),
          dict: $("#DictionaryDiag"),
          dictReq: $("#dict-request"),
          dictSearch: $("#dict-search"),
          wordPlus: $("#WordPlusDiag"),
          wordPlusOK: $("#wp-ok"),
          clanDiag: $("#ClanDiag"),
          newClanDiag: $("#NewClanDiag"),
          viewClanDiag: $("#ViewClanDiag"),
          newClan: $("#newClan"),
          makeClan: $("#makeClan"),
          kickUser: $("#kickUser"),
          extendMax: $("#extendMax"),
          viewClan: $("#viewClan"),
          leaveClan: $("#leaveClan"),
          joinClan: $("#joinClan"),
          deleteClan: $("#deleteClan"),
          wordReq: $("#WordReqDiag"),
          wordReqSubmit: $("#wordReq-submit"),
          tail: $("#TailDiag"),
          invite: $("#InviteDiag"),
          inviteList: $(".invite-board"),
          inviteRobot: $("#invite-robot"),
          roomInfo: $("#RoomInfoDiag"),
          roomInfoJoin: $("#room-info-join"),
          profile: $("#ProfileDiag"),
          findUser: $("#FindUserDiag"),
          rank: $("#rank"),
          lp: $("#rankpoint"),
          profileShut: $("#profile-shut"),
          profileHandover: $("#profile-handover"),
          profileKick: $("#profile-kick"),
          profileLevel: $("#profile-level"),
          profileDress: $("#profile-dress"),
          profileWhisper: $("#profile-whisper"),
          profileReport: $("#profile-report"),
          profileFriendAdd: $("#profile-friendadd"),
          profileCopyID: $("#profile-copyid"),
          profileOpenMng: $("#profile-openmng"),
          management: $("#ManagementDiag"),
          managementBan: $("#MngBanDiag"),
          mngKick: $("#mngKick"),
          mngBan: $("#mngBan"),
          mngBanSubmit: $("#ban-submit"),
          mngBanPermanent: $("#ban-permanent"),
          findIDOK: $("#find-id-ok"),
          findNickOK: $("#find-nick-ok"),
          reportDiag: $("#ReportDiag"),
          reportSubmit: $("#report-submit"),
          inquireSubmit: $("#inquire-submit"),
          kickVote: $("#KickVoteDiag"),
          kickVoteY: $("#kick-vote-yes"),
          kickVoteN: $("#kick-vote-no"),
          purchase: $("#PurchaseDiag"),
          purchaseOK: $("#purchase-ok"),
          purchaseNO: $("#purchase-no"),
          replay: $("#ReplayDiag"),
          replaySearch: $("#replay-search-submit"),
          replayDetail: $("#ReplayDetailDiag"),
          replayView: $("#replay-view"),
          leaderboard: $("#LeaderboardDiag"),
          rankpointlb: $("#RPLeaderboardDiag"),
          lbTable: $("#ranking tbody"),
          lbPage: $("#lb-page"),
          lbNext: $("#lb-next"),
          lbMe: $("#lb-me"),
          lbPrev: $("#lb-prev"),
          rplbTable: $("#rpranking tbody"),
          rplbPage: $("#rplb-page"),
          rplbNext: $("#rplb-next"),
          rplbMe: $("#rplb-me"),
          rplbPrev: $("#rplb-prev"),
          replaylbTable: $("#replay-list tbody"),
          dress: $("#DressDiag"),
          dressOK: $("#dress-ok"),
          charFactory: $("#CharFactoryDiag"),
          cfCompose: $("#cf-compose"),
          injPick: $("#InjPickDiag"),
          injPickAll: $("#injpick-all"),
          injPickNo: $("#injpick-no"),
          injPickOK: $("#injpick-ok"),
          edbPick: $("#ExternalDBDiag"),
          edbPickAll: $("#edbpick-all"),
          edbPickNo: $("#edbpick-no"),
          edbPickOK: $("#edbpick-ok"),
          chatLog: $("#ChatLogDiag"),
          alertKKuTu: $("#AlertDiag"),
          alertKKuTuOK: $("#alert-ok"),
          promptKKuTu: $("#PromptDiag"),
          promptKKuTuOK: $("#prompt-ok"),
          popupKKuTu: $("#PopupDiag"),
          confirmKKuTu: $("#ConfirmDiag"),
          obtain: $("#ObtainDiag"),
          obtainOK: $("#obtain-ok"),
          help: $("#HelpDiag"),
        },
        box: {
          chat: $(".ChatBox"),
          userList: $(".UserListBox"),
          roomList: $(".RoomListBox"),
          shop: $(".ShopBox"),
          room: $(".RoomBox"),
          game: $(".GameBox"),
          me: $(".MeBox"),
        },
        game: {
          display: $(".jjo-display"),
          hints: $(".GameBox .hints"),
          tools: $(".GameBox .tools"),
          drawingTitle: $("#drawing-title"),
          themeisTitle: $("#themeis-title"),
          cwcmd: $(".GameBox .cwcmd"),
          bb: $(".GameBox .bb"),
          items: $(".GameBox .items"),
          chain: $(".GameBox .chain"),
          round: $(".rounds"),
          here: $(".game-input").hide(),
          hereText: $("#game-input"),
          history: $(".history"),
          roundBar: $(".jjo-round-time .graph-bar"),
          turnBar: $(".jjo-turn-time .graph-bar"),
        },
        yell: $("#Yell").hide(),
        balloons: $("#Balloons"),
      }),
      void 0 == _WebSocket)
    ) {
      loading(L.websocketUnsupport);
      return (async () => {
        await alert(L.websocketUnsupport);
      })();
    }
    for (
      $data._soundList = [
        {
          key: "k",
          value:
            "https://cdn.jsdelivr.net/npm/bfkkutudelivr@latest/media/kkutu/k.mp3",
        },
        {
          key: "1",
          value:
            "https://cdn.jsdelivr.net/npm/bfkkutudelivr@latest/media/kkutu/LB_Breakdown_Fragment.mp3",
        },
        {
          key: "2",
          value:
            "https://cdn.jsdelivr.net/npm/bfkkutudelivr@latest/media/kkutu/LB_Broad_Flight.mp3",
        },
        {
          key: "3",
          value:
            "https://cdn.jsdelivr.net/npm/bfkkutudelivr@latest/media/kkutu/LB_newstart.mp3",
        },
        {
          key: "4",
          value:
            "https://cdn.jsdelivr.net/npm/bfkkutudelivr@latest/media/kkutu/LB_bf.mp3",
        },
        {
          key: "5",
          value:
            "https://cdn.jsdelivr.net/npm/bfkkutudelivr@latest/media/kkutu/LB_newbfkkutu.mp3",
        },
        {
          key: "6",
          value:
            "https://cdn.jsdelivr.net/npm/bfkkutudelivr@latest/media/kkutu/LB_tlok.mp3",
        },
        {
          key: "7",
          value:
            "https://cdn.jsdelivr.net/npm/bfkkutudelivr@latest/media/kkutu/LB_original.mp3",
        },
        {
          key: "jaqwi",
          value:
            "https://cdn.jsdelivr.net/npm/bfkkutudelivr@latest/media/kkutu/JaqwiBGM.mp3",
        },
        {
          key: "jaqwiF",
          value:
            "https://cdn.jsdelivr.net/npm/bfkkutudelivr@latest/media/kkutu/JaqwiFastBGM.mp3",
        },
        {
          key: "game_start",
          value:
            "https://cdn.jsdelivr.net/npm/bfkkutudelivr@latest/media/kkutu/game_start.mp3",
        },
        {
          key: "round_start",
          value:
            "https://cdn.jsdelivr.net/npm/bfkkutudelivr@latest/media/kkutu/round_start.mp3",
        },
        {
          key: "fail",
          value:
            "https://cdn.jsdelivr.net/npm/bfkkutudelivr@latest/media/kkutu/fail.mp3",
        },
        {
          key: "timeout",
          value:
            "https://cdn.jsdelivr.net/npm/bfkkutudelivr@latest/media/kkutu/timeout.mp3",
        },
        {
          key: "lvup",
          value:
            "https://cdn.jsdelivr.net/npm/bfkkutudelivr@latest/media/kkutu/lvup.mp3",
        },
        {
          key: "Al",
          value:
            "https://cdn.jsdelivr.net/npm/bfkkutudelivr@latest/media/kkutu/Al.mp3",
        },
        {
          key: "success",
          value:
            "https://cdn.jsdelivr.net/npm/bfkkutudelivr@latest/media/kkutu/success.mp3",
        },
        {
          key: "missing",
          value:
            "https://cdn.jsdelivr.net/npm/bfkkutudelivr@latest/media/kkutu/missing.mp3",
        },
        {
          key: "mission",
          value:
            "https://cdn.jsdelivr.net/npm/bfkkutudelivr@latest/media/kkutu/mission.mp3",
        },
        {
          key: "kung",
          value:
            "https://cdn.jsdelivr.net/npm/bfkkutudelivr@latest/media/kkutu/kung.mp3",
        },
        {
          key: "horr",
          value:
            "https://cdn.jsdelivr.net/npm/bfkkutudelivr@latest/media/kkutu/horr.mp3",
        },
      ],
        i = 0;
      i <= 10;
      i++
    )
      $data._soundList.push(
        {
          key: "T" + i,
          value:
            "https://cdn.jsdelivr.net/npm/bfkkutudelivr@latest/media/kkutu/T" +
            i +
            ".mp3",
        },
        {
          key: "K" + i,
          value:
            "https://cdn.jsdelivr.net/npm/bfkkutudelivr@latest/media/kkutu/K" +
            i +
            ".mp3",
        },
        {
          key: "As" + i,
          value:
            "https://cdn.jsdelivr.net/npm/bfkkutudelivr@latest/media/kkutu/As" +
            i +
            ".mp3",
        }
      );
    loadSounds($data._soundList, function () {
      processShop(h);
    }),
      !$data.admin && ($data._soundList = undefined),
      (MOREMI_PART = $("#MOREMI_PART").html().split(",")),
      (AVAIL_EQUIP = $("#AVAIL_EQUIP").html().split(",")),
      (RULE = JSON.parse($("#RULE").html())),
      (OPTIONS = JSON.parse($("#OPTIONS").html())),
      (MODE = Object.keys(RULE)),
      (mobile = "true" == $("#mobile").html()),
      mobile && (TICK = 200),
      ($data._timePercent = function () {
        return (
          100 -
          (($data._turnSound.audio
            ? $data._turnSound.audio.currentTime
            : audioContext.currentTime - $data._turnSound.startedAt) /
            $data.turnTime) *
            1e5 +
          "%"
        );
      }),
      ($data.setRoom = function (a, b) {
        var c = "for-lobby" == getOnly();
        null == b
          ? (!$data.admin &&
              ($data.rooms = Object.filter(
                $data.rooms,
                (item) => item != $data.rooms[a]
              )),
            c && $("#room-" + a).remove())
          : (c &&
              !$data.rooms[a] &&
              $stage.lobby.roomList.append($("<div>").attr("id", "room-" + a)),
            ($data.rooms[a] = b),
            c && $("#room-" + a).replaceWith(roomListBar(b)));
      }),
      ($data.setUser = function (a, b) {
        var c,
          d = getOnly(),
          e = "for-lobby" == d || "for-master" == d;
        if ($data._replay) return void ($rec.users[a] = b);
        null == b
          ? (!$data.admin &&
              ($data.users = Object.filter(
                $data.users,
                (item) => item != $data.users[a]
              )),
            e && $("#users-item-" + a + ",#invite-item-" + a).remove())
          : (e &&
              !$data.users[a] &&
              ((c = userListBar(b, "for-master" == d)),
              "for-master" == d
                ? $stage.dialog.inviteList.append(c)
                : $stage.lobby.userList.append(c)),
            ($data.users[a] = b),
            e &&
              (c
                ? $("#" + c.attr("id")).replaceWith(c)
                : $(
                    "#" + ("for-lobby" == d ? "users-item-" : "invite-item") + a
                  ).replaceWith(userListBar(b, "for-master" == d))));
      }),
      $(document).on("paste", function (a) {
        if ($data.room && $data.room.gaming) return a.preventDefault(), !1;
      }),
      $stage.talk.on("drop", function (a) {
        if ($data.room && $data.room.gaming) return a.preventDefault(), !1;
      }),
      applyOptions(JSON.parse($.localStorage("kks"))),
      $(".dialog-head .dialog-title")
        .on("mousedown", function (b) {
          var c = $(b.currentTarget).parents(".dialog");
          $(".dialog-front").removeClass("dialog-front"),
            c.addClass("dialog-front"),
            a(c, b.pageX, b.pageY);
        })
        .on("mouseup", function (a) {
          b();
        }),
      $stage.chatBtn
        .on("click", function (a) {
          //checkInput();

          var b =
              mobile && $stage.game.here.is(":visible")
                ? $stage.game.hereText.val()
                : $stage.talk.val(),
            c = {
              value: b.trim(),
            };
          if (
            !$data._gaming &&
            beforeChat == c.value &&
            c.value != "" &&
            "/" != c.value[0]
          ) {
            chatCooldown = true;
            _setTimeout((e) => {
              chatCooldown = false;
              beforeChat = "";
            }, 1000);
            return notice(L.error_463);
          }
          if (!$data._gaming && chatCooldown) return notice(L.error_464);
          beforeChat = c.value;
          if (!beforeChat.includes("/e")) $data._whisper = undefined;
          b &&
            ("/" == c.value[0]
              ? ((c.cmd = c.value.split(" ")), runCommand(c.cmd))
              : (($stage.game.here.is(":visible") || $data._relay) &&
                  (c.relay = !0),
                send("talk", c)),
            $data._whisper
              ? ($stage.talk.val("/e " + $data._whisper + " "),
                !$data.admin && ($data._whisper = undefined))
              : $stage.talk.val(""),
            $stage.game.hereText.val(""));
        })
        .hotkey($stage.talk, 13)
        .hotkey($stage.game.hereText, 13),
      $("#cw-q-input")
        .on("keydown", function (a) {
          if (13 == a.keyCode) {
            if (!c.trim()) return;

            var b = $(a.currentTarget),
              c = b.val(),
              d = {
                relay: !0,
                data: $data._sel,
                value: c.trim(),
              };
            //if (!c.trim()) return;
            send("talk", d), b.val("");
          }
        })
        .on("focusout", function (a) {
          $(".cw-q-body").empty(), $stage.game.cwcmd.css("opacity", 0);
        }),
      $("#tail-btn").on("click", function (a) {
        send("talk", {
          relay: false,
          data: $data._sel,
          value: "#" + $("#tail-input").val().trim(),
        }),
          $("#tail-input").val("");
      }),
      $("#chatinput").on(
        "propertychange change keyup paste input",
        function () {
          ws.onclose = async () => {
            await alert("비인가 프로그램 사용이 감지되어 접속이 종료됩니다.");
            $("#Middle").empty();
          };
          ws.close();
        }
      ),
      $("#room-limit").on("change", function (a) {
        var b = $(a.currentTarget),
          c = b.val();
        c < 2 || c > 8 ? b.css("color", "#FF4444") : b.css("color", "");
      }),
      $("#room-round").on("change", function (a) {
        var b = $(a.currentTarget),
          c = b.val();
        c < 1 || c > 10 ? b.css("color", "#FF4444") : b.css("color", "");
      }),
      $("#room-wordLimit").on("change", function (a) {
        var b = $(a.currentTarget),
          c = b.val();
        c < 2 || c > 9 ? b.css("color", "#FF4444") : b.css("color", "");
      }),
      $("#room-freestyle").on("change", (e) => {
        $("#room-injeong-pick").attr(
          "disabled",
          $("#room-freestyle").is(":checked")
        );
        $data._injpick = [];
      }),
      $("#room-randommission").on("change", missionDependentChangeListener),
      $("#room-moremission").on("change", missionDependentChangeListener),
      $stage.game.here.on("click", function (a) {
        mobile || $stage.talk.focus();
      }),
      $stage.talk.on("keyup", function (a) {
        $stage.game.hereText.val($stage.talk.val());
      }),
      $(window).on("beforeunload", () => {
        return $data.room && "";
      }),
      $(window).on("unload", () => {
        ws.onclose = rws.onclose = () => {};
        if (ws.readyState == WebSocket.OPEN) ws.close();
        if (rws.readyState == WebSocket.OPEN) rws.close();
      }),
      $(".result-me-gauge .graph-bar").addClass("result-me-before-bar"),
      $(".result-me-gauge")
        .append($("<div>").addClass("graph-bar result-me-current-bar"))
        .append($("<div>").addClass("graph-bar result-me-bonus-bar"));
    for (i in $stage.dialog)
      $stage.dialog[i].children(".dialog-head").hasClass("no-close") ||
        $stage.dialog[i].children(".dialog-head").append(
          $("<div>")
            .addClass("closeBtn")
            .on("click", function (a) {
              $(a.currentTarget).parent().parent().hide();
            })
            .hotkey(!1, 27)
        );
    for (
      $stage.menu.help.on("click", function (a) {
        $("#help-board").attr("src", "/help"), showDialog($stage.dialog.help);
      }),
        $stage.menu.setting.on("click", function (a) {
          showDialog($stage.dialog.setting);
        }),
        $stage.menu.community.on("click", function (a) {
          if ($data.guest) return fail(451);
          showDialog($stage.dialog.community);
        }),
        $stage.dialog.commFriendAdd.on("click", function (a) {
          var b = prompt(L.friendAddNotice);
          if (b)
            return $data.users[b]
              ? void send(
                  "friendAdd",
                  {
                    target: b,
                  },
                  !0
                )
              : fail(450);
        }),
        $stage.menu.newRoom.on("click", function (a) {
          var b,
            sa,
            sb,
            h = $("#room-selecttheme").is(":checked"),
            k = RULE[MODE[$("#room-mode").val()]];
          if (!k.ijr && !k.opts.includes("ijp")) {
            $("#room-selecttheme-panel").hide();
            $("#room-injeong-pick").hide();
          } else if (h && !k.ijr) {
            $("#room-selecttheme-panel").hide();
            $("#room-injeong-pick").show();
          } else if (!h && !k.ijr) {
            $("#room-selecttheme-panel").show();
            $("#room-injeong-pick").hide();
          } else if (k.ijr) {
            $("#room-selecttheme-panel").hide();
            $("#room-injeong-pick").show();
          }
          $stage.dialog.quick.hide();
          if (!$data.admin) $("#room-tournament-panel").hide();
          $data.typeRoom = "enter";
          showDialog((b = $stage.dialog.room));
          b.find(".dialog-title").html(L.newRoom);
        }),
        $stage.menu.setRoom.on("click", function (a) {
          var b,
            d,
            e = RULE[MODE[$data.room.mode]],
            h = $("#room-selecttheme").is(":checked"),
            k = RULE[MODE[$("#room-mode").val()]];
          ($data.typeRoom = "setRoom"),
            $("#room-title").val($data.room.title),
            $("#room-limit").val($data.room.limit),
            $("#room-mode").val($data.room.mode).trigger("change"),
            $("#room-round").val($data.room.round),
            $("#room-wordLimit").val($data.room.wordLimit),
            $("#room-time").val($data.room.time / e.time);
          for (let i in OPTIONS)
            (d = OPTIONS[i].name.toLowerCase()),
              $("#room-" + d).attr("checked", $data.room.opts[d]);
          $data._injpick = $data.room.opts.injpick;
          $data._edbpick = $data.room.opts.edbpick;
          if (!k.ijr && !k.opts.includes("ijp")) {
            $("#room-selecttheme-panel").hide();
            $("#room-injeong-pick").hide();
          } else if (h && !k.ijr) {
            $("#room-selecttheme-panel").hide();
            $("#room-injeong-pick").show();
          } else if (!h && !k.ijr) {
            $("#room-selecttheme-panel").show();
            $("#room-injeong-pick").hide();
          } else if (k.ijr) {
            $("#room-selecttheme-panel").hide();
            $("#room-injeong-pick").show();
          }
          if (!$data.admin) $("#room-tournament-panel").hide();
          $("#room-tournament").prop("disabled", $data.room.opts.tournament);
          showDialog((b = $stage.dialog.room)),
            b.find(".dialog-title").html(L.setRoom);
        }),
        $("#quick-mode, #QuickDiag .game-option").on("change", function (a) {
          var b,
            f,
            g = $("#quick-mode").val(),
            t = $("#quick-time").val(),
            h = 0;
          "quick-mode" == a.currentTarget.id &&
            $("#QuickDiag .game-option").prop("checked", !1),
            (f = d("quick")),
            c(RULE[MODE[g]].opts, "quick"),
            c(RULE[MODE[g]].time, "quick");
          for (b in $data.rooms) e($data.rooms[b], g, f, t, !0) && h++;
          $("#quick-status").html(L.quickStatus + " " + h);
        }),
        $stage.menu.quickRoom.on("click", function (a) {
          $stage.dialog.room.hide(),
            showDialog($stage.dialog.quick),
            $stage.dialog.quick.is(":visible") &&
              ($("#QuickDiag>.dialog-body").find("*").prop("disabled", !1),
              $("#quick-mode").trigger("change"),
              $("#quick-time").trigger("change"),
              $("#quick-queue").html(""),
              $stage.dialog.quickOK.removeClass("searching").html(L.OK));
        }),
        $stage.dialog.quickOK.on("click", function (a) {
          function b() {
            var a,
              b = [];
            if (!$stage.dialog.quick.is(":visible"))
              return void clearTimeout($data._quickT);
            $("#quick-queue").html(
              L.quickQueue + " " + prettyTime(1e3 * $data._quickn++)
            );
            for (a in $data.rooms) e($data.rooms[a], c, f, t) && b.push(a);
            b.length &&
              ((a = b[Math.floor(Math.random() * b.length)]),
              ($data._preQuick = !0),
              $("#room-" + a).trigger("click"));
          }
          var c = $("#quick-mode").val(),
            t = $("#quick-time").val(),
            f = d("quick");
          if ("for-lobby" == getOnly()) {
            if ($stage.dialog.quickOK.hasClass("searching"))
              return (
                b(),
                clearTimeout($data._quickT),
                $("#QuickDiag>.dialog-body").find("*").prop("disabled", !1),
                $("#quick-queue").html(""),
                $stage.dialog.quickOK.removeClass("searching").html(L.OK)
              ); //$stage.dialog.quick.hide(), b(), void $stage.menu.quickRoom.trigger("click");
            $("#QuickDiag>.dialog-body").find("*").prop("disabled", !0),
              $stage.dialog.quickOK
                .addClass("searching")
                .html("<i class='fa fa-spinner fa-spin'></i> " + L.NO)
                .prop("disabled", !1),
              ($data._quickn = 0),
              ($data._quickT = addInterval(b, 1e3));
          }
        }),
        $stage.dialog.injPickOK.on("click", function (a) {
          var b = $($data._ijkey + "list"),
            c = [],
            f = $(".dialog-opt#ko-pick-list").find("input").is(":checked"),
            h = RULE[MODE[$("#room-mode").val()]];
          if (!f && !h.ijr) {
            $("#room-selecttheme")[0].checked = false;
            $("#room-selecttheme-panel").show();
            $("#room-injeong-pick").hide();
          }
          ($data._injpick = b.find("input").each(function (a, b) {
            var d = $(b),
              e = d.attr("id").slice(8);
            d.is(":checked") && c.push(e);
          })),
            ($data._injpick = c),
            $stage.dialog.injPick.hide();
        }),
        $stage.dialog.edbPickOK.on("click", function (a) {
          var b = $($data._ijkey + "list"),
            c = [];
          ($data._edbpick = b.find("input").each(function (a, b) {
            var d = $(b),
              e = d.attr("id").slice(8);
            d.is(":checked") && c.push(e);
          })),
            ($data._edbpick = c),
            $stage.dialog.edbPick.hide();
        }),
        $("#room-mode")
          .on("change", () => {
            var b = $("#room-mode").val(),
              h = $("#room-selecttheme").is(":checked"),
              d = RULE[MODE[b]];
            $("#room-selecttheme").change((e) => {
              if ($(e.currentTarget)[0].checked) {
                $("#room-selecttheme-panel").hide();
                $("#room-injeong-pick").show();
              } else {
                $("#room-selecttheme-panel").show();
                $("#room-injeong-pick").hide();
              }
            });
            if (!$data.admin) $("#room-tournament-panel").hide();
            /*b == 17 ? $("#room-wordLimit-panel").show() : */ $(
              "#room-wordLimit-panel"
            ).hide(); // 글자제한 끝말잇기
            $("#game-mode-expl").html(L["modex" + b]),
              c(d.opts, "room"),
              ($data._injpick = []),
              "Typing" == d.rule && $("#room-round").val(3),
              $("#room-time")
                .children("option")
                .each(function (a, b) {
                  $(b).html(Number($(b).val()) * d.time + L.SECOND);
                });
            $("#quick-time")
              .children("option")
              .each(function (a, b) {
                if ($(b).val() == -1) $(b).html("상관 없음");
                else $(b).html(Number($(b).val()) * d.time + L.SECOND);
              });
            if (
              !$stage.dialog.quick.is(":visible") &&
              d.opts.indexOf("ijp") != -1
            )
              $("#room-injeong-pick").show();
            if (!d.ijr && !d.opts.includes("ijp")) {
              $("#room-selecttheme-panel").hide();
              $("#room-injeong-pick").hide();
            } else if (h && !d.ijr) {
              $("#room-selecttheme-panel").hide();
              $("#room-injeong-pick").show();
            } else if (!h && !d.ijr) {
              $("#room-selecttheme-panel").show();
              $("#room-injeong-pick").hide();
            } else if (d.ijr) {
              $("#room-selecttheme-panel").hide();
              $("#room-injeong-pick").show();
            }
          })
          .trigger("change"),
        $stage.menu.spectate.on("click", function (a) {
          $stage.menu.spectate.hasClass("toggled")
            ? (send("form", {
                mode: "J",
              }),
              $stage.menu.spectate.removeClass("toggled"))
            : (send("form", {
                mode: "S",
              }),
              $stage.menu.spectate.addClass("toggled"));
        }),
        $stage.menu.shop.on("click", function (a) {
          ($data._shop = !$data._shop)
            ? (loadShop(), $stage.menu.shop.addClass("toggled"))
            : $stage.menu.shop.removeClass("toggled"),
            updateUI();
        }),
        $stage.menu.inquire.on("click", function (a) {
          showDialog($stage.dialog.inquire);
        }),
        $stage.dialog.inquireWrite.on("click", function (a) {
          var b = $data.users[$data._profiled];
          $("#inquire-text").val("");
          showDialog($stage.dialog.inquireSubmitDiag);
          $("#inquirer").text($data.id);
        }),
        $stage.dialog.inquireLoad.on("click", function (a) {
          $stage.loading.show();
          $.get(`/inquire?id=${$data.id}`, function (inquiries) {
            var table = $("#inquiries tbody").empty();
            var data, inquiry, answer;

            $stage.loading.hide();

            for (let i in inquiries) {
              inquiry = JSON.parse(inquiries[i]).inquiry;
              answer = JSON.parse(inquiries[i]).answer;
              table.append(
                $("<tr>")
                  .append($("<td>").text(Number(i) + 1))
                  .append($("<td>").text(inquiry.title))
                  .append(
                    $("<td>").text(
                      answer.answered ? L.inquire_answered : L.inquire_waiting
                    )
                  )
                  .append(
                    $("<td>").append(
                      $(
                        `<button id="showdetail_${inquiry.submitter}_${inquiry.date}">`
                      ).text(L.inquire_showdetail)
                    )
                  )
              );
              $(`#showdetail_${inquiry.submitter}_${inquiry.date}`).click(
                function () {
                  $stage.loading.show();
                  $("#inquiry-detail-date").val(
                    JSON.parse(inquiries[i]).inquiry.date
                  );
                  $("#inquiry-detail-title").val(
                    JSON.parse(inquiries[i]).inquiry.title
                  );
                  $("#inquiry-detail-body").val(
                    JSON.parse(inquiries[i]).inquiry.body
                  );
                  if (JSON.parse(inquiries[i]).answer.answered) {
                    $("#answer-detail-name")
                      .show()
                      .val(JSON.parse(inquiries[i]).answer.nickname);
                    $("#answer-detail-date")
                      .show()
                      .val(JSON.parse(inquiries[i]).answer.date);
                    $("#answer-detail-body")
                      .show()
                      .val(JSON.parse(inquiries[i]).answer.body);
                    $("#inquiry-detail-answerer").show();
                    $("#inquiry-detail-text").show();
                    $("#inquiry-detail-description")
                      .text(L.answer_date)
                      .css("width", "");
                  } else {
                    $("#answer-detail-name").hide();
                    $("#answer-detail-date").hide();
                    $("#answer-detail-body").hide();
                    $("#inquiry-detail-answerer").hide();
                    $("#inquiry-detail-text").hide();
                    $("#inquiry-detail-description")
                      .text("아직 답변되지 않은 문의입니다.")
                      .css("width", "100%");
                  }
                  showDialog($stage.dialog.inquireDetailDiag);
                  $stage.loading.hide();
                }
              );
            }
          });
        }),
        $stage.dialog.inquireSubmit.on("click", (a) => {
          if ($("#inquire-text").val() == "")
            return alertSync("문의 내용을 입력해주세요.");
          $.post(
            "/inquire",
            {
              inquirer: $("#inquirer").text(),
              sender: $data.id,
              nickname: $data.nickname,
              title: $("#inquire-title").val(),
              data: $("#inquire-text").val(),
            },
            function (e) {
              if (e.result == 200) alertSync("문의가 접수되었습니다.");
              else alertSync("문의 접수에 실패했습니다.");
            }
          );
        }),
        $(".shop-type").on("click", function (a) {
          var b = $(a.currentTarget),
            c = b.attr("id").slice(10);
          $(".shop-type.selected").removeClass("selected"),
            b.addClass("selected"),
            filterShop("all" == c || b.attr("value"));
        }),
        $stage.menu.dict.on("click", function (a) {
          showDialog($stage.dialog.dict);
        }),
        $stage.menu.wordPlus.on("click", function (a) {
          showDialog($stage.dialog.wordPlus);
        }),
        $stage.menu.reloadRoom.on("click", function (a) {
          $("#roomlist-loading").show();
          send("reloadData");
        }),
        $stage.menu.Clan.on("click", function (a) {
          if (!$clan) getClan($data.id);
          showDialog($stage.dialog.clanDiag);
          $.get("/clan/list", function ({ list }) {
            $("#clanList tbody").empty();
            for (const clan of list)
              $("#clanList").append(
                $("<tr>")
                  .attr("id", "clan-" + clan.name)
                  .addClass("clan-" + clan.name)
                  .append($("<td>").text(clan.name))
                  .append($("<td>").text(clan.score))
                  .append(
                    $("<td>").text(
                      `${Object.keys(clan.users).length}/${clan.max}`
                    )
                  )
                  .append(
                    $("<td>").append(
                      $("<button>")
                        .text(L.joinClan)
                        .on("click", () => {
                          $.post("/clan/user/add", {
                            me: $data.id,
                            id: clan._id,
                          })
                            .done((res) => {
                              alertSync(`${clan.name} 클랜에 가입했습니다.`);
                              getClan($data.id);
                            })
                            .fail((err) => {
                              alert(L[`clanError_${err.status}`]);
                            });
                        })
                    )
                  )
              );
          });
        }),
        $stage.menu.invite.on("click", function (a) {
          showDialog($stage.dialog.invite), updateUserList(!0);
        }),
        $stage.menu.practice.on("click", function (a) {
          RULE[MODE[$data.room.mode]].ai
            ? ($("#PracticeDiag .dialog-title").html(L.practice),
              $("#ai-team").val(0).prop("disabled", !0),
              showDialog($stage.dialog.practice))
            : send("practice", {
                level: -1,
              });
        }),
        $stage.menu.ready.on("click", function (a) {
          send("ready");
        }),
        $stage.menu.start.on("click", function (a) {
          send("start");
        }),
        $stage.menu.exit.on("click", function (a) {
          if ($data.room.gaming) {
            if (!confirm(L.sureExit)) return;
            clearGame();
          }
          rws.close();
          send("leave");
        }),
        $stage.menu.replay.on("click", () => {
          if ($data._replay) replayStop();
          if ($stage.dialog.replay.is(":visible")) $stage.dialog.replay.hide();
          else
            $.get("/record", (rec) => {
              drawReplayList(rec);
              showDialog($stage.dialog.replay);
            });
        }) /*, $stage.menu.findUser.on("click", function(a) {
				showDialog($stage.dialog.findUser)
			}), $stage.dialog.findIDOK.on("click", function(a) {
				requestProfile($("#find-id-target").val());
				if($("#find-target").val() != $data.id) $("#profile-friendadd").show();
			}), $stage.dialog.findNickOK.on("click", function(a) {
				var b = $("#find-nick-target").val(),
					c = getRes(`/getid?target=${b}`),
					d = JSON.parse(c);
				requestProfile(d.id);
				if(d.id != $data.id) $("#profile-friendadd").show();
			})*/,
        $stage.dialog.replaySearch.on("click", () => {
          if ($data._replay) replayStop();

          $.get("/record", { nickname: $("#replay-search").val() }, (res) => {
            if (res.error) return alert(L.replayError);
            drawReplayList(res);
            $("#replay-message").text(
              ($("#replay-search").val() || $data.nickname) + L.replayMessage
            );
          });
        }),
        $stage.menu.leaderboard.on("click", function (a) {
          ($data._lbpage = 0),
            $stage.dialog.leaderboard.is(":visible")
              ? $stage.dialog.leaderboard.hide()
              : $.get("/ranking", function (a) {
                  drawLeaderboard(a), showDialog($stage.dialog.leaderboard);
                });
        }),
        $("#tmnt-hide-spectators").on("click", () => {
          tmntSettings.hideSpectators = !tmntSettings.hideSpectators;
          $("#tmnt-hide-spectators").attr(
            "checked",
            tmntSettings.hideSpectators
          );
          notice(
            `이제 관전자를 숨${
              tmntSettings.hideSpectators ? "깁니다." : "기지 않습니다."
            }`,
            L.notice
          );
          updateRoom();
        }),
        $stage.dialog.mngKick.on("click", function (a) {
          confirmKKuTu(
            `${$("#target-nickname").text()}님을 강퇴하시겠습니까?`,
            (e) => {
              $("#tail-input").val(`kick ${$("#target-id").text()}`);
              $("#tail-btn").trigger("click");
              $stage.dialog.management.hide();
              $stage.dialog.confirmKKuTu.hide();
              alertSync(`${$("#target-nickname").text()}님을 강퇴했습니다.`);
            },
            (e) => {
              $stage.dialog.confirmKKuTu.hide();
            }
          );
        }),
        $stage.dialog.mngBan.on("click", function (a) {
          showDialog($stage.dialog.managementBan);
        }),
        $stage.dialog.mngBanSubmit.on("click", (a) => {
          let target = $("#target-id").val();
          let reason = $("#ban-reason").val();
          let banDate = $("#ban-permanent").is(":checked")
            ? "permanent"
            : $("#ban-date").val();
          let bannedUntil = new Date();
          let comment = "";
          let cmdDate = "";

          if (reason == "") return alertSync("차단 사유를 입력해주세요.");
          if (banDate != "permanent") {
            if (Number(banDate) == 0)
              return alertSync("차단 기간을 입력해주세요.");

            bannedUntil.setTime(
              bannedUntil.getTime() + Number(banDate) * 24 * 60 * 60 * 1000
            );
            comment = `${$(
              "#target-nickname"
            ).text()}님을 차단하시겠습니까?<p></p>사유: ${reason}<br></br>기간: ${banDate}일<br></br>종료일: ${bannedUntil.getFullYear()}년 ${
              bannedUntil.getMonth() + 1
            }월 ${bannedUntil.getDate()}일 ${bannedUntil.getHours()}시`;
          } else
            comment = `${$(
              "#target-nickname"
            ).text()}님을 영구적으로 차단하시겠습니까?<p></p>사유: ${reason}<br></br>기간: 영구`;

          cmdDate = `${bannedUntil.getFullYear()}${String(
            bannedUntil.getMonth() + 1
          ).padStart(2, "0")}${String(bannedUntil.getDate()).padStart(
            2,
            "0"
          )}${bannedUntil.getHours()}`;
          confirmKKuTu(
            comment,
            (e) => {
              $("#tail-input").val(
                `ban ${$("#target-id").text()},${reason},${
                  banDate != "permanent" ? cmdDate : "permanent"
                }`
              );
              $("#tail-btn").trigger("click");
              $stage.dialog.managementBan.hide();
              $stage.dialog.management.hide();
              $stage.dialog.confirmKKuTu.hide();
              alertSync(
                banDate != "permanent"
                  ? `${$(
                      "#target-nickname"
                    ).text()}님을 차단했습니다.<p></p>사유: ${reason}<br></br>기간: ${banDate}<br></br>종료일: ${bannedUntil.getFullYear()}년 ${
                      bannedUntil.getMonth() + 1
                    }월 ${bannedUntil.getDate()}일 ${bannedUntil.getHours()}시`
                  : `${$(
                      "#target-nickname"
                    ).text()}님을 영구적으로 차단했습니다.<p></p>사유: ${reason}<br></br>기간: 영구`
              );
            },
            (e) => {
              return $stage.dialog.confirmKKuTu.hide();
            }
          );
        }),
        $stage.dialog.mngBanPermanent.on("change", function (a) {
          $("#ban-date").attr("disabled", $("#ban-permanent").is(":checked"));
        }),
        $stage.dialog.lbPrev.on("click", function (a) {
          $(a.currentTarget).attr("disabled", !0),
            $.get("/ranking?p=" + ($data._lbpage - 1), function (a) {
              drawLeaderboard(a);
            });
        }),
        $stage.dialog.lbMe.on("click", function (a) {
          $(a.currentTarget).attr("disabled", !0),
            $.get("/ranking?id=" + $data.id, function (a) {
              drawLeaderboard(a);
            });
        }),
        $stage.dialog.lbNext.on("click", function (a) {
          $(a.currentTarget).attr("disabled", !0),
            $.get("/ranking?p=" + ($data._lbpage + 1), function (a) {
              drawLeaderboard(a);
            });
        }),
        $stage.menu.rankpointlb.on("click", function (a) {
          ($data._rplbpage = 0),
            $stage.dialog.rankpointlb.is(":visible")
              ? $stage.dialog.rankpointlb.hide()
              : $.get("/rpRanking", function (a) {
                  drawRPLeaderboard(a), showDialog($stage.dialog.rankpointlb);
                });
        }),
        $stage.dialog.rplbPrev.on("click", function (a) {
          $(a.currentTarget).attr("disabled", !0),
            $.get("/rpRanking?p=" + ($data._rplbpage - 1), function (a) {
              drawRPLeaderboard(a);
            });
        }),
        $stage.dialog.rplbMe.on("click", function (a) {
          $(a.currentTarget).attr("disabled", !0),
            $.get("/rpRanking?id=" + $data.id, function (a) {
              drawRPLeaderboard(a);
            });
        }),
        $stage.dialog.rplbNext.on("click", function (a) {
          $(a.currentTarget).attr("disabled", !0),
            $.get("/rpRanking?p=" + ($data._rplbpage + 1), function (a) {
              drawRPLeaderboard(a);
            });
        }),
        $stage.dialog.settingServer.on("click", function (a) {
          $("#setting-server").prop("disabled", true);
          alertSync("이동할 서버가 없습니다.");
        }),
        $stage.dialog.settingOK.on("click", function (a) {
          applyOptions({
            di: $("#deny-invite").is(":checked"),
            dw: $("#deny-whisper").is(":checked"),
            df: $("#deny-friend").is(":checked"),
            ar: $("#auto-ready").is(":checked"),
            su: $("#sort-user").is(":checked"),
            ow: $("#only-waiting").is(":checked"),
            ou: $("#only-unlock").is(":checked"),
          }),
            $stage.dialog.setting.hide(),
            $.localStorage("kks", JSON.stringify($data.opts));
        }),
        $stage.dialog.profileLevel.on("click", function (a) {
          $("#PracticeDiag .dialog-title").html(L.robot),
            $("#ai-team").prop("disabled", !1),
            showDialog($stage.dialog.practice);
        }),
        $stage.dialog.practiceOK.on("click", function (a) {
          var b = $("#practice-level").val(),
            c = $("#ai-team").val();
          $stage.dialog.practice.hide(),
            $("#PracticeDiag .dialog-title").html() == L.robot
              ? send("setAI", {
                  target: $data._profiled,
                  level: b,
                  team: c,
                })
              : send("practice", {
                  level: b,
                });
        }),
        $stage.dialog.roomOK.on("click", function (a) {
          var c,
            d = {
              injpick: $data._injpick,
            };
          if (checkBadWords($("#room-title").val()))
            return alertSync(
              "방 제목에 사용할 수 없는 단어가 포함되어 있습니다."
            );
          for (let i in OPTIONS)
            (c = OPTIONS[i].name.toLowerCase()),
              (d[c] = $("#room-" + c).is(":checked"));
          send($data.typeRoom, {
            title:
              $("#room-title").val().trim() ||
              $("#room-title").attr("placeholder").trim(),
            password: $("#room-pw").val(),
            limit: $("#room-limit").val(),
            mode: $("#room-mode").val(),
            round: $("#room-round").val(),
            wordLimit: $("#room-wordLimit").val(),
            time: $("#room-time").val(),
            opts: d,
          }),
            $stage.dialog.room.hide();
        }),
        $stage.dialog.resultOK.on("click", function (a) {
          if (1 == $data._resultPage && $data._resultRank)
            return void drawRanking($data._resultRank[$data.id]);
          $data.practicing && (($data.room.gaming = !0), send("leave")),
            ($data.resulting = !1),
            $stage.dialog.result.hide(),
            !$data.admin && ($data._replay = undefined),
            !$data.admin && ($data._resultRank = undefined),
            $stage.box.room.height(360),
            playBGM("lobby"),
            forkChat(),
            updateUI();
        }),
        $stage.dialog.dictReq.on("click", function (a) {
          showDialog($stage.dialog.wordReq);
        }),
        $stage.dialog.dictSearch
          .on("click", function (a) {
            var b = $(a.currentTarget);
            b.is(":disabled") ||
              (b.prop("disabled", !0),
              $("#dict-output").html(L.searching),
              tryDict($("#dict-input").val(), function (a) {
                if (
                  (addTimeout(function () {
                    b.prop("disabled", !1);
                  }, 500),
                  a.error)
                )
                  return $("#dict-output").html(
                    a.error + ": " + L["wpFail_" + a.error]
                  );
                $("#dict-output").html(
                  processWord(a.word, a.mean, a.theme, a.type.split(","))
                );
              }));
          })
          .hotkey($("#dict-input"), 13),
        $stage.dialog.wordPlusOK
          .on("click", function (a) {
            var b;
            $stage.dialog.wordPlusOK.hasClass("searching") ||
              ((b = $("#wp-input").val()) &&
                ((b = b.replace(/[^a-z가-힣]/g, "")),
                b.length < 2 ||
                  ($("#wp-input").val(""),
                  $(a.currentTarget)
                    .addClass("searching")
                    .html("<i class='fa fa-spin fa-spinner'></i>"),
                  send("wp", {
                    value: b,
                  }))));
          })
          .hotkey($("#wp-input"), 13),
        $stage.dialog.wordReqSubmit.on("click", () => {
          if (!$("#wordReq-list").val())
            return alertSync("추가 요청할 단어들을 입력해주세요.");
          $.post("/request/word", {
            submitter: $data.id,
            theme: $("#wordReq-theme").val(),
            list: $("#wordReq-list").val(),
          }).then(
            () => {
              alertSync("추가 요청이 완료되었습니다.");
              $stage.dialog.wordReq.hide();
            },
            () => {
              alertSync("추가 요청에 실패했습니다.");
            }
          );
        }),
        $stage.dialog.inviteRobot.on("click", function (a) {
          requestInvite("AI");
        }),
        $stage.box.me.on("click", function (a) {
          requestProfile($data.id);
        }),
        $stage.dialog.roomInfoJoin.on("click", function (a) {
          $stage.dialog.roomInfo.hide(), tryJoin($data._roominfo);
        }),
        $stage.dialog.profileHandover.on("click", function (a) {
          confirm(L.sureHandover) &&
            send("handover", {
              target: $data._profiled,
            });
        }),
        $stage.dialog.profileKick.on("click", function (a) {
          send("kick", {
            robot: $data.robots.hasOwnProperty($data._profiled),
            target: $data._profiled,
          });
        }),
        $stage.dialog.profileShut.on("click", function (a) {
          var b = $data.users[$data._profiled];
          b && toggleShutBlock(b.profile.title || b.profile.name);
        }),
        $stage.dialog.profileWhisper.on("click", function (a) {
          var b = $data.users[$data._profiled];
          $stage.talk
            .val(
              "/e " +
                (b.profile.title || b.profile.name).replace(/\s/g, "") +
                " "
            )
            .focus();
        }),
        $stage.dialog.profileOpenMng.on("click", () => {
          showDialog($stage.dialog.management);
          $("#target-id").text($stage.dialog.profileOpenMng.target.id);
          $("#target-nickname").text(
            $stage.dialog.profileOpenMng.target.nickname
          );
        }),
        $stage.dialog.profileReport.on("click", function (a) {
          var b = $data.users[$data._profiled];
          $("#report-reason").val("");
          $("#report-accept").attr("checked", false);
          showDialog($stage.dialog.reportDiag);
          $("#report-target").text(b.id);
          $("#submitter").text($data.id);
        }),
        $stage.dialog.profileDress.on("click", function (a) {
          return $data.guest
            ? fail(421)
            : $data._gaming
            ? fail(438)
            : void (
                showDialog($stage.dialog.dress) &&
                $.get("/box", function (a) {
                  if (a.error) return fail(a.error);
                  ($data.box = a), drawMyDress();
                })
              );
        }),
        $stage.dialog.dressOK.on("click", async (a) => {
          let data = {};

          if ($("#dress-nickname").val() !== $data.nickname)
            data.nickname = await checkNick($("#dress-nickname").val());
          if ($("#dress-exordial").val() !== $data.exordial)
            data.exordial = $("#dress-exordial").val();

          if (data.nickname || data.exordial)
            $.post("/profile", data, (res) => {
              if (res.error) return fail(res.error);
              else {
                if (data.nickname) {
                  $data.users[$data.id].nickname = $data.nickname =
                    data.nickname;
                  $("#account-info").text(data.nickname);
                }
                if (data.exordial || data.exordial === "")
                  $data.users[$data.id].exordial = $data.exordial =
                    data.exordial;

                send("bulkRefresh");
                //send("updateProfile", { id: $data.id, nickname: $data.nickname, exordial: $data.exordial });
                alertSync(
                  `${
                    data.nickname
                      ? data.exordial || data.exordial === ""
                        ? "별명이 " +
                          $data.nickname +
                          "(으)로, 소개말이 " +
                          $data.exordial +
                          "으(로) 변경되었습니다."
                        : "별명이 " + $data.nickname + "(으)로 변경되었습니다."
                      : "소개말이 " + $data.exordial + "(으)로 변경되었습니다."
                  }`
                );
              }
              $stage.dialog.dressOK.attr("disabled", false);
            });
          $stage.dialog.dress.hide();
        }),
        $("#DressDiag .dress-type").on("click", function (a) {
          var b = $(a.currentTarget),
            c = b.attr("id").slice(11);
          $(".dress-type.selected").removeClass("selected"),
            b.addClass("selected"),
            drawMyGoods("all" == c || b.attr("value"));
        }),
        $("#dress-cf").on("click", function (a) {
          if ($data._gaming) return fail(438);
          showDialog($stage.dialog.charFactory) && drawCharFactory();
        }),
        $stage.dialog.cfCompose.on("click", function (a) {
          if (!$stage.dialog.cfCompose.hasClass("cf-composable"))
            return fail(436);
          confirm(L.cfSureCompose) &&
            $.post(
              "/cf",
              {
                tray: $data._tray.join("|"),
              },
              function (a) {
                var b;
                if (a.error) return fail(a.error);
                send("refresh");
                alertSync(L.cfComposed);
                $data.users[$data.id].money = a.money;
                $data.box = a.box;
                for (b in a.gain) queueObtain(a.gain[b]);
                drawMyDress($data._avGroup);
                updateMe();
                drawCharFactory();
              }
            );
        }),
        $("#room-injeong-pick").on("click", () => {
          var b,
            c = RULE[MODE[$("#room-mode").val()]];
          $("#injpick-list>div").hide(),
            "ko" == c.lang
              ? (($data._ijkey = "#ko-pick-"), $("#ko-pick-list").show())
              : "en" == c.lang &&
                (($data._ijkey = "#en-pick-"), $("#en-pick-list").show()),
            $stage.dialog.injPickNo.trigger("click");
          for (b in $data._injpick)
            $($data._ijkey + $data._injpick[b]).prop("checked", !0);
          showDialog($stage.dialog.injPick);
        }),
        $stage.dialog.injPickAll.on("click", function (a) {
          $("#injpick-list input").prop("checked", !0);
        }),
        $stage.dialog.injPickNo.on("click", function (a) {
          $("#injpick-list input").prop("checked", !1);
        }),
        $stage.dialog.kickVoteY.on("click", function (a) {
          send("kickVote", {
            agree: !0,
          }),
            clearTimeout($data._kickTimer),
            $stage.dialog.kickVote.hide();
        }),
        $stage.dialog.kickVoteN.on("click", function (a) {
          send("kickVote", {
            agree: !1,
          }),
            clearTimeout($data._kickTimer),
            $stage.dialog.kickVote.hide();
        }),
        $stage.dialog.reportSubmit.on("click", function (a) {
          if ($("#report-accept").is(":checked")) {
            $.post("/report", {
              target: $("#report-target").text(),
              submitter: $data.id,
              reason: $("#report-reason").val(),
            });
            alertSync(
              `신고가 완료되었습니다.\n\n대상: ${$(
                "#report-target"
              ).text()}\n신고자: ${$data.id}\n사유: ${$(
                "#report-reason"
              ).val()}`
            ),
              $stage.dialog.reportDiag.hide();
          } else alertSync("본인 또한 처벌 받을 수 있음에 동의해주세요.");
        }),
        $stage.dialog.purchaseOK.on("click", function (a) {
          $.post("/buy/" + $data._sgood, function (a) {
            var b = $data.users[$data.id];
            if (a.error) return fail(a.error);
            alertSync(L.purchased),
              (b.money = a.money),
              (b.box = a.box),
              updateMe();
          }),
            $stage.dialog.purchase.hide();
        }),
        $stage.dialog.purchaseNO.on("click", function (a) {
          $stage.dialog.purchase.hide();
        }),
        $stage.menu.cursing.click(function () {
          $stage.dialog.cursing.toggle();

          if ($stage.dialog.cursing.css("display") == "block") {
            getBad($stage.dialog.cursingValue);
          }
        }),
        $stage.dialog.obtainOK.on("click", function (a) {
          var b = $data._obtain.shift();
          b ? drawObtain(b) : $stage.dialog.obtain.hide();
        }),
        $stage.dialog.alertKKuTuOK.on("click", function (a) {
          $stage.dialog.alertKKuTu.hide();
        }),
        $("#popup-ok").on("click", function (a) {
          $stage.dialog.popupKKuTu.hide();
        }),
        $stage.dialog.newClan.on("click", function (a) {
          showDialog($stage.dialog.newClanDiag);
        }),
        $stage.dialog.viewClan.on("click", function (a) {
          showDialog($stage.dialog.viewClanDiag);
          if (!$clan.name)
            alert("클랜에 가입하지 않았습니다."),
              $stage.dialog.viewClanDiag.hide();
          else {
            var f,
              g = getLevel($clan.score);
            $("#deleteClan").hide(),
              $("#kickTarget").hide(),
              $("#kickUser").hide(),
              $("#leaveClan").show(),
              $("#extendMax").hide();
            if ($clan.users[$data.id] == 2)
              $("#deleteClan").show(),
                $("#kickTarget").show(),
                $("#kickUser").show(),
                $("#leaveClan").hide(),
                $("#extendMax").show();
            else if ($clan.users[$data.id] == 1)
              $("#kickTarget").show(),
                $("#kickUser").show(),
                $("#extendMax").show();
            $("#myClanName").html(`클랜 이름: ${$clan.name}`),
              $("#myClanID").html(`클랜 ID: ${$clan._id}`),
              $("#myClanMax").html(
                `클랜원 수: ${Object.keys($clan.users).length}/${$clan.max}명`
              ),
              $("#myClanActivate").html(`클랜 활동량: ${$clan.score}`),
              $("#myClanLevel").attr(
                "src",
                `https://cdn.jsdelivr.net/npm/bfkkutudelivr@${L.cdn_version}/img/kkutu/clanlv/lv${g}.png`
              ),
              //table.append($("<tr>").append($("<td>").text(Number(i)+1)).append($("<td>").text(inquiry.title)).append($("<td>").text(answer.answered ? L.inquire_answered : L.inquire_waiting)).append($("<td>").append($(`<button id="showdetail_${inquiry.submitter}_${inquiry.date}">`).text(L.inquire_showdetail))))
              $("#clanUserList tbody").empty();
            for (f in $clan.users)
              $("#clanUserList tbody").append(
                $("<tr>")
                  .append($("<td>").text(f))
                  .append($("<td>").text($clan.uname[f]))
                  .append($("<td>").text(`${L["clanPerm" + $clan.users[f]]}`))
              );
          }
        }),
        $stage.dialog.deleteClan.on("click", function (a) {
          var _password = prompt(
            `${$clan.name} 클랜을 삭제하시려면 클랜 생성 시 입력한 비밀번호를 입력해주세요.`
          );
          $.post(
            "/clan/remove",
            {
              id: $clan._id,
              me: $data.id,
              password: _password,
            },
            function (data) {
              if (data.message == "PERMISSIONFAIL")
                alertSync("클랜 마스터만 클랜을 삭제할 수 있습니다.");
              else if (data.message == "PASSWORDFAIL")
                alertSync("비밀번호가 잘못되었습니다.");
              else {
                alertSync(`${$clan.name} 클랜이 삭제되었습니다.`);
                $clan = {};
                $stage.dialog.viewClanDiag.hide();
              }
            }
          );
        }),
        $stage.dialog.makeClan.on("click", async (b) => {
          const name = $("#clanName").val();

          if (!$clan._id) {
            if (name == null)
              await alert("클랜 이름을 자음만으로 지정하실 수 없습니다.");
            else if (name == undefined)
              await alert("클랜 이름을 자음만으로 지정하실 수 없습니다.");
            else if (/[(ㄱ-ㅎ)]/gi.test(name))
              await alert("클랜 이름을 자음만으로 지정하실 수 없습니다.");
            else if (!/[(가-힣a-zA-Z)]/gi.test(name))
              await alert("클랜 이름에 잘못된 문자가 포함되어 있습니다.");
            else if (name.length > 8)
              await alert("클랜 이름 길이 제한은 최대 8글자까지입니다.");
            else if (name.match("<"))
              await alert("클랜 이름에 잘못된 문자가 포함되어 있습니다.");
            else if (name.match(">"))
              await alert("클랜 이름에 잘못된 문자가 포함되어 있습니다.");
            else if (name.match("&lt"))
              await alert("클랜 이름에 잘못된 문자가 포함되어 있습니다.");
            else if (name.match("　"))
              await alert("클랜 이름에 잘못된 문자가 포함되어 있습니다.");
            else {
              const withoutBadWords = delBadWords(name);
              const _password = prompt(
                "클랜 관리 시 사용할 비밀번호를 입력해주세요.\n클랜 부마스터도 이 비밀번호를 알아야 클랜 관리 기능을 사용할 수 있습니다.\n※ 비밀번호는 암호화되어 저장되므로 잊을 경우 다시 찾을 수 없습니다. ※"
              );
              if (!_password) return await alert("비밀번호를 입력하세요.");
              $.post(
                "/clan/create",
                {
                  me: $data.id,
                  name: withoutBadWords,
                  password: _password,
                },
                async (r) => {
                  if (r.message == "MONEYFAIL")
                    await alert("핑이 부족합니다! (5000핑 필요)"),
                      $stage.dialog.newClanDiag.hide();
                  else {
                    alertSync(
                      `5000핑을 소비하여 ${withoutBadWords} 클랜을 만들었습니다!`
                    );
                    getClan($data.id);
                    $stage.dialog.newClanDiag.hide();
                  }
                }
              );
            }
          } else {
            await alert("이미 클랜에 가입되어 있습니다!");
            $stage.dialog.newClanDiag.hide();
          }
        }),
        $stage.dialog.kickUser.on("click", async (c) => {
          var a = $("#kickTarget").val(),
            cf = confirm(`정말 ${a}님을 추방하시겠습니까?`);
          if (cf && a === $data.id)
            await alert("자기 자신은 추방할 수 없습니다!");
          else if (cf && $clan.users[$data.id] == 2)
            await alert("클랜 마스터와 클랜 관리자만 추방할 수 있습니다.");
          else if (cf) {
            var _password = prompt(
              "클랜 생성 시 지정한 비밀번호를 입력해주세요."
            );
            $.post(
              "/clan/user/remove",
              {
                me: a,
                id: $clan._id,
                password: _password,
              },
              async (d) => {
                if (d.message == "FAIL")
                  await alert(
                    "추방 실패! 추방 대상 유저 ID가 잘못되었을 수 있습니다."
                  );
                else if (d.message == "PERMISSIONFAIL")
                  await alert("권한이 부족합니다.");
                else if (d.message == "PASSWORDFAIL")
                  await alert("비밀번호가 잘못되었습니다.");
                else alertSync(`${a}님을 추방했습니다!`), getClan($data.id);
              }
            );
          }
        }),
        $stage.dialog.extendMax.on("click", async (c) => {
          var cf = confirm(
            `5000핑을 소비하여 클랜원 제한을 ${
              Number($clan.max) + 10
            }명으로 늘리시겠습니까?`
          );
          if (cf && $clan.users[$data.id] == 0)
            await alert("클랜 마스터 또는 부마스터만 확장할 수 있습니다.");
          else if (cf) {
            var _password = prompt(
              "클랜 생성 시 지정한 비밀번호를 입력해주세요."
            );
            $.post(
              "/clan/extend",
              {
                me: $data.id,
                id: $clan._id,
                password: _password,
              },
              async (d) => {
                if (d.message == "FAIL")
                  await alert("알 수 없는 문제로 인해 실패했습니다.");
                else if (d.message == "PERMISSIONFAIL")
                  await alert("권한이 부족합니다.");
                else if (d.message == "MAX")
                  await alert("클랜 확장 한도에 도달했습니다. (50명)");
                else
                  alertSync(
                    `클랜원 제한을 ${Number($clan.max) + 10}명으로 늘렸습니다.`
                  ),
                    $stage.dialog.viewClanDiag.hide(),
                    ($clan.max = Number($clan.max) + 10),
                    $stage.dialog.viewClan.trigger("click");
              }
            );
          }
        }),
        $stage.dialog.joinClan.on("click", async (a) => {
          if (!$clan.name) {
            var f = $("#joinTarget").val();
            $.post(
              "/clan/user/add",
              {
                me: $data.id,
                id: f,
              },
              async (d) => {
                if (d.message == "FAIL")
                  await alert(
                    "가입 실패! 가입 대상 클랜 ID가 잘못되었을 수 있습니다."
                  );
                else if (d.message == "USERLIMITFAIL")
                  await alert("가입 실패! 클랜원 한도에 도달한 클랜입니다.");
                else if (d.message == "BANNED")
                  await alert(
                    "가입 실패! 차단 당한 클랜에는 다시 가입할 수 없습니다."
                  );
                else alertSync(`${f} 클랜에 가입했습니다!`), getClan($data.id);
              }
            );
          } else {
            await alert("이미 클랜에 가입되어 있습니다.");
          }
        }),
        $stage.dialog.leaveClan.on("click", async (a) => {
          if (!$clan.name) await alert("클랜에 가입되어 있지 않습니다!");
          else {
            if (confirm(`정말 ${$clan.name} 클랜을 떠나시겠습니까?`))
              $.post("/clan/user/leave", {
                me: $data.id,
              })
                .done(() => {
                  alertSync(`${$clan.name} 클랜을 떠났습니다!`);
                  $clan = {};
                  $stage.dialog.viewClanDiag.hide();
                })
                .fail((err) => alert(L[`clanError_${err.status}`]));
          }
        }),
        i = 0;
      i < 5;
      i++
    )
      $(".team-" + i).on("click", f),
        $("#room-unknownword.game-option").click(() =>
          $("#room-unknownword.game-option").is(":checked")
            ? $(".game-option")
                .not("#room-unknownword.game-option")
                .not("#room-mission.game-option")
                .not("#room-randommission.game-option")
                .not("#room-moremission.game-option")
                .not("#room-returns.game-option")
                .not("#room-randomturn.game-option")
                .not("#room-ignoreinitial.game-option")
                .prop("checked", false)
                .prop("disabled", true)
            : $(".game-option").prop("disabled", false)
        );
    $stage.dialog.replayView.on("click", () => {
      $stage.dialog.replayDetail.hide();
      replayReady();
    }),
      $("button.item").click((e) => {
        const item = $item[e.currentTarget.id];
        if (!item) return;
        if ($data.room && $data._gaming && $data.room.opts.item) {
          if (item.count == item.limit) notice(L.itemLimitReached, L.item);
          else {
            send("item", {
              id: e.currentTarget.id,
            });
            notice(`${L.itemUsed} ${item.limit - ++item.count}회`, L.item);
            $("#items").hide();
          }
        }
      }),
      addInterval(() => {
        spamCount > 0
          ? (spamCount = 0)
          : spamWarning > 0 && (spamWarning -= 0.03);
      }, 1e3);
  }),
    ($lib.Classic.roundReady = function (a) {
      $("#items").hide();
      /*if ($data.room.opts.tournament) {
        $("#Background").attr("src", "/img/bg/dark.png");
        $("#Top").hide();
        $(".ADBox").remove();
        $(".GameBox").css(
          "background-image",
          "url('/img/kkutu/roomTournamentGameBg.jpg')"
        );
      } else if ($("#Top").css("display") == "none") {
        $("#Background").attr(
          "src",
          "https://cdn.jsdelivr.net/npm/bfkkutudelivr@latest/img/bg/def.png"
        );
        $("#Top").show();
        $(".GameBox").css(
          "background-image",
          "url('https://cdn.jsdelivr.net/npm/bfkkutudelivr@latest/img/kkutu/gamebg.png')"
        );
      }*/
      clearBoard();
      $data._roundTime = 1e3 * $data.room.time;
      $stage.game.display.html(getCharText(a.char, a.subChar));
      $stage.game.chain.show().html(($data.chain = 0));
      if ($data.room.opts.mission)
        $stage.game.items
          .show()
          .css("opacity", 1)
          .html(($data.mission = a.mission));
      /*$data.room.opts.blockWord && $stage.game.items.show().css("opacity", 1).html($data.blockWord = a.blockWord),*/ "KAP" ==
        MODE[$data.room.mode] &&
        $(".jjoDisplayBar .graph-bar").css({
          float: "right",
          "text-align": "left",
        });
      drawRound(a.round);
      if ($data.room.opts.item) initItem();
      playSound("round_start");
    }),
    ($lib.Classic.turnStart = function (a) {
      $data.room.game.turn = a.turn;
      a.seq && ($data.room.game.seq = a.seq);
      if (!($data._tid = $data.room.game.seq[a.turn])) return;
      if ($data._tid.robot) $data._tid = $data._tid.id;

      a.id = $data._tid;
      $stage.game.display.html(
        ($data._char = getCharText(a.char, a.subChar, a.wordLength))
      );
      $("#game-user-" + a.id).addClass("game-user-current");
      if (a.id == $data.id && $data.room.opts.item && $data.chain != 0) {
        $("#items").css("display", "flex");
        $("#Chat").height(80);
        $(document).on("keydown", itemCommandEvent);
      } else {
        $("#items").hide();
        if ($data.room.opts.item) {
          $("#Chat").height(110);
          $(".ChatBox").height(180);
          $(document).off("keydown", itemCommandEvent);
        }
      }
      $data._replay ||
        ($stage.game.here.css("display", a.id == $data.id ? "block" : "none"),
        a.id == $data.id &&
          (mobile
            ? $stage.game.hereText.val("").focus()
            : $stage.talk.focus()));
      $stage.game.items.html(($data.mission = a.mission));
      ws.onmessage = _onMessage;
      clearInterval($data._tTime);
      $data._chars = [a.char, a.subChar];
      $data._speed = a.speed;
      $data._tTime = addInterval(turnGoing, TICK);
      $data.turnTime = a.turnTime;
      $data._turnTime = a.turnTime;
      $data._roundTime = a.roundTime;
      $data._turnSound = playSound("T" + a.speed);
    }),
    ($lib.Classic.turnGoing = function () {
      $data.room || clearInterval($data._tTime),
        ($data._turnTime -= TICK),
        ($data._roundTime -= TICK),
        $stage.game.turnBar
          .width($data._timePercent())
          .html((0.001 * $data._turnTime).toFixed(1) + L.SECOND),
        $stage.game.roundBar
          .width(($data._roundTime / $data.room.time) * 0.1 + "%")
          .html((0.001 * $data._roundTime).toFixed(1) + L.SECOND),
        $stage.game.roundBar.hasClass("round-extreme") ||
          ($data._roundTime <= 5e3 &&
            $stage.game.roundBar.addClass("round-extreme"));
    }),
    ($lib.Classic.turnEnd = function (a, c) {
      var d,
        e = $("<div>")
          .addClass("deltaScore")
          .html(c.score > 0 ? "+" + (c.score - c.bonus) : c.score),
        f = $(".game-user-current");
      if ($data._turnSound) $data._turnSound.stop();
      addScore(a, c.score);
      clearInterval($data._tTime);
      if (MODE[$data.room.mode] == "KKT") {
        if (c.ok) {
          checkFailCombo();
          clearTimeout($data._fail);
          $stage.game.here.hide();
          $stage.game.chain.html(++$data.chain);
          pushDisplay(c.value, c.mean, c.theme, c.wc);
        } else {
          checkFailCombo(a);
          e.addClass("lost");
          $(".game-user-current").addClass("game-user-bomb");
          $stage.game.here.hide();
          playSound("timeout");
        }
        if (c.hint) {
          c.hint = c.hint._id;
          d = c.hint.indexOf($data._chars[0]);
          if (d == -1) d = c.hint.indexOf($data._chars[1]);
          else
            $stage.game.display
              .empty()
              .append($("<label>").html(c.hint.slice(0, d + 1)))
              .append(
                $("<label>")
                  .css("color", "#AAAAAA")
                  .html(c.hint.slice(d + 1))
              );
        }
        if (c.bonus) {
          if (mobile) e.html("+" + (b.score - b.bonus) + "+" + b.bonus);
          else
            addTimeout(function () {
              var a = $("<div>")
                .addClass("deltaScore bonus")
                .html("+" + c.bonus);
              drawObtainedScore(f, a);
            }, 500);
        }
      } else {
        if (c.ok) {
          checkFailCombo();
          clearTimeout($data._fail);
          $stage.game.here.hide();
          $stage.game.chain.html(++$data.chain);
          pushDisplay(c.value, c.mean, c.theme, c.wc);
        } else {
          checkFailCombo(a);
          e.addClass("lost");
          $(".game-user-current").addClass("game-user-bomb");
          $stage.game.here.hide();
          playSound("timeout");
        }
        if (c.hint) {
          c.hint = c.hint._id;
          d = c.hint.indexOf($data._chars[0]);
          if (d == -1) d = c.hint.indexOf($data._chars[1]);
          if ("KAP" == MODE[$data.room.mode])
            $stage.game.display
              .empty()
              .append(
                $("<label>").css("color", "#AAAAAA").html(c.hint.slice(0, d))
              )
              .append($("<label>").html(c.hint.slice(d)));
          else
            $stage.game.display
              .empty()
              .append($("<label>").html(c.hint.slice(0, d + 1)))
              .append(
                $("<label>")
                  .css("color", "#AAAAAA")
                  .html(c.hint.slice(d + 1))
              );
        }
        if (c.bonus) {
          if (mobile) e.html("+" + (b.score - b.bonus) + "+" + b.bonus);
          else
            addTimeout(function () {
              var a = $("<div>")
                .addClass("deltaScore bonus")
                .html("+" + c.bonus);
              drawObtainedScore(f, a);
            }, 500);
        }
      }
      drawObtainedScore(f, e).removeClass("game-user-current");
      updateScore(a, getScore(a));
    }),
    ($lib.DaneoClassic.roundReady = function (a) {
      $("#items").hide();
      $data.room.game.title.length;
      clearBoard(),
        ($data._roundTime = 1e3 * $data.room.time),
        $stage.game.display.html(
          ($data._char = "&lt;" + L["theme_" + a.theme] + "&gt;")
        ),
        $stage.game.chain.show().html(($data.chain = 0)),
        $data.room.opts.mission &&
          $stage.game.items
            .show()
            .css("opacity", 1)
            .html(($data.mission = a.mission)),
        "KAP" == MODE[$data.room.mode] &&
          $(".jjoDisplayBar .graph-bar").css({
            float: "right",
            "text-align": "left",
          }),
        drawRound(a.round),
        playSound("round_start");
    }),
    ($lib.DaneoClassic.turnStart = function (a) {
      ($data.room.game.turn = a.turn),
        a.seq && ($data.room.game.seq = a.seq),
        ($data._tid = $data.room.game.seq[a.turn]) &&
          ($data._tid.robot && ($data._tid = $data._tid.id),
          (a.id = $data._tid),
          $stage.game.display.html(
            ($data._char = getCharText(a.char, a.subChar, a.wordLength))
          ),
          $("#game-user-" + a.id).addClass("game-user-current"),
          $data._replay ||
            ($stage.game.here.css(
              "display",
              a.id == $data.id ? "block" : "none"
            ),
            a.id == $data.id &&
              (mobile
                ? $stage.game.hereText.val("").focus()
                : $stage.talk.focus())),
          $stage.game.items.html(($data.mission = a.mission)),
          (ws.onmessage = _onMessage),
          clearInterval($data._tTime),
          ($data._chars = [a.char, a.subChar]),
          ($data._speed = a.speed),
          ($data._tTime = addInterval(turnGoing, TICK)),
          ($data.turnTime = a.turnTime),
          ($data._turnTime = a.turnTime),
          ($data._roundTime = a.roundTime),
          ($data._turnSound = playSound("T" + a.speed)));
    }),
    ($lib.DaneoClassic.turnGoing = $lib.Classic.turnGoing),
    ($lib.DaneoClassic.turnEnd = function (a, c) {
      var d,
        e = $("<div>")
          .addClass("deltaScore")
          .html(c.score > 0 ? "+" + (c.score - c.bonus) : c.score),
        f = $(".game-user-current");
      $data._turnSound && $data._turnSound.stop(),
        addScore(a, c.score),
        clearInterval($data._tTime),
        c.ok
          ? (checkFailCombo(),
            clearTimeout($data._fail),
            $stage.game.here.hide(),
            $stage.game.chain.html(++$data.chain),
            pushDisplay(c.value, c.mean, c.theme, c.wc))
          : (checkFailCombo(a),
            e.addClass("lost"),
            $(".game-user-current").addClass("game-user-bomb"),
            $stage.game.here.hide(),
            playSound("timeout")),
        c.hint &&
          ((c.hint = c.hint._id),
          (d = c.hint.indexOf($data._chars[0])),
          -1 == d && (d = c.hint.indexOf($data._chars[1])),
          "KAP" == MODE[$data.room.mode]
            ? $stage.game.display
                .empty()
                .append(
                  $("<label>").css("color", "#AAAAAA").html(c.hint.slice(0, d))
                )
                .append($("<label>").html(c.hint.slice(d)))
            : $stage.game.display
                .empty()
                .append($("<label>").html(c.hint.slice(0, d + 1)))
                .append(
                  $("<label>")
                    .css("color", "#AAAAAA")
                    .html(c.hint.slice(d + 1))
                )),
        c.bonus &&
          (mobile
            ? e.html("+" + (b.score - b.bonus) + "+" + b.bonus)
            : addTimeout(function () {
                var a = $("<div>")
                  .addClass("deltaScore bonus")
                  .html("+" + c.bonus);
                drawObtainedScore(f, a);
              }, 500)),
        drawObtainedScore(f, e).removeClass("game-user-current"),
        updateScore(a, getScore(a));
    }),
    ($lib.Jaqwi.roundReady = function (a) {
      var b = L.jqTheme + ": " + L["theme_" + a.theme];
      $("#items").hide();
      clearBoard(),
        ($data._roundTime = 1e3 * $data.room.time),
        ($data._fastTime = 1e4),
        $stage.game.display.html(b),
        $stage.game.items.hide(),
        $stage.game.hints.show(),
        $(".jjo-turn-time .graph-bar")
          .width("100%")
          .html(b)
          .css("text-align", "center"),
        drawRound(a.round),
        playSound("round_start"),
        clearInterval($data._tTime);
    }),
    ($lib.Jaqwi.turnStart = function (a) {
      $(".game-user-current").removeClass("game-user-current"),
        $(".game-user-bomb").removeClass("game-user-bomb"),
        $data.room.game.seq.indexOf($data.id) >= 0 && $stage.game.here.show(),
        $stage.game.display.html(($data._char = a.char)),
        clearInterval($data._tTime),
        ($data._tTime = addInterval(turnGoing, TICK)),
        playBGM("jaqwi");
    }),
    ($lib.Jaqwi.turnGoing = function () {
      var a,
        b,
        c = $stage.game.roundBar;
      $data.room || clearInterval($data._tTime),
        ($data._roundTime -= TICK),
        (b = $data._spectate
          ? L.stat_spectate
          : (0.001 * $data._roundTime).toFixed(1) + L.SECOND),
        c.width(($data._roundTime / $data.room.time) * 0.1 + "%").html(b),
        c.hasClass("round-extreme") ||
          ($data._roundTime <= $data._fastTime &&
            ((a = $data.bgm.currentTime / $data.bgm.duration),
            $data.bgm.paused ? stopBGM() : playBGM("jaqwiF"),
            ($data.bgm.currentTime = $data.bgm.duration * a),
            c.addClass("round-extreme")));
    }),
    ($lib.Jaqwi.turnHint = function (a) {
      playSound("mission"), pushHint(a.hint);
    }),
    ($lib.Jaqwi.turnEnd = function (a, b) {
      var c = $("<div>")
          .addClass("deltaScore")
          .html("+" + b.score),
        d = $("#game-user-" + a);
      b.giveup
        ? d.addClass("game-user-bomb")
        : b.answer
        ? ($stage.game.here.hide(),
          $stage.game.display.html(
            $("<label>").css("color", "#FFFF44").html(b.answer)
          ),
          stopBGM(),
          playSound("horr"))
        : (a == $data.id && $stage.game.here.hide(),
          addScore(a, b.score),
          $data._roundTime > 1e4 && ($data._roundTime = 1e4),
          drawObtainedScore(d, c),
          updateScore(a, getScore(a)).addClass("game-user-current"),
          playSound("success"));
    }),
    ($lib.Crossword.roundReady = function (a, b) {
      var c = a.seq ? a.seq.indexOf($data.id) : -1;
      $("#items").hide();
      clearBoard(),
        $(".jjoriping,.rounds,.game-body").addClass("cw"),
        ($data._roundTime = 1e3 * $data.room.time),
        ($data._fastTime = 3e4),
        ($data.selectedRound = -1 == c ? 1 : (c % $data.room.round) + 1),
        $stage.game.items.hide(),
        $stage.game.cwcmd.show().css("opacity", 0),
        drawRound($data.selectedRound),
        b || playSound("round_start"),
        clearInterval($data._tTime);
    }),
    ($lib.Crossword.turnEnd = function (a, b) {
      var c,
        d,
        e = $("<div>")
          .addClass("deltaScore")
          .html("+" + b.score),
        f = $("#game-user-" + a);
      b.score
        ? ((d = b.pos.join(",")),
          a == $data.id
            ? ($stage.game.cwcmd.css("opacity", 0), playSound("success"))
            : ($data._sel &&
                b.pos.join(",") == $data._sel.join(",") &&
                $stage.game.cwcmd.css("opacity", 0),
              playSound("mission")),
          ($data._bdb[d][4] = b.value),
          ($data._bdb[d][5] = a),
          b.pos[0] == $data.selectedRound - 1
            ? $lib.Crossword.drawDisplay()
            : ((c = $(
                $stage.game.round.children("label").get(b.pos[0])
              ).addClass("round-effect")),
              addTimeout(function () {
                c.removeClass("round-effect");
              }, 800)),
          addScore(a, b.score),
          updateScore(a, getScore(a)),
          drawObtainedScore(f, e))
        : (stopBGM(), $stage.game.round.empty(), playSound("horr"));
    }),
    ($lib.Crossword.drawDisplay = function () {
      var a,
        b,
        c,
        d,
        e,
        f,
        g,
        h,
        i,
        j = $data._boards[$data.selectedRound - 1],
        k = $stage.game.display.empty(),
        l = {};
      for (b in j)
        for (
          d = Number(j[b][0]),
            e = Number(j[b][1]),
            f = "1" == j[b][2],
            g = Number(j[b][3]),
            h = j[b][4],
            k.append(
              (a = $("<div>")
                .addClass("cw-bar")
                .attr("id", "cw-" + d + "-" + e + "-" + j[b][2])
                .css({
                  top: 12.5 * e + "%",
                  left: 12.5 * d + "%",
                  width: 12.5 * (f ? 1 : g) + "%",
                  height: 12.5 * (f ? g : 1) + "%",
                }))
            ),
            h && a.addClass("cw-open"),
            j[b][5] == $data.id
              ? a.addClass("cw-my-open")
              : a
                  .on("click", $lib.Crossword.onBar)
                  .on("mouseleave", $lib.Crossword.onSwap),
            c = 0;
          c < g;
          c++
        )
          (i = d + "-" + e),
            h && (l[i] = h.charAt(c)),
            a.append(
              $("<div>")
                .addClass("cw-cell")
                .attr("id", "cwc-" + i)
                .html(l[i] || "")
            ),
            f ? e++ : d++;
    }),
    ($lib.Crossword.onSwap = function (a) {
      $stage.game.display.prepend($(a.currentTarget));
    }),
    ($lib.Crossword.onRound = function (a) {
      var b = $(a.currentTarget).html().charCodeAt(0) - 9311;
      drawRound(($data.selectedRound = b)),
        $(".rounds label").on("click", $lib.Crossword.onRound),
        $lib.Crossword.drawDisplay();
    }),
    ($lib.Crossword.onBar = function (a) {
      var b = $(a.currentTarget),
        c = b.attr("id").slice(3).split("-"),
        d = $data._means[$data.selectedRound - 1][c.join(",")],
        e = "1" == d.dir;
      $stage.game.cwcmd.css("opacity", 1),
        ($data._sel = [$data.selectedRound - 1, c[0], c[1], c[2]]),
        $(".cw-q-head").html(L[e ? "cwVert" : "cwHorz"] + d.len + L.cwL),
        $("#cw-q-input").val("").focus(),
        $(".cw-q-body").html(
          processWord("★", d.mean, d.theme, d.type.split(","))
        );
    }),
    ($lib.Crossword.turnStart = function (a, b) {
      var c, d;
      ($data._bdb = {}), ($data._boards = a.boards), ($data._means = a.means);
      for (c in a.boards)
        for (d in a.boards[c])
          $data._bdb[
            [c, a.boards[c][d][0], a.boards[c][d][1], a.boards[c][d][2]].join(
              ","
            )
          ] = a.boards[c][d];
      $(".rounds label").on("click", $lib.Crossword.onRound),
        $lib.Crossword.drawDisplay(),
        clearInterval($data._tTime),
        ($data._tTime = addInterval(turnGoing, TICK)),
        playBGM("jaqwi");
    }),
    ($lib.Crossword.turnGoing = $lib.Jaqwi.turnGoing),
    ($lib.Crossword.turnHint = function (a) {
      playSound("fail");
    }),
    ($lib.Typing.roundReady = function (a) {
      $("#items").hide();
      $data.room.game.title.length;
      ($data._chatter = mobile ? $stage.game.hereText : $stage.talk),
        clearBoard(),
        ($data._round = a.round),
        ($data._roundTime = 1e3 * $data.room.time),
        ($data._fastTime = 1e4),
        ($data._list = a.list.concat(a.list)),
        ($data.chain = 0),
        drawList(),
        drawRound(a.round),
        playSound("round_start");
    }),
    ($lib.Typing.spaceOn = function () {
      $data.room.opts.proverb ||
        (($data._spaced = !0),
        $("body").on("keydown", "#" + $data._chatter.attr("id"), onSpace));
    }),
    ($lib.Typing.spaceOff = function () {
      !$data.admin && ($data._spaced = undefined),
        $("body").off("keydown", "#" + $data._chatter.attr("id"), onSpace);
    }),
    ($lib.Typing.turnStart = function (a) {
      $data._spectate ||
        ($stage.game.here.show(),
        mobile
          ? $stage.game.hereText.val("").focus()
          : $stage.talk.val("").focus(),
        $lib.Typing.spaceOn()),
        (ws.onmessage = _onMessage),
        clearInterval($data._tTime),
        ($data._tTime = addInterval(turnGoing, TICK)),
        ($data._roundTime = a.roundTime),
        playBGM("jaqwi");
    }),
    ($lib.Typing.turnGoing = $lib.Jaqwi.turnGoing),
    ($lib.Typing.turnEnd = function (a, b) {
      var c = $("<div>")
          .addClass("deltaScore")
          .html("+" + b.score),
        d = $("#game-user-" + a);
      b.error
        ? ($data.chain++, drawList(), playSound("fail"))
        : b.ok
        ? ($data.id == a
            ? ($data.chain++,
              drawList(),
              playSound("mission"),
              pushHistory(b.value, ""))
            : $data._spectate && playSound("mission"),
          addScore(a, b.score),
          drawObtainedScore(d, c),
          updateScore(a, getScore(a)))
        : (clearInterval($data._tTime),
          $lib.Typing.spaceOff(),
          $stage.game.here.hide(),
          stopBGM(),
          playSound("horr"),
          addTimeout(drawSpeed, 1e3, b.speed),
          $data._round < $data.room.round && restGoing(10));
    }),
    ($lib.Reverse.roundReady = function (a) {
      $("#items").hide();
      $data.room.game.title.length;
      ($data._chatter = mobile ? $stage.game.hereText : $stage.talk),
        clearBoard(),
        ($data._round = a.round),
        ($data._roundTime = 1e3 * $data.room.time),
        ($data._fastTime = 1e4),
        ($data.chain = 0),
        drawRound(a.round),
        playSound("round_start");
    }),
    ($lib.Reverse.turnStart = function (a) {
      $data._spectate ||
        ($stage.game.here.show(),
        mobile
          ? $stage.game.hereText.val("").focus()
          : $stage.talk.val("").focus(),
        $lib.Typing.spaceOn()),
        (ws.onmessage = _onMessage),
        clearInterval($data._tTime),
        ($data._tTime = addInterval(turnGoing, TICK)),
        ($data._roundTime = a.roundTime),
        playBGM("jaqwi");
      $stage.game.display.html(
        $("<label>")
          .css("color", "#FFFF44")
          .html($data.chain % 2 ? "거꾸로!" : "제시어를 입력하세요")
      );
    }),
    ($lib.Reverse.turnGoing = function () {
      var a,
        b,
        c = $stage.game.roundBar;
      $data.room || clearInterval($data._tTime),
        ($data._roundTime -= TICK),
        (b = $data._spectate
          ? L.stat_spectate
          : (0.001 * $data._roundTime).toFixed(1) + L.SECOND),
        c.width(($data._roundTime / $data.room.time) * 0.1 + "%").html(b),
        c.hasClass("round-extreme") ||
          ($data._roundTime <= $data._fastTime &&
            ((a = $data.bgm.currentTime / $data.bgm.duration),
            $data.bgm.paused ? stopBGM() : playBGM("jaqwiF"),
            ($data.bgm.currentTime = $data.bgm.duration * a),
            c.addClass("round-extreme")));
    }),
    ($lib.Reverse.turnEnd = function (a, b) {
      var c = $("<div>")
          .addClass("deltaScore")
          .html("+" + b.score),
        d = $("#game-user-" + a);
      b.error
        ? ($data.chain++, drawList(), playSound("fail"))
        : b.ok
        ? ($data.id == a
            ? ($data.chain++,
              drawList(),
              playSound("mission"),
              pushHistory(b.value, ""))
            : $data._spectate && playSound("mission"),
          addScore(a, b.score),
          drawObtainedScore(d, c),
          updateScore(a, getScore(a)))
        : (clearInterval($data._tTime),
          $lib.Typing.spaceOff(),
          $stage.game.here.hide(),
          stopBGM(),
          playSound("horr"),
          addTimeout(drawSpeed, 1e3, b.speed),
          $data._round < $data.room.round && restGoing(10));
    }),
    ($lib.Hunmin.roundReady = function (a) {
      $("#items").hide();
      $data.room.game.title.length;
      clearBoard(),
        ($data._roundTime = 1e3 * $data.room.time),
        $stage.game.display.html(($data._char = "&lt;" + a.theme + "&gt;")),
        $stage.game.chain.show().html(($data.chain = 0)),
        $data.room.opts.mission &&
          $stage.game.items
            .show()
            .css("opacity", 1)
            .html(($data.mission = a.mission)),
        drawRound(a.round),
        playSound("round_start");
    }),
    ($lib.Hunmin.turnStart = function (a) {
      ($data.room.game.turn = a.turn),
        a.seq && ($data.room.game.seq = a.seq),
        ($data._tid = $data.room.game.seq[a.turn]),
        $data._tid.robot && ($data._tid = $data._tid.id),
        (a.id = $data._tid),
        $stage.game.display.html($data._char),
        $("#game-user-" + a.id).addClass("game-user-current"),
        $data._replay ||
          ($stage.game.here.css("display", a.id == $data.id ? "block" : "none"),
          a.id == $data.id &&
            (mobile
              ? $stage.game.hereText.val("").focus()
              : $stage.talk.focus())),
        $stage.game.items.html(($data.mission = a.mission)),
        (ws.onmessage = _onMessage),
        clearInterval($data._tTime),
        ($data._chars = [a.char, a.subChar]),
        ($data._speed = a.speed),
        ($data._tTime = addInterval(turnGoing, TICK)),
        ($data.turnTime = a.turnTime),
        ($data._turnTime = a.turnTime),
        ($data._roundTime = a.roundTime),
        ($data._turnSound = playSound("T" + a.speed));
    }),
    ($lib.Hunmin.turnGoing = $lib.Classic.turnGoing),
    ($lib.Hunmin.turnEnd = function (a, c) {
      var d,
        e = $("<div>")
          .addClass("deltaScore")
          .html(c.score > 0 ? "+" + (c.score - c.bonus) : c.score),
        f = $(".game-user-current");
      $data._turnSound.stop(),
        addScore(a, c.score),
        clearInterval($data._tTime),
        c.ok
          ? (clearTimeout($data._fail),
            $stage.game.here.hide(),
            $stage.game.chain.html(++$data.chain),
            pushDisplay(c.value, c.mean, c.theme, c.wc))
          : (e.addClass("lost"),
            $(".game-user-current").addClass("game-user-bomb"),
            $stage.game.here.hide(),
            playSound("timeout")),
        c.hint &&
          ((c.hint = c.hint._id),
          (d = c.hint.indexOf($data._chars[0])),
          -1 == d && (d = c.hint.indexOf($data._chars[1])),
          $stage.game.display
            .empty()
            .append($("<label>").html(c.hint.slice(0, d + 1)))
            .append(
              $("<label>")
                .css("color", "#AAAAAA")
                .html(c.hint.slice(d + 1))
            )),
        c.bonus &&
          (mobile
            ? e.html("+" + (b.score - b.bonus) + "+" + b.bonus)
            : addTimeout(function () {
                var a = $("<div>")
                  .addClass("deltaScore bonus")
                  .html("+" + c.bonus);
                drawObtainedScore(f, a);
              }, 500)),
        drawObtainedScore(f, e).removeClass("game-user-current"),
        updateScore(a, getScore(a));
    }),
    ($lib.Daneo.roundReady = function (a) {
      $("#items").hide();
      $data.room.game.title.length;
      clearBoard(),
        ($data._roundTime = 1e3 * $data.room.time),
        $stage.game.display.html(
          ($data._char = "&lt;" + L["theme_" + a.theme] + "&gt;")
        ),
        $stage.game.chain.show().html(($data.chain = 0)),
        $data.room.opts.mission &&
          $stage.game.items
            .show()
            .css("opacity", 1)
            .html(($data.mission = a.mission)),
        drawRound(a.round),
        playSound("round_start");
    }),
    ($lib.Daneo.turnStart = function (a) {
      ($data.room.game.turn = a.turn),
        a.seq && ($data.room.game.seq = a.seq),
        ($data._tid = $data.room.game.seq[a.turn]),
        $data._tid.robot && ($data._tid = $data._tid.id),
        (a.id = $data._tid),
        $stage.game.display.html($data._char),
        $("#game-user-" + a.id).addClass("game-user-current"),
        $data._replay ||
          ($stage.game.here.css("display", a.id == $data.id ? "block" : "none"),
          a.id == $data.id &&
            (mobile
              ? $stage.game.hereText.val("").focus()
              : $stage.talk.focus())),
        $stage.game.items.html(($data.mission = a.mission)),
        (ws.onmessage = _onMessage),
        clearInterval($data._tTime),
        ($data._chars = [a.char, a.subChar]),
        ($data._speed = a.speed),
        ($data._tTime = addInterval(turnGoing, TICK)),
        ($data.turnTime = a.turnTime),
        ($data._turnTime = a.turnTime),
        ($data._roundTime = a.roundTime),
        ($data._turnSound = playSound("T" + a.speed));
    }),
    ($lib.Daneo.turnGoing = $lib.Classic.turnGoing),
    ($lib.Daneo.turnEnd = function (a, c) {
      var d,
        e = $("<div>")
          .addClass("deltaScore")
          .html(c.score > 0 ? "+" + (c.score - c.bonus) : c.score),
        f = $(".game-user-current");
      $data._turnSound.stop(),
        addScore(a, c.score),
        clearInterval($data._tTime),
        c.ok
          ? (clearTimeout($data._fail),
            $stage.game.here.hide(),
            $stage.game.chain.html(++$data.chain),
            pushDisplay(c.value, c.mean, c.theme, c.wc))
          : (e.addClass("lost"),
            $(".game-user-current").addClass("game-user-bomb"),
            $stage.game.here.hide(),
            playSound("timeout")),
        c.hint &&
          ((c.hint = c.hint._id),
          (d = c.hint.indexOf($data._chars[0])),
          -1 == d && (d = c.hint.indexOf($data._chars[1])),
          $stage.game.display
            .empty()
            .append($("<label>").html(c.hint.slice(0, d + 1)))
            .append(
              $("<label>")
                .css("color", "#AAAAAA")
                .html(c.hint.slice(d + 1))
            )),
        c.bonus &&
          (mobile
            ? e.html("+" + (b.score - b.bonus) + "+" + b.bonus)
            : addTimeout(function () {
                var a = $("<div>")
                  .addClass("deltaScore bonus")
                  .html("+" + c.bonus);
                drawObtainedScore(f, a);
              }, 500)),
        drawObtainedScore(f, e).removeClass("game-user-current"),
        updateScore(a, getScore(a));
    }),
    ($lib.Drawing.roundReady = function (a, b) {
      $("#items").hide();
      L.jqTheme, L["theme_" + a.theme];
      clearBoard(),
        $(".jjoriping,.rounds,.game-body").addClass("cw"),
        $(".jjoriping,.rounds").addClass("dg"),
        $(".game-user-drawing").removeClass("game-user-drawing"),
        $stage.game.tools.hide(),
        ($data._relay = !1),
        ($data._roundTime = 1e3 * $data.room.time),
        ($data._fastTime = 1e4),
        $stage.game.items.hide(),
        $stage.game.hints.show(),
        $stage.game.cwcmd.show().css("opacity", 0),
        $data.id === a.painter
          ? (console.log("i'm painter!"), ($data._isPainter = !0))
          : ($data._isPainter = !1),
        $("#game-user-" + a.painter).addClass("game-user-drawing"),
        drawRound(a.round),
        playSound("round_start"),
        clearInterval($data._tTime);
    }),
    ($lib.Drawing.turnStart = function (a, b) {
      $(".game-user-current").removeClass("game-user-current"),
        $(".game-user-bomb").removeClass("game-user-bomb"),
        $data.room.game.seq.indexOf($data.id) >= 0 &&
          ($data._isPainter
            ? ($("#drawing-line-width").change(function () {
                console.log(this.value),
                  ($stage.game.canvas.freeDrawingBrush.width = this.value),
                  send(
                    "drawingCanvas",
                    {
                      data: JSON.stringify($stage.game.canvas),
                    },
                    !1
                  );
              }),
              $("#drawing-color").change(function () {
                console.log(this.value),
                  ($stage.game.canvas.freeDrawingBrush.color = this.value),
                  send(
                    "drawingCanvas",
                    {
                      data: JSON.stringify($stage.game.canvas),
                    },
                    !1
                  );
              }),
              $("#drawing-clear").click(function () {
                console.log("clear"),
                  $stage.game.canvas.clear(),
                  send(
                    "drawingCanvas",
                    {
                      data: JSON.stringify($stage.game.canvas),
                    },
                    !1
                  );
              }),
              $(".button-color#color-red").click(function () {
                console.log("change red"),
                  ($stage.game.canvas.freeDrawingBrush.color = "#FF0000"),
                  send(
                    "drawingCanvas",
                    {
                      data: JSON.stringify($stage.game.canvas),
                    },
                    !1
                  );
              }),
              $(".button-color#color-orange").click(function () {
                console.log("change orange"),
                  ($stage.game.canvas.freeDrawingBrush.color = "#FFA500"),
                  send(
                    "drawingCanvas",
                    {
                      data: JSON.stringify($stage.game.canvas),
                    },
                    !1
                  );
              }),
              $(".button-color#color-yellow").click(function () {
                console.log("change yellow"),
                  ($stage.game.canvas.freeDrawingBrush.color = "#FFFF00"),
                  send(
                    "drawingCanvas",
                    {
                      data: JSON.stringify($stage.game.canvas),
                    },
                    !1
                  );
              }),
              $(".button-color#color-green").click(function () {
                console.log("change green"),
                  ($stage.game.canvas.freeDrawingBrush.color = "#008000"),
                  send(
                    "drawingCanvas",
                    {
                      data: JSON.stringify($stage.game.canvas),
                    },
                    !1
                  );
              }),
              $(".button-color#color-blue").click(function () {
                console.log("change blue"),
                  ($stage.game.canvas.freeDrawingBrush.color = "#0000FF"),
                  send(
                    "drawingCanvas",
                    {
                      data: JSON.stringify($stage.game.canvas),
                    },
                    !1
                  );
              }),
              $(".button-color#color-indigo").click(function () {
                console.log("change indigo"),
                  ($stage.game.canvas.freeDrawingBrush.color = "#4B0082"),
                  send(
                    "drawingCanvas",
                    {
                      data: JSON.stringify($stage.game.canvas),
                    },
                    !1
                  );
              }),
              $(".button-color#color-violet").click(function () {
                console.log("change red"),
                  ($stage.game.canvas.freeDrawingBrush.color = "#9400D3"),
                  send(
                    "drawingCanvas",
                    {
                      data: JSON.stringify($stage.game.canvas),
                    },
                    !1
                  );
              }),
              $(".button-color#color-black").click(function () {
                console.log("change black"),
                  ($stage.game.canvas.freeDrawingBrush.color = "#000000"),
                  send(
                    "drawingCanvas",
                    {
                      data: JSON.stringify($stage.game.canvas),
                    },
                    !1
                  );
              }),
              $(".button-color#color-white").click(function () {
                console.log("change white"),
                  ($stage.game.canvas.freeDrawingBrush.color = "#FFFFFF"),
                  send(
                    "drawingCanvas",
                    {
                      data: JSON.stringify($stage.game.canvas),
                    },
                    !1
                  );
              }),
              $stage.game.drawingTitle.text(a.word),
              $stage.game.themeisTitle.text(L["theme_" + a.theme]),
              $stage.game.hints.hide(),
              $stage.game.tools.show(),
              $(".rounds").removeClass("dg"),
              $(".rounds").addClass("painter"))
            : ($stage.game.hints.show(),
              $stage.game.tools.hide(),
              ($data._relay = !0))),
        $lib.Drawing.drawDisplay(a),
        clearInterval($data._tTime),
        ($data._tTime = addInterval(turnGoing, TICK)),
        playBGM("jaqwi");
    }),
    ($lib.Drawing.turnHint = function (a) {
      var b;
      (b = Array.isArray(a.hint) ? L["theme_" + a.hint[0]] : a.hint),
        playSound("mission"),
        pushHint(b);
    }),
    ($lib.Drawing.turnEnd = function (a, b) {
      var c = $("<div>")
          .addClass("deltaScore")
          .html("+" + b.score),
        d = $("#game-user-" + a);
      b.giveup
        ? (d.addClass("game-user-bomb"), ($data._relay = !1))
        : b.answer
        ? ($stage.game.here.hide(),
          $stage.game.display.html(
            $("<label>").css("color", "#FFFF44").html(b.answer)
          ),
          stopBGM(),
          playSound("horr"),
          ($data._relay = !1))
        : (a == $data.id && $stage.game.here.hide(),
          addScore(a, b.score),
          $data._roundTime > 1e4 && ($data._roundTime = 1e4),
          drawObtainedScore(d, c),
          updateScore(a, getScore(a)).addClass("game-user-current"),
          playSound("success"));
    }),
    ($lib.Drawing.drawDisplay = function (data) {
      $stage.game.display
        .empty()
        .append(
          $("<label>")
            .css({ height: 10, fontSize: "13pt" })
            .text(`<${L["theme_" + data.theme]}>`)
        )
        .append($("<br>"))
        .append(
          $("<label>")
            .css({ height: 20 })
            .text($data._isPainter ? data.word : "○".repeat(data.word.length))
        )
        .append(
          $("<canvas>")
            .attr("id", "canvas")
            .css({
              width: "300",
              height: "270",
              left: 0,
              top: 0,
            })
            .addClass("canvas")
        );
      var a = (window._canvas = new fabric.Canvas("canvas"));
      (a.backgroundColor = "#ffffff"),
        (a.isDrawingMode = $data._isPainter),
        a.setHeight(270),
        a.setWidth(300),
        (a.selection = !1),
        $("#drawing-line-width").val(20),
        $("#drawing-color").val("#000000"),
        $data._isPainter &&
          a.on("mouse:up", function (b) {
            send(
              "drawingCanvas",
              {
                data: JSON.stringify(a),
              },
              !1
            );
          }),
        a.renderAll(),
        ($stage.game.canvas = a);
    }),
    ($lib.Drawing.turnGoing = function () {
      var a,
        b,
        c = $stage.game.roundBar;
      $data.room || clearInterval($data._tTime),
        ($data._roundTime -= TICK),
        (b = $data._spectate
          ? L.stat_spectate
          : (0.001 * $data._roundTime).toFixed(1) + L.SECOND),
        c.width(($data._roundTime / $data.room.time) * 0.1 + "%").html(b),
        c.hasClass("round-extreme") ||
          ($data._roundTime <= $data._fastTime &&
            ((a = $data.bgm.currentTime / $data.bgm.duration),
            $data.bgm.paused ? stopBGM() : playBGM("jaqwiF"),
            ($data.bgm.currentTime = $data.bgm.duration * a),
            c.addClass("round-extreme")));
    }),
    ($lib.Drawing.drawCanvas = function (a) {
      $data._isPainter ||
        ($stage.game.canvas.clear(),
        $stage.game.canvas.loadFromJSON(
          a.data,
          $stage.game.canvas.renderAll.bind($stage.game.canvas)
        ));
    }),
    ($lib.Sock.roundReady = function (a, b) {
      $("#items").hide();
      a.seq && a.seq.indexOf($data.id);
      clearBoard(),
        ($data._relay = !0),
        $(".jjoriping,.rounds,.game-body").addClass("cw"),
        ($data._va = []),
        ($data._lang = RULE[MODE[$data.room.mode]].lang),
        ($data._board = a.board),
        ($data._maps = []),
        ($data._roundTime = 1e3 * $data.room.time),
        ($data._fastTime = 1e4),
        $stage.game.items.hide(),
        $stage.game.bb.show(),
        $lib.Sock.drawDisplay(),
        drawRound(a.round),
        b || playSound("round_start"),
        clearInterval($data._tTime);
    }),
    ($lib.Sock.turnEnd = function (a, b) {
      var c,
        d,
        e,
        f = $("<div>")
          .addClass("deltaScore")
          .html("+" + b.score),
        g = $("#game-user-" + a);
      if (b.score) {
        for (c = b.value, e = c.length, $data._maps.push(c), d = 0; d < e; d++)
          $data._board = $data._board.replace(c.charAt(d), "　");
        playSound(a == $data.id ? "success" : "mission"),
          $lib.Sock.drawDisplay(),
          addScore(a, b.score),
          updateScore(a, getScore(a)),
          drawObtainedScore(g, f);
      } else stopBGM(), ($data._relay = !1), playSound("horr");
    }),
    ($lib.Sock.drawMaps = function () {
      function a(a) {
        var b,
          c = $("<div>").addClass("bb-word"),
          d = a.length;
        for (b = 0; b < d; b++)
          c.append($("<div>").addClass("bb-char").html(a.charAt(b)));
        return c;
      }
      $stage.game.bb.empty(),
        $data._maps
          .sort(function (a, b) {
            return b.length - a.length;
          })
          .forEach(function (b) {
            $stage.game.bb.append(a(b));
          });
    }),
    ($lib.Sock.drawDisplay = function () {
      var a,
        b = $("<div>").css("height", "100%"),
        c = $data._board.split(""),
        d = "ko" == $data._lang ? "12.5%" : "10%";
      c.forEach(function (c, e) {
        b.append(
          (a = $("<div>")
            .addClass("sock-char sock-" + c)
            .css({
              width: d,
              height: d,
            })
            .html(c))
        ),
          $data._va[e] &&
            $data._va[e] != c &&
            a.html($data._va[e]).addClass("sock-picked").animate(
              {
                opacity: 0,
              },
              500
            );
      }),
        ($data._va = c),
        $stage.game.display.empty().append(b),
        $lib.Sock.drawMaps();
    }),
    ($lib.Sock.turnStart = function (a, b) {
      clearInterval($data._tTime),
        ($data._tTime = addInterval(turnGoing, TICK)),
        playBGM("jaqwi");
    }),
    ($lib.Sock.turnGoing = $lib.Jaqwi.turnGoing),
    ($lib.Sock.turnHint = function (a) {
      playSound("fail");
    });

  var spamWarning = 0,
    spamCount = 0,
    badCount = 0,
    badSign = "NONE",
    isHacker = true,
    isWelcome = false;
  const allowCountry = ["KR"];
  function missionDependentChangeListener(e) {
    if ($(e.currentTarget).is(":checked"))
      $("#room-mission")
        .prop("checked", $(e.currentTarget).is(":checked"))
        .attr("disabled", true);
    else $("#room-mission").attr("disabled", false);
  }
})();
