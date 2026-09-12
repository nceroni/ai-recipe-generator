export function request(ctx) {
  const { ingredients = [] } = ctx.args;

  // Construct the prompt with the provided ingredients
  const prompt = `Suggest a recipe idea using these ingredients: ${ingredients.join(", ")}.`;

  // Return the request configuration
  return {
    resourcePath: `/model/us.anthropic.claude-sonnet-4-6/invoke`,
    method: "POST",
    params: {
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        anthropic_version: "bedrock-2023-05-31",
        max_tokens: 1000,
        messages: [
          {
            role: "user",
            content: [
              {
                type: "text",
                text: prompt,
              },
            ],
          },
        ],
      }),
    },
  };
}

export function response(ctx) {
  // Si Bedrock no devolvio 200, mostrar su mensaje en vez de intentar parsear
  if (ctx.result.statusCode !== 200) {
    return {
      body: "[Bedrock " + ctx.result.statusCode + "] " + ctx.result.body,
      error: ctx.result.body,
    };
  }

  const parsedBody = JSON.parse(ctx.result.body);
  const content = parsedBody.content;

  // Si no viene el campo esperado, mostrar la respuesta cruda
  if (!content) {
    return {
      body: "[respuesta inesperada] " + ctx.result.body,
      error: ctx.result.body,
    };
  }

  // Buscar el bloque de texto (for-of y break si estan soportados en APPSYNC_JS)
  let text = "";
  for (const block of content) {
    if (block.type === "text") {
      text = block.text;
      break;
    }
  }

  return {
    body: text,
  };
}
