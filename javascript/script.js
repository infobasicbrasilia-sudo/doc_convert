document.addEventListener('DOMContentLoaded', function() {
    const fileInput = document.getElementById('fileInput');
    const dropZone = document.getElementById('dropZone');
    const fileNameLabel = document.getElementById('fileName');
    const convertBtn = document.getElementById('convertBtn');

    console.log("Brasil IA: Script carregado com sucesso!");

    if (!fileInput || !dropZone) {
        console.error("Erro: Elementos do HTML não encontrados!");
        return;
    }

    // Clique na zona de drop
    dropZone.addEventListener('click', function(e) {
        e.preventDefault();
        e.stopPropagation(); // Evita que o clique se perca
        console.log("Abrindo seletor de arquivos...");
        fileInput.click();
    });

    // Quando o arquivo é selecionado
    fileInput.addEventListener('change', function() {
        if (this.files && this.files[0]) {
            const file = this.files[0];
            fileNameLabel.innerHTML = `<b>Selecionado:</b> ${file.name}`;
            convertBtn.disabled = false;
            console.log("Arquivo carregado: " + file.name);
        }
    });
});