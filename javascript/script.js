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

        convertBtn.disabled = true;
        statusMsg.innerText = "⏳ Solicitando túnel de upload...";

        try {
            // PASSO 1: Pegar autorização da nossa API
            const authRes = await fetch('/api/convert-office', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ filename: file.name })
            });

            const uploadData = await authRes.json();
            if (!authRes.ok) throw new Error(uploadData.error);

            // PASSO 2: Upload DIRETO para a CloudConvert (Sem limite da Vercel)
            statusMsg.innerText = "🚀 Enviando arquivo pesado (Direto)...";
            
            const formData = new FormData();
            // Adicionamos todos os campos que a CloudConvert exige
            Object.entries(uploadData.result.form.parameters).forEach(([key, value]) => {
                formData.append(key, value);
            });
            formData.append('file', file);

            const uploadRes = await fetch(uploadData.result.form.url, {
                method: 'POST',
                body: formData
            });

            if (uploadRes.ok) {
                statusMsg.innerHTML = `✅ <b>Sucesso!</b> Arquivo enviado.<br>Processando conversão...`;
                downloadArea.style.display = 'block';
                // Opcional: Aqui você usaria o ID para monitorar, mas vamos deixar o link manual por enquanto
                fileLink.href = "https://cloudconvert.com/dashboard/api/v2/jobs"; 
                fileLink.innerText = "VER STATUS NO PAINEL";
            } else {
                throw new Error("Falha no upload direto.");
            }

        } catch (error) {
            statusMsg.innerText = "❌ Erro: " + error.message;
            convertBtn.disabled = false;
        }
    });
});