document.addEventListener('DOMContentLoaded', function() {
    // 1. Seleção de elementos do DOM
    const fileInput = document.getElementById('fileInput');
    const fileNameLabel = document.getElementById('fileName');
    const convertBtn = document.getElementById('convertBtn');
    const statusMsg = document.getElementById('status');
    const downloadArea = document.getElementById('downloadArea');
    const fileLink = document.getElementById('fileLink');

    console.log("Brasil IA: Motor de interface carregado.");

    // 2. Monitorar a seleção do arquivo
    fileInput.addEventListener('change', function() {
        if (this.files && this.files[0]) {
            const file = this.files[0];
            fileNameLabel.innerHTML = `<b>Selecionado:</b> ${file.name}`;
            convertBtn.disabled = false;
            statusMsg.innerText = "";
            downloadArea.style.display = 'none';
        }
    });

    // 3. Ação do Botão Converter
    convertBtn.addEventListener('click', function() {
        const file = fileInput.files[0];
        if (!file) return;

        convertBtn.disabled = true;
        statusMsg.innerText = "⏳ Preparando arquivo... Aguarde.";

        const reader = new FileReader();
        
        // Converte para Base64
        reader.readAsDataURL(file);

        reader.onload = async function() {
            try {
                // Remove o prefixo do Base64 para a API
                const base64File = reader.result.split(',')[1];
                
                statusMsg.innerText = "🚀 Enviando para o servidor Brasil IA...";

                // Envio para a API na Vercel
                const response = await fetch('/api/convert-office', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        file: base64File,
                        filename: file.name
                    })
                });

                if (!response.ok) {
                    const errorText = await response.text();
                    console.error("Erro no Servidor:", errorText);
                    throw new Error(`Erro ${response.status}: Falha na comunicação.`);
                }

                const result = await response.json();

                if (result.jobId) {
                    statusMsg.innerHTML = `✅ <b>Sucesso!</b> ID: ${result.jobId}`;
                    downloadArea.style.display = 'block';
                    // Link para acompanhar o progresso real no CloudConvert
                    fileLink.href = `https://cloudconvert.com/public/jobs/${result.jobId}`; 
                } else {
                    throw new Error("A API não retornou um ID de trabalho.");
                }

            } catch (error) {
                statusMsg.innerText = "❌ " + error.message;
                console.error("Erro no processo:", error);
                convertBtn.disabled = false;
            }
        };

        reader.onerror = () => {
            statusMsg.innerText = "❌ Erro ao ler o arquivo no navegador.";
            convertBtn.disabled = false;
        };
    });
});