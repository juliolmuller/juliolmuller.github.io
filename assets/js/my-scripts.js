
// Evento para mudar o ícone da seção ativa
function trackManu(event) {
  document.querySelectorAll('[id^=atalho-]').forEach(elem => {
    if (event.target.id.replace('atalho-', '') == elem.id.replace('atalho-', '')) {
      elem.classList.remove('w3-hover-black')
      elem.classList.add('w3-black')
    } else {
      elem.classList.remove('w3-black')
      elem.classList.add('w3-hover-black')
    }
  })
}
