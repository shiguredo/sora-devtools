(self.webpackChunk_N_E=self.webpackChunk_N_E||[]).push([[56],{3367:function(e,t,n){"use strict";var r;t.__esModule=!0,t.AmpStateContext=void 0;var a=((r=n(7294))&&r.__esModule?r:{default:r}).default.createContext({});t.AmpStateContext=a},7845:function(e,t,n){"use strict";t.__esModule=!0,t.isInAmpMode=i,t.useAmp=function(){return i(a.default.useContext(o.AmpStateContext))};var r,a=(r=n(7294))&&r.__esModule?r:{default:r},o=n(3367);function i(){var e=arguments.length>0&&void 0!==arguments[0]?arguments[0]:{},t=e.ampFirst,n=void 0!==t&&t,r=e.hybrid,a=void 0!==r&&r,o=e.hasQuery,i=void 0!==o&&o;return n||a&&i}},7947:function(e,t,n){"use strict";var r=n(1682);function a(e,t){var n=Object.keys(e);if(Object.getOwnPropertySymbols){var r=Object.getOwnPropertySymbols(e);t&&(r=r.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),n.push.apply(n,r)}return n}t.__esModule=!0,t.defaultHead=d,t.default=void 0;var o,i=function(e){if(e&&e.__esModule)return e;if(null===e||"object"!==typeof e&&"function"!==typeof e)return{default:e};var t=f();if(t&&t.has(e))return t.get(e);var n={},r=Object.defineProperty&&Object.getOwnPropertyDescriptor;for(var a in e)if(Object.prototype.hasOwnProperty.call(e,a)){var o=r?Object.getOwnPropertyDescriptor(e,a):null;o&&(o.get||o.set)?Object.defineProperty(n,a,o):n[a]=e[a]}n.default=e,t&&t.set(e,n);return n}(n(7294)),u=(o=n(617))&&o.__esModule?o:{default:o},c=n(3367),s=n(4287),l=n(7845);function f(){if("function"!==typeof WeakMap)return null;var e=new WeakMap;return f=function(){return e},e}function d(){var e=arguments.length>0&&void 0!==arguments[0]&&arguments[0],t=[i.default.createElement("meta",{charSet:"utf-8"})];return e||t.push(i.default.createElement("meta",{name:"viewport",content:"width=device-width"})),t}function v(e,t){return"string"===typeof t||"number"===typeof t?e:t.type===i.default.Fragment?e.concat(i.default.Children.toArray(t.props.children).reduce((function(e,t){return"string"===typeof t||"number"===typeof t?e:e.concat(t)}),[])):e.concat(t)}var m=["name","httpEquiv","charSet","itemProp"];function p(e,t){return e.reduce((function(e,t){var n=i.default.Children.toArray(t.props.children);return e.concat(n)}),[]).reduce(v,[]).reverse().concat(d(t.inAmpMode)).filter(function(){var e=new Set,t=new Set,n=new Set,r={};return function(a){var o=!0,i=!1;if(a.key&&"number"!==typeof a.key&&a.key.indexOf("$")>0){i=!0;var u=a.key.slice(a.key.indexOf("$")+1);e.has(u)?o=!1:e.add(u)}switch(a.type){case"title":case"base":t.has(a.type)?o=!1:t.add(a.type);break;case"meta":for(var c=0,s=m.length;c<s;c++){var l=m[c];if(a.props.hasOwnProperty(l))if("charSet"===l)n.has(l)?o=!1:n.add(l);else{var f=a.props[l],d=r[l]||new Set;"name"===l&&i||!d.has(f)?(d.add(f),r[l]=d):o=!1}}}return o}}()).reverse().map((function(e,n){var o=e.key||n;if(!t.inAmpMode&&"link"===e.type&&e.props.href&&["https://fonts.googleapis.com/css","https://use.typekit.net/"].some((function(t){return e.props.href.startsWith(t)}))){var u=function(e){for(var t=1;t<arguments.length;t++){var n=null!=arguments[t]?arguments[t]:{};t%2?a(Object(n),!0).forEach((function(t){r(e,t,n[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(n)):a(Object(n)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(n,t))}))}return e}({},e.props||{});return u["data-href"]=u.href,u.href=void 0,u["data-optimized-fonts"]=!0,i.default.cloneElement(e,u)}return i.default.cloneElement(e,{key:o})}))}function y(e){var t=e.children,n=(0,i.useContext)(c.AmpStateContext),r=(0,i.useContext)(s.HeadManagerContext);return i.default.createElement(u.default,{reduceComponentsToState:p,headManager:r,inAmpMode:(0,l.isInAmpMode)(n)},t)}y.rewind=function(){};var h=y;t.default=h},617:function(e,t,n){"use strict";var r=n(3115),a=n(2553),o=n(2012),i=(n(450),n(9807)),u=n(7690),c=n(9828);function s(e){var t=function(){if("undefined"===typeof Reflect||!Reflect.construct)return!1;if(Reflect.construct.sham)return!1;if("function"===typeof Proxy)return!0;try{return Date.prototype.toString.call(Reflect.construct(Date,[],(function(){}))),!0}catch(e){return!1}}();return function(){var n,r=c(e);if(t){var a=c(this).constructor;n=Reflect.construct(r,arguments,a)}else n=r.apply(this,arguments);return u(this,n)}}t.__esModule=!0,t.default=void 0;var l=n(7294),f=function(e){i(n,e);var t=s(n);function n(e){var o;return a(this,n),(o=t.call(this,e))._hasHeadManager=void 0,o.emitChange=function(){o._hasHeadManager&&o.props.headManager.updateHead(o.props.reduceComponentsToState(r(o.props.headManager.mountedInstances),o.props))},o._hasHeadManager=o.props.headManager&&o.props.headManager.mountedInstances,o}return o(n,[{key:"componentDidMount",value:function(){this._hasHeadManager&&this.props.headManager.mountedInstances.add(this),this.emitChange()}},{key:"componentDidUpdate",value:function(){this.emitChange()}},{key:"componentWillUnmount",value:function(){this._hasHeadManager&&this.props.headManager.mountedInstances.delete(this),this.emitChange()}},{key:"render",value:function(){return null}}]),n}(l.Component);t.default=f},9008:function(e,t,n){e.exports=n(7947)},8164:function(e,t,n){var r=n(4360);e.exports=function(e){if(Array.isArray(e))return r(e)}},1682:function(e){e.exports=function(e,t,n){return t in e?Object.defineProperty(e,t,{value:n,enumerable:!0,configurable:!0,writable:!0}):e[t]=n,e}},7381:function(e){e.exports=function(e){if("undefined"!==typeof Symbol&&Symbol.iterator in Object(e))return Array.from(e)}},5725:function(e){e.exports=function(){throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.")}},3115:function(e,t,n){var r=n(8164),a=n(7381),o=n(3585),i=n(5725);e.exports=function(e){return r(e)||a(e)||o(e)||i()}},4391:function(e,t,n){"use strict";Object.defineProperty(t,"__esModule",{value:!0}),t.default=function(){for(var e=arguments.length,t=Array(e),n=0;n<e;n++)t[n]=arguments[n];function r(){for(var e=arguments.length,n=Array(e),r=0;r<e;r++)n[r]=arguments[r];var a=null;return t.forEach((function(e){if(null==a){var t=e.apply(void 0,n);null!=t&&(a=t)}})),a}return(0,o.default)(r)};var r,a=n(2613),o=(r=a)&&r.__esModule?r:{default:r};e.exports=t.default},5638:function(e,t){"use strict";Object.defineProperty(t,"__esModule",{value:!0}),t.default=function(e){return function(t,n,r,a,o){var i=r||"<<anonymous>>",u=o||n;if(null==t[n])return new Error("The "+a+" `"+u+"` is required to make `"+i+"` accessible for users of assistive technologies such as screen readers.");for(var c=arguments.length,s=Array(c>5?c-5:0),l=5;l<c;l++)s[l-5]=arguments[l];return e.apply(void 0,[t,n,r,a,o].concat(s))}},e.exports=t.default},2613:function(e,t){"use strict";Object.defineProperty(t,"__esModule",{value:!0}),t.default=function(e){function t(t,n,r,a,o,i){var u=a||"<<anonymous>>",c=i||r;if(null==n[r])return t?new Error("Required "+o+" `"+c+"` was not specified in `"+u+"`."):null;for(var s=arguments.length,l=Array(s>6?s-6:0),f=6;f<s;f++)l[f-6]=arguments[f];return e.apply(void 0,[n,r,u,o,c].concat(l))}var n=t.bind(null,!1);return n.isRequired=t.bind(null,!0),n},e.exports=t.default},1068:function(e,t,n){"use strict";var r,a=n(2122),o=n(9756),i=n(4184),u=n.n(i),c=n(7294),s=n(660),l=n(3652),f=n(4509),d=((r={})[s.d0]="show",r[s.cn]="show",r),v=c.forwardRef((function(e,t){var n=e.className,r=e.children,i=(0,o.Z)(e,["className","children"]),v=(0,c.useCallback)((function(e){(0,f.Z)(e),i.onEnter&&i.onEnter(e)}),[i]);return c.createElement(s.ZP,(0,a.Z)({ref:t,addEndListener:l.Z},i,{onEnter:v}),(function(e,t){return c.cloneElement(r,(0,a.Z)({},t,{className:u()("fade",n,r.props.className,d[e])}))}))}));v.defaultProps={in:!1,timeout:300,mountOnEnter:!1,unmountOnExit:!1,appear:!1},v.displayName="Fade",t.Z=v},7482:function(e,t,n){"use strict";n.d(t,{Z:function(){return O}});var r=n(2122),a=n(9756),o=n(4184),i=n.n(o),u=(n(4391),n(7294)),c=n(4289),s=n(6792),l=n(4819),f=u.createContext(null);f.displayName="CardContext";var d=f,v=Function.prototype.bind.call(Function.prototype.call,[].slice);var m=function(e){return e&&"function"!==typeof e?function(t){e.current=t}:e};var p=function(e,t){return(0,u.useMemo)((function(){return function(e,t){var n=m(e),r=m(t);return function(e){n&&n(e),r&&r(e)}}(e,t)}),[e,t])},y=n(590),h=n(5017),b=n(4426),E=function(){},x=u.forwardRef((function(e,t){var n,o,i=e.as,c=void 0===i?"ul":i,s=e.onSelect,l=e.activeKey,f=e.role,d=e.onKeyDown,m=(0,a.Z)(e,["as","onSelect","activeKey","role","onKeyDown"]),x=(0,u.useReducer)((function(e){return!e}),!1)[1],C=(0,u.useRef)(!1),Z=(0,u.useContext)(h.Z),g=(0,u.useContext)(b.Z);g&&(f=f||"tablist",l=g.activeKey,n=g.getControlledId,o=g.getControllerId);var O=(0,u.useRef)(null),w=function(e){var t=O.current;if(!t)return null;var n,r=(n="[data-rb-event-key]:not(.disabled)",v(t.querySelectorAll(n))),a=t.querySelector(".active");if(!a)return null;var o=r.indexOf(a);if(-1===o)return null;var i=o+e;return i>=r.length&&(i=0),i<0&&(i=r.length-1),r[i]},N=function(e,t){null!=e&&(s&&s(e,t),Z&&Z(e,t))};(0,u.useEffect)((function(){if(O.current&&C.current){var e=O.current.querySelector("[data-rb-event-key].active");e&&e.focus()}C.current=!1}));var P=p(t,O);return u.createElement(h.Z.Provider,{value:N},u.createElement(y.Z.Provider,{value:{role:f,activeKey:(0,h.h)(l),getControlledId:n||E,getControllerId:o||E}},u.createElement(c,(0,r.Z)({},m,{onKeyDown:function(e){var t;switch(d&&d(e),e.key){case"ArrowLeft":case"ArrowUp":t=w(-1);break;case"ArrowRight":case"ArrowDown":t=w(1);break;default:return}t&&(e.preventDefault(),N(t.dataset.rbEventKey,e),C.current=!0,x())},ref:P,role:f}))))})),C=n(1244),Z=n(4851),g=u.forwardRef((function(e,t){var n,o,f,v=(0,c.Ch)(e,{activeKey:"onSelect"}),m=v.as,p=void 0===m?"div":m,y=v.bsPrefix,h=v.variant,b=v.fill,E=v.justify,C=v.navbar,Z=v.navbarScroll,g=v.className,O=v.children,w=v.activeKey,N=(0,a.Z)(v,["as","bsPrefix","variant","fill","justify","navbar","navbarScroll","className","children","activeKey"]),P=(0,s.vE)(y,"nav"),k=!1,S=(0,u.useContext)(l.Z),M=(0,u.useContext)(d);return S?(o=S.bsPrefix,k=null==C||C):M&&(f=M.cardHeaderBsPrefix),u.createElement(x,(0,r.Z)({as:p,ref:t,activeKey:w,className:i()(g,(n={},n[P]=!k,n[o+"-nav"]=k,n[o+"-nav-scroll"]=k&&Z,n[f+"-"+h]=!!f,n[P+"-"+h]=!!h,n[P+"-fill"]=b,n[P+"-justified"]=E,n))},N),O)}));g.displayName="Nav",g.defaultProps={justify:!1,fill:!1},g.Item=C.Z,g.Link=Z.Z;var O=g},590:function(e,t,n){"use strict";var r=n(7294).createContext(null);r.displayName="NavContext",t.Z=r},1244:function(e,t,n){"use strict";var r=n(2122),a=n(9756),o=n(4184),i=n.n(o),u=n(7294),c=n(6792),s=u.forwardRef((function(e,t){var n=e.bsPrefix,o=e.className,s=e.children,l=e.as,f=void 0===l?"div":l,d=(0,a.Z)(e,["bsPrefix","className","children","as"]);return n=(0,c.vE)(n,"nav-item"),u.createElement(f,(0,r.Z)({},d,{ref:t,className:i()(o,n)}),s)}));s.displayName="NavItem",t.Z=s},4851:function(e,t,n){"use strict";n.d(t,{Z:function(){return x}});var r=n(2122),a=n(9756),o=n(4184),i=n.n(o),u=n(7294),c=n(6833);function s(e){return!e||"#"===e.trim()}var l=u.forwardRef((function(e,t){var n=e.as,o=void 0===n?"a":n,i=e.disabled,l=e.onKeyDown,f=(0,a.Z)(e,["as","disabled","onKeyDown"]),d=function(e){var t=f.href,n=f.onClick;(i||s(t))&&e.preventDefault(),i?e.stopPropagation():n&&n(e)};return s(f.href)&&(f.role=f.role||"button",f.href=f.href||"#"),i&&(f.tabIndex=-1,f["aria-disabled"]=!0),u.createElement(o,(0,r.Z)({ref:t},f,{onClick:d,onKeyDown:(0,c.Z)((function(e){" "===e.key&&(e.preventDefault(),d(e))}),l)}))}));l.displayName="SafeAnchor";var f=l,d=n(6895),v=(n(2473),n(590)),m=n(5017),p=u.forwardRef((function(e,t){var n=e.active,o=e.className,c=e.eventKey,s=e.onSelect,l=e.onClick,f=e.as,p=(0,a.Z)(e,["active","className","eventKey","onSelect","onClick","as"]),y=(0,m.h)(c,p.href),h=(0,u.useContext)(m.Z),b=(0,u.useContext)(v.Z),E=n;if(b){p.role||"tablist"!==b.role||(p.role="tab");var x=b.getControllerId(y),C=b.getControlledId(y);p["data-rb-event-key"]=y,p.id=x||p.id,p["aria-controls"]=C||p["aria-controls"],E=null==n&&null!=y?b.activeKey===y:n}"tab"===p.role&&(p.disabled&&(p.tabIndex=-1,p["aria-disabled"]=!0),p["aria-selected"]=E);var Z=(0,d.Z)((function(e){l&&l(e),null!=y&&(s&&s(y,e),h&&h(y,e))}));return u.createElement(f,(0,r.Z)({},p,{ref:t,onClick:Z,className:i()(o,E&&"active")}))}));p.defaultProps={disabled:!1};var y=p,h=n(6792),b={disabled:!1,as:f},E=u.forwardRef((function(e,t){var n=e.bsPrefix,o=e.disabled,c=e.className,s=e.href,l=e.eventKey,f=e.onSelect,d=e.as,v=(0,a.Z)(e,["bsPrefix","disabled","className","href","eventKey","onSelect","as"]);return n=(0,h.vE)(n,"nav-link"),u.createElement(y,(0,r.Z)({},v,{href:s,ref:t,eventKey:l,as:d,disabled:o,onSelect:f,className:i()(c,n,o&&"disabled")}))}));E.displayName="NavLink",E.defaultProps=b;var x=E},6968:function(e,t,n){"use strict";var r=n(2122),a=n(9756),o=n(4184),i=n.n(o),u=n(7294),c=n(6792),s=u.forwardRef((function(e,t){var n=e.bsPrefix,o=e.variant,s=e.animation,l=e.size,f=e.children,d=e.as,v=void 0===d?"div":d,m=e.className,p=(0,a.Z)(e,["bsPrefix","variant","animation","size","children","as","className"]),y=(n=(0,c.vE)(n,"spinner"))+"-"+s;return u.createElement(v,(0,r.Z)({ref:t},p,{className:i()(m,y,l&&y+"-"+l,o&&"text-"+o)}),f)}));s.displayName="Spinner",t.Z=s},6841:function(e,t,n){"use strict";var r=n(3552),a=n(7294),o=n(7184),i=n(8752),u=n(5103),c=function(e){function t(){return e.apply(this,arguments)||this}return(0,r.Z)(t,e),t.prototype.render=function(){throw new Error("ReactBootstrap: The `Tab` component is not meant to be rendered! It's an abstract component that is only valid as a direct Child of the `Tabs` Component. For custom tabs components use TabPane and TabsContainer directly")},t}(a.Component);c.Container=o.Z,c.Content=i.Z,c.Pane=u.Z,t.Z=c},7184:function(e,t,n){"use strict";var r=n(7294),a=n(4289),o=n(4426),i=n(5017);t.Z=function(e){var t=(0,a.Ch)(e,{activeKey:"onSelect"}),n=t.id,u=t.generateChildId,c=t.onSelect,s=t.activeKey,l=t.transition,f=t.mountOnEnter,d=t.unmountOnExit,v=t.children,m=(0,r.useMemo)((function(){return u||function(e,t){return n?n+"-"+t+"-"+e:null}}),[n,u]),p=(0,r.useMemo)((function(){return{onSelect:c,activeKey:s,transition:l,mountOnEnter:f||!1,unmountOnExit:d||!1,getControlledId:function(e){return m(e,"tabpane")},getControllerId:function(e){return m(e,"tab")}}}),[c,s,l,f,d,m]);return r.createElement(o.Z.Provider,{value:p},r.createElement(i.Z.Provider,{value:c||null},v))}},8752:function(e,t,n){"use strict";var r=n(2122),a=n(9756),o=n(4184),i=n.n(o),u=n(7294),c=n(6792),s=u.forwardRef((function(e,t){var n=e.bsPrefix,o=e.as,s=void 0===o?"div":o,l=e.className,f=(0,a.Z)(e,["bsPrefix","as","className"]),d=(0,c.vE)(n,"tab-content");return u.createElement(s,(0,r.Z)({ref:t},f,{className:i()(l,d)}))}));t.Z=s},4426:function(e,t,n){"use strict";var r=n(7294).createContext(null);t.Z=r},5103:function(e,t,n){"use strict";var r=n(2122),a=n(9756),o=n(4184),i=n.n(o),u=n(7294),c=n(6792),s=n(4426),l=n(5017),f=n(1068);var d=u.forwardRef((function(e,t){var n=function(e){var t=(0,u.useContext)(s.Z);if(!t)return e;var n=t.activeKey,o=t.getControlledId,i=t.getControllerId,c=(0,a.Z)(t,["activeKey","getControlledId","getControllerId"]),d=!1!==e.transition&&!1!==c.transition,v=(0,l.h)(e.eventKey);return(0,r.Z)({},e,{active:null==e.active&&null!=v?(0,l.h)(n)===v:e.active,id:o(e.eventKey),"aria-labelledby":i(e.eventKey),transition:d&&(e.transition||c.transition||f.Z),mountOnEnter:null!=e.mountOnEnter?e.mountOnEnter:c.mountOnEnter,unmountOnExit:null!=e.unmountOnExit?e.unmountOnExit:c.unmountOnExit})}(e),o=n.bsPrefix,d=n.className,v=n.active,m=n.onEnter,p=n.onEntering,y=n.onEntered,h=n.onExit,b=n.onExiting,E=n.onExited,x=n.mountOnEnter,C=n.unmountOnExit,Z=n.transition,g=n.as,O=void 0===g?"div":g,w=(n.eventKey,(0,a.Z)(n,["bsPrefix","className","active","onEnter","onEntering","onEntered","onExit","onExiting","onExited","mountOnEnter","unmountOnExit","transition","as","eventKey"])),N=(0,c.vE)(o,"tab-pane");if(!v&&!Z&&C)return null;var P=u.createElement(O,(0,r.Z)({},w,{ref:t,role:"tabpanel","aria-hidden":!v,className:i()(d,N,{active:v})}));return Z&&(P=u.createElement(Z,{in:v,onEnter:m,onEntering:p,onEntered:y,onExit:h,onExiting:b,onExited:E,mountOnEnter:x,unmountOnExit:C},P)),u.createElement(s.Z.Provider,{value:null},u.createElement(l.Z.Provider,{value:null},P))}));d.displayName="TabPane",t.Z=d},1198:function(e,t,n){"use strict";n.d(t,{Z:function(){return h}});var r=n(2122),a=n(9756),o=n(7294),i=(n(5638),n(4289)),u=n(7482),c=n(4851),s=n(1244),l=n(7184),f=n(8752),d=n(5103);function v(e,t){var n=0;return o.Children.map(e,(function(e){return o.isValidElement(e)?t(e,n++):e}))}function m(e){var t;return function(e,t){var n=0;o.Children.forEach(e,(function(e){o.isValidElement(e)&&t(e,n++)}))}(e,(function(e){null==t&&(t=e.props.eventKey)})),t}function p(e){var t=e.props,n=t.title,r=t.eventKey,a=t.disabled,i=t.tabClassName,u=t.id;return null==n?null:o.createElement(s.Z,{as:c.Z,eventKey:r,disabled:a,id:u,className:i},n)}var y=function(e){var t=(0,i.Ch)(e,{activeKey:"onSelect"}),n=t.id,c=t.onSelect,s=t.transition,y=t.mountOnEnter,h=t.unmountOnExit,b=t.children,E=t.activeKey,x=void 0===E?m(b):E,C=(0,a.Z)(t,["id","onSelect","transition","mountOnEnter","unmountOnExit","children","activeKey"]);return o.createElement(l.Z,{id:n,activeKey:x,onSelect:c,transition:s,mountOnEnter:y,unmountOnExit:h},o.createElement(u.Z,(0,r.Z)({},C,{role:"tablist",as:"nav"}),v(b,p)),o.createElement(f.Z,null,v(b,(function(e){var t=(0,r.Z)({},e.props);return delete t.title,delete t.disabled,delete t.tabClassName,o.createElement(d.Z,t)}))))};y.defaultProps={variant:"tabs",mountOnEnter:!1,unmountOnExit:!1},y.displayName="Tabs";var h=y},159:function(e,t,n){"use strict";n.d(t,{Z:function(){return w}});var r=n(2122),a=n(9756),o=n(7294),i=n(4184),u=n.n(i);function c(e){var t=function(e){var t=(0,o.useRef)(e);return t.current=e,t}(e);(0,o.useEffect)((function(){return function(){return t.current()}}),[])}var s=Math.pow(2,31)-1;function l(e,t,n){var r=n-Date.now();e.current=r<=s?setTimeout(t,r):setTimeout((function(){return l(e,t,n)}),s)}function f(){var e=function(){var e=(0,o.useRef)(!0),t=(0,o.useRef)((function(){return e.current}));return(0,o.useEffect)((function(){return function(){e.current=!1}}),[]),t.current}(),t=(0,o.useRef)();return c((function(){return clearTimeout(t.current)})),(0,o.useMemo)((function(){var n=function(){return clearTimeout(t.current)};return{set:function(r,a){void 0===a&&(a=0),e()&&(n(),a<=s?t.current=setTimeout(r,a):l(t,r,Date.now()+a))},clear:n}}),[])}var d=n(1068),v=n(6895),m=n(6792),p=n(5697),y=n.n(p),h={label:y().string.isRequired,onClick:y().func},b=o.forwardRef((function(e,t){var n=e.label,i=e.onClick,c=e.className,s=(0,a.Z)(e,["label","onClick","className"]);return o.createElement("button",(0,r.Z)({ref:t,type:"button",className:u()("close",c),onClick:i},s),o.createElement("span",{"aria-hidden":"true"},"\xd7"),o.createElement("span",{className:"sr-only"},n))}));b.displayName="CloseButton",b.propTypes=h,b.defaultProps={label:"Close"};var E=b,x=o.createContext({onClose:function(){}}),C=o.forwardRef((function(e,t){var n=e.bsPrefix,i=e.closeLabel,c=e.closeButton,s=e.className,l=e.children,f=(0,a.Z)(e,["bsPrefix","closeLabel","closeButton","className","children"]);n=(0,m.vE)(n,"toast-header");var d=(0,o.useContext)(x),p=(0,v.Z)((function(e){d&&d.onClose&&d.onClose(e)}));return o.createElement("div",(0,r.Z)({ref:t},f,{className:u()(n,s)}),l,c&&o.createElement(E,{label:i,onClick:p,className:"ml-2 mb-1","data-dismiss":"toast"}))}));C.displayName="ToastHeader",C.defaultProps={closeLabel:"Close",closeButton:!0};var Z=C,g=(0,n(4680).Z)("toast-body"),O=o.forwardRef((function(e,t){var n=e.bsPrefix,i=e.className,c=e.children,s=e.transition,l=void 0===s?d.Z:s,v=e.show,p=void 0===v||v,y=e.animation,h=void 0===y||y,b=e.delay,E=void 0===b?3e3:b,C=e.autohide,Z=void 0!==C&&C,g=e.onClose,O=(0,a.Z)(e,["bsPrefix","className","children","transition","show","animation","delay","autohide","onClose"]);n=(0,m.vE)(n,"toast");var w=(0,o.useRef)(E),N=(0,o.useRef)(g);(0,o.useEffect)((function(){w.current=E,N.current=g}),[E,g]);var P=f(),k=!(!Z||!p),S=(0,o.useCallback)((function(){k&&(null==N.current||N.current())}),[k]);(0,o.useEffect)((function(){P.set(S,w.current)}),[P,S]);var M=(0,o.useMemo)((function(){return{onClose:g}}),[g]),K=!(!l||!h),_=o.createElement("div",(0,r.Z)({},O,{ref:t,className:u()(n,i,!K&&(p?"show":"hide")),role:"alert","aria-live":"assertive","aria-atomic":"true"}),c);return o.createElement(x.Provider,{value:M},K&&l?o.createElement(l,{in:p,unmountOnExit:!0},_):_)}));O.displayName="Toast";var w=Object.assign(O,{Body:g,Header:Z})},2473:function(e){"use strict";var t=function(){};e.exports=t}}]);