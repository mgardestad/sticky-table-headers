var w=Object.defineProperty;var H=Object.getOwnPropertyDescriptor;var C=Object.getOwnPropertyNames;var S=Object.prototype.hasOwnProperty;var R=(r,i)=>{for(var t in i)w(r,t,{get:i[t],enumerable:!0})},A=(r,i,t,e)=>{if(i&&typeof i=="object"||typeof i=="function")for(let n of C(i))!S.call(r,n)&&n!==t&&w(r,n,{get:()=>i[n],enumerable:!(e=H(i,n))||e.enumerable});return r};var $=r=>A(w({},"__esModule",{value:!0}),r);var B={};R(B,{default:()=>h});module.exports=$(B);var T=require("obsidian"),h=class extends T.Plugin{constructor(){super(...arguments);this.mutationObserver=null;this.processedTables=new WeakSet;this.cleanupFunctions=new Map}async onload(){this.addStyles(),this.app.workspace.onLayoutReady(()=>{this.processAllTables()}),this.registerEvent(this.app.workspace.on("layout-change",()=>{setTimeout(()=>this.processAllTables(),200)})),this.registerEvent(this.app.workspace.on("active-leaf-change",()=>{setTimeout(()=>this.processAllTables(),200)})),this.mutationObserver=new MutationObserver(()=>{this.processAllTables()}),this.mutationObserver.observe(document.body,{childList:!0,subtree:!0})}onunload(){var t,e;this.cleanupFunctions.forEach(n=>n()),this.cleanupFunctions.clear(),document.querySelectorAll(".tsh-clone-wrapper").forEach(n=>n.remove()),(t=document.getElementById("table-sticky-header-styles"))==null||t.remove(),(e=this.mutationObserver)==null||e.disconnect()}addStyles(){let t="table-sticky-header-styles";if(document.getElementById(t))return;let e=document.createElement("style");e.id=t,e.textContent=`
            /* \u514B\u9686\u5BB9\u5668\uFF1A\u56FA\u5B9A\u5728\u89C6\u53E3\uFF0C\u88C1\u526A\u591A\u4F59\u5185\u5BB9 */
            .tsh-clone-wrapper {
                position: fixed;
                z-index: 100;
                overflow: hidden;
                pointer-events: none;
                display: none;
                /* \u767D\u5E95 + \u63CF\u8FB9 + \u9634\u5F71 */
                background: var(--background-primary);
                border: 1px solid var(--background-modifier-border);
                border-top: none;
                box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
            }
            
            .tsh-clone-wrapper.tsh-visible {
                display: block;
            }
            
            /* \u5185\u90E8\u6EDA\u52A8\u5C42\uFF1A\u7528\u4E8E\u540C\u6B65\u6C34\u5E73\u6EDA\u52A8 */
            .tsh-clone-scroller {
                overflow: hidden;
            }
            
            /* \u514B\u9686\u7684\u8868\u683C\uFF1A\u4FDD\u6301\u539F\u6837\u5F0F\uFF0C\u5DE6\u5BF9\u9F50 */
            .tsh-clone-wrapper table {
                margin: 0 !important;
                table-layout: fixed !important;
                border-collapse: collapse !important;
            }
            
            /* \u8868\u5934\u5355\u5143\u683C\u6837\u5F0F\uFF1A\u767D\u5E95 + \u8FB9\u6846 + \u95F4\u8DDD */
            .tsh-clone-wrapper thead th,
            .tsh-clone-wrapper thead td {
                background: var(--background-primary) !important;
                border: 1px solid var(--background-modifier-border) !important;
                /* --- \u95F4\u8DDD\u53C2\u6570\uFF0C\u53EF\u624B\u52A8\u4FEE\u6539 --- */
                padding-top: 0px !important;
                padding-bottom: 0px !important;
                padding-left: 10px !important;
                padding-right: 10px !important;
            }
            
            /* \u53EA\u663E\u793A\u8868\u5934 */
            .tsh-clone-wrapper tbody {
                visibility: hidden;
                height: 0;
                line-height: 0;
                overflow: hidden;
            }
            
            .tsh-clone-wrapper tbody td {
                padding: 0 !important;
                border: none !important;
                height: 0 !important;
                line-height: 0 !important;
            }
        `,document.head.appendChild(e)}processAllTables(){document.querySelectorAll(".markdown-reading-view table, .markdown-preview-view table, .cm-table-widget table").forEach(e=>{if(!this.processedTables.has(e)&&!e.closest(".tsh-clone-wrapper")){if(e.closest(".markmap")||e.closest('[data-type="myMarkmap"]')||e.closest("foreignObject"))return;this.setupStickyHeader(e),this.processedTables.add(e)}})}setupStickyHeader(t){let e=t.querySelector("thead");if(!e)return;let n=this.findVerticalScrollContainer(t);if(!n)return;let l=this.findHorizontalScrollContainer(t),o=document.createElement("div");o.className="tsh-clone-wrapper";let a=document.createElement("div");a.className="tsh-clone-scroller",o.appendChild(a);let p=t.cloneNode(!0);p.removeAttribute("data-sticky-header-initialized"),a.appendChild(p),document.body.appendChild(o);let c=()=>{if(!document.body.contains(t)){o.classList.remove("tsh-visible");return}let d=t.getBoundingClientRect(),y=e.getBoundingClientRect(),x=n.getBoundingClientRect(),m=t.closest(".workspace-leaf-content"),u=m==null?void 0:m.getBoundingClientRect(),g=y.height,v=x.top;if(y.top<v&&d.bottom>v+g){o.classList.add("tsh-visible"),this.syncColumnWidths(t,p);let b=d.left,f=d.width;if(u){let E=Math.max(d.left,u.left),M=Math.min(d.right,u.right);b=E,f=Math.max(0,M-E)}o.style.top=`${v}px`,o.style.left=`${b}px`,o.style.width=`${f}px`,o.style.height=`${g}px`,a.style.width=`${d.width}px`;let k=d.left-b;a.style.marginLeft=`${k}px`}else o.classList.remove("tsh-visible")},s=()=>requestAnimationFrame(c);n.addEventListener("scroll",s,{passive:!0}),l&&l!==n&&l.addEventListener("scroll",s,{passive:!0}),window.addEventListener("resize",s,{passive:!0});let L=setInterval(c,500);setTimeout(c,100),this.cleanupFunctions.set(t,()=>{n.removeEventListener("scroll",s),l&&l.removeEventListener("scroll",s),window.removeEventListener("resize",s),clearInterval(L),o.remove()})}findVerticalScrollContainer(t){let e=t.parentElement;for(;e;){if(e.classList.contains("markdown-preview-view")||e.classList.contains("cm-scroller")||e.classList.contains("view-content"))return e;let n=window.getComputedStyle(e);if((n.overflowY==="auto"||n.overflowY==="scroll")&&e.scrollHeight>e.clientHeight)return e;e=e.parentElement}return null}findHorizontalScrollContainer(t){let e=t.parentElement;for(;e;){let n=window.getComputedStyle(e);if(n.overflowX==="auto"||n.overflowX==="scroll"||e.classList.contains("cm-table-widget")||e.classList.contains("cm-embed-block"))return e;e=e.parentElement}return null}syncColumnWidths(t,e){let n=t.querySelectorAll("thead th, thead td"),l=e.querySelectorAll("thead th, thead td");n.forEach((a,p)=>{if(l[p]){let c=a.getBoundingClientRect(),s=l[p];s.style.width=`${c.width}px`,s.style.minWidth=`${c.width}px`,s.style.maxWidth=`${c.width}px`,s.style.boxSizing="border-box"}});let o=t.getBoundingClientRect();e.style.width=`${o.width}px`,e.style.minWidth=`${o.width}px`}};
