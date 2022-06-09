import express from "express";
import minify from "minify";

const app = express();

app.use(express.text({type:"*/*"}));

app.use((req,res,next)=>{
    res.header("Access-Control-Allow-Origin","*");
    next();
});

app.get("/",(req,res)=>res.json(true));

app.post("/:fileExt",async(req,res)=>{
    const {fileExt} = req.params, minified = await minify("file."+fileExt,req.body,{js:{
        keep_classnames:false,
        keep_fnames:false,
        toplevel:true,
        mangle: {
            properties:true,
        },
        module: true,
        compress: {
            properties: true,
        }
    }});
    res.send(minified);
});

app.listen(3000,()=>console.log(">>> listening ["+3000+"]"));