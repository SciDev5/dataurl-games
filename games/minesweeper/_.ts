import { _ai, _c, _e, _et, __a, __s } from "../../code-prefix";

const tileImgs = _ai(":tiles");

/** Tile size */
const ts = 20;

/** "Max Mine Fraction": maximum ratio of mines to tiles allowed in the game. */
const mmf = .5;

/** Minesweeper game class */
class MineSweep {
    /** The canvas the game controls. */
    private readonly cnv:HTMLCanvasElement;
    /** The canvas render contex the game controls. */
    private readonly ctx:CanvasRenderingContext2D;

    /** The div containing the canvas */
    private readonly containDiv:HTMLElement;

    /** The div containing the header with game info */
    private readonly hdrDiv:HTMLElement;
    /** The span showing how many flags there are left to place */
    private readonly nFlagsSpan:HTMLElement;
    /** The span showing how many mines there are */
    private readonly nMinesSpan:HTMLElement;
    /** The div containing the header with win/loss info */
    private readonly hdrEndDiv:HTMLElement;
    /** The span showing how many mines there are */
    private readonly endStateSpan:HTMLElement;

    private visualScale = 1;

    private state:"win"|"lose"|"play"|"prestart"="prestart";
    private nFlags = 0;
    private nFlaggedMines = 0;
    private nMines = 0;

    private generated = false;

    /**
     * The game grid [indexed `this.grid[x][y]`]
     * 
     * Tile values:
     * - `0`: empty
     * - `1`: dug
     * - `2`: flagged
     * - `3`: mine
     * - `4`: flagged mine
     * */
    private readonly grid:(0|1|2|3|4)[][];

    /** The canvas dimensions  */
    private get cdim() {
        const {
            width: w,
            height: h
        } = this.cnv;
        return { w, h };
    }
    constructor(
        private readonly w:number,
        private readonly h:number,
        parent:HTMLElement,
    ) {
        const [cnv,ctx] = _c("2d");
        this.containDiv = __s(_e("div",parent),{className:"sweeper-container"});
        const hdr = this.hdrDiv = __s(_e("div",this.containDiv),{className:"hdr"}),
            hdrEnd = this.hdrEndDiv = __s(_e("div",this.containDiv),{className:"hdr-end"});

        _et(`[${w}x${h}] | [`,hdr);
        this.nFlagsSpan = _e("span",hdr);
        _et(" flags / ",hdr);
        this.nMinesSpan = _e("span",hdr);
        _et(" mines]",hdr);

        _et("YOU ",hdrEnd);
        this.endStateSpan = _e("span",hdrEnd);
        _et("!",hdrEnd);

        this.containDiv.append(cnv);
        this.cnv = __s(cnv,{width:w*ts,height:h*ts});
        this.ctx = ctx;
        this.grid = [];

        this.updateTexts();

        cnv.onclick = this.onClick;
    }

    /** Set the canvas scale factor */
    public setCnvScale(scale:number):this {
        if (!isFinite(scale)) return;
        this.containDiv.style.width=`${scale*this.cdim.w}px`;
        this.visualScale = scale;
        return this;
    }
    
    /** [re]Initialize the game with a given number of mines. */
    public start(nMines:number):this {
        const {w,h} = this;

        if (nMines > w*h*mmf) throw new Error("TODO: max mine fraction exceeded");

        this.grid.length = 0;
        this.grid.push(...__a(w,x=>__a(h,y=>0 as const)));
        this.generated = false;
        
        
        this.drawBoard(false); // Redraw the entire board without showing mines.
        this.state = "play";
        this.nMines = nMines;
        this.nFlags = nMines;
        this.nFlaggedMines = 0;
        this.updateTexts();

        return this;
    }
    public destroy() {
        this.containDiv.remove();
    }

    private updateTexts() {
        let shH = false, shHE = false;
        
        if (this.state === "prestart") {
            // noop
        } else if (this.state === "play") {
            shH = true;
            this.nFlagsSpan.innerText = ""+(this.nMines-this.nFlags);
            this.nMinesSpan.innerText = ""+this.nMines;
        } else {
            shHE = true;
            this.endStateSpan.innerText = this.state.toUpperCase();
        }
        
        this.hdrDiv.classList[shH?"remove":"add"]("-hide");
        this.hdrEndDiv.classList[shHE?"remove":"add"]("-hide");
    }

    /** Lose the game */
    private lose() {
        // TODO animation
        this.drawBoard(true); // Show all the mines on the board.
        this.state = "lose";
        this.updateTexts();
    }
    /** Win the game */
    private win() {
        this.grid.forEach((g,i,a)=>a[i]=g.map(v=>([1,1,2,3,4] as const)[v])); // TODO animation
        this.drawBoard(false);
        this.state = "win";
        this.updateTexts();
    }
    
    /** "Dig" at a given tile. */
    private tileInteract(x:number,y:number,flag:boolean):void {
        // If the game is not playing, also do nothing.
        if ( this.state !== "play") return;

        if (!this.generated) {
            const {w,h} = this;
            for (let i = 0; i < this.nMines;) {
                const mx = Math.floor(Math.random()*w), my = Math.floor(Math.random()*h);
                if (this.grid[mx][my] === 3 || (mx-x)**2+(my-y)**2 < 2.1)
                    continue; // Don't double place tiles or place mines where the user is clicking (r=sqrt2 clearing).
            
                this.grid[mx][my] = 3;
                i++;
            }
            this.generated = true;
        }
        
        const c = this.grid[x][y];
        // If the tile has been checked, do nothing, it's uninteractable.
        if (c === 1) return;

        if (flag) {
            // Don't place any flags if the player is out of flags to place.
            if (this.nFlags <= 0 && (c === 0 || c === 3))
                return;
            
            // Map to a new tile kind.
            // eslint-disable-next-line no-sparse-arrays
            this.grid[x][y] = [
                2, // unchecked -> flagged
                ,
                0, // flagged -> unchecked
                4, // mine -> flagged mine
                3  // flagged mine -> mine
            ][c] as 0|1|2|3|4;
            // increment the number of flagged mines and remaining flags.
            this.nFlags += [-1,0,1,-1,1][c];
            this.nFlaggedMines += [0,0,0,1,-1][c];
            this.updateTexts();

            // Win if all the mines are flagged.
            if (this.nFlaggedMines >= this.nMines) {
                this.win();
                return;
            }
        } else {
            if (c === 0) // Check unchecked tiles
                this.grid[x][y] = 1;
            if (c === 3) {// Clicked a mine, lose
                this.lose();
                return;
            }
            
            // other cases do nothing, so they're unlisted
        }
        this.updateTiles([{x,y}],!flag); // Update the tiles, and don't spread if it's a flag placement.
    }

    private updateTiles(tiles:{x:number,y:number}[], spread:boolean) {
        const
            {w,h} = this,
            iI = (i:number)=>({x:i%w,y:Math.floor(i/w)}),
            iU = (x:number,y:number)=>x+y*w,
            drawnTiles = new Set<number>(),
            tilesToDraw = tiles.map(({x,y})=>iU(x,y));
        
        while(tilesToDraw.length > 0) {
            const i = tilesToDraw.shift(), {x,y}=iI(i);
            if (spread && this.neighbors(x,y) === 0) {
                for (let dx = Math.max(0,x-1); dx < x+2 && dx < w; dx++) {
                    for (let dy = Math.max(0,y-1); dy < y+2 && dy < h; dy++) {
                        const nI = iU(dx,dy);
                        if (!drawnTiles.has(nI) && !tilesToDraw.includes(nI))
                            tilesToDraw.push(nI);
                        if (this.grid[dx][dy] === 0) // Autodig around zero tiles
                            this.grid[dx][dy] = 1;                            
                        
                    }
                }
            }
            this.drawTile(x,y,false);
            drawnTiles.add(i);
        }
    }

    /** Get the number of mines neighboring a tile, and if one of them is a cleared square. (included middle tile, because it is assumed not to be a mine) */
    private neighbors(x:number,y:number):number {
        return __a(
            3,
            i=>__a(
                3,
                j=>
                    ([
                        0, // unchecked
                        0, // checked
                        0, // flagged
                        1, // [mine]
                        1  // [mine] flagged
                    ])[
                        (this.grid[x-1+i]??[])[y-1+j] ?? 0 // Safe index grid. if outside grid, return 0
                    ]
            )
        ).flat().reduce((a,b)=>a+b);
    }

    /** Redraw a tile. */
    private drawTile(x:number,y:number,showMines=false) {
        const
            {ctx} = this,
            tx = x*ts, ty = y*ts,
            dr=(n:number)=>
                ctx.drawImage(tileImgs,
                    n*ts,0, ts,ts,
                    tx,ty,ts,ts
                );
        ctx.clearRect(tx,ty,ts,ts);
        [
            ()=>0, // empty tile: draw nothing
            ()=>dr(this.neighbors(x,y)), // dug tile, draw number
            ()=>dr(9), // flagged tile, draw atlas image 9 [flagged tile]
            ()=>showMines && dr(10), // mine tile, if showMines, draw atlas image 10 [mine], else treat it as an unchecked tile
            ()=>{showMines && dr(10); dr(9)}, // flagged mine tile, if showMines, draw atlas image 10 [mine], else treat it as an flagged tile 9 [flag]
        ][this.grid[x][y]]();
    }

    /** Redraw the entire board */
    private drawBoard(mines:boolean) {
        this.grid.forEach((g,x)=>g.forEach((_,y)=>this.drawTile(x,y,mines)));
    }


    private readonly onClick:(e:MouseEvent)=>void = e=>{        
        e.preventDefault();
        const x=Math.floor(e.offsetX/this.visualScale/ts),y=Math.floor(e.offsetY/this.visualScale/ts);
        this.tileInteract(x,y,e.shiftKey);
    };
}


let game:MineSweep|undefined;
const gameConst = {w:[5,20,50],h:[5,10,50],m:[5,20,50],s:[.5,2,4]} as const,
    constrainByGameConst = (v:number,c:keyof typeof gameConst)=>isFinite(v)?Math.max(Math.min(v,gameConst[c][2]),gameConst[c][0]):gameConst[c][1],
    inputConfigByGameConst = (c:keyof typeof gameConst,step:number)=>({
        type:"number",
        min: gameConst[c][0] as never as string,
        valueAsNumber: gameConst[c][1],
        max: gameConst[c][2] as never as string,
        step
    }) as never as Partial<HTMLInputElement>;

const divRoot = __s(_e("div"),{className:"root"});

_e("h2",divRoot).innerText = "minesweeper";
_e("h5",divRoot).innerHTML = "[<a href=\"https://github.com/SciDev5/dataurl-games\">SciDev5</a>]";
__s(_e("div",divRoot),{innerHTML:"CONTROLS\x20[click:\x20<b>dig</b>;\x20shift+click:\x20<b>[un]mark flag</b>]",id:"instruct"});

const buttonRoot = __s(_e("div",divRoot),{className:"buttons"});

_et("[size:\x20",buttonRoot);
const widthIn = __s(_e("input",buttonRoot),inputConfigByGameConst("w",5));
_et("x",buttonRoot);
const heightIn = __s(_e("input",buttonRoot),inputConfigByGameConst("h",5));
_et(";\x20mine fraction:\x20",buttonRoot);
const mineFracIn = __s(_e("input",buttonRoot),inputConfigByGameConst("m",5));
_et("%;\x20view-scale:\x20",buttonRoot);
const scaleIn = __s(_e("input",buttonRoot),{...inputConfigByGameConst("s",.5),
    onchange:e=>{
        game?.setCnvScale(scaleIn.valueAsNumber);
    }
});
_et("x]\x20::\x20",buttonRoot);

const startBtn = __s(_e("button",buttonRoot),{
    innerText:" [ START ] ",
    onclick:e=>{
        const
            w = constrainByGameConst(widthIn.valueAsNumber,"w"),
            h = constrainByGameConst(heightIn.valueAsNumber,"h"),
            m = constrainByGameConst(mineFracIn.valueAsNumber,"m")/100;
        game?.destroy();
        game = new MineSweep(w,h,divRoot).start(Math.floor(w*h*m)).setCnvScale(scaleIn.valueAsNumber);
        startBtn.innerText = " [ RESTART ] ";
    }
});
