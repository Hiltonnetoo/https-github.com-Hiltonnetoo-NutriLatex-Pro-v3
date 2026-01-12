
import { GoogleGenAI, Type } from "@google/genai";
import { PatientData, Meal, Recipe, Choice, ClinicalPlan } from "./types";

const SYSTEM_INSTRUCTION = `Você é um assistente especializado em Nutrição Clínica. 
Sua tarefa é organizar os dados do paciente em um Plano Alimentar estruturado em JSON.

REGRAS DE FORMATAÇÃO:
1. PESO: Deve ser retornado exatamente como fornecido, seguido da unidade " kg". Ex: se receber "70", retorne "70 kg".
2. ALTURA: Deve ser retornada exatamente como fornecida, seguida da unidade " m". Ex: se receber "1,75", retorne "1,75 m".
3. REFEIÇÕES: Normalize as descrições para serem claras e profissionais.
4. ALERTAS: Formate como uma lista de strings curtas e diretas.
5. RECEITAS: Garanta passos lógicos e títulos em letras maiúsculas.
6. ESCOLHAS: Mantenha a estrutura comparativa Sim/Não.

Retorne APENAS o JSON no formato especificado.`;

export async function generateClinicalPlan(
  patient: PatientData,
  meals: Meal[],
  recipes: Recipe[],
  choices: Choice[],
  alerts: string
): Promise<ClinicalPlan> {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const today = new Date().toLocaleDateString('pt-BR');

  // Adicionando peso e altura explicitamente no prompt para a IA não ignorar
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Gere um plano alimentar estruturado para o paciente.
    DADOS DO PACIENTE:
    - Nome: ${patient.name}
    - Peso atual: ${patient.weight}
    - Altura atual: ${patient.height}
    - Diagnóstico: ${patient.diagnosis}
    
    CONTEÚDO DO PLANO:
    - Refeições: ${JSON.stringify(meals)}
    - Receitas: ${JSON.stringify(recipes)}
    - Escolhas comparativas: ${JSON.stringify(choices)}
    - Orientações/Alertas: ${alerts}`,
    config: {
      systemInstruction: SYSTEM_INSTRUCTION,
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          patient: {
            type: Type.OBJECT,
            properties: {
              name: { type: Type.STRING },
              age: { type: Type.STRING },
              weight: { type: Type.STRING },
              height: { type: Type.STRING },
              goal: { type: Type.STRING },
              diagnosis: { type: Type.STRING },
            },
            required: ["name", "weight", "height"]
          },
          date: { type: Type.STRING },
          meals: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                time: { type: Type.STRING },
                name: { type: Type.STRING },
                description: { type: Type.STRING },
              }
            }
          },
          alerts: {
            type: Type.ARRAY,
            items: { type: Type.STRING }
          },
          recipes: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                title: { type: Type.STRING },
                ingredients: { type: Type.STRING },
                instructions: { type: Type.STRING },
              }
            }
          },
          choices: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                good: { type: Type.STRING },
                bad: { type: Type.STRING },
              }
            }
          }
        },
        required: ["patient", "meals", "alerts", "recipes", "choices"]
      }
    }
  });

  return JSON.parse(response.text);
}
