// Ждем полной загрузки DOM
document.addEventListener('DOMContentLoaded', () => {
    console.log('%c=== MAX Bridge Demo App Started ===', 'color: #667eea; font-size: 16px; font-weight: bold');
    
    // Проверяем доступность WebApp
    let webAppAvailable = false;
    
    function logToConsole(message, type = 'info') {
        const timestamp = new Date().toLocaleTimeString();
        const styles = {
            info: 'color: #4ec9b0',
            warning: 'color: #ce9178',
            error: 'color: #f48771',
            success: 'color: #6a9955'
        };
        console.log(`%c[${timestamp}] ${message}`, styles[type] || styles.info);
    }
    
    function addToLog(message, type = 'info') {
        const logContainer = document.getElementById('logContainer');
        const timestamp = new Date().toLocaleTimeString();
        const logEntry = document.createElement('div');
        logEntry.className = 'log-entry';
        logEntry.innerHTML = `<span class="log-time">[${timestamp}]</span> <span class="log-${type}">${message}</span>`;
        logContainer.insertBefore(logEntry, logContainer.firstChild);
        
        // Ограничиваем количество записей
        while (logContainer.children.length > 50) {
            logContainer.removeChild(logContainer.lastChild);
        }
    }
    
    function updateBridgeStatus(available) {
        const statusEl = document.getElementById('bridgeStatus');
        if (available) {
            statusEl.textContent = '✅ MAX Bridge подключен';
            statusEl.style.background = 'rgba(72, 187, 120, 0.3)';
            addToLog('MAX Bridge успешно инициализирован', 'success');
            logToConsole('MAX Bridge успешно инициализирован', 'success');
        } else {
            statusEl.textContent = '⚠️ MAX Bridge НЕ ДОСТУПЕН (работа вне MAX)';
            statusEl.style.background = 'rgba(237, 137, 54, 0.3)';
            addToLog('ВНИМАНИЕ: MAX Bridge не доступен. Некоторые функции могут не работать', 'warning');
            logToConsole('MAX Bridge не доступен. Приложение работает вне среды MAX', 'warning');
        }
    }
    
    // Функция безопасного вызова методов WebApp
    async function callWebAppMethod(methodName, ...args) {
        if (!window.WebApp || !window.WebApp[methodName]) {
            const msg = `Метод ${methodName} недоступен (WebApp отсутствует или метод не существует)`;
            addToLog(msg, 'error');
            logToConsole(msg, 'error');
            return null;
        }
        
        try {
            logToConsole(`Вызов ${methodName} с аргументами:`, 'info');
            console.log(args);
            const result = await window.WebApp[methodName](...args);
            logToConsole(`Результат ${methodName}:`, 'success');
            console.log(result);
            addToLog(`✅ ${methodName} выполнен успешно`, 'success');
            return result;
        } catch (error) {
            const errorMsg = `Ошибка в ${methodName}: ${error.message || error}`;
            addToLog(`❌ ${errorMsg}`, 'error');
            logToConsole(errorMsg, 'error');
            console.error(error);
            return null;
        }
    }
    
    // Отображение информации о пользователе
    function displayUserInfo() {
        if (!window.WebApp || !window.WebApp.initDataUnsafe) {
            document.getElementById('userInfo').innerHTML = '<div class="info-item">Данные пользователя недоступны (вне MAX)</div>';
            addToLog('Данные пользователя не доступны', 'warning');
            return;
        }
        
        const data = window.WebApp.initDataUnsafe;
        const user = data.user || {};
        const chat = data.chat || {};
        
        const infoHtml = `
            <div class="info-item"><strong>🆔 User ID:</strong> ${user.id || 'N/A'}</div>
            <div class="info-item"><strong>👤 Имя:</strong> ${user.first_name || 'N/A'} ${user.last_name || ''}</div>
            <div class="info-item"><strong>📛 Username:</strong> ${user.username || 'N/A'}</div>
            <div class="info-item"><strong>🌐 Язык:</strong> ${user.language_code || 'N/A'}</div>
            <div class="info-item"><strong>📱 Платформа:</strong> ${window.WebApp.platform || 'N/A'}</div>
            <div class="info-item"><strong>🔢 Версия MAX:</strong> ${window.WebApp.version || 'N/A'}</div>
            <div class="info-item"><strong>💬 Chat ID:</strong> ${chat.id || 'N/A'}</div>
            <div class="info-item"><strong>📝 Тип чата:</strong> ${chat.type || 'N/A'}</div>
            <div class="info-item"><strong>🔑 Query ID:</strong> ${data.query_id || 'N/A'}</div>
        `;
        document.getElementById('userInfo').innerHTML = infoHtml;
        addToLog('Информация о пользователе загружена', 'success');
        logToConsole('Информация о пользователе:', 'info');
        console.log('User Data:', user);
        console.log('Full initDataUnsafe:', data);
    }
    
    // Инициализация Bridge и обработчиков событий
    function initBridge() {
        if (window.WebApp) {
            webAppAvailable = true;
            updateBridgeStatus(true);
            
            // Сообщаем о готовности приложения
            window.WebApp.ready();
            addToLog('Отправлено событие ready()', 'success');
            logToConsole('Вызван метод ready() - приложение готово к работе', 'success');
            
            // Отображаем информацию о пользователе
            displayUserInfo();
            
            // Подписываемся на события через onEvent
            if (window.WebApp.onEvent) {
                logToConsole('Настройка обработчиков событий...', 'info');
                
                // Пример подписки на событие нажатия кнопки "Назад"
                window.WebApp.onEvent('backButtonClicked', () => {
                    addToLog('Событие: нажата кнопка "Назад"', 'info');
                    logToConsole('Событие: backButtonClicked', 'info');
                });
                
                addToLog('Обработчики событий настроены', 'success');
            }
            
            // Отображаем версию в футере
            document.getElementById('versionInfo').innerHTML = `MAX Bridge v${window.WebApp.version || 'unknown'} | Платформа: ${window.WebApp.platform || 'unknown'}`;
        } else {
            webAppAvailable = false;
            updateBridgeStatus(false);
            document.getElementById('userInfo').innerHTML = '<div class="info-item">⚠️ MAX Bridge не обнаружен. Приложение запущено вне MAX.</div>';
            document.getElementById('versionInfo').innerHTML = 'MAX Bridge Demo (оффлайн режим)';
        }
    }
    
    // --- Обработчики кнопок ---
    
    // 1. Кнопка "Назад"
    document.getElementById('showBackBtn')?.addEventListener('click', () => {
        if (window.WebApp?.BackButton) {
            window.WebApp.BackButton.show();
            window.WebApp.BackButton.onClick(() => {
                addToLog('Нажата системная кнопка "Назад"', 'info');
                logToConsole('Пользователь нажал кнопку "Назад"', 'info');
            });
            addToLog('Кнопка "Назад" показана', 'success');
        } else {
            addToLog('BackButton недоступен', 'error');
        }
    });
    
    document.getElementById('hideBackBtn')?.addEventListener('click', () => {
        if (window.WebApp?.BackButton) {
            window.WebApp.BackButton.hide();
            addToLog('Кнопка "Назад" скрыта', 'success');
        }
    });
    
    // 2. Навигация
    document.getElementById('openLinkBtn')?.addEventListener('click', () => {
        const url = 'https://www.google.com';
        callWebAppMethod('openLink', url);
    });
    
    document.getElementById('openMaxLinkBtn')?.addEventListener('click', () => {
        const url = 'https://max.ru';
        callWebAppMethod('openMaxLink', url);
    });
    
    document.getElementById('closeAppBtn')?.addEventListener('click', () => {
        addToLog('Закрытие приложения...', 'warning');
        callWebAppMethod('close');
    });
    
    // 3. Шеринг
    document.getElementById('shareContentBtn')?.addEventListener('click', () => {
        const text = document.getElementById('shareText').value;
        const link = document.getElementById('shareLink').value;
        callWebAppMethod('shareContent', text, link);
    });
    
    document.getElementById('shareMaxBtn')?.addEventListener('click', () => {
        const text = document.getElementById('shareText').value;
        const link = document.getElementById('shareLink').value;
        callWebAppMethod('shareMaxContent', { text, link });
    });
    
    // 4. Haptic Feedback
    const hapticStyles = ['soft', 'light', 'medium', 'heavy', 'rigid'];
    hapticStyles.forEach(style => {
        document.getElementById(`haptic${style.charAt(0).toUpperCase() + style.slice(1)}`)?.addEventListener('click', () => {
            if (window.WebApp?.HapticFeedback) {
                window.WebApp.HapticFeedback.impactOccurred(style);
                addToLog(`Haptic: ${style} вибрация`, 'info');
                logToConsole(`Haptic impact: ${style}`, 'info');
            }
        });
    });
    
    document.getElementById('hapticSuccess')?.addEventListener('click', () => {
        if (window.WebApp?.HapticFeedback) {
            window.WebApp.HapticFeedback.notificationOccurred('success');
            addToLog('Haptic: уведомление об успехе', 'success');
        }
    });
    
    document.getElementById('hapticWarning')?.addEventListener('click', () => {
        if (window.WebApp?.HapticFeedback) {
            window.WebApp.HapticFeedback.notificationOccurred('warning');
            addToLog('Haptic: предупреждение', 'warning');
        }
    });
    
    document.getElementById('hapticError')?.addEventListener('click', () => {
        if (window.WebApp?.HapticFeedback) {
            window.WebApp.HapticFeedback.notificationOccurred('error');
            addToLog('Haptic: ошибка', 'error');
        }
    });
    
    document.getElementById('hapticSelection')?.addEventListener('click', () => {
        if (window.WebApp?.HapticFeedback) {
            window.WebApp.HapticFeedback.selectionChanged();
            addToLog('Haptic: изменение выбора', 'info');
        }
    });
    
    // 5. Функции устройства
    document.getElementById('requestPhoneBtn')?.addEventListener('click', async () => {
        const phone = await callWebAppMethod('requestContact');
        if (phone) {
            addToLog(`Получен номер телефона: ${phone}`, 'success');
        }
    });
    
    document.getElementById('scanQrBtn')?.addEventListener('click', async () => {
        const result = await callWebAppMethod('openCodeReader', true);
        if (result) {
            addToLog(`QR-код отсканирован: ${result}`, 'success');
        }
    });
    
    document.getElementById('downloadFileBtn')?.addEventListener('click', () => {
        const url = document.getElementById('downloadUrl').value;
        const fileName = document.getElementById('downloadName').value;
        callWebAppMethod('downloadFile', url, fileName);
    });
    
    // 6. Яркость экрана
    document.getElementById('maxBrightnessBtn')?.addEventListener('click', () => {
        callWebAppMethod('requestScreenMaxBrightness');
    });
    
    document.getElementById('restoreBrightnessBtn')?.addEventListener('click', () => {
        callWebAppMethod('restoreScreenBrightness');
    });
    
    // 7. Защита экрана
    document.getElementById('enableScreenCaptureBtn')?.addEventListener('click', async () => {
        if (window.WebApp?.ScreenCapture) {
            window.WebApp.ScreenCapture.enableScreenCapture();
            const status = window.WebApp.ScreenCapture.isScreenCaptureEnabled;
            document.getElementById('screenCaptureStatus').textContent = `Статус: ${status ? 'ЗАПРЕЩЕНО' : 'РАЗРЕШЕНО'}`;
            addToLog(`Скриншоты/запись: ${status ? 'запрещены' : 'разрешены'}`, 'warning');
        }
    });
    
    document.getElementById('disableScreenCaptureBtn')?.addEventListener('click', async () => {
        if (window.WebApp?.ScreenCapture) {
            window.WebApp.ScreenCapture.disableScreenCapture();
            const status = window.WebApp.ScreenCapture.isScreenCaptureEnabled;
            document.getElementById('screenCaptureStatus').textContent = `Статус: ${status ? 'ЗАПРЕЩЕНО' : 'РАЗРЕШЕНО'}`;
            addToLog(`Скриншоты/запись: ${status ? 'запрещены' : 'разрешены'}`, 'info');
        }
    });
    
    // 8. Подтверждение закрытия
    document.getElementById('enableConfirmBtn')?.addEventListener('click', () => {
        callWebAppMethod('enableClosingConfirmation');
    });
    
    document.getElementById('disableConfirmBtn')?.addEventListener('click', () => {
        callWebAppMethod('disableClosingConfirmation');
    });
    
    // 9. DeviceStorage (только в приложении)
    document.getElementById('storageSetBtn')?.addEventListener('click', async () => {
        const key = document.getElementById('storageKey').value;
        const value = document.getElementById('storageValue').value;
        if (window.WebApp?.DeviceStorage) {
            await window.WebApp.DeviceStorage.setItem(key, value);
            document.getElementById('storageResult').textContent = `Сохранено: ${key} = ${value}`;
            addToLog(`DeviceStorage: сохранено ${key}=${value}`, 'success');
        } else {
            addToLog('DeviceStorage недоступен (работает только в приложении MAX)', 'error');
        }
    });
    
    document.getElementById('storageGetBtn')?.addEventListener('click', async () => {
        const key = document.getElementById('storageKey').value;
        if (window.WebApp?.DeviceStorage) {
            const value = await window.WebApp.DeviceStorage.getItem(key);
            document.getElementById('storageResult').textContent = `Получено: ${key} = ${value || 'не найдено'}`;
            addToLog(`DeviceStorage: получено ${key}=${value}`, 'info');
        }
    });
    
    document.getElementById('storageRemoveBtn')?.addEventListener('click', async () => {
        const key = document.getElementById('storageKey').value;
        if (window.WebApp?.DeviceStorage) {
            await window.WebApp.DeviceStorage.removeItem(key);
            document.getElementById('storageResult').textContent = `Удалено: ${key}`;
            addToLog(`DeviceStorage: удалено ${key}`, 'warning');
        }
    });
    
    document.getElementById('storageClearBtn')?.addEventListener('click', async () => {
        if (window.WebApp?.DeviceStorage) {
            await window.WebApp.DeviceStorage.clear();
            document.getElementById('storageResult').textContent = 'Хранилище очищено';
            addToLog('DeviceStorage: всё хранилище очищено', 'warning');
        }
    });
    
    // 10. Очистка лога
    document.getElementById('clearLogBtn')?.addEventListener('click', () => {
        const logContainer = document.getElementById('logContainer');
        logContainer.innerHTML = '<div class="log-entry">Лог очищен</div>';
        addToLog('Лог очищен пользователем', 'info');
        console.clear();
        logToConsole('Консоль и лог очищены', 'warning');
    });
    
    // Запуск инициализации
    initBridge();
    
    // Дополнительная информация в консоли о доступных методах
    if (window.WebApp) {
        logToConsole('Доступные методы WebApp:', 'success');
        console.log(Object.keys(window.WebApp));
    }
});