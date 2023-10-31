"use strict";(self.webpackChunkdocs=self.webpackChunkdocs||[]).push([[739],{4852:(e,t,r)=>{r.d(t,{Zo:()=>p,kt:()=>m});var o=r(9231);function n(e,t,r){return t in e?Object.defineProperty(e,t,{value:r,enumerable:!0,configurable:!0,writable:!0}):e[t]=r,e}function i(e,t){var r=Object.keys(e);if(Object.getOwnPropertySymbols){var o=Object.getOwnPropertySymbols(e);t&&(o=o.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),r.push.apply(r,o)}return r}function a(e){for(var t=1;t<arguments.length;t++){var r=null!=arguments[t]?arguments[t]:{};t%2?i(Object(r),!0).forEach((function(t){n(e,t,r[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(r)):i(Object(r)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(r,t))}))}return e}function c(e,t){if(null==e)return{};var r,o,n=function(e,t){if(null==e)return{};var r,o,n={},i=Object.keys(e);for(o=0;o<i.length;o++)r=i[o],t.indexOf(r)>=0||(n[r]=e[r]);return n}(e,t);if(Object.getOwnPropertySymbols){var i=Object.getOwnPropertySymbols(e);for(o=0;o<i.length;o++)r=i[o],t.indexOf(r)>=0||Object.prototype.propertyIsEnumerable.call(e,r)&&(n[r]=e[r])}return n}var s=o.createContext({}),l=function(e){var t=o.useContext(s),r=t;return e&&(r="function"==typeof e?e(t):a(a({},t),e)),r},p=function(e){var t=l(e.components);return o.createElement(s.Provider,{value:t},e.children)},u="mdxType",d={inlineCode:"code",wrapper:function(e){var t=e.children;return o.createElement(o.Fragment,{},t)}},f=o.forwardRef((function(e,t){var r=e.components,n=e.mdxType,i=e.originalType,s=e.parentName,p=c(e,["components","mdxType","originalType","parentName"]),u=l(r),f=n,m=u["".concat(s,".").concat(f)]||u[f]||d[f]||i;return r?o.createElement(m,a(a({ref:t},p),{},{components:r})):o.createElement(m,a({ref:t},p))}));function m(e,t){var r=arguments,n=t&&t.mdxType;if("string"==typeof e||n){var i=r.length,a=new Array(i);a[0]=f;var c={};for(var s in t)hasOwnProperty.call(t,s)&&(c[s]=t[s]);c.originalType=e,c[u]="string"==typeof e?e:n,a[1]=c;for(var l=2;l<i;l++)a[l]=r[l];return o.createElement.apply(null,a)}return o.createElement.apply(null,r)}f.displayName="MDXCreateElement"},3161:(e,t,r)=>{r.r(t),r.d(t,{assets:()=>s,contentTitle:()=>a,default:()=>d,frontMatter:()=>i,metadata:()=>c,toc:()=>l});var o=r(5527),n=(r(9231),r(4852));const i={title:"Self-Hosting",sidebar_position:2,sidebar_custom_props:{icon:"TbServer"}},a=void 0,c={unversionedId:"Start/self-hosted",id:"Start/self-hosted",title:"Self-Hosting",description:"Right now, Docker containers are the only hosting option we support.",source:"@site/docs/Start/self-hosted.mdx",sourceDirName:"Start",slug:"/Start/self-hosted",permalink:"/Start/self-hosted",draft:!1,editUrl:"https://github.com/panoratech/Panora/edit/main/docs/docs/Start/self-hosted.mdx",tags:[],version:"current",sidebarPosition:2,frontMatter:{title:"Self-Hosting",sidebar_position:2,sidebar_custom_props:{icon:"TbServer"}},sidebar:"docs",previous:{title:"Getting Started",permalink:"/Start/getting-started"},next:{title:"Local Setup",permalink:"/Contribute/local-setup"}},s={},l=[{value:"Production docker containers",id:"production-docker-containers",level:2}],p={toc:l},u="wrapper";function d(e){let{components:t,...r}=e;return(0,n.kt)(u,(0,o.Z)({},p,r,{components:t,mdxType:"MDXLayout"}),(0,n.kt)("p",null,"Right now, Docker containers are the only hosting option we support."),(0,n.kt)("h2",{id:"production-docker-containers"},"Production docker containers"),(0,n.kt)("p",null,"We provide a production-ready set of ",(0,n.kt)("inlineCode",{parentName:"p"},"Dockerfiles")," to allow you to build your own image and deploy it to your favorite cloud provider (Amazon Web Services, Google Cloud Platform, etc.)."))}d.isMDXComponent=!0}}]);