/* La Braña de Potes — datos compartidos (fotos reales de su web) */
window.BRANA = {
  tel: '+34942730004',
  telTxt: '942 73 00 04',
  mail: 'labranadepotes@gmail.com',
  wa: function (txt) {
    return 'https://wa.me/34942730004?text=' + encodeURIComponent(txt || 'Hola Esperanza, he visto la web de La Braña de Potes y quería consultar disponibilidad para estas fechas: ');
  },
  fotos: [
    { f: 'fachada',    g: 'Casa',     c: 'La fachada amarilla y sus galerías de madera', w: 2000, h: 2773 },
    { f: 'deva-1',     g: 'Deva',     c: 'Deva · salón y comedor',            w: 2000, h: 1334 },
    { f: 'deva-5',     g: 'Deva',     c: 'Deva · salón junto a las ventanas', w: 2000, h: 1500 },
    { f: 'deva-2',     g: 'Deva',     c: 'Deva · dormitorio de matrimonio',   w: 2000, h: 1500 },
    { f: 'deva-3',     g: 'Deva',     c: 'Deva · dormitorio',                 w: 1652, h: 2200 },
    { f: 'deva-6',     g: 'Deva',     c: 'Deva · cocina equipada',            w: 1652, h: 2200 },
    { f: 'deva-4',     g: 'Deva',     c: 'Deva · baño completo',              w: 1652, h: 2200 },
    { f: 'vista',      g: 'Casa',     c: 'Desde la ventana: tejados de Potes y monte', w: 1500, h: 2000 },
    { f: 'quiviesa-1', g: 'Quiviesa', c: 'Quiviesa · salón con cocina',       w: 2000, h: 1422 },
    { f: 'quiviesa-4', g: 'Quiviesa', c: 'Quiviesa · salón',                  w: 2000, h: 1500 },
    { f: 'quiviesa-2', g: 'Quiviesa', c: 'Quiviesa · dormitorio',             w: 2000, h: 1500 },
    { f: 'quiviesa-3', g: 'Quiviesa', c: 'Quiviesa · baño',                   w: 2000, h: 1334 },
    { f: 'calle',      g: 'Casa',     c: 'La casa desde la calle Enrique Herreros', w: 1500, h: 2000 },
    { f: 'bullon-1',   g: 'Bullón',   c: 'Bullón · salón',                    w: 2000, h: 1334 },
    { f: 'bullon-2',   g: 'Bullón',   c: 'Bullón · cocina',                   w: 2000, h: 1334 },
    { f: 'bullon-3',   g: 'Bullón',   c: 'Bullón · dormitorio',               w: 2000, h: 1334 },
    { f: 'bullon-4',   g: 'Bullón',   c: 'Bullón · dormitorio',               w: 2000, h: 1501 },
    { f: 'bullon-5',   g: 'Bullón',   c: 'Bullón · salón',                    w: 1652, h: 2200 }
  ]
};
