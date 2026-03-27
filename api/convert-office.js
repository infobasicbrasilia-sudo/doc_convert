export default async function handler(req, res) {
    const RENDER_URL = "https://brasil-ia-converter.onrender.com/forms/libreoffice/convert";

    if (req.method !== 'POST') return res.status(405).json({ error: 'Método não permitido' });

    try {
        const { fileBase64, filename } = req.body;
        if (!fileBase64) throw new Error("Arquivo não recebido pela API.");

        const buffer = Buffer.from(fileBase64, 'base64');
        const formData = new FormData();
        const fileBlob = new Blob([buffer]);
        formData.append('files', fileBlob, filename);

        // Aumentamos o timeout para 60 segundos para o Render acordar
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 60000);

        const response = await fetch(RENDER_URL, {
            method: 'POST',
            body: formData,
            signal: controller.signal
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
            throw new Error(`O servidor Render respondeu com erro: ${response.status}`);
        }

        const pdfBuffer = await response.arrayBuffer();
        res.status(200).json({ 
            pdfBase64: Buffer.from(pdfBuffer).toString('base64'),
            filename: filename.replace(/\.[^/.]+$/, "") + ".pdf" 
        });

    } catch (error) {
        console.error("ERRO DE PERÍCIA:", error.message);
        res.status(500).json({ error: "Falha na comunicação: " + error.message });
    }
}