document.addEventListener('DOMContentLoaded', function() {
    const fileInput = document.getElementById('fileInput');
    const fileNameLabel = document.getElementById('fileName');
    const convertBtn = document.getElementById('convertBtn');
    const statusMsg = document.getElementById('status');
    const downloadArea = document.getElementById('downloadArea');

    console.log("Brasil IA: Sistema operacional.");

    if (!fileInput) {
        console.error("Erro crítico: Seletor de arquivos não encontrado.");
        return;
    }

    // Detecta quando o aluno escolhe o arquivo
    fileInput.addEventListener('change', function() {
        if (this.files && this.files[0]) {
            const file = this.files[0];
            fileNameLabel.innerHTML = `<b>Selecionado:</b> ${file.name}`;
            convertBtn.disabled = false;
            statusMsg.innerText = ""; // Limpa avisos anteriores
            console.log("Arquivo carregado com sucesso: " + file.name);
        }
    });

    // Ação do Botão Converter
    convertBtn.addEventListener('click', function() {
        convertBtn.disabled = true;
        statusMsg.innerText = "Enviando para Brasil IA... Aguarde.";
        
        // Aqui entrará a sua lógica de Fetch para a API
        console.log("Iniciando conversão...");
    });
});