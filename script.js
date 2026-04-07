(function(){
        // ---- состояние приложения ----
        let counter = 0;                // текущее значение счетчика
        let eventLog = [];              // массив для хранения последних сообщений (показываем только последнее)
        
        // DOM элементы
        const counterDisplay = document.getElementById('counterDisplay');
        const incrementBtn = document.getElementById('incrementBtn');
        const decrementBtn = document.getElementById('decrementBtn');
        const resetBtn = document.getElementById('resetBtn');
        const greetBtn = document.getElementById('greetBtn');
        const randomBtn = document.getElementById('randomBtn');
        const clearMsgBtn = document.getElementById('clearMsgBtn');
        const lastMessageSpan = document.getElementById('lastMessage');
        const statusBadge = document.getElementById('statusBadge');

        let miniapp = window.WebApp
        console.log(miniapp.initData)
        
        // вспомогательная функция: обновить отображение счетчика и статус-бейдж
        function updateCounterUI() {
            counterDisplay.innerText = counter;
            // динамический статус (для веселья)
            if (counter === 0) {
                statusBadge.innerText = '⚖️ Нейтрально';
                statusBadge.style.background = '#e2eaf1';
            } else if (counter > 0 && counter < 5) {
                statusBadge.innerText = '📈 Растёт';
                statusBadge.style.background = '#d4e6f1';
            } else if (counter >= 5 && counter < 15) {
                statusBadge.innerText = '🔥 Активный';
                statusBadge.style.background = '#fdebd0';
            } else if (counter >= 15) {
                statusBadge.innerText = '🚀 Космос!';
                statusBadge.style.background = '#f5cba7';
            } else if (counter < 0 && counter > -5) {
                statusBadge.innerText = '📉 Снижение';
                statusBadge.style.background = '#fadbd8';
            } else if (counter <= -5) {
                statusBadge.innerText = '❄️ Минусовая зона';
                statusBadge.style.background = '#d6eaf8';
            } else {
                statusBadge.innerText = 'Активно';
                statusBadge.style.background = '#cae3f2';
            }
        }
        
        // показать сообщение в области последнего действия
        function setMessage(text, isError = false) {
            // можно добавить иконку или стиль в зависимости от типа, но для простоты
            if (isError) {
                lastMessageSpan.innerHTML = `⚠️ ${text}`;
                lastMessageSpan.style.color = '#b33b2c';
            } else {
                lastMessageSpan.innerHTML = `✨ ${text}`;
                lastMessageSpan.style.color = '#2c5a7a';
            }
            // через 3 секунды сбросить цвет (но не стирать текст полностью)
            setTimeout(() => {
                if (lastMessageSpan.innerHTML === `✨ ${text}` || lastMessageSpan.innerHTML === `⚠️ ${text}`) {
                    // если за это время не изменилось, возвращаем легкий оттенок, но текст остаётся
                    lastMessageSpan.style.color = '#2c5a7a';
                }
            }, 2500);
        }
        
        // добавить событие в историю (для демо, но в интерфейсе просто показываем последнее сообщение)
        // но сделаем доп. функцию которая логирует и обновляет сообщение
        function addActionLog(actionName, detail) {
            const timestamp = new Date().toLocaleTimeString([], {hour:'2-digit', minute:'2-digit', second:'2-digit'});
            const logMsg = `[${timestamp}] ${actionName}: ${detail}`;
            // сохраняем последние 5 для внутреннего лога, но в UI показываем только последнее
            eventLog.unshift(logMsg);
            if(eventLog.length > 10) eventLog.pop();
            // отображаем последнее действие в панели
            setMessage(`${actionName} → ${detail}`);
        }
        
        // --- основные действия ---
        function incrementCounter() {
            counter++;
            updateCounterUI();
            addActionLog('Инкремент', `теперь ${counter}`);
            // добавим тактильный отклик (вибрация если поддерживается - необязательно, но интересно)
            if (navigator.vibrate) navigator.vibrate(10);
        }
        
        function decrementCounter() {
            counter--;
            updateCounterUI();
            addActionLog('Декремент', `теперь ${counter}`);
            if (navigator.vibrate) navigator.vibrate(10);
        }
        
        function resetCounter() {
            const oldValue = counter;
            counter = 0;
            updateCounterUI();
            addActionLog('Сброс', `было ${oldValue}, стало 0`);
            if (navigator.vibrate) navigator.vibrate(20);
        }
        
        function showGreeting() {
            const hour = new Date().getHours();
            let greeting = '';
            if (hour < 12) greeting = 'Доброе утро ☀️';
            else if (hour < 18) greeting = 'Добрый день 🌤️';
            else greeting = 'Добрый вечер 🌙';
            addActionLog('Приветствие', `${greeting}! Текущий счетчик = ${counter}`);
        }
        
        function randomNumberAction() {
            const rand = Math.floor(Math.random() * 100) + 1; // 1-100
            addActionLog('Случайное число', `выпало ${rand} (счётчик был ${counter})`);
            // дополнительный эффект: если пользователь хочет, можно предложить добавить это число? но не меняем логику счетчика
            // просто тестовая фича
        }
        
        function clearMessages() {
            eventLog = [];
            setMessage('Лог сообщений очищен 👍');
            lastMessageSpan.style.color = '#2c5a7a';
            // дополнительно меняем статус бейдж не трогаем
        }
        
        // дополнительные тесты: быстрая проверка работы локального хранилища (имитация сохранения состояния)
        // для интереса добавим авто-сохранение счётчика в localStorage при каждом изменении и загрузку при старте
        function saveCounterToLocal() {
            try {
                localStorage.setItem('testMiniApp_counter', counter);
            } catch(e) { /* тихо */ }
        }
        
        function loadCounterFromLocal() {
            try {
                const saved = localStorage.getItem('testMiniApp_counter');
                if(saved !== null && !isNaN(parseInt(saved))) {
                    counter = parseInt(saved);
                    updateCounterUI();
                    setMessage(`Загружено сохранённое значение: ${counter}`, false);
                } else {
                    // начальное значение 0
                    counter = 0;
                    updateCounterUI();
                }
            } catch(e) {
                counter = 0;
                updateCounterUI();
            }
        }
        
        // обертка для сохранения после каждого изменения счётчика
        function persistAndUpdate() {
            updateCounterUI();
            saveCounterToLocal();
        }
        
        // переопределим методы изменения счетчика с сохранением
        // подменим функции чтобы они вызывали сохранение
        const originalIncrement = incrementCounter;
        const originalDecrement = decrementCounter;
        const originalReset = resetCounter;
        
        window.incrementCounter = function() {
            originalIncrement();
            saveCounterToLocal();
        };
        window.decrementCounter = function() {
            originalDecrement();
            saveCounterToLocal();
        };
        window.resetCounter = function() {
            originalReset();
            saveCounterToLocal();
        };
        
        // переназначим, чтобы обработчики вызывали новые версии с сохранением
        incrementBtn.onclick = () => {
            originalIncrement();
            saveCounterToLocal();
        };
        decrementBtn.onclick = () => {
            originalDecrement();
            saveCounterToLocal();
        };
        resetBtn.onclick = () => {
            originalReset();
            saveCounterToLocal();
        };
        greetBtn.onclick = () => showGreeting();
        randomBtn.onclick = () => randomNumberAction();
        clearMsgBtn.onclick = () => clearMessages();
        
        // добавим интересный эффект двойного нажатия? нет, но сделаем так, чтобы при изменении счетчика через UI было полное логирование
        // загружаем данные из localStorage при старте
        loadCounterFromLocal();
        
        // дополнительная инициализация сообщения
        setMessage('Мини-приложение готово! 👾', false);
        
        // добавим проверку окружения: если внутри Telegram WebView или VK Mini Apps - можно оповещать, но для простоты выведем в консоль
        console.log('[MiniAppTest] Приложение загружено, счетчик =', counter);
        
        // мини-фича: показываем подсказку при долгом нажатии на счетчик (сброс? но не будем)
        const counterDiv = document.querySelector('.counter-section');
        counterDiv.addEventListener('dblclick', () => {
            setMessage('🔁 Двойной тап по счётчику — можно сбросить через кнопку', false);
            if (navigator.vibrate) navigator.vibrate(30);
        });
        
        // анимация кнопок для ощущения на мобильных (уже есть актив)
        // добавим динамическое изменение заголовка документа при изменении счетчика (по желанию)
        function updateTitleWithCounter() {
            document.title = counter !== 0 ? `(${counter}) ТестМиниApp` : 'ТестМиниApp';
        }
        // следим за изменением счетчика через перехват обновления UI
        const originalUpdateUI = updateCounterUI;
        window.updateCounterUI = function() {
            originalUpdateUI();
            updateTitleWithCounter();
        };
        updateCounterUI = function() {
            originalUpdateUI();
            updateTitleWithCounter();
        };
        // вызываем для привязки
        updateCounterUI();
        // подменяем ссылки в функциях (небольшой хак для сохранения)
        const boundUpdate = () => {
            updateCounterUI();
            saveCounterToLocal();
        };
        // перезапись глобальных функций для консистентности
        window.incrementCounter = () => {
            originalIncrement();
            saveCounterToLocal();
            updateTitleWithCounter();
        };
        window.decrementCounter = () => {
            originalDecrement();
            saveCounterToLocal();
            updateTitleWithCounter();
        };
        window.resetCounter = () => {
            originalReset();
            saveCounterToLocal();
            updateTitleWithCounter();
        };
        // принудительно синхронизируем обработчики
        incrementBtn.onclick = () => { originalIncrement(); saveCounterToLocal(); updateTitleWithCounter(); };
        decrementBtn.onclick = () => { originalDecrement(); saveCounterToLocal(); updateTitleWithCounter(); };
        resetBtn.onclick = () => { originalReset(); saveCounterToLocal(); updateTitleWithCounter(); };
        
        // последний штрих: если кликнуть по статус-бейджу - покажет случайную шутку
        statusBadge.style.cursor = 'pointer';
        statusBadge.addEventListener('click', () => {
            const jokes = [
                '🐞 Багов не найдено!',
                '🚀 Мини-аппа летает',
                '💡 Счетчик — это классика',
                '🎯 Ты крутой тестировщик',
                '🍕 Пицца одобряет этот код'
            ];
            const randomJoke = jokes[Math.floor(Math.random() * jokes.length)];
            setMessage(randomJoke, false);
            if (navigator.vibrate) navigator.vibrate(15);
        });
        
        // Добавим удобный хоткей: клавиши + / - / 0 для сброса
        window.addEventListener('keydown', (e) => {
            if (e.key === '+' || e.key === '=') {
                e.preventDefault();
                incrementBtn.click();
            } else if (e.key === '-' || e.key === '_') {
                e.preventDefault();
                decrementBtn.click();
            } else if (e.key === '0' || e.key === 'Delete') {
                e.preventDefault();
                resetBtn.click();
            } else if (e.key === 'r' || e.key === 'R') {
                e.preventDefault();
                randomBtn.click();
            } else if (e.key === 'g' || e.key === 'G') {
                e.preventDefault();
                greetBtn.click();
            }
        });
        
        // финальная синхронизация отображения
        updateTitleWithCounter();
    })();