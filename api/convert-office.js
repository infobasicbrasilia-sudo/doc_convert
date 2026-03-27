export default async function handler(req, res) {
    const RENDER_URL = "https://brasil-ia-converter.onrender.com/forms/libreoffice/convert";

    if (req.method !== 'POST') return res.status(405).json({ error: 'Método não permitido' });

    try {
        const { fileBase64, filename } = req.body;
        const buffer = Buffer.from(fileBase64, 'base64');
        
        const formData = new FormData();
        const fileBlob = new Blob([buffer]);
        formData.append('files', fileBlob, filename);

        // REMOVEMOS o AbortController para deixar a Vercel esperar o máximo possível (10-15s no plano free)
        const response = await fetch(RENDER_URL, {
            method: 'POST',
            body: formData
        });

        if (!response.ok) {
            throw new Error(`Render fora do ar (Status: ${response.status})`);
        }

        const pdfBuffer = await response.arrayBuffer();
        res.status(200).json({ 
            pdfBase64: Buffer.from(pdfBuffer).toString('base64'),
            filename: filename.replace(/\.[^/.]+$/, "") + ".pdf" 
        });

    } catch (error) {
        console.error("ERRO DE PERÍCIA:", error.message);
        res.status(500).json({ error: "O motor está aquecendo. Tente novamente em 30 segundos." });
    }
}