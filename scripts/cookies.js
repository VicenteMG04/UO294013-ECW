/*
 * Consentimiento para la analítica (Microsoft Clarity: mapas de calor y grabaciones de sesión).
 * Clarity solo se carga si el usuario acepta; sin JavaScript no se carga nunca.
 * La decisión se guarda en localStorage y se puede cambiar con el botón del pie de página.
 * Depende de textos.js (función texto) y debe cargarse antes que idioma.js para que este traduzca el aviso.
 */
(function () {
    'use strict';

    const ID_CLARITY = 'zcln8rxqjp';
    const CLAVE = 'consentimiento-analitica';
    const ACEPTADO = 'aceptado';
    const RECHAZADO = 'rechazado';
    const ENLACE_PRIVACIDAD = 'https://privacy.microsoft.com/es-es/privacystatement';
    let aviso = null;
    let clarityCargado = false;

    function leerDecision() {
        try {
            return localStorage.getItem(CLAVE);
        } catch (error) {
            return null;
        }
    }

    function guardarDecision(decision) {
        try {
            localStorage.setItem(CLAVE, decision);
        } catch (error) {
            /* Sin almacenamiento disponible: la decisión solo vale para esta página. */
        }
    }

    function cargarClarity() {
        if (clarityCargado) {
            return;
        }
        clarityCargado = true;
        (function (c, l, a, r, i, t, y) {
            c[a] = c[a] || function () { (c[a].q = c[a].q || []).push(arguments); };
            t = l.createElement(r);
            t.async = 1;
            t.src = 'https://www.clarity.ms/tag/' + i;
            y = l.getElementsByTagName(r)[0];
            y.parentNode.insertBefore(t, y);
        })(window, document, 'clarity', 'script', ID_CLARITY);
    }

    function decidir(decision) {
        guardarDecision(decision);
        aviso.hidden = true;
        if (decision === ACEPTADO) {
            cargarClarity();
        } else if (window.clarity) {
            /* Retira el consentimiento y borra las cookies de Clarity si ya estaba en marcha. */
            window.clarity('consent', false);
        }
    }

    function crearElemento(etiqueta, clave, atributos) {
        const elemento = document.createElement(etiqueta);
        elemento.dataset.i18n = clave;
        elemento.textContent = texto(clave);
        Object.keys(atributos || {}).forEach(function (nombre) {
            elemento.setAttribute(nombre, atributos[nombre]);
        });
        return elemento;
    }

    function crearAviso() {
        aviso = document.createElement('aside');
        aviso.setAttribute('aria-label', texto('cookies.etiqueta'));
        aviso.dataset.i18nAriaLabel = 'cookies.etiqueta';
        aviso.hidden = true;

        const parrafo = document.createElement('p');
        parrafo.append(
            crearElemento('span', 'cookies.texto'),
            ' ',
            crearElemento('a', 'cookies.enlace', { href: ENLACE_PRIVACIDAD, target: '_blank', rel: 'noopener noreferrer' })
        );

        const rechazar = crearElemento('button', 'cookies.rechazar', { type: 'button' });
        const aceptar = crearElemento('button', 'cookies.aceptar', { type: 'button' });
        rechazar.addEventListener('click', function () { decidir(RECHAZADO); });
        aceptar.addEventListener('click', function () { decidir(ACEPTADO); });

        aviso.append(parrafo, rechazar, aceptar);
        document.body.insertBefore(aviso, document.querySelector('body > footer'));
    }

    function crearBotonPie() {
        const pie = document.querySelector('body > footer');
        if (!pie) {
            return;
        }
        const boton = crearElemento('button', 'cookies.gestionar', { type: 'button' });
        boton.addEventListener('click', function () {
            aviso.hidden = false;
            aviso.querySelector('button').focus();
        });
        pie.append(boton);
    }

    crearAviso();
    crearBotonPie();

    const decision = leerDecision();
    if (decision === ACEPTADO) {
        cargarClarity();
    } else if (decision !== RECHAZADO) {
        aviso.hidden = false;
    }
})();
