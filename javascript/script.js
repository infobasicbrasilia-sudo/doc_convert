document.addEventListener('DOMContentLoaded', function() {
    // Seleção de elementos (Todos os IDs devem existir no seu HTML)
    const fileInput = document.getElementById('fileInput');
    const fileNameLabel = document.getElementById('fileName');
    const convertBtn = document.getElementById('convertBtn');
    const statusMsg = document.getElementById('status');
    const downloadArea = document.getElementById('downloadArea');
    const fileLink = document.getElementById('fileLink'); // Garantindo que esta variável exista

    console.log("Brasil IA: Motor carregado com sucesso.");

    // Detectar seleção de arquivo
    fileInput.addEventListener('change', function() {
        if (this.files && this.files[0]) {
            const file = this.files[0];
            fileNameLabel.innerHTML = `<b>Selecionado:</b> ${file.name}`;
            convertBtn.disabled = false;
            statusMsg.innerText = ""; // Limpa erros anteriores
            downloadArea.style.display = 'none'; // Esconde download antigo
            console.log("Arquivo pronto para envio: " + file.name);
        }
    });

    // Ação do Botão
    convertBtn.addEventListener('click', function() {
        const file = fileInput.files[0];
        if (!file) return;

        convertBtn.disabled = true;
        statusMsg.innerText = "⏳ Lendo arquivo... Aguarde.";

        const reader = new FileReader();
        
        // Inicia a leitura do arquivo
        reader.readAsDataURL(file);

        reader.onload = async function() {
            try {
                // Remove o cabeçalho "data:application/...;base64," para enviar só o código puro
                const base64File = reader.result.split(',')[1];
                
                statusMsg.innerText = "🚀 Enviando para o servidor Brasil IA...";
                console.log("Disparando fetch para /api/convert-office");

                const response = await fetch('/api/convert-office', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        file: base64File,
                        filename: file.name
                    })
                });

                const result = await response.json();

                if (response.ok && result.jobId) {
                    statusMsg.innerHTML = "✅ <b>Sucesso!</b> Conversão iniciada.";
                    console.log("Job ID recebido:", result.jobId);
                    
                    // Mostra a área de download
                    downloadArea.style.display = 'block';
                    // Link provisório para acompanhar o status no CloudConvert
                    fileLink.href = `https://cloudconvert.com/public/jobs/${result.jobId}`;
                } else {
                    throw new Error(result.error || "Falha na API");
                }

            } catch (error) {
                statusMsg.innerText = "❌ Erro: " + error.message;
                console.error("Erro no processo:", error);
                convertBtn.disabled = false;
            }
        };

        reader.onerror = function() {
            statusMsg.innerText = "❌ Erro ao ler o arquivo no seu computador.";
            convertBtn.disabled = false;
        };
    });
});