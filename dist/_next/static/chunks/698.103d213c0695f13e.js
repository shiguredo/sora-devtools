(self.webpackChunk_N_E=self.webpackChunk_N_E||[]).push([[698],{6698:function(e,t,n){"use strict";var r=n(3227),a=n(8361),o=n(5971),u=n(2715),i=n(1193);function l(e){var t=function(){if("undefined"===typeof Reflect||!Reflect.construct)return!1;if(Reflect.construct.sham)return!1;if("function"===typeof Proxy)return!0;try{return Boolean.prototype.valueOf.call(Reflect.construct(Boolean,[],(function(){}))),!0}catch(e){return!1}}();return function(){var n,r=i(e);if(t){var a=i(this).constructor;n=Reflect.construct(r,arguments,a)}else n=r.apply(this,arguments);return u(this,n)}}Object.defineProperty(t,"__esModule",{value:!0}),t.default=void 0;var d=n(2648).Z,c=d(n(7294)),f=d(n(1597)),s={400:"Bad Request",404:"This page could not be found",405:"Method Not Allowed",500:"Internal Server Error"};function p(e){var t=e.res,n=e.err;return{statusCode:t&&t.statusCode?t.statusCode:n?n.statusCode:404}}var h={error:{fontFamily:'system-ui,"Segoe UI",Roboto,Helvetica,Arial,sans-serif,"Apple Color Emoji","Segoe UI Emoji"',height:"100vh",textAlign:"center",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center"},desc:{display:"inline-block",textAlign:"left"},h1:{display:"inline-block",margin:"0 20px 0 0",paddingRight:23,fontSize:24,fontWeight:500,verticalAlign:"top",lineHeight:"49px"},h2:{fontSize:14,fontWeight:400,lineHeight:"49px",margin:0}},v=function(e){o(n,e);var t=l(n);function n(){return r(this,n),t.apply(this,arguments)}return a(n,[{key:"render",value:function(){var e=this.props,t=e.statusCode,n=e.withDarkMode,r=void 0===n||n,a=this.props.title||s[t]||"An unexpected error has occurred";return c.default.createElement("div",{style:h.error},c.default.createElement(f.default,null,c.default.createElement("title",null,t?"".concat(t,": ").concat(a):"Application error: a client-side exception has occurred")),c.default.createElement("div",null,c.default.createElement("style",{dangerouslySetInnerHTML:{__html:"body{color:#000;background:#fff;margin:0}.next-error-h1{border-right:1px solid rgba(0,0,0,.3)}".concat(r?"@media (prefers-color-scheme:dark){body{color:#fff;background:#000}.next-error-h1{border-right:1px solid rgba(255,255,255,.3)}}":"")}}),t?c.default.createElement("h1",{className:"next-error-h1",style:h.h1},t):null,c.default.createElement("div",{style:h.desc},c.default.createElement("h2",{style:h.h2},this.props.title||t?a:c.default.createElement(c.default.Fragment,null,"Application error: a client-side exception has occurred (see the browser console for more information)"),"."))))}}]),n}(c.default.Component);v.displayName="ErrorPage",v.getInitialProps=p,v.origGetInitialProps=p,t.default=v,("function"===typeof t.default||"object"===typeof t.default&&null!==t.default)&&"undefined"===typeof t.default.__esModule&&(Object.defineProperty(t.default,"__esModule",{value:!0}),Object.assign(t.default,t),e.exports=t.default)},5505:function(e,t,n){"use strict";Object.defineProperty(t,"__esModule",{value:!0}),t.AmpStateContext=void 0;var r=(0,n(2648).Z)(n(7294)).default.createContext({});t.AmpStateContext=r},1342:function(e,t){"use strict";Object.defineProperty(t,"__esModule",{value:!0}),t.isInAmpMode=function(){var e=arguments.length>0&&void 0!==arguments[0]?arguments[0]:{},t=e.ampFirst,n=void 0!==t&&t,r=e.hybrid,a=void 0!==r&&r,o=e.hasQuery,u=void 0!==o&&o;return n||a&&u}},1597:function(e,t,n){"use strict";Object.defineProperty(t,"__esModule",{value:!0}),t.defaultHead=c,t.default=void 0;var r=n(6495).Z,a=n(2648).Z,o=(0,n(1598).Z)(n(7294)),u=a(n(7271)),i=n(5505),l=n(236),d=n(1342);n(3766);function c(){var e=arguments.length>0&&void 0!==arguments[0]&&arguments[0],t=[o.default.createElement("meta",{charSet:"utf-8"})];return e||t.push(o.default.createElement("meta",{name:"viewport",content:"width=device-width"})),t}function f(e,t){return"string"===typeof t||"number"===typeof t?e:t.type===o.default.Fragment?e.concat(o.default.Children.toArray(t.props.children).reduce((function(e,t){return"string"===typeof t||"number"===typeof t?e:e.concat(t)}),[])):e.concat(t)}var s=["name","httpEquiv","charSet","itemProp"];function p(e,t){var n=t.inAmpMode;return e.reduce(f,[]).reverse().concat(c(n).reverse()).filter(function(){var e=new Set,t=new Set,n=new Set,r={};return function(a){var o=!0,u=!1;if(a.key&&"number"!==typeof a.key&&a.key.indexOf("$")>0){u=!0;var i=a.key.slice(a.key.indexOf("$")+1);e.has(i)?o=!1:e.add(i)}switch(a.type){case"title":case"base":t.has(a.type)?o=!1:t.add(a.type);break;case"meta":for(var l=0,d=s.length;l<d;l++){var c=s[l];if(a.props.hasOwnProperty(c))if("charSet"===c)n.has(c)?o=!1:n.add(c);else{var f=a.props[c],p=r[c]||new Set;"name"===c&&u||!p.has(f)?(p.add(f),r[c]=p):o=!1}}}return o}}()).reverse().map((function(e,t){var a=e.key||t;if(!n&&"link"===e.type&&e.props.href&&["https://fonts.googleapis.com/css","https://use.typekit.net/"].some((function(t){return e.props.href.startsWith(t)}))){var u=r({},e.props||{});return u["data-href"]=u.href,u.href=void 0,u["data-optimized-fonts"]=!0,o.default.cloneElement(e,u)}return o.default.cloneElement(e,{key:a})}))}var h=function(e){var t=e.children,n=o.useContext(i.AmpStateContext),r=o.useContext(l.HeadManagerContext);return o.default.createElement(u.default,{reduceComponentsToState:p,headManager:r,inAmpMode:d.isInAmpMode(n)},t)};t.default=h,("function"===typeof t.default||"object"===typeof t.default&&null!==t.default)&&"undefined"===typeof t.default.__esModule&&(Object.defineProperty(t.default,"__esModule",{value:!0}),Object.assign(t.default,t),e.exports=t.default)},7271:function(e,t,n){"use strict";Object.defineProperty(t,"__esModule",{value:!0}),t.default=function(e){var t=e.headManager,n=e.reduceComponentsToState;function i(){if(t&&t.mountedInstances){var a=r.Children.toArray(Array.from(t.mountedInstances).filter(Boolean));t.updateHead(n(a,e))}}if(a){var l;null==t||null==(l=t.mountedInstances)||l.add(e.children),i()}return o((function(){var n;return null==t||null==(n=t.mountedInstances)||n.add(e.children),function(){var n;null==t||null==(n=t.mountedInstances)||n.delete(e.children)}})),o((function(){return t&&(t._pendingUpdate=i),function(){t&&(t._pendingUpdate=i)}})),u((function(){return t&&t._pendingUpdate&&(t._pendingUpdate(),t._pendingUpdate=null),function(){t&&t._pendingUpdate&&(t._pendingUpdate(),t._pendingUpdate=null)}})),null};var r=(0,n(1598).Z)(n(7294));var a=!1,o=a?function(){}:r.useLayoutEffect,u=a?function(){}:r.useEffect},3766:function(e,t){"use strict";Object.defineProperty(t,"__esModule",{value:!0}),t.warnOnce=void 0;t.warnOnce=function(e){}}}]);