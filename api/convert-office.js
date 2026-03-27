export default async function handler(req, res) {
    // AQUI ESTÁ A SUA CHAVE COM O PREFIXO "Bearer"
    const API_KEY = "Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJhdWQiOiIxIiwianRpIjoiMDg2YTcwOTYxOTczNTk0ZWFjNzM0NTllNDQ1YzU2MTc5ZjdiNmQyYTBiMjJiMTRjOTQ1MTIyZTY5YWZhNTdhZDNiMWIwYjFlNzk4YWU4YWMiLCJpYXQiOjE3NzQ2MzEyMDcuNjQ5NjA4LCJuYmYiOjE3NzQ2MzEyMDcuNjQ5NjA5LCJleHAiOjQ5MzAzMDQ4MDcuNjQyMDk0LCJzdWIiOiI3NDg4NDAwOSIsInNjb3BlcyI6WyJ1c2VyLnJlYWQiLCJ1c2VyLndyaXRlIiwidGFzay5yZWFkIiwidGFzay53cml0ZSIsIndlYmhvb2sucmVhZCIsInByZXNldC5yZWFkIiwicHJlc2V0LndyaXRlIiwid2ViaG9vay53cml0ZSJdfQ.FSLBiAiY_lmv7CNjv9D3jcyyh-Rk5rDW7aceugucF8V4VvNwHujf8CkGrXWx2J9GRWVZTgGC9MrIsVzbpbDydh1kWS3nZc2FSzl1x-VKIW22Qqxlro_2RJSaZ5pft9XIXNU6qSlBCLakyYw32chBbAxlgtPbzZOrHGgEi2RPFaKsI4wqeT9vFKQWcsIz3RJR98RvA3WwvxUTPcAUOQdChuF6H1AaREnkEczHfJ4FiTOHQ7ItXIp8UsYgZwipEYbnfgz__4yuRQJ6p8xG5bDY27dQY-btbIg9J7e8BovGodhMoFYKK68kXyKGAucEjElAQpiPjcoGR3TndSeC_n79zHKxWwaRdXhpRVAx13PGm2cVDjSevaafd02LYMxGrHHFOkjrfk7PcThrpckhmgsEcudMSoGxgwZO0PMrC6sPbLGXEOfzvdUxvz-WqS0Rr0RQ5QZBjM15CD9GTaH34faxOl4EJZjFw11-iWYxF6DDOrDa2HuJtzZ3D9YUO3WEEpsF-7E2RwD4hVQ0cACh62dH35B40sCRpmG1h-nS2vUVtRSMjLpcNjh-TWtgnoquseEunQFhpWlDpCQwEfLkRIAxIpPopRcmMMdI8IRNQziGW9c2nIy0OecNoF5HjIrks4GuffY_6KMhC19GQD0boON3SVfXy6HjfxigNLG-8QhZZT4";

    try {
        if (req.method !== 'POST') {
            return res.status(405).json({ error: 'Apenas POST é permitido' });
        }

        const { file, filename } = req.body;

        const response = await fetch('https://api.cloudconvert.com/v2/jobs', {
            method: 'POST',
            headers: {
                'Authorization': API_KEY, // Já inclui o Bearer
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
        
        if (data.data && data.data.id) {
            res.status(200).json({ jobId: data.data.id });
        } else {
            res.status(500).json({ error: data.message || "Erro ao iniciar Job" });
        }
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
}