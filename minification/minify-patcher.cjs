/* eslint-disable @typescript-eslint/no-var-requires */
// eslint-disable-next-line no-undef
const path = require("path"), fs = require("fs/promises");
// eslint-disable-next-line no-undef
const minifyPath = require.resolve("minify");

/** @type {{[path:string]:(strIn:string)=>string}} */
const patches = {
    ".": strIn=>strIn.replace(/export (?:default )?async function minify[^]*?onDataRead\(file, data, userOptions\)/,`
    export default async function minify(name, data, userOptions) {
        const EXT = ['js', 'html', 'css'];
        
        check(name);
        
        const ext = path.extname(name).slice(1);
        const is = EXT.includes(ext);
        
        if (!is)
            throw Error(\`File type "\${ext}" not supported.\`);
        
        log('optimizing ' + path.basename(name));
        return await optimize(name, data, userOptions);
    }
    
    /**
     * function minificate js, css and html files
     *
     * @param {string} file - js, css or html file path
     * @param {string} data
     * @param {object} userOptions - object with optional keys, which each can contain options to be combined with defaults and passed to the respective minifier
     */
    async function optimize(file, data, userOptions) {
        check(file);
        
        log('reading file ' + path.basename(file));
        
        // const data = await readFile(file, 'utf8');
        return await onDataRead(file, data, userOptions)
    `.trim()),
    "../../../@types/minify/index.d.ts": str=>str.replace(/declare function minify(.*?): Promise<string>;/,"declare function minify(name: string, data: string, options?: Options): Promise<string>;")
};

const patchPromises = [];
for (const pathIn in patches) {
    const patch = patches[pathIn], truePath = path.join(minifyPath,pathIn);
    console.log("[[PATCH]]",truePath,patch);
    patchPromises.push(fs.readFile(truePath,{encoding:"utf8"}).then(patch).then(v=>fs.writeFile(truePath,v,{encoding:"utf-8"})));
}


// eslint-disable-next-line no-undef
module.exports = {done:Promise.all(patchPromises)};