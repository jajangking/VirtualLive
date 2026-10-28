(() => {
  const QUESTIONS = [
    { category:'ASTRONOMI', question:'Planet terbesar di tata surya kita adalah…', options:['Bumi','Jupiter','Saturnus','Neptunus'], correct:1 },
    { category:'TUBUH MANUSIA', question:'Organ tubuh manusia yang paling luas adalah…', options:['Paru-paru','Hati','Kulit','Usus halus'], correct:2 },
    { category:'ASTRONOMI', question:'Planet yang dikenal sebagai Planet Merah adalah…', options:['Venus','Mars','Merkurius','Uranus'], correct:1 },
    { category:'SAINS', question:'Rumus kimia air adalah…', options:['CO₂','O₂','H₂O','NaCl'], correct:2 },
    { category:'GEOGRAFI', question:'Gunung tertinggi di dunia jika diukur dari permukaan laut adalah…', options:['Kilimanjaro','K2','Everest','Denali'], correct:2 },
    { category:'SAINS', question:'Gas yang diserap tumbuhan saat fotosintesis adalah…', options:['Oksigen','Karbon dioksida','Nitrogen','Hidrogen'], correct:1 },
    { category:'GEOGRAFI', question:'Apa ibu kota Jepang?', options:['Kyoto','Osaka','Tokyo','Sapporo'], correct:2 },
    { category:'KIMIA', question:'Simbol kimia “Au” adalah untuk unsur…', options:['Perak','Aluminium','Emas','Tembaga'], correct:2 },
    { category:'DUNIA HEWAN', question:'Mamalia yang bertelur dan memiliki paruh seperti bebek adalah…', options:['Koala','Platipus','Berang-berang','Panda'], correct:1 },
    { category:'GEOGRAFI', question:'Samudra terbesar di Bumi adalah…', options:['Atlantik','Hindia','Arktik','Pasifik'], correct:3 },
    { category:'TUBUH MANUSIA', question:'Berapa jumlah tulang pada tubuh orang dewasa pada umumnya?', options:['186','196','206','216'], correct:2 },
    { category:'SEJARAH INDONESIA', question:'Proklamasi Kemerdekaan Indonesia dibacakan pada tanggal…', options:['1 Juni 1945','17 Agustus 1945','18 Agustus 1945','10 November 1945'], correct:1 },
    { category:'MATEMATIKA', question:'Bilangan prima terkecil adalah…', options:['0','1','2','3'], correct:2 },
    { category:'DUNIA HEWAN', question:'Komodo berasal dari negara…', options:['Indonesia','Australia','Filipina','Malaysia'], correct:0 },
    { category:'FISIKA', question:'Satuan gaya dalam sistem SI adalah…', options:['Joule','Watt','Pascal','Newton'], correct:3 },
    { category:'SEJARAH DUNIA', question:'Siapa manusia pertama yang berjalan di Bulan?', options:['Yuri Gagarin','Buzz Aldrin','Neil Armstrong','John Glenn'], correct:2 },
    { category:'GEOGRAFI', question:'Mata uang resmi Jepang disebut…', options:['Won','Yuan','Yen','Baht'], correct:2 },
    { category:'SAINS', question:'Pada tekanan udara normal, air membeku pada suhu…', options:['−10°C','0°C','10°C','32°C'], correct:1 },
    { category:'ASTRONOMI', question:'Planet bercincin paling terkenal di tata surya adalah…', options:['Mars','Saturnus','Merkurius','Bumi'], correct:1 },
    { category:'BAHASA', question:'Lawan kata “optimis” adalah…', options:['Pesimis','Realistis','Praktis','Idealis'], correct:0 },
  ];
  const LETTERS=['A','B','C','D'];
  const SCORE_KEY='virtuallive.quiz.scores.v1',BABAK_KEY='virtuallive.quiz.babak.v1',BABAK_HISTORY_KEY='virtuallive.quiz.babak-history.v1',PRIZE_KEY='virtuallive.quiz.babak-prize.v1';
  const ROUND_SECONDS=30,RESULT_SECONDS=7;
  const $=selector=>document.querySelector(selector);
  const answerGate=window.VirtualLiveAnswerGate.createFirstAnswerGate();
  const feed=$('#chatFeed'),input=$('#commentInput'),toast=$('#toast');
  let scores=loadScores(),deck=[],deckPosition=0,roundNumber=0,currentQuestion=null,babakNumber=1,babakHistory=[],pendingBabakArchive=null,wasPausedBeforeBabakDialog=false;
  const donorTotals=new Map();
  let phase='question',remaining=ROUND_SECONDS,resultRemaining=RESULT_SECONDS,firstCorrect=null,isPaused=false,announcementActive=false;
  let lastFrame=performance.now(),toastTimer;
  let audioContext=null,masterGain=null,bgmGain=null,sfxGain=null,bgmTimer=null,bgmStep=0,audioEnabled=false,lastCountdownSecond=ROUND_SECONDS,giftTimer=null;
  let hostAudioEnabled=false,hostAiConfigured=false,hostJobs=[],hostQueueRunning=false,lastAutoHostAt=0,hostVoiceStatus='SUARA AKTIF';
  const seenHostEventKeys=new Map();

  const pageParams=new URLSearchParams(location.search);
  if(pageParams.get('live')==='1'||pageParams.get('edit')==='1')document.body.classList.add('broadcast-mode');

  function cleanName(value){
    return String(value||'').replace(/[\u0000-\u001f\u007f]/g,'').replace(/^@/,'').trim().replace(/\s+/g,' ').slice(0,20)||'PENONTON';
  }
  function scoreKey(name){return cleanName(name).toLocaleLowerCase('id-ID');}
  function loadScores(){
    try{
      const data=JSON.parse(localStorage.getItem(SCORE_KEY)||'{}');
      if(!data||typeof data!=='object'||Array.isArray(data))return {};
      const clean={};
      for(const [key,value] of Object.entries(data)){
        if(value&&typeof value.name==='string'){
          const name=cleanName(value.name),points=Math.max(0,Math.floor(Number(value.points)||0));
          if(points)clean[key]={name,points,correct:points};
        }
      }
      return clean;
    }catch(_){return {};}
  }
  function saveScores(){
    try{localStorage.setItem(SCORE_KEY,JSON.stringify(scores));}
    catch(_){notify('Skor tampil, tetapi browser tidak bisa menyimpannya.',true);}
  }
  function loadBabakState(){
    try{
      const storedBabak=Number(localStorage.getItem(BABAK_KEY));babakNumber=Number.isFinite(storedBabak)&&storedBabak>0?Math.floor(storedBabak):1;
      const history=JSON.parse(localStorage.getItem(BABAK_HISTORY_KEY)||'[]');babakHistory=Array.isArray(history)?history.filter(record=>record&&typeof record==='object').slice(0,50):[];
      const prize=Number(localStorage.getItem(PRIZE_KEY));if(Number.isFinite(prize)&&prize>=0)$('#prizeAmount').value=String(Math.floor(prize));
    }catch(_){babakNumber=1;babakHistory=[];}
  }
  function saveBabakState(){
    try{localStorage.setItem(BABAK_KEY,String(babakNumber));localStorage.setItem(BABAK_HISTORY_KEY,JSON.stringify(babakHistory));}
    catch(_){notify('Riwayat babak tampil, tetapi tidak bisa disimpan browser.',true);}
  }
  function readPrizeAmount(){const amount=Math.floor(Number($('#prizeAmount').value));return Number.isFinite(amount)?Math.max(0,Math.min(amount,1000000000)):0;}
  function renderBabakHistory(){
    const list=$('#babakHistoryList');list.replaceChildren();
    if(!babakHistory.length){const empty=document.createElement('li');empty.className='history-empty';empty.textContent='Belum ada babak yang diarsipkan.';list.append(empty);return;}
    for(const record of babakHistory){
      const item=document.createElement('li');item.className='history-entry';
      const title=document.createElement('strong');title.textContent=`Babak ${String(record.number||0).padStart(2,'0')}`;
      const date=document.createElement('time');date.textContent=record.archivedAt?new Date(record.archivedAt).toLocaleDateString('id-ID',{day:'2-digit',month:'short',year:'numeric'}):'';
      const summary=document.createElement('p');
      const podium=Array.isArray(record.podium)?record.podium.filter(player=>player&&typeof player==='object'):[];
      summary.textContent=podium.length?podium.slice(0,3).map((player,index)=>`${index+1}. ${cleanName(player.name)} · ${player.points} poin`).join('  |  '):'Belum ada pemenang';
      const prize=document.createElement('span');prize.className='history-prize';prize.textContent=record.winner?`Hadiah ${formatRupiah(record.prizeAmount)}`:'Tanpa hadiah';
      const top=document.createElement('div');top.className='history-entry-top';top.append(title,date);item.append(top,summary,prize);list.append(item);
    }
  }
  function openNewBabakDialog(){
    const podium=sortedScores().slice(0,3).map(player=>({name:player.name,points:player.points,correct:player.correct}));
    pendingBabakArchive={number:babakNumber,archivedAt:new Date().toISOString(),podium,prizeAmount:readPrizeAmount(),winner:podium[0]?.name||''};
    try{localStorage.setItem(PRIZE_KEY,String(pendingBabakArchive.prizeAmount));}catch(_){/* The current prize remains active for this round. */}
    const summary=podium[0]?`Juara 1: ${podium[0].name} (${podium[0].points} poin). Hadiah yang dicatat: ${formatRupiah(pendingBabakArchive.prizeAmount)}. Skor babak ini akan diarsipkan, lalu papan aktif direset.`:'Belum ada skor pada babak ini. Babak baru tetap dimulai dan papan skor aktif akan kosong.';
    $('#newBabakSummary').textContent=summary;
    wasPausedBeforeBabakDialog=isPaused;if(!isPaused)setPaused(true);
    $('#newBabakDialog').showModal();
  }
  function closeNewBabakDialog(resume){
    const dialog=$('#newBabakDialog');if(dialog.open)dialog.close();pendingBabakArchive=null;
    if(resume&&!wasPausedBeforeBabakDialog&&isPaused)setPaused(false);
  }
  function beginNewBabak(){
    if(!pendingBabakArchive)return;
    babakHistory.unshift(pendingBabakArchive);babakHistory=babakHistory.slice(0,50);babakNumber++;
    saveBabakState();scores={};saveScores();roundNumber=0;deck=shuffle(QUESTIONS.map((_,index)=>index));deckPosition=0;
    closeNewBabakDialog(false);setPaused(false);nextQuestion();renderBabakHistory();
  }
  function sortedScores(){return Object.values(scores).sort((a,b)=>b.points-a.points||a.name.localeCompare(b.name,'id-ID'));}
  function totalCorrect(){return Object.values(scores).reduce((sum,item)=>sum+item.points,0);}
  function timestamp(){return new Date().toLocaleTimeString('id-ID',{hour:'2-digit',minute:'2-digit'});}
  function formatClock(seconds){const n=Math.max(0,Math.ceil(seconds));return `${String(Math.floor(n/60)).padStart(2,'0')}:${String(n%60).padStart(2,'0')}`;}
  function formatRupiah(value){return new Intl.NumberFormat('id-ID',{style:'currency',currency:'IDR',maximumFractionDigits:0}).format(Math.max(0,Math.floor(Number(value)||0)));}

  function addMessage(name,text,kind='comment',letter=''){
    if(kind!=='comment')return;
    const row=document.createElement('div');row.className='chat-message answer-message';
    const avatar=document.createElement('span');avatar.className=`chat-avatar ${kind==='system'?'is-system':''} ${kind==='winner'?'is-winner':''} ${kind==='gift'?'is-gift':''}`;
    avatar.textContent=kind==='system'?'✦':kind==='winner'?'★':kind==='gift'?'✧':cleanName(name).slice(0,1).toUpperCase();
    const body=document.createElement('div');body.className='chat-body';
    const meta=document.createElement('div');meta.className='chat-meta';
    const user=document.createElement('span');user.className=`chat-name ${kind==='system'?'system-name':''} ${kind==='winner'?'winner-name':''}`;user.textContent=name;
    const time=document.createElement('span');time.className='chat-time';time.textContent=timestamp();meta.append(user,time);
    const message=document.createElement('div');message.className='chat-text';message.textContent=text;
    if(letter){const chip=document.createElement('span');chip.className='answer-chip';chip.textContent=letter;message.append(chip);}
    body.append(meta,message);row.append(avatar,body);feed.append(row);
    while(feed.children.length>55)feed.firstElementChild.remove();
    feed.scrollTop=feed.scrollHeight;
  }
  function notify(text,error=false){
    toast.textContent=text;toast.classList.toggle('error',error);toast.classList.add('visible');
    clearTimeout(toastTimer);toastTimer=setTimeout(()=>toast.classList.remove('visible'),2400);
  }
  function initAudio(){
    if(audioContext)return true;
    const AudioContextClass=window.AudioContext||window.webkitAudioContext;
    if(!AudioContextClass){notify('Browser ini tidak mendukung Web Audio.',true);return false;}
    audioContext=new AudioContextClass();masterGain=audioContext.createGain();bgmGain=audioContext.createGain();sfxGain=audioContext.createGain();
    masterGain.gain.value=.55;bgmGain.gain.value=.17;sfxGain.gain.value=.4;
    bgmGain.connect(masterGain);sfxGain.connect(masterGain);masterGain.connect(audioContext.destination);
    return true;
  }
  function tone(frequency,duration,when,output,level=.045,wave='sine'){
    if(!audioContext||!output)return;
    const oscillator=audioContext.createOscillator(),envelope=audioContext.createGain();
    oscillator.type=wave;oscillator.frequency.setValueAtTime(frequency,when);
    envelope.gain.setValueAtTime(.0001,when);envelope.gain.linearRampToValueAtTime(level,when+.025);
    envelope.gain.exponentialRampToValueAtTime(.0001,when+duration);
    oscillator.connect(envelope);envelope.connect(output);oscillator.start(when);oscillator.stop(when+duration+.04);
  }
  function scheduleBgm(){
    if(!audioEnabled||!audioContext)return;
    const motif=[220,261.63,329.63,392,329.63,293.66,349.23,440,392,349.23,261.63,329.63,392,493.88,440,392];
    const now=audioContext.currentTime,fast=phase==='question'&&remaining<=8;
    tone(motif[bgmStep%motif.length],.32,now,bgmGain,.018,'triangle');
    if(bgmStep%4===0)tone(motif[bgmStep%motif.length]/2,.52,now,bgmGain,.014,'sine');
    bgmStep++;bgmTimer=setTimeout(scheduleBgm,fast?360:500);
  }
  function playSfx(kind){
    if(!audioEnabled||!audioContext)return;
    const now=audioContext.currentTime;
    const sounds={
      correct:[523.25,659.25,783.99],wrong:[220,196],result:[392,523.25,659.25,783.99],start:[392,523.25],gift:[659.25,783.99,987.77],tick:[880]
    };
    const notes=sounds[kind]||[];notes.forEach((note,index)=>tone(note,.18,now+index*.085,sfxGain,kind==='tick'?.028:.055,'sine'));
  }
  async function toggleAudio(){
    if(!initAudio())return;
    try{await audioContext.resume();}catch(_){notify('Audio belum bisa dimulai di browser ini.',true);return;}
    audioEnabled=!audioEnabled;
    const button=$('#audioToggle');button.setAttribute('aria-pressed',String(audioEnabled));button.classList.toggle('is-on',audioEnabled);
    button.querySelector('span').textContent=audioEnabled?'AUDIO ON':'AUDIO OFF';
    button.title=audioEnabled?'Matikan musik dan efek suara':'Aktifkan musik dan efek suara';
    if(audioEnabled){bgmGain.gain.setTargetAtTime(.17,audioContext.currentTime,.08);scheduleBgm();}
    else{clearTimeout(bgmTimer);bgmTimer=null;bgmGain.gain.setTargetAtTime(0,audioContext.currentTime,.12);}
  }
  async function toggleFullscreen(){
    try{
      if(document.fullscreenElement)await document.exitFullscreen();
      else await document.documentElement.requestFullscreen({navigationUI:'hide'});
    }catch(_){notify('Mode layar penuh tidak diizinkan browser.',true);}
  }
  function updateFullscreenButton(){
    const active=Boolean(document.fullscreenElement),button=$('#fullscreenToggle');
    button.querySelector('span').textContent=active?'KELUAR LAYAR':'LAYAR PENUH';
    button.title=active?'Keluar dari layar penuh':'Tampilkan layar penuh';button.setAttribute('aria-pressed',String(active));
  }
  function giftEmoji(giftName){
    if(/rose|mawar/i.test(giftName))return '🌹';
    if(/heart|love|hati/i.test(giftName))return '💖';
    if(/lion|singa/i.test(giftName))return '🦁';
    if(/galaxy|universe|planet|cosmos/i.test(giftName))return '🌌';
    if(/diamond|finger heart/i.test(giftName))return '💎';
    if(/coffee|kopi/i.test(giftName))return '☕';
    return '🎁';
  }
  function renderDonors(){
    const rows=$('#donorRows'),donors=[...donorTotals.values()].sort((a,b)=>b.diamonds-a.diamonds||b.gifts-a.gifts||a.name.localeCompare(b.name,'id-ID')).slice(0,5);
    const total=[...donorTotals.values()].reduce((sum,donor)=>sum+donor.gifts,0);
    $('#donorTotal').textContent=`${total} gift${total===1?'':'s'}`;rows.replaceChildren();
    if(!donors.length){const empty=document.createElement('p');empty.className='donor-empty';empty.textContent='Belum ada gift LIVE.';rows.append(empty);return;}
    for(const [index,donor] of donors.entries()){
      const row=document.createElement('div');row.className='donor-row';
      const rank=document.createElement('span');rank.className='donor-rank';rank.textContent=String(index+1).padStart(2,'0');
      const name=document.createElement('span');name.className='donor-name';name.textContent=donor.name;
      const gift=document.createElement('span');gift.className='donor-gift';gift.textContent=donor.diamonds?`${donor.diamonds} 💎`:`${donor.gifts} gift`;
      row.append(rank,name,gift);rows.append(row);
    }
  }
  function recordGift(data){
    const name=cleanName(data?.username),key=name.toLocaleLowerCase('id-ID'),count=Math.max(1,Math.floor(Number(data?.repeatCount)||1));
    const current=donorTotals.get(key)||{name,gifts:0,diamonds:0};
    current.gifts+=count;current.diamonds+=Math.max(0,Math.floor(Number(data?.diamondCount)||0))*count;donorTotals.set(key,current);renderDonors();
  }
  function showGiftReaction(data){
    const sender=cleanName(data?.username),giftName=String(data?.giftName||'TikTok Gift').slice(0,50),count=Math.max(1,Math.floor(Number(data?.repeatCount)||1));
    if(data?.isLiveGift)recordGift(data);
    const reaction=$('#giftReaction'),emoji=giftEmoji(giftName);
    $('#giftReactionIcon').textContent=emoji;$('#giftSender').textContent=sender;$('#giftTitle').textContent=`${giftName} × ${count}`;
    reaction.classList.remove('is-visible');reaction.setAttribute('aria-hidden','false');void reaction.offsetWidth;reaction.classList.add('is-visible');
    clearTimeout(giftTimer);giftTimer=setTimeout(()=>{reaction.classList.remove('is-visible');reaction.setAttribute('aria-hidden','true');},4200);
    addMessage(sender,`mengirim ${emoji} ${giftName}${count>1?` × ${count}`:''}`,'gift');playSfx('gift');
  }
  function shuffle(items){
    const array=[...items];
    for(let i=array.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[array[i],array[j]]=[array[j],array[i]];}
    return array;
  }
  function nextQuestion(){
    const animateTransition=roundNumber>0;
    if(deckPosition>=deck.length){
      const previous=deck.length?deck[deck.length-1]:-1;deck=shuffle(QUESTIONS.map((_,i)=>i));
      if(deck.length>1&&deck[0]===previous)[deck[0],deck[1]]=[deck[1],deck[0]];
      deckPosition=0;
    }
    currentQuestion=QUESTIONS[deck[deckPosition++]];roundNumber++;phase='question';
    remaining=ROUND_SECONDS;resultRemaining=RESULT_SECONDS;firstCorrect=null;answerGate.reset();
    feed.replaceChildren();updateAnswerCount();
    $('#questionText').textContent=currentQuestion.question;
    $('#questionTag').textContent=currentQuestion.category;
    $('#questionNumber').textContent=`· BABAK ${String(babakNumber).padStart(2,'0')} · SOAL ${String(roundNumber).padStart(2,'0')}`;
    $('#winnerBanner').classList.remove('visible','no-winner','winner-reveal');
    if(animateTransition){
      const content=$('.question-content'),heading=$('.quiz-panel .panel-heading');
      content.classList.remove('question-arrive');void content.offsetWidth;content.classList.add('question-arrive');
      heading.classList.remove('question-heading-arrive');void heading.offsetWidth;heading.classList.add('question-heading-arrive');
    }
    $('#winnerLabel').textContent='JAWABAN BENAR PERTAMA!';$('#winnerName').textContent='—';
    $('.winner-points').innerHTML='+1 <small>POIN</small>';
    const grid=$('#answerGrid');grid.replaceChildren();
    currentQuestion.options.forEach((option,index)=>{
      const card=document.createElement('div');card.className=`answer-option${animateTransition?' answer-arrive':''}`;card.dataset.index=String(index);
      if(animateTransition)card.style.setProperty('--arrival-delay',`${index*85}ms`);
      const letter=document.createElement('span');letter.className='answer-letter';letter.textContent=LETTERS[index];
      const text=document.createElement('span');text.className='answer-text';text.textContent=option;
      card.append(letter,text);grid.append(card);
    });
    $('#timerStatus').textContent='MENUNGGU JAWABAN';
    $('#autoAdvanceText').textContent='Hasil diumumkan saat timer habis';
    $('#timerFill').style.width='100%';$('#timerFill').classList.remove('urgent');
    updateStats();
    lastCountdownSecond=ROUND_SECONDS;
    if(roundNumber>1){addMessage('QUIZ MASTER',`Soal ${String(roundNumber).padStart(2,'0')} dimulai! Jawab A, B, C, atau D.`, 'system');playSfx('start');}
  }

  function parseAnswer(comment){
    const text=String(comment||'').trim();
    let match=text.match(/^([A-D])(?:\b|[\s.!?,]|$)/i);
    if(!match)match=text.match(/\b(?:jawab(?:an)?|answer)\s*[:\-]?\s*([A-D])\b/i);
    return match?match[1].toUpperCase():null;
  }
  function revealCorrect(){
    const correct=currentQuestion.correct;
    document.querySelectorAll('.answer-option').forEach((option,index)=>{
      option.classList.toggle('correct',index===correct);option.classList.toggle('dimmed',index!==correct);
    });
  }
  function processAnswer(name,comment){
    const letter=parseAnswer(comment);if(!letter||phase!=='question')return;
    const selected=LETTERS.indexOf(letter),player=cleanName(name);
    if(selected===currentQuestion.correct){
      if(!firstCorrect){
        firstCorrect={name:player,letter,elapsed:ROUND_SECONDS-remaining,receivedAt:Date.now()};
        $('#timerStatus').textContent='JAWABAN BENAR TERCATAT';
        $('#autoAdvanceText').textContent='Ada jawaban benar — hasil saat timer habis';
        addMessage('QUIZ MASTER','Jawaban benar sudah tercatat. Pemenang diumumkan setelah waktu habis.','system');playSfx('correct');
      }
      return;
    }
    if(!firstCorrect){addMessage('QUIZ MASTER',`${player}, belum tepat — masih ada waktu!`,'system');$('#timerStatus').textContent='JAWABAN SALAH — COBA LAGI';}
  }

  // Accept and display only the first A–D answer from each participant in a round.
  function receiveComment(username,comment,userId=''){
    if(phase!=='question'||isPaused)return;
    const author=cleanName(username),text=String(comment||'').trim(),letter=parseAnswer(text);if(!letter)return;
    const participantKey=String(userId||scoreKey(author));
    if(!answerGate.accept(participantKey))return;
    addMessage(author,text,'comment',letter);updateAnswerCount();processAnswer(author,text);
  }
  function updateAnswerCount(){
    const count=$('#answerCount');if(count)count.textContent=`${answerGate.size} jawaban · 1 per orang`;
  }
  function handleInput(raw){
    const text=raw.trim();if(!text)return;
    const named=text.match(/^@?([\p{L}\p{N}_ .-]{1,20})\s*:\s*(.+)$/u);
    if(named)receiveComment(named[1],named[2]);else receiveComment('KAMU',text);
  }

  function finishQuestion(){
    if(phase!=='question')return;
    phase='result';remaining=0;resultRemaining=RESULT_SECONDS;revealCorrect();playSfx('result');
    if(firstCorrect){
      const key=scoreKey(firstCorrect.name),previous=scores[key];
      scores[key]={name:previous?.name||firstCorrect.name,points:(previous?.points||0)+1,correct:(previous?.correct||0)+1};
      saveScores();
      $('#winnerLabel').textContent='YANG PALING DULU MENJAWAB BENAR';$('#winnerName').textContent=firstCorrect.name;
      $('.winner-points').innerHTML=`+1 <small>${firstCorrect.elapsed.toFixed(1)} DETIK</small>`;
      $('#winnerBanner').classList.remove('no-winner');$('#winnerBanner').classList.add('visible','winner-reveal');
      $('#timerStatus').textContent='HASIL AKHIR';
      addMessage('QUIZ MASTER',`🏆 ${firstCorrect.name} paling dulu menjawab benar! +1 poin.`, 'winner');
    }else{
      const letter=LETTERS[currentQuestion.correct],answer=currentQuestion.options[currentQuestion.correct];
      $('#winnerLabel').textContent='WAKTU HABIS — JAWABANNYA';$('#winnerName').textContent=`${letter} · ${answer}`;
      $('.winner-points').innerHTML='— <small>TANPA PEMENANG</small>';
      $('#winnerBanner').classList.add('visible','no-winner');$('#timerStatus').textContent='WAKTU HABIS';
      addMessage('QUIZ MASTER',`Tidak ada jawaban benar kali ini. Jawaban: ${letter} — ${answer}.`,'system');
    }
    $('#autoAdvanceText').textContent=`Soal baru otomatis dalam ${RESULT_SECONDS} detik`;
    updateStats();
  }

  function renderLeaderboard(){
    const root=$('#leaderboardRows'),empty=$('#leaderboardEmpty'),leaders=sortedScores();root.replaceChildren();
    empty.style.display=leaders.length?'none':'block';
    leaders.slice(0,8).forEach((player,index)=>{
      const row=document.createElement('div');row.className=`score-row${phase==='result'&&firstCorrect&&scoreKey(player.name)===scoreKey(firstCorrect.name)?' recent-winner':''}`;
      const pos=document.createElement('span');pos.className=`score-pos ${index===0?'first':''}`;pos.textContent=String(index+1).padStart(2,'0');
      const user=document.createElement('div');user.className='score-user';
      const avatar=document.createElement('span');avatar.className='score-avatar';avatar.textContent=player.name.slice(0,1).toUpperCase();
      const name=document.createElement('span');name.className='score-name';name.textContent=player.name;user.append(avatar,name);
      const correct=document.createElement('span');correct.className='score-correct';correct.textContent=`${player.correct} benar`;
      const points=document.createElement('span');points.className='score-points';points.textContent=`${player.points} PTS`;
      row.append(pos,user,correct,points);root.append(row);
    });
  }
  function updateStats(){
    $('#roundReadout').textContent=String(roundNumber).padStart(2,'0');
    $('#correctReadout').textContent=totalCorrect().toLocaleString('id-ID');
    const leader=sortedScores()[0];$('#leaderReadout').textContent=leader?leader.name:'—';
    $('#leaderFoot').textContent=leader?`${leader.points} POIN TOTAL`:'BELUM ADA PEMENANG';
    $('#categoryReadout').textContent=currentQuestion?currentQuestion.category:'PENGETAHUAN UMUM';
    renderLeaderboard();
  }
  function updateTimer(){
    const isQuestion=phase==='question';
    const text=isQuestion?formatClock(remaining):'HASIL';
    $('#timeReadout').textContent=text;
    $('#timerCaption').textContent=isQuestion?text:`SOAL BARU ${String(Math.ceil(resultRemaining)).padStart(2,'0')}`;
    const pct=isQuestion?remaining/ROUND_SECONDS:resultRemaining/RESULT_SECONDS;
    $('#timerFill').style.width=`${Math.max(0,pct*100)}%`;
    $('#timerFill').classList.toggle('urgent',isQuestion&&remaining<=8);
  }
  function frame(now){
    const dt=Math.min((now-lastFrame)/1000,.1);lastFrame=now;
    if(!isPaused){
      if(phase==='question'){
        remaining=Math.max(0,remaining-dt);
        const countdownSecond=Math.ceil(remaining);
        if(countdownSecond!==lastCountdownSecond&&countdownSecond<=5&&countdownSecond>0)playSfx('tick');
        lastCountdownSecond=countdownSecond;
        if(remaining===0)finishQuestion();
      }else{
        resultRemaining=Math.max(0,resultRemaining-dt);
        $('#autoAdvanceText').textContent=`Soal baru otomatis dalam ${Math.ceil(resultRemaining)} detik`;
        if(resultRemaining===0)nextQuestion();
      }
    }
    updateTimer();requestAnimationFrame(frame);
  }

  function setHostAvatarState(text, speaking=false) {
    const label=$('#hostAvatarState');if(label)label.textContent=text;
    $('#aiHostAvatar')?.classList.toggle('is-speaking',speaking);
  }
  function loadHostStatus(){
    fetch('/api/host/status',{cache:'no-store'}).then(response=>response.ok?response.json():null).then(data=>{
      hostAiConfigured=Boolean(data?.configured);
      if(!hostAiConfigured){
        $('#hostAudioToggle').title='Suara TTS menggunakan voice browser id-ID bila tersedia. Sapaan otomatis memerlukan GROQ_API_KEY di server.';
        if(!hostAudioEnabled)setHostAvatarState('GROQ BELUM DIATUR');
      }else if(!hostAudioEnabled)setHostAvatarState('HOST SIAP');
    }).catch(()=>{hostAiConfigured=false;if(!hostAudioEnabled)setHostAvatarState('SERVER AI OFFLINE');});
  }
  function speechVoice(){
    if(!('speechSynthesis' in window))return null;
    const voices=window.speechSynthesis.getVoices();
    return voices.find(voice=>/^id([_-]|$)/i.test(voice.lang||''))||null;
  }
  function speakHostText(text){
    return new Promise(resolve=>{
      if(!hostAudioEnabled||!('speechSynthesis' in window)||typeof SpeechSynthesisUtterance==='undefined'){resolve();return;}
      const utterance=new SpeechSynthesisUtterance(text);utterance.lang='id-ID';utterance.rate=1.02;utterance.pitch=1.02;
      const voice=speechVoice();if(voice)utterance.voice=voice;
      let finished=false;
      const done=()=>{if(finished)return;finished=true;$('#aiHostAvatar')?.classList.remove('is-speaking');resolve();};
      utterance.onstart=()=>setHostAvatarState('SEDANG BICARA',true);
      utterance.onend=done;utterance.onerror=done;
      try{window.speechSynthesis.speak(utterance);}catch(_){done();}
    });
  }
  async function requestGeneratedHostLine(job){
    const response=await fetch('/api/host/line',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(job)});
    const data=await response.json().catch(()=>({}));
    if(!response.ok)throw new Error(data.error||'Sapaan AI gagal dibuat.');
    return String(data.text||'').trim();
  }
  async function processHostQueue(){
    if(hostQueueRunning||!hostAudioEnabled)return;
    hostQueueRunning=true;
    try{
      while(hostAudioEnabled&&hostJobs.length){
        const job=hostJobs.shift();let line;
        try{line=job.kind==='moderator'?job.text:await requestGeneratedHostLine(job);}
        catch(error){
          const message=String(error?.message||'AI host belum dapat digunakan.').slice(0,160);
          $('#hostSpeechText').textContent=message;
          setHostAvatarState('AI SEDANG BERMASALAH');
          continue;
        }
        if(!line)continue;
        $('#hostSpeechText').textContent=line;
        await speakHostText(line);
        if(hostAudioEnabled)setHostAvatarState(hostVoiceStatus);
        await new Promise(resolve=>setTimeout(resolve,220));
      }
    }finally{hostQueueRunning=false;if(hostAudioEnabled&&hostJobs.length)void processHostQueue();}
  }
  function enqueueHostEvent(event){
    if(!hostAudioEnabled)return;
    const kind=event?.kind;if(!['member','follow','gift'].includes(kind))return;
    if(!hostAiConfigured){setHostAvatarState('ATUR GROQ API KEY');$('#hostSpeechText').textContent='Sapaan otomatis perlu konfigurasi Groq pada server. Moderator tetap dapat mengetik ucapan.';return;}
    const username=cleanName(event.username),identity=String(event.userId||username).toLocaleLowerCase('id-ID'),key=kind==='gift'&&event.eventId?`gift:${event.eventId}`:`${kind}:${identity}`,now=Date.now();
    for(const [seenKey,at] of seenHostEventKeys)if(now-at>15*60_000)seenHostEventKeys.delete(seenKey);
    if(seenHostEventKeys.has(key))return;
    seenHostEventKeys.set(key,now);
    if(kind!=='gift'&&now-lastAutoHostAt<5000)return;
    if(hostJobs.filter(job=>job.kind!=='moderator').length>=4)return;
    lastAutoHostAt=now;
    hostJobs.push({kind,username,giftName:String(event.giftName||'').slice(0,50),count:Math.min(9999,Math.max(1,Number(event.repeatCount)||1))});
    void processHostQueue();
  }
  $('#hostAudioToggle').addEventListener('click',()=>{
    if(hostAudioEnabled){hostAudioEnabled=false;hostJobs=[];window.speechSynthesis?.cancel();$('#hostAudioToggle').textContent='SUARA OFF';$('#hostAudioToggle').setAttribute('aria-pressed','false');setHostAvatarState(hostAiConfigured?'HOST SIAP':'GROQ BELUM DIATUR');return;}
    if(!('speechSynthesis' in window)||typeof SpeechSynthesisUtterance==='undefined'){
      $('#hostSpeechText').textContent='Browser ini tidak menyediakan fitur text-to-speech.';setHostAvatarState('TTS TIDAK TERSEDIA');return;
    }
    hostAudioEnabled=true;$('#hostAudioToggle').textContent='SUARA ON';$('#hostAudioToggle').setAttribute('aria-pressed','true');
    const voice=speechVoice();
    hostVoiceStatus=voice?'VOICE ID-ID AKTIF':'VOICE DEFAULT AKTIF';
    $('#hostSpeechText').textContent=voice?`Suara host aktif menggunakan voice ${voice.name}.`:'Voice id-ID tidak terdeteksi; browser memakai suara default jika tersedia.';
    setHostAvatarState(hostVoiceStatus);
    hostJobs.push({kind:'moderator',text:'Host VirtualLive siap menyapa penonton.'});void processHostQueue();
  });
  $('#hostSpeakForm').addEventListener('submit',event=>{
    event.preventDefault();const text=$('#hostSpeakInput').value.trim().replace(/\s+/g,' ').slice(0,220);if(!text)return;
    if(!hostAudioEnabled){$('#hostSpeechText').textContent='Aktifkan suara host terlebih dahulu sebelum mengirim ucapan.';setHostAvatarState('SUARA BELUM AKTIF');$('#hostAudioToggle').focus();return;}
    if(hostJobs.length>=8){$('#hostSpeechText').textContent='Antrean host penuh. Tunggu ucapan sebelumnya selesai.';return;}
    hostJobs.push({kind:'moderator',text});$('#hostSpeakInput').value='';void processHostQueue();
  });

  function updateBridgeStatus(data){
    const status=data?.status||'connecting',username=String(data?.username||'disepillya').replace(/^@/,'').toUpperCase();
    document.body.classList.toggle('bridge-connected',status==='connected');
    const labels={disabled:'BRIDGE NONAKTIF',starting:'MEMULAI BRIDGE',connecting:'MENGHUBUNGKAN',connected:`LIVE @${username}`,waiting:`MENUNGGU @${username}`,error:'KONEKSI ERROR',reconnecting:'SERVER TERPUTUS'};
    const label=labels[status]||'STATUS TIDAK DIKETAHUI';
    $('#bridgeStatus').textContent=label;$('#bridgeTopStatus').textContent=label;$('#moderatorBridgeStatus').textContent=label;
    const badge=$('#bridgeStatus');badge.classList.toggle('is-connected',status==='connected');badge.classList.toggle('is-error',status==='error'||status==='disabled'||status==='reconnecting');
    $('#moderatorBridgeStatus').classList.toggle('is-connected',status==='connected');$('#moderatorBridgeStatus').classList.toggle('is-error',status==='error'||status==='disabled'||status==='reconnecting');
    const notices={
      disabled:'Bridge komentar TikTok dinonaktifkan di server. Simulator lokal tetap bisa digunakan.',
      starting:'Bridge TikTok sedang dimulai. Status ini bukan konfirmasi bahwa komentar sudah terhubung.',
      connecting:`Mencoba menghubungkan LIVE publik @${username}. Simulator lokal tetap tersedia.`,
      connected:`Terhubung ke LIVE publik @${username}. Komentar masuk diteruskan ke kuis; bridge ini tidak resmi dan dapat terputus.`,
      waiting:`Menunggu LIVE @${username} aktif atau mencoba sambung ulang. Komentar belum diterima saat ini.`,
      error:'Bridge gagal tersambung. Periksa log server; komentar TikTok belum diterima.',
      reconnecting:'Sambungan ke server kuis terputus. Browser akan mencoba menyambung kembali.'
    };
    $('#bridgeNotice').textContent=notices[status]||notices.connecting;
  }
  function connectTikTokEventStream(){
    if(typeof EventSource==='undefined'){updateBridgeStatus({status:'error'});return;}
    const stream=new EventSource('/api/events');
    stream.addEventListener('status',event=>{try{updateBridgeStatus(JSON.parse(event.data));}catch(_){updateBridgeStatus({status:'error'});}});
    stream.addEventListener('comment',event=>{
      try{const message=JSON.parse(event.data);receiveComment(message.username,message.comment,message.userId);}catch(_){/* Ignore malformed server events. */}
    });
    stream.addEventListener('gift',event=>{
      try{const gift={...JSON.parse(event.data),isLiveGift:true};showGiftReaction(gift);enqueueHostEvent({...gift,kind:'gift'});}catch(_){/* Ignore malformed server events. */}
    });
    stream.addEventListener('host_event',event=>{
      try{enqueueHostEvent(JSON.parse(event.data));}catch(_){/* Ignore malformed server events. */}
    });
    stream.onerror=()=>updateBridgeStatus({status:'reconnecting'});
  }

  $('#commentForm').addEventListener('submit',event=>{event.preventDefault();handleInput(input.value);input.value='';input.focus();});
  document.querySelectorAll('[data-answer]').forEach(button=>button.addEventListener('click',()=>receiveComment('KAMU',button.dataset.answer)));
  function setChatCollapsed(isCollapsed){
    $('#chatPanel').classList.toggle('is-collapsed',isCollapsed);
    const label=isCollapsed?'Buka live chat':'Ciutkan live chat';
    for(const button of [$('#collapseChat'),$('#moderatorChatToggle')]){button.setAttribute('aria-expanded',String(!isCollapsed));button.setAttribute('aria-label',label);button.textContent=isCollapsed?'+':'−';}
    $('#moderatorChatState').textContent=`${isPaused?'Jeda aktif · ':''}${isCollapsed?'Chat diciutkan':'Chat tampil'}`;
  }
  function setPaused(paused){
    isPaused=paused;document.body.classList.toggle('quiz-paused',isPaused);
    const button=$('#pauseToggle');button.setAttribute('aria-pressed',String(isPaused));button.textContent=isPaused?'▶ LANJUT':'Ⅱ JEDA';
    $('#pauseIndicator').hidden=!isPaused;
    if(isPaused){$('#timerStatus').textContent='DIJEDA MODERATOR';$('#autoAdvanceText').textContent='Timer dan pergantian soal dijeda';}
    else if(phase==='question'){$('#timerStatus').textContent=firstCorrect?'JAWABAN BENAR TERCATAT':'MENUNGGU JAWABAN';$('#autoAdvanceText').textContent=firstCorrect?'Ada jawaban benar — hasil saat timer habis':'Hasil diumumkan saat timer habis';}
    else{$('#timerStatus').textContent='HASIL AKHIR';$('#autoAdvanceText').textContent=`Soal baru otomatis dalam ${Math.ceil(resultRemaining)} detik`;}
    setChatCollapsed($('#chatPanel').classList.contains('is-collapsed'));
  }
  $('#collapseChat').addEventListener('click',()=>setChatCollapsed(!$('#chatPanel').classList.contains('is-collapsed')));
  $('#moderatorChatToggle').addEventListener('click',()=>setChatCollapsed(!$('#chatPanel').classList.contains('is-collapsed')));
  $('#pauseToggle').addEventListener('click',()=>setPaused(!isPaused));
  $('#announcementForm').addEventListener('submit',event=>{
    event.preventDefault();
    if(announcementActive){
      announcementActive=false;
      if(document.body.classList.contains('layout-editing'))setAnnouncementPreview(true);
      else{$('#announcementTicker').classList.remove('is-visible','editor-preview');$('#announcementTicker').setAttribute('aria-hidden','true');}
      $('#announcementToggle').textContent='TAYANG';$('#announcementToggle').setAttribute('aria-pressed','false');return;
    }
    const text=$('#announcementInput').value.trim().replace(/\s+/g,' ').slice(0,90);
    if(!text){$('#announcementInput').focus();return;}
    announcementActive=true;$('#announcementTicker').classList.remove('editor-preview');
    const tickerText=`✦ ${text}　•　`,duration=Math.max(16,Math.min(36,text.length*.48));
    $('#announcementText').textContent=tickerText;$('#announcementTextClone').textContent=tickerText;
    $('#announcementTicker').style.setProperty('--ticker-duration',`${duration}s`);
    $('#announcementTicker').classList.add('is-visible');$('#announcementTicker').setAttribute('aria-hidden','false');
    $('#announcementToggle').textContent='HENTIKAN';$('#announcementToggle').setAttribute('aria-pressed','true');
  });
  $('#prizeAmount').addEventListener('change',()=>{try{localStorage.setItem(PRIZE_KEY,String(readPrizeAmount()));}catch(_){/* Prize remains editable for this session. */}});
  $('#newBabakButton').addEventListener('click',openNewBabakDialog);
  $('#cancelBabakButton').addEventListener('click',()=>closeNewBabakDialog(true));
  $('#confirmBabakButton').addEventListener('click',beginNewBabak);
  $('#newBabakDialog').addEventListener('cancel',event=>{event.preventDefault();closeNewBabakDialog(true);});
  $('#babakHistoryButton').addEventListener('click',()=>{renderBabakHistory();$('#babakHistoryDialog').showModal();});
  $('#closeBabakHistory').addEventListener('click',()=>$('#babakHistoryDialog').close());
  if(document.body.classList.contains('broadcast-mode')&&window.innerWidth<561&&window.innerHeight<1000)setChatCollapsed(true);

  const layoutStorageKey='virtuallive.broadcast-layout.v1',layoutPanels=[...document.querySelectorAll('[data-layout-panel]')],appShell=$('.app-shell');
  const minPanelSize={header:[160,54],leaderboard:[145,72],quiz:[220,165],chat:[145,64],moderator:[145,64],donors:[145,110],announcement:[160,24],host:[130,80]};
  function layoutBounds(){const rect=appShell.getBoundingClientRect();return {left:rect.left,top:rect.top,width:rect.width,height:rect.height};}
  function applyPanelRect(panel,x,y,width,height){
    const bounds=layoutBounds(),min=minPanelSize[panel.dataset.layoutPanel]||[120,64];
    width=Math.max(Math.min(min[0],bounds.width),Math.min(width,bounds.width));height=Math.max(Math.min(min[1],bounds.height),Math.min(height,bounds.height));
    x=Math.max(0,Math.min(x,bounds.width-width));y=Math.max(0,Math.min(y,bounds.height-height));
    panel.style.position='absolute';panel.style.left=`${x/bounds.width*100}%`;panel.style.top=`${y/bounds.height*100}%`;
    panel.style.right='auto';panel.style.bottom='auto';panel.style.width=`${width/bounds.width*100}%`;panel.style.height=`${height/bounds.height*100}%`;
  }
  function restoreLayout(){
    if(!document.body.classList.contains('broadcast-mode'))return;
    try{
      const saved=JSON.parse(localStorage.getItem(layoutStorageKey)||'{}');
      for(const panel of layoutPanels){const item=saved[panel.dataset.layoutPanel];if(item&&[item.x,item.y,item.w,item.h].every(Number.isFinite)){
        const bounds=layoutBounds();applyPanelRect(panel,item.x*bounds.width,item.y*bounds.height,item.w*bounds.width,item.h*bounds.height);
      }}
    }catch(_){/* Ignore invalid local layout data. */}
  }
  function saveLayout(){
    const bounds=layoutBounds(),saved={};
    for(const panel of layoutPanels){const rect=panel.getBoundingClientRect();if(!rect.width||!rect.height)continue;saved[panel.dataset.layoutPanel]={x:(rect.left-bounds.left)/bounds.width,y:(rect.top-bounds.top)/bounds.height,w:rect.width/bounds.width,h:rect.height/bounds.height};}
    try{localStorage.setItem(layoutStorageKey,JSON.stringify(saved));}catch(_){notify('Layout tampil, tetapi tidak bisa disimpan browser.',true);}
  }
  function installLayoutHandles(){
    for(const panel of layoutPanels){
      if(panel.querySelector('.layout-drag-grip'))continue;
      const grip=document.createElement('button');grip.type='button';grip.className='layout-drag-grip';grip.textContent='⠿';grip.setAttribute('aria-label',`Geser panel ${panel.dataset.layoutPanel}`);
      const resize=document.createElement('button');resize.type='button';resize.className='layout-resize-handle';resize.textContent='◢';resize.setAttribute('aria-label',`Ubah ukuran panel ${panel.dataset.layoutPanel}`);
      grip.addEventListener('pointerdown',event=>startLayoutGesture(event,panel,'move'));
      resize.addEventListener('pointerdown',event=>startLayoutGesture(event,panel,'resize'));
      panel.append(grip,resize);
    }
  }
  let layoutGesture=null;
  function startLayoutGesture(event,panel,mode){
    if(event.button!==undefined&&event.button!==0)return;
    event.preventDefault();event.stopPropagation();
    const bounds=layoutBounds(),rect=panel.getBoundingClientRect();
    for(const item of layoutPanels)item.classList.toggle('is-selected',item===panel);
    layoutGesture={panel,mode,pointerId:event.pointerId,startX:event.clientX,startY:event.clientY,x:rect.left-bounds.left,y:rect.top-bounds.top,width:rect.width,height:rect.height,bounds};
    event.currentTarget.setPointerCapture?.(event.pointerId);
  }
  document.addEventListener('pointermove',event=>{
    const gesture=layoutGesture;if(!gesture||event.pointerId!==gesture.pointerId)return;
    const dx=event.clientX-gesture.startX,dy=event.clientY-gesture.startY,{width,height}=gesture.bounds;
    if(gesture.mode==='move')applyPanelRect(gesture.panel,gesture.x+dx,gesture.y+dy,gesture.width,gesture.height);
    else applyPanelRect(gesture.panel,gesture.x,gesture.y,gesture.width+dx,gesture.height+dy);
  });
  function endLayoutGesture(event){if(!layoutGesture||(event?.pointerId!==undefined&&event.pointerId!==layoutGesture.pointerId))return;layoutGesture=null;saveLayout();}
  document.addEventListener('pointerup',endLayoutGesture);document.addEventListener('pointercancel',endLayoutGesture);
  function setAnnouncementPreview(enabled){
    const ticker=$('#announcementTicker');
    if(enabled&&!announcementActive){$('#announcementText').textContent='✦ PREVIEW PENGUMUMAN　•　';$('#announcementTextClone').textContent='✦ PREVIEW PENGUMUMAN　•　';ticker.classList.add('editor-preview','is-visible');ticker.setAttribute('aria-hidden','true');}
    else if(!enabled&&ticker.classList.contains('editor-preview')){ticker.classList.remove('editor-preview','is-visible');ticker.setAttribute('aria-hidden','true');}
  }
  function setLayoutEditing(enabled){
    if(!document.body.classList.contains('broadcast-mode'))return;
    document.body.classList.toggle('layout-editing',enabled);
    $('#editLayoutToggle').setAttribute('aria-pressed',String(enabled));
    $('#layoutEditToolbar').setAttribute('aria-hidden',String(!enabled));
    if(enabled){setAnnouncementPreview(true);installLayoutHandles();}
    else{for(const panel of layoutPanels)panel.classList.remove('is-selected');saveLayout();setAnnouncementPreview(false);}
  }
  restoreLayout();
  $('#editLayoutToggle').addEventListener('click',()=>setLayoutEditing(!document.body.classList.contains('layout-editing')));
  $('#layoutDone').addEventListener('click',()=>setLayoutEditing(false));
  $('#layoutReset').addEventListener('click',()=>{try{localStorage.removeItem(layoutStorageKey);}catch(_){}location.reload();});
  if(pageParams.get('edit')==='1')setLayoutEditing(true);
  $('#audioToggle').addEventListener('click',toggleAudio);
  $('#fullscreenToggle').addEventListener('click',toggleFullscreen);
  $('#giftTest').addEventListener('click',()=>showGiftReaction({username:'TESTER',giftName:'Rose',repeatCount:1}));
  document.addEventListener('fullscreenchange',updateFullscreenButton);
  updateFullscreenButton();

  // Add ?live=1 for a clean portrait-friendly broadcast screen (question, timer and scoreboard only).
  window.VirtualLiveQuiz={receiveComment};
  loadBabakState();renderBabakHistory();
  connectTikTokEventStream();
  loadHostStatus();
  deck=shuffle(QUESTIONS.map((_,index)=>index));nextQuestion();
  addMessage('QUIZ MASTER','Quiz Arena berjalan otomatis. Jawab A, B, C, atau D sebelum timer habis.','system');
  updateTimer();requestAnimationFrame(frame);
})();
