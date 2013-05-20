function focusHandler() {
    
};
function sendCommand(ev) {
    // console.log(ev, this, $(this).value);
    var val = $(this).val();
    $(this).before('<div class="answer"><div class="answerInput">' 
    + val + '</div><div class="answerOutput empty"></div></div>').val('');
    socket.emit('command', val);
};
function handleReply(data) {
    $('.answerOutput.empty').first().removeClass('empty').html(data);
    // console.log(data, this);
};
$(function() {
    socket = io.connect('http://localhost');
    socket.on('reply', handleReply);
    $('#commandInput').focus(focusHandler).change(sendCommand);
    // $( document ).tooltip();
});
