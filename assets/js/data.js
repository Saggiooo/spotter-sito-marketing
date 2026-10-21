/* ============================================================
   SPOTTER — dati mock
   ============================================================ */

const PHOTO_IDS = [
  '1534438327276-14e5300c3a48', // 0  sala manubri luminosa
  '1571902943202-507ec2618e8f', // 1  sala b/n vetrate
  '1540497077202-7c8a3999166f', // 2  sala bianca macchine
  '1517836357463-d25dfeac3438', // 3  stacco
  '1593079831268-3381b0db4a77', // 4  sala cardio dark
  '1558611848-73f7eb4001a1',    // 5  rack
  '1583454110551-21f2fa2afe61', // 6  manubri mano
  '1574680096145-d05b474e2155', // 7  squat b/n
  '1581009146145-b5ef050c2e1e', // 8  curl
  '1605296867304-46d5465a13f1', // 9  stacco dark
  '1576678927484-cc907957088c', // 10 rastrelliera
  '1584735935682-2f2b69dff9d2', // 11 accessori
  '1599058917212-d750089bc07e', // 12 battle rope
  '1637666062717-1c6bcfa4a4df', // 13 sala rossa
  '1623874514711-0f321325f318', // 14 box industriale
  '1570829460005-c840387bb1ca', // 15 sala macchine
  '1594737625785-a6cbdabd333c', // 16 push-up manubri
  '1546483875-ad9014c88eba',    // 17 rematore
  '1554284126-aa88f22d8b74',    // 18 bilanciere b/n
  '1517963879433-6ad2b056d712', // 19 stacco blu
  '1544033527-b192daee1f5b',    // 20 dischi b/n
  '1596357395217-80de13130e92', // 21 squat luce
];
const photo = (i, w = 800) =>
  `https://images.unsplash.com/photo-${PHOTO_IDS[i]}?w=${w}&q=70&auto=format&fit=crop`;

/* ---------- Catalogo attrezzi ---------- */
const EQUIP_CATS = {
  pesi:       'Pesi liberi',
  macchine:   'Macchine busto',
  gambe:      'Macchine gambe',
  cardio:     'Cardio',
  functional: 'Functional',
};

const EQUIP = {
  'squat-rack': { name: 'Squat rack',        cat: 'pesi' },
  'bilanciere': { name: 'Bilancieri',        cat: 'pesi' },
  'manubri':    { name: 'Manubri',           cat: 'pesi', range: true },
  'panca':      { name: 'Panca piana',       cat: 'pesi' },
  'pedana':     { name: 'Pedana olimpica',   cat: 'pesi' },
  'kettlebell': { name: 'Kettlebell',        cat: 'pesi' },
  'smith':      { name: 'Smith machine',     cat: 'pesi' },
  'hip-thrust': { name: 'Hip thrust',        cat: 'pesi' },
  'lat':        { name: 'Lat machine',       cat: 'macchine' },
  'leg-press':  { name: 'Leg press',         cat: 'gambe' },
  'cavi':       { name: 'Cavi / Crossover',  cat: 'macchine' },
  'leg-ext':    { name: 'Leg extension',     cat: 'gambe' },
  'chest-press':{ name: 'Chest press',       cat: 'macchine' },
  'tapis':      { name: 'Tapis roulant',     cat: 'cardio' },
  'bike':       { name: 'Cyclette / Spin',   cat: 'cardio' },
  'ellittica':  { name: 'Ellittica',         cat: 'cardio' },
  'vogatore':   { name: 'Vogatore',          cat: 'cardio' },
  'air-bike':   { name: 'Air bike',          cat: 'cardio' },
  'stair':      { name: 'Stair climber',     cat: 'cardio' },
  'trazioni':   { name: 'Sbarra trazioni',   cat: 'functional' },
  'box':        { name: 'Box pliometrico',   cat: 'functional' },
  'rope':       { name: 'Battle rope',       cat: 'functional' },
  'trx':        { name: 'TRX',               cat: 'functional' },
  'sacco':      { name: 'Sacco boxe',        cat: 'functional' },
  'slitta':     { name: 'Slitta / Sled',     cat: 'functional' },
  'palla':      { name: 'Medicine ball',     cat: 'functional' },

  /* --- catalogo esteso (non ancora assegnato alle palestre) --- */
  'panca-reg':  { name: 'Panca regolabile',  cat: 'pesi' },
  'scott':      { name: 'Panca Scott',       cat: 'pesi' },
  'ez':         { name: 'Bilanciere EZ',     cat: 'pesi' },
  'trap-bar':   { name: 'Trap bar',          cat: 'pesi' },
  'landmine':   { name: 'Landmine',          cat: 'pesi' },
  'dip':        { name: 'Parallele / Dip',   cat: 'pesi' },
  'pec-deck':   { name: 'Pec deck',          cat: 'macchine' },
  'shoulder':   { name: 'Shoulder press',    cat: 'macchine' },
  'low-row':    { name: 'Pulley basso',      cat: 'macchine' },
  't-bar':      { name: 'T-bar row',         cat: 'macchine' },
  'lateral':    { name: 'Alzate laterali',   cat: 'macchine' },
  'gravitron':  { name: 'Trazioni assistite', cat: 'macchine' },
  'pullover':   { name: 'Pullover machine',  cat: 'macchine' },
  'ab-crunch':  { name: 'Crunch machine',    cat: 'macchine' },
  'hack':       { name: 'Hack squat',        cat: 'gambe' },
  'pendulum':   { name: 'Pendulum squat',    cat: 'gambe' },
  'belt-squat': { name: 'Belt squat',        cat: 'gambe' },
  'leg-curl':   { name: 'Leg curl sdraiato', cat: 'gambe' },
  'leg-curl-s': { name: 'Leg curl seduto',   cat: 'gambe' },
  'adductor':   { name: 'Adductor',          cat: 'gambe' },
  'abductor':   { name: 'Abductor',          cat: 'gambe' },
  'calf':       { name: 'Calf in piedi',     cat: 'gambe' },
  'calf-s':     { name: 'Calf seduto',       cat: 'gambe' },
  'glute':      { name: 'Glute kickback',    cat: 'gambe' },
  'skierg':     { name: 'SkiErg',            cat: 'cardio' },
  'recumbent':  { name: 'Cyclette orizzontale', cat: 'cardio' },
  'curve':      { name: 'Tapis curvo',       cat: 'cardio' },
  'rings':      { name: 'Anelli',            cat: 'functional' },
  'sandbag':    { name: 'Sandbag',           cat: 'functional' },
  'ghd':        { name: 'GHD',               cat: 'functional' },
  'hyper':      { name: 'Hyperextension',    cat: 'functional' },
};

/* range pesi (es. manubri): e = [id, qty, marca, [min, max]] */
const kg = n => String(n).replace('.', ',');
const eqRange = e => e && e[3] ? `${kg(e[3][0])}–${kg(e[3][1])} kg` : null;
const eqMaxKg = (g, id) => { const e = g.equipment.find(x => x[0] === id); return e && e[3] ? e[3][1] : 0; };

const AMENITIES = {
  h24:        'Aperto 24h',
  doccia:     'Docce',
  armadietti: 'Armadietti',
  sauna:      'Sauna',
  piscina:    'Piscina',
  parcheggio: 'Parcheggio',
  wifi:       'Wi-Fi',
  pt:         'Personal trainer',
  corsi:      'Corsi di gruppo',
  bar:        'Bar proteico',
  clima:      'Aria condizionata',
};

const GENDER = {
  'mista':          'Mista',
  'area-donne':     'Area riservata donne',
  'solo-donne':     'Solo donne',
  'orari-separati': 'Orari separati',
};

const GYM_TYPES = ['Palestra', 'Powerlifting', 'CrossFit box', '24/7 Fitness', 'Boutique', 'Club & Piscina', 'Calisthenics', 'Arti marziali', 'Low cost', 'Premium'];

/* ---------- Palestre (Milano) ---------- */
const GYMS = [
  {
    id: 'ferro', name: 'Ferro Club', type: 'Powerlifting', area: 'Navigli',
    address: 'Via Vigevano 18, Milano', lat: 45.4523, lng: 9.1762,
    rating: 4.8, reviews: 412, price: 45, featured: true, verified: true,
    trial: '7 giorni gratis', photos: [5, 20, 3, 19, 13],
    phone: '+39 02 8942 1180', site: 'ferroclub.it', whatsapp: '+39 333 812 4410',
    hours: { wk: ['06:00', '23:00'], sat: ['08:00', '20:00'], sun: ['09:00', '14:00'] },
    desc: 'Palestra di forza nel cuore dei Navigli. 8 rack Eleiko, pedane da gara e coach certificati. Musica alta, gesso libero.',
    equipment: [
      ['squat-rack', 8, 'Eleiko'], ['pedana', 6, 'Eleiko'], ['bilanciere', 24, 'Eleiko'],
      ['manubri', 60, null, [2, 60]], ['panca', 10], ['kettlebell', 30], ['hip-thrust', 2],
      ['smith', 2], ['lat', 2], ['cavi', 2], ['leg-press', 2], ['leg-ext', 1],
      ['trazioni', 3], ['slitta', 2], ['vogatore', 4, 'Concept2'], ['air-bike', 3, 'Assault'],
    ],
    amenities: ['doccia', 'armadietti', 'wifi', 'pt', 'bar'],
    plans: [
      { name: 'Ingresso singolo', price: 12, period: 'ingresso' },
      { name: 'Mensile', price: 45, period: 'mese', perks: ['Accesso illimitato', 'Scheda iniziale'] },
      { name: 'Trimestrale', price: 120, period: '3 mesi', perks: ['Accesso illimitato', 'Scheda + 1 PT session'] },
      { name: 'Annuale', price: 420, period: 'anno', best: true, perks: ['Accesso illimitato', '4 PT session', 'T-shirt Ferro'] },
    ],
    signup: 30, tags: ['Hardcore', 'Gesso ok'],
  },
  {
    id: 'officina', name: 'Officina Atletica', type: 'CrossFit box', area: 'Isola',
    address: 'Via Pastrengo 9, Milano', lat: 45.4868, lng: 9.1885,
    rating: 4.9, reviews: 236, price: 89, featured: false, verified: true,
    trial: 'Prima lezione gratis', photos: [14, 12, 9, 16],
    phone: '+39 02 6611 0042', site: 'officinaatletica.it', whatsapp: '+39 348 552 1020',
    hours: { wk: ['06:30', '22:00'], sat: ['09:00', '13:00'], sun: null },
    desc: 'Box affiliato con rig da 12 stazioni, classi WOD ogni ora e open gym serale. Community fortissima.',
    equipment: [
      ['bilanciere', 30, 'Rogue'], ['kettlebell', 40], ['box', 20], ['rope', 6],
      ['vogatore', 10, 'Concept2'], ['air-bike', 8, 'Rogue Echo'], ['trazioni', 12, 'Rig'],
      ['palla', 25], ['slitta', 3], ['squat-rack', 4], ['manubri', 20, null, [2.5, 30]], ['trx', 8], ['pedana', 8],
    ],
    amenities: ['doccia', 'armadietti', 'corsi', 'pt', 'wifi'],
    plans: [
      { name: 'Drop-in', price: 20, period: 'lezione' },
      { name: 'Carnet 10', price: 150, period: '10 ingressi', perks: ['Valido 3 mesi'] },
      { name: 'Open mensile', price: 89, period: 'mese', perks: ['WOD illimitati', 'Open gym'] },
      { name: 'Annuale', price: 890, period: 'anno', best: true, perks: ['WOD illimitati', 'Open gym', 'Mobility class'] },
    ],
    signup: 0, tags: ['WOD', 'Community'],
  },
  {
    id: 'pulse', name: 'Pulse 24', type: '24/7 Fitness', area: 'Porta Venezia',
    address: 'Corso Buenos Aires 3, Milano', lat: 45.4748, lng: 9.2052,
    rating: 4.3, reviews: 1180, price: 29, featured: false, verified: false,
    trial: '1 giorno gratis', photos: [2, 1, 4, 15],
    phone: '+39 02 2047 7720', site: 'pulse24.it',
    hours: '24h',
    desc: 'Sempre aperto, 365 giorni l\'anno. Accesso con app, area cardio enorme e sala pesi completa.',
    equipment: [
      ['tapis', 30, 'Technogym'], ['bike', 20], ['ellittica', 15], ['stair', 6], ['vogatore', 6],
      ['manubri', 40, null, [1, 40]], ['panca', 8], ['smith', 4], ['squat-rack', 3], ['lat', 4],
      ['leg-press', 3], ['cavi', 4], ['leg-ext', 3], ['chest-press', 3], ['kettlebell', 15],
    ],
    amenities: ['h24', 'doccia', 'armadietti', 'wifi', 'clima', 'parcheggio'],
    plans: [
      { name: 'Mensile', price: 29, period: 'mese', perks: ['Accesso 24/7'] },
      { name: 'Trimestrale', price: 79, period: '3 mesi', perks: ['Accesso 24/7'] },
      { name: 'Annuale', price: 249, period: 'anno', best: true, perks: ['Accesso 24/7', 'Ospite gratis 1×/mese'] },
    ],
    signup: 19, tags: ['24/7', 'App access'],
  },
  {
    id: 'movimento', name: 'Movimento Studio', type: 'Boutique', area: 'Brera',
    address: 'Via Solferino 22, Milano', lat: 45.4718, lng: 9.1868,
    rating: 4.7, reviews: 158, price: 65, featured: false, verified: true,
    trial: 'Lezione di prova gratuita', photos: [21, 16, 11, 17],
    phone: '+39 02 3653 9011', site: 'movimentostudio.it', whatsapp: '+39 339 410 7788', gender: 'area-donne',
    hours: { wk: ['07:00', '21:00'], sat: ['09:00', '14:00'], sun: null },
    desc: 'Studio boutique con classi a numero chiuso: functional, spin e pilates reformer. Max 12 persone per classe.',
    equipment: [
      ['trx', 12], ['kettlebell', 20], ['manubri', 24, null, [1, 20]], ['box', 8], ['bike', 14, 'Spinning®'],
      ['vogatore', 4], ['cavi', 2], ['palla', 10], ['panca', 4],
    ],
    amenities: ['doccia', 'armadietti', 'corsi', 'pt', 'bar', 'clima'],
    plans: [
      { name: 'Classe singola', price: 18, period: 'classe' },
      { name: 'Unlimited', price: 65, period: 'mese', perks: ['Classi illimitate', 'Prenotazione 7gg prima'] },
      { name: 'Annuale', price: 650, period: 'anno', best: true, perks: ['Classi illimitate', '2 mesi omaggio'] },
    ],
    signup: 0, tags: ['Classi', 'Small group'],
  },
  {
    id: 'arena', name: 'Arena Fitness Club', type: 'Club & Piscina', area: 'Città Studi',
    address: 'Via Pascoli 40, Milano', lat: 45.4784, lng: 9.2268,
    rating: 4.5, reviews: 864, price: 59, featured: true, verified: true,
    trial: '3 giorni gratis', photos: [0, 2, 15, 10],
    phone: '+39 02 7063 5500', site: 'arenafitness.it', gender: 'area-donne',
    hours: { wk: ['06:00', '23:00'], sat: ['08:00', '21:00'], sun: ['08:00', '21:00'] },
    desc: '3.000 m² su due piani: piscina semi-olimpionica, spa con sauna e bagno turco, oltre 60 corsi a settimana.',
    equipment: [
      ['tapis', 24, 'Technogym'], ['bike', 18], ['ellittica', 12], ['vogatore', 8], ['stair', 4],
      ['manubri', 50, null, [1, 50]], ['panca', 10], ['squat-rack', 4], ['smith', 3], ['pedana', 2],
      ['lat', 4], ['leg-press', 4], ['cavi', 6], ['leg-ext', 3], ['chest-press', 4],
      ['hip-thrust', 2], ['kettlebell', 24], ['trx', 10], ['box', 6], ['trazioni', 4],
    ],
    amenities: ['piscina', 'sauna', 'doccia', 'armadietti', 'parcheggio', 'wifi', 'corsi', 'pt', 'bar', 'clima'],
    plans: [
      { name: 'Ingresso singolo', price: 15, period: 'ingresso' },
      { name: 'Mensile', price: 59, period: 'mese', perks: ['Sala + corsi'] },
      { name: 'Trimestrale', price: 159, period: '3 mesi', perks: ['Sala + corsi', 'Piscina'] },
      { name: 'Annuale', price: 549, period: 'anno', best: true, perks: ['Sala + corsi', 'Piscina + spa', 'Check-up'] },
    ],
    signup: 39, tags: ['Piscina', 'Spa'],
  },
  {
    id: 'barlab', name: 'Bar Lab', type: 'Calisthenics', area: 'Porta Romana',
    address: 'Viale Sabotino 12, Milano', lat: 45.4515, lng: 9.2035,
    rating: 4.6, reviews: 97, price: 35, featured: false, verified: false,
    trial: null, photos: [16, 12, 7],
    phone: '+39 347 220 1188', site: 'barlab.milano', whatsapp: '+39 347 220 1188',
    hours: { wk: ['07:00', '22:00'], sat: ['09:00', '18:00'], sun: ['09:00', '13:00'] },
    desc: 'Spazio dedicato al corpo libero: sbarre, parallele, anelli. Corsi skills (muscle-up, front lever, verticale).',
    equipment: [['trazioni', 10], ['box', 6], ['trx', 6], ['kettlebell', 10], ['palla', 6], ['manubri', 10, null, [2, 24]]],
    amenities: ['doccia', 'corsi', 'pt'],
    plans: [
      { name: 'Ingresso', price: 8, period: 'ingresso' },
      { name: 'Mensile', price: 35, period: 'mese', perks: ['Open + 2 corsi/sett'] },
      { name: 'Annuale', price: 330, period: 'anno', best: true, perks: ['Open + corsi illimitati'] },
    ],
    signup: 15, tags: ['Corpo libero'],
  },
  {
    id: 'kombat', name: 'Kombat Gym', type: 'Arti marziali', area: 'Porta Vittoria',
    address: 'Via Cervignano 5, Milano', lat: 45.4632, lng: 9.2195,
    rating: 4.6, reviews: 203, price: 55, featured: false, verified: true,
    trial: 'Prima settimana gratis', photos: [18, 9, 8],
    phone: '+39 02 5501 3344', site: 'kombatgym.it', whatsapp: '+39 351 900 3344', gender: 'orari-separati',
    hours: { wk: ['09:00', '22:30'], sat: ['10:00', '17:00'], sun: null },
    desc: 'Boxe, kickboxing, MMA e BJJ con maestri federali. Ring regolamentare e gabbia ottagonale.',
    equipment: [
      ['sacco', 18], ['rope', 4], ['kettlebell', 12], ['manubri', 20, null, [1, 20]], ['trazioni', 2],
      ['box', 4], ['palla', 8], ['air-bike', 2], ['bike', 4],
    ],
    amenities: ['doccia', 'armadietti', 'corsi', 'pt'],
    plans: [
      { name: 'Mensile', price: 55, period: 'mese', perks: ['1 disciplina'] },
      { name: 'Trimestrale', price: 150, period: '3 mesi', perks: ['1 disciplina'] },
      { name: 'Annuale', price: 520, period: 'anno', best: true, perks: ['Tutte le discipline'] },
    ],
    signup: 25, tags: ['Ring', 'Sparring'],
  },
  {
    id: 'tortona', name: 'Gym Tortona', type: 'Low cost', area: 'Tortona',
    address: 'Via Tortona 31, Milano', lat: 45.4533, lng: 9.1645,
    rating: 4.1, reviews: 532, price: 24, featured: false, verified: false,
    trial: null, photos: [1, 6, 20],
    phone: '+39 02 4398 0021', site: 'gymtortona.it',
    hours: { wk: ['07:00', '22:00'], sat: ['09:00', '19:00'], sun: ['09:00', '19:00'] },
    desc: 'Tutto il necessario, niente fronzoli. Prezzo bloccato per sempre con l\'annuale.',
    equipment: [
      ['tapis', 12], ['bike', 8], ['ellittica', 6], ['manubri', 30, null, [2, 36]], ['panca', 6], ['smith', 2],
      ['squat-rack', 2], ['lat', 2], ['leg-press', 2], ['cavi', 2], ['chest-press', 2], ['leg-ext', 2],
    ],
    amenities: ['armadietti', 'doccia', 'wifi'],
    plans: [
      { name: 'Mensile', price: 24, period: 'mese', perks: ['Sala pesi + cardio'] },
      { name: 'Annuale', price: 199, period: 'anno', best: true, perks: ['Prezzo bloccato'] },
    ],
    signup: 29, tags: ['Economica'],
  },
  {
    id: 'forma', name: 'Spazio Forma', type: 'Premium', area: 'CityLife',
    address: 'Piazza Tre Torri 1, Milano', lat: 45.4776, lng: 9.1562,
    rating: 4.9, reviews: 141, price: 95, featured: false, verified: true,
    trial: 'Prova gratuita + check-up', photos: [13, 0, 17, 21],
    phone: '+39 02 3031 7700', site: 'spazioforma.com', whatsapp: '+39 335 303 1770',
    hours: { wk: ['06:00', '22:00'], sat: ['08:00', '20:00'], sun: ['09:00', '18:00'] },
    desc: 'Club premium con linea Technogym Artis, spa, asciugamani e prodotti inclusi. Check-up biometrico all\'ingresso.',
    equipment: [
      ['tapis', 16, 'Technogym Skillrun'], ['bike', 10], ['vogatore', 6], ['ellittica', 6], ['stair', 4],
      ['manubri', 50, 'Technogym', [1, 60]], ['panca', 8], ['squat-rack', 4], ['pedana', 2], ['smith', 2], ['cavi', 4],
      ['lat', 3], ['leg-press', 3], ['leg-ext', 3], ['chest-press', 3], ['hip-thrust', 3],
      ['kettlebell', 20], ['trx', 6],
    ],
    amenities: ['sauna', 'doccia', 'armadietti', 'parcheggio', 'wifi', 'pt', 'bar', 'clima', 'corsi'],
    plans: [
      { name: 'Ingresso', price: 25, period: 'ingresso' },
      { name: 'Mensile', price: 95, period: 'mese', perks: ['Club + spa', 'Asciugamani'] },
      { name: 'Annuale', price: 950, period: 'anno', best: true, perks: ['Club + spa', '2 mesi omaggio', 'Check-up trimestrale'] },
    ],
    signup: 0, tags: ['Spa', 'Luxury'],
  },
  {
    id: 'dock', name: 'Dock 7', type: 'Palestra', area: 'Garibaldi',
    address: 'Via Gaetano de Castillia 7, Milano', lat: 45.4838, lng: 9.1988,
    rating: 4.4, reviews: 377, price: 39, featured: false, verified: false,
    trial: '7 giorni gratis', photos: [4, 10, 5, 19],
    phone: '+39 02 6900 7107', site: 'dock7.it', whatsapp: '+39 340 677 0707',
    hours: { wk: ['06:30', '23:00'], sat: ['09:00', '20:00'], sun: ['09:00', '20:00'] },
    desc: 'Ex magazzino ferroviario trasformato in palestra. Sala pesi, area functional e terrazza estiva.',
    equipment: [
      ['squat-rack', 4], ['bilanciere', 10], ['manubri', 40, null, [2, 50]], ['panca', 6], ['kettlebell', 16],
      ['tapis', 10], ['bike', 8], ['vogatore', 4], ['lat', 2], ['leg-press', 2], ['cavi', 3],
      ['trazioni', 2], ['box', 6], ['rope', 2], ['slitta', 1],
    ],
    amenities: ['doccia', 'armadietti', 'wifi', 'corsi', 'clima'],
    plans: [
      { name: 'Mensile', price: 39, period: 'mese', perks: ['Sala + functional'] },
      { name: 'Trimestrale', price: 105, period: '3 mesi', perks: ['Sala + functional'] },
      { name: 'Annuale', price: 369, period: 'anno', best: true, perks: ['Sala + functional + corsi'] },
    ],
    signup: 20, tags: ['Industrial'],
  },
];

/* ---------- Recensioni ---------- */
const REVIEW_POOL = [
  { who: 'Giulia R.', when: '2 giorni fa', stars: 5, text: 'Attrezzatura sempre in ordine e pulita. Non ho mai dovuto aspettare per un rack, anche alle 19.', tags: ['Attrezzatura top', 'Pulita'] },
  { who: 'Marco T.', when: '1 settimana fa', stars: 5, text: 'Staff preparatissimo, mi hanno rifatto la scheda gratis dopo un mese. Ambiente motivante.', tags: ['Staff'] },
  { who: 'Sara B.', when: '2 settimane fa', stars: 4, text: 'Ottima sala, ma negli orari di punta si riempie parecchio. Docce calde e spogliatoi spaziosi.', tags: ['Affollata 18–20'] },
  { who: 'Luca P.', when: '3 settimane fa', stars: 5, text: 'Finalmente una palestra con manubri fino a 50+ kg. Prezzo onesto per quello che offre.', tags: ['Rapporto qualità/prezzo'] },
  { who: 'Federica M.', when: '1 mese fa', stars: 4, text: 'Prova gratuita senza pressioni commerciali, mi è piaciuto. Parcheggio un po\' difficile.', tags: ['Prova gratuita'] },
  { who: 'Davide C.', when: '1 mese fa', stars: 3, text: 'Buona palestra ma l\'aria condizionata d\'estate non basta. Per il resto nulla da dire.', tags: [] },
  { who: 'Chiara L.', when: '2 mesi fa', stars: 5, text: 'I corsi sono il vero punto di forza. Istruttori bravissimi e musica giusta.', tags: ['Corsi'] },
  { who: 'Andrea G.', when: '2 mesi fa', stars: 5, text: 'Ci vengo da 3 anni. Si sente la community, non sei solo un numero.', tags: ['Community'] },
];

function gymReviews(g) {
  const seed = g.id.length + g.reviews;
  const out = [];
  for (let i = 0; i < 4; i++) out.push(REVIEW_POOL[(seed + i * 3) % REVIEW_POOL.length]);
  return out;
}

function ratingBreakdown(g) {
  const r = g.rating;
  const five = Math.round(40 + (r - 4) * 55);
  const four = Math.round(28 - (r - 4) * 10);
  const three = Math.round(14 - (r - 4) * 18);
  const two = Math.max(2, Math.round(7 - (r - 4) * 10));
  const one = Math.max(1, 100 - five - four - three - two);
  return [five, four, three, two, one].map(v => Math.max(1, v));
}

function subRatings(g) {
  const s = g.reviews % 7;
  const c = v => Math.min(5, Math.max(3, +(v).toFixed(1)));
  return [
    ['Attrezzatura', c(g.rating + 0.1 - s * 0.02)],
    ['Pulizia', c(g.rating - 0.1 + s * 0.03)],
    ['Staff', c(g.rating + 0.05)],
    ['Affollamento', c(g.rating - 0.6 + s * 0.04)],
  ];
}

