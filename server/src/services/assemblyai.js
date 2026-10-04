import fs from 'node:fs';
import { AssemblyAI } from 'assemblyai';

/**
 * Transcribe un archivo de audio usando AssemblyAI.
 */
export async function transcribeWithAssemblyAI(audioPath, options = {}) {
  const { targetLang = 'original', onStage } = options;

  const client = new AssemblyAI({
    apiKey: process.env.ASSEMBLYAI_API_KEY,
  });

  if (onStage) onStage('Subiendo audio a AssemblyAI…');

  // ✅ Leer el archivo como Buffer en lugar de pasar la ruta
  const audioBuffer = await fs.promises.readFile(audioPath);

  // Parámetros de transcripción
  const params = {
    audio: audioBuffer,
    language_detection: true,
    speaker_labels: true, // ✅ Añadir esto para que funcione match_original_utterance
  };

  // ✅ La traducción se hace con speech_understanding, no con translate_to
  if (targetLang && targetLang !== 'original') {
    params.speech_understanding = {
      request: {
        translation: {
          target_languages: [targetLang],
          match_original_utterance: true, // Para que la traducción vaya alineada con las utterances
        },
      },
    };
  }

  if (onStage) onStage('Transcribiendo en la nube…');

  const transcript = await client.transcripts.transcribe(params);

  if (transcript.status === 'error') {
    throw new Error(`AssemblyAI falló: ${transcript.error}`);
  }

  if (onStage) onStage('Procesando resultado…');

  const detectedLanguage = transcript.language_code || 'unknown';

  // ✅ Si hubo traducción, usamos las utterances traducidas
  let segments;
  if (targetLang && targetLang !== 'original' && transcript.utterances) {
    segments = transcript.utterances.map((utt) => ({
      start: utt.start / 1000,
      end: utt.end / 1000,
      text: utt.translated_texts?.[targetLang] || utt.text,
    }));
  } else {
    // Sin traducción: construir segmentos desde las words
    segments = buildSegmentsFromWords(transcript.words || []);
  }

  return {
    language: detectedLanguage,
    segments,
  };
}

/**
 * Agrupa words en segmentos tipo subtítulo.
 */
function buildSegmentsFromWords(words) {
  if (!words.length) return [];

  const segments = [];
  let current = {
    start: words[0].start / 1000,
    end: words[0].end / 1000,
    text: words[0].text,
  };

  for (let i = 1; i < words.length; i++) {
    const word = words[i];
    const wordStart = word.start / 1000;
    const wordEnd = word.end / 1000;
    const gap = wordStart - current.end;
    const duration = current.end - current.start;

    if (gap > 1.5 || duration > 6) {
      segments.push(current);
      current = {
        start: wordStart,
        end: wordEnd,
        text: word.text,
      };
    } else {
      current.end = wordEnd;
      current.text += ` ${word.text}`;
    }
  }

  segments.push(current);
  return segments;
}