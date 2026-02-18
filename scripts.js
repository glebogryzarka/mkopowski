        ///////////////////////////////////////////////////////////////////////////////
        //////////////////////////// KOPIOWANIE CECH //////////////////////////////////
        ///////////////////////////////////////////////////////////////////////////////
        const przyciski = document.querySelectorAll('.btn-kopiuj');

        przyciski.forEach(button => {
            button.addEventListener('click', () => {
                // Pobieramy zawartość HTML, a nie tylko tekst
                const tekst = button.parentElement.querySelector('.tekst').innerHTML;
                navigator.clipboard.writeText(tekst).catch(err => {
                    console.error('Błąd kopiowania do schowka:', err);
                });
            });
        });


        let modulesWithComments = [];

        function initModuleList(containerId, listId) {
            const container = document.getElementById(containerId);
            const list = document.getElementById(listId);
            list.innerHTML = '';
            modulesWithComments = [];

            const children = Array.from(container.childNodes);
            let pendingComment = null;

            children.forEach(node => {
                if (node.nodeType === Node.COMMENT_NODE) {
                    pendingComment = node.data.trim();
                } else if (node.nodeType === Node.ELEMENT_NODE) {
                    modulesWithComments.push({
                        element: node,
                        comment: pendingComment
                    });
                    pendingComment = null;
                }
            });

            modulesWithComments.forEach((mod, index) => {
                let labelText = mod.comment || ('Moduł ' + (index + 1));

                const btn = document.createElement('button');
                btn.type = 'button';
                btn.title = "Kliknij, aby skopiować kod modułu";

                // Pobieramy obrazek z modułu
                const imgInModule = mod.element.querySelector('img');
                if (imgInModule) {
                    const img = document.createElement('img');
                    img.src = imgInModule.src;
                    img.alt = imgInModule.alt || '';
                    img.style.display = 'block';
                    img.style.width = '48px'; // możesz dostosować rozmiar
                    btn.appendChild(img);
                }

                // Tekst labela
                btn.appendChild(document.createTextNode(labelText));

                btn.addEventListener('click', () => copyModuleCode(index));

                list.appendChild(btn);
            });

        }

        function copyModuleCode(index) {
            const mod = modulesWithComments[index];
            if (!mod) return;

            let code = '';
            if (mod.comment) {
                code += `<!--${mod.comment}-->\n`;
            }
            code += mod.element.outerHTML;

            navigator.clipboard.writeText(code).catch(err => {
                console.error('Błąd kopiowania do schowka:', err);
            });
        }

        window.onload = () => {
            initModuleList('modulesContainer', 'moduleList');
        };

        ///////////////////////////////////////////////////////////////////////////////
        ////////////////////////// DYNAMICZNE GENEROWANIE CIĄGÓW /////////////////////
        ///////////////////////////////////////////////////////////////////////////////

        const resultDiv = document.getElementById('result');
        const checkboxes = document.querySelectorAll('input[type="checkbox"]');
        const copyBtn = document.getElementById('copyBtn'); // zakładamy, że w HTML jest przycisk Kopiuj

        // Funkcja do aktualizacji wyniku dynamicznie
        function updateResult() {
            const selectedValues = [];
            checkboxes.forEach(cb => {
                if (cb.checked) {
                    selectedValues.push(cb.value);
                }
            });
            resultDiv.textContent = selectedValues.join(', ');
        }

        // Nasłuchujemy zmiany każdego checkboxa
        checkboxes.forEach(cb => {
            cb.addEventListener('change', updateResult);
        });

        // Funkcja kopiowania i czyszczenia
        copyBtn.addEventListener('click', () => {
            if (resultDiv.textContent) {
                navigator.clipboard.writeText(resultDiv.textContent)
                    .then(() => {
                        // Czyścimy zaznaczenia i wynik
                        checkboxes.forEach(cb => cb.checked = false);
                        resultDiv.textContent = '';
                    })
                    .catch(err => {
                        console.error('Błąd przy kopiowaniu: ', err);
                    });
            } else {}
        });

        ///////////////////////////////////////////////////////////////////////////////
        ////////////////////////// AKTUALIZACJA SPECYFIKACJI //////////////////////////
        ///////////////////////////////////////////////////////////////////////////////

        document.getElementById('convertBtn').addEventListener('click', function () {
            const input = document.getElementById('input').value;
            if (!input.trim()) {
                alert('Wklej najpierw HTML tabeli.');
                return;
            }


            const temp = document.createElement('div');
            temp.innerHTML = input;


            let wrapper = temp.querySelector('div.table-responsive');
            let table = wrapper ? wrapper.querySelector('table.table') : temp.querySelector('table.table');
            if (!table) {
                alert('Nie znaleziono tabeli z klasą table.');
                return;
            }


            const sections = [];
            let currentSection = null;


[...table.querySelectorAll('thead, tbody')].forEach(section => {
                if (section.tagName === 'THEAD') {
                    const tr = section.querySelector('tr');
                    if (!tr) return;
                    tr.className = 'thead';
                    currentSection = [tr];
                    sections.push(currentSection);
                } else if (section.tagName === 'TBODY') {
                    const rows = [...section.querySelectorAll('tr')];
                    rows.forEach(r => r.className = 'tbody');
                    if (currentSection) currentSection.push(...rows);
                }
            });


            sections.forEach(sec => {
                if (sec.length > 1) sec[sec.length - 1].classList.add('last');
            });


            // Zachowaj wcięcia z oryginalnego HTML
            const originalLines = input.split('\n');
            const indentMap = new Map();
            originalLines.forEach(line => {
                const trimmed = line.trimStart();
                if (trimmed.startsWith('<tr')) {
                    const indent = line.match(/^\s*/)[0];
                    const key = trimmed.replace(/\s+/g, '');
                    indentMap.set(key, indent);
                }
            });


            table.innerHTML = '';
            sections.forEach(sec => {
                sec.forEach(tr => {
                    const key = tr.outerHTML.replace(/\s+/g, '');
                    const indent = indentMap.get(key) || '';
                    table.appendChild(document.createTextNode(indent));
                    table.appendChild(tr);
                    table.appendChild(document.createTextNode('\n'));
                });
            });


            const resultHTML = wrapper ? wrapper.outerHTML : table.outerHTML;
            document.getElementById('output').value = resultHTML;
        });


        document.getElementById('copySpec').addEventListener('click', function () {
            const output = document.getElementById('output');
            if (!output.value.trim()) {
                alert('Nie ma nic do skopiowania 🙂');
                return;
            }
            output.select();
            document.execCommand('copy');
            alert('Skopiowano do schowka!');
        });