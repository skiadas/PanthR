// Javascript code to do user registration.
function focusHandler(ev, el) {
    // console.log("Focus:", ev, this);
}
function checkSubmit() {
    var email = $('#email')
    ,   password = $('#password')
    ,   submit = $('#submit')
    ,   ok = email.val() && 
             password.val();
    // console.log(email.val(), nick.val(), email.next(), nick.next(), password.val());
    if (ok) {
        submit.removeAttr('disabled');
    } else {
        submit.attr('disabled', 'disabled');
    }
}
function verifyHandler(ev, el) {
    checkSubmit();
}

$(function() {
    $('#submit').attr('disabled', 'disabled');
    $('#email, #password').focus(focusHandler).keypress(verifyHandler);
    // $( document ).tooltip();
});