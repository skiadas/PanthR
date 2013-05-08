// Javascript code to do user registration.
function focusHandler(ev, el) {
    // console.log("Focus:", ev, this);
}
function checkSubmit() {
    var email = $('#email')
    ,   nick = $('#nick')
    ,   password = $('#password')
    ,   submit = $('#submit')
    ,   ok = email.val() && 
             nick.val() &&
             email.next().hasClass('avail') &&
             nick.next().hasClass('avail') &&
             password.val().length > 4;
    // console.log(email.val(), nick.val(), email.next(), nick.next(), password.val());
    if (ok) {
        submit.removeAttr('disabled');
    } else {
        submit.attr('disabled', 'disabled');
    }
}
function verifyHandler(ev, el) {
    var el = $(this);
    if (!el.val()) {
        // Empty string, nothing to search for
        el.next().html("").removeClass('avail notavail');
        checkSubmit();
        return;
    }
    el.next().html("Checking availability ...");
    var field = el.attr('name');
    var data = {};
    data[field] = el.val();
    $.ajax({
        url: "check",
        data: data
    }).done(function(data, status, xhr) {
        if (data.avail) {
            el.next().html("Available!").addClass('avail').removeClass('notavail');
        } else {
            el.next().html("Not Available!").addClass('notavail').removeClass('avail');
        }
        checkSubmit();
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
        checkSubmit();
    }, 10);
}

$(function() {
    $('#submit').attr('disabled', 'disabled');
    $('#nick, #email').focus(focusHandler).change(verifyHandler).change();
    $('#password').focus(focusHandler).keypress(passwordHandler);
});