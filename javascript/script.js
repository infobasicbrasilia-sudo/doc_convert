document.addEventListener('DOMContentLoaded', function() {
    // 1. APRESENTAÇÃO DAS PEÇAS (Aqui resolvemos o erro 'not defined')
    const fileInput = document.getElementById('fileInput');
    const fileNameLabel = document.getElementById('fileName');
    const convertBtn = document.getElementById('convertBtn');
    const statusMsg = document.getElementById('status'); // AQUI É O SEGREDO!
    const downloadArea = document.getElementById('downloadArea');
    const fileLink = document.getElementById('fileLink');

    // Verifica se os elementos existem antes de rodar (Segurança)
    if (!statusMsg || !fileInput || !convertBtn) {
        console.error("Erro: Verifique se os IDs no HTML (status, fileInput, convertBtn) estão corretos.");
        return;
    }

    // 2. MONITOR DE SELEÇÃO
    fileInput.addEventListener('change', function() {
        if (this.files[0]) {
            fileNameLabel.innerHTML = `<b>Selecionado:</b> ${this.files[0].name}`;
            convertBtn.disabled = false;
        }
    });

    // 3. AÇÃO DE CONVERSÃO
    convertBtn.addEventListener('click', async function() {
        const file = fileInput.files[0];
        if (!file) return;

        // Agora o statusMsg vai funcionar porque foi definido lá no topo!
        statusMsg.innerText = "🚀 Enviando para o motor Brasil IA...";
        convertBtn.disabled = true;
        downloadArea.style.display = 'none';

        const reader = new FileReader();
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

                if (response.ok) {
                    statusMsg.innerHTML = "✅ <b>Conversão Concluída!</b>";
                    downloadArea.style.display = 'block';
                    fileLink.href = `data:application/pdf;base64,${result.pdfBase64}`;
                    fileLink.download = result.filename;
                    fileLink.innerText = "BAIXAR PDF AGORA";
                } else {
                    throw new Error(result.error || "Erro na API");
                }
            } catch (error) {
                statusMsg.innerText = "❌ Erro: " + error.message;
                convertBtn.disabled = false;
            }
        };
    });
});