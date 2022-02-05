$(document).ready(function(){
    $.get("/api/posts/" + postId, function(results){
        outputPosts(results, $(".postsContainer"))
    })
})

