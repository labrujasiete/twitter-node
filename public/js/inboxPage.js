$(document).ready(()=>{
    $.get("/api/chats", (data, status, xhr) => {
        if(xhr.status == 400){
            console.log("could not get chat list");
        }else{
            outputChatList(data, $(".resultsContainer"));
        }
    });
})

function outputChatList(chatList, container){
    chatList.forEach(chat => {
        let html = createChatHtml(chat);
        container.append(html);
    });

    if(chatList.length == 0){
        container.append("<span class='noResults'>Nothing to show.</span>")
    }
}

function createChatHtml(chatData){
    let chatName = getChatName(chatData); //TODO
    let image = getChatImageElements(chatData); //TODO
    let latestMessage = "This is the latest message.";
    return `<a class='resultListItem' href='/messages/${chatData._id}'>
                ${image}
                <div class='resultsDetailsContainer ellipsis'>
                    <span class='heading ellipsis'>${chatName}</span>
                    <span class='subText ellipsis'>${latestMessage}</span>
                </div>
            </a>`
}

function getChatImageElements(chatData){
    let otherChatUsers = getOtherChatUsers(chatData.users);
    let groupChatClass = "";
    let chatImage = getUserChatImageElement(otherChatUsers[0]);
    if(otherChatUsers.length > 1){
        groupChatClass = "groupChatImage";
        chatImage += getUserChatImageElement(otherChatUsers[1]);
    }
    return `<div class='resultsImageContainer ${groupChatClass}'>${chatImage}</div>`;
}

function getUserChatImageElement(user){
    if(!user || !user.profilePic){
        return console.log("user passed into function is invalid");
    }
    return `<img src='${user.profilePic}'>`;
}