/* eslint-disable no-throw-literal */
import { _e, _h, __a, __s } from "../../code-prefix";

document.body.inputMode = "text";

__s(_e("div"),{id:"t"}).innerText="Audio Synth";

/*   [  //* -> LOW RES; /* - HIGH RES  ]

__s(_e("div"),{id:"k", innerText:
`[keyboard mapping]
C |C#|D |D#|E |F |F#|G |G#
--+--+--+--+--+--+--+--+--
  |s |  |d |  |  |g |  |h     . . . etc
z |  |x |  |c |v |  |b |`
});

/*/

__s(_e("div"),{id:"l"}).innerText="keyboard layout:";
const tBody = _e("tbody",_e("table")),
    tRA = _e("tr",tBody), tRB = _e("tr",tBody), tRC = _e("tr",tBody);
["C","C#","D","D#","E","F","F#","G","G#"].map(keyName=>_e("td",tRA).innerText=keyName);
" s d  g h".split("").map(keyName=>_e("td",tRB).innerText=keyName);_e("th",tRB).innerText=" ...";
"z x cv b ".split("").map(keyName=>_e("td",tRC).innerText=keyName);

// end switch comment */

const
    activeKeyDisplay = __s(_e("div"),{style: "font-weight:bold" as never}),
    actx = new AudioContext(),
    actxNow = ()=>actx.currentTime,
    setValueNow = (param: AudioParam, value: number)=>param.setValueAtTime(value,actxNow()),
    cancelAutomation = (param: AudioParam)=>param.cancelAndHoldAtTime(actxNow()),
    linearRampValue = (param: AudioParam, ...values: [number,number][])=>values.map(([delay,value])=>param.linearRampToValueAtTime(value,actxNow()+delay));

//*

class SynthVoice {
    private readonly osc = actx.createOscillator();
    private readonly gain = actx.createGain();
    private lastKeyPlay = -Infinity;

    public get currentKeyAge():number {
        return actxNow() - this.lastKeyPlay;
    }

    public init() {
        const { osc, gain } = this;
        osc.type = "sawtooth";
        setValueNow(gain.gain,0);
        osc.connect(gain).connect(actx.destination);
        osc.start();
    }

    public playKey(key:number):void {
        setValueNow(this.osc.frequency,8.18*2**(key/12));
        linearRampValue(this.gain.gain,[0,0],[0.01,.3],[4,0]);
        this.lastKeyPlay = actxNow();
    }
    public endKey():void {
        cancelAutomation(this.gain.gain);
        linearRampValue(this.gain.gain,[0.5,0]);
    }
}
    
const voices = __a(5,i=>new SynthVoice()), activeVoices = new Set<SynthVoice>(), voicesByKey:SynthVoice[] = [];
    
let initializeIfNotAlready:(()=>Promise<void>)|(()=>0) = async()=>{
    initializeIfNotAlready = ()=>0;
    await actx.resume();

    voices.forEach(v=>v.init());
};

const
    baseKey = 36,
    keyboardKeyToMidiKey = (e:KeyboardEvent)=>"zsxdcvgbhnjm,l.;/q2w3e4rt6y7ui9o0p-[]".indexOf(e.key)+baseKey,
    keyToString = (key:number)=>{
        const noteIndex = key*2 %24, octave = Math.floor(key/12);
        return "C C#D D#E F F#G G#A A#B ".slice(noteIndex,noteIndex+2).trim()+octave;
    }, updateActiveKeysDisplay = ()=>{
        const keys = voicesByKey.map((_,i)=>[i]).reduce((a,b)=>[...a,...b],[]);
        activeKeyDisplay.innerText = keys.map(keyToString).join(" | ");
    };

_h("keydown",async e=>{
    initializeIfNotAlready();
    
    const [oldestVoice] = voices.sort((a,b)=>b.currentKeyAge-a.currentKeyAge).filter(voice=>!activeVoices.has(voice));
    if (!oldestVoice) throw "NoVcsLft";

    const key = keyboardKeyToMidiKey(e);

    if (voicesByKey[key] || key === baseKey-1) return;

    oldestVoice.playKey(key);
    activeVoices.add(oldestVoice);
    voicesByKey[key] = oldestVoice;
    updateActiveKeysDisplay();
});

_h("keyup",async e=>{
    const key = keyboardKeyToMidiKey(e), voice = voicesByKey[key];
    if (voice) {
        voice.endKey();
        activeVoices.delete(voice);
        delete voicesByKey[key];
        updateActiveKeysDisplay();
    }
});

/*/

class SynthVoice {
    private readonly osc = actx.createOscillator();
    private readonly gain = actx.createGain();
    public lastKeyPlay = -Infinity;


    public init() {
        const { osc, gain } = this;
        osc.type = "square";
        setValueNow(gain.gain,0);
        osc.connect(gain).connect(actx.destination);
        osc.start();
    }

    public playKey(key:number):void {
        setValueNow(this.osc.frequency,8.18*2**(key/12));
        linearRampValue(this.gain.gain,[0,0],[0.01,.3],[.5,0]);
        this.lastKeyPlay = actxNow();
    }
}
    
const voices = __a(5,i=>new SynthVoice());
    
let initializeIfNotAlready:(()=>Promise<void>)|(()=>0) = async()=>{
    initializeIfNotAlready = ()=>0;
    await actx.resume();

    voices.forEach(v=>v.init());
};

const
    baseKey = 36,
    keyboardKeyToMidiKey = (e:KeyboardEvent)=>"zsxdcvgbhnjm,l.;/q2w3e4rt6y7ui9o0p-[]".indexOf(e.key)+baseKey;

_h("keydown",async e=>{
    initializeIfNotAlready();
    
    const [oldestVoice] = voices.sort((a,b)=>a.lastKeyPlay-b.lastKeyPlay);
    if (!oldestVoice) throw "NoVcsLft";

    const key = keyboardKeyToMidiKey(e);

    if (key === baseKey-1) return;

    oldestVoice.playKey(key);
});


//*/