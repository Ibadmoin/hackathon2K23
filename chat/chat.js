const editBtn = document.getElementById("editBtn");
const updateBox = document.getElementById("updateBox");
const close = document.getElementById("close");



editBtn.addEventListener("click",(e)=>{
    e.preventDefault();

    updateBox.classList.add("active");
    
})

close.addEventListener("click",()=>{
    
    updateBox.classList.remove("active");
})
