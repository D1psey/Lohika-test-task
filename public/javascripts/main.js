const buttons = $('.btn-data');
const buttonsContainer = $('.buttons-container');
const timerContainer = $('.timer-container');
const userEmail = $('.hidden-email').attr('value');

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
        buttons.attr('disabled', false);
    }

    let increment = setInterval(countdown, 1000);

    $.ajax({
        type: 'GET',
        url: '/increment',
        data: { button_number: event.target.dataset.id, user_email: userEmail }
    }).done((data) => {
        $('.button1_count').html(data.button1_number);
        $('.button2_count').html(data.button2_number);
        $('.button3_count').html(data.button3_number);
    });
});

