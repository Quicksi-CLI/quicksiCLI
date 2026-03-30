import https from "https";

export async function getAuthorById(authorId: string): Promise<any> {
  const url = "https://raw.githubusercontent.com/Quicksi-CLI/quicksi-templates/main/authors.json";

  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let data = "";

      res.on("data", (chunk) => (data += chunk));

      res.on("end", () => {
        try {
          const json = JSON.parse(data);

          const author = json.authors?.[authorId];

          resolve(author || null);
        } catch (err) {
          reject(err);
        }
      });
    }).on("error", reject);
  });
}
