const buttons = $('.btn-data');
const timerContainer = $('.timer-container');
const buttonInformation = $('.button-information');

$('body').on('click', '.btn-data', () => {
    buttons.attr('disabled', true);
    let total = 20;

    let countdown = () => {
        timerContainer.html(`${total}`);
        if(total < 1) stopCountdown();
        total--;
    }

    let stopCountdown = () => {
        clearInterval(increment);
        timerContainer.empty();
        buttonInformation.empty();
        buttons.attr('disabled', false);
    }

    let increment = setInterval(countdown, 1000);
    let dataId = event.target.dataset.id;
    let dataName = event.target.dataset.name
    $.ajax({
        type: 'GET',
        url: '/increment',
        data: { button_number: dataId }
    }).done((data) => {
        buttonInformation.html(`${dataName} was pressed ${data.button1_number} times`)
    });
});

