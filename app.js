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
  const SCORE_KEY='virtuallive.quiz.scores.v1';
  const ROUND_SECONDS=30,RESULT_SECONDS=7;
  const $=selector=>document.querySelector(selector);
  const feed=$('#chatFeed'),input=$('#commentInput'),toast=$('#toast');
  let scores=loadScores(),deck=[],deckPosition=0,roundNumber=0,currentQuestion=null;
  let phase='question',remaining=ROUND_SECONDS,resultRemaining=RESULT_SECONDS,firstCorrect=null;
  let lastFrame=performance.now(),toastTimer;

  if(new URLSearchParams(location.search).get('live')==='1')document.body.classList.add('broadcast-mode');

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
  function sortedScores(){return Object.values(scores).sort((a,b)=>b.points-a.points||a.name.localeCompare(b.name,'id-ID'));}
  function totalCorrect(){return Object.values(scores).reduce((sum,item)=>sum+item.points,0);}
  function timestamp(){return new Date().toLocaleTimeString('id-ID',{hour:'2-digit',minute:'2-digit'});}
  function formatClock(seconds){const n=Math.max(0,Math.ceil(seconds));return `${String(Math.floor(n/60)).padStart(2,'0')}:${String(n%60).padStart(2,'0')}`;}

  function addMessage(name,text,kind='comment',letter=''){
    const row=document.createElement('div');row.className=`chat-message ${kind==='system'?'system':''}`;
    const avatar=document.createElement('span');avatar.className=`chat-avatar ${kind==='system'?'is-system':''} ${kind==='winner'?'is-winner':''}`;
    avatar.textContent=kind==='system'?'✦':kind==='winner'?'★':cleanName(name).slice(0,1).toUpperCase();
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
  function shuffle(items){
    const array=[...items];
    for(let i=array.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[array[i],array[j]]=[array[j],array[i]];}
    return array;
  }
  function nextQuestion(){
    if(deckPosition>=deck.length){
      const previous=deck.length?deck[deck.length-1]:-1;deck=shuffle(QUESTIONS.map((_,i)=>i));
      if(deck.length>1&&deck[0]===previous)[deck[0],deck[1]]=[deck[1],deck[0]];
      deckPosition=0;
    }
    currentQuestion=QUESTIONS[deck[deckPosition++]];roundNumber++;phase='question';
    remaining=ROUND_SECONDS;resultRemaining=RESULT_SECONDS;firstCorrect=null;
    $('#questionText').textContent=currentQuestion.question;
    $('#questionTag').textContent=currentQuestion.category;
    $('#questionNumber').textContent=`/ ${String(roundNumber).padStart(2,'0')}`;
    $('#winnerBanner').classList.remove('visible','no-winner');
    $('#winnerLabel').textContent='JAWABAN BENAR PERTAMA!';$('#winnerName').textContent='—';
    $('.winner-points').innerHTML='+1 <small>POIN</small>';
    const grid=$('#answerGrid');grid.replaceChildren();
    currentQuestion.options.forEach((option,index)=>{
      const card=document.createElement('div');card.className='answer-option';card.dataset.index=String(index);
      const letter=document.createElement('span');letter.className='answer-letter';letter.textContent=LETTERS[index];
      const text=document.createElement('span');text.className='answer-text';text.textContent=option;
      card.append(letter,text);grid.append(card);
    });
    $('#timerStatus').textContent='MENUNGGU JAWABAN';
    $('#autoAdvanceText').textContent='Hasil diumumkan saat timer habis';
    $('#timerFill').style.width='100%';$('#timerFill').classList.remove('urgent');
    updateStats();
    if(roundNumber>1)addMessage('QUIZ MASTER',`Soal ${String(roundNumber).padStart(2,'0')} dimulai! Jawab A, B, C, atau D.`, 'system');
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
        addMessage('QUIZ MASTER','Jawaban benar sudah tercatat. Pemenang diumumkan setelah waktu habis.','system');
      }
      return;
    }
    if(!firstCorrect){addMessage('QUIZ MASTER',`${player}, belum tepat — masih ada waktu!`,'system');$('#timerStatus').textContent='JAWABAN SALAH — COBA LAGI';}
  }

  // Called in arrival order by the simulator or, later, by the TikTok comment adapter.
  function receiveComment(username,comment){
    const author=cleanName(username),text=String(comment||'').trim();if(!text)return;
    const letter=parseAnswer(text);addMessage(author,text,'comment',letter||'');processAnswer(author,text);
  }
  function handleInput(raw){
    const text=raw.trim();if(!text)return;
    const named=text.match(/^@?([\p{L}\p{N}_ .-]{1,20})\s*:\s*(.+)$/u);
    if(named)receiveComment(named[1],named[2]);else receiveComment('KAMU',text);
  }

  function finishQuestion(){
    if(phase!=='question')return;
    phase='result';remaining=0;resultRemaining=RESULT_SECONDS;revealCorrect();
    if(firstCorrect){
      const key=scoreKey(firstCorrect.name),previous=scores[key];
      scores[key]={name:previous?.name||firstCorrect.name,points:(previous?.points||0)+1,correct:(previous?.correct||0)+1};
      saveScores();
      $('#winnerLabel').textContent='YANG PALING DULU MENJAWAB BENAR';$('#winnerName').textContent=firstCorrect.name;
      $('.winner-points').innerHTML=`+1 <small>${firstCorrect.elapsed.toFixed(1)} DETIK</small>`;
      $('#winnerBanner').classList.remove('no-winner');$('#winnerBanner').classList.add('visible');
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
      const row=document.createElement('div');row.className='score-row';
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
    if(phase==='question'){
      remaining=Math.max(0,remaining-dt);
      if(remaining===0)finishQuestion();
    }else{
      resultRemaining=Math.max(0,resultRemaining-dt);
      $('#autoAdvanceText').textContent=`Soal baru otomatis dalam ${Math.ceil(resultRemaining)} detik`;
      if(resultRemaining===0)nextQuestion();
    }
    updateTimer();requestAnimationFrame(frame);
  }

  function updateBridgeStatus(data){
    const status=data?.status||'connecting',username=String(data?.username||'disepillya').replace(/^@/,'').toUpperCase();
    const labels={disabled:'BRIDGE NONAKTIF',starting:'MEMULAI BRIDGE',connecting:'MENGHUBUNGKAN',connected:`LIVE @${username}`,waiting:`MENUNGGU @${username}`,error:'KONEKSI ERROR',reconnecting:'SERVER TERPUTUS'};
    const label=labels[status]||'STATUS TIDAK DIKETAHUI';
    $('#bridgeStatus').textContent=label;$('#bridgeTopStatus').textContent=label;
    const badge=$('#bridgeStatus');badge.classList.toggle('is-connected',status==='connected');badge.classList.toggle('is-error',status==='error'||status==='disabled'||status==='reconnecting');
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
      try{const message=JSON.parse(event.data);receiveComment(message.username,message.comment);}catch(_){/* Ignore malformed server events. */}
    });
    stream.onerror=()=>updateBridgeStatus({status:'reconnecting'});
  }

  $('#commentForm').addEventListener('submit',event=>{event.preventDefault();handleInput(input.value);input.value='';input.focus();});
  document.querySelectorAll('[data-answer]').forEach(button=>button.addEventListener('click',()=>receiveComment('KAMU',button.dataset.answer)));
  $('#clearChat').addEventListener('click',()=>{feed.replaceChildren();addMessage('QUIZ MASTER','Chat dibersihkan. Kuis tetap berjalan otomatis.','system');});

  // Add ?live=1 for a clean portrait-friendly broadcast screen (question, timer and scoreboard only).
  window.VirtualLiveQuiz={receiveComment};
  connectTikTokEventStream();
  deck=shuffle(QUESTIONS.map((_,index)=>index));nextQuestion();
  addMessage('QUIZ MASTER','Quiz Arena berjalan otomatis. Jawab A, B, C, atau D sebelum timer habis.','system');
  updateTimer();requestAnimationFrame(frame);
})();
