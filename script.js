const $=s=>document.querySelector(s), board=$('#board');
const SEG={0:'abcdef',1:'bc',2:'abdeg',3:'abcdg',4:'bcfg',5:'acdfg',6:'acdefg',7:'abc',8:'abcdefg',9:'abcdfg',A:'abcefg',B:'cdefg',C:'adef',D:'bcdeg',E:'adefg',F:'aefg',G:'acdef',H:'bcefg',I:'bc',J:'bcde',K:'cefg',L:'def',M:'abcef',N:'ceg',O:'cdeg',P:'abefg',Q:'abcfg',R:'eg',S:'acdfg',T:'defg',U:'bcdef',V:'cde',W:'bcdef',X:'bcefg',Y:'bcdfg',Z:'abdeg'};
let mode='digits',level=1,score=0,time=0,total=0,timer=null,target=-1,locked=false,lastMode='digits',startedAt=0,training=false,trainingLevel=10,trainMode='digits',trainingRound=0,revealTimer=null,lastElapsed=0;
const TRAINING_ROUNDS=15;
const pairsDigits=[['5','3'],['8','9'],['6','5'],['9','3'],['2','3'],['0','8'],['7','1'],['6','8']];
const pairsLetters=[['E','F'],['P','R'],['C','G'],['O','Q'],['U','V'],['H','A'],['L','J'],['S','Z']];
function show(id){document.querySelectorAll('.screen').forEach(x=>x.classList.remove('active'));$(id).classList.add('active')}
function charEl(ch){let el=document.createElement('div');el.className='segchar';for(let s of 'abcdefg'){let i=document.createElement('i');i.className=`seg ${['a','g','d'].includes(s)?'h':'v'} ${s} ${(SEG[ch]||'').includes(s)?'on':''}`;el.append(i)}return el}
function choosePair(){let list=mode==='digits'?pairsDigits:mode==='letters'?pairsLetters:[...pairsDigits,...pairsLetters];let p=list[Math.floor(Math.random()*list.length)];return Math.random()<.5?p:[p[1],p[0]]}
function start(m=lastMode,train=false,lvl=1){clearInterval(timer);clearTimeout(revealTimer);lastMode=mode=m;training=train;level=train?lvl:1;trainingLevel=lvl;trainingRound=0;score=0;startedAt=Date.now();lastElapsed=0;show('#game');next()}
const CHAOS_NAMES={moving:'déplacement',splitMove:'sens opposés',blinking:'clignotement',staggered:'hauteurs',staticNoise:'grésillement'};
function setBoardClasses(classes,label){board.className='';classes.forEach(c=>board.classList.add(c));$('#modeBadge').textContent=label||''}
function applyTrainingDifficulty(){
  const lvl=trainingLevel;
  if(lvl===10)return setBoardClasses(['moving'],'↔ Déplacement gauche ↔ droite');
  if(lvl===20)return setBoardClasses(['moving','splitMove'],'⇆ Lignes en sens différents');
  if(lvl===25)return setBoardClasses(['moving','splitMove','blinking'],'✦ Mouvement + clignotement');
  if(lvl===30)return setBoardClasses(['staggered'],'≋ Caractères à différentes hauteurs');
  if(lvl===40){let pool=['moving','splitMove','blinking','staggered'],shuffled=pool.slice().sort(()=>Math.random()-.5),count=2+Math.floor(Math.random()*3),chosen=shuffled.slice(0,count);if(chosen.includes('splitMove')&&!chosen.includes('moving'))chosen.push('moving');return setBoardClasses(chosen,'🎲 '+chosen.map(c=>CHAOS_NAMES[c]).join(' + '))}
  if(lvl===50){let pool=['moving','splitMove','blinking','staggered'],shuffled=pool.slice().sort(()=>Math.random()-.5),count=1+Math.floor(Math.random()*3),chosen=['staticNoise',...shuffled.slice(0,count)];if(chosen.includes('splitMove')&&!chosen.includes('moving'))chosen.push('moving');setBoardClasses(chosen,'📺 '+chosen.map(c=>CHAOS_NAMES[c]).join(' + '));crackle();return}
  setBoardClasses([], '');
}
function applyDifficulty(){
  if(training)return applyTrainingDifficulty();
  board.className='';let label='';
  if(level>=50){let pool=['moving','splitMove','blinking','staggered'],shuffled=pool.slice().sort(()=>Math.random()-.5),count=1+Math.floor(Math.random()*3),chosen=['staticNoise',...shuffled.slice(0,count)];if(chosen.includes('splitMove')&&!chosen.includes('moving'))chosen.push('moving');chosen.forEach(c=>board.classList.add(c));label='📺 '+chosen.map(c=>CHAOS_NAMES[c]).join(' + ');crackle()}
  else if(level>=40){let pool=['moving','splitMove','blinking','staggered'],shuffled=pool.slice().sort(()=>Math.random()-.5),count=2+Math.floor(Math.random()*3),chosen=shuffled.slice(0,count);if(chosen.includes('splitMove')&&!chosen.includes('moving'))chosen.push('moving');chosen.forEach(c=>board.classList.add(c));label='🎲 '+chosen.map(c=>CHAOS_NAMES[c]).join(' + ')}
  else{if(level>=10){board.classList.add('moving');label='↔ Déplacement alterné'}if(level>=20){board.classList.add('splitMove');label='⇆ Lignes en sens différents'}if(level>=25){board.classList.add('blinking');label='✦ Mouvement + clignotement'}if(level>=30){board.classList.add('staggered');label='≋ Hauteurs différentes'}}
  $('#modeBadge').textContent=label
}
function updateTrainProgress(){let el=$('#trainProgress');if(training){el.style.display='block';el.textContent=`Exercice ${trainingRound+1} / ${TRAINING_ROUNDS}`}else{el.style.display='none';el.textContent=''}}
function next(){
  locked=false;clearInterval(timer);clearTimeout(revealTimer);$('#message').textContent='';
  let effectiveLevel=training?trainingLevel:level;
  let n=Math.min(14,5+Math.floor((effectiveLevel-1)/2));
  let count=n*n,[normal,odd]=choosePair();target=Math.floor(Math.random()*count);
  board.innerHTML='';board.style.gridTemplateColumns=`repeat(${n},1fr)`;
  for(let i=0;i<count;i++){
    let c=document.createElement('div');c.className='cell';c.dataset.i=i;c.dataset.row=Math.floor(i/n);
    c.style.setProperty('--delay',`${(i%n)*-.075}s`);
    c.style.setProperty('--rowDelay',`${(Math.floor(i/n)%4)*-.16}s`);
    if(effectiveLevel>=30 || (training&&trainingLevel===30))c.style.setProperty('--lift',`${((i*17)%9-4)*5}px`);
    c.append(charEl(i===target?odd:normal));c.onclick=()=>pick(c,i);board.append(c)
  }
  applyDifficulty();updateTrainProgress();
  total=time=Math.max(7,24-effectiveLevel*.48);update();
  timer=setInterval(()=>{time=Math.max(0,time-.1);update();if(time<=0)revealIntruderAndEnd()},100)
}
function pick(c,i){
  if(locked)return;
  if(i===target){
    locked=true;c.classList.add('hit');score+=Math.round(100*level+time*12);$('#message').textContent='✓ TROUVÉ !';foundSound();clearInterval(timer);
    setTimeout(()=>{$('#message').textContent='';if(training){trainingRound++;if(trainingRound>=TRAINING_ROUNDS){finishTraining()}else{level=trainingLevel;next()}}else{level++;next()}},650)
  }else{
    time=Math.max(0,time-2);c.classList.add('wrong');setTimeout(()=>c.classList.remove('wrong'),250);beep(170,.08);
    if(time<=0)revealIntruderAndEnd()
  }
}
function revealIntruderAndEnd(){
  if(locked)return;locked=true;clearInterval(timer);time=0;update();lastElapsed=Date.now()-startedAt;
  const targetCell=board.querySelector(`.cell[data-i="${target}"]`);
  if(targetCell){targetCell.classList.add('reveal');targetCell.scrollIntoView({block:'nearest',inline:'nearest'})}
  $('#message').textContent="👁 L'INTRUS ÉTAIT ICI";beep(260,.18,.06);
  revealTimer=setTimeout(()=>{end(lastElapsed)},3000)
}
function update(){$('#level').textContent=level;$('#score').textContent=score;$('#time').textContent=time.toFixed(1);$('#progress i').style.width=(total?time/total*100:0)+'%'}
function durationText(ms){let s=Math.max(0,Math.floor(ms/1000)),m=Math.floor(s/60);return m?`${m} min ${String(s%60).padStart(2,'0')} s`:`${s} s`}
function getBest(){try{return JSON.parse(localStorage.intrusBestV2)||{score:+localStorage.intrusBest||0,level:0,time:0}}catch{return{score:0,level:0,time:0}}}
function renderBest(){let b=getBest();$('#bestHome').textContent=b.score||0;$('#bestLevel').textContent=b.level||'—';$('#bestTime').textContent=b.time?durationText(b.time):'—'}
function end(elapsedOverride){
  clearInterval(timer);clearTimeout(revealTimer);locked=true;let elapsed=elapsedOverride??(Date.now()-startedAt),best=getBest();lastElapsed=elapsed;
  if(!training&&(score>best.score||(score===best.score&&level>best.level))){best={score,level,time:elapsed};localStorage.intrusBestV2=JSON.stringify(best)}
  $('#overTitle').textContent=training?'Séance interrompue':'Temps écoulé !';$('#finalLevel').textContent=level;$('#finalScore').textContent=score;$('#finalTime').textContent=durationText(elapsed);$('#finalBest').textContent=best.score||score;$('#finalRecordDetail').textContent=`Record : niveau ${best.level||level} · ${durationText(best.time||elapsed)}`;$('#finalBestRow').style.display=training?'none':'inline';$('#trainingNote').style.display=training?'block':'none';if(training)$('#trainingNote').textContent=`${trainingRound}/${TRAINING_ROUNDS} exercices réussis avant la fin du temps · le record n'est pas modifié.`;renderBest();$('#over').showModal();beep(110,.35)
}
function finishTraining(){clearInterval(timer);locked=true;let elapsed=Date.now()-startedAt;lastElapsed=elapsed;$('#overTitle').textContent='Séance terminée ! 🎉';$('#finalLevel').textContent=trainingLevel;$('#finalScore').textContent=score;$('#finalTime').textContent=durationText(elapsed);$('#finalBestRow').style.display='none';$('#trainingNote').style.display='block';$('#trainingNote').textContent=`${TRAINING_ROUNDS}/${TRAINING_ROUNDS} exercices réussis · le record n'est pas modifié.`;renderBest();$('#over').showModal();foundSound()}
let audioCtx=null;
function getAudio(){try{if(!audioCtx)audioCtx=new (window.AudioContext||window.webkitAudioContext)();if(audioCtx.state==='suspended')audioCtx.resume();return audioCtx}catch{return null}}
function beep(freq,d,vol=.07){let a=getAudio();if(!a)return;try{let o=a.createOscillator(),g=a.createGain();o.frequency.value=freq;o.connect(g);g.connect(a.destination);g.gain.setValueAtTime(vol,a.currentTime);g.gain.exponentialRampToValueAtTime(.001,a.currentTime+d);o.start();o.stop(a.currentTime+d)}catch{}}
function foundSound(){let a=getAudio();if(!a)return;try{[[880,0,.09],[1320,.09,.08]].forEach(([f,delay,vol])=>{let o=a.createOscillator(),g=a.createGain();o.type='triangle';o.frequency.value=f;o.connect(g);g.connect(a.destination);let t=a.currentTime+delay;g.gain.setValueAtTime(vol,t);g.gain.exponentialRampToValueAtTime(.001,t+.12);o.start(t);o.stop(t+.13)})}catch{}}
function crackle(){let a=getAudio();if(!a)return;try{let len=Math.floor(a.sampleRate*.15),buf=a.createBuffer(1,len,a.sampleRate),d=buf.getChannelData(0);for(let i=0;i<len;i++)d[i]=(Math.random()*2-1)*(1-i/len);let s=a.createBufferSource();s.buffer=buf;let g=a.createGain();g.gain.value=.05;s.connect(g);g.connect(a.destination);s.start()}catch{}}
async function shareResult(){let elapsed=lastElapsed||Date.now()-startedAt,text=`L'INTRUS — Score ${score} · Niveau ${level} · Temps ${durationText(elapsed)}. À toi de trouver l'intrus !`;try{if(navigator.share)await navigator.share({title:"L'INTRUS",text,url:location.href});else if(navigator.clipboard){await navigator.clipboard.writeText(text+' '+location.href);$('#share').textContent='Résultat copié !';setTimeout(()=>$('#share').textContent='Partager mon résultat',1600)}}catch{}}
document.querySelectorAll('#home [data-mode]').forEach(b=>b.onclick=()=>start(b.dataset.mode));
document.querySelectorAll('[data-tmode]').forEach(b=>b.onclick=()=>{trainMode=b.dataset.tmode;document.querySelectorAll('[data-tmode]').forEach(x=>x.classList.remove('active'));b.classList.add('active')});
document.querySelectorAll('[data-train]').forEach(b=>b.onclick=()=>start(trainMode,true,+b.dataset.train));
$('#trainingBtn').onclick=()=>show('#training');$('#trainingBack').onclick=()=>show('#home');$('#quit').onclick=()=>{clearInterval(timer);clearTimeout(revealTimer);show('#home')};$('#rulesBtn').onclick=()=>$('#rules').showModal();$('#closeRules').onclick=()=>$('#rules').close();$('#again').onclick=()=>{$('#over').close();start(lastMode,training,training?trainingLevel:1)};$('#homeBtn').onclick=()=>{$('#over').close();show('#home')};$('#share').onclick=shareResult;renderBest();
