export default async function handler(req, res) {
    const API_KEY = process.env.CLOUDCONVERT_KEY;

    if (req.method !== 'POST') return res.status(405).json({ error: 'Método não permitido' });

    try {
        const { file, filename } = req.body;
        
        const response = await fetch('https://api.cloudconvert.com/v2/jobs', {
            method: 'POST',
            headers: {
                'Authorization': API_KEY, // Deve ser "Bearer eyJ..." no painel da Vercel
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                "tasks": {
                    "import-1": { "operation": "import/base64", "file": file, "filename": filename },
                    "task-1": { "operation": "convert", "input": "import-1", "output_format": "pdf" },
                    "export-1": { "operation": "export/url", "input": "task-1" }
                }
            })
        });

        const data = await response.json();
        
        if (response.ok) {
            res.status(200).json({ jobId: data.data.id });
        } else {
            res.status(response.status).json({ error: data.message });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}