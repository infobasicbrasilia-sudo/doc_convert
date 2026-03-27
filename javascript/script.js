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
            // 1. Criar Ordem na API (Busca o crachá de upload e o JobId)
            const authRes = await fetch('/api/convert-office', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' }
            });

            const jobData = await authRes.json();
            if (!authRes.ok) throw new Error(jobData.error);

            // 2. Upload Direto (Bypassa o limite de 4.5MB da Vercel)
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

            // 3. Sucesso: Ativa o link de download na tela do aluno
            statusMsg.innerHTML = `✅ <b>Upload concluído com sucesso!</b><br>Sua conversão está sendo processada.`;
            downloadArea.style.display = 'block';
            
            // O link agora usa o /public/ para não exigir login do aluno
            fileLink.href = `https://cloudconvert.com/public/jobs/${jobData.jobId}`;
            fileLink.innerText = "CLIQUE AQUI PARA BAIXAR SEU PDF";
            fileLink.style.display = "inline-block";
            fileLink.style.padding = "10px 20px";
            fileLink.style.marginTop = "10px";
            fileLink.style.color = "white";
            fileLink.style.textDecoration = "none";
            fileLink.style.borderRadius = "5px";
            fileLink.style.background = "#28a745"; // Verde Sucesso

        } catch (error) {
            statusMsg.innerText = "❌ Erro: " + error.message;
            convertBtn.disabled = false;
        }
    });
});