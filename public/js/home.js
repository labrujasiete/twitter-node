$(document).ready(function(){
    $.get("/api/posts", function(results){
        outputPosts(results, $(".postsContainer"))
    })
})

