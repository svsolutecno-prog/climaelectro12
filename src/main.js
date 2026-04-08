
AOS.init();
$(document).ready(function() {
    //--Header y Footer ---
    $("#contentHeader").load("header.html", function() {
        const header = document.querySelector('header');
        const navLinks = document.querySelectorAll('.nav-links a');
        const firstLogo = document.querySelector('.first-logo');
        const secondLogo = document.querySelector('.second-logo');
        const menu = document.querySelector('.menu');
        const toTop = document.querySelector('#top');

        if (header && navLinks.length > 0 && firstLogo && secondLogo && menu && toTop) {
            window.addEventListener('scroll', () => {
                if(window.scrollY > 320){
                    header.classList.add('bg-white', 'shadow-lg');
                    firstLogo.classList.add('hidden');
                    secondLogo.classList.remove('hidden');
                    menu.classList.add('invert'); 
                    menu.classList.remove('invert'); 
                    navLinks.forEach(link => {
                        link.classList.add('text-neutral-700!');
                        link.classList.remove('text-white');
                    });
                } else {
                    header.classList.remove('bg-white', 'shadow-lg');
                    firstLogo.classList.remove('hidden');
                    secondLogo.classList.add('hidden');
                    menu.classList.remove('invert'); 
                    menu.classList.add('invert'); 
                    navLinks.forEach(link => {
                        link.classList.remove('text-neutral-700!');
                        link.classList.add('text-white');
                    });
                }
                if(window.scrollY > 800){
                    toTop.classList.remove('bottom-[-100%]');
                    toTop.classList.add('bottom-0');
                } else {
                    toTop.classList.add('bottom-[-100%]');
                    toTop.classList.remove('bottom-0');
                }
            });
        }
    });

    $("#contentFooter").load("footer.html");

    // --- Navegación y scroll de jQuery ---
    $('.navigation a:first-child').addClass('active');
    var isAnimating = false;
    $('a').filter(function() {
        return this.getAttribute('href') && this.getAttribute('href').indexOf('#') === 0;
    }).bind('click', function(e) {
        e.preventDefault();
        var target = $(this).attr("href");
        var $targetElement = $(target);
        if ($targetElement.length) {
            isAnimating = true;
            $('html, body').stop().animate({
                scrollTop: $targetElement.offset().top
            }, 600, function() {
                isAnimating = false;
            });
        }
    });

    $(window).scroll(function() {
        if (!isAnimating) {
            var scrollDistance = $(window).scrollTop();
            var windowHeight = $(window).height();
            var halfwayPoint = scrollDistance + (windowHeight / 2);
            $('.page-section').each(function() {
                var sectionTop = $(this).position().top;
                var sectionBottom = sectionTop + $(this).outerHeight();
                if (sectionTop <= halfwayPoint && sectionBottom > halfwayPoint) {
                    $('.navigation a.active').removeClass('active');
                    $('.navigation a[href="#' + $(this).attr('id') + '"]').addClass('active');
                }
            });
        }
    }).scroll();


    
    // acordeones
    const accordionContainers = document.querySelectorAll("[id^='accordion-section-']");
    if (accordionContainers.length > 0) {
        accordionContainers.forEach(container => {
            const accordionItems = container.querySelectorAll(".item-accordion .header");
            accordionItems.forEach((item) => {
                item.addEventListener("click", (e) => {
                    const currentItem = e.currentTarget.closest(".item-accordion");
                    accordionItems.forEach((header) => {
                        const otherItem = header.closest('.item-accordion');
                        if (otherItem !== currentItem) {
                            otherItem.classList.remove('active');
                        }
                    });
                    currentItem.classList.toggle("active");
                });
            });
        });
    }

     // --- Buscador de Empresas ---
    const searchInput = document.getElementById('searchInput');
    const searchButton = document.getElementById('searchButton');
    const dataDisplay = document.getElementById('dataDisplay');
    const stateSelect = document.getElementById('stateSelect');

    // Variable para almacenar las empresas después de procesar (con Data URLs)
    let processedCompaniesForDisplay = []; 
    // Variable para almacenar los datos originales SOLO para la búsqueda (si se mantiene la búsqueda por campos sensibles)
    let originalCompaniesForSearch = []; 

 

    function textToImage(text, fontSize = 16, fontFamily = 'Inter', textColor = '#404040') {
        var hiddenCanvas = document.getElementById('hiddenImageCanvas');
        var hiddenCtx = hiddenCanvas.getContext('2d');
        if (!text || text.trim() === '' || text.toLowerCase() === 'n/a') {
            text = 'N/A';
        }
        
        hiddenCtx.font = `${fontSize}px ${fontFamily}`;
        hiddenCtx.fillStyle = textColor;
        hiddenCtx.textBaseline = 'top';

        const textMetrics = hiddenCtx.measureText(text);
        const textWidth = textMetrics.width;
        const textHeight = fontSize * 1.5; 

        hiddenCanvas.width = textWidth + 10; 
        hiddenCanvas.height = textHeight + 5; 

        hiddenCtx.clearRect(0, 0, hiddenCanvas.width, hiddenCanvas.height);

        hiddenCtx.font = `${fontSize}px ${fontFamily}`;
        hiddenCtx.fillStyle = textColor;
        hiddenCtx.textBaseline = 'top';
        hiddenCtx.fillText(text, 5, 2);

        try {
            return hiddenCanvas.toDataURL('image/png');
        } catch (e) {
            console.error("Error al convertir canvas a imagen:", e);
            return 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=';
        }
    }

    function populateStateSelect() {
        const allStates = new Set();
        originalCompaniesForSearch.forEach(company => { 
            company.states.forEach(state => allStates.add(state));
        });

        var sortedStates = Array.from(allStates ).sort();

        const defaultOption = document.createElement('option');
        defaultOption.value = '';
        defaultOption.textContent = 'Todos los Estados';
        stateSelect.appendChild(defaultOption);

        sortedStates.forEach(state => {
            const option = document.createElement('option');
            option.value = state;
            option.textContent = state;
            stateSelect.appendChild(option);
        });
    }

    function displayCompanies(companies) {
        const $display = $('#dataDisplay').empty();               // vaciar contenedor

        /* 1. Si no hay resultados */
        if (!companies.length) {
            $display.html(
                '<div class="no-results text-center text-gray-500 py-4 col-span-full">' +
                'No se encontraron coincidencias con tu búsqueda.' +
                '</div>'
            );
            return;
        }

        /* 2. Construimos todos los nodos en un array y los agregamos de una sola vez */
        const items = $.map(companies, company =>

            $('<div>', {
                class: 'data-item border-b-1 border-gray-300 flex flex-col gap-1'
            })

            /* Nombre */
            .append($('<div>', {
                class: 'text-blue1-sitca font-bold lg:text-lg',
                text : company.name
            }))

            /* RIF */
            .append($('<img>', {
                class : 'object-none w-fit h-fit',
                src   : company.rif,
                alt   : `RIF de ${company.name}`,
                title : 'RIF'
            }))

            /* Contacto Técnico */
            .append($('<img>', {
                class : 'object-none w-fit h-fit',
                src   : company.technicalContact,
                alt   : `Contacto técnico de ${company.name}`,
                title : 'Técnico Autorizado'
            }))

            /* Teléfono */
            .append($('<img>', {
                class : 'object-none w-fit h-fit',
                src   : company.phone,
                alt   : `Teléfono de ${company.name}`,
                title : 'Teléfono'
            }))

            /* Email */
            .append($('<img>', {
                class : 'object-none w-fit h-fit',
                src   : company.email,
                alt   : `Correo de ${company.name}`,
                title : 'Correo'
            }))

            /* Ubicación (oculta) */
            .append($('<p>', {
                class : 'text-neutral-700 ml-1 hidden',
                text  : company.states 
            }))

            /* Dirección */
            .append(
                $('<p>', {class: 'text-neutral-700 ml-1'}).html(
                    `<strong>Dirección</strong>: ${company.address || 'N/A'}`
                )
            )[0]     // devolvemos el nodo DOM simple, no el objeto jQuery
        );

        /* 3. Insertamos todos los resultados de un solo golpe */
        $display.append(items);
    }
    // function displayCompanies(companiesToDisplay) {
    //     dataDisplay.innerHTML = '';

    //     if (companiesToDisplay.length === 0) {
    //         dataDisplay.innerHTML = '<div class="no-results text-center text-gray-500 py-4 col-span-full">No se encontraron coincidencias con tu búsqueda.</div>';
    //         return;
    //     }

    //     companiesToDisplay.forEach(company => {
    //         const div = document.createElement('div');
    //         div.classList.add(
    //             'data-item', 'border-b-1', 'border-gray-300',
    //             'flex', 'flex-col', 'gap-1'
    //         );

    //         // Nombre de la empresa
    //         const nameHtml = `<div class="text-blue1-sitca font-bold lg:text-lg">${company.name}</div>`;
    //         div.insertAdjacentHTML('beforeend', nameHtml);

    //         // RIF
    //         const rifImg = $('<img class="object-none w-fit h-fit">').attr({
    //             src: company.rif, 
    //             alt: `RIF de ${company.name}`,
    //             title: `RIF` 
    //         });
    //         $(div).append(rifImg);

    //         // Contacto Técnico
    //         const techContactImg = $('<img class="object-none w-fit h-fit">').attr({
    //             src: company.technicalContact,
    //             alt: `Contacto técnico de ${company.name}`,
    //             title: `Técnico Autorizado` 
    //         });
    //         $(div).append(techContactImg);

    //         // Teléfono
    //         const phoneImg = $('<img class="object-none w-fit h-fit">').attr({
    //             src: company.phone,
    //             alt: `Teléfono de ${company.name}`,
    //             title: `Teléfono` 
    //         });
    //         $(div).append(phoneImg);

    //         // Correo Electrónico
    //         const emailImg = $('<img class="object-none w-fit h-fit">').attr({
    //             src: company.email,
    //             alt: `Correo de ${company.name}`,
    //             title: `Correo` 
    //         });
    //         $(div).append(emailImg);
            
    //         // Ubicación (texto normal)
    //         const locationHtml = `<p class="text-neutral-700 ml-1 hidden">${company.states}</p>`;
    //         div.insertAdjacentHTML('beforeend', locationHtml);

    //         // Dirección (texto normal)
    //         const addressText = `<p class="text-neutral-700 ml-1"><strong>Dirección</strong>: ${company.address || 'N/A'}</p>`;
    //         div.insertAdjacentHTML('beforeend', addressText);

    //         dataDisplay.appendChild(div);
    //     });
    // }

    function performSearch() {

        /* 1. Leemos lo que hay en los dos inputs */
        let  estado = $('#stateSelect').val().trim().toLowerCase();          // '' si no hay
        let  nombre = $('#searchInput').val().trim();                         // puede venir “Bolívar - AlphaGroup”

        /* 3. Recorremos cada tarjeta y decidimos si se muestra u oculta */
        $('#dataDisplay .data-item').each(function () {

            const $item      = $(this);
            const estItem    = $item.find('p:first').text().trim().toLowerCase();  // Estado
            const nombreItem = $item.find('.text-blue1-sitca').text().trim().toLowerCase(); // Empresa

            const coincideEstado = !estado || estItem === estado;
            const coincideNombre = !nombre || nombreItem.includes(nombre);

            $item.toggle(coincideEstado && coincideNombre); // show / hide
        });
    }

    // Event Listeners
    if (searchInput && searchButton && dataDisplay && stateSelect) {
        searchButton.addEventListener('click', performSearch);

        searchInput.addEventListener('keyup', (event) => {
            if (event.key === 'Enter') {
                performSearch();
            } else if (searchInput.value === '' && stateSelect.value === '') {
                displayCompanies(processedCompaniesForDisplay); // Muestra todas las procesadas
            } else {
                performSearch();
            }
        });
        $('#stateSelect').on('change', performSearch);

        $('#searchInput')
        .on('keyup', function (e) {
            if (e.key === 'Enter') performSearch();
            if (!this.value) performSearch();   // si se borra todo, se muestran todas
        });
        // stateSelect.addEventListener('change', performSearch(stateSelect.value, true));

        // ***************************************************************
        // Carga de datos y procesamiento inicial
        // ***************************************************************
        fetch('src/companies.json') // Asegúrate que la ruta al JSON sea correcta
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                return response.json();
            })
            .then(data => {
                
                // Asignar los datos originales a `originalCompaniesForSearch`
                originalCompaniesForSearch = data.sort((a, b) => {
                    const nameA = a.name.toUpperCase();
                    const nameB = b.name.toUpperCase();
                    if (nameA < nameB) return -1;
                    if (nameA > nameB) return 1;
                    return 0;
                });
                processedCompaniesForDisplay = data;
                // Inicialización al cargar la página
                populateStateSelect(); // Usa originalCompaniesForSearch para los estados
                displayCompanies(processedCompaniesForDisplay); // Muestra las empresas con Data URLs

            })
            .catch(error => {
                console.error('Error al cargar los datos de las empresas:', error);
                dataDisplay.innerHTML = '<div class="text-center text-red-500 py-4 col-span-full">Error al cargar la información. Por favor, inténtalo de nuevo más tarde.</div>';
            });

    }

    // --- Slider ---
    const splideElement = document.querySelector('.splide');
    if (splideElement) {
        const slideNombres = ['Aisino A75','Aisino A80','AMP 8200','AMP 8400','AMP 2200',];
        const splide = new Splide('.splide', {
            perPage: 1,
            pagination: false,
            autoplay: true,
            type : 'loop',
            arrows :false ,
        });

        const customPagination = document.querySelector('.custom-pagination');
        splide.mount();
        const numSlides = splide.length;

        function createCustomPagination() {
            for (let i = 0; i < numSlides; i++) {
                const button = document.createElement('button');
                button.classList.add('custom-pagination__button');
                button.dataset.slide = i;
                const image = document.createElement('img');
                image.src = `src/img/button-${i + 1}.png`;
                image.alt = `Dispositivo ${i + 1}`;
                const text = document.createElement('span');
                text.textContent = slideNombres[i];
                button.appendChild(image);
                button.appendChild(text);
                customPagination.appendChild(button);
                button.addEventListener('click', function () {
                    splide.go(i);
                });
            }
            if (numSlides > 0) {
                const firstButton = customPagination.querySelector('.custom-pagination__button');
                if (firstButton) {
                    firstButton.classList.add('is-active');
                }
            }
        }

        createCustomPagination();

        splide.on('move', function () {
            const currentIndex = splide.index;
            const buttons = customPagination.querySelectorAll('.custom-pagination__button');
            buttons.forEach((button, index) => {
                button.classList.remove('is-active');
                if (index === currentIndex) {
                    button.classList.add('is-active');
                }
            });
        });
    }

}); 