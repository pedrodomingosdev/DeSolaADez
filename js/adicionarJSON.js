let totalTemas = 0;

document.getElementById("btn-add-tema").addEventListener("click", function () {

    if (totalTemas >= 29) return;

    totalTemas++;

    const container = document.getElementById("temas-container");

    const bloco = document.createElement("fieldset");
    bloco.classList.add("tema-bloco");

    bloco.innerHTML = `
    <div class="toggle-group">
        <input type="radio" id="tipo-imagem-${totalTemas}" name="tipo-midia-${totalTemas}" value="imagem" checked>
        <label for="tipo-imagem-${totalTemas}" style="margin-bottom: 0px">Imagem</label>

        <input type="radio" id="tipo-video-${totalTemas}" name="tipo-midia-${totalTemas}" value="youtube">
        <label for="tipo-video-${totalTemas}" style="margin-bottom: 0px">Vídeo</label>
    </div>

    <div class="input-imagem">
        <label>Imagem do Tema:</label>
        <input type="file" name="imagem-tema-${totalTemas}" accept="image/*">
    </div>

    <div class="input-youtube" style="display:none;">
        <label>Vídeo do Tema:</label>
        <input type="text" name="url-tema-${totalTemas}" placeholder="https://...">
    </div>

    <br>
    <label>Nome do Tema:</label>
    <input type="text" name="nome-tema-${totalTemas}" required>
    <br><br>

    <button type="button" class="btn-remover">Remover Tema</button>
`;


    // Lógica para alternar campos
    const radios = bloco.querySelectorAll(`input[name="tipo-midia-${totalTemas}"]`);
    const inputImagem = bloco.querySelector(".input-imagem");
    const inputYoutube = bloco.querySelector(".input-youtube");

    radios.forEach(radio => {
        radio.addEventListener("change", () => {
            if (radio.value === "imagem") {
                inputImagem.style.display = "block";
                inputYoutube.style.display = "none";
            } else {
                inputImagem.style.display = "none";
                inputYoutube.style.display = "block";
            }
        });
    });

    container.appendChild(bloco);

    bloco.querySelector(".btn-remover").addEventListener("click", () => {
        bloco.remove();
        totalTemas--;
    });
});

const fileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
};

const urlToBase64 = async (url) => {
    const response = await fetch(url);
    const blob = await response.blob();

    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
    });
};

const getYoutubeId = (url) => {
    const match = url.match(
        /(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([^&?/]+)/i
    );
    return match ? match[1] : null;
};

const getTwitterId = (url) => {
    const match = url.match(
        /(?:twitter\.com|x\.com)\/[^\/]+\/status\/(\d+)/i
    );
    return match ? match[1] : null;
};

const getInstagramUrl = (url) => {
    return /instagram\.com\/(p|reel|tv)\//i.test(url) ? url : null;
};


document.getElementById("btn-gerar-json").addEventListener("click", async function (e) {
    e.preventDefault();

    const tituloGeral = document.getElementById("titulo-tema").value.trim();
    const blocos = document.querySelectorAll("#temas-container fieldset");

    if (!tituloGeral) {
        alert("Preencha o título!");
        return;
    }

    if (blocos.length === 0) {
        alert("Adicione ao menos um tema!");
        return;
    }

    const temas = [];

    for (const bloco of blocos) {
        const nome = bloco.querySelector(`input[name^="nome-tema"]`).value.trim();
        const imagemInput = bloco.querySelector(`input[name^="imagem-tema"]`);
        const urlInput = bloco.querySelector(`input[name^="url-tema"]`).value.trim();

        if (!nome) {
            alert("Todos os temas precisam de nome!");
            return;
        }

        let midia = null;

        if (imagemInput.files.length > 0) {
            // Upload local → Base64
            midia = {
                tipo: "imagem",
                valor: await fileToBase64(imagemInput.files[0])
            };
        } else if (urlInput) {
            const youtubeId = getYoutubeId(urlInput);
            const twitterId = getTwitterId(urlInput);
            const instagramUrl = getInstagramUrl(urlInput);

            if (youtubeId) {
                midia = { tipo: "youtube", valor: youtubeId };

            } else if (twitterId) {
                midia = { tipo: "twitter", valor: twitterId };

            } else if (instagramUrl) {
                midia = { tipo: "instagram", valor: instagramUrl };

            } else {
                midia = { tipo: "link", valor: urlInput };
            }


        }

        temas.push({
            nome,
            midia
        });
    }


    const jsonFinal = {
        titulo: tituloGeral,
        temas: temas
    };

    const blob = new Blob(
        [JSON.stringify(jsonFinal, null, 4)],
        { type: "application/json" }
    );

    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");

    a.href = url;
    a.download = `${tituloGeral}.json`;
    a.click();

    URL.revokeObjectURL(url);


});
