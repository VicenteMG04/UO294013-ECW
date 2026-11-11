/*
 * Buscador global del sitio (sin servidor).
 * El formulario de la cabecera envía la consulta a buscar.html?q=...; esta página descarga las
 * páginas del sitio, extrae el texto de su <main> en el idioma actual y muestra las coincidencias.
 * Requiere servir el sitio por HTTP(S): con file:// el navegador bloquea fetch.
 * Depende de textos.js (función texto) y de idioma.js (evento "idioma-cambiado").
 */
(function () {
    'use strict';

    const PAGINAS = [
        { url: 'index.html', clave: 'nav.inicio' },
        { url: 'sobre-mi.html', clave: 'nav.sobre-mi' },
        { url: 'intereses.html', clave: 'nav.intereses' },
        { url: 'indispensables.html', clave: 'nav.indispensables' },
        { url: 'contacto.html', clave: 'nav.contacto' }
    ];
    const ELEMENTOS = 'main h1, main h2, main h3, main p, main li, main summary, main dt, main dd, main figcaption';
    const MAX_POR_PAGINA = 3;
    const LONGITUD_FRAGMENTO = 160;

    const resumen = document.querySelector('main output');
    const lista = document.querySelector('main ol');
    const campo = document.querySelector('body > header input[type="search"]');
    if (!resumen || !lista || !campo) {
        return;
    }

    const consulta = (new URLSearchParams(window.location.search).get('q') || '').trim();
    campo.value = consulta;

    /* Minúsculas y sin tildes; conserva la longitud para poder resaltar sobre el texto original. */
    function normalizar(cadena) {
        return cadena.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
    }

    function escaparRegExp(cadena) {
        return cadena.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }

    /* Texto de un elemento en el idioma actual (las claves data-i18n llevan la traducción). */
    function textoDe(elemento) {
        const copia = elemento.cloneNode(true);
        if (copia.dataset.i18n) {
            copia.textContent = texto(copia.dataset.i18n);
        }
        copia.querySelectorAll('[data-i18n]').forEach(function (hijo) {
            hijo.textContent = texto(hijo.dataset.i18n);
        });
        return copia.textContent.replace(/\s+/g, ' ').trim();
    }

    function recortar(contenido, posicion) {
        if (contenido.length <= LONGITUD_FRAGMENTO) {
            return { texto: contenido };
        }
        const inicio = Math.max(0, posicion - Math.floor(LONGITUD_FRAGMENTO / 3));
        const fin = Math.min(contenido.length, inicio + LONGITUD_FRAGMENTO);
        return {
            texto: (inicio > 0 ? '…' : '') + contenido.slice(inicio, fin) + (fin < contenido.length ? '…' : '')
        };
    }

    /* Crea un <p> con las coincidencias resaltadas con <mark> (sin usar innerHTML). */
    function crearFragmento(contenido, expresion) {
        const normalizado = normalizar(contenido);
        const primera = normalizado.search(expresion);
        const recorte = recortar(contenido, primera);
        const parrafo = document.createElement('p');
        const original = recorte.texto;
        const norm = normalizar(original);
        let cursor = 0;
        let coincidencia;
        expresion.lastIndex = 0;
        while ((coincidencia = expresion.exec(norm)) !== null && coincidencia[0] !== '') {
            parrafo.append(original.slice(cursor, coincidencia.index));
            const marca = document.createElement('mark');
            marca.textContent = original.slice(coincidencia.index, coincidencia.index + coincidencia[0].length);
            parrafo.append(marca);
            cursor = coincidencia.index + coincidencia[0].length;
        }
        parrafo.append(original.slice(cursor));
        return parrafo;
    }

    function buscar(paginas, terminos) {
        const normalizados = terminos.map(normalizar);
        const expresion = new RegExp(normalizados.map(escaparRegExp).join('|'), 'g');
        const resultados = [];
        paginas.forEach(function (pagina) {
            const coincidencias = [];
            pagina.documento.querySelectorAll(ELEMENTOS).forEach(function (elemento) {
                if (elemento.closest('dialog, nav')) {
                    return;
                }
                const contenido = textoDe(elemento);
                const normalizado = normalizar(contenido);
                if (normalizados.every(function (termino) { return normalizado.includes(termino); })) {
                    coincidencias.push(contenido);
                }
            });
            if (coincidencias.length > 0) {
                resultados.push({ pagina: pagina, coincidencias: coincidencias });
            }
        });
        resultados.sort(function (a, b) { return b.coincidencias.length - a.coincidencias.length; });
        return { resultados: resultados, expresion: expresion };
    }

    function mostrar(paginas) {
        lista.replaceChildren();
        if (consulta === '') {
            resumen.textContent = texto('buscar.vacio');
            return;
        }
        const terminos = consulta.split(/\s+/);
        const encontrado = buscar(paginas, terminos);
        const total = encontrado.resultados.reduce(function (suma, r) { return suma + r.coincidencias.length; }, 0);

        const clave = total === 0 ? 'buscar.sin-resultados' : (total === 1 ? 'buscar.uno' : 'buscar.varios');
        resumen.textContent = texto(clave).replace('{n}', total).replace('{q}', consulta);

        encontrado.resultados.forEach(function (resultado) {
            const elemento = document.createElement('li');
            const enlace = document.createElement('a');
            enlace.href = resultado.pagina.url;
            enlace.textContent = texto(resultado.pagina.clave);
            elemento.append(enlace);
            resultado.coincidencias.slice(0, MAX_POR_PAGINA).forEach(function (contenido) {
                elemento.append(crearFragmento(contenido, encontrado.expresion));
            });
            lista.append(elemento);
        });
    }

    /* Descarga y analiza cada página del sitio una sola vez. */
    resumen.textContent = texto('buscar.cargando');
    Promise.all(PAGINAS.map(function (pagina) {
        return fetch(pagina.url)
            .then(function (respuesta) {
                if (!respuesta.ok) {
                    throw new Error(respuesta.status);
                }
                return respuesta.text();
            })
            .then(function (html) {
                return {
                    url: pagina.url,
                    clave: pagina.clave,
                    documento: new DOMParser().parseFromString(html, 'text/html')
                };
            });
    })).then(function (paginas) {
        mostrar(paginas);
        document.addEventListener('idioma-cambiado', function () {
            mostrar(paginas);
        });
    }).catch(function () {
        resumen.textContent = texto('buscar.error');
    });
})();
