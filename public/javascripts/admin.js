const dbTable = $('.db-table');

// load database data
$(document).ready(() => {
    $.ajax({
        type: 'GET',
        url: '/getUsers'
    }).done((data) => {
    });
});

$('.db-table').on('click', '.delete-element', () => {
    $.ajax({
        type: 'GET',
        url: '/deleteEl',
        data: {user_email: event.target.dataset.id}
    }).done(() => {
        location.reload();
    })
});