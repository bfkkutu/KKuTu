(()=>{"use strict";var __webpack_modules__={745:(e,t,r)=>{var a=r(1533);t.createRoot=a.createRoot,t.hydrateRoot=a.hydrateRoot},7554:(e,t)=>{var r;Object.defineProperty(t,"__esModule",{value:!0}),t.DateUnit=void 0,function(e){e[e.MILLISECOND=1]="MILLISECOND",e[e.SECOND=1e3]="SECOND",e[e.MINUTE=6e4]="MINUTE",e[e.HOUR=36e5]="HOUR",e[e.DAY=864e5]="DAY",e[e.WEEK=6048e5]="WEEK",e[e.MONTH=2629743840]="MONTH",e[e.YEAR=31556926080]="YEAR"}(r||(t.DateUnit=r={}))},3376:(__unused_webpack_module,exports,__webpack_require__)=>{Object.defineProperty(exports,"__esModule",{value:!0}),exports.toSignedString=exports.resolveLanguageArguments=exports.reduceToTable=exports.pick=exports.orderByString=exports.orderBy=exports.Iterator=exports.isEmpty=exports.merge=exports.cut=exports.TIMEZONE_OFFSET=exports.REGEXP_LANGUAGE_ARGS=exports.FRONT=exports.CLIENT_SETTINGS=void 0;const DateUnit_1=__webpack_require__(7554);function cut(e,t){return e.length>t?e.slice(0,t-1)+"…":e}function merge(e,...t){for(const r of t)for(const[t,a]of Object.entries(r))"object"==typeof e[t]&&"object"==typeof a&&null!==a?merge(e[t],a):e[t]=a;return e}function isEmpty(e,t){return!e||(t?0===Object.keys(e).filter((t=>null!==e[t]&&void 0!==e[t])).length:0===Object.keys(e).length)}function Iterator(e,t){return Array(e).fill(t)}function orderBy(e,t){return t?(t,r)=>e(r)-e(t):(t,r)=>e(t)-e(r)}function orderByString(e,t){return t?(t,r)=>e(r).localeCompare(e(t)):(t,r)=>e(t).localeCompare(e(r))}function pick(e,...t){return t.reduce(((t,r)=>(r in e&&(t[r]=e[r]),t)),{})}function reduceToTable(e,t,r){return e.reduce(r?(e,a,s,n)=>(e[r(a,s,n)]=t(a,s,n),e):(e,r,a,s)=>(e[String(r)]=t(r,a,s),e),{})}function resolveLanguageArguments(e,...t){return e.replace(exports.REGEXP_LANGUAGE_ARGS,((e,r)=>t[r]))}function toSignedString(e){return(e>0?"+":"")+e}exports.CLIENT_SETTINGS="FRONT"in Object&&eval("window.__CLIENT_SETTINGS"),exports.FRONT=Boolean(exports.CLIENT_SETTINGS),exports.REGEXP_LANGUAGE_ARGS=/\{#(\d+?)\}/g,exports.TIMEZONE_OFFSET=(new Date).getTimezoneOffset()*DateUnit_1.DateUnit.MINUTE,exports.cut=cut,exports.merge=merge,exports.isEmpty=isEmpty,exports.Iterator=Iterator,exports.orderBy=orderBy,exports.orderByString=orderByString,exports.pick=pick,exports.reduceToTable=reduceToTable,exports.resolveLanguageArguments=resolveLanguageArguments,exports.toSignedString=toSignedString},5876:function(e,t,r){var a=this&&this.__importDefault||function(e){return e&&e.__esModule?e:{default:e}};Object.defineProperty(t,"__esModule",{value:!0}),t.Icon=t.IconType=void 0;const s=a(r(7363)),n=/^(.+)-o$/,l={"!":"fa-pulse","@":"fa-spin"};var i;!function(e){e[e.NORMAL=0]="NORMAL",e[e.STACK=1]="STACK",e[e.PURE=2]="PURE"}(i||(t.IconType=i={})),t.Icon=({className:e,name:r,type:a})=>{const o=["icon"],u={};let c;switch(e&&o.push(e),a){default:case i.NORMAL:{const e=l[r[0]];return o.push("fa-fw"),e&&(o.push(e),r=r.slice(1)),c=r.match(n),o.push(...c?["far",`fa-${c[1]}`]:["fas",`fa-${r}`]),s.default.createElement("i",{className:o.join(" "),style:u})}case i.STACK:return o.push("fa-stack"),s.default.createElement("span",{className:"ik fa-stack"},r.split(",").map(((e,r)=>s.default.createElement(t.Icon,{key:r,className:"fa-stack-1x",name:e}))));case i.PURE:return o.push("ip",`icon-${r}`),u.backgroundImage=`url("/media/images/icons/${r}.png")`,s.default.createElement("i",{className:o.join(" "),style:u})}}},4621:function(e,t,r){var a=this&&this.__importDefault||function(e){return e&&e.__esModule?e:{default:e}};Object.defineProperty(t,"__esModule",{value:!0});const s=a(r(7363));class n extends s.default.PureComponent{render(){return s.default.createElement("footer",null,"FOOTER")}}t.default=n},9284:function(e,t,r){var a=this&&this.__importDefault||function(e){return e&&e.__esModule?e:{default:e}};Object.defineProperty(t,"__esModule",{value:!0});const s=a(r(7363));class n extends s.default.PureComponent{render(){return s.default.createElement("header",null,"HEADER")}}t.default=n},1352:function(__unused_webpack_module,exports,__webpack_require__){var __importDefault=this&&this.__importDefault||function(e){return e&&e.__esModule?e:{default:e}};Object.defineProperty(exports,"__esModule",{value:!0}),exports.getHumanTimeDistance=exports.getHumanNumber=exports.getHumanMinutes=exports.getHumanSeconds=exports.getHumanDigitalSpace=exports.setTable=void 0;const react_1=__importDefault(__webpack_require__(7363)),Icon_1=__webpack_require__(5876),Utility_1=__webpack_require__(5579),Utility_2=__webpack_require__(3376),PATTERN_RESOLVER={BR:e=>react_1.default.createElement("br",{key:e}),FA:(e,t)=>react_1.default.createElement(Icon_1.Icon,{key:e,name:t}),FAK:(e,...t)=>react_1.default.createElement(Icon_1.Icon,{key:e,name:t.join(","),type:Icon_1.IconType.STACK}),L:(e,t,r)=>react_1.default.createElement("label",{key:e,className:t},r),ICON:(e,t)=>react_1.default.createElement(Icon_1.Icon,{key:e,className:"language",name:t,type:Icon_1.IconType.PURE}),REF:(e,t,...r)=>react_1.default.createElement(react_1.default.Fragment,{key:e},L.render(t,...r)),HUMAN_D:(e,t)=>react_1.default.createElement(react_1.default.Fragment,{key:e},(0,exports.getHumanDigitalSpace)(Number(t))),HUMAN_M:(e,t)=>react_1.default.createElement(react_1.default.Fragment,{key:e},(0,exports.getHumanMinutes)(Number(t))),HUMAN_N:(e,t)=>react_1.default.createElement(react_1.default.Fragment,{key:e},(0,exports.getHumanNumber)(Number(t)))};let TABLE=Utility_2.FRONT&&eval("window.__LANGUAGE");const setTable=e=>{TABLE={...e}};exports.setTable=setTable;class L{static REGEXP_PATTERN=/<\{(\w+?)(?:\|(.+?))?\}>/g;static REGEXP_ARGS=/\{#(\d+?)\}/g;static REGEXP_STRICT_ARGS=/\{##(\d+?)\}/g;static get(e,...t){const r=TABLE[e];return r?r.replace(L.REGEXP_PATTERN,"").replace(L.REGEXP_ARGS,((e,r)=>t[r])):`(L#${e})`}static render(e,...t){return TABLE[e]?L.parse(TABLE[e],...t):`(L#${e})`}static parse(e,...t){const r=[],a=new RegExp(L.REGEXP_PATTERN),s=[];let n,l=0;for(e=e.replace(L.REGEXP_STRICT_ARGS,((e,r)=>t[r])).replace(L.REGEXP_ARGS,((e,r)=>(s.push(t[r]),"<{__}>")));n=a.exec(e);)n.index-l>0&&r.push(e.slice(l,n.index)),"__"===n[1]?r.push(s.shift()):r.push(PATTERN_RESOLVER[n[1]](r.length,...n[2]?n[2].split("|"):[])),l=a.lastIndex;return l<e.length&&r.push(e.slice(l)),react_1.default.createElement(react_1.default.Fragment,null,r)}}exports.default=L;const getHumanDigitalSpace=e=>e<1024?e+" B":e<1048576?(e/1024).toFixed(2)+" KiB":e<1073741824?(e/1048576).toFixed(2)+" MiB":(e/1073741824).toFixed(2)+" GiB";exports.getHumanDigitalSpace=getHumanDigitalSpace;const getHumanSeconds=e=>`${Math.floor(e/60)}:${String(Math.floor(e%60)).padStart(2,"0")}`;exports.getHumanSeconds=getHumanSeconds;const getHumanMinutes=e=>e<1?L.get("MINUTES_0"):(e=Math.round(e))<60?L.get("MINUTES_1",e):e<1440?L.get("MINUTES_2",Math.floor(e/60),e%60):e<43800?L.get("MINUTES_3",Math.floor(e/1440),Math.round(e%1440/60)):L.get("MINUTES_4",Math.floor(e/43800),Math.round(e%43800/1440));exports.getHumanMinutes=getHumanMinutes;const getHumanNumber=e=>{if(e<1e3)return String(e);const t=2-(Math.floor(e).toString().length-1)%3;return e<1e6?(.001*e).toFixed(t)+"k":e<1e9?(1e-6*e).toFixed(t)+"M":e<1e12?(1e-9*e).toFixed(t)+"G":e<1e15?(1e-12*e).toFixed(t)+"T":(1e-15*e).toFixed(0)+"P"};function getHumanTimeDistance(e,t=Date.now()){const r=(0,Utility_1.getTimeDistance)(e,t);return r>-30?L.render("TIME_DISTANCE_PAST",r):L.render("TIME_DISTANCE_FUTURE",-r)}exports.getHumanNumber=getHumanNumber,exports.getHumanTimeDistance=getHumanTimeDistance},5579:(__unused_webpack_module,exports,__webpack_require__)=>{Object.defineProperty(exports,"__esModule",{value:!0}),exports.getTimeDistance=exports.PROPS=void 0;const Utility_1=__webpack_require__(3376);function getTimeDistance(e,t=Date.now()){return(t-e)/6e4}exports.PROPS=Utility_1.FRONT&&eval("window['__PROPS']"),exports.getTimeDistance=getTimeDistance},512:function(e,t,r){var a=this&&this.__importDefault||function(e){return e&&e.__esModule?e:{default:e}};Object.defineProperty(t,"__esModule",{value:!0});const s=a(r(7363)),n=r(5876),l=a(r(2153)),i=a(r(1352));class o extends s.default.PureComponent{state={profile:{},list:[],isRefreshing:!0,isListInitialized:!1,sum:0,windowWidth:window.innerWidth};componentDidMount(){this.seekServers=this.seekServers.bind(this),(window.adsbygoogle=window.adsbygoogle||[]).push({}),this.setState({profile:this.props.session.profile||{}}),window.addEventListener("resize",(()=>{this.setState({windowWidth:window.innerWidth,windowHeight:window.innerHeight})})),setInterval((()=>{if(this.state.isRefreshing)return alert(i.default.get("serverWait"));this.setState({isRefreshing:!0}),setTimeout(this.seekServers,1e3)}),6e4),this.seekServers()}async seekServers(){const{list:e}=await(await fetch("/servers")).json();e&&e.length&&this.setState({list:e,sum:e.reduce(((e,t)=>e+t),0),isRefreshing:!1,isListInitialized:!0})}render(){return s.default.createElement("article",{id:"Middle",style:{marginLeft:Math.max(0,.5*this.state.windowWidth-500)}},s.default.createElement("div",{className:"flex"},s.default.createElement("img",{id:"logo",src:"/media/img/kkutu/short_logo.png",alt:"Logo"}),s.default.createElement("div",{id:"start-button"},s.default.createElement("div",{className:"game-start-wrapper"},s.default.createElement("button",{className:"game-start",type:"button",onClick:()=>{if(!this.state.profile)return location.href="/?server=0";for(let e=.9;e<1;e+=.01)for(let t in this.state.list)if(this.state.list[t]<100*e)return location.href=`/?server=${t}`},disabled:!this.state.isListInitialized},i.default.render("gameStartBF")),s.default.createElement("button",{className:"game-start",type:"button",onClick:()=>{location.href="https://kkutu.kr"},disabled:!0,dangerouslySetInnerHTML:{__html:i.default.get("gameStartKKT3")}})))),s.default.createElement("div",{className:"flex",style:{width:"100%"}},s.default.createElement("div",{className:"flex",style:{width:"100%"}},s.default.createElement("a",{className:"p_button daldalso",target:"_blank",href:"http://daldal.so/"},"달달소"),s.default.createElement("a",{className:"p_button kkutu3",target:"_blank",href:"https://kkutu.kr"},"끄투3"),s.default.createElement("a",{className:"p_button discord",target:"_blank",href:"http://discord.gg/scPVHcE"},"디스코드")),s.default.createElement("div",{className:"flex server-list-wrapper"},s.default.createElement("div",{className:"server-list-box"},s.default.createElement("h3",{className:"server-list-title"},s.default.createElement("div",{id:"server-list-refresh-container"},s.default.createElement("a",{id:"server-refresh",onClick:()=>{if(this.state.isRefreshing)return alert(i.default.get("serverWait"));this.setState({isRefreshing:!0}),setTimeout(this.seekServers,1e3)}},s.default.createElement(n.Icon,{name:"refresh",className:this.state.isRefreshing?"fa-spin":""})),s.default.createElement("label",{className:"inline-flex"},i.default.render("serverList"))),s.default.createElement("label",{id:"server-total"}," ",i.default.render("TOTAL")," ",this.state.sum,i.default.render("MN"))),s.default.createElement("div",{id:"server-list"},this.state.list.map(((e,t)=>{let r=null===e?"x":"o";const a="x"==r?"-":e+" / 100",n=e/100*100;return"o"==r&&(n>=99?r="q":n>=90&&(r="p")),s.default.createElement("div",{className:"server",onClick:()=>{"x"!=r&&(location.href=`/?server=${t}`)}},s.default.createElement("div",{className:`server-status ss-${r}`}),s.default.createElement("div",{className:"server-name"},i.default.render(`server_${t}`)),s.default.createElement("div",{className:"server-people graph"},s.default.createElement("div",{className:"graph-bar",style:{width:`${n}%`}}),s.default.createElement("label",null,a)),s.default.createElement("div",{className:"server-enter"},"x"==r?"-":i.default.render("serverEnter")))})))))),s.default.createElement("div",{className:"iframe-container"},s.default.createElement("iframe",{id:"kkutu-bulletin",src:"/media/notice/bulletin.html"})),s.default.createElement("ins",{className:"adsbygoogle","data-ad-client":this.props.metadata.ad?.client,"data-ad-slot":this.props.metadata.ad?.slot}))}}t.default=o,(0,l.default)(o)},2153:function(e,t,r){var a=this&&this.__importDefault||function(e){return e&&e.__esModule?e:{default:e}};Object.defineProperty(t,"__esModule",{value:!0}),t.Root=void 0;const s=a(r(7363)),n=a(r(745)),l=r(5579),i=a(r(4621)),o=a(r(9284)),u=a(r(1352));t.default=function(e){const t=document.getElementById("stage");n.default.createRoot(t).render(s.default.createElement(c,l.PROPS,s.default.createElement(e,l.PROPS)))};class c extends s.default.PureComponent{static getDerivedStateFromError(e){return{error:e}}state={};render(){return this.state.error?u.default.render("ERROR",this.state.error.message):s.default.createElement(s.default.Fragment,null,s.default.createElement(o.default,null),this.props.children,s.default.createElement(i.default,null))}}t.Root=c},7363:e=>{e.exports=React},1533:e=>{e.exports=ReactDOM}},__webpack_module_cache__={};function __webpack_require__(e){var t=__webpack_module_cache__[e];if(void 0!==t)return t.exports;var r=__webpack_module_cache__[e]={exports:{}};return __webpack_modules__[e].call(r.exports,r,r.exports,__webpack_require__),r.exports}var __webpack_exports__=__webpack_require__(512)})();