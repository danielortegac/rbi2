
const $ = (s, root=document) => root.querySelector(s);
const $$ = (s, root=document) => Array.from(root.querySelectorAll(s));
const wa = (text) => `https://wa.me/${window.RBI_CONTACT.phone_wa}?text=${encodeURIComponent(text)}`;

$('#menuBtn')?.addEventListener('click', () => $('#mainNav')?.classList.toggle('open'));
$$('.nav-link').forEach(a => a.addEventListener('click', () => $('#mainNav')?.classList.remove('open')));

const io = new IntersectionObserver((entries)=>{
  entries.forEach(e => { if(e.isIntersecting) e.target.classList.add('in') })
},{threshold:.12});
$$('.reveal').forEach(el => io.observe(el));

function buildChatbot(){
  const launch = document.createElement('button');
  launch.className='bot-launch'; launch.textContent='Asesor RBI';
  const waBtn = document.createElement('a');
  waBtn.className='wa-float'; waBtn.href=wa('Hola, quiero información sobre los cursos de RBI.'); waBtn.target='_blank'; waBtn.rel='noopener'; waBtn.textContent='💬'; waBtn.setAttribute('aria-label','WhatsApp RBI');
  const panel = document.createElement('div'); panel.className='chatbot';
  panel.innerHTML = `
    <div class="bot-head"><div><b>Asesor RBI</b><small>Guía rápida de cursos gastronómicos</small></div><button class="bot-close">×</button></div>
    <div class="bot-body" id="botBody"></div>`;
  document.body.append(launch, waBtn, panel);
  const body = $('#botBody');
  function bot(html){ const m=document.createElement('div'); m.className='msg bot'; m.innerHTML=html; body.appendChild(m); body.scrollTop=body.scrollHeight; }
  function user(text){ const m=document.createElement('div'); m.className='msg user'; m.textContent=text; body.appendChild(m); body.scrollTop=body.scrollHeight; }
  function buttons(){
    const q=document.createElement('div'); q.className='quick';
    window.RBI_COURSES.forEach(c=>{
      const b=document.createElement('button'); b.textContent=c.title; b.onclick=()=>showCourse(c.id); q.appendChild(b);
    });
    const cal=document.createElement('button'); cal.textContent='Calendario'; cal.onclick=()=>{user('Calendario'); bot('Las fechas pueden configurarse en el calendario académico. También puedes solicitar una fecha privada para tu equipo. <div class="quick"><a href="calendario-academico.html">Ver calendario</a><a class="whats" target="_blank" href="'+wa('Hola, quiero consultar fechas del calendario académico RBI o solicitar una capacitación privada para mi equipo.')+'">Consultar por WhatsApp</a></div>')}; q.appendChild(cal);
    const contact=document.createElement('button'); contact.textContent='Contacto'; contact.onclick=()=>{user('Contacto'); bot('Puedes escribir directamente por WhatsApp o correo. <div class="quick"><a class="whats" target="_blank" href="'+wa('Hola, quiero hablar con RBI para recibir información de cursos y capacitaciones gastronómicas.')+'">WhatsApp</a><a href="contacto.html">Página de contacto</a></div>')}; q.appendChild(contact);
    body.appendChild(q); body.scrollTop=body.scrollHeight;
  }
  function showCourse(id){
    const c=window.RBI_COURSES.find(x=>x.id===id); if(!c) return;
    user(c.title);
    bot(`<b>${c.icon} ${c.title}</b><br>${c.lead}<br><br><b>Ideal para:</b> ${c.audience}<div class="quick"><a href="${c.id}.html">Ver página</a><a class="whats" target="_blank" href="${wa(c.whatsapp)}">Inscribirme por WhatsApp</a></div>`);
  }
  function start(){
    body.innerHTML='';
    bot('Hola, soy el asesor digital de RBI. Te puedo guiar hacia el curso correcto según tu objetivo: vender más, ordenar tu restaurante, capacitar meseros, abrir cafetería, liderar equipo o crear clientes fieles.');
    buttons();
    const form=document.createElement('div'); form.className='bot-input'; form.innerHTML='<input id="botText" placeholder="Escribe: ventas, barismo, meseros, liderazgo..."><button>Enviar</button>'; body.appendChild(form);
    form.querySelector('button').onclick=()=>handle(form.querySelector('input').value);
    form.querySelector('input').addEventListener('keydown',e=>{if(e.key==='Enter')handle(e.target.value)});
  }
  function handle(text){
    text=(text||'').trim(); if(!text) return; user(text);
    $('#botText').value=''; const t=text.toLowerCase();
    let id='restaurante-rentable';
    if(/cafe|cafeter|barismo|barista|espresso|capuccino|latte/.test(t)) id='cafeteria-perfecta';
    else if(/mesero|servicio|emocion|cliente|atencion|ventas emocionales/.test(t)) id='mesero-5-estrellas';
    else if(/lider|gerente|manager|jefe|supervisor|capitan|equipo/.test(t)) id='liderazgo-gastronomico';
    else if(/fan|fidel|lealtad|recompra|regres|experiencia|recomend/.test(t)) id='clientes-para-siempre';
    else if(/rentab|productiv|sistema|organizar|ventas|dirigir|control|inventario/.test(t)) id='restaurante-rentable';
    showCourse(id);
  }
  launch.onclick=()=>{panel.classList.toggle('open'); if(panel.classList.contains('open') && !body.dataset.started){start(); body.dataset.started='1';}};
  $('.bot-close',panel).onclick=()=>panel.classList.remove('open');
}
buildChatbot();


const RBI_LEADS_ENDPOINT = window.RBI_LEADS_ENDPOINT || 'https://script.google.com/macros/s/AKfycbwrHwt4uicPUYyZgj2h4NaJpLLsW-qVxFIeRW-0tbCsJb_WM29DOY-xy8MjuEfliE_pJA/exec';
function getParam(name){ return new URLSearchParams(window.location.search).get(name) || ''; }
function fillLeadFormFromURL(){
  const course = getParam('curso') || getParam('course');
  const tipo = getParam('tipo') || getParam('solicitud');
  const courseEl = $('#leadCourse');
  const tipoEl = $('#leadTipo');
  if(courseEl && course){
    const normalized = course.toLowerCase().replace(/-/g,' ');
    Array.from(courseEl.options).forEach(opt=>{
      const value = opt.value.toLowerCase();
      if(value && (value === course.toLowerCase() || value.includes(normalized) || normalized.includes(value.replace(' rbi','').toLowerCase()))) courseEl.value = opt.value;
    });
  }
  if(tipoEl && tipo){
    Array.from(tipoEl.options).forEach(opt=>{ if(opt.value.toLowerCase() === tipo.toLowerCase()) tipoEl.value = opt.value; });
  }
}
function buildLeadPayload(){
  return {
    nombre: $('#leadName')?.value?.trim() || $('#name')?.value?.trim() || '',
    whatsapp: $('#leadWhatsapp')?.value?.trim() || '',
    email: $('#leadEmail')?.value?.trim() || '',
    pais: $('#leadPais')?.value?.trim() || '',
    ciudad: $('#leadCiudad')?.value?.trim() || '',
    curso: $('#leadCourse')?.value || $('#course')?.value || '',
    tipoSolicitud: $('#leadTipo')?.value || 'Información',
    mensaje: $('#leadMessage')?.value?.trim() || $('#message')?.value?.trim() || '',
    paginaOrigen: document.title || '',
    urlOrigen: window.location.href,
    utmSource: getParam('utm_source'),
    utmMedium: getParam('utm_medium'),
    utmCampaign: getParam('utm_campaign')
  };
}
async function submitLeadToSheets(payload){
  await fetch(RBI_LEADS_ENDPOINT, {
    method: 'POST',
    mode: 'no-cors',
    headers: { 'Content-Type': 'text/plain;charset=utf-8' },
    body: JSON.stringify(payload)
  });
}
function setupLeadForm(){
  fillLeadFormFromURL();
  const form = $('#leadForm');
  if(!form) return;
  const status = $('#leadStatus');
  const btn = $('#leadSubmit');
  form.addEventListener('submit', async (e)=>{
    e.preventDefault();
    const payload = buildLeadPayload();
    if(!payload.nombre || !payload.whatsapp || !payload.curso){
      if(status) status.textContent = 'Completa nombre, WhatsApp y curso de interés.';
      return;
    }
    if(btn){ btn.disabled = true; btn.textContent = 'Enviando...'; }
    if(status) status.textContent = 'Guardando solicitud...';
    try{
      await submitLeadToSheets(payload);
      if(status) status.textContent = 'Solicitud enviada. RBI te contactará pronto.';
      form.reset();
      fillLeadFormFromURL();
    }catch(err){
      if(status) status.textContent = 'No se pudo enviar automáticamente. Puedes escribir por WhatsApp.';
    }finally{
      if(btn){ btn.disabled = false; btn.textContent = 'Enviar solicitud'; }
    }
  });
}

function contactToWhatsApp(){
  const payload = buildLeadPayload();
  const name = payload.nombre || 'un cliente interesado';
  const course = payload.curso || '';
  const msg = payload.mensaje || 'Quiero recibir información.';
  const text=`Hola, soy ${name}. Quiero información de RBI${course ? ' sobre '+course : ''}. ${msg}`;
  window.open(wa(text),'_blank');
}
setupLeadForm();
window.contactToWhatsApp = contactToWhatsApp;
window.submitLeadToSheets = submitLeadToSheets;
