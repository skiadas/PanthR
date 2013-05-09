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
             email.hasClass('avail') &&
             nick.hasClass('avail') &&
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
        el.removeClass('avail notavail');
        checkSubmit();
        return;
    }
    el.addClass('checking').removeClass('avail notavail')
      .next().attr('title', 'Checking availability ...');
    
    var field = el.attr('name');
    var data = {};
    data[field] = el.val();
    $.ajax({
        url: "check",
        data: data
    }).done(function(data, status, xhr) {
        if (data.avail) {
            el.addClass('avail').removeClass('notavail checking')
            .next().attr('title', 'Available!');
            ;
        } else {
            el.addClass('notavail').removeClass('avail checking')
              .next().attr('title', 'Taken!');
        }
        checkSubmit();
    });
}

function checkPassword(password)
{
    var strength = [ "", "vweak", "weak", "medium", "strong", "vstrong", "vstrong" ]
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
    var el = $(this)
    ,   tips = {
        "": ""
        , "vweak": "This password is extremely weak and will be broken easily. Try a longer password with more diverse types of characters (e.g. numbers/symbols)."
        , "weak": "This password is fairly weak and will be vulnerable to standard dictionary attacks. Try including more diverse types of characters (e.g. at least one of lowercase/uppercase/numbers/symbols)"
        , "medium": "This password has average security. It is up to you, but we recommend using more types of characters  (e.g. at least one of lowercase/uppercase/numbers/symbols)"
        , "strong": "This password is fairly strong. You could use it, or try for something even more secure by using all 4 character types (lowercase/uppercase/numbers/symbols)"
        , "vstrong": "This is an extremely strong password."
    };
    // We have to wait for the keypress to complete
    setTimeout(function() {
        var strength = checkPassword(el.val())
        el.removeClass("vweak weak medium strong vstrong").addClass(strength)
          .next().attr('title', tips[strength]);
        checkSubmit();
    }, 10);
}

$(function() {
    $('#submit').attr('disabled', 'disabled');
    $('#nick, #email').focus(focusHandler).change(verifyHandler).change();
    $('#password').focus(focusHandler).keypress(passwordHandler);
    // $( document ).tooltip();
});