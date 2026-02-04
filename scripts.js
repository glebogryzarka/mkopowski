<script>
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
        ////////////////////////// GENEROWANIE CIĄGÓW /////////////////////////////////
        ///////////////////////////////////////////////////////////////////////////////
        const button = document.getElementById('generateBtn');
        const resultDiv = document.getElementById('result');

        button.addEventListener('click', () => {
            const checkboxes = document.querySelectorAll('input[type="checkbox"]');
            const selectedValues = [];

            checkboxes.forEach(cb => {
                if (cb.checked) {
                    selectedValues.push(cb.value);
                }
                // Czyścimy zaznaczenie
                cb.checked = false;
            });

            resultDiv.textContent = selectedValues.join(', ');
        });
    </script>
