const modal = document.getElementById("video-modal");
const iframe = document.getElementById("modal-iframe");
const closeBtn = document.querySelector(".modal-close");

document.getElementById("btn-inserir-json").addEventListener("click", function () {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".json";

    input.addEventListener("change", function (event) {
        const arquivo = event.target.files[0];
        if (!arquivo) return;

        const reader = new FileReader();
        reader.onload = function (e) {
            const dados = JSON.parse(e.target.result);
            document.querySelector(".title").textContent = dados.titulo;

            const section = document.getElementById("itens-raking");
            section.innerHTML = "";

            const bloco = document.createElement("div");
            bloco.classList.add("retangulo-vertical");

            dados.temas.forEach((tema) => {
                const card = document.createElement("div");
                card.classList.add("tema-card");
                card.id = "movivel";

                let midiaHTML = "";

                if (tema.midia.tipo === "imagem") {

                    midiaHTML = `<img src="${tema.midia.valor}" class="tema-img">`;

                } else if (tema.midia.tipo === "youtube") {

                    midiaHTML = `
                <img 
                    src="https://img.youtube.com/vi/${tema.midia.valor}/hqdefault.jpg"
                    class="tema-img tema-video"
                    data-tipo="youtube"
                    data-id="${tema.midia.valor}"
                >
            `;
                }  else {
                    midiaHTML = `
                        <div class="tema-img tema-link"
                            data-url="${tema.midia.valor}">    
                                🔗
                        </div>
            `;
                }



                card.innerHTML = `
                    ${midiaHTML}
                    <div class="tema-separador"></div>
                    <p class="tema-nome">${tema.nome}</p>
                `;

                bloco.appendChild(card);

                card.querySelectorAll(".tema-video").forEach(el => {
                    el.addEventListener("click", (e) => {
                        e.stopPropagation();
                        abrirModal(el.dataset.tipo, el.dataset.id);
                    });
                });

                card.querySelectorAll(".tema-link").forEach(el => {
                    el.addEventListener("click", (e) => {
                        e.stopPropagation();
                        window.open(el.dataset.url, "_blank");
                    });
                });


            });

            section.appendChild(bloco);
        };

        reader.readAsText(arquivo);
    });

    input.click();
});


console.log(navigator.userAgent);


const container = document.getElementById("itens-raking");

container.addEventListener("mousedown", (e) => {
    const card = e.target.closest(".tema-card");
    if (!card) return;

    e.preventDefault();
    let offsetX = e.clientX - card.getBoundingClientRect().left;
    let offsetY = e.clientY - card.getBoundingClientRect().top;
    let isDown = true;

    card.style.position = "fixed";
    card.style.zIndex = 99999;
    card.style.cursor = "grabbing";

    const onMouseMove = (e) => {
        if (!isDown) return;
        card.style.left = e.clientX - offsetX + "px";
        card.style.top = e.clientY - offsetY + "px";
    };

    const onMouseUp = () => {
        isDown = false;
        card.style.cursor = "grab";
        document.removeEventListener("mousemove", onMouseMove);
        document.removeEventListener("mouseup", onMouseUp);
    };

    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseup", onMouseUp);
});

function abrirModal(tipo, id) {

    if (tipo === "youtube") {
        iframe.src = `https://www.youtube.com/embed/${id}?autoplay=1`;
    }

    if (tipo === "twitter") {
        iframe.src = `https://twitframe.com/show?url=https://twitter.com/i/status/${id}`;
    }

    modal.style.display = "flex";
}

function fecharModal() {
    iframe.src = ""; // para o vídeo/tweet
    modal.style.display = "none";
}

closeBtn.addEventListener("click", fecharModal);

modal.addEventListener("click", (e) => {
    if (e.target === modal) fecharModal();
});
