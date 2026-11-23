// AlperUp — question bank, scoring and evidence-based plan engine

const LIK = ['Katılmıyorum', 'Biraz katılmıyorum', 'Emin değilim', 'Biraz katılıyorum', 'Katılıyorum'];
const lik = (id, cat, text) => ({ id, cat, text, sub: 'Aşağıdaki ifadeye katılıyor musun?', options: LIK.map((t, i) => ({ t, v: i })) });

export const QUESTIONS = [
  { id: 'sleep', cat: 'body', text: 'Gecede ortalama kaç saat uyuyorsun?', options: [
    { t: '5 saatten az', v: 0 }, { t: '5–6 saat', v: 1 }, { t: '6–7 saat', v: 2 }, { t: '7–9 saat', v: 4 }, { t: '9 saatten fazla', v: 3 } ] },
  { id: 'exercise', cat: 'body', text: 'Haftada kaç gün spor yapıyorsun?', options: [
    { t: 'Hiç', v: 0 }, { t: '1–2 gün', v: 1 }, { t: '3 gün', v: 3 }, { t: '4–5 gün', v: 4 }, { t: '6+ gün', v: 4 } ] },
  { id: 'strength', cat: 'body', text: 'Ağırlık veya direnç antrenmanı yapıyor musun?', options: [
    { t: 'Hiç yapmıyorum', v: 0 }, { t: 'Ara sıra', v: 2 }, { t: 'Düzenli (haftada 2+)', v: 4 } ] },
  { id: 'diet', cat: 'body', text: 'Beslenmeni nasıl tanımlarsın?', options: [
    { t: 'Fast food ağırlıklı', v: 0 }, { t: 'Düzensiz', v: 1 }, { t: 'Orta karar', v: 2 }, { t: 'Genelde sağlıklı', v: 3 }, { t: 'Çok disiplinli', v: 4 } ] },
  { id: 'sugar', cat: 'body', text: 'Şekerli içecek, tatlı veya beyaz unlu gıdaları ne sıklıkla tüketiyorsun?', options: [
    { t: 'Her gün birkaç kez', v: 0 }, { t: 'Her gün', v: 1 }, { t: 'Haftada birkaç kez', v: 2 }, { t: 'Nadiren', v: 4 } ] },
  { id: 'sitting', cat: 'body', text: 'Günde toplam kaç saat oturuyorsun? (okul, iş, oyun, telefon)', options: [
    { t: '10 saatten fazla', v: 0 }, { t: '7–10 saat', v: 1 }, { t: '4–7 saat', v: 3 }, { t: '4 saatten az', v: 4 } ] },
  { id: 'caffeine', cat: 'body', text: 'Saat 14:00\'ten sonra kahve, çay veya enerji içeceği içiyor musun?', options: [
    { t: 'Her gün', v: 1 }, { t: 'Bazen', v: 2 }, { t: 'Hayır', v: 4 } ] },
  { id: 'alcohol', cat: 'body', text: 'Alkol tüketimin ne kadar?', options: [
    { t: 'Haftada 3+ kez', v: 0 }, { t: 'Haftada 1–2 kez', v: 2 }, { t: 'Ayda birkaç kez', v: 3 }, { t: 'Hiç', v: 4 } ] },
  { id: 'water', cat: 'skin', text: 'Günde ne kadar su içiyorsun?', options: [
    { t: '1 litreden az', v: 0 }, { t: '1–1,5 litre', v: 1 }, { t: '1,5–2 litre', v: 3 }, { t: '2 litreden fazla', v: 4 } ] },
  { id: 'skinType', cat: 'skin', text: 'Cilt tipin hangisi?', options: [
    { t: 'Yağlı', v: 'yagli' }, { t: 'Kuru', v: 'kuru' }, { t: 'Karma (T bölgesi yağlı)', v: 'karma' }, { t: 'Normal', v: 'normal' }, { t: 'Hassas', v: 'hassas' } ], noScore: true },
  { id: 'skinConcern', cat: 'skin', text: 'Cildindeki en büyük derdin hangisi?', options: [
    { t: 'Leke ve akne izleri', v: 'leke' }, { t: 'Siyah nokta, geniş gözenek', v: 'gozenek' }, { t: 'Kuruluk, pullanma', v: 'kuru' }, { t: 'Kızarıklık, hassasiyet', v: 'kizarik' }, { t: 'Göz altı morluğu', v: 'gozalti' }, { t: 'Belirgin bir derdim yok', v: 'yok' } ], noScore: true },
  { id: 'darkCircles', cat: 'skin', text: 'Göz altında morluk veya torba var mı?', options: [
    { t: 'Belirgin', v: 0 }, { t: 'Hafif', v: 2 }, { t: 'Yok', v: 4 } ] },
  { id: 'sun', cat: 'skin', text: 'Günde ortalama ne kadar güneş altında kalıyorsun?', options: [
    { t: '30 dakikadan az', v: 'az' }, { t: '30 dk – 2 saat', v: 'orta' }, { t: '2 saatten fazla', v: 'cok' } ], noScore: true },
  { id: 'acne', cat: 'skin', text: 'Sivilce / akne durumun nasıl?', options: [
    { t: 'Neredeyse hiç yok', v: 4 }, { t: 'Ara sıra çıkıyor', v: 3 }, { t: 'Orta düzeyde', v: 1 }, { t: 'Yoğun ve iz bırakıyor', v: 0 } ] },
  { id: 'skincare', cat: 'skin', text: 'Bir cilt bakım rutinin var mı?', options: [
    { t: 'Yok', v: 0 }, { t: 'Sadece yüzümü yıkıyorum', v: 1 }, { t: 'Temizleyici + nemlendirici', v: 3 }, { t: 'Tam rutinim var', v: 4 } ] },
  { id: 'spf', cat: 'skin', text: 'Güneş kremi kullanıyor musun?', options: [
    { t: 'Hiç', v: 0 }, { t: 'Sadece yazın', v: 1 }, { t: 'Çoğu gün', v: 3 }, { t: 'Her gün', v: 4 } ] },
  { id: 'smoke', cat: 'skin', text: 'Sigara kullanıyor musun?', options: [
    { t: 'Evet, her gün', v: 0 }, { t: 'Ara sıra', v: 2 }, { t: 'Hayır', v: 4 } ] },
  { id: 'hairType', cat: 'style', text: 'Saç tipin hangisi?', options: [
    { t: 'Düz', v: 'duz' }, { t: 'Dalgalı', v: 'dalgali' }, { t: 'Kıvırcık', v: 'kivircik' }, { t: 'Saçım çok kısa / yok', v: 'kisa' } ], noScore: true },
  { id: 'hairLoss', cat: 'style', text: 'Saç dökülmesi veya alında açılma var mı?', options: [
    { t: 'Belirgin', v: 'belirgin' }, { t: 'Hafif, yeni başladı', v: 'hafif' }, { t: 'Yok', v: 'yok' } ], noScore: true },
  { id: 'beard', cat: 'style', when: (p) => p.gender === 'erkek', text: 'Sakalın nasıl çıkıyor?', options: [
    { t: 'Hiç / çok az', v: 'yok' }, { t: 'Seyrek, boşluklu', v: 'seyrek' }, { t: 'Dolu', v: 'dolu' } ], noScore: true },
  { id: 'teeth', cat: 'style', text: 'Dişlerinin rengi ve dizilişinden memnun musun?', options: [
    { t: 'Hiç memnun değilim', v: 0 }, { t: 'Pek değil', v: 1 }, { t: 'Fena değil', v: 2 }, { t: 'Memnunum', v: 4 } ] },
  { id: 'scent', cat: 'style', text: 'Deodorant veya parfüm kullanıyor musun?', options: [
    { t: 'Hiç', v: 0 }, { t: 'Ara sıra', v: 2 }, { t: 'Her gün', v: 4 } ] },
  { id: 'posture', cat: 'style', text: 'Duruşun için ne dersin?', options: [
    { t: 'Genelde kamburum', v: 0 }, { t: 'Bazen kamburlaşıyorum', v: 2 }, { t: 'Dik dururum', v: 4 } ] },
  { id: 'grooming', cat: 'style', text: 'Saç, sakal ve kaş bakımına ne kadar özen gösteriyorsun?', options: [
    { t: 'Pek özen göstermem', v: 0 }, { t: 'Ara sıra', v: 2 }, { t: 'Düzenli ve bilinçli', v: 4 } ] },
  { id: 'styleSat', cat: 'style', text: 'Giyim tarzından ne kadar memnunsun?', options: [
    { t: 'Hiç memnun değilim', v: 0 }, { t: 'Pek değil', v: 1 }, { t: 'Fena değil', v: 2 }, { t: 'Memnunum', v: 3 }, { t: 'Çok memnunum', v: 4 } ] },
  lik('strangers', 'social', 'Tanımadığım insanlarla rahatça sohbet başlatırım'),
  lik('eyeContact', 'social', 'Konuşurken rahatça göz teması kurarım'),
  lik('conflict', 'social', 'Anlaşmazlıklar sırasında sakin ve net kalırım'),
  { id: 'textPref', cat: 'social', text: 'Telefonla konuşmak yerine mesaj yazmayı ne sıklıkla tercih edersin?', options: [
    { t: 'Asla', v: 4 }, { t: 'Nadiren', v: 3 }, { t: 'Bazen', v: 2 }, { t: 'Sık sık', v: 1 }, { t: 'Her zaman', v: 0 } ] },
  { id: 'friends', cat: 'social', text: 'Haftada kaç kez arkadaşlarınla yüz yüze vakit geçiriyorsun?', options: [
    { t: 'Hiç', v: 0 }, { t: '1 kez', v: 2 }, { t: '2–3 kez', v: 3 }, { t: '4+ kez', v: 4 } ] },
  lik('publicSpeak', 'social', 'Bir grubun önünde konuşmak beni pek germez'),
  lik('listen', 'social', 'İnsanlar benimle konuşmaktan keyif alır, iyi bir dinleyiciyim'),
  { id: 'relStatus', cat: 'social', text: 'İlişki durumun ne?', options: [
    { t: 'Bekarım, birini arıyorum', v: 'arayan' }, { t: 'Bekarım, şu an kendime odaklıyım', v: 'odak' }, { t: 'İlişkim var', v: 'iliski' }, { t: 'Evliyim', v: 'evli' } ], noScore: true },
  { id: 'relConf', cat: 'social', text: 'Romantik iletişimde (flört, ilişki) kendine ne kadar güveniyorsun?', options: [
    { t: 'Hiç', v: 0 }, { t: 'Az', v: 1 }, { t: 'Orta', v: 2 }, { t: 'İyi', v: 3 }, { t: 'Çok iyi', v: 4 } ] },
  lik('confidence', 'mind', 'Kendime genel olarak güvenirim'),
  lik('discipline', 'mind', 'Başladığım işi genelde bitiririm'),
  lik('procrast', 'mind', 'İşlerimi son ana bırakmam'),
  lik('photo', 'mind', 'Fotoğraflarda kendimi beğenirim'),
  { id: 'stress', cat: 'mind', text: 'Son bir ayda stres seviyen nasıldı?', options: [
    { t: 'Çok yüksek', v: 0 }, { t: 'Yüksek', v: 1 }, { t: 'Orta', v: 2 }, { t: 'Düşük', v: 4 } ] },
  { id: 'screen', cat: 'mind', text: 'Günlük ortalama ekran süren ne kadar?', options: [
    { t: '8 saatten fazla', v: 0 }, { t: '6–8 saat', v: 1 }, { t: '4–6 saat', v: 2 }, { t: '2–4 saat', v: 3 }, { t: '2 saatten az', v: 4 } ] },
  { id: 'mood', cat: 'mind', text: 'Son 2 haftada kendini ne sıklıkla isteksiz, mutsuz ya da umutsuz hissettin?', options: [
    { t: 'Hiç', v: 4 }, { t: 'Birkaç gün', v: 3 }, { t: 'Günlerin yarısından fazlası', v: 1 }, { t: 'Neredeyse her gün', v: 0 } ] },
  { id: 'budget', cat: 'meta', text: 'Cilt ve bakım ürünlerine ayda ne kadar ayırabilirsin?', options: [
    { t: '300 TL\'den az', v: 'dusuk' }, { t: '300–1.000 TL', v: 'orta' }, { t: '1.000 TL\'den fazla', v: 'yuksek' } ], noScore: true },
  { id: 'time', cat: 'meta', text: 'Glow up\'ına her gün ne kadar zaman ayırabilirsin?', options: [
    { t: '15 dakika', v: 1 }, { t: '30 dakika', v: 2 }, { t: '1 saat', v: 3 }, { t: '1 saatten fazla', v: 4 } ], noScore: true },
];

export const activeQuestions = (profile) => QUESTIONS.filter((q) => !q.when || q.when(profile || {}));

export const CATS = {
  face: { name: 'Yüz Uyumu', icon: '◈' },
  skin: { name: 'Cilt', icon: '✦' },
  body: { name: 'Vücut & Enerji', icon: '▲' },
  style: { name: 'Stil & Duruş', icon: '◆' },
  social: { name: 'Sosyal & İlişki', icon: '❖' },
  mind: { name: 'Zihin & Disiplin', icon: '●' },
};

export function bmiOf(p) {
  const h = (+p.height || 0) / 100, w = +p.weight || 0;
  return h > 0 && w > 0 ? w / (h * h) : null;
}

export function scoreAll(profile, answers, face) {
  const acc = {};
  for (const q of QUESTIONS) {
    if (q.noScore || q.cat === 'meta') continue;
    const a = answers[q.id];
    if (a === undefined) continue;
    (acc[q.cat] ||= []).push((a / 4) * 100);
  }
  const avg = (arr) => (arr && arr.length ? arr.reduce((s, x) => s + x, 0) / arr.length : 50);
  const s = {};
  for (const c of ['skin', 'body', 'style', 'social', 'mind']) s[c] = avg(acc[c]);
  const bmi = bmiOf(profile);
  if (bmi) {
    const bmiScore = bmi >= 18.5 && bmi < 25 ? 100 : bmi < 18.5 ? Math.max(30, 100 - (18.5 - bmi) * 18) : Math.max(15, 100 - (bmi - 25) * 9);
    s.body = s.body * 0.7 + bmiScore * 0.3;
  }
  s.face = face ? face.harmony : 60;
  for (const k in s) s[k] = Math.round(s[k]);
  const overall = Math.round(s.face * 0.25 + s.skin * 0.15 + s.body * 0.2 + s.style * 0.1 + s.social * 0.15 + s.mind * 0.15);
  // potential: lifestyle categories are highly changeable, face geometry only partially (fat loss, skin, grooming)
  const gain = (v, f) => (100 - v) * f;
  const potential = Math.min(97, Math.round(overall + gain(s.skin, 0.15 * 0.75) + gain(s.body, 0.2 * 0.7) + gain(s.style, 0.1 * 0.8)
    + gain(s.social, 0.15 * 0.6) + gain(s.mind, 0.15 * 0.6) + gain(s.face, 0.25 * 0.25)));
  return { cats: s, overall, potential, bmi: bmi ? +bmi.toFixed(1) : null };
}

// ---------------- Sources (DOIs checked against Crossref) ----------------
export const SOURCES = {
  hughes2013: {"t": "Hughes MCB ve ark. (2013). Sunscreen and prevention of skin aging. Annals of Internal Medicine, 158(11).", "url": "https://doi.org/10.7326/0003-4819-158-11-201306040-00002", "n": "Her gün güneş kremi kullananlarda 4,5 yılda ölçülebilir cilt yaşlanması görülmedi."},
  zaenglein2016: {"t": "Zaenglein AL ve ark. (2016). Guidelines of care for the management of acne vulgaris. J Am Acad Dermatol, 74(5).", "url": "https://doi.org/10.1016/j.jaad.2015.12.037", "n": "Akne tedavisinde benzoil peroksit, retinoidler ve salisilik asit için Amerikan Dermatoloji Akademisi kılavuzu."},
  bissett2005: {"t": "Bissett DL ve ark. (2005). Niacinamide: a B vitamin that improves aging facial skin appearance. Dermatologic Surgery, 31.", "url": "https://doi.org/10.1111/j.1524-4725.2005.31732", "n": "%5 niasinamid 12 haftada leke, kızarıklık ve doku görünümünü iyileştirdi."},
  mukherjee2006: {"t": "Mukherjee S ve ark. (2006). Retinoids in the treatment of skin aging: an overview of clinical efficacy and safety. Clin Interv Aging, 1(4).", "url": "https://doi.org/10.2147/ciia.2006.1.4.327", "n": "Retinoidler cilt yenilenmesini hızlandırır; ince çizgi ve ton eşitsizliğinde en güçlü kanıta sahip aktiflerden."},
  pullar2017: {"t": "Pullar JM ve ark. (2017). The roles of vitamin C in skin health. Nutrients, 9(8).", "url": "https://doi.org/10.3390/nu9080866", "n": "C vitamini kolajen üretimini destekler ve lekeleri azaltmaya yardımcı olur."},
  smith2007: {"t": "Smith RN ve ark. (2007). A low-glycemic-load diet improves symptoms in acne vulgaris patients. Am J Clin Nutr, 86(1).", "url": "https://doi.org/10.1093/ajcn/86.1.107", "n": "Düşük glisemik yüklü beslenme 12 haftada akne lezyonlarını azalttı."},
  axelsson2010: {"t": "Axelsson J ve ark. (2010). Beauty sleep: experimental study on the perceived health and attractiveness of sleep deprived people. BMJ, 341.", "url": "https://doi.org/10.1136/bmj.c6614", "n": "Uykusuz bırakılan kişiler fotoğraflarda daha az çekici ve daha yorgun algılandı."},
  sundelin2013: {"t": "Sundelin T ve ark. (2013). Cues of fatigue: effects of sleep deprivation on facial appearance. Sleep, 36(9).", "url": "https://doi.org/10.5665/sleep.2964", "n": "Uykusuzlukta göz altı morluğu, şişlik ve sarkık göz kapakları belirgin şekilde arttı."},
  hirshkowitz2015: {"t": "Hirshkowitz M ve ark. (2015). National Sleep Foundation sleep time duration recommendations. Sleep Health, 1(1).", "url": "https://doi.org/10.1016/j.sleh.2014.12.010", "n": "18–25 yaş için önerilen uyku 7–9 saat."},
  drake2013: {"t": "Drake C ve ark. (2013). Caffeine effects on sleep taken 0, 3, or 6 hours before going to bed. J Clin Sleep Med, 9(11).", "url": "https://doi.org/10.5664/jcsm.3170", "n": "Yatmadan 6 saat önce alınan kafein bile uykuyu 1 saatten fazla kısalttı."},
  who2020: {"t": "Bull FC ve ark. (2020). WHO 2020 guidelines on physical activity and sedentary behaviour. Br J Sports Med, 54.", "url": "https://doi.org/10.1136/bjsports-2020-102955", "n": "Haftada 150–300 dk orta egzersiz + 2 gün kas güçlendirme; uzun oturmayı bölmek."},
  morton2018: {"t": "Morton RW ve ark. (2018). Protein supplementation and resistance training-induced gains in muscle mass and strength: a meta-analysis. Br J Sports Med, 52.", "url": "https://doi.org/10.1136/bjsports-2017-097608", "n": "Kas kazanımı için faydanın tavan yaptığı nokta ≈ 1,6 g/kg/gün protein."},
  kreider2017: {"t": "Kreider RB ve ark. (2017). ISSN position stand: safety and efficacy of creatine supplementation. J Int Soc Sports Nutr, 14.", "url": "https://doi.org/10.1186/s12970-017-0173-z", "n": "Kreatin monohidrat, güç ve kas kazanımında en çok kanıtı olan güvenli takviye (3–5 g/gün)."},
  paluch2022: {"t": "Paluch AE ve ark. (2022). Daily steps and all-cause mortality: a meta-analysis of 15 international cohorts. Lancet Public Health, 7(3).", "url": "https://doi.org/10.1016/S2468-2667(21)00302-9", "n": "Günlük adım sayısı arttıkça ölüm riski belirgin şekilde düştü."},
  coetzee2009: {"t": "Coetzee V ve ark. (2009). Facial adiposity: a cue to health? Perception, 38(11).", "url": "https://doi.org/10.1068/p6423", "n": "Yüzdeki yağ oranı sağlık ve çekicilik algısını doğrudan etkiliyor."},
  guyuron2009: {"t": "Guyuron B ve ark. (2009). Factors contributing to the facial aging of identical twins. Plast Reconstr Surg, 123(4).", "url": "https://doi.org/10.1097/PRS.0b013e31819c4d42", "n": "Sigara ve güneş, tek yumurta ikizlerinde yüzü belirgin şekilde daha yaşlı gösterdi."},
  rhodes2006: {"t": "Rhodes G (2006). The evolutionary psychology of facial beauty. Annual Review of Psychology, 57.", "url": "https://doi.org/10.1146/annurev.psych.57.102904.190208", "n": "Simetri, ortalamaya yakınlık ve cinsiyet özellikleri yüz çekiciliğinin ana belirleyicileri."},
  little2011: {"t": "Little AC, Jones BC & DeBruine LM (2011). Facial attractiveness: evolutionary based research. Phil Trans R Soc B, 366.", "url": "https://doi.org/10.1098/rstb.2010.0404", "n": "Simetri, cilt sağlığı ve ifade çekicilik algısını etkiliyor."},
  pallett2010: {"t": "Pallett PM, Link S & Lee K (2010). New \"golden\" ratios for facial beauty. Vision Research, 50(2).", "url": "https://doi.org/10.1016/j.visres.2009.11.003", "n": "Göz bebekleri arası mesafe yüz genişliğinin ≈ %46'sı olduğunda yüzler en çekici bulundu."},
  farkas1985: {"t": "Farkas LG ve ark. (1985). Vertical and horizontal proportions of the face in young adult North American Caucasians: revision of neoclassical canons. Plast Reconstr Surg, 75(3).", "url": "https://doi.org/10.1097/00006534-198503000-00005", "n": "Klasik yüz oranlarının (üçte bir, beşte bir, ağız–burun) gerçek ölçümlerle karşılaştırılması."},
  ricketts1968: {"t": "Ricketts RM (1968). Esthetics, environment, and the law of lip relation. Am J Orthod, 54(4).", "url": "https://doi.org/10.1016/S0002-9416(68)90278-9", "n": "Burun ucu–çene ucu çizgisi (E-çizgisi) ve dudak konumu."},
  legan1980: {"t": "Legan HL & Burstone CJ (1980). Soft tissue cephalometric analysis for orthognathic surgery. J Oral Surg, 38(10).", "url": "https://pubmed.ncbi.nlm.nih.gov/6932485/", "n": "Profil konvekslik açısı ve yumuşak doku normları."},
  rufer2005: {"t": "Rüfer F ve ark. (2005). White-to-white corneal diameter: normal values in healthy humans. Cornea, 24(3).", "url": "https://doi.org/10.1097/01.ico.0000148312.01805.53", "n": "İris çapı ≈ 11,7 mm; milimetre ölçeği bu değere göre hesaplanır."},
  sheikhhoseini2018: {"t": "Sheikhhoseini R ve ark. (2018). Effectiveness of therapeutic exercise on forward head posture: a systematic review and meta-analysis. J Manipulative Physiol Ther, 41(6).", "url": "https://doi.org/10.1016/j.jmpt.2018.02.002", "n": "Düzenli egzersiz öne eğik baş duruşunu düzeltiyor."},
  dixson2013: {"t": "Dixson BJ & Brooks RC (2013). The role of facial hair in women's perceptions of men's attractiveness, health, masculinity and parenting abilities. Evol Hum Behav, 34(3).", "url": "https://doi.org/10.1016/j.evolhumbehav.2013.02.003", "n": "Kısa ve orta sakal, sakalsız yüze göre daha çekici ve olgun algılandı."},
  adil2017: {"t": "Adil A & Godwin M (2017). The effectiveness of treatments for androgenetic alopecia: a systematic review and meta-analysis. J Am Acad Dermatol, 77(1).", "url": "https://doi.org/10.1016/j.jaad.2017.02.054", "n": "Minoksidil ve finasterid erkek tipi saç dökülmesinde plaseboya göre etkili."},
  willis2006: {"t": "Willis J & Todorov A (2006). First impressions: making up your mind after a 100-ms exposure to a face. Psychological Science, 17(7).", "url": "https://doi.org/10.1111/j.1467-9280.2006.01750.x", "n": "İnsanlar bir yüz hakkında ilk izlenimi 0,1 saniyede oluşturuyor."},
  whitehead2012: {"t": "Whitehead RD ve ark. (2012). You are what you eat: within-subject increases in fruit and vegetable consumption confer beneficial skin-color changes. PLoS ONE, 7(3).", "url": "https://doi.org/10.1371/journal.pone.0032988", "n": "Daha fazla sebze-meyve 6 haftada cilde daha sağlıklı ve çekici bir ton verdi."},
  hofmann2008: {"t": "Hofmann SG & Smits JAJ (2008). Cognitive-behavioral therapy for adult anxiety disorders: a meta-analysis. J Clin Psychiatry, 69(4).", "url": "https://doi.org/10.4088/jcp.v69n0415", "n": "Kademeli maruz kalma içeren BDT kaygıda etkili."},
  huang2017: {"t": "Huang K ve ark. (2017). It doesn't hurt to ask: Question-asking increases liking. J Pers Soc Psychol, 113(3).", "url": "https://doi.org/10.1037/pspi0000097", "n": "Daha çok takip sorusu soranlar daha çok sevildi."},
  gable2004: {"t": "Gable SL ve ark. (2004). What do you do when things go right? J Pers Soc Psychol, 87(2).", "url": "https://doi.org/10.1037/0022-3514.87.2.228", "n": "Partnerin iyi haberine coşkulu tepki ilişki kalitesini artırıyor."},
  algoe2010: {"t": "Algoe SB ve ark. (2010). It's the little things: Everyday gratitude as a booster shot for romantic relationships. Personal Relationships, 17(2).", "url": "https://doi.org/10.1111/j.1475-6811.2010.01273.x", "n": "Günlük minnettarlık ilişki memnuniyetini artırıyor."},
  seligman2005: {"t": "Seligman MEP ve ark. (2005). Positive psychology progress: empirical validation of interventions. American Psychologist, 60(5).", "url": "https://doi.org/10.1037/0003-066X.60.5.410", "n": "\"3 iyi şey\" egzersizi mutluluğu 6 ay boyunca artırdı."},
  gollwitzer2006: {"t": "Gollwitzer PM & Sheeran P (2006). Implementation intentions and goal achievement: a meta-analysis. Adv Exp Soc Psychol, 38.", "url": "https://doi.org/10.1016/S0065-2601(06)38002-1", "n": "\"Eğer–o zaman\" planları hedefe ulaşmayı orta-yüksek düzeyde artırıyor."},
  hunt2018: {"t": "Hunt MG ve ark. (2018). No more FOMO: Limiting social media decreases loneliness and depression. J Soc Clin Psychol, 37(10).", "url": "https://doi.org/10.1521/jscp.2018.37.10.751", "n": "Sosyal medyayı günde 30 dk ile sınırlamak yalnızlık ve depresif hissi azalttı."},
  singh2023: {"t": "Singh B ve ark. (2023). Effectiveness of physical activity interventions for improving depression, anxiety and distress. Br J Sports Med, 57.", "url": "https://doi.org/10.1136/bjsports-2022-106195", "n": "Fiziksel aktivite depresyon ve kaygıyı belirgin şekilde azaltıyor."},
  lally2010: {"t": "Lally P ve ark. (2010). How are habits formed: Modelling habit formation in the real world. Eur J Soc Psychol, 40(6).", "url": "https://doi.org/10.1002/ejsp.674", "n": "Bir alışkanlığın otomatikleşmesi ortalama 66 gün sürdü."},
};

// ---------------- Products (Trendyol search links; no affiliate, brand examples only) ----------------
export const trendyol = (q) => 'https://www.trendyol.com/sr?q=' + encodeURIComponent(q);
export const PRODUCTS = {
  clean_gel: { n: 'Jel / köpüren temizleyici', q: 'CeraVe Köpüren Temizleyici', why: 'Yağlı ve karma cilt için; fazla yağı bariyeri bozmadan alır.' },
  clean_cream: { n: 'Nemlendiren (kremsi) temizleyici', q: 'CeraVe Nemlendiren Temizleyici', why: 'Kuru ve normal cilt için; köpürmez, cildi gerdirmez.' },
  clean_sens: { n: 'Hassas cilt temizleyicisi', q: 'La Roche-Posay Toleriane Temizleyici', why: 'Parfümsüz, sabunsuz; kızarıklık eğilimli cilt için.' },
  moist_gel: { n: 'Yağsız jel nemlendirici', q: 'Neutrogena Hydro Boost Su Jeli', why: 'Gözenek tıkamayan hafif doku.' },
  moist_cream: { n: 'Seramidli nemlendirici', q: 'CeraVe Nemlendirici Krem', why: 'Seramidler cilt bariyerini onarır; kuru/hassas cilt için.' },
  moist_lotion: { n: 'Hafif nemlendirici losyon', q: 'CeraVe Nemlendirici Losyon', why: 'Normal ve karma cilt için günlük nem.' },
  spf: { n: 'SPF 50 güneş kremi', q: 'La Roche-Posay Anthelios SPF 50', why: 'Geniş spektrum UVA/UVB; her sabah, 2 parmak boyu.' },
  spf_budget: { n: 'Uygun fiyatlı SPF 50', q: 'Bioderma Photoderm SPF 50', why: 'Bütçe dostu geniş spektrum koruma.' },
  niacinamide: { n: 'Niasinamid serum', q: 'The Ordinary Niacinamide 10% Zinc 1%', why: 'Gözenek, yağ dengesi ve leke için; akşam 2–3 damla.' },
  bha: { n: '%2 salisilik asit (BHA)', q: "Paula's Choice 2% BHA", why: 'Siyah nokta ve gözenek için; haftada 2–3 akşam.' },
  bha_budget: { n: '%2 salisilik asit (uygun fiyatlı)', q: 'The Ordinary Salicylic Acid 2% Solution', why: 'Aynı aktif, daha düşük fiyat.' },
  bpo: { n: 'Benzoil peroksit jel (%2,5–5)', q: 'benzoil peroksit jel', why: 'İltihaplı sivilcede kanıtı en güçlü reçetesiz aktif. Önce dermatoloğa danış.' },
  retinol: { n: 'Düşük doz retinol', q: 'The Ordinary Retinol 0.2% in Squalane', why: 'Haftada 2 akşamla başla; ton, doku ve iz için. Hamilelikte kullanılmaz.' },
  vitc: { n: 'C vitamini serum', q: 'C vitamini serum', why: 'Sabah SPF öncesi; leke ve ışıltı için.' },
  lipspf: { n: 'SPF\'li dudak koruyucu', q: 'SPF li dudak koruyucu', why: 'Dudaklar da güneşte yaşlanır ve kurur.' },
  minox: { n: 'Minoksidil (doktor önerisiyle)', q: 'minoksidil', why: 'Erkek tipi saç dökülmesinde kanıtlı. Kullanmadan önce dermatoloğa danış.' },
  trimmer: { n: 'Sakal / saç düzeltme makinesi', q: 'sakal düzeltme makinesi', why: 'Sakal çizgisini ve uzunluğunu evde düzenli tutmak için.' },
  brow: { n: 'Kaş makası ve cımbız seti', q: 'kaş makası cımbız seti', why: 'Kaş arası ve alt kısmını temizlemek için.' },
  clay: { n: 'Mat saç şekillendirici kil', q: 'mat saç şekillendirici kil wax', why: 'Doğal, dokulu ve hacimli saç için.' },
  curl: { n: 'Bukle kremi', q: 'bukle belirginleştirici krem', why: 'Dalgalı/kıvırcık saçta kabarmayı azaltır, bukleyi tanımlar.' },
  whey: { n: 'Whey protein', q: 'whey protein tozu', why: 'Günlük protein hedefini yemekle tutturamazsan pratik destek.' },
  creatine: { n: 'Kreatin monohidrat', q: 'kreatin monohidrat', why: 'Günde 3–5 g; güç ve kas kazanımında en kanıtlı takviye.' },
  dumbbell: { n: 'Ayarlanabilir dambıl seti', q: 'ayarlanabilir dambıl seti', why: 'Salona gidemiyorsan evde direnç antrenmanı için.' },
  pullup: { n: 'Kapı barfiks barı', q: 'kapı barfiks barı', why: 'Sırt ve kol için evde en verimli ekipman.' },
  bottle: { n: '2 litrelik su matarası', q: '2 litre su matarası', why: 'Gün boyu su hedefini görünür kılar.' },
  sleepmask: { n: 'Uyku göz bandı', q: 'uyku göz bandı', why: 'Karanlık oda daha derin uyku demek.' },
  floss: { n: 'Diş ipi', q: 'diş ipi', why: 'Diş eti sağlığı ve nefes için her akşam.' },
  deo: { n: 'Antiperspirant deodorant', q: 'antiperspirant deodorant', why: 'Ter ve koku kontrolü; sabah temiz cilde.' },
  book_habits: { n: 'Kitap: Atomik Alışkanlıklar', q: 'Atomik Alışkanlıklar kitap', why: 'Küçük alışkanlıklarla büyük değişim; plana uyumun için.' },
  book_social: { n: 'Kitap: Dost Kazanma ve İnsanları Etkileme Sanatı', q: 'Dost Kazanma ve İnsanları Etkileme Sanatı kitap', why: 'Sohbet ve ilk izlenim için klasik.' },
};

// ---------------- Plan engine ----------------
// task: { id, title, detail, freq: 'daily'|'weekly', time: 'sabah'|'gün'|'akşam', mins, src, prod: [] }
const T = (id, title, detail, extra = {}) => ({ id, title, detail, freq: 'daily', time: 'gün', mins: 5, prod: [], ...extra });

export function buildPlan(profile, answers, face, score) {
  const male = profile.gender === 'erkek';
  const age = +profile.age || 20;
  const bmi = score.bmi;
  const w = +profile.weight || 70;
  const modules = [];
  const A = answers;
  const low = A.budget === 'dusuk';
  const concern = A.skinConcern || 'yok';

  // ---- SKIN ----
  const skinT = [];
  const st = A.skinType || 'normal';
  const cleanser = { yagli: 'jel bazlı, köpüren bir temizleyici', kuru: 'kremsi, köpürmeyen bir temizleyici', karma: 'hafif jel temizleyici', normal: 'nazik bir temizleyici', hassas: 'parfümsüz, sabunsuz bir temizleyici' }[st];
  const moist = { yagli: 'yağsız (oil-free) jel nemlendirici', kuru: 'seramidli zengin bir nemlendirici', karma: 'hafif losyon nemlendirici', normal: 'hafif nemlendirici', hassas: 'parfümsüz, seramidli nemlendirici' }[st];
  const pClean = { yagli: 'clean_gel', karma: 'clean_gel', kuru: 'clean_cream', normal: 'clean_cream', hassas: 'clean_sens' }[st];
  const pMoist = { yagli: 'moist_gel', karma: 'moist_lotion', kuru: 'moist_cream', normal: 'moist_lotion', hassas: 'moist_cream' }[st];
  const acne = A.acne ?? 4;
  skinT.push(T('am-routine', 'Sabah rutini: temizle → nemlendir → SPF 50', `${cleanser[0].toUpperCase() + cleanser.slice(1)} ile yüzünü yıka, ${moist} sür, ardından geniş spektrumlu SPF 30–50 güneş kremi (yüz + boyun için yaklaşık 2 parmak boyu). Bulutlu havada da.${A.sun === 'cok' ? ' Dışarıda çok kaldığın için 2–3 saatte bir yenile.' : ''}`, { time: 'sabah', mins: 4, src: 'hughes2013', prod: [pClean, pMoist, low ? 'spf_budget' : 'spf'] }));
  const pmActive = acne <= 1 ? 'bpo' : concern === 'leke' && age >= 18 ? 'retinol' : 'niacinamide';
  const pmText = { bpo: 'Akneye karşı %2,5–5 benzoil peroksit ince bir tabaka (dermatoloğuna danışarak).', retinol: 'Haftada 2–3 akşam bezelye kadar düşük doz retinol; cildin alıştıkça sıklığı artır. Retinol kullandığın sabahlarda SPF şart.', niacinamide: '%4–10 niasinamid serumu; gözenek, leke ve cilt bariyeri için kanıtı güçlü.' }[pmActive];
  skinT.push(T('pm-routine', 'Akşam rutini: temizle → aktif → nemlendir', `Günün kirini ${cleanser} ile temizle. ${pmText} Son olarak nemlendirici.`, { time: 'akşam', mins: 4, src: { bpo: 'zaenglein2016', retinol: 'mukherjee2006', niacinamide: 'bissett2005' }[pmActive], prod: [pmActive] }));
  if (st === 'yagli' || st === 'karma' || concern === 'gozenek' || acne <= 3) skinT.push(T('bha', '%2 salisilik asit (BHA)', 'Haftada 2–3 akşam, T bölgesine. Gözenekleri temizler, siyah noktayı azaltır. Retinol kullandığın gece kullanma.', { freq: 'weekly', perWeek: 2, time: 'akşam', mins: 2, src: 'zaenglein2016', prod: [low ? 'bha_budget' : 'bha'] }));
  if (concern === 'leke' && !low) skinT.push(T('vitc', 'Sabah C vitamini', 'Temizlikten sonra, SPF\'den önce C vitamini serumu. Lekeleri zamanla açar, cilde ışıltı verir.', { time: 'sabah', mins: 1, src: 'pullar2017', prod: ['vitc'] }));
  if (acne === 0) skinT.push(T('derm', 'Dermatolog randevusu al', 'Yoğun ve iz bırakan akne tıbbi tedaviyle (reçeteli retinoidler, gerekirse izotretinoin) en etkili şekilde kontrol altına alınır. Bu, planın en yüksek getirili adımı.', { freq: 'weekly', mins: 10, once: true, src: 'zaenglein2016' }));
  if (acne <= 2 && (A.sugar ?? 4) <= 1) skinT.push(T('glycemic', 'Şekeri ve beyaz unu azalt', 'Şekerli içecek ve beyaz ekmek yerine tam tahıl, bakliyat, protein. Düşük glisemik beslenme 12 haftada akneyi azalttı.', { mins: 0, src: 'smith2007' }));
  if ((A.darkCircles ?? 4) <= 2 || concern === 'gozalti') skinT.push(T('eyes', 'Göz altı için uyku + soğuk kompres', 'Göz altı morluğu ve şişlik en çok uykusuzlukla artıyor. 7–9 saat uyu, sabah 2 dk soğuk kaşık/kompres uygula, gece tuzlu yemeyi azalt.', { time: 'sabah', mins: 2, src: 'sundelin2013' }));
  if ((A.smoke ?? 4) < 4) skinT.push(T('smoke', 'Sigarayı azalt → bırak', 'İkiz çalışmalarında sigara içen kardeşin yüzü belirgin şekilde daha yaşlı görünüyor. Bugün 1 sigara eksilt. Destek: ALO 171 Sigara Bırakma Danışma Hattı.', { mins: 1, src: 'guyuron2009' }));
  skinT.push(T('veg', '5 porsiyon sebze & meyve', 'Karotenoidden zengin beslenme (havuç, domates, ıspanak, kırmızı biber) birkaç haftada cilde sağlıklı, sıcak bir ton veriyor.', { mins: 0, src: 'whitehead2012' }));
  if ((A.water ?? 4) < 3) skinT.push(T('water', '2 litre su', 'Yanında matara taşı; her öğünle bir bardak. Susuzluk yorgun görünüm ve düşük enerji demek.', { mins: 0, prod: ['bottle'] }));
  skinT.push(T('lips', 'Dudak bakımı', 'Gün içinde SPF\'li dudak koruyucu. Kuru, çatlak dudak yüzün genel bakımlı görüntüsünü bozar.', { mins: 0, prod: ['lipspf'] }));
  // keep the skin plan short: the two core routines + the 2 highest-impact extras
  { const pri = ['derm', 'smoke', 'bha', 'glycemic', 'eyes', 'vitc', 'water', 'veg', 'lips'];
    const core = skinT.filter((t) => t.id === 'am-routine' || t.id === 'pm-routine');
    const extra = skinT.filter((t) => !core.includes(t)).sort((a, b) => pri.indexOf(a.id) - pri.indexOf(b.id)).slice(0, 2);
    skinT.length = 0; skinT.push(...core, ...extra); }
  modules.push({ key: 'skin', title: 'Cilt Protokolü', why: 'Cilt kalitesi, yüz çekiciliği algısında simetri kadar etkili ve en hızlı değiştirilebilen alan.', tasks: skinT, src: 'little2011' });

  // ---- BODY ----
  const bodyT = [];
  bodyT.push(T('sleep', '7–9 saat uyku, sabit saat', `Her gün aynı saatte yat. Yatmadan 45 dk önce ekranı bırak${(A.caffeine ?? 4) < 4 ? ', 14:00\'ten sonra kafein alma (öğleden sonraki kahve uykunu kısaltıyor)' : ''}. Uykusuz kişiler deneylerde belirgin şekilde daha az çekici ve daha yorgun algılandı.`, { time: 'akşam', mins: 0, src: 'axelsson2010', prod: ['sleepmask'] }));
  if ((A.caffeine ?? 4) <= 2) bodyT.push(T('caffeine', '14:00\'ten sonra kafein yok', 'Kahve, çay ve enerji içeceklerini öğlene çek. Yatmadan 6 saat önce alınan kafein bile uykuyu 1 saatten fazla kısalttı.', { mins: 0, src: 'drake2013' }));
  const prot = Math.round(w * 1.6);
  bodyT.push(T('protein', `Günde ${prot} g protein`, `Kilonun kg başına 1,6 g: yumurta, tavuk, yoğurt, mercimek, ton balığı. Kas kazanımında faydanın tavan yaptığı miktar bu.`, { mins: 0, src: 'morton2018', prod: low ? [] : ['whey'] }));
  bodyT.push(T('steps', '8.000+ adım', 'Yürüyüş en kolay yağ yakıcı ve enerji artırıcı. Telefon görüşmelerini yürüyerek yap.', { mins: 20, src: 'paluch2022' }));
  if ((A.sitting ?? 4) <= 1) bodyT.push(T('standup', 'Her 45 dakikada 3 dk kalk', 'Uzun oturmayı bölmek WHO\'nun da önerisi. Ayağa kalk, omuzlarını geriye çevir, biraz yürü.', { mins: 3, src: 'who2020' }));
  bodyT.push(T('lift', 'Direnç antrenmanı (tüm vücut)', 'Haftada 3 gün, 45 dk: squat, şınav/bench press, barfiks/row, omuz press, plank. Her hafta ağırlığı veya tekrarı biraz artır.', { freq: 'weekly', perWeek: 3, mins: 45, src: 'who2020', prod: (A.exercise ?? 0) <= 1 ? ['dumbbell', 'pullup'] : ['pullup'] }));
  if ((A.strength ?? 0) >= 2 && !low) bodyT.push(T('creatine', 'Kreatin (isteğe bağlı)', 'Antrenman yapıyorsan günde 3–5 g kreatin monohidrat güç ve kas kazanımını destekler. Böbrek rahatsızlığın varsa doktoruna danış.', { mins: 0, src: 'kreider2017', prod: ['creatine'] }));
  if (bmi && bmi >= 25) bodyT.push(T('deficit', 'Günlük ~400 kcal açık', 'Yüzdeki yağ bölgesel egzersizle değil, toplam yağ kaybıyla azalır. Haftada vücut ağırlığının %0,5–1\'i kadar ver: çene hattı ve elmacık kemiklerin belirginleşir.', { mins: 0, src: 'coetzee2009' }));
  if (bmi && bmi < 18.5) bodyT.push(T('surplus', 'Günlük ~300–400 kcal fazla', 'Sağlıklı kilo al: fıstık ezmesi, süt, yulaf, pilav. Antrenmanla birleşince omuz ve yüz daha dolgun ve güçlü görünür.', { mins: 0 }));
  if ((A.alcohol ?? 4) <= 2) bodyT.push(T('alcohol', 'Alkolü haftada 1 geceyle sınırla', 'Alkol uyku kalitesini düşürür, yüzde şişlik yapar ve kalori ekler.', { freq: 'weekly', mins: 0 }));
  modules.push({ key: 'body', title: 'Vücut & Enerji', why: 'Yağ oranı, kas ve uyku hem yüzünü hem enerjini doğrudan değiştirir.', tasks: bodyT });

  // ---- FACE-SPECIFIC ----
  const faceT = [];
  if (face) {
    const pr = face.profile;
    if ((face.scores.jaw < 65 || (pr && pr.scores.gonial < 60)) && bmi && bmi >= 23) faceT.push(T('jawfat', 'Çene hattı için yağ oranını düşür', 'Ölçümüne göre çene hattın daha az belirgin. En güçlü kaldıraç vücut yağ oranını düşürmek; kalori açığı + protein + antrenman.', { mins: 0, src: 'coetzee2009' }));
    if (male && A.beard !== 'yok' && (face.scores.jaw < 70 || face.raw.lipChin < 1.6 || (pr && pr.scores.chin < 65))) faceT.push(T('beard', 'Sakal ile çene hattını şekillendir', 'Yanakta yüksek, boyunda çene altının 2 parmak üstünde keskin bir çizgi bırak; çene ucunda sakalı biraz daha uzun tut. Çene hattını ve profildeki çeneyi görsel olarak öne çıkarır.', { freq: 'weekly', mins: 15, src: 'dixson2013', prod: ['trimmer'] }));
    if (face.scores.eyes < 70) faceT.push(T('brows', 'Kaşlarını şekillendir', 'Kaşların arasını ve altını temizlemek göz bölgesini açar ve daha net bir bakış verir.', { freq: 'weekly', mins: 10, prod: ['brow'] }));
    if (face.scores.symmetry < 70) faceT.push(T('chew', 'Simetri alışkanlıkları', 'İki tarafla eşit çiğne, hep aynı yana yatarak uyumamaya çalış, çeneni eline dayama. Etkisi sınırlı ama zararsız.', { mins: 0 }));
    if (face.smile && !face.smile.duchenne) faceT.push(T('smile', 'Gözlerle gülümseme pratiği', 'Taramanda gülümsemen göz bölgesine pek yansımadı. Aynada gözleri hafifçe kısan (Duchenne) gülümsemeyi çalış; daha sıcak ve güvenilir görünür.', { mins: 1, src: 'little2011' }));
    else faceT.push(T('smile', 'Gerçek gülümseme pratiği', 'Gözleri de kısan (Duchenne) gülümseme yüzü daha çekici ve güvenilir gösterir. Fotoğraf çekmeden önce aklından komik bir şey geçir.', { mins: 1, src: 'little2011' }));
  }
  faceT.push(T('posture-neck', 'Boyun duruşu: chin tuck', 'Duvara sırtını yasla, çeneni geriye çekerek "çift çene" yap, 5 sn tut, 10 tekrar. Öne eğik baş duruşunu düzeltir, profilde çene–boyun hattını iyileştirir.', { mins: 3, src: 'sheikhhoseini2018' }));
  if (!face) faceT.push(T('smile', 'Gerçek gülümseme pratiği', 'Gözleri de kısan (Duchenne) gülümseme yüzü daha çekici ve güvenilir gösterir.', { mins: 1, src: 'little2011' }));
  modules.push({ key: 'face', title: 'Yüz Protokolü', why: 'Kemik yapını değiştiremezsin ama yağ oranı, cilt, kaş, sakal, saç ve duruşla yüz uyumunu ciddi şekilde artırabilirsin. ("Mewing" ve yüz yogası için güçlü bilimsel kanıt yok, bu yüzden planda yoklar.)', tasks: faceT, src: 'rhodes2006' });

  // ---- STYLE ----
  const hair = {
    oval: 'Şanslısın: neredeyse her kesim yakışır. Yanlar kısa, üstte doku olan bir kesim dene.',
    kare: 'Güçlü çene hattını öne çıkar: yanlar kısa, üst orta uzunlukta, hafif dağınık doku.',
    yuvarlak: 'Yüzü uzun göstermek için üstte hacim (quiff, pompadour), yanlar çok kısa. Kâküllü düz kesimlerden kaçın.',
    uzun: 'Yüzü kısaltmak için yanlarda biraz hacim, üstte çok yüksek hacimden kaçın; perçem/fringe iyi gider.',
    kalp: 'Geniş alnı dengelemek için orta uzunlukta, alnı kısmen kapatan bir kesim; alt yüzde sakal dengeler.',
  };
  const hairF = {
    oval: 'Katlı kesimler ve perdeli kâküller yakışır.', kare: 'Yumuşak dalgalar ve katlar köşeli hatları yumuşatır.',
    yuvarlak: 'Uzun katlar ve yan ayrım yüzü uzun gösterir; çene hizasında küt kesimden kaçın.', uzun: 'Kâkül ve omuz hizasında dalgalar yüzü dengeler.',
    kalp: 'Çene hizasında hacim veren kesimler ve yan kâkül.',
  };
  const shape = face ? face.shape : 'oval';
  const curly = A.hairType === 'dalgali' || A.hairType === 'kivircik';
  const styleT = [
    T('haircut', `Yüz şekline göre saç (${shape})`, (male ? hair[shape] : hairF[shape]) + (curly ? ' Dalgalı/kıvırcık saçta doğal dokuyu kullan; kuru havluyla değil mikrofiber havlu veya tişörtle kurula.' : ''), { freq: 'weekly', mins: 30, once: true, prod: male && A.hairType !== 'kisa' ? [curly ? 'curl' : 'clay'] : curly ? ['curl'] : [] }),
    T('fit', 'Kıyafette "tam oturan" kuralı', 'Çekiciliği marka değil beden uyumu belirler: omuz dikişi omuz ucunda, pantolon bilekte hafif kırılma. Nötr renklerle (siyah, beyaz, lacivert, gri, bej) kapsül gardırop kur.', { freq: 'weekly', mins: 30, src: 'willis2006' }),
    T('posture', 'Dik duruş kontrolü', 'Telefonuna 3 hatırlatıcı kur: omuzlar geride ve aşağıda, göğüs açık, baş dik. Dik duruş daha uzun ve özgüvenli gösterir.', { mins: 1 }),
    T('teeth', 'Diş bakımı: 2× fırça + diş ipi', 'Beyaz, bakımlı dişler gülümsemenin etkisini katlar.' + ((A.teeth ?? 4) <= 1 ? ' Renk veya dizilişten memnun değilsen bir diş hekimine kontrol ve profesyonel temizlik için git; beyazlatma ve şeffaf plak seçeneklerini sor.' : ''), { time: 'akşam', mins: 3, prod: ['floss'] }),
  ];
  if ((A.scent ?? 4) < 4) styleT.push(T('scent', 'Her sabah deodorant', 'Koku, ilk izlenimin görünmeyen ama güçlü parçası. Sabah duştan sonra antiperspirant; parfümü 1–2 sıkım, boyun ve bileğe.', { time: 'sabah', mins: 1, prod: ['deo'] }));
  if ((A.grooming ?? 4) < 4) styleT.push(T('groom', 'Haftalık bakım seansı', male ? 'Sakal çizgisi, kaş arası, burun/kulak kılı, tırnaklar.' : 'Kaş, tırnak, saç bakım maskesi.', { freq: 'weekly', mins: 20, prod: male ? ['trimmer', 'brow'] : ['brow'] }));
  if (A.hairLoss === 'belirgin' || A.hairLoss === 'hafif') styleT.push(T('hairloss', 'Saç dökülmesi için dermatolog', 'Erken müdahale edilen saç dökülmesi çok daha iyi korunur. Minoksidil ve finasterid gibi tedavilerin kanıtı var, ama hangisinin sana uygun olduğuna dermatolog karar vermeli. Saçını kısa tutmak açılmayı daha az belirgin gösterir.', { freq: 'weekly', once: true, mins: 30, src: 'adil2017', prod: ['minox'] }));
  modules.push({ key: 'style', title: 'Stil & Duruş', why: 'İlk izlenimin büyük kısmı saniyeler içinde stil, bakım ve duruşla oluşur.', tasks: styleT, src: 'willis2006' });

  // ---- SOCIAL / RELATIONSHIP ----
  const socT = [];
  socT.push(T('exposure', 'Sosyal cesaret görevi', 'Kademeli maruz kalma: Hafta 1: 3 kişiye selam ve göz teması. Hafta 2: bir yabancıya soru sor. Hafta 3: 2 dakikalık sohbet. Hafta 4+: yeni bir gruba katıl. Kaygı her tekrarla azalır.', { mins: 5, src: 'hofmann2008' }));
  socT.push(T('questions', 'Sohbette 2 takip sorusu sor', 'Karşındakinin cevabının üstüne soru sormak ("Nasıl başladın buna?") seni belirgin şekilde daha sevilen biri yapıyor.', { mins: 0, src: 'huang2017', prod: ['book_social'] }));
  if ((A.textPref ?? 0) <= 1) socT.push(T('call', 'Mesaj yerine bir arama yap', 'Haftada en az 2 kez mesaj yerine ara. Ses, mesajdan daha güçlü bağ kurar ve telefon kaygını zamanla eritir.', { freq: 'weekly', perWeek: 2, mins: 5 }));
  if ((A.friends ?? 4) <= 2) socT.push(T('friends', 'Haftada 2 yüz yüze buluşma', 'Bir arkadaşınla kahve, yürüyüş, maç ya da ders çalışma. Yüz yüze vakit, sosyal özgüveni ve ruh halini en hızlı besleyen alışkanlıklardan.', { freq: 'weekly', perWeek: 2, mins: 60 }));
  if ((A.publicSpeak ?? 4) <= 1) socT.push(T('speak', 'Haftada 1 kez sesli konuş', 'Derste söz al, toplantıda bir fikir söyle ya da 1 dakikalık bir konuşmayı telefonuna kaydedip izle. Küçük ve tekrarlı maruz kalma kaygıyı düşürür.', { freq: 'weekly', mins: 10, src: 'hofmann2008' }));
  const rs = A.relStatus;
  if (rs === 'arayan') {
    socT.push(T('meet', 'Yeni insanlarla tanışacağın 1 ortam', 'Haftada bir kez: spor salonu dersi, kurs, gönüllülük, kulüp ya da arkadaş buluşması. Tanışmaların çoğu ortak çevrelerden çıkıyor.', { freq: 'weekly', mins: 60 }));
    socT.push(T('approach', 'İlk adımı at', 'Haftada 1 kez ilgilendiğin birine samimi bir iltifat ya da soru ile yaklaş. Sonuç değil, cesaret sayılır.', { freq: 'weekly', mins: 5, src: 'hofmann2008' }));
  } else if (rs === 'iliski' || rs === 'evli') {
    socT.push(T('acr', 'Aktif-yapıcı tepki ver', 'Partnerin iyi bir haber paylaştığında heyecanla soru sor ("Anlatsana, nasıl oldu?"). Bu tepki tarzı ilişki memnuniyetini güçlü şekilde artırıyor.', { mins: 0, src: 'gable2004' }));
    socT.push(T('thanks', 'Partnerine 1 somut teşekkür', 'Küçük şeyler için teşekkür etmek iki tarafın da ilişki memnuniyetini artırıyor.', { mins: 1, src: 'algoe2010' }));
    socT.push(T('date', 'Haftalık özel zaman', 'Telefonsuz 1 saat: yürüyüş, yemek, yeni bir aktivite.', { freq: 'weekly', mins: 60 }));
  }
  modules.push({ key: 'social', title: rs === 'iliski' || rs === 'evli' ? 'Sosyal & İlişki' : 'Sosyal Çekim', why: 'Sıcaklık, merak ve cesaret; fiziksel görünüm kadar çekicilik yaratır ve tamamen geliştirilebilir.', tasks: socT });

  // ---- MIND ----
  const mindT = [
    T('3good', 'Günün 3 iyi şeyi', 'Yatmadan önce o gün iyi giden 3 şeyi ve nedenini yaz. Deneylerde 6 ay boyunca mutluluğu artırdı.', { time: 'akşam', mins: 3, src: 'seligman2005' }),
    T('ifthen', 'Eğer–o zaman planı', 'Her sabah bir tane yaz: "Eğer saat 19:00 olursa, spor çantamı alıp çıkacağım." Hedefe ulaşma olasılığını ciddi şekilde artırıyor.', { time: 'sabah', mins: 1, src: 'gollwitzer2006', prod: ['book_habits'] }),
  ];
  if ((A.screen ?? 4) <= 2) mindT.push(T('social-limit', 'Sosyal medya ≤ 30 dk', 'Uygulama zamanlayıcısı kur. Sosyal medyayı günde 30 dk ile sınırlayanlarda yalnızlık ve depresif his 3 haftada azaldı.', { mins: 0, src: 'hunt2018' }));
  if ((A.stress ?? 4) <= 1 || (A.mood ?? 4) <= 1) mindT.push(T('move-mood', 'Stres için hareket', 'Günde 20–30 dk tempolu yürüyüş veya antrenman; fiziksel aktivite depresyon ve kaygıyı belirgin şekilde azaltıyor. Kendini uzun süre kötü hissediyorsan bir uzmana danışmak en güçlü adım.', { mins: 25, src: 'singh2023' }));
  mindT.push(T('breath', '5 dk nefes / meditasyon', '4 sn al, 4 sn tut, 6 sn ver. Stres anında sakin ve net kalmanı kolaylaştırır.', { mins: 5 }));
  if ((A.procrast ?? 4) <= 1) mindT.push(T('two-min', '2 dakika kuralı', 'Ertelediğin işe sadece 2 dakika başla. Başlamak en zor kısım; çoğu zaman devamı gelir.', { mins: 2, src: 'gollwitzer2006' }));
  modules.push({ key: 'mind', title: 'Zihin & Disiplin', why: 'Glow up bir maraton: alışkanlıkların otomatikleşmesi ortalama 66 gün sürüyor. Disiplin sistemi bunu taşır.', tasks: mindT, src: 'lally2010' });

  // Order modules by weakness, respecting goals
  const goals = profile.goals || [];
  const goalMap = { yuz: 'face', cilt: 'skin', vucut: 'body', stil: 'style', iliski: 'social', zihin: 'mind' };
  const pri = (m) => (score.cats[m.key] ?? 60) - (goals.some((g) => goalMap[g] === m.key) ? 25 : 0);
  modules.sort((a, b) => pri(a) - pri(b));

  const budget = { 1: 6, 2: 9, 3: 12, 4: 16 }[A.time || 2];
  let n = 0;
  for (const m of modules) for (const t of m.tasks) {
    t.module = m.key;
    t.core = t.freq === 'weekly' || n++ < budget || m === modules[0];
  }
  const focus = modules.slice(0, 3).map((m) => m.key);
  return { modules, focus, createdAt: Date.now(), weeks: 12 };
}

export function shoppingList(plan) {
  const seen = new Map();
  for (const m of plan.modules) for (const t of m.tasks) for (const p of t.prod || []) if (PRODUCTS[p] && !seen.has(p)) seen.set(p, { id: p, ...PRODUCTS[p], module: m.key, task: t.title });
  return [...seen.values()];
}

export function insights(face, score, answers) {
  const good = [], improve = [];
  if (face) {
    const f = face.scores;
    const name = { symmetry: 'Yüz simetrisi', thirds: 'Dikey yüz oranları', lipChin: 'Dudak–çene oranı', fifths: 'Göz aralığı', eyes: 'Göz bölgesi', jaw: 'Çene hattı', nose: 'Burun–göz oranı', ipd: 'Göz bebeği mesafesi', mouth: 'Ağız–burun oranı' };
    const sorted = Object.entries(f).sort((a, b) => b[1] - a[1]);
    sorted.slice(0, 2).forEach(([k, v]) => v >= 60 && good.push(name[k]));
    sorted.slice(-2).forEach(([k, v]) => v < 75 && improve.push(name[k]));
  }
  const c = score.cats;
  const catN = { skin: 'Cilt alışkanlıkları', body: 'Fitness & uyku', style: 'Stil & duruş', social: 'Sosyal özgüven', mind: 'Zihinsel disiplin' };
  for (const k of Object.keys(catN)) {
    if (c[k] >= 72) good.push(catN[k]); else if (c[k] < 55) improve.push(catN[k]);
  }
  if (!good.length) good.push('Değişime hazır olman: buraya kadar gelmen ilk adım');
  return { good: good.slice(0, 4), improve: improve.slice(0, 4), lowMood: (answers.mood ?? 4) <= 1 };
}

// ---------------- General analysis report ----------------
// returns [{ title, icon, paras: [{ text, src? }] }]
export function report(profile, A, face, score) {
  const male = profile.gender === 'erkek';
  const c = score.cats;
  const lvl = (v) => (v >= 80 ? 'çok iyi' : v >= 65 ? 'iyi' : v >= 50 ? 'orta' : 'geliştirilmeli');
  const S = [];
  const sorted = Object.entries(c).sort((a, b) => b[1] - a[1]);
  const nm = (k) => CATS[k].name;
  const bmi = score.bmi;
  const bmiTxt = !bmi ? '' : bmi < 18.5 ? `VKİ'n ${bmi}: normalin altında. Kas ve sağlıklı kilo kazanmak yüzünü ve vücudunu daha güçlü gösterir.` : bmi < 25 ? `VKİ'n ${bmi}: sağlıklı aralıkta (18,5–24,9).` : bmi < 30 ? `VKİ'n ${bmi}: hafif kilolu aralıkta. Haftada %0,5–1 yağ kaybı yüzündeki hatları belirgin şekilde netleştirir.` : `VKİ'n ${bmi}: obezite aralığında. Kilo kaybı hem sağlığın hem görünümün için planın en büyük kaldıracı; bir doktor/diyetisyen desteği öneririm.`;
  S.push({ title: 'Genel tablo', icon: '◎', paras: [
    { text: `Genel skorun ${score.overall}/100, 12 haftalık plan sonunda tahmini potansiyelin ${score.potential}/100. En güçlü alanların ${nm(sorted[0][0])} (${sorted[0][1]}) ve ${nm(sorted[1][0])} (${sorted[1][1]}). En çok kazanç sağlayacağın alanlar ${nm(sorted.at(-1)[0])} (${sorted.at(-1)[1]}) ve ${nm(sorted.at(-2)[0])} (${sorted.at(-2)[1]}).` },
    bmiTxt && { text: bmiTxt, src: bmi >= 25 ? 'coetzee2009' : undefined },
  ].filter(Boolean) });

  if (face) {
    const f = face, r = f.raw, s = f.scores, mm = f.mm;
    const shapeN = { oval: 'oval', kare: 'kare', yuvarlak: 'yuvarlak', uzun: 'uzun', kalp: 'kalp' }[f.shape];
    const P = [];
    P.push({ text: `Yüz uyum skorun ${f.harmony}/100 (önden ${f.front}${f.profile ? `, profil ${f.profile.total}` : ''}${f.smile ? `, gülümseme ${f.smile.score}` : ''}). Yüz şeklin ${shapeN}; uzunluk/genişlik oranı ${r.lengthRatio}.`, src: 'rhodes2006' });
    P.push({ text: `Simetri ${lvl(s.symmetry)} (${s.symmetry}): sol ve sağ taraf arasındaki ortalama sapma yüz genişliğinin %${r.asymmetryPct}'i. Hafif asimetri herkeste vardır; %3'ün altı çok iyi kabul edilir.`, src: 'rhodes2006' });
    P.push({ text: `Dikey oranlar: orta yüz / alt yüz oranın ${r.thirdsRatio} (ideal ≈ 1,0). ${r.thirdsRatio > 1.15 ? 'Alt yüzün görece uzun; sakal (erkekte) veya saçta üst hacim dengeyi iyileştirir.' : r.thirdsRatio < 0.88 ? 'Alt yüzün görece kısa; çene ucunu öne çıkaran sakal şekli veya profilde dik duruş dengeler.' : 'Dengeli bir dikey yapın var.'} Dudak–çene oranın ${r.lipChin} (ideal ≈ 2,0).`, src: 'farkas1985' });
    P.push({ text: `Göz bölgesi: kantal eğim ${r.canthalDeg > 0 ? '+' : ''}${r.canthalDeg}° (${r.canthalDeg > 2 ? 'pozitif, dış göz köşesi yukarıda' : r.canthalDeg < -2 ? 'negatif, dış köşe aşağıda' : 'nötr'}). Göz arası / göz genişliği ${r.fifthsRatio} (klasik ideal ≈ 1,0). Göz bebekleri arası mesafe yüz genişliğinin %${Math.round(r.ipdRatio * 100)}'i; araştırmada en çekici bulunan oran ≈ %46.`, src: 'pallett2010' });
    P.push({ text: `Burun ve ağız: burun genişliği göz arasının ${r.noseRatio} katı (ideal ≈ 1,0–1,1), ağız genişliği burnun ${r.mouthNose} katı (klasik kanon ≈ 1,5). Alt dudak üst dudağın ${r.lipRatio} katı kalınlıkta.`, src: 'farkas1985' });
    P.push({ text: `Çene (önden): çene genişliği elmacık genişliğinin ${Math.round(r.jawRatio * 100)}%'i, çene açısı ${r.jawAngle}°. ${s.jaw >= 75 ? 'Belirgin ve dengeli bir çene hattın var.' : 'Çene hattını en çok yağ oranı, sakal ve boyun duruşu belirgin gösterir.'}`, src: 'coetzee2009' });
    if (f.profile) {
      const p = f.profile;
      P.push({ text: `Profil (yan çekimlerden, tahmini): konvekslik ${p.convexity}°, ${p.convexity > 22 ? 'yüzün yandan belirgin dışbükey; çene geride kalıyor olabilir' : p.convexity < 15 ? 'profilin oldukça düz/çene önde' : 'dengeli bir profil'}. Çene ucu, burun kökünden geçen dikeyin ${Math.abs(p.chinProj)} mm ${p.chinProj < 0 ? 'gerisinde' : 'önünde'}.`, src: 'legan1980' });
      P.push({ text: `E-çizgisi (burun ucu–çene ucu): üst dudak ${p.eUpper} mm, alt dudak ${p.eLower} mm (eksi = çizginin gerisinde). Nazolabiyal açı ${p.nasolabial}° (erkekte ≈ 90–110°, kadında ≈ 100–120°). Çene köşesi (gonial) açısı ≈ ${p.gonial}°; düşük açı daha köşeli bir çene demek.${p.sideDiff != null ? ` Sol ve sağ çene açısı farkı ${p.sideDiff}°.` : ''}`, src: 'ricketts1968' });
    } else P.push({ text: 'Profil ölçümleri için yan çekim yapılmadı. Bir sonraki taramada sağ ve sol çekimleri de yaparsan çene ucu, E-çizgisi, nazolabiyal açı ve çene köşesi açısını da ölçeriz.' });
    if (f.smile) P.push({ text: `Gülümseme: ağzın gülümserken ${Math.round((f.smile.widen - 1) * 100)}% genişliyor, köşe yükselişindeki sol–sağ fark %${f.smile.asymPct}. ${f.smile.duchenne ? 'Gözlerin de gülümsüyor (Duchenne gülümsemesi) — sıcak ve güvenilir görünmenin en güçlü işareti.' : 'Gülümsemen göz bölgesine az yansıyor; gözleri hafif kısan gerçek gülümseme daha çekici algılanır.'}`, src: 'little2011' });
    if (mm) P.push({ text: `Milimetre ölçüleri (iris çapına göre ölçeklendi, ±%5–10): göz bebekleri arası ${mm.ipd} mm, yüz genişliği ${mm.faceW} mm, burun genişliği ${mm.noseW} mm, ağız genişliği ${mm.mouthW} mm, çene genişliği ${mm.jawW} mm, filtrum ${mm.philtrum} mm, çene yüksekliği ${mm.chinH} mm.`, src: 'rufer2005' });
    S.push({ title: 'Yüz analizi', icon: '◈', paras: P });
  }

  const concernTxt = { leke: 'leke ve akne izleri', gozenek: 'siyah nokta ve gözenekler', kuru: 'kuruluk', kizarik: 'kızarıklık ve hassasiyet', gozalti: 'göz altı morlukları', yok: 'belirgin bir dert yok' }[A.skinConcern || 'yok'];
  const stN = { yagli: 'yağlı', kuru: 'kuru', karma: 'karma', normal: 'normal', hassas: 'hassas' }[A.skinType || 'normal'];
  S.push({ title: 'Cilt', icon: '✦', paras: [
    { text: `Cilt skorun ${c.skin} (${lvl(c.skin)}). Cilt tipin ${stN}, ana konu: ${concernTxt}. ${(A.spf ?? 0) < 3 ? 'En büyük açığın güneş koruması: her gün SPF, cilt yaşlanmasını ve lekeleri önlemede kanıtı en güçlü adım.' : 'Güneş korumandaki düzen çok iyi; bunu sürdür.'}`, src: 'hughes2013' },
    (A.acne ?? 4) <= 2 && { text: 'Sivilce durumun orta veya yoğun: benzoil peroksit, salisilik asit ve retinoidler kılavuzlarda ilk seçenekler. İz bırakıyorsa dermatoloğa gitmek en hızlı sonuç verir.', src: 'zaenglein2016' },
    (A.sugar ?? 4) <= 1 && (A.acne ?? 4) <= 2 && { text: 'Şeker ve beyaz un tüketimin yüksek; düşük glisemik beslenme akneyi azaltabilir.', src: 'smith2007' },
    (A.darkCircles ?? 4) <= 2 && { text: 'Göz altı morluğu/torba bildirdin. Uykusuzluk bunları belirgin şekilde artırıyor; önce uyku düzeni.', src: 'sundelin2013' },
  ].filter(Boolean) });

  S.push({ title: 'Vücut & enerji', icon: '▲', paras: [
    { text: `Vücut skorun ${c.body} (${lvl(c.body)}). Protein hedefin günde ≈ ${Math.round((+profile.weight || 70) * 1.6)} g. ${(A.strength ?? 0) < 2 ? 'Henüz düzenli direnç antrenmanı yapmıyorsun: haftada 3 gün tüm vücut antrenmanı en hızlı görsel değişimi sağlar.' : 'Düzenli antrenman yapıyorsun; ilerlemeyi ağırlık/tekrar artırarak sürdür.'}`, src: 'morton2018' },
    { text: `Uykun: ${({ 0: '5 saatten az', 1: '5–6 saat', 2: '6–7 saat', 4: '7–9 saat', 3: '9 saatten fazla' })[A.sleep ?? 4]}. ${(A.sleep ?? 4) < 4 ? 'Önerilen 7–9 saatin altındasın; uyku, görünümü en hızlı etkileyen alışkanlık.' : 'Önerilen aralıktasın.'}${(A.caffeine ?? 4) <= 2 ? ' Öğleden sonra kafein alman uykunu kısaltıyor olabilir.' : ''}`, src: (A.caffeine ?? 4) <= 2 ? 'drake2013' : 'hirshkowitz2015' },
    (A.sitting ?? 4) <= 1 && { text: 'Günde çok uzun süre oturuyorsun. Her 45 dakikada kısa bir kalkış ve günde 8.000+ adım hem duruşunu hem enerjini iyileştirir.', src: 'who2020' },
  ].filter(Boolean) });

  const sP = [{ text: `Stil & duruş skorun ${c.style} (${lvl(c.style)}). İnsanlar bir yüz hakkında ilk izlenimi saniyenin onda birinde oluşturuyor; saç, bakım ve duruş bu izlenimin büyük kısmı.`, src: 'willis2006' }];
  if (A.hairLoss && A.hairLoss !== 'yok') sP.push({ text: 'Saç dökülmesi bildirdin. Erken dönemde dermatoloğa gitmek mevcut saçı korumada en etkili adım; minoksidil ve finasterid kanıtlı tedaviler.', src: 'adil2017' });
  if (male && A.beard) sP.push({ text: A.beard === 'dolu' ? 'Dolu bir sakalın var; kısa–orta sakal çene hattını güçlendirir ve daha olgun gösterir.' : A.beard === 'seyrek' ? 'Sakalın seyrek: kısa ve düzgün çizgili tutmak, uzun ve boşluklu bırakmaktan daha bakımlı görünür.' : 'Sakal çıkmıyorsa temiz tıraş ve net bir saç kesimi en iyi sonuç verir.', src: 'dixson2013' });
  if ((A.teeth ?? 4) <= 1) sP.push({ text: 'Dişlerinden memnun değilsin. Profesyonel temizlik ve diş hekimi kontrolü gülümsemene en hızlı katkıyı sağlar.' });
  S.push({ title: 'Stil, saç & bakım', icon: '◆', paras: sP });

  S.push({ title: 'Sosyal & ilişki', icon: '❖', paras: [
    { text: `Sosyal skorun ${c.social} (${lvl(c.social)}). ${(A.strangers ?? 4) <= 1 ? 'Yabancılarla sohbet başlatmak sana zor geliyor; küçük ve kademeli adımlarla bu kaygı belirgin şekilde azalır.' : 'Yeni insanlarla iletişim kurmakta rahatsın.'} Sohbette takip sorusu sormak seni daha sevilen biri yapar.`, src: (A.strangers ?? 4) <= 1 ? 'hofmann2008' : 'huang2017' },
    (A.relStatus === 'iliski' || A.relStatus === 'evli') && { text: 'İlişkin için: partnerinin iyi haberlerine coşkuyla karşılık vermek ve küçük şeyler için teşekkür etmek, ilişki memnuniyetini en çok artıran iki alışkanlık.', src: 'gable2004' },
  ].filter(Boolean) });

  S.push({ title: 'Zihin & disiplin', icon: '●', paras: [
    { text: `Zihin skorun ${c.mind} (${lvl(c.mind)}). ${(A.screen ?? 4) <= 1 ? 'Günlük ekran süren yüksek; sosyal medyayı günde 30 dk ile sınırlamak 3 haftada yalnızlık ve depresif hissi azalttı.' : ''} Alışkanlıkların otomatikleşmesi ortalama 66 gün sürüyor, bu yüzden ilk 2 ay seriyi korumak en önemli şey.`, src: (A.screen ?? 4) <= 1 ? 'hunt2018' : 'lally2010' },
    (A.stress ?? 4) <= 1 && { text: 'Stresin yüksek. Düzenli fiziksel aktivite stres, kaygı ve depresif belirtileri belirgin şekilde azaltıyor.', src: 'singh2023' },
  ].filter(Boolean) });

  const low3 = Object.entries(c).sort((a, b) => a[1] - b[1]).slice(0, 3).map(([k]) => nm(k));
  S.push({ title: 'İlk 3 önceliğin', icon: '★', paras: [{ text: `1) ${low3[0]}, 2) ${low3[1]}, 3) ${low3[2]}. Planın bu sırayla kuruldu; günlük görevlerin "Bugün" sekmesinde.` }] });
  return S;
}
