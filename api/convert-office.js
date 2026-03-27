export default async function handler(req, res) {
    const RENDER_URL = "https://brasil-ia-converter.onrender.com/forms/libreoffice/convert";

    if (req.method !== 'POST') return res.status(405).json({ error: 'Método não permitido' });

    try {
        const { fileBase64, filename } = req.body;

        // 1. Transforma o Base64 em um Buffer real do Node.js
        const buffer = Buffer.from(fileBase64, 'base64');

        // 2. Cria o formulário exatamente como o Gotenberg exige
        const formData = new FormData();
        // O segredo está aqui: o campo DEVE se chamar 'files'
        const fileBlob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' });
        formData.append('files', fileBlob, filename);

        // 3. Envia para o seu servidor Render
        const response = await fetch(RENDER_URL, {
            method: 'POST',
            body: formData
        });

        if (!response.ok) {
            const errorMsg = await response.text();
            throw new Error(`Erro no Render: ${errorMsg}`);
        }

        // 4. Recebe o PDF e manda de volta pro seu site
        const pdfBuffer = await response.arrayBuffer();
        const pdfBase64 = Buffer.from(pdfBuffer).toString('base64');

        res.status(200).json({ 
            pdfBase64: pdfBase64,
            filename: filename.replace(/\.[^/.]+$/, "") + ".pdf" 
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
}