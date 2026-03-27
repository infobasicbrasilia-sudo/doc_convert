document.addEventListener('DOMContentLoaded', function() {
    const fileInput = document.getElementById('fileInput');
    const fileNameLabel = document.getElementById('fileName');
    const convertBtn = document.getElementById('convertBtn');
    const statusMsg = document.getElementById('status');
    const downloadArea = document.getElementById('downloadArea');
    const fileLink = document.getElementById('fileLink');

    console.log("Brasil IA: Motor carregado com sucesso.");

    fileInput.addEventListener('change', function() {
        if (this.files && this.files[0]) {
            const file = this.files[0];
            fileNameLabel.innerHTML = `<b>Selecionado:</b> ${file.name}`;
            convertBtn.disabled = false;
            statusMsg.innerText = "";
            downloadArea.style.display = 'none';
        }
    });

    convertBtn.addEventListener('click', function() {
        const file = fileInput.files[0];
        if (!file) return;

        convertBtn.disabled = true;
        statusMsg.innerText = "⏳ Preparando arquivo... Aguarde.";

        const reader = new FileReader();
        reader.readAsDataURL(file);

        reader.onload = async function() {
            try {
                // Limpeza do Base64 para a Vercel
                const base64File = reader.result.split(',')[1];
                
                statusMsg.innerText = "🚀 Enviando para o servidor Brasil IA...";

                const response = await fetch('/api/convert-office', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        file: base64File,
                        filename: file.name
                    })
                });

                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.error || `Erro ${response.status}`);
                }

                const result = await response.json();

                if (result.jobId) {
                    statusMsg.innerHTML = `✅ <b>Sucesso!</b> Processando...`;
                    downloadArea.style.display = 'block';
                    // Link temporário para visualização do Job
                    fileLink.href = `https://cloudconvert.com/public/jobs/${result.jobId}`; 
                }

            } catch (error) {
                statusMsg.innerText = "❌ " + error.message;
                convertBtn.disabled = false;
            }
        };
    });
});