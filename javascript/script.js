console.log("🚀 Motor Brasil IA: Sistema Iniciado");

document.addEventListener('DOMContentLoaded', function() {
    const fileInput = document.getElementById('fileInput');
    const fileNameLabel = document.getElementById('fileName');
    const convertBtn = document.getElementById('convertBtn');
    const statusMsg = document.getElementById('status');
    const downloadArea = document.getElementById('downloadArea');
    const fileLink = document.getElementById('fileLink');

    fileInput.addEventListener('change', function() {
        if (this.files[0]) {
            fileNameLabel.innerHTML = `<b>Selecionado:</b> ${this.files[0].name}`;
            convertBtn.disabled = false;
            console.log("📁 Arquivo pronto: " + this.files[0].name);
        }
    });

    convertBtn.addEventListener('click', async function() {
        console.log("🖱️ Botão clicado! Iniciando conversão...");
        
        const file = fileInput.files[0];
        if (!file) return;

        statusMsg.innerText = "⏳ Preparando envio...";
        convertBtn.disabled = true;
        downloadArea.style.display = 'none';

        try {
            // MÉTODO MODERNO: Converter para Base64 sem travar o navegador
            const base64Data = await new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.readAsDataURL(file);
                reader.onload = () => resolve(reader.result.split(',')[1]);
                reader.onerror = error => reject(error);
            });

            console.log("📡 Enviando para a API Brasil IA...");
            statusMsg.innerText = "🚀 Enviando para o servidor (Pode levar 30s)...";

            const response = await fetch('/api/convert-office', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    filename: file.name,
                    fileBase64: base64Data
                })
            });

            console.log("📩 Resposta da API recebida. Status:", response.status);
            const result = await response.json();

            if (response.ok) {
                console.log("✅ Sucesso! PDF gerado.");
                statusMsg.innerHTML = "✅ <b>Conversão Concluída!</b>";
                downloadArea.style.display = 'block';
                fileLink.href = `data:application/pdf;base64,${result.pdfBase64}`;
                fileLink.download = result.filename;
            } else {
                throw new Error(result.error || "Erro desconhecido na API");
            }

        } catch (error) {
            console.error("❌ ERRO CRÍTICO:", error.message);
            statusMsg.innerText = "❌ Erro: " + error.message;
            convertBtn.disabled = false;
        }
    });
});