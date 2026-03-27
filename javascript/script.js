document.addEventListener('DOMContentLoaded', function() {
    // Seleção de elementos do DOM
    const fileInput = document.getElementById('fileInput');
    const fileNameLabel = document.getElementById('fileName');
    const convertBtn = document.getElementById('convertBtn');
    const statusMsg = document.getElementById('status');
    const downloadArea = document.getElementById('downloadArea');
    const fileLink = document.getElementById('fileLink');

    console.log("Brasil IA: Motor carregado com sucesso.");

    // 1. Monitorar a seleção do arquivo
    fileInput.addEventListener('change', function() {
        if (this.files && this.files[0]) {
            const file = this.files[0];
            fileNameLabel.innerHTML = `<b>Selecionado:</b> ${file.name}`;
            convertBtn.disabled = false;
            statusMsg.innerText = ""; // Limpa mensagens de erro
            downloadArea.style.display = 'none'; // Esconde downloads anteriores
            console.log("Arquivo pronto para envio: " + file.name);
        }
    });

    // 2. Ação do Botão Converter
    convertBtn.addEventListener('click', function() {
        const file = fileInput.files[0];
        if (!file) return;

        convertBtn.disabled = true;
        statusMsg.innerText = "⏳ Preparando arquivo... Aguarde.";

        const reader = new FileReader();
        
        // Converte o arquivo para Base64 (necessário para transporte via JSON)
        reader.readAsDataURL(file);

        reader.onload = async function() {
            try {
                // Remove o prefixo do Base64 (ex: data:application/pdf;base64,)
                const base64File = reader.result.split(',')[1];
                
                statusMsg.innerText = "🚀 Enviando para o servidor Brasil IA...";
                console.log("Disparando fetch para /api/convert-office");

                // Envio para a API na Vercel
                const response = await fetch('/api/convert-office', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        file: base64File,
                        filename: file.name
                    })
                });

                // VERIFICAÇÃO DE RESPOSTA (Blindagem contra erro 500)
                if (!response.ok) {
                    const errorText = await response.text();
                    console.error("ERRO BRUTO DO SERVIDOR:", errorText);
                    throw new Error(`Erro ${response.status}: Falha no processamento do servidor.`);
                }

                // Se a resposta for OK, lê o JSON
                const result = await response.json();

                if (result.jobId) {
                    statusMsg.innerHTML = `✅ <b>Sucesso!</b> Job ID: ${result.jobId}<br>Processando no CloudConvert...`;
                    console.log("Job iniciado com sucesso:", result.jobId);
                    
                    // Exibe a área de download com o link do Job para acompanhamento
                    downloadArea.style.display = 'block';
                    fileLink.href = `https://cloudconvert.com/public/jobs/${result.jobId}`; 
                } else {
                    throw new Error(result.error || "A API não retornou um ID de trabalho.");
                }

            } catch (error) {
                // Captura erros de rede, de servidor (500) ou de lógica
                statusMsg.innerText = "❌ " + error.message;
                console.error("Erro no processo:", error);
                convertBtn.disabled = false;
            }
        };

        reader.onerror = function() {
            statusMsg.innerText = "❌ Erro ao ler o arquivo no navegador.";
            convertBtn.disabled = false;
        };
    });
});