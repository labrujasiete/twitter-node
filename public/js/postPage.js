$(document).ready(function(){
    $.get("/api/posts/" + postId, function(results){
        outputPostsWithReplies(results, $(".postsContainer"))
    })
})

