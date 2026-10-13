const S=window.TAQWA_CONTENT||{hadiths:[],sunan:[]};
const Q=window.TAQWA_QURAN_LOCAL||[];
const NAMES=['الفاتحة','البقرة','آل عمران','النساء','المائدة','الأنعام','الأعراف','الأنفال','التوبة','يونس','هود','يوسف','الرعد','إبراهيم','الحجر','النحل','الإسراء','الكهف','مريم','طه','الأنبياء','الحج','المؤمنون','النور','الفرقان','الشعراء','النمل','القصص','العنكبوت','الروم','لقمان','السجدة','الأحزاب','سبأ','فاطر','يس','الصافات','ص','الزمر','غافر','فصلت','الشورى','الزخرف','الدخان','الجاثية','الأحقاف','محمد','الفتح','الحجرات','ق','الذاريات','الطور','النجم','القمر','الرحمن','الواقعة','الحديد','المجادلة','الحشر','الممتحنة','الصف','الجمعة','المنافقون','التغابن','الطلاق','التحريم','الملك','القلم','الحاقة','المعارج','نوح','الجن','المزمل','المدثر','القيامة','الإنسان','المرسلات','النبأ','النازعات','عبس','التكوير','الانفطار','المطففين','الانشقاق','البروج','الطارق','الأعلى','الغاشية','الفجر','البلد','الشمس','الليل','الضحى','الشرح','التين','العلق','القدر','البينة','الزلزلة','العاديات','القارعة','التكاثر','العصر','الهمزة','الفيل','قريش','الماعون','الكوثر','الكافرون','النصر','المسد','الإخلاص','الفلق','الناس'];
const RECITERS={
  lohaidan:{name:'محمد اللحيدان',short:'اللحيدان',audio:id=>`https://cdn.mp3quran.net/audio/muhammad-luhaidan/r1/${String(id).padStart(3,'0')}.mp3`,photo:'https://quran-uni.com/wp-content/uploads/2023/10/Muhamed-Luhaidan.jpg',photoSource:'Quran-Uni'},
  yasser:{name:'ياسر الدوسري',short:'الدوسري',audio:id=>`https://cdn.mp3quran.net/audio/yasser-dosari/r1/${String(id).padStart(3,'0')}.mp3`,photo:'https://upload.wikimedia.org/wikipedia/commons/6/69/Yasser_Al-Dosari.jpg',photoSource:'Wikimedia Commons'},
  alafasy:{name:'مشاري العفاسي',short:'العفاسي',audio:id=>`https://cdn.mp3quran.net/download/audio/mishary-alafasy/r1/${String(id).padStart(3,'0')}.mp3`,photo:'https://media.way2quran.com/imgs/mishary-alafasy.webp',photoSource:'Way2Quran'},
  husary:{name:'محمود خليل الحصري',short:'الحصري',audio:id=>`https://server13.mp3quran.net/husr/${String(id).padStart(3,'0')}.mp3`,photo:'https://media.way2quran.com/imgs/mahmoud-khalil-al-hosary.jpg',photoSource:'Way2Quran'},
  abdulbasit:{name:'عبد الباسط عبد الصمد — مرتل',short:'عبد الباسط',audio:id=>`https://server7.mp3quran.net/basit_mjwd/${String(id).padStart(3,'0')}.mp3`,photo:'https://media.way2quran.com/imgs/abdul-basit-abdul-samad.jpg',photoSource:'Way2Quran'}
};

const state={
  route:'home',
  audio:{surah:1,reciter:'lohaidan',playing:false,src:'',time:0},
  tasbih:0,
  prayer:null
};
const $=(s)=>document.querySelector(s);
const $$=(s)=>[...document.querySelectorAll(s)];
const ROUTES={
  '/':'home','/index':'home','/index.html':'home','/quran':'quran','/quran/':'quran','/quran.html':'quran','/quran-audio':'audio','/quran-audio/':'audio','/quran-audio.html':'audio','/tafsir':'tafsir','/tafsir/':'tafsir','/tafsir.html':'tafsir',
  '/hadith':'hadith','/hadith/':'hadith','/hadith.html':'hadith','/azkar':'azkar','/azkar/':'azkar','/azkar.html':'azkar','/sunan':'sunan','/sunan/':'sunan','/sunan.html':'sunan','/prayer':'prayer','/prayer/':'prayer','/prayer.html':'prayer','/app':'app','/app/':'app','/app.html':'app'
};
const ROUTE_FILES={home:'index.html',quran:'quran.html',audio:'quran-audio.html',tafsir:'tafsir.html',hadith:'hadith.html',azkar:'azkar.html',sunan:'sunan.html',prayer:'prayer.html',app:'app.html'};
function routeFile(route){return ROUTE_FILES[route]||'index.html'}
const TITLES={home:'تقوى | الرئيسية',quran:'القرآن الكريم | تقوى',audio:'القرآن الصوتي | تقوى',tafsir:'تفسير القرآن | تقوى',hadith:'الأحاديث النبوية | تقوى',azkar:'الأذكار والأدعية | تقوى',sunan:'السنن النبوية | تقوى',prayer:'مواقيت الصلاة | تقوى',app:'تطبيق تقوى'};
function toast(msg){const t=$('#toast');if(!t)return;t.textContent=msg;t.classList.add('show');clearTimeout(toast.t);toast.t=setTimeout(()=>t.classList.remove('show'),2600)}
function activePath(){return window.__TAQWA_TEST_PATH||location.pathname||'/index.html'}
function routeFromPath(path){
  const clean=String(path||'/').split('?')[0].split('#')[0];
  const base=clean.replace(/\/+$/,'').split('/').pop().toLowerCase();
  if(!base||base==='index.html'||base==='index')return 'home';
  const exact=ROUTES[clean.startsWith('/')?clean:`/${clean}`];
  if(exact)return exact;
  // Support both ordinary static file routes and Netlify clean URLs.
  const byName={
    'quran.html':'quran','quran':'quran',
    'quran-audio.html':'audio','quran-audio':'audio','audio':'audio',
    'tafsir.html':'tafsir','tafsir':'tafsir',
    'hadith.html':'hadith','hadith':'hadith',
    'azkar.html':'azkar','azkar':'azkar',
    'sunan.html':'sunan','sunan':'sunan',
    'prayer.html':'prayer','prayer':'prayer',
    'app.html':'app','app':'app','install':'app'
  };
  return byName[base]||null;
}
function routeName(){
  const p=activePath();
  if(window.__TAQWA_TEST_ROUTE&&templates[window.__TAQWA_TEST_ROUTE])return window.__TAQWA_TEST_ROUTE;
  const q=new URLSearchParams(location.search).get('route');
  if(q&&templates[q])return q;
  if(history.state?.taqwaRoute&&templates[history.state.taqwaRoute])return history.state.taqwaRoute;
  return routeFromPath(p)||'home';
}
function setTestPath(url){if(window.__TAQWA_TEST_PATH)window.__TAQWA_TEST_PATH=new URL(url,'https://taqwa.test').pathname}
function routeFromAnchor(a,u){
  const hinted=a?.dataset?.route;
  if(hinted&&templates[hinted])return hinted;
  const query=new URLSearchParams(u?.search||'').get('route');
  if(query&&templates[query])return query;
  return routeFromPath(u?.pathname);
}
function go(url,push=true,forcedRoute=null){
  let u; try { u=new URL(url,window.__TAQWA_TEST_BASE||location.href); } catch { return false; }
  const q=new URLSearchParams(u.search).get('route');
  const rt=forcedRoute||(q&&templates[q]?q:routeFromPath(u.pathname));
  if(!rt||!templates[rt]) return false;
  if(window.__TAQWA_TEST_PATH){ setTestPath('/'+routeFile(rt)); window.__TAQWA_TEST_ROUTE=rt; }
  else if(location.protocol==='file:'){
    if(push) location.assign(routeFile(rt));
    return true;
  } else if(push){
    // Keep the shared audio element alive, but write the REAL destination path.
    // The previous version kept the current pathname and only changed ?route=,
    // which made page links appear stuck and broke direct refresh/deep links on Netlify.
    const targetPath = u.pathname || ('/' + routeFile(rt));
    const targetSearch = u.search || '';
    const targetHash = u.hash || '';
    try {
      const current = location.pathname + location.search + location.hash;
      const target = targetPath + targetSearch + targetHash;
      if (current !== target) history.pushState({taqwaRoute:rt}, '', target);
    } catch(err) {
      console.warn('تعذر التنقل الداخلي؛ سيتم فتح الصفحة مباشرة.', err);
      location.assign(u.href || ('/' + routeFile(rt)));
      return false;
    }
  }
  state.route=rt;
  try { render(); window.scrollTo({top:0,behavior:'auto'}); return true; }
  catch(err){ console.error('تعذر عرض صفحة تقوى:',err); if(location.protocol!=='file:') location.assign('/'+routeFile(rt)); return false; }
}
function nav(){
  document.addEventListener('click',e=>{
    const a=e.target.closest('a[href]');
    if(!a||e.defaultPrevented||e.metaKey||e.ctrlKey||e.shiftKey||e.altKey||a.hasAttribute('download')||a.target==='_blank') return;
    const raw=a.getAttribute('href')||'';
    if(raw.startsWith('#')||raw.startsWith('mailto:')||raw.startsWith('tel:')) return;
    let u; try { u=new URL(raw,location.href); } catch { return; }
    if(!window.__TAQWA_TEST_BASE&&u.origin!==location.origin) return;
    const rt=routeFromAnchor(a,u); if(!rt||!templates[rt]) return;
    if(location.protocol==='file:') return; // let plain links work on local file previews
    e.preventDefault();
    const ok = go(u.href, true, rt);
    if (!ok || state.route !== rt || !$('#appMain')?.innerHTML) {
      location.assign(u.href);
      return;
    }
    // Store the route on state so back/forward always restores the correct view.
    try { history.replaceState({...history.state, taqwaRoute:rt}, '', location.pathname + location.search + location.hash); } catch {}
  },true);
  const menu=$('#menuBtn'); if(menu) menu.addEventListener('click',()=>$('#mainNav')?.classList.toggle('open'));
  addEventListener('popstate',()=>{state.route=routeName();try{render()}catch(err){console.error('Navigation render failed',err);location.assign('/'+routeFile(state.route));}});
  window.TAQWA_NAV_READY=true;
}
function render(){
  state.route=templates[state.route]?state.route:'home';
  $$('#mainNav a').forEach(a=>a.classList.toggle('active',a.dataset.route===state.route));
  $('#mainNav')?.classList.remove('open');
  const m=$('#appMain'); if(!m)return;
  m.innerHTML=templates[state.route]();
  document.title=TITLES[state.route]||TITLES.home;
  try { pageInit(state.route); } catch (err) { console.error('Page initialization failed:', state.route, err); m.innerHTML='<section class="section"><div class="container glass"><h1>تعذر تحميل القسم</h1><p>تأكد من اتصال الإنترنت ثم أعد المحاولة.</p><nav class="fallback-nav"><a href="/index.html">الرئيسية</a> · <a href="/quran.html">القرآن</a> · <a href="/hadith.html">الأحاديث</a> · <a href="/prayer.html">مواقيت الصلاة</a></nav></div></section>'; }
  try { updateDock(); } catch (err) { console.warn('Audio dock update failed', err); }
}
function featuredAyah(){
  const x=state.featuredAyah||readFeaturedAyah();
  const text=String(Q[(x.surah||20)-1]?.[(x.ayah||114)-1]||'وَقُلْ رَبِّ زِدْنِي عِلْمًا').replace(/^\\basmalah\s*/,'');
  return {text,source:`سورة ${NAMES[(x.surah||20)-1]} — الآية ${x.ayah||114}`};
}
function home(){const v=featuredAyah();return `<section class="hero section"><div class="container hero-grid"><div class="hero-copy"><span class="eyebrow">بِسْمِ اللهِ الرَّحْمٰنِ الرَّحِيمِ</span><h1>تقوى<br><span>طريقك إلى الخير والمعرفة</span></h1><p>قرآن كريم، تلاوات صوتية، تفسير، أحاديث، أذكار، سنن، ومواقيت صلاة في تجربة هادئة وسريعة.</p><div class="hero-actions"><a class="btn primary" href="/quran.html" data-route="quran">ابدأ بالقرآن</a><a class="btn ghost" href="/hadith.html" data-route="hadith">الأحاديث</a></div><div class="mini-proof">114 سورة • 143 حديثًا • 102 سنة • مواقيت • مسبحة</div></div><div class="hero-card"><div class="hero-ornament">۞</div><div class="hero-verse" id="homeFeaturedAyah">﴿ ${v.text} ﴾</div><div class="hero-source" id="homeFeaturedSource">${v.source}</div><div class="hero-english">TAQWA</div></div></div></section><section class="section"><div class="container feature-grid"><a class="feature-card" href="/quran.html" data-route="quran"><span>ﷲ</span><b>القرآن الكريم</b><small>قراءة 114 سورة</small></a><a class="feature-card" href="/quran-audio.html" data-route="audio"><span>▥</span><b>القرآن الصوتي</b><small>مشغل تقوى ثابت</small></a><a class="feature-card" href="/tafsir.html" data-route="tafsir"><span>﴿﴾</span><b>التفسير</b><small>التفسير الميسر</small></a><a class="feature-card" href="/hadith.html" data-route="hadith"><span>ﷺ</span><b>الأحاديث</b><small>143 حديثًا</small></a><a class="feature-card" href="/sunan.html" data-route="sunan"><span>☾</span><b>السنن</b><small>102 سنة</small></a><a class="feature-card" href="/azkar.html" data-route="azkar"><span>✦</span><b>الأذكار والأدعية</b><small>أذكار مختارة</small></a><a class="feature-card" href="/prayer.html" data-route="prayer"><span>🕌</span><b>مواقيت الصلاة</b><small>اختيار الدولة ثم المنطقة ثم المدينة</small></a><button type="button" class="feature-card" onclick="openTasbih()"><span>◉</span><b>المسبحة</b><small>تفتح كواجهة مستقلة</small></button></div></section><section class="section"><div class="container glass" style="padding:24px"><div class="section-head"><div><span class="eyebrow">صلاة اليوم</span><h2>مواقيت الصلاة</h2></div><a class="btn ghost" href="/prayer.html" data-route="prayer">عرض كاملة</a></div><div id="homePrayer" class="loading">جاري تحميل المواقيت…</div></div></section>`}

function quran(){return `<section class="section page-hero"><div class="container"><span class="eyebrow">القرآن الكريم</span><h1>اقرأ القرآن الكريم</h1><p>اختر السورة، واقرأ الآيات من البيانات المحلية، مع إمكان تشغيل الآية عبر المشغل العام.</p></div></section><section class="section"><div class="container quran-layout"><aside class="quran-list" id="surahList"></aside><div class="quran-reader"><div class="section-head"><div><span class="tag" id="qBadge">الفاتحة</span><h2 id="qTitle">سورة الفاتحة</h2></div><div><button class="icon-btn" id="fontMinus">A−</button> <button class="icon-btn" id="fontPlus">A+</button></div></div><div class="ayahs" id="ayahs"></div></div></div></div></section>`}
function audioPage(){return `<section class="section page-hero"><div class="container"><span class="eyebrow">القرآن الصوتي</span><h1>استمع للقرآن بصوت القارئ الذي تختاره</h1><p>المشغل يبقى حيًا عند الانتقال بين صفحات تقوى لأن التنقل يتم داخل نفس التطبيق.</p></div></section><section class="section"><div class="container glass" style="padding:22px"><div class="section-head"><select id="audioSurah"></select><select id="audioReciter"></select></div><div class="reciter-grid" id="reciterGrid"></div><div class="source-note" style="margin-top:14px">صور القراء مرتبطة بمصادرها الأصلية: محمد اللحيدان — Quran-Uni، وياسر الدوسري — Wikimedia Commons.</div></div></section>`}
function hadith(){return `<section class="section page-hero"><div class="container"><span class="eyebrow">السنة النبوية</span><h1>أحاديث موثقة</h1><p>143 حديثًا مع المصدر والتصنيف والبحث.</p></div></section><section class="section"><div class="container"><div class="toolbar"><input id="hSearch" class="search-input" placeholder="ابحث في الأحاديث…"><select id="hCat"></select><span id="hCount"></span></div><div class="content-grid" id="hGrid"></div><div class="pagination" id="hPages"></div></div></section>`}
function sunan(){return `<section class="section page-hero"><div class="container"><span class="eyebrow">السنن النبوية</span><h1>102 سنة وعادة نافعة</h1><p>بحث وتصنيف ومصدر لكل سنة.</p></div></section><section class="section"><div class="container"><div class="toolbar"><input id="sSearch" class="search-input" placeholder="ابحث في السنن…"><select id="sCat"></select><span id="sCount"></span></div><div class="content-grid" id="sGrid"></div><div class="pagination" id="sPages"></div></div></section>`}
const AZKAR_DUA = [{"title":"دعاء جامع من القرآن","text":"رَبَّنَا آتِنَا فِي الدُّنْيَا حَسَنَةً وَفِي الْآخِرَةِ حَسَنَةً وَقِنَا عَذَابَ النَّارِ","source":"البقرة: 201","category":"دعاء قرآني"},{"title":"الثبات على الهدى","text":"رَبَّنَا لَا تُزِغْ قُلُوبَنَا بَعْدَ إِذْ هَدَيْتَنَا وَهَبْ لَنَا مِنْ لَدُنْكَ رَحْمَةً إِنَّكَ أَنْتَ الْوَهَّابُ","source":"آل عمران: 8","category":"دعاء قرآني"},{"title":"دعاء التوبة","text":"رَبَّنَا ظَلَمْنَا أَنْفُسَنَا وَإِنْ لَمْ تَغْفِرْ لَنَا وَتَرْحَمْنَا لَنَكُونَنَّ مِنَ الْخَاسِرِينَ","source":"الأعراف: 23","category":"دعاء قرآني"},{"title":"طلب الصبر والثبات","text":"رَبَّنَا أَفْرِغْ عَلَيْنَا صَبْرًا وَثَبِّتْ أَقْدَامَنَا وَانْصُرْنَا عَلَى الْقَوْمِ الْكَافِرِينَ","source":"البقرة: 250","category":"دعاء قرآني"},{"title":"دعاء موسى عليه السلام","text":"رَبِّ اشْرَحْ لِي صَدْرِي ۝ وَيَسِّرْ لِي أَمْرِي ۝ وَاحْلُلْ عُقْدَةً مِنْ لِسَانِي ۝ يَفْقَهُوا قَوْلِي","source":"طه: 25–28","category":"دعاء قرآني"},{"title":"طلب زيادة العلم","text":"رَبِّ زِدْنِي عِلْمًا","source":"طه: 114","category":"دعاء قرآني"},{"title":"صلاح الأسرة والذرية","text":"رَبَّنَا هَبْ لَنَا مِنْ أَزْوَاجِنَا وَذُرِّيَّاتِنَا قُرَّةَ أَعْيُنٍ وَاجْعَلْنَا لِلْمُتَّقِينَ إِمَامًا","source":"الفرقان: 74","category":"دعاء قرآني"},{"title":"سلامة القلب","text":"رَبَّنَا اغْفِرْ لَنَا وَلِإِخْوَانِنَا الَّذِينَ سَبَقُونَا بِالْإِيمَانِ وَلَا تَجْعَلْ فِي قُلُوبِنَا غِلًّا لِلَّذِينَ آمَنُوا رَبَّنَا إِنَّكَ رَءُوفٌ رَحِيمٌ","source":"الحشر: 10","category":"دعاء قرآني"},{"title":"طلب قبول العمل","text":"رَبَّنَا تَقَبَّلْ مِنَّا إِنَّكَ أَنْتَ السَّمِيعُ الْعَلِيمُ","source":"البقرة: 127","category":"دعاء قرآني"},{"title":"الدعاء للوالدين والمؤمنين","text":"رَبَّنَا اغْفِرْ لِي وَلِوَالِدَيَّ وَلِلْمُؤْمِنِينَ يَوْمَ يَقُومُ الْحِسَابُ","source":"إبراهيم: 41","category":"دعاء قرآني"},{"title":"دعاء أيوب عليه السلام","text":"أَنِّي مَسَّنِيَ الضُّرُّ وَأَنْتَ أَرْحَمُ الرَّاحِمِينَ","source":"الأنبياء: 83","category":"دعاء قرآني"},{"title":"دعاء ذي النون","text":"لَا إِلَهَ إِلَّا أَنْتَ سُبْحَانَكَ إِنِّي كُنْتُ مِنَ الظَّالِمِينَ","source":"الأنبياء: 87","category":"دعاء قرآني"},{"title":"طلب الذرية الطيبة","text":"رَبِّ هَبْ لِي مِنْ لَدُنْكَ ذُرِّيَّةً طَيِّبَةً إِنَّكَ سَمِيعُ الدُّعَاءِ","source":"آل عمران: 38","category":"دعاء قرآني"},{"title":"التوكل على الله","text":"حَسْبِيَ اللَّهُ لَا إِلَهَ إِلَّا هُوَ عَلَيْهِ تَوَكَّلْتُ وَهُوَ رَبُّ الْعَرْشِ الْعَظِيمِ","source":"التوبة: 129","category":"دعاء قرآني"},{"title":"طلب إتمام النور والمغفرة","text":"رَبَّنَا أَتْمِمْ لَنَا نُورَنَا وَاغْفِرْ لَنَا إِنَّكَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ","source":"التحريم: 8","category":"دعاء قرآني"},{"title":"طلب الرحمة والرشد","text":"رَبَّنَا آتِنَا مِنْ لَدُنْكَ رَحْمَةً وَهَيِّئْ لَنَا مِنْ أَمْرِنَا رَشَدًا","source":"الكهف: 10","category":"دعاء قرآني"},{"title":"حسن الدخول والخروج","text":"رَبِّ أَدْخِلْنِي مُدْخَلَ صِدْقٍ وَأَخْرِجْنِي مُخْرَجَ صِدْقٍ وَاجْعَلْ لِي مِنْ لَدُنْكَ سُلْطَانًا نَصِيرًا","source":"الإسراء: 80","category":"دعاء قرآني"},{"title":"دعاء المغفرة والرحمة","text":"رَبَّنَا آمَنَّا فَاغْفِرْ لَنَا وَارْحَمْنَا وَأَنْتَ خَيْرُ الرَّاحِمِينَ","source":"المؤمنون: 109","category":"دعاء قرآني"},{"title":"إقامة الصلاة","text":"رَبِّ اجْعَلْنِي مُقِيمَ الصَّلَاةِ وَمِنْ ذُرِّيَّتِي رَبَّنَا وَتَقَبَّلْ دُعَاءِ","source":"إبراهيم: 40","category":"دعاء قرآني"},{"title":"الاستعاذة من عذاب جهنم","text":"رَبَّنَا اصْرِفْ عَنَّا عَذَابَ جَهَنَّمَ إِنَّ عَذَابَهَا كَانَ غَرَامًا","source":"الفرقان: 65","category":"دعاء قرآني"},{"title":"الدعاء بالمغفرة والتوفيق","text":"رَبَّنَا لَا تُؤَاخِذْنَا إِنْ نَسِينَا أَوْ أَخْطَأْنَا","source":"البقرة: 286","category":"دعاء قرآني"},{"title":"طلب الحكمة والصلاح","text":"رَبِّ هَبْ لِي حُكْمًا وَأَلْحِقْنِي بِالصَّالِحِينَ","source":"الشعراء: 83","category":"دعاء قرآني"},{"title":"الدعاء للوالدين","text":"رَبِّ ارْحَمْهُمَا كَمَا رَبَّيَانِي صَغِيرًا","source":"الإسراء: 24","category":"دعاء قرآني"},{"title":"الاستعانة والصبر","text":"رَبَّنَا أَفْرِغْ عَلَيْنَا صَبْرًا وَتَوَفَّنَا مُسْلِمِينَ","source":"الأعراف: 126","category":"دعاء قرآني"},{"title":"سيد الاستغفار","text":"اللَّهُمَّ أَنْتَ رَبِّي لَا إِلَهَ إِلَّا أَنْتَ، خَلَقْتَنِي وَأَنَا عَبْدُكَ، وَأَنَا عَلَى عَهْدِكَ وَوَعْدِكَ مَا اسْتَطَعْتُ، أَعُوذُ بِكَ مِنْ شَرِّ مَا صَنَعْتُ، أَبُوءُ لَكَ بِنِعْمَتِكَ عَلَيَّ، وَأَبُوءُ بِذَنْبِي فَاغْفِرْ لِي، فَإِنَّهُ لَا يَغْفِرُ الذُّنُوبَ إِلَّا أَنْتَ","source":"رواه البخاري","category":"استغفار"},{"title":"ذكر الصباح والمساء","text":"اللَّهُمَّ بِكَ أَصْبَحْنَا وَبِكَ أَمْسَيْنَا وَبِكَ نَحْيَا وَبِكَ نَمُوتُ وَإِلَيْكَ النُّشُورُ","source":"رواه أبو داود والترمذي","category":"الصباح والمساء"},{"title":"طلب العفو والعافية","text":"اللَّهُمَّ إِنِّي أَسْأَلُكَ الْعَفْوَ وَالْعَافِيَةَ فِي الدُّنْيَا وَالْآخِرَةِ","source":"رواه أبو داود وابن ماجه","category":"دعاء"},{"title":"طلب الهدى والتقى","text":"اللَّهُمَّ إِنِّي أَسْأَلُكَ الْهُدَى وَالتُّقَى وَالْعَفَافَ وَالْغِنَى","source":"رواه مسلم","category":"دعاء"},{"title":"الثبات على الدين","text":"يَا مُقَلِّبَ الْقُلُوبِ ثَبِّتْ قَلْبِي عَلَى دِينِكَ","source":"رواه الترمذي","category":"دعاء"},{"title":"الإعانة على العبادة","text":"اللَّهُمَّ أَعِنِّي عَلَى ذِكْرِكَ وَشُكْرِكَ وَحُسْنِ عِبَادَتِكَ","source":"رواه أبو داود والنسائي","category":"بعد الصلاة"},{"title":"الاستعاذة من الهم والكسل","text":"اللَّهُمَّ إِنِّي أَعُوذُ بِكَ مِنَ الْهَمِّ وَالْحَزَنِ، وَالْعَجْزِ وَالْكَسَلِ، وَالْجُبْنِ وَالْبُخْلِ، وَضَلَعِ الدَّيْنِ وَغَلَبَةِ الرِّجَالِ","source":"رواه البخاري","category":"دعاء"},{"title":"دعاء جامع للصلاح","text":"اللَّهُمَّ أَصْلِحْ لِي دِينِيَ الَّذِي هُوَ عِصْمَةُ أَمْرِي، وَأَصْلِحْ لِي دُنْيَايَ الَّتِي فِيهَا مَعَاشِي، وَأَصْلِحْ لِي آخِرَتِي الَّتِي فِيهَا مَعَادِي","source":"رواه مسلم","category":"دعاء"},{"title":"تزكية النفس","text":"اللَّهُمَّ آتِ نَفْسِي تَقْوَاهَا، وَزَكِّهَا أَنْتَ خَيْرُ مَنْ زَكَّاهَا، أَنْتَ وَلِيُّهَا وَمَوْلَاهَا","source":"رواه مسلم","category":"دعاء"},{"title":"دعاء الاستيقاظ","text":"الْحَمْدُ لِلَّهِ الَّذِي أَحْيَانَا بَعْدَ مَا أَمَاتَنَا وَإِلَيْهِ النُّشُورُ","source":"رواه البخاري","category":"الاستيقاظ"},{"title":"دخول الخلاء","text":"اللَّهُمَّ إِنِّي أَعُوذُ بِكَ مِنَ الْخُبُثِ وَالْخَبَائِثِ","source":"متفق عليه","category":"آداب"},{"title":"الخروج من الخلاء","text":"غُفْرَانَكَ","source":"رواه أبو داود والترمذي","category":"آداب"},{"title":"الخروج من المنزل","text":"بِسْمِ اللَّهِ، تَوَكَّلْتُ عَلَى اللَّهِ، وَلَا حَوْلَ وَلَا قُوَّةَ إِلَّا بِاللَّهِ","source":"رواه أبو داود والترمذي","category":"آداب"},{"title":"دخول المسجد","text":"اللَّهُمَّ افْتَحْ لِي أَبْوَابَ رَحْمَتِكَ","source":"رواه مسلم","category":"المسجد"},{"title":"الخروج من المسجد","text":"اللَّهُمَّ إِنِّي أَسْأَلُكَ مِنْ فَضْلِكَ","source":"رواه مسلم","category":"المسجد"},{"title":"قبل الطعام","text":"بِسْمِ اللَّهِ","source":"متفق عليه","category":"الطعام"},{"title":"نسيان التسمية أول الطعام","text":"بِسْمِ اللَّهِ أَوَّلَهُ وَآخِرَهُ","source":"رواه أبو داود والترمذي","category":"الطعام"},{"title":"بعد الطعام","text":"الْحَمْدُ لِلَّهِ الَّذِي أَطْعَمَنِي هَذَا وَرَزَقَنِيهِ مِنْ غَيْرِ حَوْلٍ مِنِّي وَلَا قُوَّةٍ","source":"رواه أبو داود والترمذي","category":"الطعام"},{"title":"دعاء الكرب","text":"لَا إِلَهَ إِلَّا اللَّهُ الْعَظِيمُ الْحَلِيمُ، لَا إِلَهَ إِلَّا اللَّهُ رَبُّ الْعَرْشِ الْعَظِيمِ، لَا إِلَهَ إِلَّا اللَّهُ رَبُّ السَّمَوَاتِ وَرَبُّ الْأَرْضِ وَرَبُّ الْعَرْشِ الْكَرِيمِ","source":"متفق عليه","category":"الكرب"},{"title":"قضاء الدين","text":"اللَّهُمَّ اكْفِنِي بِحَلَالِكَ عَنْ حَرَامِكَ، وَأَغْنِنِي بِفَضْلِكَ عَمَّنْ سِوَاكَ","source":"رواه الترمذي","category":"دعاء"},{"title":"دعاء ليلة القدر","text":"اللَّهُمَّ إِنَّكَ عَفُوٌّ تُحِبُّ الْعَفْوَ فَاعْفُ عَنِّي","source":"رواه الترمذي","category":"رمضان"},{"title":"دعاء عند المصيبة","text":"إِنَّا لِلَّهِ وَإِنَّا إِلَيْهِ رَاجِعُونَ، اللَّهُمَّ أْجُرْنِي فِي مُصِيبَتِي وَأَخْلِفْ لِي خَيْرًا مِنْهَا","source":"رواه مسلم","category":"عند المصيبة"},{"title":"دعاء الاستخارة","text":"اللَّهُمَّ إِنِّي أَسْتَخِيرُكَ بِعِلْمِكَ، وَأَسْتَقْدِرُكَ بِقُدْرَتِكَ، وَأَسْأَلُكَ مِنْ فَضْلِكَ الْعَظِيمِ","source":"رواه البخاري، صدر دعاء الاستخارة","category":"الاستخارة"},{"title":"الاستعاذة من شر النفس","text":"اللَّهُمَّ إِنِّي أَعُوذُ بِكَ مِنْ شَرِّ سَمْعِي وَمِنْ شَرِّ بَصَرِي وَمِنْ شَرِّ لِسَانِي وَمِنْ شَرِّ قَلْبِي","source":"رواه أبو داود والترمذي","category":"دعاء"},{"title":"الذكر بعد السلام من الصلاة","text":"أَسْتَغْفِرُ اللَّهَ، أَسْتَغْفِرُ اللَّهَ، أَسْتَغْفِرُ اللَّهَ، اللَّهُمَّ أَنْتَ السَّلَامُ وَمِنْكَ السَّلَامُ، تَبَارَكْتَ يَا ذَا الْجَلَالِ وَالْإِكْرَامِ","source":"رواه مسلم","category":"بعد الصلاة"},{"title":"التسبيح بعد الصلاة","text":"سُبْحَانَ اللَّهِ، وَالْحَمْدُ لِلَّهِ، وَاللَّهُ أَكْبَرُ","source":"ورد في أحاديث صحيحة بأعداد وصيغ متعددة","category":"بعد الصلاة"},{"title":"الاستعاذة من العلم غير النافع","text":"اللَّهُمَّ إِنِّي أَعُوذُ بِكَ مِنْ عِلْمٍ لَا يَنْفَعُ، وَمِنْ قَلْبٍ لَا يَخْشَعُ، وَمِنْ نَفْسٍ لَا تَشْبَعُ، وَمِنْ دَعْوَةٍ لَا يُسْتَجَابُ لَهَا","source":"رواه مسلم","category":"دعاء"},{"title":"دعاء النوم","text":"بِاسْمِكَ اللَّهُمَّ أَمُوتُ وَأَحْيَا","source":"رواه البخاري","category":"النوم"},{"title":"دعاء التفويض عند النوم","text":"اللَّهُمَّ أَسْلَمْتُ وَجْهِي إِلَيْكَ، وَفَوَّضْتُ أَمْرِي إِلَيْكَ، وَأَلْجَأْتُ ظَهْرِي إِلَيْكَ","source":"متفق عليه، من دعاء النوم","category":"النوم"},{"title":"الصلاة على النبي ﷺ","text":"اللَّهُمَّ صَلِّ وَسَلِّمْ عَلَى نَبِيِّنَا مُحَمَّدٍ","source":"ورد فضل الصلاة على النبي ﷺ في صحيح مسلم","category":"ذكر"}];
function azkar(){return `<section class="section page-hero"><div class="container"><span class="eyebrow">الأذكار والأدعية</span><h1>أذكار وأدعية من القرآن والسنة</h1><p>54 ذكرًا ودعاءً، مع إظهار المصدر والتصنيف لكل نص.</p></div></section><section class="section"><div class="container"><div class="toolbar"><input id="zSearch" class="search-input" placeholder="ابحث في الأذكار والأدعية…" aria-label="البحث في الأذكار والأدعية"><select id="zCat" aria-label="التصنيف"></select><span id="zCount">54 ذكرًا ودعاءً</span></div><div class="content-grid" id="zGrid"></div></div></section>`}
function initAzkar(){
 const search=$('#zSearch'),cat=$('#zCat'),grid=$('#zGrid'),count=$('#zCount'); if(!search||!cat||!grid)return;
 const cats=[...new Set(AZKAR_DUA.map(x=>x.category))]; cat.innerHTML='<option value="">كل الأذكار والأدعية</option>'+cats.map(x=>`<option value="${x}">${x}</option>`).join('');
 const render=()=>{const q=search.value.trim().toLowerCase(),c=cat.value;const rows=AZKAR_DUA.filter(x=>(!c||x.category===c)&&(!q||`${x.title} ${x.text} ${x.source} ${x.category}`.toLowerCase().includes(q)));count.textContent=`${rows.length} من ${AZKAR_DUA.length} ذكرًا ودعاءً`;grid.innerHTML=rows.map(x=>`<article class="content-card"><span class="tag">${x.category}</span><h3>${x.title}</h3><p class="arabic">﴿${x.text}﴾</p><footer>المصدر: ${x.source}</footer></article>`).join('')||'<div class="loading">لا توجد نتائج مطابقة.</div>'};search.addEventListener('input',render);cat.addEventListener('change',render);render();
}

function tafsir(){return `<section class="section page-hero"><div class="container"><span class="eyebrow">التفسير</span><h1>التفسير الميسر</h1><p>اختر السورة لعرض تفسير آياتها. عند تعذر الاتصال ستظهر النسخة المحفوظة إن سبق تحميلها.</p></div></section><section class="section"><div class="container"><div class="toolbar tafsir-toolbar"><label class="sr-only" for="tSurah">اختر السورة</label><select id="tSurah"></select><button class="btn primary" id="tLoad">عرض التفسير</button><label class="sr-only" for="tSearch">البحث في الآيات والتفسير</label><input id="tSearch" type="search" placeholder="ابحث في الآيات أو التفسير…" autocomplete="off"></div><div id="tStatus" class="source-note" role="status" aria-live="polite"></div><div id="tCount" class="source-note"></div><div id="tGrid" class="content-grid tafsir-grid"></div><div id="tPages" class="taf-pagination" aria-label="صفحات التفسير"></div><div class="source-note">التفسير الميسر — مجمع الملك فهد لطباعة المصحف الشريف. مصادر البيانات: Al Quran Cloud وQuranEnc بحسب التوفر.</div></div></section>`}
function prayer(){return `<section class="section page-hero"><div class="container"><span class="eyebrow">مواقيت الصلاة</span><h1>مواقيت الصلاة حسب موقعك</h1><p>اختر الدولة ثم المحافظة/المنطقة ثم المدينة، أو استخدم موقع الهاتف الحالي. تُحفظ اختياراتك على هذا الجهاز.</p></div></section><section class="section"><div class="container"><div class="prayer-select-grid"><label class="select-wrap">الدولة<select id="pCountry"></select></label><label class="select-wrap">المحافظة / المنطقة<select id="pRegion"></select></label><label class="select-wrap">المدينة<select id="pCity"></select></label></div><div class="location-actions"><button class="btn primary" type="button" id="useDeviceLocation">📍 استخدام موقعي الحالي</button><button class="btn ghost" type="button" id="refreshPrayerTimes">تحديث المواقيت</button><small id="locationStatus" role="status">يمكنك تغيير الدولة والمحافظة والمدينة من القوائم أعلاه.</small></div><div id="prayerBox" class="prayer-card" style="padding:20px"><div class="loading">جاري تحميل المواقيت…</div></div><div class="glass" style="padding:20px;margin-top:18px"><b>طرق الحساب:</b><p>الأردن: طريقة وزارة الأوقاف الأردنية (23)؛ السعودية: أم القرى (4)؛ مصر: الهيئة المصرية العامة للمساحة (5). قد تختلف الحسابات عن الجدول المحلي الرسمي ببضع دقائق.</p></div></div></section>`}
function app(){return `<section class="section page-hero"><div class="container"><span class="eyebrow">تطبيق تقوى</span><h1>تقوى على هاتفك</h1><p>ثبّت تقوى كتطبيق من زر تنزيل التطبيق، وستحصل على واجهة مستقلة مع دعم الإشعارات عندما يسمح الجهاز.</p><div class="glass" style="padding:22px;margin-top:18px"><h3>مهم قبل التثبيت</h3><p>يطلب التطبيق الموقع لتحديد المدينة لمواقيت الصلاة، والإشعارات للتذكير بالصلاة. يمكنك رفض أي إذن واختيار المدينة يدويًا.</p></div></div></section>`}
const templates={home,quran,audio:audioPage,hadith,sunan,azkar,tafsir,prayer,app};

function pageInit(r){
  if(r==='quran')initQuran();
  else if(r==='audio')initAudioPage();
  else if(r==='hadith')initList('hadith');
  else if(r==='sunan')initList('sunan');
  else if(r==='azkar')initAzkar();
  else if(r==='tafsir')initTafsir();
  else if(r==='prayer')initPrayer();
  else if(r==='home')loadPrayer(getSavedLoc()||defaultLoc(),'#homePrayer');
}
function initQuran(){
  const list=$('#surahList'); if(!list)return;
  list.innerHTML=NAMES.map((n,i)=>`<button type="button" class="surah-item" data-i="${i}"><span>${i+1}. ${n}</span><small>${Q[i]?.length||0}</small></button>`).join('');
  list.addEventListener('click',e=>{const b=e.target.closest('.surah-item');if(b)showSurah(+b.dataset.i+1)});
  $('#fontPlus').onclick=()=>$('#ayahs').style.fontSize=Math.min(40,(parseFloat(getComputedStyle($('#ayahs')).fontSize)||29)+2)+'px';
  $('#fontMinus').onclick=()=>$('#ayahs').style.fontSize=Math.max(20,(parseFloat(getComputedStyle($('#ayahs')).fontSize)||29)-2)+'px';
  showSurah(state.audio.surah||1);
}
function showSurah(id){
  const idx=Math.max(1,Math.min(114,Number(id)||1))-1;
  $('#qTitle').textContent=`سورة ${NAMES[idx]}`; $('#qBadge').textContent=NAMES[idx];
  $$('.surah-item').forEach(b=>b.classList.toggle('active',+b.dataset.i===idx));
  const arr=(Q[idx]||[]).map(x=>String(x).replace(/^\\basmalah\s*/,''));
  $('#ayahs').innerHTML=arr.map((t,i)=>`<div class="ayah" data-s="${idx+1}" data-a="${i+1}">${t} <span class="ayah-num">${i+1}</span></div>`).join('')||'<div class="loading">تعذر عرض السورة.</div>';
  $$('.ayah').forEach(a=>a.addEventListener('click',()=>playSurah(Number(a.dataset.s))));
}
function playSurah(id){
  if($('#tasbihModal').classList.contains('open')){toast('المسبحة مفتوحة — أغلقها أولًا.');return}
  loadAudio(id,state.audio.reciter,true);
}
function initAudioPage(){
  const s=$('#audioSurah'),r=$('#audioReciter'); if(!s||!r)return;
  s.innerHTML=NAMES.map((n,i)=>`<option value="${i+1}">${i+1} — ${n}</option>`).join('');
  r.innerHTML=Object.entries(RECITERS).map(([k,v])=>`<option value="${k}">${v.name}</option>`).join('');
  s.value=String(state.audio.surah); r.value=state.audio.reciter;
  s.onchange=()=>loadAudio(+s.value,r.value,false);
  r.onchange=()=>loadAudio(state.audio.surah,r.value,false);
  renderReciters();
}
function renderReciters(){
  const g=$('#reciterGrid'); if(!g)return;
  g.innerHTML=Object.entries(RECITERS).map(([k,v])=>`<article class="reciter-card glass"><img class="reciter-photo" loading="eager" src="${v.photo}" alt="صورة ${v.name}" referrerpolicy="no-referrer" onerror="this.src='/quran-icon.svg'"> <div><b>${v.name}</b><div class="source-note">الصورة: ${v.photoSource}</div></div><button type="button" class="small-btn" data-r="${k}">اختيار</button></article>`).join('');
  g.addEventListener('click',e=>{const b=e.target.closest('[data-r]');if(!b)return;state.audio.reciter=b.dataset.r;loadAudio(state.audio.surah,state.audio.reciter,false);$('#audioReciter').value=state.audio.reciter});
}
function setMediaMetadata(){try{if(!('mediaSession'in navigator))return;const r=RECITERS[state.audio.reciter];navigator.mediaSession.metadata=new MediaMetadata({title:`سورة ${NAMES[state.audio.surah-1]}`,artist:r.name,album:'تقوى — القرآن الكريم'});navigator.mediaSession.playbackState=state.audio.playing?'playing':'paused'}catch{}}
function loadAudio(id,reciter,autoplay){
  if($('#tasbihModal').classList.contains('open')){toast('المسبحة مفتوحة — لا يمكن تشغيل القرآن الآن.');return}
  const r=RECITERS[reciter]?reciter:'lohaidan';
  const nextSurah=Math.max(1,Math.min(114,Number(id)||1));
  const nextSrc=RECITERS[r].audio(nextSurah);
  const a=$('#globalAudio');
  if(!a)return;
  const same=a.src===nextSrc;
  state.audio.surah=nextSurah; state.audio.reciter=r; state.audio.src=nextSrc;
  if(!same){a.pause();a.removeAttribute('src');a.load();a.src=nextSrc;a.load();state.audio.time=0}
  setMediaMetadata(); saveAudio(); updateDock();
  if(autoplay){a.play().then(()=>{state.audio.playing=true;saveAudio();updateDock()}).catch(()=>toast('اضغط تشغيل من مشغل القرآن لبدء التلاوة.'))}
}
function initAudio(){
  const a=$('#globalAudio'); if(!a)return;
  let saved={}; try{saved=JSON.parse(localStorage.getItem('taqwaAudio')||'{}')}catch{}
  state.audio.surah=Math.min(114,Math.max(1,Number(saved.surah)||1));
  state.audio.reciter=RECITERS[saved.reciter]?saved.reciter:'lohaidan';
  state.audio.time=Number(saved.time)||0;
  state.audio.src=RECITERS[state.audio.reciter].audio(state.audio.surah);
  // Do not load remote audio until the user presses play; this keeps the site light.
  const sync=()=>{state.audio.time=a.currentTime||0;state.audio.playing=!a.paused;saveAudio();updateDock();setMediaMetadata()};
  a.addEventListener('timeupdate',sync); a.addEventListener('play',sync); a.addEventListener('pause',sync);
  a.addEventListener('loadedmetadata',()=>{if(state.audio.time>0&&state.audio.time<a.duration)a.currentTime=state.audio.time;updateDock()});
  a.addEventListener('error',()=>toast('تعذر تحميل التلاوة. تحقق من اتصال الإنترنت ثم جرّب مرة أخرى.'));
  a.addEventListener('ended',()=>{const next=state.audio.surah<114?state.audio.surah+1:1;loadAudio(next,state.audio.reciter,true)});
  $('#dockMini').onclick=()=>$('#globalAudioDock').classList.add('expanded');
  $('#dockCollapse').onclick=()=>$('#globalAudioDock').classList.remove('expanded');
  $('#dockPlay').onclick=()=>{if($('#tasbihModal').classList.contains('open')){toast('أغلق المسبحة أولًا.');return} a.paused ? (a.src||loadAudio(state.audio.surah,state.audio.reciter,false),a.play().catch(()=>toast('اضغط تشغيل مرة أخرى إذا منع المتصفح التشغيل.'))) : a.pause()};
  $('#dockPrev').onclick=()=>loadAudio(Math.max(1,state.audio.surah-1),state.audio.reciter,true);
  $('#dockNext').onclick=()=>loadAudio(Math.min(114,state.audio.surah+1),state.audio.reciter,true);
  $('#dockMute').onclick=()=>{a.muted=!a.muted;$('#dockMute').textContent=a.muted?'🔇':'🔊'};
  $('#dockSeek').oninput=e=>{if(a.duration)a.currentTime=(+e.target.value/1000)*a.duration};
  if('mediaSession'in navigator){[['play',()=>a.play()],['pause',()=>a.pause()],['previoustrack',()=>loadAudio(Math.max(1,state.audio.surah-1),state.audio.reciter,true)],['nexttrack',()=>loadAudio(Math.min(114,state.audio.surah+1),state.audio.reciter,true)]].forEach(([n,f])=>{try{navigator.mediaSession.setActionHandler(n,f)}catch{}})}
  updateDock();
}
function updateDock(){
  const d=$('#globalAudioDock'); if(!d)return; const a=$('#globalAudio');
  d.classList.toggle('has-track',!!state.audio.src);
  $('#dockMiniTitle').textContent=state.audio.src?`سورة ${NAMES[state.audio.surah-1]}`:'القرآن الصوتي';
  $('#dockMiniPlay').textContent=state.audio.playing?'❚❚':'▶';
  $('#dockSurah').textContent=`سورة ${NAMES[state.audio.surah-1]}`;
  $('#dockReciter').textContent=RECITERS[state.audio.reciter].name;
  const photo=RECITERS[state.audio.reciter].photo; const img=$('#dockPhoto'); if(img&&img.src!==photo)img.src=photo;
  if(img)img.onerror=()=>{img.onerror=null;img.src='/quran-icon.svg'};
  if(a){$('#dockCurrent').textContent=fmt(a.currentTime);$('#dockDuration').textContent=fmt(a.duration);$('#dockSeek').value=a.duration?Math.round(a.currentTime/a.duration*1000):0;}
}
function fmt(v){if(!Number.isFinite(v)||v<0)return'00:00';return`${String(Math.floor(v/60)).padStart(2,'0')}:${String(Math.floor(v%60)).padStart(2,'0')}`}
function saveAudio(){localStorage.setItem('taqwaAudio',JSON.stringify({surah:state.audio.surah,reciter:state.audio.reciter,time:state.audio.time}))}
function initList(type){
  const data=type==='hadith'?S.hadiths:S.sunan; const search=type==='hadith'?$('#hSearch'):$('#sSearch'); const cat=type==='hadith'?$('#hCat'):$('#sCat'); const grid=type==='hadith'?$('#hGrid'):$('#sGrid'); const pages=type==='hadith'?$('#hPages'):$('#sPages'); const count=type==='hadith'?$('#hCount'):$('#sCount'); if(!search||!cat||!grid||!pages)return;
  const cats=[...new Set(data.map(x=>x.category).filter(Boolean))]; cat.innerHTML='<option value="">كل التصنيفات</option>'+cats.map(x=>`<option>${x}</option>`).join(''); let pg=1; const per=10;
  const draw=()=>{const q=search.value.trim().toLowerCase(),c=cat.value;const f=data.filter(x=>(!q||JSON.stringify(x).toLowerCase().includes(q))&&(!c||x.category===c));count.textContent=`${f.length} ${type==='hadith'?'حديث':'سنة'}`;const max=Math.max(1,Math.ceil(f.length/per));pg=Math.min(pg,max);const sl=f.slice((pg-1)*per,pg*per);grid.innerHTML=sl.map(x=>`<article class="content-card"><span class="tag">${x.category||'عام'}</span><h3>${x.title||''}</h3><p class="${type==='hadith'?'arabic':''}">${type==='hadith'?x.text:x.description}</p><footer>${x.source||''}</footer></article>`).join('')||'<div class="loading">لا توجد نتائج.</div>';pages.innerHTML=Array.from({length:max},(_,i)=>`<button type="button" class="page-btn ${i+1===pg?'active':''}" data-p="${i+1}">${i+1}</button>`).join('')};search.oninput=()=>{pg=1;draw()};cat.onchange=()=>{pg=1;draw()};pages.onclick=e=>{const b=e.target.closest('[data-p]');if(b){pg=+b.dataset.p;draw()}};draw();
}
async function fetchJson(url,opts={}){const controller=new AbortController();const timer=setTimeout(()=>controller.abort(),8500);try{const r=await fetch(url,{...opts,signal:controller.signal});if(!r.ok)throw new Error(`HTTP ${r.status}`);return await r.json()}finally{clearTimeout(timer)}}
const TAFSIR_CACHE_PREFIX='taqwaTafsirV22_';
function escapeHTML(value){return String(value??'').replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]))}
function readTafsirCache(id){try{const raw=localStorage.getItem(TAFSIR_CACHE_PREFIX+id);if(!raw)return null;const data=JSON.parse(raw);return Array.isArray(data.entries)&&data.entries.length?data:null}catch{return null}}
function writeTafsirCache(id,data){const key=TAFSIR_CACHE_PREFIX+id;const packed=JSON.stringify({...data,savedAt:Date.now()});try{localStorage.setItem(key,packed);return}catch{};try{for(let i=localStorage.length-1;i>=0;i--){const k=localStorage.key(i);if(k&&k.startsWith(TAFSIR_CACHE_PREFIX)&&k!==key)localStorage.removeItem(k)}localStorage.setItem(key,packed)}catch{}}
function normalizeTafsirResponse(source,j){let arr=[];if(source==='cloud'){if(j?.code&&j.code!==200)throw new Error(j.status||'Al Quran Cloud response error');arr=j?.data?.ayahs||[]}else{arr=Array.isArray(j)?j:(Array.isArray(j?.data)?j.data:(Array.isArray(j?.result)?j.result:[]))}const entries=arr.map((x,i)=>({aya:Number(x.aya??x.numberInSurah??i+1),translation:String(x.translation??x.text??''),footnotes:String(x.footnotes??'')})).filter(x=>Number.isInteger(x.aya)&&x.aya>0&&x.translation.trim());if(!entries.length)throw new Error('No tafsir entries returned');return entries}
async function fetchSurahTafsir(id){const sources=[{name:'Al Quran Cloud',url:`https://api.alquran.cloud/v1/surah/${id}/ar.muyassar`,key:'cloud'},{name:'QuranEnc',url:`https://quranenc.com/api/v1/translation/sura/arabic_moyassar/${id}`,key:'quranenc'}];const errors=[];for(const source of sources){try{const data=await fetchJson(source.url,{cache:'no-store'});return{entries:normalizeTafsirResponse(source.key,data),source:source.name}}catch(err){errors.push(`${source.name}: ${err?.message||'تعذر الاتصال'}`)}}throw new Error(errors.join(' | '))}
function tafsirErrorHTML(id){return `<div class="tafsir-error"><p>تعذر جلب التفسير الآن. تحقق من الإنترنت ثم أعد المحاولة، أو افتح التفسير من المصدر مباشرة.</p><button type="button" class="btn primary" id="tRetry">إعادة المحاولة</button><a class="btn ghost" href="https://quranenc.com/ar/browse/arabic_moyassar/${id}-1" target="_blank" rel="noopener noreferrer">فتح المصدر</a></div>`}
async function initTafsir(){const s=$('#tSurah'),load=$('#tLoad'),grid=$('#tGrid'),search=$('#tSearch'),pages=$('#tPages'),status=$('#tStatus'),count=$('#tCount');if(!s||!load||!grid)return;s.innerHTML=NAMES.map((n,i)=>`<option value="${i+1}">${i+1} — ${n}</option>`).join('');let entries=[],page=1,sourceName='',loading=false;const pageSize=20;
  const draw=()=>{const query=(search?.value||'').trim().toLocaleLowerCase('ar');const filtered=entries.filter(x=>{if(!query)return true;const verse=Q[+s.value-1]?.[x.aya-1]||'';return String(x.aya).includes(query)||verse.toLocaleLowerCase('ar').includes(query)||x.translation.toLocaleLowerCase('ar').includes(query)});const max=Math.max(1,Math.ceil(filtered.length/pageSize));page=Math.min(Math.max(1,page),max);const shown=filtered.slice((page-1)*pageSize,page*pageSize);count.textContent=entries.length?`عدد الآيات: ${entries.length} • النتائج: ${filtered.length} • الصفحة ${page} من ${max}`:'';grid.innerHTML=shown.map(x=>{const verse=String(Q[+s.value-1]?.[x.aya-1]||'').replace(/^\\basmalah\s*/,'');return `<article class="content-card tafsir-card"><span class="tag">الآية ${x.aya} · سورة ${escapeHTML(NAMES[+s.value-1])}</span>${verse?`<div class="tafsir-verse">﴿ ${escapeHTML(verse)} ﴾</div>`:''}<p class="tafsir-meaning">${escapeHTML(x.translation)}</p>${x.footnotes?`<details class="tafsir-footnotes"><summary>الحواشي</summary><p>${escapeHTML(x.footnotes)}</p></details>`:''}</article>`}).join('')||'<div class="loading">لا توجد نتائج مطابقة للبحث.</div>';pages.innerHTML=max>1?`<button type="button" class="page-btn" data-p="${Math.max(1,page-1)}" ${page===1?'disabled':''}>السابق</button>${Array.from({length:max},(_,i)=>`<button type="button" class="page-btn ${i+1===page?'active':''}" data-p="${i+1}" aria-label="الصفحة ${i+1}" ${i+1===page?'aria-current="page"':''}>${i+1}</button>`).join('')}<button type="button" class="page-btn" data-p="${Math.min(max,page+1)}" ${page===max?'disabled':''}>التالي</button>`:''};
  const loadSurah=async()=>{const id=+s.value;page=1;if(search)search.value='';const cached=readTafsirCache(id);entries=cached?.entries||[];sourceName=cached?.source||'';draw();if(status)status.textContent=cached?`تُعرض نسخة محفوظة من التفسير${sourceName?` (${sourceName})`:''}، جارٍ محاولة تحديثها…`:'جارٍ تحميل التفسير…';if(!cached)grid.innerHTML='<div class="loading">جارٍ تحميل التفسير…</div>';loading=true;load.disabled=true;load.textContent='جارٍ التحميل…';try{const fresh=await fetchSurahTafsir(id);entries=fresh.entries;sourceName=fresh.source;writeTafsirCache(id,{entries,source:sourceName});draw();if(status)status.textContent=`تم تحميل التفسير من ${sourceName}. يمكنك البحث والتنقل بين الصفحات.`}catch(err){if(cached){if(status)status.textContent='تعذر تحديث النسخة المحفوظة؛ يمكنك متابعة القراءة دون اتصال.'}else{if(status)status.textContent='لم نتمكن من الاتصال بمصادر التفسير.';grid.innerHTML=tafsirErrorHTML(id);const retry=$('#tRetry');if(retry)retry.onclick=loadSurah}}finally{loading=false;load.disabled=false;load.textContent='عرض التفسير'}};
  load.onclick=loadSurah;if(search)search.oninput=()=>{page=1;draw()};pages.onclick=e=>{const b=e.target.closest('[data-p]');if(b&&!b.disabled){page=+b.dataset.p;draw();grid.scrollIntoView({behavior:'smooth',block:'start'})}};}

const COUNTRY_TIMEZONES={jordan:'Asia/Amman',saudi:'Asia/Riyadh',egypt:'Africa/Cairo'};
function normalizeLocation(loc){
  const fallback=defaultLoc(); if(!loc||typeof loc!=='object')return fallback;
  let country=String(loc.country||'jordan').toLowerCase();
  if(['ksa','saudiarabia','saudi-arabia','السعودية'].includes(country))country='saudi';
  if(['jo','jordan','الأردن'].includes(country))country='jordan';
  if(['eg','egypt','مصر'].includes(country))country='egypt';
  const countries=window.TAQWA_LOCATIONS||{}; if(!countries[country])country='jordan';
  const regions=countries[country].regions; let region=String(loc.region||'');
  if(!regions[region])region=Object.keys(regions)[0];
  const cities=regions[region].cities||[];
  let ci=Number.isInteger(+loc.cityIndex)?+loc.cityIndex:0;
  if(ci<0||ci>=cities.length){
    const found=cities.findIndex(c=>c.name===loc.city);
    ci=found>=0?found:0;
  }
  // Never trust a stale timezone or stale coordinates from localStorage.
  // Rebuild the selected place from the current, canonical city catalogue.
  const canonical=locationFor(country,region,ci);
  if(loc.locationMode==='gps' && Number.isFinite(Number(loc.lat)) && Number.isFinite(Number(loc.lon)) && Math.abs(Number(loc.lat))<=90 && Math.abs(Number(loc.lon))<=180){
    canonical.lat=Number(loc.lat); canonical.lon=Number(loc.lon); canonical.locationMode='gps'; canonical.city='موقعي الحالي'; canonical.nearestCity=cities[ci]?.name||'';
  }
  return canonical;
}
function getSavedLoc(){try{const raw=JSON.parse(localStorage.getItem('taqwaLocation')||'null');return raw?normalizeLocation(raw):null}catch{return null}}
function defaultLoc(){const r=window.TAQWA_LOCATIONS.jordan.regions.amman.cities[0];return{country:'jordan',region:'amman',cityIndex:0,city:r.name,lat:r.lat,lon:r.lon,label:'الأردن',regionName:'العاصمة عمّان',timeZone:'Asia/Amman'}}
function locationFor(country,region,index=0){const reg=window.TAQWA_LOCATIONS[country].regions[region];const city=reg.cities[index]||reg.cities[0];const tz=COUNTRY_TIMEZONES[country]||'Asia/Amman';return{country,region,cityIndex:Math.max(0,Math.min(reg.cities.length-1,index)),city:city.name,lat:city.lat,lon:city.lon,label:window.TAQWA_LOCATIONS[country].label,regionName:reg.name,timeZone:tz}}
function dateForTZ(tz){const parts=new Intl.DateTimeFormat('en-GB',{timeZone:tz,year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(new Date());const m=Object.fromEntries(parts.map(x=>[x.type,x.value]));return`${m.day}-${m.month}-${m.year}`}
function methodFor(country){return({jordan:23,saudi:4,egypt:5})[country]||23}
// API versions can return either HH:mm (with an offset suffix) or ISO 8601.
// Slicing the first five characters of ISO timestamps displays "2026-" instead of the time.
function normalizePrayerTime(value){
  if(value===null||value===undefined)return null;
  const s=String(value).trim();
  let m=s.match(/T(\d{2}):(\d{2})(?::\d{2})?(?:Z|[+-]\d{2}:?\d{2})?$/);
  if(m)return`${m[1]}:${m[2]}`;
  m=s.match(/^(\d{1,2}):(\d{2})/);
  if(m)return`${m[1].padStart(2,'0')}:${m[2]}`;
  return null;
}
function normalizeTimings(timings){
  if(!timings||typeof timings!=='object')throw new Error('No timings');
  const out={};
  for(const k of ['Fajr','Sunrise','Dhuhr','Asr','Maghrib','Isha']){
    const t=normalizePrayerTime(timings[k]); if(!t)throw new Error(`Invalid prayer time: ${k}`); out[k]=t;
  }
  return out;
}
async function fetchPrayer(inputLoc){
  const loc=normalizeLocation(inputLoc); const date=dateForTZ(loc.timeZone); const method=methodFor(loc.country);
  // Explicit location timezone avoids the API falling back to a server timezone.
  // Time values are normalized before rendering/scheduling to handle ISO responses too.
  const u=`https://api.aladhan.com/v1/timings/${date}?latitude=${encodeURIComponent(loc.lat)}&longitude=${encodeURIComponent(loc.lon)}&method=${method}&school=0&timezonestring=${encodeURIComponent(loc.timeZone)}&iso8601=true`;
  const j=await fetchJson(u,{cache:'no-store'}); const timings=normalizeTimings(j.data?.timings);
  const apiTz=j.data?.meta?.timezone;
  if(apiTz&&apiTz!==loc.timeZone)console.warn('Prayer API timezone differs from selected city:',apiTz,loc.timeZone);
  return{timings,raw:j,date,loc,method};
}
function prayerCacheKey(loc){const n=normalizeLocation(loc);return`taqwaPrayerV21:${n.country}:${n.region}:${n.cityIndex}:${dateForTZ(n.timeZone)}`}
function loadCachedPrayer(loc){try{const v=JSON.parse(localStorage.getItem(prayerCacheKey(loc))||'null');if(v?.timings)return normalizeTimings(v.timings)}catch{}return null}
function saveCachedPrayer(loc,timings){try{localStorage.setItem(prayerCacheKey(loc),JSON.stringify({timings:normalizeTimings(timings),savedAt:Date.now(),version:21}))}catch{}}
function formatCityLabel(loc){return loc.locationMode==='gps'?`${loc.label} · ${loc.regionName} · الموقع الحالي (الأقرب: ${loc.nearestCity||"مدينة قريبة"})`:`${loc.label} · ${loc.regionName} · ${loc.city}`}
function renderPrayerBox(loc,timings,target,offline=false){
  const b=$(target); if(!b)return;
  const arr=[['Fajr','الفجر'],['Sunrise','الشروق'],['Dhuhr','الظهر'],['Asr','العصر'],['Maghrib','المغرب'],['Isha','العشاء']];
  const enabled=localStorage.getItem('taqwaAdhanSoundEnabled')==='1';
  b.innerHTML=`<div class="section-head"><div><span class="tag">${loc.label}</span><h3>${loc.city}</h3><p>${formatCityLabel(loc)}</p></div><span class="source-note">${offline?'آخر بيانات محفوظة':'AlAdhan • طريقة الحساب المختارة'}</span></div>
  <div class="prayer-grid">${arr.map(([k,n])=>`<div class="prayer-item"><span>${n}</span><b>${normalizePrayerTime(timings[k])||'—'}</b></div>`).join('')}</div>
  <section class="adhan-audio-settings" aria-label="إعدادات صوت الأذان"><div class="adhan-setting-head"><div><b>صوت الأذان</b><small id="adhanSoundStatus">${enabled?'مفعّل — اضغط تجربة للتأكد من الصوت':'غير مفعّل بعد'}</small></div><span class="adhan-sound-icon">♫</span></div><div class="adhan-setting-actions"><button type="button" class="btn primary" id="enableAdhanSound">${enabled?'إعادة تفعيل الصوت':'تفعيل صوت الأذان'}</button><button type="button" class="btn ghost" id="testAdhanSound">تجربة الأذان</button><button type="button" class="btn ghost" id="stopAdhanSound">إيقاف الصوت</button></div><p class="adhan-help">اضغط «تفعيل صوت الأذان» مرة واحدة واسمح بالصوت من جهازك. سيحاول الموقع تشغيله عند الوقت المحدد ما دام الموقع يعمل. عند إغلاق المتصفح بالكامل لا يمكن ضمان تشغيل الصوت من موقع ويب.</p><div class="adhan-credit">مصدر الصوت: Adhan Recordings from Doha, Qatar — Public Domain Mark 1.0.</div></section>`;
}
async function loadPrayer(loc,target){const b=$(target);if(!b)return;b.innerHTML='<div class="loading">جاري جلب مواقيت الصلاة…</div>';try{const res=await fetchPrayer(loc);saveCachedPrayer(loc,res.timings);state.prayer={loc,timings:res.timings};renderPrayerBox(loc,res.timings,target,false);scheduleAdhan(loc,res.timings)}catch{const cached=loadCachedPrayer(loc);if(cached){state.prayer={loc,timings:cached};renderPrayerBox(loc,cached,target,true);scheduleAdhan(loc,cached)}else{b.innerHTML='<div class="loading">لم نتمكن من جلب المواقيت. افتح الإنترنت ثم اضغط تحديث.</div>'}}}
function fillLocations(saved){
  const c=$('#pCountry'),r=$('#pRegion'),ci=$('#pCity'); if(!c||!r||!ci)return;
  const all=window.TAQWA_LOCATIONS||{};
  c.innerHTML=Object.entries(all).map(([k,v])=>`<option value="${k}">${v.label}</option>`).join('');
  c.disabled=false;r.disabled=false;ci.disabled=false;
  let initial=saved&&all[saved.country]?normalizeLocation(saved):defaultLoc();
  c.value=initial.country;
  const populateCities=(wantedIndex=0)=>{
    const regions=all[c.value]?.regions||{};const cities=regions[r.value]?.cities||[];
    ci.innerHTML=cities.map((x,i)=>`<option value="${i}">${x.name}</option>`).join('');
    ci.disabled=cities.length===0;
    ci.value=String(Math.max(0,Math.min(cities.length-1,Number(wantedIndex)||0)));
  };
  const populateRegions=(preferredRegion=null,preferredIndex=0)=>{
    const regions=all[c.value]?.regions||{};const keys=Object.keys(regions);
    r.innerHTML=Object.entries(regions).map(([k,v])=>`<option value="${k}">${v.name}</option>`).join('');
    r.disabled=keys.length===0;
    r.value=preferredRegion&&regions[preferredRegion]?preferredRegion:(keys[0]||'');
    populateCities(preferredIndex);
  };
  const saveAndLoad=()=>{
    if(!all[c.value]?.regions?.[r.value]?.cities?.length)return;
    const loc=locationFor(c.value,r.value,+ci.value);localStorage.setItem('taqwaLocation',JSON.stringify(loc));
    const status=$('#locationStatus');if(status)status.textContent=`الموقع المختار: ${formatCityLabel(loc)}`;
    loadPrayer(loc,'#prayerBox');
  };
  c.onchange=()=>{initial=null;populateRegions(null,0);saveAndLoad()};
  r.onchange=()=>{populateCities(0);saveAndLoad()};
  ci.onchange=saveAndLoad;
  populateRegions(initial.region,initial.cityIndex);
}
function distanceKm(lat1,lon1,lat2,lon2){
 const rad=x=>x*Math.PI/180;const dLat=rad(lat2-lat1),dLon=rad(lon2-lon1);
 const a=Math.sin(dLat/2)**2+Math.cos(rad(lat1))*Math.cos(rad(lat2))*Math.sin(dLon/2)**2;
 return 6371*2*Math.atan2(Math.sqrt(a),Math.sqrt(Math.max(0,1-a)));
}
function nearestSupportedLocation(lat,lon){
 let best=null;for(const [country,cfg] of Object.entries(window.TAQWA_LOCATIONS)){for(const [region,rg] of Object.entries(cfg.regions)){rg.cities.forEach((city,cityIndex)=>{const km=distanceKm(lat,lon,city.lat,city.lon);if(!best||km<best.distanceKm)best={distanceKm:km,country,region,cityIndex,city}})}}return best;
}
function useCurrentDeviceLocation(){
 const btn=$('#useDeviceLocation'),status=$('#locationStatus');
 if(!navigator.geolocation){if(status)status.textContent='المتصفح لا يدعم تحديد الموقع؛ اختر المدينة يدويًا.';return}
 if(location.protocol!=='https:'&&location.hostname!=='localhost'&&location.hostname!=='127.0.0.1'){if(status)status.textContent='تحديد الموقع يحتاج إلى HTTPS. افتح موقع تقوى المنشور أو اختر موقعك يدويًا.';return}
 if(btn){btn.disabled=true;btn.textContent='جارٍ تحديد الموقع…'}if(status)status.textContent='اسمح للمتصفح بالوصول إلى الموقع لتحديد أقرب مدينة مدعومة.';
 navigator.geolocation.getCurrentPosition(pos=>{
   const nearest=nearestSupportedLocation(pos.coords.latitude,pos.coords.longitude);
   if(btn){btn.disabled=false;btn.textContent='📍 استخدام موقعي الحالي'}
   if(!nearest||nearest.distanceKm>180){if(status)status.textContent='لم نجد مدينة مدعومة قريبة من موقعك. اختر الدولة والمحافظة والمدينة يدويًا.';return}
   const loc=locationFor(nearest.country,nearest.region,nearest.cityIndex);
   loc.lat=pos.coords.latitude;loc.lon=pos.coords.longitude;loc.locationMode='gps';loc.city='موقعي الحالي';loc.nearestCity=nearest.city.name;
   localStorage.setItem('taqwaLocation',JSON.stringify(loc));
   fillLocations(loc);if(status)status.textContent=`تم استخدام إحداثيات جهازك الحالية. أقرب مدينة بالقائمة: ${nearest.city.name} (نحو ${Math.round(nearest.distanceKm)} كم). يمكنك تبديل المحافظة أو المدينة يدويًا.`;
   loadPrayer(loc,'#prayerBox');
 },err=>{
   if(btn){btn.disabled=false;btn.textContent='📍 استخدام موقعي الحالي'}
   const message=err.code===1?'رفضت إذن الموقع. فعّله من إعدادات المتصفح أو اختر المدينة يدويًا.':err.code===2?'تعذر تحديد الموقع. تأكد من تشغيل خدمات الموقع.':'انتهت مهلة تحديد الموقع؛ حاول مرة أخرى أو اختر يدويًا.';
   if(status)status.textContent=message;
 },{enableHighAccuracy:true,timeout:15000,maximumAge:120000});
}
function initPrayer(){const loc=normalizeLocation(getSavedLoc()||defaultLoc());localStorage.setItem('taqwaLocation',JSON.stringify(loc));fillLocations(loc);loadPrayer(loc,'#prayerBox');const btn=$('#useDeviceLocation');if(btn)btn.addEventListener('click',useCurrentDeviceLocation);const refresh=$('#refreshPrayerTimes');if(refresh)refresh.addEventListener('click',()=>loadPrayer(getSavedLoc()||defaultLoc(),'#prayerBox'));}

function openTasbih(){const a=$('#globalAudio');if(a&&!a.paused){a.pause();toast('تم إيقاف القرآن عند فتح المسبحة.')}$('#tasbihModal').classList.add('open');}
function closeTasbih(){$('#tasbihModal').classList.remove('open')}
function initTasbih(){
  let n=Number(localStorage.getItem('taqwaTasbih')||0);const count=$('#tasbihCount');const paint=()=>{count.textContent=n;localStorage.setItem('taqwaTasbih',String(n))};
  $('#tasbihFab').onclick=openTasbih;$('#tasbihClose').onclick=closeTasbih;$('#tasbihTap').onclick=()=>{const a=$('#globalAudio');if(a&&!a.paused)a.pause();n++;paint();const target=+$('#tasbihTarget').value;if(target&&n>=target){toast(`أتممت ${target} تسبيحة 🌿`);n=0;paint()}};$('#tasbihReset').onclick=()=>{n=0;paint()};paint();window.openTasbih=openTasbih
}
let deferredPrompt=window.__TAQWA_INSTALL_PROMPT||null;
function isInstalledPWA(){return !!(window.matchMedia?.('(display-mode: standalone)').matches||window.matchMedia?.('(display-mode: minimal-ui)').matches||navigator.standalone===true)}
function setupInstall(){deferredPrompt=window.__TAQWA_INSTALL_PROMPT||deferredPrompt;const btn=$('#installBtn');if(btn){btn.textContent=isInstalledPWA()?'تقوى مثبت بالفعل':'تثبيت التطبيق';btn.setAttribute('aria-label','تثبيت تقوى كتطبيق مستقل');btn.onclick=openInstall}addEventListener('taqwa-install-prompt-ready',()=>{deferredPrompt=window.__TAQWA_INSTALL_PROMPT||deferredPrompt;if(btn&&!isInstalledPWA())btn.textContent='تثبيت التطبيق'});addEventListener('appinstalled',()=>{deferredPrompt=null;window.__TAQWA_INSTALL_PROMPT=null;if(btn)btn.textContent='تقوى مثبت بالفعل';$('#installModal')?.classList.remove('open');toast('تم تثبيت تقوى كتطبيق على جهازك.')})}
function openInstall(){const modal=$('#installModal'),body=$('#installBody');if(!modal||!body)return;if(isInstalledPWA()){body.innerHTML='<p class="install-success">تقوى مثبت بالفعل كتطبيق مستقل على هذا الجهاز.</p>';modal.classList.add('open');return}const ua=navigator.userAgent||'',isIOS=/iPhone|iPad|iPod/i.test(ua),isAndroid=/Android/i.test(ua);let guidance=isIOS?'<p><b>على iPhone أو iPad:</b> افتح الموقع في Safari، اضغط «مشاركة»، ثم «إضافة إلى الشاشة الرئيسية» وفعّل «فتح كتطبيق ويب» إن ظهر الخيار.</p>':isAndroid?'<p><b>على Android:</b> افتح الموقع في Chrome أو Edge، ثم قائمة ⋮ واختر «تثبيت التطبيق» أو «Install app». اختَر التثبيت، وليس «إنشاء اختصار» إذا ظهر الخياران.</p>':'<p><b>على الكمبيوتر:</b> من شريط العنوان أو قائمة المتصفح اختر «تثبيت تقوى / Install app».</p>';body.innerHTML=`<p>تثبيت تقوى كتطبيق ويب تقدّمي يجعله يفتح في نافذة مستقلة عن تبويب المتصفح. يجب أن تكون النسخة المنشورة على HTTPS.</p>${guidance}<div class="install-note" role="note">إذا لم يظهر خيار «تثبيت التطبيق»، افتح الموقع من متصفح يدعم PWA وحدّث الصفحة بعد نشر آخر نسخة. خيار إضافة اختصار فقط قد يفتح الموقع داخل المتصفح.</div>${deferredPrompt?'<button type="button" class="btn primary" id="installNow">تثبيت الآن</button>':'<button type="button" class="btn ghost" id="installCheck">تحقق مجددًا</button>'}`;modal.classList.add('open');const now=$('#installNow');if(now)now.onclick=async()=>{const prompt=deferredPrompt||window.__TAQWA_INSTALL_PROMPT;if(!prompt){body.insertAdjacentHTML('beforeend','<p class="install-note">لم يوفّر المتصفح طلب تثبيت مباشر؛ استخدم خطوات قائمة المتصفح أعلاه.</p>');return}try{await prompt.prompt();const result=await prompt.userChoice;if(result?.outcome==='accepted')modal.classList.remove('open')}catch(err){toast('لم يبدأ التثبيت؛ استخدم قائمة المتصفح.')}finally{deferredPrompt=null;window.__TAQWA_INSTALL_PROMPT=null}};const check=$('#installCheck');if(check)check.onclick=()=>{deferredPrompt=window.__TAQWA_INSTALL_PROMPT||deferredPrompt;if(deferredPrompt){openInstall()}else toast('حدّث الصفحة، ثم جرّب خيار «تثبيت التطبيق» من قائمة المتصفح.')}}
async function askNotify(){if('Notification'in window&&Notification.permission==='default'){try{return await Notification.requestPermission()}catch{}}return 'default'}
function initOnboarding(){
  const standalone=matchMedia('(display-mode: standalone)').matches||navigator.standalone===true;if(!standalone||localStorage.getItem('taqwaOnboarded')==='1')return;
  const g=$('#permissionGate');g.classList.remove('hidden');
  g.innerHTML=`<div class="permission-box glass"><div class="permission-logo"><img src="/logo.webp" alt="تقوى"></div><span class="eyebrow">مرحبًا بك في تقوى</span><h2>نجهّز مواقيت الصلاة والأذان</h2><p>نطلب الموقع لتحديد الدولة والمنطقة والمدينة بدقة، ونطلب الإشعارات لتذكيرك بمواقيت الصلاة. يمكنك اختيار موقعك يدويًا إذا لم ترغب بمنح الموقع.</p><div class="permission-actions"><button class="btn primary" id="allowLoc">تحديد موقعي</button><button class="btn ghost" id="manualPick">اختيار يدوي</button></div><div id="manualPicker" style="display:none;margin-top:14px"><label class="select-wrap">الدولة<select id="onCountry"></select></label><label class="select-wrap">المنطقة<select id="onRegion"></select></label><label class="select-wrap">المدينة<select id="onCity"></select></label><button class="btn primary" id="saveManual" style="margin-top:12px">متابعة</button></div><div id="permStatus" class="small-note" style="margin-top:12px">سيتم استخدام البيانات فقط لتحديد المواقيت والتنبيهات.</div></div>`;
  const fill=()=>{const c=$('#onCountry'),r=$('#onRegion'),ci=$('#onCity');c.innerHTML=Object.entries(window.TAQWA_LOCATIONS).map(([k,v])=>`<option value="${k}">${v.label}</option>`).join('');const setR=()=>{r.innerHTML=Object.entries(window.TAQWA_LOCATIONS[c.value].regions).map(([k,v])=>`<option value="${k}">${v.name}</option>`).join('');setC()};const setC=()=>{ci.innerHTML=window.TAQWA_LOCATIONS[c.value].regions[r.value].cities.map((x,i)=>`<option value="${i}">${x.name}</option>`).join('')};c.onchange=setR;r.onchange=setC;setR()};
  $('#manualPick').onclick=()=>{$('#manualPicker').style.display=$('#manualPicker').style.display==='none'?'block':'none';fill()};
  $('#saveManual').onclick=async()=>{const loc=locationFor($('#onCountry').value,$('#onRegion').value,+$('#onCity').value);localStorage.setItem('taqwaLocation',JSON.stringify(loc));await askNotify();finishGate()};
  $('#allowLoc').onclick=()=>{if(!navigator.geolocation){$('#permStatus').textContent='هذا المتصفح لا يدعم تحديد الموقع. اختر يدويًا.';return}$('#permStatus').textContent='جارٍ طلب إذن الموقع…';navigator.geolocation.getCurrentPosition(async p=>{const nearest=nearestSupportedLocation(p.coords.latitude,p.coords.longitude);if(!nearest||nearest.distanceKm>180){$('#permStatus').textContent='يبدو أن موقعك خارج الأردن والسعودية ومصر؛ اختر الدولة والمدينة يدويًا.';return}const loc=locationFor(nearest.country,nearest.region,nearest.cityIndex);localStorage.setItem('taqwaLocation',JSON.stringify(loc));await askNotify();finishGate()},()=>{$('#permStatus').textContent='تعذر تحديد الموقع؛ اختر يدويًا.'},{enableHighAccuracy:true,timeout:12000,maximumAge:300000})};
}
function finishGate(){localStorage.setItem('taqwaOnboarded','1');$('#permissionGate')?.classList.add('hidden')}
function protect(){document.addEventListener('contextmenu',e=>e.preventDefault());document.addEventListener('keydown',e=>{const k=e.key.toLowerCase();if((e.ctrlKey||e.metaKey)&&(['u','s'].includes(k)||(e.shiftKey&&['i','j','c'].includes(k))))e.preventDefault()})}
const ADHAN_AUDIO_SOURCES={
  regular:[
    'https://upload.wikimedia.org/wikipedia/commons/e/e7/Adhan.ogg',
    'https://commons.wikimedia.org/wiki/Special:Redirect/file/Beautiful_adhan.ogg',
    'https://archive.org/download/adhan.recordings.from.doha.qatar/Adhan_Doha_Qatar_02_Dhuhr_Adhan.mp3',
    'https://commons.wikimedia.org/wiki/Special:Redirect/file/Adhan.ogg'
  ],
  fajr:[
    'https://archive.org/download/adhan.recordings.from.doha.qatar/Adhan_Doha_Qatar_01_Fajr_Adhan.mp3',
    'https://upload.wikimedia.org/wikipedia/commons/e/e7/Adhan.ogg',
    'https://commons.wikimedia.org/wiki/Special:Redirect/file/Beautiful_adhan.ogg'
  ]
};
let adhanEl=null, adhanSourceIndex=0, adhanTimers=[], prayerRefreshTimer=null, adhanIsTest=false;
function adhanAudio(){
  if(adhanEl)return adhanEl;
  adhanEl=document.createElement('audio');
  adhanEl.id='taqwaAdhanAudio'; adhanEl.preload='auto'; adhanEl.playsInline=true; adhanEl.volume=1; adhanEl.controls=false;
  adhanEl.setAttribute('aria-label','صوت الأذان');
  Object.assign(adhanEl.style,{position:'fixed',width:'1px',height:'1px',opacity:'0',pointerEvents:'none',bottom:'0',left:'0'});
  document.body.appendChild(adhanEl);
  adhanEl.addEventListener('error',()=>{
    if(adhanIsTest) updateAdhanStatus('تعذر تحميل هذا المصدر؛ أحاول ملفًا بديلًا…');
  });
  adhanEl.addEventListener('playing',()=>{if(adhanIsTest)updateAdhanStatus('الصوت يعمل الآن. ارفع مستوى صوت الجهاز إذا لم تسمعه.');});
  return adhanEl;
}
function updateAdhanStatus(text){const el=$('#adhanSoundStatus');if(el)el.textContent=text;}
function stopAdhanAudio(){const a=adhanAudio();a.pause();try{a.currentTime=0}catch{};adhanIsTest=false;}
async function playAdhanAudio({prayerKey='Dhuhr',label='الأذان',test=false}={}){
  const a=adhanAudio();
  const sources=prayerKey==='Fajr'?ADHAN_AUDIO_SOURCES.fajr:ADHAN_AUDIO_SOURCES.regular;
  const start=adhanSourceIndex%sources.length;
  let lastError=null;
  for(let offset=0;offset<sources.length;offset++){
    const i=(start+offset)%sources.length;
    try{
      a.pause(); a.removeAttribute('src'); a.load(); a.src=sources[i]; a.preload='auto'; a.load(); a.volume=1;
      adhanIsTest=test;
      const playPromise=a.play();
      await Promise.race([playPromise,new Promise((_,reject)=>setTimeout(()=>reject(new Error('audio-timeout')),12000))]);
      adhanSourceIndex=i; updateAdhanStatus(test?'تم تشغيل الصوت؛ تأكد أنك تسمعه.':'يُشغّل الأذان الآن.');
      if(test){setTimeout(()=>{if(adhanIsTest&&adhanEl===a){stopAdhanAudio();updateAdhanStatus(localStorage.getItem('taqwaAdhanSoundEnabled')==='1'?'تم التفعيل؛ سيعمل عند وقت الصلاة ما دام الموقع نشطًا.':'انتهت تجربة الصوت.')}},7000)}
      if('Notification'in window&&Notification.permission==='granted'&&!test){try{new Notification(`حان وقت ${label}`,{body:`${(getSavedLoc()||defaultLoc()).city} — تقوى`,icon:'/icon-192.png'})}catch{}}
      return true;
    }catch(err){lastError=err;a.pause();
      if(err?.name==='NotAllowedError'||err?.name==='SecurityError'){
        updateAdhanStatus('المتصفح منع التشغيل التلقائي؛ اضغط «تجربة الأذان» واسمح بالصوت.');
        if(!test)toast('المتصفح منع تشغيل الأذان. افتح الصفحة واضغط تجربة الأذان أولًا.');
        return false;
      }
    }
  }
  updateAdhanStatus('لم يعمل أي مصدر صوت. تحقق من الإنترنت وكتم المتصفح، ثم جرّب مرة أخرى.');
  toast('تعذّر تشغيل ملف الأذان. جرّب اتصالًا آخر أو زر تجربة الأذان.');
  console.warn('Adhan audio failed',lastError);
  return false;
}
async function activateAdhanSound(){
  localStorage.setItem('taqwaAdhanSoundEnabled','1');
  // Start audio directly from the user's click so browser autoplay policies can authorize it.
  const play=playAdhanAudio({test:true,label:'تجربة الأذان'});
  const ok=await play;
  if(ok){toast('تم تفعيل صوت الأذان. سيعمل عند وقت الصلاة ما دام الموقع نشطًا.');}
  else {localStorage.setItem('taqwaAdhanSoundEnabled','0');}
  return ok;
}
function bindAdhanControls(){
  if(window.__taqwaAdhanControlsBound)return;window.__taqwaAdhanControlsBound=true;
  document.addEventListener('click',async e=>{
    if(e.target.closest('#enableAdhanSound')){await activateAdhanSound();return;}
    if(e.target.closest('#testAdhanSound')){await playAdhanAudio({test:true,label:'تجربة الأذان'});return;}
    if(e.target.closest('#stopAdhanSound')){localStorage.setItem('taqwaAdhanSoundEnabled','0');stopAdhanAudio();updateAdhanStatus('تم إيقاف التنبيه الصوتي التلقائي.');toast('تم إيقاف صوت الأذان التلقائي.');return;}
  });
}
function zonedWallTimeToMs(dateText,hm,tz){
  const [dd,mm,yyyy]=dateText.split('-').map(Number),[hh,mi]=hm.split(':').map(Number);
  const desired=Date.UTC(yyyy,mm-1,dd,hh,mi,0,0);let guess=desired;
  for(let i=0;i<3;i++){
    const ps=new Intl.DateTimeFormat('en-GB',{timeZone:tz,year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',second:'2-digit',hourCycle:'h23'}).formatToParts(new Date(guess));
    const v=Object.fromEntries(ps.map(p=>[p.type,p.value]));
    const represented=Date.UTC(+v.year,+v.month-1,+v.day,+v.hour,+v.minute,+v.second);
    const next=desired-(represented-guess);if(next===guess)break;guess=next;
  }
  return guess;
}
function scheduleAdhan(loc,timings){
  adhanTimers.forEach(id=>clearTimeout(id));adhanTimers=[];
  const names={Fajr:'الفجر',Dhuhr:'الظهر',Asr:'العصر',Maghrib:'المغرب',Isha:'العشاء'};
  const tz=loc.timeZone||({jordan:'Asia/Amman',saudi:'Asia/Riyadh',egypt:'Africa/Cairo'}[loc.country]||'Asia/Amman');
  const date=dateForTZ(tz), now=Date.now();
  Object.entries(names).forEach(([key,label])=>{
    const hm=normalizePrayerTime(timings[key]);if(!hm)return;
    const targetMs=zonedWallTimeToMs(date,hm,tz),delay=targetMs-now;
    const firedKey=`taqwaAdhanFired:${loc.country}:${loc.region}:${loc.cityIndex}:${date}:${key}`;
    if(delay<=1000||delay>24*60*60*1000||sessionStorage.getItem(firedKey))return;
    const timer=setTimeout(async()=>{
      sessionStorage.setItem(firedKey,'1');
      if(localStorage.getItem('taqwaAdhanSoundEnabled')==='1'){
        const played=await playAdhanAudio({prayerKey:key,label,test:false});
        if(!played&&'Notification'in window&&Notification.permission==='granted'){try{new Notification(`حان وقت ${label}`,{body:`${loc.city} — تعذّر تشغيل الصوت؛ افتح تقوى وجرب الأذان.`,icon:'/icon-192.png'})}catch{}}
      }else if('Notification'in window&&Notification.permission==='granted'){
        try{new Notification(`حان وقت ${label}`,{body:`${loc.city} — تقوى. افتح الموقع لتشغيل صوت الأذان.`,icon:'/icon-192.png'})}catch{}
      }
    },Math.min(delay,2147480000));
    adhanTimers.push(timer);
  });
}
async function refreshPrayerSchedule(){
  const loc=normalizeLocation(getSavedLoc()||defaultLoc());
  try{const res=await fetchPrayer(loc);saveCachedPrayer(loc,res.timings);scheduleAdhan(res.loc||loc,res.timings)}
  catch{const cached=loadCachedPrayer(loc);if(cached)scheduleAdhan(loc,cached)}
}
function startPrayerScheduler(){
  bindAdhanControls();
  refreshPrayerSchedule();
  if(prayerRefreshTimer)clearInterval(prayerRefreshTimer);
  prayerRefreshTimer=setInterval(refreshPrayerSchedule,60*60*1000);
  document.addEventListener('visibilitychange',()=>{if(!document.hidden)refreshPrayerSchedule()});
}
const AYAH_ROTATION_MS=10*60*1000;
const FEATURED_AYAH_KEY='taqwaFeaturedAyahV1';
function readFeaturedAyah(){
  try{const v=JSON.parse(localStorage.getItem(FEATURED_AYAH_KEY)||'null');if(v&&Number.isInteger(v.surah)&&Number.isInteger(v.ayah)&&Q[v.surah-1]?.[v.ayah-1])return v;}catch{}
  return {surah:20,ayah:114,changedAt:Date.now()};
}
function saveFeaturedAyah(v){state.featuredAyah=v;try{localStorage.setItem(FEATURED_AYAH_KEY,JSON.stringify(v))}catch{};syncFeaturedAyah()}
function nextFeaturedAyah(current){
  let s=current.surah||20,a=current.ayah||114;
  if(a<(Q[s-1]?.length||1))a++;else{s=s>=114?1:s+1;a=1}
  // Skip any empty/corrupt entries without looping forever.
  for(let i=0;i<120;i++){const text=Q[s-1]?.[a-1];if(text&&String(text).replace(/^\\basmalah\s*/,'').trim())return{surah:s,ayah:a,changedAt:Date.now()};a++;if(a>(Q[s-1]?.length||0)){s=s>=114?1:s+1;a=1}}
  return{surah:20,ayah:114,changedAt:Date.now()};
}
function syncFeaturedAyah(){const el=$('#homeFeaturedAyah'),src=$('#homeFeaturedSource');if(!el||!src)return;const v=featuredAyah();el.textContent=`﴿ ${v.text} ﴾`;src.textContent=v.source}
function startFeaturedAyahRotation(){
  let v=readFeaturedAyah();const now=Date.now();if(!v.changedAt||!Number.isFinite(v.changedAt))v.changedAt=now;
  let elapsed=now-v.changedAt;if(elapsed>=AYAH_ROTATION_MS){v=nextFeaturedAyah(v);saveFeaturedAyah(v)}else{state.featuredAyah=v}
  const schedule=()=>{const cur=state.featuredAyah||readFeaturedAyah();const age=Date.now()-(cur.changedAt||Date.now());const wait=Math.max(1000,AYAH_ROTATION_MS-age);clearTimeout(startFeaturedAyahRotation.timer);startFeaturedAyahRotation.timer=setTimeout(()=>{saveFeaturedAyah(nextFeaturedAyah(cur));schedule()},wait)};
  schedule();
}

async function main(){
  state.route=routeName();
  try{nav()}catch(err){console.error('Navigation setup failed',err)}
  try{initAudio()}catch(err){console.error('Audio setup failed',err)}
  try{startPrayerScheduler()}catch(err){console.error('Prayer scheduler failed',err)}
  try{initTasbih()}catch(err){console.error('Tasbih setup failed',err)}
  try{setupInstall();const close=$('#installClose');if(close)close.onclick=()=>$('#installModal')?.classList.remove('open')}catch(err){console.warn('Install setup failed',err)}
  if('serviceWorker'in navigator&&location.protocol!=='file:')navigator.serviceWorker.register('/sw.js',{scope:'/'}).then(r=>r.update()).catch(err=>console.warn('Service worker unavailable',err));
  try{startFeaturedAyahRotation()}catch(err){console.warn('Ayah rotation unavailable',err)}
  try{protect()}catch(err){console.warn('UI protection unavailable',err)}
  try{render()}catch(err){console.error('Initial render failed',err);const m=$('#appMain');if(m)m.innerHTML='<section class="section"><div class="container glass"><h1>تعذر تحميل الصفحة</h1><p>تأكد أن جميع ملفات الموقع رُفعت ثم حدّث الصفحة.</p><nav><a href="/index.html">الرئيسية</a> · <a href="/quran.html">القرآن</a> · <a href="/hadith.html">الأحاديث</a></nav></div></section>'}
  try{initOnboarding()}catch(err){console.warn('Onboarding unavailable',err)}
  const year=$('#year');if(year)year.textContent=new Date().getFullYear();
}
main();
