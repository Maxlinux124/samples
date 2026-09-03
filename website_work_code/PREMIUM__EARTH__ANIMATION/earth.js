// const earth = document.getElementById("earth");

// let rotateX = 0;
// let rotateY = 0;
// let isDragging = false;
// let startX, startY;

// earth.addEventListener("mousedown",(e)=>{
//     isDragging = true;
//     startX = e.clientX;
//     startY = e.clientY;
//     earth.style.cursor = "grabbing";
// });

// document.addEventListener("mouseup",()=>{
//     isDragging = false;
//     earth.style.cursor = "grab";
// });

// document.addEventListener("mousemove",(e)=>{

//     if(!isDragging) return;

//     let deltaX = e.clientX - startX;
//     let deltaY = e.clientY - startY;

//     rotateY += deltaX * 0.5;
//     rotateX -= deltaY * 0.5;

//     earth.style.transform =
//     `rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;

//     startX = e.clientX;
//     startY = e.clientY;
// });

