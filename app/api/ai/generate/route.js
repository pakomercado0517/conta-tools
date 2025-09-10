import { NextResponse } from 'next/server';
import axios from 'axios';

export async function POST(request) {
  try {
    const { prompt } = await request.json();

    // Validar que el prompt existe
    if (!prompt || prompt.trim() === '') {
      return NextResponse.json(
        { error: 'El prompt es requerido' },
        { status: 400 }
      );
    }

    // Validar que la API key existe
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: 'API key de OpenAI no configurada' },
        { status: 500 }
      );
    }

    // Hacer la petición a OpenAI
    const response = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: 'Eres un asistente especializado en crear conceptos profesionales y descripciones para cotizaciones y contratos. Responde de manera concisa, profesional y en español.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 150,
        temperature: 0.7,
      },
      {
        headers: {
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );

    const generatedText = response.data.choices[0].message.content.trim();

    return NextResponse.json({
      success: true,
      data: generatedText
    });

  } catch (error) {
    console.error('Error al generar contenido con IA:', error);

    // Manejar errores específicos de OpenAI
    if (error.response?.status === 401) {
      return NextResponse.json(
        { error: 'API key de OpenAI inválida' },
        { status: 401 }
      );
    }

    if (error.response?.status === 429) {
      return NextResponse.json(
        { error: 'Límite de rate excedido. Inténtalo más tarde.' },
        { status: 429 }
      );
    }

    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
