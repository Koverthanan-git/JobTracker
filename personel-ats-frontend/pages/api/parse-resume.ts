import type { NextApiRequest, NextApiResponse } from 'next'
import formidable from 'formidable'
import fs from 'fs'

export const config = { api: { bodyParser: false } }

// Simple keyword-based task suggestions
function suggestTasks(text: string): string[] {
    const lower = text.toLowerCase()
    const suggestions: string[] = []

    if (lower.includes('react') || lower.includes('javascript') || lower.includes('typescript'))
        suggestions.push('Update portfolio with React/JS projects')
    if (lower.includes('python') || lower.includes('django') || lower.includes('fastapi'))
        suggestions.push('Highlight Python backend experience in cover letter')
    if (lower.includes('aws') || lower.includes('cloud') || lower.includes('azure'))
        suggestions.push('Prepare cloud infrastructure talking points')
    if (lower.includes('leadership') || lower.includes('managed') || lower.includes('led'))
        suggestions.push('Prepare leadership/management examples for interview')
    if (lower.includes('agile') || lower.includes('scrum'))
        suggestions.push('Review Agile/Scrum methodology for interview')
    if (lower.includes('sql') || lower.includes('database') || lower.includes('postgresql'))
        suggestions.push('Practice SQL query questions')
    if (lower.includes('machine learning') || lower.includes('ai') || lower.includes('data science'))
        suggestions.push('Prepare ML/AI project portfolio')

    // Always add generic follow-up
    suggestions.push('Follow up in 5 days if no response')
    suggestions.push('Research company culture and recent news')

    return suggestions.slice(0, 4)
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

    const form = formidable({ maxFileSize: 5 * 1024 * 1024 }) // 5MB limit

    form.parse(req, async (err, _fields, files) => {
        if (err) return res.status(400).json({ error: 'File parse error' })

        const fileArray = files.file
        const file = Array.isArray(fileArray) ? fileArray[0] : fileArray
        if (!file) return res.status(400).json({ error: 'No file uploaded' })

        const ext = file.originalFilename?.split('.').pop()?.toLowerCase()
        let extractedText = ''

        try {
            if (ext === 'pdf') {
                // Dynamic import to avoid SSR issues
                const pdfParse = (await import('pdf-parse')).default
                const buffer = fs.readFileSync(file.filepath)
                const data = await pdfParse(buffer)
                extractedText = data.text
            } else if (ext === 'txt' || ext === 'csv') {
                extractedText = fs.readFileSync(file.filepath, 'utf-8')
            } else {
                // For .doc/.docx just read as text (basic extraction)
                extractedText = fs.readFileSync(file.filepath, 'utf-8')
            }

            const suggestions = suggestTasks(extractedText)
            const wordCount = extractedText.split(/\s+/).filter(Boolean).length

            return res.status(200).json({
                success: true,
                wordCount,
                suggestions,
                preview: extractedText.slice(0, 300).trim() + (extractedText.length > 300 ? '...' : ''),
            })
        } catch (parseErr) {
            return res.status(500).json({ error: 'Failed to parse file' })
        }
    })
}
