import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import transcribeRouter from './routes/transcribe.js';
import burnRouter from './routes/burn.js';

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json({ limit: '10mb' }));

app.get('/api/health', (_req, res) => {
  res.json({
    ok: true,
    service: 'AssemblyAI Cloud',
    hasApiKey: !!process.env.ASSEMBLYAI_API_KEY,
  });
});

app.use('/api/transcribe', transcribeRouter);
app.use('/api/burn', burnRouter);

app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ error: err.message || 'Error del servidor' });
});

app.listen(PORT, () => {
  console.log(`✅ Subtitle Forge Cloud backend en http://localhost:${PORT}`);
  console.log(`   AssemblyAI: ${process.env.ASSEMBLYAI_API_KEY ? 'configurado ✅' : 'FALTA API KEY ⚠️'}`);
  console.log(`   Endpoints:`);
  console.log(`     - POST /api/transcribe`);
  console.log(`     - POST /api/burn`);
});