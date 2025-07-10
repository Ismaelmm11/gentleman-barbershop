// src/services/chatbot.service.ts

const MAKE_WEBHOOK_URL = 'https://hook.eu2.make.com/cqwmsquj6bc8nuplvagbvfswezn7wozy'; // <-- ¡Tu URL del webhook!

/**
 * Envía una pregunta al chatbot y devuelve su respuesta.
 * @param question La pregunta del usuario.
 * @returns La respuesta del chatbot (esperamos un array con un objeto que tiene 'respuesta').
 */
export const sendQuestionToChatbot = async (question: string): Promise<{ respuesta: string }[]> => {
  try {
    const response = await fetch(MAKE_WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ pregunta: question }),
    });

    if (!response.ok) {
      throw new Error(`Error en la respuesta del chatbot: ${response.statusText}`);
    }

    const data = await response.json();
    // Asegurarse de que la estructura de la respuesta es la esperada
    if (Array.isArray(data) && data.length > 0 && typeof data[0].respuesta === 'string') {
      return data;
    } else {
      console.error("Formato de respuesta inesperado del chatbot:", data);
      throw new Error("Formato de respuesta inesperado del chatbot.");
    }

  } catch (error) {
    console.error('Error al conectar con el chatbot:', error);
    throw new Error('Error al conectar con el chatbot. Por favor, inténtelo de nuevo más tarde.');
  }
};