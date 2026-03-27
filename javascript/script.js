document.addEventListener('DOMContentLoaded', function() {
    const fileInput = document.getElementById('fileInput');
    const convertBtn = document.getElementById('convertBtn');
    const statusMsg = document.getElementById('status');
    const downloadArea = document.getElementById('downloadArea');
    const fileLink = document.getElementById('fileLink');

    convertBtn.addEventListener('click', async function() {
        const file = fileInput.files[0];
        if (!file) return;

        convertBtn.disabled = true;
        statusMsg.innerText = "⏳ Motor Brasil IA aquecendo (Render)...";

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
                    
                    // Criar o download automático
                    fileLink.href = `data:application/pdf;base64,${result.pdfBase64}`;
                    fileLink.download = result.filename;
                    fileLink.innerText = "BAIXAR PDF AGORA";
                } else {
                    throw new Error(result.error);
                }
            } catch (error) {
                statusMsg.innerText = "❌ Erro: " + error.message;
                convertBtn.disabled = false;
            }
        };
    });
});