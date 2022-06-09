import {done} from "./minify-patcher.cjs";

done.then(()=>{
    console.log(">> DONE PATCHING");
    import("./serve.mjs");
});