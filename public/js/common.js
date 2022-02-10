$("#postTextarea, #replyTextarea").keyup(function(e){
    let textbox = $(e.target)
    let value = textbox.val().trim()

    let isModal = textbox.parents(".modal").length == 1;
    let submitButton = isModal ? $("#submitReplyButton") : $("#submitPostButton");


    if(submitButton.length == 0) return console.log("No submit button found")
    if(value == 0){
        submitButton.prop("disabled", true)
        return
    }
    submitButton.prop("disabled", false)
});

$("#submitPostButton, #submitReplyButton").click(function(event){
    var button = $(event.target)
    let isModal = button.parents(".modal").length == 1;
    var textbox = isModal ? $("#replyTextarea") : $("#postTextarea");

    var data = {
        content: textbox.val()
    }

    if(isModal){
        let id = button.data().id;
        if(id == null) return console.log("Button id is null");
        data.replyTo = id;
    }
    
    $.post("/api/posts", data, function(postData, status, xhr){
        
        if(postData.replyTo){
            location.reload();
        }else{
            let html = createPostHtml(postData)
            $(".postsContainer").prepend(html)
            textbox.val("")
            button.prop("disabled", true)
        }
    })
    
});

$("#replyModal").on("show.bs.modal", (event)=>{
    var button = $(event.relatedTarget)
    var postId = getPostIdFromElement(button);
    $("#submitReplyButton").data("id", postId);

    $.get("/api/posts/"+postId, function(results){
        outputPosts(results.postData, $("#originalPostContainer"));
    })
    
});

$("#replyModal").on("hidden.bs.modal", () => $("#originalPostContainer").html(""));

$("#deletePostModal").on("show.bs.modal", (event)=>{
    
    var button = $(event.relatedTarget)
    var postId = getPostIdFromElement(button);
    $("#deletePostButton").data("id", postId);
});

$("#deletePostButton").click((event)=>{
    let postId = $(event.target).data("id")

    $.ajax({
        url: `/api/posts/${postId}`,
        type: "DELETE",
        success: (data, status, xhr) => {
            if(xhr.status != 202){
                console.log("Could not delete the post");
                return;
            }
            location.reload();
        }
    })
})

$(document).on("click", ".likeButton", function(event){
    var button = $(event.target)
    var postId = getPostIdFromElement(button);
    if(postId === undefined){
        return 
    }

    $.ajax({
        url: `/api/posts/${postId}/like`,
        type: "PUT",
        success: (postData) => {
            button.find("span").text(postData.likes.length || "");
            if(postData.likes.includes(userLoggedIn._id)){
                button.addClass("active");
            }else{
                button.removeClass("active");
            }
        }
    })


});

$(document).on("click", ".retweetButton", function(event){
    var button = $(event.target)
    var postId = getPostIdFromElement(button);
    if(postId === undefined){
        return 
    }

    $.ajax({
        url: `/api/posts/${postId}/retweet`,
        type: "POST",
        success: (postData) => {
            button.find("span").text(postData.retweetUsers.length || "");
            if(postData.retweetUsers.includes(userLoggedIn._id)){
                button.addClass("active");
            }else{
                button.removeClass("active");
            }
            
        }
    })


});

$(document).on("click", ".post", function(event){
    var element = $(event.target)
    var postId = getPostIdFromElement(element);

    if(postId !== undefined && !element.is("button")){
        window.location.href = '/posts/' + postId;
    }

});

$(document).on("click", ".followButton", function(e){
    let button = $(e.target)
    let userId = button.data().user

    $.ajax({
        url: `/api/users/${userId}/follow`,
        type: "PUT",
        success: (data, status, xhr) => {
            if(xhr.status == 404){
                console.log("Error: User not found");
                return;
            }
            
            var difference = 1;
            if(data.following && data.following.includes(userId)){
                button.addClass("following");
                button.text("Following")
            }else{
                button.removeClass("following");
                button.text("Follow")
                difference = -1;
            }

            let followersLabel = $("#followersValue");
            if(followersLabel.length != 0){
                let followersText = followersLabel.text()
                followersText = parseInt(followersText)
                followersLabel.text(followersText + difference)
            }
            
        }
    })
})

function getPostIdFromElement(element){
    var isRoot = element.hasClass("post")
    var rootElement = isRoot == true ? element : element.closest(".post")
    var postId = rootElement.data().id;

    if(postId === undefined) return console.log("post id undefined");
    return postId;
}

function createPostHtml(postData, largeFont = false){

    //not a problem yet
    if(postData == null) return console.log("post object is null");

    let isRetweet = postData.retweetData !== undefined;
    
    let retweetedBy = isRetweet ? postData.postedBy.username : null;
    //postData = isRetweet ? postData.retweetData : postData;
    
    if (isRetweet) {
        postData = postData.retweetData
    } else {
        postData = postData;
    }
    
    
    let postedBy = postData.postedBy;

    if(postedBy._id === undefined){
        return console.log("User object not populated");
    }


    let displayName = postedBy.firstName + " " + postedBy.lastName;
    let timestamp = timeDifference(new Date(), new Date(postData.createdAt));

    let likeButtonActiveClass = postData.likes.includes(userLoggedIn._id) ? "active" : "";
    let retweetButtonActiveClass = postData.retweetUsers.includes(userLoggedIn._id) ? "active" : "";
    let largeFontClass = largeFont ? "largeFont" : "";

    let retweetText = '';
    if(isRetweet){
        retweetText = `
        <span>
            <i class='fas fa-retweet'></i>
            Retweeted by <a href='/profile/${retweetedBy}'>@${retweetedBy}</a>
        </span>
        `;
    }

    var replyFlag = "";
    if(postData.replyTo && postData.replyTo._id){
        if(!postData.replyTo._id){
            return console.log("Reply to is not populated");
        }else if(!postData.replyTo.postedBy._id){
            return console.log("Posted by is not populated");
        }

        var replyToUsername = postData.replyTo.postedBy.username;
        replyFlag = `<div class='replyFlag'>
                        Replying to <a href='/profile/${replyToUsername}'>@${replyToUsername}</a>
                    </div>`;

    }

    let buttons = "";
    if(postData.postedBy._id == userLoggedIn._id){
        buttons = `<button data-id="${postData._id}" data-toggle="modal" data-target="#deletePostModal"><i class='fas fa-times'></i></button>`;
    }


    return `
        <div class='post ${largeFontClass}' data-id='${postData._id}'>
            <div class='postActionContainer'>
                ${retweetText}
            </div>
            <div class='mainContentContainer'>
                <div class='userImageContainer'>
                    <img src='${postedBy.profilePic}'>
                </div>
                <div class='postContentContainer'>
                    <div class='header'>
                        <a href='/profile/${postedBy.username}' class='displayName'>${displayName}</a>
                        <span class='username'>@${postedBy.username}</span>
                        <span class='date'>${timestamp}</span>
                        ${buttons}
                    </div>
                    ${replyFlag}
                    <div class='postBody'>
                        <span>${postData.content}</span>
                    </div>
                    <div class='postFooter'>
                        <div class='postButtonContainer blue'>
                            <button data-toggle='modal' data-target='#replyModal' class=''>
                                <i class='fas fa-comment'></i>
                            </button>
                        </div>
                        <div class='postButtonContainer green'>
                            <button class='retweetButton ${retweetButtonActiveClass}'>
                                <i class='fas fa-retweet'></i>
                                <span>${postData.retweetUsers.length || ""}</span>
                            </button>
                        </div>
                        <div class='postButtonContainer red'>
                            <button class='likeButton ${likeButtonActiveClass}'>
                                <i class='fas fa-heart'></i>
                                <span>${postData.likes.length || ""}</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
}

function timeDifference(current, previous) {

    var msPerMinute = 60 * 1000;
    var msPerHour = msPerMinute * 60;
    var msPerDay = msPerHour * 24;
    var msPerMonth = msPerDay * 30;
    var msPerYear = msPerDay * 365;

    var elapsed = current - previous;

    if (elapsed < msPerMinute) {
        if(elapsed/1000 < 30){
            return "Just now"
        }
         return Math.round(elapsed/1000) + ' seconds ago';   
    }

    else if (elapsed < msPerHour) {
         return Math.round(elapsed/msPerMinute) + ' minutes ago';   
    }

    else if (elapsed < msPerDay ) {
         return Math.round(elapsed/msPerHour ) + ' hours ago';   
    }

    else if (elapsed < msPerMonth) {
        return Math.round(elapsed/msPerDay) + ' days ago';   
    }

    else if (elapsed < msPerYear) {
        return Math.round(elapsed/msPerMonth) + ' months ago';   
    }

    else {
        return Math.round(elapsed/msPerYear ) + ' years ago';   
    }
}

function outputPosts(results, container){
    container.html("");

    if(!Array.isArray(results)){
        results = [results];
    }

    results.forEach(result => {
        let html = createPostHtml(result)
        container.append(html)
    });

    if(results.length == 0){
        container.append("<span class='noResult'>No results found</span>")
    }
}

function outputPostsWithReplies(results, container){
    container.html("");

    if(results.replyTo !== undefined && results.replyTo._id !== undefined){
        let html = createPostHtml(results.replyTo)
        container.append(html)
    }

    let mainPostHtml = createPostHtml(results.postData, true)
    container.append(mainPostHtml)

    results.replies.forEach(result => {
        let html = createPostHtml(result)
        container.append(html)
    });


    if(results.length == 0){
        container.append("<span class='noResult'>No results found</span>")
    }
}





