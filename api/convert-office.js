export default async function handler(req, res) {
    const API_KEY = process.env.CLOUDCONVERT_KEY; // Deve ter o "Bearer " na Vercel

    if (req.method !== 'POST') return res.status(405).json({ error: 'Método não permitido' });

    try {
        const response = await fetch('https://api.cloudconvert.com/v2/jobs', {
            method: 'POST',
            headers: {
                'Authorization': API_KEY,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                "tasks": {
                    "import-1": { "operation": "import/upload" },
                    "task-1": { 
                        "operation": "convert", 
                        "input": "import-1", 
                        "output_format": "pdf" 
                    },
                    "export-1": { 
                        "operation": "export/url", 
                        "input": "task-1"
                    }
                },
                "tag": "brasil-ia-office" // Ajuda a identificar o Job
            })
        });

        const data = await response.json();

        if (response.ok) {
            const uploadTask = data.data.tasks.find(t => t.name === 'import-1');
            
            // Retornamos o ID do Job exato que a CloudConvert acabou de criar
            res.status(200).json({
                jobId: data.data.id, 
                upload: uploadTask.result.form
            });
        } else {
            res.status(response.status).json({ error: data.message });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}