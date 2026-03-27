document.addEventListener('DOMContentLoaded', function() {
    const fileInput = document.getElementById('fileInput');
    const fileNameLabel = document.getElementById('fileName');
    const convertBtn = document.getElementById('convertBtn');
    const statusMsg = document.getElementById('status');

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
        statusMsg.innerText = "⏳ Criando túnel de segurança...";

        try {
            // PASSO 1: Pegar o crachá de upload na nossa API
            const authRes = await fetch('/api/convert-office', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' }
            });

            const uploadAuth = await authRes.json();
            if (!authRes.ok) throw new Error(uploadAuth.error);

            // PASSO 2: Fazer o upload PESADO direto para a CloudConvert
            statusMsg.innerText = "🚀 Enviando arquivo pesado (Direto)...";
            
            const formData = new FormData();
            // Preenchemos os parâmetros exigidos pela CloudConvert
            Object.entries(uploadAuth.result.form.parameters).forEach(([key, value]) => {
                formData.append(key, value);
            });
            formData.append('file', file); // O arquivo vai por último

            const uploadRes = await fetch(uploadAuth.result.form.url, {
                method: 'POST',
                body: formData
            });

            if (uploadRes.ok) {
                statusMsg.innerHTML = `✅ <b>Upload concluído!</b><br>O arquivo está sendo convertido na nuvem.`;
                // Aqui você pode redirecionar ou mostrar o link do painel
                window.open("https://cloudconvert.com/dashboard/api/v2/jobs", "_blank");
            } else {
                throw new Error("O upload direto falhou.");
            }

        } catch (error) {
            statusMsg.innerText = "❌ Erro: " + error.message;
            convertBtn.disabled = false;
        }
    });
});