
export const calculateReadingTime = (article) => {
  const content = article?.content ?? article ?? "";

  let text = "";

  if (typeof content === "string") {
    text = content;
  } else if (Array.isArray(content)) {
    text = content
      .map((block) => {
        if (typeof block === "string") {
          return block;
        }

        if (!block || typeof block !== "object") {
          return "";
        }

        const parts = [
          block.text,
          block.content,
          block.caption,
          block.title,
        ];

        if (Array.isArray(block.items)) {
          parts.push(block.items.join(" "));
        }

        if (Array.isArray(block.headers)) {
          parts.push(block.headers.join(" "));
        }

        if (Array.isArray(block.rows)) {
          parts.push(
            block.rows
              .map((row) =>
                Array.isArray(row)
                  ? row.join(" ")
                  : String(row)
              )
              .join(" ")
          );
        }

        return parts
          .filter(
            (value) =>
              typeof value === "string" ||
              typeof value === "number"
          )
          .join(" ");
      })
      .join(" ");
  }

  const words = text.trim()
    ? text.trim().split(/\s+/).length
    : 0;

  const WORDS_PER_MINUTE = 200;

  return Math.max(
    1,
    Math.ceil(words / WORDS_PER_MINUTE)
  );
};
