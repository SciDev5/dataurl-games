type HTMLElementsByTag = {
    div: HTMLDivElement;
    canvas: HTMLCanvasElement;
    img: HTMLImageElement;
    a: HTMLLinkElement;
    input: HTMLInputElement;
}

declare const $:typeof document;
declare const _e:<T extends keyof HTMLElementsByTag>(e:T)=>HTMLElementsByTag[T];

type f = {
    "2d":{param:CanvasRenderingContext2DSettings,ret:CanvasRenderingContext2D},
    "webgl2":{param:WebGLContextAttributes,ret:WebGL2RenderingContext},
};
declare const _c:<T extends keyof f>(width:number,height:number,type:T,options?:f[T]["param"])=>[HTMLCanvasElement,f[T]["ret"]];

declare const _ls:(callback:()=>void)=>void;
declare const _lc:()=>void;

declare const _h:typeof addEventListener;

declare const _at:(namespacedId:string)=>string;
declare const _aj:(namespacedId:string)=>any;
declare const _ai:(namespacedId:string)=>HTMLImageElement;


export {$,_e,_c,_ls,_lc,_h,_at,_ai,_aj};