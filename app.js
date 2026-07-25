// ══════════════════ Muse 博悟 — App Logic ══════════════════

// ══════════════════ SVG Icon Helper ══════════════════
function renderIcon(id,cls){cls=cls||'';return '<svg class="icon-svg '+cls+'" viewBox="0 0 24 24"><use href="#'+id+'"/></svg>'}

// ══════════════════ I18N ══════════════════
let LANG='en';
const T={
  en:{
    loading:'Entering The Muse',loading_sub:'MUSE — Museum',select_title:'SELECT YOUR MUSEUM',select_sub:'Choose a museum to begin your journey',
    tab_discover:'Discover',tab_chat:'Chat',tab_codex:'Codex',tab_story:'Story',tab_profile:'Profile',
    mode_free:'Free Chat',mode_deep:'Deep Dive',mode_debate:'Debate (Scholar)',
    stat_insight:'Insight XP',stat_codex:'Codex',stat_depth:'Avg Depth',
    coll_title:'Your Codex',coll_all:'All',coll_collected:'Collected',coll_pending:'To Discover',
    qa_deeper:'Tell me more',qa_angle:'Hidden perspective',qa_quiz:'Quiz me',qa_relate:'Connections',
    chat_welcome:'Welcome to The Muse. Select an exhibit to begin your journey.',
    chat_placeholder:'Ask me anything...',
    prof_ach:'Achievements',prof_museum_switch:'Switch Museum',prof_settings:'Settings',prof_about:'About',
    prof_about_text:'Muse is a design experiment exploring what museums can become in the digital age. It uses AI to guide you to see and think, not read and recite.',
    ach_new:'New Achievement!',xp_gain:'+XP',codex_unlock:'Codex unlocked!',
    img_upload:'Upload image',img_remove:'Remove image',retry:'Retry',api_error:'AI is unavailable. Please try again.',
    img_placeholder:'Snap a photo of the artefact...',
    toast_browser:'Image upload requires a secure context (HTTPS or localhost).'
  },
  zh:{
    loading:'正在进入博悟',loading_sub:'博悟 — 博物馆',select_title:'选择博物馆',select_sub:'请选择一座博物馆开始探索',
    tab_discover:'发现',tab_chat:'对话',tab_codex:'图鉴',tab_story:'故事',tab_profile:'我的',
    mode_free:'自由对话',mode_deep:'深度讲解',mode_debate:'思辨辩论',
    stat_insight:'洞察经验',stat_codex:'图鉴收集',stat_depth:'平均深度',
    coll_title:'我的图鉴',coll_all:'全部',coll_collected:'已收集',coll_pending:'待发现',
    qa_deeper:'深入讲讲',qa_angle:'隐藏视角',qa_quiz:'考考我',qa_relate:'文物联动',
    chat_welcome:'欢迎来到博悟。选择一件文物，开启你的博物馆之旅。',
    chat_placeholder:'尽管问我……',
    prof_ach:'成就',prof_museum_switch:'切换博物馆',prof_settings:'设置',prof_about:'关于',
    prof_about_text:'博悟是一个在数字时代探索博物馆新可能的设计实验。它用 AI 引导你去"看"和"思考"，而不是"读"和"背"。',
    ach_new:'新成就！',xp_gain:'+经验',codex_unlock:'图鉴解锁！',
    img_upload:'上传图片',img_remove:'移除图片',retry:'重试',api_error:'AI 暂时不可用，请稍后重试。',
    img_placeholder:'拍下文物照片……',
    toast_browser:'图片上传功能需要 HTTPS 或本地环境。'
  }
};
function t(k){return (T[LANG]||T.en)[k]||k}
function switchLang(l){LANG=l;document.querySelectorAll('.h-btn').forEach(b=>b.classList.toggle('active',b.textContent.trim()===(l==='en'?'EN':'中')));renderAll()}
function renderAll(){
  renderMuseumSelector();renderDiscover();renderChat();renderCollection();renderProfile();renderStory();
}

// ══════════════════ Museum Data ══════════════════
const MUSEUMS=[
  {id:'british',name_en:'British Museum',name_zh:'大英博物馆',icon:'ic-british',region_en:'Europe',region_zh:'欧洲',loc_en:'London, UK',loc_zh:'英国·伦敦',desc_en:'The world\'s first public national museum. 8 million works spanning two million years.',desc_zh:'世界上第一座国家公共博物馆。800万件藏品跨越两百万年历史。',status:'open'},
  {id:'louvre',name_en:'Louvre',name_zh:'卢浮宫',icon:'ic-louvre',region_en:'Europe',region_zh:'欧洲',loc_en:'Paris, France',loc_zh:'法国·巴黎',desc_en:'The world\'s most-visited museum — from the Mona Lisa to Winged Victory.',desc_zh:'全球访问量最高的博物馆——从蒙娜丽莎到胜利女神。',status:'open'},
  {id:'met',name_en:'The Met',name_zh:'大都会',icon:'ic-met',region_en:'North America',region_zh:'北美',loc_en:'New York, USA',loc_zh:'美国·纽约',desc_en:'5,000 years of art across 2 million works.',desc_zh:'跨越五千年、两百万件作品。',status:'coming_soon'},
  {id:'palace',name_en:'Palace Museum',name_zh:'故宫博物院',icon:'ic-palace',region_en:'Asia',region_zh:'亚洲',loc_en:'Beijing, China',loc_zh:'中国·北京',desc_en:'The Forbidden City — 1.8 million imperial treasures.',desc_zh:'紫禁城——180万件皇家珍宝。',status:'planned'},
  {id:'egyptian',name_en:'Egyptian Museum',name_zh:'埃及博物馆',icon:'ic-egyptian',region_en:'Africa',region_zh:'非洲',loc_en:'Cairo, Egypt',loc_zh:'埃及·开罗',desc_en:'Tutankhamun\'s gold mask anchors 120,000 artefacts.',desc_zh:'图坦卡蒙黄金面具领衔12万件文物。',status:'planned'},
  {id:'uffizi',name_en:'Uffizi Gallery',name_zh:'乌菲兹美术馆',icon:'ic-uffizi',region_en:'Europe',region_zh:'欧洲',loc_en:'Florence, Italy',loc_zh:'意大利·佛罗伦萨',desc_en:'The cradle of the Renaissance — Botticelli, Leonardo, Raphael.',desc_zh:'文艺复兴的摇篮——波提切利、达芬奇、拉斐尔。',status:'planned'},
];
let currentMuseum=null;

// ══════════════════ Exhibit Data ══════════════════
const EXHIBITS={
  british:[
    {id:'b1',name_en:'Rosetta Stone',name_zh:'罗塞塔石碑',icon:'ic-stone',
      date_en:'196 BC',date_zh:'公元前196年',cat_en:'Granodiorite Stele',cat_zh:'花岗闪长岩石碑',
      mat:'Granodiorite',dims:'114×72×28 cm, 760 kg',origin_en:'El-Rashid, Egypt',origin_zh:'埃及 拉希德',
      desc_en:'The key to deciphering Egyptian hieroglyphs. The same decree inscribed in three scripts: hieroglyphic, Demotic, and Ancient Greek.',desc_zh:'破译埃及象形文字的关键。同一法令以三种文字镌刻：象形文字、世俗体和古希腊文。',
      r_en:'Egyptian collection',r_zh:'埃及馆藏',
      official_en:'<p>The Rosetta Stone is a granodiorite stele inscribed with a decree issued in 196 BC during the Ptolemaic dynasty. The decree appears in three scripts: Ancient Egyptian hieroglyphs (top), Demotic script (middle), and Ancient Greek (bottom). Discovered in 1799 by French soldiers during Napoleon\'s campaign in Egypt, it became the key to deciphering Egyptian hieroglyphs — a breakthrough achieved by Jean-François Champollion in 1822.</p><p>Since 1802, the stone has been on public display at the British Museum and remains one of the most visited objects in the collection.</p>',
      official_zh:'<p>罗塞塔石碑是一块花岗闪长岩石碑，刻有公元前196年托勒密王朝时期颁布的法令。碑文以三种文字呈现：古埃及象形文字（上部）、世俗体（中部）和古希腊文（下部）。1799年由拿破仑远征埃及的法国士兵发现，成为破译埃及象形文字的关键——这一突破由商博良（Jean-François Champollion）于1822年完成。</p><p>自1802年以来，这块石碑一直在英国博物馆公开展出，是馆内最受欢迎的藏品之一。</p>',
      guide_en:'[{"step":"1","title":"Observe the Three Scripts","desc":"Look closely at the three distinct bands of text. The top is hieroglyphic — the sacred script of temples. The middle is Demotic — the everyday script. The bottom is Ancient Greek, which was the administrative language. The presence of Greek provided the crucial bridge for decipherment."},{"step":"2","title":"Notice the Damage","desc":"The top-right corner and lower-right section are broken. The stone was once part of a larger stele — likely around 2 metres tall. What remains is roughly three-quarters of the original text."},{"step":"3","title":"Think About Context","desc":"This was not a sacred object — it was a bureaucratic document. A decree affirming the royal cult of Ptolemy V, distributed to temples across Egypt. Its value lies not in its content but in its trilingual nature."},{"step":"4","title":"Reflect on its Journey","desc":"From a temple wall in ancient Egypt to a museum in London — the stone has travelled through empires, wars, and scholarly revolutions. Consider the politics of cultural heritage: why is it here, and where should it be?"}]',
      guide_zh:'[{"step":"1","title":"观察三种文字","desc":"仔细看碑文的三段不同文字。最上是象形文字——神庙的圣书体。中间是世俗体——日常使用的草书。最下是古希腊文——当时的行政语言。正是希腊文的存在，为破译提供了关键桥梁。"},{"step":"2","title":"注意碑体的破损","desc":"右上角和右下部分已经残缺。石碑原本属于一块更大的石碑——可能高约2米。现存的约是原文的四分之三。"},{"step":"3","title":"思考它的语境","desc":"这不是一件宗教圣物——而是一份行政文件。一份确认托勒密五世王室崇拜的法令，分发给埃及各地的神庙。它的价值不在内容，而在三语并存的独特形态。"},{"step":"4","title":"反思它的旅程","desc":"从古埃及的神庙墙壁到伦敦的博物馆展柜——这块石碑穿越了帝国、战争和学术革命。思考文化遗产的政治性：它为什么在这里，又应该在哪里？"}]'},
    {id:'b2',name_en:'Parthenon Marbles',name_zh:'帕特农雕塑',icon:'ic-column',
      date_en:'447–432 BC',date_zh:'公元前447-432年',cat_en:'Marble Sculpture',cat_zh:'大理石雕塑',
      mat:'Pentelic Marble',dims:'Frieze ~160 m',origin_en:'Athens, Greece',origin_zh:'希腊 雅典',
      desc_en:'Masterpieces of Classical Greek art from the Parthenon. Scenes of the Panathenaic procession carved in exquisite detail.',desc_zh:'古典希腊艺术的巅峰之作。帕特农神庙的泛雅典娜节游行场景，精美绝伦。',
      r_en:'Restitution',r_zh:'归还争议',
      official_en:'<p>The Parthenon Marbles, also known as the Elgin Marbles, are a collection of Classical Greek marble sculptures that originally decorated the Parthenon on the Acropolis of Athens. Created under the direction of the sculptor Phidias between 447–432 BC, they include figures from the pediments, metopes depicting mythological battles, and the famous frieze showing the Panathenaic procession.</p><p>Removed by Lord Elgin in the early 19th century and acquired by the British Museum in 1816, their ownership remains a matter of intense international debate.</p>',
      official_zh:'<p>帕特农雕塑（又称埃尔金大理石）是一组古典希腊大理石雕塑，原装饰于雅典卫城帕特农神庙。由雕塑家菲迪亚斯（Phidias）主持创作于公元前447-432年间，包括山墙人物雕塑、描绘神话战争的陇间板，以及著名的泛雅典娜节游行浮雕带。</p><p>19世纪初由埃尔金勋爵移走，1816年被大英博物馆收购，其归属至今仍是激烈的国际争议话题。</p>',
      guide_en:'[{"step":"1","title":"Study the Movement","desc":"The frieze captures a procession in motion — horses, riders, maidens. Notice how the drapery flows. Each fold of fabric suggests movement and weight. The Greeks mastered the illusion of life in stone."},{"step":"2","title":"Look at the Faces","desc":"The expressions are calm and idealized — what scholars call \'Classical serenity\'. Compare this to earlier Archaic sculpture, where figures wore fixed, rigid smiles. Here, the emotion is subtle and internalized."},{"step":"3","title":"Understand the Subject","desc":"This is the Panathenaic procession — Athens\' greatest civic and religious festival. Citizens brought a new robe to the goddess Athena. The frieze transforms a ritual into eternal art."}]',
      guide_zh:'[{"step":"1","title":"感受动态","desc":"浮雕带捕捉了行进中的游行——马匹、骑手、少女。注意衣褶的流动感。每一道褶皱都暗示着运动和重量。希腊人掌握了在石头中创造生命的幻觉。"},{"step":"2","title":"观察面部","desc":"表情平静而理想化——学者称之为"古典静穆"。与此前古风时期僵硬刻板的微笑相比，这里的情感是微妙而内敛的。"},{"step":"3","title":"理解主题","desc":"这是泛雅典娜节游行——雅典最重要的公民宗教节日。市民为女神雅典娜献上新袍。浮雕带将一场仪式转化为永恒的艺术。"}]'},
    {id:'b3',name_en:'Mummy of Katebet',name_zh:'卡特贝特木乃伊',icon:'ic-coffin',
      date_en:'c.1300 BC',date_zh:'约公元前1300年',cat_en:'Painted Mummy',cat_zh:'彩绘木乃伊',
      mat:'Wood, plaster, linen, gold leaf',dims:'~170 cm',origin_en:'Thebes, Egypt',origin_zh:'埃及 底比斯',
      desc_en:'A beautifully preserved mummy of a Chantress of Amun. The painted mask depicts an idealized face, and the body is wrapped in layers of linen with protective amulets.',desc_zh:'保存精美的阿蒙神女歌者木乃伊。彩绘面具呈现理想化的面容，身体以层层亚麻布包裹，内含护身符。',
      r_en:'Same Egyptian gallery',r_zh:'同一埃及展厅',
      official_en:'<p>The Mummy of Katebet dates to the late 18th or early 19th Dynasty of ancient Egypt (c.1300 BC). Katebet was a \'Chantress of Amun\' — a musician who performed in temple rituals at Thebes. Her mummy features an exquisite gilded and painted cartonnage mask, with elaborate jewelry depicted in paint, including a broad collar and earrings.</p><p>The mummy was excavated in Thebes and acquired by the British Museum in the 19th century.</p>',
      official_zh:'<p>卡特贝特木乃伊可追溯到古埃及第18王朝晚期或第19王朝早期（约公元前1300年）。卡特贝特是一位"阿蒙神女歌者"——在底比斯神庙仪式中演奏的音乐家。她的木乃伊配有一副精美的镀金彩绘亚麻布面具，以彩绘表现了华丽的珠宝，包括宽领饰和耳环。</p><p>这具木乃伊出土于底比斯，于19世纪被大英博物馆收藏。</p>',
      guide_en:'[{"step":"1","title":"Examine the Mask","desc":"The gilded face represents an idealized version of Katebet in the afterlife. Gold was the \'flesh of the gods\' — by wearing it, she joined their company. The eyes gaze eternally forward."},{"step":"2","title":"Read the Jewellery","desc":"Every painted ornament has meaning. The broad collar symbolizes protection. The scarab beetle on her chest represents rebirth. These were not decorative — they were functional magic for the afterlife."},{"step":"3","title":"Consider the Person","desc":"Katebet was a temple musician, not a queen. That someone of her status could afford such elaborate burial speaks to the importance of funerary rituals across Egyptian society."}]',
      guide_zh:'[{"step":"1","title":"端详面具","desc":"镀金的面容是卡特贝特在来世的理想化形象。金是"神的血肉"——戴上它，她便加入了神的行列。双眼永远凝视前方。"},{"step":"2","title":"解读首饰","desc":"每件彩绘饰品都有含义。宽领象征保护，胸前的圣甲虫代表重生。这些不是装饰——它们是来世的功能性魔法。"},{"step":"3","title":"想象这个人","desc":"卡特贝特是一位神庙乐师，不是女王。一个普通地位的人能负担如此精美的葬礼，说明丧葬仪式在埃及社会各阶层的重要性。"}]'},
    {id:'b4',name_en:'Sutton Hoo Helmet',name_zh:'萨顿胡头盔',icon:'ic-helmet',
      date_en:'c.AD 625',date_zh:'约公元625年',cat_en:'Iron & Bronze Helmet',cat_zh:'铁质青铜头盔',
      mat:'Iron, tinned bronze, garnets',dims:'31.8×21.5 cm',origin_en:'Suffolk, England',origin_zh:'英格兰 萨福克',
      desc_en:'An iconic Anglo-Saxon helmet from the ship burial at Sutton Hoo. The face-mask features a dragon whose wings form the eyebrows.',desc_zh:'萨顿胡船葬中出土的标志性盎格鲁-撒克逊头盔。面罩上有一条龙，其翅膀构成双眉。',
      r_en:'British medieval',r_zh:'英国中世纪',
      official_en:'<p>The Sutton Hoo helmet is one of the most iconic objects from early medieval Europe. Discovered in 1939 in a 7th-century ship burial near Woodbridge, Suffolk, it is made of iron with decorative panels of tinned bronze and garnets. The face-mask features a striking design — a dragon in flight, its wings forming the eyebrows, its tail the nose, and its body the moustache.</p><p>The helmet likely belonged to King Rædwald of East Anglia (died c.AD 625), whose burial chamber was found inside a 27-metre-long ship.</p>',
      official_zh:'<p>萨顿胡头盔是中世纪早期欧洲最具标志性的文物之一。1939年发现于萨福克郡伍德布里奇附近一处7世纪船葬遗址，由铁制成，饰有镀锡青铜和石榴石装饰板。面罩设计惊艳——一条飞翔的龙，双翼为眉，龙尾为鼻，龙身构成胡须。</p><p>头盔很可能属于东盎格利亚国王雷德沃尔德（约AD 625年去世），其墓室被发现于一条27米长的船内。</p>',
      guide_en:'[{"step":"1","title":"Reconstruct the Dragon","desc":"The face is a puzzle: find the dragon\'s wings (eyebrows), tail (nose), and body (moustache). This zoomorphic design fused human identity with animal power — a warrior becomes the dragon he wears."},{"step":"2","title":"Appreciate the Craft","desc":"The helmet was crushed into 500 fragments when excavated. The reconstruction you see is the result of years of painstaking conservation. Look for the garnet inlays — imported from as far as Sri Lanka."},{"step":"3","title":"Imagine the Burial","desc":"A 27-metre ship dragged inland, filled with treasures, then covered by a mound. No body was found — only a chemical stain in the soil. The helmet was a stand-in for the absent king."}]',
      guide_zh:'[{"step":"1","title":"重构飞龙","desc":"这张脸是一个谜题：找到龙的翅膀（眉毛）、尾巴（鼻子）和身体（胡须）。这种动物化的设计将人的身份与兽的力量融为一体——战士成为了他所佩戴的龙。"},{"step":"2","title":"赞叹工艺","desc":"出土时头盔被压成500多个碎片。你看到的复原品是多年精心修复的成果。注意石榴石镶嵌——其中一些甚至从远至斯里兰卡进口。"},{"step":"3","title":"想象葬礼","desc":"一条27米长的船被拖上陆地，装满珍宝，然后覆以土丘。墓中没有找到遗骸——只在土壤中留下了化学痕迹。这顶头盔，是缺席的国王的替身。"}]'},
    {id:'b5',name_en:'Lewis Chessmen',name_zh:'刘易斯棋子',icon:'ic-chess',
      date_en:'1150–1200',date_zh:'1150-1200年',cat_en:'Walrus Ivory Chess',cat_zh:'海象牙棋子',
      mat:'Walrus ivory, whale tooth',dims:'Kings ~8–10 cm',origin_en:'Found Lewis, Scotland',origin_zh:'苏格兰刘易斯岛',
      desc_en:'A set of 78 chess pieces carved from walrus ivory. The expressive faces of the warders (rooks) biting their shields convey vivid medieval character.',desc_zh:'一套78枚海象牙棋子。守卫（车）咬着盾牌的生动表情传达出鲜活的中世纪个性。',
      r_en:'Medieval British finds',r_zh:'英国中世纪发现',
      official_en:'<p>The Lewis Chessmen are a group of 78 chess pieces from the 12th century, carved primarily from walrus ivory and a few from whale tooth. Discovered in 1831 on the Isle of Lewis in the Outer Hebrides, Scotland, they are believed to have been made in Norway (possibly Trondheim) when the Hebrides were under Norse rule.</p><p>The British Museum holds 82 pieces (from multiple sets found). Their expressive faces, particularly the warders biting their shields, have made them beloved icons of medieval art.</p>',
      official_zh:'<p>刘易斯棋子是一组78枚12世纪的国际象棋棋子，主要用海象牙雕刻，少数用鲸鱼牙。1831年发现于苏格兰外赫布里底群岛的刘易斯岛，据信制作于挪威（可能是特隆赫姆），当时赫布里底群岛处于挪威统治下。</p><p>大英博物馆收藏了82枚（来自多组棋子）。它们富有表情的面孔——尤其是咬着盾牌的守卫——使其成为中世纪艺术中最受人喜爱的形象之一。</p>',
      guide_en:'[{"step":"1","title":"Meet the Warders","desc":"The rooks are berserkers — warriors biting their shields in battle frenzy. Their eyes bulge with rage. Medieval chess was not a gentleman\'s game; it was a metaphor for war."},{"step":"2","title":"Compare the Queens","desc":"The queens rest their chins on their hands in a gesture of contemplation — or melancholy. Unlike the warrior figures, they convey interior emotional states rarely depicted in medieval art."},{"step":"3","title":"Trace the Origins","desc":"Walrus ivory came from Greenland. Carved in Norway, found in Scotland, displayed in London. These tiny figures tell a story of the medieval North Atlantic world — connected by trade, conquest, and craft."}]',
      guide_zh:'[{"step":"1","title":"认识守卫","desc":"棋子中的"车"是狂暴战士——咬着盾牌、陷入战斗狂热。他们的眼睛因愤怒而凸出。中世纪的国际象棋不是绅士的游戏，而是战争的隐喻。"},{"step":"2","title":"比较王后","desc":"王后们以手托腮的姿态，传达出沉思——或忧伤。与好战的男性形象不同，她们传达了中世纪艺术中少有的内心情感状态。"},{"step":"3","title":"追溯源头","desc":"海象牙来自格陵兰。在挪威雕刻，在苏格兰被发现，在伦敦展出。这些小小的棋子讲述着中世纪北大西洋世界的故事——由贸易、征服和工艺连接在一起。"}]'},
    {id:'b6',name_en:'Benin Bronzes',name_zh:'贝宁青铜器',icon:'ic-relief',
      date_en:'18th–19th C',date_zh:'18-19世纪',cat_en:'Brass Plaque',cat_zh:'黄铜饰板',
      mat:'Brass (lost-wax casting)',dims:'Various, ~45 cm typical',origin_en:'Benin City, Nigeria',origin_zh:'尼日利亚 贝宁城',
      desc_en:'Intricate brass plaques that once decorated the royal palace of Benin. They depict court life, warriors, and the Oba (king).',desc_zh:'曾装饰贝宁王宫的精致黄铜饰板。描绘了宫廷生活、战士和国王奥巴。',
      r_en:'Restitution debate',r_zh:'归还争议',
      official_en:'<p>The Benin Bronzes are a group of over a thousand brass plaques and sculptures that once decorated the royal palace of the Kingdom of Benin (in present-day Nigeria). Created using the lost-wax casting technique, they depict the Oba (king), court officials, warriors, and Portuguese traders.</p><p>Most were removed during the British punitive expedition of 1897 and subsequently dispersed to museums worldwide. Their return has become a landmark case in the global restitution debate.</p>',
      official_zh:'<p>贝宁青铜器是一千多块曾装饰贝宁王国（今尼日利亚）王宫的黄铜饰板和雕塑。采用失蜡铸造法制作，描绘了奥巴（国王）、宫廷官员、战士和葡萄牙商人。</p><p>大多数在1897年英国惩罚性远征中被带走，随后分散到全球博物馆。它们的归还已成为全球文化遗产归还辩论的标志性案例。</p>',
      guide_en:'[{"step":"1","title":"Examine the Detail","desc":"Each plaque is a narrative frozen in brass. Look for the Oba — identified by his coral bead regalia and attendants holding shields above his head. Every figure tells part of the court\'s story."},{"step":"2","title":"Understand the Craft","desc":"Lost-wax casting is a demanding technique: a wax model is encased in clay, melted out, and replaced with molten brass. The Benin bronzecasters achieved astonishing precision — notice the delicate patterns on the backgrounds."},{"step":"3","title":"Confront the History","desc":"These plaques were taken as \'spoils of war\' in 1897. Their presence in Western museums is a living wound. Ask yourself: what does it mean to admire beauty that was acquired through violence?"}]',
      guide_zh:'[{"step":"1","title":"细看工艺","desc":"每块饰板都是一段凝固在黄铜中的叙事。寻找奥巴——通过他的珊瑚珠饰和头顶举盾的侍从来辨析。每个人物都在讲述宫廷故事的一部分。"},{"step":"2","title":"理解技法","desc":"失蜡铸造法是一门高难度技艺：蜡模被泥土包裹，熔化后注入黄铜。贝宁的铸造工匠达到了惊人的精度——注意背景上精细的纹样。"},{"step":"3","title":"面对历史","desc":"这些饰板作为"战利品"在1897年被夺走。它们在西方博物馆中的存在是一道活着的伤口。问问自己：欣赏通过暴力获得的美丽，意味着什么？"}]'},
    {id:'b7',name_en:'The Great Wave',name_zh:'神奈川冲浪里',icon:'ic-wave',
      date_en:'c.1831',date_zh:'约1831年',cat_en:'Woodblock Print',cat_zh:'浮世绘木版画',
      mat:'Ink on paper',dims:'25.7×37.8 cm',origin_en:'Edo (Tokyo), Japan',origin_zh:'日本 江户（东京）',
      desc_en:'Hokusai\'s iconic woodblock print of a towering wave about to crash over boats with Mount Fuji in the distance.',desc_zh:'葛饰北斋标志性的木版画：巨浪将倾覆渔船，远方富士山若隐若现。',
      r_en:'Japanese art collection',r_zh:'日本馆藏',
      official_en:'<p>"The Great Wave off Kanagawa" is the most famous work from Katsushika Hokusai\'s series \'Thirty-six Views of Mount Fuji\' (c.1830–1832). The print depicts a massive wave threatening three boats off the coast of Kanagawa, with Mount Fuji visible in the background.</p><p>Hokusai used the newly imported Prussian blue pigment to achieve the vivid blue of the wave. The print has become one of the most recognizable images in world art, influencing Western artists from Monet to Van Gogh.</p>',
      official_zh:'<p>《神奈川冲浪里》是葛饰北斋《富岳三十六景》系列（约1830-1832年）中最著名的一幅。画面描绘了一个巨大的海浪威胁着神奈川沿岸的三艘船，远方可见富士山。</p><p>北斋使用新近进口的普鲁士蓝颜料来表现海浪的鲜艳蓝色。这幅版画已成为世界艺术中最具辨识度的图像之一，影响了从莫奈到梵高等西方艺术家。</p>',
      guide_en:'[{"step":"1","title":"Feel the Tension","desc":"The wave\'s claw-like crests reach for the boats below. Hokusai freezes a moment of maximum tension — the instant before the crash. Notice Mount Fuji in the distance, calm and eternal, contrasting with the violent foreground."},{"step":"2","title":"Appreciate the Blue","desc":"This vivid blue — \'Prussian blue\' — was a synthetic pigment newly imported from Europe. Hokusai\'s use of it was revolutionary: no Japanese artist had used such an intense, chemical blue before."},{"step":"3","title":"See the Influence","desc":"This image travelled from Edo to Paris, where it electrified the Impressionists. Monet collected Japanese prints. Van Gogh copied them. The Great Wave is a bridge between Eastern and Western art that changed both forever."}]',
      guide_zh:'[{"step":"1","title":"感受张力","desc":"浪尖如爪，扑向下方的渔船。北斋凝固了最大张力的瞬间——海浪倾覆的前一刻。注意远景中的富士山，平静而永恒，与前景的狂暴形成对比。"},{"step":"2","title":"品味蓝色","desc":"这种鲜明的蓝色——"普鲁士蓝"——是刚从欧洲进口的合成颜料。北斋的使用是革命性的：此前没有日本艺术家使用过如此强烈的化工蓝色。"},{"step":"3","title":"追溯影响","desc":"这幅画从江户传到巴黎，震惊了整个印象派。莫奈收藏日本版画，梵高临摹它们。神奈川冲浪里是连接东西方艺术的桥梁，永远改变了双方。"}]'},
    {id:'b8',name_en:'Hoa Hakananai\'a',name_zh:'摩艾石像',icon:'ic-moai',
      date_en:'c.AD 1600',date_zh:'约公元1600年',cat_en:'Basalt Statue',cat_zh:'玄武岩石像',
      mat:'Basalt',dims:'2.42 m, ~4 tonnes',origin_en:'Easter Island (Rapa Nui)',origin_zh:'复活节岛（拉帕努伊）',
      desc_en:'A moai from Easter Island, carved from basalt. Its name means "stolen or hidden friend". The back is carved with birdman petroglyphs.',desc_zh:'复活节岛的摩艾石像，玄武岩雕刻。名字意为"被盗或隐藏的朋友"。背部刻有鸟人岩画。',
      r_en:'Pacific collection',r_zh:'太平洋馆藏',
      official_en:'<p>Hoa Hakananai\'a is a moai statue from the ceremonial village of Orongo on Easter Island (Rapa Nui). Carved from basalt around AD 1600, it is unique among moai for its later carvings on the back — petroglyphs depicting the birdman cult (\'Tangata manu\'), including birdmen, dance paddles, and a vulva symbol.</p><p>Its name in Rapa Nui means "stolen or hidden friend". It was removed by the crew of HMS Topaze in 1868 and presented to Queen Victoria, who gifted it to the British Museum.</p>',
      official_zh:'<p>霍阿哈卡纳奈阿是复活节岛（拉帕努伊）奥龙戈仪式村落的一尊摩艾石像。约公元1600年以玄武岩雕刻而成，其独特之处在于背部的后期岩画——描绘了鸟人崇拜（Tangata manu），包括鸟人、舞桨和女性生殖符号。</p><p>它在拉帕努伊语中的名字意为"被盗或隐藏的朋友"。1868年被英国皇家海军黄玉号船员带走，献给维多利亚女王，女王将其赠予大英博物馆。</p>',
      guide_en:'[{"step":"1","title":"Look at the Back","desc":"Most visitors only photograph the front. Walk around: the back is covered with birdman petroglyphs — added centuries after the statue was carved. This palimpsest of carvings tells of a culture in transformation."},{"step":"2","title":"Read the Symbols","desc":"The birdman cult replaced ancestor worship. Look for the frigate bird, the \'ao\' dance paddle, and the komari (vulva symbol of fertility). These mark the shift from the moai-building era to a new religious system."},{"step":"3","title":"Hear its Name","desc":"\'Hoa Hakananai\'a\' — stolen or hidden friend. The Rapa Nui people named it. This is not just a museum object; it is an ancestor with a name and a story that continues."}]',
      guide_zh:'[{"step":"1","title":"转到背后","desc":"大多数游客只拍正面。绕到后面：背部布满了鸟人岩画——在石像雕刻数百年后添加的。这种刻痕的叠加，讲述了一种文化转型的故事。"},{"step":"2","title":"解读符号","desc":"鸟人崇拜取代了祖先崇拜。寻找军舰鸟、"ao"舞桨和komari（代表生育的女性符号）。这些标志着从摩艾建造时代向新宗教体系的转变。"},{"step":"3","title":"聆听名字","desc":""霍阿哈卡纳奈阿"——被盗或隐藏的朋友。这是拉帕努伊人亲自命名的。这不仅是一件博物馆藏品，它是一个有名字的祖先，故事仍在继续。"}]'},
    {id:'b9',name_en:'Standard of Ur',name_zh:'乌尔军旗',icon:'ic-standard',
      date_en:'c.2600 BC',date_zh:'约公元前2600年',cat_en:'Mosaic Box',cat_zh:'镶嵌木箱',
      mat:'Shell, lapis lazuli, red limestone, bitumen',dims:'49.5×21.6 cm',origin_en:'Ur, Iraq',origin_zh:'伊拉克 乌尔',
      desc_en:'A Sumerian mosaic box depicting war and peace. One of the earliest narrative artworks in human history.',desc_zh:'苏美尔镶嵌木箱，描绘战争与和平。人类历史上最早的叙事性艺术作品之一。',
      r_en:'Ancient Near East',r_zh:'古代近东',
      official_en:'<p>The Standard of Ur is a Sumerian artefact dating to approximately 2600 BC, discovered in the Royal Cemetery at Ur (modern Iraq) by Leonard Woolley in the 1920s. Its original function is unknown — it may have been the sound box of a musical instrument or a military standard.</p><p>The two main panels, inlaid with shell, lapis lazuli, and red limestone, depict a narrative of \'War\' on one side and \'Peace\' on the other — making it one of the earliest examples of narrative art in history.</p>',
      official_zh:'<p>乌尔军旗是一件约公元前2600年的苏美尔文物，由伦纳德·伍利于1920年代在乌尔（今伊拉克）的皇家墓地中发现。其原始功能不明——可能是乐器的音箱或军旗。</p><p>两个主要面板以贝壳、青金石和红石灰石镶嵌而成，一面描绘"战争"，另一面描绘"和平"——使其成为历史上最早的叙事艺术之一。</p>',
      guide_en:'[{"step":"1","title":"Read the Strip","desc":"Like an ancient comic strip, the panel reads from bottom to top. War side: chariots trample enemies, soldiers lead prisoners to the king. Peace side: a banquet with musicians, farmers bringing tribute. Every figure contributes to the story."},{"step":"2","title":"Admire the Materials","desc":"The vivid blue is lapis lazuli — imported from Afghanistan, over 2,000 km away. The white is shell from the Persian Gulf. The red is limestone. This tiny box maps the trade networks of the ancient world."},{"step":"3","title":"Interpret the Message","desc":"Together, the two sides form a complete ideology of Sumerian kingship: the king as warrior who brings order through conquest, and as provider who ensures prosperity in peace. Power justified through art."}]',
      guide_zh:'[{"step":"1","title":"阅读画面","desc":"像古代连环画一样，面板从下往上阅读。战争面：战车踏过敌人，士兵押解俘虏到国王面前。和平面：宴会场景，乐师演奏，农民进贡。每个人物都在推进叙事。"},{"step":"2","title":"欣赏材质","desc":"鲜明的蓝色是青金石——从2000多公里外的阿富汗进口。白色是波斯湾的贝壳，红色是石灰石。这个小小的箱子勾勒出古代世界的贸易网络。"},{"step":"3","title":"解读信息","desc":"两面合在一起，构成了苏美尔王权的完整意识形态：国王作为通过征服带来秩序的战士，也作为确保繁荣的供养者。权力通过艺术被正当化。"}]'},
    {id:'b10',name_en:'Tara Statue',name_zh:'度母像',icon:'ic-tara',
      date_en:'8th–9th C',date_zh:'8-9世纪',cat_en:'Gilt Bronze',cat_zh:'鎏金铜像',
      mat:'Gilt bronze',dims:'143 cm',origin_en:'Sri Lanka',origin_zh:'斯里兰卡',
      desc_en:'A serene gilt-bronze figure of the Buddhist goddess Tara. One of the finest surviving examples of Sri Lankan bronze casting.',desc_zh:'一尊安详的鎏金铜像——佛教女神度母。斯里兰卡青铜铸造最精美的存世作品之一。',
      r_en:'South Asian collection',r_zh:'南亚馆藏',
      official_en:'<p>The Tara Statue is a near-life-size gilt-bronze figure of the Buddhist goddess Tara, dating to the 8th–9th century from Sri Lanka. Standing 143 cm tall, she is depicted in the \'tribhanga\' (triple-bend) pose, her right hand in the gesture of giving (varada mudra).</p><p>Originally enshrined in a temple in eastern Sri Lanka, she was discovered and brought to England in the 19th century. The statue is remarkable for its serene expression and the technical mastery of its hollow-cast bronze construction.</p>',
      official_zh:'<p>度母像是一尊近乎真人大小、8-9世纪的斯里兰卡鎏金铜像，描绘了佛教女神度母。高143厘米，呈"三屈式"（tribhanga）姿态，右手作施与印（varada mudra）。</p><p>原供奉于斯里兰卡东部一座寺庙，19世纪被发现并带到英国。这尊像以其宁静安详的面部表情和空心铸造的精湛技术而著称。</p>',
      guide_en:'[{"step":"1","title":"Follow the Curve","desc":"Tara stands in tribhanga — the \'triple bend\'. Her hip sways right, torso shifts left, head inclines right again. This creates a gentle, breathing rhythm. She doesn\'t stand rigid — she flows."},{"step":"2","title":"Read the Hands","desc":"Right hand: varada mudra — the gesture of giving, of generosity, of answering prayers. Left hand held at the hip. The hands are as eloquent as the face. What is she offering you?"},{"step":"3","title":"Hear the Silence","desc":"At 143 cm tall, this is not a monumental statue. Its power is in its intimacy. Stand before it quietly. The gold catches the light differently with each breath you take. Tara meets you where you are."}]',
      guide_zh:'[{"step":"1","title":"跟随曲线","desc":"度母以"三屈式"站立——臀部右摆，上身左移，头部复向右倾。这创造了柔和而有呼吸感的韵律。她不是僵直地站着——她在流动。"},{"step":"2","title":"解读手印","desc":"右手：与愿印——给予、慷慨、回应祈祷的手势。左手置于腰际。双手与面容同样富有表达力。她在给予你什么？"},{"step":"3","title":"倾听寂静","desc":"143厘米高，这不是一座纪念碑式的雕像。它的力量在于亲密感。静静站在它面前。金色随着你的每一次呼吸捕捉不同的光芒。度母在你所在之处与你相遇。"}]'},
  ],
  louvre:[
    {id:'l1',name_en:'Mona Lisa',name_zh:'蒙娜丽莎',icon:'ic-portrait',
      date_en:'1503–1519',date_zh:'1503-1519年',cat_en:'Oil on Poplar Panel',cat_zh:'杨木板油画',
      mat:'Oil on poplar wood',dims:'77×53 cm',origin_en:'Florence, Italy',origin_zh:'意大利 佛罗伦萨',
      desc_en:'Leonardo da Vinci\'s masterpiece. Her enigmatic smile and sfumato technique have captivated the world for over 500 years.',desc_zh:'达芬奇的传世杰作。神秘的微笑和晕涂法技艺令人着迷已逾五百年。',
      r_en:'Italian Renaissance',r_zh:'意大利文艺复兴'},
    {id:'l2',name_en:'Winged Victory',name_zh:'胜利女神像',icon:'ic-wings',
      date_en:'c.190 BC',date_zh:'约公元前190年',cat_en:'Marble Sculpture',cat_zh:'大理石雕塑',
      mat:'Parian Marble',dims:'3.28 m',origin_en:'Samothrace, Greece',origin_zh:'希腊 萨莫色雷斯',
      desc_en:'The Winged Victory of Samothrace — a Hellenistic marble sculpture of Nike descending from the sky. Masterpiece of dynamic movement in stone.',desc_zh:'萨莫色雷斯的胜利女神——一尊从天而降的希腊化时期大理石雕像。石中动态之美的巅峰。',
      r_en:'Hellenistic Greek',r_zh:'希腊化时期'},
    {id:'l3',name_en:'Venus de Milo',name_zh:'米洛的维纳斯',icon:'ic-statue',
      date_en:'130–100 BC',date_zh:'公元前130-100年',cat_en:'Marble Sculpture',cat_zh:'大理石雕塑',
      mat:'Parian Marble',dims:'2.02 m',origin_en:'Milos, Greece',origin_zh:'希腊 米洛斯',
      desc_en:'Aphrodite of Milos — the idealized female form of Hellenistic Greece. Her missing arms invite endless speculation about what gesture she once held.',desc_zh:'米洛的阿佛洛狄忒——希腊化时期理想化的女性形体。失去的双臂引发对其原始姿态的无尽遐想。',
      r_en:'Hellenistic Greek',r_zh:'希腊化时期'},
    {id:'l4',name_en:'Liberty Leading the People',name_zh:'自由引导人民',icon:'ic-flag',
      date_en:'1830',date_zh:'1830年',cat_en:'Oil on Canvas',cat_zh:'布面油画',
      mat:'Oil on canvas',dims:'260×325 cm',origin_en:'Paris, France',origin_zh:'法国 巴黎',
      desc_en:'Delacroix\'s iconic painting of the July Revolution. Marianne, the allegorical figure of Liberty, leads citizens over a barricade.',desc_zh:'德拉克罗瓦描绘七月革命的标志性画作。象征自由的玛丽安娜引领市民跨越街垒。',
      r_en:'French Romanticism',r_zh:'法国浪漫主义'},
    {id:'l5',name_en:'Code of Hammurabi',name_zh:'汉谟拉比法典',icon:'ic-stone',
      date_en:'c.1750 BC',date_zh:'约公元前1750年',cat_en:'Basalt Stele',cat_zh:'玄武岩石碑',
      mat:'Basalt',dims:'2.25 m',origin_en:'Babylon (Iraq)',origin_zh:'巴比伦（伊拉克）',
      desc_en:'One of the oldest deciphered writings of significant length. Hammurabi receives the law from the sun god Shamash, carved above 282 legal provisions.',desc_zh:'已知最早的长篇文字之一。顶部雕刻汉谟拉比从太阳神沙马什手中接过法典，下方刻有282条法律条文。',
      r_en:'Ancient Near East',r_zh:'古代近东'},
    {id:'l6',name_en:'Seated Scribe',name_zh:'坐着的书吏',icon:'ic-portrait',
      date_en:'c.2600–2350 BC',date_zh:'约公元前2600-2350年',cat_en:'Painted Limestone',cat_zh:'彩绘石灰石',
      mat:'Limestone, quartz, copper',dims:'53.7 cm',origin_en:'Saqqara, Egypt',origin_zh:'埃及 萨卡拉',
      desc_en:'A remarkably lifelike Egyptian statue. The scribe\'s alert eyes, inlaid with quartz and copper, create an uncanny sense of living presence.',desc_zh:'一尊极其生动的埃及雕像。书吏警觉的双眼以石英和铜镶嵌，产生令人不安的逼真存在感。',
      r_en:'Ancient Egyptian',r_zh:'古埃及'},
  ]
};

function getAllExhibits(){return currentMuseum?EXHIBITS[currentMuseum.id]||[]:[]}
function eName(e){return LANG==='en'?e.name_en:e.name_zh}
function eDate(e){return LANG==='en'?e.date_en:e.date_zh}
function eDesc(e){return LANG==='en'?e.desc_en:e.desc_zh}

// ══════════════════ Museum Selector ══════════════════
function renderMuseumSelector(){
  let html='<div class="selector-title">'+t('select_title')+'</div><div class="selector-sub">'+t('select_sub')+'</div><div class="museum-grid" id="museumGrid">';
  MUSEUMS.forEach(m=>{
    const locked=m.status!=='open';
    html+='<div class="m-card'+(locked?' locked':'')+(m===currentMuseum?' selected':'')+'" onclick="selectMuseum(\''+m.id+'\')">'
      +'<div class="mc-status">'+(m.status==='coming_soon'?'Coming Soon':m.status==='planned'?'Planned':'')+'</div>'
      +'<div class="mc-region">'+(LANG==='en'?m.region_en:m.region_zh)+'</div><div class="mc-icon">'+renderIcon(m.icon)+'</div><div class="mc-info">'
      +'<div class="mc-name">'+(LANG==='en'?m.name_en:m.name_zh)+'</div><div class="mc-loc">'+(LANG==='en'?m.loc_en:m.loc_zh)+'</div>'
      +'<div class="mc-desc">'+(LANG==='en'?m.desc_en:m.desc_zh)+'</div></div></div>';
  });
  html+='</div>';
  document.getElementById('museum-selector').innerHTML=html;
  
  // Add TAB logo at bottom
  const logoHtml='<div style="text-align:center;margin-top:40px;opacity:0.5;"><img src="tab-logo.png" alt="TAB" style="height:28px;filter:invert(1);opacity:0.5;"></div>';
  document.getElementById('museum-selector').insertAdjacentHTML('beforeend',logoHtml);
}
let loadingShown=false;
function showMuseumSelector(){
  document.getElementById('loading').classList.add('hidden');
  document.getElementById('museum-selector').classList.add('show');
  loadingShown=true;
}

// ══════════════════ Museum Selection ══════════════════
function selectMuseum(id){
  const m=MUSEUMS.find(x=>x.id===id);if(!m||m.status!=='open')return;
  currentMuseum=m;
  currentExhibit=null;chatHistory=[];
  document.getElementById('headerMuseum').textContent=LANG==='en'?m.name_en:m.name_zh;
  document.getElementById('museum-selector').classList.remove('show');
  renderAll();
  
  // Save to localStorage
  try{localStorage.setItem('muse_museum',id)}catch(e){}
}

// ══════════════════ Player State ══════════════════
let player={xp:0,tq:0,streak:0,qz:0,collected:[],ed:{},achievements:[]};
let recentExhibits=[];
let currentExhibit=null,currentMode='free',currentTab='discover';
let chatHistory=[],isTyping=false;

// Load saved state
try{
  const saved=localStorage.getItem('muse_player');
  if(saved){
    const p=JSON.parse(saved);
    player={...player,...p};
    // Load museum preference
    const savedMuseum=localStorage.getItem('muse_museum');
    if(savedMuseum)currentMuseum=MUSEUMS.find(m=>m.id===savedMuseum&&m.status==='open')||null;
  }
}catch(e){/* ignore */}

function savePlayer(){try{localStorage.setItem('muse_player',JSON.stringify(player))}catch(e){}}

// ══════════════════ Achievements ══════════════════
const ACHIEVEMENTS=[
  {id:'first_q',icon:'ic-ach-chat',n_en:'First Question',n_zh:'初次提问',d_en:'Ask your first question',d_zh:'提出第一个问题',c:()=>player.tq>=1},
  {id:'deep3',icon:'ic-ach-think',n_en:'Deep Thinker',n_zh:'深度思考者',d_en:'Depth 3 on any artefact',d_zh:'对任意文物达到深度3',c:()=>Object.values(player.ed).some(d=>d>=3)},
  {id:'coll3',icon:'ic-ach-books',n_en:'Codex Novice',n_zh:'图鉴新人',d_en:'3 Codex entries',d_zh:'收集3条图鉴',c:()=>player.collected.length>=3},
  {id:'coll7',icon:'ic-ach-museum',n_en:'Museum Scholar',n_zh:'博物馆学者',d_en:'7 Codex entries',d_zh:'收集7条图鉴',c:()=>player.collected.length>=7},
  {id:'coll_all',icon:'ic-ach-crown',n_en:'Master Curator',n_zh:'大师策展人',d_en:'Complete the Codex',d_zh:'完成全部图鉴',c:()=>{const all=getAllExhibits();return all.length>0&&player.collected.length>=all.length}},
  {id:'streak5',icon:'ic-ach-fire',n_en:'On Fire',n_zh:'势不可挡',d_en:'5 questions in one session',d_zh:'单次连续5问',c:()=>player.streak>=5},
  {id:'scholar',icon:'ic-ach-grad',n_en:'Scholar Rank',n_zh:'学者等级',d_en:'Reach Scholar',d_zh:'达到学者',c:()=>player.xp>=300},
  {id:'quiz3',icon:'ic-ach-brain',n_en:'Quiz Master',n_zh:'问答大师',d_en:'Complete 3 quizzes',d_zh:'完成3次测验',c:()=>player.qz>=3},
];

function collectEx(id){if(!player.collected.includes(id)){player.collected.push(id);updateCollectCount();showAchievement('ic-book',t('codex_unlock'),'')}}
function showAchievement(iconId,title,sub){const el=document.getElementById('ach-popup');el.querySelector('.ap-icon').innerHTML=renderIcon(iconId);el.querySelector('.ap-title').textContent=title;el.querySelector('.ap-sub').textContent=sub;el.classList.add('show');setTimeout(()=>el.classList.remove('show'),3000)}
function addXP(n){const oldLvl=getLevel().name;player.xp+=n;savePlayer();updateProfileXP();const newLvl=getLevel().name;if(newLvl!==oldLvl){const el=document.getElementById('level-up');el.querySelector('.level-up-text').textContent=newLvl;el.classList.add('show');setTimeout(()=>el.classList.remove('show'),2200)}}
function incDepth(id){if(!player.ed[id])player.ed[id]=0;player.ed[id]++;savePlayer()}
function checkAch(){ACHIEVEMENTS.forEach(a=>{if(a.c()&&!player.achievements.includes(a.id)){player.achievements.push(a.id);savePlayer();showAchievement(a.icon,t('ach_new'),LANG==='en'?a.n_en:a.n_zh)}})}
function getLevel(){const x=player.xp;if(x<50)return{name:'Visitor',min:0,max:50};if(x<150)return{name:'Explorer',min:50,max:150};if(x<300)return{name:'Scholar',min:150,max:300};if(x<600)return{name:'Curator',min:300,max:600};return{name:'Master Curator',min:600,max:9999}}
function xpNext(){const l=getLevel();return l.max===9999?l.min*2:l.max}
function lvName(l){return l.name}

// ══════════════════ Tabs ══════════════════
document.addEventListener('DOMContentLoaded',()=>{
  document.querySelectorAll('.tab-item').forEach(b=>{
    b.addEventListener('click',()=>switchTab(b.dataset.tab));
  });
  init();
});

function switchTab(tab){
  if(tab==='collection')renderCollection();
  currentTab=tab;
  document.querySelectorAll('.tab-item').forEach(b=>b.classList.toggle('active',b.dataset.tab===tab));
  document.querySelectorAll('.tab-pane').forEach(p=>p.classList.toggle('active',p.id==='tab-'+tab));
  if(tab==='profile')renderProfile();
  if(tab==='story')renderStory();
}

// ══════════════════ Discover Tab ══════════════════
function renderDiscover(){
  if(!currentMuseum){document.getElementById('tab-discover').innerHTML='<div style="text-align:center;padding:60px 20px;color:var(--text-dim)">'+(LANG==='en'?'Select a museum first':'请先选择博物馆')+'</div>';return}
  const ex=getAllExhibits();let html='';
  // Recent exhibits section
  if(recentExhibits.length>0){
    html+='<div class="section-header"><span class="section-title">'+(LANG==='en'?'Recent':'最近浏览')+'</span></div><div class="artefact-row" id="recentRow">';
    recentExhibits.forEach(e=>{html+='<div class="artefact-card" onclick="selectExhibitAndChat(\''+e.id+'\')"><div class="ac-icon">'+renderIcon(e.icon)+'</div><div class="ac-name">'+eName(e)+'</div><div class="ac-date">'+eDate(e)+'</div>'+(player.collected.includes(e.id)?'<div class="ac-collected">'+renderIcon('ic-book','')+' Codex</div>':'')+'</div>'});
    html+='</div>';
  }
  html+='<div class="section-header"><span class="section-title">'+(LANG==='en'?'All Exhibits':'全部文物')+'</span></div><div class="artefact-row">';
  ex.forEach(e=>{html+='<div class="artefact-card" onclick="selectExhibitAndChat(\''+e.id+'\')"><div class="ac-icon">'+renderIcon(e.icon)+'</div><div class="ac-name">'+eName(e)+'</div><div class="ac-date">'+eDate(e)+'</div>'+(player.collected.includes(e.id)?'<div class="ac-collected">'+renderIcon('ic-book','')+' Codex</div>':'')+'</div>'});
  html+='</div>';document.getElementById('tab-discover').innerHTML=html;
}

async function selectExhibitAndChat(id){
  const ex=getAllExhibits().find(e=>e.id===id);if(!ex)return;
  currentExhibit=ex;chatHistory=[];
  if(!recentExhibits.find(e=>e.id===id)){recentExhibits.unshift(ex);if(recentExhibits.length>5)recentExhibits.pop()}
  collectEx(id);switchTab('chat');renderChat();await startExhibitConv();
}

// ══════════════════ Chat Tab ══════════════════
function renderChatModes(){
  const bar=document.getElementById('chat-mode-bar-inner');if(!bar)return;
  bar.innerHTML=''
    +'<button class="mode-pill active" data-mode="free">'+t('mode_free')+'</button>'
    +'<button class="mode-pill" data-mode="deep">'+t('mode_deep')+'</button>'
    +'<button class="mode-pill'+(player.xp<300?' locked':'')+'" data-mode="debate">'+t('mode_debate')+(player.xp<300?' '+renderIcon('ic-lock',''):'')+'</button>';
  bar.querySelectorAll('.mode-pill').forEach(b=>{
    b.addEventListener('click',()=>{
      if(b.classList.contains('locked'))return;
      currentMode=b.dataset.mode;
      bar.querySelectorAll('.mode-pill').forEach(x=>x.classList.toggle('active',x.dataset.mode===currentMode));
    });
  });
  // Set active
  bar.querySelector('.mode-pill[data-mode="'+currentMode+'"]')?.classList.add('active');
}

// Track uploaded image
let uploadedImageData=null;

function renderChat(){
  const ex=getAllExhibits();if(!currentMuseum||ex.length===0){
    document.getElementById('tab-chat').innerHTML='<div style="text-align:center;padding:60px 20px;color:var(--text-dim)">Select a museum first</div>';return;
  }
  let chips='';ex.forEach(e=>{chips+='<span class="exhibit-chip'+(currentExhibit&&currentExhibit.id===e.id?' active':'')+'" onclick="selectExhibitAndChat(\''+e.id+'\')">'+renderIcon(e.icon)+' '+eName(e)+'</span>'});
  const imgPreview=uploadedImageData
    ?'<div class="chat-img-preview" id="chat-img-preview"><img src="'+uploadedImageData+'" alt="Uploaded"><button class="chat-img-remove" onclick="removeImage()" title="'+t('img_remove')+'">&times;</button></div>'
    :'';
  document.getElementById('tab-chat').innerHTML=
    '<div class="chat-top"><div class="chat-mode-bar" id="chat-mode-bar-inner"></div>'
    +'<div class="chat-exhibit-bar">'+chips+'</div></div>'
    +'<div id="chat-messages"><div class="msg bot"><div class="msg-avatar">'+renderIcon('ic-ai')+'</div><div class="msg-content">'+t('chat_welcome')+'</div></div></div>'
    +imgPreview
    +'<div class="quick-actions">'
    +'<button class="qa-btn" onclick="quickAction(\'deeper\')">'+t('qa_deeper')+'</button>'
    +'<button class="qa-btn" onclick="quickAction(\'angle\')">'+t('qa_angle')+'</button>'
    +'<button class="qa-btn" onclick="quickAction(\'quiz\')">'+t('qa_quiz')+'</button>'
    +'<button class="qa-btn" onclick="quickAction(\'relate\')">'+t('qa_relate')+'</button>'
    +'</div>'
    +'<div class="chat-input-wrap"><input type="file" id="chat-image-input" accept="image/*" onchange="handleImageUpload(event)" style="display:none"><button class="chat-img-btn" onclick="document.getElementById(\'chat-image-input\').click()" title="'+t('img_upload')+'">'+renderIcon('ic-guide','')+'</button><input id="chat-input" placeholder="'+t('chat_placeholder')+'" onkeydown="if(event.key===\'Enter\')sendMsg()"><button class="chat-send" onclick="sendMsg()" id="chat-send-btn">&uarr;</button></div>';
  renderChatModes();
}

function handleImageUpload(event){
  const file=event.target.files[0];
  if(!file)return;
  if(!file.type.startsWith('image/')){
    showToast(LANG==='en'?'Please select an image file.':'请选择图片文件。');return;
  }
  if(file.size>10*1024*1024){
    showToast(LANG==='en'?'Image too large (max 10MB).':'图片太大（最大10MB）。');return;
  }
  const reader=new FileReader();
  reader.onload=function(e){
    uploadedImageData=e.target.result;
    // Update preview
    const preview=document.getElementById('chat-img-preview');
    if(preview){
      preview.querySelector('img').src=uploadedImageData;
      preview.style.display='flex';
    } else {
      // Insert preview before quick-actions
      const qa=document.querySelector('#tab-chat .quick-actions');
      if(qa){
        const div=document.createElement('div');
        div.className='chat-img-preview';
        div.id='chat-img-preview';
        div.innerHTML='<img src="'+uploadedImageData+'" alt="Uploaded"><button class="chat-img-remove" onclick="removeImage()" title="'+t('img_remove')+'">&times;</button>';
        qa.parentNode.insertBefore(div,qa);
      }
    }
    // Update placeholder
    const input=document.getElementById('chat-input');
    if(input)input.placeholder=t('img_placeholder');
  };
  reader.readAsDataURL(file);
}

function removeImage(){
  uploadedImageData=null;
  const preview=document.getElementById('chat-img-preview');
  if(preview)preview.remove();
  const input=document.getElementById('chat-input');
  if(input)input.placeholder=t('chat_placeholder');
  document.getElementById('chat-image-input').value='';
}

// Toast notification
let toastTimer=null;
function showToast(msg){
  let toast=document.getElementById('toast');
  if(!toast){
    toast=document.createElement('div');
    toast.id='toast';
    toast.style.cssText='position:fixed;bottom:120px;left:50%;transform:translateX(-50%);z-index:300;padding:10px 20px;background:rgba(30,30,40,0.95);backdrop-filter:blur(20px);-webkit-backdrop-filter:blur(20px);border:1px solid rgba(255,255,255,0.1);border-radius:20px;color:var(--text);font-size:13px;opacity:0;transition:opacity 0.3s;pointer-events:none;max-width:90%;text-align:center';
    document.body.appendChild(toast);
  }
  toast.textContent=msg;
  toast.style.opacity='1';
  clearTimeout(toastTimer);
  toastTimer=setTimeout(()=>{toast.style.opacity='0'},3000);
}

async function startExhibitConv(){
  const e=currentExhibit;
  const card='<div class="ec"><div class="ec-h"><span class="ec-icon">'+renderIcon(e.icon)+'</span><div><div class="ec-name">'+eName(e)+'</div><div class="ec-meta">'+eDate(e)+' · '+e.mat+'</div></div></div><div class="ec-desc">'+eDesc(e)+'</div><button class="ec-guide-btn" onclick="event.stopPropagation();openGuideModal('+"'"+e.id+"'"+')"><svg class="icon-svg" viewBox="0 0 24 24"><use href="#ic-guide"/></svg>'+(LANG==='en'?'Appreciation Guide':'鉴赏指南')+'</button></div>';
  addBotMsg(card);showTyping();
  const intro=LANG==='en'?'Introduce '+eName(e)+' to me naturally, as if I\'m standing in front of it.':'向我自然地介绍'+eName(e)+'，就像我正站在它面前一样。';
  chatHistory=[{role:'user',content:intro}];
  const resp=await generateResp(intro);
  hideTyping();chatHistory.push({role:'assistant',content:resp});addBotMsg(resp);
}

function addUserMsg(text,imageData){
  const div=document.createElement('div');div.className='msg user';
  let content=text||'';
  if(imageData)content='<img src="'+imageData+'" style="max-width:200px;border-radius:12px;margin-bottom:6px;display:block">'+content;
  div.innerHTML='<div class="msg-avatar">'+renderIcon('ic-user')+'</div><div class="msg-content">'+content+'</div>';
  const msgs=document.getElementById('chat-messages');if(!msgs)return;msgs.appendChild(div);
  requestAnimationFrame(()=>{msgs.scrollTop=msgs.scrollHeight});
}

function addBotMsg(text){renderMsg('bot',text)}

function renderMsg(role,text){
  const div=document.createElement('div');div.className='msg '+role;
  div.innerHTML='<div class="msg-avatar">'+(role==='user'?renderIcon('ic-user'):renderIcon('ic-ai'))+'</div><div class="msg-content">'+text+'</div>';
  const msgs=document.getElementById('chat-messages');if(!msgs)return;msgs.appendChild(div);
  requestAnimationFrame(()=>{msgs.scrollTop=msgs.scrollHeight});
}

function showTyping(){
  isTyping=true;const div=document.createElement('div');div.className='msg bot';div.id='typing-ind';
  div.innerHTML='<div class="msg-avatar">'+renderIcon('ic-ai')+'</div><div class="msg-content"><div class="typing-dots"><span></span><span></span><span></span></div></div>';
  const msgs=document.getElementById('chat-messages');if(msgs){msgs.appendChild(div);msgs.scrollTop=msgs.scrollHeight}
}

function hideTyping(){isTyping=false;const el=document.getElementById('typing-ind');if(el)el.remove()}

async function sendMsg(retryText){
  const input=document.getElementById('chat-input');if(!input||isTyping)return;
  const text=retryText||input.value.trim();
  if(!text&&!uploadedImageData)return;
  if(!currentExhibit&&!uploadedImageData)return;
  
  if(!retryText)input.value='';
  
  const imgData=uploadedImageData;
  if(imgData)removeImage();
  
  addUserMsg(text,imgData);
  
  const userMsg=imgData
    ?[{type:'text',text:text||(LANG==='en'?'What is this?':'这是什么？')},{type:'image_url',image_url:{url:imgData}}]
    :text;
  chatHistory.push({role:'user',content:userMsg});
  
  if(!retryText){
    player.tq++;addXP(5+Math.floor(Math.random()*15));
    if(currentExhibit)incDepth(currentExhibit.id);
    checkAch();
  }
  
  showTyping();
  const resp=await generateResp(userMsg,imgData);
  hideTyping();
  chatHistory.push({role:'assistant',content:resp});
  addBotMsg(resp);
}

async function quickAction(act){
  if(!currentExhibit||isTyping)return;let msg='';
  if(currentMode==='debate')msg=LANG==='en'?'Challenge my understanding of this.':'挑战我对'+eName(currentExhibit)+'的理解。';
  else if(act==='deeper')msg=LANG==='en'?'Tell me everything about this artefact.':'把'+eName(currentExhibit)+'的一切都告诉我。';
  else if(act==='angle')msg=LANG==='en'?'What perspective do most visitors miss?':'大多数参观者会忽略什么？';
  else if(act==='quiz')msg=LANG==='en'?'Quiz me!':'测试我！';
  else msg=LANG==='en'?'How does this connect to other treasures?':'它和别的文物有什么联系？';
  addUserMsg(msg);chatHistory.push({role:'user',content:msg});
  player.tq++;addXP(8+Math.floor(Math.random()*12));incDepth(currentExhibit.id);
  showTyping();const resp=await generateResp(msg);
  hideTyping();chatHistory.push({role:'assistant',content:resp});addBotMsg(resp);checkAch();
}

const AI_WORKER_URL='/api/chat';
const DEEPSEEK_API_URL='https://api.deepseek.com/v1/chat/completions';
const DEEPSEEK_MODEL='deepseek-chat';

async function generateResp(userMsg,imageData){
  const ex=currentExhibit;
  const exhibitName=ex?(LANG==='en'?ex.name_en:ex.name_zh):'unknown';
  const exhibitDesc=ex?(LANG==='en'?ex.desc_en:ex.desc_zh):'';
  const museumName=currentMuseum?(LANG==='en'?currentMuseum.name_en:currentMuseum.name_zh):'';

  const systemPrompt=LANG==='en'
    ?'You are Muse, a knowledgeable and passionate museum guide at '+museumName+', introducing "'+exhibitName+'".\n\nAbout this exhibit: '+exhibitDesc+'\n\nRules:\n- Reply in English, warm and professional tone like a real museum docent\n- Keep answers concise, within 150 words\n- If asked "tell me more", expand to 300 words\n- Proactively guide observation of details, historical context, craftsmanship\n- Mode: '+(currentMode==='deep'?'Deep explanation mode':currentMode==='quiz'?'Quiz mode, use Socratic questioning':'Casual chat mode')+'\n- If an image is provided, analyze it like a museum expert — identify what\'s visible, guide observation, ask questions\n- Reply in plain text, no Markdown'
    :'你是 Muse 博悟，一位博学而热情的博物馆导游。你正在'+museumName+'为游客讲解一件名为"'+exhibitName+'"的文物。\n\n这件文物简介：'+exhibitDesc+'\n\n规则：\n- 用中文回答，语气温暖专业，像真正的博物馆讲解员\n- 回答控制在150字以内，简洁有力\n- 如果用户问"深入讲讲"，展开到300字\n- 主动引导观察文物的细节、历史背景、工艺技法\n- 对话模式：'+(currentMode==='deep'?'深度讲解模式':currentMode==='quiz'?'问答互动模式，用提问引导思考':'轻松聊天模式')+'\n- 如果用户提供了图片，像博物馆专家一样分析——识别可见内容，引导观察，提出问题\n- 回复纯文本，不要用 Markdown';

  const messages=[{role:'system',content:systemPrompt},...chatHistory.slice(-10)];

  // Call Cloudflare Pages /api/chat proxy
  try{
    const resp=await fetch(AI_WORKER_URL,{
      method:'POST',
      headers:{'Content-Type':'application/json'},
      body:JSON.stringify({messages,exhibit:currentExhibit,mode:currentMode,lang:LANG,museum:currentMuseum,hasImage:!!imageData})
    });
    if(resp.ok){const d=await resp.json();return d.response.replace(/\n/g,'<br>')}
    const err=await resp.json().catch(()=>({}));
    if(err.error&&err.error.includes('DEEPSEEK_API_KEY')){
      return (LANG==='en'
        ?'<span style="color:#ff6b6b;">⚠ DeepSeek API key is not configured.</span><br><br>Add <code>DEEPSEEK_API_KEY</code> in your Cloudflare Pages dashboard:<br>Settings → Variables and Secrets → Environment variables<br><br>Your key: <code>sk-fd2d6096c3be41e0a7502e8cc6dea6a1</code><br><br><button onclick="sendMsg('+"'"+'retry'+"'"+')" style="margin-top:8px;padding:6px 14px;border-radius:12px;border:1px solid var(--gold);background:transparent;color:var(--gold);cursor:pointer;font-size:11px">'+t('retry')+'</button>'
        :'<span style="color:#ff6b6b;">⚠ DeepSeek API Key 未配置。</span><br><br>请在 Cloudflare Pages 后台添加环境变量：<br>Settings → Variables and Secrets → Environment variables<br><br>变量名：<code>DEEPSEEK_API_KEY</code><br>值：<code>sk-fd2d6096c3be41e0a7502e8cc6dea6a1</code><br><br><button onclick="sendMsg('+"'"+'retry'+"'"+')" style="margin-top:8px;padding:6px 14px;border-radius:12px;border:1px solid var(--gold);background:transparent;color:var(--gold);cursor:pointer;font-size:11px">'+t('retry')+'</button>');
    }
    return generateFallbackWithRetry();
  }catch(e){
    return generateFallbackWithRetry();
  }
}

function generateFallbackWithRetry(){
  const tips=LANG==='en'
    ?['Ask me about the historical background.','Try "What is this made of?" for details.','I can tell you why it matters.','Ask about the cultural significance.']
    :['你可以问我这件文物的历史背景。','想了解更多细节？试试问"这件文物是用什么做的？"','我可以告诉你它为什么如此重要。','换个角度问，比如"它在当时的社会意味着什么？"'];
  const tip=tips[Math.floor(Math.random()*tips.length)];
  return '<span style="color:var(--text-dim)">'+tip+'</span><br><br><button onclick="sendMsg('+"'retry'"+')" style="padding:6px 14px;border-radius:12px;border:1px solid var(--gold);background:transparent;color:var(--gold);cursor:pointer;font-size:11px">'+t('retry')+'</button>';
}

function generateFallback(){
  const tips=LANG==='en'
    ?['Ask me about the historical background.','Try "What is this made of?" for details.','I can tell you why it matters.','Ask about the cultural significance.']
    :['你可以问我这件文物的历史背景。','想了解更多细节？试试问"这件文物是用什么做的？"','我可以告诉你它为什么如此重要。','换个角度问，比如"它在当时的社会意味着什么？"'];
  return tips[Math.floor(Math.random()*tips.length)];
}

// ══════════════════ COLLECTION ══════════════════
let collectionFilter='all';
function setCollectionFilter(f){collectionFilter=f;renderCollection()}
function renderCollection(){
  if(!currentMuseum){document.getElementById('tab-collection').innerHTML='<div style="text-align:center;padding:60px 20px;color:var(--text-dim)">Select a museum first</div>';return}
  const ex=getAllExhibits();const coll=player.collected.length;
  let html='<div class="c-progress"><div class="cp-icon">'+renderIcon('ic-codex')+'</div><div class="cp-info"><div class="cp-title">'+t('coll_title')+'</div><div class="cp-count">'+coll+' / '+ex.length+'</div><div class="cp-bar"><div class="cp-bar-inner" style="width:'+(ex.length>0?(coll/ex.length)*100:0)+'%"></div></div></div></div>'
    +'<div class="collection-filter">'
    +'<button class="f-pill'+(collectionFilter==='all'?' active':'')+'" onclick="setCollectionFilter(\'all\')">'+t('coll_all')+' ('+ex.length+')</button>'
    +'<button class="f-pill'+(collectionFilter==='collected'?' active':'')+'" onclick="setCollectionFilter(\'collected\')">'+t('coll_collected')+' ('+coll+')</button>'
    +'<button class="f-pill'+(collectionFilter==='pending'?' active':'')+'" onclick="setCollectionFilter(\'pending\')">'+t('coll_pending')+' ('+(ex.length-coll)+')</button>'
    +'</div><div class="collection-grid">';
  const filtered=collectionFilter==='collected'?ex.filter(e=>player.collected.includes(e.id)):collectionFilter==='pending'?ex.filter(e=>!player.collected.includes(e.id)):ex;
  filtered.forEach(e=>{
    const locked=!player.collected.includes(e.id)&&collectionFilter!=='all';
    html+='<div class="c-item'+(locked?' locked':'')+'" onclick="selectExhibitAndChat(\''+e.id+'\')">'
      +(player.collected.includes(e.id)?'<div class="c-item-badge">'+renderIcon('ic-book')+'</div>':'')
      +'<div class="c-item-icon">'+renderIcon(e.icon)+'</div>'
      +'<div class="c-item-name">'+eName(e)+'</div>'
      +'<div class="c-item-meta">'+eDate(e)+'</div>'
      +'</div>';
  });
  html+='</div>';document.getElementById('tab-collection').innerHTML=html;
}
function updateCollectCount(){if(currentTab==='collection')renderCollection();renderDiscover();renderProfile()}

// ══════════════════ STORY TAB ══════════════════
function renderStory(){
  const en=(LANG==='en');
  const h=document.getElementById('tab-story');
  h.innerHTML='<div style="text-align:center;padding:60px 20px 40px;">'
    +'<div style="font-size:42px;font-weight:700;letter-spacing:-0.02em;color:var(--gold);margin-bottom:24px;">The Muse</div>'
    +'<div style="font-size:18px;color:var(--text-dim);max-width:640px;margin:0 auto;line-height:1.7;">'
    +(en
      ?'AI that guides you to <span style="color:var(--gold);">see</span> and <span style="color:var(--gold);">think</span><br>not to read and recite'
      :'让 AI 引导你去<span style="color:var(--gold);">"看"</span>和<span style="color:var(--gold);">"思考"</span><br>而不是去"读"和"背"')
    +'</div></div>'
    +'<div style="max-width:720px;margin:0 auto;padding:0 20px;">'
    +'<div class="story-card" style="background:var(--surface);border:1px solid var(--border);border-radius:20px;padding:32px;margin-bottom:24px;">'
    +'<div style="font-size:28px;margin-bottom:8px;">🏛️</div>'
    +'<div style="font-size:20px;font-weight:600;color:var(--gold);margin-bottom:16px;">'
    +(en?'Why do museums leave you feeling like you "didn\'t really get it"?':'为什么逛博物馆总觉得自己"没看懂"？')
    +'</div>'
    +'<div style="font-size:15px;color:var(--text-dim);line-height:1.8;">'
    +(en
      ?'You\'re standing in front of the Rosetta Stone. The label reads: "196 BC, Ptolemy V, granodiorite." You snap a photo. Then what? You don\'t know what to look at.<br><br>Traditional museums fall into one of two extremes: a few barren lines on a placard, or dense academic papers. Either way, it\'s a one-way broadcast. You\'re a passive receiver. Your working memory overloads within seconds, and by the time you step out of the gallery, you\'ve forgotten everything. You didn\'t "get" anything — you just "read" something.'
      :'你站在罗塞塔石碑前。展签写着"公元前196年，托勒密五世，花岗闪长岩"。你拍了张照。然后呢？你不知道该看什么。<br><br>传统博物馆的信息传达陷入两极：要么是几行干瘪的标签，要么是密密麻麻的学术论文。无论哪种，都是单向灌输——你被动接收，工作记忆瞬间过载，走出展厅就全忘了。你没有"看懂"，你只是"读到了"。')
    +'</div></div>'
    +'<div class="story-card" style="background:var(--surface);border:1px solid var(--border);border-radius:20px;padding:32px;margin-bottom:24px;">'
    +'<div style="font-size:28px;margin-bottom:8px;">🤖</div>'
    +'<div style="font-size:20px;font-weight:600;color:var(--gold);margin-bottom:16px;">'
    +(en?'AI isn\'t an encyclopedia — it\'s a guide who asks <em>you</em> questions back':'AI 不是"百科全书"，而是一个会反问你的引路人')
    +'</div>'
    +'<div style="font-size:15px;color:var(--text-dim);line-height:1.8;">'
    +(en
      ?'The Muse doesn\'t dump information on you. It\'s a Socratic dialogue partner.<br><br>When you photograph an artefact, the AI doesn\'t immediately spit out a Wikipedia entry. It starts by asking: "What\'s the first thing you notice?" — and then builds a ladder of understanding from your unique observation, one step at a time.<br><br><span style="color:var(--gold);font-weight:500;">Every visitor starts from a different place, so the AI takes a different path with each one.</span> If colour draws you in, it\'ll talk pigments and technique. If you\'re curious about a figure\'s expression, it\'ll explore narrative and symbolism. No standard answers, no fixed route. The AI meets you where your attention already is and walks you down a path of understanding that\'s yours alone.<br><br>This is what education scholars call "Dialogic Space" — not pouring knowledge into your head, but helping you construct meaning from your own perceptions and feelings. Knowledge grows from within. It\'s not poured in from outside.'
      :'The Muse 不做知识的倾倒者。它是一位苏格拉底式的对话伙伴。<br><br>拍下文物，AI 不会立刻吐出一篇维基百科。它会先问你："你注意到的第一件事是什么？"——然后顺着你独特的观察，一步步搭建理解的阶梯。<br><br><span style="color:var(--gold);font-weight:500;">每个游客的起点不同，AI 的引导路径也不同。</span>如果你被色彩打动，它就从颜料和技法切入；如果你好奇人物的表情，它就从叙事和象征聊起。没有标准答案，没有固定路线——AI 从你的第一反应出发，带着你走出只属于你自己的那条理解路径。<br><br>这是教育学家所说的"对话空间"（Dialogic Space）：不是把知识塞进你的脑子，而是从你已有的认知和感受出发，帮你主动建构意义。知识是你自己"长出来"的，不是别人灌进去的。')
    +'</div></div>'
    +'<div class="story-card" style="background:var(--surface);border:1px solid var(--border);border-radius:20px;padding:32px;margin-bottom:24px;">'
    +'<div style="font-size:28px;margin-bottom:8px;">⚠️</div>'
    +'<div style="font-size:20px;font-weight:600;color:var(--gold);margin-bottom:16px;">'
    +(en?'Why we deliberately put limits on the AI':'为什么我们故意"阉割"了 AI？')
    +'</div>'
    +'<div style="font-size:15px;color:var(--text-dim);line-height:1.8;">'
    +(en
      ?'Large language models come with a dangerous byproduct: they sound too fluent, too certain. This "epistemic authority" makes visitors stop thinking for themselves — whatever the AI says, goes.<br><br>So in The Muse, we\'ve put prompt engineering reins on the AI: it\'s forbidden from handing down aesthetic verdicts or historical pronouncements. It can say "try looking from this angle," never "this is the greatest masterpiece." The final interpretation always stays with you.<br><br>Because in a museum, the most important thing isn\'t the answer. It\'s the question <em>you</em> come up with yourself.'
      :'大语言模型有一个危险的副产品：它说话太流畅、太笃定了。这种"认知权威"（Epistemic Authority）会让游客放弃思考——AI 说什么就是什么。<br><br>所以在 The Muse 里，我们用提示词工程给 AI 套上了缰绳：它被禁止直接给出美学结论或历史定论。它只能说"试着从这个角度看"，不能说"这是最伟大的作品"。最终的解释权，永远留给你。<br><br>因为在博物馆里，最重要的不是答案，是你自己产生的那个问题。')
    +'</div></div>'
    +'<div style="text-align:center;padding:40px 0 60px;border-top:1px solid var(--border);margin-top:16px;">'
    +'<div style="font-size:13px;color:var(--text-dim);max-width:480px;margin:0 auto;line-height:1.8;">'
    +(en
      ?'A design experiment exploring what museums can become in the digital age.<br>The Muse began with a simple question: standing between technology and the artefact, there\'s a person — curious, confused, genuinely wanting to understand. What should we give them?<br><br>The answer isn\'t more information.<br>It\'s a real conversation. A journey of thought that belongs to them.'
      :'一个在数字时代探索博物馆新可能的设计实验。<br>The Muse 源于一个简单的问题：如果技术和文物之间，还站着一个人——一个有好奇心、会困惑、想要真正"看懂"的普通人——我们该给他什么？<br><br>答案不是更多的信息。<br>而是一次真正的对话。一次属于他自己的思考旅程。')
    +'</div></div>'
    +'</div>';
}

// ══════════════════ PROFILE ══════════════════
function renderProfile(){
  if(!currentMuseum){document.getElementById('tab-profile').innerHTML='<div style="text-align:center;padding:60px 20px;color:var(--text-dim)">Select a museum first</div>';return}
  const l=getLevel();const nxt=xpNext();const current=l.min;
  const pct=l.max===9999?100:Math.min(100,((player.xp-current)/(nxt-current))*100);
  const ex=getAllExhibits();const coll=player.collected.length;
  let achHtml='';ACHIEVEMENTS.forEach(a=>{achHtml+='<div class="ach-badge '+(player.achievements.includes(a.id)?'unlocked':'locked')+'">'+renderIcon(a.icon)+'<div class="ach-badge-name">'+(LANG==='en'?a.n_en:a.n_zh)+'</div></div>'});
  document.getElementById('tab-profile').innerHTML='<div class="profile-card">'
    +'<div class="pc-avatar">'+renderIcon('ic-nav-museum')+'</div>'
    +'<div class="pc-info"><div class="pc-name">'+(LANG==='en'?currentMuseum.name_en:currentMuseum.name_zh)+'</div><div class="pc-level">'+lvName(l)+' · '+coll+'/'+ex.length+' Codex</div></div>'
    +'</div>'
    +'<div class="profile-card"><div class="pc-info"><div style="display:flex;justify-content:space-between;margin-bottom:4px"><span style="font-size:11px;color:var(--text-dim)">Insight XP</span><span style="font-size:11px;color:var(--text-dim)" id="profileXpText">'+player.xp+' / '+nxt+'</span></div><div class="pc-xp-bar"><div class="pc-xp-inner" id="profileXpInner" style="width:'+pct+'%"></div></div></div></div>'
    +'<div class="section-header"><span class="section-title">'+t('prof_ach')+'</span></div>'
    +'<div class="ach-preview">'+achHtml+'</div>'
    +'<div class="profile-nav" style="margin-top:16px">'
    +'<div class="p-nav-item" onclick="showMuseumSelector()"><span class="p-nav-icon">'+renderIcon('ic-nav-museum')+'</span><span class="p-nav-label">'+t('prof_museum_switch')+'</span><span class="p-nav-arrow">&rarr;</span></div>'
    +'<div class="p-nav-item" onclick="openAchModal()"><span class="p-nav-icon">'+renderIcon('ic-nav-trophy')+'</span><span class="p-nav-label">'+t('prof_ach')+'</span><span class="p-nav-arrow">&rarr;</span></div>'
    +'<div class="p-nav-item" onclick="toggleModal(\'settings-modal\')"><span class="p-nav-icon">'+renderIcon('ic-nav-settings')+'</span><span class="p-nav-label">'+t('prof_settings')+'</span><span class="p-nav-arrow">&rarr;</span></div>'
    +'<div class="p-nav-item" onclick="toggleModal(\'about-modal\')"><span class="p-nav-icon">'+renderIcon('ic-nav-info')+'</span><span class="p-nav-label">'+t('prof_about')+'</span><span class="p-nav-arrow">&rarr;</span></div>'
    +'</div>';
  if(!document.getElementById('about-modal')){
    const div=document.createElement('div');div.className='modal-overlay';div.id='about-modal';
    div.innerHTML='<div class="modal-inner"><div class="modal-title">About Muse</div><div style="font-size:13px;line-height:1.7;color:var(--text-mid)">'+t('prof_about_text')+'</div><button class="modal-close" onclick="toggleModal(\'about-modal\')">Close</button></div>';
    document.body.appendChild(div);
  }
}
function updateProfileXP(){
  if(currentTab!=='profile')return;
  const l=getLevel();const nxt=xpNext();const current=l.min;
  const pct=l.max===9999?100:Math.min(100,((player.xp-current)/(nxt-current))*100);
  const el=document.getElementById('profileXpInner');if(el)el.style.width=pct+'%';
  const txt=document.getElementById('profileXpText');if(txt)txt.textContent=player.xp+' / '+nxt;
}
function openAchModal(){
  const modal=document.getElementById('ach-modal');const list=document.getElementById('ach-list');
  modal.querySelector('.modal-title').textContent=t('prof_ach');
  list.innerHTML=ACHIEVEMENTS.map(a=>{const u=player.achievements.includes(a.id);return '<div style="display:flex;gap:10px;align-items:center;padding:10px 0;border-bottom:1px solid rgba(255,255,255,0.04);opacity:'+(u?1:0.35)+'"><span style="font-size:22px;color:'+(u?'var(--gold)':'var(--text-dim)')+'">'+renderIcon(a.icon)+'</span><div><div style="font-size:13px;font-weight:600">'+(LANG==='en'?a.n_en:a.n_zh)+(u?' &check;':'')+'</div><div style="font-size:11px;color:var(--text-dim)">'+(LANG==='en'?a.d_en:a.d_zh)+'</div></div></div>'}).join('');
  toggleModal('ach-modal');
}
function toggleModal(id){const el=document.getElementById(id);if(el)el.classList.toggle('open')}
function resetProgress(){player={xp:0,tq:0,streak:0,qz:0,collected:[],ed:{},achievements:[]};recentExhibits=[];savePlayer();toggleModal('settings-modal');renderDiscover();renderCollection();renderProfile();renderChat()}

// ══════════════════ INIT ══════════════════
function init(){
  renderMuseumSelector();
  if(currentMuseum){
    // Museum already selected (from localStorage) — skip selector
    document.getElementById('headerMuseum').textContent=LANG==='en'?currentMuseum.name_en:currentMuseum.name_zh;
    setTimeout(()=>{
      document.getElementById('loading').classList.add('hidden');
      renderAll();
    },1800);
  } else {
    setTimeout(()=>{
      document.getElementById('loading').classList.add('hidden');
      setTimeout(()=>document.getElementById('museum-selector').classList.add('show'),400);
    },2200);
  }
}

// ══════════════════ GUIDE MODAL ══════════════════
function openGuideModal(id){
  const ex=getAllExhibits().find(e=>e.id===id);if(!ex)return;
  const modal=document.getElementById('guide-modal');
  document.getElementById('guide-icon').innerHTML=renderIcon(ex.icon);
  document.getElementById('guide-name').textContent=eName(ex);
  
  const off=document.getElementById('guide-panel-official');
  const officialText=LANG==='en'?ex.official_en:ex.official_zh;
  if(officialText){off.innerHTML='<div class="guide-official">'+officialText+'</div>';}
  else{off.innerHTML='<div class="guide-official"><p>'+(LANG==='en'?'Coming soon — detailed museum commentary will be added in a future update.':'即将上线——博物馆官方解说将在后续更新中添加。')+'</p></div>';}
  
  const app=document.getElementById('guide-panel-appreciate');
  const guideText=LANG==='en'?ex.guide_en:ex.guide_zh;
  if(guideText){
    const guideData=JSON.parse(guideText);
    let stepsHtml='';
    guideData.forEach(s=>{stepsHtml+='<div class="guide-step"><div class="guide-step-num">'+s.step+'</div><div class="guide-step-title">'+s.title+'</div><div class="guide-step-desc">'+s.desc+'</div></div>'});
    app.innerHTML=stepsHtml;
  } else {app.innerHTML='<div style="text-align:center;padding:40px 20px;color:var(--text-dim)">'+(LANG==='en'?'Coming soon':'即将上线')+'</div>';}
  
  document.querySelectorAll('.guide-tab-btn').forEach(b=>b.classList.remove('active'));
  document.querySelectorAll('.guide-tab-btn[data-guide-tab="official"]').forEach(b=>b.classList.add('active'));
  document.querySelectorAll('.guide-tab-panel').forEach(p=>p.classList.remove('active'));
  document.getElementById('guide-panel-official').classList.add('active');
  
  modal.classList.add('open');
  modal.onclick=function(e){if(e.target===modal)closeGuideModal()};
}
function closeGuideModal(){document.getElementById('guide-modal').classList.remove('open')}
function switchGuideTab(tab){
  document.querySelectorAll('.guide-tab-btn').forEach(b=>b.classList.toggle('active',b.dataset.guideTab===tab));
  document.querySelectorAll('.guide-tab-panel').forEach(p=>p.classList.remove('active'));
  document.getElementById('guide-panel-'+tab).classList.add('active');
}

// ══════════════════ Loading Screen TAB Logo ══════════════════
document.addEventListener('DOMContentLoaded',()=>{
  const loading=document.getElementById('loading');
  if(loading){
    const logoEl=document.createElement('div');
    logoEl.style.cssText='position:absolute;bottom:60px;left:50%;transform:translateX(-50%);opacity:0.4;animation:fade-up 1s ease-out 1.2s both';
    logoEl.innerHTML='<img src="tab-logo.png" alt="TAB" style="height:24px;filter:invert(1);opacity:0.6">';
    loading.appendChild(logoEl);
  }
});
