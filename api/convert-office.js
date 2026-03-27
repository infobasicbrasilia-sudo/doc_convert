export default async function handler(req, res) {
    const API_KEY = process.env.CLOUDCONVERT_KEY; // Deve ter o "Bearer " na Vercel

    if (req.method !== 'POST') return res.status(405).json({ error: 'Método não permitido' });

    try {
        const { filename } = req.body;

        // 1. Pedimos uma "Autorização de Upload" para a CloudConvert
        const response = await fetch('https://api.cloudconvert.com/v2/import/upload', {
            method: 'POST',
            headers: {
                'Authorization': API_KEY,
                'Content-Type': 'application/json'
            }
        });

        const data = await response.json();

        if (response.ok) {
            // Retornamos os dados do "Formulário de Upload" para o navegador
            res.status(200).json(data.data);
        } else {
            res.status(response.status).json({ error: data.message });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}