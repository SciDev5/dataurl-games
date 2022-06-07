// @ts-check
import { _aj, _at, _c, _e, _h, _ls } from "../../code-prefix";

const [{width:cw,height:ch},ctx] = _c(window.innerWidth,window.innerHeight-50,"2d");

const tx = _e("div");
let n = 0;

/** @type {{a:string}} */
const someJson = _aj("hello:somejson");


_ls(()=>{
    ctx.fillStyle=`#${new Array(3).fill().map(_=>Math.floor(Math.random()*3)).join("")}1`;
    ctx.fillRect(0,0,cw,ch);
    ctx.fillStyle="#777";
    ctx.fillRect(Math.random()*cw,Math.random()*cw,20,20);

    tx.innerText = `N: ${n}; "${_at("hello:world")}" ${someJson.a}`;
});

_h("keydown",e=>{
    console.log(e.key);
    ({
        ArrowUp:()=>n++,
        ArrowDown:()=>n--
    }[e.key]??(()=>null))();
});