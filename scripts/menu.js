/*
 * Menú colapsable en pantallas pequeñas: agrupa la navegación, el buscador y el selector de idioma.
 * Mejora progresiva: sin JavaScript el botón permanece oculto y el menú se muestra completo.
 * Depende de textos.js (función texto, no obligatoria para el funcionamiento).
 */
(function () {
    'use strict';

    const cabecera = document.querySelector('body > header');
    const boton = cabecera ? cabecera.querySelector(':scope > button') : null;
    if (!boton) {
        return;
    }
    const icono = boton.querySelector('img');

    function establecer(abierto) {
        cabecera.dataset.menu = abierto ? 'abierto' : 'cerrado';
        boton.setAttribute('aria-expanded', String(abierto));
        icono.src = abierto ? 'multimedia/cerrar.svg' : 'multimedia/menu.svg';
    }

    boton.hidden = false;
    establecer(false);

    boton.addEventListener('click', function () {
        establecer(cabecera.dataset.menu !== 'abierto');
    });

    /* La tecla Esc cierra el menú y devuelve el foco al botón. */
    cabecera.addEventListener('keydown', function (evento) {
        if (evento.key === 'Escape' && cabecera.dataset.menu === 'abierto') {
            establecer(false);
            boton.focus();
        }
    });
})();
