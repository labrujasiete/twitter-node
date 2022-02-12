$(document).ready(function(){
    $.get("/api/posts", { followingOnly: true }, function(results){
        outputPosts(results, $(".postsContainer"))
    })
})

