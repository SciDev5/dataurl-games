// @ts-check
import { _c, _e, __a, __s } from "../../code-prefix";

__s(_e("h2"),{innerText:"tic-tac-toe"});

const sz = {w:3,h:3};
/** @type {[number,number]} */
const asz = [sz.w,sz.h], msz = Math.max(...asz),
    boardRoot = __s(_e("table"),{id:"br"}),
    bbo = _e("tbody",boardRoot),
    board = __a(sz.h,y=>{
        const row = _e("tr",bbo);
        return {
            row,
            cols: __a(sz.w,x=>_e("td",row))
        };
    }),
    pDisp = __s(_e("div"),{id:"pd"}),
    winDisp = __s(_e("h1"),{id:"wd"}),
    restartBtn = __s(_e("button"),{innerText:"RESTART",id:"rb"});
let p = -1, win=-1;

const nextPlayer = ()=>{
    p++;p%=2; // Next player.
    pDisp.innerText=`CURRENT PLAYER: ${["x","o"][p]}`;
};

/** @type {(x:number,y:number)=>number|false} */
const bValue = (x,y)=>{
    if (x >= sz.w || x < 0 || y >= sz.h || y < 0) return false;
    return ({_0:0,_1:1})[board[y].cols[x].className] ?? -1;
};

/** @type {(x:number,y:number)=>{v:number,dir:[number,number]}[]} */
const checkLine = (x,y)=>{
    /** @type {{v:number,dir:[number,number]}[]} */
    const lines = [];
    /** @type {[number,number][]} */
    const dirs = [[0,1],[1,1],[1,0],[1,-1]], v = bValue(x,y);
    if (v === false || v === -1) return [];
    outer:
    for (const dir of dirs) {
        let n = 0;
        for (let i = 1-msz; i < msz; i++) {
            const [z,w]=dir.map(d=>d*i), vI = bValue(z+x,w+y);
            if (vI === false) continue;
            if (vI === v) n++;
        }
        if (n === msz)
            lines.push({v,dir});
    }
    return lines;
};

/** @type {(x:number,y:number)=>void} */
const place = (x,y)=>{
    if (win !== -1 || board[y].cols[x].classList.length > 0) return;

    board[y].cols[x].className = `_${p}`;
    const lines = checkLine(x,y);

    if (lines.length > 0) {
        win = lines[0].v;
        winDisp.innerText = `${["x","o"][win]} WINS!`;
        for (const {dir} of lines) {
            for (let i = 1-msz; i < msz; i++) {
                const [z,w]=dir.map(d=>d*i);
                board[w+y]?.cols[z+x]?.classList.add("h");
            }
        }
    }

    nextPlayer();
};


board.forEach(({cols},y)=>cols.forEach((cel,x)=>cel.onclick=_=>place(x,y)));
nextPlayer();


restartBtn.onclick=e=>{
    board.forEach(({cols},y)=>cols.forEach((cel,x)=>cel.className=""));
    win=-1;
    winDisp.innerText="";
    p=-1;
    nextPlayer();
};