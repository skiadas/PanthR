// Javascript code to do user registration.
function focusHandler(ev, el) {
    // console.log("Focus:", ev, this);
}
function verifyHandler(ev, el) {
    console.log("Verify:", ev, this);
    console.log($(this).next())
    $(this).next().html("Checking availability ...");
    $.ajax({
        url: "checkAvailable",
        data: {
            email: $('#email').val(),
            nick: $('#nick').val()
        }
    }).done(function(data, status, xhr) {
        console.log(data, status, xhr)
    });
}

function checkPassword(password)
{
    var strength = [ "", "Very Weak", "Weak", "Medium", "Strong", "Very Strong" ]
    ,   score = 1;

    if (password.length < 1)
        return strength[0];

    if (password.length < 4)
        return strength[1];

    if (password.length >= 8)
        score++;
    if (password.length >= 10)
        score++;
    if (password.match(/\d+/))
        score++;
    if (password.match(/[a-z]/) && password.match(/[A-Z]/))
        score++;
    if (password.match(/.[!,@,#,$,%,^,&,*,?,_,~,-,£,(,)]/))
        score++;

    return strength[score];
}

function passwordHandler(ev) {
    var el = $(this);
    // We have to wait for the keypress to complete
    setTimeout(function() {
        el.next().html(checkPassword(el.val()));
    }, 10);
}

$(function() {
    $('#submit').attr('disabled', 'disabled');
    $('#nick, #email').focus(focusHandler).change(verifyHandler);
    $('#password').focus(focusHandler).keypress(passwordHandler);
});