document.getElementById('verifyButton').addEventListener('click', function() {
    var button = this;
    if (button.classList.contains('verified')) {
        return; // Кнопка уже в состоянии "Verified", ничего не делаем
    }
    button.classList.add('verified');
    button.textContent = 'Verified';
    // Перенаправление на указанный URL
    setTimeout(function() {
        window.location.href = '';
    }, 300); // Задержка 300 мс для плавного перехода
});
