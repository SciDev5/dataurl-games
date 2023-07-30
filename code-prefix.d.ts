type HTMLElementsByTag = {
    div: HTMLDivElement;
    canvas: HTMLCanvasElement;
    img: HTMLImageElement;
    a: HTMLLinkElement;
    input: HTMLInputElement;
    span: HTMLElement;

    table: HTMLTableElement;
    tbody: HTMLBodyElement;
    tr: HTMLTableRowElement;
    td: HTMLTableCellElement;
    th: HTMLTableCellElement;

    button: HTMLButtonElement;

    h1: HTMLElement;
    h2: HTMLElement;
    h3: HTMLElement;
    h4: HTMLElement;
    h5: HTMLElement;

    meta: HTMLMetaElement;
};

declare const $:typeof document;
declare const _e:<T extends keyof HTMLElementsByTag>(tagName:T,parent?:HTMLElement)=>HTMLElementsByTag[T];
declare const _et:(text:string,parent:HTMLElement)=>void;

declare const __s:<T extends object>(elt:T,properties:{[key in keyof T]?:T[key]})=>T;
declare const __a:<T>(length:number,genFunction:(i:number)=>T)=>T[];

type f = {
    "2d":{param:CanvasRenderingContext2DSettings,ret:CanvasRenderingContext2D},
    "webgl2":{param:WebGLContextAttributes,ret:WebGL2RenderingContext},
};
declare const _c:<T extends keyof f>(type:T,options?:f[T]["param"])=>[HTMLCanvasElement,f[T]["ret"]];


declare const _ls:(callback:()=>void)=>void;
declare const _lc:()=>void;

declare const _h:typeof addEventListener;

declare const _at:(namespacedId:string)=>string;
declare const _aj:(namespacedId:string)=>string|number|boolean|object|null;
declare const _ai:(namespacedId:string)=>HTMLImageElement;


export {$,_e,_et,_c,_ls,_lc,_h,_at,_ai,_aj,__s,__a};