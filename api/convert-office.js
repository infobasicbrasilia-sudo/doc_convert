export default async function handler(req, res) {
    const RENDER_URL = "https://brasil-ia-converter.onrender.com/forms/libreoffice/convert";

    if (req.method !== 'POST') return res.status(405).json({ error: 'Método não permitido' });

    try {
        const { fileBase64, filename } = req.body;

        // Convertemos o Base64 de volta para um Blob para enviar ao Render
        const byteCharacters = atob(fileBase64);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
            byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        const fileBlob = new Blob([byteArray], { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' });

        // Criamos o formulário que o Gotenberg exige
        const formData = new FormData();
        formData.append('files', fileBlob, filename);

        // Chamada para o SEU servidor no Render
        const response = await fetch(RENDER_URL, {
            method: 'POST',
            body: formData
        });

        if (response.ok) {
            const pdfBuffer = await response.arrayBuffer();
            const pdfBase64 = Buffer.from(pdfBuffer).toString('base64');
            
            res.status(200).json({ 
                pdfBase64: pdfBase64,
                filename: filename.replace(/\.[^/.]+$/, "") + ".pdf" 
            });
        } else {
            const errorText = await response.text();
            res.status(response.status).json({ error: "Erro no servidor Render: " + errorText });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}