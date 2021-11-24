"use strict";(self.webpackChunk_N_E=self.webpackChunk_N_E||[]).push([[47],{1397:function(e,n,t){t.d(n,{T:function(){return a},C:function(){return s}});var r=t(9704),a=function(){return(0,r.I0)()},s=r.v9},9976:function(e,n,t){t.d(n,{P:function(){return m}});var r=t(2809),a=t(7294),s=t(3003),i=t(1397),o=t(8253),c=t(8052),l=t(5893);function u(e,n){var t=Object.keys(e);if(Object.getOwnPropertySymbols){var r=Object.getOwnPropertySymbols(e);n&&(r=r.filter((function(n){return Object.getOwnPropertyDescriptor(e,n).enumerable}))),t.push.apply(t,r)}return t}var d=function(){var e=(0,i.T)(),n=(0,i.C)((function(e){return e.soraContents.reconnectingTrials}));return(0,a.useEffect)((function(){e((0,o.eX)())}),[]),(0,l.jsxs)(s.Z,{delay:2e4,onClose:function(){e((0,o.XH)(!1))},children:[(0,l.jsx)(s.Z.Header,{className:"bg-warning text-white",children:(0,l.jsx)("strong",{className:"me-auto",children:"Reconnect"})}),(0,l.jsx)(s.Z.Body,{className:"bg-light",children:(0,l.jsxs)("p",{className:"text-break font-weight-bold mb-0",children:["Reconnecting... (trials ",n,")"]})})]})},f=function(e){var n=(0,i.T)(),t="error"===e.type?"bg-danger":"bg-info";return(0,l.jsxs)(s.Z,{autohide:!0,delay:2e4,onClose:function(){n((0,o.b_)(e.timestamp))},children:[(0,l.jsxs)(s.Z.Header,{className:"".concat(t," text-white"),children:[(0,l.jsx)("strong",{className:"me-auto",children:e.title}),(0,l.jsx)("span",{children:(0,c.o5)(e.timestamp)})]}),(0,l.jsx)(s.Z.Body,{className:"bg-light",children:(0,l.jsx)("p",{className:"text-break font-weight-bold mb-0",children:e.message})})]})},m=function(){var e=(0,i.C)((function(e){return e.alertMessages})),n=(0,i.C)((function(e){return e.soraContents.reconnecting}));return(0,l.jsxs)("div",{className:"alert-messages",children:[n?(0,l.jsx)(d,{}):null,e.map((function(e){return(0,l.jsx)(f,function(e){for(var n=1;n<arguments.length;n++){var t=null!=arguments[n]?arguments[n]:{};n%2?u(Object(t),!0).forEach((function(n){(0,r.Z)(e,n,t[n])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(t)):u(Object(t)).forEach((function(n){Object.defineProperty(e,n,Object.getOwnPropertyDescriptor(t,n))}))}return e}({},e),e.timestamp)}))]})}},9641:function(e,n,t){t.d(n,{l:function(){return i}});t(7294);var r=t(1397),a=t(8253),s=t(5893),i=function(){var e=(0,r.C)((function(e){return e.soraContents.connectionStatus})),n=(0,r.T)();return(0,s.jsx)("div",{className:"col-auto mb-1",children:(0,s.jsx)("input",{className:"btn btn-secondary",type:"button",name:"connect",defaultValue:"connect",onClick:function(){n((0,a.Yr)())},disabled:"disconnecting"===e||"connecting"===e})})}},7144:function(e,n,t){t.d(n,{c:function(){return i}});t(7294);var r=t(1397),a=t(8253),s=t(5893),i=function(){var e=(0,r.C)((function(e){return e.soraContents.connectionStatus})),n=(0,r.T)();return(0,s.jsx)("div",{className:"col-auto mb-1",children:(0,s.jsx)("input",{className:"btn btn-secondary",type:"button",name:"disconnect",defaultValue:"disconnect",onClick:function(){n((0,a.E1)())},disabled:"disconnecting"===e||"connecting"===e})})}},4372:function(e,n,t){t.d(n,{n:function(){return me}});var r=t(7294),a=t(1198),s=t(7905),i=t(1397),o=t(8253),c=t(2809),l=t(2939),u=t(6435),d=t(8052),f=t(5893),m=function(e){return e.disabled?null:(0,f.jsx)("button",{className:"btn btn-sm btn-dark",onClick:function(n){(0,d.f7)(e.text),n.currentTarget.blur()},children:(0,f.jsx)(u.R,{})})},g=function(e){var n=e.description;return void 0===n?null:"object"!==typeof n?(0,f.jsx)("div",{className:"debug-message",children:(0,f.jsx)("div",{className:"col-sm-12",children:(0,f.jsx)("pre",{className:e.wordBreak?"word-break":"",children:n})})}):(0,f.jsx)("div",{className:"debug-message",children:(0,f.jsx)("div",{className:"col-sm-12",children:(0,f.jsx)("pre",{className:e.wordBreak?"word-break":"",children:JSON.stringify(n,null,2)})})})},h=function(e){var n=e.defaultShow,t=e.description,a=e.title,s=e.timestamp,i=e.label,o=(0,r.useState)(void 0!==n&&n),c=o[0],u=o[1],h=s?a+s:a,p=void 0===t;return(0,f.jsxs)("div",{className:"border border-light rounded mb-1 bg-dark",children:[(0,f.jsxs)("div",{className:"d-flex justify-content-between align-items-center text-break",children:[(0,f.jsxs)("a",{className:"debug-title ".concat(p?"disabled":""),onClick:function(){return u(!c)},"aria-controls":h,"aria-expanded":c,children:[(0,f.jsx)("i",{className:"".concat(c?"arrow-bottom":"arrow-right"," ").concat(p?"disabled":"")})," ",s?(0,f.jsxs)("span",{className:"text-white-50 me-1",children:["[",(0,d.o5)(s),"]"]}):null,i,(0,f.jsx)("span",{children:a})]}),(0,f.jsx)("div",{className:"border-left",children:(0,f.jsx)(m,{text:"string"===typeof t?t:JSON.stringify(t,null,2),disabled:p})})]}),(0,f.jsx)(l.Z,{in:c,children:(0,f.jsx)("div",{className:"border-top",children:(0,f.jsx)(g,{description:t,wordBreak:e.wordBreak})})})]})};function p(e,n){var t=Object.keys(e);if(Object.getOwnPropertySymbols){var r=Object.getOwnPropertySymbols(e);n&&(r=r.filter((function(n){return Object.getOwnPropertyDescriptor(e,n).enumerable}))),t.push.apply(t,r)}return t}function b(e){for(var n=1;n<arguments.length;n++){var t=null!=arguments[n]?arguments[n]:{};n%2?p(Object(t),!0).forEach((function(n){(0,c.Z)(e,n,t[n])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(t)):p(Object(t)).forEach((function(n){Object.defineProperty(e,n,Object.getOwnPropertyDescriptor(t,n))}))}return e}var j=function(e){var n=e.data,t=e.label,r=e.timestamp;if("ZAKURO"===(new TextDecoder).decode(n.slice(0,6))){var a=new DataView(n),s=a.getBigInt64(6),i=a.getBigInt64(14),o=n.byteLength,c="UnixTimeMicro: ".concat(s,"\nCounter: ").concat(i,"\nByteLength: ").concat(o);return(0,f.jsx)(h,{title:t+" ZAKURO",timestamp:r,description:c,defaultShow:!0,wordBreak:!0})}var l=new Uint8Array(n).toString()+"\n(".concat((new TextDecoder).decode(n),")");return(0,f.jsx)(h,{title:t,timestamp:r,description:l,defaultShow:!0,wordBreak:!0})},x=r.memo((function(e){return(0,f.jsx)(j,b({},e))})),v=function(){var e=(0,i.C)((function(e){return e.dataChannelMessages})),n=(0,i.C)((function(e){return e.debugFilterText})),t=e.filter((function(e){return n.split(" ").every((function(n){return""===n||0<=JSON.stringify(e).indexOf(n)}))}));return(0,f.jsx)("div",{className:"debug-messages",children:t.map((function(e){var n=e.label+e.timestamp;return(0,f.jsx)(x,b({},e),n)}))})},y=t(6986),C=t(4716),O=function(){var e=(0,i.C)((function(e){return e.debugFilterText})),n=(0,i.T)();return(0,f.jsx)(y.Z,{className:"form-inline debug-filter",controlId:"channelId",children:(0,f.jsx)(C.Z,{type:"text",placeholder:"Filter",value:e,onChange:function(e){n((0,o.eU)(e.target.value))},autoComplete:"off"})})};function N(e,n){var t=Object.keys(e);if(Object.getOwnPropertySymbols){var r=Object.getOwnPropertySymbols(e);n&&(r=r.filter((function(n){return Object.getOwnPropertyDescriptor(e,n).enumerable}))),t.push.apply(t,r)}return t}function w(e){for(var n=1;n<arguments.length;n++){var t=null!=arguments[n]?arguments[n]:{};n%2?N(Object(t),!0).forEach((function(n){(0,c.Z)(e,n,t[n])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(t)):N(Object(t)).forEach((function(n){Object.defineProperty(e,n,Object.getOwnPropertyDescriptor(t,n))}))}return e}var Z=function(e){var n=e.message,t=e.timestamp;return(0,f.jsx)(h,{title:n.title,timestamp:t,description:JSON.parse(n.description)})},k=r.memo((function(e){return(0,f.jsx)(Z,w({},e))})),S=function(){var e=(0,i.C)((function(e){return e.logMessages})),n=(0,i.C)((function(e){return e.debugFilterText})),t=e.filter((function(e){return n.split(" ").every((function(n){return""===n||0<=JSON.stringify(e).indexOf(n)}))}));return(0,f.jsx)("div",{className:"debug-messages",children:t.map((function(e){return(0,f.jsx)(k,w({},e),e.message.title+e.timestamp)}))})};function D(e,n){var t=Object.keys(e);if(Object.getOwnPropertySymbols){var r=Object.getOwnPropertySymbols(e);n&&(r=r.filter((function(n){return Object.getOwnPropertyDescriptor(e,n).enumerable}))),t.push.apply(t,r)}return t}var P={websocket:"#00ff00",datachannel:"#ff00ff"},T=function(e){var n=e.text,t=Object.keys(P).includes(n)?P[n]:void 0;return(0,f.jsxs)("span",{className:"me-1",style:t?{color:t}:{},children:["[",n,"]"]})},I=function(e){var n=e.notify,t=n.transportType?(0,f.jsx)(T,{text:n.transportType}):null;return(0,f.jsx)(h,{title:n.message.event_type,timestamp:n.timestamp,description:n.message,label:t})},M=r.memo((function(e){return(0,f.jsx)(I,function(e){for(var n=1;n<arguments.length;n++){var t=null!=arguments[n]?arguments[n]:{};n%2?D(Object(t),!0).forEach((function(n){(0,c.Z)(e,n,t[n])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(t)):D(Object(t)).forEach((function(n){Object.defineProperty(e,n,Object.getOwnPropertyDescriptor(t,n))}))}return e}({},e))})),R=function(){var e=(0,i.C)((function(e){return e.notifyMessages})),n=(0,i.C)((function(e){return e.debugFilterText})),t=e.filter((function(e){return n.split(" ").every((function(n){return""===n||0<=JSON.stringify(e).indexOf(n)}))}));return(0,f.jsx)("div",{className:"debug-messages",children:t.map((function(e){return(0,f.jsx)(M,{notify:e},e.message.type+e.timestamp)}))})};function U(e,n){var t=Object.keys(e);if(Object.getOwnPropertySymbols){var r=Object.getOwnPropertySymbols(e);n&&(r=r.filter((function(n){return Object.getOwnPropertyDescriptor(e,n).enumerable}))),t.push.apply(t,r)}return t}var E={websocket:"#00ff00",datachannel:"#ff00ff"},F=function(e){var n=e.text,t=Object.keys(E).includes(n)?E[n]:void 0;return(0,f.jsxs)("span",{style:t?{color:t}:{},children:["[",n,"]"]})},B=function(e){var n=e.push,t=n.transportType?(0,f.jsx)(F,{text:n.transportType}):null;return(0,f.jsx)(h,{title:n.message.type,timestamp:n.timestamp,description:n.message,label:t})},L=r.memo((function(e){return(0,f.jsx)(B,function(e){for(var n=1;n<arguments.length;n++){var t=null!=arguments[n]?arguments[n]:{};n%2?U(Object(t),!0).forEach((function(n){(0,c.Z)(e,n,t[n])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(t)):U(Object(t)).forEach((function(n){Object.defineProperty(e,n,Object.getOwnPropertyDescriptor(t,n))}))}return e}({},e))})),H=function(){var e=(0,i.C)((function(e){return e.pushMessages})),n=(0,i.C)((function(e){return e.debugFilterText})),t=e.filter((function(e){return n.split(" ").every((function(n){return""===n||0<=JSON.stringify(e).indexOf(n)}))}));return(0,f.jsx)("div",{className:"debug-messages",children:t.map((function(e,n){var t="".concat(e.timestamp,"-").concat(n);return(0,f.jsx)(L,{ariaControls:t,push:e},t)}))})},A=t(469),J=t(5005),V=function(){var e=(0,r.useRef)(null),n=(0,r.useRef)(null),t=(0,i.C)((function(e){return e.soraContents.sora})),a=(0,i.C)((function(e){return e.soraContents.datachannels}));return(0,f.jsxs)(f.Fragment,{children:[(0,f.jsxs)("div",{className:"d-flex",children:[(0,f.jsx)(y.Z,{className:"me-1",controlId:"sendDataChannelMessageLabel",children:(0,f.jsx)(A.Z,{name:"sendDataChannelMessageLabel",ref:e,children:a.map((function(e){return(0,f.jsx)("option",{value:e.label,children:e.label},e.label)}))})}),(0,f.jsx)(y.Z,{className:"flex-grow-1 me-1",controlId:"sendDataChannelMessage",children:(0,f.jsx)(C.Z,{className:"flex-fill",placeholder:"sendDataChannelMessage\u3092\u6307\u5b9a",type:"text",ref:n})}),(0,f.jsx)(J.Z,{variant:"secondary",onClick:function(){if(null!==e.current&&null!==n.current){var r=e.current.value;t&&t.sendMessage(r,(new TextEncoder).encode(n.current.value))}},disabled:0===a.length,children:"send"})]}),0<a.length?(0,f.jsx)("pre",{className:"form-control mt-2",style:{color:"#fff",backgroundColor:"#222222",maxHeight:"250px"},children:JSON.stringify(a,null,2)}):null]})};function K(e,n){var t=Object.keys(e);if(Object.getOwnPropertySymbols){var r=Object.getOwnPropertySymbols(e);n&&(r=r.filter((function(n){return Object.getOwnPropertyDescriptor(e,n).enumerable}))),t.push.apply(t,r)}return t}function _(e){for(var n=1;n<arguments.length;n++){var t=null!=arguments[n]?arguments[n]:{};n%2?K(Object(t),!0).forEach((function(n){(0,c.Z)(e,n,t[n])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(t)):K(Object(t)).forEach((function(n){Object.defineProperty(e,n,Object.getOwnPropertyDescriptor(t,n))}))}return e}var W={websocket:"#00ff00",datachannel:"#ff00ff"},G=function(e){var n=e.text,t=Object.keys(W).includes(n)?W[n]:void 0;return(0,f.jsxs)("span",{className:"me-1",style:t?{color:t}:{},children:["[",n,"]"]})},z=function(e){var n=e.data,t=e.type,r=e.timestamp,a=e.transportType,s=a?(0,f.jsx)(G,{text:a}):null;return(0,f.jsx)(h,{title:t,timestamp:r,description:n,label:s})},X=r.memo((function(e){return(0,f.jsx)(z,_({},e))})),q=function(){var e=(0,i.C)((function(e){return e.signalingMessages})),n=(0,i.C)((function(e){return e.debugFilterText})),t=e.filter((function(e){return n.split(" ").every((function(n){return""===n||0<=JSON.stringify(e).indexOf(n)}))}));return(0,f.jsx)("div",{className:"debug-messages",children:t.map((function(e){var n=e.type+e.timestamp;return(0,f.jsx)(X,_({},e),n)}))})};function Y(e,n){var t=Object.keys(e);if(Object.getOwnPropertySymbols){var r=Object.getOwnPropertySymbols(e);n&&(r=r.filter((function(n){return Object.getOwnPropertyDescriptor(e,n).enumerable}))),t.push.apply(t,r)}return t}function $(e){for(var n=1;n<arguments.length;n++){var t=null!=arguments[n]?arguments[n]:{};n%2?Y(Object(t),!0).forEach((function(n){(0,c.Z)(e,n,t[n])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(t)):Y(Object(t)).forEach((function(n){Object.defineProperty(e,n,Object.getOwnPropertyDescriptor(t,n))}))}return e}var Q=function(e){return(0,f.jsx)(h,{title:"".concat(e.id,"(").concat(e.type,")"),timestamp:null,description:e})},ee=r.memo((function(e){return(0,f.jsx)(Q,$({},e))})),ne=function(){var e=(0,i.C)((function(e){return e.soraContents.statsReport})),n=(0,i.C)((function(e){return e.debugFilterText})),t=e.filter((function(e){return n.split(" ").every((function(n){return""===n||0<=JSON.stringify(e).indexOf(n)}))}));return(0,f.jsx)("div",{className:"debug-messages",children:t.map((function(e){return(0,f.jsx)(ee,$({},e),e.id)}))})};function te(e,n){var t=Object.keys(e);if(Object.getOwnPropertySymbols){var r=Object.getOwnPropertySymbols(e);n&&(r=r.filter((function(n){return Object.getOwnPropertyDescriptor(e,n).enumerable}))),t.push.apply(t,r)}return t}function re(e){for(var n=1;n<arguments.length;n++){var t=null!=arguments[n]?arguments[n]:{};n%2?te(Object(t),!0).forEach((function(n){(0,c.Z)(e,n,t[n])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(t)):te(Object(t)).forEach((function(n){Object.defineProperty(e,n,Object.getOwnPropertyDescriptor(t,n))}))}return e}var ae={signaling:"#ff00ff",notify:"#ffff00",push:"#98fb98",e2ee:"#00ffff",stats:"#ffc0cb"},se=function(){return(0,f.jsx)("span",{className:"me-1",style:{color:"#00ff00"},children:"[websocket]"})},ie=function(){return(0,f.jsx)("span",{className:"me-1",style:{color:"#ff8c00"},children:"[peerconnection]"})},oe=function(){return(0,f.jsx)("span",{className:"me-1",style:{color:"#bce2e8"},children:"[sora]"})},ce=function(){return(0,f.jsx)("span",{className:"me-1",style:{color:"#73b8e2"},children:"[sora-devtools]"})},le=function(e){var n=e.label,t=e.id,r=n&&Object.keys(ae).includes(n)?ae[n]:void 0;return(0,f.jsxs)("span",{className:"me-1",style:r?{color:r}:{},children:["[datachannel]",n?"[".concat(n,"]"):"","number"===typeof t?"[".concat(t,"]"):""]})},ue=function(e){var n,t=e.timestamp,r=e.logType,a=e.dataChannelId,s=e.dataChannelLabel,i=e.type,o=e.data,c="".concat(i);return"websocket"===r?n=(0,f.jsx)(se,{}):"datachannel"===r?n=(0,f.jsx)(le,{id:a,label:s}):"peerconnection"===r?n=(0,f.jsx)(ie,{}):"sora"===r?n=(0,f.jsx)(oe,{}):"sora-devtools"===r&&(n=(0,f.jsx)(ce,{})),(0,f.jsx)(h,{title:c,timestamp:t,description:o,label:n})},de=r.memo((function(e){return(0,f.jsx)(ue,re({},e))})),fe=function(){var e=(0,i.C)((function(e){return e.timelineMessages})),n=(0,i.C)((function(e){return e.debugFilterText})),t=e.filter((function(e){return n.split(" ").every((function(n){return""===n||0<=JSON.stringify(e).indexOf(n)}))}));return(0,f.jsx)("div",{className:"debug-messages",children:t.map((function(e){var n="".concat(e.timestamp,"-").concat(e.type);return e.dataChannelLabel&&(n+="-".concat(e.dataChannelLabel)),(0,f.jsx)(de,re({},e),n)}))})},me=function(){var e=(0,i.C)((function(e){return e.debug})),n=(0,i.C)((function(e){return e.debugType})),t=(0,i.T)();if(!e)return null;return(0,f.jsx)("div",{className:"col-debug col-6",children:(0,f.jsxs)(a.Z,{id:"debug-tab",activeKey:n,defaultActiveKey:"timeline",onSelect:function(e){"log"!==e&&"notify"!==e&&"push"!==e&&"stats"!==e&&"timeline"!==e&&"signaling"!==e&&"message"!==e||t((0,o.pD)(e))},children:[(0,f.jsxs)(s.Z,{eventKey:"timeline",title:"Timeline",children:[(0,f.jsx)(O,{}),(0,f.jsx)(fe,{})]}),(0,f.jsxs)(s.Z,{eventKey:"signaling",title:"Signaling",children:[(0,f.jsx)(O,{}),(0,f.jsx)(q,{})]}),(0,f.jsxs)(s.Z,{eventKey:"notify",title:"Notfiy",children:[(0,f.jsx)(O,{}),(0,f.jsx)(R,{})]}),(0,f.jsxs)(s.Z,{eventKey:"push",title:"Push",children:[(0,f.jsx)(O,{}),(0,f.jsx)(H,{})]}),(0,f.jsxs)(s.Z,{eventKey:"stats",title:"Stats",children:[(0,f.jsx)(O,{}),(0,f.jsx)(ne,{})]}),(0,f.jsxs)(s.Z,{eventKey:"log",title:"Log",children:[(0,f.jsx)(O,{}),(0,f.jsx)(S,{})]}),(0,f.jsxs)(s.Z,{eventKey:"message",title:"Message",children:[(0,f.jsx)(O,{}),(0,f.jsx)(V,{}),(0,f.jsx)(v,{})]})]})})}},5930:function(e,n,t){t.d(n,{$:function(){return u}});t(7294);var r=t(5602),a=t(8355),s=t(4492),i=t(1397),o=t(8253),c=t(5893),l=function(){var e=(0,i.C)((function(e){return e.debug})),n=(0,i.T)(),t=e?"btn btn-footer-debug-mode active":"btn btn-footer-debug-mode";return(0,c.jsx)("div",{children:(0,c.jsx)("button",{className:t,onClick:function(){n((0,o.ew)(!e))},children:"debug"})})},u=function(){var e=(0,i.C)((function(e){return e.version}));return(0,c.jsxs)("footer",{children:[(0,c.jsxs)(r.Z,{variant:"dark",bg:"sora",expand:"md",fixed:"bottom",children:[(0,c.jsx)(a.Z,{className:"me-auto"}),(0,c.jsx)(a.Z,{children:(0,c.jsxs)(r.Z.Collapse,{id:"navbar-collapse",children:[(0,c.jsxs)("a",{href:"https://github.com/shiguredo/sora-devtools",className:"btn btn-outline-light m-1",children:["GitHub: shiguredo/sora-devtools: ",e]}),(0,c.jsxs)("a",{href:"https://github.com/shiguredo/sora-js-sdk",className:"btn btn-outline-light m-1",children:["GitHub: shiguredo/sora-js-sdk: ",s.Z.version()]})]})})]}),(0,c.jsx)(l,{})]})}},6548:function(e,n,t){t.d(n,{P:function(){return m}});t(7294);var r=t(4051),a=t(1555),s=t(6986),i=t(1341),o=t(4716),c=t(1397),l=t(8253),u=t(8052),d=t(5893),f=function(){var e=(0,c.C)((function(e){return e.channelId})),n=(0,c.C)((function(e){return e.soraContents.connectionStatus})),t=(0,u.nh)(n),r=(0,c.T)();return(0,d.jsxs)(s.Z,{className:"form-inline",controlId:"channelId",children:[(0,d.jsx)(i.Z,{children:"channelId:"}),(0,d.jsx)(o.Z,{type:"text",placeholder:"ChannelId\u3092\u6307\u5b9a",value:e,onChange:function(e){r((0,l.cA)(e.target.value))},disabled:t})]})},m=function(){return(0,d.jsx)(r.Z,{className:"form-row",xs:"auto",children:(0,d.jsx)(a.Z,{children:(0,d.jsx)(f,{})})})}},4407:function(e,n,t){t.d(n,{V:function(){return S}});var r=t(7294),a=t(4051),s=t(1555),i=t(2939),o=t(1397),c=t(6986),l=t(8571),u=t(4716),d=t(8253),f=t(8052),m=t(5893),g=function(){var e=(0,o.C)((function(e){return e.enabledClientId})),n=(0,o.C)((function(e){return e.clientId})),t=(0,o.C)((function(e){return e.soraContents.connectionStatus})),r=(0,f.nh)(t),a=(0,o.T)();return(0,m.jsxs)(m.Fragment,{children:[(0,m.jsx)(c.Z,{className:"form-inline",controlId:"enabledClientId",children:(0,m.jsx)(l.Z,{type:"switch",name:"enabledClientId",label:"clientId",checked:e,onChange:function(e){a((0,d.pv)(e.target.checked))},disabled:r})}),e?(0,m.jsx)(c.Z,{className:"form-inline",controlId:"clientId",children:(0,m.jsx)(u.Z,{className:"flex-fill w-500",type:"text",placeholder:"ClientId\u3092\u6307\u5b9a",value:n,onChange:function(e){a((0,d.Xk)(e.target.value))},disabled:r})}):null]})},h=t(1341),p=t(469),b=t(4007),j=function(e){var n=(0,o.C)((function(e){return e.ignoreDisconnectWebSocket})),t=(0,o.T)();return(0,m.jsxs)(c.Z,{className:"form-inline",controlId:"ignoreDisconnectWebSocket",children:[(0,m.jsx)(h.Z,{children:"ignoreDisconnectWebSocket:"}),(0,m.jsx)(p.Z,{name:"ignoreDisconnectWebSocket",value:n,onChange:function(e){(0,f.to)(e.target.value)&&t((0,d.b3)(e.target.value))},disabled:e.disabled,children:b.kt.map((function(e){return(0,m.jsx)("option",{value:e,children:""===e?"\u672a\u6307\u5b9a":e},e)}))})]})},x=function(e){var n=(0,o.C)((function(e){return e.dataChannelSignaling})),t=(0,o.T)();return(0,m.jsxs)(c.Z,{className:"form-inline",controlId:"dataChannelSignaling",children:[(0,m.jsx)(h.Z,{children:"dataChannelSignaling:"}),(0,m.jsx)(p.Z,{name:"dataChannelSignaling",value:n,onChange:function(e){(0,f.ug)(e.target.value)&&t((0,d.Gc)(e.target.value))},disabled:e.disabled,children:b.l9.map((function(e){return(0,m.jsx)("option",{value:e,children:""===e?"\u672a\u6307\u5b9a":e},e)}))})]})},v=function(){var e=(0,o.C)((function(e){return e.enabledDataChannel})),n=(0,o.C)((function(e){return e.soraContents.connectionStatus})),t=(0,f.nh)(n),r=(0,o.T)();return(0,m.jsxs)(m.Fragment,{children:[(0,m.jsx)(c.Z,{className:"form-inline",controlId:"enabledDataChannel",children:(0,m.jsx)(l.Z,{type:"switch",name:"enabledDataChannel",label:"dataChannel",checked:e,onChange:function(e){r((0,d.rY)(e.target.checked))},disabled:t})}),e?(0,m.jsxs)(a.Z,{xs:"auto",children:[(0,m.jsx)(s.Z,{children:(0,m.jsx)(x,{disabled:t})}),(0,m.jsx)(s.Z,{children:(0,m.jsx)(j,{disabled:t})})]}):null]})},y=function(){var e=(0,o.C)((function(e){return e.enabledDataChannelMessaging})),n=(0,o.C)((function(e){return e.dataChannelMessaging})),t=(0,o.C)((function(e){return e.soraContents.connectionStatus})),r=(0,f.nh)(t),a=(0,o.T)(),s="dataChannelMessaging\u3092\u6307\u5b9a\n(\u4f8b)\n"+JSON.stringify([{label:"#spam",maxPacketLifeTime:10,ordered:!0,protocol:"efg",compress:!1,direction:"sendrecv"}],null,2);return(0,m.jsxs)(m.Fragment,{children:[(0,m.jsx)(c.Z,{className:"form-inline",controlId:"enabledDataChannelMessaging",children:(0,m.jsx)(l.Z,{type:"switch",name:"enabledDataChannelMessaging",label:"dataChannelMessaging",checked:e,onChange:function(e){a((0,d.Bx)(e.target.checked))},disabled:r})}),e?(0,m.jsx)(c.Z,{className:"form-inline",controlId:"dataChannelMessaging",children:(0,m.jsx)(u.Z,{className:"flex-fill w-500",as:"textarea",placeholder:s,value:n,onChange:function(e){a((0,d.Ll)(e.target.value))},rows:12,disabled:r})}):null]})},C=t(6968),O=function(){var e=(0,r.useState)(!1),n=e[0],t=e[1],a=(0,o.C)((function(e){return e.e2ee})),s=(0,o.C)((function(e){return e.soraContents.connectionStatus})),i=(0,f.nh)(s),u=(0,o.T)();return(0,r.useEffect)((function(){a&&t(!1)}),[a]),(0,m.jsxs)(c.Z,{className:"form-inline",controlId:"e2ee",children:[(0,m.jsx)(l.Z,{type:"switch",name:"e2ee",label:"e2ee",checked:a,onChange:function(e){e.target.checked&&t(!0),u((0,d.c0)(e.target.checked))},disabled:i}),n?(0,m.jsx)(C.Z,{className:"spinner-status",variant:"primary",animation:"border",role:"status"}):null]})},N=function(){var e=(0,o.C)((function(e){return e.enabledMetadata})),n=(0,o.C)((function(e){return e.metadata})),t=(0,o.C)((function(e){return e.soraContents.connectionStatus})),r=(0,f.nh)(t),a=(0,o.T)();return(0,m.jsxs)(m.Fragment,{children:[(0,m.jsx)(c.Z,{className:"form-inline",controlId:"enabledMetadata",children:(0,m.jsx)(l.Z,{type:"switch",name:"enabledMetadata",label:"metadata",checked:e,onChange:function(e){a((0,d.yq)(e.target.checked))},disabled:r})}),e?(0,m.jsx)(c.Z,{className:"form-inline",controlId:"metadata",children:(0,m.jsx)(u.Z,{className:"flex-fill w-500",as:"textarea",placeholder:"Metadata\u3092\u6307\u5b9a",value:n,onChange:function(e){a((0,d.yC)(e.target.value))},rows:10,disabled:r})}):null]})},w=function(){var e=(0,o.C)((function(e){return e.reconnect})),n=(0,o.C)((function(e){return e.soraContents.connectionStatus})),t=(0,f.nh)(n),r=(0,o.T)();return(0,m.jsx)(c.Z,{className:"form-inline",controlId:"reconnect",children:(0,m.jsx)(l.Z,{type:"switch",name:"reconnect",label:"reconnect",checked:e,onChange:function(e){r((0,d.sk)(e.target.checked))},disabled:t})})},Z=function(){var e=(0,o.C)((function(e){return e.enabledSignalingNotifyMetadata})),n=(0,o.C)((function(e){return e.signalingNotifyMetadata})),t=(0,o.C)((function(e){return e.soraContents.connectionStatus})),r=(0,f.nh)(t),a=(0,o.T)();return(0,m.jsxs)(m.Fragment,{children:[(0,m.jsx)(c.Z,{className:"form-inline",controlId:"enabledSignalingNotifyMetadata",children:(0,m.jsx)(l.Z,{type:"switch",name:"enabledSignalingNotifyMetadata",label:"signalingNotifyMetadata",checked:e,onChange:function(e){a((0,d.vq)(e.target.checked))},disabled:r})}),e?(0,m.jsx)(c.Z,{className:"form-inline",controlId:"signalingNotifyMetadata",children:(0,m.jsx)(u.Z,{className:"flex-fill w-500",as:"textarea",placeholder:"signalingNotifyMetadata\u3092\u6307\u5b9a",value:n,onChange:function(e){a((0,d.H6)(e.target.value))},rows:10,disabled:r})}):null]})},k=function(){var e=(0,o.C)((function(e){return e.enabledSignalingUrlCandidates})),n=(0,o.C)((function(e){return e.signalingUrlCandidates})),t=(0,o.C)((function(e){return e.soraContents.connectionStatus})),r=(0,f.nh)(t),a=(0,o.T)();return(0,m.jsxs)(m.Fragment,{children:[(0,m.jsx)(c.Z,{className:"form-inline",controlId:"enabledSignalingUrlCandidates",children:(0,m.jsx)(l.Z,{type:"switch",name:"enabledSignalingUrlCandidates",label:"signalingUrlCandidates",checked:e,onChange:function(e){a((0,d.Nd)(e.target.checked))},disabled:r})}),e?(0,m.jsx)(c.Z,{className:"form-inline",controlId:"signalingNotifyMetadata",children:(0,m.jsx)(u.Z,{className:"flex-fill w-500",as:"textarea",placeholder:"signalingUrlCandidates\u3092\u6307\u5b9a",value:n.join("\n"),onChange:function(e){a((0,d.l7)(e.target.value.split("\n")))},rows:5,disabled:r})}):null]})},S=function(){var e=(0,r.useState)(!0),n=e[0],t=e[1],c=[(0,o.C)((function(e){return e.e2ee})),(0,o.C)((function(e){return e.enabledClientId})),(0,o.C)((function(e){return e.enabledDataChannel})),(0,o.C)((function(e){return e.enabledDataChannelMessaging})),(0,o.C)((function(e){return e.enabledMetadata})),(0,o.C)((function(e){return e.enabledSignalingNotifyMetadata})),(0,o.C)((function(e){return e.enabledSignalingUrlCandidates})),(0,o.C)((function(e){return e.reconnect}))].some((function(e){return e})),l=["btn-collapse-options"];n&&l.push("collapsed"),c&&l.push("fw-bold");return(0,m.jsxs)(a.Z,{className:"form-row",children:[(0,m.jsx)(s.Z,{children:(0,m.jsx)("a",{href:"#",className:l.join(" "),onClick:function(e){e.preventDefault(),t(!n)},children:"Signaling options"})}),(0,m.jsx)(i.Z,{in:!n,children:(0,m.jsxs)("div",{children:[(0,m.jsx)(a.Z,{className:"form-row",children:(0,m.jsx)(s.Z,{className:"col-auto d-flex flex-column align-items-start",children:(0,m.jsx)(O,{})})}),(0,m.jsx)(a.Z,{className:"form-row",children:(0,m.jsx)(s.Z,{className:"col-auto d-flex flex-column align-items-start",children:(0,m.jsx)(w,{})})}),(0,m.jsx)(a.Z,{className:"form-row",children:(0,m.jsx)(s.Z,{className:"col-auto d-flex flex-column align-items-start",children:(0,m.jsx)(g,{})})}),(0,m.jsx)(a.Z,{className:"form-row",children:(0,m.jsx)(s.Z,{className:"col-auto d-flex flex-column align-items-start",children:(0,m.jsx)(N,{})})}),(0,m.jsx)(a.Z,{className:"form-row",children:(0,m.jsx)(s.Z,{className:"col-auto d-flex flex-column align-items-start",children:(0,m.jsx)(Z,{})})}),(0,m.jsx)(a.Z,{className:"form-row",children:(0,m.jsx)(s.Z,{className:"col-auto d-flex flex-column align-items-start",children:(0,m.jsx)(k,{})})}),(0,m.jsx)(a.Z,{className:"form-row",children:(0,m.jsx)(s.Z,{className:"col-auto d-flex flex-column align-items-start",children:(0,m.jsx)(y,{})})}),(0,m.jsx)(a.Z,{className:"form-row",children:(0,m.jsx)(s.Z,{className:"col-auto d-flex flex-column align-items-start",children:(0,m.jsx)(v,{})})})]})})]})}},1323:function(e,n,t){t.d(n,{F:function(){return s}});var r=t(9008),a=(t(7294),t(5893)),s=function(e){return(0,a.jsx)(r.default,{children:(0,a.jsxs)("title",{children:["Sora DevTools ",e.title]})})}},5013:function(e,n,t){t.d(n,{h:function(){return x}});var r=t(7294),a=t(5602),s=t(682),i=t(8355),o=t(1397),c=t(8253),l=t(5893),u=function(){var e=(0,o.T)();return(0,l.jsx)("input",{className:"btn btn-light btn-sm ms-1",type:"button",name:"copyUrl",defaultValue:"copy URL",onClick:function(){e((0,c.Hi)())}})},d=t(266),f=t(809),m=t.n(f),g=t(4492),h=t(3826);function p(e){var n=h.h.getState(),t={audio:n.audio,audioBitRate:n.audioBitRate,audioCodecType:n.audioCodecType,audioContentHint:n.audioContentHint,audioInput:n.audioInput,audioInputDevices:n.audioInputDevices,audioOutput:n.audioOutput,audioOutputDevices:n.audioOutputDevices,autoGainControl:n.autoGainControl,clientId:n.clientId,channelId:n.channelId,googCpuOveruseDetection:n.googCpuOveruseDetection,debug:n.debug,dataChannelSignaling:n.dataChannelSignaling,dataChannelMessaging:n.dataChannelMessaging,displayResolution:n.displayResolution,e2ee:n.e2ee,echoCancellation:n.echoCancellation,echoCancellationType:n.echoCancellationType,enabledClientId:n.enabledClientId,enabledDataChannel:n.enabledDataChannel,enabledDataChannelMessaging:n.enabledDataChannelMessaging,enabledMetadata:n.enabledMetadata,enabledSignalingNotifyMetadata:n.enabledSignalingNotifyMetadata,enabledSignalingUrlCandidates:n.enabledSignalingUrlCandidates,fakeVolume:n.fakeVolume,frameRate:n.frameRate,ignoreDisconnectWebSocket:n.ignoreDisconnectWebSocket,mediaType:n.mediaType,metadata:n.metadata,multistream:n.multistream,noiseSuppression:n.noiseSuppression,reconnect:n.reconnect,resolution:n.resolution,simulcast:n.simulcast,spotlight:n.spotlight,signalingNotifyMetadata:n.signalingNotifyMetadata,signalingUrlCandidates:n.signalingUrlCandidates,simulcastRid:n.simulcastRid,spotlightNumber:n.spotlightNumber,spotlightFocusRid:n.spotlightFocusRid,spotlightUnfocusRid:n.spotlightUnfocusRid,video:n.video,videoBitRate:n.videoBitRate,videoCodecType:n.videoCodecType,videoContentHint:n.videoContentHint,videoInput:n.videoInput,videoInputDevices:n.videoInputDevices,cameraDevice:n.cameraDevice,videoTrack:n.videoTrack,micDevice:n.micDevice,audioTrack:n.audioTrack,role:n.role};return{userAgent:navigator.userAgent,pageName:e,"sora-devtools":n.version,"sora-js-sdk":g.Z.version(),parameters:t,timeline:n.timelineMessages.map((function(e){return{timestamp:e.timestamp,message:e}})),notify:n.notifyMessages,stats:n.soraContents.statsReport}}var b=function(e){var n=(0,r.useRef)(null),t=function(){var t=(0,d.Z)(m().mark((function t(){var r,a,s,i;return m().wrap((function(t){for(;;)switch(t.prev=t.next){case 0:r=p(e.pageName),a=JSON.stringify(r),s=new Blob([a],{type:"text/plain"}),window.URL=window.URL||window.webkitURL,n.current&&(i=(new Date).toISOString().replaceAll(":","_").replaceAll(".","_"),n.current.download="sora-devtools-report-".concat(i,".json"),n.current.href=window.URL.createObjectURL(s),n.current.click());case 5:case"end":return t.stop()}}),t)})));return function(){return t.apply(this,arguments)}}();return(0,l.jsxs)(l.Fragment,{children:[(0,l.jsx)("input",{className:"btn btn-light btn-sm ms-1",type:"button",name:"downloadReport",defaultValue:"Download report",onClick:t}),(0,l.jsx)("a",{ref:n,style:{display:"none"}})]})},j=function(){var e=(0,o.C)((function(e){return e.debug})),n=(0,o.T)(),t=["btn","btn-header-debug-mode","btn-sm","ms-1"];return e&&t.push("active"),(0,l.jsx)("input",{className:t.join(" "),type:"button",name:"debug",defaultValue:"debug",onClick:function(){n((0,c.ew)(!e))}})},x=function(e){var n=(0,o.C)((function(e){return e.soraContents.sora}));return(0,l.jsx)("header",{children:(0,l.jsx)(a.Z,{variant:"dark",bg:"sora",expand:"md",fixed:"top",children:(0,l.jsxs)(s.Z,{children:[(0,l.jsx)(a.Z.Brand,{href:"/",children:"Sora DevTools"}),(0,l.jsx)(i.Z,{children:(0,l.jsx)(a.Z.Text,{children:e.pageName})}),(0,l.jsx)(a.Z.Toggle,{"aria-controls":"navbar-collapse"}),(0,l.jsxs)(a.Z.Collapse,{id:"navbar-collapse",children:[(0,l.jsx)(i.Z,{className:"me-auto"}),(0,l.jsxs)(i.Z,{children:[(0,l.jsx)(a.Z.Text,{className:"py-0 my-1 mx-1",children:(0,l.jsx)("p",{className:"navbar-signaling-url border rounded",children:n?n.connectedSignalingUrl:"\u672a\u63a5\u7d9a"})}),(0,l.jsx)(a.Z.Text,{className:"py-0 my-1 mx-1",children:(0,l.jsx)(j,{})}),(0,l.jsx)(a.Z.Text,{className:"py-0 my-1 mx-1",children:(0,l.jsx)(b,{pageName:e.pageName})}),(0,l.jsx)(a.Z.Text,{className:"py-0 my-1 ms-1",children:(0,l.jsx)(u,{})})]})]})]})})})}},6435:function(e,n,t){t.d(n,{R:function(){return a}});t(7294);var r=t(5893),a=function(){return(0,r.jsxs)("svg",{width:"1em",height:"1em",viewBox:"0 0 16 16",className:"bi bi-clipboard",fill:"currentColor",xmlns:"http://www.w3.org/2000/svg",children:[(0,r.jsx)("path",{fillRule:"evenodd",d:"M4 1.5H3a2 2 0 0 0-2 2V14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V3.5a2 2 0 0 0-2-2h-1v1h1a1 1 0 0 1 1 1V14a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V3.5a1 1 0 0 1 1-1h1v-1z"}),(0,r.jsx)("path",{fillRule:"evenodd",d:"M9.5 1h-3a.5.5 0 0 0-.5.5v1a.5.5 0 0 0 .5.5h3a.5.5 0 0 0 .5-.5v-1a.5.5 0 0 0-.5-.5zm-3-1A1.5 1.5 0 0 0 5 1.5v1A1.5 1.5 0 0 0 6.5 4h3A1.5 1.5 0 0 0 11 2.5v-1A1.5 1.5 0 0 0 9.5 0h-3z"})]})}}}]);