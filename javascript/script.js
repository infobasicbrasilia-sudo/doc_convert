// Este log TEM que aparecer no F12. Se não aparecer, o caminho do arquivo no HTML está errado.
console.log("🚀 Motor Brasil IA: Sistema Iniciado");

document.addEventListener('DOMContentLoaded', function() {
    const fileInput = document.getElementById('fileInput');
    const fileNameLabel = document.getElementById('fileName');
    const convertBtn = document.getElementById('convertBtn');
    const statusMsg = document.getElementById('status');
    const downloadArea = document.getElementById('downloadArea');
    const fileLink = document.getElementById('fileLink');

    // 1. MONITOR DE SELEÇÃO DE ARQUIVO
    fileInput.addEventListener('change', function() {
        if (this.files && this.files[0]) {
            const arquivo = this.files[0];
            fileNameLabel.innerHTML = `<b>Arquivo:</b> ${arquivo.name}`;
            convertBtn.disabled = false;
            statusMsg.innerText = "✅ Arquivo carregado. Clique em GERAR PDF.";
            console.log("📁 Arquivo pronto:", arquivo.name);
        }
    });

    // 2. AÇÃO DO BOTÃO CONVERTER
    convertBtn.addEventListener('click', async function() {
        const file = fileInput.files[0];
        if (!file) {
            alert("Por favor, selecione um arquivo primeiro!");
            return;
        }

        console.log("🖱️ Botão clicado! Iniciando conversão...");
        
        convertBtn.disabled = true;
        statusMsg.innerText = "⏳ Convertendo no Servidor Brasil IA... (Aguarde)";
        downloadArea.style.display = 'none';

        const reader = new FileReader();
        
        // Transformar arquivo em Base64
        reader.readAsDataURL(file);
        
        reader.onload = async function() {
            const base64Data = reader.result.split(',')[1];

            try {
                const response = await fetch('/api/convert-office', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        filename: file.name,
                        fileBase64: base64Data
                    })
                });

                const result = await response.json();

                if (response.ok && result.pdfBase64) {
                    console.log("✅ Sucesso! PDF recebido.");
                    statusMsg.innerText = "🎉 Conversão concluída com sucesso!";
                    downloadArea.style.display = 'block';
                    
                    // Prepara o link de download
                    fileLink.href = `data:application/pdf;base64,${result.pdfBase64}`;
                    fileLink.download = result.filename || "documento_convertido.pdf";
                } else {
                    throw new Error(result.error || "O servidor demorou muito para responder.");
                }
            } catch (error) {
                console.error("❌ Erro na conversão:", error.message);
                statusMsg.innerText = "❌ Erro: " + error.message + " (Tente novamente)";
                convertBtn.disabled = false;
            }
        };

        reader.onerror = function() {
            statusMsg.innerText = "❌ Erro ao ler o arquivo no navegador.";
            convertBtn.disabled = false;
        };
    });
});