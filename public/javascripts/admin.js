const dbTable = $('.db-table');

$(document).ready(() => {
    $.ajax({
        type: 'GET',
        url: '/getButtons'
    }).done((data) => {
        dbTable.html(``);
    });
});