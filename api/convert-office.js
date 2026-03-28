export default async function handler(req, res) {
    const RENDER_URL = "https://brasil-ia-converter.onrender.com/forms/libreoffice/convert";
    if (req.method !== 'POST') return res.status(405).send("Apenas POST");

    try {
        const { fileBase64, filename } = req.body;
        const buffer = Buffer.from(fileBase64, 'base64');
        
        const formData = new FormData();
        // IMPORTANTE: O Gotenberg exige o nome 'files' (no plural)
        const fileBlob = new Blob([buffer]);
        formData.append('files', fileBlob, filename);

        const response = await fetch(RENDER_URL, {
            method: 'POST',
            body: formData
        });

        if (!response.ok) throw new Error("Erro no Render");

        const pdfBuffer = await response.arrayBuffer();
        res.status(200).json({ 
            pdfBase64: Buffer.from(pdfBuffer).toString('base64'),
            filename: filename.replace(/\.[^/.]+$/, "") + ".pdf" 
        });

    } catch (error) {
        res.status(500).json({ error: "Motor em aquecimento. Tente novamente." });
    }
}