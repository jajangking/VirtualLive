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
    { category:'ASTRONOMI', question:'Planet terdekat dengan Matahari adalah…', options:['Venus','Merkurius','Mars','Bumi'], correct:1 },
    { category:'ASTRONOMI', question:'Satelit alami Bumi adalah…', options:['Titan','Bulan','Europa','Phobos'], correct:1 },
    { category:'FISIKA', question:'Satuan energi dalam sistem SI adalah…', options:['Watt','Joule','Newton','Pascal'], correct:1 },
    { category:'KIMIA', question:'Simbol unsur oksigen pada tabel periodik adalah…', options:['Ox','O','Og','Om'], correct:1 },
    { category:'SAINS', question:'Bagian tumbuhan yang terutama menyerap air dari tanah adalah…', options:['Daun','Bunga','Akar','Batang'], correct:2 },
    { category:'GEOGRAFI', question:'Apa ibu kota Kanada?', options:['Toronto','Montreal','Ottawa','Vancouver'], correct:2 },
    { category:'GEOGRAFI', question:'Benua terkecil berdasarkan luas daratan adalah…', options:['Eropa','Australia','Antarktika','Amerika Selatan'], correct:1 },
    { category:'GEOGRAFI', question:'Garis khayal yang membagi Bumi menjadi belahan utara dan selatan adalah…', options:['Garis Balik Utara','Meridian Utama','Khatulistiwa','Garis Tanggal Internasional'], correct:2 },
    { category:'SEJARAH INDONESIA', question:'Hari Sumpah Pemuda diperingati setiap tanggal…', options:['20 Mei','1 Juni','28 Oktober','10 November'], correct:2 },
    { category:'SEJARAH INDONESIA', question:'Candi Borobudur berada di provinsi…', options:['Jawa Barat','Jawa Tengah','Jawa Timur','DI Yogyakarta'], correct:1 },
    { category:'SEJARAH DUNIA', question:'Tembok Besar yang terkenal berada di negara…', options:['India','Jepang','Tiongkok','Mongolia'], correct:2 },
    { category:'BAHASA', question:'Kata baku yang tepat adalah…', options:['Resiko','Risiko','Resikko','Rissiko'], correct:1 },
    { category:'MATEMATIKA', question:'Besar sudut siku-siku adalah…', options:['45 derajat','90 derajat','120 derajat','180 derajat'], correct:1 },
    { category:'MATEMATIKA', question:'Hasil dari 12 dikali 8 adalah…', options:['86','92','96','108'], correct:2 },
    { category:'DUNIA HEWAN', question:'Hewan terbesar yang diketahui hidup saat ini adalah…', options:['Gajah Afrika','Paus biru','Hiu paus','Jerapah'], correct:1 },
    { category:'DUNIA HEWAN', question:'Serangga dewasa pada umumnya memiliki berapa kaki?', options:['Empat','Enam','Delapan','Sepuluh'], correct:1 },
    { category:'OLAHRAGA', question:'Olahraga yang menggunakan kok atau shuttlecock adalah…', options:['Tenis meja','Bulu tangkis','Squash','Bola voli'], correct:1 },
    { category:'SENI', question:'Alat musik tradisional Sunda yang dimainkan dengan cara dipetik adalah…', options:['Kecapi','Kolintang','Sasando','Tifa'], correct:0 },
    { category:'SENI', question:'Alat musik sasando berasal dari Pulau Rote di provinsi…', options:['Maluku','Nusa Tenggara Timur','Sulawesi Utara','Bali'], correct:1 },
    { category:'SASTRA', question:'Siapa penulis novel “Laskar Pelangi”?', options:['Tere Liye','Andrea Hirata','Pramoedya Ananta Toer','Dee Lestari'], correct:1 },
    { category:'SAINS', question:'Air murni mendidih pada suhu sekitar berapa di permukaan laut?', options:['0°C','50°C','100°C','150°C'], correct:2 },
    { category:'SEJARAH INDONESIA', question:'Siapa presiden pertama Republik Indonesia?', options:['Soeharto','B. J. Habibie','Soekarno','Abdurrahman Wahid'], correct:2 },
    { category:'GEOGRAFI', question:'Apa ibu kota Australia?', options:['Sydney','Melbourne','Canberra','Perth'], correct:2 },
    { category:'GEOGRAFI', question:'Ankara dan Istanbul merupakan kota penting di negara…', options:['Yunani','Turki','Mesir','Iran'], correct:1 },
    { category:'MATEMATIKA', question:'Berapa meter dalam satu kilometer?', options:['100','500','1.000','10.000'], correct:2 },
    { category:'TUBUH MANUSIA', question:'Organ utama yang memompa darah ke seluruh tubuh adalah…', options:['Paru-paru','Ginjal','Jantung','Lambung'], correct:2 },
    { category:'BAHASA', question:'Sinonim kata “lekas” adalah…', options:['Lambat','Segera','Jarang','Ragu'], correct:1 },
    { category:'GEOGRAFI', question:'Samudra yang berada di antara Afrika, Asia, dan Australia adalah…', options:['Samudra Atlantik','Samudra Arktik','Samudra Hindia','Samudra Selatan'], correct:2 },
    { category:'SAINS', question:'Gas terbanyak di atmosfer Bumi adalah…', options:['Oksigen','Karbon dioksida','Nitrogen','Hidrogen'], correct:2 },
  ];
  const LETTERS=['A','B','C','D'];
  const SCORE_KEY='virtuallive.quiz.scores.v1',BABAK_KEY='virtuallive.quiz.babak.v1',BABAK_HISTORY_KEY='virtuallive.quiz.babak-history.v1',PRIZE_KEY='virtuallive.quiz.babak-prize.v1',QUESTION_DURATION_KEY='virtuallive.quiz.question-duration.v1',QUESTIONS_PER_BABAK_KEY='virtuallive.quiz.questions-per-babak.v1',PREPARED_AI_QUESTIONS_KEY='virtuallive.quiz.prepared-ai-questions.v2',LOCAL_QUESTION_HISTORY_KEY='virtuallive.quiz.local-question-history.v1',QUIZ_CATEGORY_KEY='virtuallive.quiz.ai-category.v2',QUIZ_DIFFICULTY_KEY='virtuallive.quiz.ai-difficulty.v1';
  const DEFAULT_QUESTION_SECONDS=30,MIN_QUESTION_SECONDS=10,MAX_QUESTION_SECONDS=180,DEFAULT_QUESTIONS_PER_BABAK=10,MAX_QUESTIONS_PER_BABAK=20,RESULT_SECONDS=7;
  const $=selector=>document.querySelector(selector);
  const answerGate=window.VirtualLiveAnswerGate.createFirstAnswerGate();
  const feed=$('#chatFeed'),input=$('#commentInput'),toast=$('#toast');
  let questionDuration=loadQuestionDuration(),activeQuestionDuration=questionDuration;
  let questionsPerBabak=loadQuestionsPerBabak(),activeQuestionsPerBabak=questionsPerBabak;
  let questionBank=QUESTIONS,preparedAiQuestions=loadPreparedAiQuestions();
  let scores=loadScores(),deck=[],deckPosition=0,roundNumber=0,currentQuestion=null,babakNumber=1,babakHistory=[],pendingBabakArchive=null,wasPausedBeforeBabakDialog=false;
  const donorTotals=new Map();
  let phase='question',remaining=activeQuestionDuration,resultRemaining=RESULT_SECONDS,firstCorrect=null,isPaused=false,announcementActive=false,resultSequenceTimer=null,isStartingBabak=false,lastWrongSfxAt=0;
  let lastFrame=performance.now(),toastTimer,quizMotionTimer;
  let audioContext=null,masterGain=null,bgmGain=null,sfxGain=null,bgmTimer=null,bgmStep=0,audioEnabled=false,lastCountdownSecond=activeQuestionDuration,giftTimer=null;
  let hostAudioEnabled=false,hostAiConfigured=false,groqKeySource='none',hostJobs=[],hostQueueRunning=false,lastAutoHostAt=0,hostVoiceStatus='EDGE TTS · BRIAN';
  let hostPlaybackContext=null,hostPlaybackSource=null;
  const seenHostEventKeys=new Map();

  const pageParams=new URLSearchParams(location.search);
  const dashboardMode=pageParams.get('dashboard')==='1'&&pageParams.get('live')!=='1'&&pageParams.get('edit')!=='1';
  if(!dashboardMode)document.body.classList.add('broadcast-mode');

  function cleanName(value){
    return String(value||'').replace(/[\u0000-\u001f\u007f]/g,'').replace(/^@/,'').trim().replace(/\s+/g,' ').slice(0,20)||'PENONTON';
  }
  function normalizeQuestionDuration(value){
    const seconds=Number(value);
    if(!Number.isFinite(seconds))return DEFAULT_QUESTION_SECONDS;
    return Math.max(MIN_QUESTION_SECONDS,Math.min(MAX_QUESTION_SECONDS,Math.round(seconds/5)*5));
  }
  function loadQuestionDuration(){
    try{const stored=localStorage.getItem(QUESTION_DURATION_KEY);return stored===null?DEFAULT_QUESTION_SECONDS:normalizeQuestionDuration(stored);}
    catch(_){return DEFAULT_QUESTION_SECONDS;}
  }
  function saveQuestionDuration(){
    try{localStorage.setItem(QUESTION_DURATION_KEY,String(questionDuration));}
    catch(_){notify('Durasi tersimpan untuk sesi ini, tetapi browser tidak bisa menyimpannya.');}
  }
  function normalizeQuestionCount(value){
    const count=Math.floor(Number(value));
    return Number.isFinite(count)?Math.max(1,Math.min(MAX_QUESTIONS_PER_BABAK,count)):DEFAULT_QUESTIONS_PER_BABAK;
  }
  function loadQuestionsPerBabak(){
    try{const stored=localStorage.getItem(QUESTIONS_PER_BABAK_KEY);return stored===null?DEFAULT_QUESTIONS_PER_BABAK:normalizeQuestionCount(stored);}
    catch(_){return DEFAULT_QUESTIONS_PER_BABAK;}
  }
  function loadPreparedAiQuestions(){
    try{
      const saved=JSON.parse(localStorage.getItem(PREPARED_AI_QUESTIONS_KEY)||'null');
      if(!Array.isArray(saved)||saved.length!==questionsPerBabak)return null;
      const valid=saved.every(question=>question&&typeof question.category==='string'&&typeof question.question==='string'&&Array.isArray(question.options)&&question.options.length===4&&question.options.every(option=>typeof option==='string'&&option.trim())&&Number.isInteger(question.correct)&&question.correct>=0&&question.correct<4);
      return valid?saved:null;
    }catch(_){return null;}
  }
  function saveQuestionsPerBabak(){
    try{localStorage.setItem(QUESTIONS_PER_BABAK_KEY,String(questionsPerBabak));}
    catch(_){notify('Jumlah soal tersimpan untuk sesi ini, tetapi browser tidak bisa menyimpannya.');}
  }
  function clearPreparedAiQuestions(){
    preparedAiQuestions=null;
    try{localStorage.removeItem(PREPARED_AI_QUESTIONS_KEY);}catch(_){/* Memory state is already cleared. */}
  }
  function questionFingerprint(value){
    return String(value||'').normalize('NFKC').toLocaleLowerCase('id-ID').replace(/[^\p{L}\p{N}]+/gu,' ').trim();
  }
  function readLocalQuestionHistory(){
    try{
      const saved=JSON.parse(localStorage.getItem(LOCAL_QUESTION_HISTORY_KEY)||'[]');
      return Array.isArray(saved)?[...new Set(saved.filter(item=>typeof item==='string').map(questionFingerprint).filter(Boolean))].slice(-QUESTIONS.length):[];
    }catch(_){return [];}
  }
  function rememberQuestionBatch(batch){
    const recent=readLocalQuestionHistory();
    for(const item of batch){
      const fingerprint=questionFingerprint(item?.question);
      if(!fingerprint)continue;
      const existing=recent.indexOf(fingerprint);if(existing>=0)recent.splice(existing,1);
      recent.push(fingerprint);
    }
    try{localStorage.setItem(LOCAL_QUESTION_HISTORY_KEY,JSON.stringify(recent.slice(-QUESTIONS.length)));}catch(_){/* Keep the in-memory batch usable. */}
  }
  function generateFallbackQuestionBatch(count){
    const recent=new Set([...readLocalQuestionHistory(),...(Array.isArray(preparedAiQuestions)?preparedAiQuestions.map(item=>questionFingerprint(item?.question)).filter(Boolean):[])]);
    const fresh=shuffle(QUESTIONS.filter(item=>!recent.has(questionFingerprint(item.question))));
    const recycled=shuffle(QUESTIONS.filter(item=>recent.has(questionFingerprint(item.question))));
    const selected=[...fresh,...recycled].slice(0,count);
    return selected.map(item=>{
      const order=shuffle([0,1,2,3]);
      return {...item,options:order.map(index=>item.options[index]),correct:order.indexOf(item.correct)};
    });
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
      const prize=document.createElement('span');prize.className='history-prize';
      const questionCount=Number.isFinite(record.questionsPlayed)?`${record.questionsPlayed}/${record.questionsPlanned||0} soal · `:'';
      prize.textContent=`${questionCount}${record.winner?`Hadiah ${formatRupiah(record.prizeAmount)}`:'Tanpa hadiah'}`;
      const top=document.createElement('div');top.className='history-entry-top';top.append(title,date);item.append(top,summary,prize);list.append(item);
    }
  }
  function openNewBabakDialog(){
    const podium=sortedScores().slice(0,3).map(player=>({name:player.name,points:player.points,correct:player.correct}));
    pendingBabakArchive={number:babakNumber,archivedAt:new Date().toISOString(),podium,prizeAmount:readPrizeAmount(),winner:podium[0]?.name||'',questionsPlayed:roundNumber,questionsPlanned:activeQuestionsPerBabak};
    try{localStorage.setItem(PRIZE_KEY,String(pendingBabakArchive.prizeAmount));}catch(_){/* The current prize remains active for this round. */}
    const questionSummary=`Soal babak ini: ${roundNumber}/${activeQuestionsPerBabak}.`;
    const nextQuestionSource=preparedAiQuestions?.length===questionsPerBabak?'Batch soal yang disiapkan siap dipakai.':hostAiConfigured?'Soal Groq AI akan dibuat otomatis; jika kuota habis, generator lokal anti-ulangan mengambil alih.':'Groq belum siap; generator lokal anti-ulangan akan dipakai.';
    const summary=podium[0]?`Juara 1: ${podium[0].name} (${podium[0].points} poin). Hadiah yang dicatat: ${formatRupiah(pendingBabakArchive.prizeAmount)}. ${questionSummary} ${nextQuestionSource} Skor babak ini akan diarsipkan, lalu papan aktif direset.`:`${questionSummary} ${nextQuestionSource} Belum ada skor. Babak baru tetap dimulai dan papan skor aktif akan kosong.`;
    $('#newBabakSummary').textContent=summary;
    wasPausedBeforeBabakDialog=isPaused;if(!isPaused)setPaused(true);
    $('#newBabakDialog').showModal();
  }
  function closeNewBabakDialog(resume){
    if(isStartingBabak&&resume)return;
    const dialog=$('#newBabakDialog');if(dialog.open)dialog.close();pendingBabakArchive=null;
    if(resume&&!wasPausedBeforeBabakDialog&&isPaused)setPaused(false);
  }
  async function beginNewBabak(){
    if(!pendingBabakArchive||isStartingBabak)return;
    isStartingBabak=true;
    const confirm=$('#confirmBabakButton'),cancel=$('#cancelBabakButton'),summary=$('#newBabakSummary');
    confirm.disabled=true;cancel.disabled=true;
    const archive=pendingBabakArchive,count=questionsPerBabak;
    let nextBatch=null,source='Groq AI',fallbackReason='';
    summary.textContent=`Menyiapkan ${count} pertanyaan resmi untuk babak baru…`;
    try{
      if(preparedAiQuestions?.length===count){nextBatch=preparedAiQuestions;source='batch soal tersimpan';clearPreparedAiQuestions();}
      else if(await loadHostStatus()){
        try{nextBatch=await requestGeneratedQuestionBatch(count,$('#quizCategoryInput').value.trim()||'Pengetahuan Umum',$('#quizDifficultyInput').value);}
        catch(error){fallbackReason=String(error?.message||'layanan Groq tidak tersedia');nextBatch=generateFallbackQuestionBatch(count);source='generator lokal';}
      }else{fallbackReason='Groq belum dikonfigurasi';nextBatch=generateFallbackQuestionBatch(count);source='generator lokal';}
      rememberQuestionBatch(nextBatch);
      babakHistory.unshift(archive);babakHistory=babakHistory.slice(0,50);babakNumber++;
      saveBabakState();scores={};saveScores();roundNumber=0;activeQuestionsPerBabak=count;
      questionBank=nextBatch;deck=shuffle(questionBank.map((_,index)=>index));deckPosition=0;
      closeNewBabakDialog(false);setPaused(false);nextQuestion();renderBabakHistory();
      addMessage('QUIZ MASTER',source==='generator lokal'?'Babak baru memakai generator lokal dengan pengacakan dan anti-ulangan.':`Babak baru memakai ${source}.`,'system');
      if(fallbackReason)notify(`Groq ${fallbackReason}; generator lokal anti-ulangan dipakai.`,true);
    }catch(error){
      summary.textContent=`Gagal menyiapkan babak: ${String(error?.message||error)}. Coba lagi.`;
    }finally{
      isStartingBabak=false;confirm.disabled=false;cancel.disabled=false;
    }
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
    body.append(meta,message);row.append(avatar,body);
    const selectionTag=document.createElement('span');selectionTag.className='winner-selection-tag';selectionTag.textContent='PILIHAN BENAR';selectionTag.hidden=true;row.append(selectionTag);
    feed.append(row);
    while(feed.children.length>55){
      const removable=[...feed.children].find(item=>item!==firstCorrect?.row);
      if(!removable)break;
      removable.remove();
    }
    feed.scrollTop=feed.scrollHeight;
    return row;
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
    masterGain.gain.value=.55;bgmGain.gain.value=.23;sfxGain.gain.value=.4;
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
  function sweepTone(startFrequency,endFrequency,duration,when,output,level=.035,wave='triangle'){
    if(!audioContext||!output)return;
    const oscillator=audioContext.createOscillator(),envelope=audioContext.createGain(),filter=audioContext.createBiquadFilter();
    oscillator.type=wave;oscillator.frequency.setValueAtTime(startFrequency,when);oscillator.frequency.exponentialRampToValueAtTime(Math.max(20,endFrequency),when+duration);
    filter.type='lowpass';filter.frequency.setValueAtTime(1500,when);filter.Q.setValueAtTime(.4,when);
    envelope.gain.setValueAtTime(.0001,when);envelope.gain.linearRampToValueAtTime(level,when+.035);envelope.gain.exponentialRampToValueAtTime(.0001,when+duration);
    oscillator.connect(filter);filter.connect(envelope);envelope.connect(output);oscillator.start(when);oscillator.stop(when+duration+.04);
  }
  function playPadChord(notes,when,duration,output){
    if(!audioContext||!output)return;
    for(const [index,note] of notes.entries()){
      const oscillator=audioContext.createOscillator(),envelope=audioContext.createGain(),filter=audioContext.createBiquadFilter();
      oscillator.type='sine';oscillator.frequency.setValueAtTime(note,when);oscillator.detune.setValueAtTime(index===1?-3:index===2?3:0,when);
      filter.type='lowpass';filter.frequency.setValueAtTime(1050,when);filter.Q.setValueAtTime(.35,when);
      envelope.gain.setValueAtTime(.0001,when);envelope.gain.linearRampToValueAtTime(.018,when+.24);
      envelope.gain.setValueAtTime(.013,when+Math.max(.3,duration-.32));envelope.gain.exponentialRampToValueAtTime(.0001,when+duration);
      oscillator.connect(filter);filter.connect(envelope);envelope.connect(output);oscillator.start(when);oscillator.stop(when+duration+.04);
    }
  }
  function scheduleBgm(){
    if(!audioEnabled||!audioContext)return;
    const chords=[
      {root:110,pad:[220,261.63,329.63],melody:[440,523.25,587.33,523.25]},
      {root:87.31,pad:[174.61,220,261.63],melody:[392,440,523.25,440]},
      {root:130.81,pad:[196,261.63,329.63],melody:[523.25,587.33,659.25,587.33]},
      {root:98,pad:[196,246.94,293.66],melody:[440,493.88,587.33,493.88]},
    ];
    const urgent=phase==='question'&&remaining<=8,beat=urgent?.39:.535,step=bgmStep%16,chord=chords[Math.floor(step/4)],beatInChord=step%4,now=audioContext.currentTime;
    if(beatInChord===0)playPadChord(chord.pad,now,beat*3.8,bgmGain);
    tone(chord.root,.34,now,bgmGain,.046,'triangle');
    const melody=chord.melody[beatInChord];
    if(beatInChord===0||beatInChord===2)tone(melody,urgent?.2:.27,now+.035,bgmGain,urgent?.034:.027,'sine');
    if(urgent&&beatInChord===3)tone(melody*2,.14,now+.15,bgmGain,.012,'triangle');
    bgmStep++;bgmTimer=setTimeout(scheduleBgm,beat*1000);
  }
  function playSfx(kind){
    if(!audioEnabled||!audioContext)return;
    const now=audioContext.currentTime;
    if(kind==='wrong'){
      sweepTone(620,165,.62,now,sfxGain,.032,'sawtooth');
      tone(146.83,.36,now+.21,sfxGain,.018,'triangle');
      return;
    }
    if(kind==='reveal'){
      sweepTone(196,392,.9,now,sfxGain,.022,'sine');
      tone(392,.46,now+.42,sfxGain,.026,'sine');tone(523.25,.55,now+.68,sfxGain,.03,'sine');
      return;
    }
    const cues={
      correct:{notes:[587.33,739.99,880],gap:.14,duration:.34,level:.04,wave:'sine'},
      winner:{notes:[392,493.88,587.33,783.99,987.77],gap:.17,duration:.48,level:.045,wave:'sine'},
      start:{notes:[392,523.25,659.25],gap:.18,duration:.38,level:.034,wave:'sine'},
      gift:{notes:[659.25,830.61,987.77],gap:.12,duration:.3,level:.032,wave:'sine'},
      tick:{notes:[880],gap:0,duration:.11,level:.022,wave:'sine'},
    };
    const cue=cues[kind];if(!cue)return;
    cue.notes.forEach((note,index)=>tone(note,cue.duration,now+index*cue.gap,sfxGain,cue.level,cue.wave));
  }
  async function toggleAudio(){
    if(!initAudio())return;
    try{await audioContext.resume();}catch(_){notify('Audio belum bisa dimulai di browser ini.',true);return;}
    audioEnabled=!audioEnabled;
    const button=$('#audioToggle');button.setAttribute('aria-pressed',String(audioEnabled));button.classList.toggle('is-on',audioEnabled);
    button.querySelector('span').textContent=audioEnabled?'BGM + SFX ON':'BGM + SFX OFF';
    button.title=audioEnabled?'Matikan BGM dan efek suara':'Aktifkan BGM dan efek suara';
    if(audioEnabled){bgmGain.gain.setTargetAtTime(.23,audioContext.currentTime,.12);scheduleBgm();}
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
  function animateQuizPanel(className,duration){
    const panel=$('.quiz-panel');if(!panel)return;
    panel.classList.remove('is-question-arriving','is-result-reveal');void panel.offsetWidth;panel.classList.add(className);
    clearTimeout(quizMotionTimer);quizMotionTimer=setTimeout(()=>panel.classList.remove(className),duration);
  }
  function clearResultSequence(){
    clearTimeout(resultSequenceTimer);resultSequenceTimer=null;
  }

  function nextQuestion(){
    if(roundNumber>=activeQuestionsPerBabak){finishBabak();return;}
    clearResultSequence();
    const panel=$('.quiz-panel');panel.classList.remove('is-answer-reveal','is-answer-hero','is-answer-result');
    const animateTransition=roundNumber>0;
    if(deckPosition>=deck.length){
      const previous=deck.length?deck[deck.length-1]:-1;deck=shuffle(questionBank.map((_,i)=>i));
      if(deck.length>1&&deck[0]===previous)[deck[0],deck[1]]=[deck[1],deck[0]];
      deckPosition=0;
    }
    currentQuestion=questionBank[deck[deckPosition++]];roundNumber++;phase='question';
    activeQuestionDuration=questionDuration;remaining=activeQuestionDuration;resultRemaining=RESULT_SECONDS;firstCorrect=null;answerGate.reset();
    feed.replaceChildren();updateAnswerCount();
    $('#questionText').textContent=currentQuestion.question;
    $('#questionTag').textContent=currentQuestion.category;
    $('#questionNumber').textContent=`· BABAK ${String(babakNumber).padStart(2,'0')} · SOAL ${String(roundNumber).padStart(2,'0')}/${String(activeQuestionsPerBabak).padStart(2,'0')}`;
    $('#winnerBanner').classList.remove('visible','no-winner','winner-reveal');
    if(animateTransition){
      animateQuizPanel('is-question-arriving',1050);
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
    lastCountdownSecond=activeQuestionDuration;
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
  function processAnswer(name,comment,row){
    const letter=parseAnswer(comment);if(!letter||phase!=='question')return;
    const selected=LETTERS.indexOf(letter),player=cleanName(name);
    if(selected===currentQuestion.correct){
      if(!firstCorrect){
        firstCorrect={name:player,letter,elapsed:activeQuestionDuration-remaining,receivedAt:Date.now(),row};
        $('#timerStatus').textContent='JAWABAN BENAR TERCATAT';
        $('#autoAdvanceText').textContent='Ada jawaban benar — hasil saat timer habis';
        addMessage('QUIZ MASTER','Jawaban benar sudah tercatat. Pemenang diumumkan setelah waktu habis.','system');playSfx('correct');
      }
      return;
    }
    if(!firstCorrect){
      addMessage('QUIZ MASTER',`${player}, belum tepat — masih ada waktu!`,'system');$('#timerStatus').textContent='JAWABAN SALAH — COBA LAGI';
      const now=Date.now();if(now-lastWrongSfxAt>1400){playSfx('wrong');lastWrongSfxAt=now;}
    }
  }

  // Accept and display only the first A–D answer from each participant in a round.
  function receiveComment(username,comment,userId=''){
    if(phase!=='question'||isPaused)return;
    const author=cleanName(username),text=String(comment||'').trim(),letter=parseAnswer(text);if(!letter)return;
    const participantKey=String(userId||scoreKey(author));
    if(!answerGate.accept(participantKey))return;
    const answerRow=addMessage(author,text,'comment',letter);updateAnswerCount();processAnswer(author,text,answerRow);
  }
  function updateAnswerCount(){
    const count=$('#answerCount');if(count)count.textContent=`${answerGate.size} jawaban · 1 per orang`;
  }
  function handleInput(raw){
    const text=raw.trim();if(!text)return;
    const named=text.match(/^@?([\p{L}\p{N}_ .-]{1,20})\s*:\s*(.+)$/u);
    if(named)receiveComment(named[1],named[2]);else receiveComment('KAMU',text);
  }

  function animateWinnerSelection(winner){
    const row=winner?.row,feed=$('#chatFeed');
    if(!row||!feed)return;
    const tag=row.querySelector('.winner-selection-tag');if(tag)tag.hidden=false;
    row.classList.add('winner-source','winner-source-picked');
    const reduced=window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    const feedVisible=feed.getClientRects().length>0&&feed.clientHeight>0;
    if(!feedVisible)return;
    const rowRect=row.getBoundingClientRect(),feedRect=feed.getBoundingClientRect();
    const targetTop=feed.scrollTop+rowRect.top-feedRect.top-(feed.clientHeight-rowRect.height)/2;
    feed.scrollTo({top:Math.max(0,targetTop),behavior:reduced?'auto':'smooth'});
  }

  function presentQuestionResult(){
    clearResultSequence();
    const panel=$('.quiz-panel'),banner=$('#winnerBanner');
    panel?.classList.remove('is-answer-reveal');panel?.classList.add('is-answer-result');
    banner.classList.remove('visible','winner-reveal');void banner.offsetWidth;
    banner.classList.toggle('no-winner',!firstCorrect);banner.classList.add('visible','winner-reveal');
    if(firstCorrect)playSfx('winner');
  }
  function sequenceQuestionResult(){
    const panel=$('.quiz-panel'),wrong=[...document.querySelectorAll('.answer-option.dimmed')],correct=$('.answer-option.correct');
    if(!panel){presentQuestionResult();return;}
    clearResultSequence();panel.classList.remove('is-answer-reveal','is-answer-hero','is-answer-result');
    const content=$('.question-content');content?.classList.remove('question-arrive');content?.querySelectorAll('.answer-arrive').forEach(option=>option.classList.remove('answer-arrive'));
    $('.quiz-panel .panel-heading')?.classList.remove('question-heading-arrive');
    void panel.offsetWidth;panel.classList.add('is-answer-reveal');
    const reduced=window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    const raiseAnswer=()=>{
      wrong.forEach(option=>option.classList.add('is-removed'));
      panel.classList.add('is-answer-hero');correct?.classList.add('is-answer-hero');
      if(firstCorrect)animateWinnerSelection(firstCorrect);
      resultSequenceTimer=setTimeout(()=>{if(phase==='result')presentQuestionResult();},reduced?120:950);
    };
    resultSequenceTimer=setTimeout(raiseAnswer,reduced?0:650);
  }

  function finishBabak(){
    if(phase==='babak-end')return;
    phase='babak-end';remaining=0;resultRemaining=0;
    clearResultSequence();$('.quiz-panel')?.classList.remove('is-answer-reveal','is-answer-hero','is-answer-result');
    const champion=sortedScores()[0];
    $('#winnerLabel').textContent=champion?`JUARA BABAK ${String(babakNumber).padStart(2,'0')} · ${activeQuestionsPerBabak} SOAL`:'BABAK SELESAI';
    $('#winnerName').textContent=champion?champion.name:'TANPA PEMENANG';
    $('.winner-points').innerHTML=champion?`${champion.points} <small>POIN TOTAL</small>`:'— <small>POIN</small>';
    const banner=$('#winnerBanner');banner.classList.remove('winner-reveal');void banner.offsetWidth;
    banner.classList.toggle('no-winner',!champion);banner.classList.add('visible','winner-reveal');
    $('#timerStatus').textContent='BABAK SELESAI';
    $('#autoAdvanceText').textContent='Lihat papan skor, lalu tekan BABAK BARU untuk lanjut';
    animateQuizPanel('is-result-reveal',1350);if(champion)playSfx('winner');
    updateStats();updateTimer();
  }

  function finishQuestion(){
    if(phase!=='question')return;
    phase='result';remaining=0;resultRemaining=RESULT_SECONDS;revealCorrect();animateQuizPanel('is-result-reveal',1350);playSfx('reveal');
    if(firstCorrect){
      const key=scoreKey(firstCorrect.name),previous=scores[key];
      scores[key]={name:previous?.name||firstCorrect.name,points:(previous?.points||0)+1,correct:(previous?.correct||0)+1};
      saveScores();
      $('#winnerLabel').textContent='YANG PALING DULU MENJAWAB BENAR';$('#winnerName').textContent=firstCorrect.name;
      $('.winner-points').innerHTML=`+1 <small>${firstCorrect.elapsed.toFixed(1)} DETIK</small>`;
      $('#winnerBanner').classList.remove('no-winner');
      $('#timerStatus').textContent='HASIL AKHIR';
      addMessage('QUIZ MASTER',`🏆 ${firstCorrect.name} paling dulu menjawab benar! +1 poin.`, 'winner');
    }else{
      $('#winnerLabel').textContent='WAKTU HABIS';$('#winnerName').textContent='BELUM ADA PEMENANG';
      $('.winner-points').innerHTML='— <small>POIN</small>';
      $('#winnerBanner').classList.add('no-winner');$('#timerStatus').textContent='WAKTU HABIS';
      addMessage('QUIZ MASTER','Waktu habis. Tidak ada jawaban yang benar.','system');
    }
    $('#autoAdvanceText').textContent=`${roundNumber>=activeQuestionsPerBabak?'Babak selesai':'Soal baru'} dalam ${RESULT_SECONDS} detik`;
    updateStats();sequenceQuestionResult();
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
  function renderQuestionDuration(){
    $('#questionDurationInput').value=String(questionDuration);
    $('#questionsPerBabakInput').value=String(questionsPerBabak);
    $('#questionDurationLabel').textContent=`${questionDuration} DETIK`;
    $('#timerSettingsToggle').title=`Atur durasi pertanyaan · ${questionDuration} detik · ${questionsPerBabak} soal per babak`;
  }
  function timerDurationHint(){
    return phase==='question'&&answerGate.size===0
      ?'Soal ini belum menerima jawaban: perubahan langsung menyesuaikan sisa waktu dan berlaku untuk soal berikutnya.'
      :'Perubahan disimpan dan mulai berlaku pada soal berikutnya.';
  }
  function applyRoundSettings(durationValue,countValue){
    const oldCount=questionsPerBabak;
    questionDuration=normalizeQuestionDuration(durationValue);questionsPerBabak=normalizeQuestionCount(countValue);
    saveQuestionDuration();saveQuestionsPerBabak();
    if(oldCount!==questionsPerBabak&&preparedAiQuestions?.length!==questionsPerBabak)clearPreparedAiQuestions();
    renderQuestionDuration();
    if(phase==='question'&&answerGate.size===0){
      const elapsed=Math.max(0,activeQuestionDuration-remaining);
      activeQuestionDuration=questionDuration;remaining=Math.max(0,activeQuestionDuration-elapsed);
      lastCountdownSecond=Math.ceil(remaining);
      if(remaining===0)finishQuestion();
      updateTimer();
    }
    $('#timerSettingsNote').textContent=`Durasi soal saat ini diperbarui bila belum ada jawaban; jumlah ${questionsPerBabak} soal berlaku mulai babak berikutnya.`;
  }
  function updateStats(){
    $('#roundReadout').textContent=`${String(roundNumber).padStart(2,'0')}/${String(activeQuestionsPerBabak).padStart(2,'0')}`;
    $('#correctReadout').textContent=totalCorrect().toLocaleString('id-ID');
    const leader=sortedScores()[0];$('#leaderReadout').textContent=leader?leader.name:'—';
    $('#leaderFoot').textContent=leader?`${leader.points} POIN TOTAL`:'BELUM ADA PEMENANG';
    $('#categoryReadout').textContent=currentQuestion?currentQuestion.category:'PENGETAHUAN UMUM';
    renderLeaderboard();
  }
  function updateTimer(){
    const isQuestion=phase==='question',isResult=phase==='result',isPreparing=phase==='preparing';
    const text=isPreparing?'AI':isQuestion?formatClock(remaining):phase==='babak-end'?'SELESAI':'HASIL';
    $('#timeReadout').textContent=text;
    $('#timerCaption').textContent=isPreparing?'MENYIAPKAN SOAL':isQuestion?text:phase==='babak-end'?'BABAK SELESAI':`SOAL BARU ${String(Math.ceil(resultRemaining)).padStart(2,'0')}`;
    const pct=isQuestion?remaining/activeQuestionDuration:isResult?resultRemaining/RESULT_SECONDS:0;
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
      }else if(phase==='result'){
        resultRemaining=Math.max(0,resultRemaining-dt);
        $('#autoAdvanceText').textContent=`${roundNumber>=activeQuestionsPerBabak?'Babak selesai':'Soal baru'} dalam ${Math.ceil(resultRemaining)} detik`;
        if(resultRemaining===0)nextQuestion();
      }
    }
    updateTimer();requestAnimationFrame(frame);
  }

  function setHostAvatarState(text, speaking=false) {
    const label=$('#hostAvatarState');if(label)label.textContent=text;
    $('#aiHostAvatar')?.classList.toggle('is-speaking',speaking);
  }
  function renderGroqSettings(data){
    groqKeySource=data?.keySource||'none';
    const configured=Boolean(data?.configured);
    const label=$('#groqSettingsLabel');if(label)label.textContent=configured?'GROQ SIAP':'GROQ AI';
    $('#groqSettingsToggle')?.setAttribute('data-configured',String(configured));
    $('#groqLiveSettingsToggle')?.setAttribute('data-configured',String(configured));
    const message=$('#groqConfigMessage');
    if(groqKeySource==='environment'){
      message.textContent='Groq sudah dikonfigurasi di environment server. Nilai key tidak dapat dilihat atau diganti dari UI.';
      $('#groqConfigForm').hidden=true;$('#groqConfigClear').hidden=true;
    }else if(groqKeySource==='ui'){
      message.textContent='Groq aktif. Key tersimpan di file privat server dan tidak ditampilkan kembali; tidak disimpan di browser.';
      $('#groqConfigForm').hidden=false;$('#groqConfigClear').hidden=false;
    }else{
      message.textContent='Belum ada Groq API key. Masukkan key untuk mengaktifkan sapaan AI otomatis.';
      $('#groqConfigForm').hidden=false;$('#groqConfigClear').hidden=true;
    }
  }
  async function loadHostStatus(){
    try{
      const response=await fetch('/api/host/status',{cache:'no-store'}),data=response.ok?await response.json():null;
      hostAiConfigured=Boolean(data?.configured);renderGroqSettings(data);
      $('#hostAudioToggle').title=`Edge TTS ${data?.voice||'en-US-BrianMultilingualNeural'} · atur sapaan AI lewat tombol GROQ AI.`;
      if(!hostAiConfigured){if(!hostAudioEnabled)setHostAvatarState('GROQ BELUM DIATUR');}
      else if(!hostAudioEnabled)setHostAvatarState('HOST SIAP');
      return hostAiConfigured;
    }catch(_){hostAiConfigured=false;if(!hostAudioEnabled)setHostAvatarState('SERVER AI OFFLINE');return false;}
  }
  async function requestGeneratedQuestionBatch(count,category,difficulty){
    const reserved=(Array.isArray(preparedAiQuestions)?preparedAiQuestions:[]).map(item=>String(item?.question||''));
    const recentQuestions=[...new Set([...readLocalQuestionHistory(),...reserved.map(questionFingerprint).filter(Boolean)])].slice(-20);
    for(let attempt=0;attempt<2;attempt++){
      const response=await fetch('/api/quiz/generate',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({count,category,difficulty,recentQuestions})});
      const data=await response.json().catch(()=>({}));
      if(!response.ok){
        const message=data.error||'Groq gagal membuat soal.';
        if(attempt===0&&/mengulang soal|duplikat/i.test(message))continue;
        throw new Error(message);
      }
      if(!Array.isArray(data.questions)||data.questions.length!==count)throw new Error('Jumlah soal dari Groq tidak sesuai. Coba ulangi.');
      return data.questions;
    }
    throw new Error('Groq mengulang soal yang sudah pernah dipakai; generator lokal anti-ulangan akan dipakai.');
  }
  function persistPreparedAiQuestions(){
    try{localStorage.setItem(PREPARED_AI_QUESTIONS_KEY,JSON.stringify(preparedAiQuestions));}catch(_){/* Keep the batch for this session. */}
  }
  function loadQuizGenerationPreferences(){
    try{
      const category=localStorage.getItem(QUIZ_CATEGORY_KEY),difficulty=localStorage.getItem(QUIZ_DIFFICULTY_KEY);
      if(category)$('#quizCategoryInput').value=category.slice(0,48);
      if(['mudah','sedang','sulit'].includes(difficulty))$('#quizDifficultyInput').value=difficulty;
    }catch(_){/* Defaults in the form remain usable. */}
  }
  function saveQuizGenerationPreferences(){
    try{
      localStorage.setItem(QUIZ_CATEGORY_KEY,$('#quizCategoryInput').value.trim().slice(0,48));
      localStorage.setItem(QUIZ_DIFFICULTY_KEY,$('#quizDifficultyInput').value);
    }catch(_){/* Preferences apply for this page session. */}
  }
  function openQuizGenerator(){
    $('#quizCategoryInput').value=$('#quizCategoryInput').value.trim()||'Pengetahuan Umum';
    $('#quizGeneratorStatus').textContent=!hostAiConfigured?'Groq belum siap; tombol generator akan menyiapkan soal lokal anti-ulangan sebagai cadangan.':preparedAiQuestions?`${preparedAiQuestions.length} soal sudah siap dipakai pada babak berikutnya.`:`Akan dibuat ${questionsPerBabak} soal Groq. Jika kuota habis, generator lokal anti-ulangan otomatis menjadi cadangan.`;
    $('#quizGeneratorDialog').showModal();
  }
  async function generateQuizQuestionBatch(){
    const button=$('#generateQuizQuestionsButton'),status=$('#quizGeneratorStatus');
    button.disabled=true;status.textContent=`Sedang meminta Groq membuat ${questionsPerBabak} soal…`;
    try{
      preparedAiQuestions=await requestGeneratedQuestionBatch(questionsPerBabak,$('#quizCategoryInput').value.trim()||'Pengetahuan Umum',$('#quizDifficultyInput').value);
      persistPreparedAiQuestions();
      status.textContent=`${preparedAiQuestions.length} soal Groq AI siap untuk babak berikutnya. Klik BABAK BARU untuk memakainya.`;
    }catch(error){
      preparedAiQuestions=generateFallbackQuestionBatch(questionsPerBabak);persistPreparedAiQuestions();
      status.textContent=`Groq tidak tersedia (${String(error?.message||'kuota habis')}). ${preparedAiQuestions.length} soal generator lokal anti-ulangan siap untuk babak berikutnya.`;
    }
    finally{button.disabled=false;}
  }
  $('#quizGeneratorToggle').addEventListener('click',openQuizGenerator);
  $('#quizGeneratorCancel').addEventListener('click',()=>$('#quizGeneratorDialog').close());
  $('#generateQuizQuestionsButton').addEventListener('click',generateQuizQuestionBatch);
  $('#quizCategoryInput').addEventListener('change',saveQuizGenerationPreferences);
  $('#quizDifficultyInput').addEventListener('change',saveQuizGenerationPreferences);
  const openGroqSettings=()=>$('#groqSettingsDialog').showModal();
  $('#groqSettingsToggle').addEventListener('click',openGroqSettings);
  $('#groqLiveSettingsToggle').addEventListener('click',openGroqSettings);
  $('#quizGeneratorFromGroq').addEventListener('click',()=>{ $('#groqSettingsDialog').close();openQuizGenerator(); });
  $('#groqSettingsCancel').addEventListener('click',()=>$('#groqSettingsDialog').close());
  $('#groqConfigForm').addEventListener('submit',async event=>{
    event.preventDefault();const apiKey=$('#groqApiKeyInput').value.trim();if(!apiKey){$('#groqConfigMessage').textContent='Masukkan Groq API key terlebih dahulu.';$('#groqApiKeyInput').focus();return;}
    const button=$('#groqConfigForm button[type="submit"]');button.disabled=true;
    try{
      const response=await fetch('/api/host/config',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({apiKey})});
      const data=await response.json().catch(()=>({}));if(!response.ok)throw new Error(data.error||'Key Groq gagal disimpan.');
      $('#groqApiKeyInput').value='';await loadHostStatus();$('#groqConfigMessage').textContent='Groq aktif. Key tersimpan di file privat server dan tidak ditampilkan kembali; tidak disimpan di browser.';
    }catch(error){$('#groqConfigMessage').textContent=String(error?.message||'Key Groq gagal disimpan.');}
    finally{button.disabled=false;}
  });
  $('#groqConfigClear').addEventListener('click',async()=>{
    const button=$('#groqConfigClear');button.disabled=true;
    try{
      const response=await fetch('/api/host/config',{method:'DELETE'}),data=await response.json().catch(()=>({}));
      if(!response.ok)throw new Error(data.error||'Key Groq gagal dihapus.');
      await loadHostStatus();
    }catch(error){$('#groqConfigMessage').textContent=String(error?.message||'Key Groq gagal dihapus.');}
    finally{button.disabled=false;}
  });
  async function playHostSpeech(text){
    if(!hostAudioEnabled||!hostPlaybackContext)return;
    const response=await fetch('/api/host/speech',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({text})});
    if(!response.ok){const data=await response.json().catch(()=>({}));throw new Error(data.error||'Edge TTS gagal membuat audio.');}
    const encoded=await response.arrayBuffer();
    if(!hostAudioEnabled)return;
    await hostPlaybackContext.resume();
    const audioBuffer=await hostPlaybackContext.decodeAudioData(encoded);
    if(!hostAudioEnabled)return;
    await new Promise((resolve,reject)=>{
      const source=hostPlaybackContext.createBufferSource();source.buffer=audioBuffer;source.connect(hostPlaybackContext.destination);hostPlaybackSource=source;
      let finished=false;
      const done=()=>{if(finished)return;finished=true;if(hostPlaybackSource===source)hostPlaybackSource=null;$('#aiHostAvatar')?.classList.remove('is-speaking');try{source.disconnect();}catch(_){};resolve();};
      source.onended=done;
      try{setHostAvatarState('SEDANG BICARA',true);source.start();}catch(error){if(hostPlaybackSource===source)hostPlaybackSource=null;try{source.disconnect();}catch(_){};reject(error);}
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
        const job=hostJobs.shift();
        try{
          const line=job.kind==='moderator'?job.text:await requestGeneratedHostLine(job);
          if(!line)continue;
          $('#hostSpeechText').textContent=line;
          await playHostSpeech(line);
          if(hostAudioEnabled)setHostAvatarState(hostVoiceStatus);
        }catch(error){
          const message=String(error?.message||'AI host belum dapat digunakan.').slice(0,160);
          $('#hostSpeechText').textContent=message;
          if(hostAudioEnabled)setHostAvatarState('HOST TTS ERROR');
        }
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
  $('#hostAudioToggle').addEventListener('click',async()=>{
    if(hostAudioEnabled){
      hostAudioEnabled=false;hostJobs=[];
      try{hostPlaybackSource?.stop();}catch(_){};hostPlaybackSource=null;
      try{await hostPlaybackContext?.suspend();}catch(_){}
      $('#hostAudioToggle').textContent='SUARA OFF';$('#hostAudioToggle').setAttribute('aria-pressed','false');setHostAvatarState(hostAiConfigured?'HOST SIAP':'GROQ BELUM DIATUR');return;
    }
    const AudioContextClass=window.AudioContext||window.webkitAudioContext;
    if(!AudioContextClass){
      $('#hostSpeechText').textContent='Browser ini tidak mendukung pemutaran audio host.';setHostAvatarState('AUDIO TIDAK TERSEDIA');return;
    }
    try{hostPlaybackContext=hostPlaybackContext||new AudioContextClass();await hostPlaybackContext.resume();}
    catch(_){$('#hostSpeechText').textContent='Audio host belum bisa dimulai di browser ini.';setHostAvatarState('AUDIO TIDAK TERSEDIA');return;}
    hostAudioEnabled=true;$('#hostAudioToggle').textContent='SUARA ON';$('#hostAudioToggle').setAttribute('aria-pressed','true');
    hostVoiceStatus='EDGE TTS · BRIAN';
    $('#hostSpeechText').textContent='Edge TTS Brian Multilingual siap menyapa penonton.';
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
    else if(phase==='result'){$('#timerStatus').textContent='HASIL AKHIR';$('#autoAdvanceText').textContent=`${roundNumber>=activeQuestionsPerBabak?'Babak selesai':'Soal baru'} dalam ${Math.ceil(resultRemaining)} detik`;}
    else{$('#timerStatus').textContent='BABAK SELESAI';$('#autoAdvanceText').textContent='Lihat papan skor, lalu tekan BABAK BARU untuk lanjut';}
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

  const layoutStorageKey='virtuallive.broadcast-layout.v1',layoutPresetsStorageKey='virtuallive.broadcast-layout-presets.v1',layoutPanels=[...document.querySelectorAll('[data-layout-panel]')],appShell=$('.app-shell');
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
  function captureLayout(){
    const bounds=layoutBounds(),saved={};
    if(!bounds.width||!bounds.height)return saved;
    for(const panel of layoutPanels){const rect=panel.getBoundingClientRect();if(!rect.width||!rect.height)continue;saved[panel.dataset.layoutPanel]={x:(rect.left-bounds.left)/bounds.width,y:(rect.top-bounds.top)/bounds.height,w:rect.width/bounds.width,h:rect.height/bounds.height};}
    return saved;
  }
  function saveLayout(){
    try{localStorage.setItem(layoutStorageKey,JSON.stringify(captureLayout()));}catch(_){notify('Layout tampil, tetapi tidak bisa disimpan browser.',true);}
  }
  function readLayoutPresets(){
    try{
      const stored=JSON.parse(localStorage.getItem(layoutPresetsStorageKey)||'[]');
      if(!Array.isArray(stored))return [];
      return stored.filter(item=>item&&typeof item.name==='string'&&item.name.trim()&&item.name.length<=32&&item.layout&&typeof item.layout==='object'&&!Array.isArray(item.layout));
    }catch(_){return [];}
  }
  function writeLayoutPresets(presets){
    try{localStorage.setItem(layoutPresetsStorageKey,JSON.stringify(presets));return true;}
    catch(_){$('#layoutPresetNote').textContent='Preset tidak bisa disimpan. Ruang penyimpanan browser mungkin penuh.';return false;}
  }
  function refreshLayoutPresetOptions(selectedName=''){
    const select=$('#layoutPresetSelect');select.replaceChildren(new Option('Pilih preset…',''));
    for(const preset of readLayoutPresets()){
      const option=document.createElement('option');option.value=preset.name;option.textContent=preset.name;select.append(option);
    }
    select.value=selectedName;
    const hasSelection=Boolean(select.value);
    $('#layoutPresetApply').disabled=!hasSelection;$('#layoutPresetDelete').disabled=!hasSelection;
  }
  function applyLayoutSnapshot(snapshot){
    const bounds=layoutBounds();
    for(const panel of layoutPanels){
      const item=snapshot?.[panel.dataset.layoutPanel];
      if(!item||![item.x,item.y,item.w,item.h].every(Number.isFinite))continue;
      applyPanelRect(panel,item.x*bounds.width,item.y*bounds.height,item.w*bounds.width,item.h*bounds.height);
    }
    saveLayout();
  }
  function saveLayoutPreset(){
    const name=$('#layoutPresetName').value.trim().replace(/\s+/g,' ').slice(0,32);
    if(!name){$('#layoutPresetNote').textContent='Isi nama preset terlebih dahulu.';$('#layoutPresetName').focus();return;}
    const layout=captureLayout();if(!Object.keys(layout).length){$('#layoutPresetNote').textContent='Belum ada susunan panel yang bisa disimpan.';return;}
    const presets=readLayoutPresets(),index=presets.findIndex(item=>item.name.toLocaleLowerCase('id-ID')===name.toLocaleLowerCase('id-ID'));
    if(index>=0){if(!confirm(`Preset “${name}” sudah ada. Timpa dengan susunan ini?`))return;presets[index]={name,layout};}
    else{if(presets.length>=20){$('#layoutPresetNote').textContent='Maksimal 20 preset. Hapus preset lama terlebih dahulu.';return;}presets.push({name,layout});}
    if(writeLayoutPresets(presets)){refreshLayoutPresetOptions(name);$('#layoutPresetNote').textContent=`Preset “${name}” berhasil disimpan di browser ini.`;}
  }
  function applySelectedLayoutPreset(){
    const name=$('#layoutPresetSelect').value,preset=readLayoutPresets().find(item=>item.name===name);
    if(!preset){$('#layoutPresetNote').textContent='Pilih preset yang ingin dipakai.';return;}
    applyLayoutSnapshot(preset.layout);$('#layoutPresetDialog').close();notify(`Preset “${name}” diterapkan.`);
  }
  function deleteSelectedLayoutPreset(){
    const name=$('#layoutPresetSelect').value;if(!name){$('#layoutPresetNote').textContent='Pilih preset yang ingin dihapus.';return;}
    if(!confirm(`Hapus preset “${name}”?`))return;
    const presets=readLayoutPresets().filter(item=>item.name!==name);
    if(writeLayoutPresets(presets)){refreshLayoutPresetOptions();$('#layoutPresetNote').textContent=`Preset “${name}” dihapus.`;}
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
  $('#layoutPresetToggle').addEventListener('click',()=>{refreshLayoutPresetOptions();$('#layoutPresetNote').textContent='Simpan susunan panel untuk dipakai lagi. Preset tersimpan di browser ini saja.';$('#layoutPresetDialog').showModal();});
  $('#layoutPresetName').addEventListener('keydown',event=>{if(event.key==='Enter'){event.preventDefault();saveLayoutPreset();}});
  $('#layoutPresetSave').addEventListener('click',saveLayoutPreset);
  $('#layoutPresetSelect').addEventListener('change',()=>{if($('#layoutPresetSelect').value)$('#layoutPresetName').value=$('#layoutPresetSelect').value;refreshLayoutPresetOptions($('#layoutPresetSelect').value);});
  $('#layoutPresetApply').addEventListener('click',applySelectedLayoutPreset);
  $('#layoutPresetDelete').addEventListener('click',deleteSelectedLayoutPreset);
  $('#layoutPresetClose').addEventListener('click',()=>$('#layoutPresetDialog').close());
  $('#editLayoutToggle').addEventListener('click',()=>setLayoutEditing(!document.body.classList.contains('layout-editing')));
  $('#layoutDone').addEventListener('click',()=>setLayoutEditing(false));
  $('#layoutReset').addEventListener('click',()=>{try{localStorage.removeItem(layoutStorageKey);}catch(_){}location.reload();});
  if(pageParams.get('edit')==='1')setLayoutEditing(true);
  renderQuestionDuration();
  $('#timerSettingsToggle').addEventListener('click',()=>{
    renderQuestionDuration();$('#timerSettingsNote').textContent=timerDurationHint();$('#timerSettingsDialog').showModal();
  });
  $('#timerSettingsCancel').addEventListener('click',()=>$('#timerSettingsDialog').close());
  $('#timerSettingsForm').addEventListener('submit',event=>{
    event.preventDefault();const durationInput=$('#questionDurationInput'),countInput=$('#questionsPerBabakInput');
    if(!durationInput.reportValidity()||!countInput.reportValidity())return;
    applyRoundSettings(durationInput.value,countInput.value);$('#timerSettingsDialog').close();
  });
  $('#audioToggle').addEventListener('click',toggleAudio);
  $('#fullscreenToggle').addEventListener('click',toggleFullscreen);
  $('#giftTest').addEventListener('click',()=>showGiftReaction({username:'TESTER',giftName:'Rose',repeatCount:1}));
  document.addEventListener('fullscreenchange',updateFullscreenButton);
  updateFullscreenButton();

  async function initializeFirstBabak(){
    phase='preparing';activeQuestionsPerBabak=questionsPerBabak;
    $('#questionText').textContent='Menyiapkan pertanyaan resmi untuk babak ini…';
    $('#questionTag').textContent='PENGETAHUAN UMUM';$('#answerGrid').replaceChildren();
    $('#timerStatus').textContent='MENYIAPKAN SOAL';$('#autoAdvanceText').textContent='Groq AI sedang menyiapkan soal; generator lokal siap sebagai cadangan.';
    $('#newBabakButton').disabled=true;$('#pauseToggle').disabled=true;$('#quizGeneratorToggle').disabled=true;updateTimer();
    const configured=await loadHostStatus();
    let batch=null,source='',fallbackReason='';
    if(preparedAiQuestions?.length===activeQuestionsPerBabak){batch=preparedAiQuestions;source='batch soal tersimpan';clearPreparedAiQuestions();}
    else if(configured){
      try{batch=await requestGeneratedQuestionBatch(activeQuestionsPerBabak,$('#quizCategoryInput').value.trim()||'Pengetahuan Umum',$('#quizDifficultyInput').value);source='Groq AI otomatis';}
      catch(error){fallbackReason=String(error?.message||'layanan Groq tidak tersedia');batch=generateFallbackQuestionBatch(activeQuestionsPerBabak);source='generator lokal';}
    }else{fallbackReason='Groq belum dikonfigurasi';batch=generateFallbackQuestionBatch(activeQuestionsPerBabak);source='generator lokal';}
    rememberQuestionBatch(batch);
    questionBank=batch;deck=shuffle(questionBank.map((_,index)=>index));deckPosition=0;
    phase='question';nextQuestion();$('#newBabakButton').disabled=false;$('#pauseToggle').disabled=false;$('#quizGeneratorToggle').disabled=false;
    addMessage('QUIZ MASTER',source==='generator lokal'?'Groq tidak tersedia; generator lokal anti-ulangan dipakai.':`Pertanyaan babak ini disiapkan oleh ${source}.`,'system');
    if(fallbackReason)notify(`Groq ${fallbackReason}; generator lokal anti-ulangan dipakai.`,true);
  }

  // The default route is the clean broadcast view; add ?dashboard=1 to open the full moderator dashboard.
  window.VirtualLiveQuiz={receiveComment};
  loadBabakState();renderBabakHistory();loadQuizGenerationPreferences();
  connectTikTokEventStream();
  void initializeFirstBabak();
  updateTimer();requestAnimationFrame(frame);
})();
