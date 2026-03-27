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
        statusMsg.innerText = "⏳ Iniciando conversão segura...";
        downloadArea.style.display = 'none';

        try {
            // 1. Criar Ordem na API
            const authRes = await fetch('/api/convert-office', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' }
            });

            const jobData = await authRes.json();
            if (!authRes.ok) throw new Error(jobData.error);

            // 2. Upload Direto (Sem limite de tamanho da Vercel)
            statusMsg.innerText = "🚀 Enviando arquivo para a nuvem...";
            
            const formData = new FormData();
            Object.entries(jobData.upload.parameters).forEach(([key, value]) => {
                formData.append(key, value);
            });
            formData.append('file', file);

            const uploadRes = await fetch(jobData.upload.url, {
                method: 'POST',
                body: formData
            });

            if (!uploadRes.ok) throw new Error("Falha no envio.");

            // 3. Mostrar o link de download para o aluno
            statusMsg.innerHTML = `✅ <b>Upload concluído com sucesso!</b>`;
            downloadArea.style.display = 'block';
            
            // Link público para o aluno baixar o arquivo convertido
            fileLink.href = `https://cloudconvert.com/public/jobs/${jobData.jobId}`;
            fileLink.innerText = "CLIQUE AQUI PARA BAIXAR SEU PDF";
            fileLink.style.background = "#28a745"; // Cor de destaque verde

        } catch (error) {
            statusMsg.innerText = "❌ Erro: " + error.message;
            convertBtn.disabled = false;
        }
    });
});