console.log("🚀 Motor Brasil IA: Sistema via Proxy Vercel Ativado");

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
        }
    });

    convertBtn.addEventListener('click', async function() {
        const file = fileInput.files[0];
        if (!file) return;

        console.log("🖱️ Botão clicado! Enviando para API Vercel...");
        statusMsg.innerHTML = "⏳ <b>Processando...</b> (O motor pode levar 20s para acordar)";
        
        convertBtn.disabled = true;
        downloadArea.style.display = 'none';

        const reader = new FileReader();
        reader.readAsDataURL(file);
        
        reader.onload = async function() {
            const base64Data = reader.result.split(',')[1];

            try {
                console.log("📡 Chamando a ponte segura: /api/convert-office");
                
                const response = await fetch('/api/convert-office', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        filename: file.name,
                        fileBase64: base64Data
                    })
                });

                const result = await response.json();

                if (response.ok) {
                    console.log("✅ Sucesso! PDF gerado.");
                    statusMsg.innerHTML = "✅ <b>Documento Convertido!</b>";
                    downloadArea.style.display = 'block';
                    
                    fileLink.href = `data:application/pdf;base64,${result.pdfBase64}`;
                    fileLink.download = result.filename;
                } else {
                    throw new Error(result.error || "Erro na conversão");
                }

            } catch (error) {
                console.error("❌ ERRO:", error.message);
                statusMsg.innerHTML = "❌ <b>O motor ainda está ligando...</b><br>Aguarde 10 segundos e tente novamente.";
                convertBtn.disabled = false;
            }
        };
    });
});