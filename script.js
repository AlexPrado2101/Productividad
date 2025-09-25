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
};
    
    const initAjustesPage = () => {
        const themeSwitch = document.getElementById('theme-switch');
        const colorPalette = document.getElementById('accent-color-palette');

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

        // --- Fase 5: Import/Export ---
        initDataManagement();
    };

    // Tu función existente para la página de inglés
    const initInglesPage = () => {
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

        // --- Flashcard Logic ---
        const flashcardView = inglesContainer.querySelector('#flashcard-view');
        const vocabList = inglesContainer.querySelector('#vocab-list');
        const flashcard = flashcardView.querySelector('.flashcard');
        let currentFlashcardIndex = 0;

        inglesContainer.querySelector('#start-flashcards-btn').addEventListener('click', () => {
            if (data.vocab.length === 0) {
                alert('Añade palabras a tu vocabulario para usar las flashcards.');
                return;
            }
            flashcardView.style.display = 'block';
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
                            <div class="card-actions"><button class="edit-btn control-btn">Editar</button><button class="delete-btn remove-btn"><span class="material-icons-outlined">delete</span></button></div>
                        </div>`).join('');
                } else if (type === 'grammar') { // ... 'resource' type would be handled here
                    html = data.grammar.map(item => `<div class="card" data-id="${item.id}"><h4>${item.title}</h4><p>${item.description}</p><div class="card-actions"><button class="edit-btn control-btn">Editar</button><button class="delete-btn remove-btn"><span class="material-icons-outlined">delete</span></button></div></div>`).join('');
                }
                listEl.innerHTML = html || '<p>No hay entradas.</p>';
            };

            inglesContainer.querySelector(`#add-${type}-btn`).onclick = () => {
                flashcardView.style.display = 'none';
                vocabList.style.display = 'block';
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

            form.onsubmit = e => {
                e.preventDefault();
                if (!validateForm(form)) return;
                
                const idInput = form.querySelector('input[type="hidden"]');
                const id = (idInput ? idInput.value : null) || Date.now().toString();
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
        // setupCrud('resource'); // Resource is more complex
    };
    
    const initHorariosPage = () => {
        let schedules = JSON.parse(localStorage.getItem('schedules')) || {};
        let currentScheduleName = localStorage.getItem('currentSchedule') || 'Mi Horario';

        const save = () => {
            localStorage.setItem('schedules', JSON.stringify(schedules));
            localStorage.setItem('currentSchedule', currentScheduleName);
        };

        const page = document.getElementById('page-horarios');
        const selector = page.querySelector('#schedule-selector');
        const table = page.querySelector('#schedule-table');
        const intervalSelect = page.querySelector('#schedule-interval-select');


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
            intervalSelect.value = scheduleData.interval || 60;

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
            schedules[currentScheduleName] = { headers, rows, interval: intervalSelect.value };
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

        // --- New Functionality ---

        page.querySelector('#add-col-btn').addEventListener('click', () => {
            const headerRow = table.querySelector('thead tr');
            if (headerRow.cells.length >= 8) { // Hora + 7 days
                alert('Máximo 7 días de la semana.');
                return;
            }
            const dayName = prompt('Nombre del nuevo día:', 'Sábado');
            if (dayName) {
                headerRow.insertAdjacentHTML('beforeend', `<th>${dayName}</th>`);
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
            if (!lastRow) return; // No rows to base from
            const newRow = lastRow.cloneNode(true);
            const timeCell = newRow.cells[0];
            const lastTime = lastRow.cells[0].textContent.split(' - ')[1]; // "09:00"
            
            const [h, m] = lastTime.split(':').map(Number);
            const interval = parseInt(intervalSelect.value);
            
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

        page.querySelector('#autogen-btn').addEventListener('click', () => {
            const hours = parseInt(page.querySelector('#autogen-hours-select').value);
            const body = table.querySelector('tbody');
            body.innerHTML = '';
            let startTime = new Date();
            startTime.setHours(8, 0, 0); // Start at 8 AM

            for (let i = 0; i < hours; i++) {
                const endTime = new Date(startTime.getTime() + 60 * 60 * 1000);
                const timeLabel = `${startTime.toTimeString().slice(0,5)} - ${endTime.toTimeString().slice(0,5)}`;
                const numCols = table.querySelector('thead tr').cells.length;
                body.innerHTML += `<tr><td>${timeLabel}</td>${'<td contenteditable="true"></td>'.repeat(numCols - 1)}</tr>`;
                startTime = endTime;
            }
        });

        populateSelector();
        renderTable();
    };

    const initDibujoPage = () => {
        let drawings = JSON.parse(localStorage.getItem('drawingLog')) || [];
        const save = () => localStorage.setItem('drawingLog', JSON.stringify(drawings));

        const page = document.getElementById('page-dibujo');
        const gallery = page.querySelector('#drawing-gallery');
        const modal = page.querySelector('#drawing-modal');
        const form = page.querySelector('#drawing-form');
        const preview = page.querySelector('#drawing-preview');
        const imageInput = page.querySelector('#drawing-image');

        const render = () => {
            gallery.innerHTML = drawings.map(d => `
                <div class="drawing-card" data-id="${d.id}">
                    <img src="${d.imageBase64}" alt="${d.description}">
                    <div class="drawing-card-content">
                        <p>${d.description.substring(0, 50)}...</p>
                        <small>${new Date(d.date).toLocaleString()}</small>
                    </div><button class="delete-drawing-btn remove-btn"><span class="material-icons-outlined">delete</span></button>
                </div>
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
                reader.onload = (event) => {
                    preview.src = event.target.result;
                    preview.style.display = 'block';
                };
                reader.readAsDataURL(file);
            }
        });

        form.addEventListener('submit', e => {
            e.preventDefault();
            // Ensure an image has been selected and loaded
            if (!preview.src || !preview.src.startsWith('data:image')) {
                alert('Por favor, selecciona un archivo de imagen válido.');
                return;
            }
            const newDrawing = {
                id: Date.now(),
                description: form.querySelector('#drawing-desc').value,
                date: new Date().toISOString(),
                imageBase64: preview.src
            };
            drawings.unshift(newDrawing);
            save();
            render();
            modal.style.display = 'none';
        });

        gallery.addEventListener('click', e => {
            if (e.target.classList.contains('delete-drawing-btn')) {
                const card = e.target.closest('.drawing-card');
                if (confirm('¿Eliminar este dibujo?')) {
                    drawings = drawings.filter(d => d.id != card.dataset.id);
                    save();
                    render();
                }
            } else if (e.target.closest('.delete-drawing-btn')) { // For clicks on the icon inside the button
                const card = e.target.closest('.drawing-card');
                if (confirm('¿Eliminar este dibujo?')) {
                    drawings = drawings.filter(d => d.id != card.dataset.id);
                    save();
                    render();
                }
            }
        });

        render();
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
        // --- State and Data ---
        let routines = JSON.parse(localStorage.getItem('exerciseRoutines')) || [];
        let logbook = JSON.parse(localStorage.getItem('exerciseLogbook')) || [];
        const saveRoutines = () => localStorage.setItem('exerciseRoutines', JSON.stringify(routines, null, 2));
        const saveLogbook = () => localStorage.setItem('exerciseLogbook', JSON.stringify(logbook));

        let mainTimerInterval;
        let mainTimerSeconds = 0;
        let restTimerInterval;
        let restTimerSeconds = 0;

        // --- DOM Elements ---
        const page = document.getElementById('page-ejercicio');
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
        const restTimerDisplay = page.querySelector('#rest-timer');
        const logbookEntries = page.querySelector('#logbook-entries');

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

        startPauseBtn.addEventListener('click', () => {
            if (mainTimerInterval) { // Pausar
                clearInterval(mainTimerInterval);
                mainTimerInterval = null;
                startPauseBtn.querySelector('span').textContent = 'play_arrow';
                startPauseBtn.lastChild.textContent = 'Reanudar';
            } else { // Iniciar/Reanudar
                mainTimerInterval = setInterval(() => {
                    mainTimerSeconds++;
                    updateMainTimer();
                }, 1000);
                startPauseBtn.querySelector('span').textContent = 'pause';
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
                startPauseBtn.querySelector('span').textContent = 'play_arrow';
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
                    const checkedSeries = exEl.querySelectorAll('input[type="checkbox"]:checked').length;
                    if (checkedSeries > 0) {
                        completedExercises.push({
                            name: exEl.querySelector('h5').textContent.split('(')[0].trim(),
                            // Aquí podrías guardar más detalles si los campos fueran editables en la sesión
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
                renderLogbook();
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
                        <button class="edit-routine-btn control-btn">Editar</button><button class="delete-routine-btn remove-btn"><span class="material-icons-outlined">delete</span></button>
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
            routineForm.querySelector('#routine-id').value = '';
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
            }
            // Lógica de edición aquí...
        });

        routineModal.querySelector('.close-btn').onclick = () => routineModal.style.display = 'none';

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
                            <div class="exercise-item" data-exercise-id="${ex.id}">
                                <h5>${ex.name} (${ex.sets}x${ex.reps} @ ${ex.weight}kg)</h5>
                                <div class="series-list">
                                    ${Array.from({ length: ex.sets }, (_, i) => `
                                        <div class="series-item">
                                            <input type="checkbox" id="serie-${ex.id}-${i}">
                                            <label for="serie-${ex.id}-${i}">Serie ${i + 1}</label>
                                        </div>
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
                            <span>Duración: ${formatTime(entry.duration)}</span><button class="delete-log-btn remove-btn" data-id="${entry.id}"><span class="material-icons-outlined">delete</span></button>
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
        // --- State and Data ---
        let subjects = JSON.parse(localStorage.getItem('academicSubjects')) || [];
        const saveSubjects = () => localStorage.setItem('academicSubjects', JSON.stringify(subjects, null, 2));
        let currentSubjectId = null;

        // --- DOM Elements ---
        const page = document.getElementById('page-notas');
        const listView = page.querySelector('#subjects-list-view');
        const detailView = page.querySelector('#subject-detail-view');
        const subjectsListEl = page.querySelector('#subjects-list');
        const addSubjectBtn = page.querySelector('#add-subject-btn');
        const subjectModal = page.querySelector('#subject-modal');
        const subjectForm = page.querySelector('#subject-form');
        const backBtn = page.querySelector('#back-to-subjects-btn');
        const gradesTab = page.querySelector('#grades-tab-content');
        const tasksTab = page.querySelector('#tasks-tab-content');
        const gradesListEl = page.querySelector('#grades-list');
        const tasksListEl = page.querySelector('#tasks-list');
        const addGradeBtn = page.querySelector('#add-grade-btn');
        const addTaskBtn = page.querySelector('#add-task-btn');
        const gradeModal = page.querySelector('#grade-modal');
        const taskModal = page.querySelector('#task-modal');

        // --- View Management ---
        const showListView = () => {
            detailView.style.display = 'none';
            listView.style.display = 'block';
            currentSubjectId = null;
            renderSubjects();
        };

        const showDetailView = (subjectId) => {
            listView.style.display = 'none';
            detailView.style.display = 'block';
            currentSubjectId = subjectId;
            renderSubjectDetails();
        };

        backBtn.addEventListener('click', showListView);

        // --- Subject CRUD ---
        const renderSubjects = () => {
            subjectsListEl.innerHTML = subjects.map(s => `
                <div class="card subject-card" data-id="${s.id}">
                    <h4>${s.name}</h4>
                    <button class="delete-subject-btn remove-btn"><span class="material-icons-outlined">delete</span></button>
                </div>
            `).join('') || '<p>Aún no has añadido ninguna materia.</p>';
        };

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
                percentages: { daily: 30, appreciation: 20, final_exam: 50 },
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

        // --- Detail View Logic ---
        const renderSubjectDetails = () => {
            const subject = subjects.find(s => s.id == currentSubjectId);
            if (!subject) {
                showListView();
                return;
            }
            page.querySelector('#subject-title').textContent = subject.name;
            renderGrades(subject);
            renderTasks(subject);
        };

        // --- Grades Logic ---
        const renderGrades = (subject) => {
            // Render list of grades
            gradesListEl.innerHTML = subject.grades.map(g => `
                <div class="card" data-id="${g.id}">
                    <div class="card-content">${g.title}: ${g.value} (${g.category})</div>
                    <div class="card-actions">
                        <button class="delete-grade-btn remove-btn"><span class="material-icons-outlined">delete</span></button>
                    </div>
                </div>
            `).join('');
            calculateAverages(subject);
        };

        const calculateAverages = (subject) => {
            const averages = { daily: 0, appreciation: 0, final_exam: 0 };
            const counts = { daily: 0, appreciation: 0, final_exam: 0 };
            
            subject.grades.forEach(grade => {
                averages[grade.category] += parseFloat(grade.value);
                counts[grade.category]++;
            });

            let finalAverage = 0;
            for (const cat in averages) {
                const avg = counts[cat] > 0 ? (averages[cat] / counts[cat]) : 0;
                gradesTab.querySelector(`#avg-${cat}`).textContent = avg.toFixed(2);
                const percentage = subject.percentages[cat] / 100;
                finalAverage += avg * percentage;
            }
            gradesTab.querySelector('#avg-final').textContent = finalAverage.toFixed(2);
        };

        addGradeBtn.addEventListener('click', () => gradeModal.style.display = 'flex');
        gradeModal.querySelector('.close-btn').onclick = () => gradeModal.style.display = 'none';

        // --- Tasks Logic ---
        const renderTasks = (subject) => {
            const now = new Date();
            tasksListEl.innerHTML = subject.tasks.map(t => {
                const dueDate = new Date(t.dueDate);
                const daysDiff = (dueDate - now) / (1000 * 60 * 60 * 24);
                let statusClass = 'status-green';
                if (daysDiff <= 3) statusClass = 'status-red';
                else if (daysDiff <= 7) statusClass = 'status-yellow';

                return `
                    <div class="card task-card ${statusClass} ${t.completed ? 'completed' : ''}" data-id="${t.id}">
                        <div class="status-indicator"></div><input type="checkbox" ${t.completed ? 'checked' : ''}>
                        <div>
                            <h4>${t.title}</h4>
                            <p>${t.description}</p>
                            <small>Entrega: ${new Date(t.dueDate).toLocaleDateString()}</small>
                        </div>
                        <div class="card-actions">
                            <button class="edit-academic-task-btn control-btn">Editar</button><button class="delete-academic-task-btn remove-btn"><span class="material-icons-outlined">delete</span></button>
                        </div>
                    </div>
                `;
            }).join('');
        };

        addTaskBtn.addEventListener('click', () => taskModal.style.display = 'flex');
        taskModal.querySelector('.close-btn').onclick = () => taskModal.style.display = 'none';

        // Initial call
        showListView();
    };

    const initTareasPage = () => {
        let tasks = JSON.parse(localStorage.getItem('globalTasks')) || [];
        const save = () => localStorage.setItem('globalTasks', JSON.stringify(tasks));

        const page = document.getElementById('page-tareas');
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
                            <button class="edit-task-btn control-btn">Editar</button><button class="delete-task-btn remove-btn"><span class="material-icons-outlined">delete</span></button>
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
                const dateString = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                
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
            let foodLog = JSON.parse(localStorage.getItem('foodLog')) || [];
            const save = () => localStorage.setItem('foodLog', JSON.stringify(foodLog));

            const page = document.getElementById('page-alimentacion');
            const grid = page.querySelector('#food-log-grid');
            const modal = page.querySelector('#food-entry-modal');
            const form = page.querySelector('#food-entry-form');
            const preview = page.querySelector('#image-preview');
            const imageInput = page.querySelector('#food-entry-image');
            const dateFilter = page.querySelector('#food-date-filter');

            const render = (entries = foodLog) => {
                grid.innerHTML = entries.map(entry => `
                    <div class="drawing-card" data-id="${entry.id}">
                        ${entry.imageBase64 ? `<img src="${entry.imageBase64}" alt="Comida">` : ''}
                        <div class="drawing-card-content">
                            <p>${entry.note}</p>
                            <small>${new Date(entry.date).toLocaleDateString()}</small>
                        </div>
                        <button class="delete-food-btn remove-btn"><span class="material-icons-outlined">delete</span></button>
                    </div>
                `).join('') || '<p>No hay registros para la fecha seleccionada.</p>';
            };

            page.querySelector('#add-food-entry-btn').addEventListener('click', () => {
                form.reset();
                form.querySelector('#food-entry-id').value = '';
                preview.style.display = 'none';
                preview.src = '';
                // Set current date in modal
                form.querySelector('#food-entry-date').valueAsDate = new Date();
                modal.style.display = 'flex';
            });

            modal.querySelector('.close-btn').onclick = () => modal.style.display = 'none';

            imageInput.addEventListener('change', e => {
                const file = e.target.files[0];
                if (file) {
                    const reader = new FileReader();
                    reader.onload = (event) => {
                        preview.src = event.target.result;
                        preview.style.display = 'block';
                    };
                    reader.readAsDataURL(file);
                }
            });

            form.addEventListener('submit', e => {
                e.preventDefault();
                const newEntry = {
                    id: Date.now(),
                    date: form.querySelector('#food-entry-date').value,
                    note: form.querySelector('#food-entry-note').value,
                    imageBase64: preview.src.startsWith('data:image') ? preview.src : null
                };
                foodLog.unshift(newEntry);
                save();
                filterAndRender();
                modal.style.display = 'none';
            });

            grid.addEventListener('click', e => {
                if (e.target.closest('.delete-food-btn')) {
                    const card = e.target.closest('.drawing-card');
                    if (confirm('¿Eliminar este registro?')) {
                        foodLog = foodLog.filter(entry => entry.id != card.dataset.id);
                        save();
                        filterAndRender();
                    }
                }
            });

            const filterAndRender = () => {
                const filterDate = dateFilter.value;
                if (filterDate) {
                    const filtered = foodLog.filter(entry => entry.date === filterDate);
                    render(filtered);
                } else {
                    render();
                }
            };

            dateFilter.addEventListener('input', filterAndRender);
            page.querySelector('#clear-food-filter-btn').addEventListener('click', () => {
                dateFilter.value = '';
                render();
            });

            render(); // Initial render
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

        menuToggle.addEventListener('click', () => {
            sidebar.classList.toggle('open');
        });

        sidebar.addEventListener('click', (e) => {
            if (e.target.tagName === 'A' || e.target.closest('a')) {
                if (window.innerWidth <= 768) {
                    sidebar.classList.remove('open');
                }
            }
        });

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
        const initialPage = window.location.hash.substring(1) || 'ejercicio';
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
