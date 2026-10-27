(() => {
  const COLORS = ['#58f5d2', '#ffb44d', '#a883ff', '#ff678a', '#76aaff', '#d2ed64', '#ff8a5b', '#49d2ff', '#f08bce', '#9bea8b', '#f49b4b', '#e2e8f0'];
  const ACTIONS = ['brake', 'cruise', 'boost', 'change'];
  const ACTION_LABELS = { brake: 'BRAKE', cruise: 'CRUISE', boost: 'BOOST', change: 'OVERTAKE' };
  const canvas = document.querySelector('#raceCanvas');
  const ctx = canvas.getContext('2d');
  const stage = document.querySelector('#trackStage');
  const racers = [];
  const feed = document.querySelector('#chatFeed');
  const input = document.querySelector('#commandInput');
  const toast = document.querySelector('#toast');
  let running = true;
  let lastFrame = performance.now();
  let totalLearningSteps = 0;
  let commentCount = 0;
  let elapsed = 0;
  let toastTimer;
  let soundOn = false;
  let audioContext;
  let lastWinner = '';

  function clamp(value, min, max) { return Math.max(min, Math.min(max, value)); }
  function rand(min, max) { return min + Math.random() * (max - min); }
  function displayName(name) { return name.trim().replace(/[^\p{L}\p{N}_-]/gu, '').slice(0, 16).toUpperCase(); }

  function addMessage(name, text, kind = 'normal') {
    const row = document.createElement('div');
    row.className = `chat-message ${kind === 'system' ? 'system' : ''}`;
    const avatar = document.createElement('span');
    avatar.className = `chat-avatar ${kind === 'system' ? 'is-system' : ''}`;
    avatar.textContent = kind === 'system' ? '✳' : (name[0] || '?').toUpperCase();
    const body = document.createElement('div'); body.className = 'chat-body';
    const meta = document.createElement('div'); meta.className = 'chat-meta';
    const user = document.createElement('span'); user.className = `chat-name ${kind === 'system' ? 'system-name' : ''}`; user.textContent = name;
    const time = document.createElement('span'); time.className = 'chat-time'; time.textContent = new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
    meta.append(user, time);
    const message = document.createElement('div'); message.className = 'chat-text';
    if (kind === 'command') { message.append(document.createTextNode('mengetik ')); const code = document.createElement('span'); code.className = 'command-text'; code.textContent = text; message.append(code); }
    else if (kind === 'gift') { message.append(document.createTextNode('mengirim ')); const gift = document.createElement('span'); gift.className = 'gift-text'; gift.textContent = text; message.append(gift); }
    else message.textContent = text;
    body.append(meta, message); row.append(avatar, body); feed.append(row);
    while (feed.children.length > 45) feed.firstElementChild.remove();
    feed.scrollTop = feed.scrollHeight;
    if (kind !== 'system') commentCount++;
  }

  function notify(message, error = false) {
    toast.textContent = message; toast.classList.toggle('error', error); toast.classList.add('visible');
    clearTimeout(toastTimer); toastTimer = setTimeout(() => toast.classList.remove('visible'), 2600);
  }

  function chirp(freq = 520, duration = .07) {
    if (!soundOn) return;
    try {
      audioContext ||= new (window.AudioContext || window.webkitAudioContext)();
      const osc = audioContext.createOscillator(), gain = audioContext.createGain();
      osc.frequency.value = freq; osc.type = 'sine'; gain.gain.setValueAtTime(.035, audioContext.currentTime); gain.gain.exponentialRampToValueAtTime(.001, audioContext.currentTime + duration);
      osc.connect(gain); gain.connect(audioContext.destination); osc.start(); osc.stop(audioContext.currentTime + duration);
    } catch (_) { /* Audio is optional. */ }
  }

  function createRacer(name, announce = true) {
    const clean = displayName(name);
    if (!clean) { notify('Nama pembalap harus berisi huruf atau angka.', true); return false; }
    if (racers.some(r => r.name === clean)) { notify(`${clean} sudah ada di lintasan.`, true); return false; }
    if (racers.length >= 12) { notify('Grid penuh — maksimal 12 pembalap.', true); return false; }
    const racer = {
      name: clean, color: COLORS[racers.length % COLORS.length], progress: rand(0, .018), speed: rand(.025,.034), lane: Math.floor(rand(0,3)),
      q: Array.from({ length: 9 }, () => ACTIONS.map(() => rand(-.03,.03))), epsilon: .28, alpha: .22, gamma: .88,
      previousState: null, previousAction: null, rewardPulse: 0, lap: 1, finished: false, finishTime: null, decisions: 0, lastAction: 'cruise', nextDecision: rand(.45,1.6), blocked: 0
    };
    racers.push(racer);
    document.querySelector('#emptyHint').classList.add('hidden');
    if (announce) { addMessage('RACE CONTROL', `${clean} masuk ke grid. Mesin AI mulai belajar.`, 'system'); notify(`${clean} masuk ke lintasan!`); chirp(740); }
    renderLeaderboard(); updateStats();
    return racer;
  }

  function spawnCommand(name, author = name) {
    addMessage(author, `/spawn ${name}`, 'command');
    createRacer(name);
  }

  function giftCommand(name, author = 'LIVE VIEWER') {
    const clean = displayName(name);
    addMessage(author, '🎁 Speed boost!', 'gift');
    const racer = racers.find(r => r.name === clean);
    if (!racer) { notify(`${clean || 'Pembalap'} belum spawn. Coba /spawn ${clean || 'nama'}.`, true); return; }
    racer.speed = Math.min(.044, racer.speed + .012);
    racer.rewardPulse = 1;
    for (let i = 0; i < 10; i++) racer.q[2][2] += .003;
    addMessage('RACE CONTROL', `⚡ Gift boost untuk ${clean}!`, 'system');
    notify(`⚡ Boost untuk ${clean}!`); chirp(880,.12);
  }

  function handleCommand(raw, author) {
    const text = raw.trim(); if (!text) return;
    const spawn = text.match(/^\/spawn\s+(.+)$/i);
    const gift = text.match(/^\/(?:gift|boost)\s+(.+)$/i);
    if (spawn) spawnCommand(spawn[1], author || displayName(spawn[1]));
    else if (gift) giftCommand(gift[1], author || 'LIVE VIEWER');
    else if (/^\/help$/i.test(text)) {
      addMessage(author || 'VIEWER', text, 'command');
      addMessage('RACE CONTROL', 'Perintah: /spawn nama untuk ikut balapan, /gift nama untuk boost!', 'system');
    } else {
      addMessage(author || 'VIEWER', text);
      notify('Coba perintah /spawn nama atau /gift nama.', true);
    }
  }

  function gapAhead(car) {
    let nearest = 1;
    for (const other of racers) {
      if (other === car || other.finished) continue;
      let delta = (other.progress - car.progress + 1) % 1;
      if (delta < .0001) delta = 1;
      if (delta < nearest && (other.lane === car.lane || delta < .015)) nearest = delta;
    }
    return nearest;
  }

  function getState(car) {
    const gap = gapAhead(car);
    const gapBucket = gap < .035 ? 0 : gap < .10 ? 1 : 2;
    return gapBucket * 3 + car.lane;
  }

  function chooseAction(car, state) {
    if (Math.random() < car.epsilon) return Math.floor(Math.random() * ACTIONS.length);
    const options = car.q[state];
    let best = 0;
    for (let i = 1; i < options.length; i++) if (options[i] > options[best]) best = i;
    return best;
  }

  function learn(car, state, action, reward, nextState) {
    const oldValue = car.q[state][action];
    const future = Math.max(...car.q[nextState]);
    car.q[state][action] = oldValue + car.alpha * (reward + car.gamma * future - oldValue);
    car.epsilon = Math.max(.045, car.epsilon * .99955);
    car.decisions++; totalLearningSteps++;
  }

  function update(dt) {
    elapsed += dt;
    // Update decisions from a shared snapshot, then apply movement.
    for (const car of racers) {
      if (car.finished) continue;
      car.nextDecision -= dt;
      if (car.nextDecision <= 0) {
        const state = getState(car), action = chooseAction(car, state);
        const oldProgress = car.progress, oldLane = car.lane;
        let reward = .06;
        if (action === 0) { car.speed = Math.max(.013, car.speed - .005); reward -= .012; }
        if (action === 1) { car.speed += ( .030 - car.speed) * .48; reward += .015; }
        if (action === 2) { car.speed = Math.min(.050, car.speed + .009); reward += .045; }
        if (action === 3) {
          const laneShift = car.lane === 1 ? (Math.random() < .5 ? -1 : 1) : (car.lane === 0 ? 1 : -1);
          car.lane = clamp(car.lane + laneShift, 0, 2); reward -= .01;
        }
        const gap = gapAhead(car);
        if (gap < .022 && car.lane === oldLane) { reward -= .18; car.speed = Math.max(.008, car.speed * .78); car.blocked++; }
        else car.blocked = Math.max(0, car.blocked - 1);
        if (action === 3 && gap < .10 && car.lane !== oldLane) reward += .14;
        if (car.previousState !== null) learn(car, car.previousState, car.previousAction, car.rewardPulse + reward, state);
        car.previousState = state; car.previousAction = action; car.rewardPulse = 0; car.lastAction = ACTIONS[action];
        car.nextDecision = rand(.65,1.35);
      }
      if (running) {
        const gap = gapAhead(car);
        const slowFactor = gap < .017 ? .60 : gap < .030 && racers.some(o => o !== car && o.lane === car.lane && ((o.progress - car.progress + 1) % 1) < .03) ? .80 : 1;
        car.progress += car.speed * slowFactor * dt;
        car.speed += (.028 - car.speed) * dt * .04;
        car.rewardPulse += car.speed * dt * 2;
        const newLap = Math.floor(car.progress * 3) + 1;
        if (newLap > car.lap && newLap <= 3) { car.lap = newLap; chirp(660,.04); }
        if (car.progress >= 1) {
          car.finished = true; car.progress = 1; car.finishTime = elapsed; car.speed = 0;
          if (!lastWinner) { lastWinner = car.name; addMessage('RACE CONTROL', `🏁 ${car.name} menyentuh garis finish!`, 'system'); notify(`🏁 ${car.name} menang!`); chirp(980,.18); }
        }
      }
    }
    updateStats();
  }

  function roundedRect(x,y,w,h,r) {
    const radius = Math.min(r,w/2,h/2); ctx.beginPath(); ctx.roundRect(x,y,w,h,radius);
  }

  function dimensions() {
    const rect = stage.getBoundingClientRect(), dpr = Math.min(window.devicePixelRatio || 1, 2);
    const width = Math.max(1, rect.width), height = Math.max(1, rect.height);
    if (canvas.width !== Math.round(width*dpr) || canvas.height !== Math.round(height*dpr)) { canvas.width = Math.round(width*dpr); canvas.height = Math.round(height*dpr); }
    ctx.setTransform(dpr,0,0,dpr,0,0);
    return { width, height };
  }

  function trackPoint(cx,cy,rx,ry,theta,lateral=0) {
    // A hand-designed radial course: broad sweepers mixed with tighter S-bends and chicanes.
    const r=.78+.10*Math.cos(3*theta+.25)+.035*Math.sin(5*theta-.6)+.012*Math.cos(7*theta+.8);
    const dr=-.30*Math.sin(3*theta+.25)+.175*Math.cos(5*theta-.6)-.084*Math.sin(7*theta+.8);
    const dx=rx*(dr*Math.cos(theta)-r*Math.sin(theta));
    const dy=ry*(dr*Math.sin(theta)+r*Math.cos(theta));
    const length=Math.hypot(dx,dy)||1,nx=-dy/length,ny=dx/length;
    return {x:cx+rx*r*Math.cos(theta)+nx*lateral,y:cy+ry*r*Math.sin(theta)+ny*lateral,dx,dy,nx,ny};
  }

  function traceTrackPath(cx,cy,rx,ry,road,lateral=0,start=-Math.PI,end=Math.PI,steps=520) {
    ctx.beginPath();
    for(let i=0;i<=steps;i++){
      const p=trackPoint(cx,cy,rx,ry,start+(end-start)*i/steps,lateral);
      if(i===0)ctx.moveTo(p.x,p.y);else ctx.lineTo(p.x,p.y);
    }
  }

  let arcLengthCache=null;
  function getArcLengthTable(rx,ry) {
    if(arcLengthCache&&arcLengthCache.rx===rx&&arcLengthCache.ry===ry)return arcLengthCache;
    const points=[],steps=1200;let total=0,previous=null;
    for(let i=0;i<=steps;i++){
      const theta=-Math.PI+Math.PI*2*i/steps,p=trackPoint(0,0,rx,ry,theta);
      if(previous)total+=Math.hypot(p.x-previous.x,p.y-previous.y);
      points.push({theta,distance:total});previous=p;
    }
    arcLengthCache={rx,ry,points,total};return arcLengthCache;
  }

  function angleAtProgress(progress,rx,ry) {
    const table=getArcLengthTable(rx,ry),target=clamp(progress,0,1)*table.total;
    let low=0,high=table.points.length-1;
    while(high-low>1){const mid=(low+high)>>1;if(table.points[mid].distance<target)low=mid;else high=mid;}
    const a=table.points[low],b=table.points[high],span=b.distance-a.distance;
    return a.theta+(b.theta-a.theta)*(span?(target-a.distance)/span:0);
  }

  function drawTrack() {
    const {width:w,height:h}=dimensions();ctx.clearRect(0,0,w,h);
    const cx=w/2,cy=h/2+2,rx=Math.min(w*.335,h*.42,w/2-58),ry=Math.min(h*.31,w*.26,h/2-65),road=47;
    // Custom technical circuit with a deliberately uneven rhythm of sweepers and chicanes.
    // Soft shadow and a deep orange edge make the plastic track feel raised off the tabletop.
    traceTrackPath(cx,cy,rx,ry,road);
    ctx.save();ctx.shadowColor='#000b';ctx.shadowBlur=18;ctx.shadowOffsetY=12;ctx.strokeStyle='#101820';ctx.lineWidth=road+15;ctx.lineCap='round';ctx.lineJoin='round';ctx.stroke();ctx.restore();
    traceTrackPath(cx,cy,rx,ry,road);ctx.strokeStyle='#963604';ctx.lineWidth=road+9;ctx.lineCap='round';ctx.lineJoin='round';ctx.stroke();
    const plastic=ctx.createLinearGradient(0,cy-ry-50,0,cy+ry+50);
    plastic.addColorStop(0,'#ffad32');plastic.addColorStop(.2,'#ff8618');plastic.addColorStop(.52,'#f66b0b');plastic.addColorStop(.82,'#e95708');plastic.addColorStop(1,'#bf4106');
    traceTrackPath(cx,cy,rx,ry,road);ctx.strokeStyle=plastic;ctx.lineWidth=road;ctx.stroke();
    traceTrackPath(cx,cy,rx,ry,road);ctx.strokeStyle='#ffd16c80';ctx.lineWidth=1.5;ctx.stroke();
    // Embossed grooves divide the roadway into three lanes.
    for(const offset of [-road/6,road/6]){
      traceTrackPath(cx,cy,rx,ry,road,offset);ctx.strokeStyle='#9f390cbb';ctx.lineWidth=1.6;ctx.stroke();
      traceTrackPath(cx,cy,rx,ry,road,offset-1);ctx.strokeStyle='#ffc05b66';ctx.lineWidth=.7;ctx.stroke();
    }
    // Twin raised guard rails follow the whole non-oval route.
    for(const offset of [-road/2+3,road/2-3]){
      traceTrackPath(cx,cy,rx,ry,road,offset);ctx.strokeStyle='#a83e0a';ctx.lineWidth=5;ctx.stroke();
      traceTrackPath(cx,cy,rx,ry,road,offset);ctx.strokeStyle='#ffc45a';ctx.lineWidth=2;ctx.stroke();
    }
    // Molded snap joints across the toy track.
    for(let i=0;i<40;i++){
      const t=-Math.PI+i*Math.PI*2/40;
      const a=trackPoint(cx,cy,rx,ry,t,-road/2+5),b=trackPoint(cx,cy,rx,ry,t,road/2-5);
      ctx.beginPath();ctx.moveTo(a.x,a.y);ctx.lineTo(b.x,b.y);ctx.strokeStyle=i%5===0?'#ffe09a88':'#9c3c156b';ctx.lineWidth=i%5===0?1.2:.7;ctx.stroke();
    }
    // Compact center island leaves plenty of room for the multiple bends around it.
    const island=ctx.createRadialGradient(cx,cy,2,cx,cy,ry*.42);
    island.addColorStop(0,'#25313a');island.addColorStop(1,'#17232b');ctx.fillStyle=island;
    ctx.beginPath();ctx.ellipse(cx,cy,rx*.32,ry*.34,0,0,Math.PI*2);ctx.fill();
    ctx.strokeStyle='#e8a54826';ctx.lineWidth=1;ctx.setLineDash([3,5]);ctx.beginPath();ctx.ellipse(cx,cy,rx*.30,ry*.32,0,0,Math.PI*2);ctx.stroke();ctx.setLineDash([]);
    ctx.fillStyle='#ffb454';ctx.font='700 8px "DM Mono",monospace';ctx.textAlign='center';ctx.fillText('TWIST RUN',cx,cy-4);
    ctx.fillStyle='#aeb9c088';ctx.font='6px "DM Mono",monospace';ctx.fillText('S-BENDS  ·  HAIRPINS',cx,cy+9);
    // Blue snap-in booster pads on each lobe's fast straight.
    for(const t of [-Math.PI/2,Math.PI/2]){
      const p=trackPoint(cx,cy,rx,ry,t),angle=Math.atan2(p.dy,p.dx);
      ctx.save();ctx.translate(p.x,p.y);ctx.rotate(angle);
      for(let lane=0;lane<3;lane++){
        const laneY=(lane-1)*road/3;
        ctx.fillStyle='#0b4051';roundedRect(-13,laneY-5,26,10,2);ctx.fill();
        ctx.fillStyle='#29dafa';ctx.fillRect(-9,laneY-3,2,6);ctx.fillRect(-3,laneY-3,2,6);ctx.fillRect(3,laneY-3,2,6);
      }
      ctx.restore();
    }
    // Start / finish checker strip at the launch point used by the lap counter.
    const theta=-Math.PI,start=trackPoint(cx,cy,rx,ry,theta),angle=Math.atan2(start.dy,start.dx);
    ctx.save();ctx.translate(start.x,start.y);ctx.rotate(angle);
    for(let n=0;n<10;n++){ctx.fillStyle=n%2?'#60300f':'#fff0cf';ctx.fillRect(-3,-road/2+n*road/10,6,road/10+1)}
    ctx.restore();
    // Small trackside pylons emphasize the scale-model tabletop setting.
    for(let i=0;i<24;i++){
      const t=-Math.PI+i*Math.PI*2/24,p=trackPoint(cx,cy,rx,ry,t,road/2+9);
      ctx.beginPath();ctx.arc(p.x,p.y,i%6===0?2:1.2,0,Math.PI*2);ctx.fillStyle=i%6===0?'#ff9c36aa':'#ffbf5944';ctx.fill();
    }
  }

  function carPosition(car) {
    const {width:w,height:h}=dimensions();const cx=w/2,cy=h/2+2,rx=Math.min(w*.335,h*.42,w/2-58),ry=Math.min(h*.31,w*.26,h/2-65),road=47;
    const theta=angleAtProgress(car.progress,rx,ry);
    const laneOffset=(car.lane-1)*road/3;
    const point=trackPoint(cx,cy,rx,ry,theta,laneOffset);
    const ahead=trackPoint(cx,cy,rx,ry,theta+.002,laneOffset);
    return {x:point.x,y:point.y,angle:Math.atan2(ahead.y-point.y,ahead.x-point.x)};
  }

  function drawCar(car) {
    const p=carPosition(car), {x,y,angle}=p;
    ctx.save();ctx.translate(x,y);ctx.rotate(angle);
    // A glossy little die-cast racer, with speed glow trailing behind it.
    ctx.globalAlpha=car.rewardPulse>0?.30:.12;ctx.fillStyle=car.color;ctx.beginPath();ctx.ellipse(-13,0,14,5.5,0,0,Math.PI*2);ctx.fill();ctx.globalAlpha=1;
    ctx.fillStyle='#090d12';roundedRect(-7,-7.1,6,3.5,1.4);ctx.fill();roundedRect(5,-7.1,6,3.5,1.4);ctx.fill();
    roundedRect(-7,3.6,6,3.5,1.4);ctx.fill();roundedRect(5,3.6,6,3.5,1.4);ctx.fill();
    ctx.beginPath();ctx.moveTo(-13,-3.2);ctx.lineTo(-9,-4.8);ctx.lineTo(-3,-5.2);ctx.lineTo(1,-4.6);ctx.lineTo(7,-3.7);ctx.lineTo(11,-2.6);ctx.lineTo(13,0);ctx.lineTo(11,2.6);ctx.lineTo(7,3.7);ctx.lineTo(1,4.6);ctx.lineTo(-3,5.2);ctx.lineTo(-9,4.8);ctx.lineTo(-13,3.2);ctx.closePath();
    const paint=ctx.createLinearGradient(0,-6,0,6);paint.addColorStop(0,'#fff4');paint.addColorStop(.35,car.color);paint.addColorStop(1,'#0006');ctx.fillStyle=paint;ctx.fill();ctx.strokeStyle='#ffe5afaa';ctx.lineWidth=.65;ctx.stroke();
    // Tinted canopy, bonnet stripe, headlights and rear lamps.
    ctx.beginPath();ctx.moveTo(-5,-3.6);ctx.lineTo(-2,-4);ctx.lineTo(3,-3.8);ctx.lineTo(6,-2.6);ctx.lineTo(5.5,2.6);ctx.lineTo(2,3.8);ctx.lineTo(-2,4);ctx.lineTo(-5,3.6);ctx.closePath();ctx.fillStyle='#b8e9f1';ctx.globalAlpha=.88;ctx.fill();ctx.globalAlpha=1;ctx.strokeStyle='#263943';ctx.lineWidth=.7;ctx.stroke();
    ctx.strokeStyle='#fff9';ctx.lineWidth=.7;ctx.beginPath();ctx.moveTo(8,-1.7);ctx.lineTo(11,-1.2);ctx.moveTo(8,1.7);ctx.lineTo(11,1.2);ctx.stroke();
    ctx.fillStyle='#fff3bf';ctx.fillRect(11,-2.1,1.4,1.1);ctx.fillRect(11,1,1.4,1.1);
    ctx.fillStyle='#ff344f';ctx.fillRect(-12,-2.5,1.5,1.6);ctx.fillRect(-12,.9,1.5,1.6);
    ctx.restore();
    // Name plate floats just above each tiny car.
    ctx.save();ctx.font='600 8px "DM Mono",monospace';const tw=ctx.measureText(car.name).width;const bw=Math.min(Math.max(38,tw+14),100);const px=x-bw/2,py=y-23;
    ctx.fillStyle='#111820eF';roundedRect(px,py,bw,14,3);ctx.fill();ctx.strokeStyle='#ffab4544';ctx.lineWidth=.7;ctx.stroke();ctx.fillStyle=car.color;ctx.fillRect(px+4,py+4,2,6);ctx.fillStyle='#fff5e7';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(car.name,x+1,py+7.3,bw-9);ctx.restore();
  }

  function render() {
    drawTrack();
    const ordered=[...racers].sort((a,b)=>a.progress-b.progress);
    ordered.forEach(drawCar);
  }

  function renderLeaderboard() {
    const root=document.querySelector('#leaderboardRows'), empty=document.querySelector('#leaderboardEmpty');
    const sorted=[...racers].sort((a,b)=>b.progress-a.progress);root.replaceChildren();empty.style.display=sorted.length?'none':'block';
    sorted.forEach((r,i)=>{
      const row=document.createElement('div');row.className='racer-row';
      const pos=document.createElement('span');pos.className=`racer-pos ${i===0?'first':''}`;pos.textContent=String(i+1).padStart(2,'0');
      const driver=document.createElement('div');driver.className='racer-driver';const dot=document.createElement('i');dot.className='driver-dot';dot.style.color=r.color;dot.style.background=r.color;const name=document.createElement('span');name.className='driver-name';name.textContent=r.name;driver.append(dot,name);
      const mode=document.createElement('span');mode.className='driver-mode';const pill=document.createElement('span');pill.className='mode-pill';pill.textContent=r.finished?'FINISH':(r.lastAction==='change'?'OVERTAKE':r.lastAction.toUpperCase());mode.append(pill);
      const lap=document.createElement('span');lap.className='racer-lap';lap.textContent=r.finished?'03/03':`${String(r.lap).padStart(2,'0')}/03`;
      const prog=document.createElement('div');prog.className='progress-cell';const bar=document.createElement('div');bar.className='progress-track';const fill=document.createElement('div');fill.className='progress-fill';fill.style.width=`${Math.min(100,r.progress*100)}%`;fill.style.background=r.color;bar.append(fill);const value=document.createElement('span');value.className='progress-value';value.textContent=`${Math.floor(r.progress*100)}%`;prog.append(bar,value);
      row.append(pos,driver,mode,lap,prog);root.append(row);
    });
  }

  let uiTimer=0;
  function updateStats() {
    document.querySelector('#racerCount').innerHTML=`${String(racers.length).padStart(2,'0')}<span> / 12</span>`;
    document.querySelector('#experienceReadout').innerHTML=`${totalLearningSteps.toLocaleString('id-ID')}<span> langkah</span>`;
    document.querySelector('#commentCount').textContent=commentCount;
    const leader=[...racers].sort((a,b)=>b.progress-a.progress)[0];
    document.querySelector('#leaderReadout').textContent=leader?leader.name:'—';
    document.querySelector('#leaderFoot').textContent=leader?(leader.finished?'FINISHER':`${Math.floor(leader.progress*100)}% PROGRES`):'MENUNGGU START';
    const lap=Math.min(3,Math.max(1,...racers.map(r=>r.lap)));
    document.querySelector('#lapReadout').innerHTML=`${String(lap).padStart(2,'0')}<span> / 03</span>`;
    document.querySelector('#overlayLap').textContent=String(lap).padStart(2,'0');
    const average=racers.length?racers.reduce((sum,r)=>sum+r.speed,0)/racers.length:0;
    document.querySelector('#speedReadout').textContent=`AVG ${Math.round(average*1600)} KM/H`;
    document.querySelector('#gridStatus').textContent=racers.length>=12?'GRID PENUH':'GRID AKTIF';
  }

  function frame(now) {
    const dt=Math.min((now-lastFrame)/1000,.05);lastFrame=now;
    if(running) update(dt);
    render();
    uiTimer+=dt;
    if(uiTimer>.4){renderLeaderboard();uiTimer=0;}
    document.querySelector('#raceClock').textContent=`${String(Math.floor(elapsed/60)).padStart(2,'0')}:${String(Math.floor(elapsed%60)).padStart(2,'0')}`;
    requestAnimationFrame(frame);
  }

  document.querySelector('#commandForm').addEventListener('submit',e=>{e.preventDefault();handleCommand(input.value,'YOU');input.value='';input.focus();});
  document.querySelectorAll('[data-command]').forEach(button=>button.addEventListener('click',()=>{input.value=button.dataset.command;input.focus();if(button.dataset.command.includes('RAKYAT'))input.setSelectionRange(7,input.value.length);}));
  document.querySelector('#pauseButton').addEventListener('click',e=>{running=!running;const button=e.currentTarget;button.querySelector('.play-symbol').textContent=running?'Ⅱ':'▶';button.querySelector('span:last-child').textContent=running?'PAUSE':'RESUME';notify(running?'Balapan dilanjutkan.':'Balapan dijeda.');});
  document.querySelector('#resetButton').addEventListener('click',()=>{racers.splice(0);totalLearningSteps=0;commentCount=0;elapsed=0;lastWinner='';feed.replaceChildren();document.querySelector('#emptyHint').classList.remove('hidden');addMessage('RACE CONTROL','Sirkuit di-reset. Kirim /spawn nama untuk mulai!', 'system');renderLeaderboard();updateStats();notify('Grid dibersihkan. Siap balapan!');});
  document.querySelector('#clearChat').addEventListener('click',()=>{feed.replaceChildren();addMessage('RACE CONTROL','Chat dibersihkan. Perintah tetap bisa dikirim.', 'system');});
  document.querySelector('#soundButton').addEventListener('click',e=>{soundOn=!soundOn;e.currentTarget.querySelector('.sound-label').textContent=soundOn?'SFX ON':'SFX OFF';e.currentTarget.setAttribute('aria-label',soundOn?'Suara aktif':'Suara mati');if(soundOn)chirp(620);});

  // A few clearly labeled demo drivers make the prototype immediately playable.
  createRacer('NOVA',false);createRacer('KILAT',false);createRacer('BIMO',false);
  addMessage('RACE CONTROL','Neon Circuit siap! Kirim /spawn nama untuk gabung.', 'system');
  addMessage('NOVA','/spawn NOVA','command');addMessage('KILAT','/spawn KILAT','command');
  const observer=new ResizeObserver(()=>render());observer.observe(stage);
  updateStats();requestAnimationFrame(frame);
})();
