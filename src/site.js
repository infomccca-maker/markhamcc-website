document.documentElement.classList.add('js');
const toggle=document.querySelector('.menu-toggle');
const navigation=document.querySelector('#navigation');
toggle.hidden=false;
toggle.addEventListener('click',()=>{const open=toggle.getAttribute('aria-expanded')!=='true';toggle.setAttribute('aria-expanded',String(open));navigation.classList.toggle('open',open);});
document.addEventListener('keydown',event=>{if(event.key==='Escape'&&toggle.getAttribute('aria-expanded')==='true'){toggle.setAttribute('aria-expanded','false');navigation.classList.remove('open');toggle.focus();}});
