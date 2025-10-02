class App {
    constructor() {
    const mainContent = document.getElementById('main-content');
    const sidebar = document.querySelector('.sidebar');
    const menuToggle = document.querySelector('.menu-toggle');
    const navLinks = document.querySelectorAll('.sidebar-nav a');

    // --- 1. Lógica de Personalización (Ajustes) ---

    const applySettings = () => {
    const theme = localStorage.getItem('appTheme') || 'light';
    const accentColor = localStorage.getItem('appAccentColor') || '#3498db';
    document.documentElement.setAttribute('data-theme', theme);
    document.documentElement.style.setProperty('--accent-color', accentColor);

    const backgroundImage = localStorage.getItem('appBackgroundImage');
    const bgColor = localStorage.getItem('appBgColor');
    if (backgroundImage) {
        document.body.style.backgroundImage = `url(${backgroundImage})`;
        document.body.style.backgroundColor = '';
    } else if (bgColor) {
        document.body.style.backgroundImage = 'none';
        document.body.style.backgroundColor = bgColor;
    } else {
        document.body.style.backgroundImage = 'none';
        document.body.style.backgroundColor = '';
    }
};
    
    const initAjustesPage = () => {
        const page = document.getElementById('page-ajustes');
        if (!page) return;

        const themeSwitch = document.getElementById('theme-switch');
        const colorPalette = document.getElementById('accent-color-palette');
        const accentColorBtns = document.getElementById('accent-color-btns');
        const bgColorBtns = document.getElementById('bg-color-btns');

        // Sincronizar el estado actual de los controles
        const currentTheme = localStorage.getItem('appTheme') || 'light';
        themeSwitch.checked = currentTheme === 'dark';

        const currentAccent = localStorage.getItem('appAccentColor') || '#3498db';
        colorPalette.querySelectorAll('.color-box').forEach(box => {
            box.classList.toggle('active', box.style.backgroundColor === currentAccent);
        });

        // Event Listener para el cambio de tema
        themeSwitch.addEventListener('change', (e) => {
            const newTheme = e.target.checked ? 'dark' : 'light';
            localStorage.setItem('appTheme', newTheme);
            applySettings();
        });

        // Event Listener para la paleta de colores
        colorPalette.addEventListener('click', (e) => {
            if (e.target.classList.contains('color-box')) {
                const newColor = e.target.style.backgroundColor;
                localStorage.setItem('appAccentColor', newColor);
                applySettings();

                // Actualizar la clase 'active' visualmente
                colorPalette.querySelector('.color-box.active')?.classList.remove('active');
                e.target.classList.add('active');
            }
        });

        const backgroundImageInput = document.getElementById('background-image-input');
        const removeBackgroundBtn = document.getElementById('remove-background-btn');

        if (backgroundImageInput) {
            backgroundImageInput.addEventListener('change', (e) => {
                const file = e.target.files[0];
                if (file) {
                    const reader = new FileReader();
                    reader.onload = (event) => { // Sigue usando DataURL para el fondo por simplicidad de CSS
                        const backgroundImageDataUrl = event.target.result;
                        localStorage.setItem('appBackgroundImage', backgroundImageDataUrl);
                        localStorage.removeItem('appBgColor'); // Asegura que el color no sobreescriba la imagen
                        applySettings();
                    };
                    reader.readAsDataURL(file); // Para CSS background-image, DataURL es lo más directo.
                }
            });
        }

        if (removeBackgroundBtn) {
            removeBackgroundBtn.addEventListener('click', () => {
                localStorage.removeItem('appBackgroundImage');
                localStorage.removeItem('appBgColor');
                applySettings();
            });
        }

        // --- NUEVO: Botones de color de acento ---
        if (accentColorBtns) {
            accentColorBtns.querySelectorAll('.accent-color-btn').forEach(btn => {
                btn.addEventListener('click', () => {
                    const color = btn.getAttribute('data-color');
                    localStorage.setItem('appAccentColor', color);
                    applySettings();
                    accentColorBtns.querySelectorAll('.accent-color-btn').forEach(b => b.classList.remove('active'));
                    btn.classList.add('active');
                });
            });
            // Marcar el botón activo al cargar
            const currentAccent = localStorage.getItem('appAccentColor') || '#3498db';
            accentColorBtns.querySelectorAll('.accent-color-btn').forEach(btn => {
                btn.classList.toggle('active', btn.getAttribute('data-color').toLowerCase() === currentAccent.toLowerCase());
            });
        }

        // --- NUEVO: Botones de color de fondo ---
        if (bgColorBtns) {
            bgColorBtns.querySelectorAll('.bg-color-btn').forEach(btn => {
                btn.addEventListener('click', () => {
                    const color = btn.getAttribute('data-color');
                    localStorage.setItem('appBgColor', color);
                    localStorage.removeItem('appBackgroundImage'); // Quitar imagen si se pone color
                    document.body.style.backgroundImage = 'none';
                    document.body.style.backgroundColor = color;
                    bgColorBtns.querySelectorAll('.bg-color-btn').forEach(b => b.classList.remove('active'));
                    btn.classList.add('active');
                });
            });
            // Marcar el botón activo al cargar
            const currentBg = localStorage.getItem('appBgColor');
            bgColorBtns.querySelectorAll('.bg-color-btn').forEach(btn => {
                btn.classList.toggle('active', btn.getAttribute('data-color').toLowerCase() === (currentBg || '').toLowerCase());
            });
        }

        // --- Fase 5: Import/Export ---
        initDataManagement();
    };

    // Tu función existente para la página de inglés
    const initInglesPage = () => {
        const page = document.getElementById('page-ingles');
        if (!page) return;

        let data = JSON.parse(localStorage.getItem('englishData')) || { vocab: [], grammar: [], resources: [] };
        const save = () => localStorage.setItem('englishData', JSON.stringify(data));

        const modals = {
            vocab: document.getElementById('vocab-modal'),
            grammar: document.getElementById('grammar-modal'),
            resource: document.getElementById('resource-modal')
        };

        // --- Modal Closing ---
        Object.values(modals).forEach(modal => {
            if (!modal) return;
            const closeBtn = modal.querySelector('.close-btn'); // This might be duplicated if modals are reused across pages
            if (closeBtn) closeBtn.onclick = () => modal.style.display = 'none';
        });

        // --- Tab Switching ---
        const inglesContainer = document.getElementById('ingles-container');
        inglesContainer.querySelector('.tab-switcher').addEventListener('click', e => {
            if (e.target.classList.contains('tab-btn')) {
                const tab = e.target.dataset.tab;
                inglesContainer.querySelectorAll('.tab-btn, .tab-content').forEach(el => el.classList.remove('active'));
                e.target.classList.add('active');
                document.getElementById(`${tab}-tab-content`).classList.add('active');
            }
        });

        // --- Local Search/Filter ---
        const searchInput = inglesContainer.querySelector('#ingles-search-input');
        if (searchInput) {
            searchInput.addEventListener('input', () => {
                const query = searchInput.value.toLowerCase();
                const activeTab = inglesContainer.querySelector('.tab-btn.active').dataset.tab;
                
                if (activeTab === 'vocab' || activeTab === 'grammar') {
                    const items = inglesContainer.querySelectorAll(`#${activeTab}-list .card`);
                    items.forEach(item => {
                        const text = item.textContent.toLowerCase();
                        if (text.includes(query)) {
                            item.style.display = '';
                        } else {
                            item.style.display = 'none';
                        }
                    });
                }
            });
        }

        // --- Flashcard Logic ---
        const flashcardView = inglesContainer.querySelector('#flashcard-view');
        const vocabList = inglesContainer.querySelector('#vocab-list');
        const startFlashcardsBtn = inglesContainer.querySelector('#start-flashcards-btn');
        const resourceList = inglesContainer.querySelector('#resource-gallery');

        if (flashcardView) {
            // Hide flashcard view when switching tabs
            inglesContainer.querySelector('.tab-switcher').addEventListener('click', e => {
                if (e.target.classList.contains('tab-btn')) {
                    flashcardView.style.display = 'none';
                    vocabList.style.display = 'block';
                    startFlashcardsBtn.style.display = e.target.dataset.tab === 'vocab' ? 'inline-flex' : 'none';
                    resourceList.style.display = e.target.dataset.tab === 'resources' ? 'grid' : 'none';
                    vocabList.style.display = e.target.dataset.tab === 'vocab' ? 'block' : 'none';
                }
            });

            const flashcard = flashcardView.querySelector('.flashcard');
            let currentFlashcardIndex = 0;

            inglesContainer.querySelector('#start-flashcards-btn').addEventListener('click', () => {
                if (data.vocab.length === 0) {
                    alert('Añade palabras a tu vocabulario para usar las flashcards.');
                    return;
                }
                flashcardView.style.display = 'block';
                startFlashcardsBtn.style.display = 'none';
                vocabList.style.display = 'none';
                currentFlashcardIndex = 0;
                renderFlashcard();
            });

            const renderFlashcard = () => {
                const cardData = data.vocab[currentFlashcardIndex];
                flashcard.classList.remove('is-flipped');
                flashcard.querySelector('.flashcard-front').textContent = cardData.term;
                flashcard.querySelector('.flashcard-back').textContent = cardData.translation;
            };

            flashcard.addEventListener('click', () => {
                flashcard.classList.toggle('is-flipped');
            });

            flashcardView.querySelector('#prev-flashcard-btn').addEventListener('click', () => {
                currentFlashcardIndex = (currentFlashcardIndex - 1 + data.vocab.length) % data.vocab.length;
                renderFlashcard();
            });

            flashcardView.querySelector('#next-flashcard-btn').addEventListener('click', () => {
                currentFlashcardIndex = (currentFlashcardIndex + 1) % data.vocab.length;
                renderFlashcard();
            });

            flashcardView.querySelector('#exit-flashcards-btn').addEventListener('click', () => {
                flashcardView.style.display = 'none';
                vocabList.style.display = 'block';
                startFlashcardsBtn.style.display = 'inline-flex';
            });
        }

        const setupCrud = (type) => {
            const modal = modals[type];
            if (!modal) return; // Si el modal no existe, no continuar
            const form = modal.querySelector('form');
            const listEl = document.getElementById(`${type}-list`) || document.getElementById(`${type}-gallery`);

            const render = () => {
                let html = '';
                if (type === 'vocab') {
                    html = data.vocab.map(item => `
                        <div class="card" data-id="${item.id}">
                            <h4>${item.term} - <i>${item.translation}</i></h4>
                            <p>${item.example}</p>
                            <div class="card-actions"><button class="edit-btn control-btn">Editar</button><button class="delete-btn remove-btn"><img src="Assets/icons/Borrar2.svg" alt="Eliminar" class="icon"></button></div>
                        </div>`).join('');
                } else if (type === 'grammar') {
                    html = data.grammar.map(item => `<div class="card" data-id="${item.id}"><h4>${item.title}</h4><p>${item.description}</p><div class="card-actions"><button class="edit-btn control-btn">Editar</button><button class="delete-btn remove-btn"><img src="Assets/icons/Borrar2.svg" alt="Eliminar" class="icon"></button></div></div>`).join('');
                } else if (type === 'resources') {
                    html = data.resources.map(item => `
                        <div class="drawing-card" data-id="${item.id}">
                            <a href="${item.fileData}" target="_blank" title="Abrir en nueva pestaña">
                                ${item.fileData.startsWith('data:image') 
                                    ? `<img src="${item.fileData}" alt="${item.name}">` 
                                    : `<div class="file-placeholder"><img src="Assets/icons/description.svg" alt="Archivo" class="icon"></div>`
                                }
                            </a>
                            <div class="drawing-card-content"><p>${item.name}</p></div>
                            <button class="delete-btn remove-btn"><img src="Assets/icons/borrar2.svg" alt="Eliminar" class="icon"></button>
                        </div>`).join('');
                }
                listEl.innerHTML = html || '<p>No hay entradas.</p>';
            };

            document.getElementById(`add-${type}-btn`).onclick = () => {
                if(flashcardView) flashcardView.style.display = 'none';
                if(vocabList) vocabList.style.display = 'block';
                form.reset();
                const hiddenId = form.querySelector('input[type="hidden"]');
                if(hiddenId) hiddenId.value = '';
                modal.style.display = 'flex';
            };

            listEl.addEventListener('click', e => {
                const id = e.target.closest('[data-id]')?.dataset.id;
                if (!id) return;

                if (e.target.classList.contains('edit-btn')) {
                    const item = data[type].find(i => i.id === id);
                    if (item) {
                        form.reset();
                        form.querySelector('input[type="hidden"]').value = item.id;
                        if (type === 'vocab') {
                            form.querySelector('#vocab-term').value = item.term;
                            form.querySelector('#vocab-translation').value = item.translation;
                            form.querySelector('#vocab-example').value = item.example;
                        } else if (type === 'grammar') {
                            form.querySelector('#grammar-title').value = item.title;
                            form.querySelector('#grammar-description').value = item.description;
                        } else if (type === 'resources') {
                            form.querySelector('input[type="hidden"]').value = item.id;
                            form.querySelector('#resource-name').value = item.name;
                            // Cannot pre-fill file input
                        }
                        modal.style.display = 'flex';
                    }
                }
                if (e.target.closest('.delete-btn')) {
                    if (confirm('¿Eliminar?')) {
                        data[type] = data[type].filter(i => i.id != id);
                        save();
                        render();
                    }
                }
            });

            form.onsubmit = async (e) => {
                e.preventDefault();
                if (!validateForm(form)) return;
                
                const idInput = form.querySelector('input[type="hidden"]');
                const id = (idInput ? idInput.value : null) || Date.now().toString(); // Use existing ID or create new
                let newItem;

                if (type === 'vocab') {
                    newItem = {
                        id,
                        term: form.querySelector('#vocab-term').value,
                        translation: form.querySelector('#vocab-translation').value,
                        example: form.querySelector('#vocab-example').value,
                    };
                } else if (type === 'grammar') {
                    newItem = {
                        id,
                        title: form.querySelector('#grammar-title').value,
                        description: form.querySelector('#grammar-description').value,
                    };
                } else if (type === 'resources') {
                    const fileInput = form.querySelector('#resource-file');
                    const file = fileInput.files[0];
                    let fileDataUrl = null; // Cambiamos el nombre para mayor claridad

                    if (file) {
                        fileDataUrl = await new Promise((resolve) => {
                            const reader = new FileReader();
                            reader.onload = (e) => resolve(e.target.result);
                            reader.readAsDataURL(file);
                        });
                    }

                    const existingItem = data.resources.find(i => i.id === id);

                    if (!fileDataUrl && !existingItem) {
                        alert('Por favor, selecciona un archivo.');
                        return;
                    }

                    newItem = { id, name: form.querySelector('#resource-name').value };
                    newItem.fileData = fileDataUrl || (existingItem ? existingItem.fileData : null); // Keep old file if new one isn't provided

                    if (!newItem.fileData) {
                        alert('Por favor, selecciona un archivo.');
                        return;
                    }
                }

                const index = data[type].findIndex(i => i.id === id);
                if (index > -1) {
                    data[type][index] = newItem;
                } else {
                    data[type].push(newItem);
                }
                save();
                render();
                modal.style.display = 'none';
            };
            render();
        };

        setupCrud('vocab');
        setupCrud('grammar');
        setupCrud('resources');
    };
    
    const initHorariosPage = () => {
        const page = document.getElementById('page-horarios');
        if (!page) return;

        let schedules = JSON.parse(localStorage.getItem('schedules')) || {};
        let currentScheduleName = localStorage.getItem('currentSchedule') || 'Mi Horario';

        const save = () => {
            localStorage.setItem('schedules', JSON.stringify(schedules));
            localStorage.setItem('currentSchedule', currentScheduleName);
        };

        const selector = page.querySelector('#schedule-selector');
        const table = page.querySelector('#schedule-table');
        
        const autogenModal = page.querySelector('#autogen-schedule-modal');
        const autogenForm = page.querySelector('#autogen-schedule-form');


        const renderTable = () => {
            let scheduleData = schedules[currentScheduleName];
            if (!scheduleData) {
                // Create a default schedule
                scheduleData = {
                    headers: ['Hora', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes'],
                    rows: [
                        ['08:00 - 09:00', '', '', '', '', ''],
                        ['09:00 - 10:00', '', '', '', '', '']
                    ],
                    interval: 60
                };
                schedules[currentScheduleName] = scheduleData;
            }

            table.innerHTML = `
                <thead>
                    <tr>${scheduleData.headers.map(h => `<th>${h}</th>`).join('')}</tr>
                </thead>
                <tbody>
                    ${scheduleData.rows.map(row => `
                        <tr>${row.map((cell, i) => `<td contenteditable="${i !== 0}">${cell}</td>`).join('')}</tr>
                    `).join('')}
                </tbody>
            `;
        };

        const populateSelector = () => {
            if (Object.keys(schedules).length === 0) {
                schedules['Mi Horario'] = null; // Ensure at least one exists
            }
            selector.innerHTML = Object.keys(schedules).map(name => 
                `<option value="${name}" ${name === currentScheduleName ? 'selected' : ''}>${name}</option>`
            ).join('');
            if (!currentScheduleName) currentScheduleName = Object.keys(schedules)[0];
        };

        if (!page.dataset.listenersAttached) {
            page.dataset.listenersAttached = 'true';

            page.querySelector('#new-schedule-btn').addEventListener('click', () => {
                const name = prompt('Nombre del nuevo horario:', `Horario ${Object.keys(schedules).length + 1}`);
                if (name && !schedules[name]) {
                    currentScheduleName = name;
                    schedules[name] = null; // Will be initialized on render
                    populateSelector();
                    renderTable();
                    save();
                } else if (name) {
                    alert('Ese nombre ya existe.');
                }
            });

            selector.addEventListener('change', () => {
                currentScheduleName = selector.value;
                renderTable();
                save();
            });

            page.querySelector('#save-schedule-btn').addEventListener('click', () => {
                const headers = Array.from(table.querySelectorAll('thead th')).map(th => th.textContent);
                const rows = Array.from(table.querySelectorAll('tbody tr')).map(tr => 
                    Array.from(tr.querySelectorAll('td')).map(td => td.textContent)
                );
                schedules[currentScheduleName] = { headers, rows, interval: schedules[currentScheduleName]?.interval || 60 };
                save();
                alert('Horario guardado.');
            });

            page.querySelector('#delete-schedule-btn').addEventListener('click', () => {
                if (Object.keys(schedules).length <= 1) {
                    alert('No puedes eliminar el único horario que existe.');
                    return;
                }
                if (confirm(`¿Eliminar el horario "${currentScheduleName}"?`)) {
                    delete schedules[currentScheduleName];
                    currentScheduleName = Object.keys(schedules)[0];
                    populateSelector();
                    renderTable();
                    save();
                }
            });

            page.querySelector('#add-col-btn').addEventListener('click', () => {
                const headerRow = table.querySelector('thead tr');
                const currentHeaders = Array.from(headerRow.cells).map(cell => cell.textContent);
                
                const weekDays = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
                
                let lastDayIndex = -1;
                for (let i = currentHeaders.length - 1; i >= 0; i--) {
                    const header = currentHeaders[i];
                    const index = weekDays.indexOf(header);
                    if (index !== -1) {
                        lastDayIndex = index;
                        break;
                    }
                }

                if (lastDayIndex === -1) { 
                    lastDayIndex = -1;
                }

                if (lastDayIndex === weekDays.length - 1) {
                    alert('La semana solo tiene 7 dias, Haz un Nuevo Horario!');
                    return;
                }

                const nextDay = weekDays[lastDayIndex + 1];

                if (nextDay) {
                    headerRow.insertAdjacentHTML('beforeend', `<th>${nextDay}</th>`);
                    table.querySelectorAll('tbody tr').forEach(row => {
                        row.insertAdjacentHTML('beforeend', `<td contenteditable="true"></td>`);
                    });
                }
            });

            page.querySelector('#remove-col-btn').addEventListener('click', () => {
                const headerRow = table.querySelector('thead tr');
                if (headerRow.cells.length <= 2) return;
                headerRow.lastElementChild.remove();
                table.querySelectorAll('tbody tr').forEach(row => row.lastElementChild.remove());
            });

            page.querySelector('#add-row-btn').addEventListener('click', () => {
                const lastRow = table.querySelector('tbody').lastElementChild;
                if (!lastRow) return; 
                const newRow = lastRow.cloneNode(true);
                const timeCell = newRow.cells[0];
                const lastTime = lastRow.cells[0].textContent.split(' - ')[1];
                
                const [h, m] = lastTime.split(':').map(Number);
                const interval = schedules[currentScheduleName]?.interval || 60;
                
                const nextDate = new Date();
                nextDate.setHours(h, m + interval, 0);

                const format = (d) => d.toTimeString().slice(0, 5);
                timeCell.textContent = `${lastTime} - ${format(nextDate)}`;

                newRow.querySelectorAll('td:not(:first-child)').forEach(cell => cell.textContent = '');
                table.querySelector('tbody').appendChild(newRow);
            });

            page.querySelector('#remove-row-btn').addEventListener('click', () => {
                const body = table.querySelector('tbody');
                if (body.rows.length > 1) {
                    body.lastElementChild.remove();
                }
            });

            page.querySelector('#autogen-modal-btn').addEventListener('click', () => {
                autogenModal.style.display = 'flex';
            });

            autogenModal.querySelector('.close-btn').onclick = () => autogenModal.style.display = 'none';

            autogenForm.addEventListener('submit', e => {
                e.preventDefault();
                const startTime = autogenForm.querySelector('#autogen-start-time').value;
                const endTime = autogenForm.querySelector('#autogen-end-time').value;
                const interval = parseInt(autogenForm.querySelector('#autogen-interval').value);

                if (startTime >= endTime) {
                    alert('La hora de inicio debe ser anterior a la hora de finalización.');
                    return;
                }

                const body = table.querySelector('tbody');
                body.innerHTML = '';
                let currentTime = new Date(`1970-01-01T${startTime}`);
                const endDateTime = new Date(`1970-01-01T${endTime}`);

                while (currentTime < endDateTime) {
                    const nextTime = new Date(currentTime.getTime() + interval * 60000);
                    const timeLabel = `${currentTime.toTimeString().slice(0,5)} - ${nextTime.toTimeString().slice(0,5)}`;
                    const numCols = table.querySelector('thead tr').cells.length;
                    body.innerHTML += `<tr><td>${timeLabel}</td>${'<td contenteditable="true"></td>'.repeat(numCols - 1)}</tr>`;
                    currentTime = nextTime;
                }
                autogenModal.style.display = 'none';
            });
        }

        populateSelector();
        renderTable();
    };

    const initDibujoPage = () => {
        const page = document.getElementById('page-dibujo');
        if (!page) return;

        // Tab switching
        const tabSwitcher = page.querySelector('.tab-switcher');
        if (tabSwitcher) {
            tabSwitcher.addEventListener('click', e => {
                if (e.target.classList.contains('tab-btn')) {
                    const tab = e.target.dataset.tab;
                    page.querySelectorAll('.tab-btn, .tab-content').forEach(el => el.classList.remove('active'));
                    e.target.classList.add('active');
                    page.querySelector(`#${tab}-tab-content`).classList.add('active');
                }
            });
        }

        const initDrawingCrud = () => {
            let drawings = JSON.parse(localStorage.getItem('drawingLog')) || [];
            const save = () => localStorage.setItem('drawingLog', JSON.stringify(drawings));

            const gallery = page.querySelector('#drawing-gallery');
            const modal = page.querySelector('#drawing-modal');
            const form = page.querySelector('#drawing-form');
            const preview = page.querySelector('#drawing-preview');
            const imageInput = page.querySelector('#drawing-image');

            const render = () => {
                gallery.innerHTML = drawings.map(d => `
                    <div class="drawing-card" data-id="${d.id}">
                        <img src="${d.imageUrl}" alt="${d.description}">
                        <div class="drawing-card-content">
                            <p>${d.description.substring(0, 50)}...</p>
                            <small>${new Date(d.date).toLocaleString()}</small>
                        </div>
                        <button class="delete-drawing-btn remove-btn"><img src="Assets/icons/Borrar2.svg" alt="Eliminar" class="icon"></button>
                    </div><button class="delete-drawing-btn remove-btn"><img src="Assets/icons/Borrar2.svg" alt="Eliminar" class="icon"></button>
                `).join('');
            };
            page.querySelector('#add-drawing-btn').addEventListener('click', () => {
                form.reset();
                form.querySelector('#drawing-id').value = '';
                preview.style.display = 'none';
                modal.style.display = 'flex';
            });

            modal.querySelector('.close-btn').onclick = () => modal.style.display = 'none';

            imageInput.addEventListener('change', e => {
                const file = e.target.files[0];
                if (file) {
                    const reader = new FileReader();
                    reader.onload = (event) => { // Usamos FileReader solo para la previsualización
                        preview.src = event.target.result; // Esto es un DataURL
                        preview.style.display = 'block';
                    };
                    reader.readAsDataURL(file);
                }
            });

            form.addEventListener('submit', async (e) => {
                e.preventDefault();
                const imageFile = imageInput.files[0];
                if (!imageFile) {
                    alert('Por favor, selecciona un archivo de imagen válido.');
                    return;
                }
                // Guardamos el archivo como Blob en localForage (IndexedDB)
                const imageId = `drawing_${Date.now()}`;
                await localforage.setItem(imageId, imageFile);

                const newDrawing = {
                    id: imageId, // Usamos el mismo ID para el registro y el archivo
                    description: form.querySelector('#drawing-desc').value,
                    date: new Date().toISOString(),
                    imageUrl: URL.createObjectURL(imageFile) // Creamos una URL temporal para mostrar la imagen
                };
                drawings.unshift(newDrawing);
                save();
                render();
                modal.style.display = 'none';
            });

            gallery.addEventListener('click', async (e) => {
                if (e.target.closest('.delete-drawing-btn')) {
                    const card = e.target.closest('.drawing-card');
                    if (confirm('¿Eliminar este dibujo?')) {
                        const drawingId = card.dataset.id;
                        // Eliminar la entrada del log y el archivo de localForage
                        drawings = drawings.filter(d => d.id != drawingId);
                        await localforage.removeItem(drawingId);
                        save();
                        render();
                    }
                }
            });

            // Al cargar, convertir los blobs guardados a URLs visibles
            const updateImageUrls = async () => {
                for (const drawing of drawings) {
                    const imageBlob = await localforage.getItem(drawing.id);
                    if (imageBlob) {
                        drawing.imageUrl = URL.createObjectURL(imageBlob);
                    }
                }
                render();
            };

            render();
        };

        const initInspirationCrud = () => {
            let inspirations = JSON.parse(localStorage.getItem('inspirationImages')) || [];
            const save = () => localStorage.setItem('inspirationImages', JSON.stringify(inspirations));

            const gallery = page.querySelector('#inspiration-gallery');
            const modal = page.querySelector('#inspiration-modal');
            const form = page.querySelector('#inspiration-form');
            const preview = page.querySelector('#inspiration-preview');
            const imageInput = page.querySelector('#inspiration-image');

            const render = () => {
                gallery.innerHTML = inspirations.map(d => `
                    <div class="drawing-card" data-id="${d.id}">
                        <img src="${d.imageUrl}" alt="${d.name}">
                        <div class="drawing-card-content">
                            <p>${d.name}</p>
                        </div><button class="delete-inspiration-btn remove-btn"><img src="Assets/icons/Borrar2.svg" alt="Eliminar" class="icon"></button>
                    </div>
                `).join('');
            };

            page.querySelector('#add-inspiration-btn').addEventListener('click', () => {
                form.reset();
                form.querySelector('#inspiration-id').value = '';
                preview.style.display = 'none';
                modal.style.display = 'flex';
            });

            modal.querySelector('.close-btn').onclick = () => modal.style.display = 'none';

            imageInput.addEventListener('change', e => {
                const file = e.target.files[0];
                if (file) {
                    const reader = new FileReader();
                    reader.onload = (event) => { // Solo para previsualización
                        preview.src = event.target.result; // DataURL
                        preview.style.display = 'block';
                    };
                    reader.readAsDataURL(file);
                }
            });

            form.addEventListener('submit', async (e) => {
                e.preventDefault();
                const imageFile = imageInput.files[0];
                if (!imageFile) {
                    alert('Por favor, selecciona un archivo de imagen válido.');
                    return;
                }

                const imageId = `inspiration_${Date.now()}`;
                await localforage.setItem(imageId, imageFile);

                const newInspiration = {
                    id: imageId,
                    name: form.querySelector('#inspiration-name').value,
                    imageUrl: URL.createObjectURL(imageFile)
                };
                inspirations.unshift(newInspiration);
                save();
                render();
                modal.style.display = 'none';
            });

            gallery.addEventListener('click', async (e) => {
                if (e.target.closest('.delete-inspiration-btn')) {
                    const card = e.target.closest('.drawing-card');
                    if (confirm('¿Eliminar esta inspiración?')) {
                        const inspirationId = card.dataset.id;
                        inspirations = inspirations.filter(d => d.id != inspirationId);
                        await localforage.removeItem(inspirationId);
                        save();
                        render();
                    }
                }
            });

            const updateInspirationImageUrls = async () => {
                for (const item of inspirations) {
                    const imageBlob = await localforage.getItem(item.id);
                    if (imageBlob) {
                        item.imageUrl = URL.createObjectURL(imageBlob);
                    }
                }
                render();
            };

            render();
        };

        initDrawingCrud();
        initInspirationCrud();
    };

    const initDataManagement = () => {
        const exportBtn = document.getElementById('export-data-btn');
        const importInput = document.getElementById('import-data-input');

        exportBtn.addEventListener('click', () => {
            const data = {};
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                data[key] = localStorage.getItem(key);
            }

            const zip = new JSZip();
            zip.file("productividad_app_backup.json", JSON.stringify(data, null, 2));
            zip.generateAsync({ type: "blob" }).then(content => {
                const link = document.createElement('a');
                link.href = URL.createObjectURL(content);
                link.download = `backup-${new Date().toISOString().split('T')[0]}.zip`;
                link.click();
            });
        });

        importInput.addEventListener('change', e => {
            const file = e.target.files[0];
            if (!file) return;

            JSZip.loadAsync(file).then(zip => {
                const jsonFile = zip.file("productividad_app_backup.json");
                if (!jsonFile) {
                    alert("El archivo .zip no contiene un backup válido (productividad_app_backup.json).");
                    return;
                }
                jsonFile.async("string").then(content => {
                    const importedData = JSON.parse(content);
                    const choice = prompt("Datos de backup cargados. ¿Deseas 'sobrescribir' los datos actuales o 'fusionar' con ellos? Escribe tu elección.").toLowerCase();

                    if (choice === 'sobrescribir') {
                        localStorage.clear();
                        Object.keys(importedData).forEach(key => {
                            localStorage.setItem(key, importedData[key]);
                        });
                        alert("Datos sobrescritos con éxito. La aplicación se recargará.");
                        location.reload();
                    } else if (choice === 'fusionar') {
                        Object.keys(importedData).forEach(key => {
                            // Simple merge: imported data wins if key exists
                            localStorage.setItem(key, importedData[key]);
                        });
                        alert("Datos fusionados con éxito. La aplicación se recargará.");
                        location.reload();
                    } else {
                        alert("Operación cancelada.");
                    }
                });
            }).catch(err => {
                alert("Error al leer el archivo .zip: " + err.message);
            });

            // Reset input
            e.target.value = '';
        });
    };

    // --- Marcadores de posición para futuras páginas ---
    const initEjercicioPage = () => {
        const page = document.getElementById('page-ejercicio');
        if (!page) return;

        // --- State and Data ---
        let routines = JSON.parse(localStorage.getItem('exerciseRoutines')) || [];
        let logbook = JSON.parse(localStorage.getItem('exerciseLogbook')) || [];
        const saveRoutines = () => localStorage.setItem('exerciseRoutines', JSON.stringify(routines, null, 2));
        const saveLogbook = () => localStorage.setItem('exerciseLogbook', JSON.stringify(logbook));

        let mainTimerInterval;
        let mainTimerSeconds = 0;
        let restTimerInterval;
        let restTimerSeconds = 180; // 180 seconds default rest time

        // --- DOM Elements ---
        const sessionView = page.querySelector('#active-session-view');
        const routinesView = page.querySelector('#routine-management-view');
        const logbookView = page.querySelector('#logbook-view');
        const mainTimerDisplay = page.querySelector('#main-timer');
        const startPauseBtn = page.querySelector('#start-pause-btn');
        const endSessionBtn = page.querySelector('#end-session-btn');
        const resetSessionBtn = page.querySelector('#reset-session-btn');
        const routineSelector = page.querySelector('#routine-selector');
        const routineDisplay = page.querySelector('#routine-display');
        const routinesList = page.querySelector('#routines-list');
        const createRoutineBtn = page.querySelector('#create-routine-btn');
        const routineModal = page.querySelector('#routine-modal');
        const routineForm = page.querySelector('#routine-form');
        const restTimerWrapper = page.querySelector('#rest-timer-wrapper');
        const exercisesContainer = routineForm.querySelector('#exercises-container');
        const restTimerDisplay = page.querySelector('#rest-timer');
        const logbookEntries = page.querySelector('#logbook-entries');
        const skipRestBtn = page.querySelector('#skip-rest-btn');
        const restTimeInput = page.querySelector('#rest-time-input');

        if (restTimeInput) {
            restTimeInput.value = localStorage.getItem('restTime') || 180;

            restTimeInput.addEventListener('change', () => {
                localStorage.setItem('restTime', restTimeInput.value);
            });
        }


        // --- View Switching ---
        page.querySelector('.view-switcher').addEventListener('click', e => {
            if (e.target.tagName !== 'BUTTON') return;
            
            page.querySelectorAll('.view-switcher button, .view-content').forEach(el => el.classList.remove('active'));
            e.target.classList.add('active');

            page.querySelector('#progress-view').style.display = 'none';
            sessionView.style.display = 'none';
            routinesView.style.display = 'none';
            logbookView.style.display = 'none';

            if (e.target.id === 'show-session-btn') sessionView.style.display = 'block';
            if (e.target.id === 'show-routines-btn') routinesView.style.display = 'block';
            if (e.target.id === 'show-logbook-btn') logbookView.style.display = 'block';
            if (e.target.id === 'show-progress-btn') {
                page.querySelector('#progress-view').style.display = 'block';
                initProgressView();
            }
        });

        // --- Timer Logic ---
        const formatTime = (seconds) => {
            const h = Math.floor(seconds / 3600).toString().padStart(2, '0');
            const m = Math.floor((seconds % 3600) / 60).toString().padStart(2, '0');
            const s = (seconds % 60).toString().padStart(2, '0');
            return `${h}:${m}:${s}`;
        };

        const updateMainTimer = () => mainTimerDisplay.textContent = formatTime(mainTimerSeconds);

        const startRestTimer = () => {
            restTimerWrapper.style.display = 'flex';
            restTimerSeconds = parseInt(localStorage.getItem('restTime')) || 180;
            restTimerDisplay.textContent = formatTime(restTimerSeconds);
            restTimerInterval = setInterval(() => {
                restTimerSeconds--;
                restTimerDisplay.textContent = formatTime(restTimerSeconds);
                if (restTimerSeconds <= 0) {
                    clearInterval(restTimerInterval);
                    restTimerWrapper.style.display = 'none';
                }
            }, 1000);
        };

        skipRestBtn.addEventListener('click', () => {
            clearInterval(restTimerInterval);
            restTimerWrapper.style.display = 'none';
        });

        routineDisplay.addEventListener('click', (e) => {
            if (e.target.classList.contains('series-checkbox')) {
                if (e.target.checked) {
                    startRestTimer();
                }
            }
        });

        startPauseBtn.addEventListener('click', () => {
            if (mainTimerInterval) { // Pausar
                clearInterval(mainTimerInterval);
                mainTimerInterval = null;
                startPauseBtn.querySelector('img.icon').src = 'Assets/icons/playarrow.svg';
                startPauseBtn.lastChild.textContent = 'Reanudar';
            } else { // Iniciar/Reanudar
                mainTimerInterval = setInterval(() => {
                    mainTimerSeconds++;
                    updateMainTimer();
                }, 1000);
                startPauseBtn.querySelector('img.icon').src = 'Assets/icons/stop.svg';
                startPauseBtn.lastChild.textContent = 'Pausar';
                endSessionBtn.disabled = false;
                resetSessionBtn.disabled = false;
            }
        });

        resetSessionBtn.addEventListener('click', () => {
            if (confirm('¿Reiniciar la sesión? Se perderá el progreso actual.')) {
                clearInterval(mainTimerInterval);
                mainTimerInterval = null;
                mainTimerSeconds = 0;
                updateMainTimer();
                startPauseBtn.querySelector('img.icon').src = 'Assets/icons/playarrow.svg';
                startPauseBtn.lastChild.textContent = 'Iniciar';
                endSessionBtn.disabled = true;
                resetSessionBtn.disabled = true;
                routineDisplay.querySelectorAll('input[type="checkbox"]').forEach(cb => cb.checked = false);
            }
        });

        endSessionBtn.addEventListener('click', () => {
            if (confirm('¿Terminar y guardar la sesión en la bitácora?')) {
                clearInterval(mainTimerInterval);
                const routineId = routineSelector.value;
                const routine = routines.find(r => r.id == routineId);
                
                const completedExercises = [];
                routineDisplay.querySelectorAll('.exercise-item').forEach(exEl => {
                    const checkedSeriesCount = exEl.querySelectorAll('input[type="checkbox"]:checked').length;
                    if (checkedSeriesCount > 0) {
                        const exerciseData = routine.groups
                            .flatMap(g => g.exercises)
                            .find(ex => ex.id == exEl.dataset.exerciseId);

                        completedExercises.push({
                            name: exerciseData.name,
                            sets: checkedSeriesCount,
                            reps: exerciseData.reps,
                            weight: exerciseData.weight,
                            notes: exerciseData.notes
                        });
                    }
                });

                const entry = {
                    id: Date.now(),
                    date: new Date().toISOString(),
                    duration: mainTimerSeconds,
                    routineName: routine ? routine.name : 'Sin rutina',
                    exercises: completedExercises
                };
                logbook.unshift(entry);
                saveLogbook();
                renderLogbook(); // Update the logbook view
                resetSessionBtn.click(); // Resetea el estado
                alert('Sesión guardada en la bitácora.');
            }
        });

        // --- Routine Management (CRUD) ---
        const renderRoutines = () => {
            routinesList.innerHTML = routines.map(r => `
                <div class="card" data-id="${r.id}">
                    <h4>${r.name}</h4>
                    <div class="card-actions">
                        <button class="edit-routine-btn control-btn">Editar</button><button class="delete-routine-btn remove-btn"><img src="Assets/icons/Borrar2.svg" alt="Eliminar" class="icon"></button>
                    </div>
                </div>
            `).join('');
            populateRoutineSelector();
        };

        const populateRoutineSelector = () => {
            routineSelector.innerHTML = '<option value="">Selecciona una rutina...</option>' + routines.map(r => `<option value="${r.id}">${r.name}</option>`).join('');
        };

        createRoutineBtn.addEventListener('click', () => {
            routineForm.reset();
            routineForm.querySelector('#routine-id').value = ''; // Clear ID for creation
            routineForm.querySelector('#exercises-container').innerHTML = '';
            routineModal.style.display = 'flex';
        });

        routinesList.addEventListener('click', e => {
            const card = e.target.closest('.card');
            if (!card) return;
            const id = card.dataset.id;
            if (e.target.closest('.delete-routine-btn')) {
                if (confirm('¿Eliminar esta rutina?')) {
                    routines = routines.filter(r => r.id != id);
                    saveRoutines();
                    renderRoutines();
                }
            } else if (e.target.closest('.edit-routine-btn')) {
                const routine = routines.find(r => r.id == id);
                if (routine) {
                    routineForm.reset();
                    routineForm.querySelector('#routine-id').value = routine.id;
                    routineForm.querySelector('#routine-name').value = routine.name;
                    renderRoutineForm(routine.groups || []);
                    routineModal.style.display = 'flex';
                }
            }
        });

        routineModal.querySelector('.close-btn').onclick = () => routineModal.style.display = 'none';

        // --- Routine Form Logic ---
        const renderRoutineForm = (groups) => {
            exercisesContainer.innerHTML = groups.map((group, groupIndex) => `
                <div class="dynamic-form-group" data-group-index="${groupIndex}">
                    <div class="dynamic-form-group-header">
                        <input type="text" class="muscle-group-name" placeholder="Nombre Grupo Muscular (ej. Pecho)" value="${group.name}" required>
                        <button type="button" class="remove-btn remove-group-btn"><img src="Assets/icons/Borrar2.svg" alt="Eliminar grupo" class="icon"></button>
                    </div>
                    <div class="exercises-list">
                        ${(group.exercises || []).map((ex, exIndex) => `
                            <div class="dynamic-exercise-item" data-exercise-index="${exIndex}">
                                <input type="text" placeholder="Ejercicio" value="${ex.name}" required>
                                <input type="number" placeholder="Series" value="${ex.sets}" required>
                                <input type="text" placeholder="Reps" value="${ex.reps}" required>
                                <input type="number" placeholder="Peso (kg)" value="${ex.weight || ''}">
                                <input type="text" placeholder="Notas" value="${ex.notes || ''}">
                                <button type="button" class="remove-btn remove-exercise-btn"><img src="Assets/icons/Borrar2.svg" alt="Eliminar ejercicio" class="icon"></button>
                            </div>
                        `).join('')}
                    </div>
                    <button type="button" class="control-btn add-exercise-to-group-btn">Añadir Ejercicio</button>
                </div>
            `).join('');
        };

        routineForm.querySelector('#add-exercise-group-btn').addEventListener('click', () => {
            const newGroup = document.createElement('div');
            newGroup.className = 'dynamic-form-group';
            newGroup.innerHTML = `
                <div class="dynamic-form-group-header">
                    <input type="text" class="muscle-group-name" placeholder="Nombre Grupo Muscular (ej. Pecho)" required>
                    <button type="button" class="remove-btn remove-group-btn"><img src="Assets/icons/Borrar2.svg" alt="Eliminar grupo" class="icon"></button>
                </div>
                <div class="exercises-list"></div>
                <button type="button" class="control-btn add-exercise-to-group-btn">Añadir Ejercicio</button>
            `;
            exercisesContainer.appendChild(newGroup);
        });

        exercisesContainer.addEventListener('click', e => {
            if (e.target.closest('.add-exercise-to-group-btn')) {
                const list = e.target.previousElementSibling;
                const newExercise = document.createElement('div');
                newExercise.className = 'dynamic-exercise-item';
                newExercise.innerHTML = `
                    <input type="text" placeholder="Ejercicio" required>
                    <input type="number" placeholder="Series" required>
                    <input type="text" placeholder="Reps" required>
                    <input type="number" placeholder="Peso (kg)">
                    <input type="text" placeholder="Notas">
                    <button type="button" class="remove-btn remove-exercise-btn"><img src="Assets/icons/Borrar2.svg" alt="Eliminar ejercicio" class="icon"></button>
                `;
                list.appendChild(newExercise);
            }
            if (e.target.closest('.remove-group-btn')) e.target.closest('.dynamic-form-group').remove();
            if (e.target.closest('.remove-exercise-btn')) e.target.closest('.dynamic-exercise-item').remove();
        });

        routineForm.addEventListener('submit', e => {
            e.preventDefault();
            const id = routineForm.querySelector('#routine-id').value || Date.now().toString();
            const name = routineForm.querySelector('#routine-name').value;
            const groups = Array.from(exercisesContainer.querySelectorAll('.dynamic-form-group')).map(groupEl => ({
                name: groupEl.querySelector('.muscle-group-name').value,
                exercises: Array.from(groupEl.querySelectorAll('.dynamic-exercise-item')).map(exEl => ({
                    id: Date.now() + Math.random(), // Simple unique ID for session tracking
                    name: exEl.children[0].value,
                    sets: parseInt(exEl.children[1].value),
                    reps: exEl.children[2].value,
                    weight: parseFloat(exEl.children[3].value) || null,
                    notes: exEl.children[4].value
                }))
            }));
            const newRoutine = { id, name, groups };
            const index = routines.findIndex(r => r.id == id);
            if (index > -1) routines[index] = newRoutine;
            else routines.push(newRoutine);
            saveRoutines();
            renderRoutines();
            routineModal.style.display = 'none';
        });

        // --- Active Session ---
        routineSelector.addEventListener('change', () => {
            const routineId = routineSelector.value;
            if (!routineId) {
                routineDisplay.innerHTML = '';
                return;
            }
            const routine = routines.find(r => r.id == routineId);
            renderRoutineForSession(routine);
        });

        const renderRoutineForSession = (routine) => {
            if (!routine) return;
            page.querySelector('#current-routine-name').textContent = routine.name;
            routineDisplay.innerHTML = (routine.groups || []).map(group => `
                <div class="muscle-group-block">
                    <div class="muscle-group-header"><h4>${group.name}</h4></div>
                    <div class="exercise-details">
                        ${(group.exercises || []).map(ex => `
                            <div class="exercise-item" data-exercise-id="${ex.id}" data-exercise-name="${ex.name}">
                                <h5>${ex.name} (${ex.sets}x${ex.reps} ${ex.weight ? `@ ${ex.weight}kg` : ''})</h5>
                                <div class="series-list">
                                    ${Array.from({ length: ex.sets }, (_, i) => `
                                        <div class="series-item">
                                            <input type="checkbox" id="serie-${ex.id}-${i}" class="series-checkbox">
                                            <label for="serie-${ex.id}-${i}">Serie ${i + 1}</label>
                                        </div><button class="control-btn finish-exercise-btn"><img src="Assets/icons/CirculoSeleccionado.svg" alt="" class="icon">Terminar Ejercicio</button>
                                    `).join('')}</div><button class="control-btn finish-exercise-btn"><span class="material-icons-outlined">check_circle</span>Terminar Ejercicio</button>
                            </div>
                        `).join('')}
                    </div>
                </div>
            `).join('');
        };

        // --- Logbook ---
        const renderLogbook = () => {
            logbookEntries.innerHTML = logbook.map(entry => `
                <div class="log-entry" data-id="${entry.id}">
                    <div class="log-entry-header">
                        <div>
                            <strong>${entry.routineName}</strong> - ${new Date(entry.date).toLocaleDateString()}
                        </div>
                        <div class="card-actions">
                            <span>Duración: ${formatTime(entry.duration)}</span><button class="delete-log-btn remove-btn" data-id="${entry.id}"><img src="Assets/icons/delete.svg" alt="Eliminar" class="icon"></button>
                        </div>
                    </div>
                </div>
            `).join('');
        };

        // --- Progress View ---
        let progressChart = null;
        const initProgressView = () => {
            const selector = page.querySelector('#progress-exercise-selector');
            const allExercises = new Set();
            logbook.forEach(entry => {
                (entry.exercises || []).forEach(ex => allExercises.add(ex.name));
            });

            selector.innerHTML = '<option value="">Selecciona...</option>' + 
                Array.from(allExercises).map(exName => `<option value="${exName}">${exName}</option>`).join('');

            selector.onchange = () => renderProgressChart(selector.value);
        };

        const renderProgressChart = (exerciseName) => {
            if (progressChart) {
                progressChart.destroy();
            }
            if (!exerciseName) return;

            const chartData = {
                labels: [],
                weights: []
            };

            // Esta es una simplificación. Una implementación real necesitaría guardar el peso por serie.
            // Por ahora, asumiremos que el peso es el de la plantilla de rutina.
            logbook.forEach(entry => {
                if (entry.exercises.some(ex => ex.name === exerciseName)) {
                    chartData.labels.push(new Date(entry.date).toLocaleDateString());
                    // Aquí necesitaríamos el peso real. Usaremos un valor placeholder.
                    // Para que esto funcione, el peso debe guardarse en el logbook.
                    chartData.weights.push(Math.floor(Math.random() * 20) + 50); // Placeholder
                }
            });

            const ctx = page.querySelector('#progress-chart').getContext('2d');
            progressChart = new Chart(ctx, {
                type: 'line',
                data: {
                    labels: chartData.labels,
                    datasets: [{
                        label: `Peso levantado para ${exerciseName} (kg)`,
                        data: chartData.weights,
                        borderColor: 'var(--accent-color)',
                        tension: 0.1
                    }]
                }
            });
        };

        // Initial calls
        renderRoutines();
        renderLogbook();
    };

    const initNotasPage = () => {
        const page = document.getElementById('page-notas');
        if (!page) return;

        // --- State and Data ---
        let subjects = JSON.parse(localStorage.getItem('academicSubjects')) || [];
        const saveSubjects = () => localStorage.setItem('academicSubjects', JSON.stringify(subjects, null, 2));
        let currentSubjectId = null;

        // --- DOM Elements ---
        const listView = page.querySelector('#subjects-list-view');
        const detailView = page.querySelector('#subject-detail-view');
        const subjectsListEl = page.querySelector('#subjects-list');
        const addSubjectBtn = page.querySelector('#add-subject-btn');
        const subjectModal = page.querySelector('#subject-modal');
        const subjectForm = page.querySelector('#subject-form');
        const backBtn = page.querySelector('#back-to-subjects-btn');
        const gradesListEl = page.querySelector('#grades-list');
        const tasksListEl = page.querySelector('#tasks-list');
        const addGradeBtn = page.querySelector('#add-grade-btn');
        const addTaskBtn = page.querySelector('#add-task-btn');
        const gradeModal = page.querySelector('#grade-modal');
        const taskModal = page.querySelector('#task-modal');
        const gradeForm = page.querySelector('#grade-form');
        const percentagesContainer = page.querySelector('.percentages-container');
        const percentageError = page.querySelector('#percentage-total-error');

        // --- CATEGORY STANDARDIZATION ---
        const CATEGORIES = {
            DAILY: 'daily',
            APPRECIATION: 'appreciation',
            FINAL_EXAM: 'final_exam'
        };
        const categoryKeys = Object.values(CATEGORIES);

        const calculateAverages = (subject) => {
            const isUniversityMode = subject.grades.some(g => g.value > 5);

            const getAverageColor = (average, isUniversity) => {
                if (isUniversity) {
                    if (average <= 61) return "red";
                    if (average >= 71 && average <= 80) return "goldenrod";
                    if (average >= 81 && average <= 90) return "orange";
                    if (average >= 91 && average <= 100) return "green";
                    return "";
                } else {
                    if (average < 3.0) return "darkred";
                    if (average >= 3.0 && average <= 3.9) return "goldenrod";
                    if (average >= 4.1 && average <= 5.0) return "green";
                    return "";
                }
            };

            const categoryAverages = {};
            let finalAverage = 0;

            categoryKeys.forEach(catKey => {
                const grades = subject.grades.filter(g => g.category === catKey);
                const total = grades.reduce((sum, g) => sum + parseFloat(g.value), 0);
                const avg = grades.length > 0 ? total / grades.length : 0;
                categoryAverages[catKey] = avg;

                const avgEl = detailView.querySelector(`#avg-${catKey}`);
                if (avgEl) {
                    avgEl.textContent = avg.toFixed(2);
                    avgEl.style.color = getAverageColor(avg, isUniversityMode);
                }
            });

            const totalPercentage = Object.values(subject.percentages).reduce((sum, val) => sum + Number(val), 0);

            if (Math.round(totalPercentage) === 100) {
                finalAverage = categoryKeys.reduce((sum, catKey) => {
                    const percentage = (subject.percentages[catKey] || 0) / 100;
                    return sum + (categoryAverages[catKey] * percentage);
                }, 0);
            } else {
                const totalAverageSum = categoryKeys.reduce((sum, catKey) => sum + categoryAverages[catKey], 0);
                finalAverage = totalAverageSum / categoryKeys.length;
            }

            const finalAvgEl = detailView.querySelector('#avg-final');
            if (finalAvgEl) {
                finalAvgEl.textContent = finalAverage.toFixed(2);
                finalAvgEl.style.color = getAverageColor(finalAverage, isUniversityMode);
            }
        };

        const renderGrades = (subject) => {
            if (!gradesListEl) return;
            gradesListEl.innerHTML = subject.grades.length === 0 
                ? '<p>No hay calificaciones añadidas.</p>'
                : `<table class="grades-table">
                        <thead>
                            <tr><th>Título</th><th>Nota</th><th>Categoría</th><th>Acciones</th></tr>
                        </thead>
                        <tbody>
                            ${subject.grades.map(g => `
                                <tr data-id="${g.id}">
                                    <td>${g.title}</td>
                                    <td>${g.value}</td>
                                    <td>${page.querySelector(`#grade-category-select option[value='${g.category}']`).textContent}</td>
                                    <td>
                                        <div class="card-actions">
                                            <button class="edit-grade-btn control-btn">Editar</button>
                                            <button class="delete-grade-btn remove-btn"><img src="Assets/icons/Borrar2.svg" alt="Eliminar" class="icon"></button>
                                        </div>
                                    </td>
                                </tr>`).join('')}
                        </tbody>
                    </table>`;
            calculateAverages(subject);
        };

        const validatePercentages = (subject) => {
            if (!percentageError) return true;
            const total = Object.values(subject.percentages).reduce((sum, val) => sum + Number(val), 0);
            percentageError.style.display = Math.round(total) !== 100 ? 'block' : 'none';
            return Math.round(total) === 100;
        };

        const renderSubjectDetails = () => {
            const subject = subjects.find(s => s.id == currentSubjectId);
            if (!subject) {
                showListView();
                return;
            }

            // --- MIGRATION LOGIC ---
            let migrated = false;
            const oldKeys = { Diaria: "daily", Apreciación: "appreciation", Examen_Final: "final_exam", "Examen Final": "final_exam" };
            Object.keys(oldKeys).forEach(oldKey => {
                if (subject.percentages && subject.percentages.hasOwnProperty(oldKey)) {
                    subject.percentages[oldKeys[oldKey]] = subject.percentages[oldKey];
                    delete subject.percentages[oldKey];
                    migrated = true;
                }
            });
            subject.grades.forEach(grade => {
                if (['Diaria', 'Apreciación', 'Examen_Final', 'Examen Final'].includes(grade.category)) {
                    grade.category = oldKeys[grade.category];
                    migrated = true;
                }
            });
            if (migrated) {
                saveSubjects();
            }
            // --- END MIGRATION ---

            const subjectTitle = page.querySelector('#subject-title');
            if (subjectTitle) subjectTitle.textContent = subject.name;
            if (percentagesContainer) {
                percentagesContainer.querySelectorAll('.percentage-input').forEach(input => {
                    input.value = subject.percentages[input.dataset.category] || 0;
                });
            }
            validatePercentages(subject);
            renderGrades(subject);
            // renderTasks(subject); // Assuming tasks are not part of this bug
        };

        const renderSubjects = () => {
            if (!subjectsListEl) return;
            subjectsListEl.innerHTML = subjects.map(s => `
                <div class="card subject-card" data-id="${s.id}">
                    <h4>${s.name}</h4>
                    <button class="delete-subject-btn remove-btn"><img src="Assets/icons/Borrar2.svg" alt="Eliminar" class="icon"></button>
                </div>`).join('') || '<p>Aún no has añadido ninguna materia.</p>';
        };

        const showListView = () => {
            if (detailView) detailView.style.display = 'none';
            if (listView) listView.style.display = 'block';
            currentSubjectId = null;
            renderSubjects();
        };

        const showDetailView = (subjectId) => {
            if (listView) listView.style.display = 'none';
            if (detailView) detailView.style.display = 'block';
            currentSubjectId = subjectId;
            renderSubjectDetails();
        };

        if (!page.dataset.listenersAttached) {
            page.dataset.listenersAttached = 'true';

            backBtn.addEventListener('click', showListView);

            addSubjectBtn.addEventListener('click', () => {
                subjectForm.reset();
                subjectForm.querySelector('#subject-id').value = '';
                subjectModal.style.display = 'flex';
            });

            subjectModal.querySelector('.close-btn').onclick = () => subjectModal.style.display = 'none';

            subjectForm.addEventListener('submit', e => {
                e.preventDefault();
                const name = subjectForm.querySelector('#subject-name-input').value.trim();
                if (!name) return;
                const newSubject = {
                    id: Date.now(),
                    name: name,
                    percentages: { [CATEGORIES.DAILY]: 30, [CATEGORIES.APPRECIATION]: 20, [CATEGORIES.FINAL_EXAM]: 50 },
                    grades: [],
                    tasks: []
                };
                subjects.push(newSubject);
                saveSubjects();
                renderSubjects();
                subjectModal.style.display = 'none';
            });

            subjectsListEl.addEventListener('click', e => {
                const card = e.target.closest('.subject-card');
                if (!card) return;
                const id = card.dataset.id;
                if (e.target.closest('.delete-subject-btn')) {
                    e.stopPropagation();
                    if (confirm('¿Eliminar esta materia y todos sus datos?')) {
                        subjects = subjects.filter(s => s.id != id);
                        saveSubjects();
                        renderSubjects();
                    }
                } else {
                    showDetailView(id);
                }
            });

            percentagesContainer.addEventListener('input', e => {
                if (e.target.classList.contains('percentage-input')) {
                    const subject = subjects.find(s => s.id == currentSubjectId);
                    if (!subject) return;
                    subject.percentages[e.target.dataset.category] = parseInt(e.target.value) || 0;
                    validatePercentages(subject);
                    calculateAverages(subject);
                    saveSubjects();
                }
            });

            addGradeBtn.addEventListener('click', () => {
                gradeForm.reset();
                gradeForm.querySelector('#grade-id').value = '';
                const gradeValueInput = gradeModal.querySelector('#grade-value-input');
                gradeValueInput.max = "5";
                gradeValueInput.min = "1";
                gradeValueInput.step = "0.1";
                gradeModal.querySelector('#university-grade-btn').textContent = "Modo Universitario";
                gradeModal.style.display = 'flex';
            });

            if(gradeModal) {
                const closeBtn = gradeModal.querySelector('.close-btn');
                if(closeBtn) closeBtn.onclick = () => gradeModal.style.display = 'none';

                const universityGradeBtn = gradeModal.querySelector('#university-grade-btn');
                const gradeValueInput = gradeModal.querySelector('#grade-value-input');

                if (universityGradeBtn && gradeValueInput) {
                    universityGradeBtn.addEventListener('click', () => {
                        if (gradeValueInput.max == "5") {
                            gradeValueInput.max = "100";
                            gradeValueInput.min = "0";
                            gradeValueInput.step = "1";
                            universityGradeBtn.textContent = "Modo Normal";
                        } else {
                            gradeValueInput.max = "5";
                            gradeValueInput.min = "1";
                            gradeValueInput.step = "0.1";
                            universityGradeBtn.textContent = "Modo Universitario";
                        }
                    });

                    gradeValueInput.addEventListener('blur', () => {
                        if (gradeValueInput.max === "5") {
                            let value = parseFloat(gradeValueInput.value);
                            if (!isNaN(value)) {
                                if (value > 5 && value <= 50) { // Heuristic for inputs like 20, 35, 50
                                    value = value / 10.0;
                                }
                                gradeValueInput.value = value.toFixed(1);
                            }
                        }
                    });
                }
            }

            gradeForm.addEventListener('submit', e => {
                e.preventDefault();
                const subject = subjects.find(s => s.id == currentSubjectId);
                if (!subject) return;
                const id = gradeForm.querySelector('#grade-id').value;
                const gradeValueInput = gradeForm.querySelector('#grade-value-input');
                let value = parseFloat(gradeValueInput.value);
                if (gradeValueInput.max === "5" && value > 5) {
                    value = value / 10.0;
                }
                const gradeData = {
                    title: gradeForm.querySelector('#grade-title-input').value,
                    value: value.toFixed(1),
                    category: gradeForm.querySelector('#grade-category-select').value,
                };
                if (id) {
                    const index = subject.grades.findIndex(g => g.id == id);
                    subject.grades[index] = { ...subject.grades[index], ...gradeData };
                } else {
                    gradeData.id = Date.now();
                    subject.grades.push(gradeData);
                }
                saveSubjects();
                renderGrades(subject);
                gradeModal.style.display = 'none';
            });

            gradesListEl.addEventListener('click', e => {
                const row = e.target.closest('tr');
                if (!row || !row.dataset.id) return;
                const gradeId = row.dataset.id;
                const subject = subjects.find(s => s.id == currentSubjectId);
                if (!subject) return;
                if (e.target.closest('.delete-grade-btn')) {
                    if (confirm('¿Deseas borrar esta nota?')) {
                        subject.grades = subject.grades.filter(g => g.id != gradeId);
                        saveSubjects();
                        renderGrades(subject);
                    }
                } else if (e.target.closest('.edit-grade-btn')) {
                    const grade = subject.grades.find(g => g.id == gradeId);
                    if (grade) {
                        gradeForm.reset();
                        gradeForm.querySelector('#grade-id').value = grade.id;
                        gradeForm.querySelector('#grade-title-input').value = grade.title;
                        gradeForm.querySelector('#grade-value-input').value = grade.value;
                        gradeForm.querySelector('#grade-category-select').value = grade.category;
                        gradeModal.style.display = 'flex';
                    }
                }
            });
        }
        showListView();
    };

    const initTareasPage = () => {
        const page = document.getElementById('page-tareas');
        if (!page) return;

        let tasks = JSON.parse(localStorage.getItem('globalTasks')) || [];
        const save = () => localStorage.setItem('globalTasks', JSON.stringify(tasks));

        const taskListEl = page.querySelector('#global-tasks-list');
        const modal = page.querySelector('#global-task-modal');
        const form = page.querySelector('#global-task-form');

        const render = () => {
            const now = new Date();
            now.setHours(0, 0, 0, 0); // Normalize to start of day

            tasks.sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));

            taskListEl.innerHTML = tasks.map(t => {
                const dueDate = new Date(t.dueDate + 'T00:00:00'); // Treat date as local
                const daysDiff = (dueDate - now) / (1000 * 60 * 60 * 24);

                let statusClass = 'status-green';
                if (daysDiff < 0 && !t.completed) statusClass = 'status-red'; // Overdue
                else if (daysDiff <= 3 && !t.completed) statusClass = 'status-red';
                else if (daysDiff <= 7 && !t.completed) statusClass = 'status-yellow';

                return `
                    <div class="card task-card ${statusClass} ${t.completed ? 'completed' : ''}" data-id="${t.id}">
                        <div class="status-indicator"></div>
                        <div style="display: flex; align-items: center; gap: 1rem; flex-grow: 1;">
                            <input type="checkbox" class="task-checkbox" ${t.completed ? 'checked' : ''}>
                            <div>
                                <h4>${t.title}</h4>
                                <p>${t.description || ''}</p>
                                <small>Creado: ${new Date(t.creationDate).toLocaleDateString()}</small>
                                <small> | Entrega: ${new Date(t.dueDate + 'T00:00:00').toLocaleDateString()}</small>
                            </div>
                        </div>
                        <div class="card-actions">
                            <button class="edit-task-btn control-btn">Editar</button><button class="delete-task-btn remove-btn"><img src="Assets/icons/Borrar2.svg" alt="Eliminar" class="icon"></button>
                        </div>
                    </div>
                `;
            }).join('') || '<p>¡Todo listo! No hay tareas pendientes.</p>';
        };

        page.querySelector('#add-global-task-btn').addEventListener('click', () => {
            form.reset();
            form.querySelector('#global-task-id').value = '';
            modal.style.display = 'flex';
        });

        modal.querySelector('.close-btn').onclick = () => modal.style.display = 'none';

        form.addEventListener('submit', e => {
            e.preventDefault();
            if (!validateForm(form)) return;

            const id = form.querySelector('#global-task-id').value;
            const taskData = {
                title: form.querySelector('#global-task-title').value,
                description: form.querySelector('#global-task-desc').value,
                dueDate: form.querySelector('#global-task-due-date').value,
                creationDate: new Date().toISOString(),
                completed: false,
            };

            if (id) {
                const index = tasks.findIndex(t => t.id == id);
                tasks[index] = { ...tasks[index], ...taskData };
            } else {
                taskData.id = Date.now();
                tasks.push(taskData);
            }
            save();
            render();
            modal.style.display = 'none';
        });

        taskListEl.addEventListener('click', e => {
            const card = e.target.closest('.task-card');
            if (!card) return;
            const id = card.dataset.id;
            const task = tasks.find(t => t.id == id);

            if (e.target.classList.contains('task-checkbox')) {
                task.completed = e.target.checked;
                save();
                render();
            } else if (e.target.classList.contains('edit-task-btn')) {
                form.reset();
                form.querySelector('#global-task-id').value = task.id;
                form.querySelector('#global-task-title').value = task.title;
                form.querySelector('#global-task-desc').value = task.description;
                form.querySelector('#global-task-due-date').value = task.dueDate;
                modal.style.display = 'flex';
            } else if (e.target.closest('.delete-task-btn')) {
                if (confirm('¿Eliminar esta tarea?')) {
                    tasks = tasks.filter(t => t.id != id);
                    save();
                    render();
                }
            }
        });

        render();
    };

    const initCalendarioPage = () => {
        const page = document.getElementById('page-calendario');
        if (!page) return;

        const monthYearDisplay = page.querySelector('#month-year-display');
        const grid = page.querySelector('#calendar-grid');
        const detailModal = page.querySelector('#day-detail-modal');

        let currentDate = new Date();

        const getActivityData = () => {
            const activityMap = new Map();
            const addActivity = (date, description) => {
                const dateString = new Date(date).toISOString().split('T')[0];
                if (!activityMap.has(dateString)) {
                    activityMap.set(dateString, []);
                }
                activityMap.get(dateString).push(description);
            };

            // Exercise
            (JSON.parse(localStorage.getItem('exerciseLogbook')) || []).forEach(entry => addActivity(entry.date, `Ejercicio: ${entry.routineName}`));
            // Academic Tasks
            (JSON.parse(localStorage.getItem('academicSubjects')) || []).forEach(subject => {
                subject.tasks.forEach(task => {
                    if (task.completed) addActivity(task.dueDate, `Tarea Académica: ${task.title}`);
                });
            });
            // Drawings
            (JSON.parse(localStorage.getItem('drawingLog')) || []).forEach(entry => addActivity(entry.date, 'Nuevo Dibujo'));
            // Food Log
            (JSON.parse(localStorage.getItem('foodLog')) || []).forEach(entry => addActivity(entry.date, 'Registro de Alimentación'));
            // Global Tasks
            (JSON.parse(localStorage.getItem('globalTasks')) || []).forEach(task => {
                if (task.completed) addActivity(task.dueDate, `Tarea Global: ${task.title}`);
            });

            return activityMap;
        };

        const renderCalendar = () => {
            const activityData = getActivityData();
            const year = currentDate.getFullYear();
            const month = currentDate.getMonth();

            monthYearDisplay.textContent = `${currentDate.toLocaleString('es-ES', { month: 'long' })} ${year}`.replace(/^\w/, c => c.toUpperCase());
            grid.innerHTML = '';

            const firstDay = new Date(year, month, 1).getDay();
            const daysInMonth = new Date(year, month + 1, 0).getDate();

            for (let i = 0; i < firstDay; i++) {
                grid.innerHTML += `<div class="calendar-day other-month"></div>`;
            }

            for (let day = 1; day <= daysInMonth; day++) {
                const dayEl = document.createElement('div');
                dayEl.classList.add('calendar-day');
                const dateString = `${year}-${String(month + 1).padStart(2, 0)}-${String(day).padStart(2, 0)}`;
                
                if (activityData.has(dateString)) {
                    dayEl.classList.add('has-activity');
                    dayEl.innerHTML = `<div class="day-number">${day}</div><div class="activity-dot"></div>`;
                    dayEl.addEventListener('click', () => showDayDetails(dateString, activityData.get(dateString)));
                } else {
                    dayEl.innerHTML = `<div class="day-number">${day}</div>`;
                }
                grid.appendChild(dayEl);
            }
        };

        const showDayDetails = (dateString, activities) => {
            detailModal.querySelector('#day-detail-title').textContent = `Actividades del ${new Date(dateString + 'T00:00:00').toLocaleDateString()}`;
            detailModal.querySelector('#day-detail-list').innerHTML = activities.map(act => `<li>${act}</li>`).join('');
            detailModal.style.display = 'flex';
        };

        detailModal.querySelector('.close-btn').onclick = () => detailModal.style.display = 'none';
        page.querySelector('#prev-month-btn').addEventListener('click', () => {
            currentDate.setMonth(currentDate.getMonth() - 1);
            renderCalendar();
        });
        page.querySelector('#next-month-btn').addEventListener('click', () => {
            currentDate.setMonth(currentDate.getMonth() + 1);
            renderCalendar();
        });

        renderCalendar();
    };

        // --- Marcadores de posición para futuras páginas ---
        const initAlimentacionPage = () => {
            const page = document.getElementById('page-alimentacion');
            if (!page) return;

            let foodLog = JSON.parse(localStorage.getItem('foodLog')) || [];
            const save = () => localStorage.setItem('foodLog', JSON.stringify(foodLog));

            const grid = page.querySelector('#food-log-grid');
            const modal = page.querySelector('#food-entry-modal');
            const form = page.querySelector('#food-entry-form');
            const preview = page.querySelector('#image-preview');
            const imageInput = page.querySelector('#food-entry-image');
            const weekPicker = page.querySelector('#week-picker');
            const weekDisplay = page.querySelector('#week-display');
            const clearFilterBtn = page.querySelector('#clear-food-filter-btn');

            const getWeekRange = (date) => {
                const d = new Date(date);
                const day = d.getDay();
                const diff = d.getDate() - day + (day === 0 ? -6 : 1); // adjust when day is sunday
                const startOfWeek = new Date(d.setDate(diff));
                const endOfWeek = new Date(startOfWeek);
                endOfWeek.setDate(startOfWeek.getDate() + 6);
                return { start: startOfWeek, end: endOfWeek };
            };

            const render = (entries) => {
                const groupedByDay = entries.reduce((acc, entry) => {
                    const date = new Date(entry.date).toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
                    if (!acc[date]) {
                        acc[date] = [];
                    }
                    acc[date].push(entry);
                    return acc;
                }, {});

                grid.innerHTML = Object.keys(groupedByDay).map(day => `
                    <div class="day-group">
                        <h3>${day}</h3>
                        <div class="food-entries">
                            ${groupedByDay[day].map(entry => `
                                <div class="drawing-card" data-id="${entry.id}">
                                    ${entry.imageUrl ? `<img src="${entry.imageUrl}" alt="Comida">` : ''}
                                    <div class="drawing-card-content">
                                        <p>${entry.note}</p>
                                        <small>${new Date(entry.date).toLocaleTimeString()}</small>
                                    </div>
                                <button class="delete-food-btn remove-btn"><img src="Assets/icons/Borrar2.svg" alt="Eliminar" class="icon"></button>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                `).join('') || '<p>No hay registros para la semana seleccionada.</p>';
            };

            const filterAndRender = async () => {
                const selectedDate = weekPicker.value ? new Date(weekPicker.value) : new Date();
                const week = getWeekRange(selectedDate);
                weekDisplay.textContent = `Semana del ${week.start.toLocaleDateString()} al ${week.end.toLocaleDateString()}`;

                let filtered = foodLog.filter(entry => {
                    const entryDate = new Date(entry.date);
                    return entryDate >= week.start && entryDate <= week.end;
                });

                // Cargar URLs de las imágenes desde localForage
                for (const entry of filtered) {
                    if (entry.imageId) {
                        const imageBlob = await localforage.getItem(entry.imageId);
                        if (imageBlob) entry.imageUrl = URL.createObjectURL(imageBlob);
                    }
                }

                render(filtered);
            };

            if (weekPicker) {
                weekPicker.addEventListener('change', filterAndRender);
            }
            if (clearFilterBtn) {
                clearFilterBtn.addEventListener('click', () => {
                    if (weekPicker) {
                        weekPicker.value = '';
                    }
                    filterAndRender();
                });
            }

            page.querySelector('#add-food-entry-btn').addEventListener('click', () => {
                form.reset();
                form.querySelector('#food-entry-id').value = '';
                preview.style.display = 'none';
                preview.src = '';
                form.querySelector('#food-entry-date').valueAsDate = new Date();
                modal.style.display = 'flex';
            });

            modal.querySelector('.close-btn').onclick = () => modal.style.display = 'none';

            imageInput.addEventListener('change', e => {
                const file = e.target.files[0];
                if (file) {
                    const reader = new FileReader(); // Solo para previsualización
                    reader.onload = (event) => {
                        preview.src = event.target.result;
                        preview.style.display = 'block';
                    };
                    reader.readAsDataURL(file);
                }
            });

            form.addEventListener('submit', async (e) => {
                e.preventDefault();
                const imageFile = imageInput.files[0];
                let imageId = null;

                if (imageFile) {
                    imageId = `food_${Date.now()}`;
                    await localforage.setItem(imageId, imageFile);
                }

                const newEntry = {
                    id: Date.now(),
                    date: form.querySelector('#food-entry-date').value,
                    note: form.querySelector('#food-entry-note').value,
                    imageId: imageId // Guardamos la referencia al archivo en localForage
                };
                foodLog.unshift(newEntry);
                save();
                filterAndRender();
                modal.style.display = 'none';
            });

            grid.addEventListener('click', async (e) => {
                if (e.target.closest('.delete-food-btn')) {
                    const card = e.target.closest('.drawing-card');
                    if (confirm('¿Eliminar este registro?')) {
                        foodLog = foodLog.filter(entry => entry.id != card.dataset.id);
                        save();
                        filterAndRender();
                    }
                    const entryToDelete = foodLog.find(entry => entry.id == card.dataset.id);
                    if (entryToDelete && entryToDelete.imageId) {
                        await localforage.removeItem(entryToDelete.imageId);
                    }

                }
            });

            filterAndRender();
        };

        // --- 2. Lógica de Navegación y Carga de Páginas ---

        const showPage = (page) => {
            // Resaltar link activo en el sidebar
            navLinks.forEach(link => {
                link.classList.toggle('active', link.dataset.page === page);
            });

            // Ocultar todas las páginas
            document.querySelectorAll('.page-wrapper').forEach(p => {
                p.style.display = 'none';
            });

            // Mostrar la página correcta
            const pageToShow = document.getElementById(`page-${page}`);
            if (pageToShow) pageToShow.style.display = 'block';

            // Ejecutar el inicializador de la página si existe
            if (pageInitializers[page]) pageInitializers[page]();
        };

        const pageInitializers = {
            ajustes: initAjustesPage,
            ingles: initInglesPage,
            ejercicio: initEjercicioPage,
            notas: initNotasPage,
            // Añade marcadores para las otras páginas para evitar errores
            horarios: initHorariosPage,
            dibujo: initDibujoPage,
            alimentacion: initAlimentacionPage,
            tareas: initTareasPage,
            calendario: initCalendarioPage,
        };


        // --- 3. Lógica del Sidebar Responsivo ---

        if (menuToggle && sidebar) {
            menuToggle.addEventListener('click', () => {
                sidebar.classList.toggle('open');
            });
        }

        if (sidebar) {
            sidebar.addEventListener('click', (e) => {
                if (e.target.tagName === 'A' || e.target.closest('a')) {
                    if (window.innerWidth <= 768) {
                        sidebar.classList.remove('open');
                    }
                }
            });
        }

        // --- 4. Helpers Globales y Lógica de Inicialización ---
        const validateForm = (form) => {
            let isValid = true;
            form.querySelectorAll('[required]').forEach(input => {
                input.style.borderColor = '';
                if (!input.value.trim()) {
                    isValid = false;
                    input.style.borderColor = 'red';
                }
            });
            if (!isValid) alert('Por favor, completa los campos marcados en rojo.');
            return isValid;
        };

        // --- Fase 5: Buscador Global ---
        const globalSearchInput = document.getElementById('global-search-input');
        globalSearchInput.addEventListener('input', e => {
            const query = e.target.value.toLowerCase().trim();
            
            document.querySelectorAll('.card, .log-entry, .drawing-card').forEach(item => {
                const textContent = item.textContent.toLowerCase();
                const isVisible = textContent.includes(query);
                item.classList.toggle('search-hidden', !isVisible);
            });
        });


        // --- Ejecución Inicial ---

        applySettings(); // Aplicar tema y color al cargar la app

        // Cargar página según el hash o la primera por defecto
        const path = window.location.pathname;
        const pageName = path.substring(path.lastIndexOf('/') + 1).replace('.html', '');
        const validPages = ['ajustes', 'alimentacion', 'dibujo', 'ejercicio', 'horarios', 'ingles', 'notas', 'tareas', 'calendario'];
        const hashPage = window.location.hash.substring(1);
        const initialPage = hashPage || (validPages.includes(pageName) ? pageName : 'horarios');
        showPage(initialPage);

        // Navegación con los links del sidebar
        navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const page = link.dataset.page;
                window.location.hash = page; // Actualiza la URL para poder recargar en la misma página
                showPage(page);
            });
        });
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new App();
});

// Configuración de localForage para usar IndexedDB preferentemente.
// Esto es el comportamiento por defecto, pero lo hacemos explícito para mayor claridad.
localforage.config({
    driver: [localforage.INDEXEDDB, localforage.WEBSQL, localforage.LOCALSTORAGE],
    name: 'ProductividadApp'
});
