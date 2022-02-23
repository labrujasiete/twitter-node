$(document).ready(()=>{
    $.get(`/api/chats/${chatId}`, (data) => {
        $("#chatName").text(getChatName(data))
    })
    $.get(`/api/chats/${chatId}/messages`, (data) => {
        
        let messages = [];

        data.forEach(message => {
            let html = createMessageHtml(message);
            messages.push(html);
        });

        let messagesHtml = messages.join("");
        addMessagesHtmlToPage(messagesHtml);

    })
})

$("#chatNameButton").click(()=>{
    let name = $("#chatNameTextbox").val().trim()
    $.ajax({
        url: "/api/chats/" + chatId,
        type: "PUT",
        data: { chatName: name },
        success: (data, status, xhr) => {
            if(xhr.status != 204){
                console.log("could not update");
            }else{
                location.reload();
            }
        }
    })
})

$(".sendMessageButton").click(()=>{
    messageSubmitted();
})

$(".inputTextbox").keydown((event)=>{
    if(event.which === 13){
        messageSubmitted();
        return false;
    }
})

function addMessagesHtmlToPage(html){
    $(".chatMessages").append(html);
    //todo: scroll to bottom
}

function messageSubmitted(){
    let content = $(".inputTextbox").val().trim();

    if(content != ""){
        sendMessage(content);
        $(".inputTextbox").val("");
    }

}

function sendMessage(content){
    $.post("/api/messages", { content: content, chatId: chatId }, (data, status, xhr) => {
        if(xhr.status != 201){
            console.log("Could not send message");
            $(".inputTextbox").val(content);
            return;
        }
        addChatMessageHtml(data);
    })
}

function addChatMessageHtml(message){
    if(!message || !message._id){
        console.log("message is not valid");
        return;
    }
    let messageDiv = createMessageHtml(message);
    addMessagesHtmlToPage(messageDiv);
}

function createMessageHtml(message){

    let isMine = message.sender._id == userLoggedIn._id;
    let liClassName = isMine ? "mine" : "theirs";

    return `<li class='message ${liClassName}'>
                <div class='messageContainer'>
                    <span class='messageBody'>
                        ${message.content}
                    </span>
                </div>
            </li>`
}