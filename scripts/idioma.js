/*
 * Cambio de idioma del sitio sin duplicar páginas.
 * Mejora progresiva: sin JavaScript se muestra el HTML en español y el selector permanece oculto.
 * Depende de textos.js (diccionario y función texto).
 * El selector de la cabecera es un grupo de botones de radio con aspecto de interruptor de píldoras.
 */
(function () {
    'use strict';

    const ATRIBUTOS = ['alt', 'aria-label', 'content', 'placeholder'];
    const IDIOMA_POR_DEFECTO = 'es';
    const selector = document.querySelector('body > header fieldset');
    const opciones = document.querySelectorAll('body > header input[name="idioma"]');

    function leerPreferencia() {
        try {
            return localStorage.getItem('idioma');
        } catch (error) {
            return null;
        }
    }

    function guardarPreferencia(idioma) {
        try {
            localStorage.setItem('idioma', idioma);
        } catch (error) {
            /* Sin almacenamiento disponible: el idioma solo se mantiene en esta página. */
        }
    }

    function aplicarIdioma(idioma) {
        document.documentElement.lang = idioma;

        document.querySelectorAll('[data-i18n]').forEach(function (elemento) {
            elemento.textContent = texto(elemento.dataset.i18n);
        });

        ATRIBUTOS.forEach(function (atributo) {
            const marca = 'data-i18n-' + atributo;
            document.querySelectorAll('[' + marca + ']').forEach(function (elemento) {
                elemento.setAttribute(atributo, texto(elemento.getAttribute(marca)));
            });
        });

        document.querySelectorAll('time[datetime]').forEach(function (fecha) {
            fecha.textContent = new Date(fecha.dateTime + 'T12:00:00')
                .toLocaleDateString(idioma, { dateStyle: 'long' });
        });

        opciones.forEach(function (opcion) {
            opcion.checked = opcion.value === idioma;
        });

        /* Avisa a otros scripts (p. ej. el buscador) para que vuelvan a pintar su contenido. */
        document.dispatchEvent(new Event('idioma-cambiado'));
    }

    const preferencia = leerPreferencia();
    aplicarIdioma(TEXTOS[preferencia] ? preferencia : IDIOMA_POR_DEFECTO);

    if (selector) {
        selector.hidden = false;
        opciones.forEach(function (opcion) {
            opcion.addEventListener('change', function () {
                aplicarIdioma(opcion.value);
                guardarPreferencia(opcion.value);
            });
        });
    }
})();
