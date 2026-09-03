const steps = document.querySelectorAll('.step');
const contents = document.querySelectorAll('.content');
const progress = document.querySelector('.progress-line');

function updateProgress(index){

    const total = steps.length - 1;
    const width = (index / total) * 100;

    progress.style.width = width + '%';
}

steps.forEach((step,index)=>{

    step.addEventListener('click',()=>{

        steps.forEach(item=>{
            item.classList.remove('active');
        });

        contents.forEach(item=>{
            item.classList.remove('active');
        });

        step.classList.add('active');

        document
        .getElementById(`content-${step.dataset.step}`)
        .classList.add('active');

        updateProgress(index);

    });

});

updateProgress(0);