$(document).ready(()=>{
    $.get(`/api/chats/${chatId}`, (data) => {
        $("#chatName").text(getChatName(data))
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

function messageSubmitted(){
    console.log("submitted");
}