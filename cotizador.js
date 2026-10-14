// Cotizador de HAZLO: arma la solicitud y la abre en el WhatsApp Business de HAZLO.
var WHATSAPP_HAZLO = '573001276462';

function limpio(texto) {
  return (texto || '').trim();
}

function armarMensaje(r) {
  var nombre = limpio(r.nombre);
  var empresa = limpio(r.empresa);
  var detalle = limpio(r.detalle);
  var quien = limpio(r.quien);

  var presupuesto = limpio(r.presupuesto) === 'todavía no lo sé'
    ? ' y todavía no tengo claro el presupuesto'
    : ', con un presupuesto ' + limpio(r.presupuesto);
  var sujeto = quien.indexOf('una ') === 0 ? 'Somos ' : 'Soy ';

  var mensaje = 'Hola, soy ' + nombre + (empresa ? ' de ' + empresa : '') + '. ' +
    'Necesito ' + limpio(r.servicio) + ' para ' + limpio(r.cuando) + presupuesto + '. ' +
    sujeto + quien + '.';
  return detalle ? mensaje + '\n\n' + detalle : mensaje;
}

function enlaceWhatsApp(mensaje) {
  return 'https://wa.me/' + WHATSAPP_HAZLO + '?text=' + encodeURIComponent(mensaje);
}

function validar(r) {
  var elecciones = ['servicio', 'quien', 'cuando', 'presupuesto'];
  for (var i = 0; i < elecciones.length; i++) {
    if (!limpio(r[elecciones[i]])) {
      return { ok: false, error: 'Falta responder una de las preguntas anteriores.' };
    }
  }
  if (!limpio(r.nombre)) {
    return { ok: false, error: 'Escribe tu nombre para saber a quién le respondemos.' };
  }
  return { ok: true };
}

if (typeof module !== 'undefined') {
  module.exports = { armarMensaje: armarMensaje, enlaceWhatsApp: enlaceWhatsApp, validar: validar };
}

// Interacción en la página
if (typeof document !== 'undefined') {
  document.addEventListener('DOMContentLoaded', function () {
    var cotizador = document.getElementById('cotizador');
    if (!cotizador) return;

    var respuestas = {};
    var pasos = cotizador.querySelectorAll('[data-paso]');
    var total = pasos.length;
    var actual = 1;
    var progreso = cotizador.querySelector('.progreso-barra');
    var cuenta = cotizador.querySelector('.progreso-texto');
    var atras = cotizador.querySelector('.atras');
    var error = cotizador.querySelector('.error');
    var formulario = cotizador.querySelector('form');
    var listo = cotizador.querySelector('.listo');
    var reenviar = cotizador.querySelector('.reenviar');

    function mostrar(n, enfocar) {
      actual = n;
      pasos.forEach(function (p) {
        p.hidden = Number(p.dataset.paso) !== n;
      });
      progreso.style.width = (n / total * 100) + '%';
      cuenta.textContent = 'Paso ' + n + ' de ' + total;
      atras.hidden = n === 1;
      error.textContent = '';
      var titulo = cotizador.querySelector('[data-paso="' + n + '"] h3');
      if (titulo && enfocar !== false) titulo.focus({ preventScroll: false });
    }

    cotizador.querySelectorAll('.opcion').forEach(function (boton) {
      boton.addEventListener('click', function () {
        var campo = boton.closest('[data-campo]');
        respuestas[campo.dataset.campo] = boton.dataset.valor;
        campo.querySelectorAll('.opcion').forEach(function (b) {
          b.setAttribute('aria-pressed', b === boton ? 'true' : 'false');
        });
        mostrar(Math.min(actual + 1, total));
      });
    });

    atras.addEventListener('click', function () {
      mostrar(Math.max(actual - 1, 1));
    });

    formulario.addEventListener('submit', function (e) {
      e.preventDefault();
      respuestas.nombre = formulario.nombre.value;
      respuestas.empresa = formulario.empresa.value;
      respuestas.detalle = formulario.detalle.value;
      var resultado = validar(respuestas);
      if (!resultado.ok) {
        error.textContent = resultado.error;
        return;
      }
      var enlace = enlaceWhatsApp(armarMensaje(respuestas));
      reenviar.href = enlace;
      window.open(enlace, '_blank', 'noopener');
      pasos.forEach(function (p) { p.hidden = true; });
      cotizador.querySelector('.progreso').hidden = true;
      cuenta.hidden = true;
      error.textContent = '';
      atras.hidden = true;
      listo.hidden = false;
      listo.querySelector('h3').focus();
    });

    mostrar(1, false);
  });
}
